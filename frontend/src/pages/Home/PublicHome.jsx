import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./PublicHome.css";

export default function PublicHome() {
    return (
        <>
            <Navbar />
            <main className="public-home">

                {/* HERO */}
                <section className="hero">
                    <div className="hero-content">
                        <h1>
                            Discover Your <span>Perfect Ride</span>
                        </h1>
                        <p>
                            Browse Cars, Bikes & Scooties from verified dealers across India.
                        </p>
                    </div>

                    <div className="hero-image">    
                        <img src="/hero-car.png" alt="vehicles" />
                    </div>
                </section>

                {/* TRUST STRIP */}
                <section className="trust-strip">
                    <div>🚗 10K+ Vehicles</div>
                    <div>🏪 Verified Dealers</div>
                    <div>⭐ Trusted Platform</div>
                    <div>🔒 Secure Login</div>
                </section>

                {/* POPULAR */}
                <section className="section">
                    <h2>Popular Right Now</h2>
                    <p className="muted">
                        Most searched vehicles by users
                    </p>

                    <div className="teaser-grid">
                        <div className="teaser-card">Hyundai Creta</div>
                        <div className="teaser-card">Royal Enfield Classic</div>
                        <div className="teaser-card">Honda Activa</div>
                        <div className="teaser-card">Tata Nexon</div>
                    </div>
                </section>

                {/* UPCOMING */}
                <section className="section soft-bg">
                    <h2>Upcoming Launches</h2>
                    <p className="muted">
                        Coming soon — stay ahead of the market
                    </p>

                    <div className="teaser-grid">
                        <div className="upcoming-card">
                            <span className="badge">Coming Soon</span>
                            <h4>Hyundai Ioniq 5</h4>
                        </div>
                        <div className="upcoming-card">
                            <span className="badge">Coming Soon</span>
                            <h4>Hero Xtreme 210</h4>
                        </div>
                        <div className="upcoming-card">
                            <span className="badge">Coming Soon</span>
                            <h4>TVS Electric Scooter</h4>
                        </div>
                    </div>
                </section>

                {/* WHY CABIK */}
                <section className="section">
                    <h2>Why Cabik?</h2>

                    <div className="why-grid">
                        <div className="why-card">
                            <h4>Verified Dealers</h4>
                            <p>Only trusted and verified sellers listed.</p>
                        </div>
                        <div className="why-card">
                            <h4>Real Vehicle Data</h4>
                            <p>Accurate specs, pricing and availability.</p>
                        </div>
                        <div className="why-card">
                            <h4>No Login to Browse</h4>
                            <p>Explore freely. Login only when you’re ready.</p>
                        </div>
                        <div className="why-card">
                            <h4>Modern Platform</h4>
                            <p>Fast, secure and built for scale.</p>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="cta">
                    <h2>Ready to Find Your Next Vehicle?</h2>
                    <p>Create a free account and continue.</p>

                    <div className="hero-actions">
                        <a href="/register" className="btn-primary">Get Started</a>
                        <a href="/login" className="btn-outline">Login</a>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
