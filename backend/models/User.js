const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true,
        default: () => 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    password_hash: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    last_login: {
        type: Date,
        default: Date.now
    },
    total_games: {
        type: Number,
        default: 0
    },
    total_wins: {
        type: Number,
        default: 0
    },
    best_win_time: {
        type: Number,
        default: null
    },
    best_survival_time: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create indexes for better performance
userSchema.index({ username: 1 });
userSchema.index({ user_id: 1 });
userSchema.index({ created_at: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password_hash')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password_hash = await bcrypt.hash(this.password_hash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

// Method to update user stats
userSchema.methods.updateStats = function(gameResult, survivalTime) {
    this.total_games += 1;
    this.last_login = new Date();
    
    if (gameResult === 'win') {
        this.total_wins += 1;
        if (!this.best_win_time || survivalTime < this.best_win_time) {
            this.best_win_time = survivalTime;
        }
    }
    
    if (!this.best_survival_time || survivalTime > this.best_survival_time) {
        this.best_survival_time = survivalTime;
    }
    
    return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
