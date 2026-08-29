// ===== Game Configuration =====

const CONFIG = {
    // ===== Game Settings =====
    TILE_SIZE: 80,
    GRID_SIZE: 5,
    MARBLE_SIZE: 24,
    WALL_THICKNESS: 6,
    
    // ===== Game Timing =====
    GAME_TICK_RATE: 100, // ms
    MARBLE_FIRE_INTERVAL: 3000, // ms
    MIN_MARBLE_INTERVAL: 500, // ms
    MARBLE_ACCELERATION: 0.1, // acceleration factor
    UNIT_SPEED: 1, // tiles per second
    
    // ===== Game Mechanics =====
    WALL_HP: 100,
    SPAWNER_HP: 200,
    
    // ===== Marble Types =====
    MARBLE_TYPES: {
        ATTACK: 'attack',
        BUFF: 'buff',
        SPLIT: 'split'
    },
    
    // ===== Unit Types =====
    UNIT_TYPES: {
        MELEE: 'melee',
        RANGED: 'ranged',
        BUFF: 'buff',
        TURRET: 'turret'
    },
    
    // ===== Match Modes =====
    MATCH_MODES: {
        ONE_V_ONE: '1v1',
        FOUR_PLAYER: '4_player',
        NINE_PLAYER: '9_player'
    },
    
    // ===== Grid Sizes =====
    GRID_SIZES: {
        '1v1': 5,
        '4_player': 7,
        '9_player': 9
    },
    
    // ===== Colors =====
    COLORS: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        
        teams: [
            '#ff4444', // Team 1 - Red
            '#4444ff', // Team 2 - Blue
            '#44ff44', // Team 3 - Green
            '#ff44ff', // Team 4 - Purple
            '#ffff44', // Team 5 - Yellow
            '#ff8844', // Team 6 - Orange
            '#44ffff', // Team 7 - Cyan
            '#ff4488', // Team 8 - Pink
            '#8844ff'  // Team 9 - Violet
        ],
        
        units: {
            melee: '#ff6b6b',
            ranged: '#6b6bff',
            buff: '#6bff6b',
            turret: '#ffaa44'
        },
        
        marbles: {
            attack: '#ff4444',
            buff: '#44ff44',
            split: '#ffff44'
        }
    },
    
    // ===== Socket.IO Events =====
    SOCKET_EVENTS: {
        CONNECT: 'connect',
        DISCONNECT: 'disconnect',
        QUEUE_MATCH_FOUND: 'queue:match_found',
        MATCH_START: 'match:start',
        MATCH_END: 'match:end',
        MATCH_TICK: 'match:tick',
        GAME_STATE: 'game:state',
        GAME_UPDATE: 'game:update',
        CHAT_MESSAGE: 'chat:message',
        QUEUE_JOIN: 'queue:join',
        QUEUE_LEAVE: 'queue:leave',
        MATCH_JOIN: 'match:join',
        MATCH_LEAVE: 'match:leave',
        MARBLE_FIRE: 'marble:fire',
        CARD_PLAY: 'card:play',
        CHAT_SEND: 'chat:send'
    },
    
    // ===== API Endpoints =====
    API: {
        base: '/api',
        auth: {
            login: '/api/auth/login',
            register: '/api/auth/register',
            logout: '/api/auth/logout',
            refresh: '/api/auth/refresh'
        },
        players: {
            me: '/api/players/me',
            update: '/api/players/me',
            stats: '/api/players/stats'
        },
        factions: {
            list: '/api/factions',
            myProgress: '/api/factions/my-progress'
        },
        units: {
            list: '/api/units',
            myUnits: '/api/units/my-units'
        },
        cards: {
            list: '/api/cards',
            myCards: '/api/cards/my-cards'
        },
        loadouts: {
            list: '/api/loadouts',
            create: '/api/loadouts',
            update: '/api/loadouts',
            delete: '/api/loadouts'
        },
        matches: {
            list: '/api/matches/my-matches',
            create: '/api/matches',
            myMatches: '/api/matches/my-matches'
        },
        shop: {
            listings: '/api/shop/listings',
            chests: '/api/shop/chests',
            purchase: '/api/shop/purchase'
        },
        ai: {
            report: '/api/ai/report',
            settings: '/api/ai/settings'
        }
    }
};

// ===== Export =====

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
