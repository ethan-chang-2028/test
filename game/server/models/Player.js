// ===== Player Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const Player = getSequelize().define('Player', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    passwordSalt: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    globalLevel: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    globalXP: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    metaGold: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    premiumCurrency: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    factionId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isBanned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    banReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    banExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    emailVerificationToken: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    passwordResetToken: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    passwordResetExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastLoginAt: {
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
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'players',
    paranoid: true,
    hooks: {
        beforeUpdate: (player) => {
            player.updatedAt = new Date();
        }
    }
});

// ===== Associations =====

Player.associate = (models) => {
    Player.hasMany(models.PlayerStats, { foreignKey: 'playerId' });
    Player.hasMany(models.PlayerFactionProgress, { foreignKey: 'playerId' });
    Player.hasMany(models.PlayerUnit, { foreignKey: 'playerId' });
    Player.hasMany(models.PlayerCard, { foreignKey: 'playerId' });
    Player.hasMany(models.Loadout, { foreignKey: 'playerId' });
    Player.hasMany(models.Match, { foreignKey: 'player1Id' });
    Player.hasMany(models.Match, { foreignKey: 'player2Id' });
    Player.hasMany(models.Match, { foreignKey: 'winnerId' });
    Player.hasMany(models.PurchaseHistory, { foreignKey: 'playerId' });
    Player.hasMany(models.AIReport, { foreignKey: 'playerId' });
    Player.hasMany(models.ChatMessage, { foreignKey: 'playerId' });
    Player.belongsTo(models.Faction, { foreignKey: 'factionId' });
};

module.exports = Player;
