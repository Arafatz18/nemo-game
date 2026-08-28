import Monster from './Monster.js';

export default class RegretBeast extends Monster {
    constructor(x, y) {
        super(x, y, {
            width: 200,
            height: 250,
            speed: 0.5,
            detectionRange: 1000,
            health: 1000,
            damage: 30
        });
        this.maxHealth = this.health;
        this.time = 0;
        this.phase = 1;
        this.attackCooldown = 0;
    }

    update(player, platforms, physics, dt) {
        if (!this.active || this.state === 'DEAD') return;
        this.time += dt;
        
        const healthPct = this.health / this.maxHealth;
        if (healthPct < 0.33) this.phase = 3;
        else if (healthPct < 0.66) this.phase = 2;
        else this.phase = 1;

        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        } else {
            this.attack(player);
        }

        // Boss generally stays put or moves slowly
        this.vy += physics?.gravity || 0.5;
        this.y += this.vy;
    }

    attack(player) {
        this.attackCooldown = 3.0; // Wait 3s between attacks
        if (this.phase === 1) {
            // Spawn shadow projectiles (conceptual)
        } else if (this.phase === 2) {
            // Create dark pools
        } else if (this.phase === 3) {
            // Screen distortion and hallucinations
        }
        // Expose vulnerability window
        this.vulnerable = true;
        setTimeout(() => this.vulnerable = false, 1500);
    }

    render(ctx, camera) {
        if (!this.active) return;
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        ctx.save();
        ctx.translate(drawX + this.width / 2, drawY + this.height);

        // Core body
        let grad = ctx.createRadialGradient(0, -this.height / 2, 0, 0, -this.height / 2, this.height / 2);
        grad.addColorStop(0, '#000');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(-this.width, -this.height, this.width * 2, this.height);

        // Pulsing core based on phase
        const pulse = Math.abs(Math.sin(this.time * this.phase * 2));
        ctx.fillStyle = `rgba(150, 0, 255, ${0.3 + pulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(0, -this.height / 2, 40 + pulse * 20, 0, Math.PI * 2);
        ctx.fill();

        // Multiple glowing eyes
        ctx.fillStyle = '#ff0';
        for (let i = 0; i < 5 + this.phase * 2; i++) {
            const ex = Math.sin(i * 1.5 + this.time) * (60);
            const ey = -this.height / 2 + Math.cos(i * 2 + this.time) * (60);
            ctx.beginPath();
            ctx.arc(ex, ey, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
