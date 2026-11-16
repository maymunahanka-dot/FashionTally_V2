import { useState, useEffect, useContext } from "react";
import { X, Edit3, Phone, Mail, Calendar, Package, Trash2 } from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import NewAuthContext from "../../contexts/NewAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { MoneyAmount } from "../../components/MoneyAmount/MoneyAmount";
import "./OrderDetailsPanel.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

import { dateLocale } from "../../i18n";

const OrderDetailsPanel = ({ order, onClose, onEdit }) => {
  const { t: tx } = useTranslation();
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
      alert(tx("auto.failedToUpdateOrderStatus_7beb"));
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



  const handleDeleteOrder = async () => {
    if (!order?.id || !user?.email) return;

    const confirmDelete = window.confirm(
      tx("tpl.areYouSureYouWant_ce29", { v0: order.title || tx("auto.untitledOrder_d54a") })
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "fashiontally_designs", order.id));
      console.log("Order deleted successfully");
      onClose(); // Close the panel after successful deletion
    } catch (error) {
      console.error("Error deleting order:", error);
      alert(tx("auto.failedToDeleteOrderPlease_a19e"));
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
            <h2 className="odp_panel-title">{tx("auto.orderDetails_abb7")}</h2>
          </div>
        </div>
        <div className="odp_order-details-content">
          <div className="odp_loading">
            <p>{tx("auto.loadingOrderDetails_d7cd")}</p>
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
      item: order.title || "Untitled Order",
      fabric: order.fabric || order.originalData?.materials?.[0] || "Not specified",
      deliveryDate: order.dueDate
        ? (order.dueDate instanceof Date ? order.dueDate.toLocaleDateString(dateLocale()) : new Date(order.dueDate).toLocaleDateString(dateLocale()))
        : "Not set",
      customItems: order.specialInstructions || order.originalData?.description || "No additional details",
    },
    measurements: formatMeasurements(
      order.measurements || order.originalData?.measurements
    ),
    pricing: {
      basePrice:
        order.basePrice ||
        order.originalData?.basePrice ||
        order.price ||
        0,
      additionalItems: (
        order.additionalItems ||
        order.originalData?.additionalItems ||
        []
      ).reduce((sum, item) => sum + (Number(item.price) || 0), 0),
      totalAmount: order.price || order.originalData?.price || 0,
      depositPaid: order.depositPaid || order.deposit || order.originalData?.depositPaid || 0,
      balanceDue:
        order.balanceDue ||
        order.balance ||
        order.originalData?.balanceDue ||
        (order.price || 0) - (order.depositPaid || order.deposit || 0),
      additionalItemsList:
        order.additionalItems || order.originalData?.additionalItems || [],
    },
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
          <h2 className="odp_panel-title">{tx("auto.orderDetails_abb7")}</h2>
          <p className="odp_order-number">{tl(orderDetails.orderNumber)}</p>
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
          <h3 className="odp_section-title">{tx("auto.orderStatus_a15b")}</h3>
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
              <option value="pending">{tx("auto.pending_96f6")}</option>
              <option value="in-progress">{tx("auto.inProgress_f61e")}</option>
              <option value="completed">{tx("auto.completed_1798")}</option>
              <option value="cancelled">{tx("auto.cancelled_a1bf")}</option>
            </select>
            {updating && <span className="odp_updating-text">{tx("auto.updating_e349")}</span>}
          </div>
        </div>

        {/* Client Information */}
        <div className="odp_section">
          <h3 className="odp_section-title">{tx("auto.clientInformation_9b2e")}</h3>
          <div className="odp_client-info">
            <div className="odp_client-avatar">
              {tl(orderDetails.client.avatar)}
            </div>
            <div className="odp_client-details">
              <h4 className="odp_client-name">{tl(orderDetails.client.name)}</h4>
              <div className="odp_contact-info">
                <div className="odp_contact-item">
                  <Phone size={16} />
                  <span>{tl(orderDetails.client.phone)}</span>
                </div>
                <div className="odp_contact-item">
                  <Mail size={16} />
                  <span>{tl(orderDetails.client.email)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="odp_section">
          <h3 className="odp_section-title">{tx("auto.orderDetails_abb7")}</h3>
          <div className="odp_order-details-grid">
            <div className="odp_detail-column">
              <div className="odp_detail-item">
                <div className="odp_detail-header">
                  <Package size={20} className="odp_detail-icon" />
                  <span className="odp_detail-label">{tx("auto.item_ecdd")}</span>
                </div>
                <div className="odp_detail-content">
                  <p className="odp_detail-main">
                    {tl(orderDetails.orderDetails.item)}
                  </p>
                  <p className="odp_detail-sub">{tx("auto.customDress_2197")}</p>
                </div>
              </div>
            </div>

            <div className="odp_detail-column">
              <div className="odp_detail-item">
                <div className="odp_detail-header">
                  <Package size={20} className="odp_detail-icon" />
                  <span className="odp_detail-label">{tx("auto.fabric_a010")}</span>
                </div>
                <div className="odp_detail-content">
                  <p className="odp_detail-main">
                    {tl(orderDetails.orderDetails.fabric)}
                  </p>
                  <p className="odp_detail-sub">{tx("auto.material_d816")}</p>
                </div>
              </div>
            </div>

            <div className="odp_detail-column">
              <div className="odp_detail-item">
                <div className="odp_detail-header">
                  <Calendar size={20} className="odp_detail-icon" />
                  <span className="odp_detail-label">{tx("auto.deliveryDate_7e86")}</span>
                </div>
                <div className="odp_detail-content">
                  <p className="odp_detail-main">
                    {tl(orderDetails.orderDetails.deliveryDate)}
                  </p>
                  <p className="odp_detail-sub">{tx("auto.dueDate_a1b3")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Measurements */}
        <div className="odp_section">
          <h3 className="odp_section-title">{tx("auto.measurements_737b")}</h3>
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
                            {tl(measurement.label)}
                          </span>
                          <span className="odp_measurement-value">
                            {tl(measurement.value)}
                          </span>
                        </div>
                      ))}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="odp_no-measurements">
              <p>{tx("auto.noMeasurementsRecordedForThis_7e86")}</p>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="odp_section">
          <h3 className="odp_section-title">{tx("auto.pricing_a0d9")}</h3>
          <div className="odp_pricing-details">
            <div className="odp_pricing-row">
              <span className="odp_pricing-label">{tx("auto.basePrice_03e5")}</span>
              <span className="odp_pricing-value">
                <MoneyAmount amount={orderDetails.pricing.basePrice} align="end" />
              </span>
            </div>

            {/* Additional Items */}
            {orderDetails.pricing.additionalItemsList.length > 0 && (
              <>
                <div className="odp_additional-items-section">
                  <h4 className="odp_additional-items-title">
                    {tx("auto.additionalItems_407e")}
                  </h4>
                  {orderDetails.pricing.additionalItemsList.map(
                    (item, index) => (
                      <div key={index} className="odp_additional-item">
                        <span className="odp_additional-item-name">
                          {tl(item.name)}
                        </span>
                        <span className="odp_additional-item-price">
                          <MoneyAmount amount={item.price} align="end" />
                        </span>
                      </div>
                    )
                  )}
                </div>
                <div className="odp_pricing-row">
                  <span className="odp_pricing-label">
                    {tx("auto.additionalItemsTotal_d02f")}
                  </span>
                  <span className="odp_pricing-value">
                    <MoneyAmount amount={orderDetails.pricing.additionalItems} align="end" />
                  </span>
                </div>
              </>
            )}

            <div className="odp_pricing-row odp_total">
              <span className="odp_pricing-label">{tx("auto.totalAmount_490a")}</span>
              <span className="odp_pricing-value">
                <MoneyAmount amount={orderDetails.pricing.totalAmount} align="end" />
              </span>
            </div>
            <div className="odp_pricing-row odp_deposit">
              <span className="odp_pricing-label">{tx("auto.depositPaid_06f8")}</span>
              <span className="odp_pricing-value odp_deposit-amount">
                <MoneyAmount amount={orderDetails.pricing.depositPaid} align="end" />
              </span>
            </div>
            <div className="odp_pricing-row odp_balance">
              <span className="odp_pricing-label">{tx("auto.balanceDue_5a6b")}</span>
              <span className="odp_pricing-value odp_balance-amount">
                <MoneyAmount amount={orderDetails.pricing.balanceDue} align="end" />
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailsPanel;
