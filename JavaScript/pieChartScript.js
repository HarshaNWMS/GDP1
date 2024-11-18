import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
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
const db = getDatabase();

const courseId = "10323"; // Replace with dynamic course ID if needed
const studentId = "s567078"; // Replace with dynamic student ID
const courseStartDate = new Date("2024-11-15"); // Example course start date

window.onload = async function () {
    const ctx = document.getElementById('attendanceChart').getContext('2d');

    // Fetch attendance data
    const attendanceData = await fetchAttendanceData(courseId, studentId);

    if (!attendanceData) {
        document.getElementById("progressMessage").textContent = "No attendance data available.";
        return;
    }

    // Generate pie chart
    const chartData = [
        attendanceData.totalPresent,
        attendanceData.totalAbsent,
        attendanceData.totalLate,
    ];

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Present Days', 'Absent Days', 'Late Days'],
            datasets: [{
                data: chartData,
                backgroundColor: ['#4caf50', '#f44336', '#ffeb3b'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                },
            }
        }
    });

    // Populate the table
    populateAttendanceTable(attendanceData.attendanceRecords);
};

async function fetchAttendanceData(courseId, studentId) {
    const attendanceRef = ref(db, `attendance/${courseId}`);
    const snapshot = await get(attendanceRef);

    if (!snapshot.exists()) return null;

    const attendance = snapshot.val();
    const records = [];
    let totalPresent = 0, totalAbsent = 0, totalLate = 0;

    for (const date in attendance) {
        const studentAttendance = attendance[date][studentId];
        const currentDate = new Date(date);

        // Skip dates before the course start date
        if (currentDate < courseStartDate) continue;

        if (studentAttendance) {
            const status = studentAttendance.status;
            totalPresent += studentAttendance.present || 0;
            totalAbsent += studentAttendance.absent || 0;
            totalLate += studentAttendance.late || 0;

            // Include only "Absent" and "Late" records
            if (status === "Absent" || status === "Late") {
                records.push({
                    date,
                    day: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
                    status,
                    percentage: calculatePercentage(status),
                });
            }
        }
    }

    return { attendanceRecords: records, totalPresent, totalAbsent, totalLate };
}

function calculatePercentage(status) {
    if (status === "Present") return "100%";
    if (status === "Late") return "80%";
    return "0%";
}

function populateAttendanceTable(records) {
    const tableBody = document.querySelector("#attendanceTable tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    records.forEach(record => {
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

document.getElementById('backToDashboard').onclick = function () {
    window.location.href = '../HTML/student_dashboard.html';
};
