import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "./firebase";  // Assuming this file is correct
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // For navigation
import { getDoc, doc } from "firebase/firestore"; // Correct import for Firestore methods
import { db } from "./firebase"; // Make sure this imports Firestore correctly

import './login.css';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();  // Hook to handle navigation
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const userDocRef = doc(db, "Users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
  
      if (!userDocSnap.exists()) {
        toast.error("User data not found.", { position: "bottom-center" });           //if user not found
        return;
      }
  
      const userRole = userDocSnap.data().usertype;     //extarct usertype
  

      //check the type of user and redirect
      if (userRole === "Physiotherapist")
      {                                                           
        toast.success("Physiotherapist logged in successfully.", { position: "top-center" });
        
        const physioName = `${userDocSnap.firstName} ${userDocSnap.lastName}`;

        // Save doctor's name in session storage
        sessionStorage.setItem("physioName", physioName);
        
        window.location.href = "/physiotherapist/physio.html"; // Redirect to static HTML page
        
      }
      else if (userRole === "Patient") 
      {
        toast.success("Patient logged in successfully.", { position: "top-center" });
        navigate("/patient-dashboard"); // Navigate to Patient Dashboard React route
      }
      else
      {
        toast.error("Invalid user type.", { position: "bottom-center" });
      }
    } catch (error) {
      toast.error(error.message, { position: "bottom-center" });
    }
  };
  
  return (
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
        >
          Login
        </button>
      </div>

      <p className="forgot-password text-right">
        New user <a href="/register">Register Here</a>
      </p>
    </form>
  );
}

export default Login;
