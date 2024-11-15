// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
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

// Function to extract student ID from email
function extractStudentId(email) {
  const match = email.match(/^s\d{6}/i);  // Matches 's' followed by 6 digits
  return match ? match[0].toLowerCase() : null;
}

// Fetch and display student's name and enrolled courses
auth.onAuthStateChanged((user) => {
  if (user) {
    const email = user.email;
    const studentId = extractStudentId(email);

    if (!studentId) {
      console.error("Invalid email format. Unable to extract student ID.");
      return;
    }

    const userRef = ref(db, 'users/' + studentId);

    // Fetch student's name
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const studentName = userData.firstName || "Student";
        document.getElementById('dashboardTitle').textContent = `${studentName}'s Dashboard`;
        document.getElementById('welcomeMessage').textContent = `Welcome, ${studentName}!`;

        // Fetch enrolled courses
        const enrolledCoursesRef = ref(db, `users/${studentId}/enrolledCourses`);
        get(enrolledCoursesRef).then((snapshot) => {
          const enrolledCourses = snapshot.val();
          if (enrolledCourses) {
            displayEnrolledCourses(Object.keys(enrolledCourses)); // Pass course IDs as an array
          } else {
            document.getElementById('enrolledCourses').innerHTML = "<p>No enrolled courses found.</p>";
          }
        }).catch((error) => {
          console.error("Error fetching enrolled courses:", error);
        });
      } else {
        console.error("No user data found for this student ID.");
      }
    }).catch((error) => {
      console.error("Error fetching user data:", error);
    });
  } else {
    console.error("User is not logged in.");
  }
});

// Function to display enrolled courses
function displayEnrolledCourses(courseIds) {
  const enrolledCoursesDiv = document.getElementById('enrolledCourses');
  enrolledCoursesDiv.innerHTML = '';

  courseIds.forEach(courseId => {
    const courseRef = ref(db, `courses/${courseId}`);
    get(courseRef).then((snapshot) => {
      const course = snapshot.val();
      if (course) {
        const card = document.createElement('div');
        card.classList.add('course-container');

        const courseTextContainer = document.createElement('div');
        courseTextContainer.classList.add('course-text-container');

        const courseTitle = document.createElement('h3');
        courseTitle.textContent = `${course.title} - ${course.section}`;
        courseTextContainer.appendChild(courseTitle);

        const termLabel = document.createElement('p');
        termLabel.textContent = `Term: ${course.term}`;
        courseTextContainer.appendChild(termLabel);

        const deptLabel = document.createElement('p');
        deptLabel.textContent = `Department: CS-${course.subject}`;
        courseTextContainer.appendChild(deptLabel);

        const trackButton = document.createElement('button');
        trackButton.textContent = 'Track Attendance';
        trackButton.classList.add('track-btn');
        trackButton.onclick = () => trackAttendance(course.title);
        card.appendChild(courseTextContainer);
        card.appendChild(trackButton);

        enrolledCoursesDiv.appendChild(card);
      }
    }).catch((error) => {
      console.error(`Error fetching course data for course ID ${courseId}:`, error);
    });
  });
}

// Track attendance function
function trackAttendance(courseTitle) {
  alert(`Tracking attendance for: ${courseTitle}`);
  window.location.href = '../HTML/pieChart.html';
}

// Logout function
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "../HTML/index.html";
  }).catch((error) => {
    console.error("Error logging out:", error);
  });
};

// Scan QR function
window.scanQR = function() {
  window.location.href = "../HTML/qrScanner.html";
};
