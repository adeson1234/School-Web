import './check-menu.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const overlay = document.getElementById('ui-overlay');
const overlayTitle = document.getElementById('overlay-title');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');

let isPlaying = false;
let score = 0;
let animationFrameId;
let obstacleTimer = 0;
let obstacleInterval = 90;

const player = {
  x: 50,
  y: 220,
  width: 30,
  height: 40,
  vy: 0,
  gravity: 0.8,
  jumpStrength: -13,
  grounded: true,
  color: '#38bdf8'
};

let obstacles = [];

function jump() {
  if (player.grounded && isPlaying) {
    player.vy = player.jumpStrength;
    player.grounded = false;
  }
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!isPlaying && overlay.classList.contains('hidden') === false) {
      startGame();
    } else {
      jump();
    }
  }
});

canvas.addEventListener('pointerdown', () => {
  if (isPlaying) jump();
});

startBtn.addEventListener('click', startGame);

function startGame() {
  score = 0;
  scoreEl.textContent = '0';
  obstacles = [];
  player.y = 220;
  player.vy = 0;
  player.grounded = true;
  obstacleTimer = 0;
  isPlaying = true;

  overlay.classList.add('hidden');

  cancelAnimationFrame(animationFrameId);
  gameLoop();
}

function gameOver() {
  isPlaying = false;
  overlayTitle.textContent = 'GAME OVER';
  finalScoreEl.textContent = `Final Score: ${Math.floor(score)}`;
  finalScoreEl.classList.remove('hidden');
  startBtn.textContent = 'TRY AGAIN';
  overlay.classList.remove('hidden');
}

function spawnObstacle() {
  const height = Math.floor(Math.random() * 25) + 25;
  obstacles.push({
    x: canvas.width,
    y: 260 - height,
    width: 20,
    height: height,
    color: '#f43f5e',
    speed: 8 + Math.floor(score / 100)
  });
}

function update() {
  player.vy += player.gravity;
  player.y += player.vy;

  if (player.y >= 220) {
    player.y = 220;
    player.vy = 0;
    player.grounded = true;
  }

  obstacleTimer++;
  if (obstacleTimer > obstacleInterval) {
    spawnObstacle();
    obstacleTimer = 0;
    obstacleInterval = Math.floor(Math.random() * 40) + 60;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= obs.speed;

    // Collision detection (AABB)
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      gameOver();
      return;
    }

    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }
  }

  score += 0.2;
  scoreEl.textContent = Math.floor(score);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 260, canvas.width, 40);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 260);
  ctx.lineTo(canvas.width, 260);
  ctx.stroke();

  ctx.fillStyle = player.color;
  ctx.shadowColor = player.color;
  ctx.shadowBlur = 10;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  for (const obs of obstacles) {
    ctx.fillStyle = obs.color;
    ctx.shadowColor = obs.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  ctx.shadowBlur = 0;
}

function gameLoop() {
  if (!isPlaying) return;
  update();
  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
}

draw();