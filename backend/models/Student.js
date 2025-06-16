import { pool } from '../config/database';

class Student {
    static async findAll() {
        const [rows] = await pool.execute(`
            SELECT student_id, first_name, middle_name, last_name, email, 
                   phone, date_of_birth, status, registration_date
            FROM Students 
            ORDER BY last_name, first_name
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT * FROM vw_StudentDashboard WHERE student_id = ?
        `, [id]);
        return rows[0];
    }

    static async create(studentData) {
        const { firstName, middleName, lastName, email, phone, dateOfBirth } = studentData;
        
        const [result] = await pool.execute(`
            INSERT INTO Students (first_name, middle_name, last_name, email, phone, date_of_birth)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [firstName, middleName, lastName, email, phone, dateOfBirth]);
        
        return result.insertId;
    }

    static async update(id, studentData) {
        const { firstName, middleName, lastName, email, phone, dateOfBirth, status } = studentData;
        
        const [result] = await pool.execute(`
            UPDATE Students 
            SET first_name = ?, middle_name = ?, last_name = ?, 
                email = ?, phone = ?, date_of_birth = ?, status = ?
            WHERE student_id = ?
        `, [firstName, middleName, lastName, email, phone, dateOfBirth, status, id]);
        
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

export default Student;
