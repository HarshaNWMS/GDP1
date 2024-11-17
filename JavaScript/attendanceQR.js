// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import QRCode from "https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBHNHnLgsm8HJ9-L4XUmIQ03bumJa3JZEE",
    authDomain: "qrcodescanner-150cc.firebaseapp.com",
    databaseURL: "https://qrcodescanner-150cc-default-rtdb.firebaseio.com",
    projectId: "qrcodescanner-150cc",
    storageBucket: "qrcodescanner-150cc.appspot.com",
    messagingSenderId: "425306294564",
    appId: "1:425306294564:web:c514a419f71dde9fc3cbb1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

document.addEventListener("DOMContentLoaded", () => {
  const qrContainer = document.getElementById("qrCodeContainer");
  const today = new Date().toISOString().split("T")[0];

  const qrData = {
    courseId,
    date: today,
  };

  // Generate QR Code
  QRCode.toCanvas(qrContainer, JSON.stringify(qrData), (error) => {
    if (error) console.error(error);
  });

  // Save QR code generation to attendance
  set(ref(db, `attendance/${courseId}/${today}`), {}).catch((error) => {
    console.error("Error saving QR generation:", error);
  });
});
