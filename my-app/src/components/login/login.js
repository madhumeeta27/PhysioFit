import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../firebase"; 
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; 
import { getDoc, doc } from "firebase/firestore"; 
import { db } from "../firebase"; 

import './login.css';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Hook to handle navigation

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "Users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        toast.error("User data not found.", { position: "bottom-center" });
        return;
      }

      const userRole = userDocSnap.data().usertype;

      // Check the type of user and redirect
      if (userRole === "Physiotherapist") {
        toast.success("Physiotherapist logged in successfully.", { position: "top-center" });

      const physioName = `${userDocSnap.data().firstName} ${userDocSnap.data().lastName}`;
      const hospitalName = userDocSnap.data().clinic; 
      const hospitalAddress = userDocSnap.data().hospitalAddress; 

      // Save doctor's details in session storage
      sessionStorage.setItem("physioName", physioName);
      sessionStorage.setItem("hospitalName", hospitalName);
      sessionStorage.setItem("hospitalAddress", hospitalAddress);

        // Redirect to the Physio React component
        navigate("/physiotherapist");
      } else if (userRole === "Patient") {
        toast.success("Patient logged in successfully.", { position: "top-center" });
        navigate("/patient"); // Navigate to Patient Dashboard React route
      } else {
        toast.error("Invalid user type.", { position: "bottom-center" });
      }
    } catch (error) {
      toast.error(error.message, { position: "bottom-center" });
    }
  };

  return (
    <div classname="login-page">
      <form onSubmit={(e) => e.preventDefault()} className="login-form">
        <h3 className="welcome">Welcome Back</h3>

        <div className="mb-3">
          <label>Email address</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-between">
          <button 
            type="button" 
            onClick={handleLogin} // Handle login as either Physio or Patient
            className="btn btn-primary"
          >
            Login
          </button>
        </div>

        <p className="forgot-password text-right">
          New user <a href="/register">Register Here</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
