const { pool } = require('../config/database');

class Student {    static async findAll() {
        const [rows] = await pool.execute(`
            SELECT student_id, first_name, last_name, email, 
                   phone, date_of_birth, registration_date,
                   CONCAT(first_name, ' ', last_name) as full_name,
                   'Active' as student_status
            FROM Students 
            ORDER BY last_name, first_name
        `);
        return rows;
    }    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT s.student_id, s.first_name, s.last_name, s.email, 
                   s.phone, s.date_of_birth, 'Active' as student_status, s.registration_date,
                   CONCAT(s.first_name, ' ', s.last_name) as full_name,
                   COUNT(e.enrollment_id) as total_enrollments,
                   COUNT(CASE WHEN e.status = 'Enrolled' THEN 1 END) as active_enrollments,
                   COUNT(CASE WHEN e.status = 'Completed' THEN 1 END) as completed_courses,
                   AVG(CASE WHEN e.grade IS NOT NULL THEN e.grade END) as gpa,
                   COALESCE(SUM(p.amount), 0) as total_paid
            FROM Students s
            LEFT JOIN Enrollments e ON s.student_id = e.student_id
            LEFT JOIN Payments p ON e.enrollment_id = p.enrollment_id AND p.payment_status = 'Completed'
            WHERE s.student_id = ?
            GROUP BY s.student_id, s.first_name, s.last_name, s.email, 
                     s.phone, s.date_of_birth, s.registration_date
        `, [id]);
        return rows[0];
    }    static async create(studentData) {
        const { firstName, lastName, email, phone, dateOfBirth } = studentData;
        
        const [result] = await pool.execute(`
            INSERT INTO Students (first_name, last_name, email, phone, date_of_birth)
            VALUES (?, ?, ?, ?, ?)
        `, [firstName, lastName, email, phone || null, dateOfBirth || null]);
        
        return result.insertId;
    }

    static async update(id, studentData) {
        console.log('Student.update called with:', { id, studentData });
        
        const { firstName, lastName, email, phone, dateOfBirth } = studentData;
        
        console.log('Extracted fields:', { firstName, lastName, email, phone, dateOfBirth });
        
        const [result] = await pool.execute(`
            UPDATE Students 
            SET first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?
            WHERE student_id = ?
        `, [firstName, lastName, email, phone || null, dateOfBirth || null, id]);
        
        console.log('Update query result:', result);
        
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute(`
            DELETE FROM Students WHERE student_id = ?
        `, [id]);
        return result.affectedRows > 0;
    }

    static async getEnrollments(studentId) {
        const [rows] = await pool.execute(`
            SELECT e.enrollment_id, e.enrollment_date, e.status, e.grade,
                   c.course_name, c.course_code, c.credits, c.price,
                   COALESCE(SUM(p.amount), 0) as total_paid
            FROM Enrollments e
            INNER JOIN Courses c ON e.course_id = c.course_id
            LEFT JOIN Payments p ON e.enrollment_id = p.enrollment_id 
                AND p.payment_status = 'Completed'
            WHERE e.student_id = ?
            GROUP BY e.enrollment_id, e.enrollment_date, e.status, e.grade,
                     c.course_name, c.course_code, c.credits, c.price
            ORDER BY e.enrollment_date DESC
        `, [studentId]);
        return rows;
    }

    static async generateTranscript(studentId) {
        const [rows] = await pool.execute(`
            CALL GenerateStudentTranscript(?)
        `, [studentId]);
        return rows;
    }
}

module.exports = Student;
