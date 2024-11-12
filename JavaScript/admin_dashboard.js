// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

// Firebase configuration
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
const db = getDatabase(app);

// Open enrollment form and load courses
window.openEnrollmentForm = function () {
    document.getElementById('enrollStudentsSection').style.display = 'block';
    loadCourses();
};

// Load courses into dropdown
function loadCourses() {
    const courseDropdown = document.getElementById('courseDropdown');
    courseDropdown.innerHTML = ''; // Clear options

    const coursesRef = ref(db, 'courses');
    get(coursesRef).then((snapshot) => {
        const courses = snapshot.val();
        for (const courseId in courses) {
            const course = courses[courseId];
            const option = document.createElement('option');
            option.value = courseId;
            option.textContent = `${course.title} - Section ${course.section}`;
            courseDropdown.appendChild(option);
        }
    }).catch((error) => console.error("Error loading courses:", error));
}

// Process CSV file upload
window.processCSV = function () {
    const fileInput = document.getElementById('csvFileUpload');
    const courseId = document.getElementById('courseDropdown').value;

    if (!fileInput.files.length || !courseId) {
        alert("Please select a course and upload a CSV file.");
        return;
    }

    const file = fileInput.files[0];
    Papa.parse(file, {
        header: true,
        complete: function (results) {
            const studentsData = results.data;
            enrollStudentsInCourse(studentsData, courseId);
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
            document.getElementById('statusMessage').textContent = "Failed to read CSV file.";
        }
    });
};

// Enroll parsed students into the course
function enrollStudentsInCourse(students, courseId) {
    const updates = {};
    students.forEach(student => {
        const studentId = student.StudentID; // Assumes 'StudentID' is a column in CSV
        if (studentId) {
            updates[`/courses/${courseId}/enrolledStudents/${studentId}`] = true;
            updates[`/users/${studentId}/enrolledCourses/${courseId}`] = true;
        }
    });

    update(ref(db), updates)
        .then(() => {
            document.getElementById('statusMessage').textContent = "Students enrolled successfully!";
        })
        .catch((error) => {
            console.error("Error enrolling students:", error);
            document.getElementById('statusMessage').textContent = "Enrollment failed. Please try again.";
        });
}

// Search for students based on input
window.searchStudents = function () {
    const query = document.getElementById('studentSearch').value.toLowerCase();
    const resultsList = document.getElementById('studentResults');
    resultsList.innerHTML = ''; // Clear previous results

    const usersRef = ref(db, 'users');
    get(usersRef).then((snapshot) => {
        const users = snapshot.val();
        for (const userId in users) {
            const user = users[userId];
            if (user.role === 'student' && 
                (user.firstName.toLowerCase().includes(query) || user.studentId.includes(query))) {
                const listItem = document.createElement('li');
                listItem.textContent = `${user.firstName} ${user.lastName} (ID: ${user.studentId})`;
                listItem.onclick = () => selectStudent(userId, listItem);
                resultsList.appendChild(listItem);
            }
        }
    }).catch((error) => {
        console.error("Error fetching students:", error);
    });
};

// Track selected students for enrollment
let selectedStudents = new Set();
function selectStudent(userId, listItem) {
    if (selectedStudents.has(userId)) {
        selectedStudents.delete(userId);
        listItem.style.backgroundColor = ""; // Deselect
    } else {
        selectedStudents.add(userId);
        listItem.style.backgroundColor = "#d3ffd3"; // Highlight selected
    }
}

// Enroll selected students in the chosen course
window.enrollSelectedStudents = function () {
    const courseId = document.getElementById('courseDropdown').value;
    if (!courseId) {
        alert("Please select a course.");
        return;
    }

    const updates = {};
    selectedStudents.forEach(studentId => {
        updates[`/courses/${courseId}/enrolledStudents/${studentId}`] = true;
        updates[`/users/${studentId}/enrolledCourses/${courseId}`] = true;
    });

    update(ref(db), updates).then(() => {
        alert("Students successfully enrolled!");
        selectedStudents.clear();
        document.getElementById('studentResults').innerHTML = ''; // Clear search results
    }).catch((error) => console.error("Error enrolling students:", error));
};
