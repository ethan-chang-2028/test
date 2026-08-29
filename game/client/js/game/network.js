// ===== Network Manager =====

class NetworkManager {
    constructor() {
        this.socket = null;
        this.engine = null;
        this.playerId = null;
        this.matchId = null;
        this.team = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.matchState = null;
        this.players = {};
        this.callbacks = {
            onConnect: null,
            onDisconnect: null,
            onMatchFound: null,
            onMatchStart: null,
            onMatchEnd: null,
            onMatchUpdate: null,
            onPlayerJoin: null,
            onPlayerLeave: null,
            onChatMessage: null,
            onError: null
        };
        this.init();
    }
    
    init() {
        this.setupSocket();
    }
    
    setupSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const socketUrl = `${protocol}//${host}`;
        console.log('Connecting to WebSocket:', socketUrl);
        this.socket = new WebSocket(socketUrl);
        this.isConnecting = true;
        this.socket.addEventListener('open', () => this.handleOpen());
        this.socket.addEventListener('close', (e) => this.handleClose(e));
        this.socket.addEventListener('error', (e) => this.handleError(e));
        this.socket.addEventListener('message', (e) => this.handleMessage(e));
    }
    
    handleOpen() {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        if (this.callbacks.onConnect) this.callbacks.onConnect();
        const token = getToken();
        if (token) this.authenticate(token);
    }
    
    handleClose(e) {
        console.log('WebSocket disconnected:', e.code, e.reason);
        this.isConnected = false;
        this.isConnecting = false;
        if (this.callbacks.onDisconnect) this.callbacks.onDisconnect(e);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this.setupSocket(), this.reconnectDelay * this.reconnectAttempts);
        }
    }
    
    handleError(e) {
        console.error('WebSocket error:', e);
        if (this.callbacks.onError) this.callbacks.onError(e);
    }
    
    handleMessage(e) {
        try {
            const data = JSON.parse(e.data);
            console.log('Received message:', data.type);
            this.handleEvent(data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }
    
    handleEvent(data) {
        switch (data.type) {
            case 'connect': this.handleConnect(data); break;
            case 'disconnect': this.handleDisconnect(data); break;
            case CONFIG.SOCKET_EVENTS.QUEUE_MATCH_FOUND: this.handleMatchFound(data); break;
            case CONFIG.SOCKET_EVENTS.MATCH_START: this.handleMatchStart(data); break;
            case CONFIG.SOCKET_EVENTS.MATCH_END: this.handleMatchEnd(data); break;
            case CONFIG.SOCKET_EVENTS.MATCH_TICK: this.handleMatchTick(data); break;
            case CONFIG.SOCKET_EVENTS.GAME_STATE: this.handleGameState(data); break;
            case CONFIG.SOCKET_EVENTS.GAME_UPDATE: this.handleGameUpdate(data); break;
            case CONFIG.SOCKET_EVENTS.CHAT_MESSAGE: this.handleChatMessage(data); break;
            default: console.log('Unhandled event:', data.type);
        }
    }
    
    handleConnect(data) {
        console.log('Connected to server');
        this.isConnected = true;
        if (this.callbacks.onConnect) this.callbacks.onConnect(data);
    }
    
    handleDisconnect(data) {
        console.log('Disconnected from server');
        this.isConnected = false;
        if (this.callbacks.onDisconnect) this.callbacks.onDisconnect(data);
    }
    
    handleMatchFound(data) {
        console.log('Match found:', data);
        this.matchId = data.matchId;
        this.team = data.team;
        if (this.callbacks.onMatchFound) this.callbacks.onMatchFound(data);
    }
    
    handleMatchStart(data) {
        console.log('Match started:', data);
        this.matchId = data.matchId;
        this.matchState = data.state;
        this.players = data.players || {};
        if (this.engine) {
            this.engine.setState(data.state);
            this.engine.setCurrentPlayer(this.playerId, this.team);
        }
        if (this.callbacks.onMatchStart) this.callbacks.onMatchStart(data);
    }
    
    handleMatchEnd(data) {
        console.log('Match ended:', data);
        this.matchId = null;
        this.matchState = null;
        if (this.callbacks.onMatchEnd) this.callbacks.onMatchEnd(data);
    }
    
    handleMatchTick(data) {
        if (this.engine) {
            this.engine.tick = data.tick;
            this.engine.elapsedTime = data.elapsedTime;
        }
        if (this.callbacks.onMatchUpdate) this.callbacks.onMatchUpdate(data);
    }
    
    handleGameState(data) {
        console.log('Game state received:', data);
        if (this.engine) this.engine.setState(data.state);
        if (this.callbacks.onMatchUpdate) this.callbacks.onMatchUpdate(data);
    }
    
    handleGameUpdate(data) {
        if (this.engine) {
            if (data.units) this.engine.units = data.units;
            if (data.marbles) this.engine.marbles = data.marbles;
            if (data.walls) this.engine.walls = data.walls;
            if (data.spawners) this.engine.spawners = data.spawners;
        }
        if (this.callbacks.onMatchUpdate) this.callbacks.onMatchUpdate(data);
    }
    
    handleChatMessage(data) {
        console.log('Chat message:', data);
        if (this.callbacks.onChatMessage) this.callbacks.onChatMessage(data);
    }
    
    authenticate(token) {
        if (!this.isConnected) return false;
        this.send({ type: 'auth', token });
        return true;
    }
    
    joinQueue(mode, factionId, loadoutId) {
        if (!this.isConnected) return false;
        this.send({ type: CONFIG.SOCKET_EVENTS.QUEUE_JOIN, mode, factionId, loadoutId });
        return true;
    }
    
    leaveQueue() {
        if (!this.isConnected) return false;
        this.send({ type: CONFIG.SOCKET_EVENTS.QUEUE_LEAVE });
        return true;
    }
    
    joinMatch(matchId, factionId, loadoutId) {
        if (!this.isConnected) return false;
        this.send({ type: CONFIG.SOCKET_EVENTS.MATCH_JOIN, matchId, factionId, loadoutId });
        return true;
    }
    
    leaveMatch() {
        if (!this.isConnected) return false;
        this.send({ type: CONFIG.SOCKET_EVENTS.MATCH_LEAVE });
        this.matchId = null;
        this.matchState = null;
        return true;
    }
    
    fireMarble(type) {
        if (!this.isConnected || !this.matchId) return false;
        this.send({ type: CONFIG.SOCKET_EVENTS.MARBLE_FIRE, matchId: this.matchId, marbleType: type });
        return true;
    }
    
    playCard(cardId, targetX, targetY) {
        if (!this.isConnected || !this.matchId) return false;
        this.send({ type: CONFIG.SOCKET_EVENTS.CARD_PLAY, matchId: this.matchId, cardId, targetX, targetY });
        return true;
    }
    
    sendChatMessage(message) {
        if (!this.isConnected || !this.matchId) return false;
        this.send({ type: CONFIG.SOCKET_EVENTS.CHAT_SEND, matchId: this.matchId, message });
        return true;
    }
    
    send(data) {
        if (!this.isConnected || !this.socket) return false;
        try {
            this.socket.send(JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }
    
    setEngine(engine) {
        this.engine = engine;
    }
    
    setPlayerId(playerId) {
        this.playerId = playerId;
    }
    
    on(name, callback) {
        if (this.callbacks[name]) this.callbacks[name] = callback;
    }
    
    off(name) {
        this.callbacks[name] = null;
    }
    
    disconnect() {
        if (this.socket) this.socket.close();
        this.isConnected = false;
        this.isConnecting = false;
    }
    
    destroy() {
        this.disconnect();
        if (this.socket) {
            this.socket.removeEventListener('open', this.handleOpen);
            this.socket.removeEventListener('close', this.handleClose);
            this.socket.removeEventListener('error', this.handleError);
            this.socket.removeEventListener('message', this.handleMessage);
        }
    }
}

const network = new NetworkManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NetworkManager, network };
}
