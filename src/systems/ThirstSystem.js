import { THIRST } from '../data/GameConfig.js';

export default class ThirstSystem {
  constructor() {
    this.maxThirst = THIRST ? THIRST.MAX : 100;
    this.thirst = this.maxThirst;
    this.decreaseRate = THIRST ? THIRST.DECREASE_RATE : 0.05;
    this.hallucinations = [];
    this.hallucinationTimer = 0;
  }

  update(dt, player) {
    this.thirst = Math.max(0, this.thirst - this.decreaseRate * dt);
    
    if (this.thirst < this.maxThirst * 0.25) {
      this.hallucinationTimer += dt;
      if (this.hallucinationTimer > 100) {
        if (Math.random() < 0.05) {
          this.spawnHallucination(player);
        }
        this.hallucinationTimer = 0;
      }
    } else {
      this.hallucinations = [];
    }

    this.updateHallucinations(dt);
  }

  drink(amount) {
    this.thirst = Math.min(this.maxThirst, this.thirst + amount);
  }

  getThirstPercent() {
    return this.thirst / this.maxThirst;
  }

  getEffects() {
    const p = this.getThirstPercent();
    let blur = 0;
    let aberration = 0;
    let distortion = 0;
    let vignette = 0.3 + (1 - p) * 0.5;

    if (p < 0.5) {
      blur = (0.5 - p) * 2;
    }
    if (p < 0.25) {
      aberration = (0.25 - p) * 4;
    }
    if (p < 0.1) {
      distortion = (0.1 - p) * 10;
    }

    return { blur, aberration, distortion, vignette };
  }

  spawnHallucination(player) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 200;
    this.hallucinations.push({
      x: player.x + Math.cos(angle) * distance,
      y: player.y + Math.sin(angle) * distance,
      life: 30 + Math.random() * 60,
      flicker: 0
    });
  }

  updateHallucinations(dt) {
    for (let i = this.hallucinations.length - 1; i >= 0; i--) {
      const h = this.hallucinations[i];
      h.life -= dt;
      h.flicker = Math.random();
      if (h.life <= 0) {
        this.hallucinations.splice(i, 1);
      }
    }
  }

  renderHallucinations(ctx, camera) {
    for (const h of this.hallucinations) {
      if (h.flicker < 0.2) continue; // glitch flicker
      ctx.save();
      const drawX = h.x - (camera ? camera.x : 0);
      const drawY = h.y - (camera ? camera.y : 0);
      
      ctx.globalAlpha = 0.5 * h.flicker;
      ctx.fillStyle = 'black';
      // draw a fake monster silhouette
      ctx.beginPath();
      ctx.arc(drawX, drawY - 20, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(drawX - 10, drawY - 15, 20, 40);
      
      // glowing fake eyes
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(drawX - 5, drawY - 25, 2, 0, Math.PI * 2);
      ctx.arc(drawX + 5, drawY - 25, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  }

  reset() {
    this.thirst = this.maxThirst;
    this.hallucinations = [];
  }
}
