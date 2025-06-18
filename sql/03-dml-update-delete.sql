UPDATE Students 
SET phone = '+1234567899' 
WHERE student_id = 1;

UPDATE Courses 
SET status = 'Completed' 
WHERE course_code = 'WEB101';

UPDATE Enrollments 
SET status = 'Completed', grade = 3.85 
WHERE enrollment_id = 1;

UPDATE Payments 
SET payment_status = 'Completed' 
WHERE payment_id = 8;

UPDATE Instructors 
SET specialization = 'Inteligjenca Artificiale dhe Machine Learning' 
WHERE instructor_id = 5;

UPDATE Courses 
SET price = price * 1.10 
WHERE course_id IN (1, 2, 3);


DELETE FROM Enrollments 
WHERE student_id = 8 AND course_id = 6 AND status = 'Dropped';

DELETE FROM Courses 
WHERE status = 'Inactive' AND end_date < DATE_SUB(NOW(), INTERVAL 2 YEAR);

DELETE FROM Payments 
WHERE payment_status = 'Pending' AND payment_date < DATE_SUB(NOW(), INTERVAL 30 DAY);
