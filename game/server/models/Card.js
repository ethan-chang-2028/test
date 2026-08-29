// ===== Card Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const Card = getSequelize().define('Card', {
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
    cardType: {
        type: DataTypes.ENUM('unit', 'spell', 'trap', 'consumable'),
        allowNull: false,
        defaultValue: 'spell'
    },
    effectType: {
        type: DataTypes.ENUM('heal', 'damage', 'shield', 'buff', 'wall', 'speed_boost', 'gold', 'spawn'),
        allowNull: true
    },
    effectValue: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    effectDuration: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    factionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'factions', key: 'id' }
    },
    tier: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: { min: 1, max: 5 }
    },
    rarity: {
        type: DataTypes.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
        defaultValue: 'common'
    },
    baseCost: {
        type: DataTypes.INTEGER,
        defaultValue: 25
    },
    cooldown: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    targetType: {
        type: DataTypes.ENUM('self', 'ally', 'enemy', 'all', 'tile', 'spawner'),
        defaultValue: 'ally'
    },
    unlockLevel: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    isStarter: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    tableName: 'cards',
    hooks: {
        beforeUpdate: (card) => {
            card.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

Card.associate = (models) => {
    Card.belongsTo(models.Faction, { foreignKey: 'factionId' });
    Card.hasMany(models.PlayerCard, { foreignKey: 'cardId' });
    Card.hasMany(models.LoadoutCard, { foreignKey: 'cardId' });
    Card.hasMany(models.MatchMarble, { foreignKey: 'cardId' });
};

module.exports = Card;
