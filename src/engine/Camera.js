export default class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.width = width;
        this.height = height;
        this.zoom = 1;
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeIntensity = 0;
        
        this.levelWidth = width;
        this.levelHeight = height;
        
        this.panPromise = null;
        this.panResolve = null;
        this.panTime = 0;
        this.panDuration = 0;
        this.panStartX = 0;
        this.panStartY = 0;

        this.zoomTime = 0;
        this.zoomDuration = 0;
        this.zoomStart = 1;
        this.zoomTarget = 1;
    }

    follow(target, lookAhead = 0) {
        if (this.panPromise) return; // Don't follow if panning

        const smoothFactor = 0.08;
        
        // Calculate desired position centered on target
        const desiredX = target.x - (this.width / this.zoom) / 2 + lookAhead;
        const desiredY = target.y - (this.height / this.zoom) / 2;
        
        // Lerp to desired position
        this.x += (desiredX - this.x) * smoothFactor;
        this.y += (desiredY - this.y) * smoothFactor;
    }

    shake(intensity, duration) {
        this.shakeIntensity = intensity;
    }

    pan(targetX, targetY, duration) {
        return new Promise(resolve => {
            this.panPromise = true;
            this.panResolve = resolve;
            this.panTime = 0;
            this.panDuration = duration;
            this.panStartX = this.x;
            this.panStartY = this.y;
            this.targetX = targetX - (this.width / this.zoom) / 2;
            this.targetY = targetY - (this.height / this.zoom) / 2;
        });
    }

    zoomTo(level, duration) {
        this.zoomTime = 0;
        this.zoomDuration = duration;
        this.zoomStart = this.zoom;
        this.zoomTarget = level;
    }

    update(dt) {
        // Handle pan
        if (this.panPromise) {
            this.panTime += dt;
            const t = Math.min(1, this.panTime / this.panDuration);
            const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad
            this.x = this.panStartX + (this.targetX - this.panStartX) * easeT;
            this.y = this.panStartY + (this.targetY - this.panStartY) * easeT;
            
            if (t >= 1) {
                this.panPromise = null;
                if (this.panResolve) this.panResolve();
                this.panResolve = null;
            }
        }

        // Handle zoom
        if (this.zoomDuration > 0) {
            this.zoomTime += dt;
            const t = Math.min(1, this.zoomTime / this.zoomDuration);
            const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            this.zoom = this.zoomStart + (this.zoomTarget - this.zoomStart) * easeT;
            
            if (t >= 1) {
                this.zoomDuration = 0;
            }
        }

        // Handle shake
        if (this.shakeIntensity > 0) {
            this.shakeX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            this.shakeY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            this.shakeIntensity *= 0.9; // decay
            if (this.shakeIntensity < 0.1) this.shakeIntensity = 0;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }

        // Clamp to bounds
        const maxScrollX = Math.max(0, this.levelWidth - this.width / this.zoom);
        const maxScrollY = Math.max(0, this.levelHeight - this.height / this.zoom);
        this.x = Math.max(0, Math.min(this.x, maxScrollX));
        this.y = Math.max(0, Math.min(this.y, maxScrollY));
    }

    worldToScreen(x, y) {
        return {
            x: (x - this.x) * this.zoom + this.shakeX,
            y: (y - this.y) * this.zoom + this.shakeY
        };
    }

    screenToWorld(x, y) {
        return {
            x: (x - this.shakeX) / this.zoom + this.x,
            y: (y - this.shakeY) / this.zoom + this.y
        };
    }

    isVisible(x, y, width, height) {
        const viewW = this.width / this.zoom;
        const viewH = this.height / this.zoom;
        return x < this.x + viewW &&
               x + width > this.x &&
               y < this.y + viewH &&
               y + height > this.y;
    }

    setBounds(levelWidth, levelHeight) {
        this.levelWidth = levelWidth;
        this.levelHeight = levelHeight;
    }

    reset(x, y) {
        this.x = x - (this.width / this.zoom) / 2;
        this.y = y - (this.height / this.zoom) / 2;
        this.panPromise = null;
    }
}
