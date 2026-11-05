import {
  X,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Video,
  User,
  FileText,
  Edit3,
} from "lucide-react";
import "./AppointmentDetailsPanel.css";

const AppointmentDetailsPanel = ({ onClose, appointment, onEdit }) => {

  if (!appointment) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "status-confirmed";
      case "pending":
        return "status-pending";
      case "cancelled":
        return "status-cancelled";
      case "completed":
        return "status-completed";
      default:
        return "status-pending";
    }
  };

  return (
    <div className="apd_appointment_details_panel">
      {/* Header */}
      <div className="apd_panel_header">
        <h2 className="apd_panel_title">Appointment Details</h2>
        <div className="apd_header_actions">
          <button
            className="apd_edit_btn"
            onClick={() => onEdit && onEdit(appointment)}
            title="Edit appointment"
          >
            <Edit3 size={20} />
          </button>
          <button className="apd_close_btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="apd_panel_content">
        {/* Status Badge */}
        <div className="apd_status_section">
          <span
            className={`apd_status_badge ${getStatusColor(appointment.status)}`}
          >
            {appointment.status || "Pending"}
          </span>
        </div>

        {/* Title */}
        <div className="apd_title_section">
          <h3 className="apd_appointment_title">
            {appointment.title || appointment.purpose}
          </h3>
        </div>

        {/* Client Information */}
        <div className="apd_section">
          <h4 className="apd_section_title">Client Information</h4>
          <div className="apd_info_grid">
            <div className="apd_info_item">
              <User className="apd_info_icon" size={18} />
              <div className="apd_info_content">
                <span className="apd_info_label">Client Name</span>
                <span className="apd_info_value">
                  {appointment.client || "Unknown Client"}
                </span>
              </div>
            </div>

            {appointment.phone && (
              <div className="apd_info_item">
                <Phone className="apd_info_icon" size={18} />
                <div className="apd_info_content">
                  <span className="apd_info_label">Phone</span>
                  <span className="apd_info_value">{appointment.phone}</span>
                </div>
              </div>
            )}

            {appointment.email && (
              <div className="apd_info_item">
                <Mail className="apd_info_icon" size={18} />
                <div className="apd_info_content">
                  <span className="apd_info_label">Email</span>
                  <span className="apd_info_value">{appointment.email}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Details */}
        <div className="apd_section">
          <h4 className="apd_section_title">Appointment Details</h4>
          <div className="apd_info_grid">
            <div className="apd_info_item">
              <Calendar className="apd_info_icon" size={18} />
              <div className="apd_info_content">
                <span className="apd_info_label">Date</span>
                <span className="apd_info_value">
                  {formatDate(appointment.date)}
                </span>
              </div>
            </div>

            <div className="apd_info_item">
              <Clock className="apd_info_icon" size={18} />
              <div className="apd_info_content">
                <span className="apd_info_label">Time</span>
                <span className="apd_info_value">
                  {appointment.time || "Not specified"}
                </span>
              </div>
            </div>

            <div className="apd_info_item">
              <Clock className="apd_info_icon" size={18} />
              <div className="apd_info_content">
                <span className="apd_info_label">Duration</span>
                <span className="apd_info_value">
                  {appointment.duration || "1hr"}
                </span>
              </div>
            </div>

            <div className="apd_info_item">
              {appointment.type === "video-call" ? (
                <Video className="apd_info_icon" size={18} />
              ) : (
                <MapPin className="apd_info_icon" size={18} />
              )}
              <div className="apd_info_content">
                <span className="apd_info_label">Location</span>
                <span className="apd_info_value">
                  {appointment.location || "Shop"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Purpose/Type */}
        {appointment.purpose && (
          <div className="apd_section">
            <h4 className="apd_section_title">Purpose</h4>
            <div className="apd_purpose_badge">{appointment.purpose}</div>
          </div>
        )}

        {/* Notes/Description */}
        {(appointment.notes || appointment.description) && (
          <div className="apd_section">
            <h4 className="apd_section_title">
              <FileText size={18} />
              Notes
            </h4>
            <div className="apd_notes_content">
              {appointment.notes || appointment.description}
            </div>
          </div>
        )}

        {/* Created Date */}
        {appointment.createdAt && (
          <div className="apd_section">
            <div className="apd_meta_info">
              <span className="apd_meta_label">Created:</span>
              <span className="apd_meta_value">
                {appointment.createdAt.toLocaleDateString()} at{" "}
                {appointment.createdAt.toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailsPanel;
