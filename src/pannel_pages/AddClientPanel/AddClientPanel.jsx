import { useState, useContext } from "react";
import { ArrowLeft, User, Mail, Phone, FileText, Info } from "lucide-react";
import {
  doc,
  setDoc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import NewAuthContext from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import Input from "../../components/Input/Input";
import "./AddClientPanel.css";
import { X } from "lucide-react";

const AddClientPanel = ({ onClose, editMode = false, clientData = null }) => {
  const [formData, setFormData] = useState({
    fullName: editMode && clientData ? clientData.name || "" : "",
    email: editMode && clientData ? clientData.email || "" : "",
    phone: editMode && clientData ? clientData.phone || "" : "",
    address: editMode && clientData ? clientData.address || "" : "",
    status: editMode && clientData ? clientData.status || "Active" : "Active",
    notes: editMode && clientData ? clientData.notes || "" : "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useContext(NewAuthContext);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.trim().length < 6) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user?.email) {
      setErrors({ submit: "You must be logged in to add clients" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const effectiveEmail = getEffectiveUserEmail(user);
      const cleanedPhone = formData.phone
        .replace(/\s+/g, "")
        .replace(/[-()+]/g, "");

      if (editMode && clientData) {
        // --- EDIT MODE: update existing client document ---
        const clientRef = doc(db, "fashiontally_clients", clientData.id);
        await updateDoc(clientRef, {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: cleanedPhone,
          address: formData.address.trim() || "",
          status: formData.status,
          notes: formData.notes.trim() || "",
          updatedAt: new Date(),
        });
      } else {
        // --- CREATE MODE: check duplicate then create ---
        const makeClientId = (email, phone) =>
          `${encodeURIComponent(email)}__${phone}`;
        const tenantDocId = makeClientId(effectiveEmail, cleanedPhone);

        const dupQuery = query(
          collection(db, "fashiontally_clients"),
          where("userEmail", "==", effectiveEmail),
          where("phone", "==", cleanedPhone)
        );
        const dupSnap = await getDocs(dupQuery);

        if (!dupSnap.empty) {
          setErrors({
            phone: "You already have a client with this phone number",
          });
          setIsSubmitting(false);
          return;
        }

        const clientData = {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: cleanedPhone,
          address: formData.address.trim() || "",
          status: formData.status,
          notes: formData.notes.trim() || "",
          userEmail: effectiveEmail,
          tailorId: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          totalSpent: 0,
          lastOrder: null,
          hasMeasurements: false,
          measurementsUpdatedAt: null,
        };

        await setDoc(doc(db, "fashiontally_clients", tenantDocId), clientData);
      }

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        status: "Active",
        notes: "",
      });

      onClose();
    } catch (error) {
      console.error("Error saving client:", error);
      setErrors({ submit: "Failed to save client. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (status) => {
    setFormData((prev) => ({
      ...prev,
      status,
    }));
  };

  return (
    <div className="add_client_panel_content">
      {/* Header */}
      <div className="add_client_header">
        <button className="add_client_back_btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="add_client_title">{editMode ? "Edit Client" : "Add New Client"}</h2>
      </div>

      {/* Form */}
      <form className="add_client_form" onSubmit={handleSubmit}>
        {/* Client Information Section */}
        <div className="add_client_section">
          <div className="add_client_section_header">
            <User size={20} className="add_client_section_icon" />
            <h3 className="add_client_section_title">Client Information</h3>
          </div>

          <div className="add_client_form_group">
            <label className="add_client_label">
              Full Name <span className="add_client_required">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter client's full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              error={errors.fullName}
              variant="rounded"
              disabled={isSubmitting}
            />
          </div>

          <div className="add_client_form_group">
            <label className="add_client_label">
              Email Address <span className="add_client_required">*</span>
            </label>
            <Input
              type="email"
              placeholder="client@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={errors.email}
              variant="rounded"
              icon={<Mail size={16} />}
              disabled={isSubmitting}
            />
          </div>

          <div className="add_client_form_group">
            <label className="add_client_label">
              Phone Number <span className="add_client_required">*</span>
            </label>
            <Input
              type="tel"
              placeholder="+234 803 456 7890"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              error={errors.phone}
              variant="rounded"
              disabled={isSubmitting}
            />
          </div>

          <div className="add_client_form_group">
            <label className="add_client_label">Address</label>
            <Input
              type="text"
              placeholder="Enter client's address (optional)"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              error={errors.address}
              variant="rounded"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Status Section */}
        <div className="add_client_section">
          <div className="add_client_section_header">
            <div className="add_client_status_icon">
              <div className="add_client_status_dot"></div>
            </div>
            <h3 className="add_client_section_title">Status</h3>
          </div>

          <div className="add_client_status_buttons">
            <button
              type="button"
              className={`add_client_status_btn ${
                formData.status === "Active" ? "active" : ""
              }`}
              onClick={() => handleStatusChange("Active")}
              disabled={isSubmitting}
            >
              <div className="add_client_status_indicator active"></div>
              Active
            </button>
            <button
              type="button"
              className={`add_client_status_btn ${
                formData.status === "Inactive" ? "active" : ""
              }`}
              onClick={() => handleStatusChange("Inactive")}
              disabled={isSubmitting}
            >
              <div className="add_client_status_indicator inactive"></div>
              Inactive
            </button>
          </div>
        </div>

        {/* Notes Section */}
        <div className="add_client_section">
          <div className="add_client_section_header">
            <FileText size={20} className="add_client_section_icon" />
            <h3 className="add_client_section_title">Notes</h3>
          </div>

          <div className="add_client_form_group">
            <Input
              type="textarea"
              placeholder="Add notes about this client (preferences, special requirements, etc.)"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              variant="rounded"
              rows={4}
              disabled={isSubmitting}
            />
            <p className="add_client_optional_text">
              Optional - Add any relevant information about the client
            </p>
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="add_client_error">
            <p>{errors.submit}</p>
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          className="add_client_save_btn"
          disabled={isSubmitting}
        >
          <FileText size={20} />
          {isSubmitting ? "Saving..." : editMode ? "Save Changes" : "Save Client"}
        </button>

        {/* Next Steps Info - only shown when creating */}
        {!editMode && (
        <div className="add_client_next_steps">
          <div className="add_client_next_steps_header">
            <Info size={16} className="add_client_info_icon" />
            <span className="add_client_next_steps_title">Next Steps</span>
          </div>
          <p className="add_client_next_steps_text">
            After saving the client, you can add measurements, attach orders,
            and create invoices from their profile.
          </p>
        </div>
        )}
      </form>
    </div>
  );
};

export default AddClientPanel;
