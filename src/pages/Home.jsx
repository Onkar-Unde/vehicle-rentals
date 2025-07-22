import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../styles/Home.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "animate.css";

const Home = () => {
  const navigate = useNavigate();
  const reviewRef = useRef();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    location: "",
  });
  const [coords, setCoords] = useState({ lat: 19.076, lng: 72.8777 });
  const [showMap, setShowMap] = useState(false);

  // Reverse geocode function using Nominatim
  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch (err) {
      console.error("Error in reverse geocoding:", err);
      return `${lat}, ${lng}`;
    }
  };

  const handleFormChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const applyFilters = () => {
    if (!formData.startDate || !formData.endDate || !formData.location) {
      return alert("Please select pickup location, start, and end date.");
    }

    navigate("/vehicles", {
      state: {
        filters: {
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        },
      },
    });
  };

  const LocationSelector = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setCoords({ lat, lng });
        const name = await getLocationName(lat, lng);
        setFormData((prev) => ({ ...prev, location: name }));
      },
    });
    return null;
  };

  const scrollReviews = (dir) => {
    if (!reviewRef.current) return;
    const { scrollLeft, clientWidth } = reviewRef.current;
    reviewRef.current.scrollTo({
      left:
        dir === "left"
          ? scrollLeft - clientWidth * 0.8
          : scrollLeft + clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  const topVehicles = [
  {
    id: 1,
    name: "Royal Enfield Classic 350",
    pricePerHour: 1200,
    type: "bike",
    available: true,
    rating:4.7,
    image: "/images/Royal Enfield Classic 350.jpeg",
    subImages: ["/images/Royal Enfield Classic 3501.jpeg", "/images/Royal Enfield Classic 3502.jpeg","/images/Royal Enfield Classic 3503.jpeg"],
  },
  {
    id: 2,
    name: "Honda Activa 6G",
    pricePerHour: 500,
    type: "scooter",
    available: true,
    rating:4.5,
    image: "/images/Honda Activa 6G.jpeg",
    subImages: ["/images/Honda Activa 6G1.jpeg", "/images/Honda Activa 6G2.jpeg","/images/Honda Activa 6G.jpeg"],
  },
  {
    id: 3,
    name: "Hyundai i20",
    pricePerHour: 1800,
    type: "car",
    available: true,
    rating:4.6,
    image: "/images/Hyundai i20.jpeg",
    subImages: ["/images/Hyundai i201.jpeg", "/images/Hyundai i20.jpeg"],
  },
  {
    id: 4,
    name: "Kia Seltos",
    pricePerHour: 2500,
    type: "car",
    available: true,
    rating:4.9,
    image: "/images/Kia Seltos.jpeg",
    subImages: ["/images/Kia Seltos.jpeg", "/images/Kia Seltos1.jpeg", "/images/Kia Seltos2.jpeg"],
  },
];

  const reviews = [
    {
      name: "Ravi Sharma",
      image: "/images/1.jpg",
      text: "RideOn Rentals made my trip to Manali so convenient.",
      rating: 5,
    },
    {
      name: "Ajay Mehta",
      image: "/images/2.jpg",
      text: "Very affordable and reliable service.",
      rating: 4.5,
    },
    {
      name: "Karan Singh",
      image: "/images/3.jpg",
      text: "Excellent customer support and a good range.",
      rating: 4.8,
    },
    {
      name: "Prema Verm",
      image: "/images/4.jpg",
      text: "Amazing experience exploring Leh on a Classic 350.",
      rating: 5,
    },
  ];

  return (
    <>
      <Navbar />
     <div className="hero-wrapper position-relative">
  <video autoPlay muted loop playsInline className="hero-video">
    <source src="/video_20250722_205131.mp4" type="video/mp4" />
  </video>

   <div className="hero-overlay-content d-flex flex-column flex-lg-row justify-content-between align-items-center px-3 px-lg-5 py-5">
    <div className="bg-white p-4 rounded-4 shadow-lg hero-form-container animate__animated animate__fadeInLeft">
      <h3 className="mb-3 hero-head text-center text-warning fw-bold">Find Your Ride</h3>

      <div className="mb-3">
        <label className="form-label text-dark fw-semibold">Pickup Location</label>
        <div className="d-flex flex-row align-items-center location-input">
          <input
            name="location"
            className="form-control mb-2"
            placeholder="Enter Location"
            value={formData.location}
            onChange={handleFormChange}
          />
          <button
            type="button"
            className="btn btn-outline-warning btn-sm mb-2 ms-2"
            onClick={() => setShowMap((prev) => !prev)}
          >
            GPS
          </button>
        </div>
        {showMap && (
          <MapContainer
            center={coords}
            zoom={13}
            style={{ height: "200px", borderRadius: "8px" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={coords} />
            <LocationSelector />
          </MapContainer>
        )}
      </div>

      <div className="mb-3 mt-3">
        <label className="form-label text-dark fw-semibold">Start Date & Time</label>
        <input
          type="datetime-local"
          name="startDate"
          className="form-control"
          onChange={handleFormChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label text-dark fw-semibold">End Date & Time</label>
        <input
          type="datetime-local"
          name="endDate"
          className="form-control"
          onChange={handleFormChange}
        />
      </div>

      <button
        className="btn btn-warning w-100 fw-semibold shadow-sm"
        onClick={applyFilters}
      >
        Search Rides
      </button>
    </div>

    <div className="text-white mt-4 mt-lg-0 text-center text-lg-start px-lg-5 hero-text animate__animated animate__fadeInRight">
      <motion.h1
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4 }}
        className="display-4 fw-bold text-shadow mb-3 text-warning"
      >
        Explore Freedom on Wheels
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="lead fs-5 text-shadow"
      >
        Find your perfect ride with location-based search, instant booking, and unbeatable pricing.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <div className="highlight-box mt-4 p-3 rounded-3 shadow-lg text-center border border-light glow-effect bg-warning text-dark fw-semibold">
          <span className="me-3"><i className="bi bi-lightning-charge-fill"></i> Instant Booking</span>
          <span className="me-3"><i className="bi bi-headset"></i> 24/7 Support</span>
          <span><i className="bi bi-currency-rupee"></i> Affordable Rates</span>
        </div>
      </motion.div>
    </div>
  </div>
</div>



      {/* Top Vehicles Section */}
      <section className="container my-5">
  <h2 className="text-center mb-4 fw-bold display-6 text-warning">
    Top Cars and Bikes
  </h2>
  <div className="row g-4">
    {topVehicles.map((v, idx) => (
      <motion.div
        key={idx}
        className="col-sm-6 col-md-4 col-lg-3"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: idx * 0.1 }}
        viewport={{ once: true }}
      >
        <div
          className={`card h-100 shadow-sm border-0 vehicle-card ${
            hoveredIndex === idx ? "hover-shadow" : ""
          }`}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="vehicle-img-wrapper">
            <img
              src={v.image}
              className="vehicle-img"
              alt={v.name}
              loading="lazy"
            />
          </div>
          <div className="card-body d-flex flex-column">
            <h5 className="card-title fw-bold text-warning">{v.name}</h5>
            <p className="mb-1 text-muted">Price/hour: ₹{v.pricePerHour}</p>
            <p className="text-muted">Rating: ⭐{v.rating}</p>
            <button
              className="btn btn-warning mt-auto book-btn fw-bold"
              onClick={() =>
                navigate("/vehicle-details", { state: { vehicle: v } })
              }
            >
              View
            </button>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
  <div className="text-center mt-4">
    <button
      className="btn btn-outline-warning fw-semibold px-4 py-2"
      onClick={() => navigate('/vehicles')}
    >
      View All Vehicles
    </button>
  </div>
</section>


      {/* Why Choose Us Section */}
      <section className="why-section text-white text-center py-5 position-relative">
        <div className="overlay"></div>
        <div className="container position-relative z-2">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="display-5 text-warning fw-bold"
          >
            Why Choose RideOn Rentals?
          </motion.h2>
          <p
            className="mt-4 fs-5 px-3 px-md-5 mx-auto"
            style={{ maxWidth: "900px" }}
          >
            At <strong className="text-warning">RideOn Rentals</strong>, we bring your travel dreams to
            life — with 24/7 support, best prices, instant bookings, and trusted
            rides.
          </p>
          <div className="row mt-5">
            {[
              { icon: "bi-truck", text: "Instant Bookings" },
              { icon: "bi-clock-history", text: "24/7 Support" },
              { icon: "bi-currency-rupee", text: "Best Prices" },
              { icon: "bi-star-half", text: "Trusted Reviews" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="col-md-3 col-6 mb-3"
                whileHover={{ scale: 1.1 }}
              >
                <i className={`bi ${item.icon} fs-2 text-light`}></i>
                <p className="fw-semibold mt-2">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="customer-reviews-section">
        <div className="container position-relative">
          <h2 className="text-warning">What Our Customers Say</h2>
          <button
            className="scroll-button left"
            onClick={() => scrollReviews("left")}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <button
            className="scroll-button right"
            onClick={() => scrollReviews("right")}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
          <div ref={reviewRef} className="reviews-container">
            {reviews.map((rev, idx) => (
              <motion.div
                key={idx}
                className="review-card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="card-body">
                  <div className="reviewer-info">
                    <img src={rev.image} alt={rev.name} />
                    <div>
                      <p className="reviewer-name">{rev.name}</p>
                      <p className="review-rating">
                        {"⭐".repeat(Math.floor(rev.rating))}
                      </p>
                    </div>
                  </div>
                  <p>{rev.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
