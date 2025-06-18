INSERT INTO Students (first_name, last_name, email, phone, date_of_birth) VALUES
('Ardit', 'Hoxha', 'ardit.hoxha@email.com', '+355671234567', '1995-05-15'),
('Klara', 'Rama', 'klara.rama@email.com', '+355671234568', '1993-08-22'),
('Endrit', 'Berisha', 'endrit.berisha@email.com', '+355671234569', '1996-03-10'),
('Elona', 'Krasniqi', 'elona.krasniqi@email.com', '+355671234570', '1994-11-05'),
('Gentian', 'Sulaj', 'gentian.sulaj@email.com', '+355671234571', '1997-01-18'),
('Brunilda', 'Gashi', 'brunilda.gashi@email.com', '+355671234572', '1995-07-30'),
('Besnik', 'Vuçitërna', 'besnik.vucitterna@email.com', '+355671234573', '1992-12-03'),
('Manjola', 'Kastrati', 'manjola.kastrati@email.com', '+355671234574', '1998-04-25'),
('Flamur', 'Balaj', 'flamur.balaj@email.com', '+355671234575', '1994-09-12'),
('Anxhela', 'Nikollaj', 'anxhela.nikollaj@email.com', '+355671234576', '1996-06-18');

INSERT INTO Instructors (first_name, last_name, email, phone, specialization, hire_date) VALUES
('Dr. Arben', 'Krasniqi', 'arben.krasniqi@universiteti.edu.al', '+355692345678', 'Computer Science', '2015-08-01'),
('Prof. Mirela', 'Hoxha', 'mirela.hoxha@universiteti.edu.al', '+355693456789', 'Mathematics', '2012-01-15'),
('Dr. Gentian', 'Rama', 'gentian.rama@universiteti.edu.al', '+355694567890', 'Physics', '2018-03-10'),
('Prof. Elvira', 'Beqiri', 'elvira.beqiri@universiteti.edu.al', '+355695678901', 'Business Administration', '2010-09-01'),
('Dr. Alban', 'Zeneli', 'alban.zeneli@universiteti.edu.al', '+355696789012', 'Data Science', '2020-01-20');

INSERT INTO Courses (course_name, course_code, description, credits, price, max_students, start_date, end_date, status) VALUES
('Hyrje ne Programim', 'CS101', 'Konceptet baze te programimit duke perdorur Python', 3, 599.99, 25, '2024-01-15', '2024-05-15', 'Active'),
('Sisteme te Avancuara Bazash te Dhenash', 'CS301', 'Dizajni dhe optimizimi i avancuar i bazave te dhenash', 4, 799.99, 20, '2024-02-01', '2024-06-01', 'Active'),
('Kalkulusi I', 'MATH101', 'Kalkulusi diferencial dhe integral', 4, 699.99, 30, '2024-01-20', '2024-05-20', 'Active'),
('Analitika e Biznesit', 'BUS201', 'Analiza e te dhenave per vendimmarrje biznesi', 3, 749.99, 25, '2024-02-15', '2024-06-15', 'Active'),
('Bazat e Machine Learning', 'CS401', 'Hyrje ne algoritmet e mesimit te makines', 4, 899.99, 15, '2024-03-01', '2024-07-01', 'Active'),
('Zhvillimi i Faqeve Web', 'CS201', 'Zhvillimi full-stack i aplikacioneve web', 3, 649.99, 20, '2023-09-01', '2023-12-15', 'Completed');

INSERT INTO CourseInstructors (course_id, instructor_id, role) VALUES
(1, 1, 'Primary'),
(2, 1, 'Primary'),
(3, 2, 'Primary'),
(4, 4, 'Primary'),
(5, 5, 'Primary'),
(6, 1, 'Primary'),
(2, 5, 'Assistant'),
(5, 1, 'Assistant');

INSERT INTO Enrollments (student_id, course_id, enrollment_date, status, grade) VALUES
(1, 1, '2024-01-10 09:00:00', 'Enrolled', NULL),
(1, 3, '2024-01-15 10:30:00', 'Enrolled', NULL),
(2, 1, '2024-01-11 14:20:00', 'Enrolled', NULL),    
(2, 2, '2024-01-25 11:45:00', 'Enrolled', NULL),    
(3, 3, '2024-01-18 16:10:00', 'Enrolled', NULL),     
(3, 4, '2024-02-10 13:30:00', 'Enrolled', NULL),    
(4, 1, '2024-01-12 08:45:00', 'Enrolled', NULL),   
(4, 5, '2024-02-28 15:20:00', 'Enrolled', NULL),
(5, 2, '2024-01-30 12:15:00', 'Enrolled', NULL),  
(5, 4, '2024-02-12 09:40:00', 'Enrolled', NULL),  
(6, 6, '2023-08-25 10:00:00', 'Completed', 3.75),  
(7, 6, '2023-08-26 14:30:00', 'Completed', 3.50),  
(8, 6, '2023-08-27 11:20:00', 'Dropped', NULL);      

INSERT INTO Payments (enrollment_id, amount, payment_date, payment_method, payment_status) VALUES
(1, 599.99, '2024-01-10 09:15:00', 'Credit Card', 'Completed'),   
(2, 699.99, '2024-01-15 10:45:00', 'Online', 'Completed'),      
(3, 599.99, '2024-01-11 14:35:00', 'Bank Transfer', 'Completed'),
(4, 799.99, '2024-01-25 12:00:00', 'Credit Card', 'Completed'),   
(5, 699.99, '2024-01-18 16:25:00', 'Online', 'Completed'),      
(6, 749.99, '2024-02-10 13:45:00', 'Credit Card', 'Completed'),  
(7, 599.99, '2024-01-12 09:00:00', 'Cash', 'Completed'),      
(8, 899.99, '2024-02-28 15:35:00', 'Online', 'Pending'),           
(9, 799.99, '2024-01-30 12:30:00', 'Bank Transfer', 'Completed'),  
(10, 749.99, '2024-02-12 09:55:00', 'Credit Card', 'Completed'),   
(11, 649.99, '2023-08-25 10:15:00', 'Credit Card', 'Completed'),  
(12, 649.99, '2023-08-26 14:45:00', 'Online', 'Completed'),     
(13, 649.99, '2023-08-27 11:35:00', 'Credit Card', 'Refunded');    
