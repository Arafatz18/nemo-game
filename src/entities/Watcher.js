import Monster from './Monster.js';

export default class Watcher extends Monster {
    constructor(x, y) {
        super(x, y, {
            width: 48,
            height: 192,
            speed: 0.5,
            detectionRange: 300,
            health: 200,
            damage: 20
        });
        this.time = 0;
    }

    update(player, platforms, physics, dt) {
        if (!this.active || this.state === 'DEAD') return;
        this.time += dt;

        // Special: Freezes when lantern shines on it
        const dist = this.distanceTo(player);
        let frozen = false;
        if (player.isLanternActive() && dist < 250) {
            // Check if player is facing watcher
            if ((player.facing === 1 && player.x < this.x) || (player.facing === -1 && player.x > this.x)) {
                frozen = true;
            }
        }

        if (frozen) {
            this.vx = 0;
            this.vy += physics?.gravity || 0.5;
            this.x += this.vx;
            this.y += this.vy;
            return; // frozen
        }

        super.update(player, platforms, physics, dt);
    }

    render(ctx, camera) {
        if (!this.active) return;
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        ctx.save();
        ctx.translate(drawX + this.width / 2, drawY + this.height);
        
        // Sway animation
        const sway = Math.sin(this.time * 2) * 0.05;
        ctx.rotate(sway);

        // Draw tall silhouette
        let grad = ctx.createLinearGradient(0, -this.height, 0, 0);
        grad.addColorStop(0, '#0a0a0f');
        grad.addColorStop(1, 'rgba(10, 10, 15, 0.2)');
        ctx.fillStyle = grad;
        
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0);
        ctx.bezierCurveTo(-this.width / 2 + 10, -this.height / 2, -this.width / 2 - 10, -this.height, 0, -this.height);
        ctx.bezierCurveTo(this.width / 2 + 10, -this.height, this.width / 2 - 10, -this.height / 2, this.width / 2, 0);
        ctx.fill();

        // Glowing red eyes
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        const eyeOffset = this.facing === 1 ? 5 : -5;
        ctx.fillRect(eyeOffset - 8, -this.height + 30, 4, 4);
        ctx.fillRect(eyeOffset + 4, -this.height + 30, 4, 4);
        
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 10;
        ctx.fillRect(eyeOffset - 8, -this.height + 30, 4, 4);

        ctx.restore();
    }
}
