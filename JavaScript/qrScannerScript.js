// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, update, get } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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

function onScanSuccess(decodedText, decodedResult) {
  try {
    const qrData = JSON.parse(decodedText);
    const courseId = qrData.courseId;
    const date = qrData.date;
    const studentId = "s567078"; // Replace with dynamic student ID retrieval logic

    const attendanceRef = ref(db, `attendance/${courseId}/${date}/${studentId}`);
    get(attendanceRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const attendance = snapshot.val();

          // Adjust counts
          if (attendance.status === "Absent") attendance.absent -= 1;
          if (attendance.status === "Late") attendance.late -= 1;
          if (attendance.status === "Present") attendance.present -= 1;

          attendance.present += 1;
          attendance.status = "Present";

          update(attendanceRef, attendance).then(() => {
            alert("Attendance marked as Present");
          });
        }
      })
      .catch((error) => console.error("Error updating attendance:", error));
  } catch (error) {
    console.error("Invalid QR code data.", error);
  }
}

const html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);
