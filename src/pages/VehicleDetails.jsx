import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaStar } from "react-icons/fa";
import "../styles/VehicleDetails.css";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

const VehicleDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const vehicle = state?.vehicle;

  const [mainImage, setMainImage] = useState(vehicle?.image || "");
  const [canSubmit, setCanSubmit] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [allRatings, setAllRatings] = useState([]);
  const [similarVehicles, setSimilarVehicles] = useState([]);

  useEffect(() => {
    if (vehicle) {
      setMainImage(vehicle.image);
    }
  }, [vehicle]);

  useEffect(() => {
    const fetchData = async () => {
      if (!vehicle) return;

      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      let hasCompletedBooking = false;

      try {
        if (userId) {
          const bookingsRef = collection(db, `users/${userId}/bookings`);
          const q = query(bookingsRef, where("vehicle", "==", vehicle.name));
          const snapshot = await getDocs(q);

          snapshot.forEach((doc) => {
            const data = doc.data();
            const end = new Date(data.endDate);
            if (end < new Date()) {
              hasCompletedBooking = true;
            }
          });
        }
        setCanSubmit(hasCompletedBooking);
      } catch (err) {
        console.error("Error checking booking:", err);
      }

      try {
        const reviewsRef = collection(db, vehicle.name);
        const reviewsSnap = await getDocs(reviewsRef);
        const reviewsList = reviewsSnap.docs.map((doc) => doc.data());
        setAllRatings(reviewsList);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }

      try {
        const vehiclesRef = collection(db, "vehicles");
        const simQuery = query(vehiclesRef, where("type", "==", vehicle.type));
        const simSnap = await getDocs(simQuery);
        const simData = simSnap.docs
          .map((doc) => doc.data())
          .filter((v) => v.id !== vehicle.id); // exclude current vehicle
        setSimilarVehicles(simData);
      } catch (err) {
        console.error("Error fetching similar vehicles:", err);
      }
    };

    fetchData();
  }, [vehicle]);

  const handleSubmitRating = async () => {
    if (!canSubmit) return alert("You can only rate after your booking ends.");

    const user = JSON.parse(localStorage.getItem("user"));
    const newReview = {
      vehicleId: vehicle.id,
      rating,
      comment,
      user: user?.name || "Anonymous",
      date: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, vehicle.name), newReview);
      setAllRatings((prev) => [...prev, newReview]);
      setRating(0);
      setComment("");
      alert("Thanks for your review!");
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to save review.");
    }
  };

  const averageRating =
    allRatings.length > 0
      ? (
          allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        ).toFixed(1)
      : "No ratings yet";

  if (!vehicle) {
    return <div className="text-center mt-5 text-danger">No vehicle data found.</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container my-5 vehicle-details">
        <div className="vehicle-detail-card row g-4">
          {/* LEFT IMAGE */}
          <div className="col-md-6">
            <div className="main-image-wrapper">
              <img src={mainImage} alt={vehicle.name} className="main-image" />
            </div>
          </div>

          {/* RIGHT DETAILS */}
          <div className="col-md-6 d-flex flex-column justify-content-between">
            <div className="vehicle-info">
              <h2 className="vehicle-title">{vehicle.name}</h2>
              <p className="vehicle-type">Type: <span>{vehicle.type}</span></p>
              <p className="vehicle-price">₹{vehicle.pricePerHour}/hour</p>
              <div className="vehicle-status">
                <strong>Status:</strong>{" "}
                <span className={vehicle.available ? "status-available" : "status-booked"}>
                  {vehicle.available ? "Available" : "Booked"}
                </span>
              </div>
              <div className="vehicle-rating">
                <strong>Average Rating:</strong>{" "}
                {averageRating === "No ratings yet" ? (
                  <span className="text-secondary">{averageRating}</span>
                ) : (
                  <span className="text-warning">
                    {averageRating} ⭐ ({allRatings.length} reviews)
                  </span>
                )}
              </div>
            </div>

            <div className="sub-images-gallery mt-4">
              {(vehicle.subImages || []).map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`sub${idx + 1}`}
                  className="gallery-image"
                  onClick={() => setMainImage(src)}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>

            <button
              className="btn book-now-btn mt-3"
              disabled={!vehicle.available}
              onClick={() => navigate("/booking", { state: { vehicle } })}
            >
              {vehicle.available ? "Book Now" : "Currently Unavailable"}
            </button>
          </div>
        </div>

        {/* SIMILAR */}
        <div className="mt-5">
          <h4 className="fw-semibold mb-3">Similar {vehicle.type}s</h4>
          <div className="row">
            {similarVehicles.map((sim) => (
              <div key={sim.id} className="col-md-4">
                <div className="card similar-card">
                  <img src={sim.image} alt={sim.name} className="card-img-top" />
                  <div className="card-body">
                    <h5 className="card-title">{sim.name}</h5>
                    <p className="card-text">₹{sim.pricePerHour}/hour</p>
                    <div className="d-flex justify-content-center">
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => navigate("/vehicle-details", { state: { vehicle: sim } })}
                    >
                      View Details
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-5 review-section">
          <h4 className="fw-semibold mb-3">Customer Reviews</h4>
          {allRatings.length === 0 ? (
            <div className="alert alert-info">No reviews yet.</div>
          ) : (
            <div className="list-group review-list">
              {allRatings.map((r, idx) => (
                <div key={idx} className="list-group-item review-item">
                  <strong>{r.user}</strong>{" "}
                  <span className="text-warning">⭐ {r.rating}</span>{" "}
                  <small className="text-muted">({new Date(r.date).toLocaleDateString()})</small>
                  <div>{r.comment}</div>
                </div>
              ))}
            </div>
          )}

          {/* USER REVIEW */}
          <div className="card review-form mt-4 p-3">
            <h5>Share Your Experience</h5>
            <div className="stars mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  onClick={() => canSubmit && setRating(star)}
                  className={canSubmit ? "" : "disabled"}
                  style={{
                    color: star <= rating ? "#ffc107" : "#ddd",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                  }}
                />
              ))}
            </div>
            <textarea
              rows="4"
              className="form-control"
              placeholder="Write your detailed review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={!canSubmit}
            ></textarea>
            <div className="d-flex justify-content-center">
            <button
              className="btn btn-success submit-btn w-50 mt-2"
              onClick={handleSubmitRating}
              disabled={!canSubmit}
            >
              Submit Review
            </button>
            </div>
            {!canSubmit && (
              <small className="text-danger d-block mt-2">
                You can review only after your booking ends.
              </small>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VehicleDetails;
