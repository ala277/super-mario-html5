const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// متغيرات اللعبة
let score = 0;
let coins = 0;
let level = 1;
let gameRunning = true;

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

// المنصات
const platforms = [
    { x: 0, y: canvas.height - 30, width: canvas.width, height: 30 }, // الأرضية
    { x: 150, y: 300, width: 200, height: 20 },
    { x: 450, y: 300, width: 200, height: 20 },
    { x: 300, y: 200, width: 150, height: 20 },
    { x: 550, y: 150, width: 150, height: 20 }
];

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
        
        // تغيير الاتجاه عند الوصول لحواف الشاشة
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.direction *= -1;
        }
    }

    draw() {
        // رسم العدو (فطر أحمر)
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // العيون
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

// إنشاء الأعداء
function createEnemies() {
    enemies = [];
    const enemyCount = 2 + level;
    for (let i = 0; i < enemyCount; i++) {
        const x = 100 + i * 200;
        const y = 250 - (i % 3) * 80;
        enemies.push(new Enemy(x, y));
    }
}

// إنشاء العملات
function createCoins() {
    coins_array = [];
    for (let platform of platforms) {
        if (platform.y < canvas.height - 50) {
            for (let i = 0; i < 3; i++) {
                const x = platform.x + 20 + i * (platform.width / 4);
                const y = platform.y - 30;
                coins_array.push(new Coin(x, y));
            }
        }
    }
}

// تحديث موضع اللاعب
function updatePlayer() {
    // التحرك الأفقي
    if (keys['ArrowLeft'] || keys['a']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight'] || keys['d']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= 0.8; // إبطاء
    }

    player.x += player.velocityX;

    // الحد من حدود الشاشة
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // الجاذبية
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // التحقق من الاصطدام بالمنصات
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

    // إذا وقع اللاعب من الشاشة
    if (player.y > canvas.height) {
        gameRunning = false;
    }
}

// رسم اللاعب
function drawPlayer() {
    // الجسم (أحمر)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // الرأس (بني)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(player.x + 5, player.y - 15, 20, 15);

    // العيون
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 8, player.y - 12, 4, 4);
    ctx.fillRect(player.x + 18, player.y - 12, 4, 4);

    // القبعة (حمراء)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.x + 3, player.y - 22, 24, 7);
}

// رسم المنصات
function drawPlatforms() {
    for (let platform of platforms) {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // تأثير ثلاثي الأبعاد
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
    createEnemies();
    createCoins();
    document.getElementById('score').textContent = score;
    document.getElementById('coins').textContent = coins;
    document.getElementById('level').textContent = level;
}

// إعادة تعيين المستوى
function nextLevel() {
    level++;
    player.x = 50;
    player.y = canvas.height - 100;
    player.velocityX = 0;
    player.velocityY = 0;
    coins = 0;
    score += 100;
    createEnemies();
    createCoins();
    document.getElementById('level').textContent = level;
    document.getElementById('coins').textContent = coins;
    document.getElementById('score').textContent = score;
}

// الحلقة الرئيسية
function gameLoop() {
    // مسح الشاشة
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameRunning) {
        updatePlayer();
        checkEnemyCollision();
        checkCoinCollection();

        // تحديث الأعداء
        for (let enemy of enemies) {
            enemy.update();
        }

        // التحقق من الفوز
        if (coins >= 3 + level) {
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
    } else if (gameRunning === false && coins >= 3 + level) {
        // لا تفعل شيء - ننتظر ضغطة R
    } else {
        // اللعبة انتهت
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

    // رسم العناصر
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

    requestAnimationFrame(gameLoop);
}

// بدء اللعبة
createEnemies();
createCoins();
gameLoop();
