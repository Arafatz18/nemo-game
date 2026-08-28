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
            { name: "The Awakening", desc: "A forgotten place." },
            { name: "The Deep", desc: "Shadows below." },
            { name: "The Ruins", desc: "Echoes of the past." },
            { name: "The Ascent", desc: "Climbing higher." },
            { name: "The Core", desc: "The source." },
            { name: "The End", desc: "Final judgment." }
        ];
        this.unlockedChapters = 1; // 1-indexed count

        this.settings = {
            master: 1.0,
            music: 0.8,
            sfx: 0.8
        };

        this.onSelectCallback = null;
    }

    update(dt, input) {
        if (this.state === 'playing') return;

        this.bgTimer += dt;

        if (!input) return;

        const options = this.getCurrentOptions();
        
        if (input.justPressed('ArrowUp') || input.justPressed('KeyW')) {
            this.selectedIndex--;
            if (this.selectedIndex < 0) this.selectedIndex = Math.max(0, options.length - 1);
        } else if (input.justPressed('ArrowDown') || input.justPressed('KeyS')) {
            this.selectedIndex++;
            if (this.selectedIndex >= options.length) this.selectedIndex = 0;
        }

        if (this.state === 'settings') {
            const option = options[this.selectedIndex];
            let delta = 0;
            if (input.justPressed('ArrowLeft') || input.justPressed('KeyA')) delta = -0.1;
            if (input.justPressed('ArrowRight') || input.justPressed('KeyD')) delta = 0.1;

            if (delta !== 0) {
                if (option === 'Master Volume') this.settings.master = Math.max(0, Math.min(1, this.settings.master + delta));
                if (option === 'Music Volume') this.settings.music = Math.max(0, Math.min(1, this.settings.music + delta));
                if (option === 'SFX Volume') this.settings.sfx = Math.max(0, Math.min(1, this.settings.sfx + delta));
            }
        }

        if (input.justPressed('Enter') || input.justPressed('Space')) {
            this.handleSelection(options[this.selectedIndex]);
        }
        
        if (input.justPressed('Escape')) {
            if (this.state === 'settings' || this.state === 'chapter_select') {
                this.state = 'title'; // or previous state, simplify for now
                this.selectedIndex = 0;
            } else if (this.state === 'playing') {
                this.show('paused');
            } else if (this.state === 'paused') {
                this.hide();
            }
        }
    }

    getCurrentOptions() {
        if (this.state === 'chapter_select') return this.chapters.map(c => c.name).concat(['Back']);
        return this.menus[this.state] || [];
    }

    handleSelection(option) {
        if (option === 'Back') {
            this.state = 'title';
            this.selectedIndex = 0;
            return;
        }
        
        if (this.onSelectCallback) {
            this.onSelectCallback(this.state, option, this.selectedIndex);
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
        if (this.state === 'playing') return;

        ctx.save();

        if (this.state === 'title') {
            this.renderTitleScreen(ctx, canvasWidth, canvasHeight);
        } else if (this.state === 'paused' || this.state === 'settings' || this.state === 'chapter_select' || this.state === 'game_over') {
            // Dark overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            if (this.state === 'chapter_select') {
                this.renderChapterSelect(ctx, canvasWidth, canvasHeight);
            } else if (this.state === 'game_over') {
                this.renderGameOver(ctx, canvasWidth, canvasHeight);
            } else {
                this.renderMenu(ctx, canvasWidth, canvasHeight);
            }
        }

        ctx.restore();
    }

    renderTitleScreen(ctx, canvasWidth, canvasHeight) {
        // Background
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Flicker effect
        const flicker = Math.random() * 0.1 + 0.9;
        ctx.globalAlpha = flicker;

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        ctx.font = '80px Georgia, serif';
        ctx.shadowColor = 'rgba(200, 220, 255, 0.5)';
        ctx.shadowBlur = 20;
        ctx.fillText('NEMO', canvasWidth / 2, canvasHeight / 3);

        ctx.font = '24px Georgia, serif';
        ctx.fillStyle = '#aaaaaa';
        ctx.shadowBlur = 0;
        ctx.fillText('The Last Drop', canvasWidth / 2, canvasHeight / 3 + 40);

        ctx.globalAlpha = 1;
        this.renderMenuOptions(ctx, canvasWidth, canvasHeight / 2 + 50, this.menus.title);
    }

    renderMenu(ctx, canvasWidth, canvasHeight) {
        let title = '';
        if (this.state === 'paused') title = 'PAUSED';
        if (this.state === 'settings') title = 'SETTINGS';

        ctx.fillStyle = '#ffffff';
        ctx.font = '40px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, canvasWidth / 2, canvasHeight / 3);

        this.renderMenuOptions(ctx, canvasWidth, canvasHeight / 2, this.menus[this.state]);
    }

    renderMenuOptions(ctx, canvasWidth, startY, options) {
        ctx.font = '24px monospace';
        const spacing = 40;

        options.forEach((opt, i) => {
            const y = startY + (i * spacing);
            
            if (i === this.selectedIndex) {
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`> ${opt} <`, canvasWidth / 2, y);
            } else {
                ctx.fillStyle = '#666666';
                ctx.fillText(opt, canvasWidth / 2, y);
            }

            if (this.state === 'settings' && opt !== 'Back') {
                let val = 0;
                if (opt === 'Master Volume') val = this.settings.master;
                if (opt === 'Music Volume') val = this.settings.music;
                if (opt === 'SFX Volume') val = this.settings.sfx;
                
                // Draw simple slider
                const barWidth = 100;
                const barX = canvasWidth / 2 + 150;
                ctx.fillStyle = '#333';
                ctx.fillRect(barX, y - 10, barWidth, 10);
                ctx.fillStyle = i === this.selectedIndex ? '#fff' : '#666';
                ctx.fillRect(barX, y - 10, barWidth * val, 10);
            }
        });
    }

    renderChapterSelect(ctx, canvasWidth, canvasHeight) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '40px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('CHAPTER SELECT', canvasWidth / 2, 100);

        const options = this.getCurrentOptions();
        const startY = 200;
        const spacing = 60;

        options.forEach((opt, i) => {
            const y = startY + (i * spacing);
            const isLocked = i >= this.unlockedChapters && opt !== 'Back';
            
            ctx.fillStyle = isLocked ? '#333333' : (i === this.selectedIndex ? '#ffffff' : '#888888');
            ctx.font = '24px monospace';
            
            let text = opt;
            if (i === this.selectedIndex) text = `> ${text} <`;
            if (isLocked) text = `[ LOCKED ]`;

            ctx.fillText(text, canvasWidth / 2, y);

            if (!isLocked && opt !== 'Back' && i === this.selectedIndex) {
                ctx.font = '16px Georgia';
                ctx.fillStyle = '#aaaaaa';
                ctx.fillText(this.chapters[i].desc, canvasWidth / 2, y + 25);
            }
        });
    }

    renderGameOver(ctx, canvasWidth, canvasHeight) {
        ctx.fillStyle = '#ff3333';
        ctx.font = '60px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.fillText('You faded away...', canvasWidth / 2, canvasHeight / 3);
        ctx.shadowBlur = 0;

        this.renderMenuOptions(ctx, canvasWidth, canvasHeight / 2 + 50, this.menus.game_over);
    }
}
