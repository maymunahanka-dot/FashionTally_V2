import { useState, useEffect, useContext } from "react";
import { X } from "lucide-react";
import NewAuthContext from "../../contexts/NewAuthContext";
import Input from "../../components/Input/Input";
import Button from "../../components/button/Button";
import "./AddInventoryPanel.css";

const AddInventoryPanel = ({ onClose, selectedItem, isEditMode, onSuccess }) => {
  // Individual useState for each input field
  const [itemName, setItemName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [minStockAlert, setMinStockAlert] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [recordAsExpense, setRecordAsExpense] = useState(false); // Default to false (commented out feature)
  const [updateFinanceTransaction, setUpdateFinanceTransaction] = useState(true); // For edit mode

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useContext(NewAuthContext);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && selectedItem) {
      setItemName(selectedItem.name || "");
      setSku(selectedItem.sku || selectedItem.code || "");
      setCategory(selectedItem.category || "");
      setSubcategory(selectedItem.subcategory || "");
      setSupplier(selectedItem.supplierName || selectedItem.supplier || "");
      setQuantity(selectedItem.quantity?.toString() || "");
      setUnit(selectedItem.unit || "");
      setPricePerUnit(
        selectedItem.price?.toString() ||
          selectedItem.pricePerUnit?.toString() ||
          ""
      );
      setMinStockAlert(
        selectedItem.reorderPoint?.toString() ||
          selectedItem.minStock?.toString() ||
          ""
      );
      setColor(selectedItem.color || "");
      setDescription(selectedItem.description || "");
      setRecordAsExpense(false); // Don't record as expense when editing
      setUpdateFinanceTransaction(true); // Default to true for editing
    } else {
      // Reset form for new item
      setItemName("");
      setSku("");
      setCategory("");
      setSubcategory("");
      setSupplier("");
      setQuantity("");
      setUnit("");
      setPricePerUnit("");
      setMinStockAlert("");
      setColor("");
      setDescription("");
      setRecordAsExpense(false); // Default to false (commented out feature)
      setUpdateFinanceTransaction(true); // Not used for new items
    }
  }, [isEditMode, selectedItem]);

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

    if (!supplier.trim()) {
      newErrors.supplier = "Supplier is required";
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
        supplierName: supplier.trim(),
        quantity: parseFloat(quantity) || 0,
        unit,
        price: parseFloat(pricePerUnit) || 0,
        reorderPoint: parseFloat(minStockAlert) || 0,
        status: calculateStatus(quantity, minStockAlert),
        color: color.trim() || "",
        description: description.trim() || "",
      };

      let res;
      if (isEditMode && selectedItem?.id) {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/inventory/edit/${selectedItem.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/inventory/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          }
        );
      }

      const data = await res.json();
      if (!data.success) {
        setErrors({ submit: data.error || "Failed to save inventory item" });
        return;
      }

      setItemName(""); setSku(""); setCategory(""); setSubcategory("");
      setSupplier(""); setQuantity(""); setUnit(""); setPricePerUnit("");
      setMinStockAlert(""); setColor(""); setDescription("");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving inventory item:", error);
      setErrors({ submit: "Failed to save inventory item. Please try again." });
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

        {/* Supplier */}
        <div className="add_inv_form_group">
          <Input
            label="Supplier"
            type="text"
            placeholder="e.g., Lagos Textiles Ltd"
            value={supplier}
            onChange={(e) => {
              setSupplier(e.target.value);
              clearError("supplier");
            }}
            error={errors.supplier}
            required
            variant="rounded"
            disabled={isSubmitting}
          />
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
              label="Price per Unit (₦)"
              type="number"
              placeholder="0"
              step="0.01"
              value={pricePerUnit}
              onChange={(e) => {
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
