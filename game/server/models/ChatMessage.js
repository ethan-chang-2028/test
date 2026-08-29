// ===== Chat Message Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const ChatMessage = getSequelize().define('ChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    matchId: {
        type: DataTypes.STRING(36),
        allowNull: true,
        references: { model: 'matches', key: 'id' }
    },
    playerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'id' }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    messageType: {
        type: DataTypes.ENUM('chat', 'emote', 'system'),
        defaultValue: 'chat'
    },
    isGlobal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'chat_messages',
    hooks: {
        beforeUpdate: (message) => {
            message.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

ChatMessage.associate = (models) => {
    ChatMessage.belongsTo(models.Match, { foreignKey: 'matchId' });
    ChatMessage.belongsTo(models.Player, { foreignKey: 'playerId' });
};

module.exports = ChatMessage;
