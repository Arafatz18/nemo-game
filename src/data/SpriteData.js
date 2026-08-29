/**
 * SpriteData.js – Frame definitions for Nemo's sprite animations
 * 
 * Image size: 1024 x 228
 * Top text labels are at y: 10..38, sprites are at y: 44..112
 * Bottom text labels are at y: 118..142, sprites are at y: 146..216
 */

export const SPRITE_SHEET_PATH = 'assets/sprites/nemo-spritesheet.png';

export const FRAME_DURATION = {
  IDLE: 200,
  WALK: 120,
  RUN: 90,
  JUMP: 150,
  FALL: 150,
  LAND: 150,
  CLIMB: 180,
  HANG: 200,
  ATTACK: 100,
  CAST: 140,
  HURT: 100,
  DIE: 250
};

export const FRAME_DURATIONS = FRAME_DURATION;

const startX = 205;
const w = 48;
const h = 68;
const y1 = 44;   // Row 1 sprites (below "IDLE", "WALK", "RUN" text)
const y2 = 146;  // Row 2 sprites (below "CLIMB", "HANG", "ATTACK" text)
const gap = 8;

const genFrames = (count, startCol, rowY, frameW = w, frameH = h) => {
  const frames = [];
  for (let i = 0; i < count; i++) {
    frames.push({
      x: startX + (startCol + i) * (frameW + gap),
      y: rowY,
      width: frameW,
      height: frameH,
      w: frameW,
      h: frameH
    });
  }
  return frames;
};

export const SPRITE_DATA = {
  IDLE: genFrames(1, 0, y1),
  WALK: genFrames(4, 1.2, y1),
  RUN: genFrames(3, 5.5, y1),
  JUMP: genFrames(2, 8.8, y1),
  FALL: genFrames(2, 11, y1),
  LAND: genFrames(1, 13.2, y1),
  
  CLIMB: genFrames(2, 0, y2),
  HANG: genFrames(2, 2.2, y2),
  ATTACK: genFrames(2, 4.4, y2, 54, h),
  CAST: genFrames(2, 6.8, y2),
  HURT: genFrames(2, 9.2, y2),
  DIE: genFrames(2, 11.5, 170, 56, 45)
};

export default {
  SPRITE_SHEET_PATH,
  FRAME_DURATION,
  FRAME_DURATIONS,
  SPRITE_DATA
};
