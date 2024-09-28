import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

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
const db = getFirestore();

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // User signed in
      const user = userCredential.user;
      const uid = user.uid;

      // Fetch the user document from Firestore using UID
      const userDocRef = doc(db, "users", uid);

      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log("User data:", userData);

          // Redirect based on the role in Firestore
          if (userData.role === 'student') {
            window.location.href = "student_dashboard.html";  // Redirect to Student Dashboard
          } else if (userData.role === 'instructor') {
            window.location.href = "instructor_dashboard.html";  // Redirect to Instructor Dashboard
          } else {
            alert("Role not recognized. Please contact the administrator.");
          }
        } else {
          console.log("No such user data found in Firestore!");
          alert("User data not found.");
        }
      }).catch((error) => {
        console.error("Error fetching user data:", error);
        alert("Error fetching user data.");
      });
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage);
    });
});

// For admin login
document.getElementById("adminLogin").addEventListener("click", function (event) {
  event.preventDefault();
  document.getElementById("username").value = "admin@nwmissouri.edu";
  document.getElementById("password").value = "123456";
});

function logout() {
  window.location.href = "index.html";
}
