/**
 * Course Management JavaScript
 * Handles course CRUD operations and modal interactions
 */

let editingCourseId = null;

/**
 * Show the add course modal
 */
function showAddCourseModal() {
    editingCourseId = null;
    document.getElementById('courseModalLabel').textContent = 'Add New Course';
    document.getElementById('courseForm').reset();
    
    // Clear any previous validation states
    const form = document.getElementById('courseForm');
    form.classList.remove('was-validated');
    
    // Create and show modal
    const modal = new bootstrap.Modal(document.getElementById('courseModal'));
    modal.show();
}

/**
 * Show the edit course modal with pre-filled data
 */
function showEditCourseModal(courseId, courseData) {
    editingCourseId = courseId;
    document.getElementById('courseModalLabel').textContent = 'Edit Course';
    
    // Fill form with existing data
    document.getElementById('courseCode').value = courseData.course_code || '';
    document.getElementById('courseName').value = courseData.course_name || '';
    document.getElementById('courseDescription').value = courseData.description || '';
    document.getElementById('courseCredits').value = courseData.credits || 3;
    document.getElementById('courseFee').value = courseData.price || '';
    document.getElementById('courseCapacity').value = courseData.max_students || 30;
    document.getElementById('courseInstructor').value = courseData.instructor || '';
    document.getElementById('courseStatus').value = courseData.status || 'Active';
    
    // Clear any previous validation states
    const form = document.getElementById('courseForm');
    form.classList.remove('was-validated');
    
    // Create and show modal
    const modal = new bootstrap.Modal(document.getElementById('courseModal'));
    modal.show();
}

/**
 * Save course (add or edit)
 */
async function saveCourse() {
    const form = document.getElementById('courseForm');
    
    // Check form validity
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Gather form data
    const formData = new FormData(form);
    const courseData = {
        courseName: formData.get('courseName').trim(),
        courseCode: formData.get('courseCode').trim(),
        description: formData.get('courseDescription').trim(),
        credits: parseInt(formData.get('courseCredits')),
        price: parseFloat(formData.get('courseFee')),
        maxStudents: parseInt(formData.get('courseCapacity')) || null,
        instructor: formData.get('courseInstructor').trim() || null,
        status: formData.get('courseStatus')
    };
    
    try {
        let response;
        
        if (editingCourseId) {
            // Update existing course
            response = await fetch(`/api/courses/${editingCourseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(courseData)
            });
        } else {
            // Create new course
            response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(courseData)
            });
        }
        
        if (response.ok) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('courseModal'));
            modal.hide();
            
            // Reload courses
            await loadCourses();
            
            // Show success message
            showNotification(editingCourseId ? 'Course updated successfully!' : 'Course added successfully!', 'success');
        } else {
            const errorData = await response.json();
            showNotification(errorData.message || 'Error saving course', 'error');
        }
    } catch (error) {
        console.error('Error saving course:', error);
        showNotification('Error saving course', 'error');
    }
}

/**
 * Edit course handler
 */
async function editCourse(courseId) {
    try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (response.ok) {
            const result = await response.json();
            const courseData = result.data || result; // Handle both wrapped and unwrapped responses
            showEditCourseModal(courseId, courseData);
        } else {
            showNotification('Error loading course data', 'error');
        }
    } catch (error) {
        console.error('Error loading course:', error);
        showNotification('Error loading course data', 'error');
    }
}

/**
 * Delete course handler
 */
async function deleteCourse(courseId, courseName) {
    if (!confirm(`Are you sure you want to delete the course "${courseName}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadCourses();
            showNotification('Course deleted successfully!', 'success');
        } else {
            const errorData = await response.json();
            showNotification(errorData.message || 'Error deleting course', 'error');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        showNotification('Error deleting course', 'error');
    }
}

/**
 * Load and display courses
 */
async function loadCourses() {
    try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }
        
        const courses = await response.json();
        displayCourses(courses);
        updateCourseStats(courses);
    } catch (error) {
        console.error('Error loading courses:', error);
        showNotification('Error loading courses', 'error');
    }
}

/**
 * Display courses in the table
 */
function displayCourses(courses) {
    const tbody = document.getElementById('coursesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (courses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="fas fa-book me-2"></i>
                    No courses found
                </td>
            </tr>
        `;
        return;
    }
    
    courses.forEach(course => {
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
            <td><span class="text-success fw-bold">${formatCurrency(course.price)}</span></td>
            <td>${course.max_students || 'N/A'}</td>
            <td>
                <span class="badge ${(course.available_spots || 0) > 0 ? 'bg-success' : 'bg-danger'}">
                    ${course.available_spots || 0}
                </span>
            </td>
            <td><span class="badge bg-${getStatusBadgeColor(course.status)}">${course.status}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary btn-sm" onclick="editCourse(${course.course_id})" title="Edit Course">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteCourse(${course.course_id}, '${course.course_name.replace(/'/g, '\\\'')}')" title="Delete Course">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Update course statistics
 */
function updateCourseStats(courses) {
    // Update course count
    const courseCountElement = document.querySelector('.stat-card:nth-child(2) .stat-number');
    if (courseCountElement) {
        courseCountElement.textContent = courses.length;
    }
    
    // Calculate active courses
    const activeCourses = courses.filter(course => course.status === 'Active').length;
    const activeCoursesElement = document.querySelector('.stat-card:nth-child(4) .stat-number');
    if (activeCoursesElement) {
        activeCoursesElement.textContent = activeCourses;
    }
}

/**
 * Get badge color for course status
 */
function getStatusBadgeColor(status) {
    switch (status) {
        case 'Active': return 'success';
        case 'Inactive': return 'secondary';
        case 'Full': return 'warning';
        case 'Cancelled': return 'danger';
        default: return 'secondary';
    }
}

/**
 * Format currency (Albanian Lek)
 */
function formatCurrency(amount) {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat('sq-AL', {
        style: 'currency',
        currency: 'ALL'
    }).format(amount);
}

/**
 * Show notification (reuse existing function if available)
 */
function showNotification(message, type = 'info') {
    // Try to use existing notification system, fallback to alert
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        alert(message);
    }
}
