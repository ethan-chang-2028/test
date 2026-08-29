// ===== Match Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const Match = getSequelize().define('Match', {
    id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    mode: {
        type: DataTypes.ENUM('1v1', '2v2', '3v3', '4v4', 'ffa'),
        allowNull: false,
        defaultValue: '1v1'
    },
    isRanked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.ENUM('waiting', 'starting', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'waiting'
    },
    player1Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'players', key: 'id' }
    },
    player2Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'players', key: 'id' }
    },
    player3Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'players', key: 'id' }
    },
    player4Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'players', key: 'id' }
    },
    player5Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'players', key: 'id' }
    },
    player6Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'players', key: 'id' }
    },
    player7Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'players', key: 'id' }
    },
    player8Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'players', key: 'id' }
    },
    winnerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'players', key: 'id' }
    },
    gridSize: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: true
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
    tableName: 'matches',
    hooks: {
        beforeUpdate: (match) => {
            match.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

Match.associate = (models) => {
    Match.belongsTo(models.Player, { foreignKey: 'player1Id', as: 'player1' });
    Match.belongsTo(models.Player, { foreignKey: 'player2Id', as: 'player2' });
    Match.belongsTo(models.Player, { foreignKey: 'player3Id', as: 'player3' });
    Match.belongsTo(models.Player, { foreignKey: 'player4Id', as: 'player4' });
    Match.belongsTo(models.Player, { foreignKey: 'player5Id', as: 'player5' });
    Match.belongsTo(models.Player, { foreignKey: 'player6Id', as: 'player6' });
    Match.belongsTo(models.Player, { foreignKey: 'player7Id', as: 'player7' });
    Match.belongsTo(models.Player, { foreignKey: 'player8Id', as: 'player8' });
    Match.belongsTo(models.Player, { foreignKey: 'winnerId', as: 'winner' });
    Match.hasMany(models.MatchPlayer, { foreignKey: 'matchId' });
    Match.hasMany(models.MatchUnit, { foreignKey: 'matchId' });
    Match.hasMany(models.MatchMarble, { foreignKey: 'matchId' });
    Match.hasOne(models.AIReport, { foreignKey: 'matchId' });
};

module.exports = Match;
