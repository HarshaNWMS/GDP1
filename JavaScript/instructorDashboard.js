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

// Fetch instructor's courses and display them as cards
auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;

    // Get instructor's name and display it
    const instructorRef = ref(db, 'users/' + uid);
    get(instructorRef).then((snapshot) => {
      if (snapshot.exists()) {
        const instructor = snapshot.val();
        document.getElementById('instructorName').textContent = `${instructor.firstName} ${instructor.lastName}`;
      }
    }).catch((error) => {
      console.error("Error fetching instructor details:", error);
    });

    // Fetch courses taught by the instructor
    const coursesRef = ref(db, 'courses');
    get(coursesRef).then((snapshot) => {
      const courses = snapshot.val();
      const coursesContainer = document.getElementById('coursesContainer');

      for (const courseId in courses) {
        const course = courses[courseId];

        // Check if the course is assigned to the logged-in instructor
        if (course.instructor === uid) {
          // Create the course card container
          const courseContainer = document.createElement('div');
          courseContainer.classList.add('course-container');

          // Text container inside the course card
          const courseTextContainer = document.createElement('div');
          courseTextContainer.classList.add('course-text-container');

          // Course Title
          const courseTitle = document.createElement('h3');
          courseTitle.textContent = `${course.title}`;

          // Course Term
          const termText = document.createElement('p');
          termText.textContent = `Term: ${course.term}`;

          // Department
          const subject = course.subject; // Fetch the 'subject' field
          const deptText = document.createElement('p');
          deptText.textContent = `Department: CS-${subject.toUpperCase() || 'N/A'}`; // Format department as 'CS-ACS' or 'CS-IS'

          // Append the title, term, and department to the text container
          courseTextContainer.appendChild(courseTitle);
          courseTextContainer.appendChild(termText);
          courseTextContainer.appendChild(deptText);

          // Add "Course Overview" button
          const overviewButton = document.createElement('button');
          overviewButton.textContent = 'Course Overview';
          overviewButton.onclick = () => viewCourseOverview(courseId);

          // Append the text container and button to the course container
          courseContainer.appendChild(courseTextContainer);
          courseContainer.appendChild(overviewButton);

          // Append the course container to the courses grid
          coursesContainer.appendChild(courseContainer);
        }
      }
    }).catch((error) => {
      console.error("Error fetching courses:", error);
    });
  }
});

// Function to navigate to course overview page
function viewCourseOverview(courseId) {
  window.location.href = `../HTML/courseOverview.html?courseId=${courseId}`;
}

// Logout function
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "../HTML/index.html";
  }).catch((error) => {
    console.error("Error logging out:", error);
  });
};
