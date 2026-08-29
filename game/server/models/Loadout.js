// ===== Loadout Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const Loadout = getSequelize().define('Loadout', {
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
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Unnamed Loadout'
    },
    description: {
        type: DataTypes.TEXT,
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
    tableName: 'loadouts',
    hooks: {
        beforeUpdate: (loadout) => {
            loadout.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

Loadout.associate = (models) => {
    Loadout.belongsTo(models.Player, { foreignKey: 'playerId' });
    Loadout.hasMany(models.LoadoutCard, { foreignKey: 'loadoutId' });
};

module.exports = Loadout;
