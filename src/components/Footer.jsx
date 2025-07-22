import React from 'react';
import "../styles/Home.css";

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white pt-5 pb-3">
      <div className="container">
        <div className="row">

          {/* Brand & About */}
          <div className="col-md-4 mb-4">
            <div className='d-flex align-items-center'>
               <img
            src="/images/logo.png"
            alt="RideOn Rentals Logo"
            style={{
              height: "55px",
              width: "auto",
              filter: "brightness(0) invert(1)", 
            }}
            className="me-2"
          />
            <span className="fs-4 fw-bold text-warning">
            RideOn <span className="text-light">Rentals</span>
          </span>
            </div>
            <p className="small text-light">
              Your trusted partner for affordable and comfortable car & bike rentals across India.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-2 mb-4">
            <h6 className="text-light fw-bold">Quick Links</h6>
            <ul className="list-unstyled small">
              <li><a href="/" className="text-decoration-none text-light footer-link">Home</a></li>
              <li><a href="/vehicles" className="text-decoration-none text-light footer-link">Vehicles</a></li>
              <li><a href="/history" className="text-decoration-none text-light footer-link">Booking History</a></li>
              <li><a href="/profile" className="text-decoration-none text-light footer-link">Profile</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-md-3 mb-4">
            <h6 className="text-light fw-bold">Contact Us</h6>
            <p className="small text-light mb-1">
              <i className="bi bi-envelope-fill me-2"></i>
              <a href="mailto:support@rideonrentals.in" className="text-decoration-none text-light">
                support@rideonrentals.in
              </a>
            </p>
            <p className="small text-light mb-1">
              <i className="bi bi-telephone-fill me-2"></i> +91 98765 43210
            </p>
            <p className="small text-light">
              <i className="bi bi-geo-alt-fill me-2"></i> Pune, Maharashtra, India
            </p>
          </div>

         
          <div className="col-md-3 mb-4">
            <h6 className="text-light fw-bold">Follow Us</h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-light fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-light fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-light fs-5"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="text-light fs-5"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

        </div>

        <hr className="border-secondary my-3" />

        <div className="text-center small text-light">
          &copy; {new Date().getFullYear()} RideOn Rentals. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
