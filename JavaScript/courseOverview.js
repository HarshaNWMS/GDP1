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

function loadUsers(instructorID) {
  return new Promise((resolve, reject) => {
    get(ref(db, 'users/' + instructorID))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const instructorData = snapshot.val();
          const instructorName = `${instructorData.firstName} ${instructorData.lastName}` || 'Unknown Instructor';
          resolve(instructorName);
        } else {
          resolve('Instructor not assigned');
        }
      })
      .catch((error) => {
        reject('Error fetching user data: ' + error);
      });
  });
}

// Fetch course details from the database
const courseRef = ref(db, 'courses/' + courseId);
get(courseRef).then(async (snapshot) => {
  if (snapshot.exists()) {
    const course = snapshot.val();
    let studentCount = 0; // Initialize student count to 0

    try {
      // Fetch instructor name asynchronously
      const instructorName = await loadUsers(course.instructor);

      // Check if there are enrolled students
      if (course.enrolledStudents) {
        // Loop through enrolled students and count only those with the role of 'student'
        for (const studentId of course.enrolledStudents) {
          const studentRef = ref(db, 'users/' + studentId);
          const studentSnapshot = await get(studentRef);

          if (studentSnapshot.exists()) {
            const student = studentSnapshot.val();
            if (student && student.role === 'student') {
              studentCount++;

              // Add the student to the registered students list
              const listItem = document.createElement('li');
              listItem.textContent = `${student.firstName} ${student.lastName}`;
              studentList.appendChild(listItem);
            }
          }
        }

        // Calculate remaining seats
        const remainingSeats = course.capacity - studentCount;
        courseDetailsDiv.innerHTML = `
          <h2>${course.title} - Section ${course.section}</h2>
          <p><strong>Instructor:</strong> ${instructorName}</p>
          <p><strong>Credits:</strong> ${course.credits}</p>
          <p><strong>Capacity:</strong> ${course.capacity}</p>
          <p><strong>Remaining Seats:</strong> ${remainingSeats}</p>
        `;
      } else {
        // No enrolled students, so show full capacity
        courseDetailsDiv.innerHTML = `
          <h2>${course.title} - Section ${course.section}</h2>
          <p><strong>Instructor:</strong> ${instructorName}</p>
          <p><strong>Credits:</strong> ${course.credits}</p>
          <p><strong>Capacity:</strong> ${course.capacity}</p>
          <p><strong>Remaining Seats:</strong> ${course.capacity}</p>
        `;

        const noStudents = document.createElement('li');
        noStudents.textContent = "No students registered yet.";
        studentList.appendChild(noStudents);
      }
    } catch (error) {
      console.error("Error fetching instructor or students: ", error);
    }
  } else {
    courseDetailsDiv.innerHTML = '<h2>Course not found</h2>';
  }
});

// QR Code generation button navigation
document.getElementById('generateQRBtn').onclick = function () {
  window.location.href = `../HTML/attendanceQR.html?courseId=${courseId}`;
};

// Back to Dashboard button
document.getElementById('backToDashboard').onclick = function () {
  window.location.href = '../HTML/instructor_dashboard.html';
};
