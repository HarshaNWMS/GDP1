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

// Fetch instructor's courses and manage enrollment requests
auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;

    // Fetch courses taught by instructor
    const coursesRef = ref(db, 'courses');
    get(coursesRef).then((snapshot) => {
      const courses = snapshot.val();
      const coursesList = document.getElementById('coursesList');

      for (const courseId in courses) {
        const course = courses[courseId];

        // Check if the course is assigned to the logged-in instructor
        if (course.instructorId === uid) {
          const listItem = document.createElement('li');
          listItem.textContent = `${course.title} - Section ${course.section}`;

          // Add "Course Overview" button
          const overviewButton = document.createElement('button');
          overviewButton.textContent = 'Course Overview';
          overviewButton.onclick = () => viewCourseOverview(courseId);
          listItem.appendChild(overviewButton);

          coursesList.appendChild(listItem);

          // Check if there are pending enrollment requests
          if (course.pendingRequests) {
            const pendingRequests = course.pendingRequests;
            for (const studentId in pendingRequests) {
              const studentRef = ref(db, 'users/' + studentId);
              get(studentRef).then((studentSnapshot) => {
                const student = studentSnapshot.val();
                const requestItem = document.createElement('li');
                requestItem.textContent = `${student.firstName} ${student.lastName} requested enrollment for ${course.title}`;

                // Approve button
                const approveButton = document.createElement('button');
                approveButton.textContent = 'Approve';
                approveButton.onclick = () => approveEnrollment(courseId, studentId);
                requestItem.appendChild(approveButton);

                // Reject button
                const rejectButton = document.createElement('button');
                rejectButton.textContent = 'Reject';
                rejectButton.onclick = () => rejectEnrollment(courseId, studentId);
                requestItem.appendChild(rejectButton);

                // Append request item to the requests list
                document.getElementById('requestsList').appendChild(requestItem);
              });
            }
          }
        }
      }
    }).catch((error) => {
      console.error("Error fetching courses:", error);
    });
  }
});

// Function to approve student enrollment
function approveEnrollment(courseId, studentId) {
  const courseRef = ref(db, 'courses/' + courseId);
  get(courseRef).then((snapshot) => {
    const course = snapshot.val();
    const updatedEnrolledStudents = course.enrolledStudents || [];
    updatedEnrolledStudents.push(studentId);

    update(courseRef, {
      enrolledStudents: updatedEnrolledStudents,
      [`pendingRequests/${studentId}`]: null // Remove the student from pending requests
    }).then(() => {
      alert("Enrollment approved!");
      window.location.reload(); // Refresh the page to update the requests list
    }).catch((error) => {
      console.error("Error approving enrollment:", error);
    });
  });
}

// Function to reject student enrollment
function rejectEnrollment(courseId, studentId) {
  const coursePendingRef = ref(db, 'courses/' + courseId + '/pendingRequests');

  get(coursePendingRef).then((snapshot) => {
    if (snapshot.exists()) {
      const pendingRequests = snapshot.val();

      // Remove the student's enrollment request from the pendingRequests
      delete pendingRequests[studentId];

      update(coursePendingRef, pendingRequests).then(() => {
        alert("Enrollment request rejected!");
        window.location.reload(); // Refresh the page to update the requests list
      }).catch((error) => {
        console.error("Error rejecting enrollment:", error);
      });
    }
  }).catch((error) => {
    console.error("Error fetching pending requests:", error);
  });
}

// Navigate to course overview page with the courseId as a query param
function viewCourseOverview(courseId) {
  window.location.href = `courseOverview.html?courseId=${courseId}`;
}

// Logout function
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  }).catch((error) => {
    console.error("Error logging out:", error);
  });
};
