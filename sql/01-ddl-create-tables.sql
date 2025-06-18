CREATE DATABASE IF NOT EXISTS online_course_registration;
USE online_course_registration;

CREATE TABLE Students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,    
    first_name VARCHAR(50) NOT NULL,            
    last_name VARCHAR(50) NOT NULL,              
    email VARCHAR(100) UNIQUE NOT NULL,         
    phone VARCHAR(20),                            
    date_of_birth DATE,                         
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);

CREATE TABLE Instructors (
    instructor_id INT AUTO_INCREMENT PRIMARY KEY,  
    first_name VARCHAR(50) NOT NULL,           
    last_name VARCHAR(50) NOT NULL,               
    email VARCHAR(100) UNIQUE NOT NULL,           
    phone VARCHAR(20),                          
    specialization VARCHAR(100),                 
    hire_date DATE                               
);

CREATE TABLE Courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    credits INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    max_students INT DEFAULT 30,
    start_date DATE,
    end_date DATE,
    status ENUM('Active', 'Inactive', 'Completed') DEFAULT 'Active'
);

CREATE TABLE Enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Enrolled', 'Completed', 'Dropped', 'Failed') DEFAULT 'Enrolled',
    grade DECIMAL(3,2),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id)
);

CREATE TABLE Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('Credit Card', 'Bank Transfer', 'Cash', 'Online') NOT NULL,
    payment_status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    FOREIGN KEY (enrollment_id) REFERENCES Enrollments(enrollment_id) ON DELETE CASCADE
);

CREATE TABLE CourseInstructors (
    course_id INT NOT NULL,                       
    instructor_id INT NOT NULL,                 
    role ENUM('Primary', 'Assistant', 'Guest') DEFAULT 'Primary',  
    PRIMARY KEY (course_id, instructor_id),      
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES Instructors(instructor_id) ON DELETE CASCADE
);

CREATE INDEX idx_student_email ON Students(email);          
CREATE INDEX idx_course_code ON Courses(course_code);     
CREATE INDEX idx_enrollment_status ON Enrollments(status);   
CREATE INDEX idx_payment_status ON Payments(payment_status); 
CREATE INDEX idx_course_status ON Courses(status);
