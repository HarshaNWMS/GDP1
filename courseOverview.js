import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
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
const db = getDatabase();

// Get the courseId from the URL
const queryParams = new URLSearchParams(window.location.search);
const courseId = queryParams.get('courseId');

const courseDetailsDiv = document.getElementById('courseDetails');
const studentList = document.getElementById('studentList');

// Fetch course details from the database
const courseRef = ref(db, 'courses/' + courseId);
get(courseRef).then((snapshot) => {
  if (snapshot.exists()) {
    const course = snapshot.val();
    let studentCount = 0; // Initialize student count to 0

    // Check if there are enrolled students
    if (course.enrolledStudents) {
      // Loop through enrolled students and count only those with the role of 'student'
      course.enrolledStudents.forEach(studentId => {
        const studentRef = ref(db, 'users/' + studentId);
        get(studentRef).then((studentSnapshot) => {
          const student = studentSnapshot.val();
          if (student && student.role === 'student') {
            studentCount++;

            // Add the student to the registered students list
            const listItem = document.createElement('li');
            listItem.textContent = `${student.firstName} ${student.lastName}`;
            studentList.appendChild(listItem);
          }

          // Once all students are processed, calculate remaining seats
          const remainingSeats = course.capacity - studentCount;
          courseDetailsDiv.innerHTML = `
            <h2>${course.title} - Section ${course.section}</h2>
            <p><strong>Instructor:</strong> ${course.instructor}</p>
            <p><strong>Credits:</strong> ${course.credits}</p>
            <p><strong>Capacity:</strong> ${course.capacity}</p>
            <p><strong>Remaining Seats:</strong> ${remainingSeats}</p>
          `;
        });
      });
    } else {
      // No enrolled students, so show full capacity
      courseDetailsDiv.innerHTML = `
        <h2>${course.title} - Section ${course.section}</h2>
        <p><strong>Instructor:</strong> ${course.instructor}</p>
        <p><strong>Credits:</strong> ${course.credits}</p>
        <p><strong>Capacity:</strong> ${course.capacity}</p>
        <p><strong>Remaining Seats:</strong> ${course.capacity}</p>
      `;

      const noStudents = document.createElement('li');
      noStudents.textContent = "No students registered yet.";
      studentList.appendChild(noStudents);
    }
  } else {
    courseDetailsDiv.innerHTML = '<h2>Course not found</h2>';
  }
});

// QR Code generation button navigation
document.getElementById('generateQRBtn').onclick = function () {
  window.location.href = `attendanceQR.html?courseId=${courseId}`;
};

// Back to Dashboard button
document.getElementById('backToDashboard').onclick = function () {
  window.location.href = 'instructor_dashboard.html';
};
