import { useState, useEffect, useContext } from "react";
import {
  Plus,
  FileText,
  Eye,
  Download,
  Share,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../backend/firebase.config";
import NewAuthContext from "../../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../../utils/teamUtils";
import "./ClientInvoice.css";

const ClientInvoice = ({ client, onCreateInvoice, onViewInvoice }) => {
  const { user } = useContext(NewAuthContext);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch invoices for this client
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!client?.email || !user?.email || !db) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Get effective email (main admin's email for team members)
        const effectiveEmail = getEffectiveUserEmail(user);

        // Query invoices by userEmail only (no composite index needed)
        const invoicesQuery = query(
          collection(db, "fashiontally_invoices"),
          where("userEmail", "==", effectiveEmail)
        );

        const snapshot = await getDocs(invoicesQuery);

        const allInvoices = snapshot.docs.map((doc) => {
          const data = doc.data();

          // Helper to safely convert dates
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
            invoiceNumber: data.invoiceNumber,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            amount: data.amount || 0,
            status: data.status,
            createdDate: convertDate(data.createdDate),
            dueDate: convertDate(data.dueDate),
            items: data.items || [],
            createdAt: convertDate(data.createdAt),
            ...data,
          };
        });

        // Filter by client email in JavaScript
        const invoicesData = allInvoices
          .filter((invoice) => invoice.clientEmail === client.email)
          .sort((a, b) => b.createdAt - a.createdAt); // Sort by date descending

        console.log(
          `📄 Loaded ${invoicesData.length} invoices for client:`,
          client.email
        );
        setInvoices(invoicesData);
      } catch (error) {
        console.error("Error fetching client invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [client?.email, user?.email]);

  // Calculate summary
  const summary = {
    totalInvoiced: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    paid: invoices.filter((inv) => inv.status === "Paid").length,
    pending: invoices.filter((inv) => inv.status === "Unpaid").length,
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "";

    // Handle Firebase Timestamp
    if (date.toDate && typeof date.toDate === "function") {
      return date.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    // Handle Date object
    if (date instanceof Date) {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    // Handle string date
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    return "";
  };

  const handleCreateInvoice = () => {
    if (onCreateInvoice) {
      onCreateInvoice(client);
    }
  };

  const handleViewInvoice = (invoice) => {
    if (onViewInvoice) {
      onViewInvoice(invoice);
    }
  };

  if (loading) {
    return (
      <div className="invoice_u_details_invoice">
        <div className="invoice_u_loading">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="invoice_u_details_invoice">
      {/* Invoice Summary */}
      <div className="invoice_u_summary">
        <div className="invoice_u_summary_content">
          <div className="invoice_u_total">
            <span className="invoice_u_total_label">Total Invoiced</span>
            <span className="invoice_u_total_amount">
              {formatCurrency(summary.totalInvoiced)}
            </span>
          </div>
          <div className="invoice_u_stats">
            <div className="invoice_u_stat">
              <span className="invoice_u_stat_label">Paid:</span>
              <span className="invoice_u_stat_value">{summary.paid}</span>
            </div>
            <div className="invoice_u_stat">
              <span className="invoice_u_stat_label">Pending:</span>
              <span className="invoice_u_stat_value">{summary.pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Header */}
      <div className="invoice_u_header">
        <h3 className="invoice_u_count">{invoices.length} Invoices</h3>
        <button className="invoice_u_new_btn" onClick={handleCreateInvoice}>
          <Plus size={18} />
          New Invoice
        </button>
      </div>

      {/* Invoice List */}
      {invoices.length > 0 ? (
        <div className="invoice_u_list">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="invoice_u_item">
              <div className="invoice_u_main_content">
                <div className="invoice_u_icon">
                  <FileText size={24} />
                </div>

                <div className="invoice_u_details">
                  <div className="invoice_u_number_section">
                    <h4 className="invoice_u_number">
                      {invoice.invoiceNumber}
                    </h4>
                    <span className="invoice_u_amount">
                      {formatCurrency(invoice.amount)}
                    </span>
                  </div>
                  <div className="invoice_u_date_section">
                    <span className="invoice_u_date">
                      {formatDate(invoice.createdDate)}
                    </span>
                    <div
                      className={`invoice_u_status_badge ${invoice.status.toLowerCase()}`}
                    >
                      {invoice.status === "Overdue" && (
                        <AlertCircle size={14} />
                      )}
                      {invoice.status}
                    </div>
                  </div>
                </div>
              </div>

              <div className="invoice_u_actions">
                <button
                  className="invoice_u_action_btn view"
                  onClick={() => handleViewInvoice(invoice)}
                >
                  <Eye size={16} />
                  View
                </button>
                <button className="invoice_u_action_btn pdf">
                  <Download size={16} />
                  PDF
                </button>
                <button className="invoice_u_action_btn share">
                  <Share size={16} />
                  Share
                </button>
                <button className="invoice_u_action_btn check">
                  <Pencil size={16} />
                </button>
                <button className="invoice_u_action_btn delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="invoice_u_empty">
          <p>No invoices yet for this client</p>
        </div>
      )}
    </div>
  );
};

export default ClientInvoice;
