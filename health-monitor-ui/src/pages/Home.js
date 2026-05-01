import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {

  const navigate = useNavigate();

  return (
    <div className="home-container">

      {/* HERO SECTION */}
      <div className="home-card">

        <h1>Health Monitoring System</h1>

        <p>
          Smart Health Dashboard with Gesture Controlled Wheelchair Support
        </p>

        <div className="home-buttons">

          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="register-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>

        </div>

      </div>

    </div>
  );
};

export default Home;