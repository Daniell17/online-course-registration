const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mysql = require('mysql2');
require('dotenv').config();

const { testConnection } = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Database connection will be handled by the pool in config/database.js
// Remove the duplicate connection code as it's already handled in the database config

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Backend server is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Online Course Registration API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            students: '/api/students',
            courses: '/api/courses',
            enrollments: '/api/enrollments',
            analytics: '/api/analytics'
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
const startServer = async () => {
    try {
        await testConnection();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
