import React, { useState, useEffect, useCallback } from "react";
import "./Dashboard.css";
import Layout from "../components/Layout";
import { authApi, healthApi, imageUrl, profileApi } from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import {
  FaHeartbeat,
  FaNotesMedical,
  FaThermometerHalf,
  FaWheelchair,
  FaWaveSquare
} from "react-icons/fa";

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [latestRecord, setLatestRecord] = useState(null);
  const [profile, setProfile] = useState({});
  const [allergies, setAllergies] = useState("");

  const handleLogout = () => {
    authApi.logout();
    window.location.href = "/";
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchRecords = useCallback(async () => {
    try {
      const data = await healthApi.getRecords();
      setRecords(data);

      if (data.length > 0) {
        const latest = data.reduce((a, b) =>
          new Date(a.recordedAt) > new Date(b.recordedAt) ? a : b
        );
        setLatestRecord(latest);
      } else {
        setLatestRecord(null);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await profileApi.getProfile();
      setProfile(data);
      setAllergies(data.allergies || "");
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchProfile();
  }, [fetchRecords, fetchProfile]);

  const handleAllergySave = async (e) => {
    e.preventDefault();

    try {
      const updated = await profileApi.updateProfile({
        ...profile,
        allergies
      });
      setProfile(updated);
      alert("Allergies updated");
    } catch {
      alert("Failed to update allergies");
    }
  };

  const chartData = [...records]
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
    .slice(-8)
    .map((record) => ({
      time: new Date(record.recordedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      temperature: Number(record.temperature) || 0,
      pulse: Number(record.pulseValue || record.heartRate) || 0
    }));

  const pulseValue = latestRecord?.pulseValue || latestRecord?.heartRate;

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Live mobility and health monitor</p>
            <h2>{greeting()}, {profile.name || "User"}</h2>
            <p>Temperature, pulse, wheelchair movement, and emergency readiness in one view.</p>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="overview-grid">
          <HealthCard
            title="Temperature"
            icon={<FaThermometerHalf />}
            value={latestRecord ? `${latestRecord.temperature || 0} C` : "No data"}
            detail={temperatureStatus(latestRecord?.temperature)}
            className="temperature-card"
          />

          <HealthCard
            title="Pulse Signal"
            icon={<FaHeartbeat />}
            value={pulseValue || "No data"}
            detail={pulseStatus(pulseValue)}
            className="pulse-card"
          />

          <HealthCard
            title="Wheelchair Command"
            icon={<FaWheelchair />}
            value={commandLabel(latestRecord?.command)}
            detail={latestRecord ? "Latest movement signal" : "Waiting for ESP32"}
            className="command-card"
          />
        </div>

        <div className="dashboard-grid">
          <div className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <h3>Sensor Trends</h3>
                <p>Recent temperature and pulse readings from the ESP32.</p>
              </div>
              <FaWaveSquare />
            </div>

            <div className="chart-box">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      name="Temperature"
                    />
                    <Line
                      type="monotone"
                      dataKey="pulse"
                      stroke="#0f766e"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      name="Pulse"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">Waiting for ESP32 readings</div>
              )}
            </div>
          </div>

          <div className="panel profile-panel">
            <h3>Profile</h3>

            {profile.profilePic && (
              <img
                src={imageUrl(profile.profilePic)}
                alt="profile"
                className="profile-img"
              />
            )}

            <div className="profile-tiles">
              <div className="tile">
                Age<br /><b>{profile.age || "-"}</b>
              </div>

              <div className="tile">
                Gender<br /><b>{profile.gender || "-"}</b>
              </div>

              <div className="tile">
                Height<br /><b>{profile.height ? `${profile.height} cm` : "-"}</b>
              </div>

              <div className="tile">
                Weight<br /><b>{profile.weight ? `${profile.weight} kg` : "-"}</b>
              </div>
            </div>
          </div>

          <div className="panel allergies-panel">
            <div className="panel-heading">
              <div>
                <h3>Allergies</h3>
                <p>Caregiver notes for quick emergency reference.</p>
              </div>
              <FaNotesMedical />
            </div>

            <form onSubmit={handleAllergySave}>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Example: Penicillin, peanuts, dust allergy"
              />
              <button type="submit">Save Allergies</button>
            </form>
          </div>

          <div className="panel records-table">
            <h3>Recent Readings</h3>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Temp</th>
                    <th>Pulse</th>
                    <th>Command</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.temperature || "-"}</td>
                      <td>{record.pulseValue || record.heartRate || "-"}</td>
                      <td>{commandLabel(record.command)}</td>
                      <td>{new Date(record.recordedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const commandLabel = (command) => {
  const labels = {
    F: "Forward",
    B: "Backward",
    L: "Left",
    R: "Right",
    S: "Stop",
    E: "Emergency"
  };

  return labels[command] || "No command";
};

const temperatureStatus = (temperature) => {
  const value = Number(temperature);
  if (!value) return "Waiting for temperature";
  if (value >= 38) return "High temperature alert range";
  if (value <= 35) return "Low temperature alert range";
  return "Within normal range";
};

const pulseStatus = (pulse) => {
  const value = Number(pulse);
  if (!value) return "Waiting for pulse sensor";
  if (value >= 3500) return "High pulse signal";
  if (value <= 300) return "Low pulse signal";
  return "Signal received";
};

const HealthCard = ({ title, value, detail, icon, className }) => {
  return (
    <div className={`health-card ${className}`}>
      <div className="card-icon">{icon}</div>
      <h4>{title}</h4>
      <h2>{value}</h2>
      <p>{detail}</p>
    </div>
  );
};

export default Dashboard;
