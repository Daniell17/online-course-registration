-- SHEMBUJ Te ALTER TABLE - Ndryshimi i struktures se tabelave

-- Shto nje kolone te re ne tabelen e Studenteve
ALTER TABLE Students 
ADD COLUMN middle_name VARCHAR(50) AFTER first_name;

-- Shto kolone te re per statusin e studentit
ALTER TABLE Students 
ADD COLUMN status ENUM('Active', 'Inactive', 'Graduated', 'Suspended') DEFAULT 'Active';

-- Shto kolone te re ne tabelen e Kurseve per kategorine e kursit
ALTER TABLE Courses 
ADD COLUMN category VARCHAR(50) DEFAULT 'General';

-- Ndrysho madhesine e kolones ekzistuese
ALTER TABLE Instructors 
MODIFY COLUMN specialization VARCHAR(200);

-- Shto indeks te ri per performance me te mire te kerkimeve
ALTER TABLE Enrollments 
ADD INDEX idx_enrollment_date (enrollment_date);

-- Shto check constraint per validimin e notes (MySQL 8.0+)
-- ALTER TABLE Enrollments 
-- ADD CONSTRAINT chk_grade CHECK (grade >= 0.00 AND grade <= 4.00);

-- Perditeso kolonat e reja me te dhena shembull
UPDATE Students SET category = 'Shkencat Kompjuterike' WHERE student_id IN (1, 2, 4);
UPDATE Students SET category = 'Matematike' WHERE student_id = 3;
UPDATE Students SET category = 'Biznes' WHERE student_id IN (5, 6);
UPDATE Students SET category = 'Pergjithshme' WHERE student_id IN (7, 8);

UPDATE Courses SET category = 'Shkencat Kompjuterike' WHERE course_code IN ('CS101', 'CS201', 'CS301', 'CS401');
UPDATE Courses SET category = 'Matematike' WHERE course_code = 'MATH101';
UPDATE Courses SET category = 'Biznes' WHERE course_code = 'BUS201';

-- SHEMBUJ Te DROP - Fshirja e elementeve (te komentuar per te ruajtur te dhenat)

-- Fshi nje indeks
-- ALTER TABLE Enrollments DROP INDEX idx_enrollment_date;

-- Fshi nje kolone
-- ALTER TABLE Students DROP COLUMN middle_name;

-- Fshi nje constraint
-- ALTER TABLE Enrollments DROP CONSTRAINT chk_grade;

-- Fshi nje tabele (behu shume i kujdesshem me kete!)
-- DROP TABLE IF EXISTS TestTable;

-- Krijo nje tabele te perkohshme per demonstrim
CREATE TEMPORARY TABLE TempEnrollmentStats AS
SELECT 
    course_id as id_kursi,
    COUNT(*) as numri_regjistrimi,
    AVG(CASE WHEN grade IS NOT NULL THEN grade END) as nota_mesatare
FROM Enrollments
GROUP BY course_id;

-- Shfaq tabelen e perkohshme
SELECT * FROM TempEnrollmentStats;

-- Fshi tabelen e perkohshme
DROP TEMPORARY TABLE TempEnrollmentStats;
