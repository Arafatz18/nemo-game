export default class LightingSystem {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.lights = [];
    this.nextId = 1;
    this.ambientDarkness = 0.85;
  }

  addLight(x, y, radius, color, intensity, flicker) {
    const id = this.nextId++;
    this.lights.push({ id, x, y, radius, color, intensity, baseIntensity: intensity, flicker, currentFlicker: 0 });
    return id;
  }

  removeLight(id) {
    this.lights = this.lights.filter(l => l.id !== id);
  }

  updateLight(id, x, y) {
    const light = this.lights.find(l => l.id === id);
    if (light) {
      light.x = x;
      light.y = y;
    }
  }

  update(dt) {
    for (const light of this.lights) {
      if (light.flicker) {
        // Subtle flickering
        light.currentFlicker = (Math.random() * 0.1 - 0.05) * light.flicker;
        light.intensity = Math.max(0, Math.min(1, light.baseIntensity + light.currentFlicker));
      }
    }
  }

  render(ctx, canvasWidth, canvasHeight, cameraX = 0, cameraY = 0) {
    // Fill ambient darkness
    ctx.fillStyle = `rgba(8, 10, 18, ${this.ambientDarkness})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.globalCompositeOperation = 'destination-out';

    for (const light of this.lights) {
      const drawX = light.x - cameraX;
      const drawY = light.y - cameraY;
      
      const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, light.radius);
      grad.addColorStop(0, `rgba(255, 255, 255, ${light.intensity})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(drawX, drawY, light.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    
    // Draw the actual colored light source with 'lighter' composite for warmth
    ctx.globalCompositeOperation = 'lighter';
    for (const light of this.lights) {
      const drawX = light.x - cameraX;
      const drawY = light.y - cameraY;
      
      const colorGrad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, light.radius * 0.8);
      // Construct color string from hex or color name if needed, assuming valid css color
      // but for glowing it's better to use rgb or hsl. Assuming light.color is like '255, 200, 100' or hex.
      // We'll use a hack to apply alpha to it.
      ctx.fillStyle = light.color;
      ctx.globalAlpha = light.intensity * 0.3;
      ctx.beginPath();
      ctx.arc(drawX, drawY, light.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  }

  setAmbient(level) {
    this.ambientDarkness = level;
  }

  clear() {
    this.lights = [];
  }
}
