export default class AudioSystem {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.ambientGain = null;
    this.initialized = false;
    
    this.ambientGenerators = [];
    this.musicInterval = null;
    
    // Pentatonic scale frequencies starting at A3 (220 Hz)
    this.scale = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
  }

  init() {
    if (this.initialized) return;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    this.audioCtx = new AudioContext();
    
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.connect(this.audioCtx.destination);
    
    this.musicGain = this.audioCtx.createGain();
    this.musicGain.connect(this.masterGain);
    
    this.sfxGain = this.audioCtx.createGain();
    this.sfxGain.connect(this.masterGain);
    
    this.ambientGain = this.audioCtx.createGain();
    this.ambientGain.connect(this.masterGain);
    
    this.initialized = true;
  }

  setMasterVolume(v) { if (this.masterGain) this.masterGain.gain.value = v; }
  setMusicVolume(v) { if (this.musicGain) this.musicGain.gain.value = v; }
  setSfxVolume(v) { if (this.sfxGain) this.sfxGain.gain.value = v; }

  playNote(frequency, duration, delay, type = 'sine', destGain) {
    if (!this.initialized) return;
    
    const t = this.audioCtx.currentTime + delay;
    const osc = this.audioCtx.createOscillator();
    const env = this.audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.5, t + 0.05); // Attack
    env.gain.exponentialRampToValueAtTime(0.01, t + duration); // Decay
    
    osc.connect(env);
    env.connect(destGain || this.musicGain);
    
    // Simple reverb via delay
    const delayNode = this.audioCtx.createDelay();
    delayNode.delayTime.value = 0.3;
    const feedback = this.audioCtx.createGain();
    feedback.gain.value = 0.3;
    
    env.connect(delayNode);
    delayNode.connect(feedback);
    feedback.connect(delayNode);
    delayNode.connect(destGain || this.musicGain);
    
    osc.start(t);
    osc.stop(t + duration + 1); // Allow reverb tail
  }

  playMelody(notes, tempo = 120) {
    if (!this.initialized) return;
    let timeOffset = 0;
    const beatLen = 60 / tempo;
    
    for (let note of notes) {
      if (note.freq > 0) {
        this.playNote(note.freq, note.dur * beatLen, timeOffset, note.type || 'triangle', this.musicGain);
      }
      timeOffset += note.dur * beatLen;
    }
  }

  startAmbientMusic(chapter) {
    if (!this.initialized) this.init();
    if (this.musicInterval) clearInterval(this.musicInterval);
    
    this.musicInterval = setInterval(() => {
      const freq = this.scale[Math.floor(Math.random() * this.scale.length)];
      const dur = 2 + Math.random() * 2;
      this.playNote(freq, dur, 0, 'sine', this.musicGain);
    }, 3000 + Math.random() * 2000);
  }

  stopMusic(fadeOut = true) {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (fadeOut && this.initialized) {
      this.musicGain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 2);
    }
  }

  // SFX Helper
  createNoiseBuffer() {
    const bufferSize = this.audioCtx.sampleRate * 2; // 2 seconds
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playStep() {
    if (!this.initialized) return;
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    const env = this.audioCtx.createGain();
    
    noise.connect(filter);
    filter.connect(env);
    env.connect(this.sfxGain);
    
    const t = this.audioCtx.currentTime;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.3, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    noise.start(t);
    noise.stop(t + 0.15);
  }

  playJump() {
    if (!this.initialized) return;
    const osc = this.audioCtx.createOscillator();
    const env = this.audioCtx.createGain();
    
    osc.type = 'sine';
    const t = this.audioCtx.currentTime;
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.2);
    
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.4, t + 0.05);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    
    osc.connect(env);
    env.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + 0.4);
  }

  playLand() {
    if (!this.initialized) return;
    const osc = this.audioCtx.createOscillator();
    const env = this.audioCtx.createGain();
    
    osc.type = 'square';
    const t = this.audioCtx.currentTime;
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.5, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    
    osc.connect(env);
    env.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playCollect() {
    if (!this.initialized) return;
    this.playNote(880, 0.1, 0, 'sine', this.sfxGain);
    this.playNote(1108, 0.2, 0.1, 'sine', this.sfxGain);
  }

  playHurt() {
    if (!this.initialized) return;
    const osc = this.audioCtx.createOscillator();
    const env = this.audioCtx.createGain();
    const dist = this.audioCtx.createWaveShaper();
    
    // Simple distortion curve
    const curve = new Float32Array(400);
    for(let i=0; i<400; i++) {
        let x = i * 2 / 400 - 1;
        curve[i] = (3 + 20) * x * 20 * (Math.PI / 180) / (Math.PI + 20 * Math.abs(x));
    }
    dist.curve = curve;
    dist.oversample = '4x';
    
    osc.type = 'sawtooth';
    const t = this.audioCtx.currentTime;
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.3);
    
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.6, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    
    osc.connect(dist);
    dist.connect(env);
    env.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + 0.4);
  }

  playWaterDrip() {
    if (!this.initialized) return;
    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const env = this.audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.05);
    
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.5, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    const delay = this.audioCtx.createDelay();
    delay.delayTime.value = 0.2;
    const feedback = this.audioCtx.createGain();
    feedback.gain.value = 0.4;
    
    osc.connect(env);
    env.connect(this.sfxGain);
    env.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playWhisper() {
    if (!this.initialized) return;
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 5;
    
    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 2; // 2Hz modulation
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    const env = this.audioCtx.createGain();
    const t = this.audioCtx.currentTime;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.4, t + 0.5);
    env.gain.exponentialRampToValueAtTime(0.01, t + 2.0);
    
    noise.connect(filter);
    filter.connect(env);
    env.connect(this.sfxGain);
    
    lfo.start(t);
    noise.start(t);
    noise.stop(t + 2.1);
    lfo.stop(t + 2.1);
  }

  playLantern() {
    // Continuous warm hum, should probably return a node to stop it later
  }

  playThunder() {
    if (!this.initialized) return;
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    const t = this.audioCtx.currentTime;
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 2);
    
    const env = this.audioCtx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.8, t + 0.1);
    env.gain.exponentialRampToValueAtTime(0.01, t + 3);
    
    noise.connect(filter);
    filter.connect(env);
    env.connect(this.sfxGain);
    
    noise.start(t);
    noise.stop(t + 3.1);
  }

  playMonsterAlert() {
    if (!this.initialized) return;
    this.playNote(220, 0.5, 0, 'sawtooth', this.sfxGain);
    this.playNote(233.08, 0.5, 0, 'sawtooth', this.sfxGain); // Minor second dissonant
  }

  startAmbient(type) {
    if (!this.initialized) this.init();
    // Implementation for continuous ambient noises (wind, rain, etc.)
  }

  suspend() {
    if (this.initialized && this.audioCtx.state === 'running') {
      this.audioCtx.suspend();
    }
  }

  resume() {
    if (this.initialized && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }
}
