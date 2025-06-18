DELIMITER //

-- Procedura e Ruajtur 1: Gjenero Raportin e Regjistrimit ne Kurs
CREATE PROCEDURE GetCourseEnrollmentReport(
    IN p_course_id INT,                    -- ID e kursit per te cilin duam raport
    IN p_status VARCHAR(20)                -- Statusi i regjistrimit per filtrim (opsional)
)
BEGIN
    DECLARE course_exists INT DEFAULT 0;
    
    -- Kontrollo nese kursi ekziston
    SELECT COUNT(*) INTO course_exists 
    FROM Courses 
    WHERE course_id = p_course_id;
    
    IF course_exists = 0 THEN
        SELECT 'Gabim: Kursi nuk u gjet' as message;
    ELSE
        -- Kthe detajet e kursit dhe informacionin e regjistrimit
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
        
        -- Kthe listen e detajuar te regjistrimit nese jepet filtri i statusit
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

-- Procedura e Ruajtur 2: Perditeso Statusin e Regjistrimit me Validim
CREATE PROCEDURE UpdateEnrollmentStatus(
    IN p_enrollment_id INT,                -- ID e regjistrimit per te perditesuar
    IN p_new_status VARCHAR(20),           -- Statusi i ri
    IN p_grade DECIMAL(3,2),               -- Nota e re (nese perfundohet kursi)
    OUT p_result_message VARCHAR(255)      -- Mesazhi i rezultatit
)
BEGIN
    DECLARE enrollment_exists INT DEFAULT 0;
    DECLARE current_status VARCHAR(20);
    DECLARE student_name VARCHAR(101);
    DECLARE course_name VARCHAR(100);
    
    -- Trajto perjashtimet e bazes se te dhenave
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result_message = 'Gabim: Transaksioni deshtoi per shkak te gabimit ne bazen e te dhenave';
    END;
    
    START TRANSACTION;
    
    -- Kontrollo nese regjistrimi ekziston dhe merr detajet aktuale
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
        -- Valido ndryshimin e statusit (rregullat e biznesit)
        IF (current_status = 'Dropped' AND p_new_status != 'Enrolled') OR
           (current_status = 'Completed' AND p_new_status NOT IN ('Enrolled', 'Failed')) THEN
            SET p_result_message = CONCAT('Gabim: Ndryshim i pavlefshem statusi nga ', current_status, ' ne ', p_new_status);
            ROLLBACK;
        ELSE
            -- Perditeso regjistrimin
            UPDATE Enrollments 
            SET status = p_new_status,
                grade = CASE 
                    WHEN p_new_status IN ('Completed', 'Failed') THEN p_grade 
                    ELSE NULL 
                END
            WHERE enrollment_id = p_enrollment_id;
            
            -- Shenime: Ne nje sistem real do te shtohej nje tabele auditimi ketu
            
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

-- Shembuj te perdorimit te procedurave te ruajtura:

-- Shembulli 1: Merr raportin e regjistrimit per kursin 1 me te gjitha regjistrimet
-- CALL GetCourseEnrollmentReport(1, 'All');

-- Shembulli 2: Merr raportin e regjistrimit per kursin 2 vetem me studentet e regjistruar
-- CALL GetCourseEnrollmentReport(2, 'Enrolled');

-- Shembulli 3: Perditeso statusin e regjistrimit
-- CALL UpdateEnrollmentStatus(1, 'Completed', 3.75, @result);
-- SELECT @result as mesazhi_rezultatit;
-- CALL UpdateEnrollmentStatus(1, 'Completed', 3.75, @result);
-- SELECT @result as result_message;
