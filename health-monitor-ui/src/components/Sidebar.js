import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaChartBar,
  FaCog,
  FaHandPaper,
  FaUser
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const items = [
    { label: "Dashboard", path: "/dashboard", icon: <FaChartBar /> },
    { label: "Profile", path: "/profile", icon: <FaUser /> },
    { label: "Gesture Control", path: "/gesture", icon: <FaHandPaper /> },
    { label: "Settings", path: "/settings", icon: <FaCog /> },
    { label: "Notifications", path: "/notifications", icon: <FaBell /> }
  ];

  return (
    <div className="sidebar">
      <h2 className="logo">Health Monitor</h2>

      <ul>
        {items.map((item) => (
          <li key={item.path} onClick={() => navigate(item.path)}>
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
