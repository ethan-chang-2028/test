// ===== API Client =====

class APIClient {
    constructor() {
        this.baseUrl = CONFIG.API.base;
        this.token = getToken();
    }
    
    async request(method, endpoint, data = null, options = {}) {
        const url = this.baseUrl + endpoint;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        };
        
        const config = {
            method,
            headers,
            credentials: 'include',
            ...options
        };
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, config);
            if (response.status === 401 && this.token) {
                const refreshResult = await this.refreshToken();
                if (refreshResult.success) {
                    return this.request(method, endpoint, data, options);
                }
            }
            
            let responseData;
            try {
                responseData = await response.json();
            } catch {
                responseData = {};
            }
            
            if (!response.ok) {
                const error = new Error(responseData.message || 'Request failed');
                error.status = response.status;
                error.data = responseData;
                throw error;
            }
            
            return {
                success: true,
                data: responseData,
                status: response.status
            };
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                error: error.message,
                data: error.data || {}
            };
        }
    }
    
    async login(email, password) {
        const result = await this.request('POST', CONFIG.API.auth.login, { email, password });
        if (result.success) {
            setToken(result.data.token);
            setPlayer(result.data.player);
        }
        return result;
    }
    
    async register(username, email, password) {
        const result = await this.request('POST', CONFIG.API.auth.register, { username, email, password });
        if (result.success) {
            setToken(result.data.token);
            setPlayer(result.data.player);
        }
        return result;
    }
    
    async logout() {
        const result = await this.request('POST', CONFIG.API.auth.logout);
        if (result.success) {
            removeToken();
            removePlayer();
        }
        return result;
    }
    
    async refreshToken() {
        const result = await this.request('POST', CONFIG.API.auth.refresh);
        if (result.success) {
            setToken(result.data.token);
        }
        return result;
    }
    
    async getMe() {
        const result = await this.request('GET', CONFIG.API.players.me);
        if (result.success) {
            setPlayer(result.data);
        }
        return result;
    }
    
    async updateMe(data) {
        const result = await this.request('PUT', CONFIG.API.players.update, data);
        if (result.success) {
            setPlayer(result.data);
        }
        return result;
    }
    
    async getStats() {
        return this.request('GET', CONFIG.API.players.stats);
    }
    
    async getFactions() {
        return this.request('GET', CONFIG.API.factions.list);
    }
    
    async getMyFactionProgress() {
        return this.request('GET', CONFIG.API.factions.myProgress);
    }
    
    async getUnits() {
        return this.request('GET', CONFIG.API.units.list);
    }
    
    async getMyUnits() {
        return this.request('GET', CONFIG.API.units.myUnits);
    }
    
    async getCards() {
        return this.request('GET', CONFIG.API.cards.list);
    }
    
    async getMyCards() {
        return this.request('GET', CONFIG.API.cards.myCards);
    }
    
    async getLoadouts() {
        return this.request('GET', CONFIG.API.loadouts.list);
    }
    
    async createLoadout(data) {
        return this.request('POST', CONFIG.API.loadouts.create, data);
    }
    
    async updateLoadout(id, data) {
        return this.request('PUT', `${CONFIG.API.loadouts.update}/${id}`, data);
    }
    
    async deleteLoadout(id) {
        return this.request('DELETE', `${CONFIG.API.loadouts.delete}/${id}`);
    }
    
    async getShopListings() {
        return this.request('GET', CONFIG.API.shop.listings);
    }
    
    async getChests() {
        return this.request('GET', CONFIG.API.shop.chests);
    }
    
    async purchase(itemId, currencyType) {
        return this.request('POST', CONFIG.API.shop.purchase, { itemId, currencyType });
    }
    
    async getMatches() {
        return this.request('GET', CONFIG.API.matches.list);
    }
    
    async getMyMatches() {
        return this.request('GET', CONFIG.API.matches.myMatches);
    }
    
    async createMatch(mode, isRanked = false) {
        return this.request('POST', CONFIG.API.matches.create, { mode, isRanked });
    }
    
    async joinMatch(matchId, factionId, loadoutId) {
        return this.request('POST', `${CONFIG.API.matches.join}/${matchId}`, { factionId, loadoutId });
    }
    
    async getAIReport(matchId) {
        return this.request('GET', `${CONFIG.API.ai.report}/${matchId}`);
    }
    
    async updateAISettings(settings) {
        return this.request('PUT', CONFIG.API.ai.settings, settings);
    }
    
    async isAuthenticated() {
        if (!this.token) return false;
        const result = await this.getMe();
        return result.success;
    }
    
    async checkAuth() {
        const token = getToken();
        if (!token) return false;
        this.token = token;
        const result = await this.getMe();
        return result.success;
    }
}

const api = new APIClient();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, api };
}
