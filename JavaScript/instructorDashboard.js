// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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
const auth = getAuth();
const db = getDatabase();

// Handle user authentication and fetch instructor details
auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;

    const usersRef = ref(db, `users/${uid}`);
    get(usersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const instructorData = snapshot.val();
          document.getElementById("instructorName").textContent = `${instructorData.firstName} ${instructorData.lastName}`;
          fetchCourses(uid);
        } else {
          document.getElementById("instructorName").textContent = "Instructor Not Found!";
        }
      })
      .catch((error) => {
        console.error("Error fetching instructor details:", error);
      });
  }
});

// Fetch and display courses assigned to the instructor
function fetchCourses(instructorUID) {
  const coursesRef = ref(db, "courses");
  get(coursesRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const courses = snapshot.val();
        const coursesContainer = document.getElementById("coursesContainer");
        coursesContainer.innerHTML = "";

        let coursesFound = false;

        for (const courseId in courses) {
          const course = courses[courseId];
          if (course.instructor === instructorUID) {
            coursesFound = true;

            const courseContainer = document.createElement("div");
            courseContainer.classList.add("course-container");

            const courseTextContainer = document.createElement("div");
            courseTextContainer.classList.add("course-text-container");

            const courseTitle = document.createElement("h3");
            courseTitle.textContent = `${course.title}`;

            const termText = document.createElement("p");
            termText.textContent = `Term: ${course.term}`;

            const deptText = document.createElement("p");
            deptText.textContent = `Department: ${course.department || "N/A"}`;

            courseTextContainer.appendChild(courseTitle);
            courseTextContainer.appendChild(termText);
            courseTextContainer.appendChild(deptText);

            const overviewButton = document.createElement("button");
            overviewButton.textContent = "Course Overview";
            overviewButton.onclick = () => viewCourseOverview(courseId);

            courseContainer.appendChild(courseTextContainer);
            courseContainer.appendChild(overviewButton);
            coursesContainer.appendChild(courseContainer);
          }
        }

        if (!coursesFound) {
          const noCoursesMessage = document.createElement("p");
          noCoursesMessage.textContent = "No courses assigned.";
          coursesContainer.appendChild(noCoursesMessage);
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching courses:", error);
    });
}

// Navigate to course overview page
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
