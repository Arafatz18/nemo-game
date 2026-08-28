/**
 * TransitionSystem.js – Scene Transitions & Title Cards
 * 
 * Handles screen fade-in, fade-out, chapter title cards, and death transitions.
 */

export default class TransitionSystem {
    constructor() {
        this.active = false;
        this.type = 'fade'; // fade, sweep, iris, chapter
        this.progress = 0;
        this.direction = 'in'; // 'in' = clearing to transparent, 'out' = fading to black
        this.color = '#000000';
        this.duration = 1000; // stored in ms
        this.timer = 0;
        
        // For chapter transitions
        this.chapterTitle = null;
        this.chapterSubtitle = null;
        this.holdTimer = 0;
        this.state = 'idle'; // idle, out, hold, in
        
        this.resolvePromise = null;
    }

    _normalizeDuration(duration) {
        if (!duration) return 800;
        return duration < 20 ? duration * 1000 : duration;
    }

    fadeIn(duration = 1000, color = '#000000') {
        const d = this._normalizeDuration(duration);
        return new Promise((resolve) => {
            this.active = true;
            this.type = 'fade';
            this.direction = 'in';
            this.color = color;
            this.duration = d;
            this.timer = d;
            this.progress = 1;
            this.state = 'in';
            this.resolvePromise = resolve;
        });
    }

    fadeOut(duration = 1000, color = '#000000') {
        const d = this._normalizeDuration(duration);
        return new Promise((resolve) => {
            this.active = true;
            this.type = 'fade';
            this.direction = 'out';
            this.color = color;
            this.duration = d;
            this.timer = 0;
            this.progress = 0;
            this.state = 'out';
            this.resolvePromise = resolve;
        });
    }

    async chapterTransition(chapterName, subtitle, duration = 2000) {
        this.type = 'chapter';
        this.chapterTitle = chapterName;
        this.chapterSubtitle = subtitle;
        this.holdTimer = 1800; // ms
        
        await this.fadeOut(600);
        
        return new Promise((resolve) => {
            this.state = 'hold';
            this.resolvePromise = () => {
                this.fadeIn(800).then(resolve);
            };
        });
    }

    async deathTransition(callback) {
        await this.fadeOut(1200, '#4a0c0c');
        if (callback) callback();
        await this.fadeIn(800);
    }

    update(dt) {
        if (!this.active && this.state === 'idle') return;

        // dt is expected in ms (typically ~16.6ms)
        const dtMs = dt < 1 ? dt * 1000 : dt;

        if (this.state === 'out') {
            this.timer += dtMs;
            this.progress = Math.min(1, this.timer / this.duration);
            if (this.progress >= 1) {
                if (this.resolvePromise) {
                    const res = this.resolvePromise;
                    this.resolvePromise = null;
                    res();
                } else {
                    this.active = false;
                    this.state = 'idle';
                }
            }
        } else if (this.state === 'in') {
            this.timer -= dtMs;
            this.progress = Math.max(0, this.timer / this.duration);
            if (this.progress <= 0) {
                this.active = false;
                this.state = 'idle';
                if (this.resolvePromise) {
                    const res = this.resolvePromise;
                    this.resolvePromise = null;
                    res();
                }
            }
        } else if (this.state === 'hold') {
            this.holdTimer -= dtMs;
            if (this.holdTimer <= 0) {
                if (this.resolvePromise) {
                    const res = this.resolvePromise;
                    this.resolvePromise = null;
                    res();
                }
            }
        }
    }

    isActive() {
        return this.active || this.state !== 'idle';
    }

    render(ctx, canvasWidth, canvasHeight) {
        if (!this.active && this.state === 'idle') return;

        ctx.save();
        
        if (this.type === 'fade' || this.type === 'chapter') {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.state === 'hold' ? 1 : this.progress;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else if (this.type === 'sweep') {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 1;
            ctx.fillRect(0, 0, canvasWidth * this.progress, canvasHeight);
        }

        // Render chapter title card during hold or fade
        if (this.type === 'chapter' && (this.state === 'hold' || this.progress > 0.5)) {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.font = '48px Georgia, serif';
            ctx.shadowColor = 'rgba(140, 180, 220, 0.8)';
            ctx.shadowBlur = 15;
            ctx.fillText(this.chapterTitle || '', canvasWidth / 2, canvasHeight / 2 - 20);

            if (this.chapterSubtitle) {
                ctx.font = '20px Georgia, serif';
                ctx.fillStyle = '#8caad2';
                ctx.shadowBlur = 0;
                ctx.fillText(this.chapterSubtitle, canvasWidth / 2, canvasHeight / 2 + 30);
            }
        }

        ctx.restore();
    }
}
