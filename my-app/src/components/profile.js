import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // For navigation

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          console.log(docSnap.data());
        } else {
          console.log("User is not logged in");
        }
      } else {
        console.log("User not authenticated");
      }
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  async function handleLogout() {
    try {
      await auth.signOut();
      navigate("/login");
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  async function assignPatient(doctorUid) {
    if (userDetails && userDetails.usertype === "Physiotherapist") {
      try {
        await updateDoc(doc(db, "Users", userDetails.uid), {
          assignedPatients: arrayUnion(doctorUid)
        });
        console.log("Patient assigned successfully!");
      } catch (error) {
        console.error("Error assigning patient:", error.message);
      }
    }
  }

  async function assignDoctor(patientUid) {
    if (userDetails && userDetails.usertype === "Patient") {
      try {
        await updateDoc(doc(db, "Users", userDetails.uid), {
          assignedDoctor: patientUid
        });
        console.log("Doctor assigned successfully!");
      } catch (error) {
        console.error("Error assigning doctor:", error.message);
      }
    }
  }

  // Conditional redirection based on user type
  useEffect(() => {
    if (userDetails) {
      if (userDetails.usertype === "Physiotherapist") {
        navigate("/physiotherapist");
      } else if (userDetails.usertype === "Patient") {
        navigate("/patient");
      }
    }
  }, [userDetails, navigate]);

  return (
    <div>
      <h1>Profile</h1>
      {userDetails ? (
        <div>
          <h3>Welcome, {userDetails.firstName} {userDetails.lastName}</h3>
          <p>Email: {userDetails.email}</p>
          <p>User Type: {userDetails.usertype}</p>
          {userDetails.usertype === "Physiotherapist" && (
            <>
              <h4>Assigned Patients</h4>
              <ul>
                {userDetails.assignedPatients.map((patient, index) => (
                  <li key={index}>{patient}</li>
                ))}
              </ul>
            </>
          )}
          {userDetails.usertype === "Patient" && (
            <>
              <h4>Assigned Doctor</h4>
              <p>{userDetails.assignedDoctor}</p>
            </>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}

export default Profile;
