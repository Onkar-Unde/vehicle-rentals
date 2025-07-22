import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { db } from "../firebase";
import {
  getDocs,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";

const BookingHistory = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    if (!user) return;

    const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const now = new Date();

    const activeBookings = [];
    const expiredBookings = [];

    // Separate expired and active bookings
    allBookings.forEach((booking) => {
      if (
        booking.userEmail === user.email &&
        new Date(booking.endDateTime || booking.endDate) < now
      ) {
        expiredBookings.push(booking);
      } else if (booking.userEmail === user.email) {
        activeBookings.push(booking);
      }
    });

    // Update Firestore for expired bookings
    const processExpired = async () => {
      try {
        const vehicleDocs = await getDocs(collection(db, "vehicles"));
        const vehicleMap = new Map();

        vehicleDocs.forEach((docSnap) => {
          const data = docSnap.data();
          vehicleMap.set(data.name, docSnap.id);
        });

        for (let expired of expiredBookings) {
          const vehicleId = vehicleMap.get(expired.vehicle);
          if (vehicleId) {
            const ref = doc(db, "vehicles", vehicleId);
            await updateDoc(ref, { available: true });
            console.log(`✔️ Set "${expired.vehicle}" available = true`);
          }
        }
      } catch (err) {
        console.error("⚠️ Error updating Firestore availability:", err);
      }
    };

    processExpired();

    const updatedBookings = allBookings.filter(
      (b) => !expiredBookings.includes(b)
    );
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    setUserBookings(activeBookings);
  }, [user]);

  const handleCancel = (index) => {
    const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const toRemove = userBookings[index];
    const updated = allBookings.filter((b) => b !== toRemove);
    localStorage.setItem("bookings", JSON.stringify(updated));
    window.location.reload();
  };


  if (!user) {
    return (
      <>
        <Navbar />
        <div className="container mt-5" style={{ minHeight: "calc(100vh - 136px)" }}>
          <h3>Please login to view your booking history.</h3>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-5" style={{ minHeight: "calc(90vh - 135px)" }}>
        <h2 className="mb-4 d-flex justify-content-between align-items-center">
          My Booking History
        </h2>
        {userBookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark text-center">
                <tr>
                  <th>No.</th>
                  <th>Vehicle</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Pickup Location</th>
                  <th>Total Price</th>
                  <th>Booked On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {userBookings.map((b, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{b.vehicle}</td>
                    <td>{b.startDateTime?.split("T")[0] || b.startDate}</td>
                    <td>{b.endDateTime?.split("T")[0] || b.endDate}</td>
                    <td>{b.pickupLocation}</td>
                    <td>₹{b.totalPrice}</td>
                    <td>{new Date(b.bookingDate).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancel(index)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default BookingHistory;
