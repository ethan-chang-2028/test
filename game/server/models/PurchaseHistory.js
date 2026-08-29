// ===== Purchase History Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const PurchaseHistory = getSequelize().define('PurchaseHistory', {
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
    itemType: {
        type: DataTypes.ENUM('unit', 'card', 'chest', 'currency'),
        allowNull: false
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    itemName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    currencyType: {
        type: DataTypes.ENUM('gold', 'premium', 'real_money'),
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    cost: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    transactionId: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'completed'
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
    tableName: 'purchase_history',
    hooks: {
        beforeUpdate: (purchase) => {
            purchase.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

PurchaseHistory.associate = (models) => {
    PurchaseHistory.belongsTo(models.Player, { foreignKey: 'playerId' });
};

module.exports = PurchaseHistory;
