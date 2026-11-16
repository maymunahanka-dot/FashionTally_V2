import { useState, useEffect, useContext } from "react";
import { Plus, FileText, Eye, Download, Share, Pencil, Trash2, AlertCircle } from "lucide-react";
import NewAuthContext from "../../../contexts/NewAuthContext";
import "./ClientInvoice.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../i18n";

import { tl } from "../../../i18n";
import { dateLocale } from "../../../i18n";


const ClientInvoice = ({ client, onCreateInvoice, onViewInvoice }) => {
  const { t: tx } = useTranslation();
  const { user } = useContext(NewAuthContext);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!client?.email || !user?.email) { setLoading(false); return; }
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/invoice/list`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          const clientInvoices = data.data
            .filter((inv) => inv.clientEmail === client.email)
            .map((inv) => ({
              ...inv,
              createdDate: inv.createdDate ? new Date(inv.createdDate) : new Date(inv.createdAt),
              dueDate: inv.dueDate ? new Date(inv.dueDate) : null,
              createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
            }))
            .sort((a, b) => b.createdAt - a.createdAt);
          setInvoices(clientInvoices);
        }
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
      return date.toDate().toLocaleDateString(dateLocale("en-US"), {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    // Handle Date object
    if (date instanceof Date) {
      return date.toLocaleDateString(dateLocale("en-US"), {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    // Handle string date
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString(dateLocale("en-US"), {
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
        <div className="invoice_u_loading">{tx("auto.loadingInvoices_de14")}</div>
      </div>
    );
  }

  return (
    <div className="invoice_u_details_invoice">
      {/* Invoice Summary */}
      <div className="invoice_u_summary">
        <div className="invoice_u_summary_content">
          <div className="invoice_u_total">
            <span className="invoice_u_total_label">{tx("auto.totalInvoiced_7ee2")}</span>
            <span className="invoice_u_total_amount">
              {tl(formatCurrency(summary.totalInvoiced))}
            </span>
          </div>
          <div className="invoice_u_stats">
            <div className="invoice_u_stat">
              <span className="invoice_u_stat_label">{tx("auto.paid_06c5")}</span>
              <span className="invoice_u_stat_value">{tl(summary.paid)}</span>
            </div>
            <div className="invoice_u_stat">
              <span className="invoice_u_stat_label">{tx("auto.pending_cacc")}</span>
              <span className="invoice_u_stat_value">{tl(summary.pending)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Header */}
      <div className="invoice_u_header">
        <h3 className="invoice_u_count">{tl(invoices.length)}{" "}{tx("auto.invoices_35f8")}</h3>
        <button className="invoice_u_new_btn" onClick={handleCreateInvoice}>
          <Plus size={18} />
          {tx("auto.newInvoice_878b")}
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
                      {tl(invoice.invoiceNumber)}
                    </h4>
                    <span className="invoice_u_amount">
                      {tl(formatCurrency(invoice.amount))}
                    </span>
                  </div>
                  <div className="invoice_u_date_section">
                    <span className="invoice_u_date">
                      {tl(formatDate(invoice.createdDate))}
                    </span>
                    <div
                      className={`invoice_u_status_badge ${(invoice.status || 'unpaid').toLowerCase()}`}
                    >
                      {invoice.status === "Overdue" && (
                        <AlertCircle size={14} />
                      )}
                      {tl(invoice.status || tx("auto.unpaid_50cc"))}
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
                  {tx("auto.view_69bd")}
                </button>
                <button className="invoice_u_action_btn pdf">
                  <Download size={16} />
                  PDF
                </button>
                <button className="invoice_u_action_btn share">
                  <Share size={16} />
                  {tx("auto.share_09ca")}
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
          <p>{tx("auto.noInvoicesYetForThis_f96f")}</p>
        </div>
      )}
    </div>
  );
};

export default ClientInvoice;
