import Monster from './Monster.js';

export default class Drowned extends Monster {
    constructor(x, y, waterZone) {
        super(x, y, {
            width: 56,
            height: 72,
            speed: 1.5,
            detectionRange: 200,
            health: 80,
            damage: 15
        });
        this.time = 0;
        this.waterZone = waterZone; // e.g. { x, width }
    }

    update(player, platforms, physics, dt) {
        if (!this.active || this.state === 'DEAD') return;
        this.time += dt;

        // Repelled by lantern light
        if (player.isLanternActive() && this.distanceTo(player) < 150) {
            this.facing = player.x < this.x ? 1 : -1;
            this.vx = this.facing * this.speed * 2;
        } else {
            super.update(player, platforms, physics, dt);
        }

        // Clamp to water zone if defined
        if (this.waterZone) {
            if (this.x < this.waterZone.x) {
                this.x = this.waterZone.x;
                this.vx = Math.abs(this.vx);
            } else if (this.x > this.waterZone.x + this.waterZone.width) {
                this.x = this.waterZone.x + this.waterZone.width;
                this.vx = -Math.abs(this.vx);
            }
        }
    }

    render(ctx, camera) {
        if (!this.active) return;
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        ctx.save();
        ctx.translate(drawX + this.width / 2, drawY + this.height);
        
        // Amorphous water shape
        ctx.fillStyle = 'rgba(10, 30, 50, 0.9)';
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0);
        
        for (let i = -this.width / 2; i <= this.width / 2; i += 5) {
            const wave = Math.sin(this.time * 5 + i * 0.1) * 5;
            ctx.lineTo(i, -this.height + wave + Math.random() * 2);
        }
        
        ctx.lineTo(this.width / 2, 0);
        ctx.fill();

        // Drip particles (simple simulation)
        ctx.fillStyle = 'rgba(100, 150, 200, 0.6)';
        for (let i = 0; i < 3; i++) {
            const px = (Math.random() - 0.5) * this.width;
            const py = -this.height + Math.random() * this.height;
            ctx.beginPath();
            ctx.arc(px, py + (this.time * 50) % 20, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
