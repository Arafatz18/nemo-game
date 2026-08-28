/**
 * LevelManager.js – Level Loading & State Management
 * 
 * Loads chapter data, instantiates monsters/collectibles,
 * manages moving/crumbling platforms, triggers, and checkpoints.
 */

import { LEVELS } from '../data/LevelData.js';
import Watcher from '../entities/Watcher.js';
import Crawler from '../entities/Crawler.js';
import HollowChild from '../entities/HollowChild.js';
import Drowned from '../entities/Drowned.js';
import RegretBeast from '../entities/RegretBeast.js';
import Collectible from '../entities/Collectible.js';

const CHAPTER_KEYS = ['CHAPTER_1', 'CHAPTER_2', 'CHAPTER_3', 'CHAPTER_4', 'CHAPTER_5', 'CHAPTER_6'];

const MONSTER_MAP = {
    'watcher': Watcher,
    'crawler': Crawler,
    'hollow_child': HollowChild,
    'drowned': Drowned,
    'regret_beast': RegretBeast
};

export default class LevelManager {
    constructor() {
        this.currentChapter = 0;
        this.platforms = [];
        this.monsters = [];
        this.collectibles = [];
        this.interactables = [];
        this.triggers = [];
        this.checkpoints = [];
        this.exits = [];
        this.lastCheckpoint = null;
        this.unlockedChapters = [0]; // Chapter indices unlocked

        // Load saved progress
        this._loadUnlockedChapters();
    }

    /**
     * Load a chapter by index (0-5).
     * Returns the chapter data object, or null on failure.
     */
    loadChapter(index) {
        this.currentChapter = index;
        const key = CHAPTER_KEYS[index];
        const data = LEVELS[key];

        // Reset all arrays
        this.platforms = [];
        this.monsters = [];
        this.collectibles = [];
        this.interactables = [];
        this.triggers = [];
        this.checkpoints = [];
        this.exits = [];
        this.lastCheckpoint = null;

        if (!data) {
            console.warn(`LevelManager: No data for chapter index ${index} (key: ${key})`);
            return null;
        }

        // --- Platforms ---
        if (data.platforms) {
            for (const p of data.platforms) {
                this.platforms.push({
                    x: p.x,
                    y: p.y,
                    width: p.width || 200,
                    height: p.height || 32,
                    type: p.type || 'solid',
                    crumbleTimer: 0,
                    crumbleDuration: p.crumbleDuration || 1500,
                    isCrumbling: false,
                    destroyed: false
                });
            }
        }

        // --- Moving Platforms ---
        if (data.movingPlatforms) {
            for (const mp of data.movingPlatforms) {
                this.platforms.push({
                    x: mp.x,
                    y: mp.y,
                    width: mp.width || 120,
                    height: mp.height || 24,
                    type: 'moving',
                    originX: mp.x,
                    originY: mp.y,
                    moveX: mp.moveX || 0,
                    moveY: mp.moveY || 0,
                    speed: mp.speed || 1,
                    phase: 0,
                    crumbleTimer: 0,
                    destroyed: false
                });
            }
        }

        // --- Monsters ---
        if (data.monsters) {
            for (const m of data.monsters) {
                const MonsterClass = MONSTER_MAP[m.type];
                if (MonsterClass) {
                    const monster = new MonsterClass(m.x, m.y, {
                        patrolRange: m.patrolRange || 200,
                        ...m
                    });
                    this.monsters.push(monster);
                } else {
                    console.warn(`LevelManager: Unknown monster type "${m.type}"`);
                }
            }
        }

        // --- Collectibles ---
        if (data.collectibles) {
            for (const c of data.collectibles) {
                this.collectibles.push(new Collectible(c.x, c.y, c.type || 'water_drop'));
            }
        }

        // --- Interactables ---
        if (data.interactables) {
            this.interactables = data.interactables.map(i => ({
                ...i,
                collected: false
            }));
        }

        // --- Triggers ---
        if (data.triggers) {
            this.triggers = data.triggers.map(t => ({
                ...t,
                fired: false
            }));
        }

        // --- Checkpoints ---
        if (data.checkpoints) {
            this.checkpoints = data.checkpoints.map(cp => ({
                x: cp.x,
                y: cp.y,
                width: cp.width || 40,
                height: cp.height || 80,
                activated: false
            }));
        }

        // --- Exits ---
        if (data.exits) {
            this.exits = data.exits.map(e => ({
                ...e,
                triggered: false
            }));
        }

        // Set initial checkpoint to spawn point
        this.lastCheckpoint = data.spawnPoint || { x: 100, y: 300 };

        return data;
    }

    /**
     * Update all level entities each frame.
     * Returns an array of events that occurred this frame (or null).
     */
    update(dt, player) {
        const events = [];
        const pb = player.getBounds ? player.getBounds() : { x: player.x, y: player.y, width: player.width || 40, height: player.height || 64 };

        // --- Moving Platforms ---
        for (const p of this.platforms) {
            if (p.type === 'moving') {
                p.phase += (p.speed || 1) * dt * 0.001;
                const sin = Math.sin(p.phase);
                p.x = p.originX + (p.moveX || 0) * sin;
                p.y = p.originY + (p.moveY || 0) * sin;
            }

            // Crumbling platforms
            if (p.type === 'crumbling' && !p.destroyed) {
                if (p.isCrumbling) {
                    p.crumbleTimer += dt;
                    if (p.crumbleTimer >= p.crumbleDuration) {
                        p.destroyed = true;
                    }
                } else {
                    // Start crumbling on player contact
                    if (this._overlap(pb, p)) {
                        p.isCrumbling = true;
                    }
                }
            }
        }

        // Remove destroyed platforms
        this.platforms = this.platforms.filter(p => !p.destroyed);

        // --- Checkpoints ---
        for (const cp of this.checkpoints) {
            if (!cp.activated && this._overlap(pb, cp)) {
                cp.activated = true;
                this.lastCheckpoint = { x: cp.x, y: cp.y };
                events.push({ type: 'checkpoint', x: cp.x, y: cp.y });
            }
        }

        // --- Triggers ---
        for (const t of this.triggers) {
            if (!t.fired && this._overlap(pb, {
                x: t.x, y: t.y,
                width: t.width || 60,
                height: t.height || 100
            })) {
                t.fired = true;
                events.push({
                    type: t.event || 'dialogue',
                    ...t
                });
            }
        }

        // --- Exits ---
        for (const exit of this.exits) {
            if (!exit.triggered && this._overlap(pb, exit)) {
                exit.triggered = true;
                // Map chapter key to index
                const targetKey = exit.targetChapter;
                const targetIndex = CHAPTER_KEYS.indexOf(targetKey);
                if (targetIndex !== -1) {
                    events.push({ type: 'exit', targetChapter: targetIndex });
                }
            }
        }

        return events.length > 0 ? events : null;
    }

    /**
     * Get current chapter's data object.
     */
    getCurrentChapterData() {
        const key = CHAPTER_KEYS[this.currentChapter];
        return LEVELS[key] || null;
    }

    /**
     * Get current chapter name.
     */
    getChapterName() {
        const data = this.getCurrentChapterData();
        return data ? data.name : 'Unknown';
    }

    /**
     * Unlock a chapter by index.
     */
    unlockChapter(index) {
        if (!this.unlockedChapters.includes(index)) {
            this.unlockedChapters.push(index);
            this.unlockedChapters.sort((a, b) => a - b);
            this._saveUnlockedChapters();
        }
    }

    /**
     * Save progress to localStorage.
     */
    saveProgress(chapter, memories) {
        try {
            localStorage.setItem('nemo_save', JSON.stringify({
                chapter,
                memories,
                unlockedChapters: this.unlockedChapters,
                timestamp: Date.now()
            }));
        } catch (e) {
            // localStorage may be unavailable
        }
    }

    /**
     * Load progress from localStorage.
     */
    loadProgress() {
        try {
            const raw = localStorage.getItem('nemo_save');
            if (raw) return JSON.parse(raw);
        } catch (e) { }
        return null;
    }

    // --- Private ---

    _loadUnlockedChapters() {
        try {
            const raw = localStorage.getItem('nemo_save');
            if (raw) {
                const data = JSON.parse(raw);
                if (data.unlockedChapters) {
                    this.unlockedChapters = data.unlockedChapters;
                }
            }
        } catch (e) { }
    }

    _saveUnlockedChapters() {
        // Saved as part of full save in saveProgress
    }

    _overlap(a, b) {
        return a.x < b.x + (b.width || 40) &&
               a.x + (a.width || 40) > b.x &&
               a.y < b.y + (b.height || 40) &&
               a.y + (a.height || 40) > b.y;
    }
}
