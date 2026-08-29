// ===== Player Faction Progress Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const PlayerFactionProgress = getSequelize().define('PlayerFactionProgress', {
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
    factionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'factions', key: 'id' }
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isUnlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    unlockDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastPlayedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    matchesPlayed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    matchesWon: {
        type: DataTypes.INTEGER,
        defaultValue: 0
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
    tableName: 'player_faction_progress',
    hooks: {
        beforeUpdate: (progress) => {
            progress.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

PlayerFactionProgress.associate = (models) => {
    PlayerFactionProgress.belongsTo(models.Player, { foreignKey: 'playerId' });
    PlayerFactionProgress.belongsTo(models.Faction, { foreignKey: 'factionId' });
};

module.exports = PlayerFactionProgress;
