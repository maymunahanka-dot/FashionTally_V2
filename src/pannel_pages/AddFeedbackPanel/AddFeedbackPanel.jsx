import { useState, useEffect, useRef } from "react";
import { Upload, X, Star } from "lucide-react";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import {
  addFeedback,
  updateFeedback,
  getClients,
  getOrders,
  getInvoices,
} from "../../backend/services/crmService";
import Input from "../../components/Input";
import SearchableSelect from "../../components/SearchableSelect";
import "./AddFeedbackPanel.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

/** `isOpen`: the slide-in panel stays mounted, so clients are reloaded each time it opens. */
const AddFeedbackPanel = ({ onClose, onSubmit, editingFeedback, editMode, isOpen }) => {
  const { t: tx } = useTranslation();
  const { user } = useNewAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  // Form state - initialize with editing data if available
  const [formData, setFormData] = useState({
    clientName: editingFeedback?.clientName || "",
    clientEmail: editingFeedback?.clientEmail || "",
    rating: editingFeedback?.rating || 5,
    comment: editingFeedback?.comment || "",
    productName: editingFeedback?.productName || "",
    orderNumber: editingFeedback?.orderNumber || "",
    invoiceNumber: editingFeedback?.invoiceNumber || "",
    status: editingFeedback?.status || "approved",
    isPublic:
      editingFeedback?.isPublic !== undefined ? editingFeedback.isPublic : true,
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(editingFeedback?.imageUrl || null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(editingFeedback?.imageUrl || "");
  const fileInputRef = useRef(null);

  // Fetch clients, orders, and invoices on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email || isOpen === false) return;

      setClientsLoading(true);
      try {
        // Get effective email (main admin's email for team members)
        const effectiveEmail = getEffectiveUserEmail(user);

        const [clientsData, ordersData, invoicesData] = await Promise.all([
          getClients(effectiveEmail),
          getOrders(effectiveEmail),
          getInvoices(effectiveEmail),
        ]);

        setClients(clientsData);
        setOrders(ordersData);
        setInvoices(invoicesData);

        // If editing, find and set the selected client
        if (editingFeedback && clientsData.length > 0) {
          const client = clientsData.find(
            (c) =>
              c.name === editingFeedback.clientName ||
              c.email === editingFeedback.clientEmail
          );
          if (client) {
            setSelectedClient(client);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setClientsLoading(false);
      }
    };

    fetchData();
  }, [user?.email, editingFeedback, isOpen]);

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleClientSelect = (clientId) => {
    const client = clientId ? clients.find((c) => (c.id || c._id) === clientId) : null;
    if (client) {
      setSelectedClient(client);
      setFormData((prev) => ({
        ...prev,
        clientName: client.name || "",
        clientEmail: client.email || "",
      }));
      clearError("clientName");
      clearError("clientEmail");
    } else {
      // Manual entry
      setSelectedClient(null);
    }
  };

  const handleOrderSelect = (orderNumber) => {
    const order = orders.find(
      (o) => o.orderNumber === orderNumber || o.id === orderNumber
    );
    if (order) {
      setFormData((prev) => ({
        ...prev,
        orderNumber: order.orderNumber || order.id,
        productName: order.productName || order.description || prev.productName,
      }));
    }
  };

  const handleInvoiceSelect = (invoiceNumber) => {
    const invoice = invoices.find(
      (i) => i.invoiceNumber === invoiceNumber || i.id === invoiceNumber
    );
    if (invoice) {
      setFormData((prev) => ({
        ...prev,
        invoiceNumber: invoice.invoiceNumber || invoice.id,
      }));
    }
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = tx("auto.clientNameIsRequired_2cf1");
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = tx("auto.clientEmailIsRequired_976c");
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = tx("auto.pleaseEnterAValidEmail_0802");
    }

    if (!formData.comment.trim()) {
      newErrors.comment = tx("auto.feedbackCommentIsRequired_59a4");
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = tx("auto.ratingMustBeBetween1_0380");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.email) {
      alert(tx("auto.userNotAuthenticated_dc86"));
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (editMode && editingFeedback?.id) {
        // Update existing feedback
        const updateData = {
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          rating: formData.rating,
          comment: formData.comment,
          productName: formData.productName,
          orderNumber: formData.orderNumber,
          invoiceNumber: formData.invoiceNumber,
          status: formData.status,
          isPublic: formData.isPublic,
          imageUrl: imageUrl || "",
        };

        console.log("Updating feedback:", updateData);
        await updateFeedback(editingFeedback.id, updateData, imageFile);
        console.log("Feedback updated successfully");
      } else {
        // Create new feedback
        const clientId = selectedClient?.id || `client_${Date.now()}`;

        // Get effective email (main admin's email for team members)
        const effectiveEmail = getEffectiveUserEmail(user);

        const feedbackData = {
          ...formData,
          clientId,
          imageUrl: imageUrl || "",
        };

        console.log("Saving feedback with effective email:", effectiveEmail);
        console.log("Saving feedback:", feedbackData);
        const docId = await addFeedback(feedbackData, effectiveEmail, imageFile);
        console.log("Feedback created successfully with ID:", docId);
      }

      // Reset form
      setFormData({
        clientName: "",
        clientEmail: "",
        rating: 5,
        comment: "",
        productName: "",
        orderNumber: "",
        invoiceNumber: "",
        status: "approved",
        isPublic: true,
      });
      setSelectedClient(null);

      onClose();

      // Call onSubmit callback after successful save and form reset
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert(tx("auto.failedToSaveFeedbackPlease_bae7"));
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      return (
        <button
          key={starNumber}
          type="button"
          onClick={() => handleRatingChange(starNumber)}
          className="add_feedback_star_btn"
        >
          <Star
            size={24}
            className={
              starNumber <= formData.rating
                ? "add_feedback_star_filled"
                : "add_feedback_star_empty"
            }
            fill={starNumber <= formData.rating ? "#f59e0b" : "none"}
            color={starNumber <= formData.rating ? "#f59e0b" : "#e5e7eb"}
          />
        </button>
      );
    });
  };

  return (
    <div className="add_feedback_panel">
      {/* Header */}
      <div className="add_feedback_header">
        <button className="add_feedback_close_btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="add_feedback_title">
          {tl(editMode ? tx("auto.editClientFeedback_53f9") : tx("auto.addClientFeedback_c329"))}
        </h2>
      </div>

      {/* Form */}
      <form className="add_feedback_form" onSubmit={handleSubmit}>
        {/* Client Selection */}
        <div className="add_feedback_form_group">
          <SearchableSelect
            label={tx("auto.selectClient_bed9")}
            placeholder={clientsLoading && !clients.length ? tl("Loading clients...") : tl("Search clients by name or phone")}
            value={selectedClient ? selectedClient.id || selectedClient._id : ""}
            onChange={handleClientSelect}
            loading={clientsLoading}
            loadingText={tl("Loading clients...")}
            emptyText={tl("No clients yet. Add one in Clients, or type the details below.")}
            clearable
            options={clients.map((client) => ({
              value: client.id || client._id,
              label: client.name || client.email || client.phone,
              hint: client.phone || client.email,
              search: `${client.email || ""} ${client.phone || ""}`,
            }))}
          />
        </div>

        {/* Client Information Row */}
        <div className="add_feedback_form_row">
          <div className="add_feedback_form_group add_feedback_form_group_half">
            <Input
              label={tx("auto.clientName_95a0")}
              type="text"
              placeholder={tx("auto.eGSarahJohnson_9edf")}
              value={formData.clientName}
              onChange={(e) => handleInputChange("clientName", e.target.value)}
              error={errors.clientName}
              required
              variant="rounded"
              disabled={!!selectedClient}
            />
          </div>
          <div className="add_feedback_form_group add_feedback_form_group_half">
            <Input
              label={tx("auto.clientEmail_a93a")}
              type="email"
              placeholder="sarah@example.com"
              value={formData.clientEmail}
              onChange={(e) => handleInputChange("clientEmail", e.target.value)}
              error={errors.clientEmail}
              required
              variant="rounded"
              disabled={!!selectedClient}
            />
          </div>
        </div>

        {/* Rating */}
        <div className="add_feedback_form_group">
          <label className="add_feedback_label">{tx("auto.rating_3414")}</label>
          <div className="add_feedback_rating">
            {tl(renderStars())}
            <span className="add_feedback_rating_text">
              ({tl(formData.rating)}{" "}{tx("auto.star_4e3e")}{tl(formData.rating !== 1 ? "s" : "")})
            </span>
          </div>
          {errors.rating && (
            <span className="add_feedback_error">{tl(errors.rating)}</span>
          )}
        </div>

        {/* Feedback Comment */}
        <div className="add_feedback_form_group">
          <Input
            label={tx("auto.feedbackComment_6405")}
            type="textarea"
            placeholder={tx("auto.shareYourExperienceWithOur_30f5")}
            value={formData.comment}
            onChange={(e) => handleInputChange("comment", e.target.value)}
            error={errors.comment}
            required
            variant="rounded"
            rows={4}
          />
        </div>

        {/* Product and Order Information Row */}
        <div className="add_feedback_form_row">
          <div className="add_feedback_form_group add_feedback_form_group_half">
            <Input
              label={tx("auto.productService_8b9c")}
              type="text"
              placeholder={tx("auto.eGCustomEveningGown_a64c")}
              value={formData.productName}
              onChange={(e) => handleInputChange("productName", e.target.value)}
              variant="rounded"
            />
          </div>
          <div className="add_feedback_form_group add_feedback_form_group_half">
            <Input
              label={tx("auto.selectOrderOptional_7a00")}
              type="select"
              value={formData.orderNumber}
              onChange={(e) => handleOrderSelect(e.target.value)}
              variant="rounded"
              options={[
                { value: "", label: "Select order" },
                ...orders.map((order) => ({
                  value: order.orderNumber || order.id,
                  label: `${order.orderNumber || order.id} - ${
                    order.productName || order.description || "Order"
                  }`,
                })),
              ]}
            />
          </div>
        </div>

        {/* Manual Order Number */}
        {!orders.find(
          (o) => (o.orderNumber || o.id) === formData.orderNumber
        ) && (
          <div className="add_feedback_form_group">
            <Input
              label={tx("auto.orderNumberManualEntry_4e78")}
              type="text"
              placeholder={tx("auto.eGOrd2023001_6c4b")}
              value={formData.orderNumber}
              onChange={(e) => handleInputChange("orderNumber", e.target.value)}
              variant="rounded"
            />
          </div>
        )}

        {/* Invoice Selection */}
        <div className="add_feedback_form_group">
          <Input
            label={tx("auto.selectInvoiceOptional_f914")}
            type="select"
            value={formData.invoiceNumber}
            onChange={(e) => handleInvoiceSelect(e.target.value)}
            variant="rounded"
            options={[
              { value: "", label: "Select invoice" },
              ...invoices.map((invoice) => ({
                value: invoice.invoiceNumber || invoice.id,
                label: `${invoice.invoiceNumber || invoice.id} - ₦${
                  invoice.total || invoice.amount || 0
                }`,
              })),
            ]}
          />
        </div>

        {/* Manual Invoice Number */}
        {!invoices.find(
          (i) => (i.invoiceNumber || i.id) === formData.invoiceNumber
        ) && (
          <div className="add_feedback_form_group">
            <Input
              label={tx("auto.invoiceNumberManualEntry_c3dd")}
              type="text"
              placeholder={tx("auto.eGInv2023001_6868")}
              value={formData.invoiceNumber}
              onChange={(e) =>
                handleInputChange("invoiceNumber", e.target.value)
              }
              variant="rounded"
            />
          </div>
        )}

        {/* Status */}
        <div className="add_feedback_form_group">
          <Input
            label={tx("auto.status_bae7")}
            type="select"
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            variant="rounded"
            options={[
              { value: "pending", label: "Pending Review" },
              { value: "approved", label: "Approved" },
              { value: "hidden", label: "Hidden" },
            ]}
          />
        </div>

        {/* Public Toggle */}
        <div className="add_feedback_form_group">
          <div className="add_feedback_toggle_group">
            <label className="add_feedback_toggle_label">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) =>
                  handleInputChange("isPublic", e.target.checked)
                }
                className="add_feedback_toggle_input"
              />
              <span className="add_feedback_toggle_text">
                {tx("auto.makeThisReviewPublic_63da")}
              </span>
            </label>
          </div>
        </div>

        <div className="add_feedback_form_group">
          <p className="add_feedback_upload_label">{tx("auto.photoOptional_fc8f")}</p>
          <div
            className={`add_feedback_upload ${imagePreview ? "has_image" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
            role="button"
            tabIndex={0}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="add_feedback_file_input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file?.type.startsWith("image/")) return;
                if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }}
            />
            {imagePreview ? (
              <img src={imagePreview} alt="Feedback" className="add_feedback_preview_img" />
            ) : (
              <div className="add_feedback_upload_placeholder">
                <Upload size={22} />
                <span>{tx("auto.clickToUpload_c77c")}</span>
              </div>
            )}
          </div>
          {imagePreview && (
            <button
              type="button"
              className="add_feedback_remove_img"
              onClick={() => {
                if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
                setImagePreview(null);
                setImageFile(null);
                setImageUrl("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              {tx("auto.removePhoto_c8f5")}
            </button>
          )}
        </div>

        {/* Preview */}
        <div className="add_feedback_preview">
          <div className="add_feedback_preview_header">
            <span className="add_feedback_preview_title">{tx("auto.reviewPreview_4306")}</span>
          </div>
          <div className="add_feedback_preview_content">
            <div className="add_feedback_preview_rating">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < formData.rating
                      ? "add_feedback_preview_star_filled"
                      : "add_feedback_preview_star_empty"
                  }
                  fill={i < formData.rating ? "#f59e0b" : "none"}
                  color={i < formData.rating ? "#f59e0b" : "#e5e7eb"}
                />
              ))}
              <span className="add_feedback_preview_rating_text">
                {tl(formData.rating)}/5
              </span>
            </div>
            <p className="add_feedback_preview_client">
              {tx("auto.from_c4d6")}{" "}{tl(formData.clientName || tx("auto.clientName_130c"))}
              {formData.productName && tx("tpl.product_0d3e", { v0: formData.productName })}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="add_feedback_submit_btn"
          disabled={loading}
        >
          {loading
            ? editMode
              ? tx("auto.updating_e349")
              : tx("auto.adding_268c")
            : editMode
            ? tx("auto.updateFeedback_a322")
            : tx("auto.addFeedback_5981")}
        </button>
      </form>
    </div>
  );
};

export default AddFeedbackPanel;
