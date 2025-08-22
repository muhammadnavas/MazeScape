const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const scoresRoutes = require('./routes/scores');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(helmet({
    contentSecurityPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration for single frontend URL
const frontendUrl = process.env.FRONTEND_URL || `http://localhost:3000`;
const corsOptions = {
    origin: frontendUrl,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoresRoutes);

app.get('/api/health', async (req, res) => {
    try {
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

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server with clean logs
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MazeScape Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎯 Game available at: http://localhost:${PORT}`);
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
