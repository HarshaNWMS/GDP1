window.onload = function() {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    if (ctx) {
        const attendanceChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Present', 'Absent', 'Late'],
                datasets: [{
                    label: 'Attendance',
                    data: [12, 2, 5], // Example data
                    backgroundColor: ['#4caf50', '#f44336', '#ffeb3b'],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                    },
                },
            }
        });
    } else {
        console.error("Failed to get 2D context for the chart.");
    }
};

document.getElementById('backToDashboard').onclick = function () {
    window.location.href = '../HTML/student_dashboard.html';
};
