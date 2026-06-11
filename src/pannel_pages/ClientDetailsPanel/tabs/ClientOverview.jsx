import { useState, useEffect, useContext } from "react";
import { FileText, Package, Edit3 } from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../backend/firebase.config";
import NewAuthContext from "../../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../../utils/teamUtils";
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

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      if (!client?.id || !user?.email) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Get effective email (main admin's email for team members)
        const effectiveEmail = getEffectiveUserEmail(user);

        // Fetch orders
        const ordersQuery = query(
          collection(db, "fashiontally_designs"),
          where("userEmail", "==", effectiveEmail)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const allOrders = ordersSnapshot.docs.map((doc) => {
          const data = doc.data();
          const convertDate = (dateField) => {
            if (!dateField) return new Date();
            if (dateField.toDate && typeof dateField.toDate === "function") {
              return dateField.toDate();
            }
            if (dateField instanceof Date) {
              return dateField;
            }
            return new Date(dateField);
          };

          return {
            id: doc.id,
            name: data.name || "Untitled Order",
            price: data.price || 0,
            status:
              data.status === "Active"
                ? "In Progress"
                : data.status === "Archived"
                ? "Completed"
                : "Pending",
            createdAt: convertDate(data.createdAt),
            clientId: data.clientId,
          };
        });

        // Filter orders for this client — include type === "order" and legacy no-type records
        const clientOrders = allOrders.filter(
          (order) => order.clientId === client.id &&
          (!order.type || order.type === "order")
        );
        setTotalOrders(clientOrders.length);

        // Get recent 3 orders sorted by date
        const recentOrders = clientOrders
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 3)
          .map((order) => ({
            id: order.id,
            title: order.name,
            date: order.createdAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            amount: `₦${order.price.toLocaleString()}`,
            status: order.status,
          }));
        setRecentActivity(recentOrders);

        // Fetch invoices
        const invoicesQuery = query(
          collection(db, "fashiontally_invoices"),
          where("userEmail", "==", effectiveEmail)
        );
        const invoicesSnapshot = await getDocs(invoicesQuery);
        const allInvoices = invoicesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            clientEmail: data.clientEmail,
            amount: data.amount || 0,
          };
        });

        // Filter invoices for this client and calculate total
        const clientInvoices = allInvoices.filter(
          (invoice) => invoice.clientEmail === client.email
        );
        setInvoiceCount(clientInvoices.length);

        const total = clientInvoices.reduce(
          (sum, invoice) => sum + invoice.amount,
          0
        );
        setTotalSpent(total);
      } catch (error) {
        console.error("Error fetching client overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [client?.id, client?.email, user?.email]);

  // Update notes from client prop
  useEffect(() => {
    setClientNotes(client?.notes || "");
  }, [client?.notes]);

  const handleEditNotes = () => {
    setShowEditNotesModal(true);
  };

  const handleSaveNotes = async (newNote) => {
    try {
      // Update notes in Firebase
      const clientRef = doc(db, "fashiontally_clients", client.id);
      await updateDoc(clientRef, {
        notes: newNote,
        updatedAt: new Date(),
      });

      setClientNotes(newNote);
      console.log("Notes updated successfully");
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const handleCloseNotesModal = () => {
    setShowEditNotesModal(false);
  };

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
