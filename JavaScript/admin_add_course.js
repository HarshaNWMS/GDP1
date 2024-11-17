// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

// Function to load instructors dynamically into the dropdown
function loadInstructors() {
    const instructorsRef = ref(db, "users");
    const instructorSelect = document.getElementById("instructor");
    
    get(instructorsRef).then(snapshot => {
        const users = snapshot.val();
        for (const userId in users) {
            const user = users[userId];
            if (user.role === "instructor") {
                const option = document.createElement("option");
                option.value = userId; // Use userId as the value
                option.textContent = `${user.firstName} ${user.lastName}`;
                instructorSelect.appendChild(option);
            }
        }
    }).catch(error => {
        console.error("Error fetching instructors:", error);
    });
}

// Call loadInstructors on page load
loadInstructors();

// Handle form submission
document.querySelector(".course-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default submission behavior

    const term = document.getElementById("term").value.trim();
    const crn = document.getElementById("crn").value.trim();
    const department = document.getElementById("department").value.trim();
    const course = document.getElementById("course").value.trim();
    const section = document.getElementById("section").value.trim();
    const credits = document.getElementById("credits").value.trim();
    const title = document.getElementById("title").value.trim();
    const time = document.getElementById("time").value.trim();
    const instructor = document.getElementById("instructor").value.trim();
    const capacity = document.getElementById("capacity").value.trim();
    const date = document.getElementById("date").value.trim();

    // Collect checked days
    const dayCheckboxes = document.querySelectorAll("#days input[type=checkbox]:checked");
    const days = Array.from(dayCheckboxes).map(checkbox => checkbox.value);

    // Validate form fields
    if (!term || !crn || !department || !course || !section || !credits || !title || !days.length || !time || !instructor || !capacity || !date) {
        alert("All fields are required. Please fill out the form completely.");
        return;
    }

    // Show confirmation popup
    document.getElementById("popup").style.display = "block";

    // Add event listener for the Yes button in the popup
    document.getElementById("confirmYes").onclick = function() {
        set(ref(db, "courses/" + crn), {
            term,
            crn,
            department,
            course,
            section,
            credits,
            title,
            days,
            time,
            instructor,
            capacity: parseInt(capacity),
            active: 0,
            remaining: parseInt(capacity),
            date
        })
        .then(() => {
            // Close popup and redirect
            document.getElementById("popup").style.display = "none";
            alert("Course added successfully!");
            window.location.href = "../HTML/admin_dashboard.html";
        })
        .catch(error => {
            console.error("Error saving course:", error);
            alert("An error occurred while saving the course. Please try again.");
            document.getElementById("popup").style.display = "none";
        });
    };

    // Add event listener for the No button to close the popup
    document.getElementById("confirmNo").onclick = function() {
        document.getElementById("popup").style.display = "none";
    };
});

// Initialize flatpickr for the date input
document.addEventListener("DOMContentLoaded", function () {
    flatpickr("#date", {
        dateFormat: "Y-m-d",
        minDate: "today"
    });
});
