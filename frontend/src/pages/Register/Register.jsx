import { useState } from "react";
import { registerUser } from "../../api/userApi.js";
import { useNavigate } from "react-router-dom";
import "../Login/Login.css"; // USING SAME DARK THEME

import logo from "../../assets/logo.png";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const changeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-dark-page">
      <div className="auth-dark-card">
        <img src={logo} alt="logo" className="auth-logo" />

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join CABIK and start your journey</p>

        <form onSubmit={submitHandler}>
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            onChange={changeHandler}
            className="auth-input"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={changeHandler}
            className="auth-input"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
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
            Register
          </button>
        </form>

        <p className="auth-bottom-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
