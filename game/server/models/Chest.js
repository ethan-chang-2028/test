// ===== Chest Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const Chest = getSequelize().define('Chest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    chestType: {
        type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary', 'faction'),
        defaultValue: 'common'
    },
    factionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'factions', key: 'id' }
    },
    cost: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    currencyType: {
        type: DataTypes.ENUM('gold', 'premium'),
        defaultValue: 'premium'
    },
    contents: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    guaranteedRarity: {
        type: DataTypes.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    icon: {
        type: DataTypes.STRING(255),
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
    tableName: 'chests',
    hooks: {
        beforeUpdate: (chest) => {
            chest.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

Chest.associate = (models) => {
    Chest.belongsTo(models.Faction, { foreignKey: 'factionId' });
};

module.exports = Chest;
