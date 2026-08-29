// ===== Matchmaking Service =====

const crypto = require('crypto');
const { getSequelize } = require('../config/database');

class MatchmakingService {
    constructor() {
        this.queue = new Map();
        this.matches = new Map();
        this.waitingPlayers = new Map();
        this.MATCH_TIMEOUT = 300000;
        this.QUEUE_TIMEOUT = 60000;
        this.init();
    }
    
    init() {
        setInterval(() => this.checkTimeouts(), 10000);
    }
    
    addToQueue(socket, mode, factionId, loadoutId) {
        const playerId = socket.playerId;
        if (!playerId) return false;
        const queueKey = `${mode}`;
        if (!this.queue.has(queueKey)) this.queue.set(queueKey, []);
        const queue = this.queue.get(queueKey);
        const existing = queue.find(p => p.playerId === playerId);
        if (existing) return false;
        queue.push({ socket, playerId, mode, factionId, loadoutId, joinedAt: Date.now() });
        this.waitingPlayers.set(playerId, { socket, mode, factionId, loadoutId, joinedAt: Date.now() });
        console.log(`Player ${playerId} joined ${mode} queue`);
        this.tryMatch(queueKey);
        return true;
    }
    
    removeFromQueue(socket) {
        const playerId = socket.playerId;
        if (!playerId) return false;
        for (const [key, queue] of this.queue) {
            const index = queue.findIndex(p => p.playerId === playerId);
            if (index > -1) {
                queue.splice(index, 1);
                this.waitingPlayers.delete(playerId);
                console.log(`Player ${playerId} left queue`);
                return true;
            }
        }
        return false;
    }
    
    tryMatch(queueKey) {
        const queue = this.queue.get(queueKey);
        if (!queue || queue.length < 2) return;
        const mode = queue[0].mode;
        const requiredPlayers = this.getRequiredPlayers(mode);
        if (queue.length < requiredPlayers) return;
        const players = queue.splice(0, requiredPlayers);
        this.queue.set(queueKey, queue);
        const matchId = crypto.randomBytes(16).toString('hex');
        const teams = this.assignTeams(players, mode);
        const matchData = {
            id: matchId,
            mode,
            isRanked: false,
            status: 'starting',
            createdAt: new Date()
        };
        this.matches.set(matchId, { matchData, players, teams, startedAt: Date.now() });
        players.forEach((player, index) => {
            player.socket.emit('match_found', {
                matchId,
                team: teams[index],
                mode,
                players: players.map(p => p.playerId)
            });
            this.waitingPlayers.delete(player.playerId);
        });
        setTimeout(() => this.startMatch(matchId), 5000);
    }
    
    startMatch(matchId) {
        const match = this.matches.get(matchId);
        if (!match) return;
        match.matchData.status = 'in_progress';
        match.matchData.startTime = new Date();
        const playersData = match.players.map(p => ({
            playerId: p.playerId,
            team: match.teams[p.playerId],
            factionId: p.factionId,
            loadoutId: p.loadoutId
        }));
        match.players.forEach(player => {
            player.socket.emit('match_start', {
                matchId,
                state: this.createInitialState(match, player.playerId),
                players: playersData,
                team: match.teams[player.playerId]
            });
        });
    }
    
    createInitialState(match, playerId) {
        const team = match.teams[playerId];
        const gridSize = 5;
        const walls = {};
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (x < gridSize - 1) walls[`${x}_${y}_right`] = { x, y, direction: 'right', hp: 100, owner: null };
                if (y < gridSize - 1) walls[`${x}_${y}_bottom`] = { x, y, direction: 'bottom', hp: 100, owner: null };
            }
        }
        const spawners = [
            { id: 'spawner_1', x: 0, y: 0, hp: 500, team: 1 },
            { id: 'spawner_2', x: gridSize - 1, y: gridSize - 1, hp: 500, team: 2 }
        ];
        return {
            tick: 0,
            elapsedTime: 0,
            gridSize,
            walls,
            spawners,
            units: [],
            marbles: [],
            players: match.players.reduce((acc, p) => {
                acc[p.playerId] = { team: match.teams[p.playerId], factionId: p.factionId };
                return acc;
            }, {})
        };
    }
    
    getRequiredPlayers(mode) {
        switch (mode) {
            case '1v1': return 2;
            case '2v2': return 4;
            case '3v3': return 6;
            case '4v4': return 8;
            case 'ffa': return 4;
            default: return 2;
        }
    }
    
    assignTeams(players, mode) {
        const teams = {};
        if (mode === 'ffa') {
            players.forEach((p, i) => teams[p.playerId] = i + 1);
        } else {
            const teamSize = this.getRequiredPlayers(mode) / 2;
            players.forEach((p, i) => {
                teams[p.playerId] = Math.floor(i / teamSize) + 1;
            });
        }
        return teams;
    }
    
    checkTimeouts() {
        const now = Date.now();
        for (const [playerId, data] of this.waitingPlayers) {
            if (now - data.joinedAt > this.QUEUE_TIMEOUT) {
                data.socket.emit('queue_timeout', { message: 'Queue timeout' });
                this.waitingPlayers.delete(playerId);
            }
        }
        for (const [matchId, match] of this.matches) {
            if (match.status === 'starting' && now - match.startedAt > this.MATCH_TIMEOUT) {
                match.players.forEach(p => {
                    p.socket.emit('match_timeout', { message: 'Match start timeout' });
                });
                this.matches.delete(matchId);
            }
        }
    }
    
    getQueueSize(mode) {
        const queue = this.queue.get(mode);
        return queue ? queue.length : 0;
    }
    
    getMatch(matchId) {
        return this.matches.get(matchId);
    }
    
    destroy() {
        this.queue.clear();
        this.matches.clear();
        this.waitingPlayers.clear();
    }
}

module.exports = MatchmakingService;
