// ===== AI Coach Service =====

const { getSequelize } = require('../config/database');

class AICoachService {
    constructor() {
        this.feedbackEnabled = true;
    }
    
    async generateMatchReport(matchId, playerId) {
        try {
            const sequelize = getSequelize();
            const Match = sequelize.models.Match;
            const MatchPlayer = sequelize.models.MatchPlayer;
            const MatchUnit = sequelize.models.MatchUnit;
            const MatchMarble = sequelize.models.MatchMarble;
            const AIReport = sequelize.models.AIReport;
            const Player = sequelize.models.Player;
            const match = await Match.findByPk(matchId);
            if (!match) throw new Error('Match not found');
            const player = await Player.findByPk(playerId);
            if (!player) throw new Error('Player not found');
            const matchPlayer = await MatchPlayer.findOne({ where: { matchId, playerId } });
            if (!matchPlayer) throw new Error('Match player data not found');
            const units = await MatchUnit.findAll({ where: { matchId, playerId } });
            const marbles = await MatchMarble.findAll({ where: { matchId, playerId } });
            const isWinner = match.winnerId === playerId;
            const report = this.analyzeMatch(match, matchPlayer, units, marbles, isWinner);
            const aiReport = await AIReport.create({
                matchId,
                playerId,
                title: this.generateTitle(isWinner, match.mode),
                overallRating: this.calculateRating(isWinner, matchPlayer, units),
                overallFeedback: report.overallFeedback,
                strengths: report.strengths,
                weaknesses: report.weaknesses,
                tips: report.tips,
                detailedAnalysis: report.detailedAnalysis,
                factionId: matchPlayer.factionId,
                loadoutId: matchPlayer.loadoutId
            });
            return aiReport;
        } catch (error) {
            console.error('Error generating AI report:', error);
            return null;
        }
    }
    
    analyzeMatch(match, matchPlayer, units, marbles, isWinner) {
        const analysis = {
            kills: matchPlayer.kills,
            deaths: matchPlayer.deaths,
            damageDealt: matchPlayer.damageDealt,
            damageTaken: matchPlayer.damageTaken,
            goldEarned: matchPlayer.goldEarned,
            unitsSpawned: units.length,
            marblesFired: marbles.length,
            matchDuration: match.endTime ? (new Date(match.endTime) - new Date(match.startTime)) / 1000 : 0
        };
        const kda = this.calculateKDA(analysis);
        const efficiency = this.calculateEfficiency(analysis);
        return {
            overallFeedback: this.generateOverallFeedback(isWinner, kda, efficiency),
            strengths: this.generateStrengths(analysis, isWinner),
            weaknesses: this.generateWeaknesses(analysis, isWinner),
            tips: this.generateTips(analysis, isWinner),
            detailedAnalysis: analysis
        };
    }
    
    calculateKDA(analysis) {
        if (analysis.deaths === 0) return analysis.kills;
        return (analysis.kills + analysis.assists || 0) / analysis.deaths;
    }
    
    calculateEfficiency(analysis) {
        if (analysis.unitsSpawned === 0) return 0;
        return (analysis.kills + analysis.damageDealt / 100) / analysis.unitsSpawned;
    }
    
    generateTitle(isWinner, mode) {
        const titles = {
            win: [
                'Dominant Victory',
                'Tactical Brilliance',
                'Overwhelming Force',
                'Perfect Execution',
                'Unstoppable Momentum',
                'Flawless Strategy'
            ],
            loss: [
                'Tough Loss',
                'Learning Opportunity',
                'Close Battle',
                'Valiant Effort',
                'Hard Fought',
                'Room for Improvement'
            ]
        };
        const list = isWinner ? titles.win : titles.loss;
        return list[Math.floor(Math.random() * list.length)];
    }
    
    calculateRating(isWinner, matchPlayer, units) {
        let rating = 'C';
        const kda = this.calculateKDA(matchPlayer);
        const efficiency = this.calculateEfficiency({
            kills: matchPlayer.kills,
            deaths: matchPlayer.deaths,
            damageDealt: matchPlayer.damageDealt,
            unitsSpawned: units.length
        });
        if (kda >= 5 && efficiency >= 2) rating = 'S';
        else if (kda >= 3 && efficiency >= 1.5) rating = 'A';
        else if (kda >= 2 && efficiency >= 1) rating = 'B';
        else if (kda >= 1 && efficiency >= 0.5) rating = 'C';
        else rating = 'D';
        if (isWinner && rating !== 'S') rating = String.fromCharCode(rating.charCodeAt(0) - 1);
        if (!isWinner && rating !== 'D') rating = String.fromCharCode(rating.charCodeAt(0) + 1);
        return rating;
    }
    
    generateOverallFeedback(isWinner, kda, efficiency) {
        const feedbacks = {
            win: [
                `Excellent performance! Your KDA of ${kda.toFixed(2)} and efficiency of ${efficiency.toFixed(2)} show great strategic thinking.`,
                `Impressive victory! You dominated the battlefield with smart unit placement and timing.`,
                `Great job! Your ability to ${kda >= 3 ? 'maintain pressure' : 'hold your ground'} was key to this win.`,
                `Well played! Your marble firing strategy and unit management led to a convincing victory.`
            ],
            loss: [
                `Good effort, but there's room for improvement. Focus on ${kda < 1 ? 'reducing deaths' : 'increasing your damage output'}.`,
                `Tough match. Try to ${efficiency < 1 ? 'improve your unit efficiency' : 'better coordinate your attacks'} next time.`,
                `You put up a fight! Work on ${kda < 1.5 ? 'better positioning' : 'more aggressive play'} to turn the tide.`,
                `Close battle! With some adjustments to your strategy, you can come out on top next time.`
            ]
        };
        const list = isWinner ? feedbacks.win : feedbacks.loss;
        return list[Math.floor(Math.random() * list.length)]
            .replace('${kda}', kda.toFixed(2))
            .replace('${efficiency}', efficiency.toFixed(2));
    }
    
    generateStrengths(analysis, isWinner) {
        const strengths = [];
        if (analysis.kills >= 5) strengths.push('High kill count - excellent at eliminating enemies');
        if (analysis.damageDealt >= 500) strengths.push('High damage output - great at dealing damage');
        if (analysis.deaths <= 2) strengths.push('Low deaths - good at preserving your units');
        if (analysis.goldEarned >= 200) strengths.push('High gold earned - efficient resource management');
        if (analysis.unitsSpawned >= 10) strengths.push('High unit production - good marble firing rate');
        if (analysis.kills / Math.max(analysis.deaths, 1) >= 3) strengths.push('Excellent KDA ratio - very efficient combat');
        if (strengths.length === 0) {
            if (isWinner) strengths.push('Won the match - ultimately effective strategy');
            else strengths.push('Stayed competitive - kept the match close');
        }
        return strengths.slice(0, 3);
    }
    
    generateWeaknesses(analysis, isWinner) {
        const weaknesses = [];
        if (analysis.kills < 3) weaknesses.push('Low kill count - need to focus on eliminating enemies');
        if (analysis.damageDealt < 200) weaknesses.push('Low damage output - need to deal more damage');
        if (analysis.deaths >= 5) weaknesses.push('High deaths - need to preserve your units better');
        if (analysis.goldEarned < 100) weaknesses.push('Low gold earned - need to improve resource gathering');
        if (analysis.unitsSpawned < 5) weaknesses.push('Low unit production - need to fire marbles more frequently');
        if (analysis.kills / Math.max(analysis.deaths, 1) < 1) weaknesses.push('Low KDA ratio - dying too often for the kills you get');
        if (weaknesses.length === 0) {
            if (isWinner) weaknesses.push('Minor positioning issues - could be slightly more efficient');
            else weaknesses.push('Needs strategic improvement - work on overall game plan');
        }
        return weaknesses.slice(0, 3);
    }
    
    generateTips(analysis, isWinner) {
        const tips = [];
        if (analysis.deaths >= 5) tips.push('Try to keep your units at a safe distance from enemy spawners');
        if (analysis.damageDealt < 200) tips.push('Focus on upgrading your damage-dealing units');
        if (analysis.kills < 3) tips.push('Try to surround enemy units for more efficient kills');
        if (analysis.goldEarned < 100) tips.push('Make sure to claim walls for bonus gold');
        if (analysis.unitsSpawned < 5) tips.push('Fire marbles more frequently to maintain pressure');
        if (analysis.matchDuration > 300) tips.push('Try to end matches faster with more aggressive play');
        if (tips.length === 0) {
            if (isWinner) tips.push('Keep up the good work! Try experimenting with different loadouts');
            else tips.push('Watch replays of winning players to learn new strategies');
        }
        return tips.slice(0, 3);
    }
    
    async updateAISettings(playerId, settings) {
        try {
            const sequelize = getSequelize();
            const Player = sequelize.models.Player;
            await Player.update({ aiFeedbackEnabled: settings.aiFeedbackEnabled }, { where: { id: playerId } });
            return { success: true };
        } catch (error) {
            console.error('Error updating AI settings:', error);
            return { success: false, error: error.message };
        }
    }
    
    async getAIReport(matchId, playerId) {
        try {
            const sequelize = getSequelize();
            const AIReport = sequelize.models.AIReport;
            const report = await AIReport.findOne({ where: { matchId, playerId } });
            if (!report) return null;
            return report;
        } catch (error) {
            console.error('Error getting AI report:', error);
            return null;
        }
    }
    
    async generateReportsForMatch(matchId) {
        try {
            const sequelize = getSequelize();
            const Match = sequelize.models.Match;
            const MatchPlayer = sequelize.models.MatchPlayer;
            const match = await Match.findByPk(matchId);
            if (!match) return [];
            const players = await MatchPlayer.findAll({ where: { matchId } });
            const reports = [];
            for (const player of players) {
                const report = await this.generateMatchReport(matchId, player.playerId);
                if (report) reports.push(report);
            }
            return reports;
        } catch (error) {
            console.error('Error generating reports for match:', error);
            return [];
        }
    }
    
    destroy() {
        this.feedbackEnabled = false;
    }
}

module.exports = AICoachService;
