import { useState } from "react";
import { X, Edit3, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "../../components/button/Button";
import { MoneyAmount } from "../../components/MoneyAmount/MoneyAmount";
import "./DesignDetailsPanel.css";

const DesignDetailsPanel = ({ design, onClose, onEdit, onDelete }) => {
  const { isDark } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get design images - prioritize images array, then imageUrl, then placeholder
  const designImages =
    design?.images?.length > 0
      ? design.images
      : design?.imageUrl
      ? [design.imageUrl]
      : [design?.image]; // fallback for old structure

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? designImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === designImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(design);
    }
  };

  const handleDelete = () => {
    if (onDelete && design?.id) {
      onDelete(design.id);
    }
  };

  const handleAddOrder = () => {
    // Handle add order functionality
    console.log("Adding order for design:", design);
    // You can add your order creation logic here
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

  if (!design) return null;

  return (
    <div
      className={`design-details-panel ${
        isDark ? "dark-theme" : "light-theme"
      }`}
    >
      {/* Header */}
      <div className="design-details-header">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="panel-title">Design Details</h2>
        <div className="header-actions">
          <button className="edit-btn" onClick={handleEdit}>
            <Edit3 size={20} />
          </button>
          <button className="delete-btn" onClick={handleDelete}>
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="design-details-content">
        {/* Main Image */}
        <div className="design-image-section">
          <div className="main-image-container">
            <img
              src={designImages[currentImageIndex]}
              alt={design.name || design.title}
              className="main-design-image"
            />
            {designImages.length > 1 && (
              <>
                <button
                  className="image-nav-btn prev-btn"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="image-nav-btn next-btn"
                  onClick={handleNextImage}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          {designImages.length > 1 && (
            <div className="thumbnail-container">
              {designImages.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${design.name || design.title} ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Design Information */}
        <div className="design-info-section">
          <h1 className="design-title">{design.name || design.title}</h1>

          {/* Tags */}
          <div className="design-tags">
            <span className="tag tag-category">{design.category}</span>
            <span className="tag tag-status">{design.status}</span>
          </div>

          {/* Selling Price */}
          {design.price && (
            <div className="info-group">
              <label className="info-label">Selling Price</label>
              <p className="info-value price"><MoneyAmount amount={design.price} /></p>
            </div>
          )}

          {/* Category */}
          <div className="info-group">
            <label className="info-label">Category</label>
            <p className="info-value">
              {design.category === "Others" && design.customCategory
                ? design.customCategory
                : design.category}
            </p>
          </div>

          {/* Client Information */}
          {design.clientName && (
            <div className="info-group">
              <label className="info-label">Client</label>
              <p className="info-value">{design.clientName}</p>
            </div>
          )}

          {/* Description */}
          {design.description && (
            <div className="info-group">
              <label className="info-label">Description</label>
              <p className="info-value description">{design.description}</p>
            </div>
          )}

          {/* Created Date */}
          <div className="info-group">
            <label className="info-label">Created</label>
            <p className="info-value">{formatDate(design.createdAt)}</p>
          </div>

          {/* Updated Date */}
          {design.updatedAt && design.updatedAt !== design.createdAt && (
            <div className="info-group">
              <label className="info-label">Last Updated</label>
              <p className="info-value">{formatDate(design.updatedAt)}</p>
            </div>
          )}
        </div>

        {/* Add Order Button */}
        <div className="design-actions">
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={handleAddOrder}
            className="add-order-btn"
          >
            Add Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DesignDetailsPanel;
