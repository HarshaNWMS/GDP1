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
  appId: "1:425306294564:web:c514a419f71dde9fc3cbb1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

// Function to extract student ID from email
function extractStudentId(email) {
  const match = email.match(/^[sS]\d{6}/); // Matches 's' followed by 6 digits
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

  // Authenticate the user
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      if (role === "student") {
        const studentId = extractStudentId(email);
        if (!studentId) {
          errorMessage.textContent = "Invalid student email format.";
          return;
        }

        // Lookup student data using student ID
        const studentRef = ref(db, `users/${studentId}`);
        get(studentRef).then((snapshot) => {
          if (snapshot.exists()) {
            const studentData = snapshot.val();
            if (studentData.role === "student") {
              window.location.href = "/html/student_dashboard.html";
            } else {
              errorMessage.textContent = "Invalid role for this email.";
            }
          } else {
            errorMessage.textContent = "Student data not found!";
          }
        }).catch((error) => {
          console.error("Error fetching student data:", error);
          errorMessage.textContent = "Error fetching student data.";
        });
      } else if (role === "instructor") {
        // Lookup instructor data using UID
        const instructorRef = ref(db, `users/${user.uid}`);
        get(instructorRef).then((snapshot) => {
          if (snapshot.exists()) {
            const instructorData = snapshot.val();
            if (instructorData.role === "instructor") {
              window.location.href = "/html/instructor_dashboard.html";
            } else {
              errorMessage.textContent = "Invalid role for this email.";
            }
          } else {
            errorMessage.textContent = "Instructor data not found!";
          }
        }).catch((error) => {
          console.error("Error fetching instructor data:", error);
          errorMessage.textContent = "Error fetching instructor data.";
        });
      } else if (role === "admin") {
        // Check if email belongs to admin
        if (email === "admin@nwmissouri.edu") {
          window.location.href = "/html/admin_dashboard.html";
        } else {
          errorMessage.textContent = "Invalid admin credentials.";
        }
      } else {
        errorMessage.textContent = "Invalid role selected.";
      }
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
