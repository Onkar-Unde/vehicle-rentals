import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaUserEdit, FaSignOutAlt } from "react-icons/fa";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import axios from "axios";
import "../styles/Profile.css";

const Profile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [user, setUser] = useState(storedUser);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [progress, setProgress] = useState(0);
  const [strength, setStrength] = useState("");
  const [activityCount, setActivityCount] = useState(0);

  const [formData, setFormData] = useState({
    ...user,
    newPassword: "",
    confirmPassword: "",
    avatar: null,
    dlFront: null,
    dlBack: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    let percent = 40;
    if (user?.avatar) percent += 15;
    if (user?.name && user?.email) percent += 15;
    if (user?.phone) percent += 10;
    if (user?.gender) percent += 10;
    if (user?.licenseFront && user?.licenseBack) percent += 10;
    if (percent > 100) percent = 100;
    setProgress(percent);

    // simulate activities
    let count = 0;
    const activities = [
      "Booked Hyundai i20",
      "Viewed Royal Enfield",
      "Updated Profile",
    ];
    const interval = setInterval(() => {
      count++;
      setActivityCount(count);
      if (count >= activities.length) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return (
      <div className="text-center mt-5 text-danger">
        Please login to view your profile.
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "newPassword") {
      const pwd = e.target.value;
      if (pwd.length < 6) setStrength("Weak");
      else if (/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/.test(pwd))
        setStrength("Strong");
      else setStrength("Medium");
    }
  };

  const handleFileSelect = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      if (!user.id) {
        alert("User ID missing. Cannot update profile.");
        return;
      }

      let avatarUrl = user.avatar;
      let dlFrontUrl = user.licenseFront;
      let dlBackUrl = user.licenseBack;

      if (formData.avatar instanceof File) {
        const data = new FormData();
        data.append("file", formData.avatar);
        data.append("upload_preset", "Car-Bike_Rental");
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dh64ix3na/image/upload",
          data
        );
        avatarUrl = res.data.secure_url;
      }

      if (formData.dlFront instanceof File) {
        const data = new FormData();
        data.append("file", formData.dlFront);
        data.append("upload_preset", "Car-Bike_Rental");
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dh64ix3na/image/upload",
          data
        );
        dlFrontUrl = res.data.secure_url;
      }

      if (formData.dlBack instanceof File) {
        const data = new FormData();
        data.append("file", formData.dlBack);
        data.append("upload_preset", "Car-Bike_Rental");
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dh64ix3na/image/upload",
          data
        );
        dlBackUrl = res.data.secure_url;
      }

      const updatedUser = {
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        gender: formData.gender || "",
        password: formData.newPassword ? formData.newPassword : user.password,
        avatar: avatarUrl,
        licenseFront: dlFrontUrl,
        licenseBack: dlBackUrl,
      };

      const userDoc = doc(db, "users", user.id);
      await updateDoc(userDoc, updatedUser);

      // localStorage update
      localStorage.setItem(
        "user",
        JSON.stringify({ id: user.id, ...updatedUser })
      );
      setUser({ id: user.id, ...updatedUser });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Profile update failed. Please check console.");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-4 mb-4">
            <div
              className="text-center p-4 shadow rounded"
              style={{ background: "#f8f9fa" }}
            >
              <img
                src={user.avatar || "https://via.placeholder.com/150"}
                alt="avatar"
                className="rounded-circle border mb-3"
                style={{ width: "130px", height: "130px", objectFit: "cover" }}
              />
              <h5>{user.name}</h5>
              <small>{user.email}</small>
              <div className="progress mt-3" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-warning"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <button
                className="btn btn-outline-warning w-100 fw-bold my-3"
                onClick={() => setIsEditing(!isEditing)}
              >
                <FaUserEdit /> {isEditing ? "Cancel" : "Edit"}
              </button>
              <button
                className="btn btn-outline-danger w-100 fw-bold"
                onClick={logout}
              >
                <FaSignOutAlt /> Logout
              </button>
              <ul className="modern-side-nav mt-4">
                <li
                  className={`nav-item ${
                    activeTab === "account" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("account");
                    setIsEditing(false);
                  }}
                >
                  <i className="bi bi-person-circle me-2"></i> Account
                </li>
                <li
                  className={`nav-item ${
                    activeTab === "activity" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("activity");
                    setIsEditing(false);
                  }}
                >
                  <i className="bi bi-clock-history me-2"></i> Activity
                </li>
                <li
                  className={`nav-item ${
                    activeTab === "bookings" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("bookings");
                    setIsEditing(false);
                  }}
                >
                  <i className="bi bi-calendar-check me-2"></i> Bookings
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-8">
            <div className="profile-card p-4 shadow-sm">
              {activeTab === "account" && !isEditing && (
                <>
                  <h5 className="section-title">
                    <i className="bi bi-person-fill me-2"></i>Account Info
                  </h5>
                  <ul className="list-unstyled">
                    <li>
                      <strong>Name:</strong> {user.name}
                    </li>
                    <li>
                      <strong>Email:</strong> {user.email}
                    </li>
                    <li>
                      <strong>Phone:</strong> {user.phone}
                    </li>
                    <li>
                      <strong>Gender:</strong> {user.gender}
                    </li>
                  </ul>
                </>
              )}

              {
                (isEditing && (
                  <form onSubmit={handleUpdate}>
                    <h5 className="section-title">
                      <i className="bi bi-pencil-square me-2"></i>Edit Info
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label>Name</label>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6">
                        <label>Email</label>
                        <input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6">
                        <label>Phone</label>
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6">
                        <label>Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">Select</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label>New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          onChange={handleChange}
                          className="form-control"
                        />
                        {strength && (
                          <small
                            className={`text-${
                              strength === "Strong"
                                ? "success"
                                : strength === "Medium"
                                ? "warning"
                                : "danger"
                            }`}
                          >
                            Strength: {strength}
                          </small>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label>Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6">
                        <label>Profile Picture</label>
                        <input
                          type="file"
                          onChange={(e) => handleFileSelect(e, "avatar")}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6">
                        <label>DL Front</label>
                        <input
                          type="file"
                          onChange={(e) => handleFileSelect(e, "dlFront")}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6">
                        <label>DL Back</label>
                        <input
                          type="file"
                          onChange={(e) => handleFileSelect(e, "dlBack")}
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-center">
                    <button className="btn btn-warning w-30  mt-3">
                      Save Changes
                    </button>
                    </div>
                  </form>
                ))}

              {activeTab === "activity" && !isEditing && (
                <div>
                  <h5>Recent Activities</h5>
                  {activityCount === 0 ? (
                    <div>No activity yet</div>
                  ) : (
                    <ul>
                      <li>✅ Booked Hyundai i20</li>
                      <li>🛵 Viewed Royal Enfield</li>
                      <li>📸 Updated Profile</li>
                    </ul>
                  )}
                </div>
              )}

              {activeTab === "bookings" && !isEditing && (
                <div>
                  <h5 className="section-title mb-3">
                    <i className="bi bi-calendar-check me-2"></i>My Bookings
                  </h5>
                  {(() => {
                    const allBookings =
                      JSON.parse(localStorage.getItem("bookings")) || [];
                    const userBookings = allBookings.filter(
                      (b) => b.userEmail === user.email
                    );
                    if (userBookings.length === 0) {
                      return (
                        <div className="text-center">
                          <p>No bookings yet.</p>
                          <button
                            onClick={() => navigate("/vehicles")}
                            className="btn btn-warning"
                          >
                            Browse Vehicles
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                          <thead className="table-dark text-center">
                            <tr>
                              <th>No.</th>
                              <th>Vehicle</th>
                              <th>Pickup Location</th>
                              <th>Booked On</th>
                              {/* <th>Total Price</th> */}
                            </tr>
                          </thead>
                          <tbody>
                            {userBookings.map((b, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{b.vehicle}</td>
                                <td>{b.pickupLocation}</td>
                                <td>
                                  {new Date(b.bookingDate).toLocaleString()}
                                </td>
                                {/* <td>₹{b.totalPrice}</td> */}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="highlight-card p-4 mt-4 shadow rounded">
              <h5 className="section-title mb-3">
                <i className="bi bi-star-fill me-2 text-warning"></i> Member
                Highlights
              </h5>
              <ul className="list-unstyled">
                <li>
                  <strong>Membership:</strong> Premium
                </li>
                <li>
                  <strong>Loyalty Points:</strong> 320
                </li>
                <li>
                  <strong>Support:</strong>{" "}
                  <a href="mailto:support@yourapp.com">support@yourapp.com</a>
                </li>
              </ul>
              <div
                className="promo-banner mt-3 p-3 text-center rounded"
                style={{ background: "#ffe0b2" }}
              >
                🎁 <strong>Summer Offer:</strong> Get 20% off on your next
                booking!
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile; 