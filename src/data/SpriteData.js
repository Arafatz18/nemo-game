export const SPRITE_SHEET_PATH = 'assets/sprites/nemo-spritesheet.png';

export const FRAME_DURATION = {
  IDLE: 200,
  WALK: 150,
  RUN: 100,
  JUMP: 150,
  FALL: 150,
  LAND: 150,
  CLIMB: 200,
  HANG: 200,
  ATTACK: 100,
  CAST: 150,
  HURT: 100,
  DIE: 200
};

export const FRAME_DURATIONS = FRAME_DURATION;

const startX = 200;
const w = 56;
const h = 96;
const y1 = 15;
const y2 = 125;
const gap = 4;

const genFrames = (count, startCol, rowY) => {
  const frames = [];
  for (let i = 0; i < count; i++) {
    frames.push({
      x: startX + (startCol + i) * (w + gap),
      y: rowY,
      width: w,
      height: h,
      w: w,
      h: h
    });
  }
  return frames;
};

export const SPRITE_DATA = {
  IDLE: genFrames(2, 0, y1),
  WALK: genFrames(4, 2, y1),
  RUN: genFrames(3, 6, y1),
  JUMP: genFrames(2, 9, y1),
  FALL: genFrames(2, 11, y1),
  LAND: genFrames(1, 13, y1),
  
  CLIMB: genFrames(2, 0, y2),
  HANG: genFrames(2, 2, y2),
  ATTACK: genFrames(3, 4, y2),
  CAST: genFrames(2, 7, y2),
  HURT: genFrames(2, 9, y2),
  DIE: genFrames(3, 11, y2)
};

export default {
  SPRITE_SHEET_PATH,
  FRAME_DURATION,
  SPRITE_DATA
};
