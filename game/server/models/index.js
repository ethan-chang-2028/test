// ===== Model Index =====

const Player = require('./Player');
const PlayerStats = require('./PlayerStats');
const Faction = require('./Faction');
const PlayerFactionProgress = require('./PlayerFactionProgress');
const Unit = require('./Unit');
const PlayerUnit = require('./PlayerUnit');
const Card = require('./Card');
const PlayerCard = require('./PlayerCard');
const Loadout = require('./Loadout');
const LoadoutCard = require('./LoadoutCard');
const Match = require('./Match');
const MatchPlayer = require('./MatchPlayer');
const MatchUnit = require('./MatchUnit');
const MatchMarble = require('./MatchMarble');
const PurchaseHistory = require('./PurchaseHistory');
const ShopListing = require('./ShopListing');
const Chest = require('./Chest');
const AIReport = require('./AIReport');
const ChatMessage = require('./ChatMessage');

const models = {
    Player,
    PlayerStats,
    Faction,
    PlayerFactionProgress,
    Unit,
    PlayerUnit,
    Card,
    PlayerCard,
    Loadout,
    LoadoutCard,
    Match,
    MatchPlayer,
    MatchUnit,
    MatchMarble,
    PurchaseHistory,
    ShopListing,
    Chest,
    AIReport,
    ChatMessage
};

Object.values(models).forEach(model => {
    if (model.associate) model.associate(models);
});

module.exports = models;
