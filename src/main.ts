import './style.css';
import { Player } from './Player';
import { Obstacle } from './Obstacle';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const scoreDisplay = document.getElementById('score-display')!;
const gameOverScreen = document.getElementById('game-over-screen')!;
const finalScoreDisplay = document.getElementById('final-score')!;
const restartBtn = document.getElementById('restart-btn')!;

let player: Player;
let obstacles: Obstacle[] = [];
let score = 0;
let isGameOver = false;

let lastTime = 0;
let timeScale = 1;
let frustrationTimer = 0;
let targetTimeScale = 1;

// Base speeds
const baseObstacleSpeed = 6;

function init() {
  player = new Player();
  obstacles = [];
  score = 0;
  isGameOver = false;
  timeScale = 1;
  targetTimeScale = 1;
  frustrationTimer = 0;
  lastTime = performance.now();

  scoreDisplay.textContent = `Score: ${score}`;
  gameOverScreen.classList.add('hidden');

  requestAnimationFrame(gameLoop);
}

function handleInput(e?: Event) {
  if (e) e.preventDefault();
  if (isGameOver) return;
  player.jump();
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    handleInput();
  }
});
canvas.addEventListener('mousedown', handleInput);
window.addEventListener('touchstart', handleInput, { passive: false });

restartBtn.addEventListener('click', init);

function spawnObstacle() {
  // Spawn logic
  if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - (Math.random() * 300 + 200)) {
    if (Math.random() < 0.02) { // 2% chance per frame to spawn when ready
      obstacles.push(new Obstacle(canvas.width, baseObstacleSpeed + Math.random() * 2));
    }
  }
}

function updateFrustration(deltaTime: number) {
  frustrationTimer -= deltaTime;

  if (frustrationTimer <= 0) {
    const r = Math.random();
    if (r < 0.15) {
      // 15% chance: Hang / freeze the game
      targetTimeScale = 0;
      frustrationTimer = Math.random() * 300 + 100; // Freeze for 100-400ms
    } else if (r < 0.3) {
      // 15% chance: Super fast
      targetTimeScale = 3;
      frustrationTimer = Math.random() * 1500 + 500; // Speed up for 0.5-2s
    } else if (r < 0.4) {
      // 10% chance: Slow mo
      targetTimeScale = 0.5;
      frustrationTimer = Math.random() * 2000 + 1000;
    } else {
      // Normal speed
      targetTimeScale = 1;
      frustrationTimer = Math.random() * 2000 + 1000; // Stay normal for 1-3s
    }
  }

  // Smoothly interpolate timeScale towards target, unless target is 0 (instant freeze)
  if (targetTimeScale === 0) {
    timeScale = 0;
  } else {
    timeScale += (targetTimeScale - timeScale) * 0.1;
  }
}

function gameOver() {
  isGameOver = true;
  finalScoreDisplay.textContent = score.toString();
  gameOverScreen.classList.remove('hidden');
}

function gameLoop(currentTime: number) {
  if (isGameOver) return;

  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // Frustration logic (modifies timeScale)
  updateFrustration(deltaTime);

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Ground
  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 380, canvas.width, 20);

  // Update & Draw Player
  player.update(deltaTime, timeScale);
  player.draw(ctx);

  // Spawn Obstacles
  if (timeScale > 0) {
    spawnObstacle();
  }

  // Update & Draw Obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.update(deltaTime, timeScale);
    obs.draw(ctx);

    // Collision detection
    if (obs.collidesWith(player)) {
      gameOver();
      return;
    }

    // Score update
    if (!obs.passed && obs.x + obs.width < player.x) {
      obs.passed = true;
      score += 10;
      scoreDisplay.textContent = `Score: ${Math.floor(score)}`;
    }

    // Remove off-screen obstacles
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }
  }

  // Draw lag indicator if freezing
  if (timeScale === 0) {
    ctx.fillStyle = 'white';
    ctx.font = '20px Outfit';
    ctx.fillText('...', player.x + 10, player.y - 10);
  }

  requestAnimationFrame(gameLoop);
}

// Start game
init();
