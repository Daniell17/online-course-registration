SELECT course_id, course_name, course_code, price, credits
FROM Courses
WHERE status = 'Active' AND price > 700.00
ORDER BY price DESC;

SELECT s.first_name, s.last_name, s.email, c.course_name, c.course_code, e.enrollment_date, e.status
FROM Students s
INNER JOIN Enrollments e ON s.student_id = e.student_id
INNER JOIN Courses c ON e.course_id = c.course_id
WHERE e.status = 'Enrolled'
ORDER BY s.last_name, s.first_name;

SELECT s.student_id, s.first_name, s.last_name, s.email, 
       COUNT(e.enrollment_id) as total_enrollments
FROM Students s
LEFT JOIN Enrollments e ON s.student_id = e.student_id
GROUP BY s.student_id, s.first_name, s.last_name, s.email
ORDER BY total_enrollments DESC;

SELECT c.course_name, c.course_code, c.max_students,
       COUNT(e.enrollment_id) as current_enrollments,
       (c.max_students - COUNT(e.enrollment_id)) as available_spots
FROM Courses c
LEFT JOIN Enrollments e ON c.course_id = e.course_id AND e.status IN ('Enrolled', 'Completed')
WHERE c.status = 'Active'
GROUP BY c.course_id, c.course_name, c.course_code, c.max_students
ORDER BY current_enrollments DESC;

SELECT c.course_name, c.course_code,
       COUNT(p.payment_id) as total_payments,
       SUM(p.amount) as total_revenue,
       AVG(p.amount) as average_payment
FROM Courses c
INNER JOIN Enrollments e ON c.course_id = e.course_id
INNER JOIN Payments p ON e.enrollment_id = p.enrollment_id
WHERE p.payment_status = 'Completed'
GROUP BY c.course_id, c.course_name, c.course_code
ORDER BY total_revenue DESC;

SELECT s.first_name + ' ' + s.last_name as student_name,
       c.course_name,
       e.enrollment_date,
       e.status as enrollment_status,
       p.amount,
       p.payment_method,
       p.payment_status
FROM Students s
INNER JOIN Enrollments e ON s.student_id = e.student_id
INNER JOIN Courses c ON e.course_id = c.course_id
INNER JOIN Payments p ON e.enrollment_id = p.enrollment_id
WHERE p.payment_status = 'Completed'
ORDER BY e.enrollment_date DESC;

SELECT s.first_name, s.last_name, s.email
FROM Students s
WHERE s.student_id IN (
    SELECT DISTINCT e.student_id
    FROM Enrollments e
    INNER JOIN Courses c ON e.course_id = c.course_id
    WHERE c.price > (SELECT AVG(price) FROM Courses)
);

SELECT i.first_name, i.last_name, i.specialization,
       COUNT(ci.course_id) as courses_taught
FROM Instructors i
INNER JOIN CourseInstructors ci ON i.instructor_id = ci.instructor_id
INNER JOIN Courses c ON ci.course_id = c.course_id
GROUP BY i.instructor_id, i.first_name, i.last_name, i.specialization
HAVING COUNT(ci.course_id) > 1
ORDER BY courses_taught DESC;

SELECT s.first_name, s.last_name, c.course_name, e.enrollment_date
FROM Students s
INNER JOIN Enrollments e ON s.student_id = e.student_id
INNER JOIN Courses c ON e.course_id = c.course_id
WHERE e.enrollment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND e.status = 'Enrolled'
ORDER BY e.enrollment_date DESC;

SELECT s.student_id, s.first_name, s.last_name, s.email
FROM Students s
WHERE EXISTS (
    SELECT 1
    FROM Enrollments e
    INNER JOIN Payments p ON e.enrollment_id = p.enrollment_id
    WHERE e.student_id = s.student_id
      AND p.payment_status = 'Completed'
);

SELECT student_name, total_enrollments,
       @rank := @rank + 1 as ranking
FROM (
    SELECT CONCAT(s.first_name, ' ', s.last_name) as student_name,
           COUNT(e.enrollment_id) as total_enrollments
    FROM Students s
    LEFT JOIN Enrollments e ON s.student_id = e.student_id
    GROUP BY s.student_id, s.first_name, s.last_name
    ORDER BY total_enrollments DESC
) ranked_students
CROSS JOIN (SELECT @rank := 0) r;

SELECT DATE_FORMAT(e.enrollment_date, '%Y-%m') as enrollment_month,
       COUNT(e.enrollment_id) as total_enrollments,
       COUNT(DISTINCT e.student_id) as unique_students,
       COUNT(DISTINCT e.course_id) as courses_enrolled,
       SUM(c.price) as potential_revenue
FROM Enrollments e
INNER JOIN Courses c ON e.course_id = c.course_id
WHERE e.enrollment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY DATE_FORMAT(e.enrollment_date, '%Y-%m')
ORDER BY enrollment_month DESC;
