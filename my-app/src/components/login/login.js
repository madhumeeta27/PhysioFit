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

      if (userRole === "Physiotherapist") {
        const physioName = `${userDocSnap.data().firstName} ${userDocSnap.data().lastName}`;
        const hospitalName = userDocSnap.data().clinic; 
        const hospitalAddress = userDocSnap.data().hospitalAddress;
        const emailID = userDocSnap.data().email;
        const contactNo = userDocSnap.data().contact;

        sessionStorage.setItem("physioName", physioName);
        sessionStorage.setItem("hospitalName", hospitalName);
        sessionStorage.setItem("hospitalAddress", hospitalAddress);
        sessionStorage.setItem("emailID", emailID);
        sessionStorage.setItem("contactNo", contactNo);

        toast.success("Physiotherapist logged in successfully.", { position: "top-center" });
        navigate("/physiotherapist");
      } else if (userRole === "Patient") {
        const patientName = `${userDocSnap.data().firstName} ${userDocSnap.data().lastName}`;
        const assignedTherapist = userDocSnap.data().assignedTherapist;
        const emailID = userDocSnap.data().email;
        const contactNo = userDocSnap.data().contact;

        sessionStorage.setItem("patientName", patientName);
        sessionStorage.setItem("assignedTherapist", assignedTherapist);
        sessionStorage.setItem("emailID", emailID);
        sessionStorage.setItem("contactNo", contactNo);
        console.log({
          assignedTherapist,
          contactNo,
          emailID,
          patientName
        });

        toast.success("Patient logged in successfully.", { position: "top-center" });
        navigate("/patient");
        

      } else {                                                        
        toast.error("Invalid user type.", { position: "bottom-center" });
      }
    } catch (error) {
      toast.error(error.message, { position: "bottom-center" });
    }
  };

  return (
    <div className="login-page">
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
            onClick={handleLogin}
            className="btn btn-primary"
          >
            Login
          </button>
        </div>

        <p className="forgot-password text-right">
          New user? <a href="/register">Register Here</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
