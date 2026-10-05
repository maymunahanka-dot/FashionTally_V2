import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  User,
  Crown,
  Star,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import {
  getLoyaltyMembers,
  addLoyaltyMember,
  updateLoyaltyMember,
  deleteLoyaltyMember,
  calculateLoyaltyStats,
} from "../../backend/services/crmService";
import Button from "../button/Button";
import SlideInMenu from "../SlideInMenu/SlideInMenu";
import AddLoyaltyMemberPanel from "../../pannel_pages/AddLoyaltyMemberPanel";
import "./LoyaltyTab.css";

const LoyaltyTab = () => {
  const { user } = useNewAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Load loyalty members
  const loadMembers = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const effectiveEmail = getEffectiveUserEmail(user);
      const membersData = await getLoyaltyMembers(effectiveEmail);
      setMembers(membersData);
    } catch (error) {
      console.error("Error loading loyalty members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [user?.email]);

  // Handle add/update member
  const handleSubmitMember = async (memberData) => {
    if (!user?.email) return;

    try {
      setIsSubmitting(true);

      const effectiveEmail = getEffectiveUserEmail(user);

      if (editingMember) {
        await updateLoyaltyMember(editingMember.id, memberData);
      } else {
        await addLoyaltyMember(memberData, effectiveEmail);
      }

      await loadMembers();
      setIsAddPanelOpen(false);
      setEditingMember(null);
    } catch (error) {
      console.error("Error saving loyalty member:", error);
      alert("Error saving member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete member
  const handleDeleteMember = async (memberId) => {
    if (!confirm("Are you sure you want to delete this loyalty member?")) {
      return;
    }

    try {
      await deleteLoyaltyMember(memberId);
      await loadMembers();
      setDropdownOpen(null);
    } catch (error) {
      console.error("Error deleting loyalty member:", error);
      alert("Error deleting member. Please try again.");
    }
  };

  // Handle edit member
  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsAddPanelOpen(true);
    setDropdownOpen(null);
  };

  // Close panel
  const handleClosePanel = () => {
    setIsAddPanelOpen(false);
    setEditingMember(null);
  };

  // Filter members based on search
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const renderAvatarIcon = (level) => {
    switch (level) {
      case "Platinum":
        return <Crown size={24} color="#8b5cf6" />;
      case "Gold":
        return <Star size={24} color="#f59e0b" fill="#f59e0b" />;
      case "Silver":
        return <Star size={24} color="#94a3b8" />;
      case "Bronze":
      default:
        return <User size={24} color="#6b7280" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "Platinum":
        return "#8b5cf6";
      case "Gold":
        return "#f59e0b";
      case "Silver":
        return "#94a3b8";
      case "Bronze":
      default:
        return "#6b7280";
    }
  };

  const getLevelBgColor = (level) => {
    switch (level) {
      case "Platinum":
        return "#e9d5ff";
      case "Gold":
        return "#fef3c7";
      case "Silver":
        return "#f1f5f9";
      case "Bronze":
      default:
        return "#f3f4f6";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    let date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₦0";
    return `₦${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="loyalty_tab">
        <div className="loyalty_loading">
          <p>Loading loyalty members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loyalty_tab">
      {/* Search and Add Customer Section */}
      <div className="loyalty_controls">
        <div className="loyalty_search_section">
          <div className="loyalty_search_input_container">
            <Search className="loyalty_search_icon" size={20} />
            <input
              type="text"
              placeholder="Search clients by name, phone, or email"
              className="loyalty_search_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="loyalty_filter_btn_inside"
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        <Button
          variant="primary"
          size="medium"
          icon={<Plus size={20} />}
          iconPosition="left"
          className="loyalty_add_customer_btn"
          onClick={() => setIsAddPanelOpen(true)}
        >
          Add Member
        </Button>
      </div>

      {/* Members Grid */}
      <div className="loyalty_customers_grid">
        {filteredMembers.map((member) => (
          <div key={member.id} className="loyalty_customer_card">
            <div className="loyalty_customer_header">
              <div
                className="loyalty_customer_avatar"
                style={{ backgroundColor: getLevelBgColor(member.level) }}
              >
                {renderAvatarIcon(member.level)}
              </div>
              <div className="loyalty_card_actions">
                <div
                  className="loyalty_badge"
                  style={{ backgroundColor: getLevelColor(member.level) }}
                >
                  {member.level || "Bronze"}
                </div>
                <div className="loyalty_dropdown">
                  <button
                    className="loyalty_dropdown_trigger"
                    onClick={() =>
                      setDropdownOpen(
                        dropdownOpen === member.id ? null : member.id
                      )
                    }
                  >
                    <MoreVertical size={16} />
                  </button>
                  {dropdownOpen === member.id && (
                    <div className="loyalty_dropdown_menu">
                      <button
                        onClick={() => handleEditMember(member)}
                        className="loyalty_dropdown_item"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="loyalty_dropdown_item delete"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="loyalty_customer_info">
              <h3 className="loyalty_customer_name">{member.name}</h3>
              <p className="loyalty_customer_email">{member.email}</p>

              {/* Horizontal Stats */}
              <div className="loyalty_customer_stats">
                <span className="loyalty_points">
                  <Star size={16} color="#f59e0b" fill="#f59e0b" />
                  {member.points || 0} pts
                </span>
                <span className="loyalty_separator">•</span>
                <span className="loyalty_spent">
                  {formatCurrency(member.totalSpent)}
                </span>
              </div>
            </div>

            <div className="loyalty_customer_dates">
              <div className="loyalty_date_item">
                <span className="loyalty_date_label">Member Since</span>
                <span className="loyalty_date_value">
                  {formatDate(member.createdAt)}
                </span>
              </div>
              <div className="loyalty_date_item">
                <span className="loyalty_date_label">Last Activity</span>
                <span className="loyalty_date_value">
                  {formatDate(member.lastActivity)}
                </span>
              </div>
            </div>

            {member.tags && member.tags.length > 0 && (
              <div className="loyalty_member_tags">
                {member.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="loyalty_tag">
                    {tag}
                  </span>
                ))}
                {member.tags.length > 2 && (
                  <span className="loyalty_tag_more">
                    +{member.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && !loading && (
        <div className="loyalty_no_customers">
          <p>
            {members.length === 0
              ? "No loyalty members yet. Add your first member to get started!"
              : "No members found matching your search criteria."}
          </p>
        </div>
      )}

      {/* Add/Edit Member Panel */}
      <SlideInMenu
        isShow={isAddPanelOpen}
        onClose={handleClosePanel}
        position="rightt"
        width="480px"
      >
        <AddLoyaltyMemberPanel
          onSubmit={handleSubmitMember}
          editingMember={editingMember}
          isLoading={isSubmitting}
          onClose={handleClosePanel}
        />
      </SlideInMenu>
    </div>
  );
};

export default LoyaltyTab;
