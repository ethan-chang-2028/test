// ===== Game Routes =====

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/error');
const { getSequelize } = require('../config/database');

router.post('/start', asyncHandler(async (req, res) => {
    const { matchId } = req.body;
    const sequelize = getSequelize();
    const Match = sequelize.models.Match;
    const match = await Match.findByPk(matchId);
    if (!match) throw new Error('Match not found');
    if (match.status !== 'waiting') throw new Error('Match already started');
    await Match.update({ status: 'in_progress', startTime: new Date() }, { where: { id: matchId } });
    res.json({ success: true, message: 'Match started' });
}));

router.post('/end', asyncHandler(async (req, res) => {
    const { matchId, winnerId } = req.body;
    const sequelize = getSequelize();
    const Match = sequelize.models.Match;
    const MatchPlayer = sequelize.models.MatchPlayer;
    const PlayerStats = sequelize.models.PlayerStats;
    const match = await Match.findByPk(matchId);
    if (!match) throw new Error('Match not found');
    await Match.update({ status: 'completed', endTime: new Date(), winnerId }, { where: { id: matchId } });
    const players = await MatchPlayer.findAll({ where: { matchId } });
    for (const player of players) {
        const isWinner = player.playerId === winnerId;
        const stats = await PlayerStats.findOne({ where: { playerId: player.playerId } });
        if (!stats) {
            await PlayerStats.create({
                playerId: player.playerId,
                matches: 1,
                wins: isWinner ? 1 : 0,
                losses: isWinner ? 0 : 1,
                totalKills: player.kills,
                totalDeaths: player.deaths,
                totalDamageDealt: player.damageDealt,
                totalDamageTaken: player.damageTaken,
                totalGold: player.goldEarned
            });
        } else {
            const currentStreak = isWinner ? stats.currentWinStreak + 1 : 0;
            const longestStreak = Math.max(stats.longestWinStreak, currentStreak);
            await PlayerStats.update({
                matches: stats.matches + 1,
                wins: isWinner ? stats.wins + 1 : stats.wins,
                losses: isWinner ? stats.losses : stats.losses + 1,
                totalKills: stats.totalKills + player.kills,
                totalDeaths: stats.totalDeaths + player.deaths,
                totalDamageDealt: stats.totalDamageDealt + player.damageDealt,
                totalDamageTaken: stats.totalDamageTaken + player.damageTaken,
                totalGold: stats.totalGold + player.goldEarned,
                currentWinStreak: currentStreak,
                longestWinStreak: longestStreak
            }, { where: { playerId: player.playerId } });
        }
    }
    res.json({ success: true, message: 'Match ended' });
}));

router.get('/state/:matchId', asyncHandler(async (req, res) => {
    const { matchId } = req.params;
    const sequelize = getSequelize();
    const Match = sequelize.models.Match;
    const MatchPlayer = sequelize.models.MatchPlayer;
    const MatchUnit = sequelize.models.MatchUnit;
    const MatchMarble = sequelize.models.MatchMarble;
    const match = await Match.findByPk(matchId);
    if (!match) throw new Error('Match not found');
    const players = await MatchPlayer.findAll({ where: { matchId } });
    const units = await MatchUnit.findAll({ where: { matchId } });
    const marbles = await MatchMarble.findAll({ where: { matchId } });
    res.json({
        match,
        players,
        units,
        marbles
    });
}));

router.post('/action', asyncHandler(async (req, res) => {
    const { matchId, actionType, data } = req.body;
    const sequelize = getSequelize();
    const Match = sequelize.models.Match;
    const match = await Match.findByPk(matchId);
    if (!match) throw new Error('Match not found');
    if (match.status !== 'in_progress') throw new Error('Match not in progress');
    res.json({ success: true, message: 'Action recorded' });
}));

module.exports = router;
