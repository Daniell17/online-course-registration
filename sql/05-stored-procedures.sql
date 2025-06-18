DELIMITER //

CREATE PROCEDURE GetCourseEnrollmentReport(
    IN p_course_id INT,       
    IN p_status VARCHAR(20)      
)
BEGIN
    DECLARE course_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO course_exists 
    FROM Courses 
    WHERE course_id = p_course_id;
    
    IF course_exists = 0 THEN
        SELECT 'Gabim: Kursi nuk u gjet' as message;
    ELSE
        SELECT 
            c.course_name as emri_kursit,
            c.course_code as kodi_kursit,
            c.credits as kreditet,
            c.price as cmimi,
            c.max_students as max_studentet,
            c.start_date as data_fillimit,
            c.end_date as data_perfundimit,
            c.status as statusi_kursit,
            COUNT(e.enrollment_id) as total_regjistrimet,
            COUNT(CASE WHEN e.status = 'Enrolled' THEN 1 END) as regjistrimet_aktive,
            COUNT(CASE WHEN e.status = 'Completed' THEN 1 END) as regjistrimet_perfunduar,
            COUNT(CASE WHEN e.status = 'Dropped' THEN 1 END) as regjistrimet_lene,
            (c.max_students - COUNT(CASE WHEN e.status IN ('Enrolled', 'Completed') THEN 1 END)) as vendet_boshe,
            COALESCE(SUM(p.amount), 0) as te_ardhurat_totale
        FROM Courses c
        LEFT JOIN Enrollments e ON c.course_id = e.course_id
        LEFT JOIN Payments p ON e.enrollment_id = p.enrollment_id AND p.payment_status = 'Completed'
        WHERE c.course_id = p_course_id
        GROUP BY c.course_id, c.course_name, c.course_code, c.credits, c.price, 
                 c.max_students, c.start_date, c.end_date, c.status;
        
        IF p_status IS NOT NULL AND p_status != '' THEN
            SELECT 
                s.student_id as id_studenti,
                CONCAT(s.first_name, ' ', s.last_name) as emri_studenti,
                s.email,
                e.enrollment_date as data_regjistrimit,
                e.status as statusi,
                e.grade as nota,
                COALESCE(SUM(p.amount), 0) as totali_paguar
            FROM Enrollments e
            INNER JOIN Students s ON e.student_id = s.student_id
            LEFT JOIN Payments p ON e.enrollment_id = p.enrollment_id AND p.payment_status = 'Completed'
            WHERE e.course_id = p_course_id 
              AND (p_status = 'All' OR e.status = p_status)
            GROUP BY s.student_id, s.first_name, s.last_name, s.email, 
                     e.enrollment_date, e.status, e.grade
            ORDER BY e.enrollment_date DESC;
        END IF;
    END IF;
END //

CREATE PROCEDURE UpdateEnrollmentStatus(
    IN p_enrollment_id INT,       
    IN p_new_status VARCHAR(20),    
    IN p_grade DECIMAL(3,2),
    OUT p_result_message VARCHAR(255),
)
BEGIN
    DECLARE enrollment_exists INT DEFAULT 0;
    DECLARE current_status VARCHAR(20);
    DECLARE student_name VARCHAR(101);
    DECLARE course_name VARCHAR(100);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result_message = 'Gabim: Transaksioni deshtoi per shkak te gabimit ne bazen e te dhenave';
    END;
    
    START TRANSACTION;
    
    SELECT COUNT(*), MAX(e.status), 
           MAX(CONCAT(s.first_name, ' ', s.last_name)),
           MAX(c.course_name)
    INTO enrollment_exists, current_status, student_name, course_name
    FROM Enrollments e
    INNER JOIN Students s ON e.student_id = s.student_id
    INNER JOIN Courses c ON e.course_id = c.course_id
    WHERE e.enrollment_id = p_enrollment_id;
    
    IF enrollment_exists = 0 THEN
        SET p_result_message = 'Gabim: Regjistrimi nuk u gjet';
        ROLLBACK;
    ELSEIF current_status = p_new_status THEN
        SET p_result_message = CONCAT('Paralajmerim: Regjistrimi ka tashme statusin: ', p_new_status);
        ROLLBACK;
    ELSE
        IF (current_status = 'Dropped' AND p_new_status != 'Enrolled') OR
           (current_status = 'Completed' AND p_new_status NOT IN ('Enrolled', 'Failed')) THEN
            SET p_result_message = CONCAT('Gabim: Ndryshim i pavlefshem statusi nga ', current_status, ' ne ', p_new_status);
            ROLLBACK;
        ELSE
            UPDATE Enrollments 
            SET status = p_new_status,
                grade = CASE 
                    WHEN p_new_status IN ('Completed', 'Failed') THEN p_grade 
                    ELSE NULL 
                END
            WHERE enrollment_id = p_enrollment_id;
                        
            SET p_result_message = CONCAT(
                'Sukses: U perditesua regjistrimi per ', student_name, 
                ' ne kursin ', course_name, 
                ' nga statusi ', current_status, ' ne ', p_new_status
            );
            
            COMMIT;
        END IF;
    END IF;
END //

DELIMITER ;
