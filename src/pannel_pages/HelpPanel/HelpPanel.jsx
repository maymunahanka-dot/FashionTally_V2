import {
  ArrowLeft,
  MessageCircle,
  Phone,
  FileText,
  HelpCircle,
  Edit3,
  AlertTriangle,
  Users,
  Share2,
} from "lucide-react";
import Button from "../../components/button/Button";
import "./HelpPanel.css";

const HelpPanel = ({ onClose }) => {
  const supportOptions = [
    {
      id: "live-chat",
      title: "Live Chat",
      description: "Get help in real-time",
      icon: MessageCircle,
      action: "Start Chat",
      actionColor: "#16988d",
    },
    {
      id: "phone-support",
      title: "Phone Support",
      description: "Call us directly",
      icon: Phone,
      action: "Call Now",
      actionColor: "#16988d",
    },
    {
      id: "documentation",
      title: "Documentation",
      description: "Read our guides",
      icon: FileText,
      action: "View Docs",
      actionColor: "#16988d",
    },
    {
      id: "faqs",
      title: "FAQs",
      description: "Find answers quickly",
      icon: HelpCircle,
      action: "View FAQs",
      actionColor: "#16988d",
    },
  ];

  const feedbackOptions = [
    {
      id: "suggest-features",
      title: "Suggest Features",
      description: "Share your ideas",
      icon: Edit3,
      action: "Suggest",
      actionColor: "#16988d",
    },
    {
      id: "report-issues",
      title: "Report Issues",
      description: "Help us improve",
      icon: AlertTriangle,
      action: "Report",
      actionColor: "#16988d",
    },
  ];

  const communityOptions = [
    {
      id: "join-forums",
      title: "Join Forums",
      description: "Connect with others",
      icon: Users,
      action: "Join",
      actionColor: "#16988d",
    },
    {
      id: "share-ideas",
      title: "Share Ideas",
      description: "Contribute to discussions",
      icon: Share2,
      action: "Share",
      actionColor: "#16988d",
    },
  ];

  const handleAction = (optionId) => {
    switch (optionId) {
      case "live-chat":
        console.log("Starting live chat...");
        break;
      case "phone-support":
        console.log("Initiating phone call...");
        break;
      case "documentation":
        console.log("Opening documentation...");
        break;
      case "faqs":
        console.log("Opening FAQs...");
        break;
      case "suggest-features":
        console.log("Opening feature suggestion form...");
        break;
      case "report-issues":
        console.log("Opening issue report form...");
        break;
      case "join-forums":
        console.log("Redirecting to forums...");
        break;
      case "share-ideas":
        console.log("Opening idea sharing platform...");
        break;
      default:
        console.log("Action not implemented:", optionId);
    }
  };

  const HelpSection = ({ title, options }) => (
    <div className="help_section">
      <h3 className="help_section_title">{title}</h3>
      <div className="help_options">
        {options.map((option) => {
          const IconComponent = option.icon;
          return (
            <div key={option.id} className="help_option_item">
              <div className="help_option_content">
                <div className="help_option_icon">
                  <IconComponent size={20} />
                </div>
                <div className="help_option_info">
                  <h4 className="help_option_title">{option.title}</h4>
                  <p className="help_option_description">
                    {option.description}
                  </p>
                </div>
              </div>
              <Button
                variant="text"
                onClick={() => handleAction(option.id)}
                className="help_option_action"
                style={{ color: option.actionColor }}
              >
                {option.action}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="help_panel">
      {/* Header */}
      <div className="help_header">
        <button className="help_back_btn" onClick={onClose}>
          <ArrowLeft size={20} />
        </button>
        <div className="help_header_content">
          <h2 className="help_title">Help</h2>
          <p className="help_subtitle">Support & resources</p>
        </div>
      </div>

      {/* Content */}
      <div className="help_content">
        {/* Support Section */}
        <HelpSection title="Support" options={supportOptions} />

        {/* Feedback Section */}
        <HelpSection title="Feedback" options={feedbackOptions} />

        {/* Community Section */}
        <HelpSection title="Community" options={communityOptions} />
      </div>
    </div>
  );
};

export default HelpPanel;
