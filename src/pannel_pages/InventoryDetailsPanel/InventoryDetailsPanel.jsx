import { useState, useEffect } from "react";
import {
  X,
  Package,
  Calendar,
  User,
  DollarSign,
  Hash,
  Palette,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import "./InventoryDetailsPanel.css";

const InventoryDetailsPanel = ({ onClose, selectedItem }) => {
  const { actualTheme } = useTheme();

  if (!selectedItem) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "In Stock":
        return (
          <CheckCircle
            className="inventory_detail_status_icon inventory_detail_status_in_stock"
            size={20}
          />
        );
      case "Low Stock":
        return (
          <AlertTriangle
            className="inventory_detail_status_icon inventory_detail_status_low_stock"
            size={20}
          />
        );
      case "Out of Stock":
        return (
          <XCircle
            className="inventory_detail_status_icon inventory_detail_status_out_stock"
            size={20}
          />
        );
      default:
        return <Package className="inventory_detail_status_icon" size={20} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "In Stock":
        return "inventory_detail_status_badge_in_stock";
      case "Low Stock":
        return "inventory_detail_status_badge_low_stock";
      case "Out of Stock":
        return "inventory_detail_status_badge_out_stock";
      default:
        return "inventory_detail_status_badge_default";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  const totalValue = selectedItem.price * selectedItem.quantity;

  return (
    <div className="inventory_detail_panel">
      {/* Header */}
      <div className="inventory_detail_header">
        <button className="inventory_detail_close_btn" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="inventory_detail_title_section">
          <h2 className="inventory_detail_title">{selectedItem.name}</h2>
          <p className="inventory_detail_subtitle">
            SKU: {selectedItem.sku || selectedItem.code}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="inventory_detail_content">
        {/* Status Section */}
        <div className="inventory_detail_section">
          <div className="inventory_detail_section_header">
            {getStatusIcon(selectedItem.status)}
            <h3 className="inventory_detail_section_title">Status</h3>
          </div>
          <div className="inventory_detail_section_content">
            <div
              className={`inventory_detail_status_badge ${getStatusClass(
                selectedItem.status
              )}`}
            >
              {selectedItem.status}
            </div>
            {selectedItem.status === "Low Stock" && (
              <p className="inventory_detail_status_description">
                Stock level is below the reorder point. Consider restocking
                soon.
              </p>
            )}
            {selectedItem.status === "Out of Stock" && (
              <p className="inventory_detail_status_description">
                This item is currently out of stock. Reorder immediately.
              </p>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="inventory_detail_section">
          <div className="inventory_detail_section_header">
            <Package size={20} />
            <h3 className="inventory_detail_section_title">Item Details</h3>
          </div>
          <div className="inventory_detail_section_content">
            <div className="inventory_detail_info_grid">
              <div className="inventory_detail_info_item">
                <div className="inventory_detail_info_label">
                  <Hash size={16} />
                  SKU
                </div>
                <div className="inventory_detail_info_value">
                  {selectedItem.sku || selectedItem.code}
                </div>
              </div>

              <div className="inventory_detail_info_item">
                <div className="inventory_detail_info_label">
                  <Package size={16} />
                  Category
                </div>
                <div className="inventory_detail_info_value">
                  {selectedItem.category}
                  {selectedItem.subcategory && (
                    <span className="inventory_detail_subcategory">
                      {" "}
                      • {selectedItem.subcategory}
                    </span>
                  )}
                </div>
              </div>

              <div className="inventory_detail_info_item">
                <div className="inventory_detail_info_label">
                  <User size={16} />
                  Supplier
                </div>
                <div className="inventory_detail_info_value">
                  {selectedItem.supplierName || selectedItem.supplier}
                </div>
              </div>

              <div className="inventory_detail_info_item">
                <div className="inventory_detail_info_label">
                  <DollarSign size={16} />
                  Unit Price
                </div>
                <div className="inventory_detail_info_value">
                  {formatCurrency(
                    selectedItem.price || selectedItem.pricePerUnit
                  )}
                </div>
              </div>

              {selectedItem.color && (
                <div className="inventory_detail_info_item">
                  <div className="inventory_detail_info_label">
                    <Palette size={16} />
                    Color
                  </div>
                  <div className="inventory_detail_info_value">
                    {selectedItem.color}
                  </div>
                </div>
              )}
            </div>

            {selectedItem.description && (
              <div className="inventory_detail_description">
                <div className="inventory_detail_info_label">
                  <FileText size={16} />
                  Description
                </div>
                <div className="inventory_detail_info_value inventory_detail_description_text">
                  {selectedItem.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stock Information */}
        <div className="inventory_detail_section">
          <div className="inventory_detail_section_header">
            <Package size={20} />
            <h3 className="inventory_detail_section_title">
              Stock Information
            </h3>
          </div>
          <div className="inventory_detail_section_content">
            <div className="inventory_detail_stock_grid">
              <div className="inventory_detail_stock_card">
                <div className="inventory_detail_stock_value">
                  {selectedItem.quantity}
                </div>
                <div className="inventory_detail_stock_label">
                  Current Stock
                </div>
                <div className="inventory_detail_stock_unit">
                  {selectedItem.unit}
                </div>
              </div>

              <div className="inventory_detail_stock_card">
                <div className="inventory_detail_stock_value inventory_detail_reorder_value">
                  {selectedItem.reorderPoint || selectedItem.minStock}
                </div>
                <div className="inventory_detail_stock_label">
                  Reorder Point
                </div>
                <div className="inventory_detail_stock_unit">
                  {selectedItem.unit}
                </div>
              </div>

              <div className="inventory_detail_stock_card">
                <div className="inventory_detail_stock_value inventory_detail_total_value">
                  {formatCurrency(totalValue)}
                </div>
                <div className="inventory_detail_stock_label">Total Value</div>
                <div className="inventory_detail_stock_unit">
                  {selectedItem.quantity} ×{" "}
                  {formatCurrency(
                    selectedItem.price || selectedItem.pricePerUnit
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="inventory_detail_section">
          <div className="inventory_detail_section_header">
            <Calendar size={20} />
            <h3 className="inventory_detail_section_title">Timeline</h3>
          </div>
          <div className="inventory_detail_section_content">
            <div className="inventory_detail_timeline">
              <div className="inventory_detail_timeline_item">
                <div className="inventory_detail_timeline_label">Created</div>
                <div className="inventory_detail_timeline_value">
                  {formatDate(selectedItem.createdAt)}
                </div>
              </div>
              <div className="inventory_detail_timeline_separator"></div>
              <div className="inventory_detail_timeline_item">
                <div className="inventory_detail_timeline_label">
                  Last Updated
                </div>
                <div className="inventory_detail_timeline_value">
                  {formatDate(selectedItem.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailsPanel;
