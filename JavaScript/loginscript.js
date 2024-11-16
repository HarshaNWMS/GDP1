// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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

// Function to sanitize email for Firebase-compatible keys
function sanitizeEmail(email) {
  return email.replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

// Function to extract student ID from email
function extractStudentId(email) {
  const match = email.match(/^s\d{6}/i); // Matches 's' followed by 6 digits
  return match ? match[0].toLowerCase() : null;
}

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const role = document.getElementById("role").value;
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("error-message");

  if (!role) {
    errorMessage.textContent = "Please select a role.";
    return;
  }

  // Admin login validation
  if (role === "admin" && email === "admin@nwmissouri.edu") {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        window.location.href = "/HTML/admin_dashboard.html";
      })
      .catch((error) => {
        errorMessage.textContent = error.message;
      });
    return;
  }

  // Student/Instructor login validation
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      let userId;
      if (role === "student") {
        userId = extractStudentId(email); // Extract student ID
      } else if (role === "instructor") {
        userId = sanitizeEmail(email); // Sanitize email for instructor
      }

      if (!userId) {
        errorMessage.textContent = `Invalid email format for ${role}.`;
        return;
      }

      // Use userId to look up user details in the database
      const userRef = ref(db, `users/${userId}`);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();

            // Check if the role matches the user role from the database
            if (role === "student" && userData.role === "student") {
              window.location.href = "/html/student_dashboard.html";
            } else if (role === "instructor" && userData.role === "instructor") {
              window.location.href = "/html/instructor_dashboard.html";
            } else {
              errorMessage.textContent = `Please log in with a valid ${role} email address.`;
            }
          } else {
            errorMessage.textContent = "No user data found!";
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          errorMessage.textContent = "Error fetching user data.";
        });
    })
    .catch((error) => {
      errorMessage.textContent = error.message;
    });
});

// Pre-fill admin login credentials
document.getElementById("adminLogin").addEventListener("click", function (event) {
  event.preventDefault();
  document.getElementById("username").value = "admin@nwmissouri.edu";
  document.getElementById("password").value = "123456";
});
