import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import logo from "../assets/Logo.png";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName =
    user?.user?.username || user?.name || user?.username || "Guest";
  const email = user?.user?.email || user?.email || "";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className="navbar">
      {/* Left Logo */}
      <div className="navbar-logo">
        <img src={logo} alt="Cabik Logo" className="logo-img" />   {/* <-- ADD THIS */}
        <span className="logo-main"></span>
      </div>

      {/* Center Navigation  */}
      <ul className="navbar-links">
        <li><button onClick={() => navigate("/")} className="nav-link">Home</button></li>
        <li><button onClick={() => navigate("/")} className="nav-link">Cars</button></li>
        <li><button onClick={() => navigate("/")} className="nav-link">Bikes</button></li>
        <li><button onClick={() => navigate("/")} className="nav-link">Scooties</button></li>
      </ul>

      {/* Right User Section */}
      <div className="navbar-user">
        {user ? (
          <div className="user-menu" ref={menuRef}>
            <button
              className="avatar-btn"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="User menu"
            >
              <span className="avatar-text">{initials}</span>
            </button>

            {isMenuOpen && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-name">{displayName}</div>
                  {email && <div className="user-email">{email}</div>}
                </div>
                <button
                  className="dropdown-logout"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button
              onClick={() => navigate("/login")}
              className="login-btn"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="register-btn"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
