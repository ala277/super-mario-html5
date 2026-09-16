const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// متغيرات اللعبة
let score = 0;
let coins = 0;
let level = 1;
let gameRunning = true;
const MAX_LEVELS = 7;

// المشغل (Mario)
const player = {
    x: 50,
    y: canvas.height - 100,
    width: 30,
    height: 40,
    velocityY: 0,
    velocityX: 0,
    jumping: false,
    speed: 5,
    jumpPower: 15,
    gravity: 0.6
};

// الأعداء
let enemies = [];
let coins_array = [];
let platforms = [];

// مفاتيح الضغط
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        if (!player.jumping) {
            player.velocityY = -player.jumpPower;
            player.jumping = true;
        }
    }
    if (e.key === 'r' || e.key === 'R') {
        resetGame();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// فئة العدو
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 2 + level * 0.5;
        this.direction = 1;
    }

    update() {
        this.x += this.speed * this.direction;
        
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.direction *= -1;
        }
    }

    draw() {
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 5, this.y + 5, 8, 8);
        ctx.fillRect(this.x + 17, this.y + 5, 8, 8);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 7, this.y + 7, 4, 4);
        ctx.fillRect(this.x + 19, this.y + 7, 4, 4);
    }
}

// فئة العملة
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
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// تعريف المستويات
const levelDesigns = {
    1: {
        platforms: [
            { x: 0, y: canvas.height - 30, width: canvas.width, height: 30 },
            { x: 150, y: 300, width: 200, height: 20 },
            { x: 450, y: 300, width: 200, height: 20 },
            { x: 300, y: 200, width: 150, height: 20 },
            { x: 550, y: 150, width: 150, height: 20 }
        ],
        enemies: [
            { x: 200, y: 250 },
            { x: 500, y: 250 }
        ],
        coinsCount: 4
    },
    2: {
        platforms: [
            { x: 0, y: canvas.height - 30, width: canvas.width, height: 30 },
            { x: 100, y: 300, width: 120, height: 20 },
            { x: 280, y: 280, width: 120, height: 20 },
            { x: 460, y: 300, width: 120, height: 20 },
            { x: 200, y: 180, width: 120, height: 20 },
            { x: 500, y: 150, width: 120, height: 20 }
        ],
        enemies: [
            { x: 150, y: 250 },
            { x: 350, y: 230 },
            { x: 550, y: 250 }
        ],
        coinsCount: 5
    },
    3: {
        platforms: [
            { x: 0, y: canvas.height - 30, width: canvas.width, height: 30 },
            { x: 50, y: 320, width: 100, height: 20 },
            { x: 200, y: 280, width: 100, height: 20 },
            { x: 350, y: 240, width: 100, height: 20 },
            { x: 500, y: 200, width: 100, height: 20 },
            { x: 650, y: 160, width: 100, height: 20 },
            { x: 300, y: 120, width: 80, height: 20 }
        ],
        enemies: [
            { x: 100, y: 270 },
            { x: 250, y: 230 },
            { x: 400, y: 190 },
            { x: 550, y: 150 }
        ],
        coinsCount: 6
    },
    4: {
        platforms: [
            { x: 0, y: canvas.height - 30, width: canvas.width, height: 30 },
            { x: 80, y: 300, width: 80, height: 20 },
            { x: 220, y: 250, width: 80, height: 20 },
            { x: 360, y: 300, width: 80, height: 20 },
            { x: 500, y: 250, width: 80, height: 20 },
            { x: 640, y: 300, width: 80, height: 20 },
            { x: 180, y: 150, width: 100, height: 20 },
            { x: 520, y: 150, width: 100, height: 20 }
        ],
        enemies: [
            { x: 100, y: 250 },
            { x: 250, y: 200 },
            { x: 400, y: 250 },
            { x: 550, y: 200 },
            { x: 680, y: 250 }
        ],
        coinsCount: 6
    },
    5: {
        platforms: [
            { x: 0, y: canvas.height - 30, width: canvas.width, height: 30 },
            { x: 60, y: 320, width: 70, height: 20 },
            { x: 160, y: 280, width: 70, height: 20 },
            { x: 260, y: 240, width: 70, height: 20 },
            { x: 360, y: 200, width: 70, height: 20 },
            { x: 460, y: 240, width: 70, height: 20 },
            { x: 560, y: 280, width: 70, height: 20 },
            { x: 660, y: 320, width: 70, height: 20 },
            { x: 280, y: 100, width: 120, height: 20 }
        ],
        enemies: [
            { x: 120, y: 270 },
            { x: 220, y: 230 },
            { x: 320, y: 190 },
            { x: 420, y: 230 },
            { x: 520, y: 270 },
            { x: 620, y: 310 }
        ],
        coinsCount: 7
    },
    6: {
        platforms: [
            { x: 0, y: canvas.height - 30, width: canvas.width, height: 30 },
            { x: 50, y: 310, width: 60, height: 20 },
            { x: 140, y: 270, width: 60, height: 20 },
            { x: 230, y: 230, width: 60, height: 20 },
            { x: 320, y: 190, width: 60, height: 20 },
            { x: 410, y: 230, width: 60, height: 20 },
            { x: 500, y: 270, width: 60, height: 20 },
            { x: 590, y: 310, width: 60, height: 20 },
            { x: 680, y: 350, width: 60, height: 20 },
            { x: 200, y: 100, width: 80, height: 20 },
            { x: 500, y: 80, width: 80, height: 20 }
        ],
        enemies: [
            { x: 100, y: 260 },
            { x: 200, y: 220 },
            { x: 300, y: 180 },
            { x: 400, y: 220 },
            { x: 500, y: 260 },
            { x: 600, y: 300 },
            { x: 700, y: 340 }
        ],
        coinsCount: 7
    },
    7: {
        platforms: [
            { x: 0, y: canvas.height - 30, width: canvas.width, height: 30 },
            { x: 40, y: 320, width: 50, height: 20 },
            { x: 120, y: 280, width: 50, height: 20 },
            { x: 200, y: 240, width: 50, height: 20 },
            { x: 280, y: 200, width: 50, height: 20 },
            { x: 360, y: 160, width: 50, height: 20 },
            { x: 440, y: 120, width: 50, height: 20 },
            { x: 520, y: 160, width: 50, height: 20 },
            { x: 600, y: 200, width: 50, height: 20 },
            { x: 680, y: 240, width: 50, height: 20 },
            { x: 300, y: 60, width: 100, height: 20 }
        ],
        enemies: [
            { x: 80, y: 270 },
            { x: 160, y: 230 },
            { x: 240, y: 190 },
            { x: 320, y: 150 },
            { x: 400, y: 110 },
            { x: 480, y: 150 },
            { x: 560, y: 190 },
            { x: 640, y: 230 },
            { x: 720, y: 270 }
        ],
        coinsCount: 8
    }
};

// تحميل المستوى
function loadLevel(levelNum) {
    const design = levelDesigns[levelNum];
    platforms = design.platforms;
    
    enemies = [];
    for (let enemy of design.enemies) {
        enemies.push(new Enemy(enemy.x, enemy.y));
    }
    
    coins_array = [];
    for (let platform of platforms) {
        if (platform.y < canvas.height - 50) {
            for (let i = 0; i < design.coinsCount; i++) {
                const x = platform.x + 10 + i * (platform.width / (design.coinsCount + 1));
                const y = platform.y - 30;
                coins_array.push(new Coin(x, y));
            }
        }
    }
}

// تحديث موضع اللاعب
function updatePlayer() {
    if (keys['ArrowLeft'] || keys['a']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight'] || keys['d']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= 0.8;
    }

    player.x += player.velocityX;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    player.velocityY += player.gravity;
    player.y += player.velocityY;

    player.jumping = true;
    for (let platform of platforms) {
        if (
            player.velocityY >= 0 &&
            player.y + player.height <= platform.y + 10 &&
            player.y + player.height + player.velocityY >= platform.y &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.jumping = false;
        }
    }

    if (player.y > canvas.height) {
        gameRunning = false;
    }
}

// رسم اللاعب
function drawPlayer() {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = '#8b4513';
    ctx.fillRect(player.x + 5, player.y - 15, 20, 15);

    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 8, player.y - 12, 4, 4);
    ctx.fillRect(player.x + 18, player.y - 12, 4, 4);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.x + 3, player.y - 22, 24, 7);
}

// رسم المنصات
function drawPlatforms() {
    for (let platform of platforms) {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        ctx.fillStyle = '#1a6b1a';
        ctx.fillRect(platform.x, platform.y + platform.height - 5, platform.width, 5);
    }
}

// التحقق من الاصطدام بالعدو
function checkEnemyCollision() {
    for (let enemy of enemies) {
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            gameRunning = false;
        }
    }
}

// التحقق من جمع العملات
function checkCoinCollection() {
    for (let coin of coins_array) {
        if (!coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y
        ) {
            coin.collected = true;
            coins++;
            score += 10;
            document.getElementById('coins').textContent = coins;
            document.getElementById('score').textContent = score;
        }
    }
}

// إعادة تشغيل اللعبة
function resetGame() {
    score = 0;
    coins = 0;
    level = 1;
    player.x = 50;
    player.y = canvas.height - 100;
    player.velocityX = 0;
    player.velocityY = 0;
    gameRunning = true;
    loadLevel(level);
    document.getElementById('score').textContent = score;
    document.getElementById('coins').textContent = coins;
    document.getElementById('level').textContent = level;
}

// الانتقال للمستوى التالي
function nextLevel() {
    level++;
    if (level > MAX_LEVELS) {
        gameRunning = 'won';
        return;
    }
    player.x = 50;
    player.y = canvas.height - 100;
    player.velocityX = 0;
    player.velocityY = 0;
    coins = 0;
    score += 100;
    loadLevel(level);
    gameRunning = true;
    document.getElementById('level').textContent = level;
    document.getElementById('coins').textContent = coins;
    document.getElementById('score').textContent = score;
}

// الحلقة الرئيسية
function gameLoop() {
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameRunning === true) {
        updatePlayer();
        checkEnemyCollision();
        checkCoinCollection();

        for (let enemy of enemies) {
            enemy.update();
        }

        const coinsNeeded = levelDesigns[level].coinsCount;
        if (coins >= coinsNeeded) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('انتقلت للمستوى التالي!', canvas.width / 2, canvas.height / 2 - 30);
            ctx.font = '20px Arial';
            ctx.fillText('اضغط R للمستوى التالي', canvas.width / 2, canvas.height / 2 + 30);
            gameRunning = false;
        }
    } else if (gameRunning === 'won') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎉 لقد فزت! 🎉', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFA500';
        ctx.fillText('النقاط النهائية: ' + score, canvas.width / 2, canvas.height / 2);
        ctx.fillText('أكملت جميع المستويات السبعة!', canvas.width / 2, canvas.height / 2 + 50);
        ctx.font = '18px Arial';
        ctx.fillText('اضغط R لإعادة اللعبة', canvas.width / 2, canvas.height / 2 + 100);
    } else if (gameRunning === false) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('اللعبة انتهت!', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '20px Arial';
        ctx.fillText('اضغط R لإعادة اللعبة', canvas.width / 2, canvas.height / 2 + 30);
    }

    drawPlatforms();
    
    for (let coin of coins_array) {
        if (!coin.collected) {
            coin.draw();
        }
    }
    
    for (let enemy of enemies) {
        enemy.draw();
    }
    
    drawPlayer();

    // معالجة ضغط R للانتقال للمستوى التالي
    if (!gameRunning && keys['r']) {
        keys['r'] = false; // منع التكرار المتكرر
        if (coins >= levelDesigns[level].coinsCount && level < MAX_LEVELS) {
            nextLevel();
        } else if (gameRunning === 'won') {
            resetGame();
        }
    }

    requestAnimationFrame(gameLoop);
}

// بدء اللعبة
loadLevel(level);
gameLoop();
