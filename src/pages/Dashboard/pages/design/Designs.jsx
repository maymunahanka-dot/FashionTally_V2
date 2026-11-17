import { useState, useEffect } from "react";
import { Search, Filter, Plus, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { useNewAuth } from "../../../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../../../utils/teamUtils";
import {
  getDesigns,
  deleteDesign,
} from "../../../../backend/services/crmService";
import Button from "../../../../components/button/Button";
import { useSavedSort } from "../../../../components/SortByButton/SortByButton";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import AddDesignPanel from "../../../../pannel_pages/AddDesignPanel/AddDesignPanel";
import DesignDetailsPanel from "../../../../pannel_pages/DesignDetailsPanel/DesignDetailsPanel";
import designPlaceholder from "../../../../assets/Image/logo.png";
import { MoneyAmount } from "../../../../components/MoneyAmount/MoneyAmount";
import Loading from "../../../../components/Loading/Loading";
import "./Designs.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../../i18n";

import { tl } from "../../../../i18n";

import { dateLocale } from "../../../../i18n";


const Designs = () => {
  const { t: tx } = useTranslation();
  const { user } = useNewAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Designs");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useSavedSort("ft.sort.designs");
  const [showSort, setShowSort] = useState(false);
  const [showAddDesignPanel, setShowAddDesignPanel] = useState(false);
  const [showDesignDetailsPanel, setShowDesignDetailsPanel] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!confirm(tx("auto.areYouSureYouWant_0097"))) {
      return;
    }

    try {
      await deleteDesign(designId);
      await loadDesigns();
      setShowDesignDetailsPanel(false);
      setSelectedDesign(null);
    } catch (error) {
      console.error("Error deleting design:", error);
      alert(tx("auto.errorDeletingDesignPleaseTry_b7a4"));
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
        const time = new Date(d).getTime();
        return Number.isNaN(time) ? 0 : time;
      };

      if (sortBy === "name-asc" || sortBy === "name-desc") {
        const compared = (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
        return sortBy === "name-asc" ? compared : -compared;
      }

      if (sortBy === "price") {
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      }

      const createdDiff = toMs(b.createdAt) - toMs(a.createdAt);
      return sortBy === "oldest" ? -createdDiff : createdDiff;
    });

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    let date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString(dateLocale("en-US"), {
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
        <h1 className="designs-title">{tx("auto.yourDesignsGallery_39a1")}</h1>
      </div>

      {/* Search and Add Design Section */}
      <div className="designs-controls">
        <div className="search-sort-row">
        <div className="design_search_section">
          <div className="design_search_input_container">
            <Search className="design_search_icon" size={20} />
            <input
              type="text"
              placeholder={tx("auto.searchDesignsByName_5eb5")}
              className="design_search_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="design_filter_btn"
              onClick={() => {
                setShowFilter(!showFilter);
                setShowSort(false);
              }}
            >
              <Filter size={20} />
            </button>
          </div>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="design_filter_dropdown">
              <div className="design_filter_header">
                <h4>{tx("auto.filterByStatus_c976")}</h4>
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
                <label htmlFor="design_all">{tx("auto.allDesigns_347e")}</label>
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
                <label htmlFor="design_active">{tx("auto.active_a733")}</label>
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
                <label htmlFor="design_archived">{tx("auto.archived_eddc")}</label>
              </div>
            </div>
          )}
        </div>

        <div className="clients-sort">
          <Button
            variant="outline"
            size="medium"
            icon={<ArrowUpDown size={18} />}
            iconPosition="left"
            active={showSort}
            onClick={() => {
              setShowSort((open) => !open);
              setShowFilter(false);
            }}
            className="sort-by-btn"
            aria-label="Sort by"
          >
            {tx("auto.sortBy_a2a5")}
          </Button>
          {showSort && (
            <div className="sort-dropdown" role="menu">
              {[
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
                { value: "name-asc", label: "Name (A–Z)" },
                { value: "name-desc", label: "Name (Z–A)" },
                { value: "price", label: "Price" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={sortBy === option.value}
                  className={`sort-option${sortBy === option.value ? " active" : ""}`}
                  onClick={() => {
                    setSortBy(option.value);
                    setShowSort(false);
                  }}
                >
                  {tl(option.label)}
                </button>
              ))}
            </div>
          )}
        </div>
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
          <span className="add-design-text">{tx("auto.addDesign_8233")}</span>
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
            {tl(category)}
          </button>
        ))}
      </div>

      {/* Designs Count Section */}
      <div className="designs-count-section">
        <span className="designs-count">{tl(filteredDesigns.length)}{" "}{tx("auto.designs_fdea")}</span>
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
                {tl(design.status)}
              </div>
              <button className="nav-arrow nav-arrow-left">
                <ChevronLeft size={16} />
              </button>
              <button className="nav-arrow nav-arrow-right">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="design-info">
              <h3 className="design-title">{tl(design.name)}</h3>
              <p className="design-date">{tl(formatDate(design.createdAt))}</p>
              <p className="design-price"><MoneyAmount amount={design.price} /></p>
            </div>
          </div>
        ))}
      </div>

      {filteredDesigns.length === 0 && (
        <div className="no-designs">
          <p>{tx("auto.noDesignsFoundMatchingYour_0bf5")}</p>
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
          isOpen={showAddDesignPanel}
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
