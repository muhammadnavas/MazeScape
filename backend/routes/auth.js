const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }
        
        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Username must be at least 3 characters long'
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }
        
        // Create new user
        const user = new User({
            username,
            password_hash: password // Will be hashed by pre-save middleware
        });
        
        await user.save();
        
        console.log(`User created successfully! User ID: ${user.user_id}`);
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user_id: user.user_id,
            username: user.username
        });
        
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user: ' + error.message
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Username not found'
            });
        }
        
        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }
        
        // Update last login
        user.last_login = new Date();
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            user_id: user.user_id,
            username: user.username,
            token
        });
        
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error authenticating user: ' + error.message
        });
    }
});

// Get user info
router.get('/user/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const user = await User.findOne({ user_id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: {
                user_id: user.user_id,
                username: user.username,
                created_at: user.created_at,
                last_login: user.last_login,
                total_games: user.total_games,
                total_wins: user.total_wins,
                best_win_time: user.best_win_time,
                best_survival_time: user.best_survival_time
            }
        });
        
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting user info: ' + error.message
        });
    }
});

module.exports = router;
