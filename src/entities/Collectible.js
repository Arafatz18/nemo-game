export default class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = type === 'well' ? 48 : (type === 'spring' ? 64 : 24);
        this.height = type === 'well' ? 64 : (type === 'spring' ? 64 : 24);
        this.type = type; // 'water_drop', 'memory', 'well', 'spring', 'soul'
        this.collected = false;
        
        this.time = 0;
        this.bobOffset = 0;
        this.glowRadius = 30;
    }

    update(dt) {
        if (this.collected) return;
        this.time += dt;

        if (this.type === 'water_drop' || this.type === 'memory' || this.type === 'soul') {
            this.bobOffset = Math.sin(this.time * 3) * 5;
            this.glowRadius = 30 + Math.sin(this.time * 5) * 5;
        }
    }

    render(ctx, camera) {
        if (this.collected) return;
        
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y + this.bobOffset;

        ctx.save();
        ctx.translate(drawX + this.width / 2, drawY + this.height / 2);

        if (this.type === 'water_drop') {
            let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.glowRadius);
            grad.addColorStop(0, 'rgba(0, 150, 255, 0.8)');
            grad.addColorStop(1, 'rgba(0, 150, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.glowRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#0bf';
            ctx.beginPath();
            ctx.arc(0, 5, 8, 0, Math.PI);
            ctx.lineTo(0, -10);
            ctx.fill();
        } else if (this.type === 'memory') {
            let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.glowRadius);
            grad.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
            grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.glowRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'soul') {
            let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.glowRadius * 1.5);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.glowRadius * 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'well' || this.type === 'spring') {
            ctx.fillStyle = '#555';
            ctx.fillRect(-this.width / 2, -this.height / 2 + 20, this.width, this.height - 20);
            
            ctx.fillStyle = 'rgba(0, 200, 255, 0.5)';
            ctx.fillRect(-this.width / 2 + 4, -this.height / 2 + 24, this.width - 8, this.height - 24);
        }

        ctx.restore();
    }

    collect() {
        this.collected = true;
        // Trigger pickup effects, sound, add to inventory...
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}
