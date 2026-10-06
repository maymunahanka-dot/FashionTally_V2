import { useState, useEffect, useContext } from "react";
import {
  Search, Filter, Plus, Calendar, Clock, MapPin,
  Mail, Bell, Video, Edit3, Trash2,
} from "lucide-react";
import NewAuthContext from "../../../../contexts/NewAuthContext";
import Button from "../../../../components/button/Button";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import ScheduleAppointmentPanel from "../../../../pannel_pages/ScheduleAppointmentPanel/ScheduleAppointmentPanel";
import AppointmentDetailsPanel from "../../../../pannel_pages/AppointmentDetailsPanel/AppointmentDetailsPanel";
import "./Appointments.css";
import Loading from "./../../../../components/Loading/Loading";

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const { user } = useContext(NewAuthContext);

  const fetchAppointments = async () => {
    if (!user?.email) { setLoading(false); setAppointments([]); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/appointment/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data.map((a) => ({
          ...a,
          id: a.id || a._id,
          title: a.purpose || a.appointmentType || "Appointment",
          client: a.clientName || "Unknown Client",
          description: a.notes || "",
          status: mapStatusFromDB(a.status),
          type: a.location === "Video Call" ? "video-call" : "in-person",
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        })).sort((a, b) => b.createdAt - a.createdAt));
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [user?.email]);

  // Map database status to UI status
  const mapStatusFromDB = (dbStatus) => {
    switch (dbStatus) {
      case "Scheduled":
        return "Confirmed";
      case "Completed":
        return "Completed";
      case "Cancelled":
        return "Cancelled";
      default:
        return "Pending";
    }
  };

  // Calculate stats from real data
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "Confirmed" && new Date(apt.date) >= new Date()
  ).length;
  const totalClients = new Set(appointments.map((apt) => apt.client)).size;
  const confirmedBookings = appointments.filter(
    (apt) => apt.status === "Confirmed"
  ).length;
  const completedThisMonth = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    const now = new Date();
    return (
      apt.status === "Completed" &&
      aptDate.getMonth() === now.getMonth() &&
      aptDate.getFullYear() === now.getFullYear()
    );
  }).length;

  // Filter appointments based on search and status — newest first
  const filteredAppointments = appointments
    .filter((appointment) => {
      const matchesSearch =
        appointment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        appointment.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setShowFilter(false);
  };

  const handleScheduleAppointment = (appointmentData) => {
    // Handle the appointment creation logic here
    console.log("New appointment:", appointmentData);
    // The actual saving is handled in ScheduleAppointmentPanel
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setEditMode(true);
    setShowDetailsPanel(false); // Close details panel if open
    setShowSchedulePanel(true);
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsPanel(true);
  };

  const handleDeleteAppointment = async (appointmentId, appointmentTitle) => {
    if (!user?.email) return;
    if (!window.confirm(`Are you sure you want to delete "${appointmentTitle}"?`)) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/appointment/delete/${appointmentId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) fetchAppointments();
      else alert("Failed to delete appointment. Please try again.");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment. Please try again.");
    }
  };

  const openSchedulePanel = () => {
    setEditMode(false);
    setEditingAppointment(null);
    setShowSchedulePanel(true);
  };

  const closeSchedulePanel = () => {
    setShowSchedulePanel(false);
    setEditMode(false);
    setEditingAppointment(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="app_appointments_calendar">
      {/* Header */}
      <div className="app_appointments_header">
        <h1 className="app_appointments_title">Your Appointment Calendar</h1>
      </div>

      {/* Search and Schedule Section */}
      <div className="app_appointments_controls">
        <div className="app_search_section">
          <div className="app_search_input_container">
            <Search className="app_search_icon" size={20} />
            <input
              type="text"
              placeholder="Search clients by name, phone, or email"
              className="app_search_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="app_filter_btn_inside"
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter size={20} />
            </button>
            {showFilter && (
              <div className="app_filter_dropdown">
                <div className="app_filter_section">
                  <h4 className="app_filter_section_title">Status</h4>
                  <button
                    className={`app_filter_option ${
                      filterStatus === "all" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("all")}
                  >
                    All Appointments
                  </button>
                  <button
                    className={`app_filter_option ${
                      filterStatus === "confirmed" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("confirmed")}
                  >
                    Confirmed
                  </button>
                  <button
                    className={`app_filter_option ${
                      filterStatus === "pending" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("pending")}
                  >
                    Pending
                  </button>
                  <button
                    className={`app_filter_option ${
                      filterStatus === "cancelled" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("cancelled")}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="primary"
          size="medium"
          icon={<Plus size={20} />}
          iconPosition="left"
          className="app_schedule_btn"
          onClick={openSchedulePanel}
        >
          <span className="app_schedule_text">Schedule</span>
        </Button>

        {/* Mobile Floating Button */}
        <Button
          variant="primary"
          size="large"
          icon={<Plus size={24} />}
          className="app_schedule_btn_mobile"
          onClick={openSchedulePanel}
        />
      </div>

      {/* Date and Update Info */}
      <div className="app_date_info_section">
        <div className="app_current_date">12/16/2025</div>
        <div className="app_update_info">Updated 20secs ago</div>
      </div>

      {/* Stats Cards */}
      <div className="app_appointments_stats">
        <div className="app_stat_card">
          <div className="app_stat_content">
            <h3 className="app_stat_title">Upcoming Appointments</h3>
            <p className="app_stat_value">{upcomingAppointments}</p>
            <p className="app_stat_change positive">+6% from last Week</p>
          </div>
        </div>

        <div className="app_stat_card">
          <div className="app_stat_content">
            <h3 className="app_stat_title">Total Clients</h3>
            <p className="app_stat_value">
              {totalClients} <span className="app_stat_unit">clients</span>
            </p>
            <p className="app_stat_change positive">+2 new this month</p>
          </div>
        </div>

        <div className="app_stat_card">
          <div className="app_stat_content">
            <h3 className="app_stat_title">Confirmed Bookings</h3>
            <p className="app_stat_value">{confirmedBookings}</p>
            <p className="app_stat_change positive">+8% from last Week</p>
          </div>
        </div>

        <div className="app_stat_card">
          <div className="app_stat_content">
            <h3 className="app_stat_title">Completed This Month</h3>
            <p className="app_stat_value">{completedThisMonth}</p>
            <p className="app_stat_change positive">+89% Attendance Rate</p>
          </div>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="app_appointments_grid">
        {loading ? (
          <Loading />
        ) : filteredAppointments.length === 0 ? (
          <div className="app_no_appointments">
            <Calendar size={48} />
            <h3>No appointments found</h3>
            <p>
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Schedule your first appointment to get started"}
            </p>
            <Button
              variant="primary"
              size="medium"
              icon={<Plus size={16} />}
              onClick={openSchedulePanel}
            >
              Schedule Appointment
            </Button>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="app_appointment_card"
              onClick={() => handleViewAppointment(appointment)}
              style={{ cursor: "pointer" }}
            >
              <div className="app_appointment_header">
                <div className="app_appointment_left_section">
                  <div className="app_appointment_icon">
                    <Calendar size={20} />
                  </div>
                  <div className="app_appointment_basic_info">
                    <h3 className="app_appointment_title">
                      {appointment.title}
                    </h3>
                    <p className="app_appointment_client">
                      👤 {appointment.client}
                    </p>
                  </div>
                </div>
                <div className="app_appointment_actions">
                  <button
                    className="app_action_btn app_edit_btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAppointment(appointment);
                    }}
                    title="Edit appointment"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="app_action_btn app_delete_btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAppointment(
                        appointment.id,
                        appointment.title
                      );
                    }}
                    title="Delete appointment"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div
                    className={`app_status_badge ${appointment.status.toLowerCase()}`}
                  >
                    {appointment.status}
                  </div>
                </div>
              </div>

              <div className="app_appointment_details">
                <div className="app_detail_item">
                  <Clock className="app_detail_icon" size={16} />
                  <span>
                    {formatDate(appointment.date)} at {appointment.time}
                  </span>
                </div>
                <div className="app_detail_item">
                  {appointment.type === "video-call" ? (
                    <Video className="app_detail_icon" size={16} />
                  ) : (
                    <MapPin className="app_detail_icon" size={16} />
                  )}
                  <span>{appointment.location}</span>
                </div>
                {appointment.email && (
                  <div className="app_detail_item">
                    <Mail className="app_detail_icon" size={16} />
                    <span>{appointment.email}</span>
                  </div>
                )}
              </div>

              {appointment.description && (
                <div className="app_appointment_description">
                  {appointment.description}
                </div>
              )}

              <div className="app_appointment_footer">
                <div className="app_reminders">
                  <div className="app_reminder_item">
                    <Bell size={14} />
                    <span>24hr reminder</span>
                  </div>
                  <div className="app_reminder_item">
                    <Bell size={14} />
                    <span>1hr reminder</span>
                  </div>
                </div>
                <button className="app_duration_btn">
                  Duration: {appointment.duration}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Appointment Panel */}
      <SlideInMenu
        isShow={showSchedulePanel}
        onClose={closeSchedulePanel}
        position="rightt"
        width="500px"
      >
        <ScheduleAppointmentPanel
          onClose={closeSchedulePanel}
          onSubmit={handleScheduleAppointment}
          editingAppointment={editingAppointment}
          editMode={editMode}
          onSuccess={fetchAppointments}
        />
      </SlideInMenu>

      {/* Appointment Details Panel */}
      <SlideInMenu
        isShow={showDetailsPanel}
        onClose={() => setShowDetailsPanel(false)}
        position="rightt"
        width="500px"
      >
        <AppointmentDetailsPanel
          onClose={() => setShowDetailsPanel(false)}
          appointment={selectedAppointment}
          onEdit={handleEditAppointment}
        />
      </SlideInMenu>
    </div>
  );
};

export default Appointments;
