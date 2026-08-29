// ===== AI Report Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const AIReport = getSequelize().define('AIReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    matchId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        unique: true,
        references: { model: 'matches', key: 'id' }
    },
    playerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'id' }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    overallRating: {
        type: DataTypes.STRING(2),
        allowNull: true
    },
    overallFeedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    strengths: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    weaknesses: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    tips: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    detailedAnalysis: {
        type: DataTypes.JSON,
        defaultValue: {}
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
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'ai_reports',
    hooks: {
        beforeUpdate: (report) => {
            report.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

AIReport.associate = (models) => {
    AIReport.belongsTo(models.Match, { foreignKey: 'matchId' });
    AIReport.belongsTo(models.Player, { foreignKey: 'playerId' });
    AIReport.belongsTo(models.Faction, { foreignKey: 'factionId' });
    AIReport.belongsTo(models.Loadout, { foreignKey: 'loadoutId' });
};

module.exports = AIReport;
