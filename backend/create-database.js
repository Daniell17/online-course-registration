const mysql = require('mysql2/promise');

async function createDatabase() {
    console.log('🚀 Starting database creation...');
    
    try {
        // Connect without specifying database
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12341234!'
        });
        
        console.log('✅ Connected to MySQL server');
          // Create database
        await connection.execute('CREATE DATABASE IF NOT EXISTS online_course_registration');
        console.log('✅ Database "online_course_registration" created');
        
        await connection.end();
        
        // Reconnect to the specific database
        const dbConnection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12341234!',
            database: 'online_course_registration'
        });
        
        console.log('✅ Connected to "online_course_registration" database');
          // Create Students table
        await dbConnection.execute(`
            CREATE TABLE IF NOT EXISTS Students (
                student_id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                date_of_birth DATE,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Students table created');
        
        // Create Instructors table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Instructors (
                instructor_id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                specialization VARCHAR(100),
                hire_date DATE
            )
        `);
        console.log('✅ Instructors table created');
        
        // Create Courses table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Courses (
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
            )
        `);
        console.log('✅ Courses table created');
        
        // Create Enrollments table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Enrollments (
                enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                course_id INT NOT NULL,
                enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('Enrolled', 'Completed', 'Dropped', 'Failed') DEFAULT 'Enrolled',
                grade DECIMAL(3,2),
                FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
                UNIQUE KEY unique_enrollment (student_id, course_id)
            )
        `);
        console.log('✅ Enrollments table created');
        
        // Create Payments table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Payments (
                payment_id INT AUTO_INCREMENT PRIMARY KEY,
                enrollment_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                payment_method ENUM('Credit Card', 'Bank Transfer', 'Cash', 'Online') NOT NULL,
                payment_status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
                FOREIGN KEY (enrollment_id) REFERENCES Enrollments(enrollment_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Payments table created');
        
        // Create CourseInstructors table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS CourseInstructors (
                course_id INT NOT NULL,
                instructor_id INT NOT NULL,
                role ENUM('Primary', 'Assistant', 'Guest') DEFAULT 'Primary',
                PRIMARY KEY (course_id, instructor_id),
                FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
                FOREIGN KEY (instructor_id) REFERENCES Instructors(instructor_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ CourseInstructors table created');
        
        // Create indexes for better performance
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_student_email ON Students(email)');
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_course_code ON Courses(course_code)');
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_enrollment_status ON Enrollments(status)');
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_payment_status ON Payments(payment_status)');
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_course_status ON Courses(status)');
        console.log('✅ Indexes created');
        
        // Verify tables were created
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\n📋 Tables in database:');
        tables.forEach(table => {
            console.log('  ✓', Object.values(table)[0]);
        });
        
        await connection.end();
        console.log('\n🎉 Database structure created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating database:', error.message);
        process.exit(1);
    }
}

createDatabase();
