// ===== Player Unit Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const PlayerUnit = getSequelize().define('PlayerUnit', {
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
    unitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'units', key: 'id' }
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
    tableName: 'player_units',
    hooks: {
        beforeUpdate: (playerUnit) => {
            playerUnit.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

PlayerUnit.associate = (models) => {
    PlayerUnit.belongsTo(models.Player, { foreignKey: 'playerId' });
    PlayerUnit.belongsTo(models.Unit, { foreignKey: 'unitId' });
};

module.exports = PlayerUnit;
