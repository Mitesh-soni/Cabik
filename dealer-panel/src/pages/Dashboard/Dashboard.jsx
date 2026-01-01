import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDealer } from "../../contexts/DealerContext.jsx";
import { getDealerAnalytics, getDealerOrders } from "../../api/dealerApi.js";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { dealer } = useDealer();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [userCache, setUserCache] = useState({});

  useEffect(() => {
    loadDashboardData();
    loadRecentOrders();
  }, [dealer?.id]);

  const fetchUserName = async (userId) => {
    if (userCache[userId]) {
      return userCache[userId];
    }
    
    try {
      const res = await fetch(`http://localhost:5000/users/${userId}`);
      const data = await res.json();
      const userInfo = {
        name: data.user?.full_name || `Customer ${userId}`,
        email: data.user?.email || 'N/A',
        phone: data.user?.phone_number || 'N/A'
      };
      setUserCache(prev => ({ ...prev, [userId]: userInfo }));
      return userInfo;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      return {
        name: `Customer ${userId}`,
        email: 'N/A',
        phone: 'N/A'
      };
    }
  };

  const loadDashboardData = async () => {
    if (!dealer?.id) return;
    try {
      const res = await getDealerAnalytics(dealer.id, "monthly");
      setStats(res.data || {});
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setStats({
        totalVehicles: 0,
        totalOrders: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        avgOrderValue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    if (!dealer?.id) return;
    try {
      const res = await getDealerOrders(dealer.id, { limit: 5 });
      const orders = res.data?.orders || [];
      setRecentOrders(orders);
      
      // Fetch user names for all orders
      orders.forEach(order => {
        if (order.user_id) {
          fetchUserName(order.user_id);
        }
      });
    } catch (err) {
      console.error("Failed to load recent orders:", err);
      setRecentOrders([]);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'PAID':
        return '#10b981';
      case 'FAILED':
        return '#ef4444';
      case 'PENDING':
      case 'INITIATED':
      case 'PRICE_CONFIRMED':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="dealer-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {dealer?.company_name || "Dealer"}</h1>
          <p>Manage your dealership operations and track sales</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* STATS GRID */}
          <div className="stats-grid">
            <div className="stat-card stat-card-vehicles">
              <div className="stat-icon">🚗</div>
              <div className="stat-content">
                <p className="stat-label">Total Vehicles</p>
                <p className="stat-value">{stats?.totalVehicles || 0}</p>
                <p className="stat-subtext">In inventory</p>
              </div>
              <button className="stat-action" onClick={() => navigate("/vehicles")}>
                View All →
              </button>
            </div>

            <div className="stat-card stat-card-orders">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <p className="stat-label">Total Orders</p>
                <p className="stat-value">{stats?.totalOrders || 0}</p>
                <p className="stat-subtext">All time</p>
              </div>
              <button className="stat-action" onClick={() => navigate("/analytics")}>
                Details →
              </button>
            </div>

            <div className="stat-card stat-card-revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <p className="stat-label">Total Revenue</p>
                <p className="stat-value">₹{((stats?.totalRevenue || 0) / 100000).toFixed(1)}L</p>
                <p className="stat-subtext">Lifetime revenue</p>
              </div>
              <button className="stat-action" onClick={() => navigate("/analytics")}>
                Analytics →
              </button>
            </div>

            <div className="stat-card stat-card-monthly">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <p className="stat-label">This Month</p>
                <p className="stat-value">₹{((stats?.monthlyRevenue || 0) / 100000).toFixed(1)}L</p>
                <p className="stat-subtext">Current month revenue</p>
              </div>
              <button className="stat-action" onClick={() => navigate("/analytics")}>
                Full Report →
              </button>
            </div>
          </div>

          {/* QUICK STATS ROW */}
          <div className="quick-stats">
            <div className="quick-stat-item">
              <span className="quick-stat-label">Avg Order Value</span>
              <span className="quick-stat-value">₹{((stats?.avgOrderValue || 0) / 1000).toFixed(1)}K</span>
            </div>
            <div className="quick-stat-item">
              <span className="quick-stat-label">Success Rate</span>
              <span className="quick-stat-value">
                {stats?.totalOrders > 0 
                  ? Math.round((stats?.totalOrdersSuccess || 0) / stats?.totalOrders * 100) 
                  : 0}%
              </span>
            </div>
            <div className="quick-stat-item">
              <span className="quick-stat-label">Pending Orders</span>
              <span className="quick-stat-value">{stats?.totalOrdersPending || 0}</span>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button className="action-btn" onClick={() => navigate("/vehicles")}>
                <span className="action-icon">➕</span>
                <span>Add Vehicle</span>
              </button>
              <button className="action-btn" onClick={() => navigate("/analytics")}>
                <span className="action-icon">📊</span>
                <span>Sales Report</span>
              </button>
              <button className="action-btn" onClick={() => navigate("/settings")}>
                <span className="action-icon">⚙️</span>
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="recent-activity">
            <div className="activity-header">
              <h2>Recent Orders</h2>
              <button className="view-all-btn" onClick={() => navigate("/analytics")}>
                View All →
              </button>
            </div>
            <div className="activity-list">
              {recentOrders.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-icon">📭</p>
                  <p className="empty-text">No recent orders yet</p>
                  <p className="empty-subtext">Orders will appear here as they come in</p>
                </div>
              ) : (
                recentOrders.map((order) => {
                  const userInfo = userCache[order.user_id];
                  return (
                    <div key={order.id} className="activity-item">
                      <div className="activity-icon">🧾</div>
                      <div className="activity-details">
                        <p className="activity-title">
                          Order #{order.id} • {userInfo?.name || `Customer ${order.user_id}`}
                        </p>
                        <p className="activity-meta">
                          {order.vehicle_type?.charAt(0).toUpperCase() + order.vehicle_type?.slice(1) || "Vehicle"}
                        </p>
                        <p className="activity-contact">
                          📧 {userInfo?.email || 'N/A'} • 📱 {userInfo?.phone || 'N/A'}
                        </p>
                      </div>
                      <div className="activity-right">
                        <div 
                          className="status-badge"
                          style={{ 
                            backgroundColor: getStatusColor(order.order_status),
                            color: 'white'
                          }}
                        >
                          {order.order_status?.replace('_', ' ')}
                        </div>
                        <div className="activity-amount">
                          ₹{((order.final_price || order.base_price || 0) / 100000).toFixed(1)}L
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
