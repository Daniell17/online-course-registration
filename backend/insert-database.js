const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12341234!'
};

async function executeSQL(connection, sqlContent, description) {
    console.log(`📝 ${description}...`);
    
    // Clean and split SQL statements
    const statements = sqlContent
        .replace(/--.*$/gm, '') // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
    
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement) {
            try {
                await connection.execute(statement);
                console.log(`   ✓ Statement ${i + 1}/${statements.length} executed`);
            } catch (error) {
                console.log(`   ⚠️  Statement ${i + 1} warning: ${error.message}`);
                // Continue with other statements
            }
        }
    }
    
    console.log(`✅ ${description} completed!`);
}

async function insertDatabase() {
    try {
        console.log('🚀 Setting up Online Course Registration Database...\n');
        
        // Connect to MySQL server and create database
        let connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL server');
        
        // Create database
        await connection.execute('CREATE DATABASE IF NOT EXISTS online_course_registration');
        console.log('✅ Database created');
        
        await connection.end();
        
        // Reconnect to the specific database
        connection = await mysql.createConnection({
            ...dbConfig,
            database: 'online_course_registration'
        });
        console.log('✅ Connected to online_course_registration database');
        
        // Read and execute SQL files in order
        const sqlDir = path.join(__dirname, '..', 'sql');
        
        // 1. Create tables
        const ddlContent = fs.readFileSync(path.join(sqlDir, '01-ddl-create-tables.sql'), 'utf8');
        await executeSQL(connection, ddlContent, 'Creating database tables');
        
        // 2. Insert sample data
        const dmlContent = fs.readFileSync(path.join(sqlDir, '02-dml-insert-data.sql'), 'utf8');
        await executeSQL(connection, dmlContent, 'Inserting sample data');
        
        // 3. Create views and triggers (optional - continue even if it fails)
        try {
            const viewsContent = fs.readFileSync(path.join(sqlDir, '07-views-and-triggers.sql'), 'utf8');
            await executeSQL(connection, viewsContent, 'Creating views and triggers');
        } catch (error) {
            console.log('⚠️  Views and triggers skipped due to error:', error.message);
        }
        
        // 4. Create functions and procedures (optional - continue even if it fails)
        try {
            const functionsContent = fs.readFileSync(path.join(sqlDir, '09-functions-and-procedures.sql'), 'utf8');
            await executeSQL(connection, functionsContent, 'Creating functions and procedures');
        } catch (error) {
            console.log('⚠️  Functions and procedures skipped due to error:', error.message);
        }
        
        // Verify the setup
        console.log('\n📊 Verifying database setup...');
        
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tables created: ${tables.length}`);
        tables.forEach(table => {
            console.log(`   ✓ ${Object.values(table)[0]}`);
        });
        
        // Count data
        try {
            const [students] = await connection.execute('SELECT COUNT(*) as count FROM Students');
            const [courses] = await connection.execute('SELECT COUNT(*) as count FROM Courses');
            const [enrollments] = await connection.execute('SELECT COUNT(*) as count FROM Enrollments');
            
            console.log('\n📈 Data verification:');
            console.log(`   👥 Students: ${students[0].count}`);
            console.log(`   📚 Courses: ${courses[0].count}`);
            console.log(`   📝 Enrollments: ${enrollments[0].count}`);
        } catch (error) {
            console.log('⚠️  Could not verify data counts:', error.message);
        }
        
        await connection.end();
        
        console.log('\n🎉 Database setup completed successfully!');
        console.log('📝 You can now start your backend server with: npm run dev');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    }
}

insertDatabase();
