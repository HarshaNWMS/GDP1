// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
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

// Extract course ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

if (!courseId) {
    alert("No course selected! Redirecting...");
    window.location.href = "../HTML/instructor_dashboard.html";
}

// Helper function for current date
function getCentralTimeDate() {
    const now = new Date();
    return now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
}

auth.onAuthStateChanged((user) => {
    if (user) {
        const today = getCentralTimeDate();
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
            if (newDate <= getCentralTimeDate()) {
                document.getElementById("currentDate").textContent = newDate;
                loadAttendance(courseId, newDate);
            } else {
                alert("You cannot navigate to future dates.");
            }
        });

        // Back to Dashboard
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
                for (const studentId in students) {
                    get(ref(db, `users/${studentId}`)).then((userSnap) => {
                        const user = userSnap.val();

                        // Default attendance record with excused initialized to 0
                        const record = {
                            status: "Unmarked",
                            present: 0,
                            late: 0,
                            absent: 0,
                            excused: 0, // Ensure excused is initialized to 0
                            ...attendance[studentId], // Merge with existing record if available
                        };

                        // Generate table row
                        const row = `
                            <tr>
                                <td>${user.firstName} ${user.lastName}</td>
                                <td>${record.status}</td>
                                <td>${record.present}</td>
                                <td>${record.late}</td>
                                <td>${record.absent}</td>
                                <td>${record.excused}</td>
                                <td>
                                    <select onchange="updateAttendance('${courseId}', '${date}', '${studentId}', this.value)">
                                        <option value="Present" ${record.status === "Present" ? "selected" : ""}>Present</option>
                                        <option value="Late" ${record.status === "Late" ? "selected" : ""}>Late</option>
                                        <option value="Absent" ${record.status === "Absent" ? "selected" : ""}>Absent</option>
                                        <option value="Excused" ${record.status === "Excused" ? "selected" : ""}>Excused</option>
                                    </select>
                                </td>
                            </tr>`;
                        tableBody.innerHTML += row;
                    });
                }
            });
        } else {
            tableBody.innerHTML = "<tr><td colspan='7'>No enrolled students found.</td></tr>";
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
            const data = snapshot.exists()
                ? snapshot.val()
                : { present: 0, late: 0, absent: 0, excused: 0, status: "Unmarked" };

            // Ensure all fields are initialized to valid numbers
            data.present = data.present || 0;
            data.late = data.late || 0;
            data.absent = data.absent || 0;
            data.excused = data.excused || 0;

            const previousStatus = data.status || "Unmarked";

            // Adjust attendance counts based on previous status
            if (previousStatus === "Present") data.present -= 1;
            if (previousStatus === "Late") data.late -= 1;
            if (previousStatus === "Absent") data.absent -= 1;
            if (previousStatus === "Excused") data.excused -= 1;

            // Adjust attendance counts based on new status
            if (newStatus === "Present") data.present += 1;
            if (newStatus === "Late") data.late += 1;
            if (newStatus === "Absent") data.absent += 1;
            if (newStatus === "Excused") data.excused += 1;

            data.status = newStatus; // Update status

            // Update the database
            update(ref(db, attendancePath), data)
                .then(() => {
                    // Reload attendance table for the current date
                    const currentDate = document.getElementById("currentDate").textContent;
                    loadAttendance(courseId, currentDate);
                    alert(`Attendance updated successfully to "${newStatus}".`);
                })
                .catch((error) => {
                    console.error("Error updating attendance:", error);
                });
        })
        .catch((error) => {
            console.error("Error fetching attendance data:", error);
        });
};

// Adjust date (e.g., for Previous/Next Day)
function changeDate(date, delta) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + delta);
    return newDate.toISOString().split("T")[0];
}
