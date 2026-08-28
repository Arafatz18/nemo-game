import { PLAYER, PHYSICS, COLORS } from '../data/GameConfig.js';
import { SPRITE_DATA, FRAME_DURATIONS } from '../data/SpriteData.js';

export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 64;
        this.vx = 0;
        this.vy = 0;
        this.facing = 1;
        this.state = 'IDLE';
        this.health = 100;
        this.onGround = false;
        this.onWall = false;
        this.active = true;

        this.currentAnim = 'IDLE';
        this.frameIndex = 0;
        this.frameTimer = 0;

        this.hasLantern = true;
        this.lanternActive = false;
        this.hasDash = false;
        this.hasSpiritVision = false;
        this.hasWaterWalk = false;
        this.hasMemoryReconstruct = false;

        this.isDashing = false;
        this.dashTimer = 0;
        this.dashCooldown = 0;
        this.invincibilityTimer = 0;
        
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.respawnX = x;
        this.respawnY = y;
    }

    update(input, physics, platforms, dt) {
        if (!this.active || this.state === 'DIE') return;

        if (this.invincibilityTimer > 0) this.invincibilityTimer -= dt;
        if (this.dashCooldown > 0) this.dashCooldown -= dt;

        if (input.keys['f'] && !this.lanternToggleHeld) {
            this.lanternActive = !this.lanternActive;
            this.lanternToggleHeld = true;
        } else if (!input.keys['f']) {
            this.lanternToggleHeld = false;
        }

        if (input.keys['q'] && this.hasDash && this.dashCooldown <= 0 && !this.isDashing) {
            this.dash();
        }

        if (this.isDashing) {
            this.dashTimer -= dt;
            this.vy = 0;
            this.vx = this.facing * 15; // dash speed
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
        } else {
            let moveSpeed = input.keys['shift'] ? 6 : 3;
            if (input.keys['a']) {
                this.vx -= 1;
                this.facing = -1;
            } else if (input.keys['d']) {
                this.vx += 1;
                this.facing = 1;
            } else {
                this.vx *= 0.8; // friction
            }
            
            this.vx = Math.max(-moveSpeed, Math.min(moveSpeed, this.vx));
            this.vy += physics?.gravity || 0.5;
        }

        if (this.onGround) {
            this.coyoteTimer = 0.1;
        } else {
            this.coyoteTimer -= dt;
        }

        if (input.keys[' ']) {
            this.jumpBufferTimer = 0.1;
        } else {
            this.jumpBufferTimer -= dt;
        }

        if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && !this.isDashing) {
            this.vy = -10; // jump force
            this.jumpBufferTimer = 0;
            this.coyoteTimer = 0;
            this.onGround = false;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.y > 2000) {
            this.die();
        }

        // Animation state logic
        if (this.state === 'HURT') {
            this.currentAnim = 'HURT';
        } else if (!this.onGround) {
            this.currentAnim = this.vy < 0 ? 'JUMP' : 'FALL';
        } else if (Math.abs(this.vx) > 0.5) {
            this.currentAnim = input.keys['shift'] ? 'RUN' : 'WALK';
        } else {
            this.currentAnim = 'IDLE';
        }

        this.frameTimer += dt;
        let frameDur = FRAME_DURATIONS ? FRAME_DURATIONS[this.currentAnim] : 0.1;
        if (!frameDur) frameDur = 0.1;
        if (this.frameTimer >= frameDur) {
            this.frameTimer = 0;
            this.frameIndex++;
        }
    }

    render(ctx, renderer, spriteSheet, camera) {
        if (!this.active) return;
        
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        if (this.invincibilityTimer > 0 && Math.floor(this.invincibilityTimer * 10) % 2 === 0) {
            // flicker
            return;
        }

        ctx.save();
        ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
        if (this.facing === -1) {
            ctx.scale(-1, 1);
        }

        // Draw character (placeholder silhouette since no actual sprites)
        ctx.fillStyle = '#223';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Eyes
        ctx.fillStyle = '#8ce'; // glowing eyes
        ctx.fillRect(this.width / 4, -this.height / 4, 6, 6);

        // Lantern
        if (this.hasLantern) {
            ctx.fillStyle = '#111';
            ctx.fillRect(this.width / 2, 0, 4, 20); // staff
            ctx.fillStyle = '#aa4';
            ctx.fillRect(this.width / 2 - 2, -4, 8, 8); // lantern box
        }

        ctx.restore();

        if (this.lanternActive) {
            const lx = drawX + this.width / 2 + (this.width / 2 + 2) * this.facing;
            const ly = drawY + this.height / 2 - 4;
            
            let grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 150);
            grad.addColorStop(0, 'rgba(255, 255, 180, 0.5)');
            grad.addColorStop(1, 'rgba(255, 255, 180, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(lx, ly, 150, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    takeDamage(amount) {
        if (this.invincibilityTimer > 0 || this.state === 'DIE') return;
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        } else {
            this.state = 'HURT';
            this.invincibilityTimer = 1.0;
            this.vy = -5; // knockback
        }
    }

    heal(amount) {
        if (this.state === 'DIE') return;
        this.health = Math.min(100, this.health + amount);
    }

    die() {
        this.state = 'DIE';
        this.health = 0;
        this.active = false;
        setTimeout(() => this.respawn(this.respawnX, this.respawnY), 1000);
    }

    respawn(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.health = 100;
        this.state = 'IDLE';
        this.active = true;
        this.invincibilityTimer = 2.0; // invulnerable on respawn
    }

    unlockAbility(ability) {
        if (ability === 'dash') this.hasDash = true;
        if (ability === 'lantern') this.hasLantern = true;
        if (ability === 'spiritVision') this.hasSpiritVision = true;
        if (ability === 'waterWalk') this.hasWaterWalk = true;
        if (ability === 'memoryReconstruct') this.hasMemoryReconstruct = true;
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    getLanternPosition() {
        return {
            x: this.x + this.width / 2 + (this.width / 2 + 2) * this.facing,
            y: this.y + this.height / 2 - 4
        };
    }

    isLanternActive() {
        return this.lanternActive;
    }

    dash() {
        this.isDashing = true;
        this.dashTimer = 0.2;
        this.dashCooldown = 1.0;
        this.invincibilityTimer = 0.2;
    }
}
