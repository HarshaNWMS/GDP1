import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHNHnLgsm8HJ9-L4XUmIQ03bumJa3JZEE",
  authDomain: "qrcodescanner-150cc.firebaseapp.com",
  databaseURL: "https://qrcodescanner-150cc-default-rtdb.firebaseio.com",
  projectId: "qrcodescanner-150cc",
  storageBucket: "qrcodescanner-150cc.appspot.com",
  messagingSenderId: "425306294564",
  appId: "1:425306294564:web:c514a419f71dde9fc3cbb1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("Email").value;
    const password = document.getElementById("password").value;
    const auth = getAuth();

    // Check if the email contains "nwmissouri.edu"
    if (!email.includes("nwmissouri.edu")) {
      alert("Please sign in/sign up with your Organization mail");
      return;  // Exit the function if the email is not valid
    }

    // Additional validation to ensure email follows expected pattern
    if (!/^[sS]\d{6}@nwmissouri\.edu$/.test(email) && !/^[a-zA-Z]+@nwmissouri\.edu$/.test(email)) {
      alert("Please sign in/sign up with a valid student or instructor email.");
      return;  // Exit the function if the email does not match any expected pattern
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        alert("Account created successfully. Redirecting to login...");
        // After successful registration, redirect to the login page
        window.location.href = "index.html";  // Redirect to the login page
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
  });
