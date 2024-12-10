import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

function Patient() {
  const navigate = useNavigate();
  const [physiotherapists, setPhysiotherapists] = useState([]);

  useEffect(() => {
    const fetchPhysiotherapists = async () => {
      try {
        const q = query(collection(db, "users"), where("usertype", "==", "Physiotherapist"));
        const querySnapshot = await getDocs(q);
        const physiotherapistsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("data:"+physiotherapistsData)
        setPhysiotherapists(physiotherapistsData);
      } catch (error) {
        console.error("Error fetching physiotherapists:", error);
      }
    };

    fetchPhysiotherapists();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate("/login");
    }).catch(error => {
      console.error("Logout error:", error);
    });
  };

  const handleSelectPhysiotherapist = (physioId) => {
    console.log("Selected physiotherapist ID:", physioId);
    console.log("Current user:", auth.currentUser);

    // Implement further actions like navigating to their profile
  };

  return (
  
    <div>
      <h2>Patient Page</h2>
      <p>Welcome, patient!</p>
      <button onClick={handleLogout}>Logout</button>
      <div>
        <h3>Select Physiotherapist:</h3>
        <ul>
          {physiotherapists.length > 0 ? (
            physiotherapists.map((physio) => (
              <li key={physio.id} onClick={() => handleSelectPhysiotherapist(physio.id)}>
                {physio.name} ({physio.email})
              </li>
            ))
          ) : (
            <li>No physiotherapists available.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Patient;
