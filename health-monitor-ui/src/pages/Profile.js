import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import "./Profile.css";
import { imageUrl, profileApi } from "../services/api";

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({
    age: "",
    gender: "",
    height: "",
    weight: ""
  });
  const [file, setFile] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await profileApi.getProfile();
      setProfile(data);
      setForm({
        age: data.age || "",
        gender: data.gender || "",
        height: data.height || "",
        weight: data.weight || ""
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await profileApi.updateProfile(form);
      alert("Profile Updated Successfully");
      fetchProfile();
    } catch (error) {
      alert("Update Failed");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Select a file first");
      return;
    }

    try {
      await profileApi.uploadProfilePhoto(file);
      alert("Photo Uploaded Successfully");
      fetchProfile();
    } catch (error) {
      console.log(error);
      alert("Photo upload is not available until the backend exposes /user/profile/upload");
    }
  };

  return (
    <Layout>
      <div className="profile-wrapper">
        <div className="profile-card">
          <h2>My Profile</h2>

          {profile.profilePic && (
            <img
              src={imageUrl(profile.profilePic)}
              alt="Profile"
              className="profile-img"
            />
          )}

          <p><b>Name:</b> {profile.name || "-"}</p>
          <p><b>Email:</b> {profile.email || "-"}</p>

          <div className="upload-section">
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload Photo</button>
          </div>
        </div>

        <div className="profile-card">
          <h3>Update Health Details</h3>

          <form onSubmit={handleUpdate} className="profile-form">
            <input
              name="age"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
            />

            <input
              name="gender"
              placeholder="Gender"
              value={form.gender}
              onChange={handleChange}
            />

            <input
              name="height"
              placeholder="Height (cm)"
              value={form.height}
              onChange={handleChange}
            />

            <input
              name="weight"
              placeholder="Weight (kg)"
              value={form.weight}
              onChange={handleChange}
            />

            <button type="submit">Update Profile</button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
