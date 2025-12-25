import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import "./payment.css";

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: ""
  });

  /* =========================
     LOAD ORDER
  ========================= */
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders/${orderId}`
        );
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  /* =========================
     PAY (DUMMY SUCCESS)
  ========================= */
  const handlePay = async () => {
    if (!paymentMethod) {
      alert("Select payment method");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/pay`,
        {
          payment_method: paymentMethod
        }
      );

      alert("Payment Successful 🎉");
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Payment failed");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="payment-container">Loading payment…</div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="payment-container">Order not found</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="payment-container">
        <div className="payment-card">

          <h2>Complete Payment</h2>

          {/* ORDER SUMMARY */}
          <div className="payment-row">
            <span>Order ID</span>
            <strong>#{order.id}</strong>
          </div>

          <div className="payment-row">
            <span>Total Amount</span>
            <strong className="amount">
              ₹ {order.total_amount?.toLocaleString("en-IN")}
            </strong>
          </div>

          {/* PAYMENT METHODS */}
          <div className="payment-methods">
            <label>
              <input
                type="radio"
                checked={paymentMethod === "UPI"}
                onChange={() => setPaymentMethod("UPI")}
              />{" "}
              UPI
            </label>

            <label>
              <input
                type="radio"
                checked={paymentMethod === "CARD"}
                onChange={() => setPaymentMethod("CARD")}
              />{" "}
              Card
            </label>

            <label>
              <input
                type="radio"
                checked={paymentMethod === "NET_BANKING"}
                onChange={() => setPaymentMethod("NET_BANKING")}
              />{" "}
              Net Banking
            </label>

            <label>
              <input
                type="radio"
                checked={paymentMethod === "CASH"}
                onChange={() => setPaymentMethod("CASH")}
              />{" "}
              Cash
            </label>
          </div>

          {/* UPI INPUT */}
          {paymentMethod === "UPI" && (
            <input
              className="payment-input"
              placeholder="Enter UPI ID (example@upi)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          )}

          {/* CARD INPUT */}
          {paymentMethod === "CARD" && (
            <>
              <input
                className="payment-input"
                placeholder="Card Number"
                value={card.number}
                onChange={(e) =>
                  setCard({ ...card, number: e.target.value })
                }
              />

              <div className="card-row">
                <input
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) =>
                    setCard({ ...card, expiry: e.target.value })
                  }
                />
                <input
                  placeholder="CVV"
                  value={card.cvv}
                  onChange={(e) =>
                    setCard({ ...card, cvv: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {/* PAY BUTTON */}
          <button className="btn-pay" onClick={handlePay}>
            Pay ₹ {order.total_amount?.toLocaleString("en-IN")}
          </button>

          <p className="secure-note">
            🔒 This is a dummy payment. No real money deducted.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
