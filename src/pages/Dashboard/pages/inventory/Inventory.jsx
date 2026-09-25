import { useState, useEffect, useContext } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import NewAuthContext from "../../../../contexts/NewAuthContext";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import AddInventoryPanel from "../../../../pannel_pages/AddInventoryPanel";
import ManageCategoriesPanel from "../../../../pannel_pages/ManageCategoriesPanel";
import InventoryDetailsPanel from "../../../../pannel_pages/InventoryDetailsPanel";
import Loading from "../../../../components/Loading/Loading";
import "./Inventory.css";
import Button from "../../../../components/button/Button";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const { user } = useContext(NewAuthContext);

  const fetchInventory = async () => {
    if (!user?.email) { setLoading(false); setInventory([]); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/inventory/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setInventory(data.data.map((item) => ({
          ...item,
          id: item.id || item._id,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          stockValue: (item.price || 0) * (item.quantity || 0),
          code: item.sku,
          pricePerUnit: item.price,
          supplier: item.supplierName,
          minStock: item.reorderPoint,
          icon: getCategoryIcon(item.category),
        })));
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory from backend
  useEffect(() => {
    fetchInventory();
  }, [user?.email]);

  const categories = [
    { name: "All", icon: "💰", color: "#16988d" },
    { name: "Fabric", icon: "🧵", color: "#3b82f6" },
    { name: "Notions", icon: "📌", color: "#ef4444" },
    { name: "Threads", icon: "🧶", color: "#f97316" },
    { name: "Accessories", icon: "💎", color: "#8b5cf6" },
    { name: "Tools", icon: "✂️", color: "#ec4899" },
    { name: "Patterns", icon: "📋", color: "#64748b" },
    { name: "Trim", icon: "🎀", color: "#f59e0b" },
  ];

  const getCategoryIcon = (category) => {
    const categoryMap = {
      Fabric: "🧵",
      Notions: "📌",
      Threads: "🧶",
      Accessories: "💎",
      Tools: "✂️",
      Patterns: "📋",
      Trim: "🎀",
      Zippers: "🔗",
      Buttons: "⚪",
      Interfacing: "📄",
    };
    return categoryMap[category] || "📦";
  };

  // Calculate stats
  const totalStockValue = inventory.reduce(
    (sum, item) => sum + item.stockValue,
    0
  );
  const lowStockItems = inventory.filter(
    (item) => item.quantity <= 3 && item.quantity > 0
  ).length;
  const outOfStockItems = inventory.filter(
    (item) => item.status === "Out of Stock"
  ).length;

  // Filter inventory based on search, category, and status
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "sufficient" && item.status === "In Stock") ||
      (filterStatus === "low" && item.status === "Low Stock") ||
      (filterStatus === "out" && item.status === "Out of Stock");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  const handleAddInventoryClick = () => {
    setSelectedItem(null);
    setIsEditMode(false);
    setShowAddInventory(true);
  };

  const handleCloseAddInventory = () => {
    setShowAddInventory(false);
    setSelectedItem(null);
    setIsEditMode(false);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setShowAddInventory(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!user?.email) return;
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/inventory/delete/${itemId}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          fetchInventory();
        } else {
          alert("Failed to delete item. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item. Please try again.");
      }
    }
  };

  const handleManageCategoriesClick = () => {
    setShowManageCategories(true);
  };

  const handleCloseManageCategories = () => {
    setShowManageCategories(false);
  };

  const handleShowItemDetail = (item) => {
    setSelectedItemForDetail(item);
    setShowItemDetail(true);
  };

  const handleCloseItemDetail = () => {
    setShowItemDetail(false);
    setSelectedItemForDetail(null);
  };

  // Show loading state
  if (loading) {
    return <Loading />;
  }

  // Show login message if user is not authenticated
  if (!user) {
    return (
      <div className="inventory_management">
        <div className="inventory_header">
          <h1 className="inventory_title">Manage your stock and supplies</h1>
        </div>
        <div className="inventory_no_items">
          <p>Please log in to view your inventory.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory_management">
      {/* Header */}
      <div className="inventory_header">
        <h1 className="inventory_title">Manage your stock and supplies</h1>
      </div>

      {/* Stats Cards */}
      <div className="inventory_stats">
        <div className="ipo">
          <div className="ipols">
            <h1>Inventory</h1>
            <p>manage your stock and supply</p>
          </div>
          <Button
            variant="primary"
            size="large"
            icon={<Plus size={24} />}
            onClick={handleAddInventoryClick}
            className="ipolsbbb"
          />
        </div>
        <div className="dddd">
          <div className="inventory_stat_card">
            <div className="inventory_stat_header">
              <div className="inventory_stat_icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="inventory_stat_title">Stock Value</h3>
            </div>
            <div className="inventory_stat_content">
              <p className="inventory_stat_value">
                {formatCurrency(totalStockValue)}
              </p>
              <p className="inventory_stat_subtitle">+10% from last month</p>
            </div>
          </div>

          <div className="inventory_stat_card">
            <div className="inventory_stat_header">
              <div className="inventory_stat_icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="12"
                    y1="9"
                    x2="12"
                    y2="13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="12"
                    y1="17"
                    x2="12.01"
                    y2="17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="inventory_stat_title">Low Stock</h3>
            </div>
            <div className="inventory_stat_content">
              <p className="inventory_stat_value">{lowStockItems}</p>
            </div>
          </div>

          <div className="inventory_stat_card">
            <div className="inventory_stat_header">
              <div className="inventory_stat_icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <polyline
                    points="22 12 18 12 15 21 9 3 6 12 2 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="inventory_stat_title">Out of Stock</h3>
            </div>
            <div className="inventory_stat_content">
              <p className="inventory_stat_value">{outOfStockItems}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="jkj">
        {/* Search and Add Inventory Section */}
        <div className="inventory_controls">
          <div className="inventory_search_section">
            <div className="inventory_search_input_container">
              <Search className="inventory_search_icon" size={20} />
              <input
                type="text"
                placeholder="Search clients by name, phone, or email"
                className="inventory_search_input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="inventory_filter_btn_inside"
                onClick={() => setShowFilter(!showFilter)}
              >
                <Filter size={20} />
              </button>
              {showFilter && (
                <div className="inventory_filter_dropdown">
                  <div className="inventory_filter_option">
                    <input
                      type="radio"
                      id="inventory_all"
                      name="inventory_filter"
                      value="all"
                      checked={filterStatus === "all"}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setShowFilter(false);
                      }}
                    />
                    <label htmlFor="inventory_all">All Items</label>
                  </div>
                  <div className="inventory_filter_option">
                    <input
                      type="radio"
                      id="inventory_sufficient"
                      name="inventory_filter"
                      value="sufficient"
                      checked={filterStatus === "sufficient"}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setShowFilter(false);
                      }}
                    />
                    <label htmlFor="inventory_sufficient">Sufficient</label>
                  </div>
                  <div className="inventory_filter_option">
                    <input
                      type="radio"
                      id="inventory_low"
                      name="inventory_filter"
                      value="low"
                      checked={filterStatus === "low"}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setShowFilter(false);
                      }}
                    />
                    <label htmlFor="inventory_low">Low Stock</label>
                  </div>
                  <div className="inventory_filter_option">
                    <input
                      type="radio"
                      id="inventory_out"
                      name="inventory_filter"
                      value="out"
                      checked={filterStatus === "out"}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setShowFilter(false);
                      }}
                    />
                    <label htmlFor="inventory_out">Out of Stock</label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            className="inventory_add_btn"
            onClick={handleAddInventoryClick}
          >
            <Plus size={20} />
            Add Inventory
          </button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems > 0 && (
          <div className="inventory_low_stock_alert">
            <AlertTriangle className="inventory_alert_icon" size={20} />
            <div className="pl">
              <span className="inventory_alert_text">Low Stock Alert</span>
              <span className="inventory_alert_description">
                {lowStockItems}{" "}
                {lowStockItems === 1 ? "item has" : "items have"} 3 or fewer
                units remaining. Consider restocking soon to avoid shortages.
              </span>
            </div>
          </div>
        )}
      </div>
      {/* Category Tabs */}
      <div className="inventory_category_tabs">
        {/* Stack/Layers Button - First Item */}
        <button
          className="inventory_stack_btn"
          onClick={handleManageCategoriesClick}
        >
          <div className="inventory_stack_icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>

        {categories.map((category) => (
          <button
            key={category.name}
            className={`inventory_category_tab ${
              activeCategory === category.name ? "active" : ""
            }`}
            onClick={() => setActiveCategory(category.name)}
          >
            <span className="inventory_category_icon">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      <div className="inventory_grid">
        {filteredInventory.map((item) => (
          <div key={item.id} className="inventory_card">
            <div
              className="inventory_header_section"
              onClick={() => handleShowItemDetail(item)}
              style={{ cursor: "pointer" }}
            >
              <div className="inventory_image">
                <span className="inventory_image_icon">{item.icon}</span>
              </div>
              <div className="inventory_basic_info">
                <h3 className="inventory_name">{item.name}</h3>
                <p className="inventory_code">
                  {item.category} • {item.code}
                </p>
                <p className="inventory_description">{item.description}</p>
              </div>
              <div
                className="inventory_actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="inventory_action_btn inventory_edit_btn"
                  onClick={() => handleEditItem(item)}
                >
                  <Edit size={16} />
                </button>
                <button
                  className="inventory_action_btn inventory_delete_btn"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 size={16} color="red" />
                </button>
              </div>
            </div>

            <div
              className="inventory_details"
              onClick={() => handleShowItemDetail(item)}
              style={{ cursor: "pointer" }}
            >
              <div className="inventory_detail_row">
                <div className="inventory_detail_item">
                  <span className="inventory_detail_label">Quantity</span>
                  <span className="inventory_detail_value">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div className="inventory_detail_item">
                  <span className="inventory_detail_label">Price per Unit</span>
                  <span className="inventory_detail_value">
                    {formatCurrency(item.pricePerUnit)}
                  </span>
                </div>
                <div className="inventory_detail_item">
                  <span className="inventory_detail_label">Alert</span>
                  <span
                    className={`inventory_status_badge ${
                      item.status?.toLowerCase() || "in-stock"
                    }`}
                  >
                    {item.status || "In Stock"}
                  </span>
                </div>
              </div>

              <div className="inventory_footer">
                <div className="inventory_stock_info">
                  <div className="inventory_stock_value">
                    <span className="inventory_stock_label">Stock Value</span>
                    <span className="inventory_stock_amount">
                      {formatCurrency(item.stockValue)}
                    </span>
                  </div>
                  <div className="inventory_supplier_info">
                    <span className="inventory_supplier_label">
                      Supplier: {item.supplier}
                    </span>
                    <span className="inventory_min_stock">
                      Min: {item.minStock} {item.unit}
                    </span>
                  </div>
                  <div className="inventory_created_date">
                    <span className="inventory_date_label">Created:</span>
                    <span className="inventory_date_value">
                      {item.createdAt instanceof Date
                        ? item.createdAt.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInventory.length === 0 && !loading && (
        <div className="inventory_no_items">
          <p>
            {searchTerm || activeCategory !== "All" || filterStatus !== "all"
              ? "No inventory items found matching your criteria."
              : "No inventory items yet. Add your first item to get started!"}
          </p>
        </div>
      )}

      {/* Add Inventory Panel */}
      <SlideInMenu
        isShow={showAddInventory}
        onClose={handleCloseAddInventory}
        position="rightt"
        width="480px"
      >
        <AddInventoryPanel
          onClose={handleCloseAddInventory}
          selectedItem={selectedItem}
          isEditMode={isEditMode}
          onSuccess={fetchInventory}
        />
      </SlideInMenu>

      {/* Manage Categories Panel */}
      <SlideInMenu
        isShow={showManageCategories}
        onClose={handleCloseManageCategories}
        position="rightt"
        width="480px"
      >
        <ManageCategoriesPanel onClose={handleCloseManageCategories} />
      </SlideInMenu>

      {/* Inventory Details Panel */}
      <SlideInMenu
        isShow={showItemDetail}
        onClose={handleCloseItemDetail}
        position="rightt"
        width="600px"
      >
        <InventoryDetailsPanel
          onClose={handleCloseItemDetail}
          selectedItem={selectedItemForDetail}
        />
      </SlideInMenu>
    </div>
  );
};

export default Inventory;
