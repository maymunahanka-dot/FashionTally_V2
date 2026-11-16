import { useState, useEffect, useContext, useRef } from "react";
import { Plus, Upload, X } from "lucide-react";
import NewAuthContext from "../../contexts/NewAuthContext";
import Input from "../../components/Input/Input";
import Button from "../../components/button/Button";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import { currencySymbol, getNgnPerUnit } from "../../utils/exchangeRate";
import "./AddInventoryPanel.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../i18n";

import { tl } from "../../i18n";

const AddInventoryPanel = ({ onClose, selectedItem, isEditMode, onSuccess }) => {
  const { t: tx } = useTranslation();
  // Individual useState for each input field
  const [itemName, setItemName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [suppliers, setSuppliers] = useState([{ name: "", contact: "" }]);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [storedNaira, setStoredNaira] = useState(null);
  const [currency, setCurrency] = useState("NGN");
  const [usdToNgn, setUsdToNgn] = useState(null);
  const priceTouched = useRef(false);
  const [minStockAlert, setMinStockAlert] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [, setRecordAsExpense] = useState(false); // Default to false (commented out feature)
  const [, setUpdateFinanceTransaction] = useState(true); // For edit mode

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useContext(NewAuthContext);

  useEffect(() => {
    const email = getEffectiveUserEmail(user);
    if (!email) return;
    let cancelled = false;

    const loadCurrency = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/brand-setting/get-by-email/${encodeURIComponent(email)}`
        );
        const data = await res.json();
        const nextCurrency = String(data?.data?.inventoryCurrency || "NGN").toUpperCase();
        if (!cancelled) setCurrency(nextCurrency);
        if (nextCurrency !== "NGN") {
          const rate = await getNgnPerUnit(nextCurrency);
          if (!cancelled) setUsdToNgn(rate);
        }
      } catch (error) {
        console.error("Error loading inventory currency:", error);
      }
    };

    loadCurrency();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Populate form when editing
  useEffect(() => {
    priceTouched.current = false;
    if (isEditMode && selectedItem) {
      setItemName(selectedItem.name || "");
      setSku(selectedItem.sku || selectedItem.code || "");
      setCategory(selectedItem.category || "");
      setSubcategory(selectedItem.subcategory || "");
      setSuppliers(
        selectedItem.suppliers?.some((entry) => entry?.name || entry?.contact)
          ? selectedItem.suppliers.map((entry) => ({
              name: entry.name || "",
              contact: entry.contact || "",
            }))
          : [{ name: selectedItem.supplierName || selectedItem.supplier || "", contact: "" }]
      );
      setQuantity(selectedItem.quantity?.toString() || "");
      setUnit(selectedItem.unit || "");
      const naira = Number(selectedItem.price ?? selectedItem.pricePerUnit);
      setStoredNaira(Number.isFinite(naira) ? naira : null);
      setMinStockAlert(
        selectedItem.reorderPoint?.toString() ||
          selectedItem.minStock?.toString() ||
          ""
      );
      setColor(selectedItem.color || "");
      setDescription(selectedItem.description || "");
      setImageUrl(selectedItem.imageUrl || "");
      setImagePreview(selectedItem.imageUrl || null);
      setImageFile(null);
      setRecordAsExpense(false); // Don't record as expense when editing
      setUpdateFinanceTransaction(true); // Default to true for editing
    } else {
      // Reset form for new item
      setItemName("");
      setSku("");
      setCategory("");
      setSubcategory("");
      setSuppliers([{ name: "", contact: "" }]);
      setQuantity("");
      setUnit("");
      setStoredNaira(null);
      setPricePerUnit("");
      setMinStockAlert("");
      setColor("");
      setDescription("");
      setImageUrl("");
      setImagePreview(null);
      setImageFile(null);
      setRecordAsExpense(false); // Default to false (commented out feature)
      setUpdateFinanceTransaction(true); // Not used for new items
    }
  }, [isEditMode, selectedItem]);

  useEffect(() => {
    if (priceTouched.current || !isEditMode || storedNaira == null) return;
    if (currency !== "NGN") {
      if (!usdToNgn) return;
      setPricePerUnit((storedNaira / usdToNgn).toFixed(2));
      return;
    }
    setPricePerUnit(String(storedNaira));
  }, [currency, usdToNgn, storedNaira, isEditMode]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageUpload = (file) => {
    if (file?.type.startsWith("image/")) {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const removeImage = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!itemName.trim()) {
      newErrors.itemName = tx("auto.itemNameIsRequired_e50f");
    }

    if (!sku.trim()) {
      newErrors.sku = tx("auto.skuIsRequired_a0d0");
    }

    if (!category.trim()) {
      newErrors.category = tx("auto.categoryIsRequired_eb1a");
    }

    if (!suppliers.some((entry) => entry.name.trim())) {
      newErrors.supplier = tx("auto.atLeastOneSupplierName_71b3");
    }

    if (!quantity.trim()) {
      newErrors.quantity = tx("auto.quantityIsRequired_205d");
    } else if (isNaN(quantity) || parseFloat(quantity) < 0) {
      newErrors.quantity = tx("auto.quantityMustBeAValid_0237");
    }

    if (!unit.trim()) {
      newErrors.unit = tx("auto.unitIsRequired_c7db");
    }

    if (!pricePerUnit.trim()) {
      newErrors.pricePerUnit = tx("auto.pricePerUnitIsRequired_e128");
    } else if (isNaN(pricePerUnit) || parseFloat(pricePerUnit) < 0) {
      newErrors.pricePerUnit = tx("auto.priceMustBeAValid_6fda");
    }

    if (
      minStockAlert &&
      (isNaN(minStockAlert) || parseFloat(minStockAlert) < 0)
    ) {
      newErrors.minStockAlert = tx("auto.minStockAlertMustBe_3755");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateStatus = (qty, reorderPoint) => {
    const quantityNum = parseFloat(qty) || 0;
    const reorderNum = parseFloat(reorderPoint) || 0;

    if (quantityNum <= 0) {
      return "Out of Stock";
    } else if (quantityNum <= reorderNum) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user?.email) { setErrors({ submit: tx("auto.youMustBeLoggedIn_9abe") }); return; }

    setIsSubmitting(true);
    setErrors({});

    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        name: itemName.trim(),
        sku: sku.trim(),
        category,
        subcategory: subcategory.trim() || "",
        suppliers: suppliers
          .map((entry) => ({ name: entry.name.trim(), contact: entry.contact.trim() }))
          .filter((entry) => entry.name || entry.contact),
        supplierName: suppliers.map((entry) => entry.name.trim()).find(Boolean) || "",
        quantity: parseFloat(quantity) || 0,
        unit,
        price: (() => {
          const entered = parseFloat(pricePerUnit) || 0;
          if (currency === "NGN") return entered;
          if (!usdToNgn) throw new Error("Exchange rate is still loading. Try again in a moment.");
          return Math.round(entered * usdToNgn * 100) / 100;
        })(),
        reorderPoint: parseFloat(minStockAlert) || 0,
        status: calculateStatus(quantity, minStockAlert),
        color: color.trim() || "",
        description: description.trim() || "",
        imageUrl: imageUrl || "",
      };
      const body = new FormData();
      body.append("data", JSON.stringify(payload));
      if (imageFile) body.append("image", imageFile);

      let res;
      if (isEditMode && selectedItem?.id) {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/inventory/edit/${selectedItem.id}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body,
          }
        );
      } else {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/inventory/create`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body,
          }
        );
      }

      const data = await res.json();
      if (!data.success) {
        setErrors({ submit: data.error || tx("auto.failedToSaveInventoryItem_b1ad") });
        return;
      }

      setItemName(""); setSku(""); setCategory(""); setSubcategory("");
      setSuppliers([{ name: "", contact: "" }]); setQuantity(""); setUnit(""); setPricePerUnit("");
      setMinStockAlert(""); setColor(""); setDescription("");
      setImageUrl(""); setImagePreview(null); setImageFile(null);
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving inventory item:", error);
      setErrors({ submit: error.message || tx("auto.failedToSaveInventoryItem_5e16") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add_inv_panel">
      {/* Header */}
      <div className="add_inv_header">
        <button className="add_inv_close_btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="add_inv_title">
          {tl(isEditMode ? tx("auto.editInventoryItem_f3e5") : tx("auto.addInventoryItem_7bb3"))}
        </h2>
      </div>

      {/* Form */}
      <form className="add_inv_form" onSubmit={handleSubmit}>
        {/* Item Name */}
        <div className="add_inv_form_group">
          <Input
            label={tx("auto.itemName_497c")}
            type="text"
            placeholder={tx("auto.eGAnkaraPrintFabric_9d4c")}
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              clearError("itemName");
            }}
            error={errors.itemName}
            required
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        {/* SKU */}
        <div className="add_inv_form_group">
          <Input
            label={tx("auto.skuStockKeepingUnit_48d7")}
            type="text"
            placeholder={tx("auto.eGAnk001_adff")}
            value={sku}
            onChange={(e) => {
              setSku(e.target.value);
              clearError("sku");
            }}
            error={errors.sku}
            required
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        {/* Category */}
        <div className="add_inv_form_group">
          <Input
            label={tx("auto.category_a3c6")}
            type="text"
            placeholder={tx("auto.eGFabricNotionsThreads_fb35")}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              clearError("category");
            }}
            error={errors.category}
            required
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        {/* Subcategory */}
        <div className="add_inv_form_group">
          <Input
            label={tx("auto.subcategoryOptional_fda4")}
            type="text"
            placeholder={tx("auto.eGCottonSilkPolyester_fd14")}
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        <div className="add_inv_form_group">
          <p className="add_inv_upload_label">{tx("auto.suppliers_6f76")}</p>
          {suppliers.map((entry, index) => (
            <div className="add_inv_supplier_block" key={index}>
              <div className="add_inv_supplier_head">
                <span>{tl(suppliers.length > 1 ? `Supplier ${index + 1}` : tx("auto.supplier_55ed"))}</span>
                {suppliers.length > 1 && (
                  <button
                    type="button"
                    className="add_inv_supplier_remove"
                    onClick={() => setSuppliers(suppliers.filter((_, i) => i !== index))}
                    disabled={isSubmitting}
                    aria-label="Remove supplier"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="add_inv_supplier_fields">
                <Input
                  label={tx("auto.name_709a")}
                  type="text"
                  placeholder={tx("auto.lagosTextilesLtd_3966")}
                  value={entry.name}
                  onChange={(e) => {
                    const next = [...suppliers];
                    next[index] = { ...next[index], name: e.target.value };
                    setSuppliers(next);
                    clearError("supplier");
                  }}
                  error={index === 0 ? errors.supplier : ""}
                  required={index === 0}
                  variant="rounded"
                  disabled={isSubmitting}
                />
                <Input
                  label={tx("auto.contact_b374")}
                  type="text"
                  placeholder={tx("auto.phoneOrEmail_c338")}
                  value={entry.contact}
                  onChange={(e) => {
                    const next = [...suppliers];
                    next[index] = { ...next[index], contact: e.target.value };
                    setSuppliers(next);
                  }}
                  variant="rounded"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="add_inv_supplier_add"
            onClick={() => setSuppliers([...suppliers, { name: "", contact: "" }])}
            disabled={isSubmitting}
          >
            <Plus size={16} />
            {tx("auto.addAnotherSupplier_86cd")}
          </button>
        </div>

        {/* Quantity and Unit Row */}
        <div className="add_inv_form_row">
          <div className="add_inv_form_group add_inv_form_group_half">
            <Input
              label={tx("auto.quantity_44f6")}
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                clearError("quantity");
              }}
              error={errors.quantity}
              required
              variant="rounded"
              disabled={isSubmitting}
            />
          </div>
          <div className="add_inv_form_group add_inv_form_group_half">
            <Input
              label={tx("auto.unit_f6b9")}
              type="select"
              placeholder={tx("auto.selectUnit_bc6d")}
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                clearError("unit");
              }}
              error={errors.unit}
              required
              variant="rounded"
              disabled={isSubmitting}
              options={[
                { value: "", label: "Select unit" },
                { value: "yards", label: "Yards" },
                { value: "meters", label: "Meters" },
                { value: "pieces", label: "Pieces" },
                { value: "rolls", label: "Rolls" },
                { value: "spools", label: "Spools" },
                { value: "sets", label: "Sets" },
              ]}
            />
          </div>
        </div>

        {/* Price per Unit and Min Stock Alert Row */}
        <div className="add_inv_form_row">
          <div className="add_inv_form_group add_inv_form_group_half">
            <Input
              label={tx("tpl.pricePerUnit_7e4c", { v0: currencySymbol(currency) })}
              type="number"
              placeholder="0"
              step="0.01"
              value={pricePerUnit}
              onChange={(e) => {
                priceTouched.current = true;
                setPricePerUnit(e.target.value);
                clearError("pricePerUnit");
              }}
              error={errors.pricePerUnit}
              required
              variant="rounded"
              disabled={isSubmitting}
            />
          </div>
          <div className="add_inv_form_group add_inv_form_group_half">
            <Input
              label={tx("auto.reorderPoint_4f32")}
              type="number"
              placeholder="0"
              value={minStockAlert}
              onChange={(e) => {
                setMinStockAlert(e.target.value);
                clearError("minStockAlert");
              }}
              error={errors.minStockAlert}
              variant="rounded"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Color */}
        <div className="add_inv_form_group">
          <Input
            label={tx("auto.colorOptional_a3d7")}
            type="text"
            placeholder={tx("auto.eGRedBlueMulti_e91d")}
            value={color}
            onChange={(e) => setColor(e.target.value)}
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div className="add_inv_form_group">
          <Input
            label={tx("auto.description_55f8")}
            type="textarea"
            placeholder={tx("auto.addNotesAboutThisItem_e26b")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="rounded"
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <div className="add_inv_form_group">
          <p className="add_inv_upload_label">{tx("auto.itemImageOptional_c259")}</p>
          <div
            className={`add_inv_upload_area ${dragOver ? "drag_over" : ""} ${imagePreview ? "has_image" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageUpload(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
            tabIndex={0}
            role="button"
            aria-label="Upload item image"
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} className="add_inv_file_input" />
            {imagePreview ? (
              <div className="add_inv_preview_wrap">
                <img src={imagePreview} alt="Preview" className="add_inv_preview_img" />
                <div className="add_inv_preview_overlay">
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(); }} className="add_inv_remove_img_btn">
                    <X size={16} />
                  </button>
                  <span>{tx("auto.clickToChange_31d9")}</span>
                </div>
              </div>
            ) : (
              <div className="add_inv_upload_placeholder">
                <div className="add_inv_upload_icon_wrap"><Upload size={28} /></div>
                <p>{tx("auto.clickOrDragToUpload_ef5c")}</p>
                <span>{tx("auto.pngJpgUpTo10mb_951d")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="add_inv_error">
            <p>{tl(errors.submit)}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? tx("auto.saving_ae7e") : isEditMode ? tx("auto.updateItem_8297") : tx("auto.addItem_4dba")}
        </Button>
      </form>
    </div>
  );
};

export default AddInventoryPanel;
