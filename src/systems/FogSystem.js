export default class FogSystem {
  constructor(config = {}) {
    this.layers = config.layers || [
      { y: 0, speed: 0.2, alpha: 0.1, color: '200, 210, 220', height: 1.0, offset: 0 },
      { y: 0.2, speed: 0.4, alpha: 0.15, color: '210, 220, 230', height: 0.8, offset: 1000 },
      { y: 0.5, speed: 0.7, alpha: 0.2, color: '220, 230, 240', height: 0.6, offset: 2000 },
      { y: 0.8, speed: 1.2, alpha: 0.3, color: '240, 245, 255', height: 0.4, offset: 3000 }
    ];
    this.baseColor = '255, 255, 255';
    this.density = 1.0;
    this.time = 0;
  }

  update(dt, wind = {x: 0, y: 0}) {
    this.time += dt * 0.01;
    for (let layer of this.layers) {
      layer.offset += (layer.speed + wind.x * 0.05) * dt;
    }
  }

  render(ctx, camera, canvasWidth, canvasHeight) {
    ctx.save();
    
    for (let i = 0; i < this.layers.length; i++) {
      let layer = this.layers[i];
      let layerHeight = canvasHeight * layer.height;
      let startY = canvasHeight - layerHeight - layer.y * canvasHeight;
      
      const parts = 10;
      const partWidth = canvasWidth / parts;
      
      ctx.beginPath();
      ctx.moveTo(0, canvasHeight);
      
      for (let j = 0; j <= parts; j++) {
        let x = j * partWidth;
        let wave = Math.sin((x + layer.offset) * 0.005) * 20;
        let wave2 = Math.cos((x + layer.offset * 0.5) * 0.01) * 15;
        ctx.lineTo(x, startY + wave + wave2);
      }
      
      ctx.lineTo(canvasWidth, canvasHeight);
      ctx.lineTo(0, canvasHeight);
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(0, startY, 0, canvasHeight);
      gradient.addColorStop(0, `rgba(${layer.color}, 0)`);
      gradient.addColorStop(0.2, `rgba(${layer.color}, ${layer.alpha * this.density * 0.5})`);
      gradient.addColorStop(1, `rgba(${layer.color}, ${layer.alpha * this.density})`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    ctx.restore();
  }

  setFogColor(color) {
    for (let layer of this.layers) {
      layer.color = color;
    }
  }

  setDensity(density) {
    this.density = density;
  }

  clear() {
    this.layers = [];
  }
}
