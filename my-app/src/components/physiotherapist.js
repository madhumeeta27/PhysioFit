import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase"; // Adjust path as necessary
import { collection, getDocs } from "firebase/firestore";

function Physiotherapist() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "patients"));
        const patientsData = querySnapshot.docs.map(doc => doc.data());
        setPatients(patientsData);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate("/login");
    }).catch(error => {
      console.error("Logout error:", error);
    });
  };

  const handleSelectPatient = (patientId) => {
    // Logic to select a patient
    console.log("Selected patient ID:", patientId);
  };

  return (
    <div>
      <h2>Physiotherapist Page</h2>
      <p>Welcome, physiotherapist!</p>
      <button onClick={handleLogout}>Logout</button>
      <div>
        <h3>Select Patient:</h3>
        <ul>
          {patients.map((patient, index) => (
            <li key={index} onClick={() => handleSelectPatient(patient.id)}>
              {patient.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Physiotherapist;
