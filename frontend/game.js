// Maze Chase - Exact JavaScript Implementation of Python Game
// Complete gameplay implementation matching Python version

console.log(' Loading game.js...');

// Game Constants - Exact values from Python
const GRID_SIZE = 40;
const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const WALL_DENSITY = 0.25;
const PLAYER_SPEED = 0.04;
const GHOST_STEP_INTERVAL = 0.6; // Slower ghost (increased from 0.2)
const GHOST_PATHFIND_INTERVAL = 0.5;

// Enhanced Game Constants
const POWERUP_SPAWN_CHANCE = 0.02; // 2% chance per second
const POWERUP_DURATION = 3.0; // 3 seconds
const MAX_GHOSTS = 1; // Keep only one ghost

// Power-up Types
const POWERUP_SPEED = "speed";
const POWERUP_FREEZE = "freeze"; 
const POWERUP_WALLBREAKER = "wallbreaker";

// MazeScape visual palette: deep burgundy, warm dark surfaces, sand and gold
const WHITE = '#FAF7EF';
const BLACK = '#1C1211';
const DARK_GRAY = '#352321';
const LIGHT_GRAY = '#D9CDAE';
const MEDIUM_GRAY = '#A99A86';

// Theme accents retained as aliases so existing gameplay logic remains unchanged
const NEON_GREEN = '#D8A93D';
const ELECTRIC_BLUE = '#D9CDAE';
const CYBER_PURPLE = '#8B5E53';
const NEON_PINK = '#C77B68';

// Game Colors
const GREEN = '#D8A93D';
const RED = '#A8322A';
const YELLOW = '#D8A93D';
const ORANGE = '#C08A2E';

// UI Theme Colors
const PRIMARY_BG = '#1C1211';
const SECONDARY_BG = '#352321';
const ACCENT_COLOR = '#D8A93D';
const SUCCESS_COLOR = '#C0B281';
const ERROR_COLOR = '#C45B50';
const WARNING_COLOR = '#D8A93D';

// Button Colors
const BUTTON_NORMAL = '#352321';
const BUTTON_HOVER = '#44302A';
const BUTTON_ACTIVE = '#550605';

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

// Texture System
class TextureManager {
 constructor() {
 console.log(' Initializing TextureManager...');
 this.textures = {};
 this.patterns = {};
 this.enabled = true; // Allow toggling textures
 try {
 this.init();
 console.log(' TextureManager initialized successfully');
 } catch (error) {
 console.error(' Error initializing TextureManager:', error);
 throw error;
 }
 }
 
 setEnabled(enabled) {
 this.enabled = enabled;
 }
 
 isEnabled() {
 return this.enabled;
 }
 
 init() {
 // Create procedural textures
 this.createWallTexture();
 this.createFloorTexture();
 this.createPlayerTexture();
 this.createGhostTexture();
 this.createTargetTexture();
 this.createPowerupTextures();
 }
 
 createWallTexture() {
 const canvas = document.createElement('canvas');
 canvas.width = GRID_SIZE;
 canvas.height = GRID_SIZE;
 const ctx = canvas.getContext('2d');
 
 // Stone-like brick texture with improved depth
 const gradient = ctx.createLinearGradient(0, 0, GRID_SIZE, GRID_SIZE);
 gradient.addColorStop(0, '#6A4A3C');
 gradient.addColorStop(0.2, '#56382F');
 gradient.addColorStop(0.5, '#44302A');
 gradient.addColorStop(0.8, '#352321');
 gradient.addColorStop(1, '#241715');
 
 ctx.fillStyle = gradient;
 ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
 
 // Add metallic shine
 const shineGradient = ctx.createLinearGradient(0, 0, GRID_SIZE * 0.3, GRID_SIZE * 0.3);
 shineGradient.addColorStop(0, 'rgba(216, 169, 61, 0.22)');
 shineGradient.addColorStop(1, 'transparent');
 
 ctx.fillStyle = shineGradient;
 ctx.fillRect(0, 0, GRID_SIZE * 0.4, GRID_SIZE * 0.4);
 
 // Add brick lines
 ctx.strokeStyle = '#D8A93D';
 ctx.lineWidth = 0.5;
 ctx.globalAlpha = 0.3;
 
 // Horizontal lines
 for (let i = 0; i < GRID_SIZE; i += 8) {
 ctx.beginPath();
 ctx.moveTo(0, i);
 ctx.lineTo(GRID_SIZE, i);
 ctx.stroke();
 }
 
 // Vertical lines (offset for brick pattern)
 for (let i = 0; i < GRID_SIZE; i += 12) {
 const offset = Math.floor(i / 8) % 2 === 0 ? 0: 6;
 ctx.beginPath();
 ctx.moveTo(i + offset, 0);
 ctx.lineTo(i + offset, GRID_SIZE);
 ctx.stroke();
 }
 
 // Add some noise/texture
 ctx.globalAlpha = 0.1;
 for (let i = 0; i < 50; i++) {
 ctx.fillStyle = Math.random() > 0.5 ? '#6A4A3C': '#352321';
 ctx.fillRect(
 Math.random() * GRID_SIZE,
 Math.random() * GRID_SIZE,
 2, 2
 );
 }
 
 // Add depth shadow at bottom and right
 ctx.globalAlpha = 0.4;
 ctx.fillStyle = '#000000';
 ctx.fillRect(GRID_SIZE - 2, 0, 2, GRID_SIZE); // Right shadow
 ctx.fillRect(0, GRID_SIZE - 2, GRID_SIZE, 2); // Bottom shadow
 
 this.textures.wall = canvas;
 }
 
 createFloorTexture() {
 const canvas = document.createElement('canvas');
 canvas.width = GRID_SIZE;
 canvas.height = GRID_SIZE;
 const ctx = canvas.getContext('2d');
 
 // Dark floor with subtle pattern and depth
 const baseGradient = ctx.createRadialGradient(GRID_SIZE/2, GRID_SIZE/2, 0, GRID_SIZE/2, GRID_SIZE/2, GRID_SIZE/2);
 baseGradient.addColorStop(0, '#0F0F1A');
 baseGradient.addColorStop(0.7, '#0A0A15');
 baseGradient.addColorStop(1, '#050508');
 
 ctx.fillStyle = baseGradient;
 ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
 
 // Add circuit-like pattern
 ctx.strokeStyle = '#1A1A25';
 ctx.lineWidth = 0.5;
 ctx.globalAlpha = 0.4;
 
 // Create tech grid
 const gridSpacing = GRID_SIZE / 4;
 for (let i = 0; i <= GRID_SIZE; i += gridSpacing) {
 ctx.beginPath();
 ctx.moveTo(i, 0);
 ctx.lineTo(i, GRID_SIZE);
 ctx.stroke();
 
 ctx.beginPath();
 ctx.moveTo(0, i);
 ctx.lineTo(GRID_SIZE, i);
 ctx.stroke();
 }
 
 // Add corner connectors for tech feel
 ctx.fillStyle = '#1A1A25';
 ctx.globalAlpha = 0.6;
 const cornerSize = 2;
 for (let i = 0; i <= GRID_SIZE; i += gridSpacing) {
 for (let j = 0; j <= GRID_SIZE; j += gridSpacing) {
 ctx.fillRect(i - cornerSize/2, j - cornerSize/2, cornerSize, cornerSize);
 }
 }
 
 // Add some subtle noise and scratches
 ctx.globalAlpha = 0.1;
 for (let i = 0; i < 40; i++) {
 ctx.fillStyle = Math.random() > 0.5 ? '#1A1A25': '#0A0A15';
 const size = Math.random() > 0.8 ? 2: 1;
 ctx.fillRect(
 Math.random() * GRID_SIZE,
 Math.random() * GRID_SIZE,
 size, size
 );
 }
 
 // Add subtle blue accent lines
 ctx.globalAlpha = 0.1;
 ctx.strokeStyle = '#D8A93D';
 ctx.lineWidth = 0.5;
 for (let i = 0; i < 3; i++) {
 const x = Math.random() * GRID_SIZE;
 const y = Math.random() * GRID_SIZE;
 ctx.beginPath();
 ctx.moveTo(x, y);
 ctx.lineTo(x + Math.random() * 10 - 5, y + Math.random() * 10 - 5);
 ctx.stroke();
 }
 
 this.textures.floor = canvas;
 }
 
 createPlayerTexture() {
  // Flat, clean Jerry sprite — no glow, gradients, shadows or glossy effects.
  const canvas = document.createElement('canvas');
  canvas.width = GRID_SIZE * 3;
  canvas.height = GRID_SIZE * 3;
  const ctx = canvas.getContext('2d');
  ctx.scale(3, 3);
  const s = GRID_SIZE;
  const ellipse = (x, y, rx, ry, color) => {
   ctx.fillStyle = color;
   ctx.beginPath();
   ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
   ctx.fill();
  };

  // Tail and feet.
  ctx.strokeStyle = '#8B542D'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(13, 27); ctx.quadraticCurveTo(5, 30, 3, 35); ctx.stroke();
  ellipse(14, 33, 5, 2.5, '#8B542D');
  ellipse(26, 33, 5, 2.5, '#8B542D');

  // Ears and pink inner ears.
  ellipse(10.5, 11, 6.2, 7, '#8B542D');
  ellipse(29.5, 11, 6.2, 7, '#8B542D');
  ellipse(10.5, 11, 3.8, 4.6, '#E99A9A');
  ellipse(29.5, 11, 3.8, 4.6, '#E99A9A');

  // Body, arms and cream belly.
  ellipse(20, 27, 8.2, 8.5, '#A9632E');
  ellipse(12.7, 26, 3.2, 5.1, '#B97535');
  ellipse(27.3, 26, 3.2, 5.1, '#B97535');
  ellipse(20, 29, 5.8, 5.4, '#D99A53');

  // Head and muzzle.
  ellipse(20, 17.5, 13.1, 12.4, '#B97535');
  ellipse(20, 22, 8.8, 5.8, '#F2D5A0');
  ellipse(14.3, 21, 4.8, 3.8, '#F2D5A0');
  ellipse(25.7, 21, 4.8, 3.8, '#F2D5A0');

  // Simple cartoon eyes, nose and smile.
  ellipse(15.5, 15.5, 3.5, 4.6, '#FFF8E9');
  ellipse(24.5, 15.5, 3.5, 4.6, '#FFF8E9');
  ellipse(16.5, 16.1, 1.6, 2.8, '#29201B');
  ellipse(25.5, 16.1, 1.6, 2.8, '#29201B');
  ellipse(20, 21, 1.5, 1.1, '#6B3329');

  ctx.strokeStyle = '#6B3329'; ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(20, 21.5); ctx.quadraticCurveTo(18, 24, 16.4, 22.5);
  ctx.moveTo(20, 21.5); ctx.quadraticCurveTo(22, 24, 23.6, 22.5);
  ctx.stroke();

  // Whiskers.
  ctx.strokeStyle = '#F2D5A0'; ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.moveTo(13, 21); ctx.lineTo(5, 19);
  ctx.moveTo(13, 23); ctx.lineTo(5, 24);
  ctx.moveTo(27, 21); ctx.lineTo(35, 19);
  ctx.moveTo(27, 23); ctx.lineTo(35, 24);
  ctx.stroke();

  this.textures.player = canvas;
 }
 
 createGhostTexture() {
  // 3D-styled Tom: cool grey fur, sculpted ears, specular highlights and glossy eyes.
  const canvas = document.createElement('canvas');
  canvas.width=GRID_SIZE*4;canvas.height=GRID_SIZE*4;
  const ctx=canvas.getContext('2d');ctx.scale(4,4);
  const s=GRID_SIZE,cx=20;
  const ball=(x,y,rx,ry,stops)=>{
   const g=ctx.createRadialGradient(x-rx*.35,y-ry*.42,1,x,y,Math.max(rx,ry)*1.35);
   stops.forEach(([p,c])=>g.addColorStop(p,c));
   ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();
  };
  const stroke=(color,width)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';};
  const aura=ctx.createRadialGradient(20,20,3,20,20,25);
  aura.addColorStop(0,'rgba(192,178,129,.22)');aura.addColorStop(1,'rgba(192,178,129,0)');
  ctx.fillStyle=aura;ctx.fillRect(0,0,s,s);
  ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(21,34,12,3,0,0,Math.PI*2);ctx.fill();

  // Tail, paws and torso are shaded separately to imply rounded volume.
  stroke('#626975',2.2);ctx.beginPath();ctx.moveTo(26,29);ctx.bezierCurveTo(36,29,36,36,31,37);ctx.stroke();
  ball(14,33,5,2.5,[[0,'#B5BBC4'],[.55,'#7B828E'],[1,'#454B55']]);
  ball(26,33,5,2.5,[[0,'#B5BBC4'],[.55,'#7B828E'],[1,'#454B55']]);
  ball(20,27,8.5,9,[[0,'#C5CAD1'],[.35,'#9299A4'],[.78,'#727985'],[1,'#444A54']]);
  ball(12.5,26,3.1,5,[[0,'#B9BEC6'],[.6,'#858C97'],[1,'#4B515B']]);
  ball(27.5,26,3.1,5,[[0,'#B9BEC6'],[.6,'#858C97'],[1,'#4B515B']]);
  ball(20,29,5.8,5.5,[[0,'#F4F1EB'],[.7,'#B7BBC1'],[1,'#6F7580']]);

  // Pointed ears with shaded outer edges and pink inner surfaces.
  const ear=ctx.createLinearGradient(7,2,33,17);
  ear.addColorStop(0,'#C3C8D0');ear.addColorStop(.38,'#9299A4');ear.addColorStop(1,'#515762');
  ctx.fillStyle=ear;ctx.beginPath();
  ctx.moveTo(7,16);ctx.lineTo(6,2);ctx.lineTo(17,10);ctx.lineTo(23,10);ctx.lineTo(34,2);ctx.lineTo(33,16);ctx.closePath();ctx.fill();
  ctx.fillStyle='#D98F9B';ctx.beginPath();
  ctx.moveTo(9,12);ctx.lineTo(8.5,5.5);ctx.lineTo(15,10.5);ctx.closePath();
  ctx.moveTo(25,10.5);ctx.lineTo(31.5,5.5);ctx.lineTo(31,12);ctx.closePath();ctx.fill();

  ball(20,17.5,13,11.5,[[0,'#D4D8DE'],[.25,'#AEB4BE'],[.6,'#9299A4'],[.88,'#727985'],[1,'#4A505A']]);
  ball(15,15.5,3.8,4.6,[[0,'#FFF0A0'],[.45,'#E5C65B'],[1,'#8D7A32']]);
  ball(25,15.5,3.8,4.6,[[0,'#FFF0A0'],[.45,'#E5C65B'],[1,'#8D7A32']]);
  ball(16,16,1.5,3,[[0,'#54565A'],[.5,'#22252B'],[1,'#08090B']]);
  ball(26,16,1.5,3,[[0,'#54565A'],[.5,'#22252B'],[1,'#08090B']]);
  ball(15.5,14.8,.7,.8,[[0,'#FFFFFF'],[1,'#DDE6F0']]);
  ball(25.5,14.8,.7,.8,[[0,'#FFFFFF'],[1,'#DDE6F0']]);

  ball(15.8,21,5.3,4,[[0,'#FFFFFF'],[.7,'#F4F0E8'],[1,'#AEB3BB']]);
  ball(24.2,21,5.3,4,[[0,'#FFFFFF'],[.7,'#F4F0E8'],[1,'#AEB3BB']]);
  ball(20,18.6,2.1,1.4,[[0,'#F8B2BC'],[.65,'#D58A98'],[1,'#884D5B']]);
  stroke('#515762',.7);ctx.beginPath();
  ctx.moveTo(20,19.5);ctx.lineTo(20,22.2);
  ctx.moveTo(20,22.2);ctx.quadraticCurveTo(18,24.2,16.5,22.5);
  ctx.moveTo(20,22.2);ctx.quadraticCurveTo(22,24.2,23.5,22.5);
  ctx.moveTo(12,20);ctx.lineTo(4.5,18);ctx.moveTo(12,22);ctx.lineTo(4.5,24);
  ctx.moveTo(28,20);ctx.lineTo(35.5,18);ctx.moveTo(28,22);ctx.lineTo(35.5,24);ctx.stroke();

  this.textures.ghost=canvas;
 }
 
 createTargetTexture() {
 const canvas = document.createElement('canvas');
 canvas.width = GRID_SIZE;
 canvas.height = GRID_SIZE;
 const ctx = canvas.getContext('2d');
 const s = GRID_SIZE;

 // Cheese wedge goal icon: clear silhouette that reads well at maze-tile size.
 ctx.save();
 ctx.translate(s * 0.08, s * 0.13);
 ctx.rotate(-0.08);

 // Soft golden tile behind the cheese keeps the goal easy to spot.
 ctx.fillStyle = 'rgba(216, 169, 61, 0.20)';
 ctx.beginPath();
 ctx.roundRect(-s * 0.04, -s * 0.08, s * 0.92, s * 0.86, s * 0.12);
 ctx.fill();

 // Wedge side.
 ctx.fillStyle = '#C88720';
 ctx.beginPath();
 ctx.moveTo(s * 0.08, s * 0.32);
 ctx.lineTo(s * 0.78, s * 0.18);
 ctx.lineTo(s * 0.78, s * 0.67);
 ctx.lineTo(s * 0.08, s * 0.78);
 ctx.closePath();
 ctx.fill();

 // Main cheese face.
 ctx.fillStyle = '#FFD84D';
 ctx.beginPath();
 ctx.moveTo(s * 0.08, s * 0.32);
 ctx.lineTo(s * 0.58, s * 0.08);
 ctx.lineTo(s * 0.92, s * 0.30);
 ctx.lineTo(s * 0.78, s * 0.48);
 ctx.lineTo(s * 0.08, s * 0.58);
 ctx.closePath();
 ctx.fill();

 // Cheese holes with warm shading.
 const holes = [
   [0.34, 0.29, 0.055],
   [0.61, 0.28, 0.075],
   [0.47, 0.43, 0.045],
   [0.69, 0.53, 0.05],
   [0.24, 0.48, 0.035]
 ];
 for (const [x, y, r] of holes) {
   ctx.fillStyle = '#B87518';
   ctx.beginPath();
   ctx.ellipse(s * x, s * y, s * r, s * r * 0.78, 0, 0, Math.PI * 2);
   ctx.fill();
   ctx.fillStyle = 'rgba(255, 246, 166, 0.75)';
   ctx.beginPath();
   ctx.ellipse(s * (x - 0.012), s * (y - 0.012), s * r * 0.45, s * r * 0.32, 0, 0, Math.PI * 2);
   ctx.fill();
 }

 // Subtle edge gives the icon contrast against the dark maze floor.
 ctx.strokeStyle = '#FFF0A3';
 ctx.lineWidth = 1.4;
 ctx.lineJoin = 'round';
 ctx.beginPath();
 ctx.moveTo(s * 0.08, s * 0.32);
 ctx.lineTo(s * 0.58, s * 0.08);
 ctx.lineTo(s * 0.92, s * 0.30);
 ctx.lineTo(s * 0.78, s * 0.48);
 ctx.lineTo(s * 0.78, s * 0.67);
 ctx.lineTo(s * 0.08, s * 0.78);
 ctx.closePath();
 ctx.stroke();

 ctx.restore();
 this.textures.target = canvas;
 }

 createPowerupTextures() {
 // Speed Powerup
 this.textures.powerup_speed = this.createPowerupTexture(ELECTRIC_BLUE, '↯');
 
 // Freeze Powerup
 this.textures.powerup_freeze = this.createPowerupTexture('#64C8FF', '❄');
 
 // Wall Breaker Powerup
 this.textures.powerup_wallbreaker = this.createPowerupTexture(ORANGE, '✦');
 }
 
 createPowerupTexture(color, symbol) {
 const canvas = document.createElement('canvas');
 canvas.width = GRID_SIZE;
 canvas.height = GRID_SIZE;
 const ctx = canvas.getContext('2d');
 
 const centerX = GRID_SIZE / 2;
 const centerY = GRID_SIZE / 2;
 
 // Outer glow
 const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, GRID_SIZE * 0.6);
 glowGradient.addColorStop(0, color);
 glowGradient.addColorStop(0.7, color + '60');
 glowGradient.addColorStop(1, 'transparent');
 
 ctx.fillStyle = glowGradient;
 ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
 
 // Main powerup crystal
 const bodyGradient = ctx.createLinearGradient(0, 0, GRID_SIZE, GRID_SIZE);
 bodyGradient.addColorStop(0, color + 'CC');
 bodyGradient.addColorStop(0.5, color);
 bodyGradient.addColorStop(1, color + '80');
 
 // Diamond shape
 ctx.fillStyle = bodyGradient;
 ctx.beginPath();
 ctx.moveTo(centerX, GRID_SIZE * 0.1);
 ctx.lineTo(GRID_SIZE * 0.9, centerY);
 ctx.lineTo(centerX, GRID_SIZE * 0.9);
 ctx.lineTo(GRID_SIZE * 0.1, centerY);
 ctx.closePath();
 ctx.fill();
 
 // Inner highlight
 ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
 ctx.beginPath();
 ctx.moveTo(centerX, GRID_SIZE * 0.2);
 ctx.lineTo(GRID_SIZE * 0.7, centerY);
 ctx.lineTo(centerX, GRID_SIZE * 0.8);
 ctx.lineTo(GRID_SIZE * 0.3, centerY);
 ctx.closePath();
 ctx.fill();
 
 // Center symbol (simplified as circle for now)
 ctx.fillStyle = '#FAF7EF';
 ctx.beginPath();
 ctx.arc(centerX, centerY, GRID_SIZE * 0.15, 0, 2 * Math.PI);
 ctx.fill();
 
 return canvas;
 }
 
 getTexture(type) {
 return this.textures[type];
 }
 
 drawTexturedRect(ctx, textureType, x, y, width, height, animationTime = 0) {
 if (!this.enabled) {
 // Fallback to original rendering when textures are disabled
 this.drawFallbackRect(ctx, textureType, x, y, width, height);
 return;
 }
 
 const texture = this.getTexture(textureType);
 if (texture) {
 // Apply animation effects for certain textures
 ctx.save();
 
 if (textureType.startsWith('powerup_')) {
 // Rotate powerup textures for visual appeal
 const centerX = x + width / 2;
 const centerY = y + height / 2;
 ctx.translate(centerX, centerY);
 ctx.rotate((animationTime || Date.now()) * 0.002);
 ctx.translate(-centerX, -centerY);
 }
 
 // Scale texture to fit the rectangle
 ctx.drawImage(texture, x, y, width, height);
 
 ctx.restore();
 } else {
 // Fallback to solid color
 this.drawFallbackRect(ctx, textureType, x, y, width, height);
 }
 }
 
 drawFallbackRect(ctx, textureType, x, y, width, height) {
 // Original game rendering for compatibility
 ctx.save();
 
 switch (textureType) {
 case 'wall':
 // Original wall rendering
 const gradient = ctx.createLinearGradient(x, y, x, y + height);
 gradient.addColorStop(0, '#3C3C50');
 gradient.addColorStop(1, '#282838');
 ctx.fillStyle = gradient;
 ctx.fillRect(x, y, width, height);
 ctx.strokeStyle = ACCENT_COLOR;
 ctx.lineWidth = 1;
 ctx.strokeRect(x, y, width, height);
 break;
 
 case 'floor':
 // Original floor rendering
 ctx.fillStyle = '#14141E';
 ctx.fillRect(x, y, width, height);
 ctx.strokeStyle = '#1E1E28';
 ctx.lineWidth = 1;
 ctx.strokeRect(x, y, width, height);
 break;
 
 case 'player':
 // Original player rendering
 ctx.fillStyle = NEON_GREEN;
 ctx.fillRect(x, y, width, height);
 ctx.strokeStyle = WHITE;
 ctx.lineWidth = 2;
 ctx.strokeRect(x, y, width, height);
 break;
 
 case 'ghost':
 // Original ghost rendering
 ctx.fillStyle = RED;
 ctx.fillRect(x, y, width, height);
 break;
 
 case 'target':
 // Draw the cheese goal in non-enhanced mode too; never revert to a plain square.
 ctx.fillStyle = 'rgba(216, 169, 61, 0.22)';
 ctx.fillRect(x, y, width, height);
 ctx.save();
 ctx.translate(x, y);
 ctx.scale(width / GRID_SIZE, height / GRID_SIZE);
 ctx.fillStyle = '#C88720';
 ctx.beginPath();
 ctx.moveTo(5, 19);
 ctx.lineTo(31, 13);
 ctx.lineTo(31, 29);
 ctx.lineTo(5, 32);
 ctx.closePath();
 ctx.fill();
 ctx.fillStyle = '#FFD84D';
 ctx.beginPath();
 ctx.moveTo(5, 19);
 ctx.lineTo(22, 7);
 ctx.lineTo(36, 17);
 ctx.lineTo(31, 23);
 ctx.lineTo(5, 27);
 ctx.closePath();
 ctx.fill();
 ctx.fillStyle = '#B87518';
 for (const [hx, hy, radius] of [[14, 18, 2], [24, 17, 2.5], [19, 23, 1.8], [28, 23, 1.6]]) {
   ctx.beginPath();
   ctx.arc(hx, hy, radius, 0, Math.PI * 2);
   ctx.fill();
 }
 ctx.strokeStyle = '#FFF0A3';
 ctx.lineWidth = 1.2;
 ctx.stroke();
 ctx.restore();
 break;
 
 case 'powerup_speed':
 ctx.fillStyle = ELECTRIC_BLUE;
 ctx.fillRect(x, y, width, height);
 ctx.strokeStyle = WHITE;
 ctx.lineWidth = 2;
 ctx.strokeRect(x, y, width, height);
 break;
 
 case 'powerup_freeze':
 ctx.fillStyle = '#64C8FF';
 ctx.fillRect(x, y, width, height);
 ctx.strokeStyle = WHITE;
 ctx.lineWidth = 2;
 ctx.strokeRect(x, y, width, height);
 break;
 
 case 'powerup_wallbreaker':
 ctx.fillStyle = ORANGE;
 ctx.fillRect(x, y, width, height);
 ctx.strokeStyle = WHITE;
 ctx.lineWidth = 2;
 ctx.strokeRect(x, y, width, height);
 break;
 
 default:
 // Fallback color
 ctx.fillStyle = '#FF00FF';
 ctx.fillRect(x, y, width, height);
 }
 
 ctx.restore();
 }
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
 this.mazeRef = null; // Reference to maze for fallback pathfinding
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
 
 if (path && path.length > 1) { // Ensure valid path
 this.path = path.slice(1); // Skip current position
 this.lastPlayerPos = [...playerPos];
 this.lastPathTime = currentTime;
 } else if (!this.path) { // If no path found and ghost has no current path
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
 this.path = []; // No maze reference available
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
 
 draw(ctx, offsetX, offsetY, currentTime, textureManager = null) {
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
 
 // Main ghost body with texture if available
 if (textureManager) {
 textureManager.drawTexturedRect(ctx, 'ghost', ghostRect.x, ghostRect.y, ghostRect.width, ghostRect.height, currentTime);
 
 // Apply frozen tint if needed
 if (this.isFrozen()) {
 ctx.save();
 ctx.globalAlpha = 0.4;
 ctx.fillStyle = frozenColor;
 ctx.fillRect(ghostRect.x, ghostRect.y, ghostRect.width, ghostRect.height);
 ctx.restore();
 }
 } else {
 // Fallback to solid color
 ctx.fillStyle = frozenColor;
 ctx.fillRect(ghostRect.x, ghostRect.y, ghostRect.width, ghostRect.height);
 }
 }
}

// PowerUp Class - Power-up class for collectible items
class PowerUp {
 constructor(pos, powerupType) {
 this.pos = [...pos];
 this.type = powerupType;
 this.spawnTime = Date.now() / 1000;
 this.lifetime = 15.0; // Power-ups last 15 seconds - matching Python
 
 // Type-specific properties - exact match with Python
 if (powerupType === POWERUP_SPEED) {
 this.color = ELECTRIC_BLUE;
 this.symbol = "↯";
 } else if (powerupType === POWERUP_FREEZE) {
 this.color = '#64C8FF'; // Light blue for freeze - matching Python
 this.symbol = "";
 } else if (powerupType === POWERUP_WALLBREAKER) {
 this.color = ORANGE;
 this.symbol = "✦";
 }
 }
 
 isExpired() {
 return Date.now() / 1000 - this.spawnTime > this.lifetime;
 }
 
 draw(ctx, offsetX, offsetY, currentTime, textureManager = null) {
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
 
 // Main power-up with texture if available
 if (textureManager) {
 let textureType = 'powerup_speed'; // default
 if (this.type === POWERUP_FREEZE) {
 textureType = 'powerup_freeze';
 } else if (this.type === POWERUP_WALLBREAKER) {
 textureType = 'powerup_wallbreaker';
 }
 
 textureManager.drawTexturedRect(ctx, textureType, powerupRect.x, powerupRect.y, powerupRect.width, powerupRect.height, currentTime);
 } else {
 // Fallback to solid color - matching original Python styling
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
}

// Main MazeGame Class - Exact implementation from Python
class MazeGame {
 constructor(canvas) {
 this.canvas = canvas;
 this.ctx = canvas.getContext('2d');
 
 // Fixed maze dimensions for consistent gameplay across all screen sizes
 this.GRID_WIDTH = 20; // Portrait layout: 20 columns
 this.GRID_HEIGHT = 30; // Portrait layout: 30 rows
 
 this.pathfinder = new AStar();
 
 // Initialize texture system
 this.textureManager = new TextureManager();
 
 // Enhanced textures are always enabled; retire the old preference.
 this.textureManager.setEnabled(true);
 localStorage.removeItem('texturesEnabled');
 console.log(' Enhanced texture system initialized');
  console.log(` Fixed maze dimensions: ${this.GRID_WIDTH}x${this.GRID_HEIGHT}`);
 
 // Enhanced game state
 this.particles = new ParticleSystem();
 this.ghosts = [];
 this.powerups = [];
 this.activePowerups = {}; // Track active power-up effects
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
 icon = "zap";
 } else if (powerupType === POWERUP_FREEZE) {
 message = "Ghost Freeze Spawned!";
 icon = "snowflake";
 } else if (powerupType === POWERUP_WALLBREAKER) {
 message = "Wall Breaker Spawned!";
 icon = "hammer";
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
 window.gameController.showPowerupNotification("Speed Boost Activated!", "zap");
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
 window.gameController.showPowerupNotification("Ghost Freeze Activated!", "snowflake");
 }
 } else if (powerup.type === POWERUP_WALLBREAKER) {
 this.activePowerups[POWERUP_WALLBREAKER] = Date.now() / 1000 + POWERUP_DURATION;
 // Update player effects for HUD display - exact Python matching
 if (this.player && this.player.effects) {
 this.player.effects.wallBreaker = POWERUP_DURATION * 60; // Convert to frames
 }
 // Show powerup notification
 if (window.gameController) {
 window.gameController.showPowerupNotification("Wall Breaker Activated!", "hammer");
 }
 }
 
 // Do not emit particles on Jerry when he collects a power-up.
 }
 
 updateForScreenChange() {
 // With fixed maze dimensions, we only need to update the canvas scaling
 // The maze itself remains the same size for consistent gameplay
 console.log(' Screen change detected - maintaining fixed maze dimensions');
 console.log(`Maze remains: ${this.GRID_WIDTH}x${this.GRID_HEIGHT} grid`);
 
 // The canvas scaling is handled by CSS, so no maze regeneration needed
 // This ensures consistent gameplay across all screen sizes
 }
 
 resetGame() {
 this.maze = [];
 this.playerPos = [1, 1];
 this.playerPosFloat = [1.0, 1.0];
 this.playerDir = [0, 0];
 this.pendingPlayerDir = null;
 this.playerStepTarget = null;
 this.stopAfterStep = false;
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
 initialGhost.mazeRef = this.maze; // Set maze reference immediately
 this.ghosts.push(initialGhost);
 
 // Update ghost paths
 for (let ghost of this.ghosts) {
 ghost.mazeRef = this.maze; // Ensure maze reference is set
 ghost.updatePath(this.maze, this.targetPos, this.playerPos);
 }
 }
 
 generateMaze() {
 // Accept a maze only when Jerry can reach the cheese AND Tom can reach Jerry.
 // A player-to-exit-only check can leave Tom trapped in a disconnected region.
 const maxAttempts = 30;
 const ghostSpawn = [
   Math.floor(this.GRID_HEIGHT / 2),
   Math.floor(this.GRID_WIDTH / 2)
 ];
 const pathfinder = new AStar();
 const hasPath = (from, to) => pathfinder.findPath(this.maze, from, to).length > 0;

 for (let attempt = 0; attempt < maxAttempts; attempt++) {
   this.maze = Array.from(
     { length: this.GRID_HEIGHT },
     () => Array(this.GRID_WIDTH).fill(0)
   );

   // Solid outer border.
   for (let x = 0; x < this.GRID_WIDTH; x++) {
     this.maze[0][x] = 1;
     this.maze[this.GRID_HEIGHT - 1][x] = 1;
   }
   for (let y = 0; y < this.GRID_HEIGHT; y++) {
     this.maze[y][0] = 1;
     this.maze[y][this.GRID_WIDTH - 1] = 1;
   }

   // Random walls, never covering Jerry, the cheese, or Tom's spawn tile.
   const protectedCells = new Set([
     this.playerPos.join(','),
     this.targetPos.join(','),
     ghostSpawn.join(',')
   ]);
   const wallCount = Math.floor(
     (this.GRID_WIDTH - 2) * (this.GRID_HEIGHT - 2) * WALL_DENSITY
   );
   let placedWalls = 0;
   let placementAttempts = 0;
   const maxPlacementAttempts = wallCount * 12;

   while (placedWalls < wallCount && placementAttempts < maxPlacementAttempts) {
     placementAttempts++;
     const y = randomInt(1, this.GRID_HEIGHT - 2);
     const x = randomInt(1, this.GRID_WIDTH - 2);
     if (protectedCells.has(`${y},${x}`) || this.maze[y][x] === 1) continue;
     this.maze[y][x] = 1;
     placedWalls++;
   }

   // Both routes are required before this maze is accepted.
   const jerryCanReachCheese = hasPath(this.playerPos, this.targetPos);
   const tomCanReachJerry = hasPath(ghostSpawn, this.playerPos);
   if (jerryCanReachCheese && tomCanReachJerry) {
     return;
   }
 }

 // Safe fallback: a lightly obstructed maze with connected gameplay routes.
 console.warn('Maze generation retries exhausted; using connected fallback maze.');
 this.createSimpleMaze();

 // Defensive final validation. The fallback should be connected, but never
 // start a round with a broken route if its layout is changed in the future.
 if (!hasPath(this.playerPos, this.targetPos) || !hasPath(ghostSpawn, this.playerPos)) {
   for (let y = 1; y < this.GRID_HEIGHT - 1; y++) {
     for (let x = 1; x < this.GRID_WIDTH - 1; x++) {
       this.maze[y][x] = 0;
     }
   }
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
 // Queue turns until Jerry reaches the center of the current tile.
 // This prevents diagonal movement and keeps collision checks grid-accurate.
 if (dy === 0 && dx === 0) {
   if (this.playerStepTarget) {
     this.stopAfterStep = true;
     this.pendingPlayerDir = null;
   } else {
     this.stopAfterStep = false;
     this.pendingPlayerDir = null;
     this.playerDir = [0, 0];
   }
   return;
 }

 const direction = [Math.sign(dy), Math.sign(dx)];
 this.stopAfterStep = false;
 if (this.playerStepTarget) {
   this.pendingPlayerDir = direction;
 } else {
   this.pendingPlayerDir = null;
   this.playerDir = direction;
 }
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
 if (currentTime - this.lastPowerupSpawn >= 1.0 && // Check every second
 Math.random() < POWERUP_SPAWN_CHANCE &&
 this.powerups.length < 3) { // Max 3 power-ups at once
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
 window.gameController.showPowerupNotification("Speed Boost Ended", "zap");
 } else if (effect === POWERUP_FREEZE) {
 window.gameController.showPowerupNotification("Ghost Freeze Ended", "snowflake");
 } else if (effect === POWERUP_WALLBREAKER) {
 window.gameController.showPowerupNotification("Wall Breaker Ended", "hammer");
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
 
 // Grid-accurate player movement.
 // A step has one fixed destination; turns are applied only after reaching it.
 if (!this.playerStepTarget && (this.playerDir[0] !== 0 || this.playerDir[1] !== 0)) {
   const nextY = this.playerPos[0] + this.playerDir[0];
   const nextX = this.playerPos[1] + this.playerDir[1];
   const inBounds = nextY >= 0 && nextY < this.GRID_HEIGHT && nextX >= 0 && nextX < this.GRID_WIDTH;
   let canMove = inBounds && this.maze[nextY][nextX] === 0;

   if (inBounds && !canMove && this.canBreakWall(nextY, nextX)) {
     this.maze[nextY][nextX] = 0;
     canMove = true;
     this.particles.addExplosion([nextX * GRID_SIZE + GRID_SIZE / 2, nextY * GRID_SIZE + GRID_SIZE / 2], ORANGE, 8);
   }

   if (canMove) {
     this.playerStepTarget = [nextY, nextX];
   } else {
     // Do not keep pushing into a wall; require a fresh direction input.
     this.playerDir = [0, 0];
     this.pendingPlayerDir = null;
     this.stopAfterStep = false;
   }
 }

 if (this.playerStepTarget) {
   const targetPos = this.playerStepTarget;
   let movementSpeed = PLAYER_SPEED;
   if (POWERUP_SPEED in this.activePowerups && currentTime < this.activePowerups[POWERUP_SPEED]) {
     movementSpeed *= 2.0;
   }

   // Move on a single axis only, so sprite position cannot cut diagonally.
   const nextFloat = [...this.playerPosFloat];
   const axis = targetPos[0] !== this.playerPos[0] ? 0 : 1;
   const delta = targetPos[axis] - nextFloat[axis];
   if (Math.abs(delta) <= movementSpeed) {
     nextFloat[axis] = targetPos[axis];
   } else {
     nextFloat[axis] += Math.sign(delta) * movementSpeed;
   }
   nextFloat[1 - axis] = targetPos[1 - axis];
   this.playerPosFloat = nextFloat;

   if (Math.abs(this.playerPosFloat[0] - targetPos[0]) < 0.001 &&
       Math.abs(this.playerPosFloat[1] - targetPos[1]) < 0.001) {
     this.playerPos = [...targetPos];
     this.playerPosFloat = [...targetPos];
     this.playerStepTarget = null;

     if (this.stopAfterStep) {
       this.playerDir = [0, 0];
       this.pendingPlayerDir = null;
       this.stopAfterStep = false;
     } else if (this.pendingPlayerDir) {
       this.playerDir = this.pendingPlayerDir;
       this.pendingPlayerDir = null;
     }
   }
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
 if (Math.random() < 0.3) { // 30% chance per frame
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
 
 // No particles are emitted from Jerry on respawn; keep his sprite visually clean.

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
 
 // Draw maze with textures
 for (let y = 0; y < this.GRID_HEIGHT; y++) {
 for (let x = 0; x < this.GRID_WIDTH; x++) {
 const rectX = offsetX + x * GRID_SIZE;
 const rectY = offsetY + y * GRID_SIZE;
 
 if (this.maze[y][x] === 1) {
 // Wall with texture
 this.textureManager.drawTexturedRect(this.ctx, 'wall', rectX, rectY, GRID_SIZE, GRID_SIZE, currentTime);
 
 // Add subtle border for definition
 this.ctx.strokeStyle = ACCENT_COLOR + '40';
 this.ctx.lineWidth = 0.5;
 this.ctx.strokeRect(rectX, rectY, GRID_SIZE, GRID_SIZE);
 } else {
 // Floor with texture
 this.textureManager.drawTexturedRect(this.ctx, 'floor', rectX, rectY, GRID_SIZE, GRID_SIZE, currentTime);
 }
 }
 }
 
 // Draw ghost paths with glow effect
 for (let ghost of this.ghosts) {
 for (let i = 0; i < ghost.path.length; i++) {
 const node = ghost.path[i];
 const alpha = Math.max(0.1, 0.6 - i * 0.05); // Fade trail
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
 
 // Draw power-ups with textures
 for (let powerup of this.powerups) {
 powerup.draw(this.ctx, offsetX, offsetY, currentTime, this.textureManager);
 }
 
 // Draw the cheese goal consistently in enhanced and non-enhanced modes.
 // Keep it inside its tile so it cannot bleed over neighbouring maze cells.
 const targetX = offsetX + this.targetPos[1] * GRID_SIZE;
 const targetY = offsetY + this.targetPos[0] * GRID_SIZE;
 this.textureManager.drawTexturedRect(this.ctx, 'target', targetX, targetY, GRID_SIZE, GRID_SIZE, currentTime);
 
 // Draw player with texture and power-up effects
 const playerX = offsetX + Math.floor(this.playerPosFloat[1] * GRID_SIZE);
 const playerY = offsetY + Math.floor(this.playerPosFloat[0] * GRID_SIZE);
 
 // Draw Jerry without the colored glow/background effect.
 // Main player with texture
 this.textureManager.drawTexturedRect(this.ctx, 'player', playerX, playerY, GRID_SIZE, GRID_SIZE, currentTime);
 
 // Draw all ghosts with textures
 for (let ghost of this.ghosts) {
 ghost.draw(this.ctx, offsetX, offsetY, currentTime, this.textureManager);
 }
 
 // Draw particles
 this.particles.draw(this.ctx);
 
 // Draw enhanced HUD
 this.drawEnhancedHud();
 
 // Note: drawPythonHUD() removed to clean up interface
 }
 
 drawEnhancedHud() {
 // Keep power-up feedback in the single top notification only.
 // Do not create a separate active-power-ups popup over the maze.
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
}

// Export for use (browser compatibility)
if (typeof window !== 'undefined') {
 console.log(' Exporting classes to window object...');
 window.MazeGame = MazeGame;
 window.Ghost = Ghost;
 window.PowerUp = PowerUp;
 window.ParticleSystem = ParticleSystem;
 window.TextureManager = TextureManager;
 console.log(' Classes exported successfully. MazeGame available:', typeof window.MazeGame);
}
// For Node.js (testing, not used in browser)
if (typeof module !== 'undefined' && module.exports) {
 module.exports = { MazeGame, Ghost, PowerUp, ParticleSystem, TextureManager };
}
