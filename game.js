const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const MAX_LEVELS = 7;
let score = 0;
let coins = 0;
let level = 1;
let gameState = 'ready'; // ready, playing, paused, levelComplete, gameOver, won
let enemies = [];
let coinsArray = [];
let platforms = [];
const keys = {};

const player = {
    x: 50,
    y: canvas.height - 70,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    jumping: false,
    speed: 5,
    jumpPower: 15,
    gravity: 0.6
};

const levelDesigns = [
    { heights: [300, 300, 200, 150], widths: [200, 200, 150, 150], enemies: 2, coins: 4 },
    { heights: [300, 280, 300, 180, 150], widths: [120, 120, 120, 120, 120], enemies: 3, coins: 5 },
    { heights: [320, 280, 240, 200, 160, 120], widths: [100, 100, 100, 100, 100, 80], enemies: 4, coins: 6 },
    { heights: [300, 250, 300, 250, 300, 150, 150], widths: [80, 80, 80, 80, 80, 100, 100], enemies: 5, coins: 6 },
    { heights: [320, 280, 240, 200, 240, 280, 320, 100], widths: [70, 70, 70, 70, 70, 70, 70, 120], enemies: 6, coins: 7 },
    { heights: [310, 270, 230, 190, 230, 270, 310, 350, 100, 80], widths: Array(10).fill(60), enemies: 7, coins: 7 },
    { heights: [320, 280, 240, 200, 160, 120, 160, 200, 240, 60], widths: [50, 50, 50, 50, 50, 50, 50, 50, 50, 100], enemies: 9, coins: 8 }
];

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 2 + level * 0.35;
        this.direction = 1;
    }

    update() {
        this.x += this.speed * this.direction;
        if (this.x <= 0 || this.x + this.width >= canvas.width) this.direction *= -1;
    }

    draw() {
        ctx.fillStyle = '#e53935';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 5, this.y + 5, 8, 8);
        ctx.fillRect(this.x + 17, this.y + 5, 8, 8);
        ctx.fillStyle = '#111';
        ctx.fillRect(this.x + 7, this.y + 7, 4, 4);
        ctx.fillRect(this.x + 19, this.y + 7, 4, 4);
    }
}

class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.collected = false;
    }

    draw() {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x + 7.5, this.y + 7.5, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function buildPlatforms(design) {
    const result = [{ x: 0, y: canvas.height - 30, width: canvas.width, height: 30 }];
    const gap = canvas.width / (design.heights.length + 1);
    const extraPlatforms = design.heights.map((y, index) => ({
        x: Math.min(70 + index * gap, canvas.width - design.widths[index] - 20),
        y,
        width: design.widths[index],
        height: 20
    }));
    result.push(...extraPlatforms);
    return result;
}

function loadLevel(levelNumber) {
    const design = levelDesigns[levelNumber - 1];
    platforms = buildPlatforms(design);
    enemies = [];
    coinsArray = [];

    for (let i = 0; i < design.enemies; i++) {
        const platform = platforms[1 + (i % (platforms.length - 1))];
        enemies.push(new Enemy(platform.x + 10, platform.y - 30));
    }

    for (let i = 0; i < design.coins; i++) {
        const platform = platforms[1 + (i % (platforms.length - 1))];
        coinsArray.push(new Coin(
            platform.x + Math.max(5, platform.width / 2 - 7),
            platform.y - 30
        ));
    }

    player.x = 50;
    player.y = canvas.height - 70;
    player.velocityX = 0;
    player.velocityY = 0;
    player.jumping = false;
    updateHud();
}

function setState(nextState) {
    gameState = nextState;
    updateHud();
}

function updateHud() {
    const scoreElement = document.getElementById('score');
    const coinsElement = document.getElementById('coins');
    const levelElement = document.getElementById('level');
    const statusElement = document.getElementById('gameStatus');
    const neededElement = document.getElementById('coinsNeeded');
    const pauseButton = document.getElementById('pauseBtn');
    const resumeButton = document.getElementById('resumeBtn');
    const startButton = document.getElementById('startBtn');

    if (scoreElement) scoreElement.textContent = score;
    if (coinsElement) coinsElement.textContent = coins;
    if (levelElement) levelElement.textContent = level;
    if (neededElement) neededElement.textContent = levelDesigns[level - 1].coins;
    if (statusElement) {
        const labels = {
            ready: 'جاهزة للبدء',
            playing: 'تعمل',
            paused: 'متوقفة مؤقتاً',
            levelComplete: 'اكتمل المستوى',
            gameOver: 'انتهت اللعبة',
            won: 'فوز!'
        };
        statusElement.textContent = labels[gameState] || gameState;
    }
    if (pauseButton) pauseButton.disabled = gameState !== 'playing';
    if (resumeButton) resumeButton.style.display = gameState === 'paused' ? 'inline-block' : 'none';
    if (startButton) startButton.disabled = gameState === 'playing';
}

function startGame() {
    if (gameState === 'ready' || gameState === 'gameOver' || gameState === 'won') {
        score = 0;
        coins = 0;
        level = 1;
        loadLevel(level);
    }
    setState('playing');
}

function pauseGame() {
    if (gameState === 'playing') setState('paused');
}

function resumeGame() {
    if (gameState === 'paused') setState('playing');
}

function resetGame() {
    score = 0;
    coins = 0;
    level = 1;
    loadLevel(level);
    setState('ready');
}

function nextLevel() {
    if (gameState !== 'levelComplete') return;
    if (level >= MAX_LEVELS) {
        setState('won');
        return;
    }
    level++;
    coins = 0;
    score += 100;
    loadLevel(level);
    setState('playing');
}

function updatePlayer() {
    if (keys.ArrowLeft || keys.a) player.velocityX = -player.speed;
    else if (keys.ArrowRight || keys.d) player.velocityX = player.speed;
    else player.velocityX *= 0.8;

    player.x += player.velocityX;
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    player.jumping = true;

    for (const platform of platforms) {
        const fallingOntoPlatform = player.velocityY >= 0 &&
            player.y + player.height <= platform.y + 10 &&
            player.y + player.height + player.velocityY >= platform.y &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width;
        if (fallingOntoPlatform) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.jumping = false;
        }
    }

    if (player.y > canvas.height) setState('gameOver');
}

function jump() {
    if (gameState === 'playing' && !player.jumping) {
        player.velocityY = -player.jumpPower;
        player.jumping = true;
    }
}

function overlaps(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
        a.y < b.y + b.height && a.y + a.height > b.y;
}

function checkCollisions() {
    for (const enemy of enemies) {
        if (overlaps(player, enemy)) {
            setState('gameOver');
            return;
        }
    }

    for (const coin of coinsArray) {
        if (!coin.collected && overlaps(player, coin)) {
            coin.collected = true;
            coins++;
            score += 10;
            updateHud();
        }
    }

    if (coins >= levelDesigns[level - 1].coins) setState('levelComplete');
}

function drawPlayer() {
    ctx.fillStyle = '#f00';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(player.x + 5, player.y - 15, 20, 15);
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 8, player.y - 12, 4, 4);
    ctx.fillRect(player.x + 18, player.y - 12, 4, 4);
    ctx.fillStyle = '#f00';
    ctx.fillRect(player.x + 3, player.y - 22, 24, 7);
}

function drawScene() {
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const platform of platforms) {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.fillStyle = '#1a6b1a';
        ctx.fillRect(platform.x, platform.y + platform.height - 5, platform.width, 5);
    }
    coinsArray.forEach(coin => { if (!coin.collected) coin.draw(); });
    enemies.forEach(enemy => enemy.draw());
    drawPlayer();

    if (gameState !== 'playing') {
        ctx.fillStyle = 'rgba(0,0,0,.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = gameState === 'won' ? '#FFD700' : '#fff';
        ctx.font = 'bold 34px Arial';
        const title = gameState === 'ready' ? 'اضغط ابدأ للعب' :
            gameState === 'paused' ? 'إيقاف مؤقت' :
            gameState === 'levelComplete' ? `أكملت المستوى ${level}` :
            gameState === 'won' ? '🎉 لقد فزت! 🎉' : 'انتهت اللعبة';
        ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 25);
        ctx.font = '18px Arial';
        const subtitle = gameState === 'levelComplete' ?
            (level === MAX_LEVELS ? 'اضغط المستوى التالي لرؤية النتيجة' : 'اضغط المستوى التالي للمتابعة') :
            gameState === 'won' ? 'أكملت جميع مستويات العالم الأول' : '';
        if (subtitle) ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 25);
    }
}

function gameLoop() {
    if (gameState === 'playing') {
        updatePlayer();
        enemies.forEach(enemy => enemy.update());
        checkCollisions();
    }
    drawScene();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', event => {
    const key = event.key;
    keys[key] = true;
    if (['ArrowLeft', 'ArrowRight', ' '].includes(key)) event.preventDefault();
    if (key === ' ') jump();
    if (key.toLowerCase() === 'p') gameState === 'paused' ? resumeGame() : pauseGame();
    if (key.toLowerCase() === 'r') resetGame();
});
window.addEventListener('keyup', event => { keys[event.key] = false; });

const buttonActions = {
    startBtn: startGame,
    pauseBtn: pauseGame,
    resumeBtn: resumeGame,
    resetBtn: resetGame,
    restartBtn: nextLevel
};
Object.entries(buttonActions).forEach(([id, action]) => {
    const button = document.getElementById(id);
    if (button) button.addEventListener('click', action);
});

function bindHoldButton(id, key) {
    const button = document.getElementById(id);
    if (!button) return;
    const press = event => { event.preventDefault(); keys[key] = true; };
    const release = event => { event.preventDefault(); keys[key] = false; };
    ['pointerdown', 'touchstart'].forEach(type => button.addEventListener(type, press, { passive: false }));
    ['pointerup', 'pointerleave', 'pointercancel', 'touchend'].forEach(type => button.addEventListener(type, release, { passive: false }));
}
bindHoldButton('leftBtn', 'ArrowLeft');
bindHoldButton('rightBtn', 'ArrowRight');
const jumpButton = document.getElementById('jumpBtn');
if (jumpButton) jumpButton.addEventListener('click', jump);

loadLevel(level);
updateHud();
gameLoop();
