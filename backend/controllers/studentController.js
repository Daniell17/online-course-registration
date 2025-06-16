const Student = require('../models/Student').default;
const { validationResult } = require('express-validator');

const studentController = {
    // GET /api/students
    getAllStudents: async (req, res) => {
        try {
            const students = await Student.findAll();
            res.json({
                success: true,
                data: students,
                count: students.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching students',
                error: error.message
            });
        }
    },

    // GET /api/students/:id
    getStudentById: async (req, res) => {
        try {
            const student = await Student.findById(req.params.id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }
            res.json({
                success: true,
                data: student
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching student',
                error: error.message
            });
        }
    },

    // POST /api/students
    createStudent: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const studentId = await Student.create(req.body);
            const newStudent = await Student.findById(studentId);
            
            res.status(201).json({
                success: true,
                message: 'Student created successfully',
                data: newStudent
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating student',
                error: error.message
            });
        }
    },

    // PUT /api/students/:id
    updateStudent: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const updated = await Student.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            const updatedStudent = await Student.findById(req.params.id);
            res.json({
                success: true,
                message: 'Student updated successfully',
                data: updatedStudent
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating student',
                error: error.message
            });
        }
    },

    // DELETE /api/students/:id
    deleteStudent: async (req, res) => {
        try {
            const deleted = await Student.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            res.json({
                success: true,
                message: 'Student deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting student',
                error: error.message
            });
        }
    },

    // GET /api/students/:id/enrollments
    getStudentEnrollments: async (req, res) => {
        try {
            const enrollments = await Student.getEnrollments(req.params.id);
            res.json({
                success: true,
                data: enrollments,
                count: enrollments.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching student enrollments',
                error: error.message
            });
        }
    },

    // GET /api/students/:id/transcript
    getStudentTranscript: async (req, res) => {
        try {
            const transcript = await Student.generateTranscript(req.params.id);
            res.json({
                success: true,
                data: transcript
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error generating transcript',
                error: error.message
            });
        }
    }
};

module.exports = studentController;
