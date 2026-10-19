import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Star,
  MessageCircle,
  Edit,
  Plus,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Button from "../button/Button";
import SortByButton, { useSavedSort } from "../SortByButton/SortByButton";
import SlideInMenu from "../SlideInMenu/SlideInMenu";
import AddFeedbackPanel from "../../pannel_pages/AddFeedbackPanel/AddFeedbackPanel";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import {
  getFeedback,
  addFeedback,
  replyToFeedback,
  updateFeedbackReply,
  deleteFeedback,
  updateFeedback,
  calculateFeedbackStats,
} from "../../backend/services/crmService";
import "./FeedbackTab.css";

const FeedbackTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useSavedSort("ft.sort.feedback");
  const [showSort, setShowSort] = useState(false);
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingReply, setEditingReply] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);

  const { user } = useNewAuth();

  // Fetch feedback data from Firebase
  useEffect(() => {
    const loadFeedback = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const effectiveEmail = getEffectiveUserEmail(user);
        const feedback = await getFeedback(effectiveEmail);
        setFeedbackData(feedback);
      } catch (error) {
        console.error("Error loading feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [user?.email]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".feedback_actions_dropdown")) {
        setShowDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Handle adding new feedback
  const handleAddFeedback = async () => {
    try {
      // Add a small delay to ensure Firebase write is committed
      await new Promise((resolve) => setTimeout(resolve, 500));

      const effectiveEmail = getEffectiveUserEmail(user);
      const updatedFeedback = await getFeedback(effectiveEmail);
      setFeedbackData(updatedFeedback);
    } catch (error) {
      console.error("Error reloading feedback:", error);
    }
  };

  // Handle deleting feedback
  const handleDeleteFeedback = async (feedbackId, clientName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the feedback from "${clientName}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteFeedback(feedbackId);
      const effectiveEmail = getEffectiveUserEmail(user);
      const updatedFeedback = await getFeedback(effectiveEmail);
      setFeedbackData(updatedFeedback);
      setShowDropdown(null);
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Failed to delete feedback. Please try again.");
    }
  };

  // Handle editing feedback
  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setShowFeedbackForm(true);
    setShowDropdown(null);
  };

  // Handle replying to feedback
  const handleReply = async (feedbackId) => {
    if (!replyText.trim()) return;

    try {
      await replyToFeedback(feedbackId, replyText);
      // Reload feedback data
      const effectiveEmail = getEffectiveUserEmail(user);
      const updatedFeedback = await getFeedback(effectiveEmail);
      setFeedbackData(updatedFeedback);
      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      console.error("Error replying to feedback:", error);
      alert("Failed to send reply. Please try again.");
    }
  };

  // Handle editing reply
  const handleEditReply = async (feedbackId) => {
    if (!replyText.trim()) return;

    try {
      await updateFeedbackReply(feedbackId, replyText);
      // Reload feedback data
      const effectiveEmail = getEffectiveUserEmail(user);
      const updatedFeedback = await getFeedback(effectiveEmail);
      setFeedbackData(updatedFeedback);
      setEditingReply(null);
      setReplyText("");
    } catch (error) {
      console.error("Error updating reply:", error);
      alert("Failed to update reply. Please try again.");
    }
  };

  // Start editing a reply
  const startEditingReply = (feedback) => {
    setEditingReply(feedback.id);
    setReplyText(feedback.reply || "");
    setReplyingTo(null);
  };

  // Start replying to feedback
  const startReplying = (feedbackId) => {
    setReplyingTo(feedbackId);
    setReplyText("");
    setEditingReply(null);
  };

  // Cancel reply/edit
  const cancelReplyEdit = () => {
    setReplyingTo(null);
    setEditingReply(null);
    setReplyText("");
  };

  const filteredFeedback = feedbackData
    .filter(
      (feedback) =>
        feedback.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.productName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const toTime = (value) => {
        if (!value) return 0;
        if (value?.seconds) return value.seconds * 1000;
        if (typeof value?.toDate === "function") return value.toDate().getTime();
        const time = new Date(value).getTime();
        return Number.isNaN(time) ? 0 : time;
      };
      if (sortBy === "name-asc" || sortBy === "name-desc") {
        const compared = (a.clientName || "").localeCompare(b.clientName || "", undefined, { sensitivity: "base" });
        return sortBy === "name-asc" ? compared : -compared;
      }
      if (sortBy === "rating") {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      }
      const createdDiff = toTime(b.createdAt) - toTime(a.createdAt);
      return sortBy === "oldest" ? -createdDiff : createdDiff;
    });

  const stats = calculateFeedbackStats(feedbackData);

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get customer initial from name
  const getCustomerInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={
          index < rating ? "feedback_star_filled" : "feedback_star_empty"
        }
        fill={index < rating ? "#f59e0b" : "none"}
        color={index < rating ? "#f59e0b" : "#e5e7eb"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="feedback_tabb">
        <div className="feedback_loading">
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback_tabb">
      {/* Search Section */}
      <div className="feedback_search_section">
        <div className="search-sort-row">
        <div className="feedback_search_container">
          <Search className="feedback_search_icon" size={20} />
          <input
            type="text"
            placeholder="Search feedback..."
            className="feedback_search_input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="feedback_filter_btn">
            <Filter size={20} />
          </button>
        </div>
        <SortByButton
          value={sortBy}
          onChange={setSortBy}
          open={showSort}
          onToggle={() => setShowSort((open) => !open)}
          options={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "name-asc", label: "Name (A–Z)" },
            { value: "name-desc", label: "Name (Z–A)" },
            { value: "rating", label: "Rating" },
          ]}
        />
        </div>
        <Button
          variant="primary"
          size="medium"
          icon={<Plus size={16} />}
          onClick={() => setShowFeedbackForm(true)}
          className="feedback_add_btn"
        >
          Add Feedback
        </Button>
      </div>

      {/* Header */}
      <div className="feedback_header">
        <h2 className="feedback_count">{filteredFeedback.length} Reviews</h2>
        <div className="feedback_rating">
          <Star size={20} fill="#f59e0b" color="#f59e0b" />
          <span className="feedback_rating_value">
            {stats.averageRating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Feedback List */}
      <div className="feedback_list">
        {filteredFeedback.length === 0 ? (
          <div className="feedback_no_results">
            <p>
              {searchTerm
                ? "No feedback found matching your search criteria."
                : "No feedback yet. Add some client reviews to get started!"}
            </p>
          </div>
        ) : (
          filteredFeedback.map((feedback) => (
            <div key={feedback.id} className="feedback_card">
              {/* Feedback Header */}
              <div className="feedback_card_header">
                <div className="feedback_card_left">
                  <div
                    className="feedback_customer_avatar"
                    style={{ backgroundColor: "#10b981" }}
                  >
                    {getCustomerInitial(feedback.clientName)}
                  </div>
                  <div className="feedback_customer_info">
                    <h3 className="feedback_customer_name">
                      {feedback.clientName || "Anonymous"}
                    </h3>
                    <div className="feedback_rating_stars">
                      {renderStars(feedback.rating || 0)}
                    </div>
                  </div>
                </div>
                <div className="feedback_card_right">
                  <div className="feedback_date">
                    {formatDate(feedback.createdAt)}
                  </div>
                  <div className="feedback_actions_dropdown">
                    <button
                      className="feedback_actions_btn"
                      onClick={() =>
                        setShowDropdown(
                          showDropdown === feedback.id ? null : feedback.id
                        )
                      }
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {showDropdown === feedback.id && (
                      <div className="feedback_dropdown_menu">
                        <button
                          className="feedback_dropdown_item"
                          onClick={() => handleEditFeedback(feedback)}
                        >
                          <Edit size={14} />
                          Edit Feedback
                        </button>
                        <button
                          className="feedback_dropdown_item delete"
                          onClick={() =>
                            handleDeleteFeedback(
                              feedback.id,
                              feedback.clientName
                            )
                          }
                        >
                          <Trash2 size={14} />
                          Delete Feedback
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="feedback_review_content">
                <p className="feedback_review_text">
                  {feedback.comment || "No comment provided"}
                </p>
                <p className="feedback_service">
                  Service: {feedback.productName || "General Service"}
                </p>
                {feedback.orderNumber && (
                  <p className="feedback_order">
                    Order: {feedback.orderNumber}
                  </p>
                )}
                {feedback.invoiceNumber && (
                  <p className="feedback_invoice">
                    Invoice: {feedback.invoiceNumber}
                  </p>
                )}
              </div>

              {/* Response Section */}
              {feedback.reply && editingReply !== feedback.id ? (
                <div className="feedback_response_section">
                  <div className="feedback_response_header">
                    <span className="feedback_response_label">
                      Your Response:
                    </span>
                    <Button
                      variant="ghost"
                      size="small"
                      icon={<Edit size={14} />}
                      iconPosition="left"
                      className="feedback_edit_btn"
                      onClick={() => startEditingReply(feedback)}
                    >
                      Edit
                    </Button>
                  </div>
                  <p className="feedback_response_text">{feedback.reply}</p>
                </div>
              ) : null}

              {/* Reply Input Section */}
              {(replyingTo === feedback.id || editingReply === feedback.id) && (
                <div className="feedback_reply_input_section">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="feedback_reply_textarea"
                    rows={3}
                  />
                  <div className="feedback_reply_actions">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={cancelReplyEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() =>
                        editingReply === feedback.id
                          ? handleEditReply(feedback.id)
                          : handleReply(feedback.id)
                      }
                      disabled={!replyText.trim()}
                    >
                      {editingReply === feedback.id ? "Update" : "Send"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Reply Button */}
              {!feedback.reply &&
                replyingTo !== feedback.id &&
                editingReply !== feedback.id && (
                  <div className="feedback_reply_section">
                    <Button
                      variant="secondary"
                      size="small"
                      icon={<MessageCircle size={16} />}
                      iconPosition="left"
                      className="feedback_reply_btn"
                      onClick={() => startReplying(feedback.id)}
                    >
                      Reply
                    </Button>
                  </div>
                )}
            </div>
          ))
        )}
      </div>

      {/* Feedback Form Slide-in Menu */}
      <SlideInMenu
        isShow={showFeedbackForm}
        onClose={() => {
          setShowFeedbackForm(false);
          setEditingFeedback(null);
        }}
        position="rightt"
        width="480px"
      >
        <AddFeedbackPanel
          onClose={() => {
            setShowFeedbackForm(false);
            setEditingFeedback(null);
          }}
          onSubmit={handleAddFeedback}
          editingFeedback={editingFeedback}
          editMode={!!editingFeedback}
        />
      </SlideInMenu>
    </div>
  );
};

export default FeedbackTab;
