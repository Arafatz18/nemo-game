export default class PostProcessing {
  constructor() {
    this.effects = {
      vignette: { enabled: true, intensity: 0.6 },
      bloom: { enabled: true, intensity: 0.3 },
      chromaticAberration: { enabled: false, intensity: 0 },
      filmGrain: { enabled: true, intensity: 0.04 },
      colorGrade: { enabled: true, mode: 'monochrome_blue' },
      scanlines: { enabled: false, intensity: 0 }
    };
    
    this.noiseCanvas = null;
    this.noiseCtx = null;
    this.noiseOffset = 0;
  }

  initNoiseTexture(width, height) {
    if (!this.noiseCanvas) {
      this.noiseCanvas = document.createElement('canvas');
      this.noiseCanvas.width = width / 2; // Optimization
      this.noiseCanvas.height = height / 2;
      this.noiseCtx = this.noiseCanvas.getContext('2d');
      
      const imgData = this.noiseCtx.createImageData(this.noiseCanvas.width, this.noiseCanvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255;
        data[i] = val;
        data[i+1] = val;
        data[i+2] = val;
        data[i+3] = 255; // alpha
      }
      this.noiseCtx.putImageData(imgData, 0, 0);
    }
  }

  update(dt, thirstEffects) {
    if (thirstEffects) {
      if (thirstEffects.aberration > 0) {
        this.effects.chromaticAberration.enabled = true;
        this.effects.chromaticAberration.intensity = thirstEffects.aberration;
      } else {
        this.effects.chromaticAberration.enabled = false;
      }
      
      this.effects.vignette.intensity = thirstEffects.vignette;
    }
    
    this.noiseOffset = (this.noiseOffset + dt * 0.1) % 100;
  }

  render(ctx, canvasWidth, canvasHeight) {
    ctx.save();
    
    // Color Grading
    if (this.effects.colorGrade.enabled) {
      ctx.globalCompositeOperation = 'overlay'; // Or 'color'
      ctx.fillStyle = 'rgba(20, 30, 60, 0.3)'; // Blueish tint
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    ctx.globalCompositeOperation = 'source-over';

    // Vignette
    if (this.effects.vignette.enabled) {
      const grad = ctx.createRadialGradient(
        canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.3,
        canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.8
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, `rgba(0, 0, 0, ${this.effects.vignette.intensity})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Chromatic Aberration (Faux via canvas globalAlpha offset)
    if (this.effects.chromaticAberration.enabled && this.effects.chromaticAberration.intensity > 0) {
      const offset = this.effects.chromaticAberration.intensity * 10;
      
      // Get current image data
      // Note: This is slow in Canvas 2D, we will simulate it with a copy of canvas if we had one,
      // but without a backbuffer, we can draw a tinted rectangle with blend mode
      ctx.globalCompositeOperation = 'color-burn';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      ctx.fillRect(-offset, 0, canvasWidth, canvasHeight);
      
      ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
      ctx.fillRect(offset, 0, canvasWidth, canvasHeight);
    }

    // Scanlines
    if (this.effects.scanlines.enabled) {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.effects.scanlines.intensity})`;
      for (let y = 0; y < canvasHeight; y += 4) {
        ctx.fillRect(0, y, canvasWidth, 1);
      }
    }

    // Film Grain
    if (this.effects.filmGrain.enabled) {
      this.initNoiseTexture(canvasWidth, canvasHeight);
      ctx.globalAlpha = this.effects.filmGrain.intensity;
      ctx.globalCompositeOperation = 'overlay';
      
      const dx = (Math.random() - 0.5) * 50;
      const dy = (Math.random() - 0.5) * 50;
      
      ctx.drawImage(this.noiseCanvas, dx, dy, canvasWidth * 1.2, canvasHeight * 1.2);
    }

    ctx.restore();
  }

  setEffect(name, enabled, intensity) {
    if (this.effects[name]) {
      this.effects[name].enabled = enabled;
      if (intensity !== undefined) {
        this.effects[name].intensity = intensity;
      }
    }
  }

  setThirstEffects(effects) {
    this.update(0, effects);
  }
}
