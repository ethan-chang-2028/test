// ===== Database Configuration =====

const { Sequelize } = require('sequelize');
const path = require('path');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_NAME = process.env.DB_NAME || 'paint_battle';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_LOGGING = process.env.DB_LOGGING === 'true' || false;

let sequelize;

function initDatabase() {
    if (sequelize) return Promise.resolve(sequelize);
    sequelize = new Sequelize({
        dialect: 'mysql',
        host: DB_HOST,
        port: DB_PORT,
        database: DB_NAME,
        username: DB_USER,
        password: DB_PASSWORD,
        logging: DB_LOGGING ? console.log : false,
        pool: {
            max: 20,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        retry: {
            match: [
                /ETIMEDOUT/,
                /EHOSTUNREACH/,
                /ECONNRESET/,
                /ECONNREFUSED/,
                /ETIMEDOUT/,
                /ESOCKETTIMEDOUT/,
                /EHOSTUNREACH/,
                /EPIPE/,
                /EAI_AGAIN/,
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/
            ],
            max: 5
        },
        define: {
            freezeTableName: true,
            underscored: true
        }
    });
    return authenticateDatabase();
}

async function authenticateDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database authentication successful');
        return sequelize;
    } catch (error) {
        console.error('Database authentication error:', error);
        throw error;
    }
}

function getSequelize() {
    if (!sequelize) throw new Error('Database not initialized. Call initDatabase() first.');
    return sequelize;
}

function closeDatabase() {
    if (sequelize) {
        return sequelize.close();
    }
    return Promise.resolve();
}

function syncDatabase(options = {}) {
    const sequelize = getSequelize();
    return sequelize.sync(options);
}

module.exports = {
    initDatabase,
    getSequelize,
    closeDatabase,
    syncDatabase,
    sequelize
};
