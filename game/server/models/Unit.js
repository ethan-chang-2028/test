// ===== Unit Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const Unit = getSequelize().define('Unit', {
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
    unitType: {
        type: DataTypes.ENUM('melee', 'ranged', 'buff', 'turret'),
        allowNull: false,
        defaultValue: 'melee'
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
    baseHP: {
        type: DataTypes.INTEGER,
        defaultValue: 60
    },
    baseDamage: {
        type: DataTypes.INTEGER,
        defaultValue: 14
    },
    baseSpeed: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    },
    attackRange: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    baseCost: {
        type: DataTypes.INTEGER,
        defaultValue: 25
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
    tableName: 'units',
    hooks: {
        beforeUpdate: (unit) => {
            unit.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

Unit.associate = (models) => {
    Unit.belongsTo(models.Faction, { foreignKey: 'factionId' });
    Unit.hasMany(models.PlayerUnit, { foreignKey: 'unitId' });
    Unit.hasMany(models.LoadoutCard, { foreignKey: 'unitId' });
    Unit.hasMany(models.MatchUnit, { foreignKey: 'unitId' });
};

module.exports = Unit;
