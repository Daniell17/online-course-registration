CREATE VIEW vw_StudentDashboard AS
SELECT 
    s.student_id,
    CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) as full_name,
    s.email,
    s.phone,
    s.status as student_status,
    COUNT(e.enrollment_id) as total_enrollments,
    COUNT(CASE WHEN e.status = 'Enrolled' THEN 1 END) as active_enrollments,
    COUNT(CASE WHEN e.status = 'Completed' THEN 1 END) as completed_courses,
    AVG(CASE WHEN e.grade IS NOT NULL THEN e.grade END) as gpa,
    COALESCE(SUM(p.amount), 0) as total_paid,
    s.registration_date
FROM Students s
LEFT JOIN Enrollments e ON s.student_id = e.student_id
LEFT JOIN Payments p ON e.enrollment_id = p.enrollment_id AND p.payment_status = 'Completed'
GROUP BY s.student_id, s.first_name, s.middle_name, s.last_name, s.email, s.phone, s.status, s.registration_date;

CREATE VIEW vw_CourseCatalog AS
SELECT 
    c.course_id,
    c.course_name,
    c.course_code,
    c.description,
    c.credits,
    c.price,
    c.category,
    c.max_students,
    c.start_date,
    c.end_date,
    c.status,
    COUNT(e.enrollment_id) as current_enrollments,
    (c.max_students - COUNT(e.enrollment_id)) as available_spots,
    GROUP_CONCAT(CONCAT(i.first_name, ' ', i.last_name, ' (', ci.role, ')') SEPARATOR ', ') as instructors
FROM Courses c
LEFT JOIN Enrollments e ON c.course_id = e.course_id AND e.status IN ('Enrolled', 'Completed')
LEFT JOIN CourseInstructors ci ON c.course_id = ci.course_id
LEFT JOIN Instructors i ON ci.instructor_id = i.instructor_id
GROUP BY c.course_id, c.course_name, c.course_code, c.description, c.credits, c.price, 
         c.category, c.max_students, c.start_date, c.end_date, c.status;

CREATE VIEW vw_FinancialSummary AS
SELECT 
    DATE_FORMAT(p.payment_date, '%Y-%m') as payment_month,
    COUNT(p.payment_id) as total_transactions,
    SUM(CASE WHEN p.payment_status = 'Completed' THEN p.amount ELSE 0 END) as completed_revenue,
    SUM(CASE WHEN p.payment_status = 'Pending' THEN p.amount ELSE 0 END) as pending_revenue,
    SUM(CASE WHEN p.payment_status = 'Refunded' THEN p.amount ELSE 0 END) as refunded_amount,
    COUNT(DISTINCT e.student_id) as unique_paying_students
FROM Payments p
INNER JOIN Enrollments e ON p.enrollment_id = e.enrollment_id
GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m')
ORDER BY payment_month DESC;


DELIMITER //

CREATE TRIGGER tr_UpdateCourseStatus
BEFORE UPDATE ON Courses
FOR EACH ROW
BEGIN
    IF NEW.end_date < CURDATE() AND NEW.status = 'Active' THEN
        SET NEW.status = 'Completed';
    END IF;
END //

CREATE TRIGGER tr_PreventOverEnrollment
BEFORE INSERT ON Enrollments
FOR EACH ROW
BEGIN
    DECLARE current_enrollment_count INT;
    DECLARE max_allowed INT;
    
    SELECT COUNT(*), MAX(c.max_students)
    INTO current_enrollment_count, max_allowed
    FROM Enrollments e
    INNER JOIN Courses c ON e.course_id = c.course_id
    WHERE e.course_id = NEW.course_id 
      AND e.status IN ('Enrolled', 'Completed')
      AND c.course_id = NEW.course_id;
    
    IF current_enrollment_count >= max_allowed THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Cannot enroll: Course is at maximum capacity';
    END IF;
END //

CREATE TRIGGER tr_CreatePaymentRecord
AFTER INSERT ON Enrollments
FOR EACH ROW
BEGIN
    DECLARE course_price DECIMAL(10,2);
    
    SELECT price INTO course_price
    FROM Courses
    WHERE course_id = NEW.course_id;
    
    INSERT INTO Payments (enrollment_id, amount, payment_method, payment_status)
    VALUES (NEW.enrollment_id, course_price, 'Pending', 'Pending');
END //

CREATE TRIGGER tr_UpdateStudentStatus
AFTER UPDATE ON Enrollments
FOR EACH ROW
BEGIN
    DECLARE active_enrollments INT;
    DECLARE completed_enrollments INT;
    
    SELECT 
        COUNT(CASE WHEN status = 'Enrolled' THEN 1 END),
        COUNT(CASE WHEN status = 'Completed' THEN 1 END)
    INTO active_enrollments, completed_enrollments
    FROM Enrollments
    WHERE student_id = NEW.student_id;
    
    UPDATE Students 
    SET status = CASE 
        WHEN active_enrollments > 0 THEN 'Active'
        WHEN completed_enrollments >= 5 THEN 'Graduated'
        ELSE 'Inactive'
    END
    WHERE student_id = NEW.student_id;
END //

DELIMITER ;
