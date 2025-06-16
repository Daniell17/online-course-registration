# Online Course Registration System

A comprehensive full-stack application for managing online course registration with database backend, REST API, and web frontend.

## Project Structure

```
online-course-registration/
├── database-design/          # Database ERD and documentation
├── sql/                     # SQL scripts (DDL, DML, procedures)
├── backend/                 # Node.js REST API
│   ├── config/             # Database configuration
│   ├── models/             # Data models
│   ├── controllers/        # API controllers
│   ├── routes/             # API routes
│   └── server.js           # Main server file
├── frontend/               # Web interface
│   ├── js/                 # JavaScript files
│   └── index.html          # Main HTML page
└── documentation/          # Project documentation
```

## Technology Stack

### Database

- **MySQL 8.0+** - Primary database
- **Stored Procedures** - Business logic
- **Views** - Data abstraction
- **Triggers** - Automated workflows

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **Express Validator** - Input validation

### Frontend

- **HTML5/CSS3** - Structure and styling
- **Bootstrap 5** - UI framework
- **Vanilla JavaScript** - Client-side logic
- **Fetch API** - HTTP requests

## Installation & Setup

### 1. Database Setup

```bash
# Create database and run SQL scripts
mysql -u root -p < sql/01-ddl-create-tables.sql
mysql -u root -p < sql/02-dml-insert-data.sql
mysql -u root -p < sql/07-views-and-triggers.sql
mysql -u root -p < sql/09-functions-and-procedures.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. Frontend Setup

```bash
# Open frontend/index.html in browser
# Or serve with a simple HTTP server:
cd frontend
python -m http.server 8080
# Access: http://localhost:8080
```

## API Endpoints

### Students

- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/:id/enrollments` - Student's enrollments
- `GET /api/students/:id/transcript` - Generate transcript

### Courses

- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `POST /api/courses/:id/enroll` - Enroll student
- `GET /api/courses/:id/report` - Enrollment report

### Enrollments

- `GET /api/enrollments` - List all enrollments
- `PUT /api/enrollments/:id/status` - Update enrollment status

### Analytics

- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/revenue` - Revenue analytics

## Features

### Core Functionality

- ✅ Student management (CRUD operations)
- ✅ Course catalog management
- ✅ Enrollment processing
- ✅ Payment tracking
- ✅ Instructor assignment

### Advanced Features

- ✅ Automated enrollment validation
- ✅ GPA calculation
- ✅ Transcript generation
- ✅ Course capacity management
- ✅ Financial reporting
- ✅ Student risk assessment

### Database Features

- ✅ Referential integrity with foreign keys
- ✅ Automated triggers for business rules
- ✅ Stored procedures for complex operations
- ✅ Views for simplified data access
- ✅ Indexing for performance optimization

## Usage Examples

### Enroll a Student

```javascript
await api.enrollStudent(courseId, studentId);
```

### Generate Student Transcript

```javascript
const transcript = await api.getStudentTranscript(studentId);
```

### Update Enrollment Status

```javascript
await api.updateEnrollmentStatus(enrollmentId, "Completed", 3.75);
```

## Database Procedures

### Generate Course Report

```sql
CALL GetCourseEnrollmentReport(1, 'Enrolled');
```

### Update Enrollment with Validation

```sql
CALL UpdateEnrollmentStatus(1, 'Completed', 3.75, @result);
```

### Bulk Student Enrollment

```sql
CALL BulkEnrollStudents(2, '1,2,3,4', @success_count, @errors);
```

## Security Features

- Input validation on all API endpoints
- SQL injection prevention through parameterized queries
- CORS configuration for cross-origin requests
- Helmet.js for security headers
- Environment-based configuration

## Testing

```bash
# Backend tests
cd backend
npm test

# Manual API testing with curl
curl -X GET http://localhost:3000/api/students
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com"}'
```

## Deployment

### Development

```bash
npm run dev  # Backend with auto-reload
```

### Production

```bash
npm start    # Backend production mode
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
