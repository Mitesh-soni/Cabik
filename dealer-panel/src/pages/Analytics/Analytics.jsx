import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDealer } from "../../contexts/DealerContext.jsx";
import { getDealerAnalytics, getDealerRevenue, getDealerOrders } from "../../api/dealerApi.js";
import "./Analytics.css";

const COLORS = ["#667eea", "#764ba2", "#f59e0b", "#10b981", "#ef4444"];

export default function Analytics() {
  const { dealer } = useDealer();
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState({});

  useEffect(() => {
    loadAnalytics();
  }, [dealer?.id, timeFrame]);

  const fetchUserName = async (userId) => {
    if (userCache[userId]) {
      return userCache[userId];
    }
    
    try {
      const res = await fetch(`http://localhost:5000/users/${userId}`);
      const data = await res.json();
      const userInfo = data.user?.full_name || `Customer ${userId}`;
      setUserCache(prev => ({ ...prev, [userId]: userInfo }));
      return userInfo;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      return `Customer ${userId}`;
    }
  };

  const loadAnalytics = async () => {
    if (!dealer?.id) return;
    try {
      const [analyticsRes, revenueRes, ordersRes] = await Promise.all([
        getDealerAnalytics(dealer.id, timeFrame),
        getDealerRevenue(dealer.id, timeFrame),
        getDealerOrders(dealer.id, { limit: 100 })
      ]);

      setAnalytics(analyticsRes.data);
      setSalesData(analyticsRes.data?.salesData || []);
      setRevenueData(revenueRes.data?.revenueData || []);
      const ordersList = ordersRes.data?.orders || [];
      setOrders(ordersList);
      
      // Fetch user names for orders
      ordersList.forEach(order => {
        if (order.user_id) {
          fetchUserName(order.user_id);
        }
      });
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setSalesData([]);
      setRevenueData([]);
      setOrders([]);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const dummyData = {
    sales: [
      { month: "Jan", sales: 45, revenue: 450000 },
      { month: "Feb", sales: 52, revenue: 520000 },
      { month: "Mar", sales: 48, revenue: 480000 },
      { month: "Apr", sales: 61, revenue: 610000 },
      { month: "May", sales: 55, revenue: 550000 },
      { month: "Jun", sales: 67, revenue: 670000 }
    ],
    categories: [
      { name: "Cars", value: 45 },
      { name: "Bikes", value: 30 },
      { name: "Scooties", value: 25 }
    ]
  };

  // Calculate real sales by category from orders
  const calculateSalesByCategory = () => {
    const categoryCounts = {
      Cars: 0,
      Bikes: 0,
      Scooties: 0
    };

    orders.forEach(order => {
      const vehicleType = order.vehicle_type?.toUpperCase();
      if (vehicleType === 'CAR') {
        categoryCounts.Cars += 1;
      } else if (vehicleType === 'BIKE') {
        categoryCounts.Bikes += 1;
      } else if (vehicleType === 'SCOOTY') {
        categoryCounts.Scooties += 1;
      }
    });

    return [
      { name: "Cars", value: categoryCounts.Cars },
      { name: "Bikes", value: categoryCounts.Bikes },
      { name: "Scooties", value: categoryCounts.Scooties }
    ];
  };

  const realSalesByCategory = calculateSalesByCategory();

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Sales Analytics</h1>
        <div className="time-frame-selector">
          <button 
            className={timeFrame === "weekly" ? "active" : ""} 
            onClick={() => setTimeFrame("weekly")}
          >
            Weekly
          </button>
          <button 
            className={timeFrame === "monthly" ? "active" : ""} 
            onClick={() => setTimeFrame("monthly")}
          >
            Monthly
          </button>
          <button 
            className={timeFrame === "yearly" ? "active" : ""} 
            onClick={() => setTimeFrame("yearly")}
          >
            Yearly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading analytics...</div>
      ) : (
        <>
          {/* CHARTS ROW 1 */}
          <div className="charts-row">
            <div className="chart-container">
              <h2>Sales Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData.length ? salesData : dummyData.sales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#667eea" strokeWidth={2} dot={{ fill: "#667eea", r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h2>Revenue Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData.length ? revenueData : dummyData.sales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#764ba2" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHARTS ROW 2 */}
          <div className="charts-row">
            <div className="chart-container">
              <h2>Sales by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={realSalesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {realSalesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="stats-summary">
              <h2>Summary</h2>
              <div className="summary-items">
                <div className="summary-item">
                  <span className="summary-label">Total Orders</span>
                  <span className="summary-value">{analytics?.totalOrders || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Avg Order Value</span>
                  <span className="summary-value">₹{(analytics?.avgOrderValue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Revenue</span>
                  <span className="summary-value">₹{(analytics?.totalRevenue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Success Rate</span>
                  <span className="summary-value">
                    {analytics?.totalOrders > 0 
                      ? `${((analytics.totalOrdersSuccess / analytics.totalOrders) * 100).toFixed(1)}%`
                      : "0%"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT ORDERS */}
          <div className="recent-orders">
            <h2>Recent Orders</h2>
            <div className="orders-table">
              {orders.length === 0 ? (
                <p style={{ textAlign: "center", color: "#999", padding: "30px" }}>No orders yet</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{userCache[order.user_id] || `Customer ${order.user_id}`}</td>
                        <td>{order.vehicle_type}</td>
                        <td>₹{(order.base_price || 0).toLocaleString("en-IN")}</td>
                        <td><span className={`status ${order.order_status?.toLowerCase()}`}>{order.order_status || "Pending"}</span></td>
                        <td>{new Date(order.created_at).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
