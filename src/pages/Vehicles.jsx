// Vehicles.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  setVehicles,
  toggleCompanyFilter,
  toggleTypeFilter,
  setSortOrder,
  applyFilters,
} from "../redux/vehicleSlice";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const Vehicles = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { filteredVehicles, filters, sortOrder } = useSelector(
    (state) => state.vehicle
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "vehicles"));
        let vehicles = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const stateFilters = location.state?.filters;
        if (stateFilters?.startDate && stateFilters?.endDate) {
          vehicles = vehicles.filter((v) => v.available === true);
        }

        dispatch(setVehicles(vehicles));
      } catch (err) {
        console.error("Error fetching vehicles from Firestore:", err);
      }
    };

    fetchVehicles();
  }, [dispatch, location.state]);

  useEffect(() => {
    dispatch(applyFilters());
    setCurrentPage(1);
  }, [filters, sortOrder, dispatch]);

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row">
          <div className="col-md-3">
            <div className="mb-4">
              <div
                className="card text-white shadow-lg rounded-4 border-0 p-4"
                style={{
                  background: "linear-gradient(135deg, #ff9800, #f44336)",
                  animation: "pulse 2s infinite",
                }}
              >
                <h5 className="text-center fs-4 mb-2"> Exclusive Deal!</h5>
                <p className="text-center fs-6 mb-1">
                  <strong>10% OFF</strong> on your <u>first ride</u> with us.
                </p>
                <p className="text-center mb-3 small">
                  Offer valid this week only!
                </p>
                <div className="d-flex justify-content-center">
                  <button className="btn btn-light btn-sm fw-bold px-3 rounded-pill">
                    Book Now
                  </button>
                </div>
              </div>
            </div>

            <div className="card p-3 shadow-sm">
              <h5 className="mb-3 text-center text-warning">Filters</h5>

              <strong>Company</strong>
              <div className="mb-3">
                {[
                  "Honda",
                  "Kia",
                  "Hyundai",
                  "Bajaj",
                  "Suzuki",
                  "Royal Enfield",
                  "Yamaha",
                  "Maruti",
                  "Toyota",
                ].map((company) => (
                  <div key={company} className="form-check small">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={filters.company.includes(company)}
                      onChange={() => dispatch(toggleCompanyFilter(company))}
                    />
                    <label className="form-check-label text-dark">
                      {company}
                    </label>
                  </div>
                ))}
              </div>

              <strong>Type</strong>
              <div className="mb-3">
                {["Car", "Bike", "Scooter"].map((type) => (
                  <div key={type} className="form-check small">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={filters.type.includes(type)}
                      onChange={() => dispatch(toggleTypeFilter(type))}
                    />
                    <label className="form-check-label text-dark">{type}</label>
                  </div>
                ))}
              </div>

              <strong>Sort by Price</strong>
              <select
                className="form-select mt-2"
                value={sortOrder}
                onChange={(e) => dispatch(setSortOrder(e.target.value))}
              >
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>
            </div>
          </div>

          {/* Vehicle Card*/}
          <div className="col-md-9">
            <div className="row">
              {paginatedVehicles.map((v) => (
                <div className="col-md-4 mb-4" key={v.id}>
                  <div className="card shadow-sm">
                    <img
                      src={v.image}
                      alt={v.name}
                      className="card-img-top"
                      style={{
                        height: "200px",
                        objectFit: "cover",
                        borderTopLeftRadius: "1rem",
                        borderTopRightRadius: "1rem",
                      }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{v.name}</h5>
                      <p>Type: {v.type}</p>
                      <p>Company: {v.company}</p>
                      <p>Price: ₹{v.pricePerHour}/hr</p>
                      <p>
                        Status:{" "}
                        <span
                          className={
                            v.available ? "text-success" : "text-danger"
                          }
                        >
                          {v.available ? "Available" : "Booked"}
                        </span>
                      </p>
                      <button
                        className="btn btn-warning mt-auto"
                        onClick={() =>
                          navigate("/vehicle-details", {
                            state: { vehicle: v },
                          })
                        }
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredVehicles.length === 0 && (
                <p className="text-center mt-3">No matching vehicles found.</p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4 flex-wrap gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`btn ${
                      currentPage === i + 1
                        ? "btn-warning"
                        : "btn-outline-warning"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Vehicles;
