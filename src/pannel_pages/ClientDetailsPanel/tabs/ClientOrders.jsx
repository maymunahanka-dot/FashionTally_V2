import { useState, useEffect, useContext } from "react";
import { Plus, Package } from "lucide-react";
import NewAuthContext from "../../../contexts/NewAuthContext";
import "./ClientOrders.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../i18n";

import { tl } from "../../../i18n";

import { dateLocale } from "../../../i18n";

const ClientOrders = ({ client, onCreateOrder, onViewOrder }) => {
  const { t: tx } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(NewAuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!client?.id || !user?.email) { setLoading(false); return; }
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/order/list`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          const clientOrders = data.data
            .filter((o) => o.clientId === client.id)
            .map((o) => ({
              ...o,
              title: o.garmentDescription || o.garmentType || "Untitled Order",
              date: o.createdAt ? new Date(o.createdAt).toLocaleDateString(dateLocale()) : "",
              amount: `₦${(o.price || 0).toLocaleString()}`,
              status: o.status === "in-progress" ? "In Progress" : o.status === "Completed" ? "Completed" : "Pending",
              createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
            }))
            .sort((a, b) => b.createdAt - a.createdAt);
          setOrders(clientOrders);
        }
      } catch (error) {
        console.error("Error fetching client orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [client?.id, user?.email]);

  const handleCreateOrder = () => {
    if (onCreateOrder) {
      onCreateOrder(client);
    }
  };

  const handleViewOrder = (order) => {
    if (onViewOrder) {
      onViewOrder(order);
    }
  };

  if (loading) {
    return (
      <div className="client_details_orders">
        <div className="client_orders_header">
          <h3 className="client_orders_count">{tx("auto.loadingOrders_34d5")}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="client_details_orders">
      {/* Orders Header */}
      <div className="client_orders_header">
        <h3 className="client_orders_count">{tl(orders.length)}{" "}{tx("auto.totalOrders_408f")}</h3>
        <button className="client_orders_new_btn" onClick={handleCreateOrder}>
          <Plus size={18} />
          {tx("auto.newOrder_c59c")}
        </button>
      </div>

      {/* Orders List */}
      <div className="client_orders_list">
        {orders.length === 0 ? (
          <div className="client_orders_empty">
            <p>{tx("auto.noOrdersFoundForThis_bbec")}</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="client_order_item"
              onClick={() => handleViewOrder(order)}
              style={{ cursor: "pointer" }}
            >
              <div className="client_order_icon">
                <Package size={24} />
              </div>

              <div className="client_order_details">
                <div className="client_order_main_info">
                  <h4 className="client_order_title">{tl(order.title)}</h4>
                  <span className="client_order_amount">{tl(order.amount)}</span>
                </div>
                <div className="client_order_sub_info">
                  <span className="client_order_date">{tl(order.date)}</span>
                  <div
                    className={`client_order_status_badge ${order.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {tl(order.status)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientOrders;
