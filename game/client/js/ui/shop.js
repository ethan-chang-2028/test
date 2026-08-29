// ===== Shop =====

async function loadShopItems() {
    await Promise.all([
        loadShopChests(),
        loadShopUnits(),
        loadShopCards(),
        loadShopCurrency()
    ]);
}

async function loadShopChests() {
    const container = document.getElementById('chests-tab');
    if (!container) return;
    container.innerHTML = '';
    const result = await api.getChests();
    if (result.success) {
        result.data.forEach(chest => {
            const card = createChestCard(chest);
            container.appendChild(card);
        });
    }
}

function createChestCard(chest) {
    const card = document.createElement('div');
    card.className = 'shop-item-card';
    card.dataset.chestId = chest.id;
    card.innerHTML = `
        <div class="item-icon">📦</div>
        <div class="item-name">${chest.name}</div>
        <div class="item-description">${chest.description || ''}</div>
        <div class="item-cost">
            <span class="cost-icon">⭐</span>
            <span class="cost-value">${chest.cost}</span>
            <span class="cost-currency">Premium</span>
        </div>
        <button class="btn btn-primary" onclick="purchaseItem('${chest.id}', 'chest')">Buy</button>
    `;
    return card;
}

async function loadShopUnits() {
    const container = document.getElementById('units-tab');
    if (!container) return;
    container.innerHTML = '';
    const result = await api.getShopListings();
    if (result.success) {
        const units = result.data.filter(item => item.itemType === 'unit');
        units.forEach(unit => {
            const card = createUnitShopCard(unit);
            container.appendChild(card);
        });
    }
}

function createUnitShopCard(unit) {
    const card = document.createElement('div');
    card.className = 'shop-item-card';
    card.dataset.unitId = unit.itemId;
    const currencyIcon = unit.currencyType === 'premium' ? '⭐' : '💰';
    const currencyName = unit.currencyType === 'premium' ? 'Premium' : 'Gold';
    card.innerHTML = `
        <div class="item-icon">${getUnitIcon(unit.category || 'melee')}</div>
        <div class="item-name">${unit.name}</div>
        <div class="item-description">${unit.description || ''}</div>
        <div class="item-cost">
            <span class="cost-icon">${currencyIcon}</span>
            <span class="cost-value">${unit.cost}</span>
            <span class="cost-currency">${currencyName}</span>
        </div>
        <button class="btn btn-primary" onclick="purchaseItem('${unit.itemId}', 'unit', '${unit.currencyType}')">Buy</button>
    `;
    return card;
}

async function loadShopCards() {
    const container = document.getElementById('cards-tab');
    if (!container) return;
    container.innerHTML = '';
    const result = await api.getShopListings();
    if (result.success) {
        const cards = result.data.filter(item => item.itemType === 'card');
        cards.forEach(card => {
            const cardEl = createCardShopCard(card);
            container.appendChild(cardEl);
        });
    }
}

function createCardShopCard(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'shop-item-card';
    cardEl.dataset.cardId = card.itemId;
    const currencyIcon = card.currencyType === 'premium' ? '⭐' : '💰';
    const currencyName = card.currencyType === 'premium' ? 'Premium' : 'Gold';
    cardEl.innerHTML = `
        <div class="item-icon">${getCardIcon(card.category || 'heal')}</div>
        <div class="item-name">${card.name}</div>
        <div class="item-description">${card.description || ''}</div>
        <div class="item-cost">
            <span class="cost-icon">${currencyIcon}</span>
            <span class="cost-value">${card.cost}</span>
            <span class="cost-currency">${currencyName}</span>
        </div>
        <button class="btn btn-primary" onclick="purchaseItem('${card.itemId}', 'card', '${card.currencyType}')">Buy</button>
    `;
    return cardEl;
}

async function loadShopCurrency() {
    const container = document.getElementById('currency-tab');
    if (!container) return;
    container.innerHTML = '';
    const result = await api.getShopListings();
    if (result.success) {
        const currencyItems = result.data.filter(item => item.itemType === 'currency');
        currencyItems.forEach(item => {
            const card = createCurrencyCard(item);
            container.appendChild(card);
        });
    }
}

function createCurrencyCard(item) {
    const card = document.createElement('div');
    card.className = 'shop-item-card';
    card.dataset.currencyId = item.itemId;
    const currencyIcon = item.currencyType === 'premium' ? '⭐' : '💰';
    card.innerHTML = `
        <div class="item-icon" style="font-size: 3rem;">${currencyIcon}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-description">${item.description || ''}</div>
        <div class="item-cost">
            <span class="cost-value">$${item.cost.toFixed(2)}</span>
            <span class="cost-currency">USD</span>
        </div>
        <button class="btn btn-primary" onclick="purchaseItem('${item.itemId}', 'currency', 'real_money')">Buy</button>
    `;
    return card;
}

function purchaseItem(itemId, itemType, currencyType) {
    api.purchase(itemId, currencyType).then(result => {
        if (result.success) {
            showSuccess('Purchase successful!');
            updateCurrencyDisplay();
            if (itemType === 'chest') loadShopChests();
            else if (itemType === 'unit') loadShopUnits();
            else if (itemType === 'card') loadShopCards();
        } else {
            showError(result.error || 'Purchase failed');
        }
    });
}

function updateCurrencyDisplay() {
    const player = getPlayer();
    const goldEl = document.getElementById('shop-gold');
    const premiumEl = document.getElementById('shop-premium');
    if (goldEl) goldEl.textContent = player?.metaGold || 0;
    if (premiumEl) premiumEl.textContent = player?.premiumCurrency || 0;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadShopItems,
        loadShopChests,
        loadShopUnits,
        loadShopCards,
        loadShopCurrency,
        createChestCard,
        createUnitShopCard,
        createCardShopCard,
        createCurrencyCard,
        purchaseItem,
        updateCurrencyDisplay
    };
}
