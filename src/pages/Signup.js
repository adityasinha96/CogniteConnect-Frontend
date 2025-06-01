import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./App.css"; // Use shared styles

function Signup() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, phone, password, confirmPassword } = form;

    if (!name || !phone || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await API.post("/auth/signup", { name, phone, password });
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src="/logo.png" alt="Logo" className="auth-logo" />
        <h2 className="auth-heading">Create Account</h2>
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="auth-input"
            required
          />
          <input
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            className="auth-input"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="auth-input"
            required
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="auth-input"
            required
          />
          <button type="submit" className="auth-button">
            Sign Up
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
