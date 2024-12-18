// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHNHnLgsm8HJ9-L4XUmIQ03bumJa3JZEE",
  authDomain: "qrcodescanner-150cc.firebaseapp.com",
  databaseURL: "https://qrcodescanner-150cc-default-rtdb.firebaseio.com",
  projectId: "qrcodescanner-150cc",
  storageBucket: "qrcodescanner-150cc.appspot.com",
  messagingSenderId: "425306294564",
  appId: "1:425306294564:web:c514a419f71dde9fc3cbb1",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth();

function onScanSuccess(decodedText) {
    try {
        const qrData = JSON.parse(decodedText);
        const courseId = qrData.courseId;
        const date = qrData.date;

        auth.onAuthStateChanged((user) => {
            if (user) {
                mapEmailToStudentId(user.email, courseId).then((studentId) => {
                    if (studentId) {
                        markAttendance(courseId, date, studentId);
                    } else {
                        alert("Unable to find your student record.");
                    }
                });
            } else {
                alert("User not logged in.");
            }
        });
    } catch (error) {
        alert("Invalid QR code. Please try again!");
        console.error(error);
    }
}

function mapEmailToStudentId(email, courseId) {
    const usersRef = ref(db, `users`);
    return get(usersRef).then((snapshot) => {
        if (snapshot.exists()) {
            const users = snapshot.val();
            for (const studentId in users) {
                if (users[studentId].email === email) {
                    return studentId; // Return the studentId matching the email
                }
            }
        }
        return null; // Return null if no match found
    });
}

function markAttendance(courseId, date, studentId) {
    const attendanceRef = ref(db, `attendance/${courseId}/${date}/${studentId}`);
    const qrScanTime = new Date();

    get(attendanceRef).then((snapshot) => {
        const data = snapshot.exists() ? snapshot.val() : { present: 0, late: 0, absent: 0, status: "Unmarked" };
        const attendanceStartTime = new Date(`${date}T12:00:00`);
        const timeDifference = (qrScanTime - attendanceStartTime) / 60000;

        if (timeDifference <= 5) {
            data.present += 1;
            data.status = "Present";
        } else {
            data.late += 1;
            data.status = "Late";
        }

        update(attendanceRef, data).then(() => {
            alert(`Attendance marked as ${data.status}`);
        }).catch((error) => {
            alert("Failed to mark attendance.");
            console.error(error);
        });
    }).catch((error) => {
        console.error("Error fetching attendance data:", error);
    });
}

const html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);
