// Frontend Database Client - Connects to MongoDB Backend
class MazeChaseDB {
    constructor() {
        this.baseURL = 
    window.location.hostname === "localhost"
        ? "http://localhost:3004/api"
        : "https://mazescape.onrender.com/api";

        this.init();
    }
    
    async init() {
        try {
            console.log('🔗 Attempting to connect to MongoDB Backend...');
            console.log('Backend URL:', `${this.baseURL}/health`);
            console.log('Current timestamp:', new Date().toISOString());
            
            // Test backend connection with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log('⏰ Request timeout after 5 seconds');
                controller.abort();
            }, 5000); // 5 second timeout
            
            console.log('📡 Making fetch request...');
            const response = await fetch(`${this.baseURL}/health`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors'
            });
            
            clearTimeout(timeoutId);
            console.log('Health check response status:', response.status, response.ok);
            console.log('Response headers:', [...response.headers.entries()]);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Health check response data:', data);
                this.connected = true;
                console.log('✅ Successfully connected to MongoDB Backend!');
                console.log('✅ Database connected - Login/Register available!');
                console.log('Backend service:', data.service, 'v' + data.version);
                
                // Dispatch success event
                window.dispatchEvent(new CustomEvent('database-status', { 
                    detail: { connected: true } 
                }));
            } else {
                throw new Error(`Backend responded with status ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            if (error.name === 'AbortError') {
                console.log('⚠️  Backend connection timeout - Running in offline mode');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.log('⚠️  Network error - Check if backend is running on port 3003');
            } else {
                console.log('⚠️  Backend not available - Running in offline mode');
                console.log('Error details:', error.message);
                console.log('Error stack:', error.stack);
            }
            this.connected = false;
            
            // Dispatch failure event
            window.dispatchEvent(new CustomEvent('database-status', { 
                detail: { connected: false } 
            }));
        }
    }
    
    async createUser(username, password) {
        if (!this.connected) {
            return [null, "Database not connected"];
        }
        
        try {
            console.log(`🔧 Creating user: ${username}`);
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log(`✅ User created successfully! User ID: ${data.user_id}`);
                return [data.user_id, data.message];
            } else {
                console.log(`❌ User creation failed: ${data.message}`);
                return [null, data.message];
            }
        } catch (error) {
            console.error('❌ Error creating user:', error);
            return [null, `Error creating user: ${error.message}`];
        }
    }
    
    async authenticateUser(username, password) {
        if (!this.connected) {
            return [null, "Database not connected"];
        }
        
        try {
            console.log(`🔧 Authenticating user: ${username}`);
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log(`✅ User authenticated successfully! User ID: ${data.user_id}`);
                // Store token for future requests
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                return [data.user_id, data.message];
            } else {
                console.log(`❌ Authentication failed: ${data.message}`);
                return [null, data.message];
            }
        } catch (error) {
            console.error('❌ Error authenticating user:', error);
            return [null, `Error authenticating user: ${error.message}`];
        }
    }
    
    async getUserInfo(userId) {
        if (!this.connected) {
            return null;
        }
        
        try {
            const response = await fetch(`${this.baseURL}/auth/user/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                return data.user;
            } else {
                console.error('Error getting user info:', data.message);
                return null;
            }
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    }
    
    async saveScore(userId, username, score, gameResult, survivalTime, gameMode = 'classic') {
        if (!this.connected) {
            console.log("❌ Database not connected. Score not saved.");
            return false;
        }
        
        try {
            console.log(`🔧 Saving score for ${username}: ${score} points (${gameResult})`);
            const response = await fetch(`${this.baseURL}/scores/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    username: username,
                    score: score,
                    game_result: gameResult,
                    survival_time: survivalTime,
                    game_mode: gameMode
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log(`✅ Score saved successfully!`);
                return true;
            } else {
                console.error('❌ Error saving score:', data.message);
                return false;
            }
        } catch (error) {
            console.error('❌ Error saving score:', error);
            return false;
        }
    }
    
    async getTopScores(limit = 50) {
        if (!this.connected) {
            return [];
        }
        
        try {
            const response = await fetch(`${this.baseURL}/scores/top/${limit}`);
            const data = await response.json();
            
            if (data.success) {
                return data.scores;
            } else {
                console.error('Error getting top scores:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error getting top scores:', error);
            return [];
        }
    }
    
    // Alias for getTopScores to match frontend usage
    async getLeaderboard(limit = 50) {
        try {
            const scores = await this.getTopScores(limit);
            return [scores, null];
        } catch (error) {
            return [[], "Error fetching leaderboard: " + error.message];
        }
    }
    
    async getUserScores(userId, limit = 10) {
        if (!this.connected) {
            return [];
        }
        
        try {
            const response = await fetch(`${this.baseURL}/scores/user/${userId}/${limit}`);
            const data = await response.json();
            
            if (data.success) {
                return data.scores;
            } else {
                console.error('Error getting user scores:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error getting user scores:', error);
            return [];
        }
    }
    
    async getPlayerBest(userId) {
        if (!this.connected) {
            return null;
        }
        
        try {
            const response = await fetch(`${this.baseURL}/scores/best/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                return data.score;
            } else {
                console.error('Error getting player best score:', data.message);
                return null;
            }
        } catch (error) {
            console.error('Error getting player best score:', error);
            return null;
        }
    }
    
    async saveGameResult(userId, gameMode, isWin, survivalTime, score) {
        if (!this.connected) {
            console.log("Database not connected. Game result not saved.");
            return false;
        }
        
        try {
            const user = await this.getUserInfo(userId);
            if (!user) {
                console.log("User not found. Game result not saved.");
                return false;
            }
            
            const username = user.username || 'Unknown';
            const gameResult = isWin ? "win" : "lose";
            
            return await this.saveScore(userId, username, score, gameResult, survivalTime, gameMode);
        } catch (error) {
            console.error('Error saving game result:', error);
            return false;
        }
    }
    
    // Get game statistics
    async getGameStats() {
        if (!this.connected) {
            return null;
        }
        
        try {
            const response = await fetch(`${this.baseURL}/../stats`);
            const data = await response.json();
            
            if (data.success) {
                return data.stats;
            } else {
                console.error('Error getting game stats:', data.message);
                return null;
            }
        } catch (error) {
            console.error('Error getting game stats:', error);
            return null;
        }
    }
    
    close() {
        console.log("Database connection closed.");
        // Clear auth token
        localStorage.removeItem('auth_token');
    }
}

// Create alias for backward compatibility
const DatabaseMongo = MazeChaseDB;

// Export for browser compatibility
if (typeof window !== 'undefined') {
    window.MazeChaseDB = MazeChaseDB;
    window.DatabaseMongo = DatabaseMongo;
}

console.log('✅ Database client loaded');
