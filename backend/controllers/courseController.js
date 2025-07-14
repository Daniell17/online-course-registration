const Course = require('../models/Course');
const { validationResult } = require('express-validator');

const courseController = {
    //  /api/courses
    getAllCourses: async (req, res) => {
        try {
            const filters = {
                status: req.query.status,
                category: req.query.category,
                search: req.query.search
            };
            
            const courses = await Course.findAll(filters);
            res.json({
                success: true,
                data: courses,
                count: courses.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching courses',
                error: error.message
            });
        }
    },

    // /api/courses/:id
    getCourseById: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }
            res.json({
                success: true,
                data: course
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching course',
                error: error.message
            });
        }
    },

    // POST /api/courses
    createCourse: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const courseId = await Course.create(req.body);
            const newCourse = await Course.findById(courseId);
            
            res.status(201).json({
                success: true,
                message: 'Course created successfully',
                data: newCourse
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating course',
                error: error.message
            });
        }
    },

    // PUT /api/courses/:id
    updateCourse: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const updated = await Course.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            const updatedCourse = await Course.findById(req.params.id);
            res.json({
                success: true,
                message: 'Course updated successfully',
                data: updatedCourse
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating course',
                error: error.message
            });
        }
    },

    // GET /api/courses/:id/report
    getCourseReport: async (req, res) => {
        try {
            const status = req.query.status || null;
            const report = await Course.getEnrollmentReport(req.params.id, status);
            res.json({
                success: true,
                data: report
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error generating course report',
                error: error.message
            });
        }
    },

    // POST /api/courses/:id/enroll
    enrollStudent: async (req, res) => {
        try {
            const { studentId } = req.body;
            if (!studentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Student ID is required'
                });
            }

            const result = await Course.enrollStudent(req.params.id, studentId);
            
            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: 'Student enrolled successfully',
                    data: { enrollmentId: result.enrollmentId }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error enrolling student',
                error: error.message
            });
        }
    },

    // DELETE /api/courses/:id
    deleteCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            
            // Check if course exists
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            // Check if course has enrollments
            const enrollmentCount = await Course.getEnrollmentCount(courseId);
            if (enrollmentCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete course with existing enrollments'
                });
            }

            const result = await Course.delete(courseId);
            if (result.success) {
                res.json({
                    success: true,
                    message: 'Course deleted successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error deleting course'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting course',
                error: error.message
            });
        }
    }
};

module.exports = courseController;
