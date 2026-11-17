import { useState, useRef, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Input from "../../components/Input/Input";
import SearchableSelect from "../../components/SearchableSelect";
import Button from "../../components/button/Button";
import { CurrencyHint } from "../../components/MoneyAmount/MoneyAmount";
import { useDisplayCurrency } from "../../utils/useDisplayCurrency";
import "./AddDesignPanel.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

/** `isOpen`: the slide-in panel stays mounted, so clients are reloaded each time it opens. */
const AddDesignPanel = ({ onClose, onSubmit, editMode = false, initialData = null, isOpen }) => {
  const { t: tx } = useTranslation();
  const { user } = useNewAuth();
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  const priceTouched = useRef(false);
  const { currency, usdToNgn, symbol, toNaira, fromNaira } = useDisplayCurrency();

  const [formData, setFormData] = useState({
    name: "", category: "Uniforms", customCategory: "",
    description: "", price: "", imageUrl: "", images: [],
    clientId: "", clientName: "", clientPhone: "",
  });

  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const categories = ["Uniforms","Shirts","Children's Wear","Dresses","Tops","Bottoms","Others"];

  // Load clients each time the panel opens, so a client added a moment ago is listed
  useEffect(() => { if (user?.email && isOpen !== false) loadClients(); }, [user?.email, isOpen]);

  const loadClients = async () => {
    try {
      setClientsLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/client/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClients(data.success ? data.data : []);
    } catch (e) {
      console.error("Error loading clients:", e);
    } finally {
      setClientsLoading(false);
    }
  };

  // Picking a client fills name and phone; × unlinks the client (the typed details stay editable)
  const handleClientSelect = (clientId) => {
    const client = clientId ? clients.find((c) => (c.id || c._id) === clientId) : null;
    setFormData((prev) =>
      client
        ? { ...prev, clientId: client.id || client._id, clientName: client.name || "", clientPhone: client.phone || "" }
        : { ...prev, clientId: "" }
    );
  };

  useEffect(() => {
    priceTouched.current = false;
    if (editMode && initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "Uniforms",
        customCategory: initialData.customCategory || "",
        description: initialData.description || "",
        price: initialData.price || "",
        imageUrl: initialData.imageUrl || "",
        images: initialData.images || [],
        clientId: initialData.clientId || "",
        clientName: initialData.clientName || "",
        clientPhone: initialData.clientPhone || "",
      });
      if (initialData.imageUrl || initialData.images?.[0]) {
        setImagePreview(initialData.imageUrl || initialData.images[0]);
      }
    } else if (initialData?.clientId || initialData?.clientName) {
      setFormData((prev) => ({
        ...prev,
        clientId: initialData.clientId || "",
        clientName: initialData.clientName || "",
        clientPhone: initialData.clientPhone || "",
      }));
    } else {
      setFormData({ name: "", category: "Uniforms", customCategory: "", description: "", price: "", imageUrl: "", images: [], clientId: "", clientName: "", clientPhone: "" });
    }
    setErrors({});
  }, [editMode, initialData]);

  useEffect(() => {
    if (priceTouched.current || !editMode || !initialData) return;
    if (currency !== "NGN" && !usdToNgn) return;
    setFormData((prev) => ({ ...prev, price: fromNaira(initialData.price) }));
  }, [currency, usdToNgn, editMode, initialData]);

  useEffect(() => {
    return () => { if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  const handleInputChange = (field) => (e) => {
    if (field === "price") priceTouched.current = true;
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageUpload = (file) => {
    if (file?.type.startsWith("image/")) {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const removeImage = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setFormData((prev) => ({ ...prev, images: [], imageUrl: "" }));
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = tx("auto.designNameIsRequired_b254");
    if (!formData.category) newErrors.category = tx("auto.categoryIsRequired_eb1a");
    if (formData.category === "Others" && !formData.customCategory.trim())
      newErrors.customCategory = tx("auto.customCategoryIsRequired_403f");
    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) < 0))
      newErrors.price = tx("auto.pleaseEnterAValidPrice_5fe2");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !user?.email) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        customCategory: formData.category === "Others" ? formData.customCategory.trim() : "",
        description: formData.description.trim(),
        price: formData.price ? toNaira(formData.price) : 0,
        imageUrl: formData.imageUrl || "",
        clientId: formData.clientId || "",
        clientName: formData.clientName || "",
        clientPhone: formData.clientPhone || "",
        status: "Active",
      };
      const body = new FormData();
      body.append("data", JSON.stringify(payload));
      if (imageFile) body.append("image", imageFile);

      const url = editMode && initialData?.id
        ? `${import.meta.env.VITE_BACKEND_URL}/api/design/edit/${initialData.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/design/create`;

      const res = await fetch(url, {
        method: editMode && initialData?.id ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (onSubmit) await onSubmit();
      handleClose();
    } catch (error) {
      console.error("Error saving design:", error);
      alert(error.message || tx("auto.errorSavingDesignPleaseTry_d417"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setFormData({ name: "", category: "Uniforms", customCategory: "", description: "", price: "", imageUrl: "", images: [], clientId: "", clientName: "", clientPhone: "" });
    setErrors({});
    setImagePreview(null);
    setImageFile(null);
    onClose();
  };

  return (
    <div className={`adp_panel ${isDark ? "dark-theme" : "light-theme"}`}>
      {/* Header */}
      <div className="adp_header">
        <button className="adp_close_btn" onClick={handleClose} type="button">
          <X size={20} />
        </button>
        <h2 className="adp_title">{tl(editMode ? tx("auto.editDesign_1317") : tx("auto.addNewDesign_a51d"))}</h2>
      </div>

      <form onSubmit={handleSubmit} className="adp_form">

        {/* Client Section */}
        <div className="adp_section">
          <p className="adp_section_label">{tx("auto.clientOptional_4042")}</p>
          <SearchableSelect
              placeholder={clientsLoading && !clients.length ? tl("Loading clients...") : tl("Search clients by name or phone")}
              value={formData.clientId || ""}
              onChange={handleClientSelect}
              loading={clientsLoading}
              loadingText={tl("Loading clients...")}
              emptyText={tl("No clients yet. Add one in Clients, or type the details below.")}
              clearable
              options={clients.map((c) => ({
                value: c.id || c._id,
                label: c.name || c.email || c.phone,
                hint: c.phone,
                search: c.email,
              }))}
            />
          <div className="adp_row">
            <Input
              type="text"
              label={tx("auto.clientName_130c")}
              placeholder={tx("auto.enterClientName_9691")}
              value={formData.clientName}
              onChange={handleInputChange("clientName")}
              variant="rounded"
            />
            <Input
              type="tel"
              label={tx("auto.clientPhone_93d9")}
              placeholder={tx("auto.eG08034567890_5ce3")}
              value={formData.clientPhone}
              onChange={handleInputChange("clientPhone")}
              variant="rounded"
            />
          </div>
        </div>

        {/* Design Name */}
        <div className="adp_section">
          <Input
            type="text"
            label={tx("auto.designName_e668")}
            placeholder={tx("auto.eGAnkaraMaxiDress_dc17")}
            value={formData.name}
            onChange={handleInputChange("name")}
            error={errors.name}
            variant="rounded"
          />
        </div>

        {/* Category */}
        <div className="adp_section">
          <Input
            type="select"
            label={tx("auto.category_b1e9")}
            value={formData.category}
            onChange={handleInputChange("category")}
            error={errors.category}
            variant="rounded"
            options={categories.map((c) => ({ value: c, label: c }))}
          />
        </div>

        {formData.category === "Others" && (
          <div className="adp_section">
            <Input
              type="text"
              label={tx("auto.customCategory_3b14")}
              placeholder={tx("auto.enterCustomCategory_f47a")}
              value={formData.customCategory}
              onChange={handleInputChange("customCategory")}
              error={errors.customCategory}
              variant="rounded"
            />
          </div>
        )}

        {/* Price */}
        <div className="adp_section">
          <Input
            type="number"
            label={tx("tpl.price_dc72", { v0: symbol })}
            placeholder={currency !== "NGN" ? tx("auto.eG50_d0c3") : tx("auto.eG85000_f1bb")}
            value={formData.price}
            onChange={handleInputChange("price")}
            error={errors.price}
            variant="rounded"
            min="0"
          />
          <CurrencyHint currency={currency} usdToNgn={usdToNgn} amount={formData.price} />
        </div>

        {/* Description */}
        <div className="adp_section">
          <Input
            type="textarea"
            label={tx("auto.description_55f8")}
            placeholder={tx("auto.briefDescriptionOfTheDesign_7ce0")}
            value={formData.description}
            onChange={handleInputChange("description")}
            variant="rounded"
            rows={3}
          />
        </div>

        {/* Image Upload */}
        <div className="adp_section">
          <p className="adp_section_label">{tx("auto.designImageOptional_95de")}</p>
          <div
            className={`adp_upload_area ${dragOver ? "drag_over" : ""} ${imagePreview ? "has_image" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageUpload(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
            tabIndex={0}
            role="button"
            aria-label="Upload design image"
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} className="adp_file_input" />
            {imagePreview ? (
              <div className="adp_preview_wrap">
                <img src={imagePreview} alt="Preview" className="adp_preview_img" />
                <div className="adp_preview_overlay">
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(); }} className="adp_remove_img_btn">
                    <X size={16} />
                  </button>
                  <span>{tx("auto.clickToChange_31d9")}</span>
                </div>
              </div>
            ) : (
              <div className="adp_upload_placeholder">
                <div className="adp_upload_icon_wrap"><Upload size={28} /></div>
                <p>{tx("auto.clickOrDragToUpload_ef5c")}</p>
                <span>{tx("auto.pngJpgUpTo10mb_951d")}</span>
              </div>
            )}
          </div>
        </div>

        <Button type="submit" variant="primary"  fullWidth disabled={isSubmitting} className="adp_submit_btn">
          {isSubmitting ? tx("auto.saving_ae7e") : editMode ? tx("auto.updateDesign_21e7") : tx("auto.createDesign_d641")}
        </Button>
      </form>

    </div>
  );
};

export default AddDesignPanel;
