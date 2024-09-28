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

// Fetch instructor's courses and manage enrollment requests
auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;

    // Fetch courses taught by instructor
    const coursesRef = ref(db, 'courses');
    get(coursesRef).then((snapshot) => {
      const courses = snapshot.val();
      const coursesList = document.getElementById('coursesList');

      for (const courseId in courses) {
        const course = courses[courseId];

        if (course.instructor === uid) {
          const listItem = document.createElement('li');
          listItem.textContent = `${course.title} - ${course.section}`;
          coursesList.appendChild(listItem);
        }
      }
    });

    // Fetch student enrollment requests
    const requestsList = document.getElementById('requestsList');
    get(coursesRef).then((snapshot) => {
      const courses = snapshot.val();

      for (const courseId in courses) {
        const course = courses[courseId];

        if (course.instructor === uid && course.pendingRequests) {
          for (const studentId in course.pendingRequests) {
            const listItem = document.createElement('li');
            listItem.textContent = `Student ID: ${studentId} requested enrollment for ${course.title}`;

            // Approve button
            const approveButton = document.createElement('button');
            approveButton.textContent = 'Approve';
            approveButton.onclick = () => approveEnrollment(courseId, studentId);
            listItem.appendChild(approveButton);

            // Reject button
            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.onclick = () => rejectEnrollment(courseId, studentId);
            listItem.appendChild(rejectButton);

            requestsList.appendChild(listItem);
          }
        }
      }
    });
  }
});

// Function to approve student enrollment
function approveEnrollment(courseId, studentId) {
  const courseRef = ref(db, 'courses/' + courseId);
  get(courseRef).then((snapshot) => {
    const course = snapshot.val();
    const updatedEnrolledStudents = course.enrolledStudents || [];
    updatedEnrolledStudents.push(studentId);

    update(courseRef, {
      enrolledStudents: updatedEnrolledStudents,
      [`pendingRequests/${studentId}`]: null
    }).then(() => {
      alert("Enrollment approved!");
    }).catch((error) => {
      console.error("Error approving enrollment:", error);
    });
  });
}

// Function to reject student enrollment
function rejectEnrollment(courseId, studentId) {
  const courseRef = ref(db, 'courses/' + courseId + '/pendingRequests/' + studentId);
  update(courseRef, null).then(() => {
    alert("Enrollment request rejected!");
  }).catch((error) => {
    console.error("Error rejecting enrollment:", error);
  });
}

// Logout function
// Add the logout function to the global window object so it can be accessed from the HTML
window.logout = function() {
    signOut(auth).then(() => {
      window.location.href = "index.html";
    }).catch((error) => {
      console.error("Error logging out:", error);
    });
  };
  