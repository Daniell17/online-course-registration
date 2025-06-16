const { pool } = require('../config/database');

class Course {
    static async findAll(filters = {}) {
        let query = `
            SELECT c.course_id, c.course_name, c.course_code, c.description, 
                   c.credits, c.price, c.category, c.max_students, c.start_date, 
                   c.end_date, c.status,
                   COUNT(e.enrollment_id) as current_enrollments,
                   (c.max_students - COUNT(e.enrollment_id)) as available_spots
            FROM Courses c
            LEFT JOIN Enrollments e ON c.course_id = e.course_id AND e.status IN ('Enrolled', 'Completed')
            WHERE 1=1
        `;
        const params = [];

        if (filters.status) {
            query += ` AND c.status = ?`;
            params.push(filters.status);
        }

        if (filters.category) {
            query += ` AND c.category = ?`;
            params.push(filters.category);
        }

        if (filters.search) {
            query += ` AND (c.course_name LIKE ? OR c.course_code LIKE ? OR c.description LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` GROUP BY c.course_id, c.course_name, c.course_code, c.description, 
                           c.credits, c.price, c.category, c.max_students, c.start_date, 
                           c.end_date, c.status
                   ORDER BY c.course_name`;

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT c.course_id, c.course_name, c.course_code, c.description, 
                   c.credits, c.price, c.category, c.max_students, c.start_date, 
                   c.end_date, c.status,
                   COUNT(e.enrollment_id) as current_enrollments,
                   (c.max_students - COUNT(e.enrollment_id)) as available_spots
            FROM Courses c
            LEFT JOIN Enrollments e ON c.course_id = e.course_id AND e.status IN ('Enrolled', 'Completed')
            WHERE c.course_id = ?
            GROUP BY c.course_id, c.course_name, c.course_code, c.description, 
                     c.credits, c.price, c.category, c.max_students, c.start_date, 
                     c.end_date, c.status
        `, [id]);
        return rows[0];
    }

    static async create(courseData) {
        const { 
            courseName, courseCode, description, credits, price, 
            maxStudents, startDate, endDate, category, status 
        } = courseData;
        
        const [result] = await pool.execute(`
            INSERT INTO Courses (course_name, course_code, description, credits, 
                               price, max_students, start_date, end_date, category, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [courseName, courseCode, description, credits, price, 
            maxStudents, startDate, endDate, category, status]);
        
        return result.insertId;
    }

    static async update(id, courseData) {
        const { 
            courseName, courseCode, description, credits, price, 
            maxStudents, startDate, endDate, category, status 
        } = courseData;
        
        const [result] = await pool.execute(`
            UPDATE Courses 
            SET course_name = ?, course_code = ?, description = ?, credits = ?, 
                price = ?, max_students = ?, start_date = ?, end_date = ?, 
                category = ?, status = ?
            WHERE course_id = ?
        `, [courseName, courseCode, description, credits, price, 
            maxStudents, startDate, endDate, category, status, id]);
        
        return result.affectedRows > 0;
    }

    static async getEnrollmentReport(courseId, status = null) {
        const [rows] = await pool.execute(`
            CALL GetCourseEnrollmentReport(?, ?)
        `, [courseId, status]);
        return rows;
    }

    static async enrollStudent(courseId, studentId) {
        try {
            const [result] = await pool.execute(`
                INSERT INTO Enrollments (student_id, course_id) VALUES (?, ?)
            `, [studentId, courseId]);
            return { success: true, enrollmentId: result.insertId };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return { success: false, error: 'Student already enrolled in this course' };
            }
            if (error.sqlState === '45000') {
                return { success: false, error: error.message };
            }
            throw error;
        }
    }
}

module.exports = Course;
