import { useState, useEffect } from "react";
import { Search, Filter, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useNewAuth } from "../../../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../../../utils/teamUtils";
import {
  getDesigns,
  deleteDesign,
} from "../../../../backend/services/crmService";
import Button from "../../../../components/button/Button";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import AddDesignPanel from "../../../../pannel_pages/AddDesignPanel/AddDesignPanel";
import DesignDetailsPanel from "../../../../pannel_pages/DesignDetailsPanel/DesignDetailsPanel";
import designPlaceholder from "../../../../assets/Image/logo.png";
import PageLoading from "../../../../components/Loading/PageLoading";
import Loading from "../../../../components/Loading/Loading";
import "./Designs.css";

const Designs = () => {
  const { user } = useNewAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Designs");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddDesignPanel, setShowAddDesignPanel] = useState(false);
  const [showDesignDetailsPanel, setShowDesignDetailsPanel] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "All Designs",
    "Uniforms",
    "Shirts",
    "Children's Wear",
    "Dresses",
    "Tops",
    "Bottoms",
    "Others",
  ];

  // Load designs from Firebase
  const loadDesigns = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const effectiveEmail = getEffectiveUserEmail(user);
      const designsData = await getDesigns(effectiveEmail);
      setDesigns(designsData);
    } catch (error) {
      console.error("Error loading designs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesigns();
  }, [user?.email]);

  // Handle design submission (add/update)
  const handleDesignSubmit = async () => {
    await loadDesigns(); // Reload designs after submission
    setShowAddDesignPanel(false);
    setEditMode(false);
    setEditingDesign(null);
  };

  // Handle design deletion
  const handleDeleteDesign = async (designId) => {
    if (!confirm("Are you sure you want to delete this design?")) {
      return;
    }

    try {
      await deleteDesign(designId);
      await loadDesigns();
      setShowDesignDetailsPanel(false);
      setSelectedDesign(null);
    } catch (error) {
      console.error("Error deleting design:", error);
      alert("Error deleting design. Please try again.");
    }
  };

  // Filter designs based on search and category — newest first
  const filteredDesigns = designs
    .filter((design) => {
      const matchesSearch = design.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        activeCategory === "All Designs" || design.category === activeCategory;
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && design.status === "Active") ||
        (filterStatus === "archived" && design.status === "Archived");
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const toMs = (d) => {
        if (!d) return 0;
        if (d?.seconds) return d.seconds * 1000;
        return new Date(d).getTime() || 0;
      };
      return toMs(b.createdAt) - toMs(a.createdAt);
    });

  const formatPrice = (price) => {
    if (!price) return "₦0";
    return `₦${price.toLocaleString()}`;
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

  const handleDesignClick = (design) => {
    setSelectedDesign(design);
    setShowDesignDetailsPanel(true);
  };

  const handleEditDesign = (design) => {
    setEditingDesign(design);
    setEditMode(true);
    setShowDesignDetailsPanel(false);
    setShowAddDesignPanel(true);
  };

  const handleCloseAddPanel = () => {
    setShowAddDesignPanel(false);
    setEditMode(false);
    setEditingDesign(null);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="designs-gallery">
      {/* Header */}
      <div className="designs-header">
        <h1 className="designs-title">Your designs Gallery</h1>
      </div>

      {/* Search and Add Design Section */}
      <div className="designs-controls">
        <div className="design_search_section">
          <div className="design_search_input_container">
            <Search className="design_search_icon" size={20} />
            <input
              type="text"
              placeholder="Search designs by name"
              className="design_search_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="design_filter_btn"
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter size={20} />
            </button>
          </div>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="design_filter_dropdown">
              <div className="design_filter_header">
                <h4>Filter by Status</h4>
              </div>
              <div className="design_filter_option">
                <input
                  type="radio"
                  id="design_all"
                  name="design_status_filter"
                  value="all"
                  checked={filterStatus === "all"}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setShowFilter(false);
                  }}
                />
                <label htmlFor="design_all">All Designs</label>
              </div>
              <div className="design_filter_option">
                <input
                  type="radio"
                  id="design_active"
                  name="design_status_filter"
                  value="active"
                  checked={filterStatus === "active"}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setShowFilter(false);
                  }}
                />
                <label htmlFor="design_active">Active</label>
              </div>
              <div className="design_filter_option">
                <input
                  type="radio"
                  id="design_archived"
                  name="design_status_filter"
                  value="archived"
                  checked={filterStatus === "archived"}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setShowFilter(false);
                  }}
                />
                <label htmlFor="design_archived">Archived</label>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="primary"
          size="medium"
          icon={<Plus size={20} />}
          iconPosition="left"
          className="add-design-btn"
          onClick={() => {
            setEditMode(false);
            setEditingDesign(null);
            setShowAddDesignPanel(true);
          }}
        >
          <span className="add-design-text">Add Design</span>
        </Button>

        {/* Mobile Floating Button */}
        <Button
          variant="primary"
          size="large"
          icon={<Plus size={24} />}
          className="add-design-btn-mobile"
          onClick={() => {
            setEditMode(false);
            setEditingDesign(null);
            setShowAddDesignPanel(true);
          }}
        />
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-tab ${
              activeCategory === category ? "active" : ""
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Designs Count Section */}
      <div className="designs-count-section">
        <span className="designs-count">{filteredDesigns.length} Designs</span>
      </div>

      {/* Designs Grid */}
      <div className="designs-grid">
        {filteredDesigns.map((design) => (
          <div
            key={design.id}
            className="design-card"
            onClick={() => handleDesignClick(design)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleDesignClick(design);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`View details for ${design.name}`}
          >
            <div className="design-image-container">
              <img
                src={design.imageUrl || design.images?.[0] || designPlaceholder}
                alt={design.name}
                className="design-image"
              />
              <div
                className={`status-badge ${design.status
                  ?.toLowerCase()
                  .replace(" ", "-")}`}
              >
                {design.status}
              </div>
              <button className="nav-arrow nav-arrow-left">
                <ChevronLeft size={16} />
              </button>
              <button className="nav-arrow nav-arrow-right">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="design-info">
              <h3 className="design-title">{design.name}</h3>
              <p className="design-date">{formatDate(design.createdAt)}</p>
              <p className="design-price">{formatPrice(design.price)}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredDesigns.length === 0 && (
        <div className="no-designs">
          <p>No designs found matching your criteria.</p>
        </div>
      )}

      {/* Add Design Slide-in Menu */}
      <SlideInMenu
        isShow={showAddDesignPanel}
        onClose={handleCloseAddPanel}
        position="rightt"
        width="400px"
      >
        <AddDesignPanel
          onClose={handleCloseAddPanel}
          onSubmit={handleDesignSubmit}
          editMode={editMode}
          initialData={editingDesign}
        />
      </SlideInMenu>

      {/* Design Details Slide-in Menu */}
      <SlideInMenu
        isShow={showDesignDetailsPanel}
        onClose={() => {
          setShowDesignDetailsPanel(false);
          setSelectedDesign(null);
        }}
        position="rightt"
        width="400px"
      >
        <DesignDetailsPanel
          design={selectedDesign}
          onClose={() => {
            setShowDesignDetailsPanel(false);
            setSelectedDesign(null);
          }}
          onEdit={handleEditDesign}
          onDelete={handleDeleteDesign}
        />
      </SlideInMenu>
    </div>
  );
};

export default Designs;
