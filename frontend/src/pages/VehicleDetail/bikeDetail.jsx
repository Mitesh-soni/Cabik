import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { getBikeById } from "../../api/vehicleApi.js";
import "./vehicleDetail.css";

export default function BikeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    loadBike();
  }, [id]);

  const loadBike = async () => {
    try {
      const res = await getBikeById(id);
      const data = res.data.vehicle;
      setBike(data);
      setActiveImage(
        data.front_image ||
        data.side_image ||
        data.back_image ||
        "/placeholder.png"
      );
    } catch {
      setBike(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="detail-container">Loading bike details…</main>
        <Footer />
      </>
    );
  }

  if (!bike) {
    return (
      <>
        <Navbar />
        <main className="detail-container">Bike not found</main>
        <Footer />
      </>
    );
  }

  const images = [
    bike.front_image,
    bike.side_image,
    bike.back_image
  ].filter(Boolean);

  return (
    <>
      <Navbar />

      <main className="detail-container">
        <section className="detail-top">

          {/* IMAGE GALLERY */}
          <div className="gallery">
            <div className="main-image" onClick={() => setIsZoomOpen(true)}>
              <img src={activeImage} alt={bike.model} />
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
              {bike.brand} <span className="muted">{bike.model}</span>
            </h1>

            <p className="tagline">
              {bike.engine_cc} CC · {bike.braking_system}
            </p>

            <h2 className="price">
              ₹ {bike.ex_showroom_price.toLocaleString("en-IN")}
              <span className="price-note">Ex-showroom</span>
            </h2>

            <div className="dealer-card">
              <div className="dealer-avatar">🏍️</div>
              <div>
                <h4>{bike.dealer_name || "Authorized Dealer"}</h4>
                <p className="dealer-rating">⭐ 4.5 / 5 · Trusted Seller</p>
              </div>
            </div>

            <div className="quick-specs">
              <div><strong>Engine</strong>{bike.engine_cc} CC</div>
              <div><strong>Mileage</strong>{bike.mileage || "—"}</div>
              <div><strong>Brakes</strong>{bike.braking_system}</div>
              <div><strong>ABS</strong>{bike.abs ? "Yes" : "No"}</div>
            </div>

            <div className="detail-actions">
              <button
                className="btn-primary glow"
                onClick={() => !user && navigate("/login")}
              >
                {user ? "Buy This Bike" : "Login to Buy"}
              </button>
              <button className="btn-outline">Request Callback</button>
            </div>
          </div>
        </section>
      </main>

      {/* IMAGE ZOOM */}
      {isZoomOpen && (
        <div className="zoom-modal" onClick={() => setIsZoomOpen(false)}>
          <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
            <img src={activeImage} />
            <button className="zoom-close">✕</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
