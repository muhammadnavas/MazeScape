const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    username: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    game_result: {
        type: String,
        required: true,
        enum: ['win', 'lose']
    },
    survival_time: {
        type: Number,
        required: true,
        min: 0
    },
    game_mode: {
        type: String,
        default: 'classic',
        enum: ['classic', 'speed', 'survival']
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    date: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    time_played: {
        type: String,
        default: () => new Date().toTimeString().split(' ')[0]
    }
}, {
    timestamps: true
});

// Create indexes for better performance
scoreSchema.index({ user_id: 1 });
scoreSchema.index({ game_result: 1 });
scoreSchema.index({ survival_time: -1 });
scoreSchema.index({ score: -1 });
scoreSchema.index({ timestamp: -1 });
scoreSchema.index({ user_id: 1, timestamp: -1 });

// Compound index for leaderboard queries
scoreSchema.index({ game_result: 1, survival_time: -1 });

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;
