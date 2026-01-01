import { useNavigate } from "react-router-dom";
import { useDealer } from "../contexts/DealerContext.jsx";
import logo from "../assets/Logo.png";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { dealer, logout } = useDealer();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="dealer-navbar">
      <div className="navbar-brand" onClick={() => navigate("/dashboard")}>
        <img src={logo} alt="Cabik Logo" className="navbar-logo-img" />
        <div className="brand-text">
          <span>Dealer Panel</span>
        </div>
      </div>

      <ul className="navbar-links">
        <li><button onClick={() => navigate("/dashboard")} className="nav-btn">Dashboard</button></li>
        <li><button onClick={() => navigate("/vehicles")} className="nav-btn">Vehicles</button></li>
        <li><button onClick={() => navigate("/analytics")} className="nav-btn">Analytics</button></li>
        <li><button onClick={() => navigate("/settings")} className="nav-btn">Settings</button></li>
      </ul>

      <div className="navbar-user">
        <div className="user-info">
          <p className="dealer-name">{dealer?.business_name || "Dealer"}</p>
          <span className="dealer-status">● Online</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
}
