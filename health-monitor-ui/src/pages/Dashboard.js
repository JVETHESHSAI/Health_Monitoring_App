import React, { useState, useEffect, useCallback } from "react";
import "./Dashboard.css";
import Layout from "../components/Layout";
import { authApi, healthApi, imageUrl, profileApi } from "../services/api";

import {
  FaHeartbeat,
  FaThermometerHalf,
  FaLungs,
  FaTint,
  FaWheelchair,
  FaWaveSquare
} from "react-icons/fa";

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [latestRecord, setLatestRecord] = useState(null);
  const [profile, setProfile] = useState({});
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [spo2, setSpo2] = useState("");
  const [bp, setBp] = useState("");

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
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchProfile();
  }, [fetchRecords, fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await healthApi.addRecord({ heartRate, temperature, spo2, bp });
      fetchRecords();
      setHeartRate("");
      setTemperature("");
      setSpo2("");
      setBp("");
    } catch {
      alert("Failed to Add Record");
    }
  };

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-top">
          <div>
            <h2>{greeting()}, {profile.name || "User"}</h2>
            <p>Keep tracking your health readings.</p>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="main-grid">
          <div className="left-panel">
            {latestRecord && (
              <>
                <HealthCard
                  title="Temperature"
                  icon={<FaThermometerHalf />}
                  value={`${latestRecord.temperature} C`}
                  className="blue-card"
                />

                <HealthCard
                  title="Oxygen Saturation"
                  icon={<FaLungs />}
                  value={latestRecord.spo2 ? `${latestRecord.spo2} %` : "Sensor pending"}
                  className="red-card"
                />
              </>
            )}
          </div>

          <div className="profile-panel">
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

          <div className="right-panel">
            {latestRecord && (
              <>
                <HealthCard
                  title="Heart Rate"
                  icon={<FaHeartbeat />}
                  value={`${latestRecord.heartRate} BPM`}
                  className="dark-card"
                />

                <HealthCard
                  title="Blood Pressure"
                  icon={<FaTint />}
                  value={latestRecord.bp || "Sensor pending"}
                  className="purple-card"
                />
              </>
            )}
          </div>
        </div>

        <div className="bottom-section">
          <div className="add-record">
            <h3>Add Health Record</h3>

            <form onSubmit={handleSubmit}>
              <input
                placeholder="Heart Rate"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
              />

              <input
                placeholder="Temperature"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />

              <input
                placeholder="SpO2"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
              />

              <input
                placeholder="Blood Pressure"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
              />

              <button>Add Record</button>
            </form>
          </div>

          <div className="records-table status-panel">
            <h3>Mobility Status</h3>

            <div className="status-grid">
              <HealthCard
                title="Wheelchair Command"
                icon={<FaWheelchair />}
                value={commandLabel(latestRecord?.command)}
                className="green-card"
              />

              <HealthCard
                title="Pulse Signal"
                icon={<FaWaveSquare />}
                value={latestRecord?.pulseValue || latestRecord?.heartRate || "No data"}
                className="orange-card"
              />
            </div>
          </div>

          <div className="records-table">
            <h3>Health Records</h3>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Heart</th>
                    <th>Temp</th>
                    <th>SpO2</th>
                    <th>BP</th>
                    <th>Command</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.heartRate}</td>
                      <td>{record.temperature}</td>
                      <td>{record.spo2}</td>
                      <td>{record.bp}</td>
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

const HealthCard = ({ title, value, icon, className }) => {
  return (
    <div className={`health-card ${className}`}>
      <div className="card-icon">{icon}</div>
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
};

export default Dashboard;
