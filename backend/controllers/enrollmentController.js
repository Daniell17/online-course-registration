const { pool } = require('../config/database');

const enrollmentController = {
    // /api/enrollments
    getAllEnrollments: async (req, res) => {
        try {
            const [rows] = await pool.execute(`
                SELECT e.enrollment_id, e.enrollment_date, e.status, e.grade,
                       CONCAT(s.first_name, ' ', s.last_name) as student_name,
                       c.course_name, c.course_code
                FROM Enrollments e
                INNER JOIN Students s ON e.student_id = s.student_id
                INNER JOIN Courses c ON e.course_id = c.course_id
                ORDER BY e.enrollment_date DESC
            `);
            
            res.json({
                success: true,
                data: rows,
                count: rows.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching enrollments',
                error: error.message
            });
        }
    },

    // /api/enrollments/:id/status
    updateEnrollmentStatus: async (req, res) => {
        try {
            const { status, grade } = req.body;
            
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            const [result] = await pool.execute(`
                CALL UpdateEnrollmentStatus(?, ?, ?, @result_message)
            `, [req.params.id, status, grade || null]);

            const [messageResult] = await pool.execute('SELECT @result_message as message');
            const message = messageResult[0].message;

            if (message.startsWith('Success:')) {
                res.json({
                    success: true,
                    message: message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: message
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating enrollment status',
                error: error.message
            });
        }
    },

    // /api/enrollments/:id
    deleteEnrollment: async (req, res) => {
        try {
            const [result] = await pool.execute(`
                DELETE FROM Enrollments WHERE enrollment_id = ?
            `, [req.params.id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Enrollment not found'
                });
            }

            res.json({
                success: true,
                message: 'Enrollment deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting enrollment',
                error: error.message
            });
        }
    }
};

module.exports = enrollmentController;
