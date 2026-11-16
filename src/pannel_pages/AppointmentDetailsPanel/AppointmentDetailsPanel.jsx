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

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";
import { dateLocale } from "../../i18n";


const AppointmentDetailsPanel = ({ onClose, appointment, onEdit }) => {
  const { t: tx } = useTranslation();

  if (!appointment) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString(dateLocale("en-US"), {
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
        <h2 className="apd_panel_title">{tx("auto.appointmentDetails_38e1")}</h2>
        <div className="apd_header_actions">
          <button
            className="apd_edit_btn"
            onClick={() => onEdit && onEdit(appointment)}
            title={tx("auto.editAppointment_c029")}
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
            {tl(appointment.status || tx("auto.pending_96f6"))}
          </span>
        </div>

        {/* Title */}
        <div className="apd_title_section">
          <h3 className="apd_appointment_title">
            {tl(appointment.title || appointment.purpose)}
          </h3>
        </div>

        {/* Client Information */}
        <div className="apd_section">
          <h4 className="apd_section_title">{tx("auto.clientInformation_9b2e")}</h4>
          <div className="apd_info_grid">
            <div className="apd_info_item">
              <User className="apd_info_icon" size={18} />
              <div className="apd_info_content">
                <span className="apd_info_label">{tx("auto.clientName_130c")}</span>
                <span className="apd_info_value">
                  {tl(appointment.client || tx("auto.unknownClient_a2b0"))}
                </span>
              </div>
            </div>

            {appointment.phone && (
              <div className="apd_info_item">
                <Phone className="apd_info_icon" size={18} />
                <div className="apd_info_content">
                  <span className="apd_info_label">{tx("auto.phone_7706")}</span>
                  <span className="apd_info_value">{tl(appointment.phone)}</span>
                </div>
              </div>
            )}

            {appointment.email && (
              <div className="apd_info_item">
                <Mail className="apd_info_icon" size={18} />
                <div className="apd_info_content">
                  <span className="apd_info_label">{tx("auto.email_84ad")}</span>
                  <span className="apd_info_value">{tl(appointment.email)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Details */}
        <div className="apd_section">
          <h4 className="apd_section_title">{tx("auto.appointmentDetails_38e1")}</h4>
          <div className="apd_info_grid">
            <div className="apd_info_item">
              <Calendar className="apd_info_icon" size={18} />
              <div className="apd_info_content">
                <span className="apd_info_label">{tx("auto.date_eb9a")}</span>
                <span className="apd_info_value">
                  {tl(formatDate(appointment.date))}
                </span>
              </div>
            </div>

            <div className="apd_info_item">
              <Clock className="apd_info_icon" size={18} />
              <div className="apd_info_content">
                <span className="apd_info_label">{tx("auto.time_6c82")}</span>
                <span className="apd_info_value">
                  {tl(appointment.time || tx("auto.notSpecified_60f1"))}
                </span>
              </div>
            </div>

            <div className="apd_info_item">
              <Clock className="apd_info_icon" size={18} />
              <div className="apd_info_content">
                <span className="apd_info_label">{tx("auto.duration_1370")}</span>
                <span className="apd_info_value">
                  {tl(appointment.duration || "1hr")}
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
                <span className="apd_info_label">{tx("auto.location_d219")}</span>
                <span className="apd_info_value">
                  {tl(appointment.location || tx("auto.shop_55de"))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Purpose/Type */}
        {appointment.purpose && (
          <div className="apd_section">
            <h4 className="apd_section_title">{tx("auto.purpose_a0fb")}</h4>
            <div className="apd_purpose_badge">{tl(appointment.purpose)}</div>
          </div>
        )}

        {/* Notes/Description */}
        {(appointment.notes || appointment.description) && (
          <div className="apd_section">
            <h4 className="apd_section_title">
              <FileText size={18} />
              {tx("auto.notes_7044")}
            </h4>
            <div className="apd_notes_content">
              {tl(appointment.notes || appointment.description)}
            </div>
          </div>
        )}

        {/* Created Date */}
        {appointment.createdAt && (
          <div className="apd_section">
            <div className="apd_meta_info">
              <span className="apd_meta_label">{tx("auto.created_0c78")}</span>
              <span className="apd_meta_value">
                {appointment.createdAt.toLocaleDateString(dateLocale())}{" "}{tx("auto.at_27e9")}{" "}
                {appointment.createdAt.toLocaleTimeString(dateLocale())}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailsPanel;
