import { GAME_WIDTH, GAME_HEIGHT, COLORS, THIRST } from '../data/GameConfig.js';

export default class HUD {
    constructor() {
        this.thirstPercent = 100;
        this.targetThirstPercent = 100;
        
        this.chapterTitle = {
            name: '',
            subtitle: '',
            alpha: 0,
            state: 'idle', // idle, in, hold, out
            timer: 0
        };

        this.prompt = {
            text: '',
            visible: false,
            bounceTimer: 0
        };

        this.memoryCount = 0;
        this.totalMemories = 5;
        this.unlockedAbilities = []; // array of ability names
    }

    update(dt, thirstPercent, chapterInfo, nearInteractable, memoryCount) {
        this.targetThirstPercent = thirstPercent;
        const diff = this.targetThirstPercent - this.thirstPercent;
        this.thirstPercent += diff * 10 * dt;

        if (this.chapterTitle.state === 'in') {
            this.chapterTitle.alpha += dt * 0.5;
            if (this.chapterTitle.alpha >= 1) {
                this.chapterTitle.alpha = 1;
                this.chapterTitle.state = 'hold';
                this.chapterTitle.timer = 3;
            }
        } else if (this.chapterTitle.state === 'hold') {
            this.chapterTitle.timer -= dt;
            if (this.chapterTitle.timer <= 0) {
                this.chapterTitle.state = 'out';
            }
        } else if (this.chapterTitle.state === 'out') {
            this.chapterTitle.alpha -= dt * 0.5;
            if (this.chapterTitle.alpha <= 0) {
                this.chapterTitle.alpha = 0;
                this.chapterTitle.state = 'idle';
            }
        }

        if (nearInteractable) {
            this.prompt.visible = true;
            this.prompt.bounceTimer += dt * 5;
        } else {
            this.prompt.visible = false;
        }

        this.memoryCount = memoryCount;
    }

    showChapterTitle(name, subtitle) {
        this.chapterTitle.name = name;
        this.chapterTitle.subtitle = subtitle;
        this.chapterTitle.alpha = 0;
        this.chapterTitle.state = 'in';
    }

    showPrompt(text) {
        this.prompt.text = text;
        this.prompt.visible = true;
    }

    hidePrompt() {
        this.prompt.visible = false;
    }

    render(ctx, canvasWidth, canvasHeight) {
        this.renderThirstBar(ctx);
        this.renderMemoryCount(ctx, canvasWidth);
        this.renderChapterTitle(ctx, canvasWidth, canvasHeight);
        if (this.prompt.visible) {
            this.renderPrompt(ctx, canvasWidth, canvasHeight);
        }
        this.renderAbilities(ctx, canvasWidth, canvasHeight);
    }

    renderThirstBar(ctx) {
        const x = 20;
        const y = 20;
        const width = 200;
        const height = 15;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, height);

        let barColor = COLORS?.thirstHigh || '#4db8ff';
        if (this.thirstPercent < 50) barColor = COLORS?.thirstMedium || '#ffd700';
        if (this.thirstPercent < 20) barColor = COLORS?.thirstLow || '#ff4d4d';

        if (this.thirstPercent < 20) {
            const pulse = (Math.sin(Date.now() / 200) + 1) / 2 * 0.2 + 0.8;
            ctx.globalAlpha = pulse;
        }

        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, (width * this.thirstPercent) / 100, height);
        ctx.globalAlpha = 1;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        ctx.beginPath();
        ctx.arc(x - 10, y + height / 2, 8, 0, Math.PI * 2);
        ctx.fillStyle = barColor;
        ctx.fill();
        ctx.closePath();
    }

    renderMemoryCount(ctx, canvasWidth) {
        const x = canvasWidth - 80;
        const y = 30;

        const gradient = ctx.createRadialGradient(x, y, 2, x, y, 10);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, 'rgba(0, 150, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.memoryCount}/${this.totalMemories}`, x + 15, y);
    }

    renderChapterTitle(ctx, canvasWidth, canvasHeight) {
        if (this.chapterTitle.state === 'idle') return;

        ctx.save();
        ctx.globalAlpha = this.chapterTitle.alpha;
        
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        ctx.font = '48px Georgia, serif';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        ctx.fillText(this.chapterTitle.name, canvasWidth / 2, canvasHeight / 3);
        
        ctx.font = '24px Georgia, serif';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(this.chapterTitle.subtitle, canvasWidth / 2, canvasHeight / 3 + 40);

        ctx.restore();
    }

    renderPrompt(ctx, canvasWidth, canvasHeight) {
        const bounce = Math.sin(this.prompt.bounceTimer) * 5;
        const x = canvasWidth / 2;
        const y = canvasHeight - 60 + bounce;

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        ctx.fillText(this.prompt.text, x, y);
        ctx.shadowBlur = 0;
    }

    renderAbilities(ctx, canvasWidth, canvasHeight) {
        const startX = canvasWidth - 40;
        const startY = canvasHeight - 40;
        const spacing = 35;

        this.unlockedAbilities.forEach((ability, i) => {
            const x = startX - (i * spacing);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(x, startY, 12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#000000';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ability.substring(0, 1).toUpperCase(), x, startY);
        });
    }
}
