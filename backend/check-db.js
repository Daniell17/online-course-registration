const mysql = require('mysql2/promise');

async function checkDatabase() {
    try {
        console.log('🔍 Checking database status...');
        
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12341234!',
            database: 'online_course_registration'
        });
        
        console.log('✅ Connected to database');
        
        // Check tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\n📋 Tables found:');
        tables.forEach(table => {
            console.log('  ✓', Object.values(table)[0]);
        });
        
        // Check sample data
        if (tables.length > 0) {
            try {
                const [students] = await connection.execute('SELECT COUNT(*) as count FROM Students');
                const [courses] = await connection.execute('SELECT COUNT(*) as count FROM Courses');
                console.log('\n📊 Data counts:');
                console.log('  👥 Students:', students[0].count);
                console.log('  📚 Courses:', courses[0].count);
            } catch (error) {
                console.log('⚠️  Could not count data:', error.message);
            }
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database check failed:', error.message);
    }
}

checkDatabase();
