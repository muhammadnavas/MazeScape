// Maze Chase - Exact JavaScript Implementation of Python Game
// Complete gameplay implementation matching Python version

// Game Constants - Exact values from Python
const GRID_SIZE = 40;
const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const WALL_DENSITY = 0.25;
const PLAYER_SPEED = 0.04;
const GHOST_STEP_INTERVAL = 0.6;  // Slower ghost (increased from 0.2)
const GHOST_PATHFIND_INTERVAL = 0.5;

// Enhanced Game Constants
const POWERUP_SPAWN_CHANCE = 0.02;  // 2% chance per second
const POWERUP_DURATION = 3.0;  // 3 seconds
const MAX_GHOSTS = 1;  // Keep only one ghost

// Power-up Types
const POWERUP_SPEED = "speed";
const POWERUP_FREEZE = "freeze";  
const POWERUP_WALLBREAKER = "wallbreaker";

// Modern Color Palette - Exact from Python
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const DARK_GRAY = '#282828';
const LIGHT_GRAY = '#C8C8C8';
const MEDIUM_GRAY = '#787878';

// Primary Colors
const NEON_GREEN = '#39FF14';
const ELECTRIC_BLUE = '#00BFFF';
const CYBER_PURPLE = '#8A2BE2';
const NEON_PINK = '#FF1493';

// Game Colors
const GREEN = NEON_GREEN;
const RED = '#FF3232';
const YELLOW = '#FFD700';
const ORANGE = '#FFA500';

// UI Theme Colors
const PRIMARY_BG = '#0F0F17';      // Dark navy background
const SECONDARY_BG = '#191923';    // Slightly lighter background
const ACCENT_COLOR = ELECTRIC_BLUE;  // Main accent color
const SUCCESS_COLOR = NEON_GREEN;    // Success messages
const ERROR_COLOR = '#FF453A';       // Error messages
const WARNING_COLOR = ORANGE;        // Warning messages

// Button Colors
const BUTTON_NORMAL = '#2D2D3C';
const BUTTON_HOVER = '#3C3C50';
const BUTTON_ACTIVE = ACCENT_COLOR;

// Text Colors
const TEXT_PRIMARY = WHITE;
const TEXT_SECONDARY = LIGHT_GRAY;
const TEXT_MUTED = MEDIUM_GRAY;

// Utility Functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function distance(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
}

// Drawing Utilities
function drawGradientRect(ctx, color1, color2, x, y, width, height, vertical = true) {
    const gradient = vertical 
        ? ctx.createLinearGradient(x, y, x, y + height)
        : ctx.createLinearGradient(x, y, x + width, y);
    
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
}

function drawGlowingText(ctx, text, font, color, x, y, glowColor = null, center = false) {
    if (!glowColor) glowColor = color;
    
    ctx.font = font;
    const metrics = ctx.measureText(text);
    
    if (center) {
        x = x - metrics.width / 2;
    }
    
    // Create glow effect
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    
    // Draw main text
    ctx.shadowBlur = 0;
    ctx.fillText(text, x, y);
    ctx.restore();
    
    return { x, y, width: metrics.width, height: 20 };
}

function drawAnimatedBackground(ctx, width, height, timeOffset = 0) {
    // Fill with primary background
    ctx.fillStyle = PRIMARY_BG;
    ctx.fillRect(0, 0, width, height);
    
    // Add animated grid pattern
    const gridSize = 50;
    ctx.save();
    ctx.globalAlpha = 0.1;
    
    for (let x = 0; x < width; x += gridSize) {
        const alpha = 0.2 + 0.1 * (1 + Math.sin((x + timeOffset) * 0.01));
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = ACCENT_COLOR;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
        const alpha = 0.2 + 0.1 * (1 + Math.cos((y + timeOffset) * 0.01));
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = ACCENT_COLOR;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawPanel(ctx, x, y, width, height, title = null, alpha = 0.9) {
    // Background
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = SECONDARY_BG;
    ctx.fillRect(x, y, width, height);
    
    // Border
    ctx.globalAlpha = 1;
    ctx.strokeStyle = ACCENT_COLOR;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
    
    // Title if provided
    if (title) {
        drawGlowingText(ctx, title, 'bold 16px Arial', ACCENT_COLOR, x + width / 2, y + 25, null, true);
        return y + 40;
    }
    
    return y + 20;
}

function drawAnimatedBackground(ctx, width, height, currentTime) {
    // Draw dark gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, PRIMARY_BG);
    gradient.addColorStop(1, SECONDARY_BG);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle animated particles in background
    ctx.save();
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 20; i++) {
        const x = (width * 0.1 * i + currentTime * 0.0001 * (i + 1)) % width;
        const y = (height * 0.05 * i + Math.sin(currentTime * 0.001 + i) * 50) % height;
        const size = 2 + Math.sin(currentTime * 0.002 + i) * 1;
        
        ctx.fillStyle = ACCENT_COLOR;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.restore();
}

// Particle System - Exact implementation from Python
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    addExplosion(pos, color, count = 15) {
        // Add explosion particles - exact Python implementation
        for (let i = 0; i < count; i++) {
            const velocity = [randomFloat(-5, 5), randomFloat(-5, 5)];
            const lifetime = randomFloat(30, 60);
            const size = randomInt(3, 8);
            this.particles.push({
                pos: [...pos],
                velocity: velocity,
                color: color,
                lifetime: lifetime,
                maxLifetime: lifetime,
                size: size,
                type: 'explosion'
            });
        }
    }
    
    addTrail(pos, color, velocity = [0, 0]) {
        // Add trail particles - exact Python implementation
        for (let i = 0; i < 3; i++) {
            const offsetPos = [pos[0] + randomInt(-5, 5), pos[1] + randomInt(-5, 5)];
            const particleVelocity = [velocity[0] + randomFloat(-1, 1), velocity[1] + randomFloat(-1, 1)];
            this.particles.push({
                pos: offsetPos,
                velocity: particleVelocity,
                color: color,
                lifetime: 20,
                maxLifetime: 20,
                size: randomInt(2, 4),
                type: 'trail'
            });
        }
    }
    
    addPowerupGlow(pos, color) {
        // Add glowing particles around power-ups - exact Python implementation
        for (let i = 0; i < 2; i++) {
            const angle = randomFloat(0, 2 * Math.PI);
            const radius = randomFloat(10, 20);
            const particlePos = [
                pos[0] + Math.cos(angle) * radius,
                pos[1] + Math.sin(angle) * radius
            ];
            this.particles.push({
                pos: particlePos,
                velocity: [0, -0.5],
                color: color,
                lifetime: 40,
                maxLifetime: 40,
                size: randomInt(2, 5),
                type: 'glow'
            });
        }
    }
    
    update() {
        // Use list comprehension for better performance - exact from Python
        this.particles = this.particles.filter(particle => {
            particle.pos[0] += particle.velocity[0];
            particle.pos[1] += particle.velocity[1];
            particle.lifetime--;
            
            // Apply gravity to explosion particles
            if (particle.type === 'explosion') {
                particle.velocity[1] += 0.1;
            }
            
            return particle.lifetime > 0;
        });
    }
    
    draw(ctx) {
        for (let particle of this.particles) {
            const alpha = particle.lifetime / particle.maxLifetime;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.pos[0], particle.pos[1], particle.size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
    }
}

// Ghost Class - Enhanced Ghost class with independent AI movement
class Ghost {
    constructor(pos) {
        this.pos = [...pos];
        this.path = [];
        this.lastPathTime = 0;
        this.lastMoveTime = 0;
        this.frozenUntil = 0;
        this.speedMultiplier = 1.0;
        this.color = RED;
        this.speedInterval = GHOST_STEP_INTERVAL;
        this.pathfindInterval = GHOST_PATHFIND_INTERVAL;
        this.lastPlayerPos = null;
        this.mazeRef = null;  // Reference to maze for fallback pathfinding
    }
    
    isFrozen() {
        return Date.now() / 1000 < this.frozenUntil;
    }
    
    freeze(duration) {
        this.frozenUntil = Date.now() / 1000 + duration;
    }
    
    updatePath(maze, targetPos, playerPos) {
        // Optimized pathfinding with caching - ghosts move independently
        if (this.isFrozen()) return;
        
        const currentTime = Date.now() / 1000;
        
        // Always recalculate path periodically or if player moved significantly
        let shouldRecalculate = false;
        
        // Recalculate if enough time has passed (ghosts should be persistent)
        if (currentTime - this.lastPathTime >= this.pathfindInterval) {
            shouldRecalculate = true;
        }
        
        // Recalculate if player moved significantly (for better chasing)
        if (this.lastPlayerPos && 
            (Math.abs(this.lastPlayerPos[0] - playerPos[0]) > 1 || 
             Math.abs(this.lastPlayerPos[1] - playerPos[1]) > 1)) {
            shouldRecalculate = true;
        }
        
        // Recalculate if ghost has no path or reached the end of current path
        if (!this.path || this.path.length === 0) {
            shouldRecalculate = true;
        }
        
        // Always recalculate on first run (when lastPlayerPos is null)
        if (this.lastPlayerPos === null) {
            shouldRecalculate = true;
        }
        
        if (shouldRecalculate) {
            const pathfinder = new AStar();
            const path = pathfinder.findPath(maze, this.pos, playerPos);
            
            if (path && path.length > 1) {  // Ensure valid path
                this.path = path.slice(1);  // Skip current position
                this.lastPlayerPos = [...playerPos];
                this.lastPathTime = currentTime;
            } else if (!this.path) {  // If no path found and ghost has no current path
                // Create a simple movement towards player as fallback
                this.createSimplePathToPlayer(playerPos);
                this.lastPlayerPos = [...playerPos];
                this.lastPathTime = currentTime;
            }
        }
    }
    
    createSimplePathToPlayer(playerPos) {
        // Create a simple direct path towards player as fallback - matching Python logic
        const dy = playerPos[0] - this.pos[0];
        const dx = playerPos[1] - this.pos[1];
        
        // Simple movement: try to move towards player one step at a time
        let nextMoves = [];
        
        if (Math.abs(dy) > Math.abs(dx)) {
            // Move vertically first
            if (dy > 0) {
                nextMoves.push([this.pos[0] + 1, this.pos[1]]);
            } else if (dy < 0) {
                nextMoves.push([this.pos[0] - 1, this.pos[1]]);
            }
        } else {
            // Move horizontally first
            if (dx > 0) {
                nextMoves.push([this.pos[0], this.pos[1] + 1]);
            } else if (dx < 0) {
                nextMoves.push([this.pos[0], this.pos[1] - 1]);
            }
        }
        
        // Add the move if it's valid (not a wall) - matching Python validation
        if (nextMoves.length > 0 && this.mazeRef) {
            const [y, x] = nextMoves[0];
            if (y >= 0 && y < this.mazeRef.length && 
                x >= 0 && x < this.mazeRef[0].length && 
                this.mazeRef[y][x] === 0) {
                this.path = [nextMoves[0]];
            } else {
                // If blocked, try other directions - matching Python fallback
                for (let [dy, dx] of DIRECTIONS) {
                    const newY = this.pos[0] + dy;
                    const newX = this.pos[1] + dx;
                    if (newY >= 0 && newY < this.mazeRef.length &&
                        newX >= 0 && newX < this.mazeRef[0].length &&
                        this.mazeRef[newY][newX] === 0) {
                        this.path = [[newY, newX]];
                        break;
                    }
                }
            }
        } else {
            this.path = [];  // No maze reference available
        }
    }
    
    update() {
        // Update ghost movement - ghosts move independently of player
        if (this.isFrozen()) return;
        
        const currentTime = Date.now() / 1000;
        const effectiveInterval = this.speedInterval / this.speedMultiplier;
        
        // Ghost moves based on its own timer, not player movement
        if (currentTime - this.lastMoveTime >= effectiveInterval) {
            if (this.path && this.path.length > 0) {
                // Move to next position in path
                const nextPos = this.path.shift();
                this.pos = nextPos;
                this.lastMoveTime = currentTime;
            }
            // If no path, ghost stays in place but still updates its timer
            // This ensures it will try to find a new path on next updatePath call
        }
    }
    
    draw(ctx, offsetX, offsetY, currentTime) {
        const ghostRect = {
            x: offsetX + this.pos[1] * GRID_SIZE,
            y: offsetY + this.pos[0] * GRID_SIZE,
            width: GRID_SIZE,
            height: GRID_SIZE
        };
        
        // Frozen effect
        let frozenColor, pulse;
        if (this.isFrozen()) {
            // Blue tint for frozen ghosts
            frozenColor = '#6496FF';
            pulse = 100 + 50 * (1 + Math.sin(currentTime * 0.05));
        } else {
            frozenColor = this.color;
            pulse = 80 + 40 * (1 + Math.sin(currentTime * 0.02));
        }
        
        // Ghost glow
        ctx.save();
        ctx.globalAlpha = pulse / 255;
        ctx.fillStyle = frozenColor;
        ctx.fillRect(ghostRect.x - 7, ghostRect.y - 7, GRID_SIZE + 15, GRID_SIZE + 15);
        ctx.restore();
        
        // Main ghost body
        ctx.fillStyle = frozenColor;
        ctx.fillRect(ghostRect.x, ghostRect.y, ghostRect.width, ghostRect.height);
    }
}

// PowerUp Class - Power-up class for collectible items
class PowerUp {
    constructor(pos, powerupType) {
        this.pos = [...pos];
        this.type = powerupType;
        this.spawnTime = Date.now() / 1000;
        this.lifetime = 15.0;  // Power-ups last 15 seconds - matching Python
        
        // Type-specific properties - exact match with Python
        if (powerupType === POWERUP_SPEED) {
            this.color = ELECTRIC_BLUE;
            this.symbol = "⚡";
        } else if (powerupType === POWERUP_FREEZE) {
            this.color = '#64C8FF';  // Light blue for freeze - matching Python
            this.symbol = "❄";
        } else if (powerupType === POWERUP_WALLBREAKER) {
            this.color = ORANGE;
            this.symbol = "🔨";
        }
    }
    
    isExpired() {
        return Date.now() / 1000 - this.spawnTime > this.lifetime;
    }
    
    draw(ctx, offsetX, offsetY, currentTime) {
        // Pulsing effect - matching Python implementation
        const pulse = 0.8 + 0.2 * Math.sin(currentTime * 0.01);
        const size = GRID_SIZE * pulse;
        
        const powerupRect = {
            x: offsetX + this.pos[1] * GRID_SIZE + (GRID_SIZE - size) / 2,
            y: offsetY + this.pos[0] * GRID_SIZE + (GRID_SIZE - size) / 2,
            width: size,
            height: size
        };
        
        // Glow effect - matching Python
        ctx.save();
        const alpha = 100 + 50 * Math.sin(currentTime * 0.02);
        ctx.globalAlpha = alpha / 255;
        ctx.fillStyle = this.color;
        ctx.fillRect(powerupRect.x - 5, powerupRect.y - 5, size + 10, size + 10);
        ctx.restore();
        
        // Main power-up - matching Python styling
        ctx.fillStyle = this.color;
        ctx.fillRect(powerupRect.x, powerupRect.y, powerupRect.width, powerupRect.height);
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 2;
        ctx.strokeRect(powerupRect.x, powerupRect.y, powerupRect.width, powerupRect.height);
        
        // Symbol (simplified as colored dot for now) - matching Python
        const centerDotSize = Math.max(3, size / 4);
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(powerupRect.x + size / 2, powerupRect.y + size / 2, centerDotSize, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// Main MazeGame Class - Exact implementation from Python
class MazeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Calculate grid dimensions based on current screen
        this.GRID_WIDTH = Math.max(10, Math.floor(canvas.width / GRID_SIZE));
        this.GRID_HEIGHT = Math.max(10, Math.floor(canvas.height / GRID_SIZE));
        
        this.pathfinder = new AStar();
        
        // Enhanced game state
        this.particles = new ParticleSystem();
        this.ghosts = [];
        this.powerups = [];
        this.activePowerups = {};  // Track active power-up effects
        this.lastPowerupSpawn = 0;
        
        // No time limit
        this.gameDuration = Infinity;
        this.won = false;
        
        this.resetGame();
    }
    
    spawnPowerup() {
        // Spawn a random power-up at a random location
        const emptySpaces = [];
        for (let y = 1; y < this.GRID_HEIGHT - 1; y++) {
            for (let x = 1; x < this.GRID_WIDTH - 1; x++) {
                if (this.maze[y][x] === 0 && 
                    (y !== this.playerPos[0] || x !== this.playerPos[1]) && 
                    (y !== this.targetPos[0] || x !== this.targetPos[1]) &&
                    !this.ghosts.some(ghost => ghost.pos[0] === y && ghost.pos[1] === x) &&
                    !this.powerups.some(powerup => powerup.pos[0] === y && powerup.pos[1] === x)) {
                    emptySpaces.push([y, x]);
                }
            }
        }
        
        if (emptySpaces.length > 0) {
            const pos = emptySpaces[randomInt(0, emptySpaces.length - 1)];
            const powerupType = [POWERUP_SPEED, POWERUP_FREEZE, POWERUP_WALLBREAKER][randomInt(0, 2)];
            const powerup = new PowerUp(pos, powerupType);
            this.powerups.push(powerup);
            this.particles.addExplosion([pos[1] * GRID_SIZE + GRID_SIZE/2, pos[0] * GRID_SIZE + GRID_SIZE/2], powerup.color, 8);
            
            // Show powerup spawn notification
            if (window.gameController) {
                let message, icon;
                if (powerupType === POWERUP_SPEED) {
                    message = "Speed Boost Spawned!";
                    icon = "⚡";
                } else if (powerupType === POWERUP_FREEZE) {
                    message = "Ghost Freeze Spawned!";
                    icon = "❄️";
                } else if (powerupType === POWERUP_WALLBREAKER) {
                    message = "Wall Breaker Spawned!";
                    icon = "🔨";
                }
                window.gameController.showPowerupNotification(message, icon);
            }
        }
    }
    
    collectPowerup(powerup) {
        // Activate a power-up effect - exact Python implementation
        console.log("Power-up collected:", powerup.type);
        
        // Deduct points for using power-up - new scoring system
        this.score -= 10;
        
        if (powerup.type === POWERUP_SPEED) {
            this.activePowerups[POWERUP_SPEED] = Date.now() / 1000 + POWERUP_DURATION;
            // Update player effects for HUD display - exact Python matching
            if (this.player && this.player.effects) {
                this.player.effects.speedBoost = POWERUP_DURATION * 60; // Convert to frames
            }
            // Show powerup notification
            if (window.gameController) {
                window.gameController.showPowerupNotification("Speed Boost Activated!", "⚡");
            }
        } else if (powerup.type === POWERUP_FREEZE) {
            // Freeze all ghosts - matching Python behavior
            for (let ghost of this.ghosts) {
                ghost.freeze(POWERUP_DURATION);
            }
            // Update player effects for HUD display - exact Python matching
            if (this.player && this.player.effects) {
                this.player.effects.freeze = POWERUP_DURATION * 60; // Convert to frames
            }
            // Show powerup notification
            if (window.gameController) {
                window.gameController.showPowerupNotification("Ghost Freeze Activated!", "❄️");
            }
        } else if (powerup.type === POWERUP_WALLBREAKER) {
            this.activePowerups[POWERUP_WALLBREAKER] = Date.now() / 1000 + POWERUP_DURATION;
            // Update player effects for HUD display - exact Python matching
            if (this.player && this.player.effects) {
                this.player.effects.wallBreaker = POWERUP_DURATION * 60; // Convert to frames
            }
            // Show powerup notification
            if (window.gameController) {
                window.gameController.showPowerupNotification("Wall Breaker Activated!", "🔨");
            }
        }
        
        // Particle effect - matching Python
        this.particles.addExplosion([powerup.pos[1] * GRID_SIZE + GRID_SIZE/2, powerup.pos[0] * GRID_SIZE + GRID_SIZE/2], powerup.color, 12);
    }
    
    updateForScreenChange() {
        // Update game state when screen dimensions change (like fullscreen toggle)
        const oldGridWidth = this.GRID_WIDTH;
        const oldGridHeight = this.GRID_HEIGHT;
        
        this.GRID_WIDTH = Math.max(10, Math.floor(this.canvas.width / GRID_SIZE));
        this.GRID_HEIGHT = Math.max(10, Math.floor(this.canvas.height / GRID_SIZE));
        
        // If grid size changed significantly, regenerate maze
        if (Math.abs(this.GRID_WIDTH - oldGridWidth) > 2 || 
            Math.abs(this.GRID_HEIGHT - oldGridHeight) > 2) {
            
            // Preserve relative positions
            const playerRatioX = this.playerPos[1] / oldGridWidth;
            const playerRatioY = this.playerPos[0] / oldGridHeight;
            
            // Update positions
            this.playerPos = [
                Math.min(this.GRID_HEIGHT - 2, Math.max(1, Math.floor(playerRatioY * this.GRID_HEIGHT))),
                Math.min(this.GRID_WIDTH - 2, Math.max(1, Math.floor(playerRatioX * this.GRID_WIDTH)))
            ];
            this.playerPosFloat = [...this.playerPos];
            
            this.targetPos = [this.GRID_HEIGHT - 2, this.GRID_WIDTH - 2];
            
            // Update ghost positions
            for (let ghost of this.ghosts) {
                const ghostRatioX = ghost.pos[1] / oldGridWidth;
                const ghostRatioY = ghost.pos[0] / oldGridHeight;
                ghost.pos = [
                    Math.min(this.GRID_HEIGHT - 2, Math.max(1, Math.floor(ghostRatioY * this.GRID_HEIGHT))),
                    Math.min(this.GRID_WIDTH - 2, Math.max(1, Math.floor(ghostRatioX * this.GRID_WIDTH)))
                ];
                ghost.path = [];  // Clear old paths
            }
            
            // Update power-up positions
            for (let powerup of this.powerups) {
                const powerupRatioX = powerup.pos[1] / oldGridWidth;
                const powerupRatioY = powerup.pos[0] / oldGridHeight;
                powerup.pos = [
                    Math.min(this.GRID_HEIGHT - 2, Math.max(1, Math.floor(powerupRatioY * this.GRID_HEIGHT))),
                    Math.min(this.GRID_WIDTH - 2, Math.max(1, Math.floor(powerupRatioX * this.GRID_WIDTH)))
                ];
            }
            
            // Regenerate maze with new dimensions
            this.generateMaze();
            
            // Update ghost paths
            for (let ghost of this.ghosts) {
                ghost.updatePath(this.maze, this.targetPos, this.playerPos);
            }
        }
    }
    
    resetGame() {
        this.maze = [];
        this.playerPos = [1, 1];
        this.playerPosFloat = [1.0, 1.0];
        this.playerDir = [0, 0];
        this.targetPos = [this.GRID_HEIGHT - 2, this.GRID_WIDTH - 2];
        
        // Initialize game statistics - exact Python implementation
        this.score = 0;
        this.lives = 2;
        
        // Initialize time tracking for scoring
        this.lastScoreTime = null;
        
        // Initialize player effects system - exact Python implementation
        this.player = {
            effects: {
                freeze: 0,
                speedBoost: 0,
                wallBreaker: 0
            }
        };
        
        // Clear enhanced state
        this.ghosts = [];
        this.powerups = [];
        this.activePowerups = {};
        this.particles = new ParticleSystem();
        
        // Reset timing
        this.startTime = Date.now() / 1000;
        this.lastPowerupSpawn = Date.now() / 1000;
        this.won = false;
        
        // Generate maze and setup initial ghosts
        this.generateMaze();
        
        // Start with one ghost
        const initialGhost = new Ghost([Math.floor(this.GRID_HEIGHT / 2), Math.floor(this.GRID_WIDTH / 2)]);
        initialGhost.mazeRef = this.maze;  // Set maze reference immediately
        this.ghosts.push(initialGhost);
        
        // Update ghost paths
        for (let ghost of this.ghosts) {
            ghost.mazeRef = this.maze;  // Ensure maze reference is set
            ghost.updatePath(this.maze, this.targetPos, this.playerPos);
        }
    }
    
    generateMaze() {
        // Optimized maze generation with retry limit
        const maxAttempts = 10;
        let attempt = 0;
        
        while (attempt < maxAttempts) {
            this.maze = Array(this.GRID_HEIGHT).fill().map(() => Array(this.GRID_WIDTH).fill(0));
            
            // Create borders
            for (let i = 0; i < this.GRID_WIDTH; i++) {
                this.maze[0][i] = 1;
                this.maze[this.GRID_HEIGHT - 1][i] = 1;
            }
            for (let i = 0; i < this.GRID_HEIGHT; i++) {
                this.maze[i][0] = 1;
                this.maze[i][this.GRID_WIDTH - 1] = 1;
            }
            
            // Add walls with improved distribution
            const wallCount = Math.floor(this.GRID_WIDTH * this.GRID_HEIGHT * WALL_DENSITY);
            let placedWalls = 0;
            
            while (placedWalls < wallCount) {
                const x = randomInt(1, this.GRID_WIDTH - 2);
                const y = randomInt(1, this.GRID_HEIGHT - 2);
                
                // Avoid blocking key positions
                if ((y !== this.playerPos[0] || x !== this.playerPos[1]) && 
                    (y !== this.targetPos[0] || x !== this.targetPos[1]) &&
                    (y !== Math.floor(this.GRID_HEIGHT / 2) || x !== Math.floor(this.GRID_WIDTH / 2)) &&
                    this.maze[y][x] === 0) {
                    this.maze[y][x] = 1;
                    placedWalls++;
                }
            }
            
            // Verify path exists
            const pathfinder = new AStar();
            if (pathfinder.findPath(this.maze, this.playerPos, this.targetPos).length > 0) {
                break;
            }
                
            attempt++;
        }
        
        if (attempt >= maxAttempts) {
            console.log("⚠️  Warning: Could not generate optimal maze, using fallback");
            // Create simple maze as fallback
            this.createSimpleMaze();
        }
    }
    
    createSimpleMaze() {
        // Create a simple maze as fallback
        this.maze = Array(this.GRID_HEIGHT).fill().map(() => Array(this.GRID_WIDTH).fill(0));
        
        // Create borders only
        for (let i = 0; i < this.GRID_WIDTH; i++) {
            this.maze[0][i] = 1;
            this.maze[this.GRID_HEIGHT - 1][i] = 1;
        }
        for (let i = 0; i < this.GRID_HEIGHT; i++) {
            this.maze[i][0] = 1;
            this.maze[i][this.GRID_WIDTH - 1] = 1;
        }
        
        // Add minimal walls for basic challenge
        for (let i = 2; i < this.GRID_HEIGHT - 2; i += 4) {
            for (let j = 2; j < this.GRID_WIDTH - 2; j += 4) {
                if ((i !== this.playerPos[0] || j !== this.playerPos[1]) && 
                    (i !== this.targetPos[0] || j !== this.targetPos[1])) {
                    this.maze[i][j] = 1;
                }
            }
        }
    }
    
    smoothMove(current, target, speed) {
        const dx = target[0] - current[0];
        const dy = target[1] - current[1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < speed) {
            return [...target];
        }
        return [current[0] + dx / dist * speed, current[1] + dy / dist * speed];
    }
    
    movePlayer(dy, dx) {
        this.playerDir = [dy, dx];
    }
    
    canBreakWall(y, x) {
        // Check if wall can be broken with wallbreaker power-up
        return (POWERUP_WALLBREAKER in this.activePowerups &&
                Date.now() / 1000 < this.activePowerups[POWERUP_WALLBREAKER] &&
                y >= 1 && y < this.GRID_HEIGHT - 1 && x >= 1 && x < this.GRID_WIDTH - 1);
    }
    
    update() {
        const currentTime = Date.now() / 1000;
        
        // Add +10 points every second - new scoring system
        if (!this.lastScoreTime) {
            this.lastScoreTime = currentTime;
        }
        if (currentTime - this.lastScoreTime >= 1.0) {
            this.score += 10;
            this.lastScoreTime = currentTime;
        }
        
        // Spawn power-ups
        if (currentTime - this.lastPowerupSpawn >= 1.0 &&  // Check every second
            Math.random() < POWERUP_SPAWN_CHANCE &&
            this.powerups.length < 3) {  // Max 3 power-ups at once
            this.spawnPowerup();
            this.lastPowerupSpawn = currentTime;
        }
        
        // Update power-ups (remove expired ones)
        this.powerups = this.powerups.filter(p => !p.isExpired());
        
        // Update active power-up effects
        const expiredEffects = [];
        for (let [effect, endTime] of Object.entries(this.activePowerups)) {
            if (currentTime >= endTime) {
                expiredEffects.push(effect);
            }
        }
        for (let effect of expiredEffects) {
            // Show notification when powerup expires
            if (window.gameController) {
                if (effect === POWERUP_SPEED) {
                    window.gameController.showPowerupNotification("Speed Boost Ended", "⚡");
                } else if (effect === POWERUP_FREEZE) {
                    window.gameController.showPowerupNotification("Ghost Freeze Ended", "❄️");
                } else if (effect === POWERUP_WALLBREAKER) {
                    window.gameController.showPowerupNotification("Wall Breaker Ended", "🔨");
                }
            }
            delete this.activePowerups[effect];
        }
        
        // Update player effects to match Python implementation
        if (this.player && this.player.effects) {
            this.player.effects.freeze = Math.max(0, this.player.effects.freeze - 1);
            this.player.effects.speedBoost = Math.max(0, this.player.effects.speedBoost - 1);
            this.player.effects.wallBreaker = Math.max(0, this.player.effects.wallBreaker - 1);
        }
        
        // Update all ghosts - they move independently
        for (let ghost of this.ghosts) {
            // Store maze reference for fallback pathfinding
            ghost.mazeRef = this.maze;
            ghost.updatePath(this.maze, this.targetPos, this.playerPos);
            ghost.update();
        }
        
        // Enhanced player movement with power-ups
        const targetY = this.playerPos[0] + this.playerDir[0];
        const targetX = this.playerPos[1] + this.playerDir[1];
        
        // Check bounds
        if (targetY >= 0 && targetY < this.GRID_HEIGHT && targetX >= 0 && targetX < this.GRID_WIDTH) {
            let canMove = false;
            
            if (this.maze[targetY][targetX] === 0) {
                canMove = true;
            } else if (this.canBreakWall(targetY, targetX)) {
                // Break the wall - matching Python behavior
                this.maze[targetY][targetX] = 0;
                canMove = true;
                // Particle effect for wall breaking - matching Python
                this.particles.addExplosion([targetX * GRID_SIZE + GRID_SIZE/2, targetY * GRID_SIZE + GRID_SIZE/2], ORANGE, 8);
                console.log("Wall broken!"); // Debug message matching Python
            }
            
            if (canMove) {
                const targetPos = [targetY, targetX];
                
                // Apply speed boost if active
                let movementSpeed = PLAYER_SPEED;
                if (POWERUP_SPEED in this.activePowerups &&
                    currentTime < this.activePowerups[POWERUP_SPEED]) {
                    movementSpeed *= 2.0;
                }
                
                this.playerPosFloat = this.smoothMove(this.playerPosFloat, [targetY, targetX], movementSpeed);
                
                if (Math.abs(this.playerPosFloat[0] - targetY) < 0.05 && 
                    Math.abs(this.playerPosFloat[1] - targetX) < 0.05) {
                    this.playerPos = targetPos;
                    
                    // Add movement trail particles
                    this.particles.addTrail([this.playerPos[1] * GRID_SIZE + GRID_SIZE/2, this.playerPos[0] * GRID_SIZE + GRID_SIZE/2], NEON_GREEN, [-this.playerDir[1] * 2, -this.playerDir[0] * 2]);
                }
            }
        } else {
            this.playerDir = [0, 0];
        }
        
        // Check power-up collection
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            if (powerup.pos[0] === this.playerPos[0] && powerup.pos[1] === this.playerPos[1]) {
                this.collectPowerup(powerup);
                this.powerups.splice(i, 1);
            }
        }
        
        // Update particles
        this.particles.update();
        
        // Add power-up glow particles
        for (let powerup of this.powerups) {
            if (Math.random() < 0.3) {  // 30% chance per frame
                this.particles.addPowerupGlow([powerup.pos[1] * GRID_SIZE + GRID_SIZE/2, powerup.pos[0] * GRID_SIZE + GRID_SIZE/2], powerup.color);
            }
        }
        
        // Check win condition
        if (this.playerPos[0] === this.targetPos[0] && this.playerPos[1] === this.targetPos[1]) {
            // Award bonus points for winning - new scoring system
            this.score += 100;
            console.log(`Maze completed! +100 bonus points awarded`);
            
            this.won = true;
            return "win";
        }
        
        // Check lose condition (collision with ghosts)
        for (let ghost of this.ghosts) {
            if (ghost.pos[0] === this.playerPos[0] && ghost.pos[1] === this.playerPos[1]) {
                // Lose a life - exact Python implementation
                this.lives -= 1;
                console.log(`Player hit by ghost! Lives remaining: ${this.lives}`);
                
                // Reset player position to start
                this.playerPos = [1, 1];
                this.playerPosFloat = [1.0, 1.0];
                
                // Add explosion particle effect
                this.particles.addExplosion([this.playerPos[1] * GRID_SIZE + GRID_SIZE/2, this.playerPos[0] * GRID_SIZE + GRID_SIZE/2], '#FF6B6B', 20);
                
                if (this.lives <= 0) {
                    // Deduct points for losing - new scoring system
                    this.score -= 20;
                    console.log("Game Over! -20 points penalty");
                    return "lose";
                }
                
                // Return to continue playing with reduced lives
                return "playing";
            }
        }
        
        return "playing";
    }
    
    draw() {
        // Modern animated background
        const currentTime = Date.now();
        drawAnimatedBackground(this.ctx, this.canvas.width, this.canvas.height, currentTime);
        
        // Create game area panel
        const gameWidth = this.GRID_WIDTH * GRID_SIZE;
        const gameHeight = this.GRID_HEIGHT * GRID_SIZE;
        
        // Center the game area
        const offsetX = (this.canvas.width - gameWidth) / 2;
        const offsetY = (this.canvas.height - gameHeight) / 2;
        
        // Game area background
        drawPanel(this.ctx, offsetX - 10, offsetY - 10, gameWidth + 20, gameHeight + 20);
        
        // Draw maze with modern styling
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                const rectX = offsetX + x * GRID_SIZE;
                const rectY = offsetY + y * GRID_SIZE;
                
                if (this.maze[y][x] === 1) {
                    // Wall with gradient effect
                    drawGradientRect(this.ctx, '#3C3C50', '#282838', rectX, rectY, GRID_SIZE, GRID_SIZE);
                    this.ctx.strokeStyle = ACCENT_COLOR;
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(rectX, rectY, GRID_SIZE, GRID_SIZE);
                } else {
                    // Floor
                    this.ctx.fillStyle = '#14141E';
                    this.ctx.fillRect(rectX, rectY, GRID_SIZE, GRID_SIZE);
                    this.ctx.strokeStyle = '#1E1E28';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(rectX, rectY, GRID_SIZE, GRID_SIZE);
                }
            }
        }
        
        // Draw ghost paths with glow effect
        for (let ghost of this.ghosts) {
            for (let i = 0; i < ghost.path.length; i++) {
                const node = ghost.path[i];
                const alpha = Math.max(0.1, 0.6 - i * 0.05);  // Fade trail
                const pathX = offsetX + node[1] * GRID_SIZE + 5;
                const pathY = offsetY + node[0] * GRID_SIZE + 5;
                
                // Create glowing path based on ghost type
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = ghost.color;
                this.ctx.fillRect(pathX, pathY, GRID_SIZE - 10, GRID_SIZE - 10);
                this.ctx.restore();
            }
        }
        
        // Draw power-ups
        for (let powerup of this.powerups) {
            powerup.draw(this.ctx, offsetX, offsetY, currentTime);
        }
        
        // Draw target with pulsing glow effect
        const pulse = 50 + 30 * (1 + Math.sin(currentTime * 0.01));
        const targetX = offsetX + this.targetPos[1] * GRID_SIZE;
        const targetY = offsetY + this.targetPos[0] * GRID_SIZE;
        
        // Glow effect
        this.ctx.save();
        this.ctx.globalAlpha = pulse / 255;
        this.ctx.fillStyle = YELLOW;
        this.ctx.fillRect(targetX - 10, targetY - 10, GRID_SIZE + 20, GRID_SIZE + 20);
        this.ctx.restore();
        
        // Main target
        this.ctx.fillStyle = YELLOW;
        this.ctx.fillRect(targetX, targetY, GRID_SIZE, GRID_SIZE);
        this.ctx.strokeStyle = WHITE;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(targetX, targetY, GRID_SIZE, GRID_SIZE);
        
        // Draw player with modern styling and power-up effects
        const playerX = offsetX + Math.floor(this.playerPosFloat[1] * GRID_SIZE);
        const playerY = offsetY + Math.floor(this.playerPosFloat[0] * GRID_SIZE);
        
        // Player glow with power-up effects
        let playerGlowSize = GRID_SIZE + 10;
        let playerColor = NEON_GREEN;
        
        // Modify appearance based on active power-ups
        if (POWERUP_SPEED in this.activePowerups) {
            playerGlowSize += 5;
            playerColor = ELECTRIC_BLUE;
        }
        
        // Player glow
        this.ctx.save();
        this.ctx.globalAlpha = 0.4;
        this.ctx.fillStyle = playerColor;
        this.ctx.fillRect(playerX - 5, playerY - 5, GRID_SIZE + 10, GRID_SIZE + 10);
        this.ctx.restore();
        
        // Main player
        this.ctx.fillStyle = playerColor;
        this.ctx.fillRect(playerX, playerY, GRID_SIZE, GRID_SIZE);
        this.ctx.strokeStyle = WHITE;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(playerX, playerY, GRID_SIZE, GRID_SIZE);
        
        // Draw all ghosts
        for (let ghost of this.ghosts) {
            ghost.draw(this.ctx, offsetX, offsetY, currentTime);
        }
        
        // Draw particles
        this.particles.draw(this.ctx);
        
        // Draw enhanced HUD
        this.drawEnhancedHud();
        
        // Note: drawPythonHUD() removed to clean up interface
    }
    
    drawEnhancedHud() {
        // Draw enhanced HUD with improved alignment and spacing
        const currentTime = Date.now() / 1000;
        
        // Adaptive spacing based on screen size
        const margin = Math.max(8, this.canvas.width / 120);  // Scale margin with screen size
        const panelSpacing = Math.max(15, this.canvas.height / 40);  // Adaptive panel spacing
        
        // Active power-ups panel (moved to HTML element to avoid overlap)
        if (Object.keys(this.activePowerups).length > 0) {
            this.updatePowerupDisplay();
        } else {
            // Hide powerup display when no powerups are active
            this.hidePowerupDisplay();
        }
    }
    
    cleanup() {
        // Clean up resources to prevent memory leaks
        if (this.particles) {
            this.particles.particles = [];
        }
        if (this.powerups) {
            this.powerups = [];
        }
        if (this.ghosts) {
            this.ghosts = [];
        }
        if (this.activePowerups) {
            this.activePowerups = {};
        }
    }

    // Update powerup display in HTML element instead of canvas
    updatePowerupDisplay() {
        const currentTime = Date.now() / 1000;
        let powerupPanel = document.getElementById('powerup-status');
        
        // Create powerup panel if it doesn't exist
        if (!powerupPanel) {
            powerupPanel = document.createElement('div');
            powerupPanel.id = 'powerup-status';
            powerupPanel.style.cssText = `
                position: absolute;
                top: 200px;
                right: 20px;
                background: rgba(26, 26, 46, 0.9);
                backdrop-filter: blur(10px);
                padding: 15px;
                border-radius: 12px;
                border: 2px solid #FFD700;
                font-size: 13px;
                line-height: 1.5;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4),
                            0 0 20px rgba(255, 215, 0, 0.2);
                color: #E0E0E0;
                z-index: 60;
                min-width: 160px;
            `;
            document.body.appendChild(powerupPanel);
        }

        // Update powerup content
        let content = '<h4 style="color: #FFD700; margin: 0 0 10px 0; font-size: 14px; text-align: center;">⚡ POWER-UPS</h4>';
        
        for (let [powerupType, endTime] of Object.entries(this.activePowerups)) {
            const remaining = Math.max(0, Math.floor(endTime - currentTime));
            let text, color;
            if (powerupType === 'speed') {
                text = `⚡ SPEED: ${remaining}s`;
                color = '#00BFFF';
            } else if (powerupType === 'wallbreaker') {
                text = `🔨 BREAK: ${remaining}s`;
                color = '#FFA500';
            } else {
                text = `${powerupType.slice(0, 5)}: ${remaining}s`;
                color = '#FFFFFF';
            }
            content += `<div style="color: ${color}; margin-bottom: 5px;">${text}</div>`;
        }
        
        powerupPanel.innerHTML = content;
        powerupPanel.style.display = 'block';
    }

    // Hide powerup display when no powerups are active
    hidePowerupDisplay() {
        const powerupPanel = document.getElementById('powerup-status');
        if (powerupPanel) {
            powerupPanel.style.display = 'none';
        }
    }
}

// Export for use (browser compatibility)
if (typeof window !== 'undefined') {
    window.MazeGame = MazeGame;
    window.Ghost = Ghost;
    window.PowerUp = PowerUp;
    window.ParticleSystem = ParticleSystem;
}
// For Node.js (testing, not used in browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MazeGame, Ghost, PowerUp, ParticleSystem };
}
