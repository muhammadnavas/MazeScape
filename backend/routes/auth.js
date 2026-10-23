const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function requireAuth(req, res, next) {
    const header = req.get('Authorization') || '';
    const parts = header.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !parts[1]) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not configured');
        return res.status(503).json({ success: false, message: 'Authentication service is not configured' });
    }
    try {
        const payload = jwt.verify(parts[1], process.env.JWT_SECRET);
        if (!payload || typeof payload.user_id !== 'string' || !payload.user_id) {
            return res.status(401).json({ success: false, message: 'Invalid authentication token' });
        }
        req.auth = { user_id: payload.user_id };
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid authentication token'
        });
    }
}

// Register new user
router.post('/register', async (req, res) => {
    try {
        const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }
        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ success: false, message: 'Username must be between 3 and 30 characters long' });
        }
        if (password.length < 6 || password.length > 128) {
            return res.status(400).json({ success: false, message: 'Password must be between 6 and 128 characters long' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }

        const user = new User({ username, password_hash: password });
        await user.save();

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user_id: user.user_id,
            username: user.username
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }
        console.error('Error creating user:', error);
        return res.status(500).json({ success: false, message: 'Unable to create account right now' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
        const password = typeof req.body?.password === 'string' ? req.body.password : '';
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            return res.status(503).json({ success: false, message: 'Authentication service is not configured' });
        }

        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        user.last_login = new Date();
        await user.save();

        const token = jwt.sign(
            { user_id: user.user_id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            success: true,
            message: 'Login successful',
            user_id: user.user_id,
            username: user.username,
            token
        });
    } catch (error) {
        console.error('Error authenticating user:', error);
        return res.status(500).json({ success: false, message: 'Unable to log in right now' });
    }
});

// Users may only retrieve their own profile.
router.get('/user/:user_id', requireAuth, async (req, res) => {
    try {
        if (req.params.user_id !== req.auth.user_id) {
            return res.status(403).json({ success: false, message: 'You can only access your own profile' });
        }

        const user = await User.findOne({ user_id: req.auth.user_id });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.json({
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
        return res.status(500).json({ success: false, message: 'Unable to load profile right now' });
    }
});

module.exports = router;
