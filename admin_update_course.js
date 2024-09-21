import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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
const db = getDatabase(app);

let courseToDelete = null; // Variable to store the course to be deleted

// Function to load courses from Firebase
function loadCourses() {
    const courseTableBody = document.querySelector('#courseTable tbody');
    onValue(ref(db, 'courses/'), (snapshot) => {
        courseTableBody.innerHTML = ''; // Clear the table
        snapshot.forEach((childSnapshot) => {
            const course = childSnapshot.val();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.crn}</td>
                <td>${course.subject}</td>
                <td>${course.course}</td>
                <td>${course.section}</td>
                <td>${course.credits}</td>
                <td>${course.title}</td>
                <td>
                    <button onclick="updateCourse('${childSnapshot.key}')">Update</button>
                    <button onclick="deleteCourse('${childSnapshot.key}', '${course.crn}')">Delete</button>
                </td>
            `;
            courseTableBody.appendChild(row);
        });
    });
}

// Function to delete a course
function deleteCourse(crn, courseCRN) {
    courseToDelete = crn; // Store the CRN of the course to delete
    document.getElementById('confirmPopup').style.display = 'block'; // Show the confirmation popup
    document.getElementById('confirmPopupMessage').innerText = `Are you sure you want to delete the course with CRN: ${courseCRN}?`; // Show course CRN
}

// Function to confirm deletion
function confirmDelete() {
    if (courseToDelete) {
        remove(ref(db, 'courses/' + courseToDelete))
            .then(() => {
                showPopup('Course deleted successfully!');
                loadCourses(); // Reload courses to update the table
                courseToDelete = null; // Reset the variable
                document.getElementById('confirmPopup').style.display = 'none'; // Hide the confirmation popup
            })
            .catch((error) => {
                console.error("Error deleting course: ", error);
            });
    }
}

// Function to show popup
function showPopup(message) {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popupMessage').innerText = message;
}

// Load courses on page load
loadCourses();
