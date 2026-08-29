/**
 * FogSystem.js – Volumetric & Layered Animated Fog System
 * 
 * Handles multi-layered parallax fog with sine wave oscillation,
 * wind responsiveness, and universal color format support.
 */

function colorToRgb(color) {
    if (!color) return '200, 215, 230';
    if (typeof color === 'string') {
        const c = color.trim();
        // Hex (#141a24 or #fff)
        if (c.startsWith('#')) {
            let hex = c.slice(1);
            if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
            const num = parseInt(hex, 16);
            if (!isNaN(num)) {
                return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
            }
        }
        // rgb / rgba format
        if (c.startsWith('rgb')) {
            const match = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
            if (match) return `${match[1]}, ${match[2]}, ${match[3]}`;
        }
        // Already "r, g, b" format
        if (c.includes(',')) return c;
    }
    return '200, 215, 230';
}

export default class FogSystem {
    constructor(config = {}) {
        this.layers = config.layers || [
            { y: 0, speed: 0.2, alpha: 0.1, color: '200, 210, 220', height: 1.0, offset: 0 },
            { y: 0.2, speed: 0.4, alpha: 0.15, color: '210, 220, 230', height: 0.8, offset: 1000 },
            { y: 0.5, speed: 0.7, alpha: 0.2, color: '220, 230, 240', height: 0.6, offset: 2000 },
            { y: 0.8, speed: 1.2, alpha: 0.3, color: '240, 245, 255', height: 0.4, offset: 3000 }
        ];
        this.baseColor = '200, 215, 230';
        this.density = 1.0;
        this.time = 0;
    }

    update(dt, wind = { x: 0, y: 0 }) {
        this.time += dt * 0.01;
        for (let layer of this.layers) {
            layer.offset += (layer.speed + (wind.x || 0) * 0.05) * dt;
        }
    }

    render(ctx, camera, canvasWidth, canvasHeight) {
        ctx.save();
        
        for (let i = 0; i < this.layers.length; i++) {
            let layer = this.layers[i];
            let layerHeight = canvasHeight * (layer.height || 0.6);
            let startY = canvasHeight - layerHeight - (layer.y || 0) * canvasHeight;
            
            const parts = 12;
            const partWidth = canvasWidth / parts;
            
            ctx.beginPath();
            ctx.moveTo(0, canvasHeight);
            
            for (let j = 0; j <= parts; j++) {
                let x = j * partWidth;
                let wave = Math.sin((x + layer.offset) * 0.005) * 16;
                let wave2 = Math.cos((x + layer.offset * 0.5) * 0.01) * 12;
                ctx.lineTo(x, startY + wave + wave2);
            }
            
            ctx.lineTo(canvasWidth, canvasHeight);
            ctx.lineTo(0, canvasHeight);
            ctx.closePath();
            
            const rgb = colorToRgb(layer.color || this.baseColor);
            const a = Math.max(0, Math.min(1, layer.alpha * this.density));

            try {
                const gradient = ctx.createLinearGradient(0, startY, 0, canvasHeight);
                gradient.addColorStop(0, `rgba(${rgb}, 0)`);
                gradient.addColorStop(0.25, `rgba(${rgb}, ${(a * 0.4).toFixed(3)})`);
                gradient.addColorStop(1, `rgba(${rgb}, ${a.toFixed(3)})`);
                
                ctx.fillStyle = gradient;
                ctx.fill();
            } catch (e) {
                // Graceful fallback if gradient parsing fails
                ctx.fillStyle = `rgba(${rgb}, ${(a * 0.3).toFixed(3)})`;
                ctx.fill();
            }
        }
        
        ctx.restore();
    }

    setFogColor(color) {
        this.baseColor = colorToRgb(color);
        for (let layer of this.layers) {
            layer.color = this.baseColor;
        }
    }

    setDensity(density) {
        this.density = Math.max(0, Math.min(2, density));
    }

    clear() {
        this.layers = [];
    }
}
