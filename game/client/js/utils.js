// ===== Utility Functions =====

// ===== Game State =====
const GameState = {
    LOBBY: 'lobby',
    MATCHMAKING: 'matchmaking',
    IN_GAME: 'in_game',
    GAME_OVER: 'game_over'
};

// ===== Local Storage Keys =====
const STORAGE_KEYS = {
    TOKEN: 'paint_battle_token',
    PLAYER: 'paint_battle_player',
    SETTINGS: 'paint_battle_settings',
    SELECTED_FACTION: 'paint_battle_selected_faction',
    SELECTED_LOADOUT: 'paint_battle_selected_loadout'
};

// ===== Settings =====
const DEFAULT_SETTINGS = {
    aiFeedbackEnabled: true,
    soundEnabled: true,
    musicEnabled: true,
    notificationsEnabled: true,
    showTutorial: true
};

// ===== Helper Functions =====

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function lerp(start, end, t) {
    return start + (end - start) * t;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function weightedRandom(weightedArray) {
    const totalWeight = weightedArray.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const item of weightedArray) {
        if (random < item.weight) {
            return item.item;
        }
        random -= item.weight;
    }
    return weightedArray[weightedArray.length - 1].item;
}

function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPercent(value, decimals = 0) {
    return (value * 100).toFixed(decimals) + '%';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function snakeToTitle(str) {
    return str.split('_').map(word => capitalize(word)).join(' ');
}

function truncate(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== Local Storage =====

function getStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to local storage:', e);
    }
}

function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error('Error removing from local storage:', e);
    }
}

function clearStorage() {
    Object.values(STORAGE_KEYS).forEach(key => removeStorage(key));
}

// ===== Session Storage =====

function getSessionStorage(key, defaultValue = null) {
    try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setSessionStorage(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to session storage:', e);
    }
}

// ===== Token Management =====

function getToken() {
    return getStorage(STORAGE_KEYS.TOKEN, null);
}

function setToken(token) {
    setStorage(STORAGE_KEYS.TOKEN, token);
}

function removeToken() {
    removeStorage(STORAGE_KEYS.TOKEN);
}

function getPlayer() {
    return getStorage(STORAGE_KEYS.PLAYER, null);
}

function setPlayer(player) {
    setStorage(STORAGE_KEYS.PLAYER, player);
}

function removePlayer() {
    removeStorage(STORAGE_KEYS.PLAYER);
}

// ===== Settings Management =====

function getSettings() {
    return { ...DEFAULT_SETTINGS, ...getStorage(STORAGE_KEYS.SETTINGS, {}) };
}

function setSettings(settings) {
    setStorage(STORAGE_KEYS.SETTINGS, settings);
}

function getSetting(key, defaultValue = null) {
    const settings = getSettings();
    return settings.hasOwnProperty(key) ? settings[key] : defaultValue;
}

function setSetting(key, value) {
    const settings = getSettings();
    settings[key] = value;
    setSettings(settings);
}

// ===== Game State =====

function getGameState() {
    return getSessionStorage('game_state', GameState.LOBBY);
}

function setGameState(state) {
    setSessionStorage('game_state', state);
}

// ===== DOM Helpers =====

function showElement(element) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.style.display = '';
    }
}

function hideElement(element) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.style.display = 'none';
    }
}

function toggleElement(element) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.style.display = element.style.display === 'none' ? '' : 'none';
    }
}

function addClass(element, className) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.classList.add(className);
    }
}

function removeClass(element, className) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.classList.remove(className);
    }
}

function toggleClass(element, className) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.classList.toggle(className);
    }
}

function setText(element, text) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.textContent = text;
    }
}

function setHTML(element, html) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.innerHTML = html;
    }
}

function getFormData(form) {
    const data = {};
    const formData = new FormData(form);
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

// ===== Toast Notifications =====

function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
        success: '✓',
        error: '✗',
        info: 'ℹ️',
        warning: '⚠️'
    };
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
    return toast;
}

function showSuccess(message, duration = 3000) {
    showToast(message, 'success', duration);
}

function showError(message, duration = 3000) {
    showToast(message, 'error', duration);
}

function showInfo(message, duration = 3000) {
    showToast(message, 'info', duration);
}

function showWarning(message, duration = 3000) {
    showToast(message, 'warning', duration);
}

// ===== Modal Management =====

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('active');
        document.body.style.overflow = modal.classList.contains('active') ? 'hidden' : '';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// ===== Navigation =====

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageId) {
            btn.classList.add('active');
        }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
    window.history.back();
}

// ===== Loading State =====

function showLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
}

function setLoadingProgress(progress) {
    const progressBar = document.querySelector('.loading-progress');
    if (progressBar) {
        progressBar.style.width = `${clamp(progress, 0, 100)}%`;
    }
}

function setLoadingText(text) {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = text;
    }
}

// ===== Export =====

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameState,
        STORAGE_KEYS,
        DEFAULT_SETTINGS,
        CONFIG,
        clamp,
        lerp,
        distance,
        manhattanDistance,
        randomInt,
        randomFloat,
        shuffleArray,
        randomChoice,
        weightedRandom,
        generateId,
        formatTime,
        formatNumber,
        formatPercent,
        capitalize,
        snakeToTitle,
        truncate,
        debounce,
        throttle,
        sleep,
        getStorage,
        setStorage,
        removeStorage,
        clearStorage,
        getSessionStorage,
        setSessionStorage,
        getToken,
        setToken,
        removeToken,
        getPlayer,
        setPlayer,
        removePlayer,
        getSettings,
        setSettings,
        getSetting,
        setSetting,
        getGameState,
        setGameState,
        showElement,
        hideElement,
        toggleElement,
        addClass,
        removeClass,
        toggleClass,
        setText,
        setHTML,
        getFormData,
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        showModal,
        hideModal,
        toggleModal,
        closeAllModals,
        navigateTo,
        goBack,
        showLoading,
        hideLoading,
        setLoadingProgress,
        setLoadingText
    };
}
