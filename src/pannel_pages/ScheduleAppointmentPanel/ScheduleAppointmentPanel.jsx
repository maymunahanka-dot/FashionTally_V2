import { useState, useContext } from "react";
import { X, Calendar, ExternalLink } from "lucide-react";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import NewAuthContext from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import Button from "../../components/button/Button";
import Input from "../../components/Input/Input";
import { useTheme } from "../../contexts/ThemeContext";
import "./ScheduleAppointmentPanel.css";

const ScheduleAppointmentPanel = ({
  onClose,
  onSubmit,
  editingAppointment,
  editMode,
}) => {
  const { isDark } = useTheme();
  const { user } = useContext(NewAuthContext);
  const [loading, setLoading] = useState(false);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [savedAppointmentData, setSavedAppointmentData] = useState(null);

  const [formData, setFormData] = useState({
    appointmentTitle: editingAppointment?.title || "",
    clientName: editingAppointment?.client || "",
    date: editingAppointment?.date || "",
    time: editingAppointment?.time || "10:30 AM",
    duration: editingAppointment?.duration || "1hr",
    appointmentType: editingAppointment?.purpose || "Design Review",
    location: editingAppointment?.location || "Shop",
    phone: editingAppointment?.phone || "",
    email: editingAppointment?.email || "",
    notes: editingAppointment?.notes || "",
    automaticReminders: true,
  });

  const timeOptions = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
  ];

  const durationOptions = ["30min", "1hr", "1.5hr", "2hr", "2.5hr", "3hr"];

  const appointmentTypeOptions = [
    "Design Review",
    "Fitting Session",
    "Design Consultation",
    "Measurement Session",
    "Final Fitting",
    "Delivery",
  ];

  const locationOptions = ["Shop", "Client Location", "Video Call"];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.email) {
      alert("User not authenticated");
      return;
    }

    if (!formData.appointmentTitle || !formData.date || !formData.time) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        clientName: formData.clientName || "Unknown Client",
        date: formData.date,
        time: formData.time,
        purpose: formData.appointmentType,
        duration: formData.duration,
        status: "Scheduled",
        notes: formData.notes,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        userEmail: getEffectiveUserEmail(user),
        updatedAt: new Date(),
      };

      if (editMode && editingAppointment?.id) {
        // Update existing appointment
        await updateDoc(
          doc(db, "fashiontally_appointments", editingAppointment.id),
          appointmentData
        );
        console.log("Appointment updated successfully");
      } else {
        // Create new appointment
        appointmentData.createdAt = new Date();
        await addDoc(
          collection(db, "fashiontally_appointments"),
          appointmentData
        );
        console.log("Appointment created successfully");
      }

      // Store appointment data for Google Calendar
      setSavedAppointmentData({
        ...appointmentData,
        appointmentTitle: formData.appointmentTitle,
      });

      // Show Google Calendar dialog
      setShowCalendarDialog(true);

      if (onSubmit) {
        onSubmit(appointmentData);
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Failed to save appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoogleCalendar = () => {
    if (savedAppointmentData) {
      // Convert time to 24-hour format for Google Calendar
      const convertTo24Hour = (time12h) => {
        const [time, modifier] = time12h.split(" ");
        let [hours, minutes] = time.split(":");
        if (hours === "12") {
          hours = "00";
        }
        if (modifier === "PM") {
          hours = parseInt(hours, 10) + 12;
        }
        return `${hours.padStart(2, "0")}:${minutes}`;
      };

      // Convert duration to minutes
      const getDurationInMinutes = (duration) => {
        if (duration.includes("30min")) return 30;
        if (duration.includes("1.5hr")) return 90;
        if (duration.includes("2.5hr")) return 150;
        if (duration.includes("2hr")) return 120;
        if (duration.includes("3hr")) return 180;
        return 60; // default 1hr
      };

      const startTime24 = convertTo24Hour(savedAppointmentData.time);
      const startDate = new Date(
        `${savedAppointmentData.date}T${startTime24}:00`
      );
      const durationMinutes = getDurationInMinutes(
        savedAppointmentData.duration
      );
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

      // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
      const formatDateForGoogle = (date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      };

      const googleCalendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
        `${
          savedAppointmentData.appointmentTitle || savedAppointmentData.purpose
        } - ${savedAppointmentData.clientName}`
      )}&dates=${formatDateForGoogle(startDate)}/${formatDateForGoogle(
        endDate
      )}&details=${encodeURIComponent(
        `Client: ${savedAppointmentData.clientName}\nPurpose: ${
          savedAppointmentData.purpose
        }\nDuration: ${savedAppointmentData.duration}\nPhone: ${
          savedAppointmentData.phone || "Not provided"
        }\nEmail: ${savedAppointmentData.email || "Not provided"}\nNotes: ${
          savedAppointmentData.notes || "No additional notes"
        }`
      )}&location=${encodeURIComponent(savedAppointmentData.location)}`;

      // Use location.href to avoid popup blocking on mobile
      window.location.href = googleCalendarUrl;
    }

    setShowCalendarDialog(false);
    setSavedAppointmentData(null);
    onClose();
  };

  const handleCancelCalendarUpdate = () => {
    setShowCalendarDialog(false);
    setSavedAppointmentData(null);
    onClose();
  };

  return (
    <div
      className={`schedule_appointment_panel ${
        isDark ? "dark-theme" : "light-theme"
      }`}
    >
      {/* Header */}
      <div className="schedule_panel_header">
        <button className="schedule_close_btn" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="schedule_panel_title">Add Schedule</h2>
      </div>

      {/* Form */}
      <form className="schedule_form" onSubmit={handleSubmit}>
        {/* Appointment Title */}
        <div className="schedule_form_group">
          <Input
            type="text"
            label="Appointment Title *"
            placeholder="e.g., Fitting Session, Design Consultation"
            value={formData.appointmentTitle}
            onChange={(e) =>
              handleInputChange("appointmentTitle", e.target.value)
            }
            required
            variant="rounded"
          />
        </div>

        {/* Client Name */}
        <div className="schedule_form_group">
          <Input
            type="text"
            label="Client Name"
            placeholder="Aisha Lawal"
            value={formData.clientName}
            onChange={(e) => handleInputChange("clientName", e.target.value)}
            variant="rounded"
          />
        </div>

        {/* Date and Time Row */}
        <div className="schedule_form_row">
          <div className="schedule_form_group">
            <Input
              type="date"
              label="Date *"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
              variant="rounded"
            />
          </div>

          <div className="schedule_form_group">
            <Input
              type="select"
              label="Time *"
              value={formData.time}
              onChange={(e) => handleInputChange("time", e.target.value)}
              options={timeOptions}
              required
              variant="rounded"
            />
          </div>
        </div>

        {/* Duration and Appointment Type Row */}
        <div className="schedule_form_row">
          <div className="schedule_form_group">
            <Input
              type="select"
              label="Duration"
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
              options={durationOptions}
              variant="rounded"
            />
          </div>

          <div className="schedule_form_group">
            <Input
              type="select"
              label="Appointment Type"
              value={formData.appointmentType}
              onChange={(e) =>
                handleInputChange("appointmentType", e.target.value)
              }
              options={appointmentTypeOptions}
              variant="rounded"
            />
          </div>
        </div>

        {/* Location */}
        <div className="schedule_form_group">
          <Input
            type="select"
            label="Location"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            options={locationOptions}
            variant="rounded"
          />
        </div>

        {/* Phone and Email Row */}
        <div className="schedule_form_row">
          <div className="schedule_form_group">
            <Input
              type="tel"
              label="Phone (Optional)"
              placeholder="+234 800 000 0000"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              variant="rounded"
            />
          </div>

          <div className="schedule_form_group">
            <Input
              type="email"
              label="Email (Optional)"
              placeholder="aisha.lawal@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              variant="rounded"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="schedule_form_group">
          <Input
            type="textarea"
            label="Notes (Optional)"
            placeholder="Add any additional details about this appointment..."
            rows={4}
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            variant="rounded"
          />
        </div>

        {/* Automatic Reminders */}
        <div className="schedule_reminder_section">
          <div className="schedule_reminder_header">
            <div className="schedule_reminder_indicator">
              <div className="schedule_reminder_dot"></div>
            </div>
            <div className="schedule_reminder_content">
              <h4 className="schedule_reminder_title">Automatic Reminders</h4>
              <p className="schedule_reminder_description">
                Reminders will be sent 24 hours and 1 hour before the
                appointment time via SMS and email (if provided)
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="schedule_form_actions">
          <Button
            type="submit"
            variant="primary"
            size="large"
            className="schedule_create_btn"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editMode
              ? "Update Appointment"
              : "Create Appointment"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="large"
            className="schedule_invoice_btn"
            onClick={() => {
              // Handle create invoice logic
              console.log("Create invoice clicked");
            }}
          >
            Create Invoice
          </Button>
        </div>
      </form>

      {/* Google Calendar Update Dialog */}
      {showCalendarDialog && (
        <div className="schedule_calendar_dialog_overlay">
          <div className="schedule_calendar_dialog">
            <div className="schedule_calendar_dialog_header">
              <div className="schedule_calendar_dialog_title">
                <Calendar size={20} />
                <h3>Update Google Calendar</h3>
              </div>
              <button
                className="schedule_calendar_close_btn"
                onClick={handleCancelCalendarUpdate}
              >
                <X size={16} />
              </button>
            </div>
            <div className="schedule_calendar_dialog_content">
              <p>
                Would you like to add this appointment to your Google Calendar?
                This will open Google Calendar in a new tab with the appointment
                details pre-filled.
              </p>
            </div>
            <div className="schedule_calendar_dialog_actions">
              <Button
                variant="secondary"
                size="medium"
                onClick={handleCancelCalendarUpdate}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="medium"
                onClick={handleUpdateGoogleCalendar}
                icon={<ExternalLink size={16} />}
                iconPosition="left"
              >
                Update Calendar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleAppointmentPanel;
