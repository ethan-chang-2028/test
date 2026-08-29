// ===== Collection =====

async function loadCollection() {
    await Promise.all([
        loadCollectionUnits(),
        loadCollectionCards(),
        loadCollectionFactions()
    ]);
}

async function loadCollectionUnits() {
    const grid = document.getElementById('units-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const result = await api.getMyUnits();
    if (result.success) {
        const unitsByType = {};
        result.data.forEach(unit => {
            if (!unitsByType[unit.unitType]) unitsByType[unit.unitType] = [];
            unitsByType[unit.unitType].push(unit);
        });
        for (const [type, units] of Object.entries(unitsByType)) {
            units.forEach(unit => {
                const card = createUnitCard(unit);
                grid.appendChild(card);
            });
        }
    }
}

function createUnitCard(unit) {
    const card = document.createElement('div');
    card.className = 'collection-card';
    card.dataset.unitId = unit.id;
    const color = CONFIG.COLORS.units[unit.unitType] || CONFIG.COLORS.units.melee;
    card.innerHTML = `
        <div class="card-icon" style="background: ${color}">${getUnitIcon(unit.unitType)}</div>
        <div class="card-name">${unit.name}</div>
        <div class="card-rarity ${unit.rarity}">${capitalize(unit.rarity)}</div>
        <div class="card-tier">Tier: ${unit.tier || 1}</div>
        <div class="card-quantity">Qty: ${unit.quantity || 1}</div>
    `;
    card.addEventListener('click', () => showUnitDetails(unit));
    return card;
}

function getUnitIcon(type) {
    switch (type) {
        case CONFIG.UNIT_TYPES.MELEE: return '⚔️';
        case CONFIG.UNIT_TYPES.RANGED: return '🎯';
        case CONFIG.UNIT_TYPES.BUFF: return '💚';
        case CONFIG.UNIT_TYPES.TURRET: return '🗼';
        default: return '⚔️';
    }
}

function showUnitDetails(unit) {
    let modal = document.getElementById('unit-details-modal');
    if (!modal) createUnitDetailsModal();
    modal = document.getElementById('unit-details-modal');
    const title = modal.querySelector('.modal-header h2');
    const icon = modal.querySelector('.unit-icon');
    const type = modal.querySelector('.unit-type');
    const rarity = modal.querySelector('.unit-rarity');
    const tier = modal.querySelector('.unit-tier');
    const quantity = modal.querySelector('.unit-quantity');
    const hp = modal.querySelector('.unit-hp');
    const damage = modal.querySelector('.unit-damage');
    const speed = modal.querySelector('.unit-speed');
    const description = modal.querySelector('.unit-description');
    if (title) title.textContent = unit.name;
    if (icon) icon.textContent = getUnitIcon(unit.unitType);
    if (type) type.textContent = capitalize(unit.unitType);
    if (rarity) rarity.textContent = capitalize(unit.rarity);
    if (tier) tier.textContent = `Tier: ${unit.tier || 1}`;
    if (quantity) quantity.textContent = `Quantity: ${unit.quantity || 1}`;
    if (hp) hp.textContent = `HP: ${unit.baseHP || 60}`;
    if (damage) damage.textContent = `Damage: ${unit.baseDamage || 14}`;
    if (speed) speed.textContent = `Speed: ${unit.baseSpeed || CONFIG.UNIT_SPEED}`;
    if (description) description.textContent = unit.description || 'No description';
    showModal('unit-details-modal');
}

function createUnitDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'unit-details-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Unit Details</h2>
                <button class="modal-close" onclick="hideModal('unit-details-modal')">×</button>
            </div>
            <div class="modal-body">
                <div class="unit-details">
                    <div class="unit-icon" style="font-size: 3rem; text-align: center; margin-bottom: 1rem;">⚔️</div>
                    <div class="unit-info-grid">
                        <div class="info-row"><span class="info-label">Type:</span><span class="info-value unit-type"></span></div>
                        <div class="info-row"><span class="info-label">Rarity:</span><span class="info-value unit-rarity"></span></div>
                        <div class="info-row"><span class="info-label">Tier:</span><span class="info-value unit-tier"></span></div>
                        <div class="info-row"><span class="info-label">Quantity:</span><span class="info-value unit-quantity"></span></div>
                        <div class="info-row"><span class="info-label">HP:</span><span class="info-value unit-hp"></span></div>
                        <div class="info-row"><span class="info-label">Damage:</span><span class="info-value unit-damage"></span></div>
                        <div class="info-row"><span class="info-label">Speed:</span><span class="info-value unit-speed"></span></div>
                    </div>
                    <div class="unit-description" style="margin-top: 1rem; color: var(--text-secondary);"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="hideModal('unit-details-modal')">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function loadCollectionCards() {
    const grid = document.getElementById('cards-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const result = await api.getMyCards();
    if (result.success) {
        const cardsByType = {};
        result.data.forEach(card => {
            if (!cardsByType[card.cardType]) cardsByType[card.cardType] = [];
            cardsByType[card.cardType].push(card);
        });
        for (const [type, cards] of Object.entries(cardsByType)) {
            cards.forEach(card => {
                const cardEl = createCardCard(card);
                grid.appendChild(cardEl);
            });
        }
    }
}

function createCardCard(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'collection-card';
    cardEl.dataset.cardId = card.id;
    const color = CONFIG.COLORS.marbles[card.effectType] || CONFIG.COLORS.primary;
    cardEl.innerHTML = `
        <div class="card-icon" style="background: ${color}">${getCardIcon(card.effectType)}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-rarity ${card.rarity}">${capitalize(card.rarity)}</div>
        <div class="card-tier">Tier: ${card.tier || 1}</div>
        <div class="card-quantity">Qty: ${card.quantity || 1}</div>
    `;
    cardEl.addEventListener('click', () => showCardDetails(card));
    return cardEl;
}

function getCardIcon(effectType) {
    switch (effectType) {
        case 'heal': return '💚';
        case 'damage': return '⚔️';
        case 'shield': return '🛡️';
        case 'buff': return '⬆️';
        case 'wall': return '🧱';
        case 'speed_boost': return '⚡';
        case 'gold': return '💰';
        case 'spawn': return '👤';
        default: return '🃏';
    }
}

function showCardDetails(card) {
    let modal = document.getElementById('card-details-modal');
    if (!modal) createCardDetailsModal();
    modal = document.getElementById('card-details-modal');
    const title = modal.querySelector('.modal-header h2');
    const icon = modal.querySelector('.card-icon');
    const type = modal.querySelector('.card-type');
    const rarity = modal.querySelector('.card-rarity');
    const tier = modal.querySelector('.card-tier');
    const quantity = modal.querySelector('.card-quantity');
    const cost = modal.querySelector('.card-cost');
    const effect = modal.querySelector('.card-effect');
    const description = modal.querySelector('.card-description');
    if (title) title.textContent = card.name;
    if (icon) icon.textContent = getCardIcon(card.effectType);
    if (type) type.textContent = capitalize(card.cardType);
    if (rarity) rarity.textContent = capitalize(card.rarity);
    if (tier) tier.textContent = `Tier: ${card.tier || 1}`;
    if (quantity) quantity.textContent = `Quantity: ${card.quantity || 1}`;
    if (cost) cost.textContent = `Cost: ${card.baseCost || 25} Gold`;
    if (effect) effect.textContent = `Effect: ${capitalize(card.effectType)}`;
    if (description) description.textContent = card.description || 'No description';
    showModal('card-details-modal');
}

function createCardDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'card-details-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Card Details</h2>
                <button class="modal-close" onclick="hideModal('card-details-modal')">×</button>
            </div>
            <div class="modal-body">
                <div class="card-details">
                    <div class="card-icon" style="font-size: 3rem; text-align: center; margin-bottom: 1rem;">🃏</div>
                    <div class="card-info-grid">
                        <div class="info-row"><span class="info-label">Type:</span><span class="info-value card-type"></span></div>
                        <div class="info-row"><span class="info-label">Rarity:</span><span class="info-value card-rarity"></span></div>
                        <div class="info-row"><span class="info-label">Tier:</span><span class="info-value card-tier"></span></div>
                        <div class="info-row"><span class="info-label">Quantity:</span><span class="info-value card-quantity"></span></div>
                        <div class="info-row"><span class="info-label">Cost:</span><span class="info-value card-cost"></span></div>
                        <div class="info-row"><span class="info-label">Effect:</span><span class="info-value card-effect"></span></div>
                    </div>
                    <div class="card-description" style="margin-top: 1rem; color: var(--text-secondary);"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="hideModal('card-details-modal')">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function loadCollectionFactions() {
    const grid = document.getElementById('factions-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const result = await api.getMyFactionProgress();
    if (result.success) {
        result.data.forEach(factionProgress => {
            const card = createFactionCard(factionProgress);
            grid.appendChild(card);
        });
    }
}

function createFactionCard(factionProgress) {
    const card = document.createElement('div');
    card.className = 'faction-card';
    card.dataset.factionId = factionProgress.factionId;
    const faction = window.factions?.find(f => f.id === factionProgress.factionId);
    const color = faction?.color || CONFIG.COLORS.primary;
    const xpPercent = (factionProgress.xp % 1000) / 1000;
    card.innerHTML = `
        <div class="faction-color" style="background: ${color}"></div>
        <div class="faction-name">${faction?.name || 'Unknown Faction'}</div>
        <div class="faction-level">Level ${factionProgress.level}</div>
        <div class="faction-xp"><div class="faction-xp-fill" style="width: ${xpPercent * 100}%"></div></div>
        <div class="faction-mechanic" style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-secondary);">${faction?.signatureMechanic || ''}</div>
    `;
    card.addEventListener('click', () => showFactionDetails(factionProgress));
    return card;
}

function showFactionDetails(factionProgress) {
    const faction = window.factions?.find(f => f.id === factionProgress.factionId);
    if (!faction) return;
    let modal = document.getElementById('faction-details-modal');
    if (!modal) createFactionDetailsModal();
    modal = document.getElementById('faction-details-modal');
    const title = modal.querySelector('.modal-header h2');
    const color = modal.querySelector('.faction-color-display');
    const level = modal.querySelector('.faction-level-display');
    const xp = modal.querySelector('.faction-xp-display');
    const mechanic = modal.querySelector('.faction-mechanic-display');
    const description = modal.querySelector('.faction-description-display');
    if (title) title.textContent = faction.name;
    if (color) color.style.background = faction.color;
    if (level) level.textContent = `Level: ${factionProgress.level}`;
    if (xp) xp.textContent = `XP: ${factionProgress.xp}`;
    if (mechanic) mechanic.textContent = `Signature: ${faction.signatureMechanic}`;
    if (description) description.textContent = faction.description || 'No description';
    showModal('faction-details-modal');
}

function createFactionDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'faction-details-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Faction Details</h2>
                <button class="modal-close" onclick="hideModal('faction-details-modal')">×</button>
            </div>
            <div class="modal-body">
                <div class="faction-details">
                    <div class="faction-color-display" style="width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 1rem;"></div>
                    <div class="faction-info-grid">
                        <div class="info-row"><span class="info-label">Level:</span><span class="info-value faction-level-display"></span></div>
                        <div class="info-row"><span class="info-label">XP:</span><span class="info-value faction-xp-display"></span></div>
                        <div class="info-row"><span class="info-label">Signature:</span><span class="info-value faction-mechanic-display"></span></div>
                    </div>
                    <div class="faction-description-display" style="margin-top: 1rem; color: var(--text-secondary);"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="hideModal('faction-details-modal')">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function setupCollectionFilters() {
    const unitFactionFilter = document.getElementById('unit-filter-faction');
    const unitRarityFilter = document.getElementById('unit-filter-rarity');
    const unitTypeFilter = document.getElementById('unit-filter-type');
    if (unitFactionFilter) unitFactionFilter.addEventListener('change', () => loadCollectionUnits());
    if (unitRarityFilter) unitRarityFilter.addEventListener('change', () => loadCollectionUnits());
    if (unitTypeFilter) unitTypeFilter.addEventListener('change', () => loadCollectionUnits());
    const cardFactionFilter = document.getElementById('card-filter-faction');
    const cardTypeFilter = document.getElementById('card-filter-type');
    const cardRarityFilter = document.getElementById('card-filter-rarity');
    if (cardFactionFilter) cardFactionFilter.addEventListener('change', () => loadCollectionCards());
    if (cardTypeFilter) cardTypeFilter.addEventListener('change', () => loadCollectionCards());
    if (cardRarityFilter) cardRarityFilter.addEventListener('change', () => loadCollectionCards());
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadCollection,
        loadCollectionUnits,
        loadCollectionCards,
        loadCollectionFactions,
        createUnitCard,
        createCardCard,
        createFactionCard,
        showUnitDetails,
        showCardDetails,
        showFactionDetails,
        setupCollectionFilters
    };
}
