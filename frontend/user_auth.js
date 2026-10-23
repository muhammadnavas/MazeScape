// User authentication system - Updated for MongoDB Backend
class UserAuth {
 constructor(database) {
 this.currentUser = null;
 this.database = database;
 }
 
 async register(username, password) {
 if (!this.database || !this.database.connected) {
 return [false, 'Database not available'];
 }
 
 // Validate input
 if (!username || username.trim().length < 3) {
 return [false, 'Username must be at least 3 characters long'];
 }
 
 if (!password || password.length < 6) {
 return [false, 'Password must be at least 6 characters long'];
 }
 
 try {
 console.log(` UserAuth: Attempting to register user: ${username}`);
 const [userId, message] = await this.database.createUser(username.trim(), password);
 
 if (userId) {
 console.log(` UserAuth: Registration successful for ${username}`);
 return [true, message || 'Registration successful!'];
 } else {
 console.log(` UserAuth: Registration failed for ${username}: ${message}`);
 return [false, message || 'Registration failed'];
 }
 } catch (error) {
 console.error(' UserAuth: Registration error:', error);
 return [false, `Registration error: ${error.message}`];
 }
 }
 
 async login(username, password) {
 if (!this.database || !this.database.connected) {
 return null;
 }
 
 if (!username || !password) {
 return null;
 }
 
 try {
 console.log(` UserAuth: Attempting to login user: ${username}`);
 const [userId, message] = await this.database.authenticateUser(username.trim(), password);
 
 if (userId) {
 // Get full user information
 const userInfo = await this.database.getUserInfo(userId);
 
 this.currentUser = {
 user_id: userId,
 username: username.trim(),
...userInfo
 };
 
 console.log(` UserAuth: Login successful for ${username}`);
 return this.currentUser;
 } else {
 console.log(` UserAuth: Login failed for ${username}: ${message}`);
 return null;
 }
 } catch (error) {
 console.error(' UserAuth: Login error:', error);
 return null;
 }
 }
 
 getCurrentUser() {
 return this.currentUser;
 }
 
 async getUserInfo(userId) {
 if (!this.database || !this.database.connected) {
 return null;
 }
 
 try {
 return await this.database.getUserInfo(userId);
 } catch (error) {
 console.error(' UserAuth: Error getting user info:', error);
 return null;
 }
 }
 
 logout() {
 console.log(' UserAuth: Logging out user');
 this.currentUser = null;
 // Clear stored auth token
 localStorage.removeItem('auth_token');
 }
 
 isLoggedIn() {
 return this.currentUser !== null;
 }
 
 async getUserScores(limit = 10) {
 if (!this.currentUser || !this.database || !this.database.connected) {
 return [];
 }
 
 try {
 return await this.database.getUserScores(this.currentUser.user_id, limit);
 } catch (error) {
 console.error(' UserAuth: Error getting user scores:', error);
 return [];
 }
 }
 
 async getBestScore() {
 if (!this.currentUser || !this.database || !this.database.connected) {
 return null;
 }
 
 try {
 return await this.database.getPlayerBest(this.currentUser.user_id);
 } catch (error) {
 console.error(' UserAuth: Error getting best score:', error);
 return null;
 }
 }
}

// Export for browser compatibility
if (typeof window !== 'undefined') {
 window.UserAuth = UserAuth;
}

console.log(' User authentication system loaded');
