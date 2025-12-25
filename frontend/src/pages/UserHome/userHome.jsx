import React from "react";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getCars, getBikes, getScooties } from "../../api/vehicleApi";
import "./userHome.css";
import { useNavigate } from "react-router-dom";

export default function UserHome() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  // console.log(cars);
  const [bikes, setBikes] = useState([]);
  // console.log(bikes)
  const [scooties, setScooties] = useState([]);
  // console.log(scooties)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
  setLoading(true);
  try {
    const [resCars, resBikes, resScooties] = await Promise.all([
      getCars(),
      getBikes(),
      getScooties()
    ]);

    setCars(resCars?.data?.data || []);
    setBikes(resBikes?.data?.data || []);
    setScooties(resScooties?.data?.data || []);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    setCars([]);
    setBikes([]);
    setScooties([]);
  } finally {
    setLoading(false);
  }
};

  const imageSrc = (item, ...fields) => {
    // Try possible image fields in order; fallback to placeholder
    for (const f of fields) {
      if (item?.[f]) return item[f];
    }
    return "/placeholder.png";
  };

  const formatPrice = (num) => {
    if (num === null || num === undefined || num === 0) return "—";
    try {
      return Number(num).toLocaleString("en-IN");
    } catch {
      return num;
    }
  };

  const Card = ({ children }) => <div className="card">{children}</div>;

  return (
    <>
      <Navbar />

      <main className="home-container">
        <header className="home-hero">
          <div>
            <h1>Discover Vehicles</h1>
            <p className="hero-sub">
              Browse curated Cars, Bikes & Scooties — real data from your backend.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => window.scrollTo({ top: 200, behavior: "smooth" })}>
              Explore Cars
            </button>
            <button className="btn-primary" onClick={() => window.scrollTo({ top: 1500, behavior: "smooth" })}>
              Explore Bikes & Scooties
            </button>
          </div>
        </header>

        {/* Cars */}
        <section className="section">
          <h2 className="section-title">Cars</h2>

          {loading ? (
            <div className="card-grid skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card skeleton">
                  <div className="img-skeleton" />
                  <div className="text-skeleton short" />
                  <div className="text-skeleton" />
                </div>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <p className="empty">No cars found.</p>
          ) : (
            <div className="card-grid">
              {cars.map((car) => (
                <Card key={car.id}>
                  <div className="card-media">
                    <img
                      src={imageSrc(car, "front_image")}
                      alt={`${car.brand} ${car.model}`}
                      loading="lazy"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <div className="price-badge">₹{formatPrice(car.ex_showroom_price)}</div>
                    <div className="fav">♡</div>
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{car.brand} <span className="muted">{car.model}</span></h3>

                    <div className="card-specs">
                      <span>{car.fuel_type || "Fuel: —"}</span>
                      <span> · </span>
                      <span>{car.transmission || "Transmission: —"}</span>
                      <span> · </span>
                      <span>{car.seating_capacity ? `${car.seating_capacity} seater` : "Seats: —"}</span>
                    </div>

                    <div className="card-actions">
                      <button className="btn-sm" onClick={() => navigate(`/cars/${car?.id}`)}>View</button>
                      <button className="btn-sm outline">Contact</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Bikes */}
        <section className="section">
          <h2 className="section-title">Bikes</h2>

          {loading ? (
            <div className="card-grid skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card skeleton">
                  <div className="img-skeleton" />
                  <div className="text-skeleton short" />
                  <div className="text-skeleton" />
                </div>
              ))}
            </div>
          ) : bikes.length === 0 ? (
            <p className="empty">No bikes found.</p>
          ) : (
            <div className="card-grid">
              {bikes.map((bike) => (
                <Card key={bike.id}>
                  <div className="card-media">
                    <img
                      src={imageSrc(bike, "front_image")}
                      alt={`${bike.brand} ${bike.model}`}
                      loading="lazy"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <div className="price-badge">₹{formatPrice(bike.ex_showroom_price)}</div>
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{bike.brand} <span className="muted">{bike.model}</span></h3>

                    <div className="card-specs">
                      <span>{bike.engine_cc ? `${bike.engine_cc} CC` : "—"}</span>
                      <span> · </span>
                      <span>{bike.braking_system || "Brakes: —"}</span>
                    </div>

                    <div className="card-actions">
                      <button className="btn-sm" onClick={() => navigate(`/bikes/${bike?.id}`)}>View</button>
                      <button className="btn-sm outline">Contact</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Scooties */}
        <section className="section">
          <h2 className="section-title">Scooties</h2>

          {loading ? (
            <div className="card-grid skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card skeleton">
                  <div className="img-skeleton" />
                  <div className="text-skeleton short" />
                  <div className="text-skeleton" />
                </div>
              ))}
            </div>
          ) : scooties.length === 0 ? (
            <p className="empty">No scooties found.</p>
          ) : (
            <div className="card-grid">
              {scooties.map((scooty) => (
                <Card key={scooty.id}>
                  <div className="card-media">
                    <img
                      src={imageSrc(scooty, "front_image", "frontImage", "image_url", "image")}
                      alt={`${scooty.brand} ${scooty.model}`}
                      loading="lazy"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <div className="price-badge">₹{formatPrice(scooty.ex_showroom_price)}</div>
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{scooty.brand} <span className="muted">{scooty.model}</span></h3>

                    <div className="card-specs">
                      <span>{scooty.mileage ? `${scooty.mileage} kmpl` : "—"}</span>
                      <span> · </span>
                      <span>{scooty.engine_cc ? `${scooty.engine_cc} CC` : "—"}</span>
                    </div>

                    <div className="card-actions">
                      <button className="btn-sm" onClick={() => navigate(`/scooties/${scooties?.id}`)}>View</button>
                      <button className="btn-sm outline">Contact</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
