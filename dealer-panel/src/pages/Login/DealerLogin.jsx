import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDealer } from "../../contexts/DealerContext.jsx";
import logo from "../../assets/Logo.png";
import "./DealerLogin.css";

export default function DealerLogin() {
  const navigate = useNavigate();
  const { login, loading, error: contextError } = useDealer();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="dealer-login-container">
      <div className="dealer-login-wrapper">
        <div className="dealer-login-card">
          <div className="dealer-login-header">
            <img src={logo} alt="Cabik Logo" className="login-logo" />
            <h1>Dealer Panel</h1>
            <p>Manage Your Inventory & Sales</p>
          </div>

          <form onSubmit={handleSubmit} className="dealer-login-form">
            {contextError && (
              <div className="error-alert">{contextError}</div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dealer@example.com"
                className={`form-input ${errors.email ? "error" : ""}`}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`form-input ${errors.password ? "error" : ""}`}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-login"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="dealer-login-footer">
            <p>Don't have an account? <a href="/register">Register here</a></p>
          </div>
        </div>

        <div className="dealer-login-banner">
          <div className="banner-content">
            <h2>Welcome Back</h2>
            <p>Manage your vehicle inventory, track sales, and grow your business with CABIK.</p>
            <ul className="features-list">
              <li>✓ Easy Vehicle Upload & Management</li>
              <li>✓ Real-time Inventory Tracking</li>
              <li>✓ Sales Analytics & Reports</li>
              <li>✓ Customer Order Management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
