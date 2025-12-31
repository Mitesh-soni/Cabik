import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { getOrderById } from "../../api/orderApi.js";
import "./orderSuccess.css";

export default function OrderSuccess() {
  const { orderId } = useParams();
  console.log("orderIdsucces>>>>",orderId);
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await getOrderById(orderId);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="success-container">Loading order details…</div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="success-container">Order not found</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="success-container">
        <div className="success-card">

          {/* SUCCESS ICON */}
          <div className="success-icon">✔</div>

          <h2>Payment Successful</h2>
          <p className="success-sub">
            Your vehicle booking has been confirmed 🎉
          </p>

          {/* ORDER INFO */}
          <div className="success-block">
            <div className="row">
              <span>Order ID</span>
              <strong>#{order.id}</strong>
            </div>

            <div className="row">
              <span>Order Status</span>
              <strong className="paid">{order.order_status}</strong>
            </div>

            <div className="row">
              <span>Total Paid</span>
              <strong className="amount">
                ₹ {Number(order.total_amount).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* VEHICLE INFO */}
          <div className="success-block">
            <h4>Vehicle Details</h4>

            <div className="row">
              <span>Vehicle ID</span>
              <span>{order.vehicle_id}</span>
            </div>

            <div className="row">
              <span>Vehicle Type</span>
              <span>{order.vehicle_type}</span>
            </div>
          </div>

          {/* PAYMENT INFO */}
          <div className="success-block">
            <h4>Payment Information</h4>

            <div className="row">
              <span>Payment Method</span>
              <span>{order.payment_method || "ONLINE"}</span>
            </div>

            <div className="row">
              <span>Payment Status</span>
              <span className="paid">SUCCESS</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="success-actions">
            <button
              className="btn-outline"
              onClick={() => navigate(`/invoice/${order.id}`)}
            >
              View Invoice
            </button>

            <button
              className="btn-primary"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>

          <p className="note">
            Vehicle delivery will be coordinated by the dealer.
            <br />
            Thank you for choosing <strong>Cabik</strong>.
          </p>

        </div>
      </div>

      <Footer />
    </>
  );
}
