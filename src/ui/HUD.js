/**
 * HUD.js – Heads-Up Display for NEMO
 * 
 * Displays thirst bar, memory fragment counter, chapter titles,
 * interaction prompts, and controls helper hint.
 */

import { COLORS } from '../data/GameConfig.js';

export default class HUD {
    constructor() {
        this.thirstPercent = 100;
        this.targetThirstPercent = 100;
        
        this.chapterTitle = {
            name: '',
            subtitle: '',
            alpha: 0,
            state: 'idle',
            timer: 0
        };

        this.prompt = {
            text: '',
            visible: false,
            bounceTimer: 0
        };

        this.memoryCount = 0;
        this.totalMemories = 5;
        this.unlockedAbilities = [];
    }

    update(dt, thirstPercent, chapterInfo, nearInteractable, memoryCount) {
        this.targetThirstPercent = thirstPercent || 100;
        const diff = this.targetThirstPercent - this.thirstPercent;
        this.thirstPercent += diff * Math.min(1, dt * 10);

        if (this.chapterTitle.state === 'in') {
            this.chapterTitle.alpha += dt * 0.8;
            if (this.chapterTitle.alpha >= 1) {
                this.chapterTitle.alpha = 1;
                this.chapterTitle.state = 'hold';
                this.chapterTitle.timer = 3.5;
            }
        } else if (this.chapterTitle.state === 'hold') {
            this.chapterTitle.timer -= dt;
            if (this.chapterTitle.timer <= 0) {
                this.chapterTitle.state = 'out';
            }
        } else if (this.chapterTitle.state === 'out') {
            this.chapterTitle.alpha -= dt * 0.8;
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

        this.memoryCount = memoryCount || 0;
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
        ctx.save();
        this.renderThirstBar(ctx);
        this.renderMemoryCount(ctx, canvasWidth);
        this.renderControlsHint(ctx, canvasHeight);
        this.renderChapterTitle(ctx, canvasWidth, canvasHeight);
        if (this.prompt.visible) {
            this.renderPrompt(ctx, canvasWidth, canvasHeight);
        }
        ctx.restore();
    }

    renderThirstBar(ctx) {
        const x = 24;
        const y = 24;
        const width = 180;
        const height = 12;

        // Dark background pill
        ctx.fillStyle = 'rgba(8, 12, 20, 0.75)';
        ctx.strokeStyle = 'rgba(70, 100, 140, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x + 20, y, width, height, 6);
        ctx.fill();
        ctx.stroke();

        // Droplet icon on left
        const pct = Math.max(0, Math.min(100, this.thirstPercent));
        let barColor = '#4db8ff';
        if (pct < 45) barColor = '#ffd700';
        if (pct < 20) barColor = '#ff4d4d';

        ctx.fillStyle = barColor;
        ctx.shadowColor = barColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x + 8, y + height / 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Thirst progress bar fill
        const fillW = Math.max(4, (width * pct) / 100);
        ctx.fillStyle = barColor;
        ctx.beginPath();
        ctx.roundRect(x + 20, y, fillW, height, 6);
        ctx.fill();
    }

    renderMemoryCount(ctx, canvasWidth) {
        const x = canvasWidth - 110;
        const y = 24;

        // Background pill
        ctx.fillStyle = 'rgba(8, 12, 20, 0.75)';
        ctx.strokeStyle = 'rgba(70, 100, 140, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, 90, 24, 12);
        ctx.fill();
        ctx.stroke();

        // Glowing Soul Fragment Orb
        ctx.fillStyle = '#a0d8ff';
        ctx.shadowColor = '#60b0ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x + 16, y + 12, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Text Counter
        ctx.fillStyle = '#e8f0ff';
        ctx.font = '13px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.memoryCount}/${this.totalMemories}`, x + 30, y + 12);
    }

    renderControlsHint(ctx, canvasHeight) {
        ctx.save();
        ctx.fillStyle = 'rgba(160, 180, 210, 0.5)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText('A / D: Run   •   Space: Jump   •   F: Lantern   •   Shift: Sprint', 24, canvasHeight - 18);
        ctx.restore();
    }

    renderChapterTitle(ctx, canvasWidth, canvasHeight) {
        if (this.chapterTitle.state === 'idle' || this.chapterTitle.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.chapterTitle.alpha));
        
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = '36px Georgia, serif';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 12;
        ctx.fillText(this.chapterTitle.name, canvasWidth / 2, canvasHeight * 0.28);
        
        ctx.font = '18px Georgia, serif';
        ctx.fillStyle = 'rgba(200, 215, 240, 0.85)';
        ctx.fillText(this.chapterTitle.subtitle, canvasWidth / 2, canvasHeight * 0.28 + 34);

        ctx.restore();
    }

    renderPrompt(ctx, canvasWidth, canvasHeight) {
        const bounce = Math.sin(this.prompt.bounceTimer) * 4;
        const x = canvasWidth / 2;
        const y = canvasHeight - 70 + bounce;

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.fillText(this.prompt.text || 'Press [E] to Interact', x, y);
        ctx.restore();
    }
}
