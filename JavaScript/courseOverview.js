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

// Initialize Firebase
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

        // Previous Day Button
        document.getElementById("backButton").addEventListener("click", () => {
            const currentDate = document.getElementById("currentDate").textContent;
            const newDate = changeDate(currentDate, -1);
            document.getElementById("currentDate").textContent = newDate;
            loadAttendance(courseId, newDate);
        });

        // Next Day Button
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

    tableBody.innerHTML = ""; // Clear existing table rows

    get(enrolledRef).then((snapshot) => {
        if (snapshot.exists()) {
            const students = snapshot.val();
            get(attendanceRef).then((attendanceSnap) => {
                const attendance = attendanceSnap.exists() ? attendanceSnap.val() : {};
                const currentTime = new Date();

                for (const studentId in students) {
                    get(ref(db, `users/${studentId}`)).then((userSnap) => {
                        const user = userSnap.val();

                        // Default attendance record
                        const record = attendance[studentId] || { status: "Unmarked", present: 0, late: 0, absent: 0 };

                        // Automatically mark unscanned students as Absent after 20 minutes from class start
                        const classStartTime = new Date(`${date}T12:00:00`); // Class starts at 12:00 PM
                        const gracePeriod = 20 * 60 * 1000; // 20 minutes in milliseconds
                        if (currentTime - classStartTime > gracePeriod && record.status === "Unmarked") {
                            record.status = "Absent";
                            record.absent += 1; // Increment cumulative absent count
                            update(ref(db, `attendance/${courseId}/${date}/${studentId}`), record).catch(console.error);
                        }

                        // Generate table row
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
        } else {
            alert("No enrolled students found.");
        }
    }).catch((error) => {
        alert("Failed to load attendance data.");
        console.error(error);
    });
}

// Update attendance manually
window.updateAttendance = (courseId, date, studentId, newStatus) => {
    const attendancePath = `attendance/${courseId}/${date}/${studentId}`;
    get(ref(db, attendancePath))
        .then((snapshot) => {
            const data = snapshot.exists() ? snapshot.val() : { present: 0, late: 0, absent: 0 };
            const previousStatus = data.status || "Unmarked";

            // Adjust attendance counts
            if (previousStatus === "Present") {
                data.present -= 1;
            } else if (previousStatus === "Late") {
                data.late -= 1;
            } else if (previousStatus === "Absent") {
                data.absent -= 1;
            }

            if (newStatus === "Present") {
                data.present += 1;
            } else if (newStatus === "Late") {
                data.late += 1;
            } else if (newStatus === "Absent") {
                data.absent += 1; // Increment absent if manually set
            }

            data.status = newStatus;

            // Save updated data
            update(ref(db, attendancePath), data)
                .then(() => {
                    alert("Attendance updated successfully.");
                    const currentDate = document.getElementById("currentDate").textContent;
                    loadAttendance(courseId, currentDate);
                })
                .catch((error) => console.error("Error updating attendance:", error));
        })
        .catch((error) => console.error("Error fetching attendance data:", error));
};

// Adjust date (e.g., for Previous/Next Day)
function changeDate(date, delta) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + delta);
    return newDate.toISOString().split("T")[0];
}
