import { X, Download } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import NewAuthContext from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import { MoneyAmount } from "../../components/MoneyAmount/MoneyAmount";
import "./InvoiceViewPanel.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

import { dateLocale } from "../../i18n";



/** Amount paid on an invoice (Naira). Older invoices marked Paid count as fully paid. */
const paidOf = (inv) => {
  const total = Number(inv?.amount ?? inv?.total) || 0;
  if (inv?.status === "Paid") return total;
  if (inv?.status === "Partially Paid") return Math.min(Number(inv?.amountPaid) || 0, total);
  return 0;
};
const balanceOf = (inv) => Math.max(0, (Number(inv?.amount ?? inv?.total) || 0) - paidOf(inv));

const InvoiceViewPanel = ({ onClose, invoice }) => {
  const { t: tx } = useTranslation();
  const { user } = useContext(NewAuthContext);
  const [brandData, setBrandData] = useState(null);
  const [, setLoading] = useState(true);
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
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/brand-setting/get-by-email/${encodeURIComponent(effectiveEmail)}`
        );
        const data = await res.json();

        if (data.success && data.data) {
          const d = data.data;
          setBrandData({
            businessName: d.businessName || null,
            businessAddress: d.businessAddress || null,
            businessPhone: d.businessPhone || null,
            businessEmail: d.businessEmail || null,
            businessWebsite: d.businessWebsite || null,
            instagramHandle: d.instagramHandle || null,
            logoUrl: d.logoUrl || null,
            primaryColor: d.primaryColor || "#1f2937",
            secondaryColor: d.secondaryColor || "#666666",
            bankName: d.bankName || null,
            accountNumber: d.accountNumber || null,
            accountName: d.accountName || null,
            footerText: d.footerText || null,
            termsAndConditions: d.termsAndConditions || null,
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
    if (!date) return new Date().toLocaleDateString(dateLocale());

    // Handle Firebase Timestamp
    if (date.toDate && typeof date.toDate === "function") {
      return date.toDate().toLocaleDateString(dateLocale());
    }

    // Handle Date object
    if (date instanceof Date) {
      return date.toLocaleDateString(dateLocale());
    }

    // Handle string date
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString(dateLocale());
    }

    return new Date().toLocaleDateString(dateLocale());
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
        amountPaid: paidOf(invoice),
        balanceDue: balanceOf(invoice),
        notes: invoice.notes || "No additional notes",
        paymentDetails: paymentDetails,
        paymentMethod: invoice.paymentMethod || "Cash",
        status: invoice.status || "Unpaid",
        discount: invoice.discount || 0,
        taxRate: invoice.taxRate || 7.5,
      }
    : {
        id: "INV-2024-001",
        date: new Date().toLocaleDateString(dateLocale()),
        dueDate: new Date().toLocaleDateString(dateLocale()),
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
        amountPaid: 0,
        balanceDue: 0,
        notes: "No additional notes",
        paymentDetails: paymentDetails,
        paymentMethod: "Cash",
        status: "Unpaid",
        discount: 0,
        taxRate: 7.5,
      };

  // PDF Component for rendering (matches tally-main design)
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
              #{tl(data.id)}
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
            <MoneyAmount amount={data.balanceDue} align="end" />
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
              {tl(data.client.name)}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "0 0 4px 0",
              }}
            >
              {tl(data.client.address)}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "0 0 4px 0",
              }}
            >
              {tl(data.client.phone)}
            </p>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
              {tl(data.client.email)}
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
              <span style={{ fontWeight: 600 }}>{tl(data.date)}</span>
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
              <span style={{ fontWeight: 600 }}>{tl(data.dueDate)}</span>
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
            {data.items.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "12px" }}>{index + 1}</td>
                <td style={{ padding: "12px" }}>{tl(item.description)}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {tl(item.quantity)}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  <MoneyAmount amount={item.price} align="end" />
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  <MoneyAmount amount={item.quantity * item.price} align="end" />
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
              <MoneyAmount amount={data.subtotal} align="end" />
            </span>
          </div>

          {data.discountAmount > 0 && (
            <div style={{ display: "flex", gap: "64px", marginBottom: "12px" }}>
              <span style={{ fontWeight: 600, color: "#374151" }}>
                {tx("auto.discount_a89c")}{tl(data.discount)}%)
              </span>
              <span style={{ width: "160px", textAlign: "right" }}>
                <MoneyAmount amount={data.discountAmount} prefix="-" align="end" />
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: "64px", marginBottom: "12px" }}>
            <span style={{ fontWeight: 600, color: "#374151" }}>
              {tx("auto.tax_9cb7")}{tl(data.taxRate)}%)
            </span>
            <span style={{ width: "160px", textAlign: "right" }}>
              <MoneyAmount amount={data.taxAmount} align="end" />
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
              <MoneyAmount amount={data.total} align="end" />
            </span>
          </div>

          {data.amountPaid > 0 && (
            <div style={{ display: "flex", gap: "64px", marginBottom: "12px" }}>
              <span style={{ fontWeight: 600, color: "#374151" }}>{tl("Amount Paid")}</span>
              <span style={{ width: "160px", textAlign: "right" }}>
                <MoneyAmount amount={data.amountPaid} prefix="-" align="end" />
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
              <MoneyAmount amount={data.balanceDue} align="end" />
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
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                  margin: "0 0 4px 0",
                }}
              >
                {tx("auto.bankName_3126")}
              </p>
              <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
                {tl(data.paymentDetails.bankName)}
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
                {tx("auto.accountNumber_0bd6")}
              </p>
              <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
                {tl(data.paymentDetails.accountNumber)}
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
                {tx("auto.accountName_db3b")}
              </p>
              <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
                {tl(data.paymentDetails.accountName)}
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
      alert(tx("auto.failedToExportPdfPlease_0d6f"));
    } finally {
      setExportingPDF(false); // Clear loading state
    }
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
          {tl(exportingPDF ? tx("auto.loading_b04b") : tx("auto.exportPdf_3dd7"))}
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
                {tl(invoiceData.company.businessName)}
              </p>
              <p className="inv_l_company_address">
                {tl(invoiceData.company.address)}
              </p>
              <p className="inv_l_company_phone">{tl(invoiceData.company.phone)}</p>
              <p className="inv_l_company_email">{tl(invoiceData.company.email)}</p>
            </div>
          </div>
          <div className="inv_l_invoice_info">
            <h1 className="inv_l_invoice_title">{tx("auto.invoice_fe1a")}</h1>
            <div className="inv_l_invoice_details">
              <p className="inv_l_invoice_number">{tl(invoiceData.id)}</p>
              <p className="inv_l_invoice_date">{tx("auto.date_81b7")}{" "}{tl(invoiceData.date)}</p>
              <p className="inv_l_invoice_due">{tx("auto.due_7513")}{" "}{tl(invoiceData.dueDate)}</p>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <h3 className="inv_l_bill_to_title">{tx("auto.billTo_c8a1")}</h3>
        <div className="inv_l_bill_to_section">
          <div className="inv_l_bill_to">
            <p className="inv_l_client_name">{tl(invoiceData.client.name)}</p>
            <p className="inv_l_client_phone">{tl(invoiceData.client.phone)}</p>
          </div>
          <div className="inv_l_client_location">
            <p className="inv_l_client_address">{tl(invoiceData.client.address)}</p>
            <p className="inv_l_client_email">{tl(invoiceData.client.email)}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="inv_l_items_section">
          <div className="inv_l_items_header">
            <div className="inv_l_header_description">{tx("auto.description_0cee")}</div>
            <div className="inv_l_header_qty">{tx("auto.qty_ea99")}</div>
            <div className="inv_l_header_price">{tx("auto.price_0397")}</div>
            <div className="inv_l_header_amount">{tx("auto.amount_abd2")}</div>
          </div>

          {invoiceData.items.map((item, index) => (
            <div key={index} className="inv_l_item_row">
              <div className="inv_l_item_description">{tl(item.description)}</div>
              <div className="inv_l_item_qty">{tl(item.quantity)}</div>
              <div className="inv_l_item_price">
                <MoneyAmount amount={item.price} align="end" />
              </div>
              <div className="inv_l_item_amount">
                <MoneyAmount amount={item.quantity * item.price} align="end" />
              </div>
            </div>
          ))}

          {invoiceData.items.length === 0 && (
            <div className="inv_l_item_row">
              <div className="inv_l_item_description">{tx("auto.noItemsAdded_8c48")}</div>
              <div className="inv_l_item_qty">-</div>
              <div className="inv_l_item_price">-</div>
              <div className="inv_l_item_amount">-</div>
            </div>
          )}
        </div>

        {/* Totals Section - Right aligned */}
        <div className="inv_l_totals_section">
          <div className="inv_l_total_row">
            <span className="inv_l_total_label">{tx("auto.subtotal_97f7")}</span>
            <span className="inv_l_total_value">
              <MoneyAmount amount={invoiceData.subtotal} align="end" />
            </span>
          </div>
          {invoiceData.discountAmount > 0 && (
            <div className="inv_l_total_row">
              <span className="inv_l_total_label">
                {tx("auto.discount_a89c")}{tl(invoiceData.discount)}%)
              </span>
              <span className="inv_l_total_value">
                <MoneyAmount amount={invoiceData.discountAmount} prefix="-" align="end" />
              </span>
            </div>
          )}
          <div className="inv_l_total_row">
            <span className="inv_l_total_label">
              {tx("auto.tax_9cb7")}{tl(invoiceData.taxRate)}%)
            </span>
            <span className="inv_l_total_value">
              <MoneyAmount amount={invoiceData.taxAmount} align="end" />
            </span>
          </div>
          <div className="inv_l_total_row inv_l_grand_total">
            <span className="inv_l_total_label">{tx("auto.total_d8e7")}</span>
            <span className="inv_l_total_value inv_l_grand_total_amount">
              <MoneyAmount amount={invoiceData.total} align="end" />
            </span>
          </div>
          {invoiceData.amountPaid > 0 && (
            <div className="inv_l_total_row">
              <span className="inv_l_total_label">{tl("Amount Paid")}</span>
              <span className="inv_l_total_value">
                <MoneyAmount amount={invoiceData.amountPaid} prefix="-" align="end" />
              </span>
            </div>
          )}
          <div className="inv_l_total_row inv_l_grand_total">
            <span className="inv_l_total_label">{tx("auto.balanceDue_5a6b")}</span>
            <span className="inv_l_total_value inv_l_grand_total_amount">
              <MoneyAmount amount={invoiceData.balanceDue} align="end" />
            </span>
          </div>
        </div>

        {/* Notes Section */}
        <div className="inv_l_notes_section">
          <p className="inv_l_notes_title">
            {tx("auto.notes_8856")}{" "}
            <span className="inv_l_notes_content">{tl(invoiceData.notes)}</span>
          </p>
        </div>

        {/* Payment Details Section */}
        <div className="inv_l_payment_section">
          <h3 className="inv_l_payment_title">{tx("auto.paymentDetails_ae62")}</h3>
          <div className="inv_l_payment_grid">
            <div className="inv_l_payment_item">
              <p className="inv_l_payment_label">{tx("auto.bankName_318d")}</p>
              <p className="inv_l_payment_value">
                {tl(invoiceData.paymentDetails.bankName)}
              </p>
            </div>
            <div className="inv_l_payment_item">
              <p className="inv_l_payment_label">{tx("auto.accountNumber_cf9e")}</p>
              <p className="inv_l_payment_value">
                {tl(invoiceData.paymentDetails.accountNumber)}
              </p>
            </div>
            <div className="inv_l_payment_item">
              <p className="inv_l_payment_label">{tx("auto.accountName_91ac")}</p>
              <p className="inv_l_payment_value">
                {tl(invoiceData.paymentDetails.accountName)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="inv_l_footer">
          <p className="inv_l_powered_by">
            {tx("auto.poweredBy_6897")}{" "}<span className="inv_l_brand">Fashion Tally</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewPanel;
