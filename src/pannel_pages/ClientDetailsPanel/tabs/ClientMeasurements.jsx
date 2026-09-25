import { useState, useEffect, useContext } from "react";
import { Plus, Ruler, Info, Download, Pencil, Trash2 } from "lucide-react";
import NewAuthContext from "../../../contexts/NewAuthContext";
import AddMeasurementModal from "../components/AddMeasurementModal";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import "./ClientMeasurements.css";

const API = import.meta.env.VITE_BACKEND_URL;

const ClientMeasurements = ({ client }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [brandData, setBrandData] = useState(null);
  const { user } = useContext(NewAuthContext);

  const token = () => localStorage.getItem("authToken");

  // Fetch measurements from backend
  const fetchMeasurements = async (clientId) => {
    if (!clientId) {
      console.warn("⚠️ fetchMeasurements called with no clientId");
      setLoading(false);
      return;
    }
    try {
      const url = `${API}/api/measurement/list/${encodeURIComponent(clientId)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) setMeasurements(data.data);
      else console.error("❌ Fetch failed:", data.error);
    } catch (err) {
      console.error("❌ Error fetching measurements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setMeasurements([]);
    fetchMeasurements(client?.email);
  }, [client?.email]);

  // Load brand data
  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/brand-setting/get-by-email/${user.email}`);
        const data = await res.json();
        if (data.success) {
          setBrandData({
            businessName: data.data.businessName || "",
            businessAddress: data.data.businessAddress || "",
            businessPhone: data.data.businessPhone || "",
            businessEmail: data.data.businessEmail || "",
            logoUrl: data.data.logoUrl || null,
            primaryColor: data.data.primaryColor || "#14b8a6",
          });
        }
      } catch (err) {
        console.error("Error loading brand data:", err);
      }
    };
    load();
  }, [user?.email]);

  // Create measurements (array)
  const handleSaveMeasurements = async (items) => {
    const res = await fetch(`${API}/api/measurement/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ clientId: client.email, measurements: items }),
    });
    const data = await res.json();
    if (data.success) {
      setMeasurements((prev) => [...prev, ...data.data]);
      if (data.warning) console.warn("⚠️", data.warning);
    } else {
      throw new Error(data.error || "Failed to save");
    }
  };

  // Edit a single measurement
  const handleEditSave = async (item) => {
    const res = await fetch(`${API}/api/measurement/edit/${editingMeasurement.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ name: item.name, value: item.value, unit: item.unit }),
    });
    const data = await res.json();
    if (data.success) {
      setMeasurements((prev) =>
        prev.map((m) => (m.id === editingMeasurement.id ? data.data : m))
      );
      setEditingMeasurement(null);
    } else {
      throw new Error(data.error || "Failed to update");
    }
  };

  // Delete a measurement
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this measurement?")) return;
    const res = await fetch(`${API}/api/measurement/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    const data = await res.json();
    if (data.success) {
      setMeasurements((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  // PDF Component
  const MeasurementPDFComponent = ({ client, measurements, company }) => {
    const primaryColor = company.primaryColor || "#14b8a6";
    return (
      <div style={{ width: "1000px", fontSize: "14px", lineHeight: "1.6", color: "#333", backgroundColor: "white", padding: "48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "48px", borderBottom: `3px solid ${primaryColor}`, paddingBottom: "24px" }}>
          <div style={{ flex: 1 }}>
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="Logo" style={{ height: "80px", objectFit: "contain" }} crossOrigin="anonymous" />
            ) : (
              <div style={{ height: "80px", width: "80px", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", color: "#9ca3af", borderRadius: "8px" }}>
                {company.businessName?.charAt(0) || "FT"}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: 0, color: primaryColor }}>MEASUREMENTS</h1>
            <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>{formatDate(new Date().toISOString())}</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "48px" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "12px", fontWeight: "600", color: "#666", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>From</h3>
            {company.businessName && <p style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 8px 0" }}>{company.businessName}</p>}
            {company.businessAddress && <p style={{ color: "#666", margin: "4px 0" }}>{company.businessAddress}</p>}
            {company.businessPhone && <p style={{ color: "#666", margin: "4px 0" }}>{company.businessPhone}</p>}
            {company.businessEmail && <p style={{ color: "#666", margin: "4px 0" }}>{company.businessEmail}</p>}
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "600", color: "#666", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Client</h3>
            {client.name && <p style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 8px 0" }}>{client.name}</p>}
            {client.phone && <p style={{ color: "#666", margin: "4px 0" }}>{client.phone}</p>}
            {client.email && <p style={{ color: "#666", margin: "4px 0" }}>{client.email}</p>}
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e5e7eb" }}>
          <thead>
            <tr style={{ backgroundColor: primaryColor }}>
              <th style={{ padding: "16px", textAlign: "left", color: "white", fontWeight: "600" }}>Measurement</th>
              <th style={{ padding: "16px", textAlign: "right", color: "white", fontWeight: "600" }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m, i) => (
              <tr key={m.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                <td style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb" }}>{m.name}</td>
                <td style={{ padding: "14px 16px", textAlign: "right", borderBottom: "1px solid #e5e7eb", fontWeight: "600" }}>{m.value} {m.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "24px", textAlign: "center", color: "#666", fontSize: "12px", marginTop: "48px" }}>
          <p style={{ margin: 0 }}>Generated on {new Date().toLocaleDateString()}{company.businessName && ` by ${company.businessName}`}</p>
        </div>
      </div>
    );
  };

  const handleDownloadPDF = async () => {
    if (!measurements.length || !client) return;
    setDownloadingPDF(true);
    try {
      const company = brandData || { businessName: "Your Business", primaryColor: "#14b8a6" };
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      document.body.appendChild(tempContainer);
      try {
        const root = createRoot(tempContainer);
        await new Promise((resolve) => {
          root.render(<MeasurementPDFComponent client={client} measurements={measurements} company={company} />);
          setTimeout(resolve, 500);
        });
        const canvas = await html2canvas(tempContainer.firstChild, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
        const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`measurements-${client.name.replace(/\s+/g, "-")}.pdf`);
        root.unmount();
      } finally {
        document.body.removeChild(tempContainer);
      }
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="client_details_measurements">
        <div className="client_measurements_header">
          <div className="client_measurements_title_section">
            <h3 className="client_measurements_title">Body Measurements</h3>
            <p className="client_measurements_subtitle">Loading measurements...</p>
          </div>
        </div>
        <div className="loading-container"><div className="loading-spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="client_details_measurements">
      {/* Header */}
      <div className="client_measurements_header">
        <div className="client_measurements_title_section">
          <h3 className="client_measurements_title">Body Measurements</h3>
          <p className="client_measurements_subtitle">
            {measurements.length > 0
              ? `${measurements.length} measurement${measurements.length > 1 ? "s" : ""} recorded`
              : "No measurements recorded"}
          </p>
        </div>
        <button className="client_measurements_add_btn" onClick={() => setShowAddModal(true)}>
          <Plus size={14} />
        </button>
      </div>

      {/* Measurements Grid */}
      {measurements.length > 0 ? (
        <div className="client_measurements_grid">
          {measurements.map((m) => (
            <div key={m.id} className="client_measurement_item">
              <div className="client_measurement_content">
                <div className="client_measurement_label">{m.name}</div>
                <div className="client_measurement_value">
                  {m.value}
                  <span className="client_measurement_unit"> {m.unit}</span>
                </div>
              </div>
              <div className="client_measurement_actions">
                <button
                  className="client_measurement_edit_btn"
                  title="Edit"
                  onClick={() => setEditingMeasurement(m)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="client_measurement_delete_btn"
                  title="Delete"
                  onClick={() => handleDelete(m.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-measurements">
          <p>No measurements recorded for this client</p>
          <button className="add-measurement-btn" onClick={() => setShowAddModal(true)}>
            Add First Measurement
          </button>
        </div>
      )}

      {/* Measurement Guide */}
      <div className="client_measurements_guide_section">
        <div className="client_measurements_guide_header">
          <Info size={12} className="client_measurements_info_icon" />
          <span className="client_measurements_guide_title">Measurement Guide</span>
        </div>
        <ul className="client_measurements_guide_list">
          <li>Always take measurements with the client standing straight.</li>
          <li>Update measurements every 6 months for regular clients.</li>
          <li>Record measurements in inches for consistency.</li>
        </ul>
      </div>

      {/* Export Button */}
      {measurements.length > 0 && (
        <button className="client_measurements_export_btn" onClick={handleDownloadPDF} disabled={downloadingPDF}>
          <Download size={14} />
          {downloadingPDF ? "Generating PDF..." : "Download Measurements PDF"}
        </button>
      )}

      {/* Add Modal */}
      <AddMeasurementModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveMeasurements}
      />

      {/* Edit Modal */}
      {editingMeasurement && (
        <AddMeasurementModal
          isOpen={true}
          editMode={true}
          initialData={editingMeasurement}
          onClose={() => setEditingMeasurement(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default ClientMeasurements;
