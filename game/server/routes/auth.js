// ===== Auth Routes =====

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { generateTokens, generateToken, verifyRefreshToken } = require('../middleware/auth');
const { asyncHandler, BadRequestError, UnauthorizedError } = require('../middleware/error');
const { getSequelize } = require('../config/database');

router.post('/register', asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        throw new BadRequestError('Username, email, and password are required');
    }
    const sequelize = getSequelize();
    const Player = sequelize.models.Player;
    const existingPlayer = await Player.findOne({ where: { email } });
    if (existingPlayer) throw new BadRequestError('Email already registered');
    const existingUsername = await Player.findOne({ where: { username } });
    if (existingUsername) throw new BadRequestError('Username already taken');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const player = await Player.create({
        username,
        email,
        passwordHash,
        passwordSalt: salt
    });
    const tokens = generateTokens(player);
    res.cookie('token', tokens.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ token: tokens.token, refreshToken: tokens.refreshToken, player: formatPlayer(player) });
}));

router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new BadRequestError('Email and password are required');
    const sequelize = getSequelize();
    const Player = sequelize.models.Player;
    const player = await Player.findOne({ where: { email } });
    if (!player) throw new UnauthorizedError('Invalid credentials');
    const isValid = await bcrypt.compare(password, player.passwordHash);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');
    const tokens = generateTokens(player);
    await Player.update({ lastLoginAt: new Date() }, { where: { id: player.id } });
    res.cookie('token', tokens.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ token: tokens.token, refreshToken: tokens.refreshToken, player: formatPlayer(player) });
}));

router.post('/logout', asyncHandler(async (req, res) => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) throw new UnauthorizedError('No refresh token provided');
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) throw new UnauthorizedError('Invalid refresh token');
    const sequelize = getSequelize();
    const Player = sequelize.models.Player;
    const player = await Player.findByPk(decoded.id);
    if (!player) throw new UnauthorizedError('Player not found');
    const token = generateToken(player);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ token, player: formatPlayer(player) });
}));

router.post('/forgot-password', asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new BadRequestError('Email is required');
    const sequelize = getSequelize();
    const Player = sequelize.models.Player;
    const player = await Player.findOne({ where: { email } });
    if (!player) {
        await sleep(1000);
        return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000);
    await Player.update({
        passwordResetToken: resetToken,
        passwordResetExpiresAt: resetExpires
    }, { where: { id: player.id } });
    res.json({ success: true, message: 'Password reset link sent' });
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) throw new BadRequestError('Token and password are required');
    const sequelize = getSequelize();
    const Player = sequelize.models.Player;
    const player = await Player.findOne({
        where: { passwordResetToken: token, passwordResetExpiresAt: { [Op.gt]: new Date() } }
    });
    if (!player) throw new UnauthorizedError('Invalid or expired token');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await Player.update({
        passwordHash,
        passwordSalt: salt,
        passwordResetToken: null,
        passwordResetExpiresAt: null
    }, { where: { id: player.id } });
    res.json({ success: true, message: 'Password reset successfully' });
}));

function formatPlayer(player) {
    return {
        id: player.id,
        username: player.username,
        email: player.email,
        globalLevel: player.globalLevel,
        globalXP: player.globalXP,
        metaGold: player.metaGold,
        premiumCurrency: player.premiumCurrency,
        factionId: player.factionId,
        isAdmin: player.isAdmin,
        emailVerified: player.emailVerified,
        lastLoginAt: player.lastLoginAt
    };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = router;
