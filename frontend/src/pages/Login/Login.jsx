import { useState, useContext } from "react";
import { loginUser } from "../../api/userApi.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// CHANGE IF YOUR LOGO PATH IS DIFFERENT
import logo from "../../assets/logo.png";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(form);
      login(res.data);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="auth-dark-page">
      <div className="auth-dark-card">
        <img src={logo} alt="logo" className="auth-logo" />

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Login to continue your CABIK experience</p>

        <form onSubmit={submitHandler}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={changeHandler}
            className="auth-input"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={changeHandler}
            className="auth-input"
          />

          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>

        <p className="auth-bottom-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
