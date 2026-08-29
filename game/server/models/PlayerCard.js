// ===== Player Card Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const PlayerCard = getSequelize().define('PlayerCard', {
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
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'cards', key: 'id' }
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    unlockDate: {
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
    tableName: 'player_cards',
    hooks: {
        beforeUpdate: (playerCard) => {
            playerCard.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

PlayerCard.associate = (models) => {
    PlayerCard.belongsTo(models.Player, { foreignKey: 'playerId' });
    PlayerCard.belongsTo(models.Card, { foreignKey: 'cardId' });
};

module.exports = PlayerCard;
