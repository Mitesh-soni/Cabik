import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { payOrder, getOrderById } from "../../api/orderApi.js";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import "./payment.css";

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Check if EMI was selected in checkout
  const hasEmi = sessionStorage.getItem(`payment-mode-${orderId}`) === "EMI";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(hasEmi ? "EMI" : "");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await getOrderById(orderId);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  /* VALIDATION */
  const validateForm = () => {
    const newErrors = {};

    // EMI flow requires card details of the selected bank
    if (hasEmi) {
      if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
        newErrors.cardNumber = "Enter valid 16-digit card number";
      }
      if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        newErrors.cardExpiry = "Enter expiry as MM/YY";
      }
      if (!cardCvv || cardCvv.length !== 3) {
        newErrors.cardCvv = "Enter valid 3-digit CVV";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }

    if (paymentMethod === "CARD") {
      if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
        newErrors.cardNumber = "Enter valid 16-digit card number";
      }
      if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        newErrors.cardExpiry = "Enter expiry as MM/YY";
      }
      if (!cardCvv || cardCvv.length !== 3) {
        newErrors.cardCvv = "Enter valid 3-digit CVV";
      }
    }

    if (paymentMethod === "UPI") {
      if (!upiId || !upiId.includes("@")) {
        newErrors.upiId = "Enter valid UPI ID (e.g., user@paytm)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* FORMAT CARD NUMBER */
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  /* FORMAT EXPIRY */
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2);
    }
    setCardExpiry(value);
  };

  /* SUBMIT PAYMENT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setPaymentError("");

    if (!validateForm()) {
      alert("Please fill all required fields correctly");
      return;
    }

    setProcessing(true);

    try {
      let finalPaymentMode = paymentMethod;
      if (hasEmi) {
        finalPaymentMode = "EMI";
      }
      
      console.log("Selected paymentMethod:", paymentMethod);
      console.log("hasEmi:", hasEmi);
      console.log("finalPaymentMode:", finalPaymentMode);

      // compute payable amount fallback if backend ignores price breakdown
      const price = order?.price_breakdown || {};
      const basePrice = Number(price.ex_showroom_price || order?.base_price || order?.ex_showroom_price || 0);
      const gst = Number(price.gst_amount || Math.round(basePrice * 0.28));
      const rto = Number(price.rto_amount || 45000);
      const insurance = Number(price.insurance_amount || order?.insurance_details?.premium_amount || 0);
      const accessories = Number(price.accessories_amount || 0);
      const discount = Number(price.discount_amount || 0);
      const payableAmount = basePrice + gst + rto + insurance + accessories - discount;

      await payOrder(orderId, {
        payment_method: finalPaymentMode,
        payment_status: "SUCCESS",
        amount: payableAmount,
        transaction_id: `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`
      });

      // Clear session data
      sessionStorage.removeItem(`payment-mode-${orderId}`);
      const keys = Object.keys(sessionStorage);
      keys.forEach((k) => {
        if (k.includes(`checkout-order-`)) {
          sessionStorage.removeItem(k);
        }
      });

      navigate(`/invoice/${orderId}`);
    } catch (err) {
      console.error(err);
      setPaymentError("Payment failed. Please try again. If it keeps failing, re-open checkout and re-select EMI.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="payment-container">
          <div className="loading-spinner">Loading payment…</div>
        </div>
        <Footer />
      </>
    );
  }

  const vehicleType = order?.vehicle_type?.toLowerCase() || "car";
  const vehicleId = order?.vehicle_id;

  return (
    <>
      <Navbar />

      <div className="payment-container">
        <div className="payment-card">
          <div className="payment-header">
            <h1>Complete Payment</h1>
            <p className="order-ref">Order #{orderId}</p>
            {hasEmi && order?.emi_details?.bank_name && (
              <div className="emi-notice">
                <span>✓</span> EMI Payment - {order.emi_details.bank_name}
              </div>
            )}
          </div>

              {paymentError && <div className="error-box">{paymentError}</div>}
          <form onSubmit={handleSubmit} className="payment-form">
            {/* EMI MODE - SHOW ONLY EMI DETAILS */}
            {hasEmi && (
              <div className="form-section emi-mode-section">
                <h3>EMI Payment {order?.emi_details?.bank_name ? `- ${order.emi_details.bank_name}` : ""}</h3>
                <div className="emi-selected-card">
                  <div className="emi-card-header">
                    <span className="bank-icon">🏦</span>
                    <span className="bank-name">{order?.emi_details?.bank_name || "Selected EMI Bank"}</span>
                  </div>
                  <div className="emi-card-details">
                    <div className="emi-detail-row">
                      <span className="detail-label">Monthly EMI</span>
                      <span className="detail-value">₹ {Number(order?.emi_details?.monthly_emi || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="emi-detail-row">
                      <span className="detail-label">Interest Rate</span>
                      <span className="detail-value">{order?.emi_details?.interest_rate || "--"}% p.a.</span>
                    </div>
                    <div className="emi-detail-row">
                      <span className="detail-label">Tenure</span>
                      <span className="detail-value">{order?.emi_details?.tenure_years || "--"} years</span>
                    </div>
                    <div className="emi-detail-row">
                      <span className="detail-label">Processing Fee</span>
                      <span className="detail-value">₹ {Number(order?.emi_details?.processing_fee || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Enter Card Details</h3>
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className={errors.cardNumber ? "input-error" : ""}
                    />
                    {errors.cardNumber && <p className="error-text">{errors.cardNumber}</p>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className={errors.cardExpiry ? "input-error" : ""}
                      />
                      {errors.cardExpiry && <p className="error-text">{errors.cardExpiry}</p>}
                    </div>

                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength="3"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        className={errors.cardCvv ? "input-error" : ""}
                      />
                      {errors.cardCvv && <p className="error-text">{errors.cardCvv}</p>}
                    </div>
                  </div>
                </div>

                <p className="emi-info-text">
                  ℹ️ Pay with your card to activate the EMI plan
                </p>
              </div>
            )}

            {/* NORMAL PAYMENT METHOD SELECTION */}
            {!hasEmi && (
              <>
                <div className="form-section">
                  <h3>Select Payment Method</h3>
                  <div className="payment-methods">
                    <label className={`method-option ${paymentMethod === "UPI" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="UPI"
                        checked={paymentMethod === "UPI"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="method-content">
                        <span className="method-icon">📱</span>
                        <span className="method-label">UPI</span>
                      </div>
                    </label>

                    <label className={`method-option ${paymentMethod === "CARD" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="CARD"
                        checked={paymentMethod === "CARD"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="method-content">
                        <span className="method-icon">💳</span>
                        <span className="method-label">Debit/Credit Card</span>
                      </div>
                    </label>

                    <label className={`method-option ${paymentMethod === "NET_BANKING" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="NET_BANKING"
                        checked={paymentMethod === "NET_BANKING"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="method-content">
                        <span className="method-icon">🏦</span>
                        <span className="method-label">Net Banking</span>
                      </div>
                    </label>

                    <label className={`method-option ${paymentMethod === "CASH" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="CASH"
                        checked={paymentMethod === "CASH"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="method-content">
                        <span className="method-icon">💵</span>
                        <span className="method-label">Cash on Delivery</span>
                      </div>
                    </label>
                  </div>
                  {errors.paymentMethod && <p className="error-text">{errors.paymentMethod}</p>}
                </div>

                {/* UPI DETAILS */}
                {paymentMethod === "UPI" && (
                  <div className="form-section">
                    <h3>Enter UPI Details</h3>
                    <div className="form-group">
                      <label>UPI ID</label>
                      <input
                        type="text"
                        placeholder="yourname@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className={errors.upiId ? "input-error" : ""}
                      />
                      {errors.upiId && <p className="error-text">{errors.upiId}</p>}
                    </div>
                  </div>
                )}

                {/* CARD DETAILS */}
                {paymentMethod === "CARD" && (
                  <div className="form-section">
                    <h3>Enter Card Details</h3>
                    <div className="form-group">
                      <label>Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className={errors.cardNumber ? "input-error" : ""}
                      />
                      {errors.cardNumber && <p className="error-text">{errors.cardNumber}</p>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className={errors.cardExpiry ? "input-error" : ""}
                        />
                        {errors.cardExpiry && <p className="error-text">{errors.cardExpiry}</p>}
                      </div>

                      <div className="form-group">
                        <label>CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength="3"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          className={errors.cardCvv ? "input-error" : ""}
                        />
                        {errors.cardCvv && <p className="error-text">{errors.cardCvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* NET BANKING */}
                {paymentMethod === "NET_BANKING" && (
                  <div className="form-section">
                    <div className="info-box">
                      You will be redirected to your bank's secure payment page
                    </div>
                  </div>
                )}

                {/* CASH */}
                {paymentMethod === "CASH" && (
                  <div className="form-section">
                    <div className="info-box">
                      Pay cash when the vehicle is delivered to your location
                    </div>
                  </div>
                )}
              </>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className="btn-pay"
              disabled={processing || (!hasEmi && !paymentMethod)}
            >
              {processing ? "Processing Payment..." : hasEmi ? "Pay with EMI" : "Complete Payment"}
            </button>

            <p className="secure-note">
              🔒 Your payment is secured with 256-bit SSL encryption
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
