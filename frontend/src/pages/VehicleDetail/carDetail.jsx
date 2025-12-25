import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { getCarById } from "../../api/vehicleApi.js";
import { emi as fetchEmi } from "../../api/financeApi.js";
import "./vehicleDetail.css";

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState("");
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  /* EMI */
  const [showEmi, setShowEmi] = useState(false);
  const [downPayment, setDownPayment] = useState(0);
  const [tenure, setTenure] = useState(5);
  const [emiAmount, setEmiAmount] = useState(0);
  const [bankRates, setBankRates] = useState([]);

  /* LOAD CAR */
  useEffect(() => {
    const loadCar = async () => {
      try {
        const res = await getCarById(id);
        const data = res.data.vehicle;

        setCar(data);
        setDownPayment(Math.round(data.ex_showroom_price * 0.2));
        setActiveImage(
          data.front_image ||
          data.side_image ||
          data.back_image ||
          data.interior_image ||
          "/placeholder.png"
        );
      } catch {
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id]);

  /* EMI CALCULATION */
  useEffect(() => {
    if (!car || !showEmi) return;

    const loadEmi = async () => {
      try {
        const res = await fetchEmi({
          vehicle_type: "CAR",
          vehicle_price: car.ex_showroom_price,
          down_payment: downPayment,
          tenure_years: tenure
        });

        const options = res.data?.emi_options || [];
        setBankRates(options);

        if (options.length) {
          setEmiAmount(
            Math.min(...options.map(o => Number(o.monthly_emi)))
          );
        }
      } catch {
        setBankRates([]);
        setEmiAmount(0);
      }
    };

    loadEmi();
  }, [car, downPayment, tenure, showEmi]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="detail-container">Loading car details…</main>
        <Footer />
      </>
    );
  }

  if (!car) {
    return (
      <>
        <Navbar />
        <main className="detail-container">Car not found</main>
        <Footer />
      </>
    );
  }

  const canBuy =
    user &&
    !car.is_prelaunch &&
    car.stock_status === "IN_STOCK";

  const images = [
    car.front_image,
    car.side_image,
    car.back_image,
    car.interior_image
  ].filter(Boolean);

  return (
    <>
      <Navbar />

      <main className="detail-container">
        <section className="detail-top">

          {/* IMAGE GALLERY */}
          <div className="gallery">
            <div className="main-image" onClick={() => setIsZoomOpen(true)}>
              <img src={activeImage} alt={car.model} />
              <span className="zoom-hint">Click to zoom</span>
            </div>

            <div className="thumbnails">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={activeImage === img ? "active" : ""}
                  onClick={() => setActiveImage(img)}
                />
              ))}
            </div>
          </div>

          {/* INFO PANEL */}
          <div className="info-panel">
            <h1 className="car-title">
              {car.brand} <span className="muted">{car.model}</span>
            </h1>

            <p className="tagline">
              {car.variant} · {car.body_type} · {car.fuel_type}
            </p>

            <h2 className="price">
              ₹ {car.ex_showroom_price.toLocaleString("en-IN")}
              <span className="price-note">Ex-showroom</span>
            </h2>

            {/* DEALER */}
            <div className="dealer-card">
              <div className="dealer-avatar">🏢</div>
              <div>
                <strong>{car.dealer_name || "Authorized Dealer"}</strong>
                <p>⭐ {car.dealer_rating || "4.6"} / 5 · Trusted</p>
              </div>
            </div>

            {/* EMI PREVIEW */}
            <div className="emi-preview" onClick={() => setShowEmi(!showEmi)}>
              <div>
                <strong>Check EMI</strong>
                <p>
                  From ₹ {emiAmount ? emiAmount.toLocaleString("en-IN") : "—"}
                </p>
              </div>
              <span>{showEmi ? "▲" : "▼"}</span>
            </div>

            {/* EMI DETAILS */}
            <div className={`emi-wrapper ${showEmi ? "open" : ""}`}>
              <div className="emi-card">

                <div className="emi-highlight">
                  <span>Monthly EMI</span>
                  <strong>₹ {emiAmount.toLocaleString("en-IN")}</strong>
                </div>

                <div className="emi-control">
                  <label>
                    Down Payment
                    <strong>₹ {downPayment.toLocaleString("en-IN")}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={car.ex_showroom_price * 0.6}
                    step="2500"
                    value={downPayment}
                    onChange={e => setDownPayment(Number(e.target.value))}
                  />
                </div>

                <div className="tenure-options">
                  {[3, 4, 5, 6, 7].map(y => (
                    <button
                      key={y}
                      className={tenure === y ? "active" : ""}
                      onClick={() => setTenure(y)}
                    >
                      {y}Y
                    </button>
                  ))}
                </div>

                <div className="bank-list">
                  {bankRates.map((b, i) => (
                    <div key={i} className="bank-row">
                      <div className="bank-info">
                        <span className="bank-name">{b.bank_name}</span>
                        <span className="bank-rate">{b.interest_rate}% p.a.</span>
                      </div>
                      <strong className="bank-emi">
                        ₹ {b.monthly_emi.toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BUY NOW */}
            <button
              className="btn-buy-animated"
              disabled={!canBuy}
              onClick={() => {
                if (!user) navigate("/login");
                else navigate(`/checkout/car/${car.id}`);
              }}
            >
              Buy Now
            </button>
          </div>
        </section>

        {/* FEATURES */}
        {Array.isArray(car.features) && (
          <section className="spec-section">
            <h3>Key Features</h3>
            <ul className="feature-grid">
              {car.features.map((f, i) => (
                <li key={i}>✔ {f}</li>
              ))}
            </ul>
          </section>
        )}

        {/* TECH SPECS */}
        <section className="spec-section">
          <h3>Technical Specifications</h3>
          <div className="spec-grid">
            <div><strong>Engine</strong>{car.engine_cc} CC</div>
            <div><strong>Transmission</strong>{car.transmission}</div>
            <div><strong>Fuel</strong>{car.fuel_type}</div>
            <div><strong>Mileage</strong>{car.mileage || "—"}</div>
            <div><strong>Seats</strong>{car.seating_capacity}</div>
            <div><strong>Body</strong>{car.body_type}</div>
          </div>
        </section>
      </main>

      {isZoomOpen && (
        <div className="zoom-modal" onClick={() => setIsZoomOpen(false)}>
          <img src={activeImage} />
        </div>
      )}

      <Footer />
    </>
  );
}
