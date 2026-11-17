import { useState, useEffect, useContext } from "react";
import { Search, Filter, Plus, Eye, Download, Pencil, Trash2, FileText } from "lucide-react";
import NewAuthContext from "../../../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../../../utils/teamUtils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import Button from "../../../../components/button/Button";
import { MoneyAmount } from "../../../../components/MoneyAmount/MoneyAmount";
import SortByButton, { useSavedSort } from "../../../../components/SortByButton/SortByButton";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import CreateInvoicePanel from "../../../../pannel_pages/CreateInvoicePanel";
import InvoiceViewPanel from "../../../../pannel_pages/InvoiceViewPanel";
import Loading from "../../../../components/Loading/Loading";
import "./Invoice.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../../i18n";

import { tl } from "../../../../i18n";


/** Amount paid on an invoice (Naira). Older invoices marked Paid count as fully paid. */
const paidOf = (inv) => {
  const total = Number(inv?.amount ?? inv?.total) || 0;
  if (inv?.status === "Paid") return total;
  if (inv?.status === "Partially Paid") return Math.min(Number(inv?.amountPaid) || 0, total);
  return 0;
};
const balanceOf = (inv) => Math.max(0, (Number(inv?.amount ?? inv?.total) || 0) - paidOf(inv));

const toDate = (val) => {
  if (!val) return new Date();
  if (typeof val.toDate === "function") return val.toDate(); // live Firestore Timestamp
  if (val._seconds !== undefined) return new Date(val._seconds * 1000); // serialized Timestamp
  return new Date(val); // string or number
};

const Invoice = () => {
  const { t: tx } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useSavedSort("ft.sort.invoices");
  const [showSort, setShowSort] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showViewInvoice, setShowViewInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(null); // Track which invoice is downloading

  const { user } = useContext(NewAuthContext);

  const fetchInvoices = async () => {
    if (!user?.email) { setLoading(false); setInvoices([]); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/invoice/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data.map((inv) => ({
          ...inv,
          id: inv.id || inv._id,
          createdDate: toDate(inv.createdDate || inv.createdAt),
          dueDate: toDate(inv.dueDate),
          createdAt: toDate(inv.createdAt),
          updatedAt: toDate(inv.updatedAt),
        })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, [user?.email]);

  // Calculate stats from real data
  const stats = {
    total: invoices.length,
    paid: invoices.filter((invoice) => invoice.status === "Paid").length,
    pending: invoices.filter((invoice) => invoice.status === "Unpaid").length,
    overdue: invoices.filter(
      (invoice) =>
        invoice.status === "Unpaid" &&
        invoice.dueDate &&
        invoice.dueDate < new Date()
    ).length,
    totalAmount: invoices.reduce(
      (sum, invoice) => sum + (invoice.amount || 0),
      0
    ),
    paidAmount: invoices
      .filter((invoice) => invoice.status === "Paid")
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
  };

  const toggleCreateInvoice = () => {
    setSelectedInvoice(null);
    setIsEditMode(false);
    setShowCreateInvoice(!showCreateInvoice);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewInvoice(true);
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsEditMode(true);
    setShowCreateInvoice(true);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!user?.email) return;
    if (window.confirm(tx("auto.areYouSureYouWant_2d34"))) {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/invoice/delete/${invoiceId}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          fetchInvoices();
        } else {
          alert(tx("auto.failedToDeleteInvoicePlease_77a2"));
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert(tx("auto.failedToDeleteInvoicePlease_77a2"));
      }
    }
  };

  const handleCloseCreateInvoice = () => {
    setShowCreateInvoice(false);
    setSelectedInvoice(null);
    setIsEditMode(false);
  };

  // Sample invoice data based on the image

  // Filter invoices based on search and status
  const filteredInvoices = invoices
    .filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "paid" && invoice.status === "Paid") ||
        (filterStatus === "pending" && invoice.status === "Unpaid") ||
        (filterStatus === "overdue" &&
          invoice.status === "Unpaid" &&
          invoice.dueDate &&
          invoice.dueDate < new Date());

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
        const compared = (a.clientName || "").localeCompare(b.clientName || "", undefined, { sensitivity: "base" });
        return sortBy === "name-asc" ? compared : -compared;
      }
      if (sortBy === "amount") {
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      }
      const createdDiff = toTime(b.createdAt) - toTime(a.createdAt);
      return sortBy === "oldest" ? -createdDiff : createdDiff;
    });

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setShowFilter(false);
  };

  // PDF Component for rendering (matches InvoiceViewPanel design)
  const InvoicePDFComponent = ({ data, company }) => {
  const { t: tx } = useTranslation();
    const primaryColor = company.primaryColor || "#1f2937";

    return (
      <div
        style={{
          width: "1000px",
          fontSize: "14px",
          lineHeight: "1.6",
          color: "#333",
          backgroundColor: "white",
          padding: "48px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "48px",
          }}
        >
          <div style={{ flex: 1 }}>
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt="Company Logo"
                style={{ height: "80px", objectFit: "contain" }}
                crossOrigin="anonymous"
              />
            ) : (
              <div
                style={{
                  height: "80px",
                  width: "80px",
                  backgroundColor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#9ca3af",
                  borderRadius: "8px",
                }}
              >
                {tl(company.businessName?.charAt(0) || "FT")}
              </div>
            )}
          </div>

          <div style={{ textAlign: "right" }}>
            <h1
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                marginBottom: "8px",
                margin: 0,
              }}
            >
              {tx("auto.invoice_fe1a")}
            </h1>
            <p style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
              #{tl(data.invoiceNumber)}
            </p>
          </div>
        </div>

        {/* Balance Due */}
        <div style={{ marginBottom: "32px", textAlign: "right" }}>
          <p
            style={{
              color: "#666",
              fontSize: "14px",
              marginBottom: "4px",
              margin: "0 0 4px 0",
            }}
          >
            {tx("auto.balanceDue_5a6b")}
          </p>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
            ₦{balanceOf(data).toLocaleString()}
          </p>
        </div>

        {/* Company Details */}
        <div style={{ marginBottom: "48px" }}>
          <h3
            style={{
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: "12px",
              margin: "0 0 12px 0",
            }}
          >
            {tl(company.businessName)}
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#333",
              marginBottom: "4px",
              margin: "0 0 4px 0",
            }}
          >
            {tl(company.address)}
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "#333",
              marginBottom: "4px",
              margin: "0 0 4px 0",
            }}
          >
            {tl(company.phone)}
          </p>
          <p style={{ fontSize: "14px", color: "#333", margin: 0 }}>
            {tl(company.email)}
          </p>
        </div>

        {/* Bill To & Dates */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            marginBottom: "48px",
          }}
        >
          <div>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                marginBottom: "8px",
                margin: "0 0 8px 0",
              }}
            >
              {tx("auto.billTo_c0ac")}
            </p>
            <p style={{ fontWeight: 600, margin: "0 0 4px 0" }}>
              {tl(data.clientName)}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "0 0 4px 0",
              }}
            >
              {tl(data.clientPhone)}
            </p>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
              {tl(data.clientEmail)}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span style={{ color: "#666" }}>{tx("auto.invoiceDate_a437")}</span>
              <span style={{ fontWeight: 600 }}>
                {tl(data.createdDate?.toLocaleDateString() || tx("auto.nA_08d2"))}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span style={{ color: "#666" }}>{tx("auto.paymentMethod_a1e6")}</span>
              <span style={{ fontWeight: 600 }}>{tl(data.paymentMethod)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#666" }}>{tx("auto.dueDate_1740")}</span>
              <span style={{ fontWeight: 600 }}>
                {tl(data.dueDate?.toLocaleDateString() || tx("auto.nA_08d2"))}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table
          style={{
            width: "100%",
            marginBottom: "32px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: primaryColor, color: "white" }}>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                #
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                {tx("auto.itemDescription_5c21")}
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {tx("auto.qty_1e5f")}
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                {tx("auto.rate_3a9c")}
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                {tx("auto.amount_43dc")}
              </th>
            </tr>
          </thead>

          <tbody>
            {data.items?.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "12px" }}>{index + 1}</td>
                <td style={{ padding: "12px" }}>
                  {tl(item.description || item.name)}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {tl(item.quantity)}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  ₦{item.price?.toLocaleString()}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  ₦{(item.quantity * item.price)?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            marginBottom: "48px",
          }}
        >
          <div style={{ display: "flex", gap: "64px", marginBottom: "12px" }}>
            <span style={{ fontWeight: 600, color: "#374151" }}>{tx("auto.subTotal_04a1")}</span>
            <span style={{ width: "160px", textAlign: "right" }}>
              ₦{data.subtotal?.toLocaleString()}
            </span>
          </div>

          {data.discountAmount > 0 && (
            <div style={{ display: "flex", gap: "64px", marginBottom: "12px" }}>
              <span style={{ fontWeight: 600, color: "#374151" }}>
                {tx("auto.discount_a89c")}{tl(data.discount)}%)
              </span>
              <span style={{ width: "160px", textAlign: "right" }}>
                -₦{data.discountAmount?.toLocaleString()}
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: "64px", marginBottom: "12px" }}>
            <span style={{ fontWeight: 600, color: "#374151" }}>
              {tx("auto.tax_9cb7")}{tl(data.taxRate)}%)
            </span>
            <span style={{ width: "160px", textAlign: "right" }}>
              ₦{data.taxAmount?.toLocaleString()}
            </span>
          </div>

          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "12px",
              display: "flex",
              gap: "64px",
            }}
          >
            <span>{tx("auto.total_b259")}</span>
            <span style={{ width: "160px", textAlign: "right" }}>
              ₦{data.amount?.toLocaleString()}
            </span>
          </div>

          {paidOf(data) > 0 && (
            <div style={{ display: "flex", gap: "64px", marginBottom: "12px" }}>
              <span style={{ fontWeight: 600, color: "#374151" }}>{tl("Amount Paid")}</span>
              <span style={{ width: "160px", textAlign: "right" }}>
                -₦{paidOf(data).toLocaleString()}
              </span>
            </div>
          )}

          <div
            style={{
              width: "100%",
              borderTop: "2px solid #d1d5db",
              borderBottom: "2px solid #d1d5db",
              padding: "12px 16px",
              display: "flex",
              gap: "64px",
              backgroundColor: "#f9fafb",
            }}
          >
            <span style={{ fontWeight: "bold" }}>{tx("auto.balanceDue_5a6b")}</span>
            <span
              style={{
                width: "160px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              ₦{balanceOf(data).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div style={{ marginBottom: "32px" }}>
            <h4
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                marginBottom: "12px",
                margin: "0 0 12px 0",
              }}
            >
              {tx("auto.notes_7044")}
            </h4>
            <p
              style={{
                fontSize: "14px",
                whiteSpace: "pre-line",
                color: "#374151",
                margin: 0,
              }}
            >
              {tl(data.notes)}
            </p>
          </div>
        )}

        {/* Payment Details */}
        <div style={{ paddingTop: "24px", borderTop: "1px solid #d1d5db" }}>
          <h4
            style={{
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: "12px",
              margin: "0 0 12px 0",
            }}
          >
            {tx("auto.paymentDetails_b857")}
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            <div>
              <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px 0" }}>{tx("auto.bankName_3126")}</p>
              <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{tl(company.bankName)}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px 0" }}>{tx("auto.accountNumber_0bd6")}</p>
              <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{tl(company.accountNumber)}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px 0" }}>{tx("auto.accountName_db3b")}</p>
              <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{tl(company.accountName)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleDownloadPDF = async (invoice) => {
    setDownloadingPDF(invoice.id);

    try {
      const effectiveEmail = getEffectiveUserEmail(user);

      let companyData = {
        businessName: "------",
        address: "------",
        phone: "------",
        email: "------",
        logoUrl: "",
        primaryColor: "#1f2937",
        secondaryColor: "#666666",
        bankName: "------",
        accountNumber: "------",
        accountName: "------",
      };

      const brandRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/brand-setting/get-by-email/${encodeURIComponent(effectiveEmail)}`
      );
      const brandJson = await brandRes.json();
      if (brandJson.success && brandJson.data) {
        const data = brandJson.data;
        companyData = {
          businessName: data.businessName || "------",
          address: data.businessAddress || "------",
          phone: data.businessPhone || "------",
          email: data.businessEmail || "------",
          logoUrl: data.logoUrl || "",
          primaryColor: data.primaryColor || "#1f2937",
          secondaryColor: data.secondaryColor || "#666666",
          bankName: data.bankName || "------",
          accountNumber: data.accountNumber || "------",
          accountName: data.accountName || "------",
        };
      }

      const toPdfDate = (value) => {
        if (!value) return null;
        if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
        if (typeof value.toDate === "function") return value.toDate();
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
      };

      const pdfInvoice = {
        ...invoice,
        createdDate: toPdfDate(invoice.createdDate || invoice.createdAt),
        dueDate: toPdfDate(invoice.dueDate),
        amount: Number(invoice.amount) || 0,
        subtotal: Number(invoice.subtotal) || 0,
        taxAmount: Number(invoice.taxAmount) || 0,
        discountAmount: Number(invoice.discountAmount) || 0,
        amountPaid: Number(invoice.amountPaid) || 0,
        items: Array.isArray(invoice.items) ? invoice.items : [],
      };

      // Create temporary container off-screen
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "fixed";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      document.body.appendChild(tempContainer);

      let root;

      try {
        root = createRoot(tempContainer);

        root.render(
          <InvoicePDFComponent data={pdfInvoice} company={companyData} />
        );

        // Wait for component to render and all images to load
        await new Promise((resolve) => {
          // First wait for React to render
          setTimeout(() => {
            const invoiceElement = tempContainer.firstChild;
            
            if (!invoiceElement) {
              resolve();
              return;
            }

            // Find all images in the rendered component
            const images = invoiceElement.querySelectorAll('img');
            
            if (images.length === 0) {
              // No images, just wait a bit more for fonts and layout
              setTimeout(resolve, 500);
              return;
            }

            // Wait for all images to load
            let loadedImages = 0;
            const totalImages = images.length;
            
            const checkAllLoaded = () => {
              loadedImages++;
              if (loadedImages === totalImages) {
                // All images loaded, wait a bit more for final layout
                setTimeout(resolve, 300);
              }
            };

            images.forEach((img) => {
              if (img.complete) {
                // Image already loaded (cached)
                checkAllLoaded();
              } else {
                // Wait for image to load
                img.onload = checkAllLoaded;
                img.onerror = checkAllLoaded; // Continue even if image fails
              }
            });

            // Fallback timeout in case something goes wrong
            setTimeout(() => {
              resolve();
            }, 3000);
          }, 200); // Initial wait for React render
        });

        const invoiceElement = tempContainer.firstChild;

        if (!invoiceElement) {
          throw new Error("Invoice element not rendered");
        }

        const canvas = await html2canvas(invoiceElement, {
          scale: window.devicePixelRatio * 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          allowTaint: true,
        });

        const imgData = canvas.toDataURL("image/png");

        // Create PDF
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: "a4",
        });

        const imgProperties = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight =
          (imgProperties.height * pdfWidth) / imgProperties.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
      } finally {
        if (root) root.unmount();
        document.body.removeChild(tempContainer);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(tx("auto.failedToExportPdfPlease_0d6f"));
    } finally {
      setDownloadingPDF(null);
    }
  };

  // Show loading state
  if (loading) {
    return <Loading />;
  }

  // Show login message if user is not authenticated
  if (!user) {
    return (
      <div className="inv_invoice_management">
        <div className="inv_invoice_header">
          <h1 className="inv_invoice_title">{tx("auto.yourInvoiceManagement_ebf6")}</h1>
        </div>
        <div className="inv_no_invoices">
          <p>{tx("auto.pleaseLogInToView_011c")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inv_invoice_management">
      {/* Create Invoice Panel */}
      <SlideInMenu
        isShow={showCreateInvoice}
        onClose={handleCloseCreateInvoice}
        position="rightt"
        width="480px"
      >
        <CreateInvoicePanel
          isOpen={showCreateInvoice}
          onClose={handleCloseCreateInvoice}
          selectedInvoice={selectedInvoice}
          isEditMode={isEditMode}
          onSuccess={fetchInvoices}
        />
      </SlideInMenu>

      {/* View Invoice Panel */}
      <SlideInMenu
        isShow={showViewInvoice}
        onClose={() => setShowViewInvoice(false)}
        position="rightt"
        width="600px"
      >
        <InvoiceViewPanel
          onClose={() => setShowViewInvoice(false)}
          invoice={selectedInvoice}
        />
      </SlideInMenu>

      {/* Header */}
      <div className="inv_invoice_header">
        <h1 className="inv_invoice_title">{tx("auto.yourInvoiceManagement_ebf6")}</h1>
      </div>

      {/* Stats Section */}
      <div className="inv_invoice_stats_section">
        <div className="inv_ipo">
          <div className="inv_ipols">
            <h1>{tx("auto.invoices_35f8")}</h1>
            <p>{tx("auto.manageYourInvoices_78c0")}</p>
          </div>
          <Button
            variant="primary"
            size="large"
            icon={<Plus size={24} />}
            onClick={toggleCreateInvoice}
            className="inv_ipolsbbb"
          />
        </div>
        <div className="inv_stats_header">
          <h2 className="inv_stats_period">{tx("auto.december2025_e5c6")}</h2>
        </div>
        <div className="inv_invoice_stats">
          <div className="inv_stat_card">
            <div className="inv_stat_content">
              <h3 className="inv_stat_title">{tx("auto.totalInvoices_af62")}</h3>
              <p className="inv_stat_value">{tl(stats.total)}</p>
              <p className="inv_stat_subtitle">
                <MoneyAmount amount={stats.totalAmount} />{" "}{tx("auto.totalValue_a6ea")}
              </p>
            </div>
          </div>
          <div className="inv_stat_card">
            <div className="inv_stat_content">
              <h3 className="inv_stat_title">{tx("auto.paidInvoices_3e3d")}</h3>
              <p className="inv_stat_value">{tl(stats.paid)}</p>
              <p className="inv_stat_subtitle">
                <MoneyAmount amount={stats.paidAmount} />{" "}{tx("auto.collected_e5ee")}
              </p>
            </div>
          </div>
          <div className="inv_stat_card">
            <div className="inv_stat_content">
              <h3 className="inv_stat_title">{tx("auto.pendingInvoices_87ee")}</h3>
              <p className="inv_stat_value">{tl(stats.pending)}</p>
            </div>
          </div>
          <div className="inv_stat_card">
            <div className="inv_stat_content">
              <h3 className="inv_stat_title">{tx("auto.overdueInvoices_739b")}</h3>
              <p className="inv_stat_value">{tl(stats.overdue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="inv_jkj">
        {/* Search and Create Invoice Section */}
        <div className="inv_invoice_controls">
          <div className="search-sort-row">
          <div className="inv_search_section">
            <div className="inv_search_input_container">
              <Search className="inv_search_icon" size={20} />
              <input
                type="text"
                placeholder={tx("auto.searchClientsByNamePhone_9984")}
                className="inv_search_input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="inv_filter_btn_inside"
                onClick={() => {
                  setShowFilter(!showFilter);
                  setShowSort(false);
                }}
              >
                <Filter size={20} />
              </button>
              {showFilter && (
                <div className="inv_filter_dropdown">
                  <div className="inv_filter_section">
                    <h4 className="inv_filter_section_title">{tx("auto.status_bae7")}</h4>
                    <button
                      className={`inv_filter_option ${
                        filterStatus === "all" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("all")}
                    >
                      {tx("auto.allInvoices_9d7e")}
                    </button>
                    <button
                      className={`inv_filter_option ${
                        filterStatus === "paid" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("paid")}
                    >
                      {tx("auto.paid_dc9d")}
                    </button>
                    <button
                      className={`inv_filter_option ${
                        filterStatus === "pending" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("pending")}
                    >
                      {tx("auto.pending_96f6")}
                    </button>
                    <button
                      className={`inv_filter_option ${
                        filterStatus === "overdue" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("overdue")}
                    >
                      {tx("auto.overdue_0721")}
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
              { value: "amount", label: "Amount" },
            ]}
          />
          </div>

          <button
            className="inv_create_invoice_btn"
            onClick={toggleCreateInvoice}
          >
            <Plus size={20} />
            {tx("auto.createInvoice_3281")}
          </button>
        </div>

        {/* Invoices Grid */}
        <div className="inv_invoices_grid">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="inv_invoice_card">
              <div className="inv_invoice_header_section">
                <div className="inv_invoice_left_section">
                  <div className="inv_invoice_icon">
                    <FileText size={20} />
                  </div>
                  <div className="inv_invoice_basic_info">
                    <h3 className="inv_invoice_id">{tl(invoice.invoiceNumber)}</h3>
                    <p className="inv_invoice_date">
                      {tl(invoice.createdDate?.toLocaleDateString?.() ?? "")}
                    </p>
                    <p className="inv_invoice_client">{tl(invoice.clientName)}</p>
                  </div>
                </div>
                <div className="inv_invoice_right_section">
                  <div className="inv_invoice_amount">
                    <MoneyAmount amount={invoice.amount} align="end" />
                  </div>
                  <div
                    className={`inv_status_badge ${(invoice.status ?? "")
                      .toLowerCase()
                      .replace(" ", "")}`}
                  >
                    {tl(invoice.status ?? "")}
                  </div>
                </div>
              </div>

              <div className="inv_invoice_actions">
                <button
                  className="inv_action_btn inv_view_btn"
                  onClick={() => handleViewInvoice(invoice)}
                >
                  <Eye size={16} />
                  {tx("auto.view_69bd")}
                </button>
                <button
                  className="inv_action_btn inv_pdf_btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPDF(invoice);
                  }}
                  disabled={downloadingPDF === invoice.id}
                >
                  <Download size={16} />
                  {tl(downloadingPDF === invoice.id ? tx("auto.loading_b04b") : "PDF")}
                </button>

                <button
                  className="inv_action_btn inv_check_btn"
                  onClick={() => handleEditInvoice(invoice)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="inv_action_btn inv_delete_btn"
                  onClick={() => handleDeleteInvoice(invoice.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="inv_no_invoices">
            <p>{tx("auto.noInvoicesFoundMatchingYour_ae4d")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoice;
