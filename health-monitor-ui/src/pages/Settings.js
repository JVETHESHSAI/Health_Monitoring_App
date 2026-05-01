import React, { useState } from "react";
import Layout from "../components/Layout";
import "./Settings.css";
import { profileApi } from "../services/api";

const Settings = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      await profileApi.changePassword({
        oldPassword,
        newPassword
      });

      alert("Password Updated Successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert("Password Update Failed");
    }
  };

  return (
    <Layout>
      <div className="settings-container">
        <h2>Settings</h2>

        <div className="card">
          <h3>Change Password</h3>

          <form onSubmit={handleChangePassword}>
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" className="save-btn">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
