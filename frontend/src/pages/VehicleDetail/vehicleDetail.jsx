import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { getCarById, getBikeById, getScootyById } from "../../api/vehicleApi.js";
import { getDealerById } from "../../api/dealerApi.js";
import "./vehicleDetail.css";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract type from URL path (/cars/:id, /bikes/:id, /scooties/:id)
  const type = location.pathname.split("/")[1]; // Gets 'cars', 'bikes', or 'scooties'
  const { user } = useContext(AuthContext);

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dealer, setDealer] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [favorites, setFavorites] = useState(false);

  /* LOAD VEHICLE */
  useEffect(() => {
    const loadVehicle = async () => {
      try {
        let res;
        if (type === "cars") {
          res = await getCarById(id);
        } else if (type === "bikes") {
          res = await getBikeById(id);
        } else if (type === "scooties") {
          res = await getScootyById(id);
        }

        console.log("Full Response:", res);
        console.log("Response Data:", res?.data);
        console.log("API called for:", type, "ID:", id);
        
        const data = res?.data?.vehicle || res?.data;
        
        console.log("Extracted Data:", data);
        console.log("Data Keys:", data ? Object.keys(data) : "null");
        
        if (!data) {
          console.error("No data found in response");
          setVehicle(null);
          return;
        }
        
        setVehicle(data);
        setActiveImage(
          data?.front_image ||
          data?.side_image ||
          data?.back_image ||
          data?.interior_image ||
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23f0f0f0' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image Available%3C/text%3E%3C/svg%3E"
        );
        if (data?.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (err) {
        console.error("Error loading vehicle - Full Error:", err);
        console.error("Error message:", err.message);
        console.error("Error response:", err.response?.data);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [id, type]);

  /* LOAD DEALER */
  useEffect(() => {
    const loadDealer = async () => {
      if (!vehicle?.dealer_id) return;
      try {
        const res = await getDealerById(vehicle.dealer_id);
        setDealer(res.data?.dealer || null);
      } catch (err) {
        console.error("Error loading dealer:", err);
        setDealer(null);
      }
    };

    loadDealer();
  }, [vehicle?.dealer_id]);

  const toggleFavorite = () => setFavorites(!favorites);

  const getVehicleImages = () => {
    if (!vehicle) return [];
    const images = [];
    if (vehicle.front_image) images.push(vehicle.front_image);
    if (vehicle.side_image) images.push(vehicle.side_image);
    if (vehicle.back_image) images.push(vehicle.back_image);
    if (vehicle.interior_image) images.push(vehicle.interior_image);
    return images.length > 0 ? images : ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23f0f0f0' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Images Available%3C/text%3E%3C/svg%3E"];
  };

  const getVehicleType = () => {
    if (type === "cars") return "🚗 Car";
    if (type === "bikes") return "🏍️ Motorcycle";
    return "🛵 Scooter";
  };

  const getFeatures = () => {
    if (!vehicle) return [];
    if (type === "cars") {
      return [
        { label: "Body Type", value: vehicle.body_type },
        { label: "Fuel Type", value: vehicle.fuel_type },
        { label: "Transmission", value: vehicle.transmission },
        { label: "Seating", value: `${vehicle.seating_capacity} Seater` },
        { label: "Mileage", value: `${vehicle.mileage} km/l` },
        { label: "Engine", value: `${vehicle.engine_cc}cc` },
      ];
    } else {
      return [
        { label: "Fuel Type", value: vehicle.fuel_type },
        { label: "Transmission", value: vehicle.transmission },
        { label: "Braking", value: vehicle.braking_system },
        { label: "Mileage", value: `${vehicle.mileage} km/l` },
        { label: "Engine", value: `${vehicle.engine_cc}cc` },
        { label: "Category", value: type === "bikes" ? "Motorcycle" : "Scooter" },
      ];
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="vehicle-detail-container loading">
          <div className="loading-spinner">Loading vehicle details...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <Navbar />
        <div className="vehicle-detail-container">
          <div className="not-found">
            <h2>Vehicle Not Found</h2>
            <button onClick={() => navigate(-1)} className="btn-back">
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images = getVehicleImages();

  return (
    <>
      <Navbar />
      <main className="vehicle-detail-container">
        {/* HEADER WITH BREADCRUMB */}
        <div className="detail-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="breadcrumb">
            {vehicle.brand} {vehicle.model} {vehicle.variant}
          </div>
          <button
            className={`btn-favorite ${favorites ? "active" : ""}`}
            onClick={toggleFavorite}
          >
            {favorites ? "❤️" : "🤍"}
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="detail-content">
          {/* LEFT - IMAGE GALLERY */}
          <div className="gallery-section">
            <div className="main-image">
              <img
                src={activeImage}
                alt="Vehicle"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23f0f0f0' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3EImage Failed to Load%3C/text%3E%3C/svg%3E";
                }}
              />
              <span className="vehicle-type-badge">{getVehicleType()}</span>
            </div>

            <div className="thumbnail-gallery">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`View ${idx + 1}`}
                  className={`thumbnail ${activeImage === img ? "active" : ""}`}
                  onClick={() => setActiveImage(img)}
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23f0f0f0' width='200' height='150'/%3E%3C/svg%3E";
                  }}
                />
              ))}
            </div>

            {/* COLOR SELECTOR */}
            {vehicle.colors && vehicle.colors.length > 0 && (
              <div className="color-selector">
                <h4>Available Colors</h4>
                <div className="color-options">
                  {vehicle.colors.map((color, idx) => (
                    <button
                      key={idx}
                      className={`color-btn ${selectedColor === color ? "active" : ""}`}
                      style={{
                        backgroundColor: color.toLowerCase(),
                        border:
                          selectedColor === color
                            ? "3px solid #667eea"
                            : "2px solid #ddd",
                      }}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT - DETAILS */}
          <div className="details-section">
            {/* TITLE & PRICE */}
            <div className="title-section">
              <h1>{vehicle.brand}</h1>
              <h2>{vehicle.model}</h2>
              <p className="variant">{vehicle.variant}</p>
              <div className="price-box">
                <span className="label">Starting Price</span>
                <span className="price">
                  ₹{(vehicle.ex_showroom_price / 100000).toFixed(2)}L
                </span>
                <span className="subtitle">Ex-showroom Price</span>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-icon">⛽</span>
                <span className="stat-label">Mileage</span>
                <span className="stat-value">{vehicle.mileage} km/l</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⚙️</span>
                <span className="stat-label">Engine</span>
                <span className="stat-value">{vehicle.engine_cc}cc</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📅</span>
                <span className="stat-label">Launch Year</span>
                <span className="stat-value">{vehicle.launch_year}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⭐</span>
                <span className="stat-label">Availability</span>
                <span className="stat-value">
                  {vehicle.availability_status === "available" ? "✅ In Stock" : "❌ Out"}
                </span>
              </div>
            </div>

            {/* KEY FEATURES */}
            <div className="features-section">
              <h3>Key Features</h3>
              <div className="features-grid">
                {getFeatures().map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    <span className="feature-label">{feature.label}</span>
                    <span className="feature-value">{feature.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA BUTTONS */}
            <div className="cta-buttons">
              <button
                className="btn-primary"
                onClick={() => {
                  if (user) {
                    navigate(`/checkout/${type}/${id}`, { state: { vehicle } });
                  } else {
                    navigate("/login");
                  }
                }}
              >
                Buy Now
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  if (dealer) {
                    alert(
                      `Contact ${dealer.dealer_name}\nPhone: ${dealer.phone || "N/A"}`
                    );
                  } else {
                    alert("Dealer information not available");
                  }
                }}
              >
                Contact Dealer
              </button>
            </div>
          </div>
        </div>

        {/* DEALER INFO */}
        {dealer && (
          <div className="dealer-section">
            <h2>Dealer Information</h2>
            <div className="dealer-card">
              <div className="dealer-info">
                <h3>{dealer.dealer_name}</h3>
                <p className="phone">📞 {dealer.phone || "N/A"}</p>
                <p className="email">✉️ {dealer.email || "N/A"}</p>
                <p className="address">📍 {dealer.address || "N/A"}</p>
                <p className="city">
                  {dealer.city}, {dealer.state}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DESCRIPTION */}
        {vehicle.description && (
          <div className="description-section">
            <h2>About This Vehicle</h2>
            <p>{vehicle.description}</p>
          </div>
        )}

        {/* EMI CALCULATOR */}
        <div className="emi-section">
          <h2>Calculate EMI</h2>
          <div className="emi-calculator">
            <div className="emi-input-group">
              <label>Down Payment (₹)</label>
              <input
                type="number"
                placeholder="Enter down payment"
                defaultValue={Math.round(vehicle.ex_showroom_price * 0.2)}
              />
            </div>
            <div className="emi-input-group">
              <label>Tenure (Years)</label>
              <select>
                <option>3 Years</option>
                <option selected>5 Years</option>
                <option>7 Years</option>
              </select>
            </div>
            <button className="btn-calculate">Calculate EMI</button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
