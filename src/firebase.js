// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZ2maEb62SAO2l2OeEfsULUjlT0bvNa4A",
  authDomain: "hgt-attendance.firebaseapp.com",
  projectId: "hgt-attendance",
  storageBucket: "hgt-attendance.firebasestorage.app",
  messagingSenderId: "981189585778",
  appId: "1:981189585778:web:165c0fc5fdd516e6878beb",
  measurementId: "G-DZZWRFBTPP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);