// ===== Game Engine =====

class GameEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = options.gridSize || 5;
        this.tileSize = options.tileSize || CONFIG.TILE_SIZE;
        this.width = this.gridSize * this.tileSize;
        this.height = this.gridSize * this.tileSize;
        this.resize();
        this.grid = [];
        this.walls = {};
        this.units = [];
        this.marbles = [];
        this.projectiles = [];
        this.effects = [];
        this.spawners = [];
        this.players = {};
        this.currentPlayerId = null;
        this.currentTeam = 1;
        this.tick = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.marbleTimer = CONFIG.MARBLE_FIRE_INTERVAL;
        this.selectedMarbleType = CONFIG.MARBLE_TYPES.ATTACK;
        this.marbleTrack = [];
        this.selectedUnit = null;
        this.selectedCard = null;
        this.hoveredTile = null;
        this.isHost = false;
        this.socket = null;
        this.callbacks = {
            onTick: null,
            onMarbleFire: null,
            onUnitSpawn: null,
            onUnitMove: null,
            onUnitAttack: null,
            onWallDamage: null,
            onWallDestroy: null,
            onUnitDie: null,
            onSpawnerDamage: null,
            onMatchEnd: null
        };
        this.init();
    }
    
    init() {
        this.createGrid();
        this.createWalls();
        this.createSpawners();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const container = this.canvas.parentElement;
        if (container) {
            const rect = container.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        } else {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }
    }
    
    createGrid() {
        this.grid = [];
        for (let y = 0; y < this.gridSize; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.grid[y][x] = {
                    x: x,
                    y: y,
                    type: 'path',
                    owner: null,
                    units: [],
                    marbles: []
                };
            }
        }
    }
    
    getTile(x, y) {
        if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return null;
        return this.grid[y][x];
    }
    
    getTileAtPosition(posX, posY) {
        const x = Math.floor(posX / this.tileSize);
        const y = Math.floor(posY / this.tileSize);
        return this.getTile(x, y);
    }
    
    createWalls() {
        this.walls = {};
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (x < this.gridSize - 1) {
                    this.walls[`${x}_${y}_right`] = {
                        x: x,
                        y: y,
                        direction: 'right',
                        hp: CONFIG.WALL_HP,
                        maxHp: CONFIG.WALL_HP,
                        owner: null,
                        claimed: false
                    };
                }
                if (y < this.gridSize - 1) {
                    this.walls[`${x}_${y}_bottom`] = {
                        x: x,
                        y: y,
                        direction: 'bottom',
                        hp: CONFIG.WALL_HP,
                        maxHp: CONFIG.WALL_HP,
                        owner: null,
                        claimed: false
                    };
                }
            }
        }
    }
    
    getWall(x, y, direction) {
        return this.walls[`${x}_${y}_${direction}`];
    }
    
    createSpawners() {
        this.spawners = [];
        const positions = this.getSpawnerPositions();
        positions.forEach((pos, index) => {
            this.spawners.push({
                id: `spawner_${index}`,
                x: pos.x,
                y: pos.y,
                hp: CONFIG.SPAWNER_HP,
                maxHp: CONFIG.SPAWNER_HP,
                owner: null,
                team: index + 1
            });
        });
    }
    
    getSpawnerPositions() {
        switch (this.gridSize) {
            case 5: return [{ x: 0, y: 0 }, { x: 4, y: 4 }];
            case 7: return [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 0, y: 6 }, { x: 6, y: 6 }];
            case 9: return [
                { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 8, y: 0 },
                { x: 0, y: 4 }, { x: 4, y: 4 }, { x: 8, y: 4 },
                { x: 0, y: 8 }, { x: 4, y: 8 }, { x: 8, y: 8 }
            ];
            default: return [{ x: 0, y: 0 }, { x: this.gridSize - 1, y: this.gridSize - 1 }];
        }
    }
    
    getSpawnerForTeam(team) {
        return this.spawners.find(s => s.team === team);
    }
    
    getEnemySpawner(team) {
        return this.spawners.find(s => s.team !== team);
    }
    
    createUnit(data) {
        const unit = {
            id: data.id || generateId(),
            type: data.type || CONFIG.UNIT_TYPES.MELEE,
            x: data.x,
            y: data.y,
            targetX: data.x,
            targetY: data.y,
            hp: data.hp || 60,
            maxHp: data.maxHp || 60,
            damage: data.damage || 14,
            speed: data.speed || CONFIG.UNIT_SPEED,
            attackRange: data.attackRange || 1,
            team: data.team || this.currentTeam,
            owner: data.owner || this.currentPlayerId,
            isMoving: false,
            moveProgress: 0,
            attackCooldown: 0,
            lastAttack: 0,
            createdAt: Date.now()
        };
        this.units.push(unit);
        const tile = this.getTile(unit.x, unit.y);
        if (tile) tile.units.push(unit);
        if (this.callbacks.onUnitSpawn) this.callbacks.onUnitSpawn(unit);
        return unit;
    }
    
    spawnUnitFromMarble(marble, x, y) {
        let unitType, hp, damage, count;
        switch (marble.type) {
            case CONFIG.MARBLE_TYPES.ATTACK:
                unitType = CONFIG.UNIT_TYPES.MELEE; hp = 60; damage = 14; count = 1; break;
            case CONFIG.MARBLE_TYPES.BUFF:
                unitType = CONFIG.UNIT_TYPES.BUFF; hp = 50; damage = 0; count = 1; break;
            case CONFIG.MARBLE_TYPES.SPLIT:
                unitType = CONFIG.UNIT_TYPES.MELEE; hp = 25; damage = 5; count = 2; break;
            default: unitType = CONFIG.UNIT_TYPES.MELEE; hp = 60; damage = 14; count = 1;
        }
        for (let i = 0; i < count; i++) {
            const spawnX = x + (i === 0 ? 0 : 1);
            const spawnY = y + (i === 0 ? 0 : (Math.random() > 0.5 ? 1 : -1));
            if (this.isValidTile(spawnX, spawnY)) {
                this.createUnit({ type: unitType, x: spawnX, y: spawnY, hp: hp, damage: damage, team: this.currentTeam });
            }
        }
    }
    
    removeUnit(unit) {
        const index = this.units.indexOf(unit);
        if (index > -1) this.units.splice(index, 1);
        const tile = this.getTile(unit.x, unit.y);
        if (tile) {
            const tileIndex = tile.units.indexOf(unit);
            if (tileIndex > -1) tile.units.splice(tileIndex, 1);
        }
        if (this.callbacks.onUnitDie) this.callbacks.onUnitDie(unit);
    }
    
    moveUnit(unit, targetX, targetY) {
        if (!this.isValidTile(targetX, targetY)) return false;
        if (!this.canMoveTo(unit, targetX, targetY)) return false;
        unit.targetX = targetX;
        unit.targetY = targetY;
        unit.isMoving = true;
        unit.moveProgress = 0;
        const currentTile = this.getTile(unit.x, unit.y);
        if (currentTile) {
            const index = currentTile.units.indexOf(unit);
            if (index > -1) currentTile.units.splice(index, 1);
        }
        if (this.callbacks.onUnitMove) this.callbacks.onUnitMove(unit, targetX, targetY);
        return true;
    }
    
    canMoveTo(unit, targetX, targetY) {
        const targetTile = this.getTile(targetX, targetY);
        if (!targetTile) return false;
        if (!this.isTileAccessible(unit.team, targetX, targetY)) return false;
        return true;
    }
    
    isTileAccessible(team, x, y) {
        const tile = this.getTile(x, y);
        if (!tile) return false;
        if (tile.owner === team || tile.owner === null) return true;
        return false;
    }
    
    isValidTile(x, y) {
        return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
    }
    
    fireMarble(type = null) {
        const marbleType = type || this.selectedMarbleType;
        const cannonX = this.gridSize / 2;
        const cannonY = this.gridSize - 1;
        const marble = {
            id: generateId(),
            type: marbleType,
            x: cannonX * this.tileSize + this.tileSize / 2,
            y: cannonY * this.tileSize + this.tileSize / 2,
            targetX: cannonX * this.tileSize + this.tileSize / 2,
            targetY: (cannonY - 2) * this.tileSize + this.tileSize / 2,
            speed: 5,
            inTrack: false,
            createdAt: Date.now()
        };
        this.marbles.push(marble);
        if (this.callbacks.onMarbleFire) this.callbacks.onMarbleFire(marble);
        this.marbleTimer = Math.max(
            CONFIG.MIN_MARBLE_INTERVAL,
            CONFIG.MARBLE_FIRE_INTERVAL - (this.elapsedTime / 1000) * CONFIG.MARBLE_ACCELERATION
        );
    }
    
    attackUnit(attacker, target) {
        if (!attacker || !target) return;
        const dist = manhattanDistance(attacker.x, attacker.y, target.x, target.y);
        if (dist > attacker.attackRange) return;
        if (Date.now() - attacker.lastAttack < 1000) return;
        target.hp -= attacker.damage;
        attacker.lastAttack = Date.now();
        if (target.hp <= 0) this.removeUnit(target);
        if (this.callbacks.onUnitAttack) this.callbacks.onUnitAttack(attacker, target, attacker.damage);
    }
    
    attackWall(unit, wall) {
        if (!unit || !wall) return;
        wall.hp -= unit.damage;
        if (wall.hp <= 0) {
            wall.hp = 0;
            wall.destroyed = true;
            if (this.callbacks.onWallDestroy) this.callbacks.onWallDestroy(wall);
        } else {
            if (this.callbacks.onWallDamage) this.callbacks.onWallDamage(wall, unit.damage);
        }
    }
    
    attackSpawner(unit, spawner) {
        if (!unit || !spawner) return;
        if (unit.team === spawner.team) return;
        spawner.hp -= unit.damage;
        if (spawner.hp <= 0) {
            const enemySpawners = this.spawners.filter(s => s.team !== unit.team);
            if (enemySpawners.every(s => s.hp <= 0)) {
                if (this.callbacks.onMatchEnd) this.callbacks.onMatchEnd({ winner: unit.team });
            }
        }
        if (this.callbacks.onSpawnerDamage) this.callbacks.onSpawnerDamage(spawner, unit.damage);
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = Date.now();
        this.lastTick = Date.now();
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
        this.lastTick = Date.now();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        const now = Date.now();
        const deltaTime = now - this.lastTime;
        this.lastTime = now;
        this.marbleTimer -= deltaTime;
        if (this.marbleTimer <= 0 && !this.isPaused) this.fireMarble();
        this.update(deltaTime);
        if (now - this.lastTick >= CONFIG.GAME_TICK_RATE && !this.isPaused) {
            this.tick();
            this.lastTick = now;
        }
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        this.units.forEach(unit => {
            if (unit.isMoving) this.updateUnitMovement(unit, deltaTime);
        });
        this.marbles.forEach(marble => this.updateMarble(marble, deltaTime));
        this.projectiles.forEach(projectile => this.updateProjectile(projectile, deltaTime));
        this.effects.forEach(effect => this.updateEffect(effect, deltaTime));
        this.cleanup();
        this.elapsedTime += deltaTime;
    }
    
    tick() {
        this.tick++;
        this.processUnitAI();
        if (this.callbacks.onTick) this.callbacks.onTick(this.tick, this.elapsedTime);
    }
    
    updateUnitMovement(unit, deltaTime) {
        const speed = unit.speed * this.tileSize / 1000;
        const distance = Math.sqrt(
            Math.pow((unit.targetX - unit.x) * this.tileSize, 2) +
            Math.pow((unit.targetY - unit.y) * this.tileSize, 2)
        );
        const moveDistance = speed * deltaTime;
        unit.moveProgress += moveDistance / distance;
        if (unit.moveProgress >= 1) {
            unit.x = unit.targetX;
            unit.y = unit.targetY;
            unit.isMoving = false;
            unit.moveProgress = 0;
            const tile = this.getTile(unit.x, unit.y);
            if (tile) tile.units.push(unit);
        } else {
            unit.x = lerp(unit.x, unit.targetX, unit.moveProgress);
            unit.y = lerp(unit.y, unit.targetY, unit.moveProgress);
        }
    }
    
    updateMarble(marble, deltaTime) {
        const speed = marble.speed * deltaTime / 1000;
        const angle = Math.atan2(marble.targetY - marble.y, marble.targetX - marble.x);
        marble.x += Math.cos(angle) * speed * this.tileSize;
        marble.y += Math.sin(angle) * speed * this.tileSize;
        const dist = Math.sqrt(Math.pow(marble.targetX - marble.x, 2) + Math.pow(marble.targetY - marble.y, 2));
        if (dist < speed * this.tileSize) {
            marble.x = marble.targetX;
            marble.y = marble.targetY;
            const tileX = Math.floor(marble.x / this.tileSize);
            const tileY = Math.floor(marble.y / this.tileSize);
            this.spawnUnitFromMarble(marble, tileX, tileY);
            const index = this.marbles.indexOf(marble);
            if (index > -1) this.marbles.splice(index, 1);
        }
    }
    
    processUnitAI() {
        this.units.forEach(unit => {
            if (unit.team !== this.currentTeam) return;
            if (unit.isMoving) return;
            const enemyUnit = this.findNearestEnemy(unit);
            const enemySpawner = this.findNearestEnemySpawner(unit);
            if (enemyUnit) {
                const dist = manhattanDistance(unit.x, unit.y, enemyUnit.x, enemyUnit.y);
                if (dist <= unit.attackRange) {
                    this.attackUnit(unit, enemyUnit);
                } else {
                    const path = this.findPath(unit.x, unit.y, enemyUnit.x, enemyUnit.y);
                    if (path.length > 0) this.moveUnit(unit, path[0].x, path[0].y);
                }
            } else if (enemySpawner) {
                const path = this.findPath(unit.x, unit.y, enemySpawner.x, enemySpawner.y);
                if (path.length > 0) this.moveUnit(unit, path[0].x, path[0].y);
            }
        });
    }
    
    findNearestEnemy(unit) {
        let nearest = null;
        let nearestDist = Infinity;
        this.units.forEach(other => {
            if (other.team === unit.team) return;
            const dist = manhattanDistance(unit.x, unit.y, other.x, other.y);
            if (dist < nearestDist) {
                nearest = other;
                nearestDist = dist;
            }
        });
        return nearest;
    }
    
    findNearestEnemySpawner(unit) {
        let nearest = null;
        let nearestDist = Infinity;
        this.spawners.forEach(spawner => {
            if (spawner.team === unit.team) return;
            const dist = manhattanDistance(unit.x, unit.y, spawner.x, spawner.y);
            if (dist < nearestDist) {
                nearest = spawner;
                nearestDist = dist;
            }
        });
        return nearest;
    }
    
    findPath(startX, startY, endX, endY) {
        const path = [];
        const dx = endX - startX;
        const dy = endY - startY;
        const stepX = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
        const stepY = dy > 0 ? 1 : (dy < 0 ? -1 : 0);
        if (this.canMoveTo({ x: startX, y: startY, team: this.currentTeam }, startX + stepX, startY + stepY)) {
            path.push({ x: startX + stepX, y: startY + stepY });
        } else if (this.canMoveTo({ x: startX, y: startY, team: this.currentTeam }, startX + stepX, startY)) {
            path.push({ x: startX + stepX, y: startY });
        } else if (this.canMoveTo({ x: startX, y: startY, team: this.currentTeam }, startX, startY + stepY)) {
            path.push({ x: startX, y: startY + stepY });
        }
        return path;
    }
    
    updateProjectile(projectile, deltaTime) {}
    updateEffect(effect, deltaTime) {}
    
    cleanup() {
        this.units = this.units.filter(unit => unit.hp > 0);
        this.marbles = this.marbles.filter(marble => marble.y > 0 && marble.y < this.height);
        this.effects = this.effects.filter(effect => effect.ttl > 0);
    }
    
    setSocket(socket) {
        this.socket = socket;
    }
    
    setCurrentPlayer(playerId, team) {
        this.currentPlayerId = playerId;
        this.currentTeam = team;
    }
    
    getState() {
        return {
            tick: this.tick,
            elapsedTime: this.elapsedTime,
            grid: this.grid,
            walls: this.walls,
            units: this.units,
            marbles: this.marbles,
            spawners: this.spawners,
            players: this.players
        };
    }
    
    setState(state) {
        this.tick = state.tick || 0;
        this.elapsedTime = state.elapsedTime || 0;
        this.grid = state.grid || [];
        this.walls = state.walls || {};
        this.units = state.units || [];
        this.marbles = state.marbles || [];
        this.spawners = state.spawners || [];
        this.players = state.players || {};
    }
    
    on(name, callback) {
        if (this.callbacks[name]) this.callbacks[name] = callback;
    }
    
    off(name) {
        this.callbacks[name] = null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
