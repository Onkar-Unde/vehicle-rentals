# 🚗 Car & Bike Rentals Web App

A full-stack **React** application for renting vehicles like cars and bikes. This platform allows users to **search, view, and book vehicles** based on location and date, with features like **authentication**, **booking history**, **checkout**, **wishlist/cart**, and **admin management**.

## 📦 Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Bootstrap
- **Backend**: Firebase Firestore (for data), Firebase Auth (for authentication)
- **Payments**: Razorpay integration
- **Geolocation**: OpenStreetMap + Leaflet.js
- **Animations**: Framer Motion, Animate.css
- **Form Validation**: Formik + Yup

---

## 🔑 Features

### 🚘 User Side
- Login/Register with Firebase
- View available vehicles
- Filter by location, date, time
- GPS-based pickup location
- Vehicle detail page with gallery
- Wishlist and cart using localStorage
- Booking with Razorpay
- Booking history tracking
- Responsive & modern UI
- Confetti on successful booking 🎉

### 🔧 Admin / Developer
- Vehicle data stored in Firebase Firestore
- Booked vehicles filtered dynamically
- Firestore migration script for `vehicles.json`
- Fully modular and reusable components
- Booking availability logic handled on date range

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git https://github.com/Onkar-Unde/vehicle-rentals
cd vehicle-rentals
