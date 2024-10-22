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

      // Check if user is admin by email
      if (email === 'admin@nwmissouri.edu') {
        window.location.href = "/HTML/admin_dashboard.html";  // Redirect to Admin Dashboard
        return; // Exit the function for admin login
      }

      // Fetch user info from the Realtime Database for non-admin users
      const userRef = ref(db, 'users/' + uid);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log("User data:", userData);

          // Redirect based on user role
          if (userData.role === 'student') {
            window.location.href = "/html/student_dashboard.html";  // Redirect to Student Dashboard
          } else if (userData.role === 'instructor') {
            window.location.href = "/html/instructor_dashboard.html";  // Redirect to Instructor Dashboard
          } else {
            alert("User role not recognized.");
          }
        } else {
          alert("No user data found!");
        }
      }).catch((error) => {
        console.error("Error fetching user data:", error);
      });
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage);
    });
});

// Pre-fill admin login credentials
document.getElementById("adminLogin").addEventListener("click", function (event) {
  event.preventDefault();
  document.getElementById("username").value = "admin@nwmissouri.edu";
  document.getElementById("password").value = "123456";
});
