ALTER TABLE Students 
ADD COLUMN middle_name VARCHAR(50) AFTER first_name;

ALTER TABLE Students 
ADD COLUMN status ENUM('Active', 'Inactive', 'Graduated', 'Suspended') DEFAULT 'Active';

ALTER TABLE Courses 
ADD COLUMN category VARCHAR(50) DEFAULT 'General';

ALTER TABLE Instructors 
MODIFY COLUMN specialization VARCHAR(200);

ALTER TABLE Enrollments 
ADD INDEX idx_enrollment_date (enrollment_date);

UPDATE Students SET category = 'Shkencat Kompjuterike' WHERE student_id IN (1, 2, 4);
UPDATE Students SET category = 'Matematike' WHERE student_id = 3;
UPDATE Students SET category = 'Biznes' WHERE student_id IN (5, 6);
UPDATE Students SET category = 'Pergjithshme' WHERE student_id IN (7, 8);

UPDATE Courses SET category = 'Shkencat Kompjuterike' WHERE course_code IN ('CS101', 'CS201', 'CS301', 'CS401');
UPDATE Courses SET category = 'Matematike' WHERE course_code = 'MATH101';
UPDATE Courses SET category = 'Biznes' WHERE course_code = 'BUS201';


-- ALTER TABLE Enrollments DROP INDEX idx_enrollment_date;

-- ALTER TABLE Students DROP COLUMN middle_name;

-- ALTER TABLE Enrollments DROP CONSTRAINT chk_grade;

-- DROP TABLE IF EXISTS TestTable;

CREATE TEMPORARY TABLE TempEnrollmentStats AS
SELECT 
    course_id as id_kursi,
    COUNT(*) as numri_regjistrimi,
    AVG(CASE WHEN grade IS NOT NULL THEN grade END) as nota_mesatare
FROM Enrollments
GROUP BY course_id;

SELECT * FROM TempEnrollmentStats;

DROP TEMPORARY TABLE TempEnrollmentStats;
