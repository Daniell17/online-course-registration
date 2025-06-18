const API_BASE_URL = 'http://localhost:3000/api';

class APIClient {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            console.log(`Making API request to: ${url}`);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API response received:', data);
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            
            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Please ensure the backend is running on http://localhost:3000');
            }
            
            throw error;
        }
    }

    async getStudents() {
        return this.request('/students');
    }

    async getStudent(id) {
        return this.request(`/students/${id}`);
    }

    async createStudent(studentData) {
        return this.request('/students', {
            method: 'POST',
            body: studentData
        });
    }

    async updateStudent(id, studentData) {
        return this.request(`/students/${id}`, {
            method: 'PUT',
            body: studentData
        });
    }

    async deleteStudent(id) {
        return this.request(`/students/${id}`, {
            method: 'DELETE'
        });
    }

    async getStudentEnrollments(id) {
        return this.request(`/students/${id}/enrollments`);
    }

    async getStudentTranscript(id) {
        return this.request(`/students/${id}/transcript`);
    }

    async getCourses(filters = {}) {
        const params = new URLSearchParams(filters);
        const endpoint = `/courses${params.toString() ? '?' + params.toString() : ''}`;
        return this.request(endpoint);
    }

    async getCourse(id) {
        return this.request(`/courses/${id}`);
    }

    async createCourse(courseData) {
        return this.request('/courses', {
            method: 'POST',
            body: courseData
        });
    }

    async updateCourse(id, courseData) {
        return this.request(`/courses/${id}`, {
            method: 'PUT',
            body: courseData
        });
    }

    async enrollStudent(courseId, studentId) {
        return this.request(`/courses/${courseId}/enroll`, {
            method: 'POST',
            body: { studentId }
        });
    }

    async getEnrollments() {
        return this.request('/enrollments');
    }

    async updateEnrollmentStatus(enrollmentId, status, grade = null) {
        return this.request(`/enrollments/${enrollmentId}/status`, {
            method: 'PUT',
            body: { status, grade }
        });
    }

    async getDashboardStats() {
        return this.request('/analytics/dashboard');
    }

    async getRevenueAnalytics() {
        return this.request('/analytics/revenue');
    }

    // Test connection method
    async testConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

const api = new APIClient();

// Test connection on load
document.addEventListener('DOMContentLoaded', async () => {
    const isConnected = await api.testConnection();
    if (!isConnected) {
        console.warn('Backend server not accessible. Please start the backend server.');
    }
});
