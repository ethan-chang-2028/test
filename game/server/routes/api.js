// ===== API Routes =====

const express = require('express');
const router = express.Router();
const { asyncHandler, NotFoundError } = require('../middleware/error');
const { getSequelize } = require('../config/database');

// ===== Players =====

router.get('/players/me', asyncHandler(async (req, res) => {
    const player = req.player;
    res.json(formatPlayer(player));
}));

router.put('/players/me', asyncHandler(async (req, res) => {
    const { username, email } = req.body;
    const sequelize = getSequelize();
    const Player = sequelize.models.Player;
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    const player = await Player.update(updates, { where: { id: req.player.id }, returning: true });
    res.json(formatPlayer(player[1][0]));
}));

router.get('/players/stats', asyncHandler(async (req, res) => {
    const sequelize = getSequelize();
    const PlayerStats = sequelize.models.PlayerStats;
    const stats = await PlayerStats.findOne({ where: { playerId: req.player.id } });
    if (!stats) throw new NotFoundError('Player stats not found');
    res.json(stats);
}));

// ===== Factions =====

router.get('/factions/list', asyncHandler(async (req, res) => {
    const sequelize = getSequelize();
    const Faction = sequelize.models.Faction;
    const factions = await Faction.findAll({ where: { isActive: true }, order: [['order', 'ASC']] });
    res.json(factions);
}));

router.get('/factions/my-progress', asyncHandler(async (req, res) => {
    const sequelize = getSequelize();
    const PlayerFactionProgress = sequelize.models.PlayerFactionProgress;
    const progress = await PlayerFactionProgress.findAll({ where: { playerId: req.player.id } });
    res.json(progress);
}));

// ===== Units =====

router.get('/units/list', asyncHandler(async (req, res) => {
    const sequelize = getSequelize();
    const Unit = sequelize.models.Unit;
    const units = await Unit.findAll({ where: { isActive: true } });
    res.json(units);
}));

router.get('/units/my-units', asyncHandler(async (req, res) => {
    const sequelize = getSequelize();
    const PlayerUnit = sequelize.models.PlayerUnit;
    const playerUnits = await PlayerUnit.findAll({
        where: { playerId: req.player.id },
        include: [sequelize.models.Unit]
    });
    res.json(playerUnits);
}));

// ===== Cards =====

router.get('/cards/list', asyncHandler(async (req, res) => {
    const sequelize = getSequelize();
    const Card = sequelize.models.Card;
    const cards = await Card.findAll({ where: { isActive: true } });
    res.json(cards);
}));

router.get('/cards/my-cards', asyncHandler(async (req, res) => {
    const sequelize = getSequelize();
    const PlayerCard = sequelize.models.PlayerCard;
    const playerCards = await PlayerCard.findAll({
        where: { playerId: req.player.id },
        include: [sequelize.models.Card]
    });
    res.json(playerCards);
}));

// ===== Loadouts =====

router.get('/loadouts/list', asyncHandler(async (req, res) => {
    const sequelize = getSequelize();
    const Loadout = sequelize.models.Loadout;
    const loadouts = await Loadout.findAll({
        where: { playerId: req.player.id },
        include: [{
            model: sequelize.models.LoadoutCard,
            include: [sequelize.models.Card, sequelize.models.Unit]
        }]
    });
    res.json(loadouts);
}));

router.post('/loadouts/create', asyncHandler(async (req, res) => {
    const { name, description, cards } = req.body;
    const sequelize = getSequelize();
    const Loadout = sequelize.models.Loadout;
    const loadout = await Loadout.create({
        playerId: req.player.id,
        name: name || 'Unnamed Loadout',
        description
    });
    if (cards && cards.length > 0) {
        const LoadoutCard = sequelize.models.LoadoutCard;
        await Promise.all(cards.map((card, index) => {
            return LoadoutCard.create({
                loadoutId: loadout.id,
                cardId: card.cardId,
                unitId: card.unitId,
                slot: index + 1
            });
        }));
    }
    res.json(loadout);
}));

router.put('/loadouts/update/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, cards } = req.body;
    const sequelize = getSequelize();
    const Loadout = sequelize.models.Loadout;
    const LoadoutCard = sequelize.models.LoadoutCard;
    const loadout = await Loadout.findOne({ where: { id, playerId: req.player.id } });
    if (!loadout) throw new NotFoundError('Loadout not found');
    await Loadout.update({ name, description }, { where: { id } });
    if (cards) {
        await LoadoutCard.destroy({ where: { loadoutId: id } });
        await Promise.all(cards.map((card, index) => {
            return LoadoutCard.create({
                loadoutId: id,
                cardId: card.cardId,
                unitId: card.unitId,
                slot: index + 1
            });
        }));
    }
    const updatedLoadout = await Loadout.findOne({
        where: { id },
        include: [{
            model: LoadoutCard,
            include: [sequelize.models.Card, sequelize.models.Unit]
        }]
    });
    res.json(updatedLoadout);
}));

router.delete('/loadouts/delete/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const sequelize = getSequelize();
    const Loadout = sequelize.models.Loadout;
    const loadout = await Loadout.findOne({ where: { id, playerId: req.player.id } });
    if (!loadout) throw new NotFoundError('Loadout not found');
    await Loadout.destroy({ where: { id } });
    res.json({ success: true, message: 'Loadout deleted' });
}));

// ===== Shop =====

router.get('/shop/listings', asyncHandler(async (req, res) => {
    const sequelize = getSequelize();
    const ShopListing = sequelize.models.ShopListing;
    const listings = await ShopListing.findAll({ where: { isActive: true }, order: [['order', 'ASC']] });
    res.json(listings);
}));

router.get('/shop/chests', asyncHandler(async (req, res) => {
    const sequelize = getSequelize();
    const Chest = sequelize.models.Chest;
    const chests = await Chest.findAll({ where: { isActive: true }, order: [['cost', 'ASC']] });
    res.json(chests);
}));

router.post('/shop/purchase', asyncHandler(async (req, res) => {
    const { itemId, currencyType } = req.body;
    const sequelize = getSequelize();
    const ShopListing = sequelize.models.ShopListing;
    const Chest = sequelize.models.Chest;
    const Player = sequelize.models.Player;
    const PurchaseHistory = sequelize.models.PurchaseHistory;
    let item, cost;
    const listing = await ShopListing.findOne({ where: { itemId, isActive: true } });
    if (listing) {
        item = listing;
        cost = listing.cost;
    } else {
        const chest = await Chest.findOne({ where: { id: itemId, isActive: true } });
        if (!chest) throw new NotFoundError('Item not found');
        item = chest;
        cost = chest.cost;
    }
    const player = await Player.findByPk(req.player.id);
    const currencyField = currencyType === 'premium' ? 'premiumCurrency' : 'metaGold';
    if (player[currencyField] < cost) throw new Error('Insufficient currency');
    await Player.update({
        [currencyField]: player[currencyField] - cost
    }, { where: { id: player.id } });
    await PurchaseHistory.create({
        playerId: req.player.id,
        itemType: item.itemType || 'chest',
        itemId: item.itemId || item.id,
        itemName: item.name,
        currencyType,
        cost,
        status: 'completed'
    });
    res.json({ success: true, message: 'Purchase successful' });
}));

// ===== Matches =====

router.get('/matches/list', asyncHandler(async (req, res) => {
    const sequelize = getSequelize();
    const Match = sequelize.models.Match;
    const matches = await Match.findAll({
        where: { status: 'completed' },
        order: [['createdAt', 'DESC']],
        limit: 50
    });
    res.json(matches);
}));

router.get('/matches/my-matches', asyncHandler(async (req, res) => {
    const sequelize = getSequelize();
    const Match = sequelize.models.Match;
    const matches = await Match.findAll({
        where: {
            [Op.or]: [
                { player1Id: req.player.id },
                { player2Id: req.player.id },
                { player3Id: req.player.id },
                { player4Id: req.player.id },
                { player5Id: req.player.id },
                { player6Id: req.player.id },
                { player7Id: req.player.id },
                { player8Id: req.player.id }
            ]
        },
        order: [['createdAt', 'DESC']],
        limit: 50
    });
    res.json(matches);
}));

router.post('/matches/create', asyncHandler(async (req, res) => {
    const { mode, isRanked } = req.body;
    const sequelize = getSequelize();
    const Match = sequelize.models.Match;
    const match = await Match.create({
        mode: mode || '1v1',
        isRanked: isRanked || false,
        isPrivate: false,
        status: 'waiting'
    });
    res.json(match);
}));

// ===== AI =====

router.get('/ai/report/:matchId', asyncHandler(async (req, res) => {
    const { matchId } = req.params;
    const sequelize = getSequelize();
    const AIReport = sequelize.models.AIReport;
    const report = await AIReport.findOne({ where: { matchId, playerId: req.player.id } });
    if (!report) throw new NotFoundError('AI report not found');
    res.json(report);
}));

router.put('/ai/settings', asyncHandler(async (req, res) => {
    const { aiFeedbackEnabled } = req.body;
    const sequelize = getSequelize();
    const Player = sequelize.models.Player;
    await Player.update({ aiFeedbackEnabled }, { where: { id: req.player.id } });
    res.json({ success: true, message: 'AI settings updated' });
}));

function formatPlayer(player) {
    return {
        id: player.id,
        username: player.username,
        email: player.email,
        globalLevel: player.globalLevel,
        globalXP: player.globalXP,
        metaGold: player.metaGold,
        premiumCurrency: player.premiumCurrency,
        factionId: player.factionId,
        isAdmin: player.isAdmin,
        emailVerified: player.emailVerified,
        lastLoginAt: player.lastLoginAt
    };
}

module.exports = router;
