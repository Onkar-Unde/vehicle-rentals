import React, { useEffect, useState, useRef } from "react";
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
  query,
  where,
  deleteDoc,
} from "firebase/firestore";

const BookingHistory = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [userBookings, setUserBookings] = useState([]);
  const processedRef = useRef(false); // Prevent re-execution

  useEffect(() => {
    if (!user || processedRef.current) return;

    const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const now = new Date();

    const activeBookings = [];
    const expiredBookings = [];

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

        const updatedBookings = allBookings.filter(
          (b) => !expiredBookings.includes(b)
        );
        localStorage.setItem("bookings", JSON.stringify(updatedBookings));
        setUserBookings(activeBookings);
        processedRef.current = true;
      } catch (err) {
        console.error("⚠️ Error updating Firestore availability:", err);
      }
    };

    processExpired();
  }, [user]);

  const handleCancel = async (index) => {
    const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const toRemove = userBookings[index];

    // Delete from Firestore "bookings"
    try {
      const bookingsRef = collection(db, "bookings");
      const q = query(
        bookingsRef,
        where("userEmail", "==", user.email),
        where("vehicle", "==", toRemove.vehicle),
        where("startDateTime", "==", toRemove.startDateTime || toRemove.startDate)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "bookings", docSnap.id));
        console.log("🔥 Deleted booking from Firestore:", docSnap.id);
      });
    } catch (error) {
      console.error("❌ Failed to delete booking from Firestore:", error);
    }

    // Update vehicle availability
    try {
      const vehicleDocs = await getDocs(collection(db, "vehicles"));
      vehicleDocs.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (data.name === toRemove.vehicle) {
          const vehicleRef = doc(db, "vehicles", docSnap.id);
          await updateDoc(vehicleRef, { available: true });
          console.log(`✅ Vehicle "${data.name}" marked available`);
        }
      });
    } catch (err) {
      console.error("⚠️ Error updating vehicle availability:", err);
    }

    // Remove from localStorage and update UI
    const updated = allBookings.filter((b) => b !== toRemove);
    localStorage.setItem("bookings", JSON.stringify(updated));
    const newUserBookings = userBookings.filter((_, i) => i !== index);
    setUserBookings(newUserBookings);
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
