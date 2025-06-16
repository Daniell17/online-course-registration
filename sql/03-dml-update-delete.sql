-- OPERACIONET UPDATE - Perditesimi i te dhenave ekzistuese

-- Perditeso numrin e telefonit te studentit
UPDATE Students 
SET phone = '+1234567899' 
WHERE student_id = 1;

-- Perditeso statusin e kursit si te perfunduar
UPDATE Courses 
SET status = 'Completed' 
WHERE course_code = 'WEB101';

-- Perditeso statusin e regjistrimit dhe noten per studente qe kane perfunduar
UPDATE Enrollments 
SET status = 'Completed', grade = 3.85 
WHERE enrollment_id = 1;

-- Perditeso statusin e pageses
UPDATE Payments 
SET payment_status = 'Completed' 
WHERE payment_id = 8;

-- Perditeso specializimin e instruktorit
UPDATE Instructors 
SET specialization = 'Inteligjenca Artificiale dhe Machine Learning' 
WHERE instructor_id = 5;

-- Rrit çmimin e kurseve me 10%
UPDATE Courses 
SET price = price * 1.10 
WHERE course_id IN (1, 2, 3);

-- OPERACIONET DELETE - Fshirja e te dhenave

-- Fshi nje regjistrim qe ka deshtuar/eshte lene
DELETE FROM Enrollments 
WHERE student_id = 8 AND course_id = 6 AND status = 'Dropped';

-- Fshi kurset e vjetra joaktive (demo - nuk ka kurse te vjetra ne te dhenat tona)
DELETE FROM Courses 
WHERE status = 'Inactive' AND end_date < DATE_SUB(NOW(), INTERVAL 2 YEAR);

-- Fshi pagesat ne pritje me te vjetra se 30 dite (demo)
DELETE FROM Payments 
WHERE payment_status = 'Pending' AND payment_date < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Fshi studentet qe nuk jane regjistruar kurre (demo - cascade do te trajtoje rekordet e lidhura)
-- DELETE FROM Students 
-- WHERE student_id NOT IN (SELECT DISTINCT student_id FROM Enrollments);
