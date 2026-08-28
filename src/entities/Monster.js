import { MONSTERS, PHYSICS, COLORS } from '../data/GameConfig.js';

export default class Monster {
    constructor(x, y, config = {}) {
        this.x = x;
        this.y = y;
        this.width = config.width || 40;
        this.height = config.height || 40;
        this.vx = 0;
        this.vy = 0;
        this.health = config.health || 50;
        this.damage = config.damage || 10;
        this.speed = config.speed || 2;
        this.detectionRange = config.detectionRange || 200;
        this.attackRange = config.attackRange || 50;
        this.facing = 1;
        this.state = 'PATROL';
        this.alertLevel = 0;
        this.active = true;
        this.onGround = false;

        this.patrolStartX = x;
        this.patrolRange = config.patrolRange || 100;
        this.patrolTimer = 0;
    }

    update(player, platforms, physics, dt) {
        if (!this.active || this.state === 'DEAD') return;

        this.vy += physics?.gravity || 0.5;

        const dist = this.distanceTo(player);
        const canSee = this.canSeePlayer(player, platforms, physics);

        if (this.state === 'HURT') {
            this.vx *= 0.9;
        } else if (dist < this.attackRange && canSee) {
            this.state = 'ATTACK';
            this.vx = 0;
            // trigger attack logic
        } else if (dist < this.detectionRange && canSee) {
            this.state = 'CHASE';
            this.facing = player.x > this.x ? 1 : -1;
            this.vx = this.facing * this.speed;
        } else {
            this.state = 'PATROL';
            if (this.x > this.patrolStartX + this.patrolRange) this.facing = -1;
            if (this.x < this.patrolStartX - this.patrolRange) this.facing = 1;
            this.vx = this.facing * (this.speed * 0.5);
        }

        this.x += this.vx;
        this.y += this.vy;
    }

    render(ctx, camera) {
        if (!this.active) return;
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(drawX, drawY, this.width, this.height);
        
        ctx.fillStyle = 'red';
        ctx.fillRect(drawX + (this.facing === 1 ? this.width - 10 : 0), drawY + 10, 10, 10);
    }

    canSeePlayer(player, platforms, physics) {
        // Simple raycast / distance check
        if (this.distanceTo(player) > this.detectionRange) return false;
        if ((player.x > this.x && this.facing === -1) || (player.x < this.x && this.facing === 1)) return false;
        // Assume line of sight is clear for base monster
        return true;
    }

    takeDamage(amount) {
        if (this.state === 'DEAD') return;
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        } else {
            this.state = 'HURT';
            setTimeout(() => {
                if (this.state !== 'DEAD') this.state = 'CHASE';
            }, 300);
        }
    }

    die() {
        this.state = 'DEAD';
        this.health = 0;
        this.active = false;
        // Dissolve effect handled by particle system elsewhere
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    distanceTo(entity) {
        const dx = (this.x + this.width / 2) - (entity.x + entity.width / 2);
        const dy = (this.y + this.height / 2) - (entity.y + entity.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    }
}
