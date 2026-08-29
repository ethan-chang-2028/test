// ===== Game Service =====

const { getSequelize } = require('../config/database');

class GameService {
    constructor(io) {
        this.io = io;
        this.matches = new Map();
        this.players = new Map();
        this.tickRate = 1000 / 30;
        this.init();
    }
    
    init() {
        setInterval(() => this.tick(), this.tickRate);
    }
    
    tick() {
        const now = Date.now();
        for (const [matchId, match] of this.matches) {
            if (match.status !== 'in_progress') continue;
            match.tick++;
            match.elapsedTime += this.tickRate;
            this.processGameTick(match);
            this.broadcastState(matchId);
        }
    }
    
    processGameTick(match) {
        this.processUnitAI(match);
        this.processMarbles(match);
        this.checkWinConditions(match);
    }
    
    processUnitAI(match) {
        for (const unit of match.state.units) {
            if (unit.isMoving) continue;
            const enemyUnit = this.findNearestEnemy(match.state, unit);
            if (enemyUnit) {
                const dist = this.manhattanDistance(unit.x, unit.y, enemyUnit.x, enemyUnit.y);
                if (dist <= unit.attackRange) {
                    this.attackUnit(match.state, unit, enemyUnit);
                } else {
                    const path = this.findPath(match.state, unit.x, unit.y, enemyUnit.x, enemyUnit.y);
                    if (path.length > 0) this.moveUnit(match.state, unit, path[0].x, path[0].y);
                }
            }
        }
    }
    
    processMarbles(match) {
        for (let i = match.state.marbles.length - 1; i >= 0; i--) {
            const marble = match.state.marbles[i];
            const speed = marble.speed * this.tickRate / 1000;
            const angle = Math.atan2(marble.targetY - marble.y, marble.targetX - marble.x);
            marble.x += Math.cos(angle) * speed * match.gridSize * 10;
            marble.y += Math.sin(angle) * speed * match.gridSize * 10;
            const dist = Math.sqrt(Math.pow(marble.targetX - marble.x, 2) + Math.pow(marble.targetY - marble.y, 2));
            if (dist < speed * match.gridSize * 10) {
                marble.x = marble.targetX;
                marble.y = marble.targetY;
                const tileX = Math.floor(marble.x / (match.gridSize * 10));
                const tileY = Math.floor(marble.y / (match.gridSize * 10));
                this.spawnUnitFromMarble(match.state, marble, tileX, tileY);
                match.state.marbles.splice(i, 1);
            }
        }
    }
    
    checkWinConditions(match) {
        const spawners = match.state.spawners;
        const team1Spawner = spawners.find(s => s.team === 1);
        const team2Spawner = spawners.find(s => s.team === 2);
        if (team1Spawner.hp <= 0 && team2Spawner.hp <= 0) {
            this.endMatch(match.id, null);
        } else if (team1Spawner.hp <= 0) {
            this.endMatch(match.id, 2);
        } else if (team2Spawner.hp <= 0) {
            this.endMatch(match.id, 1);
        }
    }
    
    spawnUnitFromMarble(state, marble, x, y) {
        let unitType, hp, damage, count;
        switch (marble.type) {
            case 'attack': unitType = 'melee'; hp = 60; damage = 14; count = 1; break;
            case 'buff': unitType = 'buff'; hp = 50; damage = 0; count = 1; break;
            case 'split': unitType = 'melee'; hp = 25; damage = 5; count = 2; break;
            default: unitType = 'melee'; hp = 60; damage = 14; count = 1;
        }
        for (let i = 0; i < count; i++) {
            const spawnX = x + (i === 0 ? 0 : 1);
            const spawnY = y + (i === 0 ? 0 : (Math.random() > 0.5 ? 1 : -1));
            if (this.isValidTile(state.gridSize, spawnX, spawnY)) {
                const team = marble.team || 1;
                state.units.push({
                    id: `unit_${Date.now()}_${i}`,
                    type: unitType,
                    x: spawnX,
                    y: spawnY,
                    targetX: spawnX,
                    targetY: spawnY,
                    hp,
                    maxHp: hp,
                    damage,
                    speed: 100,
                    attackRange: 1,
                    team,
                    isMoving: false,
                    moveProgress: 0,
                    attackCooldown: 0,
                    lastAttack: Date.now()
                });
            }
        }
    }
    
    joinMatch(socket, matchId, factionId, loadoutId) {
        const playerId = socket.playerId;
        if (!playerId) return false;
        const match = this.matches.get(matchId);
        if (!match) return false;
        if (match.players.some(p => p.playerId === playerId)) return false;
        const team = this.assignTeam(match, playerId);
        match.players.push({ socket, playerId, factionId, loadoutId, team, joinedAt: Date.now() });
        match.teams[playerId] = team;
        socket.join(`match_${matchId}`);
        socket.emit('match_joined', { matchId, team, factionId, loadoutId });
        this.broadcastMatchUpdate(matchId, 'player_joined', { playerId, team, factionId, loadoutId });
        return true;
    }
    
    leaveMatch(socket) {
        const playerId = socket.playerId;
        if (!playerId) return false;
        for (const [matchId, match] of this.matches) {
            const index = match.players.findIndex(p => p.playerId === playerId);
            if (index > -1) {
                match.players.splice(index, 1);
                delete match.teams[playerId];
                socket.leave(`match_${matchId}`);
                this.broadcastMatchUpdate(matchId, 'player_left', { playerId });
                if (match.players.length === 0) this.matches.delete(matchId);
                return true;
            }
        }
        return false;
    }
    
    fireMarble(socket, matchId, marbleType) {
        const match = this.matches.get(matchId);
        if (!match) return false;
        const player = match.players.find(p => p.socket.id === socket.id);
        if (!player) return false;
        const cannonX = match.state.gridSize / 2;
        const cannonY = match.state.gridSize - 1;
        match.state.marbles.push({
            id: `marble_${Date.now()}`,
            type: marbleType || 'attack',
            x: cannonX * match.gridSize * 10 + match.gridSize * 10 / 2,
            y: cannonY * match.gridSize * 10 + match.gridSize * 10 / 2,
            targetX: cannonX * match.gridSize * 10 + match.gridSize * 10 / 2,
            targetY: (cannonY - 2) * match.gridSize * 10 + match.gridSize * 10 / 2,
            speed: 5,
            inTrack: false,
            team: player.team,
            createdAt: Date.now()
        });
        this.broadcastState(matchId);
        return true;
    }
    
    playCard(socket, matchId, cardId, targetX, targetY) {
        const match = this.matches.get(matchId);
        if (!match) return false;
        const player = match.players.find(p => p.socket.id === socket.id);
        if (!player) return false;
        this.broadcastMatchUpdate(matchId, 'card_played', { playerId: player.playerId, cardId, targetX, targetY });
        return true;
    }
    
    endMatch(matchId, winnerTeam) {
        const match = this.matches.get(matchId);
        if (!match) return;
        match.status = 'completed';
        match.endTime = new Date();
        match.winnerTeam = winnerTeam;
        match.players.forEach(player => {
            player.socket.emit('match_end', {
                winner: winnerTeam === player.team ? player.playerId : null,
                winnerTeam,
                matchId
            });
        });
        this.saveMatchResult(match);
        this.matches.delete(matchId);
    }
    
    async saveMatchResult(match) {
        try {
            const sequelize = getSequelize();
            const Match = sequelize.models.Match;
            await Match.update({
                status: 'completed',
                endTime: new Date(),
                winnerId: match.players.find(p => p.team === match.winnerTeam)?.playerId
            }, { where: { id: match.id } });
        } catch (error) {
            console.error('Error saving match result:', error);
        }
    }
    
    broadcastState(matchId) {
        const match = this.matches.get(matchId);
        if (!match) return;
        this.io.to(`match_${matchId}`).emit('game_state', {
            tick: match.tick,
            elapsedTime: match.elapsedTime,
            state: match.state
        });
    }
    
    broadcastMatchUpdate(matchId, event, data) {
        this.io.to(`match_${matchId}`).emit(event, data);
    }
    
    manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    }
    
    findNearestEnemy(state, unit) {
        let nearest = null;
        let nearestDist = Infinity;
        state.units.forEach(other => {
            if (other.team === unit.team) return;
            const dist = this.manhattanDistance(unit.x, unit.y, other.x, other.y);
            if (dist < nearestDist) {
                nearest = other;
                nearestDist = dist;
            }
        });
        return nearest;
    }
    
    findPath(state, startX, startY, endX, endY) {
        const path = [];
        const dx = endX - startX;
        const dy = endY - startY;
        const stepX = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
        const stepY = dy > 0 ? 1 : (dy < 0 ? -1 : 0);
        if (this.isValidTile(state.gridSize, startX + stepX, startY + stepY)) {
            path.push({ x: startX + stepX, y: startY + stepY });
        } else if (this.isValidTile(state.gridSize, startX + stepX, startY)) {
            path.push({ x: startX + stepX, y: startY });
        } else if (this.isValidTile(state.gridSize, startX, startY + stepY)) {
            path.push({ x: startX, y: startY + stepY });
        }
        return path;
    }
    
    moveUnit(state, unit, targetX, targetY) {
        unit.targetX = targetX;
        unit.targetY = targetY;
        unit.isMoving = true;
        unit.moveProgress = 0;
    }
    
    attackUnit(state, attacker, target) {
        target.hp -= attacker.damage;
        attacker.lastAttack = Date.now();
        if (target.hp <= 0) {
            const index = state.units.indexOf(target);
            if (index > -1) state.units.splice(index, 1);
        }
    }
    
    assignTeam(match, playerId) {
        const teams = Object.values(match.teams);
        const teamCounts = {};
        teams.forEach(team => teamCounts[team] = (teamCounts[team] || 0) + 1);
        const smallestTeam = Object.entries(teamCounts).reduce((a, b) => a[1] < b[1] ? a : b);
        return smallestTeam[0];
    }
    
    isValidTile(gridSize, x, y) {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
    }
    
    setEngine(engine) {
        this.engine = engine;
    }
    
    destroy() {
        this.matches.clear();
        this.players.clear();
    }
}

module.exports = GameService;
