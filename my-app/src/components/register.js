import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [utype, setUType] = useState("");
  
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get user info from userCredential
      console.log(user);
      
      if (user) {
        // Set user details in Firestore
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
          photo: "",
          usertype: utype,
          createdAt: new Date(), // Optional: Add a timestamp
        });
      }
      
      console.log("User Registered Successfully!!");
      toast.success("User Registered Successfully!!", {
        position: "top-center",
      });
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h3>Sign Up</h3>

      <div className="mb-3">
        <label>First name</label>
        <input
          type="text"
          className="form-control"
          placeholder="First name"
          onChange={(e) => setFname(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label>Last name</label>
        <input
          type="text"
          className="form-control"
          placeholder="Last name"
          onChange={(e) => setLname(e.target.value)}
          required // Added required for last name
        />
      </div>

      <div className="mb-3">
          <label>User Type</label>
          <div>
            <input
              type="radio"
              name="userType"
              id="physiotherapist"
              value="Physiotherapist"
              className="form-check-input" // Use 'form-check-input' for Bootstrap styling
              onChange={(e) => setUType(e.target.value)}
              required // Ensure user type is selected
            />
            <label htmlFor="physiotherapist" className="form-check-label" style={{ fontWeight: 'normal'}}>Physiotherapist</label>
          </div>
          <div>
            <input
              type="radio"
              name="userType"
              id="patient" // Add an ID for the Patient radio button
              value="Patient"
              className="form-check-input" // Use 'form-check-input' for Bootstrap styling
              onChange={(e) => setUType(e.target.value)}
              required // Ensure user type is selected
            />
            <label htmlFor="patient" style={{ fontWeight: 'normal' }}>Patient</label>
          </div>
        </div>

      <div className="mb-3">
        <label>Email address</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="d-grid">
        <button type="submit">
          Sign Up
        </button>
      </div>
      <p className="forgot-password text-right">
        Already registered <a href="/login">Login</a>
      </p>
    </form>
  );
}

export default Register;
