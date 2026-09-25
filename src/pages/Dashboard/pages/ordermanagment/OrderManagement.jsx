import { useState, useEffect, useContext } from "react";
import { Search, Filter, Plus, Package } from "lucide-react";
import NewAuthContext from "../../../../contexts/NewAuthContext";
import Button from "../../../../components/button/Button";
import SlideInMenu from "../../../../components/SlideInMenu/SlideInMenu";
import NewOrderPanel from "../../../../pannel_pages/NewOrderPanel";
import OrderDetailsPanel from "../../../../pannel_pages/OrderDetailsPanel/OrderDetailsPanel";
import "./OrderManagement.css";
import Loading from "../../../../components/Loading/Loading";

const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
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
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
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
        })));
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

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      order.status.toLowerCase().replace(" ", "-") ===
        filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
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

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="o_m_order_management">
      {/* Header */}
      <div className="o_m_order_header">
        <h1 className="o_m_order_title">Manage Your Orders</h1>
      </div>

      {/* Stats Section */}
      <div className="o_m_order_stats_section">
        <div className="o_m_ipo">
          <div className="o_m_ipols">
            <h1>Orders</h1>
            <p>Manage your orders</p>
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
              <h3 className="o_m_stat_title">Total Orders</h3>
              <p className="o_m_stat_value">{totalOrders}</p>
              <p className="o_m_stat_subtitle">+12% from last month</p>
            </div>
          </div>

          <div className="o_m_stat_card">
            <div className="o_m_stat_content">
              <h3 className="o_m_stat_title">Completed Orders</h3>
              <p className="o_m_stat_value">{completedOrders}</p>
              <p className="o_m_stat_subtitle">+8% from last month</p>
            </div>
          </div>

          <div className="o_m_stat_card">
            <div className="o_m_stat_content">
              <h3 className="o_m_stat_title">In Progress</h3>
              <p className="o_m_stat_value">{inProgress}</p>
            </div>
          </div>

          <div className="o_m_stat_card">
            <div className="o_m_stat_content">
              <h3 className="o_m_stat_title">Pending Payment</h3>
              <p className="o_m_stat_value">{pendingPayment}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="o_m_jkj">
        {/* Search and Add Order Section */}
        <div className="o_m_order_controls">
          <div className="o_m_search_section">
            <div className="o_m_search_input_container">
              <Search className="o_m_search_icon" size={20} />
              <input
                type="text"
                placeholder="Search clients by name, phone, or email"
                className="o_m_search_input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="o_m_filter_btn_inside"
                onClick={() => setShowFilter(!showFilter)}
              >
                <Filter size={20} />
              </button>
              {showFilter && (
                <div className="o_m_filter_dropdown">
                  <div className="o_m_filter_section">
                    <h4 className="o_m_filter_section_title">Status</h4>
                    <button
                      className={`o_m_filter_option ${
                        filterStatus === "all" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("all")}
                    >
                      All Orders
                    </button>
                    <button
                      className={`o_m_filter_option ${
                        filterStatus === "completed" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("completed")}
                    >
                      Completed
                    </button>
                    <button
                      className={`o_m_filter_option ${
                        filterStatus === "in-progress" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("in-progress")}
                    >
                      In Progress
                    </button>
                    <button
                      className={`o_m_filter_option ${
                        filterStatus === "pending-payment" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("pending-payment")}
                    >
                      Pending Payment
                    </button>
                    <button
                      className={`o_m_filter_option ${
                        filterStatus === "cancelled" ? "active" : ""
                      }`}
                      onClick={() => handleFilterSelect("cancelled")}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>
              )}
            </div>
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
            Add Order
          </button>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <Loading />
        ) : filteredOrders.length === 0 ? (
          <div className="o_m_no_orders">
            <Package size={48} />
            <h3>No orders found</h3>
            <p>
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Create your first order to get started"}
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
                    <h3 className="o_m_order_title_text">{order.title}</h3>
                  </div>
                  <div className="o_m_order_price">
                    {formatCurrency(order.price)}
                  </div>
                </div>

                <div className="o_m_order_bottom_row">
                  <div className="o_m_order_date">{order.date}</div>
                  <div
                    className={`o_m_status_badge ${order.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {order.status}
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
