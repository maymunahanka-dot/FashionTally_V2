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

        // Query orders by userEmail only (no composite index needed)
        const ordersQuery = query(
          collection(db, "fashiontally_designs"),
          where("userEmail", "==", effectiveEmail)
        );

        const snapshot = await getDocs(ordersQuery);

        const allOrders = snapshot.docs.map((doc) => {
          const data = doc.data();

          const convertDate = (dateField) => {
            if (!dateField) return new Date();
            if (dateField.toDate && typeof dateField.toDate === "function") return dateField.toDate();
            if (dateField instanceof Date) return dateField;
            return new Date(dateField);
          };

          return {
            id: doc.id,
            title: data.name || "Untitled Order",
            date: convertDate(data.createdAt).toLocaleDateString(),
            amount: `₦${(data.price || 0).toLocaleString()}`,
            status:
              data.status === "Active" ? "In Progress" :
              data.status === "Archived" ? "Completed" : "Pending",
            originalData: data,
            createdAt: convertDate(data.createdAt),
            dueDate: convertDate(data.dueDate),
            category: data.category || "Others",
            description: data.description || "",
            measurements: data.measurements || {},
            images: data.images || [],
            clientId: data.clientId || "",
            clientName: data.clientName || "",
            clientEmail: data.clientEmail || "",
            clientPhone: data.clientPhone || "",
            price: data.price || 0,
            basePrice: data.basePrice || 0,
            additionalItems: data.additionalItems || [],
            depositPaid: data.depositPaid || 0,
            balanceDue: data.balanceDue || 0,
          };
        });

        // Filter by client ID, include orders (type === "order") and legacy no-type records
        const ordersData = allOrders
          .filter((order) => order.clientId === client.id)
          .filter((order) => !order.originalData?.type || order.originalData?.type === "order")
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
