import { useState } from "react";
import { Crown, Shield, Plus } from "lucide-react";
import Button from "../../../../components/button/Button";
import LoyaltyTab from "../../../../components/LoyaltyTab";
import FeedbackTab from "../../../../components/FeedbackTab";
import "./CRM.css";

const CRM = () => {
  const [activeTab, setActiveTab] = useState("Loyalty");

  // CRM data using JSON structure
  const crmData = {
    month: "December 2025",
    stats: [
      {
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="9"
              cy="7"
              r="4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7007C21.7033 16.0473 20.9944 15.5922 20.2 15.4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 18.0078 6.1138 17.6 7C18.0078 7.8862 18.7122 8.74608 18.1676 9.44769C17.623 10.1493 16.8604 10.6497 16 10.87"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        label: "Members",
        value: 5,
      },
      {
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="currentColor"
            />
          </svg>
        ),
        label: "Rating",
        value: 4.6,
      },
      {
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 3V21L9 18L15 21L21 18V6L15 9L9 6L3 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 6V18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 9V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        label: "Reviews",
        value: "12",
      },
    ],
  };

  const tabs = [
    { name: "Loyalty", icon: Crown },
    { name: "Feedback", icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Loyalty":
        return <LoyaltyTab />;
      case "Feedback":
        return <FeedbackTab />;
      default:
        return <LoyaltyTab />;
    }
  };

  return (
    <div className="crm-management">
      {/* Header */}
      <div className="crm-header">
        <h1 className="crm-title">Manage Your Customer Relationship</h1>
      </div>

      {/* Stats Section */}
      <div className="crm-stats-section">
        <div className="crm_ipo">
          <div className="crm_ipols">
            <h1>CRM</h1>
            <p>Manage customer relationships</p>
          </div>
          <Button
            variant="primary"
            size="large"
            icon={<Plus size={24} />}
            className="crm_ipolsbbb"
          />
        </div>
        <h2 className="stats-period">{crmData.month}</h2>
        <div className="crm-stats">
          {crmData.stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-content">
                <div className="stat-icon">{stat.icon}</div>
                <h3 className="stat-title">{stat.label}</h3>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="crm_jkj">
        {/* Tabs */}
        <div className="crm-tabs">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.name}
                className={`tab-btn ${activeTab === tab.name ? "active" : ""}`}
                onClick={() => setActiveTab(tab.name)}
              >
                <IconComponent size={16} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="crm-tab-content">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default CRM;
