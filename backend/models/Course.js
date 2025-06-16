const { pool } = require('../config/database').default;

class Course {
    static async findAll(filters = {}) {
        let query = `SELECT * FROM vw_CourseCatalog WHERE 1=1`;
        const params = [];

        if (filters.status) {
            query += ` AND status = ?`;
            params.push(filters.status);
        }

        if (filters.category) {
            query += ` AND category = ?`;
            params.push(filters.category);
        }

        if (filters.search) {
            query += ` AND (course_name LIKE ? OR course_code LIKE ? OR description LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` ORDER BY course_name`;

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT * FROM vw_CourseCatalog WHERE course_id = ?
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
