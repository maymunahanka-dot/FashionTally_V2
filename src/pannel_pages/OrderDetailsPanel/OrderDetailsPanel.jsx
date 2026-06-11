import { useState, useEffect, useContext } from "react";
import { X, Edit3, Phone, Mail, Calendar, Package, Trash2 } from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import NewAuthContext from "../../contexts/NewAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "../../components/button/Button";
import "./OrderDetailsPanel.css";

const OrderDetailsPanel = ({ order, onClose, onEdit }) => {
  const { isDark } = useTheme();
  const { user } = useContext(NewAuthContext);
  const [currentStatus, setCurrentStatus] = useState(
    order?.status || "Pending"
  );
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (order?.status) {
      setCurrentStatus(order.status);
    }
  }, [order?.status]);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(order);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!order?.id || !user?.email || updating) return;

    setUpdating(true);
    try {
      // Map UI status to database status
      const dbStatus = mapUIStatusToDatabase(newStatus);

      await updateDoc(doc(db, "fashiontally_designs", order.id), {
        status: dbStatus,
        updatedAt: new Date(),
      });

      setCurrentStatus(newStatus);
      console.log("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  // Map UI status to database status
  const mapUIStatusToDatabase = (uiStatus) => {
    switch (uiStatus) {
      case "In Progress":
        return "Active";
      case "Completed":
        return "Archived";
      default:
        return "Active";
    }
  };

  const handleContact = () => {
    if (order?.client?.phone) {
      window.open(`tel:${order.client.phone}`, "_self");
    }
  };

  const handleUpdateTimeline = () => {
    // Handle timeline update functionality
    console.log("Updating timeline for order:", order);
  };

  const handleDeleteOrder = async () => {
    if (!order?.id || !user?.email) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete this order "${
        order.title || "Untitled Order"
      }"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "fashiontally_designs", order.id));
      console.log("Order deleted successfully");
      onClose(); // Close the panel after successful deletion
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order. Please try again.");
    }
  };

  if (!order) {
    return (
      <div
        className={`odp_order-details-panel ${
          isDark ? "dark-theme" : "light-theme"
        }`}
      >
        <div className="odp_order-details-header">
          <button className="odp_close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <div className="odp_header-content">
            <h2 className="odp_panel-title">Order Details</h2>
          </div>
        </div>
        <div className="odp_order-details-content">
          <div className="odp_loading">
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Format measurements for display
  const formatMeasurements = (measurements) => {
    if (!measurements || typeof measurements !== "object") return [];

    const formattedMeasurements = [];

    Object.entries(measurements).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formattedMeasurements.push({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
          value: `${value}"`,
        });
      }
    });

    return formattedMeasurements;
  };

  // Use real order data
  const orderDetails = {
    id: order.id,
    orderNumber: `#FT-${order.id.slice(-6).toUpperCase()}`,
    status: currentStatus,
    client: {
      name: order.client?.name || order.clientName || "Unknown Client",
      phone: order.client?.phone || order.clientPhone || "N/A",
      email: order.client?.email || order.clientEmail || "N/A",
      avatar: (order.client?.name || order.clientName || "UC")
        .substring(0, 2)
        .toUpperCase(),
    },
    orderDetails: {
      item: order.title || order.originalData?.garmentDescription || "Untitled Order",
      fabric: order.originalData?.fabric || order.originalData?.materials?.[0] || "Not specified",
      orderType: (() => {
        const raw = order.originalData?.orderType;
        const labels = {
          wedding_gown: "Wedding Gown", evening_dress: "Evening Dress",
          casual_wear: "Casual Wear", traditional_wear: "Traditional Wear",
          suit: "Suit", alterations: "Alterations", custom_design: "Custom Design",
        };
        return labels[raw] || order.originalData?.garmentType || order.category || "Not specified";
      })(),
      deliveryDate: order.dueDate
        ? order.dueDate.toLocaleDateString()
        : "Not set",
      customItems: order.originalData?.specialInstructions || order.originalData?.description || "No additional details",
    },
    measurements: formatMeasurements(
      order.measurements || order.originalData?.measurements
    ),
    pricing: {
      basePrice:
        order.basePrice ||
        order.originalData?.basePrice ||
        order.price ||
        order.originalData?.price ||
        0,
      additionalItems: (
        order.additionalItems ||
        order.originalData?.additionalItems ||
        []
      ).reduce((sum, item) => sum + (item.price || 0), 0),
      totalAmount: order.price || order.originalData?.price || 0,
      depositPaid: order.deposit || order.depositPaid || order.originalData?.deposit || order.originalData?.depositPaid || 0,
      balanceDue:
        order.balance ||
        order.balanceDue ||
        order.originalData?.balance ||
        order.originalData?.balanceDue ||
        (order.price || order.originalData?.price || 0) -
          (order.deposit || order.depositPaid || order.originalData?.deposit || order.originalData?.depositPaid || 0),
      additionalItemsList:
        order.additionalItems || order.originalData?.additionalItems || [],
    },
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "odp_status-completed";
      case "in progress":
        return "odp_status-in-progress";
      case "pending payment":
        return "odp_status-pending";
      case "cancelled":
        return "odp_status-cancelled";
      default:
        return "odp_status-default";
    }
  };

  return (
    <div
      className={`odp_order-details-panel ${
        isDark ? "dark-theme" : "light-theme"
      }`}
    >
      {/* Header */}
      <div className="odp_order-details-header">
        <button className="odp_close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="odp_header-content">
          <h2 className="odp_panel-title">Order Details</h2>
          <p className="odp_order-number">{orderDetails.orderNumber}</p>
        </div>
        <div className="odp_header-actions">
          <button className="odp_delete-btn" onClick={handleDeleteOrder}>
            <Trash2 size={18} />
          </button>
          <button className="odp_edit-btn" onClick={handleEdit}>
            <Edit3 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="odp_order-details-content">
        {/* Order Status */}
        <div className="odp_section">
          <h3 className="odp_section-title">Order Status</h3>
          <div className="odp_status-container">
            <select
              className={`odp_status-select ${getStatusColor(currentStatus)}`}
              value={currentStatus.toLowerCase().replace(" ", "-")}
              onChange={(e) => {
                const newStatus = e.target.options[e.target.selectedIndex].text;
                handleStatusChange(newStatus);
              }}
              disabled={updating}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {updating && <span className="odp_updating-text">Updating...</span>}
          </div>
        </div>

        {/* Client Information */}
        <div className="odp_section">
          <h3 className="odp_section-title">Client Information</h3>
          <div className="odp_client-info">
            <div className="odp_client-avatar">
              {orderDetails.client.avatar}
            </div>
            <div className="odp_client-details">
              <h4 className="odp_client-name">{orderDetails.client.name}</h4>
              <div className="odp_contact-info">
                <div className="odp_contact-item">
                  <Phone size={16} />
                  <span>{orderDetails.client.phone}</span>
                </div>
                <div className="odp_contact-item">
                  <Mail size={16} />
                  <span>{orderDetails.client.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="odp_section">
          <h3 className="odp_section-title">Order Details</h3>
          <div className="odp_order-details-grid">
            <div className="odp_detail-column">
              <div className="odp_detail-item">
                <div className="odp_detail-header">
                  <Package size={20} className="odp_detail-icon" />
                  <span className="odp_detail-label">Item</span>
                </div>
                <div className="odp_detail-content">
                  <p className="odp_detail-main">
                    {orderDetails.orderDetails.item}
                  </p>
                  <p className="odp_detail-sub">{orderDetails.orderDetails.orderType}</p>
                </div>
              </div>
            </div>

            <div className="odp_detail-column">
              <div className="odp_detail-item">
                <div className="odp_detail-header">
                  <Package size={20} className="odp_detail-icon" />
                  <span className="odp_detail-label">Fabric</span>
                </div>
                <div className="odp_detail-content">
                  <p className="odp_detail-main">
                    {orderDetails.orderDetails.fabric}
                  </p>
                  <p className="odp_detail-sub">Material</p>
                </div>
              </div>
            </div>

            <div className="odp_detail-column">
              <div className="odp_detail-item">
                <div className="odp_detail-header">
                  <Package size={20} className="odp_detail-icon" />
                  <span className="odp_detail-label">Order Type</span>
                </div>
                <div className="odp_detail-content">
                  <p className="odp_detail-main">
                    {orderDetails.orderDetails.orderType}
                  </p>
                  <p className="odp_detail-sub">Type</p>
                </div>
              </div>
            </div>

            <div className="odp_detail-column">
              <div className="odp_detail-item">
                <div className="odp_detail-header">
                  <Calendar size={20} className="odp_detail-icon" />
                  <span className="odp_detail-label">Delivery Date</span>
                </div>
                <div className="odp_detail-content">
                  <p className="odp_detail-main">
                    {orderDetails.orderDetails.deliveryDate}
                  </p>
                  <p className="odp_detail-sub">Due Date</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Measurements */}
        <div className="odp_section">
          <h3 className="odp_section-title">Measurements</h3>
          {orderDetails.measurements.length > 0 ? (
            <div className="odp_measurements-layout">
              {/* Group measurements into rows of 3 */}
              {Array.from(
                { length: Math.ceil(orderDetails.measurements.length / 3) },
                (_, rowIndex) => (
                  <div key={rowIndex} className="odp_measurements-row">
                    {orderDetails.measurements
                      .slice(rowIndex * 3, (rowIndex + 1) * 3)
                      .map((measurement) => (
                        <div
                          key={measurement.key}
                          className="odp_measurement-col"
                        >
                          <span className="odp_measurement-label">
                            {measurement.label}
                          </span>
                          <span className="odp_measurement-value">
                            {measurement.value}
                          </span>
                        </div>
                      ))}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="odp_no-measurements">
              <p>No measurements recorded for this order</p>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="odp_section">
          <h3 className="odp_section-title">Pricing</h3>
          <div className="odp_pricing-details">
            <div className="odp_pricing-row">
              <span className="odp_pricing-label">Base Price</span>
              <span className="odp_pricing-value">
                {formatCurrency(orderDetails.pricing.basePrice)}
              </span>
            </div>

            {/* Additional Items */}
            {orderDetails.pricing.additionalItemsList.length > 0 && (
              <>
                <div className="odp_additional-items-section">
                  <h4 className="odp_additional-items-title">
                    Additional Items
                  </h4>
                  {orderDetails.pricing.additionalItemsList.map(
                    (item, index) => (
                      <div key={index} className="odp_additional-item">
                        <span className="odp_additional-item-name">
                          {item.name}
                        </span>
                        <span className="odp_additional-item-price">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <div className="odp_pricing-row">
                  <span className="odp_pricing-label">
                    Additional Items Total
                  </span>
                  <span className="odp_pricing-value">
                    {formatCurrency(orderDetails.pricing.additionalItems)}
                  </span>
                </div>
              </>
            )}

            <div className="odp_pricing-row odp_total">
              <span className="odp_pricing-label">Total Amount</span>
              <span className="odp_pricing-value">
                {formatCurrency(orderDetails.pricing.totalAmount)}
              </span>
            </div>
            <div className="odp_pricing-row odp_deposit">
              <span className="odp_pricing-label">Deposit Paid</span>
              <span className="odp_pricing-value odp_deposit-amount">
                {formatCurrency(orderDetails.pricing.depositPaid)}
              </span>
            </div>
            <div className="odp_pricing-row odp_balance">
              <span className="odp_pricing-label">Balance Due</span>
              <span className="odp_pricing-value odp_balance-amount">
                {formatCurrency(orderDetails.pricing.balanceDue)}
              </span>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {orderDetails.orderDetails.customItems && orderDetails.orderDetails.customItems !== "No additional details" && (
          <div className="odp_section">
            <h3 className="odp_section-title">Special Instructions / Notes</h3>
            <p className="odp_notes-text">{orderDetails.orderDetails.customItems}</p>
          </div>
        )}

        {/* Actions */}
        <div className="odp_actions">
          <Button
            variant="secondary"
            size="large"
            onClick={handleContact}
            className="odp_contact-btn"
            icon={<Phone size={20} />}
          >
            Contact
          </Button>
          <Button
            variant="primary"
            size="large"
            onClick={handleUpdateTimeline}
            className="odp_update-btn"
          >
            Send Update
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPanel;
