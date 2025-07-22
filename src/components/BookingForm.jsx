import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/BookingForm.css";

const BookingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const vehicle = location.state?.vehicle;
  const user = JSON.parse(localStorage.getItem("user"));

  const getLocalDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    startDateTime: getLocalDateTime(),
    endDateTime: "",
    pickupLocation: "",
    pickupCoords: null,
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [hours, setHours] = useState(0);
  const [validationMessage, setValidationMessage] = useState("");

  if (!user) {
    setTimeout(() => {
      navigate("/login");
    }, 3000);

    return (
      <>
        <Navbar />
        <div className="container mt-5 mb-5 d-flex flex-column align-items-center justify-content-center">
          <div
            className="card p-4 text-center shadow"
            style={{ maxWidth: "400px" }}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="login"
              className="mb-3"
              style={{ width: "100px", height: "100px", opacity: 0.8 }}
            />
            <h4 className="text-danger fw-bold mb-2">Access Denied</h4>
            <p className="text-secondary mb-3">
              You must be logged in to book a vehicle.
            </p>
            <button
              className="btn btn-warning w-100"
              onClick={() => navigate("/login")}
            >
              Login Now
            </button>
            <small className="text-muted mt-2">
              Redirecting to login in 3 seconds...
            </small>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center">
          <h4 className="text-danger mb-3">No Vehicle Selected</h4>
          <p>Please go back and select a vehicle to continue booking.</p>
          <button className="btn btn-warning" onClick={() => navigate("/")}>
            Go to Vehicles
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const calculateTotalPrice = ({ startDateTime, endDateTime }) => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const diffMs = end - start;

    if (isNaN(diffMs) || diffMs <= 0) {
      setHours(0);
      return 0;
    }

    const calculatedHours = Math.ceil(diffMs / (1000 * 60 * 60));
    setHours(calculatedHours);
    return calculatedHours * vehicle.pricePerHour;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (updated.startDateTime && updated.endDateTime) {
      const price = calculateTotalPrice(updated);
      setTotalPrice(price);
    }

    const now = new Date();
    const start = new Date(updated.startDateTime);
    const end = new Date(updated.endDateTime);

    if (start && start < now.setHours(0, 0, 0, 0)) {
      setValidationMessage("Pickup date/time must be today or later.");
    } else if (start && end && end <= start) {
      setValidationMessage("Drop date/time must be after pickup date/time.");
    } else {
      setValidationMessage("");
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      return alert("Geolocation not supported by your browser.");
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setFormData((prev) => ({
        ...prev,
        pickupCoords: [latitude, longitude],
      }));

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          pickupLocation: data.display_name || prev.pickupLocation,
        }));
      } catch {
        console.error("Reverse geocode failed");
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const now = new Date();
    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);

    if (start < now.setHours(0, 0, 0, 0)) {
      setValidationMessage("Pickup date/time must be today or later.");
      return;
    }

    if (end <= start) {
      setValidationMessage("Drop date/time must be after pickup date/time.");
      return;
    }

    const booking = {
      userEmail: user.email,
      vehicle: vehicle.name,
      ...formData,
      totalPrice,
      bookingDate: new Date().toISOString(),
    };

    const all = JSON.parse(localStorage.getItem("bookings") || "[]");
    all.push(booking);
    localStorage.setItem("bookings", JSON.stringify(all));

    navigate("/checkout", { state: { booking } });
  };

  return (
    <>
      <Navbar />
      <div className="containerbook mt-5 mb-5">
        <h2 className="mb-4 bookh2 text-warning">Book {vehicle.name}</h2>
        <div className="booking-wrapper d-flex flex-column flex-md-row gap-4">
          <div className="cardbook p-4 shadow booking-left flex-grow-1">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-labelbook">Pickup Date & Time</label>
                  <input
                    type="datetime-local"
                    name="startDateTime"
                    className="form-control"
                    required
                    value={formData.startDateTime}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-labelbook">Drop Date & Time</label>
                  <input
                    type="datetime-local"
                    name="endDateTime"
                    className="form-control"
                    required
                    value={formData.endDateTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-labelbook">Pickup Location</label>
                <div className="input-group">
                  <input
                    type="text"
                    name="pickupLocation"
                    className="form-control"
                    placeholder="Enter manually or use GPS"
                    required
                    value={formData.pickupLocation}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-warning"
                    onClick={getLocation}
                  >
                    Use GPS
                  </button>
                </div>
              </div>

              {formData.pickupCoords && (
                <div className="mb-3">
                  <MapContainer
                    center={formData.pickupCoords}
                    zoom={13}
                    style={{ height: "200px", borderRadius: "8px" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={formData.pickupCoords}>
                      <Popup>Pickup Location</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}

              <div className="mb-3">
                <label className="form-labelbook fw-bold">Total Price</label>
                <input
                  type="text"
                  className="form-control"
                  value={`₹${totalPrice}`}
                  readOnly
                />
                {hours > 0 && (
                  <p className="text-muted mt-1">Duration: {hours} hour(s)</p>
                )}
              </div>

              {validationMessage && (
                <div className="alert alert-danger mt-2" role="alert">
                  {validationMessage}
                </div>
              )}

              <div className="d-flex justify-content-center">
                <button type="submit" className="btn btn-warning mt-3">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>

          <div className="booking-right">
            <img
              src={vehicle.image || "/default-vehicle.png"}
              alt={vehicle.name}
              className="vehicle-preview-img rounded shadow"
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookingForm;
