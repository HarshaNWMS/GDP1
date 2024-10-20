import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

// Firebase configuration
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

let courseToDelete = null; // Store the course to be deleted

// Function to load users from Firebase
function loadUsers(instructorID) {
    return new Promise((resolve, reject) => {
        onValue(ref(db, 'users/' + instructorID), (snapshot) => {
            if (snapshot.exists()) {
                const instructorData = snapshot.val();
                const instructorName = instructorData.firstName +" "+instructorData.lastName || 'Unknown Instructor';
                resolve(instructorName);
            } else {
                resolve('Instructor not assigned');
            }
        }, (error) => {
            reject('Error fetching user data: ' + error);
        });
    });
}

// Function to load courses from Firebase
async function loadCourses() {
    const courseTableBody = document.querySelector('#courseTable tbody');
    onValue(ref(db, 'courses/'), async (snapshot) => {
        courseTableBody.innerHTML = ''; // Clear the table
        for (const childSnapshot of snapshot.val() ? Object.entries(snapshot.val()) : []) {
            const course = childSnapshot[1];
            const key = childSnapshot[0];

            try {
                // Fetch instructor name asynchronously
                const instructorName = await loadUsers(course.instructor);

                // Create the row with course and instructor data
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${course.term}</td>
                    <td>${course.crn}</td>
                    <td>${course.subject}</td>
                    <td>${course.course}</td>
                    <td>${course.section}</td>
                    <td>${course.credits}</td>
                    <td>${course.title}</td>
                    <td>${course.days}</td>
                    <td>${course.time}</td>
                    <td>${instructorName}</td>
                    <td>${course.capacity}</td>
                    <td>${course.date}</td>
                    <td>
                        <button onclick="confirmDelete('${key}', '${course.crn}')">Delete</button>
                        <button onclick="redirectToUpdatePage('${key}')">Update</button>
                    </td>
                `;
                courseTableBody.appendChild(row);
            } catch (error) {
                console.error(error);
            }
        }
    });
}

// Function to confirm delete operation
function confirmDelete(crn, courseCRN) {
    courseToDelete = crn; // Store the course CRN to delete
    const confirmPopup = document.getElementById('confirmPopup');
    const confirmPopupMessage = document.getElementById('confirmPopupMessage');
    
    confirmPopupMessage.innerText = `Are you sure you want to delete the course with CRN: ${courseCRN}?`;
    confirmPopup.style.display = 'block'; // Show confirmation popup

    // Attach a click event to the Yes button to proceed with deletion
    document.getElementById('confirmYes').onclick = () => deleteCourse(courseToDelete);
}

// Function to delete the course
function deleteCourse(crn) {
    if (crn) {
        remove(ref(db, 'courses/' + crn))
            .then(() => {
                showPopup('Course deleted successfully!');
                loadCourses(); // Reload courses to update the table
                document.getElementById('confirmPopup').style.display = 'none'; // Hide confirmation popup
            })
            .catch((error) => {
                console.error("Error deleting course: ", error);
            });
    }
}

// Function to redirect to update page
function redirectToUpdatePage(crn) {
    window.location.href = `update_course.html?key=${crn}`; // Use 'key' in the URL
}

// Function to show popup messages
function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popupMessage');
    
    popupMessage.innerText = message;
    popup.style.display = 'block';
    
    setTimeout(() => {
        popup.style.display = 'none'; // Hide after 3 seconds
    }, 3000); // Hide popup after 3 seconds
}

// Expose the confirmDelete function globally
window.confirmDelete = confirmDelete;
window.redirectToUpdatePage = redirectToUpdatePage;

// Load courses on page load
loadCourses();
