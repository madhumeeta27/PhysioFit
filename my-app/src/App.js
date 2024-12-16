import React, { useEffect, useState } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Login from "./components/login/login";
import SignUp from "./components/register";
import Physio from "./components/physio/physio";
import Patient from "./components/patient";
import Profile from "./components/profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "./components/firebase";

function App() {
  const [user, setUser] = useState();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    auth
      .signOut()
      .then(() => {
        setUser(null);
      })
      .catch((error) => {
        console.error("Error clearing authentication state:", error);
      });
  }, []);

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        setUser(null); // Clear user state
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <div className="auth-wrapper">
                <div className="auth-inner">
                  <Login />
                </div>
              </div>
            }
          />
          <Route
            path="/login"
            element={
              <div className="auth-wrapper">
                <div className="auth-inner">
                  <Login />
                </div>
              </div>
            }
          />
          <Route
            path="/register"
            element={
              <div className="auth-wrapper">
                <div className="auth-inner">
                  <SignUp />
                </div>
              </div>
            }
          />
          <Route
            path="/profile"
            element={<Profile />}
          />

          {/* Protected Routes */}
          <Route
            path="/physiotherapist"
            element={user ? <Physio /> : <Navigate to="/login" />}
          />
          <Route
            path="/patient"
            element={user ? <Patient /> : <Navigate to="/login" />}
          />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
