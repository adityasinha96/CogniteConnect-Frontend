import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

function Login() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.phone.match(/^\d{10}$/)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (form.password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    try {
      const { data } = await API.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src="/logo.png" alt="Logo" className="auth-logo" />
        <h2 className="auth-heading">Welcome Back</h2>
        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
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
          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
