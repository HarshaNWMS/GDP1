import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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
let countdown;

// Fetch course title and set it
const courseRef = ref(db, 'courses/' + courseId);
get(courseRef).then((snapshot) => {
    if (snapshot.exists()) {
        const course = snapshot.val();
        courseTitleElement.textContent = `Course: ${course.title} - Section ${course.section}`;
    } else {
        courseTitleElement.textContent = 'Course not found';
    }
});

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
function generateQRCode(text) {
    QRCode.toDataURL(text, { width: 200, height: 200 }, (err, url) => {
        if (err) return console.error(err);
        qrImg.src = url;
        wrapper.classList.add("active"); // Show the QR code
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

// Update timer display initially based on selected dropdown value
timerSelect.addEventListener("change", function () {
    const initialDuration = parseInt(timerSelect.value);
    updateTimeDisplay(initialDuration);
});

// Initialize timer display with the default value
updateTimeDisplay(parseInt(timerSelect.value));
