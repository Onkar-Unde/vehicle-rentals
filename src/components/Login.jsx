import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", credentials.email)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("Invalid Information!");
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (userData.password === credentials.password) {
        const userWithId = {
          id: userDoc.id,
          ...userData
        };
        localStorage.setItem("user", JSON.stringify(userWithId));
        alert("Login successful!");
        navigate("/");
      } else {
        alert("Invalid Information!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-background">
        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2 className="text-center text-warning mb-4">Login</h2>

            <div className="mb-3 position-relative">
              <label className="form-label">Email</label>
              <div className="input-icon">
                <i className="fas fa-envelope icon" />
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3 position-relative">
              <label className="form-label">Password</label>
              <div className="input-icon">
                <i className="fas fa-lock icon" />
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-warning w-100" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" />
              ) : null}
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-center mt-3">
              <small>
                New user?{' '}
                <Link to="/register" className="text-primary fw-bold">
                  Sign up here
                </Link>
              </small>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
