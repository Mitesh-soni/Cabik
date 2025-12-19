import { useAuth } from "../contexts/AuthContext.jsx";
import logo from "../assets/Logo.png"
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  console.log(user);
  const navigate = useNavigate(); 

  return (
    <nav className="navbar">
      {/* Left Logo */}
      <div className="navbar-logo">
        <img src={logo} alt="Cabik Logo" className="logo-img" />   {/* <-- ADD THIS */}
        <span className="logo-main"></span>
      </div>

      {/* Center Navigation  */}
      <ul className="navbar-links">
        <li>Home</li>
        <li>Cars</li>
        <li>Bikes</li>
        <li>Scooties</li>
      </ul>

      {/* Right User Section */}
      <div className="navbar-user">
  {user ? (
    <>
      <span className="welcome-text">Welcome, <b>{user.user.username}</b></span>
      <button onClick={logout} className="logout-btn">Logout</button>
    </>
  ) : (
    <>
      <button onClick={() => navigate("/login")} className="login-btn">Login</button>
      <button onClick={() => navigate("/register")} className="register-btn">Register</button>
    </>
  )}
</div>
    </nav>
  );
}
