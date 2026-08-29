// ===== Loadout Card Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const LoadoutCard = getSequelize().define('LoadoutCard', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    loadoutId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'loadouts', key: 'id' }
    },
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'cards', key: 'id' }
    },
    unitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'units', key: 'id' }
    },
    slot: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    tableName: 'loadout_cards',
    hooks: {
        beforeUpdate: (loadoutCard) => {
            loadoutCard.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

LoadoutCard.associate = (models) => {
    LoadoutCard.belongsTo(models.Loadout, { foreignKey: 'loadoutId' });
    LoadoutCard.belongsTo(models.Card, { foreignKey: 'cardId' });
    LoadoutCard.belongsTo(models.Unit, { foreignKey: 'unitId' });
};

module.exports = LoadoutCard;
