// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import QRCode from "https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js";

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

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

if (!courseId) {
    alert("Course ID not found! Redirecting...");
    window.location.href = "../HTML/instructor_dashboard.html";
}

// Helper function to get today's date in Central Time (UTC-6)
function getCentralTimeDate() {
    const now = new Date();
    const centralOffset = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    const centralTime = new Date(now.getTime() - centralOffset);
    return centralTime.toISOString().split("T")[0]; // Format YYYY-MM-DD
}

document.addEventListener("DOMContentLoaded", () => {
    const qrContainer = document.createElement("canvas");
    document.getElementById("qrImage").replaceWith(qrContainer);

    const today = getCentralTimeDate();
    const qrData = JSON.stringify({ courseId, date: today });

    QRCode.toCanvas(qrContainer, qrData, (error) => {
        if (error) {
            alert("Failed to generate QR Code. Try again!");
            console.error(error);
        }
    });

    const attendanceRef = ref(db, `attendance/${courseId}/${today}`);
    get(attendanceRef).then((snapshot) => {
        if (!snapshot.exists()) {
            initializeAttendance(courseId, today);
        }
    }).catch((error) => {
        alert("Error checking attendance data.");
        console.error(error);
    });
});

// Initialize attendance for all students, carry cumulative values
function initializeAttendance(courseId, date) {
    const enrolledRef = ref(db, `courses/${courseId}/enrolledStudents`);
    const attendanceRef = ref(db, `attendance/${courseId}`);
    get(enrolledRef).then((snapshot) => {
        if (snapshot.exists()) {
            const students = snapshot.val();

            get(attendanceRef).then((attendanceSnapshot) => {
                const cumulativeAttendance = attendanceSnapshot.exists() ? attendanceSnapshot.val() : {};
                const updatedAttendance = {};

                Object.keys(students).forEach((studentId) => {
                    const prevRecord = cumulativeAttendance[studentId] || { present: 0, late: 0, absent: 0 };
                    updatedAttendance[studentId] = {
                        ...prevRecord, // Carry cumulative counts forward
                        status: "Unmarked", // Reset status for the new day
                    };
                });

                set(ref(db, `attendance/${courseId}/${date}`), updatedAttendance).catch((error) => {
                    alert("Failed to initialize attendance.");
                    console.error(error);
                });
            });
        } else {
            alert("No enrolled students found.");
        }
    }).catch((error) => {
        alert("Error fetching enrolled students.");
        console.error(error);
    });
}
