import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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

// Function to populate the fields for updating
function populateFields() {
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key');

    if (key) {
        const courseRef = ref(db, 'courses/' + key);
        onValue(courseRef, (snapshot) => {
            const course = snapshot.val();
            if (course) {
                document.getElementById('crn').value = course.crn;
                document.getElementById('subject').value = course.subject;
                document.getElementById('course').value = course.course;
                document.getElementById('section').value = course.section;
                document.getElementById('credits').value = course.credits;
                document.getElementById('title').value = course.title;
                document.getElementById('days').value = course.days;
                document.getElementById('time').value = course.time;
                document.getElementById('instructor').value = course.instructor;
                document.getElementById('capacity').value = course.capacity;
                document.getElementById('date').value = course.date;
            } else {
                console.error('Course not found!');
                alert('Course not found!');
            }
        }, {
            onlyOnce: true // Only fetch the data once
        });
    } else {
        console.error('No course key provided!');
        alert('No course key provided!');
    }
}

// Call populateFields when the page loads
window.onload = populateFields;

// Handle form submission
document.querySelector(".course-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    const key = new URLSearchParams(window.location.search).get('key');
    const crn = document.getElementById("crn").value;
    const subject = document.getElementById("subject").value;
    const course = document.getElementById("course").value;
    const section = document.getElementById("section").value;
    const credits = document.getElementById("credits").value;
    const title = document.getElementById("title").value;
    const days = document.getElementById("days").value;
    const time = document.getElementById("time").value;
    const instructor = document.getElementById("instructor").value;
    const capacity = document.getElementById("capacity").value;
    const active = 0; // Starting active students
    const remaining = capacity - active; // Calculate remaining seats
    const date = document.getElementById("date").value;

    // Update the course in Firebase
    set(ref(db, 'courses/' + key), {
        crn: crn,
        subject: subject,
        course: course,
        section: section,
        credits: credits,
        title: title,
        days: days,
        time: time,
        instructor: instructor,
        capacity: capacity,
        active: active,
        remaining: remaining,
        date: date
    })
    .then(() => {
        // Redirect to admin update page
        window.location.href = "admin_update_course.html"; // Change this to your actual update page path
    })
    .catch((error) => {
        console.error("Error updating course: ", error);
    });
});
