import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";


if (doctorData) {
    // Update the DOM with the doctor's data
    const physioName = sessionStorage.getItem("physioName");


    document.getElementById("doctor-name").textContent = `WELCOME, ${physioName}`;
} else {
    console.error("Doctor data not found in local storage!");
}

