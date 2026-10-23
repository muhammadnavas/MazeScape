const express = require('express');
const jwt = require('jsonwebtoken');
const Score = require('../models/Score');
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
        req.auth = { user_id: payload.user_id, username: payload.username };
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid authentication token'
        });
    }
}

function parseLimit(value, fallback, max = 100) {
    if (value === undefined) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) return null;
    return Math.min(parsed, max);
}

// Save a score only for the authenticated player. The username and user ID are
// taken from the database/token rather than trusted from the request body.
router.post('/save', requireAuth, async (req, res) => {
    try {
        const { score, game_result, survival_time, game_mode = 'classic' } = req.body || {};

        if (score === undefined || survival_time === undefined || !game_result) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        if (!Number.isSafeInteger(score) || score < 0 || score > 10000000) {
            return res.status(400).json({ success: false, message: 'Score must be a whole number between 0 and 10000000' });
        }
        if (!Number.isFinite(survival_time) || survival_time < 0 || survival_time > 86400) {
            return res.status(400).json({ success: false, message: 'Survival time must be between 0 and 86400 seconds' });
        }
        if (!['win', 'lose'].includes(game_result)) {
            return res.status(400).json({ success: false, message: 'Game result must be "win" or "lose"' });
        }
        if (!['classic', 'speed', 'survival'].includes(game_mode)) {
            return res.status(400).json({ success: false, message: 'Invalid game mode' });
        }

        const user = await User.findOne({ user_id: req.auth.user_id });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Account not found. Please log in again.' });
        }

        const newScore = new Score({
            user_id: user.user_id,
            username: user.username,
            score,
            game_result,
            survival_time,
            game_mode
        });
        await newScore.save();
        await user.updateStats(game_result, survival_time);

        return res.status(201).json({
            success: true,
            message: 'Score saved successfully',
            score_id: newScore._id
        });
    } catch (error) {
        console.error('Error saving score:', error);
        return res.status(500).json({ success: false, message: 'Unable to save score right now' });
    }
});

// Public leaderboard. Limits are validated and capped to avoid expensive queries.
router.get('/top/:limit?', async (req, res) => {
    try {
        const limit = parseLimit(req.params.limit, 50);
        if (limit === null) {
            return res.status(400).json({ success: false, message: 'Limit must be a positive integer' });
        }

        const topScores = await Score.aggregate([
            { $sort: { score: -1, timestamp: 1 } },
            {
                $group: {
                    _id: '$user_id',
                    username: { $first: '$username' },
                    best_score: { $first: '$score' },
                    game_result: { $first: '$game_result' },
                    survival_time: { $first: '$survival_time' },
                    game_mode: { $first: '$game_mode' },
                    timestamp: { $first: '$timestamp' },
                    created_at: { $first: '$created_at' },
                    date: { $first: '$date' },
                    time_played: { $first: '$time_played' }
                }
            },
            { $sort: { best_score: -1, timestamp: 1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    user_id: '$_id',
                    username: 1,
                    score: '$best_score',
                    game_result: 1,
                    survival_time: 1,
                    game_mode: 1,
                    timestamp: 1,
                    created_at: 1,
                    date: 1,
                    time_played: 1
                }
            }
        ]);

        return res.json({ success: true, scores: topScores });
    } catch (error) {
        console.error('Error getting top scores:', error);
        return res.status(500).json({ success: false, message: 'Unable to load leaderboard right now' });
    }
});

// A player can read only their own score history.
router.get('/user/:user_id/:limit?', requireAuth, async (req, res) => {
    try {
        if (req.params.user_id !== req.auth.user_id) {
            return res.status(403).json({ success: false, message: 'You can only access your own scores' });
        }
        const limit = parseLimit(req.params.limit, 10);
        if (limit === null) {
            return res.status(400).json({ success: false, message: 'Limit must be a positive integer' });
        }

        const userScores = await Score.find({ user_id: req.auth.user_id })
            .sort({ timestamp: -1 })
            .limit(limit)
            .select('-__v');

        return res.json({ success: true, scores: userScores });
    } catch (error) {
        console.error('Error getting user scores:', error);
        return res.status(500).json({ success: false, message: 'Unable to load your scores right now' });
    }
});

router.get('/best/:user_id', requireAuth, async (req, res) => {
    try {
        if (req.params.user_id !== req.auth.user_id) {
            return res.status(403).json({ success: false, message: 'You can only access your own scores' });
        }
        const bestScore = await Score.findOne({ user_id: req.auth.user_id })
            .sort({ score: -1, timestamp: 1 })
            .select('-__v');

        if (!bestScore) {
            return res.status(404).json({ success: false, message: 'No scores found for user' });
        }
        return res.json({ success: true, score: bestScore });
    } catch (error) {
        console.error('Error getting player best score:', error);
        return res.status(500).json({ success: false, message: 'Unable to load your best score right now' });
    }
});

module.exports = router;
