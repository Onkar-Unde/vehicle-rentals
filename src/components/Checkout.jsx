import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import emailjs from "emailjs-com";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false);

  if (!booking) {
    return (
      <div className="container mt-5">
        <h3>
          No booking details available. Please select a vehicle and proceed
          again.
        </h3>
      </div>
    );
  }

  const sendConfirmationEmail = (bookingDetails) => {
    const userFromLS = JSON.parse(localStorage.getItem("user"));
    const email =
      bookingDetails.userEmail || userFromLS?.email || "support@example.com";

    const templateParams = {
      to_name: email,
      vehicle_name: bookingDetails.vehicle,
      start_date: bookingDetails.startDateTime?.split("T")[0] || "",
      end_date: bookingDetails.endDateTime?.split("T")[0] || "",
      total_price: bookingDetails.totalPrice,
      pickup_location: bookingDetails.pickupLocation,
      user_email: email,
    };

    emailjs
      .send(
        "service_f0oxidg",
        "template_7g6k1ex",
        templateParams,
        "pzMTPQc4nd_cjcFBq"
      )
      .then(
        (result) => console.log("✅ Email sent successfully:", result.text),
        (error) => console.error("🔥 Email error:", error.text)
      );
  };

  const handlePayment = () => {
    const options = {
      key: "rzp_test_55dbdW22BS4hIU",
      amount: booking.totalPrice * 100,
      currency: "INR",
      name: "Bike Rentals",
      description: `Payment for ${booking.vehicle}`,
      handler: async function (response) {
        setPaymentSuccess(true);
        setConfettiOn(true);

        try {
          const userFromLS = JSON.parse(localStorage.getItem("user"));
          const userId = userFromLS?.id || "guest";

          const bookingData = {
            vehicle: booking.vehicle,
            pickupLocation: booking.pickupLocation,
            startDate: booking.startDateTime,
            endDate: booking.endDateTime,
            totalPrice: booking.totalPrice,
            bookingDate: serverTimestamp(),
            razorpayPaymentId: response.razorpay_payment_id,
          };

          // Save booking to Firestore under user
          await addDoc(collection(db, `users/${userId}/bookings`), bookingData);
          console.log("✅ Booking stored to Firestore");

          // 🔄 Update vehicle availability in Firestore
          const vehicleSnapshot = await getDocs(collection(db, "vehicles"));
          const vehicleDoc = vehicleSnapshot.docs.find(
            (doc) => doc.data().name === booking.vehicle
          );

          if (vehicleDoc) {
            const vehicleRef = doc(db, "vehicles", vehicleDoc.id);
            await updateDoc(vehicleRef, { available: false });
            console.log("Vehicle availability updated in Firestore");
          } else {
            console.warn("Vehicle not found in Firestore");
          }
        } catch (err) {
          console.error("Firestore error:", err);
          alert("Booking saved locally only. Please contact support.");
        }

        // Save to localStorage as fallback
        const oldBookings = JSON.parse(localStorage.getItem("bookings")) || [];
        const alreadyExists = oldBookings.some(
          (b) =>
            b.vehicle === booking.vehicle &&
            b.startDateTime === booking.startDateTime &&
            b.endDateTime === booking.endDateTime
        );

        if (!alreadyExists) {
          localStorage.setItem(
            "bookings",
            JSON.stringify([
              ...oldBookings,
              {
                ...booking,
                bookingDate: new Date().toISOString(),
              },
            ])
          );
        }

        sendConfirmationEmail(booking);

        setTimeout(() => {
          setConfettiOn(false);
          navigate("/history");
        }, 4000);
      },
      prefill: {
        email:
          booking.userEmail ||
          JSON.parse(localStorage.getItem("user"))?.email ||
          "",
      },
      theme: {
        color: "#0d6efd",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <Navbar />
      {confettiOn && <Confetti />}
      <div className="container py-5">
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="fw-bold text-warning display-5">Checkout</h2>
          <p className="text-muted">Review your booking and confirm payment</p>
        </motion.div>

        <motion.div
          className="row justify-content-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="col-md-6">
            <div className="card shadow rounded-4 border-0">
              <div className="card-body p-4">
                <h4 className="mb-3 fw-semibold">Booking Summary</h4>
                <ul className="list-group list-group-flush mb-3">
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Vehicle:</span>
                    <span className="fw-bold text-warning">
                      {booking.vehicle}
                    </span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Start Date:</span>
                    <span>{booking.startDateTime?.split("T")[0] || "N/A"}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>End Date:</span>
                    <span>{booking.endDateTime?.split("T")[0] || "N/A"}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Pickup Location:</span>
                    <span>{booking.pickupLocation || "N/A"}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Total Price:</span>
                    <span className="fw-bold text-success fs-5">
                      ₹{booking.totalPrice}
                    </span>
                  </li>
                </ul>
                <div className="d-flex justify-content-center flex-row gap-2 mt-4">
                  <button
                    className="btn btn-outline-secondary fw-bold"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </button>

                  <button
                    className={`btn fw-bold w-50 ${
                      paymentSuccess ? "btn-secondary" : "btn-success"
                    }`}
                    onClick={handlePayment}
                    disabled={paymentSuccess}
                  >
                    {paymentSuccess ? "Payment Completed" : "Proceed to Pay"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
