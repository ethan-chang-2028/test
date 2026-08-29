// ===== Shop Listing Model =====

const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/database');

const ShopListing = getSequelize().define('ShopListing', {
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
    itemType: {
        type: DataTypes.ENUM('unit', 'card', 'chest', 'currency'),
        allowNull: false
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    cost: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    currencyType: {
        type: DataTypes.ENUM('gold', 'premium', 'real_money'),
        defaultValue: 'gold'
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isNew: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    discountPercent: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    discountExpiresAt: {
        type: DataTypes.DATE,
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
    tableName: 'shop_listings',
    hooks: {
        beforeUpdate: (listing) => {
            listing.updatedAt = new Date();
        }
    }
});

module.exports = ShopListing;
