import { useState, useContext } from "react";
import { User, Mail, FileText, Info } from "lucide-react";
import NewAuthContext from "../../contexts/NewAuthContext";
import Input from "../../components/Input/Input";
import "./AddClientPanel.css";
import { X } from "lucide-react";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

const AddClientPanel = ({ onClose, editMode = false, clientData = null, onSuccess }) => {
  const { t: tx } = useTranslation();
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
      newErrors.fullName = tx("auto.fullNameIsRequired_abf3");
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = tx("auto.nameMustBeAtLeast_0acc");
    }

    if (!formData.email.trim()) {
      newErrors.email = tx("auto.emailAddressIsRequired_e7f0");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = tx("auto.pleaseEnterAValidEmail_0802");
    }

    if (!formData.phone.trim()) {
      newErrors.phone = tx("auto.phoneNumberIsRequired_f845");
    } else if (formData.phone.trim().length < 6) {
      newErrors.phone = tx("auto.pleaseEnterAValidPhone_4986");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user?.email) {
      setErrors({ submit: tx("auto.youMustBeLoggedIn_b23c") });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const token = localStorage.getItem("authToken");
      const cleanedPhone = formData.phone.replace(/\s+/g, "").replace(/[-()+]/g, "");
      const payload = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: cleanedPhone,
        address: formData.address.trim() || "",
        status: formData.status,
        notes: formData.notes.trim() || "",
      };

      let res, data;

      if (editMode && clientData) {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/client/edit/${clientData.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/client/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          }
        );
      }

      data = await res.json();

      if (!data.success) {
        const msg = data.error || "Failed to save client";
        if (msg.toLowerCase().includes("phone")) {
          setErrors({ phone: msg });
        } else {
          setErrors({ submit: msg });
        }
        return;
      }

      setFormData({ fullName: "", email: "", phone: "", address: "", status: "Active", notes: "" });
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving client:", error);
      setErrors({ submit: tx("auto.failedToSaveClientPlease_3a05") });
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
        <h2 className="add_client_title">{tl(editMode ? tx("auto.editClient_f618") : tx("auto.addNewClient_69d9"))}</h2>
      </div>

      {/* Form */}
      <form className="add_client_form" onSubmit={handleSubmit}>
        {/* Client Information Section */}
        <div className="add_client_section">
          <div className="add_client_section_header">
            <User size={20} className="add_client_section_icon" />
            <h3 className="add_client_section_title">{tx("auto.clientInformation_9b2e")}</h3>
          </div>

          <div className="add_client_form_group">
            <label className="add_client_label">
              {tx("auto.fullName_6434")}{" "}<span className="add_client_required">*</span>
            </label>
            <Input
              type="text"
              placeholder={tx("auto.enterClientSFullName_29f9")}
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              error={errors.fullName}
              variant="rounded"
              disabled={isSubmitting}
            />
          </div>

          <div className="add_client_form_group">
            <label className="add_client_label">
              {tx("auto.emailAddress_09ba")}{" "}<span className="add_client_required">*</span>
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
              {tx("auto.phoneNumber_ab25")}{" "}<span className="add_client_required">*</span>
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
            <label className="add_client_label">{tx("auto.address_d70f")}</label>
            <Input
              type="text"
              placeholder={tx("auto.enterClientSAddressOptional_5ed9")}
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
            <h3 className="add_client_section_title">{tx("auto.status_bae7")}</h3>
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
              {tx("auto.active_a733")}
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
              {tx("auto.inactive_09af")}
            </button>
          </div>
        </div>

        {/* Notes Section */}
        <div className="add_client_section">
          <div className="add_client_section_header">
            <FileText size={20} className="add_client_section_icon" />
            <h3 className="add_client_section_title">{tx("auto.notes_7044")}</h3>
          </div>

          <div className="add_client_form_group">
            <Input
              type="textarea"
              placeholder={tx("auto.addNotesAboutThisClient_e321")}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              variant="rounded"
              rows={4}
              disabled={isSubmitting}
            />
            <p className="add_client_optional_text">
              {tx("auto.optionalAddAnyRelevantInformatio_73ad")}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="add_client_error">
            <p>{tl(errors.submit)}</p>
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          className="add_client_save_btn"
          disabled={isSubmitting}
        >
          <FileText size={20} />
          {isSubmitting ? tx("auto.saving_ae7e") : editMode ? tx("auto.saveChanges_fa29") : tx("auto.saveClient_1958")}
        </button>

        {/* Next Steps Info - only shown when creating */}
        {!editMode && (
        <div className="add_client_next_steps">
          <div className="add_client_next_steps_header">
            <Info size={16} className="add_client_info_icon" />
            <span className="add_client_next_steps_title">{tx("auto.nextSteps_3f17")}</span>
          </div>
          <p className="add_client_next_steps_text">
            {tx("auto.afterSavingTheClientYou_bf24")}
          </p>
        </div>
        )}
      </form>
    </div>
  );
};

export default AddClientPanel;
