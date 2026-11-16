import { useState, useEffect, useContext } from "react";
import {
  Search, Filter, Plus, Calendar, Clock, MapPin,
  Mail, Video, Edit3, Trash2,
} from "lucide-react";
import NewAuthContext from "../../../../contexts/NewAuthContext";
import Button from "../../../../components/button/Button";
import SortByButton, { useSavedSort } from "../../../../components/SortByButton/SortByButton";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import ScheduleAppointmentPanel from "../../../../pannel_pages/ScheduleAppointmentPanel/ScheduleAppointmentPanel";
import BlockDaysPanel from "../../../../pannel_pages/BlockDaysPanel/BlockDaysPanel";
import AppointmentDetailsPanel from "../../../../pannel_pages/AppointmentDetailsPanel/AppointmentDetailsPanel";
import "./Appointments.css";
import Loading from "./../../../../components/Loading/Loading";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../../i18n";

import { tl } from "../../../../i18n";

import { dateLocale } from "../../../../i18n";


const Appointments = () => {
  const { t: tx } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useSavedSort("ft.sort.appointments");
  const [showSort, setShowSort] = useState(false);
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [showBlockDays, setShowBlockDays] = useState(false);
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
    .sort((a, b) => {
      const toTime = (value) => {
        if (!value) return 0;
        const date = value instanceof Date ? value : new Date(value);
        const time = date.getTime();
        return Number.isNaN(time) ? 0 : time;
      };
      if (sortBy === "name-asc" || sortBy === "name-desc") {
        const compared = (a.client || "").localeCompare(b.client || "", undefined, { sensitivity: "base" });
        return sortBy === "name-asc" ? compared : -compared;
      }
      if (sortBy === "date") {
        return toTime(b.date) - toTime(a.date);
      }
      const createdDiff = toTime(b.createdAt) - toTime(a.createdAt);
      return sortBy === "oldest" ? -createdDiff : createdDiff;
    });

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
    if (!window.confirm(tx("tpl.areYouSureYouWant_1beb", { v0: appointmentTitle }))) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/appointment/delete/${appointmentId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) fetchAppointments();
      else alert(tx("auto.failedToDeleteAppointmentPlease_d8b7"));
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert(tx("auto.failedToDeleteAppointmentPlease_d8b7"));
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
    return date.toLocaleDateString(dateLocale("en-US"), {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="app_appointments_calendar">
      {/* Header */}
      <div className="app_appointments_header">
        <h1 className="app_appointments_title">{tx("auto.yourAppointmentCalendar_5662")}</h1>
      </div>

      {/* Search and Schedule Section */}
      <div className="app_appointments_controls">
        <div className="search-sort-row">
        <div className="app_search_section">
          <div className="app_search_input_container">
            <Search className="app_search_icon" size={20} />
            <input
              type="text"
              placeholder={tx("auto.searchClientsByNamePhone_9984")}
              className="app_search_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="app_filter_btn_inside"
              onClick={() => {
                setShowFilter(!showFilter);
                setShowSort(false);
              }}
            >
              <Filter size={20} />
            </button>
            {showFilter && (
              <div className="app_filter_dropdown">
                <div className="app_filter_section">
                  <h4 className="app_filter_section_title">{tx("auto.status_bae7")}</h4>
                  <button
                    className={`app_filter_option ${
                      filterStatus === "all" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("all")}
                  >
                    {tx("auto.allAppointments_4c2a")}
                  </button>
                  <button
                    className={`app_filter_option ${
                      filterStatus === "confirmed" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("confirmed")}
                  >
                    {tx("auto.confirmed_8cc7")}
                  </button>
                  <button
                    className={`app_filter_option ${
                      filterStatus === "pending" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("pending")}
                  >
                    {tx("auto.pending_96f6")}
                  </button>
                  <button
                    className={`app_filter_option ${
                      filterStatus === "cancelled" ? "active" : ""
                    }`}
                    onClick={() => handleFilterSelect("cancelled")}
                  >
                    {tx("auto.cancelled_a1bf")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <SortByButton
          value={sortBy}
          onChange={setSortBy}
          open={showSort}
          onToggle={() => {
            setShowSort((open) => !open);
            setShowFilter(false);
          }}
          options={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "name-asc", label: "Client (A–Z)" },
            { value: "name-desc", label: "Client (Z–A)" },
            { value: "date", label: "Date" },
          ]}
        />
        </div>

        <Button
          variant="outline"
          size="medium"
          icon={<Calendar size={18} />}
          iconPosition="left"
          className="app_block_days_btn"
          onClick={() => setShowBlockDays(true)}
        >
          {tx("auto.blockDays_bf76")}
        </Button>
        <Button
          variant="primary"
          size="medium"
          icon={<Plus size={20} />}
          iconPosition="left"
          className="app_schedule_btn"
          onClick={openSchedulePanel}
        >
          <span className="app_schedule_text">{tx("auto.schedule_0a8a")}</span>
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
        <div className="app_update_info">{tx("auto.updated20secsAgo_2b7c")}</div>
      </div>

      {/* Stats Cards */}
      <div className="app_appointments_stats">
        <div className="app_stat_card">
          <div className="app_stat_content">
            <h3 className="app_stat_title">{tx("auto.upcomingAppointments_0ea2")}</h3>
            <p className="app_stat_value">{tl(upcomingAppointments)}</p>
            <p className="app_stat_change positive">{tx("auto.6FromLastWeek_6c2e")}</p>
          </div>
        </div>

        <div className="app_stat_card">
          <div className="app_stat_content">
            <h3 className="app_stat_title">{tx("auto.totalClients_68f9")}</h3>
            <p className="app_stat_value">
              {tl(totalClients)} <span className="app_stat_unit">{tx("auto.clients_93df")}</span>
            </p>
            <p className="app_stat_change positive">{tx("auto.2NewThisMonth_03aa")}</p>
          </div>
        </div>

        <div className="app_stat_card">
          <div className="app_stat_content">
            <h3 className="app_stat_title">{tx("auto.confirmedBookings_f305")}</h3>
            <p className="app_stat_value">{tl(confirmedBookings)}</p>
            <p className="app_stat_change positive">{tx("auto.8FromLastWeek_d495")}</p>
          </div>
        </div>

        <div className="app_stat_card">
          <div className="app_stat_content">
            <h3 className="app_stat_title">{tx("auto.completedThisMonth_b682")}</h3>
            <p className="app_stat_value">{tl(completedThisMonth)}</p>
            <p className="app_stat_change positive">{tx("auto.89AttendanceRate_6951")}</p>
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
            <h3>{tx("auto.noAppointmentsFound_1f7a")}</h3>
            <p>
              {tl(searchTerm || filterStatus !== "all"
                ? tx("auto.tryAdjustingYourSearchOr_e210")
                : tx("auto.scheduleYourFirstAppointmentTo_34c9"))}
            </p>
            <Button
              variant="primary"
              size="medium"
              icon={<Plus size={16} />}
              onClick={openSchedulePanel}
            >
              {tx("auto.scheduleAppointment_7a56")}
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
                <div className="app_appointment_basic_info">
                  <h3 className="app_appointment_title">{tl(appointment.title)}</h3>
                  <p className="app_appointment_client">{tl(appointment.client)}</p>
                </div>
                <div className="app_appointment_actions">
                  <div className={`app_status_badge ${appointment.status.toLowerCase()}`}>
                    {tl(appointment.status)}
                  </div>
                  <button
                    className="app_action_btn app_edit_btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAppointment(appointment);
                    }}
                    title={tx("auto.editAppointment_c029")}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="app_action_btn app_delete_btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAppointment(appointment.id, appointment.title);
                    }}
                    title={tx("auto.deleteAppointment_6def")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="app_appointment_meta">
                <span>
                  <Clock size={15} />
                  {tl(formatDate(appointment.date))} · {tl(appointment.time)}
                </span>
                <span>
                  {appointment.type === "video-call" ? <Video size={15} /> : <MapPin size={15} />}
                  {tl(appointment.location)}
                </span>
                <span>{tl(appointment.duration)}</span>
              </div>

              {appointment.email && (
                <div className="app_appointment_email">
                  <Mail size={15} />
                  <span>{tl(appointment.email)}</span>
                </div>
              )}

              {appointment.description && (
                <div className="app_appointment_description">
                  {tl(appointment.description)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <SlideInMenu
        isShow={showBlockDays}
        onClose={() => setShowBlockDays(false)}
        position="rightt"
        width="420px"
      >
        <BlockDaysPanel onClose={() => setShowBlockDays(false)} />
      </SlideInMenu>

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
