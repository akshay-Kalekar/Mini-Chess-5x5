// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD76lHwE3CbpFhnl7fFxKt8uJXzmDFWPMk",
  authDomain: "minichess-aeead.firebaseapp.com",
  databaseURL: "https://minichess-aeead-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "minichess-aeead",
  storageBucket: "minichess-aeead.appspot.com",
  messagingSenderId: "837796339599",
  appId: "1:837796339599:web:7a8ff95b5aaf32388d75fa",
  measurementId: "G-H9587ZYY81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export {database};