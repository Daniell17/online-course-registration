const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'online_course_registration'
        });

        console.log('✅ Database connection successful!');
        
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM Students');
        console.log(`✅ Found ${rows[0].count} students in database`);
        
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        process.exit(1);
    }
}

testConnection();
