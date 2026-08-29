// ===== Match Player Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const MatchPlayer = getSequelize().define('MatchPlayer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    matchId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: { model: 'matches', key: 'id' }
    },
    playerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'id' }
    },
    team: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    factionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'factions', key: 'id' }
    },
    loadoutId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'loadouts', key: 'id' }
    },
    isReady: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    hasLeft: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    disconnectedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reconnectedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    kills: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    deaths: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    damageDealt: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    damageTaken: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    goldEarned: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ratingChange: {
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
    tableName: 'match_players',
    hooks: {
        beforeUpdate: (matchPlayer) => {
            matchPlayer.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

MatchPlayer.associate = (models) => {
    MatchPlayer.belongsTo(models.Match, { foreignKey: 'matchId' });
    MatchPlayer.belongsTo(models.Player, { foreignKey: 'playerId' });
    MatchPlayer.belongsTo(models.Faction, { foreignKey: 'factionId' });
    MatchPlayer.belongsTo(models.Loadout, { foreignKey: 'loadoutId' });
};

module.exports = MatchPlayer;
