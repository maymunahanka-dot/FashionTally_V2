import { useState } from "react";
import { ArrowLeft, Mail, Phone, Package, Pencil } from "lucide-react";
import {
  ClientOverview,
  ClientMeasurements,
  ClientDesigns,
  ClientInvoice,
  ClientOrders,
} from "./tabs";
import "./ClientDetailsPanel.css";

const ClientDetailsPanel = ({
  client,
  onClose,
  onEditClient,
  onOpenAddDesign,
  onDesignClick,
  onCreateInvoice,
  onViewInvoice,
  onCreateOrder,
  onViewOrder,
}) => {
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = ["Overview", "Measurements", "Designs", "Invoice", "Orders"];

  if (!client) return null;

  const formatDate = (date) => {
    if (!date) return "No orders yet";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return <ClientOverview client={client} />;
      case "Measurements":
        return <ClientMeasurements client={client} />;
      case "Designs":
        return (
          <ClientDesigns
            client={client}
            onOpenAddDesign={onOpenAddDesign}
            onDesignClick={onDesignClick}
          />
        );
      case "Invoice":
        return (
          <ClientInvoice
            client={client}
            onCreateInvoice={onCreateInvoice}
            onViewInvoice={onViewInvoice}
          />
        );
      case "Orders":
        return (
          <ClientOrders
            client={client}
            onCreateOrder={onCreateOrder}
            onViewOrder={onViewOrder}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="client_details_panel_content">
      {/* Header */}
      <div className="client_details_header">
        <button className="client_details_back_btn" onClick={onClose}>
          <ArrowLeft size={20} />
        </button>
        <button
          className="client_details_edit_btn"
          onClick={() => onEditClient && onEditClient(client)}
          title="Edit Client"
        >
          <Pencil size={16} />
          Edit
        </button>
      </div>

      {/* Client Info Card */}
      <div className="client_details_info_card">
        <div className="client_details_avatar">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              client.name
            )}&background=16988d&color=fff&size=80`}
            alt={client.name}
            className="client_details_avatar_img"
          />
        </div>

        <div className="client_details_info">
          <div className="client_details_name_section">
            <h2 className="client_details_name">{client.name}</h2>
            <span
              className={`client_details_status_badge ${
                client.status === "Active" ? "active" : "inactive"
              }`}
            >
              {client.status}
            </span>
          </div>

          <div className="client_details_contact">
            <div className="client_details_contact_item">
              <Mail size={16} className="client_details_contact_icon" />
              <span className="client_details_contact_text">
                {client.email}
              </span>
            </div>
            <div className="client_details_contact_item">
              <Phone size={16} className="client_details_contact_icon" />
              <span className="client_details_contact_text">
                {client.phone}
              </span>
            </div>
            <div className="client_details_contact_item">
              <Package size={16} className="client_details_contact_icon" />
              <span className="client_details_contact_text">
                Last order: {formatDate(client.lastOrder)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="client_details_tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`client_details_tab ${
              activeTab === tab ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="client_details_content">{renderTabContent()}</div>
    </div>
  );
};

export default ClientDetailsPanel;
