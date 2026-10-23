// Frontend Database Client - Connects to the MazeScape API
class MazeChaseDB {
    constructor() {
        this.baseURL = window.__APP_CONFIG__.BACKEND_URL.replace(/\/$/, '');
        this.connected = false;
        this.init();
    }

    authHeaders() {
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        const token = localStorage.getItem('auth_token');
        if (token) headers.Authorization = `Bearer ${token}`;
        return headers;
    }

    async request(path, options = {}) {
        const response = await fetch(`${this.baseURL}${path}`, {
            ...options,
            headers: { ...this.authHeaders(), ...(options.headers || {}) },
            mode: 'cors'
        });

        let data;
        try {
            data = await response.json();
        } catch (_) {
            throw new Error('The server returned an invalid response');
        }

        if (!response.ok || data.success === false) {
            if (response.status === 401 && path !== '/auth/login' && path !== '/auth/register') {
                localStorage.removeItem('auth_token');
            }
            throw new Error(data.message || `Request failed (${response.status})`);
        }
        return data;
    }

    async init() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);
            try {
                const response = await fetch(`${this.baseURL}/health`, {
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' },
                    mode: 'cors'
                });
                if (!response.ok) throw new Error(`Backend responded with status ${response.status}`);
                const data = await response.json();
                this.connected = data.success === true;
                if (!this.connected) throw new Error('Backend health check failed');
                window.dispatchEvent(new CustomEvent('database-status', {
                    detail: { connected: true, database: data.database?.status || 'unknown' }
                }));
            } finally {
                clearTimeout(timeoutId);
            }
        } catch (error) {
            console.error('MazeScape backend connection failed:', error.message);
            this.connected = false;
            window.dispatchEvent(new CustomEvent('database-status', {
                detail: { connected: false, message: error.message }
            }));
        }
    }

    async createUser(username, password) {
        if (!this.connected) return [null, 'Backend is not connected'];
        try {
            const data = await this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username: username.trim(), password })
            });
            return [data.user_id, data.message];
        } catch (error) {
            return [null, error.message];
        }
    }

    async authenticateUser(username, password) {
        if (!this.connected) return [null, 'Backend is not connected'];
        try {
            const data = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username: username.trim(), password })
            });
            if (data.token) localStorage.setItem('auth_token', data.token);
            return [data.user_id, data.message];
        } catch (error) {
            return [null, error.message];
        }
    }

    async getUserInfo(userId) {
        if (!this.connected) return null;
        try {
            const data = await this.request(`/auth/user/${encodeURIComponent(userId)}`);
            return data.user || null;
        } catch (error) {
            console.error('Error getting user info:', error.message);
            return null;
        }
    }

    async saveScore(userId, username, score, gameResult, survivalTime, gameMode = 'classic') {
        if (!this.connected) return false;
        try {
            await this.request('/scores/save', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: userId,
                    username,
                    score,
                    game_result: gameResult,
                    survival_time: survivalTime,
                    game_mode: gameMode
                })
            });
            return true;
        } catch (error) {
            console.error('Error saving score:', error.message);
            return false;
        }
    }

    async getTopScores(limit = 50) {
        if (!this.connected) return [];
        try {
            const safeLimit = Number.isInteger(Number(limit)) ? Math.max(1, Math.min(100, Number(limit))) : 50;
            const data = await this.request(`/scores/top/${safeLimit}`);
            return data.scores || [];
        } catch (error) {
            console.error('Error getting leaderboard:', error.message);
            return [];
        }
    }

    async getLeaderboard(limit = 50) {
        try {
            return [await this.getTopScores(limit), null];
        } catch (error) {
            return [[], error.message];
        }
    }

    async getUserScores(userId, limit = 10) {
        if (!this.connected || !userId) return [];
        try {
            const safeLimit = Number.isInteger(Number(limit)) ? Math.max(1, Math.min(100, Number(limit))) : 10;
            const data = await this.request(`/scores/user/${encodeURIComponent(userId)}/${safeLimit}`);
            return data.scores || [];
        } catch (error) {
            console.error('Error getting user scores:', error.message);
            return [];
        }
    }

    async getPlayerBest(userId) {
        if (!this.connected || !userId) return null;
        try {
            const data = await this.request(`/scores/best/${encodeURIComponent(userId)}`);
            return data.score || null;
        } catch (error) {
            if (!error.message.includes('No scores found')) {
                console.error('Error getting player best score:', error.message);
            }
            return null;
        }
    }

    async saveGameResult(userId, gameMode, isWin, survivalTime, score) {
        if (!this.connected) return false;
        const user = await this.getUserInfo(userId);
        if (!user) return false;
        return this.saveScore(userId, user.username, score, isWin ? 'win' : 'lose', survivalTime, gameMode);
    }

    async getGameStats() {
        if (!this.connected) return null;
        try {
            const data = await this.request('/stats');
            return data.stats || null;
        } catch (error) {
            console.error('Error getting game stats:', error.message);
            return null;
        }
    }

    close() {
        localStorage.removeItem('auth_token');
    }
}

const DatabaseMongo = MazeChaseDB;

if (typeof window !== 'undefined') {
    window.MazeChaseDB = MazeChaseDB;
    window.DatabaseMongo = DatabaseMongo;
}
