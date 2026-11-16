import { useState, useEffect, useContext } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";
import NewAuthContext from "../../../../contexts/NewAuthContext";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import AddInventoryPanel from "../../../../pannel_pages/AddInventoryPanel";
import ManageCategoriesPanel from "../../../../pannel_pages/ManageCategoriesPanel";
import InventoryDetailsPanel from "../../../../pannel_pages/InventoryDetailsPanel";
import Loading from "../../../../components/Loading/Loading";
import "./Inventory.css";
import Button from "../../../../components/button/Button";
import { useSavedSort } from "../../../../components/SortByButton/SortByButton";
import { getEffectiveUserEmail } from "../../../../utils/teamUtils";
import { formatForeign, getNgnPerUnit } from "../../../../utils/exchangeRate";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../../i18n";

import { tl } from "../../../../i18n";

import { dateLocale } from "../../../../i18n";


const Inventory = () => {
  const { t: tx } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useSavedSort("ft.sort.inventory");
  const [showSort, setShowSort] = useState(false);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDollars, setShowDollars] = useState(false);
  const [usdToNgn, setUsdToNgn] = useState(null); // Naira per 1 unit of secCurrency
  const [secCurrency, setSecCurrency] = useState("USD");

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
        const cur = String(data?.data?.inventoryCurrency || "NGN").toUpperCase();
        const useDollars = cur !== "NGN"; // name kept: true for any non-Naira display currency
        if (cancelled) return;
        setShowDollars(useDollars);
        setSecCurrency(useDollars ? cur : "USD");
        setUsdToNgn(await getNgnPerUnit(useDollars ? cur : "USD"));
      } catch (error) {
        console.error("Error loading exchange rate:", error);
      }
    };

    loadCurrency();
    return () => {
      cancelled = true;
    };
  }, [user]);

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

  // Filter inventory based on search, category, and status — newest first
  const filteredInventory = inventory
    .filter((item) => {
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
    })
    .sort((a, b) => {
      const toTime = (value) => {
        if (!value) return 0;
        const date = value instanceof Date ? value : new Date(value);
        const time = date.getTime();
        return Number.isNaN(time) ? 0 : time;
      };

      if (sortBy === "name-asc" || sortBy === "name-desc") {
        const compared = (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
        return sortBy === "name-asc" ? compared : -compared;
      }

      if (sortBy === "quantity") {
        return (b.quantity || 0) - (a.quantity || 0);
      }

      if (sortBy === "price") {
        return (b.price || 0) - (a.price || 0);
      }

      const createdDiff = toTime(b.createdAt) - toTime(a.createdAt);
      return sortBy === "oldest" ? -createdDiff : createdDiff;
    });

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  /** Saved Naira amount shown only in the Brand currency. */
  const money = (naira) =>
    showDollars && usdToNgn ? formatForeign(naira, usdToNgn, secCurrency) : formatCurrency(naira);

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
    if (window.confirm(tx("auto.areYouSureYouWant_97a6"))) {
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
          alert(tx("auto.failedToDeleteItemPlease_7c9d"));
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        alert(tx("auto.failedToDeleteItemPlease_7c9d"));
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
          <h1 className="inventory_title">{tx("auto.manageYourStockAndSupplies_6eee")}</h1>
        </div>
        <div className="inventory_no_items">
          <p>{tx("auto.pleaseLogInToView_dcfb")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory_management">
      {/* Header */}
      <div className="inventory_header">
        <h1 className="inventory_title">{tx("auto.manageYourStockAndSupplies_6eee")}</h1>
      </div>

      {/* Stats Cards */}
      <div className="inventory_stats">
        <div className="ipo">
          <div className="ipols">
            <h1>{tx("auto.inventory_300d")}</h1>
            <p>{tx("auto.manageYourStockAndSupply_a8eb")}</p>
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
              <h3 className="inventory_stat_title">{tx("auto.stockValue_c226")}</h3>
            </div>
            <div className="inventory_stat_content">
              <p className="inventory_stat_value">
                {tl(showDollars && usdToNgn ? formatForeign(totalStockValue, usdToNgn, secCurrency) : formatCurrency(totalStockValue))}
              </p>
              <p className="inventory_stat_subtitle">{tx("auto.10FromLastMonth_94d7")}</p>
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
              <h3 className="inventory_stat_title">{tx("auto.lowStock_023d")}</h3>
            </div>
            <div className="inventory_stat_content">
              <p className="inventory_stat_value">{tl(lowStockItems)}</p>
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
              <h3 className="inventory_stat_title">{tx("auto.outOfStock_bc67")}</h3>
            </div>
            <div className="inventory_stat_content">
              <p className="inventory_stat_value">{tl(outOfStockItems)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="jkj">
        {/* Search and Add Inventory Section */}
        <div className="inventory_controls">
          <div className="search-sort-row">
          <div className="inventory_search_section">
            <div className="inventory_search_input_container">
              <Search className="inventory_search_icon" size={20} />
              <input
                type="text"
                placeholder={tx("auto.searchClientsByNamePhone_9984")}
                className="inventory_search_input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="inventory_filter_btn_inside"
                onClick={() => {
                  setShowFilter(!showFilter);
                  setShowSort(false);
                }}
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
                    <label htmlFor="inventory_all">{tx("auto.allItems_2f18")}</label>
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
                    <label htmlFor="inventory_sufficient">{tx("auto.sufficient_970c")}</label>
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
                    <label htmlFor="inventory_low">{tx("auto.lowStock_023d")}</label>
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
                    <label htmlFor="inventory_out">{tx("auto.outOfStock_bc67")}</label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="clients-sort">
            <Button
              variant="outline"
              size="medium"
              icon={<ArrowUpDown size={18} />}
              iconPosition="left"
              active={showSort}
              onClick={() => {
                setShowSort((open) => !open);
                setShowFilter(false);
              }}
              className="sort-by-btn"
              aria-label="Sort by"
            >
              {tx("auto.sortBy_a2a5")}
            </Button>
            {showSort && (
              <div className="sort-dropdown" role="menu">
                {[
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
                  { value: "name-asc", label: "Name (A–Z)" },
                  { value: "name-desc", label: "Name (Z–A)" },
                  { value: "quantity", label: "Quantity" },
                  { value: "price", label: "Price" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={sortBy === option.value}
                    className={`sort-option${sortBy === option.value ? " active" : ""}`}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSort(false);
                    }}
                  >
                    {tl(option.label)}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>

          <button
            className="inventory_add_btn"
            onClick={handleAddInventoryClick}
          >
            <Plus size={20} />
            {tx("auto.addInventory_224f")}
          </button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems > 0 && (
          <div className="inventory_low_stock_alert">
            <AlertTriangle className="inventory_alert_icon" size={20} />
            <div className="pl">
              <span className="inventory_alert_text">{tx("auto.lowStockAlert_9d42")}</span>
              <span className="inventory_alert_description">
                {tl(lowStockItems)}{" "}
                {tl(lowStockItems === 1 ? tx("auto.itemHas_7d20") : tx("auto.itemsHave_71ed"))}{" "}{tx("auto.3OrFewerUnitsRemaining_0caf")}
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
            <span className="inventory_category_icon">{tl(category.icon)}</span>
            {tl(category.name)}
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
                <span className="inventory_image_icon">{tl(item.icon)}</span>
              </div>
              <div className="inventory_basic_info">
                <h3 className="inventory_name">{tl(item.name)}</h3>
                <p className="inventory_code">
                  {tl(item.category)} • {tl(item.code)}
                </p>
                <p className="inventory_description">{tl(item.description)}</p>
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
                  <span className="inventory_detail_label">{tx("auto.quantity_44f6")}</span>
                  <span className="inventory_detail_value">
                    {tl(item.quantity)} {tl(item.unit)}
                  </span>
                </div>
                <div className="inventory_detail_item">
                  <span className="inventory_detail_label">{tx("auto.pricePerUnit_cd21")}</span>
                  <span className="inventory_detail_value">
                    {tl(money(item.pricePerUnit))}
                  </span>
                </div>
                <div className="inventory_detail_item">
                  <span className="inventory_detail_label">{tx("auto.alert_b969")}</span>
                  <span
                    className={`inventory_status_badge ${
                      item.status?.toLowerCase() || "in-stock"
                    }`}
                  >
                    {tl(item.status || tx("auto.inStock_97d8"))}
                  </span>
                </div>
              </div>

              <div className="inventory_footer">
                <div className="inventory_stock_info">
                  <div className="inventory_stock_value">
                    <span className="inventory_stock_label">{tx("auto.stockValue_c226")}</span>
                    <span className="inventory_stock_amount">
                      {tl(money(item.stockValue))}
                    </span>
                  </div>
                  <div className="inventory_supplier_info">
                    <span className="inventory_supplier_label">
                      {tx("auto.supplier_1c8a")}{" "}{tl(item.supplier)}
                    </span>
                    <span className="inventory_min_stock">
                      {tx("auto.min_21be")}{" "}{tl(item.minStock)} {tl(item.unit)}
                    </span>
                  </div>
                  <div className="inventory_created_date">
                    <span className="inventory_date_label">{tx("auto.created_0c78")}</span>
                    <span className="inventory_date_value">
                      {tl(item.createdAt instanceof Date
                        ? item.createdAt.toLocaleDateString(dateLocale("en-US"), {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : tx("auto.nA_08d2"))}
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
            {tl(searchTerm || activeCategory !== "All" || filterStatus !== "all"
              ? tx("auto.noInventoryItemsFoundMatching_66e7")
              : tx("auto.noInventoryItemsYetAdd_5762"))}
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
