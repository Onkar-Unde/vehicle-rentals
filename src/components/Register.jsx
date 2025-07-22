import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    licenseFront: null,
    licenseBack: null,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let licenseFrontUrl = "";
      let licenseBackUrl = "";

      if (formData.licenseFront) {
        const frontData = new FormData();
        frontData.append("file", formData.licenseFront);
        frontData.append("upload_preset", "Car-Bike_Rental");
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dh64ix3na/image/upload",
          frontData
        );
        licenseFrontUrl = res.data.secure_url;
      }

      if (formData.licenseBack) {
        const backData = new FormData();
        backData.append("file", formData.licenseBack);
        backData.append("upload_preset", "Car-Bike_Rental");
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dh64ix3na/image/upload",
          backData
        );
        licenseBackUrl = res.data.secure_url;
      }

      const dataToStore = {
        ...formData,
        licenseFront: licenseFrontUrl,
        licenseBack: licenseBackUrl,
      };

      await addDoc(collection(db, "users"), dataToStore);
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-bg">
        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2 className="text-center text-warning mb-4">Register</h2>

            <div className="mb-3 input-icon">
              <i className="fas fa-user icon" />
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3 input-icon">
              <i className="fas fa-envelope icon" />
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3 input-icon">
              <i className="fas fa-phone icon" />
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="10-digit Phone"
                value={formData.phone}
                pattern="[0-9]{10}"
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <select
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="mb-3 input-icon">
              <i className="fas fa-lock icon" />
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">DL Front</label>
              <input
                type="file"
                name="licenseFront"
                accept="image/*"
                className="form-control"
                onChange={handleFileChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">DL Back</label>
              <input
                type="file"
                name="licenseBack"
                accept="image/*"
                className="form-control"
                onChange={handleFileChange}
              />
            </div>

            <button type="submit" className="btn btn-warning w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
