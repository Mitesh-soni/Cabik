import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { getCarById } from "../../api/vehicleApi.js";
import { createOrder, addPriceBreakup } from "../../api/orderApi.js";
import { emi, insurance } from "../../api/financeApi.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import "./checkout.css";

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [car, setCar] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  /* EMI + INSURANCE */
  const [emiOptions, setEmiOptions] = useState([]);

  const [insurancePlans, setInsurancePlans] = useState([]);
  const [selectedInsurance, setSelectedInsurance] = useState(null);

  /* prevent duplicate order */
  const orderCreatedRef = useRef(false);

  /* LOAD CAR */
  useEffect(() => {
    const loadCar = async () => {
      try {
        const res = await getCarById(id);
        setCar(res.data.vehicle);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCar();
  }, [id]);

  /* CREATE ORDER ONCE */
  useEffect(() => {
    if (!car || !user || orderCreatedRef.current) return;

    const initOrder = async () => {
      try {
        const res = await createOrder({
          user_id: user.user.id,
          dealer_id: car.dealer_id,
          vehicle_type: "CAR",
          vehicle_id: car.id,
          base_price: car.ex_showroom_price
        });

        setOrderId(res.data.id);
        orderCreatedRef.current = true;
      } catch (err) {
        console.error("Order creation failed", err);
      }
    };

    initOrder();
  }, [car, user]);

  /* EMI FETCH */
  useEffect(() => {
    if (!car) return;

    const loadEmi = async () => {
      try {
        const res = await emi({
          vehicle_type: "CAR",
          vehicle_price: car.ex_showroom_price,
          down_payment: 0,
          tenure_years: 5
        });
        setEmiOptions(res.data.emi_options || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadEmi();
  }, [car]);

  /* INSURANCE FETCH */
  useEffect(() => {
    if (!car) return;

    const loadInsurance = async () => {
      try {
        const res = await insurance("CAR");
        setInsurancePlans(res.data.insurance_plans || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadInsurance();
  }, [car]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="checkout-container">Loading checkout…</div>
        <Footer />
      </>
    );
  }

  if (!car) {
    return (
      <>
        <Navbar />
        <div className="checkout-container">Car not found</div>
        <Footer />
      </>
    );
  }

  /* =========================
     PRICE CALCULATION (FIX)
  ========================= */
  const exPrice = Number(car.ex_showroom_price);
  const gstAmount = Math.round(exPrice * 0.28);
  const rtoAmount = 45000;
  const insuranceAmount = selectedInsurance
    ? Number(selectedInsurance.base_premium)
    : 0;

  const totalAmount =
    exPrice + gstAmount + rtoAmount + insuranceAmount;

  /* CONTINUE */
  const handleContinue = async () => {
    try {
      await addPriceBreakup(orderId, {
        ex_showroom_price: exPrice,
        gst_amount: gstAmount,
        insurance_amount: insuranceAmount,
        rto_amount: rtoAmount,
        accessories_amount: 0,
        discount_amount: 0
      });

      navigate(`/payment/${orderId}`);
    } catch (err) {
      console.error(err);
      alert("Price confirmation failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="checkout-container">

        {/* LEFT */}
        <div className="checkout-left">

          {/* VEHICLE */}
          <div className="checkout-card">
            <h3>Vehicle Summary</h3>
            <div className="vehicle-summary">
              <img src={car.front_image} alt={car.model} className="vehicle-img" />
              <div>
                <h4>{car.brand} {car.model}</h4>
                <p>{car.variant} · {car.fuel_type}</p>
                <strong>₹ {exPrice.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>

          {/* EMI */}
          <div className="checkout-card">
            <h3>EMI Options</h3>
            {emiOptions.map((e, i) => (
              <label key={i} style={{ display: "block", marginBottom: 10 }}>
                <input
                  type="radio"
                  name="emi"
                  onChange={() => setSelectedEmi(e)}
                />{" "}
                {e.bank_name} — ₹ {e.monthly_emi}/month ({e.interest_rate}%)
              </label>
            ))}
          </div>

          {/* INSURANCE */}
          <div className="checkout-card">
            <h3>Insurance Plans</h3>
            {insurancePlans.map((p) => (
              <label key={p.plan_id} style={{ display: "block", marginBottom: 10 }}>
                <input
                  type="radio"
                  name="insurance"
                  onChange={() => setSelectedInsurance(p)}
                />{" "}
                {p.provider_name} — {p.plan_name}  
                (₹ {p.base_premium.toLocaleString("en-IN")})
              </label>
            ))}
          </div>

          {/* PRICE */}
          <div className="checkout-card">
            <h3>Price Breakdown</h3>

            <div className="price-row">
              <span>Ex-showroom</span>
              <span>₹ {exPrice.toLocaleString("en-IN")}</span>
            </div>

            <div className="price-row">
              <span>GST (28%)</span>
              <span>₹ {gstAmount.toLocaleString("en-IN")}</span>
            </div>

            <div className="price-row">
              <span>RTO</span>
              <span>₹ {rtoAmount.toLocaleString("en-IN")}</span>
            </div>

            <div className="price-row">
              <span>Insurance</span>
              <span>
                ₹ {insuranceAmount.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="price-total">
              <span>Total</span>
              <strong>₹ {totalAmount.toLocaleString("en-IN")}</strong>
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="checkout-right">
          <div className="checkout-card highlight">
            <h3>Order Status</h3>

            {orderId ? (
              <>
                <p>Order ID: <strong>#{orderId}</strong></p>
                <p>Status: INITIATED</p>
              </>
            ) : (
              <p>Creating order…</p>
            )}

            <button
              className="btn-continue"
              disabled={!orderId}
              onClick={handleContinue}
            >
              Continue
            </button>

            <p className="secure-note">🔒 Secure Booking</p>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
}
