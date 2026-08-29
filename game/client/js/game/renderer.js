// ===== Game Renderer =====

class GameRenderer {
    constructor(canvas, engine) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.engine = engine;
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.selectedTile = null;
        this.hoveredTile = null;
        this.showGrid = true;
        this.showWalls = true;
        this.showUnits = true;
        this.showMarbles = true;
        this.animations = [];
        this.init();
    }
    
    init() {
        this.resetCamera();
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.start();
    }
    
    start() {
        this.isRunning = true;
        this.renderLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    renderLoop() {
        if (!this.isRunning) return;
        this.render();
        requestAnimationFrame(() => this.renderLoop());
    }
    
    render() {
        this.clear();
        this.ctx.save();
        this.applyCamera();
        this.renderBackground();
        this.renderGrid();
        this.renderWalls();
        this.renderSpawners();
        this.renderMarbles();
        this.renderUnits();
        this.renderProjectiles();
        this.renderEffects();
        this.renderUI();
        this.ctx.restore();
        this.renderHUD();
    }
    
    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    applyCamera() {
        this.ctx.translate(this.camera.x, this.camera.y);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
    }
    
    resetCamera() {
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.zoom = 1;
    }
    
    renderBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#111827');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-this.canvas.width, -this.canvas.height, this.canvas.width * 3, this.canvas.height * 3);
    }
    
    renderGrid() {
        if (!this.showGrid) return;
        const size = this.engine.tileSize;
        const gridSize = this.engine.gridSize;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= gridSize; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * size, 0);
            this.ctx.lineTo(x * size, gridSize * size);
            this.ctx.stroke();
        }
        for (let y = 0; y <= gridSize; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * size);
            this.ctx.lineTo(gridSize * size, y * size);
            this.ctx.stroke();
        }
    }
    
    renderWalls() {
        if (!this.showWalls) return;
        const size = this.engine.tileSize;
        const wallThickness = CONFIG.WALL_THICKNESS;
        Object.values(this.engine.walls).forEach(wall => {
            const x = wall.x * size;
            const y = wall.y * size;
            let wallX, wallY, wallWidth, wallHeight;
            if (wall.direction === 'right') {
                wallX = x + size - wallThickness / 2;
                wallY = y;
                wallWidth = wallThickness;
                wallHeight = size;
            } else {
                wallX = x;
                wallY = y + size - wallThickness / 2;
                wallWidth = size;
                wallHeight = wallThickness;
            }
            if (wall.destroyed) {
                this.ctx.fillStyle = '#6b7280';
            } else if (wall.claimed) {
                const teamColor = CONFIG.COLORS.teams[wall.owner - 1] || CONFIG.COLORS.primary;
                this.ctx.fillStyle = teamColor;
            } else {
                this.ctx.fillStyle = '#4b5563';
            }
            this.ctx.fillRect(wallX, wallY, wallWidth, wallHeight);
            if (wall.hp < wall.maxHp && !wall.destroyed) {
                this.renderWallHP(wall, wallX, wallY, wallWidth, wallHeight);
            }
        });
    }
    
    renderWallHP(wall, x, y, width, height) {
        const hpPercent = wall.hp / wall.maxHp;
        const barHeight = 3;
        const barY = y - barHeight - 2;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x, barY, width, barHeight);
        this.ctx.fillStyle = hpPercent > 0.5 ? '#10b981' : (hpPercent > 0.25 ? '#f59e0b' : '#ef4444');
        this.ctx.fillRect(x, barY, width * hpPercent, barHeight);
    }
    
    renderSpawners() {
        const size = this.engine.tileSize;
        this.engine.spawners.forEach(spawner => {
            const x = spawner.x * size + size / 2;
            const y = spawner.y * size + size / 2;
            const radius = size * 0.4;
            const teamColor = CONFIG.COLORS.teams[spawner.team - 1] || CONFIG.COLORS.primary;
            const gradient = this.ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius);
            gradient.addColorStop(0, teamColor + '40');
            gradient.addColorStop(1, teamColor + '20');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = teamColor;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.fillStyle = teamColor;
            this.ctx.font = `${radius * 0.6}px Orbitron`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(spawner.team.toString(), x, y);
            if (spawner.hp < spawner.maxHp) {
                this.renderSpawnerHP(spawner, x, y - radius - 10, size * 0.6);
            }
        });
    }
    
    renderSpawnerHP(spawner, x, y, width) {
        const hpPercent = spawner.hp / spawner.maxHp;
        const barHeight = 6;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x - width / 2, y, width, barHeight);
        const teamColor = CONFIG.COLORS.teams[spawner.team - 1] || CONFIG.COLORS.primary;
        this.ctx.fillStyle = teamColor;
        this.ctx.fillRect(x - width / 2, y, width * hpPercent, barHeight);
    }
    
    renderUnits() {
        if (!this.showUnits) return;
        const size = this.engine.tileSize;
        const sortedUnits = [...this.engine.units].sort((a, b) => (a.y + a.moveProgress) - (b.y + b.moveProgress));
        sortedUnits.forEach(unit => {
            const x = unit.x * size + size / 2;
            const y = unit.y * size + size / 2;
            let drawX = x, drawY = y;
            if (unit.isMoving) {
                const startX = unit.x * size + size / 2;
                const startY = unit.y * size + size / 2;
                const targetX = unit.targetX * size + size / 2;
                const targetY = unit.targetY * size + size / 2;
                drawX = lerp(startX, targetX, unit.moveProgress);
                drawY = lerp(startY, targetY, unit.moveProgress);
            }
            let color, icon;
            switch (unit.type) {
                case CONFIG.UNIT_TYPES.MELEE: color = CONFIG.COLORS.units.melee; icon = '⚔️'; break;
                case CONFIG.UNIT_TYPES.RANGED: color = CONFIG.COLORS.units.ranged; icon = '🎯'; break;
                case CONFIG.UNIT_TYPES.BUFF: color = CONFIG.COLORS.units.buff; icon = '💚'; break;
                case CONFIG.UNIT_TYPES.TURRET: color = CONFIG.COLORS.units.turret; icon = '🗼'; break;
                default: color = CONFIG.COLORS.units.melee; icon = '⚔️';
            }
            const teamColor = CONFIG.COLORS.teams[unit.team - 1] || CONFIG.COLORS.primary;
            const finalColor = this.mixColors(color, teamColor, 0.5);
            const radius = size * 0.35;
            this.ctx.fillStyle = finalColor;
            this.ctx.beginPath();
            this.ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = teamColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.font = `${radius * 0.8}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(icon, drawX, drawY);
            if (unit.hp < unit.maxHp) {
                this.renderUnitHP(unit, drawX, drawY - radius - 8, radius * 1.2);
            }
            if (this.engine.selectedUnit && this.engine.selectedUnit.id === unit.id) {
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(drawX, drawY, radius + 5, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }
    
    renderUnitHP(unit, x, y, width) {
        const hpPercent = unit.hp / unit.maxHp;
        const barHeight = 4;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x - width / 2, y, width, barHeight);
        this.ctx.fillStyle = hpPercent > 0.5 ? '#10b981' : (hpPercent > 0.25 ? '#f59e0b' : '#ef4444');
        this.ctx.fillRect(x - width / 2, y, width * hpPercent, barHeight);
    }
    
    renderMarbles() {
        if (!this.showMarbles) return;
        const size = this.engine.tileSize;
        this.engine.marbles.forEach(marble => {
            const radius = CONFIG.MARBLE_SIZE / 2;
            let color;
            switch (marble.type) {
                case CONFIG.MARBLE_TYPES.ATTACK: color = CONFIG.COLORS.marbles.attack; break;
                case CONFIG.MARBLE_TYPES.BUFF: color = CONFIG.COLORS.marbles.buff; break;
                case CONFIG.MARBLE_TYPES.SPLIT: color = CONFIG.COLORS.marbles.split; break;
                default: color = '#fff';
            }
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(marble.x, marble.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            const gradient = this.ctx.createRadialGradient(marble.x, marble.y, radius * 0.5, marble.x, marble.y, radius * 2);
            gradient.addColorStop(0, color + '80');
            gradient.addColorStop(1, color + '00');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(marble.x, marble.y, radius * 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderProjectiles() {
        this.engine.projectiles.forEach(projectile => {
            const radius = 5;
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(projectile.x, projectile.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(projectile.x, projectile.y, radius * 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderEffects() {
        this.engine.effects.forEach(effect => {
            switch (effect.type) {
                case 'paint_splatter': this.renderPaintSplatter(effect); break;
                case 'damage_number': this.renderDamageNumber(effect); break;
                case 'heal_effect': this.renderHealEffect(effect); break;
            }
        });
    }
    
    renderPaintSplatter(effect) {
        const radius = effect.radius || 15;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${effect.opacity || 0.5})`;
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderDamageNumber(effect) {
        this.ctx.font = `${effect.size || 16}px Orbitron`;
        this.ctx.fillStyle = effect.color || '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(effect.value, effect.x, effect.y);
    }
    
    renderHealEffect(effect) {
        const radius = effect.radius || 10;
        this.ctx.fillStyle = `rgba(16, 185, 129, ${effect.opacity || 0.5})`;
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderUI() {
        if (this.selectedTile) this.renderSelectedTile(this.selectedTile);
        if (this.hoveredTile) this.renderHoveredTile(this.hoveredTile);
    }
    
    renderSelectedTile(tile) {
        const size = this.engine.tileSize;
        const x = tile.x * size;
        const y = tile.y * size;
        this.ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
        this.ctx.fillRect(x, y, size, size);
        this.ctx.strokeStyle = CONFIG.COLORS.primary;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, size, size);
    }
    
    renderHoveredTile(tile) {
        const size = this.engine.tileSize;
        const x = tile.x * size;
        const y = tile.y * size;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(x, y, size, size);
    }
    
    renderHUD() {}
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.camera.x;
        const y = e.clientY - rect.top - this.camera.y;
        const gridX = Math.floor(x / this.engine.tileSize);
        const gridY = Math.floor(y / this.engine.tileSize);
        const tile = this.engine.getTile(gridX, gridY);
        this.hoveredTile = tile || null;
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.camera.x;
        const y = e.clientY - rect.top - this.camera.y;
        const gridX = Math.floor(x / this.engine.tileSize);
        const gridY = Math.floor(y / this.engine.tileSize);
        const tile = this.engine.getTile(gridX, gridY);
        if (tile) {
            this.selectedTile = tile;
            const unit = tile.units.find(u => u.team === this.engine.currentTeam);
            if (unit) this.engine.selectedUnit = unit;
            else this.engine.selectedUnit = null;
        }
    }
    
    mixColors(color1, color2, ratio) {
        const hex = (x) => {
            const h = x.toString(16);
            return h.length === 1 ? '0' + h : h;
        };
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
        const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
        const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
        return `#${hex(r)}${hex(g)}${hex(b)}`;
    }
    
    moveCamera(dx, dy) {
        this.camera.x += dx;
        this.camera.y += dy;
    }
    
    zoomCamera(zoom) {
        this.camera.zoom = clamp(this.camera.zoom + zoom, 0.5, 2);
    }
    
    setZoom(zoom) {
        this.camera.zoom = clamp(zoom, 0.5, 2);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameRenderer;
}
