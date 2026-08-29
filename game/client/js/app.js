// ===== Main Application =====

let gameEngine = null;
let gameRenderer = null;
let gameInput = null;

async function initApp() {
    console.log('Initializing Paint Battle...');
    showLoading();
    setLoadingText('Initializing...');
    try {
        setLoadingProgress(10);
        await loadConfig();
        setLoadingProgress(20);
        await initAPI();
        setLoadingProgress(30);
        initNetwork();
        setLoadingProgress(40);
        await checkAuth();
        setLoadingProgress(50);
        initUI();
        setLoadingProgress(60);
        initGame();
        setLoadingProgress(70);
        await loadInitialData();
        setLoadingProgress(100);
        setLoadingText('Ready to play!');
        await sleep(500);
        hideLoading();
        console.log('Paint Battle initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        hideLoading();
        showError('Failed to initialize the game');
    }
}

async function loadConfig() {
    return Promise.resolve();
}

async function initAPI() {
    return Promise.resolve();
}

function initNetwork() {
    network.on('onConnect', () => {
        console.log('Connected to server');
        checkAuth();
    });
    network.on('onDisconnect', () => {
        console.log('Disconnected from server');
        showError('Disconnected from server. Attempting to reconnect...');
    });
    network.on('onMatchFound', (data) => {
        console.log('Match found:', data);
        hideModal('matchmaking-modal');
        startGame(data.matchId);
    });
    network.on('onMatchStart', (data) => {
        console.log('Match starting:', data);
        startGameEngine(data);
    });
    network.on('onMatchEnd', (data) => {
        console.log('Match ended:', data);
        endGame(data);
    });
    network.on('onMatchUpdate', (data) => {
        if (gameEngine) gameEngine.setState(data.state);
    });
    network.on('onError', (error) => {
        console.error('Network error:', error);
        showError('Network error occurred');
    });
}

async function checkAuth() {
    const isAuth = await api.checkAuth();
    if (isAuth) {
        const player = getPlayer();
        if (player) network.setPlayerId(player.id);
    }
    updateAuthUI();
}

function initUI() {
    initNavigation();
    initModals();
    setupGlobalEvents();
}

function setupGlobalEvents() {
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') closeAllModals();
    });
    window.addEventListener('blur', () => {
        if (gameEngine) gameEngine.pause();
    });
    window.addEventListener('focus', () => {
        if (gameEngine) gameEngine.resume();
    });
    window.addEventListener('beforeunload', () => {
        if (gameEngine) gameEngine.stop();
        if (network) network.disconnect();
    });
}

async function loadInitialData() {
    const factionsResult = await api.getFactions();
    if (factionsResult.success) window.factions = factionsResult.data;
    const player = getPlayer();
    if (player) {
        const meResult = await api.getMe();
        if (meResult.success) setPlayer(meResult.data);
        await Promise.all([
            api.getMyUnits(),
            api.getMyCards(),
            api.getMyFactionProgress(),
            api.getLoadouts(),
            api.getStats()
        ]);
    }
}

function initGame() {
    const heroCanvas = document.getElementById('hero-canvas');
    const gameCanvas = document.getElementById('game-canvas');
    if (heroCanvas) createHeroAnimation(heroCanvas);
    if (gameCanvas) {
        gameEngine = new GameEngine(gameCanvas, {
            gridSize: 5,
            tileSize: CONFIG.TILE_SIZE
        });
        gameRenderer = new GameRenderer(gameCanvas, gameEngine);
        gameInput = new GameInput(gameCanvas, gameEngine);
        gameInput.setRenderer(gameRenderer);
        gameEngine.setSocket(network);
        network.setEngine(gameEngine);
        gameEngine.on('onMarbleFire', (marble) => console.log('Marble fired:', marble.type));
        gameEngine.on('onUnitSpawn', (unit) => console.log('Unit spawned:', unit.type));
        gameEngine.on('onUnitDie', (unit) => console.log('Unit died:', unit.type));
        gameEngine.on('onMatchEnd', (data) => { console.log('Match ended:', data); endGame(data); });
    }
}

function createHeroAnimation(canvas) {
    const engine = new GameEngine(canvas, {
        gridSize: 5,
        tileSize: 30
    });
    const renderer = new GameRenderer(canvas, engine);
    engine.createUnit({ type: CONFIG.UNIT_TYPES.MELEE, x: 2, y: 2, team: 1 });
    engine.createUnit({ type: CONFIG.UNIT_TYPES.RANGED, x: 1, y: 3, team: 2 });
    engine.createUnit({ type: CONFIG.UNIT_TYPES.BUFF, x: 3, y: 1, team: 1 });
    setInterval(() => {
        engine.fireMarble(randomChoice([
            CONFIG.MARBLE_TYPES.ATTACK,
            CONFIG.MARBLE_TYPES.BUFF,
            CONFIG.MARBLE_TYPES.SPLIT
        ]));
    }, 2000);
    engine.start();
    renderer.start();
}

function startHeroAnimation() {}

function startGame(matchId) {
    setGameState(GameState.IN_GAME);
    navigateTo('game');
    network.matchId = matchId;
    startGameEngine();
}

function startGameEngine(data) {
    if (!gameEngine) return;
    if (data && data.state) gameEngine.setState(data.state);
    const player = getPlayer();
    if (player) gameEngine.setCurrentPlayer(player.id, data?.team || 1);
    gameEngine.start();
    updateGameUI();
}

function stopGameEngine() {
    if (gameEngine) gameEngine.stop();
    if (gameRenderer) gameRenderer.stop();
}

function endGame(data) {
    setGameState(GameState.GAME_OVER);
    showGameOver(data);
    stopGameEngine();
    network.leaveMatch();
    const settings = getSettings();
    if (settings.aiFeedbackEnabled && data.matchId) loadAIReport(data.matchId);
}

function updateGameUI() {
    const timerEl = document.getElementById('game-timer');
    if (timerEl && gameEngine) timerEl.textContent = formatTime(Math.floor(gameEngine.elapsedTime / 1000));
    updatePlayerStats();
}

function updatePlayerStats() {
    const goldEl = document.getElementById('player-gold');
    const unitsEl = document.getElementById('player-units');
    const hpEl = document.getElementById('player-hp');
    if (goldEl) goldEl.textContent = '0';
    if (unitsEl) unitsEl.textContent = gameEngine ? gameEngine.units.length : '0';
    if (hpEl) hpEl.textContent = '100';
}

async function loadProfileData() {
    const player = getPlayer();
    if (!player) return;
    const usernameEl = document.getElementById('profile-username');
    const levelEl = document.getElementById('profile-level');
    const xpEl = document.getElementById('profile-xp');
    const xpMaxEl = document.getElementById('profile-xp-max');
    if (usernameEl) usernameEl.textContent = player.username || 'Player';
    if (levelEl) levelEl.textContent = player.globalLevel || 1;
    if (xpEl) xpEl.textContent = player.globalXP || 0;
    if (xpMaxEl) xpMaxEl.textContent = player.globalLevel * 1000 || 1000;
    const statsResult = await api.getStats();
    if (statsResult.success) {
        const stats = statsResult.data;
        const winsEl = document.getElementById('stat-wins');
        const matchesEl = document.getElementById('stat-matches');
        const killsEl = document.getElementById('stat-kills');
        const goldEl = document.getElementById('stat-gold');
        if (winsEl) winsEl.textContent = stats.wins || 0;
        if (matchesEl) matchesEl.textContent = stats.matches || 0;
        if (killsEl) killsEl.textContent = stats.kills || 0;
        if (goldEl) goldEl.textContent = stats.totalGold || 0;
    }
}

async function loadRecentMatches() {
    const container = document.getElementById('matches-list');
    if (!container) return;
    container.innerHTML = '';
    const result = await api.getMyMatches();
    if (result.success) {
        const matches = result.data.slice(0, 10);
        matches.forEach(match => {
            const item = createMatchItem(match);
            container.appendChild(item);
        });
    }
}

function createMatchItem(match) {
    const item = document.createElement('div');
    item.className = 'match-item';
    const mode = snakeToTitle(match.mode);
    const date = new Date(match.createdAt).toLocaleDateString();
    const result = match.winnerId === getPlayer()?.id ? 'win' : 'loss';
    const resultText = result === 'win' ? 'Win' : 'Loss';
    item.innerHTML = `
        <div class="match-info">
            <span class="match-mode">${mode}</span>
            <span class="match-date">${date}</span>
        </div>
        <div class="match-result ${result}">${resultText}</div>
    `;
    item.addEventListener('click', () => showMatchDetails(match));
    return item;
}

function showMatchDetails(match) {
    let modal = document.getElementById('match-details-modal');
    if (!modal) createMatchDetailsModal();
    modal = document.getElementById('match-details-modal');
    const title = modal.querySelector('.modal-header h2');
    const mode = modal.querySelector('.match-mode-display');
    const date = modal.querySelector('.match-date-display');
    const result = modal.querySelector('.match-result-display');
    const duration = modal.querySelector('.match-duration-display');
    if (title) title.textContent = `Match #${match.id}`;
    if (mode) mode.textContent = `Mode: ${snakeToTitle(match.mode)}`;
    if (date) date.textContent = `Date: ${new Date(match.createdAt).toLocaleString()}`;
    if (result) {
        const isWin = match.winnerId === getPlayer()?.id;
        result.textContent = `Result: ${isWin ? 'Victory' : 'Defeat'}`;
        result.className = `match-result-display ${isWin ? 'win' : 'loss'}`;
    }
    if (duration) {
        const endTime = match.endTime ? new Date(match.endTime) : new Date();
        const startTime = new Date(match.createdAt);
        const durationSecs = Math.floor((endTime - startTime) / 1000);
        duration.textContent = `Duration: ${formatTime(durationSecs)}`;
    }
    showModal('match-details-modal');
}

function createMatchDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'match-details-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Match Details</h2>
                <button class="modal-close" onclick="hideModal('match-details-modal')">×</button>
            </div>
            <div class="modal-body">
                <div class="match-details">
                    <div class="match-info-grid">
                        <div class="info-row"><span class="info-label">Mode:</span><span class="info-value match-mode-display"></span></div>
                        <div class="info-row"><span class="info-label">Date:</span><span class="info-value match-date-display"></span></div>
                        <div class="info-row"><span class="info-label">Result:</span><span class="info-value match-result-display"></span></div>
                        <div class="info-row"><span class="info-label">Duration:</span><span class="info-value match-duration-display"></span></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="hideModal('match-details-modal')">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initApp,
        loadConfig,
        initAPI,
        initNetwork,
        checkAuth,
        initUI,
        setupGlobalEvents,
        loadInitialData,
        initGame,
        createHeroAnimation,
        startHeroAnimation,
        startGame,
        startGameEngine,
        stopGameEngine,
        endGame,
        updateGameUI,
        updatePlayerStats,
        loadProfileData,
        loadRecentMatches,
        createMatchItem,
        showMatchDetails,
        createMatchDetailsModal
    };
}
