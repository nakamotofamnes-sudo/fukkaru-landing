// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAqu3ZBDgEeg2KbKramwpb9zEdZb3zVdA",
  authDomain: "fukkaru-app.firebaseapp.com",
  projectId: "fukkaru-app",
  storageBucket: "fukkaru-app.firebasestorage.app",
  messagingSenderId: "609981306575",
  appId: "1:609981306575:web:408a19a0600474f5d2c9ba",
  measurementId: "G-FTGW5VZFE3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);