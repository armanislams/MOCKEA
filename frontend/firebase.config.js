// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyD1s9RhVqlYo18YIk2LEYBrMPIZrN9EA",
  authDomain: "eco-stream-90d55.firebaseapp.com",
  projectId: "eco-stream-90d55",
  storageBucket: "eco-stream-90d55.firebasestorage.app",
  messagingSenderId: "815483653834",
  appId: "1:815483653834:web:6ed02f609b94e267f1ae33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

export default auth