export default class TransitionSystem {
    constructor() {
        this.active = false;
        this.type = 'fade'; // fade, sweep, iris
        this.progress = 0;
        this.direction = 'in'; // 'in' = fading in (becoming visible to player), 'out' = fading out (screen goes black)
        this.color = '#000000';
        this.callback = null;
        this.duration = 1;
        this.timer = 0;
        
        // For chapter transitions
        this.chapterTitle = null;
        this.chapterSubtitle = null;
        this.holdTimer = 0;
        this.state = 'idle'; // idle, out, hold, in
        
        this.resolvePromise = null;
    }

    fadeIn(duration = 1, color = '#000000') {
        return new Promise((resolve) => {
            this.active = true;
            this.type = 'fade';
            this.direction = 'in';
            this.color = color;
            this.duration = duration;
            this.timer = duration; // Start fully covered
            this.progress = 1;
            this.state = 'in';
            this.resolvePromise = resolve;
        });
    }

    fadeOut(duration = 1, color = '#000000') {
        return new Promise((resolve) => {
            this.active = true;
            this.type = 'fade';
            this.direction = 'out';
            this.color = color;
            this.duration = duration;
            this.timer = 0; // Start fully clear
            this.progress = 0;
            this.state = 'out';
            this.resolvePromise = resolve;
        });
    }

    async transition(inDuration = 1, outDuration = 1, callback = null, type = 'fade') {
        this.type = type;
        await this.fadeOut(outDuration);
        if (callback) callback();
        await this.fadeIn(inDuration);
    }

    async chapterTransition(chapterName, subtitle) {
        this.type = 'chapter';
        this.chapterTitle = chapterName;
        this.chapterSubtitle = subtitle;
        this.holdTimer = 3;
        
        await this.fadeOut(1);
        
        return new Promise((resolve) => {
            this.state = 'hold';
            this.resolvePromise = () => {
                this.fadeIn(1).then(resolve);
            };
        });
    }

    async deathTransition(callback) {
        await this.fadeOut(2, '#550000');
        if (callback) callback();
        await this.fadeIn(1);
    }

    update(dt) {
        if (!this.active) return;

        if (this.state === 'out') {
            this.timer += dt;
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
            this.timer -= dt;
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
            this.holdTimer -= dt;
            if (this.holdTimer <= 0) {
                if (this.resolvePromise) {
                    const res = this.resolvePromise;
                    this.resolvePromise = null;
                    res();
                }
            }
        }
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
            ctx.fillRect(0, 0, canvasWidth * this.progress, canvasHeight);
        } else if (this.type === 'iris') {
            ctx.fillStyle = this.color;
            const radius = Math.max(canvasWidth, canvasHeight) * (1 - this.progress);
            ctx.beginPath();
            ctx.arc(canvasWidth / 2, canvasHeight / 2, radius, 0, Math.PI * 2);
            ctx.rect(canvasWidth, 0, -canvasWidth, canvasHeight);
            ctx.fill();
        }

        if (this.type === 'chapter' && (this.state === 'hold' || (this.state === 'out' && this.progress > 0.8) || (this.state === 'in' && this.progress > 0.8))) {
            ctx.globalAlpha = 1;
            if (this.state === 'out') ctx.globalAlpha = (this.progress - 0.8) * 5;
            if (this.state === 'in') ctx.globalAlpha = (this.progress - 0.8) * 5;
            
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.font = '60px Georgia, serif';
            ctx.fillText(this.chapterTitle, canvasWidth / 2, canvasHeight / 2 - 30);
            
            ctx.font = '30px Georgia, serif';
            ctx.fillStyle = '#aaaaaa';
            ctx.fillText(this.chapterSubtitle, canvasWidth / 2, canvasHeight / 2 + 30);
        }

        ctx.restore();
    }

    isActive() {
        return this.active || this.state === 'hold';
    }
}
