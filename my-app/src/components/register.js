import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { setDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [utype, setUType] = useState("");
  const [contact, setContact] = useState("");
  const [clinic, setClinic] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState("");
  const navigate = useNavigate();

  // Fetch physiotherapists from Firestore
  useEffect(() => {
    const fetchTherapists = async () => {
      if (utype === "Patient") {
        try {
          console.log("Attempting to fetch therapists...");
          
          // First, check if we can access the collection
          const usersRef = collection(db, "Users");
          console.log("Collection reference created");
          
          const q = query(usersRef, where("usertype", "==", "Physiotherapist"));
          console.log("Query created");
          
          const querySnapshot = await getDocs(q);
          console.log("Query executed, documents found:", querySnapshot.size);
          
          if (querySnapshot.empty) {
            console.log("No therapists found in the database");
            setTherapists([]);
            return;
          }
          
          const therapistList = querySnapshot.docs.map((doc) => {
            console.log("Processing therapist:", doc.id);
            return {
              id: doc.id,
              ...doc.data()
            };
          });
          
          console.log("Final therapist list:", therapistList);
          setTherapists(therapistList);
          
        } catch (error) {
          console.error("Detailed error:", {
            code: error.code,
            message: error.message,
            stack: error.stack
          });
          toast.error("Could not load therapists. Please try again later.");
        }
      }
    };
    
    fetchTherapists();
  }, [utype]);
  
    const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        // Construct Firestore data based on user type
        const userData = {
          email: user.email,
          firstName: fname,
          lastName: lname,
          photo: "",
          usertype: utype,
          contact,
        };

        if (utype === "Physiotherapist") {
          userData.clinic = clinic;
          userData.hospitalAddress = hospitalAddress;
        } else if (utype === "Patient") {
          userData.assignedTherapist = selectedTherapist;
        }

        await setDoc(doc(db, "Users", user.uid), userData);
      }
      toast.success("User Registered Successfully!!", {
        position: "top-center",
      });
      
      navigate("/login");
    } catch (error) {
      console.error(error.message);
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
            className="form-check-input"
            onChange={(e) => setUType(e.target.value)}
          />
          <label htmlFor="physiotherapist" className="form-check-label">
            Physiotherapist
          </label>
        </div>
        <div>
          <input
            type="radio"
            name="userType"
            id="patient"
            value="Patient"
            className="form-check-input"
            onChange={(e) => setUType(e.target.value)}
          />
          <label htmlFor="patient" className="form-check-label">
            Patient
          </label>
        </div>
      </div>

      {utype === "Physiotherapist" && (
        <>
          <div className="mb-3">
            <label>Clinic/Hospital Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Clinic/Hospital Name"
              onChange={(e) => setClinic(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label>Hospital Address</label>
            <textarea
              className="form-control"
              placeholder="Hospital Address"
              onChange={(e) => setHospitalAddress(e.target.value)}
              required
            ></textarea>
          </div>
        </>
      )}

      <div className="mb-3">
        <label>Contact</label>
        <input
          type="text"
          className="form-control"
          placeholder="Contact Number"
          onChange={(e) => setContact(e.target.value)}
          required
        />
      </div>

      {utype === "Patient" && (
        <div className="mb-3">
          <label>Select Physiotherapist</label>
          <select
            className="form-control"
            onChange={(e) => setSelectedTherapist(e.target.value)}
            required
          >
            <option value="">-- Select --</option>
            {therapists.map((therapist) => (
              <option key={therapist.id} value={therapist.id}>
                {therapist.firstName} {therapist.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

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
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
      </div>
      <p className="forgot-password text-right">
        Already registered? <a href="/login">Login</a>
      </p>
    </form>

  );
}

export default Register;