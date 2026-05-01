import React, { useState } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await authApi.login(form);
      localStorage.setItem("token", res.token);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleLogin}>
        <h2>Login</h2>

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>

        <p>
          New user?{" "}
          <span
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
