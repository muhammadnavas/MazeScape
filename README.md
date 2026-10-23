# MazeScape

A modern, full-stack maze game featuring intelligent AI pathfinding and real-time multiplayer capabilities. Navigate through procedurally generated mazes while evading an AI-powered ghost that uses the A* algorithm to hunt you down.

## Links

- **GitHub Repository**: [https://github.com/muhammadnavas/MazeScape.git](https://github.com/muhammadnavas/MazeScape.git)
- **Live Demo**: [Play MazeScape](https://your-domain.com)
- **Portfolio**: [Your Portfolio](https://your-portfolio.com)
- **LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)

![MazeScape Banner](https://img.shields.io/badge/Status-Active-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-v18+-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)

## Features

### Core Gameplay
- **Procedural Maze Generation**: Every game features a unique, randomly generated maze
- **Intelligent AI Enemy**: Ghost uses A* pathfinding algorithm for optimal pursuit
- **Power-ups System**: Collect strategic power-ups to gain temporary advantages
- **Lives System**: Start with 2 lives, lose one when caught by the ghost
- **Real-time Scoring**: Dynamic scoring system with time bonuses and penalties

### Power-ups
- ** Speed Boost**: Double movement speed for 3 seconds
- ** Freeze**: Immobilize the ghost for 3 seconds 
- ** Wall Breaker**: Phase through walls for 3 seconds

### Scoring System
- **Win Bonus**: +100 points for maze completion
- **Time Bonus**: Up to +100 points for fast completion (15 seconds or less)
- **Survival Points**: +2 points per second while playing
- **Power-up Penalty**: -10 points per power-up used
- **Lives Bonus**: +20 points if you finish with full lives

### Modern UI/UX
- **Responsive Design**: Seamless gameplay across desktop and mobile devices
- **Neon Aesthetic**: Cyberpunk-inspired visual design with glowing effects
- **Mobile Controls**: Touch-friendly on-screen controls for mobile gaming
- **Real-time Stats**: Live tracking of score, time, and lives during gameplay

### User Management
- **User Authentication**: Secure registration and login system
- **Score Persistence**: All scores saved to MongoDB database
- **Leaderboard**: Global rankings showing top players
- **User Profiles**: Personal statistics and game history

## Technology Stack

### Frontend
- **HTML5 Canvas**: High-performance 2D graphics rendering
- **Vanilla JavaScript**: Modern ES6+ features for game logic
- **CSS3**: Advanced styling with animations and responsive design
- **Local Storage**: Client-side settings persistence

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Fast, minimalist web framework
- **MongoDB**: NoSQL database for user data and scores
- **Mongoose**: Elegant MongoDB object modeling

### Security & Performance
- **bcryptjs**: Password hashing and security
- **JWT**: JSON Web Tokens for authentication
- **Helmet**: Security middleware for Express
- **Rate Limiting**: API protection against abuse
- **CORS**: Cross-origin resource sharing configuration

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB instance
- Modern web browser with HTML5 Canvas support

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/muhammadnavas/MazeScape.git
cd MazeScape
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**
Create a `.env` file in the backend directory:
```env
PORT=3000
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/mazescape?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000
```

4. **Start the backend server**
```bash
npm start
# or for development with auto-reload
npm run dev
```

5. **Open the game**
Navigate to `http://localhost:3000` in your browser

## How to Play

### Controls
- **Movement**: WASD keys or Arrow keys
- **Start Game**: Spacebar (from menu)
- **Fullscreen**: F11 key
- **Mobile**: Touch controls available on mobile devices

### Objective
Navigate through the maze to reach the **yellow exit square** while avoiding the red ghost that uses intelligent pathfinding to chase you.

### Strategy Tips
- Plan your route carefully - the ghost uses optimal pathfinding
- Use power-ups strategically when cornered
- Wall Breaker can create new escape routes
- Speed Boost is excellent for outrunning the ghost
- Freeze gives you time to reposition safely
- Complete the maze quickly for maximum time bonus

## Project Structure

```
MazeScape/
├── backend/
│ ├── config/
│ │ └── database.js # MongoDB connection configuration
│ ├── models/
│ │ ├── User.js # User data model
│ │ └── Score.js # Game score model
│ ├── routes/
│ │ ├── auth.js # Authentication endpoints
│ │ └── scores.js # Score management endpoints
│ ├── package.json # Backend dependencies
│ └── server.js # Express server setup
├── frontend/
│ ├── index.html # Main game interface
│ ├── style.css # Game styling and animations
│ ├── game.js # Core game logic and rendering
│ ├── astar.js # A* pathfinding algorithm
│ ├── config.js # Frontend configuration
│ ├── database_mongo.js # Database client interface
│ └── user_auth.js # Client-side authentication
└── README.md # This file
```

## A* Pathfinding Algorithm

The game features a sophisticated AI enemy powered by the A* (A-star) algorithm:

- **Optimal Pathfinding**: Guarantees the shortest path from ghost to player
- **Heuristic Function**: Uses Manhattan distance for efficient pathfinding
- **Dynamic Obstacles**: Adapts to maze layout and wall-breaker power-ups
- **Performance Optimized**: Efficient implementation suitable for real-time gameplay

### Algorithm Details
- **f(n) = g(n) + h(n)** where:
 - g(n): Actual cost from start to node n
 - h(n): Heuristic estimate from node n to goal
 - f(n): Estimated total cost of path through n

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/verify` - Token verification

### Scores
- `GET /scores/leaderboard` - Global leaderboard
- `POST /scores/save` - Save game score
- `GET /scores/user/:userId` - User's score history
- `GET /scores/best/:userId` - User's best score

## Customization

### Game Settings
- Maze dimensions and complexity
- Ghost speed and behavior
- Power-up spawn rates and effects
- Scoring system parameters

### Visual Themes
- Neon color schemes
- Particle effects
- UI animations
- Mobile responsiveness

## Contributing

1. Fork the repository ([muhammadnavas/MazeScape](https://github.com/muhammadnavas/MazeScape.git))
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Bug Reports & Feature Requests

Please use the GitHub Issues page to report bugs or request features:
- [muhammadnavas/MazeScape Issues](https://github.com/muhammadnavas/MazeScape/issues)

## Achievements

- Modern full-stack architecture with clean separation of concerns
- Real-time gameplay with smooth 60fps Canvas rendering
- Secure authentication with JWT and bcrypt
- Responsive design supporting desktop and mobile platforms
- Intelligent AI using industry-standard pathfinding algorithms
- Comprehensive scoring system with persistent leaderboards

---

**Built with by [muhammadnavas](https://github.com/muhammadnavas/MazeScape.git)**

*Showcasing modern web development, game programming, and AI algorithms in an engaging, interactive experience.*