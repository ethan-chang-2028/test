// ===== Modal Management =====

function initModals() {
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) hideModal(modal.id);
        });
    });
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal(modal.id);
        });
    });
    setupAuthForms();
    setupMatchmaking();
}

function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            if (!email || !password) { showError('Please enter email and password'); return; }
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            const result = await api.login(email, password);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            if (result.success) {
                showSuccess('Login successful!');
                hideModal('login-modal');
                updateAuthUI();
                navigateTo('home');
            } else {
                showError(result.error || 'Login failed');
            }
        });
    }
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            if (!username || !email || !password) { showError('Please fill in all fields'); return; }
            if (password.length < 8) { showError('Password must be at least 8 characters'); return; }
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Signing up...';
            submitBtn.disabled = true;
            const result = await api.register(username, email, password);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            if (result.success) {
                showSuccess('Registration successful!');
                hideModal('register-modal');
                updateAuthUI();
                navigateTo('home');
            } else {
                showError(result.error || 'Registration failed');
            }
        });
    }
}

function setupMatchmaking() {
    network.on('onMatchFound', (data) => {
        console.log('Match found!', data);
        hideModal('matchmaking-modal');
        startGame();
    });
    network.on('onMatchStart', (data) => {
        console.log('Match starting!', data);
    });
    network.on('onMatchEnd', (data) => {
        console.log('Match ended!', data);
        showGameOver(data);
    });
}

function showGameOver(data) {
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverTitle = document.getElementById('game-over-title');
    const gameOverMessage = document.getElementById('game-over-message');
    if (!gameOverScreen) return;
    if (data.winner === network.team) {
        gameOverTitle.textContent = 'Victory!';
        gameOverTitle.className = 'victory';
        gameOverMessage.textContent = 'You destroyed all enemy spawners!';
    } else {
        gameOverTitle.textContent = 'Defeat';
        gameOverTitle.className = 'defeat';
        gameOverMessage.textContent = 'Your spawner was destroyed.';
    }
    gameOverScreen.classList.add('active');
}

function hideGameOver() {
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) gameOverScreen.classList.remove('active');
}

function loadAIReport(matchId) {
    api.getAIReport(matchId).then(result => {
        if (result.success) displayAIReport(result.data);
        else showError('Failed to load AI report');
    });
}

function displayAIReport(report) {
    const title = document.getElementById('ai-report-title');
    const date = document.getElementById('ai-report-date');
    const grade = document.getElementById('ai-performance-grade');
    const feedback = document.getElementById('ai-overall-feedback');
    const strengths = document.getElementById('ai-strengths');
    const weaknesses = document.getElementById('ai-weaknesses');
    if (title) title.textContent = report.title || 'Match Analysis';
    if (date) date.textContent = new Date(report.createdAt).toLocaleDateString();
    if (grade) grade.textContent = report.overallRating || 'A';
    if (feedback) feedback.textContent = report.overallFeedback || '';
    if (strengths) strengths.innerHTML = report.strengths.map(s => `<li>${s}</li>`).join('') || '<li>No specific strengths identified</li>';
    if (weaknesses) weaknesses.innerHTML = report.weaknesses.map(w => `<li>${w}</li>`).join('') || '<li>No areas for improvement</li>';
    showModal('ai-report-modal');
}

function setupSettingsForm() {
    const settings = getSettings();
    const aiFeedbackCheckbox = document.getElementById('ai-feedback-enabled');
    const soundCheckbox = document.getElementById('sound-enabled');
    const musicCheckbox = document.getElementById('music-enabled');
    if (aiFeedbackCheckbox) aiFeedbackCheckbox.checked = settings.aiFeedbackEnabled !== false;
    if (soundCheckbox) soundCheckbox.checked = settings.soundEnabled !== false;
    if (musicCheckbox) musicCheckbox.checked = settings.musicEnabled !== false;
}

function saveSettings() {
    const settings = {
        aiFeedbackEnabled: document.getElementById('ai-feedback-enabled').checked,
        soundEnabled: document.getElementById('sound-enabled').checked,
        musicEnabled: document.getElementById('music-enabled').checked
    };
    setSettings(settings);
    showSuccess('Settings saved!');
}

function logout() {
    api.logout().then(result => {
        if (result.success) {
            removeToken();
            removePlayer();
            updateAuthUI();
            navigateTo('home');
            showSuccess('Logged out successfully');
        } else {
            showError('Failed to logout');
        }
    });
}

function createCustomGame() {
    const mode = document.getElementById('custom-mode').value;
    const size = document.getElementById('custom-size').value;
    const type = document.getElementById('custom-type').value;
    api.createMatch(mode, type === 'ranked').then(result => {
        if (result.success) {
            const matchId = result.data.id;
            const factionId = getSessionStorage('selected_faction');
            const loadoutId = getSessionStorage('selected_loadout');
            if (factionId && loadoutId) network.joinMatch(matchId, factionId, loadoutId);
            else showError('Please select a faction and loadout');
        } else {
            showError('Failed to create match');
        }
    });
}

function createPrivateGame() {
    api.createMatch('1v1', false).then(result => {
        if (result.success) {
            const matchId = result.data.id;
            showInfo(`Private game created! Invite code: ${matchId}`);
        } else {
            showError('Failed to create private game');
        }
    });
}

function joinPrivateGame() {
    const inviteCode = document.getElementById('invite-code').value;
    if (!inviteCode) { showError('Please enter an invite code'); return; }
    const factionId = getSessionStorage('selected_faction');
    const loadoutId = getSessionStorage('selected_loadout');
    if (!factionId || !loadoutId) { showError('Please select a faction and loadout'); return; }
    network.joinMatch(inviteCode, factionId, loadoutId);
}

function selectMarble(type) {
    if (window.gameEngine) gameEngine.selectedMarbleType = type;
    if (window.network && window.network.matchId) network.fireMarble(type);
    document.querySelectorAll('.marble-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.marble === type) btn.classList.add('active');
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initModals,
        setupAuthForms,
        setupMatchmaking,
        showGameOver,
        hideGameOver,
        loadAIReport,
        displayAIReport,
        setupSettingsForm,
        saveSettings,
        logout,
        createCustomGame,
        createPrivateGame,
        joinPrivateGame,
        selectMarble
    };
}
