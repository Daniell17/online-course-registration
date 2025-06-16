const { pool } = require('../config/database');

const analyticsController = {
    getDashboard: async (req, res) => {
        try {
            const [stats] = await pool.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM Students) as total_students,
                    (SELECT COUNT(*) FROM Courses WHERE status = 'Active') as active_courses,
                    (SELECT COUNT(*) FROM Enrollments) as total_enrollments,
                    (SELECT COALESCE(SUM(amount), 0) FROM Payments WHERE payment_status = 'Completed') as total_revenue
            `);

            res.json({
                success: true,
                data: stats[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching dashboard data',
                error: error.message
            });
        }
    },

    getRevenue: async (req, res) => {
        try {
            const [rows] = await pool.execute(`
                SELECT * FROM vw_FinancialSummary 
                ORDER BY payment_month DESC 
                LIMIT 12
            `);

            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching revenue data',
                error: error.message
            });
        }
    },

    getCourseAnalytics: async (req, res) => {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    c.course_name,
                    c.category,
                    COUNT(e.enrollment_id) as total_enrollments,
                    COUNT(CASE WHEN e.status = 'Completed' THEN 1 END) as completions,
                    COUNT(CASE WHEN e.status = 'Dropped' THEN 1 END) as dropouts,
                    ROUND(
                        (COUNT(CASE WHEN e.status = 'Completed' THEN 1 END) * 100.0 / 
                         NULLIF(COUNT(e.enrollment_id), 0)), 2
                    ) as completion_rate,
                    AVG(CASE WHEN e.grade IS NOT NULL THEN e.grade END) as average_grade
                FROM Courses c
                LEFT JOIN Enrollments e ON c.course_id = e.course_id
                GROUP BY c.course_id, c.course_name, c.category
                HAVING total_enrollments > 0
                ORDER BY completion_rate DESC
            `);

            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching course analytics',
                error: error.message
            });
        }
    }
};

module.exports = analyticsController;
