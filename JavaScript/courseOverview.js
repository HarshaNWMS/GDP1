// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHNHnLgsm8HJ9-L4XUmIQ03bumJa3JZEE",
  authDomain: "qrcodescanner-150cc.firebaseapp.com",
  databaseURL: "https://qrcodescanner-150cc-default-rtdb.firebaseio.com",
  projectId: "qrcodescanner-150cc",
  storageBucket: "qrcodescanner-150cc.appspot.com",
  messagingSenderId: "425306294564",
  appId: "1:425306294564:web:c514a419f71dde9fc3cbb1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

if (!courseId) {
    alert("No course selected! Redirecting...");
    window.location.href = "../HTML/instructor_dashboard.html";
}

// Helper function for Central Time
function getCentralTimeDate() {
    const now = new Date();
    const centralOffset = 6 * 60 * 60 * 1000; // 6 hours
    const centralTime = new Date(now.getTime() - centralOffset);
    return centralTime.toISOString().split("T")[0];
}

auth.onAuthStateChanged((user) => {
    if (user) {
        const today = getCentralTimeDate();
        document.getElementById("currentDate").textContent = today;
        loadAttendance(courseId, today);

        document.getElementById("backButton").addEventListener("click", () => {
            const currentDate = document.getElementById("currentDate").textContent;
            const newDate = changeDate(currentDate, -1);
            document.getElementById("currentDate").textContent = newDate;
            loadAttendance(courseId, newDate);
        });

        document.getElementById("forwardButton").addEventListener("click", () => {
            const currentDate = document.getElementById("currentDate").textContent;
            const newDate = changeDate(currentDate, 1);
            if (newDate <= getCentralTimeDate()) {
                document.getElementById("currentDate").textContent = newDate;
                loadAttendance(courseId, newDate);
            } else {
                alert("You cannot navigate to future dates.");
            }
        });

        document.getElementById("generateQRButton").addEventListener("click", () => {
            // Ensure courseId exists and redirect to QR page
            if (courseId) {
                window.location.href = `../HTML/attendanceQR.html?courseId=${courseId}`;
            } else {
                alert("No course selected! Cannot generate QR.");
            }
        });

        document.getElementById("backToDashboardButton").addEventListener("click", () => {
            window.location.href = "../HTML/instructor_dashboard.html";
        });
    }
});

function loadAttendance(courseId, date) {
    const enrolledRef = ref(db, `courses/${courseId}/enrolledStudents`);
    const attendanceRef = ref(db, `attendance/${courseId}/${date}`);
    const tableBody = document.querySelector("#attendanceTable tbody");

    tableBody.innerHTML = "";

    get(enrolledRef).then((snapshot) => {
        if (snapshot.exists()) {
            const students = snapshot.val();
            get(attendanceRef).then((attendanceSnap) => {
                const attendance = attendanceSnap.exists() ? attendanceSnap.val() : {};

                for (const studentId in students) {
                    get(ref(db, `users/${studentId}`)).then((userSnap) => {
                        const user = userSnap.val();

                        const record = attendance[studentId] || { present: 0, late: 0, absent: 0, status: "Absent" };
                        if (!attendance[studentId]) {
                            record.absent += 1;
                            update(ref(db, `attendance/${courseId}/${date}/${studentId}`), record).catch(console.error);
                        }

                        const row = `
                            <tr>
                                <td>${user.firstName} ${user.lastName}</td>
                                <td>${record.status}</td>
                                <td>${record.present}</td>
                                <td>${record.late}</td>
                                <td>${record.absent}</td>
                                <td>
                                    <select onchange="updateAttendance('${courseId}', '${date}', '${studentId}', this.value)">
                                        <option value="Present" ${record.status === "Present" ? "selected" : ""}>Present</option>
                                        <option value="Late" ${record.status === "Late" ? "selected" : ""}>Late</option>
                                        <option value="Absent" ${record.status === "Absent" ? "selected" : ""}>Absent</option>
                                    </select>
                                </td>
                            </tr>`;
                        tableBody.innerHTML += row;
                    });
                }
            });
        }
    }).catch(console.error);
}

function changeDate(date, delta) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + delta);
    return newDate.toISOString().split("T")[0];
}
