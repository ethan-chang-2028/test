// ===== Game Input Handler =====

class GameInput {
    constructor(canvas, engine) {
        this.canvas = canvas;
        this.engine = engine;
        this.renderer = null;
        this.mouse = { x: 0, y: 0, down: false, button: null };
        this.keys = {};
        this.touches = {};
        this.selectedUnit = null;
        this.selectedCard = null;
        this.selectedMarble = CONFIG.MARBLE_TYPES.ATTACK;
        this.hoveredTile = null;
        this.init();
    }
    
    init() {
        this.setupMouseEvents();
        this.setupKeyboardEvents();
        this.setupTouchEvents();
        this.setupContextMenu();
    }
    
    setRenderer(renderer) {
        this.renderer = renderer;
    }
    
    setupMouseEvents() {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        if (this.renderer) {
            const cameraX = this.renderer.camera.x || 0;
            const cameraY = this.renderer.camera.y || 0;
            const zoom = this.renderer.camera.zoom || 1;
            const worldX = (this.mouse.x - cameraX) / zoom;
            const worldY = (this.mouse.y - cameraY) / zoom;
            const gridX = Math.floor(worldX / this.engine.tileSize);
            const gridY = Math.floor(worldY / this.engine.tileSize);
            const tile = this.engine.getTile(gridX, gridY);
            this.hoveredTile = tile || null;
        }
    }
    
    handleMouseDown(e) {
        this.mouse.down = true;
        this.mouse.button = e.button;
        switch (e.button) {
            case 0: this.handleLeftClick(e); break;
            case 1: this.handleMiddleClick(e); break;
            case 2: this.handleRightClick(e); break;
        }
    }
    
    handleMouseUp(e) {
        this.mouse.down = false;
        this.mouse.button = null;
    }
    
    handleClick(e) {}
    
    handleDoubleClick(e) {
        if (this.renderer) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cameraX = this.renderer.camera.x || 0;
            const cameraY = this.renderer.camera.y || 0;
            const zoom = this.renderer.camera.zoom || 1;
            const worldX = (x - cameraX) / zoom;
            const worldY = (y - cameraY) / zoom;
            this.renderer.camera.x = this.canvas.width / 2 - worldX * zoom;
            this.renderer.camera.y = this.canvas.height / 2 - worldY * zoom;
        }
    }
    
    handleContextMenu(e) {
        e.preventDefault();
        if (this.hoveredTile) this.showTileContextMenu(e.clientX, e.clientY, this.hoveredTile);
    }
    
    handleWheel(e) {
        e.preventDefault();
        if (this.renderer) {
            const zoomChange = e.deltaY > 0 ? -0.1 : 0.1;
            this.renderer.zoomCamera(zoomChange);
        }
    }
    
    handleLeftClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (this.renderer) {
            const cameraX = this.renderer.camera.x || 0;
            const cameraY = this.renderer.camera.y || 0;
            const zoom = this.renderer.camera.zoom || 1;
            const worldX = (x - cameraX) / zoom;
            const worldY = (y - cameraY) / zoom;
            const gridX = Math.floor(worldX / this.engine.tileSize);
            const gridY = Math.floor(worldY / this.engine.tileSize);
            const tile = this.engine.getTile(gridX, gridY);
            if (tile) {
                const unit = tile.units.find(u => u.team === this.engine.currentTeam);
                if (unit) {
                    this.selectedUnit = unit;
                    this.engine.selectedUnit = unit;
                } else {
                    this.selectedUnit = null;
                    this.engine.selectedUnit = null;
                    if (this.selectedUnit) {
                        this.engine.moveUnit(this.selectedUnit, gridX, gridY);
                    }
                }
            }
        }
    }
    
    handleMiddleClick(e) {}
    handleRightClick(e) {}
    
    setupKeyboardEvents() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                if (this.renderer) this.renderer.moveCamera(0, -20);
                break;
            case 'KeyS':
            case 'ArrowDown':
                if (this.renderer) this.renderer.moveCamera(0, 20);
                break;
            case 'KeyA':
            case 'ArrowLeft':
                if (this.renderer) this.renderer.moveCamera(-20, 0);
                break;
            case 'KeyD':
            case 'ArrowRight':
                if (this.renderer) this.renderer.moveCamera(20, 0);
                break;
            case 'KeyR':
                if (this.renderer) this.renderer.resetCamera();
                break;
            case 'Space':
                this.engine.fireMarble();
                break;
            case 'Digit1':
                this.selectedMarble = CONFIG.MARBLE_TYPES.ATTACK;
                this.engine.selectedMarbleType = CONFIG.MARBLE_TYPES.ATTACK;
                break;
            case 'Digit2':
                this.selectedMarble = CONFIG.MARBLE_TYPES.BUFF;
                this.engine.selectedMarbleType = CONFIG.MARBLE_TYPES.BUFF;
                break;
            case 'Digit3':
                this.selectedMarble = CONFIG.MARBLE_TYPES.SPLIT;
                this.engine.selectedMarbleType = CONFIG.MARBLE_TYPES.SPLIT;
                break;
            case 'Escape':
                this.selectedUnit = null;
                this.selectedCard = null;
                this.engine.selectedUnit = null;
                break;
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    setupTouchEvents() {
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchcancel', (e) => this.handleTouchCancel(e));
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            this.touches[touch.identifier] = {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY,
                startTime: Date.now()
            };
        }
        if (e.touches.length === 1) this.handleTap(e.touches[0]);
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const touchData = this.touches[touch.identifier];
            if (touchData) {
                const now = Date.now();
                if (now - touchData.startTime < 300) {
                    const dx = touch.clientX - touchData.startX;
                    const dy = touch.clientY - touchData.startY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 20) this.handleDoubleTap(touch);
                }
                delete this.touches[touch.identifier];
            }
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const touchData = this.touches[touch.identifier];
            if (touchData) {
                touchData.x = touch.clientX;
                touchData.y = touch.clientY;
            }
        }
        if (Object.keys(this.touches).length >= 2) this.handlePinchZoom(e);
    }
    
    handleTouchCancel(e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            delete this.touches[touch.identifier];
        }
    }
    
    handleTap(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.handleLeftClick({ clientX: touch.clientX, clientY: touch.clientY });
    }
    
    handleDoubleTap(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.handleDoubleClick({ clientX: touch.clientX, clientY: touch.clientY });
    }
    
    handlePinchZoom(e) {
        if (Object.keys(this.touches).length < 2) return;
        const touchIds = Object.keys(this.touches);
        const touch1 = this.touches[touchIds[0]];
        const touch2 = this.touches[touchIds[1]];
        const dx = touch2.x - touch1.x;
        const dy = touch2.y - touch1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (this.lastPinchDistance) {
            const zoomChange = (distance - this.lastPinchDistance) * 0.005;
            if (this.renderer) this.renderer.zoomCamera(zoomChange);
        }
        this.lastPinchDistance = distance;
    }
    
    setupContextMenu() {
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'game-context-menu';
        this.contextMenu.style.display = 'none';
        this.contextMenu.style.position = 'absolute';
        this.contextMenu.style.background = 'var(--surface-light)';
        this.contextMenu.style.border = '1px solid var(--border)';
        this.contextMenu.style.borderRadius = 'var(--radius)';
        this.contextMenu.style.padding = '0.5rem';
        this.contextMenu.style.zIndex = '10000';
        this.contextMenu.style.boxShadow = 'var(--shadow-lg)';
        document.body.appendChild(this.contextMenu);
    }
    
    showTileContextMenu(x, y, tile) {
        this.contextMenu.innerHTML = '';
        const unit = tile.units.find(u => u.team === this.engine.currentTeam);
        if (unit) {
            const moveBtn = document.createElement('button');
            moveBtn.textContent = 'Move';
            moveBtn.className = 'context-menu-item';
            moveBtn.onclick = () => {
                this.selectedUnit = unit;
                this.engine.selectedUnit = unit;
                this.hideContextMenu();
            };
            this.contextMenu.appendChild(moveBtn);
            const attackBtn = document.createElement('button');
            attackBtn.textContent = 'Attack';
            attackBtn.className = 'context-menu-item';
            attackBtn.onclick = () => {
                const enemy = this.engine.findNearestEnemy(unit);
                if (enemy) this.engine.attackUnit(unit, enemy);
                this.hideContextMenu();
            };
            this.contextMenu.appendChild(attackBtn);
        } else {
            const moveHereBtn = document.createElement('button');
            moveHereBtn.textContent = 'Move Here';
            moveHereBtn.className = 'context-menu-item';
            moveHereBtn.onclick = () => {
                if (this.selectedUnit) this.engine.moveUnit(this.selectedUnit, tile.x, tile.y);
                this.hideContextMenu();
            };
            this.contextMenu.appendChild(moveHereBtn);
        }
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.style.display = 'block';
    }
    
    hideContextMenu() {
        this.contextMenu.style.display = 'none';
    }
    
    selectMarble(type) {
        this.selectedMarble = type;
        this.engine.selectedMarbleType = type;
        document.querySelectorAll('.marble-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.marble === type) btn.classList.add('active');
        });
    }
    
    selectCard(card) {
        this.selectedCard = card;
        this.engine.selectedCard = card;
    }
    
    selectUnit(unit) {
        this.selectedUnit = unit;
        this.engine.selectedUnit = unit;
    }
    
    destroy() {
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('click', this.handleClick);
        this.canvas.removeEventListener('dblclick', this.handleDoubleClick);
        this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
        this.canvas.removeEventListener('wheel', this.handleWheel);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchcancel', this.handleTouchCancel);
        if (this.contextMenu) this.contextMenu.remove();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameInput;
}
