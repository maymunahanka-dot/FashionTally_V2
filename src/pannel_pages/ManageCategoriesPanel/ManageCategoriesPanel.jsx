import { useState } from "react";
import { X, Edit, Trash2 } from "lucide-react";
import "./ManageCategoriesPanel.css";

const ManageCategoriesPanel = ({ onClose }) => {
  const [categories, setCategories] = useState([
    { id: 1, name: "Fabric", icon: "🧵", color: "#10b981" },
    { id: 2, name: "Notions", icon: "📌", color: "#10b981" },
    { id: 3, name: "Threads", icon: "🧶", color: "#10b981" },
    { id: 4, name: "Accessories", icon: "💎", color: "#10b981" },
    { id: 5, name: "Tools", icon: "✂️", color: "#10b981" },
    { id: 6, name: "Patterns", icon: "📋", color: "#10b981" },
    { id: 7, name: "Trim", icon: "🎀", color: "#10b981" },
  ]);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: Date.now(),
        name: newCategoryName.trim(),
        icon: "📦", // Default icon
        color: "#10b981",
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setShowAddCategory(false);
    }
  };

  const handleDeleteCategory = (categoryId) => {
    setCategories(categories.filter((cat) => cat.id !== categoryId));
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setShowAddCategory(true);
  };

  const handleUpdateCategory = () => {
    if (newCategoryName.trim() && editingCategory) {
      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id
            ? { ...cat, name: newCategoryName.trim() }
            : cat
        )
      );
      setNewCategoryName("");
      setShowAddCategory(false);
      setEditingCategory(null);
    }
  };

  const handleCancelEdit = () => {
    setNewCategoryName("");
    setShowAddCategory(false);
    setEditingCategory(null);
  };

  return (
    <div className="manage_cat_panel">
      {/* Header */}
      <div className="manage_cat_header">
        <h2 className="manage_cat_title">Manage Categories</h2>
        <button className="manage_cat_close_btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="manage_cat_content">
        {/* Custom Categories Section */}
        <div className="manage_cat_section">
          <div className="manage_cat_section_header">
            <h3 className="manage_cat_section_title">Custom Categories</h3>
            <button
              className="manage_cat_add_btn"
              onClick={() => setShowAddCategory(true)}
            >
              Add Category
            </button>
          </div>

          {/* Add/Edit Category Form */}
          {showAddCategory && (
            <div className="manage_cat_add_form">
              <input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="manage_cat_input"
                autoFocus
              />
              <div className="manage_cat_form_actions">
                <button
                  className="manage_cat_save_btn"
                  onClick={
                    editingCategory ? handleUpdateCategory : handleAddCategory
                  }
                >
                  {editingCategory ? "Update" : "Add"}
                </button>
                <button
                  className="manage_cat_cancel_btn"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="manage_cat_list">
            {categories.map((category) => (
              <div key={category.id} className="manage_cat_item">
                <div className="manage_cat_item_left">
                  <div
                    className="manage_cat_icon"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </div>
                  <span className="manage_cat_name">{category.name}</span>
                </div>
                <div className="manage_cat_item_actions">
                  <button
                    className="manage_cat_action_btn manage_cat_edit_btn"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="manage_cat_action_btn manage_cat_delete_btn"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategoriesPanel;
