# Complete Setup Instructions

Follow these steps to run the Online Course Registration System on your computer.

## Prerequisites

### 1. Install Required Software

#### MySQL Server (Required)

- Download from: https://dev.mysql.com/downloads/mysql/
- Install MySQL Server 8.0 or later
- Remember your root password during installation
- Start MySQL service

#### Node.js (Required)

- Download from: https://nodejs.org/
- Install LTS version (18.x or later)
- This includes npm (Node Package Manager)

#### Git (Optional but recommended)

- Download from: https://git-scm.com/
- For cloning and version control

## Step-by-Step Setup

### Step 1: Database Setup

1. **Open MySQL Command Line** or MySQL Workbench

2. **Create the database:**

```sql
CREATE DATABASE online_course_registration;
USE online_course_registration;
```

3. **Run the SQL scripts in order:**

```bash
# Navigate to the sql folder and run:
mysql -u root -p online_course_registration < 01-ddl-create-tables.sql
mysql -u root -p online_course_registration < 02-dml-insert-data.sql
mysql -u root -p online_course_registration < 07-views-and-triggers.sql
mysql -u root -p online_course_registration < 09-functions-and-procedures.sql
```

Or copy and paste the contents of each file into MySQL Workbench.

### Step 2: Backend Setup

1. **Open Command Prompt/Terminal**

2. **Navigate to backend folder:**

```bash
cd c:\Users\PC\online-course-registration\backend
```

3. **Install dependencies:**

```bash
npm install
```

4. **Configure environment:**

```bash
# Copy the example environment file
copy .env.example .env

# Edit .env file with your database credentials
notepad .env
```

5. **Update .env file with your settings:**

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=online_course_registration
```

### Step 3: Quick Start (Automated)

**Option A: Use the batch file (Windows)**

```bash
# Double-click or run:
start-project.bat
```

**Option B: Manual start**

1. **Start Backend Server:**

```bash
cd backend
npm run dev
```

2. **Start Frontend (in new terminal):**

```bash
cd frontend
# If you have Python installed:
python -m http.server 8080

# Or if you have Node.js http-server:
npx http-server -p 8080

# Or simply open index.html in your browser
```

### Step 4: Access the Application

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3000
- **API Health Check:** http://localhost:3000/health

## Testing the Setup

### 1. Backend API Test

Open your browser and go to:

```
http://localhost:3000/health
```

You should see:

```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "service": "Online Course Registration API"
}
```

### 2. Database Connection Test

```
http://localhost:3000/api/students
```

Should return a list of students from the database.

### 3. Frontend Test

Open http://localhost:8080 and you should see:

- Dashboard with statistics cards
- Students, Courses, and Enrollments tabs
- Data loaded from the backend API

## Troubleshooting

### Common Issues

#### 1. "node is not recognized as internal command"

**Solution:** Install Node.js and restart your command prompt

#### 2. "Access denied for user 'root'@'localhost'"

**Solution:** Check your MySQL password in the .env file

#### 3. "Error: Cannot find module"

**Solution:** Run `npm install` in the backend directory

#### 4. "Port 3000 is already in use"

**Solution:** Change PORT in .env file to another number (like 3001)

#### 5. "Failed to load students/courses"

**Solution:**

- Check if backend is running on http://localhost:3000
- Check browser console for CORS errors
- Verify database connection

#### 6. Frontend shows no data

**Solution:**

- Ensure backend is running first
- Check browser console for errors
- Verify API endpoints are responding

### Debug Steps

1. **Check Backend Logs:**

   - Look at the terminal where you started the backend
   - Check for any error messages

2. **Check Browser Console:**

   - Press F12 in your browser
   - Look for JavaScript errors or failed API calls

3. **Test API Directly:**

   - Visit http://localhost:3000/api/students in browser
   - Should return JSON data

4. **Check Database:**
   ```sql
   USE online_course_registration;
   SELECT COUNT(*) FROM Students;
   SELECT COUNT(*) FROM Courses;
   ```

## Development Tips

### Making Changes

1. **Backend changes:**

   - Server auto-restarts with nodemon
   - Check terminal for any errors

2. **Frontend changes:**

   - Refresh browser to see changes
   - Use browser dev tools for debugging

3. **Database changes:**
   - Run new SQL scripts manually
   - Or modify through MySQL Workbench

### File Structure

```
online-course-registration/
├── backend/          # Node.js API server
├── frontend/         # HTML/CSS/JS web app
├── sql/             # Database scripts
└── documentation/   # Project docs
```

## Next Steps

Once everything is running:

1. **Explore the Features:**

   - View students and courses
   - Check enrollment data
   - Review dashboard statistics

2. **Test API Endpoints:**

   - Use browser or Postman
   - Try different API calls

3. **Modify and Experiment:**

   - Add new students through API
   - Create new courses
   - Update enrollment statuses

4. **Add New Features:**
   - Implement the modal forms
   - Add more analytics
   - Enhance the UI

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review the console logs
3. Verify all prerequisites are installed
4. Check that all services are running

The system includes comprehensive error handling and logging to help identify issues quickly.
