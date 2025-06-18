let currentStudents = [];
let currentCourses = [];
let currentEnrollments = [];
let filteredStudents = [];

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Course Registration System...');
    
    try {
        if (typeof studentManager !== 'undefined') {
            studentManager.initializeModals();
        }
        
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
        // vendos vlera default ne qofse API nuk funksionon
        document.getElementById('totalStudents').textContent = '-';
        document.getElementById('activeCourses').textContent = '-';
        document.getElementById('totalEnrollments').textContent = '-';
        document.getElementById('totalRevenue').textContent = '-';
    }
}

async function loadStudents() {
    try {
        const response = await api.getStudents();
        currentStudents = response.data;
        filteredStudents = [...currentStudents];
        renderStudentsTable();
        updateStudentCount();
    } catch (error) {
        console.error('Error loading students:', error);
        showAlert('Failed to load students', 'danger');
    }
}

function renderStudentsTable() {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    
    if (filteredStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="fas fa-users fa-3x mb-3"></i>
                    <div>No students found</div>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        row.className = 'student-row';
        row.innerHTML = `
            <td><span class="badge bg-light text-dark">${student.student_id}</span></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-circle me-2">${getInitials(student.full_name)}</div>
                    <div>
                        <div class="fw-bold">${student.full_name}</div>
                        <small class="text-muted">ID: ${student.student_id}</small>
                    </div>
                </div>
            </td>
            <td>
                <i class="fas fa-envelope text-primary me-1"></i>
                ${student.email}
            </td>
            <td>
                <i class="fas fa-phone text-success me-1"></i>
                ${student.phone || 'N/A'}
            </td>
            <td><span class="badge bg-${getStatusColor(student.student_status)}">${student.student_status}</span></td>
            <td>
                <span class="badge bg-info">${student.total_enrollments}</span>
                <small class="text-muted d-block">Active: ${student.active_enrollments}</small>
            </td>
            <td>
                <span class="${student.gpa ? getGPAColor(student.gpa) : 'text-muted'} fw-bold">
                    ${student.gpa ? student.gpa.toFixed(2) : 'N/A'}
                </span>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewStudent(${student.student_id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="editStudent(${student.student_id})" title="Edit Student">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent(${student.student_id})" title="Delete Student">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

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
        row.className = 'course-row';
        row.innerHTML = `
            <td><span class="badge bg-dark">${course.course_code}</span></td>
            <td>
                <div class="fw-bold">${course.course_name}</div>
                <small class="text-muted">${course.description ? course.description.substring(0, 50) + '...' : 'No description'}</small>
            </td>
            <td><span class="badge bg-secondary">${course.category || 'General'}</span></td>
            <td><span class="badge bg-info">${course.credits}</span></td>
            <td><span class="text-success fw-bold">$${course.price}</span></td>
            <td>${course.max_students}</td>
            <td>
                <span class="badge ${course.available_spots > 0 ? 'bg-success' : 'bg-danger'}">
                    ${course.available_spots}
                </span>
            </td>
            <td><span class="badge bg-${getStatusColor(course.status)}">${course.status}</span></td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewCourse(${course.course_id})" title="View Course">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="showEnrollmentModal(${course.course_id})" title="Enroll Students">
                        <i class="fas fa-user-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="editCourse(${course.course_id})" title="Edit Course">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

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
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-circle-sm me-2">${getInitials(enrollment.student_name)}</div>
                    ${enrollment.student_name}
                </div>
            </td>
            <td>
                <div class="fw-bold">${enrollment.course_name}</div>
                <small class="text-muted">(${enrollment.course_code})</small>
            </td>
            <td>${new Date(enrollment.enrollment_date).toLocaleDateString()}</td>
            <td><span class="badge bg-${getStatusColor(enrollment.status)}">${enrollment.status}</span></td>
            <td>
                <span class="${enrollment.grade ? getGPAColor(enrollment.grade) : 'text-muted'} fw-bold">
                    ${enrollment.grade ? enrollment.grade.toFixed(2) : 'N/A'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="updateEnrollmentStatus(${enrollment.enrollment_id})">
                    <i class="fas fa-edit"></i> Update
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterStudents() {
    const searchTerm = document.getElementById('studentSearchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('studentStatusFilter')?.value || '';

    filteredStudents = currentStudents.filter(student => {
        const matchesSearch = !searchTerm || 
            student.full_name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.student_id.toString().includes(searchTerm);
        
        const matchesStatus = !statusFilter || student.student_status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    renderStudentsTable();
    updateStudentCount();
}

function clearStudentFilters() {
    document.getElementById('studentSearchInput').value = '';
    document.getElementById('studentStatusFilter').value = '';
    filteredStudents = [...currentStudents];
    renderStudentsTable();
    updateStudentCount();
}

function updateStudentCount() {
    const countElement = document.getElementById('studentCount');
    if (countElement) {
        countElement.textContent = `Showing ${filteredStudents.length} of ${currentStudents.length} students`;
    }
}

function getStatusColor(status) {
    const colorMap = {
        'Active': 'success',
        'Inactive': 'secondary',
        'Enrolled': 'primary',
        'Completed': 'success',
        'Dropped': 'danger',
        'Failed': 'danger',
        'Graduated': 'warning',
        'Suspended': 'dark'
    };
    return colorMap[status] || 'secondary';
}

function getGPAColor(gpa) {
    if (gpa >= 3.5) return 'text-success';
    if (gpa >= 3.0) return 'text-info';
    if (gpa >= 2.5) return 'text-warning';
    return 'text-danger';
}

function getInitials(name) {
    return name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer') || createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show shadow-sm`;
    alert.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function getAlertIcon(type) {
    const iconMap = {
        'success': 'check-circle',
        'danger': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return iconMap[type] || 'info-circle';
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

async function refreshStudents() {
    await loadStudents();
    await loadDashboardStats();
    showAlert('Students data refreshed successfully!', 'success');
}

async function refreshAll() {
    try {
        await loadDashboardStats();
        await loadStudents();
        await loadCourses();
        await loadEnrollments();
        showAlert('All data refreshed successfully!', 'success');
    } catch (error) {
        showAlert('Failed to refresh data', 'danger');
    }
}

function showAddStudentModal() {
    const modalElement = document.getElementById('studentModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } else {
        console.error('Student modal element not found');
    }
}

