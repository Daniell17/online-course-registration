const Student = require('../models/Student');
const { validationResult } = require('express-validator');

const studentController = {
    // /api/students
    getAllStudents: async (req, res) => {
        try {
            const students = await Student.findAll();
            
            // Add computed fields for frontend compatibility
            const studentsWithStats = students.map(student => ({
                ...student,
                full_name: student.full_name,
                student_status: student.status || 'Active',
                total_enrollments: 0,
                active_enrollments: 0,
                completed_courses: 0,
                gpa: null,
                total_paid: 0
            }));

            res.json({
                success: true,
                data: studentsWithStats,
                count: studentsWithStats.length
            });
        } catch (error) {
            console.error('Error fetching students:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching students',
                error: error.message
            });
        }
    },

    // /api/students/:id
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

    // /api/students
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

    // /api/students/:id
    updateStudent: async (req, res) => {
        try {
            console.log('UPDATE STUDENT REQUEST:', {
                id: req.params.id,
                body: req.body
            });
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Validation errors:', errors.array());
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const updated = await Student.update(req.params.id, req.body);
            console.log('Student update result:', updated);
            
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            const updatedStudent = await Student.findById(req.params.id);
            console.log('Updated student data:', updatedStudent);
            
            res.json({
                success: true,
                message: 'Student updated successfully',
                data: updatedStudent
            });
        } catch (error) {
            console.error('Error updating student:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating student',
                error: error.message
            });
        }
    },

    // /api/students/:id
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

    // /api/students/:id/enrollments
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

    // /api/students/:id/transcript
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
