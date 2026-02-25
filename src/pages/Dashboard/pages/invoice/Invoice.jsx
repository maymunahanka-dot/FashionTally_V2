import { useState, useEffect, useContext } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  Share2,
  Check,
  Trash2,
  FileText,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../../backend/firebase.config";
import NewAuthContext from "../../../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../../../utils/teamUtils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import Button from "../../../../components/button/Button";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import CreateInvoicePanel from "../../../../pannel_pages/CreateInvoicePanel";
import InvoiceViewPanel from "../../../../pannel_pages/InvoiceViewPanel";
import Loading from "../../../../components/Loading/Loading";
import "./Invoice.css";

const Invoice = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showViewInvoice, setShowViewInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(null); // Track which invoice is downloading

  const { user } = useContext(NewAuthContext);

  // Fetch invoices from Firebase with real-time updates
  useEffect(() => {
    if (!db || !user?.email) {
      setLoading(false);
      setInvoices([]);
      return;
    }

    setLoading(true);

    // Get effective email (main admin's email for team members)
    const effectiveEmail = getEffectiveUserEmail(user);

    // Set up the query to filter by effective user's email
    const invoicesQuery = query(
      collection(db, "fashiontally_invoices"),
      where("userEmail", "==", effectiveEmail),
      orderBy("createdAt", "desc")
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      invoicesQuery,
      (snapshot) => {
        const invoicesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            invoiceNumber: data.invoiceNumber,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            clientPhone: data.clientPhone,
            amount: data.amount,
            subtotal: data.subtotal,
            discountAmount: data.discountAmount || 0,
            taxAmount: data.taxAmount || 0,
            status: data.status,
            paymentMethod: data.paymentMethod,
            createdDate: data.createdDate?.toDate
              ? data.createdDate.toDate()
              : data.createdDate
              ? new Date(data.createdDate)
              : new Date(),
            dueDate: data.dueDate?.toDate
              ? data.dueDate.toDate()
              : data.dueDate
              ? new Date(data.dueDate)
              : new Date(),
            items: data.items || [],
            notes: data.notes || "",
            discount: data.discount || 0,
            taxRate: data.taxRate || 7.5,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate()
              : data.createdAt
              ? new Date(data.createdAt)
              : new Date(),
            updatedAt: data.updatedAt?.toDate
              ? data.updatedAt.toDate()
              : data.updatedAt
              ? new Date(data.updatedAt)
              : new Date(),
          };
        });

        setInvoices(invoicesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching invoices:", error);
        setLoading(false);
      }
    );

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [user?.email]);

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
    if (!db || !user?.email) {
      console.error("Database not available or user not authenticated");
      return;
    }

    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteDoc(doc(db, "fashiontally_invoices", invoiceId));
        console.log("Invoice deleted successfully");
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Failed to delete invoice. Please try again.");
      }
    }
  };

  const handleCloseCreateInvoice = () => {
    setShowCreateInvoice(false);
    setSelectedInvoice(null);
    setIsEditMode(false);
  };

  // Sample invoice data based on the image
  const invoiceData = {
    month: "December 2025",
    stats: [
      { label: "Total Invoices", value: 48, subtitle: "+10% from last month" },
      { label: "Paid Invoices", value: 35 },
      { label: "Pending Invoices", value: 8 },
      { label: "Overdue Invoices", value: 5 },
    ],
    invoices: [
      {
        id: "FT-2025-032",
        date: "Nov 28, 2025",
        amount: 120000,
        status: "Overdue",
        icon: "📄",
      },
      {
        id: "FT-2025-032",
        date: "Nov 28, 2025",
        amount: 120000,
        status: "Overdue",
        icon: "📄",
      },
      {
        id: "FT-2025-048",
        date: "Dec 10, 2025",
        amount: 85000,
        status: "Paid",
        icon: "📄",
      },
      {
        id: "FT-2025-048",
        date: "Dec 10, 2025",
        amount: 85000,
        status: "Paid",
        icon: "📄",
      },
      {
        id: "FT-2025-032",
        date: "Nov 28, 2025",
        amount: 120000,
        status: "Overdue",
        icon: "📄",
      },
      {
        id: "FT-2025-032",
        date: "Nov 28, 2025",
        amount: 120000,
        status: "Overdue",
        icon: "📄",
      },
      {
        id: "FT-2025-032",
        date: "Nov 28, 2025",
        amount: 120000,
        status: "Overdue",
        icon: "📄",
      },
      {
        id: "FT-2025-032",
        date: "Nov 28, 2025",
        amount: 120000,
        status: "Overdue",
        icon: "📄",
      },
    ],
  };

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter((invoice) => {
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
  });

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setShowFilter(false);
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  // PDF Component for rendering (matches InvoiceViewPanel design)
  const InvoicePDFComponent = ({ data, company }) => {
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
                {company.businessName?.charAt(0) || "FT"}
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
              INVOICE
            </h1>
            <p style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
              #{data.invoiceNumber}
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
            Balance Due
          </p>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
            ₦{data.amount?.toLocaleString()}
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
            {company.businessName}
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#333",
              marginBottom: "4px",
              margin: "0 0 4px 0",
            }}
          >
            {company.address}
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "#333",
              marginBottom: "4px",
              margin: "0 0 4px 0",
            }}
          >
            {company.phone}
          </p>
          <p style={{ fontSize: "14px", color: "#333", margin: 0 }}>
            {company.email}
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
              Bill To
            </p>
            <p style={{ fontWeight: 600, margin: "0 0 4px 0" }}>
              {data.clientName}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "0 0 4px 0",
              }}
            >
              {data.clientPhone}
            </p>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
              {data.clientEmail}
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
              <span style={{ color: "#666" }}>Invoice Date :</span>
              <span style={{ fontWeight: 600 }}>
                {data.createdDate?.toLocaleDateString() || "N/A"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span style={{ color: "#666" }}>Payment Method :</span>
              <span style={{ fontWeight: 600 }}>{data.paymentMethod}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#666" }}>Due Date :</span>
              <span style={{ fontWeight: 600 }}>
                {data.dueDate?.toLocaleDateString() || "N/A"}
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
                Item & Description
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Rate
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {data.items?.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "12px" }}>{index + 1}</td>
                <td style={{ padding: "12px" }}>
                  {item.description || item.name}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {item.quantity}
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
            <span style={{ fontWeight: 600, color: "#374151" }}>Sub Total</span>
            <span style={{ width: "160px", textAlign: "right" }}>
              ₦{data.subtotal?.toLocaleString()}
            </span>
          </div>

          {data.discountAmount > 0 && (
            <div style={{ display: "flex", gap: "64px", marginBottom: "12px" }}>
              <span style={{ fontWeight: 600, color: "#374151" }}>
                Discount ({data.discount}%)
              </span>
              <span style={{ width: "160px", textAlign: "right" }}>
                -₦{data.discountAmount?.toLocaleString()}
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: "64px", marginBottom: "12px" }}>
            <span style={{ fontWeight: 600, color: "#374151" }}>
              Tax ({data.taxRate}%)
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
            <span>Total</span>
            <span style={{ width: "160px", textAlign: "right" }}>
              ₦{data.amount?.toLocaleString()}
            </span>
          </div>

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
            <span style={{ fontWeight: "bold" }}>Balance Due</span>
            <span
              style={{
                width: "160px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              ₦{data.amount?.toLocaleString()}
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
              Notes
            </h4>
            <p
              style={{
                fontSize: "14px",
                whiteSpace: "pre-line",
                color: "#374151",
                margin: 0,
              }}
            >
              {data.notes}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Handle PDF download for invoice card
  // const handleDownloadPDF = async (invoice) => {
  //   setDownloadingPDF(invoice.id); // Set loading state for this specific invoice
  //   try {
  //     // Get effective email for brand data
  //     const effectiveEmail = getEffectiveUserEmail(user);

  //     // Fetch brand data
  //     const brandRef = doc(db, "fashiontally_brand_settings", effectiveEmail);
  //     const brandDoc = await getDoc(brandRef);

  //     let companyData = {
  //       businessName: "------",
  //       address: "------",
  //       phone: "------",
  //       email: "------",
  //       logoUrl: "",
  //       primaryColor: "#1f2937",
  //       secondaryColor: "#666666",
  //     };

  //     if (brandDoc.exists()) {
  //       const data = brandDoc.data();
  //       companyData = {
  //         businessName: data.businessName || "------",
  //         address: data.businessAddress || "------",
  //         phone: data.businessPhone || "------",
  //         email: data.businessEmail || "------",
  //         logoUrl: data.logoUrl || "",
  //         primaryColor: data.primaryColor || "#1f2937",
  //         secondaryColor: data.secondaryColor || "#666666",
  //       };
  //     } else {
  //       // Fallback to user data
  //       const userRef = doc(db, "fashiontally_users", effectiveEmail);
  //       const userDoc = await getDoc(userRef);
  //       if (userDoc.exists()) {
  //         const userData = userDoc.data();
  //         companyData = {
  //           businessName: userData.businessName || "------",
  //           address: userData.address || "------",
  //           phone: userData.phone || "------",
  //           email: userData.email || "------",
  //           logoUrl: "",
  //           primaryColor: "#1f2937",
  //           secondaryColor: "#666666",
  //         };
  //       }
  //     }

  //     // Create temporary container off-screen
  //     const tempContainer = document.createElement("div");
  //     tempContainer.style.position = "fixed";
  //     tempContainer.style.left = "-9999px";
  //     tempContainer.style.top = "0";
  //     document.body.appendChild(tempContainer);

  //     try {
  //       // Render invoice into temp container
  //       const root = createRoot(tempContainer);

  //       await new Promise((resolve) => {
  //         root.render(
  //           <InvoicePDFComponent data={invoice} company={companyData} />
  //         );
  //         // Wait for render and any image loads
  //         setTimeout(resolve, 500);
  //       });

  //       // Capture the rendered element
  //       const invoiceElement = tempContainer.firstChild;
  //       const canvas = await html2canvas(invoiceElement, {
  //         scale: window.devicePixelRatio * 2,
  //         backgroundColor: "#ffffff",
  //         useCORS: true,
  //         logging: false,
  //         allowTaint: true,
  //       });

  //       const dataCanvas = canvas.toDataURL("image/png");

  //       // Create PDF
  //       const pdf = new jsPDF({
  //         orientation: "portrait",
  //         unit: "px",
  //         format: "a4",
  //       });

  //       const imgProperties = pdf.getImageProperties(dataCanvas);
  //       const pdfWidth = pdf.internal.pageSize.getWidth();
  //       const pdfHeight =
  //         (imgProperties.height * pdfWidth) / imgProperties.width;

  //       pdf.addImage(dataCanvas, "PNG", 0, 0, pdfWidth, pdfHeight);
  //       pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);

  //       // Cleanup
  //       root.unmount();
  //     } finally {
  //       document.body.removeChild(tempContainer);
  //     }
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     alert("Failed to export PDF. Please try again.");
  //   } finally {
  //     setDownloadingPDF(null); // Clear loading state
  //   }
  // };

  const handleDownloadPDF = async (invoice) => {
    setDownloadingPDF(invoice.id);

    try {
      const effectiveEmail = getEffectiveUserEmail(user);

      // Fetch brand data
      const brandRef = doc(db, "fashiontally_brand_settings", effectiveEmail);
      const brandDoc = await getDoc(brandRef);

      let companyData = {
        businessName: "------",
        address: "------",
        phone: "------",
        email: "------",
        logoUrl: "",
        primaryColor: "#1f2937",
        secondaryColor: "#666666",
      };

      if (brandDoc.exists()) {
        const data = brandDoc.data();
        companyData = {
          businessName: data.businessName || "------",
          address: data.businessAddress || "------",
          phone: data.businessPhone || "------",
          email: data.businessEmail || "------",
          logoUrl: data.logoUrl || "",
          primaryColor: data.primaryColor || "#1f2937",
          secondaryColor: data.secondaryColor || "#666666",
        };
      } else {
        const userRef = doc(db, "fashiontally_users", effectiveEmail);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          companyData = {
            businessName: userData.businessName || "------",
            address: userData.address || "------",
            phone: userData.phone || "------",
            email: userData.email || "------",
            logoUrl: "",
            primaryColor: "#1f2937",
            secondaryColor: "#666666",
          };
        }
      }

      // Create temporary container off-screen
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "fixed";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "794px"; // A4 width in px
      tempContainer.style.background = "#ffffff";

      document.body.appendChild(tempContainer);

      let root;

      try {
        root = createRoot(tempContainer);

        // Render component
        await new Promise((resolve) => {
          root.render(
            <InvoicePDFComponent data={invoice} company={companyData} />
          );

          // Short wait for render + images
          setTimeout(resolve, 150);
        });

        const invoiceElement = tempContainer.firstChild;

        if (!invoiceElement) {
          throw new Error("Invoice element not rendered");
        }

        // Generate canvas (iPhone safe scale)
        const canvas = await html2canvas(invoiceElement, {
          scale: 2, // IMPORTANT: do not use devicePixelRatio on iOS
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          allowTaint: false,
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
      alert("Failed to export PDF. Please try again.");
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
          <h1 className="inv_invoice_title">Your Invoice Management</h1>
        </div>
        <div className="inv_no_invoices">
          <p>Please log in to view your invoices.</p>
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
          onClose={handleCloseCreateInvoice}
          selectedInvoice={selectedInvoice}
          isEditMode={isEditMode}
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
        <h1 className="inv_invoice_title">Your Invoice Management</h1>
      </div>

      {/* Stats Section */}
      <div className="inv_invoice_stats_section">
        <div className="inv_ipo">
          <div className="inv_ipols">
            <h1>Invoices</h1>
            <p>Manage your invoices</p>
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
          <h2 className="inv_stats_period">December 2025</h2>
        </div>
        <div className="inv_invoice_stats">
          <div className="inv_stat_card">
            <div className="inv_stat_content">
              <h3 className="inv_stat_title">Total Invoices</h3>
              <p className="inv_stat_value">{stats.total}</p>
              <p className="inv_stat_subtitle">
                {formatCurrency(stats.totalAmount)} total value
              </p>
            </div>
          </div>
          <div className="inv_stat_card">
            <div className="inv_stat_content">
              <h3 className="inv_stat_title">Paid Invoices</h3>
              <p className="inv_stat_value">{stats.paid}</p>
              <p className="inv_stat_subtitle">
                {formatCurrency(stats.paidAmount)} collected
              </p>
            </div>
          </div>
          <div className="inv_stat_card">
            <div className="inv_stat_content">
              <h3 className="inv_stat_title">Pending Invoices</h3>
              <p className="inv_stat_value">{stats.pending}</p>
            </div>
          </div>
          <div className="inv_stat_card">
            <div className="inv_stat_content">
              <h3 className="inv_stat_title">Overdue Invoices</h3>
              <p className="inv_stat_value">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="inv_jkj">
        {/* Search and Create Invoice Section */}
        <div className="inv_invoice_controls">
          <div className="inv_search_section">
            <div className="inv_search_input_container">
              <Search className="inv_search_icon" size={20} />
              <input
                type="text"
                placeholder="Search clients by name, phone, or email"
                className="inv_search_input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="inv_filter_btn_inside"
                onClick={() => setShowFilter(!showFilter)}
              >
                <Filter size={20} />
              </button>
              {showFilter && (
                <div className="inv_filter_dropdown">
                  <div className="inv_filter_section">
                    <h4 className="inv_filter_section_title">Status</h4>
                    <button
                      className={`inv_filter_option ${
                        filterStatus === "all" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("all")}
                    >
                      All Invoices
                    </button>
                    <button
                      className={`inv_filter_option ${
                        filterStatus === "paid" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("paid")}
                    >
                      Paid
                    </button>
                    <button
                      className={`inv_filter_option ${
                        filterStatus === "pending" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("pending")}
                    >
                      Pending
                    </button>
                    <button
                      className={`inv_filter_option ${
                        filterStatus === "overdue" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("overdue")}
                    >
                      Overdue
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            className="inv_create_invoice_btn"
            onClick={toggleCreateInvoice}
          >
            <Plus size={20} />
            Create Invoice
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
                    <h3 className="inv_invoice_id">{invoice.invoiceNumber}</h3>
                    <p className="inv_invoice_date">
                      {invoice.createdDate.toLocaleDateString()}
                    </p>
                    <p className="inv_invoice_client">{invoice.clientName}</p>
                  </div>
                </div>
                <div className="inv_invoice_right_section">
                  <div className="inv_invoice_amount">
                    {formatCurrency(invoice.amount)}
                  </div>
                  <div
                    className={`inv_status_badge ${invoice.status
                      .toLowerCase()
                      .replace(" ", "")}`}
                  >
                    {invoice.status}
                  </div>
                </div>
              </div>

              <div className="inv_invoice_actions">
                <button
                  className="inv_action_btn inv_view_btn"
                  onClick={() => handleViewInvoice(invoice)}
                >
                  <Eye size={16} />
                  View
                </button>
                <button
                  className="inv_action_btn inv_pdf_btn"
                  onClick={() => handleDownloadPDF(invoice)}
                  disabled={downloadingPDF === invoice.id}
                >
                  <Download size={16} />
                  {downloadingPDF === invoice.id ? "Loading..." : "PDF"}
                </button>

                <button
                  className="inv_action_btn inv_check_btn"
                  onClick={() => handleEditInvoice(invoice)}
                >
                  <Check size={16} />
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
            <p>No invoices found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoice;
