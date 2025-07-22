import React, { useEffect } from 'react'; // ✅ import useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './pages/Profile';
import BookingForm from './components/BookingForm';
import BookingHistory from './components/BookingHistory';
import Checkout from './components/Checkout';
import VehicleDetails from './pages/VehicleDetails';

// import { migrateVehicles } from './migrateVehicles';

function App() {
  // useEffect(() => {
  //   migrateVehicles(); 
  // }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />}/>
        <Route path="/booking" element={<BookingForm />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/history" element={<BookingHistory />} />
        <Route path="/vehicle-details" element={<VehicleDetails/>}/>
      </Routes>
    </Router>
  );
}

export default App;
