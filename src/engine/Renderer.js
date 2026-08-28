export default class Renderer {
    constructor(container) {
        this.container = container;
        
        // Create canvases
        this.bgCanvas = document.createElement('canvas');
        this.gameCanvas = document.createElement('canvas');
        this.lightCanvas = document.createElement('canvas');
        this.uiCanvas = document.createElement('canvas');
        
        // Z-indices
        this.bgCanvas.style.zIndex = '1';
        this.gameCanvas.style.zIndex = '2';
        this.lightCanvas.style.zIndex = '3';
        this.uiCanvas.style.zIndex = '4';
        
        const canvases = [this.bgCanvas, this.gameCanvas, this.lightCanvas, this.uiCanvas];
        canvases.forEach(canvas => {
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            this.container.appendChild(canvas);
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
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        Object.values(this.contexts).forEach(ctx => {
            ctx.canvas.width = width;
            ctx.canvas.height = height;
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
        return this.contexts[layer];
    }

    drawSprite(ctx, image, sx, sy, sw, sh, dx, dy, dw, dh, flipX = false) {
        if (!image) return;
        this.save(ctx);
        if (flipX) {
            ctx.translate(dx + dw, dy);
            ctx.scale(-1, 1);
            ctx.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);
        } else {
            ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
        this.restore(ctx);
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
        ctx.font = options.font || '20px Arial';
        ctx.fillStyle = options.color || '#ffffff';
        ctx.textAlign = options.align || 'left';
        ctx.textBaseline = options.baseline || 'top';
        
        if (options.shadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        
        ctx.fillText(text, x, y);
        
        if (options.shadow) {
            ctx.shadowColor = 'transparent';
        }
    }

    applyDarkness(ambientLight) {
        const ctx = this.ctxLight;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = `rgba(10, 12, 20, ${1 - ambientLight})`;
        ctx.fillRect(0, 0, this.getWidth(), this.getHeight());
        ctx.globalCompositeOperation = 'destination-out';
    }

    drawLight(x, y, radius, color, intensity) {
        const ctx = this.ctxLight;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        // Using rgba for white cutout
        gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    createGradient(ctx, x, y, radius, colors) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        colors.forEach((color, i) => {
            gradient.addColorStop(i / (colors.length - 1), color);
        });
        return gradient;
    }

    setAlpha(ctx, alpha) {
        ctx.globalAlpha = alpha;
    }

    save(ctx) {
        ctx.save();
    }

    restore(ctx) {
        ctx.restore();
    }

    getWidth() {
        return this.gameCanvas.width;
    }

    getHeight() {
        return this.gameCanvas.height;
    }

    destroy() {
        window.removeEventListener('resize', this.resize);
        const canvases = [this.bgCanvas, this.gameCanvas, this.lightCanvas, this.uiCanvas];
        canvases.forEach(canvas => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        });
    }
}
