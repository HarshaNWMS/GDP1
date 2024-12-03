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
const courseId = queryParams.get("courseId");

// Get elements
const wrapper = document.querySelector(".wrapper");
const generateBtn = document.getElementById("generateBtn");
const stopBtn = document.getElementById("stopBtn");
const qrImg = document.getElementById("qrImage");
const timerElement = document.getElementById("timer");
const courseTitleElement = document.getElementById("courseTitle");
const timerSelect = document.getElementById("timerSelect");
const backToCourseOverview = document.getElementById("backToCourseOverview");

let countdown;

// Fetch course title and validate timing
if (courseId) {
    const courseRef = ref(db, "courses/" + courseId);
    get(courseRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const course = snapshot.val();
                courseTitleElement.textContent = `Course: ${course.title} - Section ${course.section}`;

                if (course.time && course.time.includes(" - ")) {
                    const [startTime, endTime] = course.time.split(" - ");
                    const currentTime = new Date();
                    const start24 = convertTo24Hour(startTime.trim());
                    const end24 = convertTo24Hour(endTime.trim());
                    const current24 = formatCurrentTime(currentTime);

                    if (current24 >= start24 && current24 <= end24) {
                        generateBtn.disabled = false;
                    } else {
                        generateBtn.disabled = true;
                        alert(`QR Code generation is allowed only during class hours (${startTime} - ${endTime}).`);
                    }
                } else {
                    alert("Course time is not properly configured.");
                    generateBtn.disabled = true;
                }
            } else {
                courseTitleElement.textContent = "Course not found";
            }
        })
        .catch((error) => {
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

    const selectedDuration = parseInt(timerSelect.value);
    generateQRCode(courseId);
    startTimer(selectedDuration);

    generateBtn.innerText = "Generate QR Code";
});

// Stop button functionality
stopBtn.addEventListener("click", () => {
    resetTimerAndQRCode();
});

// Generate the QR code
function generateQRCode(courseId) {
    const today = new Date().toISOString().split("T")[0];
    const qrData = JSON.stringify({ courseId, date: today });

    QRCode.toDataURL(qrData, { width: 200, height: 200 }, (err, url) => {
        if (err) return console.error(err);
        qrImg.src = url;
        wrapper.classList.add("active");
    });

    const qrRef = ref(db, `attendanceQR/${courseId}/${today}`);
    set(qrRef, { qrData, generatedAt: Date.now() }).catch((err) => console.error(err));
}

// Convert 12-hour time to 24-hour format
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

// Format current time to 24-hour format
function formatCurrentTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
}

// Start countdown timer
function startTimer(duration) {
    clearInterval(countdown);
    let time = duration;
    updateTimeDisplay(time);

    countdown = setInterval(function () {
        time--;
        updateTimeDisplay(time);

        if (time <= 0) {
            clearInterval(countdown);
            resetTimerAndQRCode();
        }
    }, 1000);
}

// Update timer display
function updateTimeDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerElement.textContent = `${minutes < 10 ? "0" + minutes : minutes}:${
        seconds < 10 ? "0" + seconds : seconds
    }`;
}

// Reset QR code and timer
function resetTimerAndQRCode() {
    clearInterval(countdown);
    timerElement.textContent = "00:00";
    wrapper.classList.remove("active");
    qrImg.src = "";
}

// Back to Course Overview
backToCourseOverview.addEventListener("click", () => {
    window.location.href = `../HTML/instructor_dashboard.html`;
});
