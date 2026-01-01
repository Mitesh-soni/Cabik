import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getCars, getBikes, getScooties } from "../../api/vehicleApi";
import { AuthContext } from "../../contexts/AuthContext";
import "./userHome.css";

export default function UserHome() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [cars, setCars] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [scooties, setScooties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalCars, setTotalCars] = useState(0);
  const [totalBikes, setTotalBikes] = useState(0);
  const [totalScooties, setTotalScooties] = useState(0);

  useEffect(() => {
    loadVehicles();
  }, [currentPage, activeFilter]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const params = { 
        page: currentPage, 
        limit: itemsPerPage 
      };

      const [resCars, resBikes, resScooties] = await Promise.all([
        getCars(params),
        getBikes(params),
        getScooties(params)
      ]);

      setCars(resCars?.data?.data || []);
      setBikes(resBikes?.data?.data || []);
      setScooties(resScooties?.data?.data || []);
      
      // Store total counts for pagination
      setTotalCars(resCars?.data?.count || 0);
      setTotalBikes(resBikes?.data?.count || 0);
      setTotalScooties(resScooties?.data?.count || 0);
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
    for (const f of fields) {
      if (item?.[f]) return item[f];
    }
    return "https://via.placeholder.com/320x320?text=Vehicle";
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const getFilteredVehicles = () => {
    let all = [];

    if (activeFilter === "all" || activeFilter === "cars") {
      all = all.concat(cars.map((c) => ({ ...c, type: "cars" })));
    }
    if (activeFilter === "all" || activeFilter === "bikes") {
      all = all.concat(bikes.map((b) => ({ ...b, type: "bikes" })));
    }
    if (activeFilter === "all" || activeFilter === "scooties") {
      all = all.concat(scooties.map((s) => ({ ...s, type: "scooties" })));
    }

    let filtered = all.filter(
      (v) =>
        (v.brand?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (v.model?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (v.variant?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => (a.ex_showroom_price || 0) - (b.ex_showroom_price || 0));
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => (b.ex_showroom_price || 0) - (a.ex_showroom_price || 0));
    }

    return filtered;
  };

  const filteredVehicles = getFilteredVehicles();

  const VehicleCard = ({ vehicle, type }) => (
    <div className="vehicle-card">
      <div className="card-image-wrapper">
        <img
          src={vehicle.front_image || vehicle.image || vehicle.image_url || "https://via.placeholder.com/400x300?text=" + vehicle.model}
          alt={vehicle.model}
          className="card-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%23999' text-anchor='middle' dy='.3em'%3E" + vehicle.model + "%3C/text%3E%3C/svg%3E";
          }}
        />
        <span className="type-badge">
          {type === "cars" ? "🚗 Car" : type === "bikes" ? "🏍️ Bike" : "🛵 Scooty"}
        </span>
        <button
          className={`favorite-btn ${favorites.includes(vehicle.id) ? "active" : ""}`}
          onClick={() => toggleFavorite(vehicle.id)}
        >
          {favorites.includes(vehicle.id) ? "❤️" : "🤍"}
        </button>
        {vehicle.discount && (
          <span className="discount-badge">{vehicle.discount}% OFF</span>
        )}
      </div>

      <div className="card-content">
        <p className="vehicle-name">{vehicle.brand}</p>
        <p className="model-name">{vehicle.model}</p>
        {vehicle.variant && (
          <p className="vehicle-variant">{vehicle.variant}</p>
        )}

        <div className="specs-row">
          <span className="spec">{vehicle.fuel_type || "Petrol"}</span>
          <span className="separator">•</span>
          <span className="spec">{vehicle.transmission || "Manual"}</span>
          <span className="separator">•</span>
          <span className="spec">{vehicle.seating_capacity || 5} Seater</span>
        </div>

        {vehicle.engine_cc && (
          <div className="engine-info">💨 {vehicle.engine_cc}cc</div>
        )}

        <div className="price-section">
          <div className="price-display">
            <span className="currency">₹</span>
            <span className="amount">
              {vehicle.ex_showroom_price ? (vehicle.ex_showroom_price / 100000).toFixed(2) : "N/A"}L
            </span>
          </div>
          <p className="price-note">Estimated Price</p>
        </div>

        <div className="card-actions">
          <button
            className="btn-view"
            onClick={() => navigate(`/${type}/${vehicle.id}`)}
          >
            View Details
          </button>
          <button
            className="btn-contact"
            onClick={() => alert("Contact dealer feature coming soon!")}
          >
            Contact
          </button>
        </div>

        <div className="quick-emi">
          <span className="emi-icon">💳</span>
          EMI from ₹{Math.round((vehicle.ex_showroom_price || 0) / 60000)}K/month
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="user-home-container">
        {/* WELCOME HERO */}
        <section className="welcome-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome Back, <span className="gradient-text">{user?.user?.full_name || "Guest"}</span>
            </h1>
            <p className="hero-subtitle">
              Discover your perfect vehicle with flexible EMI options
            </p>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{cars.length + bikes.length + scooties.length}+</span>
              <span className="stat-label">Vehicles</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Dealers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Secure</span>
            </div>
          </div>
        </section>

        {/* SEARCH & FILTER */}
        <section className="search-section">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search by brand, model, or variant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Vehicle Type</label>
              <div className="filter-buttons">
                {["all", "cars", "bikes", "scooties"].map((filter) => (
                  <button
                    key={filter}
                    className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
                    onClick={() => handleFilterChange(filter)}
                  >
                    {filter === "all"
                      ? "All"
                      : filter === "cars"
                      ? "Cars"
                      : filter === "bikes"
                      ? "Bikes"
                      : "Scooties"}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className="favorites-indicator">
              <span className="fav-icon">❤️</span>
              <span className="fav-count">{favorites.length}</span>
              <span className="fav-label">Favorites</span>
            </div>
          </div>
        </section>

        {/* VEHICLES GRID */}
        {loading ? (
          <section className="vehicles-section">
            <div className="vehicles-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="vehicle-card skeleton">
                  <div className="image-skeleton"></div>
                  <div className="card-content">
                    <div className="text-skeleton"></div>
                    <div className="text-skeleton short"></div>
                    <div className="text-skeleton short"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : filteredVehicles.length > 0 ? (
          <section className="vehicles-section">
            <div className="section-header">
              <h2>Available Vehicles</h2>
              <p className="result-count">{filteredVehicles.length} results found</p>
            </div>
            <div className="vehicles-grid">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={`${vehicle.type}-${vehicle.id}`}
                  vehicle={vehicle}
                  type={vehicle.type}
                />
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="pagination-container">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              
              <div className="pagination-info">
                <span className="page-number">Page {currentPage}</span>
                <span className="page-separator">•</span>
                <span className="total-items">
                  {activeFilter === "all" 
                    ? `${totalCars + totalBikes + totalScooties} total vehicles`
                    : activeFilter === "cars"
                    ? `${totalCars} cars`
                    : activeFilter === "bikes"
                    ? `${totalBikes} bikes`
                    : `${totalScooties} scooties`
                  }
                </span>
              </div>

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={
                  (activeFilter === "all" && filteredVehicles.length < itemsPerPage) ||
                  (activeFilter === "cars" && cars.length < itemsPerPage) ||
                  (activeFilter === "bikes" && bikes.length < itemsPerPage) ||
                  (activeFilter === "scooties" && scooties.length < itemsPerPage)
                }
              >
                Next →
              </button>
            </div>
          </section>
        ) : (
          <section className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>No Vehicles Found</h2>
            <p>Try adjusting your search filters</p>
            <button
              className="btn-reset"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
                setSortBy("popular");
              }}
            >
              Reset Filters
            </button>
          </section>
        )}

        {/* QUICK FEATURES */}
        <section className="quick-features">
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Flexible EMI</h3>
            <p>Choose from multiple banks with instant approval</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Insurance</h3>
            <p>Get comprehensive coverage for your vehicle</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Best Prices</h3>
            <p>Compare and find the best deals instantly</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Quick Delivery</h3>
            <p>Get your vehicle delivered hassle-free</p>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Buy?</h2>
            <p>Start your vehicle purchase journey now with instant EMI approval</p>
            <button className="btn-cta" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Explore Now 🚀
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
