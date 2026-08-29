// ===== Authentication Middleware =====

const jwt = require('jsonwebtoken');
const { getSequelize } = require('../config/database');
const { JWT_SECRET, JWT_EXPIRY, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRY } = process.env;

const DEFAULT_JWT_SECRET = 'paint-battle-secret-key-change-me';
const DEFAULT_JWT_EXPIRY = '15m';
const DEFAULT_REFRESH_SECRET = 'paint-battle-refresh-secret-change-me';
const DEFAULT_REFRESH_EXPIRY = '7d';

const secret = JWT_SECRET || DEFAULT_JWT_SECRET;
const expiry = JWT_EXPIRY || DEFAULT_JWT_EXPIRY;
const refreshSecret = JWT_REFRESH_SECRET || DEFAULT_REFRESH_SECRET;
const refreshExpiry = JWT_REFRESH_EXPIRY || DEFAULT_REFRESH_EXPIRY;

async function authenticate(req, res, next) {
    try {
        const token = getToken(req);
        if (!token) return res.status(401).json({ error: 'No token provided' });
        const decoded = jwt.verify(token, secret);
        const sequelize = getSequelize();
        const Player = sequelize.models.Player;
        const player = await Player.findByPk(decoded.id);
        if (!player) return res.status(401).json({ error: 'Player not found' });
        req.player = player;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired', expired: true });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('Authentication error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
}

function getToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return req.cookies?.token || req.body?.token || req.query?.token;
}

function generateToken(player, isRefresh = false) {
    const payload = {
        id: player.id,
        email: player.email,
        username: player.username
    };
    const options = { expiresIn: isRefresh ? refreshExpiry : expiry };
    return jwt.sign(payload, isRefresh ? refreshSecret : secret, options);
}

function generateTokens(player) {
    const token = generateToken(player);
    const refreshToken = generateToken(player, true);
    return { token, refreshToken };
}

function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, refreshSecret);
    } catch (error) {
        return null;
    }
}

function optionalAuth(req, res, next) {
    const token = getToken(req);
    if (!token) return next();
    authenticate(req, res, () => next());
}

function adminAuth(req, res, next) {
    authenticate(req, res, () => {
        if (!req.player || !req.player.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    });
}

module.exports = {
    authenticate,
    optionalAuth,
    adminAuth,
    generateToken,
    generateTokens,
    verifyRefreshToken,
    getToken,
    secret,
    expiry,
    refreshSecret,
    refreshExpiry
};
