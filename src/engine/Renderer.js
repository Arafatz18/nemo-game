/**
 * Renderer.js – Multi-Layer Canvas Renderer
 * 
 * Manages 4 stacked canvas layers (bg, game, light, ui)
 * and provides drawing utilities for sprites, lights, and primitives.
 */

export default class Renderer {
    constructor(container) {
        this.container = container;
        
        // Grab canvases from DOM or create them
        this.bgCanvas = container.querySelector('#bg-canvas') || document.createElement('canvas');
        this.gameCanvas = container.querySelector('#game-canvas') || document.createElement('canvas');
        this.lightCanvas = container.querySelector('#light-canvas') || document.createElement('canvas');
        this.uiCanvas = container.querySelector('#ui-canvas') || document.createElement('canvas');
        
        this.bgCanvas.id = 'bg-canvas';
        this.gameCanvas.id = 'game-canvas';
        this.lightCanvas.id = 'light-canvas';
        this.uiCanvas.id = 'ui-canvas';

        const canvases = [this.bgCanvas, this.gameCanvas, this.lightCanvas, this.uiCanvas];
        canvases.forEach((canvas, idx) => {
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = (idx + 1).toString();
            if (!canvas.parentNode) {
                this.container.appendChild(canvas);
            }
        });
        
        this.ctxBg = this.bgCanvas.getContext('2d');
        this.ctxGame = this.gameCanvas.getContext('2d');
        this.ctxLight = this.lightCanvas.getContext('2d');
        this.ctxUi = this.uiCanvas.getContext('2d');

        this.contexts = {
            'bg': this.ctxBg,
            'game': this.ctxGame,
            'light': this.ctxLight,
            'ui': this.ctxUi
        };

        this.resize();
        this._resizeHandler = () => this.resize();
        window.addEventListener('resize', this._resizeHandler);
    }

    resize() {
        const width = window.innerWidth || 1280;
        const height = window.innerHeight || 720;
        
        Object.values(this.contexts).forEach(ctx => {
            if (ctx && ctx.canvas) {
                ctx.canvas.width = width;
                ctx.canvas.height = height;
            }
        });
    }

    clear(layer) {
        const width = this.getWidth();
        const height = this.getHeight();
        
        if (layer === 'all') {
            Object.values(this.contexts).forEach(ctx => {
                ctx.clearRect(0, 0, width, height);
            });
        } else if (this.contexts[layer]) {
            this.contexts[layer].clearRect(0, 0, width, height);
        }
    }

    getContext(layer) {
        return this.contexts[layer] || null;
    }

    drawSprite(ctx, image, sx, sy, sw, sh, dx, dy, dw, dh, flipX = false) {
        if (!image) return;
        ctx.save();
        if (flipX) {
            ctx.scale(-1, 1);
            ctx.drawImage(image, sx, sy, sw, sh, -dx - dw, dy, dw, dh);
        } else {
            ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
        ctx.restore();
    }

    drawRect(ctx, x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    drawCircle(ctx, x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    drawText(ctx, text, x, y, options = {}) {
        ctx.save();
        ctx.font = options.font || '16px monospace';
        ctx.fillStyle = options.color || '#ffffff';
        ctx.textAlign = options.align || 'left';
        
        if (options.shadow) {
            ctx.shadowColor = options.shadowColor || 'black';
            ctx.shadowBlur = options.shadowBlur || 4;
            ctx.shadowOffsetX = options.shadowOffsetX || 0;
            ctx.shadowOffsetY = options.shadowOffsetY || 0;
        }

        ctx.fillText(text, x, y);
        ctx.restore();
    }

    applyDarkness(ambientLight = 0.85) {
        const width = this.getWidth();
        const height = this.getHeight();
        this.ctxLight.fillStyle = `rgba(8, 10, 18, ${ambientLight})`;
        this.ctxLight.fillRect(0, 0, width, height);
    }

    drawLight(x, y, radius, color = '#ffffff', intensity = 1) {
        this.ctxLight.save();
        this.ctxLight.globalCompositeOperation = 'destination-out';
        
        const grad = this.ctxLight.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctxLight.fillStyle = grad;
        this.ctxLight.beginPath();
        this.ctxLight.arc(x, y, radius, 0, Math.PI * 2);
        this.ctxLight.fill();
        this.ctxLight.restore();
    }

    createGradient(ctx, x, y, radius, colors) {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        colors.forEach(stop => {
            grad.addColorStop(stop.offset, stop.color);
        });
        return grad;
    }

    setAlpha(ctx, alpha) {
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    }

    save(ctx) {
        ctx.save();
    }

    restore(ctx) {
        ctx.restore();
    }

    getWidth() {
        return this.bgCanvas.width || window.innerWidth || 1280;
    }

    getHeight() {
        return this.bgCanvas.height || window.innerHeight || 720;
    }

    destroy() {
        window.removeEventListener('resize', this._resizeHandler);
    }
}
