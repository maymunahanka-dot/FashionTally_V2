import { useState, useEffect, useContext } from "react";
import { Plus, Package } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../backend/firebase.config";
import NewAuthContext from "../../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../../utils/teamUtils";
import "./ClientOrders.css";

const ClientOrders = ({ client, onCreateOrder, onViewOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(NewAuthContext);

  // Load orders for this client
  useEffect(() => {
    const fetchOrders = async () => {
      if (!client?.id || !user?.email) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Get effective email (main admin's email for team members)
        const effectiveEmail = getEffectiveUserEmail(user);

        // Query orders from fashiontally_orders by tailorId
        const ordersQuery = query(
          collection(db, "fashiontally_orders"),
          where("tailorId", "==", effectiveEmail)
        );

        const snapshot = await getDocs(ordersQuery);

        const allOrders = snapshot.docs.map((doc) => {
          const data = doc.data();

          const parseDate = (val) => {
            if (!val) return new Date();
            if (val?.toDate) return val.toDate();
            return new Date(val);
          };

          const mapStatus = (s) => {
            switch (s?.toLowerCase()) {
              case "active": case "in progress": return "In Progress";
              case "archived": case "completed": return "Completed";
              case "partial": case "pending payment": return "Pending Payment";
              case "cancelled": return "Cancelled";
              default: return "Pending";
            }
          };

          return {
            id: doc.id,
            title: data.garmentDescription || data.name || "Untitled Order",
            date: parseDate(data.createdAt).toLocaleDateString(),
            amount: `₦${(data.price || 0).toLocaleString()}`,
            status: mapStatus(data.status),
            originalData: data,
            createdAt: parseDate(data.createdAt),
            dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
            category: data.garmentType || data.category || "Others",
            description: data.garmentDescription || data.description || "",
            measurements: data.measurements || {},
            images: data.images || [],
            clientId: data.clientId || "",
            clientName: data.clientName || "",
            clientEmail: data.clientEmail || "",
            clientPhone: data.clientPhone || data.clientId || "",
            price: data.price || 0,
            basePrice: data.basePrice || data.price || 0,
            deposit: data.deposit || data.depositPaid || 0,
            balance: data.balance || data.balanceDue || 0,
          };
        });

        // Filter by client phone (legacy) or clientId
        const ordersData = allOrders
          .filter((order) =>
            order.clientId === client.id ||
            order.clientId === client.phone ||
            order.clientPhone === client.phone
          )
          .sort((a, b) => b.createdAt - a.createdAt);

        console.log(
          `📦 Loaded ${ordersData.length} orders for client:`,
          client.name
        );
        setOrders(ordersData);
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
          <h3 className="client_orders_count">Loading orders...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="client_details_orders">
      {/* Orders Header */}
      <div className="client_orders_header">
        <h3 className="client_orders_count">{orders.length} Total Orders</h3>
        <button className="client_orders_new_btn" onClick={handleCreateOrder}>
          <Plus size={18} />
          New Order
        </button>
      </div>

      {/* Orders List */}
      <div className="client_orders_list">
        {orders.length === 0 ? (
          <div className="client_orders_empty">
            <p>No orders found for this client</p>
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
                  <h4 className="client_order_title">{order.title}</h4>
                  <span className="client_order_amount">{order.amount}</span>
                </div>
                <div className="client_order_sub_info">
                  <span className="client_order_date">{order.date}</span>
                  <div
                    className={`client_order_status_badge ${order.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {order.status}
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
