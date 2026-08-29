/**
 * Player.js – Nemo Character Controller
 * 
 * Manages player state, animations, input response, physics integration,
 * abilities (Lantern, Dash, Spirit Vision, Water Walking), and rendering.
 */

import { PLAYER, PHYSICS } from '../data/GameConfig.js';
import { SPRITE_DATA, FRAME_DURATIONS } from '../data/SpriteData.js';

export default class Player {
    constructor(x = 150, y = 460) {
        this.x = x;
        this.y = y;
        this.width = PLAYER.WIDTH || 40;
        this.height = PLAYER.HEIGHT || 64;
        this.vx = 0;
        this.vy = 0;
        this.facing = 1; // 1 = right, -1 = left
        this.state = 'IDLE';
        this.health = 100;
        this.maxHealth = 100;
        this.active = true;

        this.onGround = false;
        this.onWall = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;

        // Abilities
        this.hasLantern = true;
        this.lanternActive = true;
        this.hasDash = false;
        this.hasSpiritVision = false;
        this.hasWaterWalk = false;
        this.hasMemoryReconstruct = false;

        // Dash state
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashCooldown = 0;

        // Invincibility
        this.invincible = false;
        this.invincibilityTimer = 0;

        // Animation
        this.currentAnim = 'IDLE';
        this.frameIndex = 0;
        this.frameTimer = 0;

        // Checkpoint spawn
        this.respawnX = x;
        this.respawnY = y;
    }

    update(input, physics, platforms, dt) {
        if (!this.active || this.state === 'DIE') return;

        const dtSec = dt > 1 ? dt / 1000 : dt;

        if (this.invincibilityTimer > 0) {
            this.invincibilityTimer -= dtSec;
            if (this.invincibilityTimer <= 0) this.invincible = false;
        }
        if (this.dashCooldown > 0) {
            this.dashCooldown -= dtSec;
        }

        // --- Abilities Input ---
        if (input.isPressed('KeyF') || input.isPressed('f')) {
            this.lanternActive = !this.lanternActive;
        }

        if ((input.isPressed('KeyQ') || input.isPressed('q')) && this.hasDash && this.dashCooldown <= 0 && !this.isDashing) {
            this.dash();
        }

        // --- Movement Input ---
        if (this.isDashing) {
            this.dashTimer -= dtSec;
            this.vy = 0;
            this.vx = this.facing * (PLAYER.DASH_SPEED || 14);
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
        } else {
            const isRun = input.isDown('shift');
            const maxSpeed = isRun ? (PLAYER.RUN_SPEED || 5.5) : (PLAYER.WALK_SPEED || 3.5);
            
            const movingLeft = input.isDown('arrowleft');
            const movingRight = input.isDown('arrowright');

            if (movingLeft && !movingRight) {
                this.vx = -maxSpeed;
                this.facing = -1;
            } else if (movingRight && !movingLeft) {
                this.vx = maxSpeed;
                this.facing = 1;
            } else {
                this.vx *= 0.7;
                if (Math.abs(this.vx) < 0.1) this.vx = 0;
            }

            // Gravity
            this.vy += (PHYSICS?.GRAVITY || 0.6);
            if (this.vy > (PHYSICS?.MAX_FALL_SPEED || 12)) {
                this.vy = PHYSICS.MAX_FALL_SPEED;
            }
        }

        // --- Jump Input & Buffering ---
        if (this.onGround) {
            this.coyoteTimer = 0.15;
        } else {
            this.coyoteTimer -= dtSec;
        }

        const jumpPressed = input.isPressed('space') || input.isPressed('arrowup');
        if (jumpPressed) {
            this.jumpBufferTimer = 0.15;
        } else {
            this.jumpBufferTimer -= dtSec;
        }

        if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && !this.isDashing) {
            this.vy = (PLAYER.JUMP_FORCE || -11);
            this.jumpBufferTimer = 0;
            this.coyoteTimer = 0;
            this.onGround = false;
        }

        // --- Physics & Collision Movement ---
        this._handlePhysics(platforms);

        // Fall into void check
        if (this.y > 1500) {
            this.die();
        }

        // --- Animation State ---
        if (this.state === 'HURT') {
            this.currentAnim = 'HURT';
        } else if (!this.onGround) {
            this.currentAnim = this.vy < 0 ? 'JUMP' : 'FALL';
        } else if (Math.abs(this.vx) > 0.4) {
            this.currentAnim = input.isDown('shift') ? 'RUN' : 'WALK';
        } else {
            this.currentAnim = 'IDLE';
        }
        this.state = this.currentAnim;

        // Frame update
        this.frameTimer += dt;
        const dur = (FRAME_DURATIONS && FRAME_DURATIONS[this.currentAnim]) ? FRAME_DURATIONS[this.currentAnim] : 150;
        if (this.frameTimer >= dur) {
            this.frameTimer = 0;
            this.frameIndex = (this.frameIndex + 1) % 4;
        }
    }

    _handlePhysics(platforms) {
        if (!platforms || platforms.length === 0) {
            this.x += this.vx;
            this.y += this.vy;
            return;
        }

        // 1. Move on X axis
        const oldX = this.x;
        this.x += this.vx;
        this.onWall = false;

        for (const p of platforms) {
            if (p.destroyed || p.type === 'one_way') continue;

            // Only check vertical wall overlap if platform overlaps player torso
            const isTorsoOverlap = (this.y + this.height - 10 > p.y) && (this.y + 10 < p.y + p.height);
            
            if (isTorsoOverlap && this._aabbOverlap(this, p)) {
                if (this.vx > 0) {
                    this.x = p.x - this.width;
                    this.onWall = true;
                } else if (this.vx < 0) {
                    this.x = p.x + p.width;
                    this.onWall = true;
                }
                this.vx = 0;
            }
        }

        // 2. Move on Y axis
        const oldY = this.y;
        this.y += this.vy;
        this.onGround = false;

        for (const p of platforms) {
            if (p.destroyed) continue;

            if (p.type === 'one_way') {
                // Land on one-way platform from above
                if (this.vy >= 0 && (oldY + this.height) <= p.y + 10 && (this.y + this.height) >= p.y) {
                    // Check horizontal overlap
                    if (this.x + this.width > p.x && this.x < p.x + p.width) {
                        this.y = p.y - this.height;
                        this.vy = 0;
                        this.onGround = true;
                        if (p.type === 'moving' && p.moveX) {
                            this.x += p.moveX * 0.016;
                        }
                    }
                }
            } else {
                // Solid platform
                if (this._aabbOverlap(this, p)) {
                    if (this.vy > 0 && oldY + this.height <= p.y + 16) {
                        // Landing on top
                        this.y = p.y - this.height;
                        this.vy = 0;
                        this.onGround = true;
                        if (p.type === 'moving' && p.moveX) {
                            this.x += p.moveX * 0.016;
                        }
                    } else if (this.vy < 0 && oldY >= p.y + p.height - 16) {
                        // Hitting ceiling from below
                        this.y = p.y + p.height;
                        this.vy = 0;
                    }
                }
            }
        }
    }

    _aabbOverlap(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    render(ctx, renderer, spriteSheet, camera) {
        if (!this.active) return;
        
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        // Invincibility flicker
        if (this.invincible && Math.floor(performance.now() / 100) % 2 === 0) {
            return;
        }

        ctx.save();
        ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
        if (this.facing === -1) {
            ctx.scale(-1, 1);
        }

        // --- Try rendering from sprite sheet if available ---
        let drewSprite = false;
        if (spriteSheet && SPRITE_DATA && SPRITE_DATA[this.currentAnim]) {
            const frames = SPRITE_DATA[this.currentAnim];
            const frame = frames[this.frameIndex % frames.length];
            if (frame && (frame.width || frame.w) && (frame.height || frame.h)) {
                const fw = frame.width || frame.w;
                const fh = frame.height || frame.h;
                ctx.drawImage(
                    spriteSheet,
                    frame.x, frame.y, fw, fh,
                    -this.width / 2, -this.height / 2,
                    this.width, this.height
                );
                drewSprite = true;
            }
        }

        // --- Procedural High-Quality Silhouette Fallback / Overlay ---
        if (!drewSprite) {
            // Hood & Cloak
            ctx.fillStyle = '#0f1118';
            ctx.beginPath();
            ctx.arc(0, -18, 14, Math.PI, 0);
            ctx.lineTo(16, 26);
            ctx.lineTo(-16, 26);
            ctx.closePath();
            ctx.fill();

            // Inner Shadow face
            ctx.fillStyle = '#05060a';
            ctx.beginPath();
            ctx.arc(0, -14, 9, 0, Math.PI * 2);
            ctx.fill();

            // Glowing White/Cyan Eyes
            ctx.fillStyle = '#e8f4ff';
            ctx.shadowColor = 'rgba(160, 210, 255, 0.9)';
            ctx.shadowBlur = 8;
            ctx.fillRect(2, -16, 4, 3);
            ctx.fillRect(7, -16, 4, 3);
            ctx.shadowBlur = 0;

            // Lantern Staff
            if (this.hasLantern) {
                ctx.fillStyle = '#2d3340';
                ctx.fillRect(14, -28, 3, 56);
                ctx.fillStyle = '#404a5c';
                ctx.fillRect(11, -34, 9, 10);

                if (this.lanternActive) {
                    ctx.fillStyle = '#fff7d9';
                    ctx.shadowColor = 'rgba(255, 230, 140, 0.8)';
                    ctx.shadowBlur = 12;
                    ctx.fillRect(13, -32, 5, 6);
                    ctx.shadowBlur = 0;
                }
            }
        }

        // Always add glowing aura around lantern tip
        if (this.hasLantern && this.lanternActive) {
            const flicker = Math.sin(performance.now() * 0.008) * 4;
            const grad = ctx.createRadialGradient(16, -28, 2, 16, -28, 36 + flicker);
            grad.addColorStop(0, 'rgba(255, 240, 180, 0.6)');
            grad.addColorStop(0.4, 'rgba(220, 190, 120, 0.25)');
            grad.addColorStop(1, 'rgba(200, 170, 100, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(16, -28, 36 + flicker, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Dash trail effect
        if (this.isDashing) {
            ctx.fillStyle = 'rgba(140, 180, 220, 0.2)';
            ctx.fillRect(drawX - this.facing * 15, drawY, this.width, this.height);
        }
    }

    takeDamage(amount = 15) {
        if (this.invincible || !this.active) return;

        this.health -= amount;
        this.invincible = true;
        this.invincibilityTimer = 1.0;
        this.state = 'HURT';

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }

    heal(amount = 20) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    die() {
        this.active = false;
        this.state = 'DIE';
    }

    respawn(x, y) {
        this.x = x !== undefined ? x : this.respawnX;
        this.y = y !== undefined ? y : this.respawnY;
        this.vx = 0;
        this.vy = 0;
        this.health = this.maxHealth;
        this.active = true;
        this.state = 'IDLE';
        this.invincible = true;
        this.invincibilityTimer = 1.5;
    }

    unlockAbility(ability) {
        switch (ability) {
            case 'lantern': this.hasLantern = true; break;
            case 'dash': this.hasDash = true; break;
            case 'spiritVision': this.hasSpiritVision = true; break;
            case 'waterWalk': this.hasWaterWalk = true; break;
            case 'memoryReconstruct': this.hasMemoryReconstruct = true; break;
        }
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    getLanternPosition() {
        return {
            x: this.x + this.width / 2 + (this.facing === 1 ? 16 : -16),
            y: this.y + 12
        };
    }

    isLanternActive() {
        return this.hasLantern && this.lanternActive;
    }

    dash() {
        if (!this.hasDash || this.dashCooldown > 0 || this.isDashing) return;
        this.isDashing = true;
        this.dashTimer = 0.18;
        this.dashCooldown = 1.0;
    }
}
