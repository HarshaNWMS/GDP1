import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
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
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Redirect logic based on the user's email pattern
        if (/^[sS]\d{6}@nwmissouri\.edu$/.test(email)) {
          // Student email pattern (S followed by 6 digits)
          window.location.href = "student_dashboard.html";
        } else if (/^[a-zA-Z]+@nwmissouri\.edu$/.test(email)) {
          // Instructor email pattern (name@nwmissouri.edu)
          window.location.href = "instructor_dashboard.html";
        } else {
          alert("Unauthorized access. Please use a valid student or instructor email.");
        }
      })
      .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
      });
  });

document
  .getElementById("instructorLogin")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("username").value = "instructor@nwmissouri.edu";
    document.getElementById("password").value = "123456";
  });

function logout() {
  window.location.href = "index.html";
}
