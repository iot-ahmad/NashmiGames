/**
 * COBB CAN MOVE - Game Engine
 */

const CONFIG = {
    TILE_SIZE: 40,
    GAME_WIDTH: 800,
    GAME_HEIGHT: 600,
    COBB_SPEED: 1.5,
    PLAYER_SPEED: 3,
    LIGHT_RADIUS: 200,
    SAFE_ZONE_RADIUS: 100,
    COAL_VALUE: 20
};

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.GAME_WIDTH;
        this.canvas.height = CONFIG.GAME_HEIGHT;

        this.state = 'MENU';
        this.level = 1;
        this.fuel = 100;
        this.rules = [];
        
        this.player = {
            x: 400,
            y: 300,
            radius: 15,
            vx: 0,
            vy: 0
        };

        this.cobb = {
            x: 100,
            y: 100,
            radius: 20,
            state: 'STALKING', // STALKING, CHASING, GRABBING
            senses: {
                see: false,
                hear: false,
                smell: false,
                reach: false
            }
        };

        this.map = [];
        this.entities = [];
        this.coal = [];

        this.keys = {};
        this.setupEventListeners();
        
        this.lastTime = 0;
        requestAnimationFrame((t) => this.loop(t));
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);

        document.getElementById('btn-continue')?.addEventListener('click', () => this.startGame());
        document.getElementById('btn-endless')?.addEventListener('click', () => this.startGame(true));
        document.getElementById('btn-retry')?.addEventListener('click', () => this.startGame());
        document.getElementById('btn-menu')?.addEventListener('click', () => this.showMenu());

        const volumeSlider = document.getElementById('vol-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.volume = e.target.value / 100;
                // In a real game, update audio engine volume here
            });
        }
    }

    showMenu() {
        this.state = 'MENU';
        document.querySelectorAll('.overlay').forEach(s => s.classList.remove('active'));
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('menu-overlay').classList.add('active');
    }

    startGame(endless = false) {
        this.state = 'PLAYING';
        this.isEndless = endless;
        this.level = 1;
        this.fuel = 100;
        this.generateLevel();
        
        document.querySelectorAll('.overlay').forEach(s => s.classList.remove('active'));
        document.getElementById('hud').classList.remove('hidden');
        // Show rules then start
        this.showRules();
    }

    showRules() {
        document.getElementById('rules-overlay').classList.add('active');
        const onKey = () => {
            document.getElementById('rules-overlay').classList.remove('active');
            window.removeEventListener('keydown', onKey);
        };
        window.addEventListener('keydown', onKey);
    }

    generateLevel() {
        this.map = [];
        this.coal = [];
        
        // Generate a 20x15 grid of walls/floor
        for (let y = 0; y < 15; y++) {
            this.map[y] = [];
            for (let x = 0; x < 20; x++) {
                // Outer walls
                if (x === 0 || x === 19 || y === 0 || y === 14) {
                    this.map[y][x] = 1;
                } else if (Math.random() < 0.1 && Math.hypot(x-10, y-7) > 3) {
                    this.map[y][x] = 1; // Random walls
                } else {
                    this.map[y][x] = 0;
                }
            }
        }

        this.player.x = CONFIG.GAME_WIDTH / 2;
        this.player.y = CONFIG.GAME_HEIGHT / 2 + 50;
        this.cobb.x = 60;
        this.cobb.y = 60;

        for (let i = 0; i < 5 + this.level; i++) {
            this.spawnCoal();
        }

        this.updateRules();
    }

    spawnCoal() {
        let x, y, tx, ty;
        do {
            tx = Math.floor(Math.random() * 18) + 1;
            ty = Math.floor(Math.random() * 13) + 1;
        } while (this.map[ty][tx] === 1);
        
        this.coal.push({ x: tx * CONFIG.TILE_SIZE + 20, y: ty * CONFIG.TILE_SIZE + 20 });
    }

    updateRules() {
        this.cobb.senses.see = this.level > 1;
        this.cobb.senses.hear = this.level > 2;
        this.cobb.senses.smell = this.level > 3;
        this.cobb.senses.reach = this.level > 4;

        const rulesList = document.getElementById('rules-list');
        if (rulesList) {
            rulesList.innerHTML = '';
            if (this.cobb.senses.see) rulesList.innerHTML += '<div class="rule-item">MUTATION: COBB CAN SEE</div>';
            if (this.cobb.senses.hear) rulesList.innerHTML += '<div class="rule-item">MUTATION: COBB CAN HEAR</div>';
            if (this.cobb.senses.smell) rulesList.innerHTML += '<div class="rule-item">MUTATION: COBB CAN SMELL</div>';
            if (this.cobb.senses.reach) rulesList.innerHTML += '<div class="rule-item">MUTATION: COBB CAN REACH</div>';
        }

        const levelEl = document.getElementById('hud-level');
        if (levelEl) levelEl.textContent = `LEVEL ${this.level}`;
    }

    checkCollision(nx, ny) {
        const tx = Math.floor(nx / CONFIG.TILE_SIZE);
        const ty = Math.floor(ny / CONFIG.TILE_SIZE);
        if (ty < 0 || ty >= 15 || tx < 0 || tx >= 20) return true;
        return this.map[ty][tx] === 1;
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        // Player Movement with collision
        let dx = 0;
        let dy = 0;
        if (this.keys['w'] || this.keys['ArrowUp']) dy -= 1;
        if (this.keys['s'] || this.keys['ArrowDown']) dy += 1;
        if (this.keys['a'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['d'] || this.keys['ArrowRight']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            const mag = Math.sqrt(dx*dx + dy*dy);
            const moveX = (dx / mag) * CONFIG.PLAYER_SPEED;
            const moveY = (dy / mag) * CONFIG.PLAYER_SPEED;
            
            if (!this.checkCollision(this.player.x + moveX, this.player.y)) this.player.x += moveX;
            if (!this.checkCollision(this.player.x, this.player.y + moveY)) this.player.y += moveY;
        }

        // Cobb AI logic
        const distToPlayer = Math.hypot(this.player.x - this.cobb.x, this.player.y - this.cobb.y);
        const lightRadius = (this.fuel / 100) * CONFIG.LIGHT_RADIUS + 50;
        
        let canDetect = false;
        
        // Sight logic: If player is in light and not behind wall (simplified)
        if (this.cobb.senses.see && distToPlayer < lightRadius) canDetect = true;
        // Sound logic: If player is moving
        if (this.cobb.senses.hear && (dx !== 0 || dy !== 0) && distToPlayer < 300) canDetect = true;
        // Smell logic: Always detects if close enough
        if (this.cobb.senses.smell && distToPlayer < 150) canDetect = true;
        // Proximity (Basic)
        if (distToPlayer < 80) canDetect = true;

        if (canDetect) {
            this.cobb.state = 'CHASING';
        } else if (distToPlayer > 300) {
            this.cobb.state = 'STALKING';
        }

        let cobbSpeed = this.cobb.state === 'CHASING' ? CONFIG.COBB_SPEED * 1.5 : CONFIG.COBB_SPEED;
        if (this.cobb.senses.reach && distToPlayer < 100) cobbSpeed *= 1.3;

        const angle = Math.atan2(this.player.y - this.cobb.y, this.player.x - this.cobb.x);
        const cx = Math.cos(angle) * cobbSpeed;
        const cy = Math.sin(angle) * cobbSpeed;
        
        // Simple pathing: ignore walls for Cobb (ghostly feel) or respect them?
        // Respecting them makes it a better game.
        if (!this.checkCollision(this.cobb.x + cx, this.cobb.y)) this.cobb.x += cx;
        if (!this.checkCollision(this.cobb.x, this.cobb.y + cy)) this.cobb.y += cy;

        // Screen shake if Cobb is near
        if (distToPlayer < 100) {
            this.canvas.style.transform = `translate(${(Math.random()-0.5)*5}px, ${(Math.random()-0.5)*5}px)`;
        } else {
            this.canvas.style.transform = 'none';
        }

        // Fuel depletion
        this.fuel -= 0.08;
        if (this.fuel <= 0) {
            this.fuel = 0;
            this.gameOver();
            return;
        }
        // Update HUD fuel bar
        const fuelBar = document.getElementById('fuel-bar');
        if (fuelBar) {
            fuelBar.style.width = this.fuel + '%';
            if (this.fuel < 25) fuelBar.classList.add('low');
            else fuelBar.classList.remove('low');
        }

        // Coal pickup
        this.coal = this.coal.filter(c => {
            const dist = Math.hypot(this.player.x - c.x, this.player.y - c.y);
            if (dist < 30) {
                this.fuel = Math.min(100, this.fuel + CONFIG.COAL_VALUE);
                return false;
            }
            return true;
        });

        // Level completion (If all coal is gone and player reaches center)
        if (this.coal.length === 0) {
            const distToCenter = Math.hypot(this.player.x - CONFIG.GAME_WIDTH/2, this.player.y - CONFIG.GAME_HEIGHT/2);
            if (distToCenter < 40) {
                this.nextLevel();
            }
        }

        // Game Over check
        const grabDist = this.cobb.senses.reach ? 40 : 25;
        if (distToPlayer < grabDist) {
            this.gameOver();
        }
    }

    nextLevel() {
        this.level++;
        this.generateLevel();
        document.querySelectorAll('.overlay').forEach(s => s.classList.remove('active'));
        document.getElementById('levelcomplete-overlay').classList.add('active');
        const onKey = () => {
            document.getElementById('levelcomplete-overlay').classList.remove('active');
            window.removeEventListener('keydown', onKey);
        };
        window.addEventListener('keydown', onKey);
    }

    gameOver() {
        this.state = 'GAMEOVER';
        document.querySelectorAll('.overlay').forEach(s => s.classList.remove('active'));
        document.getElementById('gameover-overlay').classList.add('active');
        const sub = document.getElementById('gameover-sub');
        if (sub) sub.textContent = this.fuel <= 0 ? 'The furnace went cold...' : 'Cobb caught you!';
    }

    draw() {
        this.ctx.clearRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);

        if (this.state === 'PLAYING') {
            // Draw Tiles
            for (let y = 0; y < 15; y++) {
                for (let x = 0; x < 20; x++) {
                    if (this.map[y][x] === 1) {
                        this.ctx.fillStyle = '#222';
                        this.ctx.fillRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                        this.ctx.strokeStyle = '#333';
                        this.ctx.strokeRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                    } else {
                        this.ctx.fillStyle = '#0a0a0a';
                        this.ctx.fillRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                    }
                }
            }

            // Draw Fireplace
            this.ctx.fillStyle = '#f60';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#f60';
            this.ctx.beginPath();
            this.ctx.arc(CONFIG.GAME_WIDTH/2, CONFIG.GAME_HEIGHT/2, 15, 0, Math.PI*2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            // Draw Coal
            this.ctx.fillStyle = '#555';
            this.coal.forEach(c => {
                this.ctx.fillRect(c.x - 8, c.y - 8, 16, 16);
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(c.x - 4, c.y - 4, 8, 8);
                this.ctx.fillStyle = '#555';
            });

            // Draw Player
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI*2);
            this.ctx.fill();

            // Draw Cobb
            this.ctx.fillStyle = '#aa0000';
            this.ctx.beginPath();
            this.ctx.arc(this.cobb.x, this.cobb.y, this.cobb.radius, 0, Math.PI*2);
            this.ctx.fill();
            // Eyes
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(this.cobb.x - 6, this.cobb.y - 6, 4, 0, Math.PI*2);
            this.ctx.arc(this.cobb.x + 6, this.cobb.y - 6, 4, 0, Math.PI*2);
            this.ctx.fill();
            if (this.cobb.state === 'CHASING') {
                this.ctx.fillStyle = '#f00';
                this.ctx.beginPath();
                this.ctx.arc(this.cobb.x - 6, this.cobb.y - 6, 2, 0, Math.PI*2);
                this.ctx.arc(this.cobb.x + 6, this.cobb.y - 6, 2, 0, Math.PI*2);
                this.ctx.fill();
            }

            this.drawLighting();
        }
    }

    drawLighting() {
        const lightRadius = (this.fuel / 100) * CONFIG.LIGHT_RADIUS + 50;
        
        // Create a temporary canvas or use globalCompositeOperation
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        
        const gradient = this.ctx.createRadialGradient(
            this.player.x, this.player.y, 0,
            this.player.x, this.player.y, lightRadius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(100, 100, 100, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);

        // Add firelight
        const fireGradient = this.ctx.createRadialGradient(
            CONFIG.GAME_WIDTH/2, CONFIG.GAME_HEIGHT/2, 0,
            CONFIG.GAME_WIDTH/2, CONFIG.GAME_HEIGHT/2, CONFIG.SAFE_ZONE_RADIUS
        );
        fireGradient.addColorStop(0, 'rgba(255, 200, 100, 0.5)');
        fireGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = fireGradient;
        this.ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);

        this.ctx.restore();
    }

    loop(time) {
        const dt = time - this.lastTime;
        this.lastTime = time;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Initialize Game
window.onload = () => {
    window.game = new Game();
};
