import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useMemo } from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import {
  getCarById,
  getBikeById,
  getScootyById
} from "../../api/vehicleApi.js";
import { createOrder, addPriceBreakup, addEmiDetails, addInsuranceDetails } from "../../api/orderApi.js";
import { emi, insurance } from "../../api/financeApi.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import "./checkout.css";

export default function Checkout() {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const normalizedType = (type || "car").toLowerCase();

  const config = useMemo(() => ({
    car: { fetch: getCarById, label: "Car", typeCode: "CAR" },
    bike: { fetch: getBikeById, label: "Bike", typeCode: "BIKE" },
    scooty: { fetch: getScootyById, label: "Scooty", typeCode: "SCOOTY" }
  }), []);

  const activeConfig = config[normalizedType] || config.car;

  const [vehicle, setVehicle] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  /* EMI + INSURANCE */
  const [emiOptions, setEmiOptions] = useState([]);
  const [selectedEmi, setSelectedEmi] = useState(null);
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [selectedInsurance, setSelectedInsurance] = useState(null);

  // Single order per session
  const orderCacheKey = useMemo(
    () => `checkout-order-${user?.user?.id}-${normalizedType}-${id}`,
    [user?.user?.id, normalizedType, id]
  );

  /* LOAD VEHICLE */
  useEffect(() => {
    const loadVehicle = async () => {
      setLoading(true);
      try {
        const res = await activeConfig.fetch(id);
        setVehicle(res.data.vehicle);
        
        // Restore cached order if exists
        const cached = sessionStorage.getItem(orderCacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.orderId) setOrderId(parsed.orderId);
        }
      } catch (err) {
        console.error(err);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };
    loadVehicle();
  }, [id, activeConfig, orderCacheKey]);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  /* CREATE ORDER ONCE */
  useEffect(() => {
    if (!vehicle || !user || orderId) return;

    const initOrder = async () => {
      try {
        const exPrice = Number(
          vehicle.ex_showroom_price ??
          vehicle.price ??
          vehicle.base_price ??
          0
        );

        const res = await createOrder({
          user_id: user.user.id,
          dealer_id: vehicle.dealer_id,
          vehicle_type: activeConfig.typeCode,
          vehicle_id: vehicle.id,
          base_price: exPrice
        });

        setOrderId(res.data.id);
        sessionStorage.setItem(orderCacheKey, JSON.stringify({ orderId: res.data.id }));
      } catch (err) {
        console.error("Order creation failed", err);
      }
    };

    initOrder();
  }, [vehicle, user, activeConfig, orderId, orderCacheKey]);

  /* LOAD EMI */
  useEffect(() => {
    if (!vehicle) return;

    const loadEmi = async () => {
      try {
        const exPrice = Number(
          vehicle.ex_showroom_price ??
          vehicle.price ??
          vehicle.base_price ??
          0
        );

        const variants = [activeConfig.typeCode, "CAR"];
        for (const variant of variants) {
          const res = await emi({
            vehicle_type: variant,
            vehicle_price: exPrice,
            down_payment: 0,
            tenure_years: 5
          });

          const options = res.data?.emi_options || [];
          if (options.length) {
            setEmiOptions(options);
            return;
          }
        }
        setEmiOptions([]);
      } catch (err) {
        console.error(err);
        setEmiOptions([]);
      }
    };

    loadEmi();
  }, [vehicle, activeConfig.typeCode]);

  /* LOAD INSURANCE */
  useEffect(() => {
    if (!vehicle) return;

    const loadInsurance = async () => {
      try {
        const variants = [activeConfig.typeCode, "CAR"];
        for (const variant of variants) {
          const res = await insurance(variant);
          const plans = res.data?.insurance_plans || [];
          if (plans.length) {
            setInsurancePlans(plans);
            return;
          }
        }
        setInsurancePlans([]);
      } catch (err) {
        console.error(err);
        setInsurancePlans([]);
      }
    };

    loadInsurance();
  }, [vehicle, activeConfig.typeCode]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="checkout-container">
          <div className="loading-spinner">Loading checkout…</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <Navbar />
        <div className="checkout-container">
          <div className="error-box">Vehicle not found</div>
        </div>
        <Footer />
      </>
    );
  }

  /* PRICE CALCULATION */
  const exPrice = Number(
    vehicle.ex_showroom_price ??
    vehicle.price ??
    vehicle.base_price ??
    0
  );
  const gstAmount = Math.round(exPrice * 0.28);
  const rtoAmount = 45000;
  const insuranceAmount = selectedInsurance
    ? Number(selectedInsurance.base_premium)
    : 0;

  const totalAmount = exPrice + gstAmount + rtoAmount + insuranceAmount;

  const title = [vehicle.brand, vehicle.model].filter(Boolean).join(" ");
  const subtitleParts = [
    vehicle.variant,
    vehicle.fuel_type,
    vehicle.body_type,
    vehicle.engine_cc ? `${vehicle.engine_cc} CC` : null
  ].filter(Boolean);
  const subtitle = subtitleParts.join(" · ");
  const heroImg = vehicle.front_image || vehicle.side_image || vehicle.back_image || "/placeholder.png";

  const hasEmi = Array.isArray(emiOptions) && emiOptions.length > 0;
  const hasInsurance = Array.isArray(insurancePlans) && insurancePlans.length > 0;

  /* PROCEED TO PAYMENT */
  const handleContinue = async () => {
    if (!orderId) {
      alert("Order not created yet. Please wait.");
      return;
    }

    setProcessing(true);

    try {
      // Save price breakdown with explicit console logging
      console.log("Saving price breakdown:", {
        ex_showroom_price: exPrice,
        gst_amount: gstAmount,
        insurance_amount: insuranceAmount,
        rto_amount: rtoAmount,
        accessories_amount: 0,
        discount_amount: 0
      });

      const priceRes = await addPriceBreakup(orderId, {
        ex_showroom_price: exPrice,
        gst_amount: gstAmount,
        insurance_amount: insuranceAmount,
        rto_amount: rtoAmount,
        accessories_amount: 0,
        discount_amount: 0
      });
      console.log("Price breakdown saved:", priceRes.data);

      // Save EMI if selected
      if (selectedEmi) {
        console.log("Saving EMI details:", selectedEmi);
        const emiRes = await addEmiDetails(orderId, {
          bank_name: selectedEmi.bank_name,
          interest_rate: selectedEmi.interest_rate,
          tenure_years: selectedEmi.tenure_years || 5,
          down_payment: 0,
          monthly_emi: selectedEmi.monthly_emi,
          processing_fee: selectedEmi.processing_fee || 0
        });
        console.log("EMI details saved:", emiRes.data);
        sessionStorage.setItem(`payment-mode-${orderId}`, "EMI");
      } else {
        sessionStorage.removeItem(`payment-mode-${orderId}`);
      }

      // Save Insurance if selected
      if (selectedInsurance) {
        console.log("Saving insurance details:", selectedInsurance);
        const insRes = await addInsuranceDetails(orderId, {
          provider_name: selectedInsurance.provider_name,
          plan_name: selectedInsurance.plan_name,
          coverage_type: selectedInsurance.coverage_type || "COMPREHENSIVE",
          premium_amount: selectedInsurance.base_premium,
          tenure_years: selectedInsurance.tenure_years || 1
        });
        console.log("Insurance details saved:", insRes.data);
      }

      navigate(`/payment/${orderId}`);
    } catch (err) {
      console.error("Error in handleContinue:", err);
      alert("Failed to process. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="checkout-container">
        <div className="checkout-grid">
          {/* LEFT COLUMN - MAIN CONTENT */}
          <div className="checkout-main">
            {/* VEHICLE CARD */}
            <div className="checkout-section vehicle-card">
              <div className="section-header">
                <h2>Vehicle Summary</h2>
              </div>
              <div className="vehicle-info">
                <img src={heroImg} alt={title} className="vehicle-thumb" />
                <div className="vehicle-details">
                  <h3>{title}</h3>
                  <p className="vehicle-subtitle">{subtitle}</p>
                  <p className="vehicle-price">₹ {exPrice.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            {/* EMI OPTIONS */}
            <div className="checkout-section">
              <div className="section-header">
                <h2>EMI Options</h2>
                <span className="badge">{hasEmi ? `${emiOptions.length} available` : "N/A"}</span>
              </div>
              {hasEmi ? (
                <div className="options-grid">
                  {emiOptions.map((e, i) => (
                    <label
                      key={i}
                      className={`option-card ${selectedEmi === e ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="emi"
                        checked={selectedEmi === e}
                        onChange={() => setSelectedEmi(e)}
                      />
                      <div className="option-content">
                        <div className="option-title">{e.bank_name}</div>
                        <div className="option-value">₹ {e.monthly_emi.toLocaleString("en-IN")}/mo</div>
                        <div className="option-meta">{e.interest_rate}% p.a. · 5 years</div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No EMI options available for this vehicle</p>
              )}
            </div>

            {/* INSURANCE */}
            <div className="checkout-section">
              <div className="section-header">
                <h2>Insurance Plans</h2>
                <span className="badge">{hasInsurance ? `${insurancePlans.length} available` : "N/A"}</span>
              </div>
              {hasInsurance ? (
                <div className="options-grid">
                  {insurancePlans.map((p) => (
                    <label
                      key={p.plan_id}
                      className={`option-card ${selectedInsurance === p ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="insurance"
                        checked={selectedInsurance === p}
                        onChange={() => setSelectedInsurance(p)}
                      />
                      <div className="option-content">
                        <div className="option-title">{p.provider_name}</div>
                        <div className="option-value">₹ {p.base_premium.toLocaleString("en-IN")}/yr</div>
                        <div className="option-meta">{p.plan_name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No insurance plans available</p>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="checkout-sidebar">
            <div className="checkout-section sticky-card">
              <div className="section-header">
                <h2>Price Summary</h2>
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Ex-showroom Price</span>
                  <span>₹ {exPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="price-row">
                  <span>GST (28%)</span>
                  <span>₹ {gstAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="price-row">
                  <span>RTO Charges</span>
                  <span>₹ {rtoAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="price-row">
                  <span>Insurance</span>
                  <span className={insuranceAmount ? "highlight" : ""}>
                    ₹ {insuranceAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="price-divider"></div>
                <div className="price-row total">
                  <span>Total Amount</span>
                  <span>₹ {totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {orderId && (
                <div className="order-info">
                  <p className="order-id">Order ID: <strong>#{orderId}</strong></p>
                  <p className="order-status">Status: <span className="badge-success">INITIATED</span></p>
                </div>
              )}

              <button
                className="btn-continue"
                disabled={!orderId || processing}
                onClick={handleContinue}
              >
                {processing ? "Processing..." : "Proceed to Payment"}
              </button>

              <p className="secure-note">
                🔒 Secure checkout · SSL encrypted
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
