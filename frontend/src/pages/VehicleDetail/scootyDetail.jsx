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
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    loadScooty();
  }, [id]);

  const loadScooty = async () => {
    try {
      const res = await getScootyById(id);
      const data = res.data.vehicle;
      setScooty(data);
      setActiveImage(data.front_image || "/placeholder.png");
    } catch {
      setScooty(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!scooty) return <p>Scooty not found</p>;

  return (
    <>
      <Navbar />

      <main className="detail-container">
        <section className="detail-top">
          <div className="gallery">
            <img className="main-image" src={activeImage} />
          </div>

          <div className="info-panel">
            <h1 className="car-title">
              {scooty.brand} <span className="muted">{scooty.model}</span>
            </h1>

            <h2 className="price">
              ₹ {scooty.ex_showroom_price.toLocaleString("en-IN")}
            </h2>

            <div className="quick-specs">
              <div><strong>Engine</strong>{scooty.engine_cc} CC</div>
              <div><strong>Mileage</strong>{scooty.mileage}</div>
              <div><strong>Start</strong>{scooty.start_type}</div>
              <div><strong>Weight</strong>{scooty.weight} kg</div>
            </div>

            <div className="detail-actions">
              <button
                className="btn-primary glow"
                onClick={() => !user && navigate("/login")}
              >
                {user ? "Buy This Scooty" : "Login to Buy"}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
