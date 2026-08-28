import Monster from './Monster.js';

export default class Crawler extends Monster {
    constructor(x, y) {
        super(x, y, {
            width: 48,
            height: 32,
            speed: 4.0,
            detectionRange: 150,
            health: 30,
            damage: 5
        });
        this.time = 0;
    }

    update(player, platforms, physics, dt) {
        if (!this.active || this.state === 'DEAD') return;
        this.time += dt;

        // Hide in light logic could be added here
        if (player.isLanternActive() && this.distanceTo(player) < 100) {
            this.state = 'FLEE';
            this.facing = player.x < this.x ? 1 : -1;
            this.vx = this.facing * this.speed;
        } else {
            super.update(player, platforms, physics, dt);
        }
        
        // Simulating pack behavior - if state is CHASE, alert others (conceptual)
        if (this.state === 'CHASE') {
            this.alertLevel = 1; // Handled by a game manager ideally
        }
    }

    render(ctx, camera) {
        if (!this.active) return;
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        ctx.save();
        ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
        if (this.facing === -1) ctx.scale(-1, 1);

        ctx.fillStyle = '#050505';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.strokeStyle = '#050505';
        ctx.lineWidth = 3;
        const legAnim = Math.sin(this.time * 20) * 10;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 10, 0);
            ctx.quadraticCurveTo(i * 15, -15, i * 20 + legAnim, 15);
            ctx.stroke();
        }

        // Multiple glowing eyes
        ctx.fillStyle = '#4f4';
        ctx.shadowColor = '#4f4';
        ctx.shadowBlur = 5;
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(5 + (i % 3) * 4, -5 + Math.floor(i / 3) * 4, 2, 2);
        }

        ctx.restore();
    }
}
