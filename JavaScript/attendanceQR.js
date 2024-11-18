// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import QRCode from "https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js";

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

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

document.addEventListener("DOMContentLoaded", () => {
  const qrContainer = document.getElementById("qrImage");
  const today = new Date().toLocaleDateString("en-CA"); // Format: YYYY-MM-DD

  // Generate QR Code Data
  const qrData = JSON.stringify({ courseId, date: today });

  // Generate QR Code
  QRCode.toCanvas(qrContainer, qrData, (error) => {
    if (error) console.error(error);
  });

  // Initialize attendance for all enrolled students
  const enrolledRef = ref(db, `courses/${courseId}/enrolledStudents`);
  get(enrolledRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const enrolledStudents = snapshot.val();
        const attendanceUpdates = {};

        for (const studentId in enrolledStudents) {
          attendanceUpdates[studentId] = {
            status: "Absent", // Default status is "Absent"
            present: 0,
            late: 0,
            absent: 1, // Set to 1 by default for all students
          };
        }

        // Save initial attendance records
        set(ref(db, `attendance/${courseId}/${today}`), attendanceUpdates).catch((error) => {
          console.error("Error saving attendance records:", error);
        });
      } else {
        console.error("No enrolled students found for this course.");
      }
    })
    .catch((error) => {
      console.error("Error fetching enrolled students:", error);
    });
});
