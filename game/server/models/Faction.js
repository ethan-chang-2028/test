// ===== Faction Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const Faction = getSequelize().define('Faction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: '#FF0000'
    },
    signatureMechanic: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    signatureMechanicDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    order: {
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
    tableName: 'factions',
    hooks: {
        beforeUpdate: (faction) => {
            faction.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

Faction.associate = (models) => {
    Faction.hasMany(models.PlayerFactionProgress, { foreignKey: 'factionId' });
    Faction.hasMany(models.Player, { foreignKey: 'factionId' });
    Faction.hasMany(models.Unit, { foreignKey: 'factionId' });
    Faction.hasMany(models.Card, { foreignKey: 'factionId' });
};

module.exports = Faction;
