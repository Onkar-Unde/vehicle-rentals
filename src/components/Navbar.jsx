import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Highlight link if current route matches
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-2">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img
            src="/images/logo.png"
            alt="RideOn Rentals Logo"
            style={{
              height: "60px",
              width: "auto",
              filter: "brightness(0) invert(1)", // Makes logo white
            }}
            className="me-2"
          />
          <span className="fs-4 fw-bold text-warning">
            RideOn <span className="text-light">Rentals</span>
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-3">
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  isActive("/") ? "active text-warning" : "text-light"
                }`}
                to="/"
              >
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${
                  isActive("/vehicles") ? "active text-warning" : "text-light"
                }`}
                to="/vehicles"
              >
                Vehicles
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${
                  isActive("/history") ? "active text-warning" : "text-light"
                }`}
                to="/history"
              >
                Booking History
              </Link>
            </li>

            {user ? (
              <li className="nav-item dropdown">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-warning"
                    className="rounded-pill d-flex align-items-center px-3 text-light py-1"
                  >
                    <i className="bi bi-person-circle fs-5 me-2"></i>
                    {user.name || user.email || "Profile"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-end">
                    <Dropdown.Item as={Link} to="/profile">
                      <i className="bi bi-person-fill me-2"></i> My Profile
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2 text-danger"></i>{" "}
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-light btn-sm" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-warning btn-sm" to="/register">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
