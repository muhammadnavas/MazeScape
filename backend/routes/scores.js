const express = require('express');
const Score = require('../models/Score');
const User = require('../models/User');

const router = express.Router();

// Save new score
router.post('/save', async (req, res) => {
    try {
        const { user_id, username, score, game_result, survival_time, game_mode = 'classic' } = req.body;
        
        if (!user_id || !username || score === undefined || !game_result || survival_time === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        if (!['win', 'lose'].includes(game_result)) {
            return res.status(400).json({
                success: false,
                message: 'Game result must be "win" or "lose"'
            });
        }
        
        // Create new score
        const newScore = new Score({
            user_id,
            username,
            score,
            game_result,
            survival_time,
            game_mode
        });
        
        await newScore.save();
        
        // Update user statistics
        const user = await User.findOne({ user_id });
        if (user) {
            await user.updateStats(game_result, survival_time);
            console.log(`User stats updated successfully for ${user_id}`);
        } else {
            console.log(`Warning: User ${user_id} not found in database. Stats not updated.`);
        }
        
        console.log(`Score saved successfully!`);
        
        res.json({
            success: true,
            message: 'Score saved successfully',
            score_id: newScore._id
        });
        
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving score: ' + error.message
        });
    }
});

// Get top scores (leaderboard)
router.get('/top/:limit?', async (req, res) => {
    try {
        const limit = parseInt(req.params.limit) || 50;
        
        // Aggregate to get best score per user
        const topScores = await Score.aggregate([
            {
                $sort: { survival_time: -1 }
            },
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
            {
                $sort: {
                    game_result: -1, // wins first
                    survival_time: -1 // then by survival time
                }
            },
            {
                $limit: limit
            },
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
        
        res.json({
            success: true,
            scores: topScores
        });
        
    } catch (error) {
        console.error('Error getting top scores:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting top scores: ' + error.message
        });
    }
});

// Get user scores
router.get('/user/:user_id/:limit?', async (req, res) => {
    try {
        const { user_id } = req.params;
        const limit = parseInt(req.params.limit) || 10;
        
        const userScores = await Score.find({ user_id })
            .sort({ timestamp: -1 })
            .limit(limit)
            .select('-__v');
        
        res.json({
            success: true,
            scores: userScores
        });
        
    } catch (error) {
        console.error('Error getting user scores:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting user scores: ' + error.message
        });
    }
});

// Get player's best score
router.get('/best/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const bestScore = await Score.findOne({ user_id })
            .sort({ game_result: -1, survival_time: -1 })
            .select('-__v');
        
        if (!bestScore) {
            return res.status(404).json({
                success: false,
                message: 'No scores found for user'
            });
        }
        
        res.json({
            success: true,
            score: bestScore
        });
        
    } catch (error) {
        console.error('Error getting player best score:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting player best score: ' + error.message
        });
    }
});

module.exports = router;
