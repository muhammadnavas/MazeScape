const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const scoresRoutes = require('./routes/scores');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - More permissive for development
const corsOptions = {
    origin: [
        'http://localhost:8000', 
        'http://127.0.0.1:8000', 
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:5501',
        'http://127.0.0.1:5501'
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Log accepted origins for debugging
console.log('🌐 CORS Origins:', corsOptions.origin.join(', '));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Maze Chase Backend',
        version: '1.0.0'
    });
});

// API routes
// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoresRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Test database connection
        const dbState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        res.json({
            success: true,
            message: 'Maze Chase Backend is running!',
            service: 'MazeChase Backend',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            database: {
                status: states[dbState] || 'unknown',
                connected: dbState === 1,
                name: process.env.DB_NAME || 'mazechase'
            },
            environment: process.env.NODE_ENV,
            port: process.env.PORT
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎮 Welcome to Maze Chase Backend API!',
        version: '1.0.0',
        endpoints: [
            'GET /api/health - Health check',
            'POST /api/auth/register - Register user',
            'POST /api/auth/login - Login user',
            'GET /api/scores/leaderboard - Get leaderboard',
            'POST /api/scores/submit - Submit score'
        ]
    });
});

// Game statistics endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const User = require('./models/User');
        const Score = require('./models/Score');
        
        const totalUsers = await User.countDocuments();
        const totalGames = await Score.countDocuments();
        const totalWins = await Score.countDocuments({ game_result: 'win' });
        
        res.json({
            success: true,
            stats: {
                total_users: totalUsers,
                total_games: totalGames,
                total_wins: totalWins,
                win_rate: totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(2) + '%' : '0%'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting stats: ' + error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Maze Chase Backend server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8000'}`);
    console.log(`💾 Database: MongoDB Atlas`);
    console.log(`📡 Server listening on: http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
