import { X, Download, Share2 } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import NewAuthContext from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import "./InvoiceViewPanel.css";

const InvoiceViewPanel = ({ onClose, invoice }) => {
  const { user } = useContext(NewAuthContext);
  const [brandData, setBrandData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false); // Add PDF export loading state

  // Load brand data when component mounts
  useEffect(() => {
    const loadBrandData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        const effectiveEmail = getEffectiveUserEmail(user);

        // Load user data first to get backup info
        const userDoc = await getDoc(
          doc(db, "fashiontally_users", effectiveEmail)
        );
        let userData = null;

        if (userDoc.exists()) {
          userData = userDoc.data();
        }

        // Load brand settings
        const brandDoc = await getDoc(
          doc(db, "fashiontally_brand_settings", effectiveEmail)
        );

        if (brandDoc.exists()) {
          const brandData = brandDoc.data();
          // Merge brand data with user data as fallback for each field
          setBrandData({
            businessName:
              brandData.businessName || userData?.businessName || null,
            businessAddress:
              brandData.businessAddress || userData?.businessAddress || null,
            businessPhone:
              brandData.businessPhone || userData?.phoneNumber || null,
            businessEmail: brandData.businessEmail || userData?.email || null,
            businessWebsite: brandData.businessWebsite || null,
            instagramHandle: brandData.instagramHandle || null,
            logoUrl:
              brandData.logoUrl ||
              userData?.logoUrl ||
              userData?.profilePicture ||
              null,
            primaryColor: brandData.primaryColor || "#1f2937",
            secondaryColor: brandData.secondaryColor || "#666666",
            bankName: brandData.bankName || null,
            accountNumber: brandData.accountNumber || null,
            accountName: brandData.accountName || null,
            footerText: brandData.footerText || null,
            termsAndConditions: brandData.termsAndConditions || null,
          });
        } else if (userData) {
          // No brand settings, use user data as fallback
          setBrandData({
            businessName: userData.businessName || null,
            businessAddress: userData.businessAddress || null,
            businessPhone: userData.phoneNumber || null,
            businessEmail: userData.email || null,
            businessWebsite: null,
            instagramHandle: null,
            logoUrl: userData.logoUrl || userData.profilePicture || null,
            primaryColor: "#1f2937",
            secondaryColor: "#666666",
            bankName: null,
            accountNumber: null,
            accountName: null,
            footerText: null,
            termsAndConditions: null,
          });
        }
      } catch (error) {
        console.error("Error loading brand data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBrandData();
  }, [user?.email]);

  // Default company data structure (fallback)
  const defaultCompanyData = {
    businessName: "------",
    address: "------",
    phone: "------",
    email: "------",
    logoUrl: null,
  };

  // Default payment details (fallback)
  const defaultPaymentDetails = {
    bankName: "------",
    accountNumber: "------",
    accountName: "------",
  };

  // Use brand data if available, otherwise use defaults
  const companyData = brandData
    ? {
        businessName: brandData.businessName || "------",
        address: brandData.businessAddress || "------",
        phone: brandData.businessPhone || "------",
        email: brandData.businessEmail || "------",
        logoUrl: brandData.logoUrl || null,
        primaryColor: brandData.primaryColor || "#1f2937",
        secondaryColor: brandData.secondaryColor || "#666666",
      }
    : {
        ...defaultCompanyData,
        primaryColor: "#1f2937",
        secondaryColor: "#666666",
      };

  const paymentDetails = brandData
    ? {
        bankName: brandData.bankName || "------",
        accountNumber: brandData.accountNumber || "------",
        accountName: brandData.accountName || "------",
      }
    : defaultPaymentDetails;

  // Helper function to format dates safely
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString();

    // Handle Firebase Timestamp
    if (date.toDate && typeof date.toDate === "function") {
      return date.toDate().toLocaleDateString();
    }

    // Handle Date object
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }

    // Handle string date
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString();
    }

    return new Date().toLocaleDateString();
  };

  // Process invoice data from Firebase
  const invoiceData = invoice
    ? {
        id: invoice.invoiceNumber || "INV-2024-001",
        date: formatDate(invoice.createdDate),
        dueDate: formatDate(invoice.dueDate),
        company: companyData,
        client: {
          name: invoice.clientName || "Client Name",
          address: invoice.clientAddress || "Client Address",
          phone: invoice.clientPhone || "Client Phone",
          email: invoice.clientEmail || "client@email.com",
        },
        items: invoice.items || [],
        subtotal: invoice.subtotal || 0,
        discountAmount: invoice.discountAmount || 0,
        taxAmount: invoice.taxAmount || 0,
        total: invoice.amount || 0,
        notes: invoice.notes || "No additional notes",
        paymentDetails: paymentDetails,
        paymentMethod: invoice.paymentMethod || "Cash",
        status: invoice.status || "Unpaid",
        discount: invoice.discount || 0,
        taxRate: invoice.taxRate || 7.5,
      }
    : {
        id: "INV-2024-001",
        date: new Date().toLocaleDateString(),
        dueDate: new Date().toLocaleDateString(),
        company: companyData,
        client: {
          name: "Client Name",
          address: "Client Address",
          phone: "Client Phone",
          email: "client@email.com",
        },
        items: [],
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        total: 0,
        notes: "No additional notes",
        paymentDetails: paymentDetails,
        paymentMethod: "Cash",
        status: "Unpaid",
        discount: 0,
        taxRate: 7.5,
      };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  // PDF Component for rendering (matches tally-main design)
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
              #{data.id}
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
            ₦{data.total.toLocaleString()}
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
              {data.client.name}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "0 0 4px 0",
              }}
            >
              {data.client.address}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "0 0 4px 0",
              }}
            >
              {data.client.phone}
            </p>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
              {data.client.email}
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
              <span style={{ fontWeight: 600 }}>{data.date}</span>
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
              <span style={{ fontWeight: 600 }}>{data.dueDate}</span>
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
            {data.items.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "12px" }}>{index + 1}</td>
                <td style={{ padding: "12px" }}>{item.description}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {item.quantity}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  ₦{item.price.toLocaleString()}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  ₦{(item.quantity * item.price).toLocaleString()}
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
              ₦{data.subtotal.toLocaleString()}
            </span>
          </div>

          {data.discountAmount > 0 && (
            <div style={{ display: "flex", gap: "64px", marginBottom: "12px" }}>
              <span style={{ fontWeight: 600, color: "#374151" }}>
                Discount ({data.discount}%)
              </span>
              <span style={{ width: "160px", textAlign: "right" }}>
                -₦{data.discountAmount.toLocaleString()}
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: "64px", marginBottom: "12px" }}>
            <span style={{ fontWeight: 600, color: "#374151" }}>
              Tax ({data.taxRate}%)
            </span>
            <span style={{ width: "160px", textAlign: "right" }}>
              ₦{data.taxAmount.toLocaleString()}
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
              ₦{data.total.toLocaleString()}
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
              ₦{data.total.toLocaleString()}
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
            Payment Details
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                  margin: "0 0 4px 0",
                }}
              >
                Bank Name
              </p>
              <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
                {data.paymentDetails.bankName}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                  margin: "0 0 4px 0",
                }}
              >
                Account Number
              </p>
              <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
                {data.paymentDetails.accountNumber}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                  margin: "0 0 4px 0",
                }}
              >
                Account Name
              </p>
              <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
                {data.paymentDetails.accountName}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleExportPDF = async () => {
    setExportingPDF(true); // Set loading state
    try {
      // Create temporary container off-screen
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "fixed";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      document.body.appendChild(tempContainer);

      try {
        // Render invoice into temp container
        const root = createRoot(tempContainer);

        // Render component
        root.render(
          <InvoicePDFComponent data={invoiceData} company={companyData} />
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

        // Capture the rendered element
        const invoiceElement = tempContainer.firstChild;
        const canvas = await html2canvas(invoiceElement, {
          scale: window.devicePixelRatio * 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          allowTaint: true,
        });

        const dataCanvas = canvas.toDataURL("image/png");

        // Create PDF
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: "a4",
        });

        const imgProperties = pdf.getImageProperties(dataCanvas);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight =
          (imgProperties.height * pdfWidth) / imgProperties.width;

        pdf.addImage(dataCanvas, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${invoiceData.id}.pdf`);

        // Cleanup
        root.unmount();
      } finally {
        document.body.removeChild(tempContainer);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExportingPDF(false); // Clear loading state
    }
  };

  const handleShare = () => {
    // Handle share logic here
    console.log("Sharing invoice:", invoiceData.id);
  };

  return (
    <div className="inv_l_invoice_view_panel">
      {/* Header */}
      <div className="inv_l_invoice_header">
        <button className="inv_l_close_btn" onClick={onClose}>
          <X size={25} />
        </button>
        <button
          className="inv_l_export_btn"
          onClick={handleExportPDF}
          disabled={exportingPDF}
        >
          <Download size={16} />
          {exportingPDF ? "Loading..." : "Export PDF"}
        </button>
      </div>

      {/* Invoice Content */}
      <div className="inv_l_invoice_content">
        {/* Company and Invoice Info */}
        <div className="inv_l_invoice_top_section">
          <div className="inv_l_company_info">
            <div className="inv_l_company_logo">
              {invoiceData.company.logoUrl ? (
                <img
                  src={invoiceData.company.logoUrl}
                  alt={invoiceData.company.businessName}
                  className="inv_l_company_logo_image"
                />
              ) : (
                <div className="inv_l_company_logo_blank">
                  <svg
                    className="inv_l_company_logo_icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                </div>
              )}
            </div>
            <div className="inv_l_company_details">
              <p className="inv_l_company_name">
                {invoiceData.company.businessName}
              </p>
              <p className="inv_l_company_address">
                {invoiceData.company.address}
              </p>
              <p className="inv_l_company_phone">{invoiceData.company.phone}</p>
              <p className="inv_l_company_email">{invoiceData.company.email}</p>
            </div>
          </div>
          <div className="inv_l_invoice_info">
            <h1 className="inv_l_invoice_title">INVOICE</h1>
            <div className="inv_l_invoice_details">
              <p className="inv_l_invoice_number">{invoiceData.id}</p>
              <p className="inv_l_invoice_date">Date: {invoiceData.date}</p>
              <p className="inv_l_invoice_due">Due: {invoiceData.dueDate}</p>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <h3 className="inv_l_bill_to_title">BILL TO:</h3>
        <div className="inv_l_bill_to_section">
          <div className="inv_l_bill_to">
            <p className="inv_l_client_name">{invoiceData.client.name}</p>
            <p className="inv_l_client_phone">{invoiceData.client.phone}</p>
          </div>
          <div className="inv_l_client_location">
            <p className="inv_l_client_address">{invoiceData.client.address}</p>
            <p className="inv_l_client_email">{invoiceData.client.email}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="inv_l_items_section">
          <div className="inv_l_items_header">
            <div className="inv_l_header_description">DESCRIPTION</div>
            <div className="inv_l_header_qty">QTY</div>
            <div className="inv_l_header_price">PRICE</div>
            <div className="inv_l_header_amount">AMOUNT</div>
          </div>

          {invoiceData.items.map((item, index) => (
            <div key={index} className="inv_l_item_row">
              <div className="inv_l_item_description">{item.description}</div>
              <div className="inv_l_item_qty">{item.quantity}</div>
              <div className="inv_l_item_price">
                {formatCurrency(item.price)}
              </div>
              <div className="inv_l_item_amount">
                {formatCurrency(item.quantity * item.price)}
              </div>
            </div>
          ))}

          {invoiceData.items.length === 0 && (
            <div className="inv_l_item_row">
              <div className="inv_l_item_description">No items added</div>
              <div className="inv_l_item_qty">-</div>
              <div className="inv_l_item_price">-</div>
              <div className="inv_l_item_amount">-</div>
            </div>
          )}
        </div>

        {/* Totals Section - Right aligned */}
        <div className="inv_l_totals_section">
          <div className="inv_l_total_row">
            <span className="inv_l_total_label">Subtotal</span>
            <span className="inv_l_total_value">
              {formatCurrency(invoiceData.subtotal)}
            </span>
          </div>
          {invoiceData.discountAmount > 0 && (
            <div className="inv_l_total_row">
              <span className="inv_l_total_label">
                Discount ({invoiceData.discount}%)
              </span>
              <span className="inv_l_total_value">
                -{formatCurrency(invoiceData.discountAmount)}
              </span>
            </div>
          )}
          <div className="inv_l_total_row">
            <span className="inv_l_total_label">
              Tax ({invoiceData.taxRate}%)
            </span>
            <span className="inv_l_total_value">
              {formatCurrency(invoiceData.taxAmount)}
            </span>
          </div>
          <div className="inv_l_total_row inv_l_grand_total">
            <span className="inv_l_total_label">Total:</span>
            <span className="inv_l_total_value inv_l_grand_total_amount">
              {formatCurrency(invoiceData.total)}
            </span>
          </div>
        </div>

        {/* Notes Section */}
        <div className="inv_l_notes_section">
          <p className="inv_l_notes_title">
            NOTES:{" "}
            <span className="inv_l_notes_content">{invoiceData.notes}</span>
          </p>
        </div>

        {/* Payment Details Section */}
        <div className="inv_l_payment_section">
          <h3 className="inv_l_payment_title">PAYMENT DETAILS:</h3>
          <div className="inv_l_payment_grid">
            <div className="inv_l_payment_item">
              <p className="inv_l_payment_label">Bank Name:</p>
              <p className="inv_l_payment_value">
                {invoiceData.paymentDetails.bankName}
              </p>
            </div>
            <div className="inv_l_payment_item">
              <p className="inv_l_payment_label">Account Number:</p>
              <p className="inv_l_payment_value">
                {invoiceData.paymentDetails.accountNumber}
              </p>
            </div>
            <div className="inv_l_payment_item">
              <p className="inv_l_payment_label">Account Name:</p>
              <p className="inv_l_payment_value">
                {invoiceData.paymentDetails.accountName}
              </p>
            </div>
          </div>
        </div>

        {/* Share Button */}
        {/* <button className="inv_l_share_btn" onClick={handleShare}>
          <Share2 size={16} />
          Share
        </button> */}

        {/* Footer */}
        <div className="inv_l_footer">
          <p className="inv_l_powered_by">
            Powered by <span className="inv_l_brand">Fashion Tally</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewPanel;
