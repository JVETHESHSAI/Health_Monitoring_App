import React, { useState } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { apiErrorMessage, authApi } from "../services/api";

const Register = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await authApi.register(form);
      localStorage.setItem("token", res.token);
      setIsAuthenticated(true);
      alert("Registration Successful");
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(apiErrorMessage(error, "Registration Failed"));
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleRegister}>
        <h2>Register</h2>

        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />

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

        <button type="submit">Register</button>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <p>
          Already have account?{" "}
          <span onClick={() => navigate("/login")}>
            Login here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
