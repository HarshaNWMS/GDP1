import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

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
const db = getDatabase();
const auth = getAuth();

window.onload = async function () {
    const ctx = document.getElementById("attendanceChart").getContext("2d");
    const courseId = new URLSearchParams(window.location.search).get("courseId");

    if (!courseId) {
        document.getElementById("progressMessage").textContent = "Invalid course ID.";
        return;
    }

    const user = await fetchLoggedInUserByEmail();
    if (!user) {
        document.getElementById("progressMessage").textContent = "Failed to fetch user details. Please log in.";
        return;
    }

    const studentId = user.studentId;
    const courseStartDate = await fetchCourseStartDate(courseId);

    if (!courseStartDate) {
        document.getElementById("progressMessage").textContent = "Failed to fetch course details.";
        return;
    }

    const attendanceData = await fetchAttendanceData(courseId, studentId, courseStartDate);

    if (!attendanceData) {
        document.getElementById("progressMessage").textContent = "No attendance data available.";
        return;
    }

    generatePieChart(ctx, attendanceData);
    populateAttendanceTable(attendanceData.tableRecords);

    // Add functionality for Back to Dashboard button
    document.getElementById("backToDashboard").addEventListener("click", function () {
        window.location.href = "../HTML/student_dashboard.html"; // Replace with your actual dashboard path
    });
};

// Fetch logged-in user details by email
async function fetchLoggedInUserByEmail() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const email = user.email;
                const usersRef = ref(db, `users`);
                const snapshot = await get(usersRef);
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    for (const studentId in users) {
                        if (users[studentId].email === email) {
                            resolve({ ...users[studentId], studentId });
                            return;
                        }
                    }
                }
                resolve(null);
            } else {
                resolve(null);
            }
        });
    });
}

// Fetch course start date from Firebase
async function fetchCourseStartDate(courseId) {
    const courseRef = ref(db, `courses/${courseId}`);
    const snapshot = await get(courseRef);
    return snapshot.exists() ? new Date(snapshot.val().date) : null;
}

// Fetch attendance data
async function fetchAttendanceData(courseId, studentId, courseStartDate) {
    const attendanceRef = ref(db, `attendance/${courseId}`);
    const snapshot = await get(attendanceRef);

    if (!snapshot.exists()) return null;

    const attendance = snapshot.val();
    const tableRecords = [];
    let totalPresent = 0,
        totalAbsent = 0,
        totalLate = 0;

    for (const date in attendance) {
        const studentAttendance = attendance[date][studentId];
        if (!studentAttendance) continue;

        const status = studentAttendance.status;
        totalPresent += studentAttendance.present || 0;
        totalAbsent += studentAttendance.absent || 0;
        totalLate += studentAttendance.late || 0;

        if (status === "Absent" || status === "Late") {
            tableRecords.push({
                date,
                day: new Date(date).toLocaleDateString("en-US", { weekday: "long" }),
                status,
                percentage: calculatePercentage(status),
            });
        }
    }

    return { tableRecords, totalPresent, totalAbsent, totalLate };
}

// Generate the pie chart
function generatePieChart(ctx, attendanceData) {
    const chartData = [
        attendanceData.totalPresent,
        attendanceData.totalAbsent,
        attendanceData.totalLate,
    ];

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Present Days", "Absent Days", "Late Days"],
            datasets: [
                {
                    data: chartData,
                    backgroundColor: ["#4caf50", "#f44336", "#ffeb3b"],
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                },
            },
        },
    });
}

// Populate the attendance table
function populateAttendanceTable(records) {
    const tableBody = document.querySelector("#attendanceTable tbody");
    tableBody.innerHTML = "";

    records.forEach((record) => {
        const row = `
            <tr>
                <td>${record.date}</td>
                <td>${record.day}</td>
                <td>${record.status}</td>
                <td>${record.percentage}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Calculate attendance percentage
function calculatePercentage(status) {
    if (status === "Present") return "100%";
    if (status === "Late") return "80%";
    return "0%";
}
