import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, set, update, get } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Add a Single Course
document.querySelector('.course-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const courseData = {
        term: document.getElementById('term').value,
        crn: document.getElementById('crn').value,
        department: document.getElementById('department').value,
        course: document.getElementById('course').value,
        section: document.getElementById('section').value,
        credits: parseInt(document.getElementById('credits').value, 10),
        title: document.getElementById('title').value,
        days: document.getElementById('days').value,
        time: document.getElementById('time').value,
        instructor: document.getElementById('instructor').value,
        capacity: parseInt(document.getElementById('capacity').value, 10),
        date: document.getElementById('date').value,
    };

    try {
        await set(ref(db, `courses/${courseData.crn}`), courseData);
        alert("Course added successfully!");
    } catch (error) {
        console.error("Error adding course:", error);
        alert("Failed to add the course.");
    }
});

// Handle Bulk Upload
document.getElementById("bulkUploadInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
        const csvData = reader.result;
        Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                bulkUploadCourses(results.data);
            },
            error: function (error) {
                console.error("Error parsing CSV:", error);
                alert("Failed to process CSV file.");
            },
        });
    };
    reader.readAsText(file);
});

// Upload Multiple Courses
async function bulkUploadCourses(courses) {
    const updates = {};

    courses.forEach((course) => {
        const courseId = course.CRN;
        updates[`/courses/${courseId}`] = {
            term: course.Term || "",
            crn: course.CRN || "",
            department: course.Department || "",
            course: course.Course || "",
            section: course.Section || "",
            credits: parseInt(course.Credits, 10) || 0,
            title: course.Title || "",
            days: course.Days || "",
            time: course.Time || "",
            instructor: course.Instructor || "",
            capacity: parseInt(course.Capacity, 10) || 0,
            date: course.Date || "",
        };
    });

    try {
        await update(ref(db), updates);
        alert("Courses uploaded successfully!");
    } catch (error) {
        console.error("Error uploading courses:", error);
        alert("Failed to upload courses. Please try again.");
    }
}

// Fetch Instructors for Autocomplete
async function fetchInstructors() {
    const usersRef = ref(db, "users");
    try {
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const instructors = [];
            snapshot.forEach(childSnapshot => {
                const user = childSnapshot.val();
                if (user.role === "instructor") {
                    instructors.push(user);
                }
            });
            return instructors;
        }
    } catch (error) {
        console.error("Error fetching instructors:", error);
    }
    return [];
}

// Autocomplete for Instructor Field
document.getElementById('instructor').addEventListener('input', async function () {
    const input = this.value.toLowerCase();
    const instructors = await fetchInstructors();

    const suggestions = instructors.filter(inst =>
        inst.firstName.toLowerCase().includes(input) || inst.lastName.toLowerCase().includes(input)
    );
    console.log("Suggestions:", suggestions);
});

// Flatpickr Initialization for Date Picker
flatpickr(".date-picker", {
    dateFormat: "Y-m-d",
    allowInput: true,
});
