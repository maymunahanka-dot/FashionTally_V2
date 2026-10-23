import { useState, useEffect, useContext, useRef } from "react";
import { Plus, Upload, X } from "lucide-react";
import NewAuthContext from "../../contexts/NewAuthContext";
import Input from "../../components/Input/Input";
import Button from "../../components/button/Button";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import { getUsdToNgnRate } from "../../utils/exchangeRate";
import "./AddInventoryPanel.css";

const AddInventoryPanel = ({ onClose, selectedItem, isEditMode, onSuccess }) => {
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
  const [recordAsExpense, setRecordAsExpense] = useState(false); // Default to false (commented out feature)
  const [updateFinanceTransaction, setUpdateFinanceTransaction] = useState(true); // For edit mode

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
        const nextCurrency = data?.data?.inventoryCurrency === "USD" ? "USD" : "NGN";
        if (!cancelled) setCurrency(nextCurrency);
        if (nextCurrency === "USD") {
          const rate = await getUsdToNgnRate();
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
    if (currency === "USD") {
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
      newErrors.itemName = "Item name is required";
    }

    if (!sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (!category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!suppliers.some((entry) => entry.name.trim())) {
      newErrors.supplier = "At least one supplier name is required";
    }

    if (!quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    } else if (isNaN(quantity) || parseFloat(quantity) < 0) {
      newErrors.quantity = "Quantity must be a valid number";
    }

    if (!unit.trim()) {
      newErrors.unit = "Unit is required";
    }

    if (!pricePerUnit.trim()) {
      newErrors.pricePerUnit = "Price per unit is required";
    } else if (isNaN(pricePerUnit) || parseFloat(pricePerUnit) < 0) {
      newErrors.pricePerUnit = "Price must be a valid number";
    }

    if (
      minStockAlert &&
      (isNaN(minStockAlert) || parseFloat(minStockAlert) < 0)
    ) {
      newErrors.minStockAlert = "Min stock alert must be a valid number";
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
    if (!user?.email) { setErrors({ submit: "You must be logged in to manage inventory" }); return; }

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
          if (currency !== "USD") return entered;
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
        setErrors({ submit: data.error || "Failed to save inventory item" });
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
      setErrors({ submit: error.message || "Failed to save inventory item. Please try again." });
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
          {isEditMode ? "Edit Inventory Item" : "Add Inventory Item"}
        </h2>
      </div>

      {/* Form */}
      <form className="add_inv_form" onSubmit={handleSubmit}>
        {/* Item Name */}
        <div className="add_inv_form_group">
          <Input
            label="Item Name"
            type="text"
            placeholder="e.g., Ankara Print Fabric"
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
            label="SKU (Stock Keeping Unit)"
            type="text"
            placeholder="e.g., ANK001"
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
            label="Category"
            type="text"
            placeholder="e.g., Fabric, Notions, Threads, Accessories"
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
            label="Subcategory (Optional)"
            type="text"
            placeholder="e.g., Cotton, Silk, Polyester"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        <div className="add_inv_form_group">
          <p className="add_inv_upload_label">Suppliers</p>
          {suppliers.map((entry, index) => (
            <div className="add_inv_supplier_block" key={index}>
              <div className="add_inv_supplier_head">
                <span>{suppliers.length > 1 ? `Supplier ${index + 1}` : "Supplier"}</span>
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
                  label="Name"
                  type="text"
                  placeholder="Lagos Textiles Ltd"
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
                  label="Contact"
                  type="text"
                  placeholder="Phone or email"
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
            Add another supplier
          </button>
        </div>

        {/* Quantity and Unit Row */}
        <div className="add_inv_form_row">
          <div className="add_inv_form_group add_inv_form_group_half">
            <Input
              label="Quantity"
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
              label="Unit"
              type="select"
              placeholder="Select unit"
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
              label={currency === "USD" ? "Price per Unit ($)" : "Price per Unit (₦)"}
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
            {currency === "USD" && (
              <p className="add_inv_rate_hint">
                {usdToNgn
                  ? `$1 = ₦${usdToNgn.toLocaleString()} · saves as ₦${(
                      (parseFloat(pricePerUnit) || 0) * usdToNgn
                    ).toLocaleString()}`
                  : "Loading the dollar exchange rate..."}
              </p>
            )}
          </div>
          <div className="add_inv_form_group add_inv_form_group_half">
            <Input
              label="Reorder Point"
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
            label="Color (Optional)"
            type="text"
            placeholder="e.g., Red, Blue, Multi-color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            variant="rounded"
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div className="add_inv_form_group">
          <Input
            label="Description"
            type="textarea"
            placeholder="Add notes about this item..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="rounded"
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <div className="add_inv_form_group">
          <p className="add_inv_upload_label">Item Image (Optional)</p>
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
                  <span>Click to change</span>
                </div>
              </div>
            ) : (
              <div className="add_inv_upload_placeholder">
                <div className="add_inv_upload_icon_wrap"><Upload size={28} /></div>
                <p>Click or drag to upload</p>
                <span>PNG, JPG up to 10MB</span>
              </div>
            )}
          </div>
        </div>

        {/* Record as Expense Checkbox - Only show when creating new item */}
        {/* COMMENTED OUT: Finance integration feature disabled by default */}
        {/* {!isEditMode && (
          <div className="add_inv_form_group">
            <div className="add_inv_checkbox_container">
              <input
                type="checkbox"
                id="recordAsExpense"
                checked={recordAsExpense}
                onChange={(e) => setRecordAsExpense(e.target.checked)}
                disabled={isSubmitting}
                className="add_inv_checkbox"
              />
              <label htmlFor="recordAsExpense" className="add_inv_checkbox_label">
                <span className="add_inv_checkbox_text">
                  Record as expense in finances
                </span>
                <span className="add_inv_checkbox_description">
                  Automatically create a finance transaction for this inventory purchase
                  {quantity && pricePerUnit && (
                    <span className="add_inv_expense_amount">
                      {" "}(₦{(parseFloat(quantity) * parseFloat(pricePerUnit)).toLocaleString()})
                    </span>
                  )}
                </span>
              </label>
            </div>
          </div>
        )} */}

        {/* Update Finance Transaction Checkbox - Only show when editing */}
        {/* COMMENTED OUT: Finance integration feature disabled by default */}
        {/* {isEditMode && (
          <div className="add_inv_form_group">
            <div className="add_inv_checkbox_container">
              <input
                type="checkbox"
                id="updateFinanceTransaction"
                checked={updateFinanceTransaction}
                onChange={(e) => setUpdateFinanceTransaction(e.target.checked)}
                disabled={isSubmitting}
                className="add_inv_checkbox"
              />
              <label htmlFor="updateFinanceTransaction" className="add_inv_checkbox_label">
                <span className="add_inv_checkbox_text">
                  Update related finance transaction
                </span>
                <span className="add_inv_checkbox_description">
                  Automatically update the expense transaction in finances
                  {quantity && pricePerUnit && (
                    <span className="add_inv_expense_amount">
                      {" "}(₦{(parseFloat(quantity) * parseFloat(pricePerUnit)).toLocaleString()})
                    </span>
                  )}
                </span>
              </label>
            </div>
          </div>
        )} */}

        {/* Error Display */}
        {errors.submit && (
          <div className="add_inv_error">
            <p>{errors.submit}</p>
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
          {isSubmitting ? "Saving..." : isEditMode ? "Update Item" : "Add Item"}
        </Button>
      </form>
    </div>
  );
};

export default AddInventoryPanel;
