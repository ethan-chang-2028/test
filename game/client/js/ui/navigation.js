// ===== Navigation =====

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageId = btn.dataset.page;
            navigateTo(pageId);
        });
    });
    
    if (loginBtn) loginBtn.addEventListener('click', () => showModal('login-modal'));
    if (registerBtn) registerBtn.addEventListener('click', () => showModal('register-modal'));
    
    updateAuthUI();
    
    // Fallback: if no nav buttons work, ensure home page is shown
    if (pages.length > 0 && !document.querySelector('.page.active')) {
        pages[0].classList.add('active');
    }
}

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) targetPage.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageId) btn.classList.add('active');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updatePageContent(pageId);
}

function updatePageContent(pageId) {
    switch (pageId) {
        case 'home': updateHomePage(); break;
        case 'play': updatePlayPage(); break;
        case 'collection': updateCollectionPage(); break;
        case 'shop': updateShopPage(); break;
        case 'profile': updateProfilePage(); break;
    }
}

function updateHomePage() {
    try {
        startHeroAnimation();
    } catch (e) {
        console.log('Hero animation failed, continuing...');
    }
}

function updatePlayPage() {
    loadFactions();
    loadLoadouts();
    setupModeSelection();
    setupPlayTabs();
    
    // Ensure mode is selected by default
    if (!document.querySelector('.mode-btn.selected')) {
        const firstMode = document.querySelector('.mode-btn');
        if (firstMode) {
            firstMode.classList.add('selected');
            setSessionStorage('selected_mode', firstMode.dataset.mode);
        }
    }
}

function updateCollectionPage() {
    loadCollection();
    setupCollectionTabs();
    setupCollectionFilters();
}

function updateShopPage() {
    loadShopItems();
    setupShopTabs();
    updateCurrencyDisplay();
}

function updateProfilePage() {
    loadProfileData();
    loadRecentMatches();
    setupSettingsForm();
}

function setupModeSelection() {
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
}

function selectMode(mode) {
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.mode === mode) btn.classList.add('selected');
    });
    setSessionStorage('selected_mode', mode);
}

async function loadFactions() {
    const container = document.getElementById('faction-select');
    if (!container) return;
    container.innerHTML = '';
    const result = await api.getFactions();
    if (result.success) {
        result.data.forEach(faction => {
            const btn = document.createElement('button');
            btn.className = 'faction-btn';
            btn.dataset.factionId = faction.id;
            btn.innerHTML = `
                <span class="faction-color" style="background: ${faction.color}"></span>
                <span class="faction-name">${faction.name}</span>
            `;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.faction-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                setSessionStorage('selected_faction', faction.id);
            });
            container.appendChild(btn);
        });
    }
}

async function loadLoadouts() {
    const container = document.getElementById('loadout-select');
    if (!container) return;
    container.innerHTML = '';
    const result = await api.getLoadouts();
    if (result.success) {
        result.data.forEach(loadout => {
            const btn = document.createElement('button');
            btn.className = 'loadout-btn';
            btn.dataset.loadoutId = loadout.id;
            btn.textContent = loadout.name;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.loadout-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                setSessionStorage('selected_loadout', loadout.id);
            });
            container.appendChild(btn);
        });
    }
}

function startQuickPlay() {
    const mode = getSessionStorage('selected_mode', '1v1');
    const factionId = getSessionStorage('selected_faction');
    const loadoutId = getSessionStorage('selected_loadout');
    if (!factionId) { showError('Please select a faction'); return; }
    if (!loadoutId) { showError('Please select a loadout'); return; }
    showModal('matchmaking-modal');
    network.joinQueue(mode, factionId, loadoutId);
}

function cancelMatchmaking() {
    network.leaveQueue();
    hideModal('matchmaking-modal');
}

function setupPlayTabs() {
    const tabs = document.querySelectorAll('#play-page .tab-btn');
    const contents = document.querySelectorAll('#play-page .tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
}

function setupCollectionTabs() {
    const tabs = document.querySelectorAll('#collection-page .tab-btn');
    const contents = document.querySelectorAll('#collection-page .tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(tabId + '-tab').classList.add('active');
            if (tabId === 'units') loadCollectionUnits();
            else if (tabId === 'cards') loadCollectionCards();
            else if (tabId === 'factions') loadCollectionFactions();
        });
    });
}

function setupShopTabs() {
    const tabs = document.querySelectorAll('#shop-page .tab-btn');
    const contents = document.querySelectorAll('#shop-page .shop-tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(tabId + '-tab').classList.add('active');
            if (tabId === 'chests') loadShopChests();
            else if (tabId === 'units') loadShopUnits();
            else if (tabId === 'cards') loadShopCards();
            else if (tabId === 'currency') loadShopCurrency();
        });
    });
}

function updateAuthUI() {
    const isAuth = getToken() && getPlayer();
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    if (loginBtn) loginBtn.style.display = isAuth ? 'none' : '';
    if (registerBtn) registerBtn.style.display = isAuth ? 'none' : '';
}

function showLogin() {
    hideModal('register-modal');
    showModal('login-modal');
}

function showRegister() {
    hideModal('login-modal');
    showModal('register-modal');
}

function showTutorial() {
    showModal('tutorial-modal');
}

function startGame() {
    navigateTo('game');
    startGameEngine();
}

function returnToLobby() {
    navigateTo('home');
    stopGameEngine();
}

function viewAIReport() {
    showModal('ai-report-modal');
}

function quickPlay(mode) {
    selectMode(mode);
    navigateTo('play');
    // Pre-select first faction and loadout if available
    setTimeout(() => {
        const firstFaction = document.querySelector('.faction-btn');
        if (firstFaction) {
            firstFaction.click();
        }
        const firstLoadout = document.querySelector('.loadout-btn');
        if (firstLoadout) {
            firstLoadout.click();
        }
    }, 100);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initNavigation,
        navigateTo,
        updateAuthUI,
        showLogin,
        showRegister,
        showTutorial,
        quickPlay,
        startGame,
        returnToLobby,
        viewAIReport,
        setupModeSelection,
        selectMode,
        loadFactions,
        loadLoadouts,
        startQuickPlay,
        cancelMatchmaking,
        setupPlayTabs,
        setupCollectionTabs,
        setupShopTabs
    };
}
