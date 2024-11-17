// Import Firebase functions
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

  let userId;
  let role;

  if (/^admin@nwmissouri\.edu$/.test(email)) {
    userId = "admin";
    role = "admin";
  } else if (/^[sS]\d{6}@nwmissouri\.edu$/.test(email)) {
    userId = email.match(/^[sS]\d{6}/)[0].toLowerCase();
    role = "student";
  } else if (/^[a-zA-Z]+@nwmissouri\.edu$/.test(email)) {
    role = "instructor";
  } else {
    alert("Invalid email format. Use a valid NWMSU email.");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      const uid = auth.currentUser.uid;
      userId = role === "instructor" ? uid : userId;

      set(ref(db, `users/${userId}`), {
        firstName: firstName,
        lastName: lastName,
        email: email,
        role: role,
      }).then(() => {
        alert("User registered successfully!");
        window.location.href = "../HTML/index.html";
      }).catch((error) => {
        console.error("Error adding user to Realtime Database:", error);
      });
    })
    .catch((error) => {
      alert(error.message);
    });
});
