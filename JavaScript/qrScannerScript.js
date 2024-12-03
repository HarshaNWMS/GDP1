import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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

// Function to handle QR code scanning
function handleQRCodeScan(qrData) {
    const { courseId, date } = JSON.parse(qrData);
    const studentId = "s567078"; // Replace with actual student ID fetched from authentication
    const attendanceRef = ref(db, `attendance/${courseId}/${date}/${studentId}`);

    get(attendanceRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                // Attendance already recorded
                alert("Your attendance has already been posted for today.");
            } else {
                // Calculate and post attendance
                calculateAndPostAttendance(courseId, date, studentId);
            }
        })
        .catch((error) => {
            console.error("Error checking attendance:", error);
        });
}

// Function to calculate attendance
function calculateAndPostAttendance(courseId, date, studentId) {
    const courseRef = ref(db, `courses/${courseId}`);
    const currentTime = new Date();

    get(courseRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const course = snapshot.val();
                const [startTime, endTime] = course.time.split(" - ").map((time) => convertTo24Hour(time.trim()));
                const classStart = new Date(`${date}T${startTime}`);
                const classEnd = new Date(`${date}T${endTime}`);
                const timeDifference = (currentTime - classStart) / 1000 / 60; // Time difference in minutes

                if (currentTime < classStart || currentTime > classEnd) {
                    alert("Attendance cannot be posted outside class timings.");
                    return;
                }

                let attendanceCategory;

                if (timeDifference <= 5) {
                    attendanceCategory = { status: "Present", present: 1, late: 0, absent: 0 };
                } else if (timeDifference > 5 && timeDifference <= 20) {
                    attendanceCategory = { status: "Late", present: 0, late: 1, absent: 0 };
                } else {
                    attendanceCategory = { status: "Absent", present: 0, late: 0, absent: 1 };
                }

                // Post attendance
                postAttendance(courseId, date, studentId, attendanceCategory);
            } else {
                console.error("Course not found!");
            }
        })
        .catch((error) => {
            console.error("Error fetching course details:", error);
        });
}

// Function to post attendance
function postAttendance(courseId, date, studentId, attendanceCategory) {
    const attendanceRef = ref(db, `attendance/${courseId}/${date}/${studentId}`);

    set(attendanceRef, {
        ...attendanceCategory,
        excused: 0, // Default value; excused attendance to be manually updated by instructor
    })
        .then(() => {
            alert(`Attendance posted successfully as ${attendanceCategory.status}.`);
        })
        .catch((error) => {
            console.error("Error posting attendance:", error);
        });
}

// Convert time to 24-hour format
function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
        hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
        hours = 0;
    }

    return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
}
