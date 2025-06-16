
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
    AVG(CASE WHEN e.grade IS NOT NULL THEN e.grade END) as average_grade,
    SUM(p.amount) as total_revenue
FROM Courses c
LEFT JOIN Enrollments e ON c.course_id = e.course_id
LEFT JOIN Payments p ON e.enrollment_id = p.enrollment_id AND p.payment_status = 'Completed'
GROUP BY c.course_id, c.course_name, c.category
HAVING total_enrollments > 0
ORDER BY completion_rate DESC, total_revenue DESC;

SELECT 
    s.student_id,
    s.full_name,
    s.total_enrollments,
    s.active_enrollments,
    s.gpa,
    CASE 
        WHEN s.gpa IS NULL AND s.active_enrollments > 0 THEN 'New Student'
        WHEN s.gpa >= 3.5 THEN 'High Performer'
        WHEN s.gpa >= 3.0 THEN 'Good Standing'
        WHEN s.gpa >= 2.5 THEN 'At Risk'
        WHEN s.gpa < 2.5 THEN 'Critical Risk'
        ELSE 'No Grades'
    END as risk_category,
    s.total_paid,
    pending_payments.pending_amount
FROM vw_StudentDashboard s
LEFT JOIN (
    SELECT e.student_id, SUM(p.amount) as pending_amount
    FROM Enrollments e
    INNER JOIN Payments p ON e.enrollment_id = p.enrollment_id
    WHERE p.payment_status = 'Pending'
    GROUP BY e.student_id
) pending_payments ON s.student_id = pending_payments.student_id
ORDER BY 
    CASE 
        WHEN s.gpa IS NULL THEN 5
        WHEN s.gpa < 2.5 THEN 1
        WHEN s.gpa < 3.0 THEN 2
        WHEN s.gpa < 3.5 THEN 3
        ELSE 4
    END,
    s.gpa DESC;

-- Query 3: Instructor Workload and Performance Analysis
SELECT 
    i.instructor_id,
    CONCAT(i.first_name, ' ', i.last_name) as instructor_name,
    i.specialization,
    COUNT(DISTINCT ci.course_id) as courses_teaching,
    COUNT(DISTINCT e.student_id) as total_students,
    AVG(CASE WHEN e.grade IS NOT NULL THEN e.grade END) as avg_student_grade,
    COUNT(CASE WHEN e.status = 'Completed' THEN 1 END) as students_completed,
    COUNT(CASE WHEN e.status = 'Dropped' THEN 1 END) as students_dropped,
    ROUND(
        (COUNT(CASE WHEN e.status = 'Completed' THEN 1 END) * 100.0 / 
         NULLIF(COUNT(e.enrollment_id), 0)), 2
    ) as retention_rate
FROM Instructors i
LEFT JOIN CourseInstructors ci ON i.instructor_id = ci.instructor_id AND ci.role = 'Primary'
LEFT JOIN Enrollments e ON ci.course_id = e.course_id
GROUP BY i.instructor_id, i.first_name, i.last_name, i.specialization
ORDER BY retention_rate DESC, avg_student_grade DESC;

-- Query 4: Revenue Forecasting and Trend Analysis
SELECT 
    payment_month,
    completed_revenue,
    LAG(completed_revenue) OVER (ORDER BY payment_month) as previous_month_revenue,
    completed_revenue - LAG(completed_revenue) OVER (ORDER BY payment_month) as revenue_change,
    ROUND(
        ((completed_revenue - LAG(completed_revenue) OVER (ORDER BY payment_month)) * 100.0 / 
         NULLIF(LAG(completed_revenue) OVER (ORDER BY payment_month), 0)), 2
    ) as growth_percentage,
    AVG(completed_revenue) OVER (ORDER BY payment_month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as three_month_avg
FROM vw_FinancialSummary
ORDER BY payment_month DESC;

-- Query 5: Course Recommendation System (Students who enrolled in X also enrolled in Y)
SELECT 
    c1.course_name as base_course,
    c2.course_name as recommended_course,
    COUNT(*) as co_enrollment_count,
    ROUND(
        COUNT(*) * 100.0 / (
            SELECT COUNT(DISTINCT student_id) 
            FROM Enrollments 
            WHERE course_id = c1.course_id
        ), 2
    ) as recommendation_strength
FROM Enrollments e1
INNER JOIN Enrollments e2 ON e1.student_id = e2.student_id AND e1.course_id != e2.course_id
INNER JOIN Courses c1 ON e1.course_id = c1.course_id
INNER JOIN Courses c2 ON e2.course_id = c2.course_id
WHERE c1.status = 'Active' AND c2.status = 'Active'
GROUP BY c1.course_id, c1.course_name, c2.course_id, c2.course_name
HAVING co_enrollment_count >= 2
ORDER BY c1.course_name, recommendation_strength DESC;

-- Query 6: Time-based Enrollment Patterns
SELECT 
    HOUR(enrollment_date) as enrollment_hour,
    DAYOFWEEK(enrollment_date) as day_of_week,
    CASE DAYOFWEEK(enrollment_date)
        WHEN 1 THEN 'Sunday'
        WHEN 2 THEN 'Monday'
        WHEN 3 THEN 'Tuesday'
        WHEN 4 THEN 'Wednesday'
        WHEN 5 THEN 'Thursday'
        WHEN 6 THEN 'Friday'
        WHEN 7 THEN 'Saturday'
    END as day_name,
    COUNT(*) as enrollment_count
FROM Enrollments
GROUP BY HOUR(enrollment_date), DAYOFWEEK(enrollment_date)
ORDER BY day_of_week, enrollment_hour;
