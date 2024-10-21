import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

// Firebase config
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
const auth = getAuth();
const db = getDatabase();

// Handle registration form submission
document.getElementById("registrationForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const firstName = document.getElementById("Firstname").value;
  const lastName = document.getElementById("Lastname").value;
  const email = document.getElementById("Email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // User signed up successfully
      const user = userCredential.user;
      const uid = user.uid;

      // Define the role based on email
      let role = /^[sS]\d{6}@nwmissouri\.edu$/.test(email) ? "student" : "instructor";

      // Write user data to Realtime Database under 'users' collection
      set(ref(db, 'users/' + uid), {
        firstName: firstName,
        lastName: lastName,
        email: email,
        role: role
      }).then(() => {
        alert("User registered successfully and added to Realtime Database!");
        // Redirect to login page
        window.location.href = "../HTML/login.html";
      }).catch((error) => {
        console.error("Error adding user to Realtime Database:", error);
      });
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage);
    });
});
