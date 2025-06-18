-- Function 1: Calculate Student GPA
CREATE FUNCTION CalculateStudentGPA(p_student_id INT)
RETURNS DECIMAL(3,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE student_gpa DECIMAL(3,2) DEFAULT 0.00;
    
    SELECT AVG(grade)
    INTO student_gpa
    FROM Enrollments
    WHERE student_id = p_student_id 
      AND grade IS NOT NULL
      AND status = 'Completed';
    
    RETURN COALESCE(student_gpa, 0.00);
END //

-- Function 2: Get Available Spots in Course
CREATE FUNCTION GetAvailableSpots(p_course_id INT)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE max_capacity INT DEFAULT 0;
    DECLARE current_enrollment INT DEFAULT 0;
    DECLARE available_spots INT DEFAULT 0;
    
    SELECT max_students INTO max_capacity
    FROM Courses
    WHERE course_id = p_course_id;
    
    SELECT COUNT(*)
    INTO current_enrollment
    FROM Enrollments
    WHERE course_id = p_course_id 
      AND status IN ('Enrolled', 'Completed');
    
    SET available_spots = max_capacity - current_enrollment;
    
    RETURN GREATEST(available_spots, 0);
END //

-- Procedure 3: Bulk Enrollment with Validation
CREATE PROCEDURE BulkEnrollStudents(
    IN p_course_id INT,
    IN p_student_ids TEXT, -- Comma-separated student IDs
    OUT p_success_count INT,
    OUT p_error_messages TEXT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE current_student_id INT;
    DECLARE temp_student_id VARCHAR(10);
    DECLARE pos INT DEFAULT 1;
    DECLARE next_pos INT;
    DECLARE student_list TEXT;
    DECLARE error_msg TEXT DEFAULT '';
    DECLARE success_counter INT DEFAULT 0;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            error_msg = MESSAGE_TEXT;
        SET p_error_messages = CONCAT(COALESCE(p_error_messages, ''), 
                                     'Student ', current_student_id, ': ', error_msg, '; ');
    END;
    
    SET student_list = CONCAT(p_student_ids, ',');
    SET p_error_messages = '';
    
    -- Parse comma-separated student IDs
    WHILE pos <= LENGTH(student_list) DO
        SET next_pos = LOCATE(',', student_list, pos);
        
        IF next_pos > pos THEN
            SET temp_student_id = TRIM(SUBSTRING(student_list, pos, next_pos - pos));
            SET current_student_id = CAST(temp_student_id AS UNSIGNED);
            
            -- Validate student exists
            IF (SELECT COUNT(*) FROM Students WHERE student_id = current_student_id) > 0 THEN
                -- Check if already enrolled
                IF (SELECT COUNT(*) FROM Enrollments 
                    WHERE student_id = current_student_id AND course_id = p_course_id) = 0 THEN
                    
                    -- Attempt enrollment
                    INSERT INTO Enrollments (student_id, course_id)
                    VALUES (current_student_id, p_course_id);
                    
                    SET success_counter = success_counter + 1;
                ELSE
                    SET p_error_messages = CONCAT(COALESCE(p_error_messages, ''), 
                                                 'Student ', current_student_id, ': Already enrolled; ');
                END IF;
            ELSE
                SET p_error_messages = CONCAT(COALESCE(p_error_messages, ''), 
                                             'Student ', current_student_id, ': Does not exist; ');
            END IF;
        END IF;
        
        SET pos = next_pos + 1;
    END WHILE;
    
    SET p_success_count = success_counter;
END //

-- Procedure 4: Generate Student Transcript
CREATE PROCEDURE GenerateStudentTranscript(
    IN p_student_id INT
)
BEGIN
    DECLARE student_exists INT DEFAULT 0;
    
    -- Check if student exists
    SELECT COUNT(*) INTO student_exists
    FROM Students
    WHERE student_id = p_student_id;
    
    IF student_exists = 0 THEN
        SELECT 'Error: Student not found' as message;
    ELSE
        -- Student Information
        SELECT 
            s.student_id,
            CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) as full_name,
            s.email,
            s.registration_date,
            CalculateStudentGPA(s.student_id) as current_gpa
        FROM Students s
        WHERE s.student_id = p_student_id;
        
        -- Course History
        SELECT 
            c.course_code,
            c.course_name,
            c.credits,
            e.enrollment_date,
            e.status,
            COALESCE(e.grade, 'N/A') as grade,
            CASE 
                WHEN e.status = 'Completed' AND e.grade >= 2.0 THEN 'PASS'
                WHEN e.status = 'Completed' AND e.grade < 2.0 THEN 'FAIL'
                WHEN e.status = 'Failed' THEN 'FAIL'
                ELSE 'IN PROGRESS'
            END as result
        FROM Enrollments e
        INNER JOIN Courses c ON e.course_id = c.course_id
        WHERE e.student_id = p_student_id
        ORDER BY e.enrollment_date DESC;
        
        -- Summary Statistics
        SELECT 
            COUNT(*) as total_courses,
            COUNT(CASE WHEN e.status = 'Completed' THEN 1 END) as completed_courses,
            COUNT(CASE WHEN e.status = 'Enrolled' THEN 1 END) as current_enrollments,
            SUM(CASE WHEN e.status = 'Completed' THEN c.credits ELSE 0 END) as total_credits,
            CalculateStudentGPA(p_student_id) as gpa
        FROM Enrollments e
        INNER JOIN Courses c ON e.course_id = c.course_id
        WHERE e.student_id = p_student_id;
    END IF;
END //

-- Procedure 5: Course Waitlist Management
CREATE PROCEDURE ManageCourseWaitlist(
    IN p_course_id INT,
    IN p_action VARCHAR(20), -- 'ADD', 'REMOVE', 'PROCESS'
    IN p_student_id INT,
    OUT p_result_message VARCHAR(255)
)
BEGIN
    DECLARE available_spots INT;
    DECLARE waitlist_position INT;
    
    SET available_spots = GetAvailableSpots(p_course_id);
    
    CASE p_action
        WHEN 'ADD' THEN
            IF available_spots > 0 THEN
                -- Direct enrollment if spots available
                INSERT INTO Enrollments (student_id, course_id)
                VALUES (p_student_id, p_course_id);
                SET p_result_message = 'Student enrolled directly - spots available';
            ELSE
                -- Add to waitlist (would need a waitlist table in real implementation)
                SET p_result_message = 'Student added to waitlist - course full';
            END IF;
            
        WHEN 'REMOVE' THEN
            DELETE FROM Enrollments 
            WHERE student_id = p_student_id AND course_id = p_course_id AND status = 'Enrolled';
            SET p_result_message = 'Student removed from course';
            
        WHEN 'PROCESS' THEN
            -- Process waitlist when spots become available
            SET p_result_message = CONCAT('Available spots: ', available_spots);
            
        ELSE
            SET p_result_message = 'Invalid action specified';
    END CASE;
END //

DELIMITER ;
