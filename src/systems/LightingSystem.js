/**
 * LightingSystem.js – Dynamic Atmospheric 2D Lighting Engine
 * 
 * Creates darkness overlays and punches out glowing light masks (destination-out)
 * for lanterns, collectibles, and glowing environmental elements.
 */

export default class LightingSystem {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.lights = [];
        this.nextId = 1;
        this.ambientDarkness = 0.38;
    }

    addLight(x, y, radius, color, intensity, flicker) {
        const id = this.nextId++;
        this.lights.push({
            id,
            x,
            y,
            radius: radius || 160,
            color: color || '#a0b8d8',
            intensity: intensity || 0.9,
            baseIntensity: intensity || 0.9,
            flicker: flicker || false,
            currentFlicker: 0
        });
        return id;
    }

    removeLight(id) {
        this.lights = this.lights.filter(l => l.id !== id);
    }

    updateLight(id, x, y) {
        const light = this.lights.find(l => l.id === id);
        if (light) {
            light.x = x;
            light.y = y;
        }
    }

    setAmbient(ambient) {
        // Clamp ambient darkness to a comfortable cinematic range (0.3 .. 0.65)
        this.ambientDarkness = Math.max(0.2, Math.min(0.65, ambient !== undefined ? ambient : 0.5));
    }

    clear() {
        this.lights = [];
    }

    update(dt) {
        for (const light of this.lights) {
            if (light.flicker) {
                // Natural gentle lantern flicker
                light.currentFlicker = (Math.sin(performance.now() * 0.006) * 0.08) + (Math.random() * 0.04 - 0.02);
                light.intensity = Math.max(0.6, Math.min(1.0, light.baseIntensity + light.currentFlicker));
            }
        }
    }

    render(ctx, canvasWidth, canvasHeight, cameraX = 0, cameraY = 0) {
        ctx.save();
        
        // 1. Clear light canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // 2. Fill ambient darkness overlay
        ctx.fillStyle = `rgba(6, 8, 14, ${this.ambientDarkness})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 3. Cut out soft illuminated areas through the darkness (destination-out)
        ctx.globalCompositeOperation = 'destination-out';

        for (const light of this.lights) {
            const drawX = light.x - cameraX;
            const drawY = light.y - cameraY;
            const radius = light.radius || 170;
            const intensity = Math.max(0.1, Math.min(1.0, light.intensity || 0.9));

            const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, radius);
            grad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
            grad.addColorStop(0.35, `rgba(255, 255, 255, ${(intensity * 0.85).toFixed(2)})`);
            grad.addColorStop(0.7, `rgba(255, 255, 255, ${(intensity * 0.4).toFixed(2)})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
