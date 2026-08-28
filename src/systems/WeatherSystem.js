export default class WeatherSystem {
  constructor() {
    this.currentWeather = 'clear';
    this.targetWeather = 'clear';
    this.windSpeed = 0;
    this.windDirection = 1;
    this.lightningTimer = 0;
    this.rainIntensity = 0;
    this.transitionProgress = 1;
    this.transitionDuration = 0;
    
    this.lightningFlash = 0;
  }

  setWeather(type, duration = 100) {
    this.targetWeather = type;
    this.transitionDuration = duration;
    this.transitionProgress = 0;
  }

  update(dt, particleSystem, cameraX, cameraY, canvasWidth, canvasHeight) {
    if (this.transitionProgress < 1) {
      this.transitionProgress = Math.min(1, this.transitionProgress + dt / this.transitionDuration);
      
      // Interpolate state variables based on target
      let targetRain = (this.targetWeather === 'rain' || this.targetWeather === 'storm') ? 1 : 0;
      let targetWind = (this.targetWeather === 'wind' || this.targetWeather === 'storm') ? 5 : 0;
      
      this.rainIntensity += (targetRain - this.rainIntensity) * 0.1;
      this.windSpeed += (targetWind - this.windSpeed) * 0.05;
      
      if (this.transitionProgress >= 1) {
        this.currentWeather = this.targetWeather;
      }
    } else {
      let targetRain = (this.currentWeather === 'rain' || this.currentWeather === 'storm') ? 1 : 0;
      let targetWind = (this.currentWeather === 'wind' || this.currentWeather === 'storm') ? 5 : 0;
      this.rainIntensity = targetRain;
      this.windSpeed = targetWind;
    }

    // Weather effects
    if (this.rainIntensity > 0) {
      const dropCount = Math.floor(this.rainIntensity * 5);
      for (let i = 0; i < dropCount; i++) {
        particleSystem.emit('rain', cameraX + Math.random() * canvasWidth * 1.5 - canvasWidth * 0.25, cameraY - 50, 1);
      }
    }

    if (this.currentWeather === 'storm' || this.targetWeather === 'storm') {
      if (this.lightningTimer <= 0) {
        if (Math.random() < 0.02 * this.transitionProgress) {
          this.triggerLightning();
          this.lightningTimer = 100 + Math.random() * 300;
        }
      } else {
        this.lightningTimer -= dt;
      }
    }

    if (this.lightningFlash > 0) {
      this.lightningFlash -= dt * 0.05;
    }
  }

  triggerLightning() {
    this.lightningFlash = 1.0;
    // Sound could be triggered here via an event or direct call if available
  }

  getWindForce() {
    return { x: this.windSpeed * this.windDirection, y: 0 };
  }

  render(ctx, canvasWidth, canvasHeight) {
    if (this.lightningFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningFlash * 0.8})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    }
    
    if (this.currentWeather === 'mist' || this.targetWeather === 'mist') {
      ctx.save();
      const mistAlpha = (this.currentWeather === 'mist' ? this.transitionProgress : (1 - this.transitionProgress)) * 0.2;
      ctx.fillStyle = `rgba(220, 220, 230, ${mistAlpha})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    }
  }
}
