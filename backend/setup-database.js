const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12341234!',
    multipleStatements: true,
    namedPlaceholders: true
};

async function runSQLFile(filePath, description) {
    console.log(`\n📝 ${description}...`);
    
    try {
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        const connection = await mysql.createConnection(dbConfig);
        
        // Clean the SQL content and split statements properly
        const cleanSQL = sqlContent
            .replace(/--.*$/gm, '') // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
        
        const statements = cleanSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        
        console.log(`   Executing ${statements.length} statements...`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                try {
                    console.log(`   Statement ${i + 1}/${statements.length}`);
                    await connection.execute(statement);
                } catch (stmtError) {
                    console.error(`   ❌ Error in statement ${i + 1}:`, stmtError.message);
                    console.error(`   Statement: ${statement.substring(0, 100)}...`);
                }
            }
        }
        
        await connection.end();
        
        console.log(`✅ ${description} completed successfully!`);
    } catch (error) {
        console.error(`❌ Error in ${description}:`, error.message);
        throw error;
    }
}

async function runSQLFileWithDB(filePath, description) {
    console.log(`\n📝 ${description}...`);
    
    try {
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        const connection = await mysql.createConnection({
            ...dbConfig,
            database: 'online_course_registration'
        });
        
        // Split SQL statements and execute them one by one
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }
        
        await connection.end();
        
        console.log(`✅ ${description} completed successfully!`);
    } catch (error) {
        console.error(`❌ Error in ${description}:`, error.message);
        throw error;
    }
}

async function setupDatabase() {
    console.log('🚀 Setting up Online Course Registration Database...\n');
    
    try {
        // Run SQL scripts in order
        await runSQLFile('../sql/01-ddl-create-tables.sql', 'Creating database tables');
        await runSQLFile('../sql/02-dml-insert-data.sql', 'Inserting sample data');
        
        // For subsequent scripts, use the database
        await runSQLFileWithDB('../sql/07-views-and-triggers.sql', 'Creating views and triggers');
        await runSQLFileWithDB('../sql/09-functions-and-procedures.sql', 'Creating functions and procedures');
        
        console.log('\n🎉 Database setup completed successfully!');
        console.log('📊 Verifying setup...');
        
        // Verify the setup
        const connection = await mysql.createConnection({
            ...dbConfig,
            database: 'online_course_registration'
        });
        
        const [students] = await connection.execute('SELECT COUNT(*) as count FROM Students');
        const [courses] = await connection.execute('SELECT COUNT(*) as count FROM Courses');
        const [enrollments] = await connection.execute('SELECT COUNT(*) as count FROM Enrollments');
        
        console.log(`👥 Students: ${students[0].count}`);
        console.log(`📚 Courses: ${courses[0].count}`);
        console.log(`📝 Enrollments: ${enrollments[0].count}`);
        
        await connection.end();
        
    } catch (error) {
        console.error('💥 Database setup failed:', error.message);
        process.exit(1);
    }
}

setupDatabase();
