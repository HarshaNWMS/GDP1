import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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
const auth = getAuth();
const db = getDatabase();

// Handle authentication and load instructor data
auth.onAuthStateChanged((user) => {
    if (user) {
        const uid = user.uid; // Instructor UID
        const usersRef = ref(db, `users/${uid}`); // Reference to instructor data in Firebase

        get(usersRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const instructor = snapshot.val();
                    document.getElementById("instructorName").textContent = `${instructor.firstName} ${instructor.lastName}`;
                    loadCourses(uid); // Load instructor's courses
                } else {
                    document.getElementById("instructorName").textContent = "Instructor Not Found!";
                    console.error("Instructor not found in database.");
                }
            })
            .catch((error) => {
                console.error("Error fetching instructor details:", error);
            });
    } else {
        console.error("No user is signed in.");
        window.location.href = "../HTML/index.html";
    }
});

// Load courses assigned to the instructor
function loadCourses(instructorUID) {
    const coursesRef = ref(db, "courses"); // Reference to courses data
    const coursesContainer = document.getElementById("coursesContainer");

    get(coursesRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const courses = snapshot.val();
                coursesContainer.innerHTML = ""; // Clear any existing courses

                let coursesFound = false;

                for (const courseId in courses) {
                    const course = courses[courseId];
                    if (course.instructor === instructorUID) {
                        coursesFound = true;

                        // Create course card
                        const courseCard = document.createElement("div");
                        courseCard.classList.add("course-container");

                        const courseTextContainer = document.createElement("div");
                        courseTextContainer.classList.add("course-text-container");

                        const courseTitle = document.createElement("h3");
                        courseTitle.textContent = course.title;

                        const termText = document.createElement("p");
                        termText.textContent = `Term: ${course.term}`;

                        // Course Overview button
                        const courseButton = document.createElement("button");
                        courseButton.textContent = "Course Overview";
                        courseButton.onclick = () => viewCourseOverview(courseId);

                        // Generate QR Code button
                        const qrButton = document.createElement("button");
                        qrButton.textContent = "Generate QR Code";
                        qrButton.classList.add("generate-qr-btn");
                        qrButton.onclick = () => generateQRCode(courseId);

                        // Append elements
                        courseTextContainer.appendChild(courseTitle);
                        courseTextContainer.appendChild(termText);

                        courseCard.appendChild(courseTextContainer);
                        courseCard.appendChild(courseButton);
                        courseCard.appendChild(qrButton);

                        coursesContainer.appendChild(courseCard);
                    }
                }

                // If no courses are found
                if (!coursesFound) {
                    const noCoursesMessage = document.createElement("p");
                    noCoursesMessage.textContent = "No courses assigned.";
                    coursesContainer.appendChild(noCoursesMessage);
                }
            } else {
                console.error("No courses found in the database.");
            }
        })
        .catch((error) => {
            console.error("Error fetching courses:", error);
        });
}

// Generate QR Code for a course
function generateQRCode(courseId) {
    window.location.href = `../HTML/attendanceQR.html?courseId=${courseId}`;
}

// Navigate to Course Overview page
function viewCourseOverview(courseId) {
    window.location.href = `../HTML/courseOverview.html?courseId=${courseId}`;
}

// Logout function
window.logout = function () {
    signOut(auth)
        .then(() => {
            window.location.href = "../HTML/index.html";
        })
        .catch((error) => {
            console.error("Error logging out:", error);
        });
};
