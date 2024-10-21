import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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

// Fetch available courses and enrolled courses for the student
auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;

    // Fetch available courses
    const coursesRef = ref(db, 'courses');
    get(coursesRef).then((snapshot) => {
      const courses = snapshot.val();
      const availableCoursesList = document.getElementById('availableCourses');

      for (const courseId in courses) {
        const course = courses[courseId];
        const listItem = document.createElement('li');
        listItem.textContent = `${course.title} - ${course.section}`;

        // Add button for requesting enrollment
        const enrollButton = document.createElement('button');
        enrollButton.textContent = 'Request Enrollment';
        enrollButton.onclick = () => requestEnrollment(courseId, uid);
        listItem.appendChild(enrollButton);
        availableCoursesList.appendChild(listItem);
      }
    });

    // Fetch enrolled courses for the student
    const enrolledCoursesRef = ref(db, 'users/' + uid + '/enrolledCourses');
    get(enrolledCoursesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const enrolledCourses = snapshot.val();
        const enrolledCoursesList = document.getElementById('enrolledCourses');
        for (const courseId in enrolledCourses) {
          const course = enrolledCourses[courseId];
          const listItem = document.createElement('li');
          listItem.textContent = course;
          enrolledCoursesList.appendChild(listItem);
        }
      }
    });
  }
});

// Function to request enrollment in a course
function requestEnrollment(courseId, uid) {
  const courseRef = ref(db, 'courses/' + courseId + '/pendingRequests');
  update(courseRef, { [uid]: true }).then(() => {
    alert("Enrollment request sent!");
  }).catch((error) => {
    console.error("Error requesting enrollment:", error);
  });
}

// Function to scan QR code
window.scanQR = function() {
  // Redirect to QR scanning page (implement your QR scanning functionality here)
  window.location.href = "../HTML/qrScanner.html";
}

// Logout function
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "../HTML/login.html";
  }).catch((error) => {
    console.error("Error logging out:", error);
  });
};
