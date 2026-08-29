// ===== Player Stats Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const PlayerStats = getSequelize().define('PlayerStats', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    playerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'id' }
    },
    matches: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    wins: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    losses: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalGold: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalPremium: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalKills: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalDeaths: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalDamageDealt: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalDamageTaken: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    longestWinStreak: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    currentWinStreak: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    highestRating: {
        type: DataTypes.INTEGER,
        defaultValue: 1000
    },
    currentRating: {
        type: DataTypes.INTEGER,
        defaultValue: 1000
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'player_stats',
    hooks: {
        beforeUpdate: (stats) => {
            stats.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

PlayerStats.associate = (models) => {
    PlayerStats.belongsTo(models.Player, { foreignKey: 'playerId' });
};

module.exports = PlayerStats;
