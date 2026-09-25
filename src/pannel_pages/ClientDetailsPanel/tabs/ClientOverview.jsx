import { useState, useEffect, useContext } from "react";
import { FileText, Package, Edit3 } from "lucide-react";
import NewAuthContext from "../../../contexts/NewAuthContext";
import EditNotesModal from "../components/EditNotesModal";
import "./ClientOverview.css";

const ClientOverview = ({ client }) => {
  const { user } = useContext(NewAuthContext);
  const [showEditNotesModal, setShowEditNotesModal] = useState(false);
  const [clientNotes, setClientNotes] = useState(client?.notes || "");
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!client?.id || !user?.email) { setLoading(false); return; }
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const [ordersRes, invoicesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/list`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/invoice/list`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [ordersData, invoicesData] = await Promise.all([ordersRes.json(), invoicesRes.json()]);

        if (ordersData.success) {
          const clientOrders = ordersData.data
            .filter((o) => o.clientId === client.id)
            .map((o) => ({ ...o, createdAt: o.createdAt ? new Date(o.createdAt) : new Date() }))
            .sort((a, b) => b.createdAt - a.createdAt);
          setTotalOrders(clientOrders.length);
          setRecentActivity(clientOrders.slice(0, 3).map((o) => ({
            id: o.id,
            title: o.garmentDescription || o.garmentType || "Order",
            date: o.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
            amount: `₦${(o.price || 0).toLocaleString()}`,
            status: o.status === "in-progress" ? "In Progress" : o.status || "Pending",
          })));
        }

        if (invoicesData.success) {
          const clientInvoices = invoicesData.data.filter((inv) => inv.clientEmail === client.email);
          setInvoiceCount(clientInvoices.length);
          setTotalSpent(clientInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0));
        }
      } catch (error) {
        console.error("Error fetching client overview data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientData();
  }, [client?.id, client?.email, user?.email]);

  useEffect(() => { setClientNotes(client?.notes || ""); }, [client?.notes]);

  const handleSaveNotes = async (newNote) => {
    try {
      const token = localStorage.getItem("authToken");
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/client/edit/${client.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ notes: newNote }),
        }
      );
      setClientNotes(newNote);
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const handleEditNotes = () => { setShowEditNotesModal(true); };
  const handleCloseNotesModal = () => { setShowEditNotesModal(false); };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}k`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const clientOverviewData = {
    stats: [
      {
        label: "Total Orders",
        value: loading ? "..." : totalOrders.toString(),
      },
      {
        label: "Total Spent",
        value: loading ? "..." : formatCurrency(totalSpent),
      },
      { label: "Invoices", value: loading ? "..." : invoiceCount.toString() },
    ],
    notes: clientNotes,
    recentActivity: recentActivity,
  };

  return (
    <div className="client_details_overview">
      {/* Stats Cards */}
      <div className="client_overview_stats">
        {clientOverviewData.stats.map((stat, index) => (
          <div key={index} className="client_overview_stat_card">
            <div className="client_overview_stat_value">{stat.value}</div>
            <div className="client_overview_stat_label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Notes Section */}
      <div className="client_overview_section">
        <div className="client_overview_section_header">
          <div className="client_overview_section_title_group">
            <FileText size={20} className="client_overview_section_icon" />
            <h3 className="client_overview_section_title">Notes</h3>
          </div>
          <button
            className="client_overview_edit_notes_btn"
            onClick={handleEditNotes}
            title="Edit Notes"
            disabled={loading}
          >
            <Edit3 size={16} />
          </button>
        </div>
        {loading ? (
          <p className="client_overview_notes">Loading notes...</p>
        ) : (
          <p className="client_overview_notes">
            {clientOverviewData.notes ||
              "No notes added yet. Click the edit icon to add notes."}
          </p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="client_overview_section">
        <div className="client_overview_section_header">
          <h3 className="client_overview_section_title">Recent Activity</h3>
        </div>

        {loading ? (
          <div className="client_overview_activity_list">
            <p className="client_overview_empty">Loading activity...</p>
          </div>
        ) : clientOverviewData.recentActivity.length > 0 ? (
          <div className="client_overview_activity_list">
            {clientOverviewData.recentActivity.map((activity) => (
              <div key={activity.id} className="client_overview_activity_item">
                <div className="client_overview_activity_icon">
                  <Package size={20} />
                </div>
                <div className="client_overview_activity_details">
                  <h4 className="client_overview_activity_title">
                    {activity.title}
                  </h4>
                  <p className="client_overview_activity_date">
                    {activity.date}
                  </p>
                </div>
                <div className="client_overview_activity_right">
                  <div className="client_overview_activity_amount">
                    {activity.amount}
                  </div>
                  <div
                    className={`client_overview_activity_status ${activity.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {activity.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="client_overview_activity_list">
            <p className="client_overview_empty">No recent orders</p>
          </div>
        )}
      </div>

      {/* Edit Notes Modal */}
      <EditNotesModal
        isOpen={showEditNotesModal}
        onClose={handleCloseNotesModal}
        onSave={handleSaveNotes}
        currentNote={clientNotes}
      />
    </div>
  );
};

export default ClientOverview;
