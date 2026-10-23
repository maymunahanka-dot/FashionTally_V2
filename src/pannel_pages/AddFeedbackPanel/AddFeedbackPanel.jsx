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
import "./AddFeedbackPanel.css";

const AddFeedbackPanel = ({ onClose, onSubmit, editingFeedback, editMode }) => {
  const { user } = useNewAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
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
      if (!user?.email) return;

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
      }
    };

    fetchData();
  }, [user?.email, editingFeedback]);

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
    const client = clients.find((c) => c.id === clientId);
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
      newErrors.clientName = "Client name is required";
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = "Client email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = "Please enter a valid email address";
    }

    if (!formData.comment.trim()) {
      newErrors.comment = "Feedback comment is required";
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5 stars";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.email) {
      alert("User not authenticated");
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
      alert("Failed to save feedback. Please try again.");
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
          {editMode ? "Edit Client Feedback" : "Add Client Feedback"}
        </h2>
      </div>

      {/* Form */}
      <form className="add_feedback_form" onSubmit={handleSubmit}>
        {/* Client Selection */}
        <div className="add_feedback_form_group">
          <Input
            label="Select Client"
            type="select"
            value={selectedClient?.id || "manual"}
            onChange={(e) => handleClientSelect(e.target.value)}
            variant="rounded"
            options={[
              { value: "manual", label: "Enter manually" },
              ...clients.map((client) => ({
                value: client.id,
                label: `${client.name} (${client.email})`,
              })),
            ]}
          />
        </div>

        {/* Client Information Row */}
        <div className="add_feedback_form_row">
          <div className="add_feedback_form_group add_feedback_form_group_half">
            <Input
              label="Client Name *"
              type="text"
              placeholder="e.g., Sarah Johnson"
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
              label="Client Email *"
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
          <label className="add_feedback_label">Rating *</label>
          <div className="add_feedback_rating">
            {renderStars()}
            <span className="add_feedback_rating_text">
              ({formData.rating} star{formData.rating !== 1 ? "s" : ""})
            </span>
          </div>
          {errors.rating && (
            <span className="add_feedback_error">{errors.rating}</span>
          )}
        </div>

        {/* Feedback Comment */}
        <div className="add_feedback_form_group">
          <Input
            label="Feedback Comment *"
            type="textarea"
            placeholder="Share your experience with our service..."
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
              label="Product/Service"
              type="text"
              placeholder="e.g., Custom Evening Gown"
              value={formData.productName}
              onChange={(e) => handleInputChange("productName", e.target.value)}
              variant="rounded"
            />
          </div>
          <div className="add_feedback_form_group add_feedback_form_group_half">
            <Input
              label="Select Order (Optional)"
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
              label="Order Number (Manual Entry)"
              type="text"
              placeholder="e.g., ORD-2023-001"
              value={formData.orderNumber}
              onChange={(e) => handleInputChange("orderNumber", e.target.value)}
              variant="rounded"
            />
          </div>
        )}

        {/* Invoice Selection */}
        <div className="add_feedback_form_group">
          <Input
            label="Select Invoice (Optional)"
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
              label="Invoice Number (Manual Entry)"
              type="text"
              placeholder="e.g., INV-2023-001"
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
            label="Status"
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
                Make this review public
              </span>
            </label>
          </div>
        </div>

        <div className="add_feedback_form_group">
          <p className="add_feedback_upload_label">Photo (Optional)</p>
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
                <span>Click to upload</span>
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
              Remove photo
            </button>
          )}
        </div>

        {/* Preview */}
        <div className="add_feedback_preview">
          <div className="add_feedback_preview_header">
            <span className="add_feedback_preview_title">Review Preview</span>
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
                {formData.rating}/5
              </span>
            </div>
            <p className="add_feedback_preview_client">
              From: {formData.clientName || "Client Name"}
              {formData.productName && ` • Product: ${formData.productName}`}
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
              ? "Updating..."
              : "Adding..."
            : editMode
            ? "Update Feedback"
            : "Add Feedback"}
        </button>
      </form>
    </div>
  );
};

export default AddFeedbackPanel;
