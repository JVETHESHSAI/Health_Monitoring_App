import React, { useState } from "react";
import Layout from "../components/Layout";
import "./Settings.css";
import { apiErrorMessage, profileApi } from "../services/api";

const Settings = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatus("");

    if (newPassword.length < 4) {
      setStatus("New password must be at least 4 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("New passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      await profileApi.changePassword({
        oldPassword,
        newPassword
      });

      setStatus("Password updated successfully. Use the new password next time you login.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus(apiErrorMessage(error, "Password update failed."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="settings-container">
        <section className="settings-hero">
          <p>Account security</p>
          <h2>Settings</h2>
          <span>Update your login password for this account.</span>
        </section>

        <section className="settings-card">
          <h3>Change Password</h3>

          <form onSubmit={handleChangePassword}>
            <input
              type="password"
              placeholder="Current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {status && <p className="settings-status">{status}</p>}

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
};

export default Settings;
