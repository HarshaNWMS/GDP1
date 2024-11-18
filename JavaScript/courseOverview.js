import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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

// Get courseId from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

if (!courseId) {
  alert("No course selected. Redirecting to dashboard.");
  window.location.href = "../HTML/instructor_dashboard.html";
}

// Listen for auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("currentDate").textContent = today;
    loadAttendance(courseId, today);

    // Navigation buttons
    document.getElementById("backButton").addEventListener("click", () => {
      const currentDate = document.getElementById("currentDate").textContent;
      const newDate = changeDate(currentDate, -1);
      document.getElementById("currentDate").textContent = newDate;
      loadAttendance(courseId, newDate);
    });

    document.getElementById("forwardButton").addEventListener("click", () => {
      const currentDate = document.getElementById("currentDate").textContent;
      const newDate = changeDate(currentDate, 1);
      if (newDate <= new Date().toISOString().split("T")[0]) {
        document.getElementById("currentDate").textContent = newDate;
        loadAttendance(courseId, newDate);
      } else {
        alert("You cannot navigate to future dates.");
      }
    });

    // Generate QR Button
    document.getElementById("generateQRButton").addEventListener("click", () => {
      window.location.href = `../HTML/attendanceQR.html?courseId=${courseId}`;
    });

    // Back to Dashboard Button
    document.getElementById("backToDashboardButton").addEventListener("click", () => {
      window.location.href = "../HTML/instructor_dashboard.html";
    });
  } else {
    console.error("No user is signed in.");
    window.location.href = "../HTML/index.html";
  }
});

// Load attendance data
function loadAttendance(courseId, date) {
  const enrolledRef = ref(db, `courses/${courseId}/enrolledStudents`);
  const attendanceRef = ref(db, `attendance/${courseId}/${date}`);
  const tableBody = document.querySelector("#attendanceTable tbody");

  tableBody.innerHTML = "";

  get(enrolledRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const students = snapshot.val();
        get(attendanceRef).then((attendanceSnap) => {
          const attendance = attendanceSnap.exists() ? attendanceSnap.val() : {};
          for (const studentId in students) {
            get(ref(db, `users/${studentId}`)).then((userSnap) => {
              const user = userSnap.val();
              const status = attendance[studentId]?.status || "Yet to Take";
              const present = attendance[studentId]?.present || 0;
              const late = attendance[studentId]?.late || 0;
              const absent = attendance[studentId]?.absent || 0;

              const row = `
                <tr>
                  <td>${user.firstName} ${user.lastName}</td>
                  <td>${status}</td>
                  <td>${present}</td>
                  <td>${late}</td>
                  <td>${absent}</td>
                  <td>
                    <select id="attendanceSelect_${studentId}" name="attendanceSelect_${studentId}" onchange="updateAttendance('${courseId}', '${date}', '${studentId}', this.value)">
                      <option value="Present" ${status === "Present" ? "selected" : ""}>Present</option>
                      <option value="Late" ${status === "Late" ? "selected" : ""}>Late</option>
                      <option value="Absent" ${status === "Absent" ? "selected" : ""}>Absent</option>
                    </select>
                  </td>
                </tr>`;
              tableBody.innerHTML += row;
            });
          }
        });
      }
    })
    .catch((error) => console.error("Error loading attendance data:", error));
}

// Update attendance logic
window.updateAttendance = (courseId, date, studentId, newStatus) => {
  const attendancePath = `attendance/${courseId}/${date}/${studentId}`;
  get(ref(db, attendancePath))
    .then((snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : { present: 0, late: 0, absent: 0 };
      const previousStatus = data.status || "Yet to Take";

      // Decrement previous status
      if (previousStatus === "Present") {
        data.present = (data.present || 1) - 1;
      } else if (previousStatus === "Late") {
        data.late = (data.late || 1) - 1;
      } else if (previousStatus === "Absent") {
        data.absent = (data.absent || 1) - 1;
      }

      // Increment new status
      if (newStatus === "Present") {
        data.present = (data.present || 0) + 1;
      } else if (newStatus === "Late") {
        data.late = (data.late || 0) + 1;
      } else if (newStatus === "Absent") {
        data.absent = (data.absent || 0) + 1;
      }

      data.status = newStatus;

      // Save updated data
      update(ref(db, attendancePath), data)
        .then(() => {
          alert("Attendance updated successfully");
          const currentDate = document.getElementById("currentDate").textContent;
          loadAttendance(courseId, currentDate);
        })
        .catch((error) => console.error("Error updating attendance:", error));
    })
    .catch((error) => console.error("Error fetching attendance data:", error));
};

// Date navigation logic
function changeDate(date, delta) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + delta);
  return newDate.toISOString().split("T")[0];
}
