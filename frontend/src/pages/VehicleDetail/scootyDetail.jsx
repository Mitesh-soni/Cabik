import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { getScootyById } from "../../api/vehicleApi.js";
import "./vehicleDetail.css";

export default function ScootyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [scooty, setScooty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScooty();
  }, [id]);

  const loadScooty = async () => {
    try {
      const res = await getScootyById(id);
      setScooty(res.data.scooty);
    } catch (err) {
      console.error("Failed to load scooty", err);
      setScooty(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="detail-container">
          <p>Loading scooty details...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!scooty) {
    return (
      <>
        <Navbar />
        <main className="detail-container">
          <p>Scooty not found.</p>
          <button className="btn-outline" onClick={() => navigate("/")}>
            Go Back
          </button>
        </main>
        <Footer />
      </>
    );
  }

  const canBuy =
    user &&
    !scooty.is_prelaunch &&
    scooty.stock_status === "IN_STOCK";

  return (
    <>
      <Navbar />

      <main className="detail-container">
        <div className="detail-header">
          <h1>
            {scooty.brand} <span className="muted">{scooty.model}</span>
          </h1>

          <h2 className="price">
            ₹{Number(scooty.ex_showroom_price).toLocaleString("en-IN")}
          </h2>

          {/* STATUS BADGES */}
          <div className="badges">
            {scooty.is_prelaunch && (
              <span className="badge yellow">Coming Soon</span>
            )}
            {scooty.stock_status === "OUT_OF_STOCK" && (
              <span className="badge red">Out of Stock</span>
            )}
            {scooty.stock_status === "LIMITED_STOCK" && (
              <span className="badge orange">Limited Stock</span>
            )}
          </div>
        </div>

        {/* IMAGE */}
        <div className="detail-image-wrapper">
          <img
            src={scooty.front_image || "/placeholder.png"}
            alt={`${scooty.brand} ${scooty.model}`}
            onError={(e) => (e.currentTarget.src = "/placeholder.png")}
          />
        </div>

        {/* SPECIFICATIONS */}
        <section className="spec-section">
          <h3>Specifications</h3>

          <div className="spec-grid">
            <div><strong>Engine</strong> {scooty.engine_cc} CC</div>
            <div><strong>Mileage</strong> {scooty.mileage || "—"} kmpl</div>
            <div><strong>Power</strong> {scooty.power_bhp || "—"}</div>
            <div><strong>Torque</strong> {scooty.torque_nm || "—"}</div>
            <div><strong>Launch Year</strong> {scooty.launch_year}</div>
          </div>
        </section>

        {/* COLORS */}
        {Array.isArray(scooty.colors) && scooty.colors.length > 0 && (
          <section className="spec-section">
            <h3>Available Colors</h3>
            <div className="chip-row">
              {scooty.colors.map((color, idx) => (
                <span key={idx} className="chip">{color}</span>
              ))}
            </div>
          </section>
        )}

        {/* FEATURES */}
        {Array.isArray(scooty.features) && scooty.features.length > 0 && (
          <section className="spec-section">
            <h3>Key Features</h3>
            <ul className="feature-list">
              {scooty.features.map((f, idx) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          </section>
        )}

        {/* ACTIONS */}
        <div className="detail-actions">
          <button
            className="btn-primary"
            disabled={!canBuy}
            onClick={() => !user && navigate("/login")}
          >
            {user ? "Buy Now" : "Login to Buy"}
          </button>

          <button className="btn-outline">
            Enquire
          </button>
        </div>
      </main>

      <Footer />
    </>
  );
}
