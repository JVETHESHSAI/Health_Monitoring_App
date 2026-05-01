import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import "./Profile.css";
import { imageUrl, profileApi } from "../services/api";

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    allergies: ""
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileApi.getProfile();
      setProfile(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        age: data.age || "",
        gender: data.gender || "",
        height: data.height || "",
        weight: data.weight || "",
        allergies: data.allergies || ""
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const updated = await profileApi.updateProfile(form);
      setProfile(updated);
      alert("Profile Updated Successfully");
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
      const updated = await profileApi.uploadProfilePhoto(file);
      setProfile(updated);
      alert("Photo Uploaded Successfully");
    } catch (error) {
      console.log(error);
      alert("Upload Failed");
    }
  };

  return (
    <Layout>
      <div className="profile-wrapper">
        <section className="profile-hero">
          <div>
            <p className="profile-kicker">Care profile</p>
            <h2>{profile.name || "My Profile"}</h2>
            <p>{profile.email || "Keep user details accurate for caregivers."}</p>
          </div>

          <div className="profile-avatar">
            {profile.profilePic ? (
              <img src={imageUrl(profile.profilePic)} alt="Profile" />
            ) : (
              <span>{(profile.name || "U").charAt(0).toUpperCase()}</span>
            )}
          </div>
        </section>

        <section className="profile-card">
          <h3>Update Details</h3>

          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-grid">
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />

              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />

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
            </div>

            <textarea
              name="allergies"
              placeholder="Allergies or emergency notes"
              value={form.allergies}
              onChange={handleChange}
            />

            <button type="submit">Update Profile</button>
          </form>
        </section>

        <section className="profile-card upload-card">
          <div>
            <h3>Profile Photo</h3>
            <p>Upload a clear photo so caregivers can identify the user quickly.</p>
          </div>

          <div className="upload-section">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button type="button" onClick={handleUpload}>Upload Photo</button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Profile;
