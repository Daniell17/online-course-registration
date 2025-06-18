
SHOW INDEX FROM Students;
SHOW INDEX FROM Courses;
SHOW INDEX FROM Enrollments;
SHOW INDEX FROM Payments;

CREATE INDEX idx_students_status ON Students(status);
CREATE INDEX idx_students_registration_date ON Students(registration_date);
CREATE INDEX idx_courses_category_status ON Courses(category, status);
CREATE INDEX idx_courses_dates ON Courses(start_date, end_date);
CREATE INDEX idx_enrollments_student_status ON Enrollments(student_id, status);
CREATE INDEX idx_enrollments_course_status ON Enrollments(course_id, status);
CREATE INDEX idx_payments_date_status ON Payments(payment_date, payment_status);
CREATE INDEX idx_payments_method ON Payments(payment_method);

DELIMITER //

CREATE PROCEDURE PerformDatabaseMaintenance()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name VARCHAR(64);
    DECLARE maintenance_cursor CURSOR FOR 
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'online_course_registration' 
          AND TABLE_TYPE = 'BASE TABLE';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN maintenance_cursor;
    
    maintenance_loop: LOOP
        FETCH maintenance_cursor INTO table_name;
        IF done THEN
            LEAVE maintenance_loop;
        END IF;
        
        SET @sql = CONCAT('OPTIMIZE TABLE ', table_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @sql = CONCAT('ANALYZE TABLE ', table_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
    END LOOP;
    
    CLOSE maintenance_cursor;
    
    SELECT 'Database maintenance completed successfully' as message;
END //

CREATE PROCEDURE ArchiveOldData(
    IN p_archive_before_date DATE,
    OUT p_archived_count INT
)
BEGIN
    DECLARE archived_enrollments INT DEFAULT 0;
    DECLARE archived_payments INT DEFAULT 0;
    
    START TRANSACTION;
    
    CREATE TEMPORARY TABLE temp_archived_enrollments AS
    SELECT e.*
    FROM Enrollments e
    INNER JOIN Courses c ON e.course_id = c.course_id
    WHERE c.end_date < p_archive_before_date 
      AND e.status IN ('Completed', 'Dropped');
    
    SELECT COUNT(*) INTO archived_enrollments FROM temp_archived_enrollments;
    
    CREATE TEMPORARY TABLE temp_archived_payments AS
    SELECT p.*
    FROM Payments p
    INNER JOIN temp_archived_enrollments tae ON p.enrollment_id = tae.enrollment_id;
    
    SELECT COUNT(*) INTO archived_payments FROM temp_archived_payments;
    
    -- INSERT INTO archived_payments SELECT * FROM temp_archived_payments;
    -- INSERT INTO archived_enrollments SELECT * FROM temp_archived_enrollments;
    
    -- DELETE p FROM Payments p INNER JOIN temp_archived_payments tap ON p.payment_id = tap.payment_id;
    -- DELETE e FROM Enrollments e INNER JOIN temp_archived_enrollments tae ON e.enrollment_id = tae.enrollment_id;
    
    DROP TEMPORARY TABLE temp_archived_enrollments;
    DROP TEMPORARY TABLE temp_archived_payments;
    
    SET p_archived_count = archived_enrollments + archived_payments;
    
    COMMIT;
    
    SELECT CONCAT('Would archive ', archived_enrollments, ' enrollments and ', archived_payments, ' payments') as message;
END //

CREATE PROCEDURE DatabaseHealthCheck()
BEGIN
    SELECT 'Orphaned Enrollments Check' as check_type,
           COUNT(*) as issue_count
    FROM Enrollments e
    LEFT JOIN Students s ON e.student_id = s.student_id
    LEFT JOIN Courses c ON e.course_id = c.course_id
    WHERE s.student_id IS NULL OR c.course_id IS NULL
    
    UNION ALL
    
    SELECT 'Orphaned Payments Check' as check_type,
           COUNT(*) as issue_count
    FROM Payments p
    LEFT JOIN Enrollments e ON p.enrollment_id = e.enrollment_id
    WHERE e.enrollment_id IS NULL
    
    UNION ALL
    
    SELECT 'Invalid Grades Check' as check_type,
           COUNT(*) as issue_count
    FROM Enrollments
    WHERE grade IS NOT NULL AND (grade < 0.00 OR grade > 4.00)
    
    UNION ALL
    
    SELECT 'Duplicate Enrollments Check' as check_type,
           COUNT(*) - COUNT(DISTINCT CONCAT(student_id, '-', course_id)) as issue_count
    FROM Enrollments
    
    UNION ALL
    
    SELECT 'Overenrolled Courses Check' as check_type,
           COUNT(*) as issue_count
    FROM (
        SELECT c.course_id, c.max_students, COUNT(e.enrollment_id) as current_count
        FROM Courses c
        LEFT JOIN Enrollments e ON c.course_id = e.course_id AND e.status IN ('Enrolled', 'Completed')
        GROUP BY c.course_id, c.max_students
        HAVING current_count > c.max_students
    ) overenrolled;
    
    SELECT 
        TABLE_NAME as table_name,
        TABLE_ROWS as estimated_rows,
        ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as size_mb
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'online_course_registration'
      AND TABLE_TYPE = 'BASE TABLE'
    ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
END //

DELIMITER ;


SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME,
    COUNT_FETCH,
    COUNT_INSERT,
    COUNT_UPDATE,
    COUNT_DELETE
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'online_course_registration'
ORDER BY COUNT_FETCH DESC;

SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    COUNT_READ,
    COUNT_WRITE,
    COUNT_READ_NORMAL,
    COUNT_READ_WITH_SHARED_LOCKS
FROM performance_schema.table_io_waits_summary_by_table
WHERE OBJECT_SCHEMA = 'online_course_registration'
ORDER BY COUNT_READ DESC;
