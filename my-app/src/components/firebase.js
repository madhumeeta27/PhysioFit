// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCC4XH9ypdH7MCxUXG9DV5nXKTYDwFQRkc",
  authDomain: "physiofit-1c89b.firebaseapp.com",
  projectId: "physiofit-1c89b",
  storageBucket: "physiofit-1c89b.appspot.com",
  messagingSenderId: "358918355253",
  appId: "1:358918355253:web:98c1360cb81fb6a42eb47c",
  measurementId: "G-XD0N6DD65B"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;