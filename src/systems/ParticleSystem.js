export default class ParticleSystem {
  constructor() {
    this.poolSize = 1000;
    this.particles = new Array(this.poolSize);
    for (let i = 0; i < this.poolSize; i++) {
      this.particles[i] = this.createEmptyParticle();
    }
    this.activeCount = 0;
  }

  createEmptyParticle() {
    return {
      active: false,
      x: 0, y: 0,
      vx: 0, vy: 0,
      life: 0, maxLife: 1,
      size: 1,
      color: '#ffffff',
      alpha: 1,
      type: 'dust',
      gravity: 0
    };
  }

  emit(type, x, y, count, config = {}) {
    for (let i = 0; i < count; i++) {
      if (this.activeCount >= this.poolSize) break;
      
      let p = this.particles[this.activeCount];
      p.active = true;
      p.x = x;
      p.y = y;
      p.type = type;
      
      switch(type) {
        case 'dust':
          p.vx = (Math.random() - 0.5) * 0.5;
          p.vy = (Math.random() - 0.5) * 0.5;
          p.maxLife = p.life = 60 + Math.random() * 60;
          p.size = 1 + Math.random() * 2;
          p.color = '#888888';
          p.gravity = 0;
          break;
        case 'firefly':
          p.vx = (Math.random() - 0.5) * 1;
          p.vy = (Math.random() - 0.5) * 1;
          p.maxLife = p.life = 120 + Math.random() * 120;
          p.size = 2 + Math.random() * 2;
          p.color = '#ccff00';
          p.gravity = -0.01;
          break;
        case 'rain':
          p.vx = (Math.random() - 0.5) * 2;
          p.vy = 10 + Math.random() * 5;
          p.maxLife = p.life = 20 + Math.random() * 10;
          p.size = 1;
          p.color = '#88aacc';
          p.gravity = 0.5;
          break;
        case 'spark':
          p.vx = (Math.random() - 0.5) * 10;
          p.vy = (Math.random() - 0.5) * 10;
          p.maxLife = p.life = 15 + Math.random() * 15;
          p.size = 2 + Math.random() * 2;
          p.color = '#ffa500';
          p.gravity = 0.2;
          break;
        case 'fog_wisp':
          p.vx = (Math.random() - 0.5) * 0.2;
          p.vy = 0;
          p.maxLife = p.life = 200 + Math.random() * 100;
          p.size = 30 + Math.random() * 50;
          p.color = '#ffffff';
          p.gravity = 0;
          break;
        case 'magic':
          p.vx = (Math.random() - 0.5) * 2;
          p.vy = -1 - Math.random() * 2;
          p.maxLife = p.life = 40 + Math.random() * 30;
          p.size = 2 + Math.random() * 3;
          p.color = '#88ccff';
          p.gravity = -0.05;
          break;
        case 'splash':
          p.vx = (Math.random() - 0.5) * 4;
          p.vy = -2 - Math.random() * 4;
          p.maxLife = p.life = 20 + Math.random() * 15;
          p.size = 1.5 + Math.random() * 1.5;
          p.color = '#4488ff';
          p.gravity = 0.3;
          break;
        case 'ember':
          p.vx = (Math.random() - 0.5) * 2;
          p.vy = -1 - Math.random() * 3;
          p.maxLife = p.life = 50 + Math.random() * 40;
          p.size = 2 + Math.random() * 2;
          p.color = '#ff4400';
          p.gravity = -0.02;
          break;
        case 'shadow_wisp':
          p.vx = (Math.random() - 0.5) * 1;
          p.vy = -0.5 - Math.random() * 1;
          p.maxLife = p.life = 30 + Math.random() * 20;
          p.size = 10 + Math.random() * 10;
          p.color = '#4B0082';
          p.gravity = -0.01;
          break;
      }
      
      if (config.color) p.color = config.color;
      if (config.size) p.size = config.size;
      
      this.activeCount++;
    }
  }

  update(dt, wind = {x: 0, y: 0}) {
    let aliveCount = 0;
    
    for (let i = 0; i < this.activeCount; i++) {
      let p = this.particles[i];
      
      if (p.active) {
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
        } else {
          p.vy += p.gravity * dt;
          p.vx += wind.x * 0.01 * dt;
          
          if (p.type === 'firefly') {
            p.vx += (Math.random() - 0.5) * 0.5;
            p.vy += (Math.random() - 0.5) * 0.5;
          }
          
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.alpha = Math.max(0, p.life / p.maxLife);
          
          // Swap with the last alive particle to keep the array contiguous
          this.particles[i] = this.particles[aliveCount];
          this.particles[aliveCount] = p;
          aliveCount++;
        }
      }
    }
    
    this.activeCount = aliveCount;
  }

  render(ctx, camera) {
    ctx.save();
    
    for (let i = 0; i < this.activeCount; i++) {
      let p = this.particles[i];
      const drawX = p.x - (camera ? camera.x : 0);
      const drawY = p.y - (camera ? camera.y : 0);
      
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      
      if (p.type === 'rain') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(drawX, drawY);
        ctx.lineTo(drawX - p.vx * 2, drawY - p.vy * 2);
        ctx.stroke();
      } else if (p.type === 'firefly' || p.type === 'magic' || p.type === 'ember') {
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = p.alpha * 0.3;
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }

  clear() {
    this.activeCount = 0;
    for (let i = 0; i < this.poolSize; i++) {
      this.particles[i].active = false;
    }
  }

  getActiveCount() {
    return this.activeCount;
  }
}
