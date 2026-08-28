/**
 * LevelData.js – Definitions for all 6 chapters
 * 
 * Scaled coordinates:
 * Ground level: y ≈ 540 (platforms height 260 to ground floor 800)
 * Player spawn: y ≈ 460
 * Level bounds: width 5000-7000, height 800
 */

export const LEVELS = {
  CHAPTER_1: {
    name: "Despair Forest",
    subtitle: "The Fall",
    fogColor: "#141a24",
    ambientLight: 0.55,
    weatherType: "rain",
    levelWidth: 5500,
    levelHeight: 800,
    spawnPoint: { x: 150, y: 460 },
    platforms: [
      { x: 0, y: 540, width: 1400, height: 260, type: "solid" },
      { x: 1500, y: 480, width: 250, height: 30, type: "one_way" },
      { x: 1850, y: 420, width: 250, height: 30, type: "one_way" },
      { x: 2200, y: 540, width: 1200, height: 260, type: "solid" },
      { x: 3500, y: 440, width: 200, height: 30, type: "crumbling" },
      { x: 3800, y: 540, width: 1700, height: 260, type: "solid" }
    ],
    movingPlatforms: [
      { x: 3450, y: 500, width: 180, height: 24, moveX: 180, moveY: -80, speed: 1.5 }
    ],
    checkpoints: [
      { x: 2300, y: 460 },
      { x: 3900, y: 460 }
    ],
    monsters: [
      { type: "watcher", x: 900, y: 476, patrolRange: 250 },
      { type: "watcher", x: 2800, y: 476, patrolRange: 200 },
      { type: "watcher", x: 4400, y: 476, patrolRange: 300 }
    ],
    collectibles: [
      { type: "water_drop", x: 600, y: 480 },
      { type: "memory", x: 1950, y: 360 },
      { type: "water_drop", x: 2600, y: 480 },
      { type: "well", x: 3100, y: 460 },
      { type: "memory", x: 4800, y: 480 }
    ],
    interactables: [
      { type: "lantern_altar", x: 1200, y: 470, width: 60, height: 70, action: "lantern_power" },
      { type: "ancient_gate", x: 5200, y: 420, width: 80, height: 120, action: "open_door" }
    ],
    triggers: [
      { x: 400, y: 400, width: 80, height: 160, event: "dialogue", entries: [{ speaker: null, text: "The cold wind cuts through the trees... I must keep the lantern lit.", duration: 0 }] }
    ],
    exits: [
      { x: 5350, y: 380, width: 100, height: 160, targetChapter: "CHAPTER_2" }
    ],
    parallaxLayers: [
      { type: "mountains", color: "#0c1018", speed: 0.1, yOffset: 120 },
      { type: "trees", color: "#141c28", speed: 0.35, yOffset: 180 }
    ]
  },
  CHAPTER_2: {
    name: "Forgotten Village",
    subtitle: "Echoes of Regret",
    fogColor: "#161822",
    ambientLight: 0.5,
    weatherType: "wind",
    levelWidth: 6000,
    levelHeight: 800,
    spawnPoint: { x: 150, y: 460 },
    platforms: [
      { x: 0, y: 540, width: 1200, height: 260, type: "solid" },
      { x: 1300, y: 460, width: 300, height: 30, type: "one_way" },
      { x: 1700, y: 380, width: 300, height: 30, type: "solid" },
      { x: 2100, y: 540, width: 1500, height: 260, type: "solid" },
      { x: 3700, y: 440, width: 250, height: 30, type: "one_way" },
      { x: 4100, y: 540, width: 1900, height: 260, type: "solid" }
    ],
    movingPlatforms: [
      { x: 3650, y: 500, width: 180, height: 24, moveX: 200, moveY: 0, speed: 2 }
    ],
    checkpoints: [
      { x: 2200, y: 460 },
      { x: 4200, y: 460 }
    ],
    monsters: [
      { type: "crawler", x: 800, y: 500, patrolRange: 300 },
      { type: "watcher", x: 2600, y: 476, patrolRange: 250 },
      { type: "crawler", x: 3000, y: 500, patrolRange: 200 },
      { type: "crawler", x: 4700, y: 500, patrolRange: 400 }
    ],
    collectibles: [
      { type: "water_drop", x: 500, y: 480 },
      { type: "memory", x: 1800, y: 320 },
      { type: "well", x: 2800, y: 460 },
      { type: "water_drop", x: 3400, y: 480 },
      { type: "memory", x: 5200, y: 480 }
    ],
    interactables: [
      { type: "ruin_mechanism", x: 3200, y: 460, width: 60, height: 80, action: "bridge_lower" }
    ],
    triggers: [
      { x: 300, y: 400, width: 80, height: 160, event: "ability", ability: "dash", abilityName: "Shadow Dash [Q]" }
    ],
    exits: [
      { x: 5850, y: 380, width: 100, height: 160, targetChapter: "CHAPTER_3" }
    ],
    parallaxLayers: [
      { type: "ruins", color: "#0f121a", speed: 0.15, yOffset: 140 },
      { type: "trees", color: "#161a26", speed: 0.4, yOffset: 190 }
    ]
  },
  CHAPTER_3: {
    name: "Echo Cave",
    subtitle: "Whispers in the Dark",
    fogColor: "#0d1018",
    ambientLight: 0.45,
    weatherType: "mist",
    levelWidth: 6000,
    levelHeight: 800,
    spawnPoint: { x: 150, y: 460 },
    platforms: [
      { x: 0, y: 540, width: 1500, height: 260, type: "solid" },
      { x: 1600, y: 440, width: 250, height: 30, type: "one_way" },
      { x: 1950, y: 360, width: 250, height: 30, type: "one_way" },
      { x: 2300, y: 540, width: 1400, height: 260, type: "solid" },
      { x: 3800, y: 440, width: 300, height: 30, type: "crumbling" },
      { x: 4200, y: 540, width: 1800, height: 260, type: "solid" }
    ],
    movingPlatforms: [
      { x: 3750, y: 520, width: 180, height: 24, moveX: 200, moveY: -60, speed: 1.8 }
    ],
    checkpoints: [
      { x: 2400, y: 460 },
      { x: 4300, y: 460 }
    ],
    monsters: [
      { type: "hollow_child", x: 1000, y: 476, patrolRange: 200 },
      { type: "hollow_child", x: 2900, y: 476, patrolRange: 200 },
      { type: "watcher", x: 4700, y: 476, patrolRange: 300 }
    ],
    collectibles: [
      { type: "water_drop", x: 700, y: 480 },
      { type: "memory", x: 2050, y: 300 },
      { type: "spring", x: 3100, y: 460 },
      { type: "memory", x: 5000, y: 480 }
    ],
    interactables: [
      { type: "crystal_resonance", x: 3300, y: 460, width: 60, height: 80, action: "crystal_activate" }
    ],
    triggers: [
      { x: 300, y: 400, width: 80, height: 160, event: "ability", ability: "spiritVision", abilityName: "Spirit Vision" }
    ],
    exits: [
      { x: 5850, y: 380, width: 100, height: 160, targetChapter: "CHAPTER_4" }
    ],
    parallaxLayers: [
      { type: "mountains", color: "#080a10", speed: 0.1, yOffset: 100 },
      { type: "ruins", color: "#101420", speed: 0.3, yOffset: 160 }
    ]
  },
  CHAPTER_4: {
    name: "Drowned Marsh",
    subtitle: "Depths of Sorrow",
    fogColor: "#121a1e",
    ambientLight: 0.5,
    weatherType: "rain",
    levelWidth: 6500,
    levelHeight: 800,
    spawnPoint: { x: 150, y: 460 },
    platforms: [
      { x: 0, y: 540, width: 1400, height: 260, type: "solid" },
      { x: 1500, y: 480, width: 280, height: 30, type: "one_way" },
      { x: 1900, y: 540, width: 1200, height: 260, type: "solid" },
      { x: 3200, y: 460, width: 300, height: 30, type: "one_way" },
      { x: 3600, y: 540, width: 1100, height: 260, type: "solid" },
      { x: 4800, y: 540, width: 1700, height: 260, type: "solid" }
    ],
    movingPlatforms: [
      { x: 4700, y: 520, width: 180, height: 24, moveX: 200, moveY: 0, speed: 2.2 }
    ],
    checkpoints: [
      { x: 2000, y: 460 },
      { x: 3700, y: 460 }
    ],
    monsters: [
      { type: "drowned", x: 900, y: 476, patrolRange: 250 },
      { type: "drowned", x: 2400, y: 476, patrolRange: 300 },
      { type: "crawler", x: 3900, y: 500, patrolRange: 250 },
      { type: "drowned", x: 5200, y: 476, patrolRange: 350 }
    ],
    collectibles: [
      { type: "water_drop", x: 600, y: 480 },
      { type: "memory", x: 1600, y: 420 },
      { type: "spring", x: 2700, y: 460 },
      { type: "water_drop", x: 4200, y: 480 },
      { type: "memory", x: 5500, y: 480 }
    ],
    interactables: [
      { type: "water_valve", x: 2800, y: 460, width: 60, height: 80, action: "drain_marsh" }
    ],
    triggers: [
      { x: 300, y: 400, width: 80, height: 160, event: "ability", ability: "waterWalk", abilityName: "Water Walking" }
    ],
    exits: [
      { x: 6350, y: 380, width: 100, height: 160, targetChapter: "CHAPTER_5" }
    ],
    parallaxLayers: [
      { type: "mountains", color: "#091216", speed: 0.1, yOffset: 120 },
      { type: "trees", color: "#101c22", speed: 0.35, yOffset: 170 }
    ]
  },
  CHAPTER_5: {
    name: "Tower of Regret",
    subtitle: "The Inner Beast",
    fogColor: "#1c1214",
    ambientLight: 0.45,
    weatherType: "storm",
    levelWidth: 5000,
    levelHeight: 800,
    spawnPoint: { x: 150, y: 460 },
    platforms: [
      { x: 0, y: 540, width: 1200, height: 260, type: "solid" },
      { x: 1300, y: 460, width: 250, height: 30, type: "one_way" },
      { x: 1650, y: 380, width: 250, height: 30, type: "one_way" },
      { x: 2000, y: 540, width: 3000, height: 260, type: "solid" }
    ],
    movingPlatforms: [],
    checkpoints: [
      { x: 1800, y: 460 }
    ],
    monsters: [
      { type: "regret_beast", x: 3200, y: 350, patrolRange: 500 }
    ],
    collectibles: [
      { type: "spring", x: 1000, y: 460 },
      { type: "memory", x: 1750, y: 320 },
      { type: "well", x: 2400, y: 460 },
      { type: "memory", x: 4200, y: 480 }
    ],
    interactables: [
      { type: "boss_altar", x: 2600, y: 460, width: 80, height: 80, action: "boss_trigger" }
    ],
    triggers: [
      { x: 2500, y: 300, width: 100, height: 300, event: "boss", x: 3200, y: 400 }
    ],
    exits: [
      { x: 4850, y: 380, width: 100, height: 160, targetChapter: "CHAPTER_6" }
    ],
    parallaxLayers: [
      { type: "ruins", color: "#140a0c", speed: 0.1, yOffset: 120 },
      { type: "mountains", color: "#1c1012", speed: 0.35, yOffset: 170 }
    ]
  },
  CHAPTER_6: {
    name: "Final Memory",
    subtitle: "The Choice",
    fogColor: "#161b24",
    ambientLight: 0.65,
    weatherType: "clear",
    levelWidth: 4000,
    levelHeight: 800,
    spawnPoint: { x: 150, y: 460 },
    platforms: [
      { x: 0, y: 540, width: 4000, height: 260, type: "solid" }
    ],
    movingPlatforms: [],
    checkpoints: [],
    monsters: [],
    collectibles: [
      { type: "memory", x: 800, y: 480 },
      { type: "memory", x: 1500, y: 480 },
      { type: "memory", x: 2200, y: 480 },
      { type: "memory", x: 2900, y: 480 },
      { type: "spring", x: 1800, y: 460 }
    ],
    interactables: [
      { type: "final_choice_return", x: 3400, y: 440, width: 80, height: 100, action: "ending_acceptance" },
      { type: "final_choice_stay", x: 3650, y: 440, width: 80, height: 100, action: "ending_lost" }
    ],
    triggers: [
      { x: 3300, y: 300, width: 100, height: 300, event: "ending", endingType: "acceptance" }
    ],
    exits: [],
    parallaxLayers: [
      { type: "mountains", color: "#101824", speed: 0.1, yOffset: 130 },
      { type: "trees", color: "#1a2434", speed: 0.3, yOffset: 180 }
    ]
  }
};

export default LEVELS;
