// Import the Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Your web app's Firebase configuration
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

// Function to populate instructor dropdown
function loadInstructors() {
    const instructorsRef = ref(db, 'users');
    const instructorSelect = document.getElementById('instructor');
    
    // Fetch all users and filter by role = "instructor"
    get(instructorsRef).then((snapshot) => {
        const users = snapshot.val();
        for (const userId in users) {
            const user = users[userId];
            if (user.role === 'instructor') {
                const option = document.createElement('option');
                option.value = userId; // Store the instructor's UID
                option.textContent = `${user.firstName} ${user.lastName}`;
                instructorSelect.appendChild(option);
            }
        }
    }).catch((error) => {
        console.error("Error fetching instructors: ", error);
    });
}

// Load the instructors when the page loads
loadInstructors();

// Handle form submission
document.querySelector(".course-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form values
    const term = document.getElementById("term").value;
    const crn = document.getElementById("crn").value;
    const department = document.getElementById("department").value;
    const course = document.getElementById("course").value;
    const section = document.getElementById("section").value;
    const credits = document.getElementById("credits").value;
    const title = document.getElementById("title").value;
    const days = document.getElementById("days").value;
    const time = document.getElementById("time").value;
    const instructor = document.getElementById("instructor").value; // Get selected instructor UID
    const capacity = document.getElementById("capacity").value;
    const active = 0; // Starting active students
    const remaining = capacity - active; // Calculate remaining seats
    const date = document.getElementById("date").value;

    // Show the confirmation popup
    document.getElementById("popup").style.display = "block";

    // Add event listener for the Yes button
    document.getElementById("confirmYes").onclick = function() {
        // Write the new course to the database
        set(ref(db, 'courses/' + crn), {
            term: term,
            crn: crn,
            department: department,
            course: course,
            section: section,
            credits: credits,
            title: title,
            days: days,
            time: time,
            instructor: instructor, // Store instructor's UID
            capacity: capacity,
            active: active,
            remaining: remaining,
            date: date
        })
        .then(() => {
            // Close the popup
            document.getElementById("popup").style.display = "none";
            // Redirect to the admin dashboard
            window.location.href = '../HTML/admin_dashboard.html';
        })
        .catch((error) => {
            console.error("Error writing to database:", error);
            document.getElementById("popup").style.display = "none"; // Close the popup on error
        });
    };
});
