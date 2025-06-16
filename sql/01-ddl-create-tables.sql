-- Krijimi i bazes se te dhenave per sistemin e regjistrimit ne kurse online
CREATE DATABASE IF NOT EXISTS online_course_registration;
USE online_course_registration;

-- Tabela e Studenteve - ruan informacionet baze te studenteve
CREATE TABLE Students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,    -- ID unike per çdo student
    first_name VARCHAR(50) NOT NULL,              -- Emri i studentit
    last_name VARCHAR(50) NOT NULL,               -- Mbiemri i studentit
    email VARCHAR(100) UNIQUE NOT NULL,           -- Email unik per çdo student
    phone VARCHAR(20),                            -- Numri i telefonit (opsional)
    date_of_birth DATE,                           -- Data e lindjes
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Data e regjistrimit automatike
);

-- Tabela e Instruktoreve - ruan informacionet e mesuesve
CREATE TABLE Instructors (
    instructor_id INT AUTO_INCREMENT PRIMARY KEY,  -- ID unike per çdo instruktor
    first_name VARCHAR(50) NOT NULL,               -- Emri i instruktorit
    last_name VARCHAR(50) NOT NULL,                -- Mbiemri i instruktorit
    email VARCHAR(100) UNIQUE NOT NULL,            -- Email unik per çdo instruktor
    phone VARCHAR(20),                             -- Numri i telefonit (opsional)
    specialization VARCHAR(100),                   -- Specializimi/fusha e ekspertizes
    hire_date DATE                                 -- Data e punesimit
);

-- Tabela e Kurseve - ruan te gjithe informacionin per kurset
CREATE TABLE Courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,      -- ID unike per çdo kurs
    course_name VARCHAR(100) NOT NULL,             -- Emri i kursit
    course_code VARCHAR(10) UNIQUE NOT NULL,       -- Kodi unik i kursit (p.sh. CS101)
    description TEXT,                              -- Pershkrimi i detajuar i kursit
    credits INT NOT NULL,                          -- Numri i krediteve akademike
    price DECIMAL(10,2) NOT NULL,                  -- Çmimi i kursit
    max_students INT DEFAULT 30,                   -- Numri maksimal i studenteve
    start_date DATE,                               -- Data e fillimit te kursit
    end_date DATE,                                 -- Data e perfundimit te kursit
    status ENUM('Active', 'Inactive', 'Completed') DEFAULT 'Active'  -- Statusi i kursit
);

-- Tabela e Regjistrimit - lidh studentet me kurset
CREATE TABLE Enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,  -- ID unike per çdo regjistrim
    student_id INT NOT NULL,                       -- Referenca tek studenti
    course_id INT NOT NULL,                        -- Referenca tek kursi
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Data e regjistrimit
    status ENUM('Enrolled', 'Completed', 'Dropped', 'Failed') DEFAULT 'Enrolled',  -- Statusi i regjistrimit
    grade DECIMAL(3,2),                            -- Nota finale (0.00-4.00)
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id)  -- Parandalon regjistrimin e dyfishte
);

-- Tabela e Pagesave - ruan te gjitha transaksionet financiare
CREATE TABLE Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,     -- ID unike per çdo pagese
    enrollment_id INT NOT NULL,                    -- Referenca tek regjistrimi
    amount DECIMAL(10,2) NOT NULL,                 -- Shuma e paguar
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Data e pageses
    payment_method ENUM('Credit Card', 'Bank Transfer', 'Cash', 'Online') NOT NULL,  -- Menyra e pageses
    payment_status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',  -- Statusi i pageses
    FOREIGN KEY (enrollment_id) REFERENCES Enrollments(enrollment_id) ON DELETE CASCADE
);

-- Tabela CourseInstructors - lidh kurset me instruktoret (marredhenie N:M)
CREATE TABLE CourseInstructors (
    course_id INT NOT NULL,                        -- Referenca tek kursi
    instructor_id INT NOT NULL,                    -- Referenca tek instruktori
    role ENUM('Primary', 'Assistant', 'Guest') DEFAULT 'Primary',  -- Roli i instruktorit ne kurs
    PRIMARY KEY (course_id, instructor_id),       -- Çelesi primar i perbere
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES Instructors(instructor_id) ON DELETE CASCADE
);

-- Krijimi i indekseve per performance me te mire te kerkimeve
CREATE INDEX idx_student_email ON Students(email);          -- Kerkim i shpejte sipas email-it
CREATE INDEX idx_course_code ON Courses(course_code);       -- Kerkim i shpejte sipas kodit te kursit
CREATE INDEX idx_enrollment_status ON Enrollments(status);   -- Filtrimi sipas statusit te regjistrimit
CREATE INDEX idx_payment_status ON Payments(payment_status); -- Filtrimi sipas statusit te pageses
CREATE INDEX idx_course_status ON Courses(status);          -- Filtrimi sipas statusit te kursit
