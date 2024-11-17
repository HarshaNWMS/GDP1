import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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

// Get courseId from URL
const queryParams = new URLSearchParams(window.location.search);
const courseId = queryParams.get('courseId');

// Get elements
const wrapper = document.querySelector(".wrapper");
const generateBtn = document.getElementById("generateBtn");
const stopBtn = document.getElementById("stopBtn");
const qrImg = document.getElementById("qrImage");
const timerElement = document.getElementById('timer');
const courseTitleElement = document.getElementById('courseTitle');
const timerSelect = document.getElementById("timerSelect");
const backToCourseOverview = document.getElementById("backToCourseOverview");

let countdown;

// Fetch course title and enrolled students
if (courseId) {
    const courseRef = ref(db, 'courses/' + courseId);
    get(courseRef).then((snapshot) => {
        if (snapshot.exists()) {
            const course = snapshot.val();
            courseTitleElement.textContent = `Course: ${course.title} - Section ${course.section}`;

            // Load enrolled students
            loadEnrolledStudents(courseId);
        } else {
            courseTitleElement.textContent = 'Course not found';
        }
    }).catch((error) => {
        console.error("Error fetching course:", error);
    });
} else {
    alert("Course ID not found. Redirecting...");
    window.location.href = "../HTML/instructor_dashboard.html";
}

// Handle QR code generation
generateBtn.addEventListener("click", () => {
    if (!courseId) return;
    generateBtn.innerText = "Generating QR Code...";
    
    const selectedDuration = parseInt(timerSelect.value); // Get selected timer value in seconds
    generateQRCode(courseId); // Generate QR code with courseId as content
    startTimer(selectedDuration); // Start timer with selected duration
    
    generateBtn.innerText = "Generate QR Code";
});

// Stop button functionality
stopBtn.addEventListener("click", () => {
    resetTimerAndQRCode(); // Reset the timer and QR code
});

// Generate the QR code with specified text
function generateQRCode(courseId) {
    const today = new Date().toISOString().split("T")[0]; // Get today's date
    const qrData = JSON.stringify({ courseId, date: today }); // Include courseId and date

    QRCode.toDataURL(qrData, { width: 200, height: 200 }, (err, url) => {
        if (err) return console.error(err);
        qrImg.src = url;
        wrapper.classList.add("active"); // Show the QR code
    });

    // Optionally save the QR data to Firebase
    const qrRef = ref(db, `attendanceQR/${courseId}/${today}`);
    set(qrRef, { qrData, generatedAt: Date.now() }).catch((err) => console.error(err));
}

// Load enrolled students for the course
function loadEnrolledStudents(courseId) {
    const enrolledRef = ref(db, `courses/${courseId}/enrolledStudents`);
    get(enrolledRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const students = snapshot.val();
                console.log("Enrolled Students:", students);
                // Populate your table or handle the student list
            } else {
                console.log("No enrolled students found for this course.");
            }
        })
        .catch((error) => {
            console.error("Error loading enrolled students:", error);
        });
}

// Start countdown timer
function startTimer(duration) {
    clearInterval(countdown); // Clear any existing timer
    let time = duration;
    updateTimeDisplay(time); // Display the initial time

    countdown = setInterval(function () {
        time--;
        updateTimeDisplay(time); // Update timer display every second

        if (time <= 0) {
            clearInterval(countdown); // Stop the timer when it reaches 00:00
            resetTimerAndQRCode(); // Reset the timer and QR code
        }
    }, 1000);
}

// Update timer display
function updateTimeDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerElement.textContent = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

// Reset timer and QR code display
function resetTimerAndQRCode() {
    clearInterval(countdown); // Stop the countdown
    timerElement.textContent = "00:00"; // Reset timer display
    wrapper.classList.remove("active"); // Hide the QR code
    qrImg.src = ""; // Clear the QR code image
}

// Back to Course Overview
backToCourseOverview.addEventListener("click", () => {
    window.location.href = `../HTML/courseOverview.html?courseId=${courseId}`;
});
