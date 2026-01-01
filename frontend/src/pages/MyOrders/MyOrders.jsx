import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./MyOrders.css";

export default function MyOrders() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, paid, pending, failed

  useEffect(() => {
    loadOrders();
  }, [user?.user?.id]);

  const loadOrders = async () => {
    if (!user?.user?.id) return;
    
    try {
      const res = await fetch(`http://localhost:5000/orders/user/${user.user.id}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    if (filter === "paid") return order.order_status === "PAID";
    if (filter === "pending") return order.order_status !== "PAID" && order.order_status !== "FAILED";
    if (filter === "failed") return order.order_status === "FAILED";
    return true;
  });

  const getStatusColor = (status) => {
    if (status === "PAID") return "#10b981";
    if (status === "FAILED") return "#ef4444";
    return "#f59e0b";
  };

  return (
    <>
      <Navbar />
      <main className="my-orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage all your vehicle purchases</p>
        </div>

        {/* FILTER TABS */}
        <div className="filter-tabs">
          <button 
            className={filter === "all" ? "active" : ""} 
            onClick={() => setFilter("all")}
          >
            All Orders ({orders.length})
          </button>
          <button 
            className={filter === "paid" ? "active" : ""} 
            onClick={() => setFilter("paid")}
          >
            Completed ({orders.filter(o => o.order_status === "PAID").length})
          </button>
          <button 
            className={filter === "pending" ? "active" : ""} 
            onClick={() => setFilter("pending")}
          >
            Pending ({orders.filter(o => o.order_status !== "PAID" && o.order_status !== "FAILED").length})
          </button>
          <button 
            className={filter === "failed" ? "active" : ""} 
            onClick={() => setFilter("failed")}
          >
            Failed ({orders.filter(o => o.order_status === "FAILED").length})
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>No Orders Found</h2>
            <p>You haven't placed any orders yet. Start shopping for your dream vehicle!</p>
            <button className="btn-browse" onClick={() => navigate("/user-home")}>
              Browse Vehicles
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <span className="label">Order ID:</span>
                    <span className="value">#{order.id}</span>
                  </div>
                  <div 
                    className="order-status" 
                    style={{ background: getStatusColor(order.order_status) }}
                  >
                    {order.order_status}
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-info">
                    <div className="info-item">
                      <span className="label">Vehicle Type:</span>
                      <span className="value">{order.vehicle_type?.toUpperCase()}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Vehicle ID:</span>
                      <span className="value">#{order.vehicle_id}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Order Date:</span>
                      <span className="value">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Amount:</span>
                      <span className="value price">
                        ₹{(order.final_price || order.base_price || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="order-actions">
                    {order.order_status === "PAID" && (
                      <button 
                        className="btn-view-invoice"
                        onClick={() => navigate(`/invoice/${order.id}`)}
                      >
                        View Invoice
                      </button>
                    )}
                    <button 
                      className="btn-view-details"
                      onClick={() => navigate(`/${order.vehicle_type}s/${order.vehicle_id}`)}
                    >
                      View Vehicle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
