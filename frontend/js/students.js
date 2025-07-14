// Student management functions
class StudentManager {
    constructor() {
        this.currentStudent = null;
        this.modal = null;
        this.detailsModal = null;
    }

    // Show add student modal
    showAddModal() {
        this.currentStudent = null;
        document.getElementById('studentModalLabel').textContent = 'Add New Student';
        this.resetForm();
        
        // Use Bootstrap's direct modal API
        const modalElement = document.getElementById('studentModal');
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
        
        modal.show();
        
        // Store the modal instance for cleanup
        this.modal = modal;
    }

    // Show edit student modal
    async showEditModal(studentId) {
        try {
            console.log(`Loading student data for ID: ${studentId}`);
            const response = await api.getStudent(studentId);
            this.currentStudent = response.data;
            
            console.log('Student data loaded:', this.currentStudent);
            
            // Update modal title and populate form
            document.getElementById('studentModalLabel').textContent = 'Edit Student';
            this.populateForm(this.currentStudent);
            
            // Use Bootstrap's direct modal API instead of stored instance
            const modalElement = document.getElementById('studentModal');
            const modal = new bootstrap.Modal(modalElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });
            
            console.log('Showing edit modal');
            modal.show();
            
            // Store the modal instance for cleanup
            this.modal = modal;
            
        } catch (error) {
            console.error('Error in showEditModal:', error);
            showAlert('Failed to load student data: ' + error.message, 'danger');
        }
    }

    // Reset form
    resetForm() {
        const form = document.getElementById('studentForm');
        if (form) {
            form.reset();
        }
    }

    // Populate form with student data
    populateForm(student) {
        const setFieldValue = (id, value) => {
            const field = document.getElementById(id);
            if (field) {
                field.value = value || '';
            }
        };

        setFieldValue('firstName', student.first_name);
        setFieldValue('lastName', student.last_name);
        setFieldValue('email', student.email);
        setFieldValue('phone', student.phone);
        setFieldValue('dateOfBirth', student.date_of_birth);
    }

    // Save student (create or update)
    async saveStudent() {
        try {
            const formData = this.getFormData();
            
            if (!this.validateForm(formData)) {
                return;
            }

            let response;
            if (this.currentStudent) {
                // Update existing student
                response = await api.updateStudent(this.currentStudent.student_id, formData);
                showAlert('Student updated successfully!', 'success');
            } else {
                // Create new student
                response = await api.createStudent(formData);
                showAlert('Student created successfully!', 'success');
            }

            // Close modal and refresh table
            if (this.modal) {
                this.modal.hide();
            }
            
            await loadStudents();
            await loadDashboardStats();

        } catch (error) {
            showAlert('Failed to save student: ' + error.message, 'danger');
            console.error('Error saving student:', error);
        }
    }

    // Get form data
    getFormData() {
        const getFieldValue = (id) => {
            const field = document.getElementById(id);
            return field ? field.value.trim() : '';
        };

        return {
            firstName: getFieldValue('firstName'),
            lastName: getFieldValue('lastName'),
            email: getFieldValue('email'),
            phone: getFieldValue('phone'),
            dateOfBirth: getFieldValue('dateOfBirth') || null
        };
    }

    // Validate form data
    validateForm(formData) {
        if (!formData.firstName) {
            showAlert('First name is required', 'warning');
            document.getElementById('firstName').focus();
            return false;
        }
        if (!formData.lastName) {
            showAlert('Last name is required', 'warning');
            document.getElementById('lastName').focus();
            return false;
        }
        if (!formData.email) {
            showAlert('Email is required', 'warning');
            document.getElementById('email').focus();
            return false;
        }
        if (!this.isValidEmail(formData.email)) {
            showAlert('Please enter a valid email address', 'warning');
            document.getElementById('email').focus();
            return false;
        }
        return true;
    }

    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show student details modal
    async showDetailsModal(studentId) {
        try {
            const response = await api.getStudent(studentId);
            const student = response.data;
            
            // Get student enrollments
            const enrollmentsResponse = await api.getStudentEnrollments(studentId);
            const enrollments = enrollmentsResponse.data;

            this.populateDetailsModal(student, enrollments);
            
            const modal = new bootstrap.Modal(document.getElementById('studentDetailsModal'));
            modal.show();
        } catch (error) {
            showAlert('Failed to load student details', 'danger');
            console.error('Error loading student details:', error);
        }
    }

    // Populate details modal
    populateDetailsModal(student, enrollments) {
        document.getElementById('detailsStudentName').textContent = student.full_name;
        document.getElementById('detailsEmail').textContent = student.email;
        document.getElementById('detailsPhone').textContent = student.phone || 'N/A';
        document.getElementById('detailsStatus').innerHTML = `<span class="badge bg-${getStatusColor(student.student_status)}">${student.student_status}</span>`;
        document.getElementById('detailsRegistrationDate').textContent = new Date(student.registration_date).toLocaleDateString();
        document.getElementById('detailsGPA').textContent = student.gpa ? student.gpa.toFixed(2) : 'N/A';
        document.getElementById('detailsTotalEnrollments').textContent = student.total_enrollments;
        document.getElementById('detailsActiveEnrollments').textContent = student.active_enrollments;
        document.getElementById('detailsCompletedCourses').textContent = student.completed_courses;
        document.getElementById('detailsTotalPaid').textContent = `$${(student.total_paid || 0).toLocaleString()}`;

        // Populate enrollments table
        const tbody = document.getElementById('studentEnrollmentsBody');
        tbody.innerHTML = '';
        
        enrollments.forEach(enrollment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${enrollment.course_code}</td>
                <td>${enrollment.course_name}</td>
                <td>${enrollment.credits}</td>
                <td><span class="badge bg-${getStatusColor(enrollment.status)}">${enrollment.status}</span></td>
                <td>${enrollment.grade ? enrollment.grade.toFixed(2) : 'N/A'}</td>
                <td>$${enrollment.total_paid.toLocaleString()}</td>
                <td>${new Date(enrollment.enrollment_date).toLocaleDateString()}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Generate student transcript
    async generateTranscript(studentId) {
        try {
            const response = await api.getStudentTranscript(studentId);
            
            // Create a new window for the transcript
            const transcriptWindow = window.open('', '_blank', 'width=800,height=600');
            transcriptWindow.document.write(this.generateTranscriptHTML(response.data));
            transcriptWindow.document.close();
            
        } catch (error) {
            showAlert('Failed to generate transcript', 'danger');
            console.error('Error generating transcript:', error);
        }
    }

    // Generate transcript HTML
    generateTranscriptHTML(transcriptData) {
        const student = transcriptData[0][0]; // First result set, first row
        const courses = transcriptData[1]; // Second result set
        const summary = transcriptData[2][0]; // Third result set, first row

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Academic Transcript</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print { .no-print { display: none; } }
                    .transcript-header { border-bottom: 3px solid #0d6efd; margin-bottom: 20px; }
                </style>
            </head>
            <body class="container mt-4">
                <div class="transcript-header text-center pb-3">
                    <h2>Official Academic Transcript</h2>
                    <h4>Online Course Registration System</h4>
                </div>
                
                <div class="row mb-4">
                    <div class="col-6">
                        <h5>Student Information</h5>
                        <p><strong>Student ID:</strong> ${student.student_id}</p>
                        <p><strong>Name:</strong> ${student.full_name}</p>
                        <p><strong>Email:</strong> ${student.email}</p>
                    </div>
                    <div class="col-6">
                        <h5>Academic Summary</h5>
                        <p><strong>Current GPA:</strong> ${student.current_gpa ? student.current_gpa.toFixed(2) : 'N/A'}</p>
                        <p><strong>Total Credits:</strong> ${summary.total_credits}</p>
                        <p><strong>Completed Courses:</strong> ${summary.completed_courses}</p>
                    </div>
                </div>

                <h5>Course History</h5>
                <table class="table table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Credits</th>
                            <th>Status</th>
                            <th>Grade</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${courses.map(course => `
                            <tr>
                                <td>${course.course_code}</td>
                                <td>${course.course_name}</td>
                                <td>${course.credits}</td>
                                <td>${course.status}</td>
                                <td>${course.grade || 'N/A'}</td>
                                <td>${course.result}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="mt-4 text-center no-print">
                    <button onclick="window.print()" class="btn btn-primary me-2">Print Transcript</button>
                    <button onclick="window.close()" class="btn btn-secondary">Close</button>
                </div>

                <div class="mt-5 text-center">
                    <small class="text-muted">
                        Generated on ${new Date().toLocaleString()}<br>
                        This is an official transcript from the Online Course Registration System
                    </small>
                </div>
            </body>
            </html>
        `;
    }

    // Delete student with confirmation
    async deleteStudent(studentId, studentName) {
        if (!confirm(`Are you sure you want to delete student "${studentName}"?\n\nThis will also remove all their enrollments and payment records.\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            await api.deleteStudent(studentId);
            showAlert('Student deleted successfully!', 'success');
            await loadStudents();
            await loadDashboardStats();
        } catch (error) {
            showAlert('Failed to delete student: ' + error.message, 'danger');
            console.error('Error deleting student:', error);
        }
    }
}

// Create global student manager instance
const studentManager = new StudentManager();

// Global functions that use the student manager
function showAddStudentModal() {
    studentManager.showAddModal();
}

function viewStudent(id) {
    studentManager.showDetailsModal(id);
}

function editStudent(id) {
    studentManager.showEditModal(id);
}

function deleteStudent(id) {
    const student = currentStudents.find(s => s.student_id === id);
    const studentName = student ? student.full_name : `ID ${id}`;
    studentManager.deleteStudent(id, studentName);
}

function saveStudent() {
    studentManager.saveStudent();
}

function generateTranscript(studentId) {
    studentManager.generateTranscript(studentId);
}

// Additional helper functions
function closeStudentModal() {
    if (studentManager.modal) {
        studentManager.modal.hide();
    }
}

function closeStudentDetailsModal() {
    if (studentManager.detailsModal) {
        studentManager.detailsModal.hide();
    }
}

// Force close all modals and remove backdrops - useful for debugging
function forceCloseAllModals() {
    // Close Bootstrap modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
            modalInstance.hide();
        }
    });
    
    // Remove any stuck backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    
    // Remove modal-open class from body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    console.log('All modals forcefully closed');
}

// Make it globally available for debugging
window.forceCloseAllModals = forceCloseAllModals;
