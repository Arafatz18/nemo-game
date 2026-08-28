import { PHYSICS, TILE_SIZE } from '../data/GameConfig.js';

export default class Physics {
    update(entities, platforms, dt) {
        for (const entity of entities) {
            this.applyGravity(entity, dt);
            this.moveEntity(entity, platforms, dt);
        }
    }

    applyGravity(entity, dt) {
        if (!entity.onGround) {
            entity.vy += PHYSICS.GRAVITY * dt;
            if (entity.vy > PHYSICS.MAX_FALL_SPEED) {
                entity.vy = PHYSICS.MAX_FALL_SPEED;
            }
        }
    }

    moveEntity(entity, platforms, dt) {
        // Assume slightly simplified dt handling
        entity.onGround = false;
        entity.onWall = false;

        // Move X
        entity.x += entity.vx * dt;
        let xCollisions = this.checkPlatformCollisions(entity, platforms);
        for (const col of xCollisions) {
            if (col.overlapX > 0) {
                this.resolveCollision(entity, col.platform, col);
                entity.onWall = true;
            }
        }

        // Move Y
        entity.y += entity.vy * dt;
        let yCollisions = this.checkPlatformCollisions(entity, platforms);
        for (const col of yCollisions) {
            if (col.overlapY > 0) {
                if (entity.vy > 0 && col.side === 'top') {
                    entity.onGround = true;
                    entity.vy = 0;
                    if (col.platform.moveX) entity.x += col.platform.moveX * dt;
                    if (col.platform.moveY) entity.y += col.platform.moveY * dt;
                } else if (entity.vy < 0 && col.side === 'bottom') {
                    entity.vy = 0;
                }
                this.resolveCollision(entity, col.platform, col);
            }
        }
    }

    checkCollision(a, b) {
        const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

        if (overlapX > 0 && overlapY > 0) {
            let side = '';
            // Determine side based on velocity and center positions
            if (overlapX < overlapY) {
                side = (a.x + a.width / 2 < b.x + b.width / 2) ? 'left' : 'right';
            } else {
                side = (a.y + a.height / 2 < b.y + b.height / 2) ? 'top' : 'bottom';
            }
            return { colliding: true, overlapX, overlapY, side };
        }
        return { colliding: false, overlapX: 0, overlapY: 0, side: '' };
    }

    resolveCollision(entity, platform, collision) {
        if (collision.overlapX < collision.overlapY) {
            if (collision.side === 'left') {
                entity.x -= collision.overlapX;
            } else if (collision.side === 'right') {
                entity.x += collision.overlapX;
            }
            entity.vx = 0;
        } else {
            if (collision.side === 'top') {
                entity.y -= collision.overlapY;
            } else if (collision.side === 'bottom') {
                entity.y += collision.overlapY;
            }
        }
    }

    checkPlatformCollisions(entity, platforms) {
        const collisions = [];
        for (const platform of platforms) {
            const col = this.checkCollision(entity, platform);
            if (col.colliding) {
                if (platform.type === 'one-way' && (entity.vy <= 0 || col.side !== 'top' || entity.y + entity.height - entity.vy > platform.y)) {
                    continue; // Skip one-way if not falling from above
                }
                collisions.push({ platform, ...col });
            }
        }
        return collisions;
    }

    isOnGround(entity, platforms) {
        const testAABB = {
            x: entity.x,
            y: entity.y + 1,
            width: entity.width,
            height: entity.height
        };
        for (const p of platforms) {
            const col = this.checkCollision(testAABB, p);
            if (col.colliding && col.side === 'top' && (p.type !== 'one-way' || entity.vy >= 0)) return true;
        }
        return false;
    }

    checkLedge(entity, platforms) {
        // Simplified ledge detection logic
        const checkPoints = [
            { x: entity.vx > 0 ? entity.x + entity.width + 5 : entity.x - 5, y: entity.y + 5 },
            { x: entity.vx > 0 ? entity.x + entity.width + 5 : entity.x - 5, y: entity.y + 25 }
        ];
        // In full implementation, check if top point is clear and bottom point is colliding with wall
        return null;
    }

    raycast(x1, y1, x2, y2, platforms) {
        // DDA or simple sampling raycast against platforms
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
            const tx = x1 + (x2 - x1) * (i / steps);
            const ty = y1 + (y2 - y1) * (i / steps);
            for (const p of platforms) {
                if (tx >= p.x && tx <= p.x + p.width && ty >= p.y && ty <= p.y + p.height) {
                    if (p.type !== 'one-way') {
                        return { hit: true, x: tx, y: ty };
                    }
                }
            }
        }
        return { hit: false };
    }
}
