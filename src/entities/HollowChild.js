import Monster from './Monster.js';

export default class HollowChild extends Monster {
    constructor(x, y) {
        super(x, y, {
            width: 32,
            height: 56,
            speed: 0,
            detectionRange: 400,
            health: 1,
            damage: 0 // Drains thirst, handled in contact logic
        });
        this.time = 0;
        this.alpha = 0;
    }

    update(player, platforms, physics, dt) {
        if (!this.active || this.state === 'DEAD') return;
        this.time += dt;

        // Disappears when player faces it directly
        const isFacingMe = (player.facing === 1 && player.x < this.x) || (player.facing === -1 && player.x > this.x);
        
        if (isFacingMe) {
            this.alpha = Math.max(0, this.alpha - dt * 2);
            if (this.alpha === 0) {
                // Teleport behind player
                this.x = player.x - player.facing * 150;
                this.y = player.y; // Simplified
                // Need bounds check in real game
            }
        } else {
            this.alpha = Math.min(0.8, this.alpha + dt);
            // Move closer slowly
            this.x += (player.x > this.x ? 1 : -1) * 0.2;
        }

        // Audio cue trigger logic would go here
    }

    render(ctx, camera) {
        if (!this.active || this.alpha <= 0) return;
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        ctx.save();
        ctx.globalAlpha = this.alpha * (0.5 + Math.sin(this.time * 5) * 0.2); // Pulsing
        
        ctx.translate(drawX + this.width / 2, drawY + this.height / 2);

        // Ethereal child body
        let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.height);
        grad.addColorStop(0, 'rgba(200, 220, 255, 0.8)');
        grad.addColorStop(1, 'rgba(200, 220, 255, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hollow eyes
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(-6, -10, 4, 0, Math.PI * 2);
        ctx.arc(6, -10, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
