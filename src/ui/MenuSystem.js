/**
 * MenuSystem.js – Menu screens and navigation
 * 
 * Handles Title, Pause, Settings, Chapter Select, and Game Over menus
 * with support for both keyboard and mouse interactions.
 */

export default class MenuSystem {
    constructor() {
        this.state = 'title'; // 'title', 'playing', 'paused', 'settings', 'chapter_select', 'game_over'
        this.selectedIndex = 0;
        this.bgTimer = 0;
        
        this.menus = {
            title: ['New Game', 'Continue', 'Chapter Select', 'Settings'],
            paused: ['Resume', 'Settings', 'Quit to Title'],
            settings: ['Master Volume', 'Music Volume', 'SFX Volume', 'Back'],
            game_over: ['Retry from Checkpoint', 'Quit to Title']
        };

        this.chapters = [
            { name: "Despair Forest", desc: "The Fall." },
            { name: "Forgotten Village", desc: "Echoes of regret." },
            { name: "Echo Cave", desc: "Whispers in the dark." },
            { name: "Drowned Marsh", desc: "Depths of sorrow." },
            { name: "Tower of Regret", desc: "The inner beast." },
            { name: "Final Memory", desc: "The choice." }
        ];
        this.unlockedChapters = 6; // allow all or load from save

        this.settings = {
            master: 1.0,
            music: 0.8,
            sfx: 0.8
        };

        this.onSelectCallback = null;
        this.optionBounds = []; // stored each frame for mouse hit testing
    }

    update(dt, input) {
        if (this.state === 'playing') return;

        this.bgTimer += dt;
        if (!input) return;

        const options = this.getCurrentOptions();
        
        // Mouse hover and click support
        if (input.mouse && this.optionBounds.length > 0) {
            const mx = input.mouse.x;
            const my = input.mouse.y;

            for (let i = 0; i < this.optionBounds.length; i++) {
                const b = this.optionBounds[i];
                if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
                    this.selectedIndex = i;
                    if (input.mouse.clicked) {
                        this.handleSelection(options[i]);
                        return;
                    }
                    break;
                }
            }
        }

        // Keyboard navigation
        if (input.isPressed('ArrowUp') || input.isPressed('KeyW')) {
            this.selectedIndex--;
            if (this.selectedIndex < 0) this.selectedIndex = Math.max(0, options.length - 1);
        } else if (input.isPressed('ArrowDown') || input.isPressed('KeyS')) {
            this.selectedIndex++;
            if (this.selectedIndex >= options.length) this.selectedIndex = 0;
        }

        // Settings adjustments
        if (this.state === 'settings') {
            const option = options[this.selectedIndex];
            let delta = 0;
            if (input.isPressed('ArrowLeft') || input.isPressed('KeyA')) delta = -0.1;
            if (input.isPressed('ArrowRight') || input.isPressed('KeyD')) delta = 0.1;

            if (delta !== 0) {
                if (option === 'Master Volume') {
                    this.settings.master = Math.max(0, Math.min(1, Math.round((this.settings.master + delta) * 10) / 10));
                    if (this.onSelectCallback) this.onSelectCallback('volume_master', this.settings.master);
                }
                if (option === 'Music Volume') {
                    this.settings.music = Math.max(0, Math.min(1, Math.round((this.settings.music + delta) * 10) / 10));
                    if (this.onSelectCallback) this.onSelectCallback('volume_music', this.settings.music);
                }
                if (option === 'SFX Volume') {
                    this.settings.sfx = Math.max(0, Math.min(1, Math.round((this.settings.sfx + delta) * 10) / 10));
                    if (this.onSelectCallback) this.onSelectCallback('volume_sfx', this.settings.sfx);
                }
            }
        }

        // Selection via keyboard
        if (input.isPressed('Enter') || input.isPressed('Space') || input.isPressed('KeyE')) {
            this.handleSelection(options[this.selectedIndex]);
        }
        
        // Escape back
        if (input.isPressed('Escape')) {
            if (this.state === 'settings' || this.state === 'chapter_select') {
                this.state = 'title';
                this.selectedIndex = 0;
            } else if (this.state === 'paused') {
                if (this.onSelectCallback) this.onSelectCallback('resume', null);
            }
        }
    }

    getCurrentOptions() {
        if (this.state === 'chapter_select') return this.chapters.map(c => c.name).concat(['Back']);
        return this.menus[this.state] || [];
    }

    handleSelection(option) {
        if (!option) return;

        if (option === 'Back') {
            this.state = 'title';
            this.selectedIndex = 0;
            return;
        }

        if (this.state === 'chapter_select') {
            const chapIdx = this.chapters.findIndex(c => c.name === option);
            if (chapIdx !== -1) {
                if (this.onSelectCallback) this.onSelectCallback('select_chapter', chapIdx);
                return;
            }
        }

        // Map options to Game.js action names
        const actionMap = {
            'New Game': 'new_game',
            'Continue': 'continue',
            'Chapter Select': 'chapter_select',
            'Settings': 'settings',
            'Resume': 'resume',
            'Retry from Checkpoint': 'retry',
            'Quit to Title': 'quit_title'
        };

        const action = actionMap[option];
        if (action && this.onSelectCallback) {
            this.onSelectCallback(action, null);
        }
    }

    onSelect(callback) {
        this.onSelectCallback = callback;
    }

    show(state) {
        this.state = state;
        this.selectedIndex = 0;
    }

    hide() {
        this.state = 'playing';
    }

    render(ctx, canvasWidth, canvasHeight) {
        this.optionBounds = []; // Reset bounds for mouse hit testing

        if (this.state === 'title') {
            this.renderTitleScreen(ctx, canvasWidth, canvasHeight);
        } else if (this.state === 'chapter_select') {
            this.renderChapterSelect(ctx, canvasWidth, canvasHeight);
        } else if (this.state === 'game_over') {
            this.renderGameOver(ctx, canvasWidth, canvasHeight);
        } else if (this.state === 'paused' || this.state === 'settings') {
            // Semi-transparent background
            ctx.fillStyle = 'rgba(5, 6, 8, 0.85)';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            this.renderMenu(ctx, canvasWidth, canvasHeight);
        }
    }

    renderTitleScreen(ctx, canvasWidth, canvasHeight) {
        ctx.textAlign = 'center';
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = '72px Georgia, serif';
        ctx.shadowColor = 'rgba(140, 180, 220, 0.6)';
        ctx.shadowBlur = 20 + Math.sin(this.bgTimer * 0.002) * 5;
        ctx.fillText('NEMO', canvasWidth / 2, canvasHeight / 3);

        // Subtitle
        ctx.font = '22px Georgia, serif';
        ctx.fillStyle = '#aaaaaa';
        ctx.shadowBlur = 0;
        ctx.fillText('The Last Drop', canvasWidth / 2, canvasHeight / 3 + 45);

        // Subtle prompt
        ctx.font = '14px monospace';
        ctx.fillStyle = 'rgba(140, 160, 190, 0.5)';
        ctx.fillText('Use [W/S] or [Arrows] or Click to navigate • [Enter/Space] to select', canvasWidth / 2, canvasHeight - 40);

        this.renderMenuOptions(ctx, canvasWidth, canvasHeight / 2 + 30, this.menus.title);
    }

    renderMenu(ctx, canvasWidth, canvasHeight) {
        let title = '';
        if (this.state === 'paused') title = 'PAUSED';
        if (this.state === 'settings') title = 'SETTINGS';

        ctx.fillStyle = '#ffffff';
        ctx.font = '36px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, canvasWidth / 2, canvasHeight / 3 - 20);

        this.renderMenuOptions(ctx, canvasWidth, canvasHeight / 2, this.menus[this.state]);
    }

    renderMenuOptions(ctx, canvasWidth, startY, options) {
        ctx.font = '22px monospace';
        const spacing = 45;

        options.forEach((opt, i) => {
            const y = startY + (i * spacing);
            const isSelected = (i === this.selectedIndex);
            
            // Store bounding box for mouse click
            const textWidth = 320;
            this.optionBounds.push({
                x: canvasWidth / 2 - textWidth / 2,
                y: y - 24,
                w: textWidth,
                h: 36
            });

            if (isSelected) {
                ctx.fillStyle = '#8caad2';
                ctx.shadowColor = 'rgba(140, 180, 220, 0.5)';
                ctx.shadowBlur = 10;
                ctx.fillText(`> ${opt} <`, canvasWidth / 2, y);
                ctx.shadowBlur = 0;
            } else {
                ctx.fillStyle = '#667085';
                ctx.fillText(opt, canvasWidth / 2, y);
            }

            if (this.state === 'settings' && opt !== 'Back') {
                let val = 0;
                if (opt === 'Master Volume') val = this.settings.master;
                if (opt === 'Music Volume') val = this.settings.music;
                if (opt === 'SFX Volume') val = this.settings.sfx;
                
                // Draw slider
                const barWidth = 120;
                const barX = canvasWidth / 2 + 140;
                ctx.fillStyle = '#222834';
                ctx.fillRect(barX, y - 12, barWidth, 12);
                ctx.fillStyle = isSelected ? '#8caad2' : '#556';
                ctx.fillRect(barX, y - 12, barWidth * val, 12);
            }
        });
    }

    renderChapterSelect(ctx, canvasWidth, canvasHeight) {
        // Semi-transparent background
        ctx.fillStyle = 'rgba(5, 6, 8, 0.9)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = '36px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('CHAPTER SELECT', canvasWidth / 2, 80);

        const options = this.getCurrentOptions();
        const startY = 160;
        const spacing = 65;

        options.forEach((opt, i) => {
            const y = startY + (i * spacing);
            const isLocked = i >= this.unlockedChapters && opt !== 'Back';
            const isSelected = (i === this.selectedIndex);
            
            this.optionBounds.push({
                x: canvasWidth / 2 - 200,
                y: y - 24,
                w: 400,
                h: 50
            });

            ctx.fillStyle = isLocked ? '#333844' : (isSelected ? '#8caad2' : '#667085');
            ctx.font = '22px monospace';
            
            let text = opt;
            if (isSelected) text = `> ${text} <`;
            if (isLocked) text = `[ LOCKED ]`;

            ctx.fillText(text, canvasWidth / 2, y);

            if (!isLocked && opt !== 'Back' && this.chapters[i]) {
                ctx.font = '14px Georgia';
                ctx.fillStyle = isSelected ? '#a0b0c8' : '#556';
                ctx.fillText(this.chapters[i].desc, canvasWidth / 2, y + 22);
            }
        });
    }

    renderGameOver(ctx, canvasWidth, canvasHeight) {
        // Semi-transparent dark red background
        ctx.fillStyle = 'rgba(10, 4, 4, 0.9)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#ff4444';
        ctx.font = '54px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff2222';
        ctx.shadowBlur = 25;
        ctx.fillText('You faded away...', canvasWidth / 2, canvasHeight / 3);
        ctx.shadowBlur = 0;

        this.renderMenuOptions(ctx, canvasWidth, canvasHeight / 2 + 40, this.menus.game_over);
    }
}
