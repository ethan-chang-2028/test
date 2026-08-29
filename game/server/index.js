// ===== Server Entry Point =====

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const gameRoutes = require('./routes/game');
const errorHandler = require('./middleware/error');
const { authenticate } = require('./middleware/auth');
const { initDatabase } = require('./config/database');
const MatchmakingService = require('./services/matchmaking');
const GameService = require('./services/game');
const AICoachService = require('./services/ai');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// ===== Configuration =====

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ===== Middleware =====

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ===== Database =====

initDatabase().then(() => {
    console.log('Database connected successfully');
}).catch(err => {
    console.error('Database connection error:', err);
});

// ===== Services =====

const matchmakingService = new MatchmakingService();
const gameService = new GameService(io);
const aiCoachService = new AICoachService();

// ===== Socket.IO =====

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('auth', (data) => {
        socket.playerId = data.playerId;
        socket.join(`player_${data.playerId}`);
    });
    socket.on('join_queue', (data) => {
        matchmakingService.addToQueue(socket, data.mode, data.factionId, data.loadoutId);
    });
    socket.on('leave_queue', () => {
        matchmakingService.removeFromQueue(socket);
    });
    socket.on('join_match', (data) => {
        gameService.joinMatch(socket, data.matchId, data.factionId, data.loadoutId);
    });
    socket.on('leave_match', () => {
        gameService.leaveMatch(socket);
    });
    socket.on('marble_fire', (data) => {
        gameService.fireMarble(socket, data.matchId, data.marbleType);
    });
    socket.on('card_play', (data) => {
        gameService.playCard(socket, data.matchId, data.cardId, data.targetX, data.targetY);
    });
    socket.on('disconnect', () => {
        matchmakingService.removeFromQueue(socket);
        gameService.leaveMatch(socket);
        console.log('Client disconnected:', socket.id);
    });
});

// ===== Routes =====

app.use('/api/auth', authRoutes);
app.use('/api', authenticate, apiRoutes);
app.use('/api/game', authenticate, gameRoutes);

// ===== Static Files =====

app.use(express.static(path.join(__dirname, '../client')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ===== Error Handling =====

app.use(errorHandler);

// ===== Server Start =====

server.listen(PORT, () => {
    console.log(`Paint Battle server running in ${NODE_ENV} mode on port ${PORT}`);
    console.log(`Server URL: http://localhost:${PORT}`);
});

// ===== Graceful Shutdown =====

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
});

module.exports = { app, server, io };
