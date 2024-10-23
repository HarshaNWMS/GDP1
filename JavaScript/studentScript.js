import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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

// Fetch and display student’s name on the dashboard
auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;
    const userRef = ref(db, 'users/' + uid);

    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const studentName = userData.firstName; // Get the first name from Firebase
        document.getElementById('dashboardTitle').textContent = `${studentName}'s Dashboard`;
        
        // Update the welcome message with the student's name
        document.getElementById('welcomeMessage').textContent = `Welcome, ${studentName}!`;
      }
    });

    // When the term changes, load the enrolled courses for that term
    const termDropdown = document.getElementById('termDropdown');
    termDropdown.addEventListener('change', function () {
      const selectedTerm = termDropdown.value.trim().toLowerCase();

      // Load enrolled courses for the selected term
      const enrolledCoursesRef = ref(db, 'users/' + uid + '/enrolledCourses');
      get(enrolledCoursesRef).then((snapshot) => {
        const enrolledCourses = snapshot.val();
        displayEnrolledCourses(enrolledCourses, selectedTerm);
        loadAvailableCourses(enrolledCourses, selectedTerm); // Pass enrolled courses
      }).catch((error) => {
        console.error("Error fetching enrolled courses:", error);
      });
    });
  }
});

// Load available courses based on the selected term
const loadAvailableCourses = (enrolledCourses, selectedTerm) => {
  const coursesRef = ref(db, 'courses');

  get(coursesRef).then((snapshot) => {
    const courses = snapshot.val();
    const availableCoursesTable = document.querySelector('#availableCourses tbody');
    availableCoursesTable.innerHTML = ''; // Clear previous rows

    for (const courseId in courses) {
      const course = courses[courseId];
      if (course.term.trim().toLowerCase() === selectedTerm) {
        const row = document.createElement('tr');
        const titleCell = document.createElement('td');
        titleCell.textContent = course.title;
        row.appendChild(titleCell);

        const sectionCell = document.createElement('td');
        sectionCell.textContent = course.section;
        row.appendChild(sectionCell);

        const actionCell = document.createElement('td');
        const enrollButton = document.createElement('button');

        // Disable button if already enrolled
        if (enrolledCourses && enrolledCourses[courseId]) {
          enrollButton.textContent = 'Enrolled';
          enrollButton.disabled = true;
          enrollButton.classList.add('disabled-btn');
        } else {
          enrollButton.textContent = 'Enroll';
          enrollButton.classList.add('enroll-btn');
          enrollButton.onclick = () => {
            enrollInCourse(courseId, auth.currentUser.uid);
            enrollButton.textContent = 'Enrolled'; // Change button text
            enrollButton.disabled = true;          // Disable button
            enrollButton.classList.add('disabled-btn'); // Add class to change color
          };
        }

        actionCell.appendChild(enrollButton);
        row.appendChild(actionCell);

        availableCoursesTable.appendChild(row);
      }
    }
  }).catch((error) => {
    console.error("Error fetching courses:", error);
  });
};

// Display enrolled courses as cards based on the selected term
function displayEnrolledCourses(enrolledCourses, selectedTerm) {
  const enrolledCoursesDiv = document.getElementById('enrolledCourses');
  enrolledCoursesDiv.innerHTML = ''; 

  const coursesRef = ref(db, 'courses');
  get(coursesRef).then((snapshot) => {
    const courses = snapshot.val();

    for (const courseId in enrolledCourses) {
      const course = courses[courseId];
      if (course.term.trim().toLowerCase() === selectedTerm) {
        const card = document.createElement('div');
        card.classList.add('course-container'); // Reuse the same class from the instructor dashboard
        card.id = `course-card-${courseId}`; 

        const courseTextContainer = document.createElement('div');
        courseTextContainer.classList.add('course-text-container');

        const courseTitle = document.createElement('h3');
        courseTitle.textContent = `${course.title} - ${course.section}`;
        courseTextContainer.appendChild(courseTitle);

        const termLabel = document.createElement('p');
        termLabel.textContent = `Term: ${course.term}`;
        courseTextContainer.appendChild(termLabel);

        const deptLabel = document.createElement('p');
        deptLabel.textContent = `Department: CS-${course.subject}`;
        courseTextContainer.appendChild(deptLabel);

        const trackButton = document.createElement('button');
        trackButton.textContent = 'Track Attendance';
        trackButton.classList.add('track-btn');
        trackButton.onclick = () => trackAttendance(course.title);
        card.appendChild(courseTextContainer);
        card.appendChild(trackButton);

        enrolledCoursesDiv.appendChild(card);
      }
    }
  }).catch((error) => {
    console.error("Error fetching course data:", error);
  });
}

// Enroll in a course and immediately update enrolled list
function enrollInCourse(courseId, uid) {
  const courseRef = ref(db, 'courses/' + courseId + '/enrolledStudents');
  
  update(courseRef, { [uid]: true }).then(() => {
    const userEnrolledRef = ref(db, 'users/' + uid + '/enrolledCourses/' + courseId);
    update(userEnrolledRef, { enrolled: true }).then(() => {
      alert("Enrolled successfully!");

      // Add newly enrolled course to existing ones
      displayEnrolledCourses({ ...userEnrolledRef, [courseId]: true }, termDropdown.value.trim().toLowerCase());
    });
  }).catch((error) => {
    console.error("Error enrolling in course:", error);
  });
}

// Function to track attendance
function trackAttendance(courseTitle) {
  alert(`Tracking attendance for: ${courseTitle}`);
  window.location.href = '../HTML/pieChart.html'; // Redirect to the new pie chart page
}

// Logout function
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "../HTML/index.html";
  }).catch((error) => {
    console.error("Error logging out:", error);
  });
};

// Scan QR function
window.scanQR = function() {
  window.location.href = "../HTML/qrScanner.html"; // Redirect to qrScanner.html
};
