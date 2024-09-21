import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
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

// Handle form submission
document.querySelector(".course-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form values
    const crn = document.getElementById("crn").value;
    const subject = document.getElementById("subject").value;
    const course = document.getElementById("course").value;
    const section = document.getElementById("section").value;
    const credits = document.getElementById("credits").value;
    const title = document.getElementById("title").value;
    const days = document.getElementById("days").value;
    const time = document.getElementById("time").value;
    const instructor = document.getElementById("instructor").value;
    const capacity = document.getElementById("capacity").value; // Add this line
    const active = 0; // Starting active students
    const remaining = capacity - active; // Calculate remaining seats
    const date = document.getElementById("date").value; // Add this line


    //hardocoded data
    // set(ref(db, 'courses/testCRN'), {
    //     crn: "testCRN",
    //     subject: "Test Subject",
    //     course: "Test Course",
    //     section: "001",
    //     credits: 3,
    //     title: "Test Title",
    //     days: "M,W,F",
    //     time: "10:00 AM - 11:00 AM",
    //     instructor: "Test Instructor",
    //     capacity: 30,
    //     active: 0,
    //     remaining: 30,
    //     date: "2024-01-01"
    // }).then(() => {
    //     console.log("Test course added successfully!");
    // }).catch((error) => {
    //     console.error("Error writing to database:", error);
    // });
    

    // Write the new course to the database
    set(ref(db, 'courses/' + crn), {
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
        // Show the pop-up
        document.getElementById("popup").style.display = "block";
        // Clear the form
        document.querySelector(".course-form").reset();
    })
    .catch((error) => {
        console.error("Error writing to database:", error);
    });
});
