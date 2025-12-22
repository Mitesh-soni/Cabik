import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { getCarById } from "../../api/vehicleApi.js";
import "./vehicleDetail.css";

export default function CarDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState("");
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    /* ========= EMI STATES ========= */
    const [downPayment, setDownPayment] = useState(0);
    const [tenure, setTenure] = useState(5); // years
    const interestRate = 9.5; // %

    useEffect(() => {
        loadCar();
    }, [id]);

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

    /* ========= EMI CALC ========= */
    const loanAmount = Math.max(car.ex_showroom_price - downPayment, 0);
    const monthlyRate = interestRate / 12 / 100;
    const tenureMonths = tenure * 12;

    const emi =
        loanAmount > 0
            ? Math.round(
                (loanAmount *
                    monthlyRate *
                    Math.pow(1 + monthlyRate, tenureMonths)) /
                (Math.pow(1 + monthlyRate, tenureMonths) - 1)
            )
            : 0;

    return (
        <>
            <Navbar />

            <main className="detail-container">
                {/* HERO SECTION */}
                <section className="detail-top">
                    {/* IMAGE GALLERY */}
                    <div className="gallery">
                        <div className="main-image" onClick={() => setIsZoomOpen(true)}>
                            <img src={activeImage} alt={car.model} />
                            <span className="zoom-hint">Click to zoom</span>
                        </div>

                        <div className="thumbnails">
                            {images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt="thumb"
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
                            {car.body_type} · {car.fuel_type} · {car.transmission}
                        </p>

                        <h2 className="price">
                            ₹ {car.ex_showroom_price.toLocaleString("en-IN")}
                            <span className="price-note">Ex-showroom</span>
                        </h2>

                        {/* TRUST */}
                        <div className="dealer-trust">
                            ✔ Verified Dealer · Genuine Pricing · Secure Purchase
                        </div>

                        {/* BADGES */}
                        <div className="badges">
                            {car.is_prelaunch && <span className="badge yellow">Coming Soon</span>}
                            {car.stock_status === "OUT_OF_STOCK" && (
                                <span className="badge red">Out of Stock</span>
                            )}
                            {car.stock_status === "LIMITED_STOCK" && (
                                <span className="badge orange">Limited Stock</span>
                            )}
                        </div>

                        {/* QUICK SPECS */}
                        <div className="quick-specs">
                            <div><strong>Engine</strong>{car.engine_cc} CC</div>
                            <div><strong>Power</strong>{car.power_bhp || "—"}</div>
                            <div><strong>Mileage</strong>{car.mileage || "—"}</div>
                            <div><strong>Seats</strong>{car.seating_capacity}</div>
                        </div>

                        {/* EMI CARD */}
                        <div className="emi-card premium">
                            <div className="emi-header">
                                <h3>EMI Calculator</h3>
                                <span className="emi-bank">Partner Banks</span>
                            </div>

                            <div className="emi-highlight">
                                <span className="emi-label">Monthly EMI</span>
                                <span className="emi-amount">
                                    ₹ {emi.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="emi-control">
                                <label className="emi-label-row">
                                    <span>Down Payment</span>
                                    <strong className="emi-value">
                                        ₹ {downPayment.toLocaleString("en-IN")}
                                    </strong>
                                </label>

                                <input
                                    type="range"
                                    min="0"
                                    max={car.ex_showroom_price * 0.6}
                                    step="50000"
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(Number(e.target.value))}
                                />
                            </div>

                            <div className="emi-control">
                                <label>
                                    Loan Tenure
                                    <strong>{tenure} Years</strong>
                                </label>
                                <div className="tenure-options">
                                    {[3, 4, 5, 6, 7].map((y) => (
                                        <button
                                            key={y}
                                            className={tenure === y ? "active" : ""}
                                            onClick={() => setTenure(y)}
                                        >
                                            {y}Y
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="emi-breakdown">
                                <div>
                                    <span>Vehicle Price</span>
                                    <strong>₹ {car.ex_showroom_price.toLocaleString("en-IN")}</strong>
                                </div>
                                <div>
                                    <span>Loan Amount</span>
                                    <strong>₹ {loanAmount.toLocaleString("en-IN")}</strong>
                                </div>
                                <div>
                                    <span>Interest Rate</span>
                                    <strong>{interestRate}% p.a.</strong>
                                </div>
                            </div>

                            <p className="emi-disclaimer">
                                EMI is indicative. Final amount may vary by bank & credit profile.
                            </p>
                        </div>

                        {/* ACTIONS */}
                        <div className="detail-actions">
                            <button
                                className="btn-primary glow"
                                disabled={!canBuy}
                                onClick={() => !user && navigate("/login")}
                            >
                                {user ? "Buy This Car" : "Login to Buy"}
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
                        <img src={activeImage} alt="zoom" />
                        <button
                            className="zoom-close"
                            onClick={() => setIsZoomOpen(false)}
                        >
                            ✕
                        </button>

                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}
