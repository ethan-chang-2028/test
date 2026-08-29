// ===== Match Marble Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const MatchMarble = getSequelize().define('MatchMarble', {
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
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'cards', key: 'id' }
    },
    marbleType: {
        type: DataTypes.ENUM('attack', 'buff', 'split'),
        allowNull: false,
        defaultValue: 'attack'
    },
    team: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    x: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    y: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    targetX: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    targetY: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    speed: {
        type: DataTypes.FLOAT,
        defaultValue: 5
    },
    inTrack: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'match_marbles',
    hooks: {
        beforeUpdate: (matchMarble) => {
            matchMarble.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

MatchMarble.associate = (models) => {
    MatchMarble.belongsTo(models.Match, { foreignKey: 'matchId' });
    MatchMarble.belongsTo(models.Player, { foreignKey: 'playerId' });
    MatchMarble.belongsTo(models.Card, { foreignKey: 'cardId' });
};

module.exports = MatchMarble;
