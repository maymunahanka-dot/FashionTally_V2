import { useState, useEffect, useContext } from "react";
import { Search, Filter, Plus, Package } from "lucide-react";
import NewAuthContext from "../../../../contexts/NewAuthContext";
import Button from "../../../../components/button/Button";
import SortByButton, { useSavedSort } from "../../../../components/SortByButton/SortByButton";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import NewOrderPanel from "../../../../pannel_pages/NewOrderPanel";
import OrderDetailsPanel from "../../../../pannel_pages/OrderDetailsPanel/OrderDetailsPanel";
import "./OrderManagement.css";
import Loading from "../../../../components/Loading/Loading";
import { MoneyAmount } from "../../../../components/MoneyAmount/MoneyAmount";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../../i18n";

import { tl } from "../../../../i18n";

import { dateLocale } from "../../../../i18n";


const OrderManagement = () => {
  const { t: tx } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useSavedSort("ft.sort.orders");
  const [showSort, setShowSort] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(NewAuthContext);

  const fetchOrders = async () => {
    if (!user?.email) {
      console.log("[OrderManagement] No user email — skipping fetch");
      setLoading(false);
      setOrders([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      console.log("[OrderManagement] Fetching orders for:", user.email);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("[OrderManagement] Response status:", res.status);
      const data = await res.json();
      console.log("[OrderManagement] Raw response:", data);
      if (data.success) {
        console.log("[OrderManagement] Orders fetched ✅ count:", data.data?.length, data.data);
        setOrders(data.data.map((o) => ({
          ...o,
          id: o.id || o._id,
          title: o.name || o.garmentDescription || o.garmentType || "Untitled Order",
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString(dateLocale()) : "",
          status: mapStatusToUI(o.status),
          icon: getCategoryIcon(o.garmentType),
          client: { name: o.clientName || "No Client", phone: o.clientPhone || "", email: o.clientEmail || "" },
          createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
          dueDate: o.dueDate ? new Date(o.dueDate) : null,
          // Pricing fields
          basePrice: o.basePrice || 0,
          additionalItems: Array.isArray(o.additionalItems) ? o.additionalItems : [],
          depositPaid: o.depositPaid || o.deposit || 0,
          balanceDue: o.balanceDue || o.balance || 0,
          // Measurements & details
          measurements: o.measurements || {},
          fabric: o.fabric || (Array.isArray(o.materials) ? o.materials[0] : "") || "",
          specialInstructions: o.specialInstructions || o.description || "",
        })).sort((a, b) => b.createdAt - a.createdAt));
      } else {
        console.warn("[OrderManagement] success=false:", data);
      }
    } catch (error) {
      console.error("[OrderManagement] Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [user?.email]);

  
  // Map database status to UI status
  const mapStatusToUI = (dbStatus) => {
    switch (dbStatus) {
      case "Active":
        return "In Progress";
      case "Archived":
        return "Completed";
      default:
        return "Pending";
    }
  };

  // Get icon based on category
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Dresses":
        return "👗";
      case "Shirts":
        return "👔";
      case "Uniforms":
        return "👔";
      case "Children's Wear":
        return "👶";
      case "Tops":
        return "👕";
      case "Bottoms":
        return "👖";
      default:
        return "📦";
    }
  };

  // Calculate stats from real data
  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (order) => order.status === "Completed"
  ).length;
  const inProgress = orders.filter(
    (order) => order.status === "In Progress"
  ).length;
  const pendingPayment = orders.filter(
    (order) => order.status === "Pending Payment"
  ).length;

  // Filter orders based on search and status — newest first
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch = order.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        order.status.toLowerCase().replace(" ", "-") ===
          filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const getTime = (val) => {
        if (!val) return 0;
        if (val instanceof Date) return isNaN(val) ? 0 : val.getTime();
        if (val?.seconds) return val.seconds * 1000;
        const d = new Date(val);
        return isNaN(d) ? 0 : d.getTime();
      };
      if (sortBy === "name-asc" || sortBy === "name-desc") {
        const compared = (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" });
        return sortBy === "name-asc" ? compared : -compared;
      }
      if (sortBy === "price") {
        return (Number(b.price) || Number(b.basePrice) || 0) - (Number(a.price) || Number(a.basePrice) || 0);
      }
      const createdDiff = getTime(b.createdAt) - getTime(a.createdAt);
      return sortBy === "oldest" ? -createdDiff : createdDiff;
    });

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setShowFilter(false);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setEditMode(true);
    setShowOrderDetails(false);
    setShowNewOrder(true);
  };

  const handleCloseNewOrderPanel = () => {
    setShowNewOrder(false);
    setEditMode(false);
    setEditingOrder(null);
  };

  return (
    <div className="o_m_order_management">
      {/* Header */}
      <div className="o_m_order_header">
        <h1 className="o_m_order_title">{tx("auto.manageYourOrders_e6fc")}</h1>
      </div>

      {/* Stats Section */}
      <div className="o_m_order_stats_section">
        <div className="o_m_ipo">
          <div className="o_m_ipols">
            <h1>{tx("auto.orders_cded")}</h1>
            <p>{tx("auto.manageYourOrders_79ae")}</p>
          </div>
          <Button
            variant="primary"
            size="large"
            icon={<Plus size={24} />}
            onClick={() => {
              setEditMode(false);
              setEditingOrder(null);
              setShowNewOrder(true);
            }}
            className="o_m_ipolsbbb"
          />
        </div>
         <div className="o_m_order_stats">
          <div className="o_m_stat_card">
            <div className="o_m_stat_content">
              <h3 className="o_m_stat_title">{tx("auto.totalOrders_408f")}</h3>
              <p className="o_m_stat_value">{tl(totalOrders)}</p>
              <p className="o_m_stat_subtitle">{tx("auto.12FromLastMonth_97f8")}</p>
            </div>
          </div>

          <div className="o_m_stat_card">
            <div className="o_m_stat_content">
              <h3 className="o_m_stat_title">{tx("auto.completedOrders_1d9b")}</h3>
              <p className="o_m_stat_value">{tl(completedOrders)}</p>
              <p className="o_m_stat_subtitle">{tx("auto.8FromLastMonth_54fc")}</p>
            </div>
          </div>

          <div className="o_m_stat_card">
            <div className="o_m_stat_content">
              <h3 className="o_m_stat_title">{tx("auto.inProgress_f61e")}</h3>
              <p className="o_m_stat_value">{tl(inProgress)}</p>
            </div>
          </div>

          <div className="o_m_stat_card">
            <div className="o_m_stat_content">
              <h3 className="o_m_stat_title">{tx("auto.pendingPayment_c8ac")}</h3>
              <p className="o_m_stat_value">{tl(pendingPayment)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="o_m_jkj">
        {/* Search and Add Order Section */}
        <div className="o_m_order_controls">
          <div className="search-sort-row">
          <div className="o_m_search_section">
            <div className="o_m_search_input_container">
              <Search className="o_m_search_icon" size={20} />
              <input
                type="text"
                placeholder={tx("auto.searchClientsByNamePhone_9984")}
                className="o_m_search_input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="o_m_filter_btn_inside"
                onClick={() => {
                  setShowFilter(!showFilter);
                  setShowSort(false);
                }}
              >
                <Filter size={20} />
              </button>
              {showFilter && (
                <div className="o_m_filter_dropdown">
                  <div className="o_m_filter_section">
                    <h4 className="o_m_filter_section_title">{tx("auto.status_bae7")}</h4>
                    <button
                      className={`o_m_filter_option ${
                        filterStatus === "all" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("all")}
                    >
                      {tx("auto.allOrders_8393")}
                    </button>
                    <button
                      className={`o_m_filter_option ${
                        filterStatus === "completed" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("completed")}
                    >
                      {tx("auto.completed_1798")}
                    </button>
                    <button
                      className={`o_m_filter_option ${
                        filterStatus === "in-progress" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("in-progress")}
                    >
                      {tx("auto.inProgress_f61e")}
                    </button>
                    <button
                      className={`o_m_filter_option ${
                        filterStatus === "pending-payment" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("pending-payment")}
                    >
                      {tx("auto.pendingPayment_c8ac")}
                    </button>
                    <button
                      className={`o_m_filter_option ${
                        filterStatus === "cancelled" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("cancelled")}
                    >
                      {tx("auto.cancelled_a1bf")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <SortByButton
            value={sortBy}
            onChange={setSortBy}
            open={showSort}
            onToggle={() => {
              setShowSort((open) => !open);
              setShowFilter(false);
            }}
            options={[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
              { value: "name-asc", label: "Name (A–Z)" },
              { value: "name-desc", label: "Name (Z–A)" },
              { value: "price", label: "Price" },
            ]}
          />
          </div>

          <button
            className="o_m_add_order_btn"
            onClick={() => {
              setEditMode(false);
              setEditingOrder(null);
              setShowNewOrder(true);
            }}
          >
            <Plus size={20} />
            {tx("auto.addOrder_29c1")}
          </button>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <Loading />
        ) : filteredOrders.length === 0 ? (
          <div className="o_m_no_orders">
            <Package size={48} />
            <h3>{tx("auto.noOrdersFound_8134")}</h3>
            <p>
              {tl(searchTerm || filterStatus !== "all"
                ? tx("auto.tryAdjustingYourSearchOr_e210")
                : tx("auto.createYourFirstOrderTo_6b98"))}
            </p>
          </div>
        ) : (
          <div className="o_m_orders_grid">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="o_m_order_card"
                onClick={() => handleOrderClick(order)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOrderClick(order);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${order.title}`}
              >
                <div className="o_m_order_top_row">
                  <div className="o_m_order_left_section">
                    <div className="o_m_order_icon">
                      <Package size={24} />
                    </div>
                    <h3 className="o_m_order_title_text">{tl(order.title)}</h3>
                  </div>
                  <div className="o_m_order_price">
                    <MoneyAmount amount={order.price} align="end" />
                  </div>
                </div>

                <div className="o_m_order_bottom_row">
                  <div className="o_m_order_date">{tl(order.date)}</div>
                  <div
                    className={`o_m_status_badge ${order.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {tl(order.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Order Panel */}
      <SlideInMenu
        isShow={showNewOrder}
        onClose={handleCloseNewOrderPanel}
        position="rightt"
        width="600px"
      >
        <NewOrderPanel
          onClose={handleCloseNewOrderPanel}
          editMode={editMode}
          initialData={editingOrder}
          onSuccess={fetchOrders}
        />
      </SlideInMenu>

      {/* Order Details Panel */}
      <SlideInMenu
        isShow={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
        position="rightt"
        width="600px"
      >
        <OrderDetailsPanel
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          onEdit={handleEditOrder}
        />
      </SlideInMenu>
    </div>
  );
};

export default OrderManagement;
