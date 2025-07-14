const express = require('express');
const { body } = require('express-validator');
const studentController = require('../controllers/studentController');
const courseController = require('../controllers/courseController');
const enrollmentController = require('../controllers/enrollmentController');

const router = express.Router();

// Validation middlewares
const studentValidation = [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().matches(/^[\+]?[0-9\s\-\(\)]{7,15}$/).withMessage('Phone number must be 7-15 digits, may include +, spaces, hyphens, and parentheses'),
    body('dateOfBirth').optional().isDate()
];

const courseValidation = [
    body('courseName').notEmpty().withMessage('Course name is required'),
    body('courseCode').notEmpty().withMessage('Course code is required'),
    body('credits').isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('maxStudents').optional().isInt({ min: 1 }).withMessage('Max students must be positive')
];

// Student Routes
router.get('/students', studentController.getAllStudents);
router.get('/students/:id', studentController.getStudentById);
router.post('/students', studentValidation, studentController.createStudent);
router.put('/students/:id', studentValidation, studentController.updateStudent);
router.delete('/students/:id', studentController.deleteStudent);
router.get('/students/:id/enrollments', studentController.getStudentEnrollments);
router.get('/students/:id/transcript', studentController.getStudentTranscript);

// Course Routes
router.get('/courses', courseController.getAllCourses);
router.get('/courses/:id', courseController.getCourseById);
router.post('/courses', courseValidation, courseController.createCourse);
router.put('/courses/:id', courseValidation, courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);
router.get('/courses/:id/report', courseController.getCourseReport);
router.post('/courses/:id/enroll', courseController.enrollStudent);

// Enrollment Routes
router.get('/enrollments', enrollmentController.getAllEnrollments);
router.put('/enrollments/:id/status', enrollmentController.updateEnrollmentStatus);
router.delete('/enrollments/:id', enrollmentController.deleteEnrollment);

// Analytics Routes
router.get('/analytics/dashboard', require('../controllers/analyticsController').getDashboard);
router.get('/analytics/revenue', require('../controllers/analyticsController').getRevenue);
router.get('/analytics/courses', require('../controllers/analyticsController').getCourseAnalytics);

module.exports = router;
