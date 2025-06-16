// Application state and UI management

let currentStudents = [];
let currentCourses = [];
let currentEnrollments = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Course Registration System...');
    
    try {
        await loadDashboardStats();
        await loadStudents();
        await loadCourses();
        await loadEnrollments();
        
        console.log('✅ Application initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showAlert('Failed to load application data. Please check if the backend server is running.', 'danger');
    }
});

// Dashboard functions
async function loadDashboardStats() {
    try {
        const response = await api.getDashboardStats();
        const stats = response.data;
        
        document.getElementById('totalStudents').textContent = stats.total_students || '0';
        document.getElementById('activeCourses').textContent = stats.active_courses || '0';
        document.getElementById('totalEnrollments').textContent = stats.total_enrollments || '0';
        document.getElementById('totalRevenue').textContent = `$${(stats.total_revenue || 0).toLocaleString()}`;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Set default values if API fails
        document.getElementById('totalStudents').textContent = '-';
        document.getElementById('activeCourses').textContent = '-';
        document.getElementById('totalEnrollments').textContent = '-';
        document.getElementById('totalRevenue').textContent = '-';
    }
}

// Student management functions
async function loadStudents() {
    try {
        const response = await api.getStudents();
        currentStudents = response.data;
        renderStudentsTable();
    } catch (error) {
        console.error('Error loading students:', error);
        showAlert('Failed to load students', 'danger');
    }
}

function renderStudentsTable() {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    
    currentStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.student_id}</td>
            <td>${student.full_name}</td>
            <td>${student.email}</td>
            <td>${student.phone || 'N/A'}</td>
            <td><span class="badge bg-${getStatusColor(student.student_status)}">${student.student_status}</span></td>
            <td>${student.total_enrollments}</td>
            <td>${student.gpa ? student.gpa.toFixed(2) : 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewStudent(${student.student_id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editStudent(${student.student_id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent(${student.student_id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Course management functions
async function loadCourses() {
    try {
        const response = await api.getCourses();
        currentCourses = response.data;
        renderCoursesTable();
    } catch (error) {
        console.error('Error loading courses:', error);
        showAlert('Failed to load courses', 'danger');
    }
}

function renderCoursesTable() {
    const tbody = document.getElementById('coursesTableBody');
    tbody.innerHTML = '';
    
    currentCourses.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${course.course_code}</strong></td>
            <td>${course.course_name}</td>
            <td><span class="badge bg-secondary">${course.category || 'General'}</span></td>
            <td>${course.credits}</td>
            <td>$${course.price}</td>
            <td>${course.max_students}</td>
            <td>${course.available_spots}</td>
            <td><span class="badge bg-${getStatusColor(course.status)}">${course.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewCourse(${course.course_id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="showEnrollmentModal(${course.course_id})">
                    <i class="fas fa-user-plus"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editCourse(${course.course_id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Enrollment management functions
async function loadEnrollments() {
    try {
        const response = await api.getEnrollments();
        currentEnrollments = response.data;
        renderEnrollmentsTable();
    } catch (error) {
        console.error('Error loading enrollments:', error);
        showAlert('Failed to load enrollments', 'danger');
    }
}

function renderEnrollmentsTable() {
    const tbody = document.getElementById('enrollmentsTableBody');
    tbody.innerHTML = '';
    
    currentEnrollments.forEach(enrollment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${enrollment.student_name}</td>
            <td>${enrollment.course_name} (${enrollment.course_code})</td>
            <td>${new Date(enrollment.enrollment_date).toLocaleDateString()}</td>
            <td><span class="badge bg-${getStatusColor(enrollment.status)}">${enrollment.status}</span></td>
            <td>${enrollment.grade ? enrollment.grade.toFixed(2) : 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="updateEnrollmentStatus(${enrollment.enrollment_id})">
                    <i class="fas fa-edit"></i> Update
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Utility functions
function getStatusColor(status) {
    const colorMap = {
        'Active': 'success',
        'Inactive': 'secondary',
        'Enrolled': 'primary',
        'Completed': 'success',
        'Dropped': 'danger',
        'Failed': 'danger'
    };
    return colorMap[status] || 'secondary';
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer') || createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.maxWidth = '400px';
    document.body.appendChild(container);
    return container;
}

// Placeholder functions for modal operations
function showAddStudentModal() {
    showAlert('Add Student modal - Feature coming soon!', 'info');
}

function showAddCourseModal() {
    showAlert('Add Course modal - Feature coming soon!', 'info');
}

function viewStudent(id) {
    showAlert(`View Student ${id} - Feature coming soon!`, 'info');
}

function editStudent(id) {
    showAlert(`Edit Student ${id} - Feature coming soon!`, 'info');
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        showAlert(`Delete Student ${id} - Feature coming soon!`, 'warning');
    }
}

function viewCourse(id) {
    showAlert(`View Course ${id} - Feature coming soon!`, 'info');
}

function editCourse(id) {
    showAlert(`Edit Course ${id} - Feature coming soon!`, 'info');
}

function showEnrollmentModal(courseId) {
    showAlert(`Enroll students in Course ${courseId} - Feature coming soon!`, 'info');
}

function updateEnrollmentStatus(enrollmentId) {
    showAlert(`Update Enrollment ${enrollmentId} - Feature coming soon!`, 'info');
}

// Refresh functions
async function refreshAll() {
    try {
        await loadDashboardStats();
        await loadStudents();
        await loadCourses();
        await loadEnrollments();
        showAlert('Data refreshed successfully!', 'success');
    } catch (error) {
        showAlert('Failed to refresh data', 'danger');
    }
}
