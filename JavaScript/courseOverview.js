import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

// Firebase configuration
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

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

if (!courseId) {
  alert("No course selected. Redirecting to dashboard.");
  window.location.href = "../HTML/instructor_dashboard.html";
}

// Load enrolled students and attendance data
auth.onAuthStateChanged((user) => {
  if (user) {
    loadEnrolledStudentsAndAttendance(courseId);
  } else {
    console.error("No user is signed in.");
    window.location.href = "../HTML/index.html";
  }
});

// Function to load enrolled students and attendance data
function loadEnrolledStudentsAndAttendance(courseId) {
  const today = new Date().toISOString().split("T")[0]; // Default to today's date
  updateAttendanceTable(courseId, today);

  const forwardButton = document.getElementById("forwardButton");
  const backButton = document.getElementById("backButton");

  forwardButton.addEventListener("click", () => {
    const newDate = incrementDate(today, 1);
    updateAttendanceTable(courseId, newDate);
  });

  backButton.addEventListener("click", () => {
    const newDate = incrementDate(today, -1);
    updateAttendanceTable(courseId, newDate);
  });
}

// Update the attendance table
function updateAttendanceTable(courseId, date) {
  const enrolledRef = ref(db, `courses/${courseId}/enrolledStudents`);
  const attendanceRef = ref(db, `attendance/${courseId}/${date}`);
  const attendanceTable = document.getElementById("attendanceTable");

  // Clear table and set headers
  attendanceTable.innerHTML = `
        <tr>
            <th>Student Name</th>
            <th>Attendance Status</th>
        </tr>
    `;

  // Fetch enrolled students
  get(enrolledRef)
    .then((enrolledSnapshot) => {
      if (enrolledSnapshot.exists()) {
        const enrolledStudents = enrolledSnapshot.val();

        // Fetch attendance data
        get(attendanceRef)
          .then((attendanceSnapshot) => {
            const attendanceData = attendanceSnapshot.exists()
              ? attendanceSnapshot.val()
              : {};

            // Populate table with enrolled students
            for (const studentId in enrolledStudents) {
              // Fetch student's details
              get(ref(db, `users/${studentId}`))
                .then((studentSnapshot) => {
                  if (studentSnapshot.exists()) {
                    const student = studentSnapshot.val();
                    const status = attendanceData[studentId]?.status || "Absent"; // Default to Absent

                    // Create a row for the student
                    const row = document.createElement("tr");
                    row.innerHTML = `
                          <td>${student.firstName} ${student.lastName}</td>
                          <td>${status}</td>
                      `;
                    attendanceTable.appendChild(row);
                  }
                })
                .catch((error) => {
                  console.error(
                    `Error fetching details for student ${studentId}:`,
                    error
                  );
                });
            }
          })
          .catch((error) => {
            console.error("Error fetching attendance data:", error);
          });
      } else {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="2">No enrolled students for this course.</td>`;
        attendanceTable.appendChild(row);
      }
    })
    .catch((error) => {
      console.error("Error fetching enrolled students:", error);
    });
}

// Increment or decrement the date
function incrementDate(date, days) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate.toISOString().split("T")[0];
}

// Button handlers
document.getElementById("generateQRButton").addEventListener("click", () => {
  window.location.href = `../HTML/attendanceQR.html?courseId=${courseId}`;
});

document.getElementById("backToDashboardButton").addEventListener("click", () => {
  window.location.href = "../HTML/instructor_dashboard.html";
});
