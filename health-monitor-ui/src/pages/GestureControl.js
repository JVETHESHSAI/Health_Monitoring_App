import React, { useState } from "react";
import Layout from "../components/Layout";
import "./GestureControl.css";

const GestureControl = () => {
  const gestures = [
    { name: "Hand Up", icon: "Raise" },
    { name: "Hand Down", icon: "Lower" },
    { name: "Swipe Left", icon: "Left" },
    { name: "Swipe Right", icon: "Right" },
    { name: "Fist", icon: "Stop" }
  ];

  const commands = [
    "Move Forward",
    "Move Backward",
    "Turn Left",
    "Turn Right",
    "Stop"
  ];

  const [selectedGesture, setSelectedGesture] = useState(null);
  const [selectedCommand, setSelectedCommand] = useState("");
  const [mappings, setMappings] = useState([]);

  const handleSaveMapping = () => {
    if (!selectedGesture || !selectedCommand) {
      alert("Please select both Gesture and Command");
      return;
    }

    setMappings([
      ...mappings,
      {
        gesture: selectedGesture,
        command: selectedCommand
      }
    ]);

    setSelectedGesture(null);
    setSelectedCommand("");
  };

  return (
    <Layout>
      <div className="gesture-container">
        <h2>Gesture Control Setup</h2>

        <div className="gesture-card-box">
          <h3>Calibration</h3>

          <button className="calibration-btn">
            Start Gesture Calibration
          </button>
        </div>

        <div className="gesture-card-box">
          <h3>Select Gesture</h3>

          <div className="gesture-grid">
            {gestures.map((gesture) => (
              <div
                key={gesture.name}
                className={`gesture-card ${
                  selectedGesture === gesture.name ? "active" : ""
                }`}
                onClick={() => setSelectedGesture(gesture.name)}
              >
                <div className="gesture-icon">{gesture.icon}</div>
                <p>{gesture.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="gesture-card-box">
          <h3>Select Wheelchair Command</h3>

          <select
            className="command-dropdown"
            value={selectedCommand}
            onChange={(e) => setSelectedCommand(e.target.value)}
          >
            <option value="">Select Command</option>

            {commands.map((cmd) => (
              <option key={cmd}>{cmd}</option>
            ))}
          </select>

          <button
            className="save-btn"
            onClick={handleSaveMapping}
          >
            Save Mapping
          </button>
        </div>

        <div className="gesture-card-box">
          <h3>Saved Gesture Mappings</h3>

          <table className="mapping-table">
            <thead>
              <tr>
                <th>Gesture</th>
                <th>Command</th>
              </tr>
            </thead>

            <tbody>
              {mappings.map((mapping, index) => (
                <tr key={`${mapping.gesture}-${index}`}>
                  <td>{mapping.gesture}</td>
                  <td>{mapping.command}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default GestureControl;
