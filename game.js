const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const levelEl = document.getElementById('level');
const gameStatus = document.getElementById('gameStatus');
const coinsNeeded = document.getElementById('coinsNeeded');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const nextBtn = document.getElementById('nextBtn');

const keys = { left: false, right: false };

const MAX_LEVELS = 7;
let score = 0;
let coins = 0;
let level = 1;
let gameState = 'ready';
let currentLevel = null;
let platforms = [];
let enemies = [];
let coinsList = [];

const player = {
  x: 50,
  y: 300,
  w: 28,
  h: 42,
  vx: 0,
  vy: 0,
  speed: 5,
  jumpPower: 14,
  gravity: 0.65,
  onGround: false,
  facing: 1,
};

const levelData = [
  {
    goal: 4,
    platforms: [
      [0, 360, 800, 40],
      [90, 290, 180, 18],
      [330, 260, 180, 18],
      [540, 210, 120, 18],
      [220, 180, 130, 18],
    ],
    coins: [
      [155, 248], [395, 220], [585, 168], [270, 140]
    ],
    enemies: [
      { x: 240, y: 330, dir: 1, speed: 2.1 },
      { x: 560, y: 230, dir: -1, speed: 2.4 }
    ]
  },
  {
    goal: 5,
    platforms: [
      [0, 360, 800, 40],
      [60, 300, 140, 18],
      [250, 255, 140, 18],
      [450, 300, 140, 18],
      [640, 225, 120, 18],
    ],
    coins: [
      [110, 260], [290, 214], [500, 260], [685, 185], [180, 140]
    ],
    enemies: [
      { x: 110, y: 330, dir: 1, speed: 2.2 },
      { x: 300, y: 220, dir: -1, speed: 2.5 },
      { x: 560, y: 330, dir: 1, speed: 2.7 }
    ]
  },
  {
    goal: 6,
    platforms: [
      [0, 360, 800, 40],
      [60, 310, 110, 18],
      [200, 280, 110, 18],
      [360, 240, 110, 18],
      [520, 200, 110, 18],
      [680, 160, 80, 18],
    ],
    coins: [
      [100, 270], [245, 240], [400, 200], [570, 160], [710, 120], [315, 135]
    ],
    enemies: [
      { x: 80, y: 330, dir: 1, speed: 2.3 },
      { x: 260, y: 250, dir: -1, speed: 2.7 },
      { x: 430, y: 200, dir: 1, speed: 2.8 },
      { x: 610, y: 170, dir: -1, speed: 2.9 }
    ]
  },
  {
    goal: 6,
    platforms: [
      [0, 360, 800, 40],
      [90, 290, 90, 18],
      [230, 240, 90, 18],
      [380, 290, 90, 18],
      [530, 240, 90, 18],
      [660, 290, 90, 18],
    ],
    coins: [
      [120, 248], [260, 198], [420, 248], [560, 198], [700, 248], [320, 140]
    ],
    enemies: [
      { x: 140, y: 330, dir: 1, speed: 2.4 },
      { x: 280, y: 200, dir: -1, speed: 2.8 },
      { x: 440, y: 330, dir: 1, speed: 2.8 },
      { x: 600, y: 200, dir: -1, speed: 2.9 },
      { x: 700, y: 330, dir: 1, speed: 3.0 }
    ]
  },
  {
    goal: 7,
    platforms: [
      [0, 360, 800, 40],
      [50, 310, 80, 18],
      [170, 270, 80, 18],
      [290, 230, 80, 18],
      [410, 190, 80, 18],
      [530, 230, 80, 18],
      [650, 270, 80, 18],
    ],
    coins: [
      [80, 270], [200, 232], [320, 192], [440, 152], [560, 192], [680, 232], [350, 110]
    ],
    enemies: [
      { x: 80, y: 330, dir: 1, speed: 2.4 },
      { x: 190, y: 240, dir: -1, speed: 2.8 },
      { x: 310, y: 200, dir: 1, speed: 2.9 },
      { x: 430, y: 160, dir: -1, speed: 3.0 },
      { x: 550, y: 200, dir: 1, speed: 3.1 },
      { x: 670, y: 240, dir: -1, speed: 2.9 }
    ]
  },
  {
    goal: 7,
    platforms: [
      [0, 360, 800, 40],
      [40, 310, 70, 18],
      [140, 270, 70, 18],
      [240, 230, 70, 18],
      [340, 190, 70, 18],
      [440, 230, 70, 18],
      [540, 270, 70, 18],
      [640, 310, 70, 18],
    ],
    coins: [
      [60, 270], [165, 230], [270, 190], [375, 150], [480, 190], [585, 230], [690, 270]
    ],
    enemies: [
      { x: 90, y: 330, dir: 1, speed: 2.5 },
      { x: 190, y: 240, dir: -1, speed: 2.9 },
      { x: 290, y: 200, dir: 1, speed: 3.0 },
      { x: 390, y: 160, dir: -1, speed: 3.1 },
      { x: 490, y: 200, dir: 1, speed: 3.2 },
      { x: 590, y: 240, dir: -1, speed: 3.0 },
      { x: 680, y: 330, dir: 1, speed: 2.7 }
    ]
  },
  {
    goal: 8,
    platforms: [
      [0, 360, 800, 40],
      [40, 300, 60, 18],
      [120, 260, 60, 18],
      [200, 220, 60, 18],
      [280, 180, 60, 18],
      [360, 140, 60, 18],
      [440, 180, 60, 18],
      [520, 220, 60, 18],
      [600, 260, 60, 18],
      [680, 300, 60, 18],
    ],
    coins: [
      [58, 260], [148, 220], [238, 180], [328, 140], [418, 140], [508, 180], [598, 220], [688, 260]
    ],
    enemies: [
      { x: 80, y: 330, dir: 1, speed: 2.6 },
      { x: 170, y: 230, dir: -1, speed: 3.0 },
      { x: 260, y: 190, dir: 1, speed: 3.1 },
      { x: 350, y: 150, dir: -1, speed: 3.2 },
      { x: 440, y: 150, dir: 1, speed: 3.3 },
      { x: 530, y: 190, dir: -1, speed: 3.2 },
      { x: 620, y: 230, dir: 1, speed: 3.0 },
      { x: 710, y: 330, dir: -1, speed: 2.8 }
    ]
  }
];

function rect(x, y, w, h) {
  return { x, y, w, h };
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function updateHud() {
  scoreEl.textContent = score;
  coinsEl.textContent = coins;
  levelEl.textContent = level;
  coinsNeeded.textContent = currentLevel ? currentLevel.goal : 4;
  gameStatus.textContent = {
    ready: 'جاهزة',
    playing: 'تعمل',
    paused: 'متوقفة',
    complete: 'اكتمل المستوى',
    over: 'انتهت اللعبة',
    won: 'فوز!',
  }[gameState];
  pauseBtn.disabled = gameState !== 'playing';
  resumeBtn.hidden = gameState !== 'paused';
}

function resetPlayer() {
  player.x = 45;
  player.y = 300;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.facing = 1;
}

function loadLevel() {
  currentLevel = levelData[level - 1];
  platforms = currentLevel.platforms.map(([x, y, w, h]) => rect(x, y, w, h));
  enemies = currentLevel.enemies.map(e => ({ ...e, w: 28, h: 30, y: e.y }));
  coinsList = currentLevel.coins.map(([x, y], idx) => ({ x, y, w: 16, h: 16, collected: false, phase: idx }));
  resetPlayer();
  updateHud();
}

function startGame() {
  if (gameState === 'over' || gameState === 'won' || gameState === 'ready') {
    score = 0;
    coins = 0;
    level = 1;
    loadLevel();
  }
  gameState = 'playing';
  updateHud();
}

function pauseGame() {
  if (gameState === 'playing') {
    gameState = 'paused';
    updateHud();
  }
}

function resumeGame() {
  if (gameState === 'paused') {
    gameState = 'playing';
    updateHud();
  }
}

function resetGame() {
  score = 0;
  coins = 0;
  level = 1;
  gameState = 'ready';
  loadLevel();
  updateHud();
}

function nextLevel() {
  if (gameState !== 'complete') return;
  if (level >= MAX_LEVELS) {
    gameState = 'won';
    updateHud();
    return;
  }
  level += 1;
  score += 100;
  coins = 0;
  loadLevel();
  gameState = 'playing';
  updateHud();
}

function jump() {
  if (gameState === 'playing' && player.onGround) {
    player.vy = -player.jumpPower;
    player.onGround = false;
  }
}

function updatePlayer() {
  if (keys.left) {
    player.vx = -player.speed;
    player.facing = -1;
  } else if (keys.right) {
    player.vx = player.speed;
    player.facing = 1;
  } else {
    player.vx *= 0.8;
  }

  player.x += player.vx;
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  const previousBottom = player.y + player.h;
  player.vy += player.gravity;
  player.y += player.vy;
  player.onGround = false;

  for (const p of platforms) {
    if (
      player.vy >= 0 &&
      previousBottom <= p.y + 8 &&
      player.y + player.h >= p.y &&
      player.x + player.w > p.x &&
      player.x < p.x + p.w
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  if (player.y > canvas.height + 40) {
    gameState = 'over';
    updateHud();
  }
}

function updateEnemies() {
  for (const e of enemies) {
    e.x += e.speed * e.dir;
    if (e.x <= 0 || e.x + e.w >= canvas.width) e.dir *= -1;
    if (intersects({ x: player.x, y: player.y, w: player.w, h: player.h }, e)) {
      gameState = 'over';
      updateHud();
      return;
    }
  }
}

function updateCoins() {
  for (const coin of coinsList) {
    if (!coin.collected && intersects(player, coin)) {
      coin.collected = true;
      score += 10;
      coins += 1;
      updateHud();
    }
  }

  if (coins >= currentLevel.goal) {
    gameState = 'complete';
    updateHud();
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#9fd7fe';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#9ad0ff';
  ctx.beginPath();
  ctx.moveTo(0, 250);
  ctx.lineTo(120, 180);
  ctx.lineTo(230, 250);
  ctx.lineTo(340, 180);
  ctx.lineTo(470, 250);
  ctx.lineTo(620, 180);
  ctx.lineTo(760, 250);
  ctx.lineTo(800, 250);
  ctx.lineTo(800, 400);
  ctx.lineTo(0, 400);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 6; i++) {
    const x = 50 + i * 135;
    const y = 60 + (i % 2) * 26;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.arc(x + 22, y - 8, 20, 0, Math.PI * 2);
    ctx.arc(x + 44, y, 18, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlatforms() {
  for (const p of platforms) {
    ctx.fillStyle = '#2ca04f';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#1a7d39';
    ctx.fillRect(p.x, p.y + p.h - 5, p.w, 5);
  }

  for (const p of platforms) {
    if (p.y < 350) {
      ctx.fillStyle = '#d5a15f';
      ctx.fillRect(p.x + 10, p.y - 14, p.w - 20, 14);
      ctx.fillStyle = '#bd7c3a';
      ctx.fillRect(p.x + 6, p.y - 10, p.w - 12, 6);
    }
  }
}

function drawCoin(c) {
  if (c.collected) return;
  const bob = Math.sin(Date.now() / 180 + c.phase) * 2;
  ctx.beginPath();
  ctx.fillStyle = '#ffd200';
  ctx.arc(c.x + 8, c.y + 8 + bob, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f5a000';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCoins() {
  for (const coin of coinsList) drawCoin(coin);
}

function drawEnemy(e) {
  ctx.fillStyle = '#8e351a';
  ctx.fillRect(e.x, e.y + 8, e.w, 22);
  ctx.fillStyle = '#f3c29b';
  ctx.fillRect(e.x + 4, e.y, e.w - 8, 16);
  ctx.fillStyle = '#111';
  ctx.fillRect(e.x + 6, e.y + 5, 4, 4);
  ctx.fillRect(e.x + 18, e.y + 5, 4, 4);
}

function drawEnemies() {
  for (const e of enemies) drawEnemy(e);
}

function drawMario() {
  const x = player.x;
  const y = player.y;
  const dir = player.facing;

  ctx.save();
  ctx.translate(dir < 0 ? x + player.w : x, y);
  ctx.scale(dir, 1);

  ctx.fillStyle = '#ed3b2f';
  ctx.fillRect(5, 0, 18, 8);
  ctx.fillRect(2, 8, 24, 8);
  ctx.fillStyle = '#f6c59e';
  ctx.fillRect(6, 16, 16, 16);
  ctx.fillStyle = '#6d3f21';
  ctx.fillRect(4, 32, 20, 10);
  ctx.fillStyle = '#1f4eb2';
  ctx.fillRect(5, 34, 6, 8);
  ctx.fillRect(17, 34, 6, 8);
  ctx.fillStyle = '#111';
  ctx.fillRect(8, 18, 4, 4);
  ctx.fillRect(18, 18, 4, 4);
  ctx.fillStyle = '#efc9a1';
  ctx.fillRect(3, 20, 2, 16);
  ctx.fillRect(25, 20, 2, 16);
  ctx.fillStyle = '#b22222';
  ctx.fillRect(4, 42, 8, 6);
  ctx.fillRect(18, 42, 8, 6);

  ctx.restore();
}

function drawWorld() {
  drawBackground();
  drawPlatforms();
  drawCoins();
  drawEnemies();
  drawMario();
}

function drawOverlay() {
  if (gameState === 'playing') return;
  ctx.fillStyle = 'rgba(0,0,0,0.46)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 34px Arial';

  if (gameState === 'ready') {
    ctx.fillText('ابدأ اللعبة', canvas.width / 2, canvas.height / 2 - 20);
  } else if (gameState === 'paused') {
    ctx.fillText('إيقاف مؤقت', canvas.width / 2, canvas.height / 2 - 20);
  } else if (gameState === 'complete') {
    ctx.fillText('أكملت المستوى ' + level, canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('اضغط التالي للمرحلة القادمة', canvas.width / 2, canvas.height / 2 + 20);
  } else if (gameState === 'over') {
    ctx.fillText('انتهت اللعبة', canvas.width / 2, canvas.height / 2 - 20);
  } else if (gameState === 'won') {
    ctx.fillText('🎉 لقد فزت! 🎉', canvas.width / 2, canvas.height / 2 - 20);
  }
}

function updateFrame() {
  if (gameState === 'playing') {
    updatePlayer();
    updateEnemies();
    updateCoins();
  }
  drawWorld();
  drawOverlay();
  requestAnimationFrame(updateFrame);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'arrowleft' || key === 'a') keys.left = true;
  if (key === 'arrowright' || key === 'd') keys.right = true;
  if (event.key === ' ') {
    event.preventDefault();
    jump();
  }
  if (key === 'p') {
    if (gameState === 'playing') pauseGame();
    else if (gameState === 'paused') resumeGame();
  }
  if (key === 'r') resetGame();
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'arrowleft' || key === 'a') keys.left = false;
  if (key === 'arrowright' || key === 'd') keys.right = false;
});

function bindTouchButton(id, action) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    action();
  });
}

bindTouchButton('leftBtn', () => { keys.left = true; });
bindTouchButton('rightBtn', () => { keys.right = true; });

document.getElementById('leftBtn').addEventListener('pointerup', () => keys.left = false);
document.getElementById('leftBtn').addEventListener('pointerleave', () => keys.left = false);
document.getElementById('rightBtn').addEventListener('pointerup', () => keys.right = false);
document.getElementById('rightBtn').addEventListener('pointerleave', () => keys.right = false);
document.getElementById('jumpBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); jump(); });

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
resetBtn.addEventListener('click', resetGame);
nextBtn.addEventListener('click', nextLevel);

loadLevel();
updateHud();
updateFrame();
