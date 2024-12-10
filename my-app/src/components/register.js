import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { setDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";

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

  // Fetch physiotherapists from Firestore
  useEffect(() => {
    const fetchTherapists = async () => {
      const q = query(collection(db, "Users"), where("usertype", "==", "Physiotherapist"));
      const querySnapshot = await getDocs(q);
      const therapistList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTherapists(therapistList);
    };

    fetchTherapists();
  }, []);

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
        Already registered <a href="/login">Login</a>
      </p>
    </form>
  );
}

export default Register;