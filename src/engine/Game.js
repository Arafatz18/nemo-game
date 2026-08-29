/**
 * Game.js – Core Game Orchestrator
 * 
 * The main game class that owns the game loop, manages state transitions,
 * and coordinates all subsystems (rendering, physics, entities, UI).
 */

import { GAME_WIDTH, GAME_HEIGHT, PLAYER, COLORS, CHAPTERS } from '../data/GameConfig.js';
import { CHAPTER_INTROS } from '../data/StoryData.js';
import Renderer from '../engine/Renderer.js';
import Camera from '../engine/Camera.js';
import Physics from '../engine/Physics.js';
import Input from '../engine/Input.js';
import AssetLoader from '../engine/AssetLoader.js';
import Player from '../entities/Player.js';
import Collectible from '../entities/Collectible.js';
import LevelManager from '../levels/LevelManager.js';
import Parallax from '../levels/Parallax.js';
import LevelGenerator from '../levels/LevelGenerator.js';
import ThirstSystem from '../systems/ThirstSystem.js';
import LightingSystem from '../systems/LightingSystem.js';
import ParticleSystem from '../systems/ParticleSystem.js';
import FogSystem from '../systems/FogSystem.js';
import WeatherSystem from '../systems/WeatherSystem.js';
import PostProcessing from '../systems/PostProcessing.js';
import AudioSystem from '../systems/AudioSystem.js';
import HUD from '../ui/HUD.js';
import DialogueSystem from '../ui/DialogueSystem.js';
import MenuSystem from '../ui/MenuSystem.js';
import MemoryViewer from '../ui/MemoryViewer.js';
import TransitionSystem from '../ui/TransitionSystem.js';

/** Game states */
const STATE = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    CUTSCENE: 'cutscene',
    DIALOGUE: 'dialogue',
    MEMORY_VIEW: 'memory_view',
    GAME_OVER: 'game_over',
    ENDING: 'ending',
    TRANSITIONING: 'transitioning'
};

export default class Game {
    constructor(container) {
        /** @type {HTMLElement} */
        this.container = container;

        // --- Core Engine ---
        this.renderer = new Renderer(container);
        this.camera = new Camera(GAME_WIDTH, GAME_HEIGHT);
        this.physics = new Physics();
        this.input = new Input();
        this.assets = new AssetLoader();

        // --- Entities ---
        this.player = null;

        // --- Level ---
        this.levelManager = new LevelManager();
        this.parallax = new Parallax(null);
        this.levelGenerator = LevelGenerator;
        this.decorations = { trees: [], rocks: [], grass: [], crystals: [], water: [] };

        // --- Systems ---
        this.thirstSystem = new ThirstSystem();
        this.lightingSystem = new LightingSystem(GAME_WIDTH, GAME_HEIGHT);
        this.particleSystem = new ParticleSystem();
        this.fogSystem = new FogSystem();
        this.weatherSystem = new WeatherSystem();
        this.postProcessing = new PostProcessing();
        this.audioSystem = new AudioSystem();

        // --- UI ---
        this.hud = new HUD();
        this.dialogueSystem = new DialogueSystem();
        this.menuSystem = new MenuSystem();
        this.memoryViewer = new MemoryViewer();
        this.transitionSystem = new TransitionSystem();

        // --- State ---
        this.state = STATE.LOADING;
        this.previousState = null;
        this.currentChapter = 0;
        this.totalMemories = 0;
        this.foundSouls = new Set();
        this.unlockedAbilities = new Set(['lantern']);

        // --- Loop ---
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedDt = 1000 / 60; // 60 fps physics
        this.running = false;
        this.frameId = null;

        // --- Debug ---
        this.debugMode = false;
        this.frameCount = 0;
        this.fpsTime = 0;
        this.fps = 0;

        // --- Player lantern light ID ---
        this.lanternLightId = null;

        // Bind the game loop
        this._loop = this._loop.bind(this);
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    async init() {
        // Load assets
        await this.assets.loadImage('nemo', 'assets/sprites/nemo-spritesheet.png');

        // Setup menu callbacks
        this.menuSystem.onSelect((action, data) => {
            switch (action) {
                case 'new_game':
                    this._startNewGame();
                    break;
                case 'continue':
                    this._continueGame();
                    break;
                case 'chapter_select':
                    this.menuSystem.show('chapter_select');
                    break;
                case 'select_chapter':
                    this._loadChapter(data);
                    break;
                case 'settings':
                    this.menuSystem.show('settings');
                    break;
                case 'resume':
                    this._resumeGame();
                    break;
                case 'retry':
                    this._retryFromCheckpoint();
                    break;
                case 'quit_title':
                    this._quitToTitle();
                    break;
                case 'volume_master':
                    this.audioSystem.setMasterVolume(data);
                    break;
                case 'volume_music':
                    this.audioSystem.setMusicVolume(data);
                    break;
                case 'volume_sfx':
                    this.audioSystem.setSfxVolume(data);
                    break;
            }
        });

        // Initialize audio (needs user gesture, will be initialized on start)
        this.state = STATE.MENU;
        this.menuSystem.show('title');

        return this;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.frameId = requestAnimationFrame(this._loop);
    }

    stop() {
        this.running = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    // =========================================================================
    // GAME LOOP
    // =========================================================================

    _loop(timestamp) {
        if (!this.running) return;

        const elapsed = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Clamp elapsed to avoid spiral of death
        const clamped = Math.min(elapsed, 100);
        this.accumulator += clamped;

        // Fixed timestep physics updates
        while (this.accumulator >= this.fixedDt) {
            this._update(this.fixedDt);
            this.accumulator -= this.fixedDt;
        }

        // Render at display refresh rate
        const alpha = this.accumulator / this.fixedDt;
        this._render(alpha);

        // FPS counter
        this.frameCount++;
        this.fpsTime += elapsed;
        if (this.fpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = 0;
        }

        this.frameId = requestAnimationFrame(this._loop);
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    _update(dt) {
        // Always update transitions
        this.transitionSystem.update(dt);

        switch (this.state) {
            case STATE.MENU:
                this._updateMenu(dt);
                break;
            case STATE.PLAYING:
                this._updatePlaying(dt);
                break;
            case STATE.PAUSED:
                this._updatePaused(dt);
                break;
            case STATE.DIALOGUE:
                this._updateDialogue(dt);
                break;
            case STATE.MEMORY_VIEW:
                this._updateMemoryView(dt);
                break;
            case STATE.GAME_OVER:
                this._updateGameOver(dt);
                break;
            case STATE.TRANSITIONING:
                // Just wait for transition to complete
                break;
        }

        // Update input at end of frame
        this.input.update();
    }

    _updateMenu(dt) {
        this.menuSystem.update(dt, this.input);
        // Ambient particles on title screen
        this.particleSystem.update(dt, { x: 0.3, y: 0 });
        this.fogSystem.update(dt, { x: 0.3, y: 0 });

        // Random firefly emission on title screen
        if (Math.random() < 0.02) {
            const w = this.renderer.getWidth();
            const h = this.renderer.getHeight();
            this.particleSystem.emit('firefly', Math.random() * w, Math.random() * h, 1, {});
        }
    }

    _updatePlaying(dt) {
        if (!this.player) return;

        // Check pause
        if (this.input.isPressed('Escape')) {
            this._pauseGame();
            return;
        }

        // Check memory viewer toggle (Tab or M)
        if (this.input.isPressed('Tab') || this.input.isPressed('KeyM')) {
            this.state = STATE.MEMORY_VIEW;
            this.memoryViewer.open();
            return;
        }

        // Toggle debug (F3)
        if (this.input.isPressed('F3')) {
            this.debugMode = !this.debugMode;
            const statsEl = document.getElementById('debug-stats');
            if (statsEl) statsEl.classList.toggle('visible', this.debugMode);
        }

        // --- Player ---
        this.player.update(this.input, this.physics, this.levelManager.platforms, dt);

        // --- Thirst ---
        this.thirstSystem.update(dt, this.player);
        if (this.thirstSystem.getThirstPercent() <= 0) {
            this._playerDeath();
            return;
        }

        // --- Level entities ---
        const levelEvents = this.levelManager.update(dt, this.player);

        // Handle level events
        if (levelEvents) {
            for (const event of levelEvents) {
                this._handleLevelEvent(event);
            }
        }

        // --- Monsters ---
        const monsters = this.levelManager.monsters;
        if (monsters) {
            for (const monster of monsters) {
                if (!monster.active) continue;
                monster.update(this.player, this.levelManager.platforms, this.physics, dt);

                // Check monster-player collision
                if (monster.state === 'ATTACK' || monster.state === 'CHASE') {
                    const mb = monster.getBounds();
                    const pb = this.player.getBounds();
                    if (this._aabbOverlap(mb, pb) && !this.player.invincible) {
                        if (monster.constructor.name === 'HollowChild') {
                            this.thirstSystem.drink(-5); // Drain thirst
                        } else {
                            this.player.takeDamage(monster.damage || 15);
                            this.camera.shake(6, 300);
                            this.audioSystem.playHurt();
                        }
                    }
                }

                // Check lantern repel for certain monsters
                if (this.player.isLanternActive()) {
                    const lp = this.player.getLanternPosition();
                    const dist = Math.hypot(monster.x - lp.x, monster.y - lp.y);
                    if (dist < PLAYER.LANTERN_RADIUS) {
                        monster.onLanternLight && monster.onLanternLight(lp, dist);
                    }
                }
            }
        }

        // --- Collectibles ---
        const collectibles = this.levelManager.collectibles;
        if (collectibles) {
            for (const c of collectibles) {
                if (c.collected) continue;
                c.update(dt);
                const pb = this.player.getBounds();
                const cb = c.getBounds();
                if (this._aabbOverlap(pb, cb)) {
                    this._collectItem(c);
                }
            }
        }

        // --- Camera ---
        this.camera.follow(this.player, this.player.facing * 60);
        this.camera.update(dt);

        // --- Lighting ---
        if (this.player.isLanternActive()) {
            const lp = this.player.getLanternPosition();
            if (this.lanternLightId !== null) {
                this.lightingSystem.updateLight(this.lanternLightId, lp.x, lp.y);
            } else {
                this.lanternLightId = this.lightingSystem.addLight(
                    lp.x, lp.y, PLAYER.LANTERN_RADIUS, COLORS.LANTERN_GLOW || '#a0b8d8', 0.85, true
                );
            }
        } else {
            if (this.lanternLightId !== null) {
                this.lightingSystem.removeLight(this.lanternLightId);
                this.lanternLightId = null;
            }
        }
        this.lightingSystem.update(dt);

        // --- Particles ---
        const wind = this.weatherSystem.getWindForce();
        this.particleSystem.update(dt, wind);

        // Ambient particles
        if (Math.random() < 0.03) {
            const cx = this.camera.x + Math.random() * this.renderer.getWidth();
            const cy = this.camera.y + Math.random() * this.renderer.getHeight();
            this.particleSystem.emit('dust', cx, cy, 1, {});
        }
        if (Math.random() < 0.01) {
            const cx = this.camera.x + Math.random() * this.renderer.getWidth();
            const cy = this.camera.y + this.renderer.getHeight() * 0.5 + Math.random() * this.renderer.getHeight() * 0.3;
            this.particleSystem.emit('firefly', cx, cy, 1, {});
        }

        // --- Fog & Weather ---
        this.fogSystem.update(dt, wind);
        this.weatherSystem.update(dt, this.particleSystem);

        // --- Post-Processing ---
        this.postProcessing.setThirstEffects(this.thirstSystem.getEffects());
        this.postProcessing.update(dt, this.thirstSystem.getEffects());

        // --- Thirst hallucinations ---
        this.thirstSystem.updateHallucinations(dt);

        // --- Player death check ---
        if (this.player.health <= 0 || this.player.y > this.levelManager.getCurrentChapterData()?.levelHeight + 200) {
            this._playerDeath();
        }

        // --- SFX: footsteps ---
        if (this.player.onGround && (this.player.state === 'WALK' || this.player.state === 'RUN')) {
            if (this.frameCount % 12 === 0) {
                this.audioSystem.playStep();
            }
        }

        // --- Debug stats ---
        if (this.debugMode) {
            const statsEl = document.getElementById('debug-stats');
            if (statsEl) {
                statsEl.textContent = `FPS: ${this.fps} | Particles: ${this.particleSystem.getActiveCount()} | ` +
                    `Pos: ${Math.round(this.player.x)},${Math.round(this.player.y)} | ` +
                    `State: ${this.player.state} | Thirst: ${Math.round(this.thirstSystem.getThirstPercent() * 100)}%`;
            }
        }
    }

    _updatePaused(dt) {
        this.menuSystem.update(dt, this.input);
        if (this.input.isPressed('Escape')) {
            this._resumeGame();
        }
    }

    _updateDialogue(dt) {
        this.dialogueSystem.update(dt, this.input);
        if (!this.dialogueSystem.isActive()) {
            this.state = STATE.PLAYING;
        }
    }

    _updateMemoryView(dt) {
        this.memoryViewer.update(dt, this.input);
        if (this.input.isPressed('Escape') || this.input.isPressed('Tab') || this.input.isPressed('KeyM')) {
            this.memoryViewer.close();
            this.state = STATE.PLAYING;
        }
    }

    _updateGameOver(dt) {
        this.menuSystem.update(dt, this.input);
    }

    // =========================================================================
    // RENDER
    // =========================================================================

    _render(alpha) {
        const w = this.renderer.getWidth();
        const h = this.renderer.getHeight();

        // Clear all layers
        this.renderer.clear('all');

        const bgCtx = this.renderer.getContext('bg');
        const gameCtx = this.renderer.getContext('game');
        const lightCtx = this.renderer.getContext('light');
        const uiCtx = this.renderer.getContext('ui');

        switch (this.state) {
            case STATE.MENU:
                this._renderMenu(bgCtx, gameCtx, lightCtx, uiCtx, w, h);
                break;
            case STATE.PLAYING:
            case STATE.DIALOGUE:
            case STATE.MEMORY_VIEW:
            case STATE.PAUSED:
            case STATE.GAME_OVER:
            case STATE.TRANSITIONING:
                this._renderGame(bgCtx, gameCtx, lightCtx, uiCtx, w, h);
                break;
        }

        // Transitions always on top
        if (this.transitionSystem.isActive()) {
            this.transitionSystem.render(uiCtx, w, h);
        }
    }

    _renderMenu(bgCtx, gameCtx, lightCtx, uiCtx, w, h) {
        // Dark gradient background
        const grad = bgCtx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0a0c14');
        grad.addColorStop(0.5, '#080a10');
        grad.addColorStop(1, '#050608');
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, w, h);

        // Fog and particles on title screen
        this.fogSystem.render(bgCtx, null, w, h);
        this.particleSystem.render(gameCtx, null);

        // Menu UI
        this.menuSystem.render(uiCtx, w, h);
    }

    _renderGame(bgCtx, gameCtx, lightCtx, uiCtx, w, h) {
        if (!this.player) return;

        // --- Background / Parallax ---
        const grad = bgCtx.createLinearGradient(0, 0, 0, h);
        const chapterData = this.levelManager.getCurrentChapterData();
        const skyTop = chapterData?.fogColor || '#0a0c14';
        grad.addColorStop(0, skyTop);
        grad.addColorStop(0.6, '#080a10');
        grad.addColorStop(1, '#050608');
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, w, h);

        this.parallax.render(bgCtx, w, h, this.camera);

        // --- Game Layer ---
        gameCtx.save();
        // Apply camera transform
        const cx = -this.camera.x + this.camera.shakeX;
        const cy = -this.camera.y + this.camera.shakeY;
        gameCtx.translate(cx, cy);

        // Render decorations (trees, rocks, etc.)
        if (this.decorations.trees) {
            for (const tree of this.decorations.trees) {
                LevelGenerator.renderTree(gameCtx, tree, this.camera);
            }
        }
        if (this.decorations.rocks) {
            for (const rock of this.decorations.rocks) {
                LevelGenerator.renderRock(gameCtx, rock, this.camera);
            }
        }
        if (this.decorations.water) {
            for (const water of this.decorations.water) {
                LevelGenerator.renderWater(gameCtx, water, this.camera, performance.now());
            }
        }

        // Render platforms
        const platforms = this.levelManager.platforms;
        if (platforms) {
            for (const p of platforms) {
                this._renderPlatform(gameCtx, p);
            }
        }

        // Render collectibles
        const collectibles = this.levelManager.collectibles;
        if (collectibles) {
            for (const c of collectibles) {
                if (!c.collected) c.render(gameCtx, this.camera);
            }
        }

        // Render monsters
        const monsters = this.levelManager.monsters;
        if (monsters) {
            for (const m of monsters) {
                if (m.active) m.render(gameCtx, this.camera);
            }
        }

        // Render player
        const spriteSheet = this.assets.getImage('nemo');
        this.player.render(gameCtx, this.renderer, spriteSheet, this.camera);

        // Render particles (world space)
        this.particleSystem.render(gameCtx, this.camera);

        // Render hallucinations
        this.thirstSystem.renderHallucinations(gameCtx, this.camera);

        gameCtx.restore();

        // --- Fog (screen space) ---
        this.fogSystem.render(bgCtx, this.camera, w, h);

        // --- Lighting Layer ---
        lightCtx.save();
        // Transform lights to camera space
        const ambientLevel = chapterData?.ambientLight || 0.88;
        this.lightingSystem.setAmbient(ambientLevel);

        // We need to offset all lights by camera position
        // The lighting system renders in screen space, so lights need to be in screen space
        // Temporarily shift light positions
        const origLights = this.lightingSystem.lights.map(l => ({ ...l }));
        for (const light of this.lightingSystem.lights) {
            light.x -= this.camera.x - this.camera.shakeX;
            light.y -= this.camera.y - this.camera.shakeY;
        }
        this.lightingSystem.render(lightCtx, w, h);
        // Restore original positions
        for (let i = 0; i < this.lightingSystem.lights.length; i++) {
            if (origLights[i]) {
                this.lightingSystem.lights[i].x = origLights[i].x;
                this.lightingSystem.lights[i].y = origLights[i].y;
            }
        }
        lightCtx.restore();

        // --- Weather overlay (screen space) ---
        this.weatherSystem.render(gameCtx, w, h);

        // --- Post-Processing (screen space) ---
        this.postProcessing.render(uiCtx, w, h);

        // --- UI Layer ---
        const nearInteractable = this._checkNearInteractable();
        this.hud.update(
            0.016,
            this.thirstSystem.getThirstPercent(),
            chapterData,
            nearInteractable,
            this.memoryViewer.getCollectedCount()
        );
        this.hud.render(uiCtx, w, h);

        // Dialogue overlay
        if (this.state === STATE.DIALOGUE) {
            this.dialogueSystem.render(uiCtx, w, h);
        }

        // Memory viewer overlay
        if (this.state === STATE.MEMORY_VIEW) {
            this.memoryViewer.render(uiCtx, w, h);
        }

        // Pause menu overlay
        if (this.state === STATE.PAUSED) {
            this.menuSystem.render(uiCtx, w, h);
        }

        // Game over overlay
        if (this.state === STATE.GAME_OVER) {
            this.menuSystem.render(uiCtx, w, h);
        }
    }

    _renderPlatform(ctx, platform) {
        const { x, y, width, height, type } = platform;

        ctx.save();
        switch (type) {
            case 'solid':
                // Base stone body with dark blue-gray gradient
                const grad = ctx.createLinearGradient(x, y, x, y + Math.min(height, 300));
                grad.addColorStop(0, '#1a2230');
                grad.addColorStop(0.1, '#121822');
                grad.addColorStop(1, '#090b10');
                ctx.fillStyle = grad;
                ctx.fillRect(x, y, width, height);

                // Top grass / stone trim highlight
                ctx.fillStyle = '#3a4c68';
                ctx.fillRect(x, y, width, 4);
                ctx.fillStyle = 'rgba(140, 185, 230, 0.5)';
                ctx.fillRect(x, y, width, 1);

                // Subtle cliff texture lines
                ctx.strokeStyle = 'rgba(60, 80, 110, 0.2)';
                ctx.lineWidth = 1;
                for (let lx = x + 20; lx < x + width; lx += 35) {
                    ctx.beginPath();
                    ctx.moveTo(lx, y + 4);
                    ctx.lineTo(lx + 8, y + Math.min(height, 120));
                    ctx.stroke();
                }
                break;

            case 'one_way':
                // Ethereal floating bridge
                ctx.fillStyle = 'rgba(26, 36, 52, 0.9)';
                ctx.fillRect(x, y, width, height);

                ctx.fillStyle = '#4a6c90';
                ctx.fillRect(x, y, width, 3);

                // Luminous dashes
                ctx.strokeStyle = 'rgba(140, 190, 240, 0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 6]);
                ctx.beginPath();
                ctx.moveTo(x, y + 1);
                ctx.lineTo(x + width, y + 1);
                ctx.stroke();
                ctx.setLineDash([]);
                break;

            case 'moving':
                // Kinetic platform with rune glow
                ctx.fillStyle = '#1c2838';
                ctx.fillRect(x, y, width, height);

                ctx.fillStyle = '#4a82b8';
                ctx.fillRect(x, y, width, 4);

                ctx.fillStyle = 'rgba(120, 180, 255, 0.7)';
                ctx.shadowColor = 'rgba(100, 170, 255, 0.8)';
                ctx.shadowBlur = 8;
                ctx.fillRect(x + width / 2 - 15, y + 8, 30, 4);
                ctx.shadowBlur = 0;
                break;

            case 'crumbling':
                // Fractured earth
                ctx.fillStyle = platform.isCrumbling ? '#30181c' : '#221c24';
                ctx.fillRect(x, y, width, height);

                ctx.fillStyle = platform.isCrumbling ? '#c44' : '#885566';
                ctx.fillRect(x, y, width, 3);

                if (platform.isCrumbling) {
                    ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
                    ctx.fillRect(x + Math.random() * 4 - 2, y, width, height);
                }
                break;

            default:
                ctx.fillStyle = '#1a2230';
                ctx.fillRect(x, y, width, height);
                break;
        }
        ctx.restore();
    }

    // =========================================================================
    // GAME STATE MANAGEMENT
    // =========================================================================

    async _startNewGame() {
        this.audioSystem.init();
        this.currentChapter = 0;
        this.totalMemories = 0;
        this.foundSouls.clear();
        this.unlockedAbilities.clear();
        this.unlockedAbilities.add('lantern');
        this.memoryViewer.memories = [];

        await this._loadChapter(0);
    }

    async _continueGame() {
        this.audioSystem.init();
        const saved = this.levelManager.loadProgress();
        if (saved) {
            this.currentChapter = saved.chapter || 0;
            this.totalMemories = saved.memories || 0;
            await this._loadChapter(this.currentChapter);
        } else {
            await this._startNewGame();
        }
    }

    async _loadChapter(index) {
        this.state = STATE.TRANSITIONING;

        // Transition out
        await this.transitionSystem.fadeOut(600, '#000');

        this.currentChapter = index;
        const chapterData = this.levelManager.loadChapter(index);
        if (!chapterData) {
            console.error(`Failed to load chapter ${index}`);
            this.state = STATE.MENU;
            return;
        }

        // Setup player
        const spawn = chapterData.spawnPoint || { x: 150, y: 460 };
        this.player = new Player(spawn.x, spawn.y);

        // Unlock abilities based on chapter
        const abilityMap = ['lantern', 'dash', 'spiritVision', 'waterWalk', 'memoryReconstruct'];
        for (let i = 0; i <= Math.min(index, abilityMap.length - 1); i++) {
            this.player.unlockAbility(abilityMap[i]);
            this.unlockedAbilities.add(abilityMap[i]);
        }

        // Setup camera
        const lvlData = this.levelManager.getCurrentChapterData();
        const lvlW = lvlData?.levelWidth || 5500;
        const lvlH = lvlData?.levelHeight || 800;
        this.camera.setBounds(lvlW, lvlH);
        this.camera.width = this.renderer.getWidth();
        this.camera.height = this.renderer.getHeight();
        this.camera.x = Math.max(0, spawn.x - this.camera.width / 2);
        this.camera.y = Math.max(0, Math.min(spawn.y - this.camera.height / 2, lvlH - this.camera.height));

        // Setup parallax
        this.parallax = new Parallax(lvlData?.parallaxLayers || null);

        // Generate decorations
        const groundY = 540;
        this.decorations.trees = LevelGenerator.generateTrees(18, lvlW, groundY);
        this.decorations.rocks = LevelGenerator.generateRocks(14, lvlW, groundY);
        this.decorations.grass = LevelGenerator.generateGrass(40, lvlW, groundY);

        // Setup lighting
        this.lightingSystem.clear();
        this.lanternLightId = null;
        this.lightingSystem.setAmbient(lvlData?.ambientLight || 0.55);

        // Add static lights from collectibles and interactables
        const collectibles = this.levelManager.collectibles;
        if (collectibles) {
            for (const c of collectibles) {
                if (c.type === 'well' || c.type === 'spring') {
                    this.lightingSystem.addLight(c.x, c.y, 80, '#4488bb', 0.4, true);
                } else if (c.type === 'memory') {
                    this.lightingSystem.addLight(c.x, c.y, 50, '#bbaa66', 0.3, true);
                }
            }
        }

        // Setup fog
        const fogColor = lvlData.fogColor || '#0a1020';
        this.fogSystem.setFogColor(fogColor);
        this.fogSystem.setDensity(0.4);

        // Setup weather
        const weatherType = lvlData.weatherType || 'clear';
        this.weatherSystem.setWeather(weatherType, 2000);

        // Setup audio
        this.audioSystem.stopMusic(1000);
        setTimeout(() => {
            this.audioSystem.startAmbientMusic(index);
            const ambientTypes = ['forest', 'forest', 'cave', 'water', 'wind', 'cave'];
            this.audioSystem.startAmbient(ambientTypes[index] || 'forest');
        }, 500);

        // Reset thirst
        this.thirstSystem.reset();

        // Reset post-processing
        this.postProcessing.setEffect('chromaticAberration', false, 0);

        // Show chapter title
        const chapterIntro = CHAPTER_INTROS[index];
        await this.transitionSystem.chapterTransition(
            chapterIntro?.title || `Chapter ${index + 1}`,
            chapterIntro?.subtitle || ''
        );

        this.hud.showChapterTitle(
            chapterIntro?.title || `Chapter ${index + 1}`,
            chapterIntro?.subtitle || ''
        );

        // Unlock chapter
        this.levelManager.unlockChapter(index);
        this.levelManager.saveProgress(this.currentChapter, this.totalMemories);

        this.state = STATE.PLAYING;

        // Show intro dialogue if any
        const introMsg = chapterIntro?.intro || chapterIntro?.introText;
        if (introMsg) {
            this.state = STATE.DIALOGUE;
            this.dialogueSystem.showDialogue([
                { speaker: null, text: introMsg, duration: 0 }
            ]);
        }

        // Transition in
        await this.transitionSystem.fadeIn(1200, '#000');
    }

    _pauseGame() {
        this.previousState = this.state;
        this.state = STATE.PAUSED;
        this.menuSystem.show('paused');
        this.audioSystem.suspend();
    }

    _resumeGame() {
        this.state = this.previousState || STATE.PLAYING;
        this.menuSystem.hide();
        this.audioSystem.resume();
    }

    async _retryFromCheckpoint() {
        const checkpoint = this.levelManager.lastCheckpoint;
        if (checkpoint && this.player) {
            this.state = STATE.TRANSITIONING;
            await this.transitionSystem.fadeOut(500, '#000');
            this.player.respawn(checkpoint.x, checkpoint.y);
            this.thirstSystem.reset();
            this.player.health = 100;
            this.menuSystem.hide();
            this.state = STATE.PLAYING;
            await this.transitionSystem.fadeIn(800, '#000');
        } else {
            // Reload entire chapter
            await this._loadChapter(this.currentChapter);
        }
    }

    async _playerDeath() {
        if (this.state === STATE.GAME_OVER) return;

        this.player.die();
        this.audioSystem.playHurt();
        this.camera.shake(10, 500);

        await this.transitionSystem.deathTransition(() => {});
        this.state = STATE.GAME_OVER;
        this.menuSystem.show('game_over');
    }

    async _quitToTitle() {
        this.state = STATE.TRANSITIONING;
        await this.transitionSystem.fadeOut(800, '#000');
        this.audioSystem.stopMusic(500);
        this.player = null;
        this.lightingSystem.clear();
        this.lanternLightId = null;
        this.particleSystem.clear();
        this.state = STATE.MENU;
        this.menuSystem.show('title');
        await this.transitionSystem.fadeIn(800, '#000');
    }

    // =========================================================================
    // GAME EVENTS
    // =========================================================================

    _handleLevelEvent(event) {
        if (!event) return;

        switch (event.type) {
            case 'dialogue':
                this.state = STATE.DIALOGUE;
                this.dialogueSystem.showDialogue(event.entries);
                break;

            case 'checkpoint':
                // Visual feedback
                this.particleSystem.emit('magic', event.x, event.y, 15, {});
                this.audioSystem.playCollect();
                break;

            case 'exit':
                this._loadChapter(event.targetChapter);
                break;

            case 'ability':
                this.player.unlockAbility(event.ability);
                this.unlockedAbilities.add(event.ability);
                this.state = STATE.DIALOGUE;
                this.dialogueSystem.showDialogue([
                    { speaker: null, text: `New ability unlocked: ${event.abilityName}`, duration: 0 }
                ]);
                this.particleSystem.emit('magic', this.player.x, this.player.y, 30, {});
                break;

            case 'boss':
                // Boss intro
                this.camera.pan(event.x, event.y, 2000).then(() => {
                    this.camera.follow(this.player, 60);
                });
                break;

            case 'ending':
                this._triggerEnding(event.endingType);
                break;

            case 'puzzle_solved':
                this.particleSystem.emit('magic', event.x, event.y, 20, {});
                this.audioSystem.playCollect();
                this.camera.shake(3, 200);
                break;
        }
    }

    _collectItem(collectible) {
        collectible.collect();
        this.audioSystem.playCollect();
        this.particleSystem.emit('magic', collectible.x, collectible.y, 10, {});

        switch (collectible.type) {
            case 'water_drop':
                this.thirstSystem.drink(15);
                this.audioSystem.playWaterDrip();
                break;

            case 'well':
                this.thirstSystem.drink(40);
                this.audioSystem.playWaterDrip();
                break;

            case 'spring':
                this.thirstSystem.drink(100);
                this.audioSystem.playWaterDrip();
                break;

            case 'memory':
                this.totalMemories++;
                const memData = {
                    chapter: this.currentChapter,
                    index: this.totalMemories,
                    title: `Memory #${this.totalMemories}`,
                    text: 'A fragment of the past surfaces...'
                };
                this.memoryViewer.addMemory(memData);
                // Show memory pickup dialogue
                this.state = STATE.DIALOGUE;
                this.dialogueSystem.showDialogue([
                    { speaker: null, text: `Memory found: "${memData.title}"`, duration: 0 }
                ]);
                break;

            case 'soul':
                this.foundSouls.add(this.currentChapter);
                this.particleSystem.emit('magic', collectible.x, collectible.y, 30, {});
                this.state = STATE.DIALOGUE;
                this.dialogueSystem.showDialogue([
                    { speaker: '???', text: 'Thank you... I can see the light again.', duration: 0 }
                ]);
                break;
        }

        this.levelManager.saveProgress(this.currentChapter, this.totalMemories);
    }

    _checkNearInteractable() {
        if (!this.player || !this.levelManager.interactables) return null;
        const pb = this.player.getBounds();
        for (const inter of this.levelManager.interactables) {
            if (inter.collected) continue;
            const ib = { x: inter.x - 20, y: inter.y - 20, width: (inter.width || 40) + 40, height: (inter.height || 40) + 40 };
            if (this._aabbOverlap(pb, ib)) {
                return inter;
            }
        }
        return null;
    }

    async _triggerEnding(type) {
        this.state = STATE.ENDING;
        // Determine ending based on memories collected and souls found
        let endingType = type || 'lost';

        if (!type) {
            if (this.memoryViewer.hasAllMemories() && this.foundSouls.size >= 5) {
                endingType = 'secret';
            } else if (this.totalMemories >= 21) { // 70% of 30
                endingType = 'acceptance';
            } else {
                endingType = 'lost';
            }
        }

        await this.transitionSystem.fadeOut(2000, '#000');

        // Show ending dialogue
        // (The ending text would come from StoryData.ENDINGS)
        this.state = STATE.DIALOGUE;
        this.dialogueSystem.showDialogue([
            { speaker: null, text: `Ending: ${endingType}`, duration: 0 }
        ]);

        // After dialogue, show credits/title
        // This would be expanded with full ending sequences
    }

    // =========================================================================
    // UTILITIES
    // =========================================================================

    _aabbOverlap(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    destroy() {
        this.stop();
        this.input.destroy();
        this.renderer.destroy();
        this.audioSystem.suspend();
    }
}
