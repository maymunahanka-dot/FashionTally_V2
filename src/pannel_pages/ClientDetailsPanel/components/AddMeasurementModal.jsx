import { useState, useEffect } from "react";
import { X, Save, Lightbulb, Plus, Trash2 } from "lucide-react";
import Button from "../../../components/button/Button";
import Input from "../../../components/Input/Input";
import { useTheme } from "../../../contexts/ThemeContext";
import "./AddMeasurementModal.css";

/**
 * AddMeasurementModal
 *
 * Add mode  (editMode=false): onSave receives an array of { name, value, unit }
 * Edit mode (editMode=true):  onSave receives a single { name, value, unit }
 */
const AddMeasurementModal = ({ isOpen, onClose, onSave, editMode = false, initialData = null }) => {
  const { isDark } = useTheme();
  const [measurements, setMeasurements] = useState([{ id: 1, name: "", value: "", unit: "inches" }]);
  const [isSaving, setIsSaving] = useState(false);

  // Populate fields when in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setMeasurements([{ id: 1, name: initialData.name, value: initialData.value, unit: initialData.unit || "inches" }]);
    } else if (!editMode) {
      setMeasurements([{ id: 1, name: "", value: "", unit: "inches" }]);
    }
  }, [editMode, initialData, isOpen]);

  const handleInputChange = (id, field, value) => {
    setMeasurements((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleAddRow = () => {
    const newId = Math.max(...measurements.map((m) => m.id), 0) + 1;
    setMeasurements((prev) => [...prev, { id: newId, name: "", value: "", unit: "inches" }]);
  };

  const handleRemoveRow = (id) => {
    if (measurements.length > 1) {
      setMeasurements((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleSave = async () => {
    const valid = measurements.filter((m) => m.name.trim() && m.value.trim());
    if (!valid.length) return;

    try {
      setIsSaving(true);
      if (editMode) {
        // Single item edit
        await onSave({ name: valid[0].name, value: valid[0].value, unit: valid[0].unit });
      } else {
        // Bulk create
        await onSave(valid.map(({ name, value, unit }) => ({ name: name.trim(), value: value.trim(), unit })));
      }
      handleClose();
    } catch (err) {
      console.error("❌ Error saving measurements:", err);
      alert("Failed to save measurements. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setMeasurements([{ id: 1, name: "", value: "", unit: "inches" }]);
    onClose();
  };

  const handleQuickFill = () => {
    setMeasurements([
      { id: 1, name: "Chest", value: "", unit: "inches" },
      { id: 2, name: "Waist", value: "", unit: "inches" },
      { id: 3, name: "Hip", value: "", unit: "inches" },
      { id: 4, name: "Shoulder Width", value: "", unit: "inches" },
      { id: 5, name: "Sleeve Length", value: "", unit: "inches" },
      { id: 6, name: "Inseam", value: "", unit: "inches" },
    ]);
  };

  const hasValid = measurements.some((m) => m.name.trim() && m.value.trim());

  if (!isOpen) return null;

  return (
    <div className="add_measurement_modal_overlay">
      <div className={`add_measurement_modal ${isDark ? "dark-theme" : "light-theme"}`}>
        {/* Header */}
        <div className="add_measurement_modal_header">
          <h3 className="add_measurement_modal_title">
            {editMode ? "Edit Measurement" : "Add Measurements"}
          </h3>
          <button className="add_measurement_modal_close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="add_measurement_modal_content">
          {/* Quick Fill — only in add mode */}
          {!editMode && (
            <div className="add_measurement_quick_fill">
              <button className="add_measurement_quick_fill_btn" onClick={handleQuickFill}>
                <Lightbulb size={16} />
                Quick Fill Common Measurements
              </button>
            </div>
          )}

          {/* Rows */}
          <div className="add_measurement_list">
            {measurements.map((m, index) => (
              <div key={m.id} className="add_measurement_item">
                {!editMode && (
                  <div className="add_measurement_item_header">
                    <span className="add_measurement_item_number">#{index + 1}</span>
                    {measurements.length > 1 && (
                      <button className="add_measurement_remove_btn" onClick={() => handleRemoveRow(m.id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
                <div className="add_measurement_item_fields">
                  <div className="add_measurement_fields_row">
                    <div className="add_measurement_form_group add_measurement_name_field">
                      <Input
                        type="text"
                        label="Name"
                        placeholder="e.g., Chest"
                        value={m.name}
                        onChange={(e) => handleInputChange(m.id, "name", e.target.value)}
                        variant="rounded"
                      />
                    </div>
                    <div className="add_measurement_form_group add_measurement_value_field">
                      <Input
                        type="text"
                        label="Value"
                        placeholder="36"
                        value={m.value}
                        onChange={(e) => handleInputChange(m.id, "value", e.target.value)}
                        variant="rounded"
                      />
                      <span className="add_measurement_unit_label">inches</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add more row — only in add mode */}
          {!editMode && (
            <button className="add_measurement_add_more_btn" onClick={handleAddRow}>
              <Plus size={18} />
              Add Another Measurement
            </button>
          )}

          {/* Tip */}
          {!editMode && (
            <div className="add_measurement_tip_section">
              <div className="add_measurement_tip_header">
                <Lightbulb size={16} className="add_measurement_tip_icon" />
                <span className="add_measurement_tip_title">Tip</span>
              </div>
              <p className="add_measurement_tip_text">
                Common measurements: Chest, Waist, Hip, Shoulder Width, Sleeve Length, Inseam, Neck, Bust, Dress Length.
              </p>
            </div>
          )}

          {/* Save */}
          <div className="add_measurement_modal_actions">
            <Button
              variant="primary"
              size="large"
              icon={<Save size={20} />}
              onClick={handleSave}
              className="add_measurement_save_btn"
              disabled={!hasValid || isSaving}
            >
              {isSaving ? "Saving..." : editMode ? "Update Measurement" : "Save All Measurements"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMeasurementModal;
