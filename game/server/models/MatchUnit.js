// ===== Match Unit Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const MatchUnit = getSequelize().define('MatchUnit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    matchId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: { model: 'matches', key: 'id' }
    },
    unitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'units', key: 'id' }
    },
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'cards', key: 'id' }
    },
    playerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'id' }
    },
    team: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    unitType: {
        type: DataTypes.ENUM('melee', 'ranged', 'buff', 'turret'),
        allowNull: false,
        defaultValue: 'melee'
    },
    x: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    y: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    targetX: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    targetY: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    hp: {
        type: DataTypes.INTEGER,
        defaultValue: 60
    },
    maxHp: {
        type: DataTypes.INTEGER,
        defaultValue: 60
    },
    damage: {
        type: DataTypes.INTEGER,
        defaultValue: 14
    },
    speed: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    },
    attackRange: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    isAlive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isMoving: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    moveProgress: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    attackCooldown: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastAttack: {
        type: DataTypes.DATE,
        allowNull: true
    },
    kills: {
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
    tableName: 'match_units',
    hooks: {
        beforeUpdate: (matchUnit) => {
            matchUnit.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

MatchUnit.associate = (models) => {
    MatchUnit.belongsTo(models.Match, { foreignKey: 'matchId' });
    MatchUnit.belongsTo(models.Unit, { foreignKey: 'unitId' });
    MatchUnit.belongsTo(models.Card, { foreignKey: 'cardId' });
    MatchUnit.belongsTo(models.Player, { foreignKey: 'playerId' });
};

module.exports = MatchUnit;
