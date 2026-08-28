export const LEVELS = {
  CHAPTER_1: {
    name: "Despair Forest",
    subtitle: "The Fall",
    fogColor: "#1a1f26",
    ambientLight: 0.3,
    weatherType: "rain",
    levelWidth: 6000,
    levelHeight: 2000,
    spawnPoint: { x: 100, y: 1500 },
    platforms: [
      { x: 0, y: 1800, width: 2000, height: 200, type: "solid" },
      { x: 2200, y: 1800, width: 1000, height: 200, type: "solid" },
      { x: 3500, y: 1600, width: 2500, height: 400, type: "solid" },
      { x: 1500, y: 1600, width: 200, height: 20, type: "one_way" },
      { x: 1800, y: 1400, width: 200, height: 20, type: "crumbling" }
    ],
    movingPlatforms: [
      { x: 2000, y: 1800, width: 200, height: 20, moveX: 200, moveY: 0, speed: 2 }
    ],
    checkpoints: [
      { x: 2500, y: 1700 }
    ],
    monsters: [
      { type: "WATCHER", x: 800, y: 1750, patrolRange: 300 },
      { type: "WATCHER", x: 2400, y: 1750, patrolRange: 200 },
      { type: "WATCHER", x: 3800, y: 1550, patrolRange: 400 },
      { type: "WATCHER", x: 4500, y: 1550, patrolRange: 300 }
    ],
    collectibles: [
      { type: "water_drop", x: 500, y: 1750 },
      { type: "memory", x: 1800, y: 1350 },
      { type: "well", x: 2800, y: 1700 }
    ],
    interactables: [
      { type: "shadow_puzzle", x: 4000, y: 1550, width: 100, height: 100, action: "open_door" }
    ],
    triggers: [
      { x: 300, y: 1500, width: 100, height: 300, event: "intro_dialogue" }
    ],
    exits: [
      { x: 5800, y: 1400, width: 100, height: 200, targetChapter: "CHAPTER_2" }
    ],
    parallaxLayers: [
      { color: "#11141a", speed: 0.2, elements: [] },
      { color: "#161b22", speed: 0.5, elements: [] }
    ]
  },
  CHAPTER_2: {
    name: "Ruins of Memory",
    subtitle: "Fragmented",
    fogColor: "#15181e",
    ambientLight: 0.4,
    weatherType: "wind",
    levelWidth: 7000,
    levelHeight: 3000,
    spawnPoint: { x: 100, y: 2500 },
    platforms: [
      { x: 0, y: 2800, width: 1500, height: 200, type: "solid" },
      { x: 1800, y: 2600, width: 800, height: 400, type: "solid" },
      { x: 2800, y: 2300, width: 1200, height: 700, type: "solid" },
      { x: 4500, y: 2800, width: 2500, height: 200, type: "solid" }
    ],
    movingPlatforms: [
      { x: 1500, y: 2800, width: 300, height: 50, moveX: 0, moveY: -300, speed: 3 },
      { x: 4000, y: 2500, width: 300, height: 50, moveX: 500, moveY: 0, speed: 2 }
    ],
    checkpoints: [
      { x: 2000, y: 2500 },
      { x: 3500, y: 2200 }
    ],
    monsters: [
      { type: "WANDERER", x: 1000, y: 2750, patrolRange: 400 },
      { type: "WATCHER", x: 2200, y: 2550, patrolRange: 200 },
      { type: "WANDERER", x: 3200, y: 2250, patrolRange: 500 },
      { type: "WANDERER", x: 5000, y: 2750, patrolRange: 600 }
    ],
    collectibles: [
      { type: "memory", x: 2200, y: 2200 },
      { type: "water_drop", x: 1200, y: 2700 },
      { type: "spring", x: 3000, y: 2250 }
    ],
    interactables: [
      { type: "light_puzzle", x: 3500, y: 2200, width: 80, height: 80, action: "reveal_platform" }
    ],
    triggers: [
      { x: 1500, y: 2500, width: 100, height: 300, event: "memory_flashback_1" }
    ],
    exits: [
      { x: 6800, y: 2600, width: 100, height: 200, targetChapter: "CHAPTER_3" }
    ],
    parallaxLayers: [
      { color: "#0d1014", speed: 0.1, elements: [] },
      { color: "#11151a", speed: 0.4, elements: [] }
    ]
  },
  CHAPTER_3: {
    name: "The Deep",
    subtitle: "Suffocation",
    fogColor: "#0d1116",
    ambientLight: 0.1,
    weatherType: "none",
    levelWidth: 6500,
    levelHeight: 4000,
    spawnPoint: { x: 100, y: 1000 },
    platforms: [
      { x: 0, y: 1200, width: 800, height: 2800, type: "solid" },
      { x: 1200, y: 1800, width: 600, height: 2200, type: "solid" },
      { x: 2400, y: 2500, width: 800, height: 1500, type: "solid" },
      { x: 3800, y: 3200, width: 2700, height: 800, type: "solid" }
    ],
    movingPlatforms: [
      { x: 800, y: 1200, width: 200, height: 30, moveX: 0, moveY: 600, speed: 2 },
      { x: 1800, y: 1800, width: 200, height: 30, moveX: 0, moveY: 700, speed: 2 },
      { x: 3200, y: 2500, width: 200, height: 30, moveX: 0, moveY: 700, speed: 2 }
    ],
    checkpoints: [
      { x: 1400, y: 1700 },
      { x: 2600, y: 2400 }
    ],
    monsters: [
      { type: "SHADOW", x: 1400, y: 1700, patrolRange: 200 },
      { type: "SHADOW", x: 2600, y: 2400, patrolRange: 300 },
      { type: "SHADOW", x: 4500, y: 3100, patrolRange: 500 }
    ],
    collectibles: [
      { type: "memory", x: 1400, y: 1600 },
      { type: "water_drop", x: 2600, y: 2300 },
      { type: "well", x: 5000, y: 3150 }
    ],
    interactables: [
      { type: "water_puzzle", x: 4200, y: 3100, width: 100, height: 100, action: "drain_water" }
    ],
    triggers: [
      { x: 3500, y: 2800, width: 200, height: 500, event: "claustrophobia_effect" }
    ],
    exits: [
      { x: 6300, y: 3000, width: 100, height: 200, targetChapter: "CHAPTER_4" }
    ],
    parallaxLayers: [
      { color: "#06080a", speed: 0.1, elements: [] },
      { color: "#090c10", speed: 0.3, elements: [] }
    ]
  },
  CHAPTER_4: {
    name: "Echoes of Regret",
    subtitle: "Echoes",
    fogColor: "#1c171e",
    ambientLight: 0.35,
    weatherType: "storm",
    levelWidth: 8000,
    levelHeight: 2500,
    spawnPoint: { x: 100, y: 2000 },
    platforms: [
      { x: 0, y: 2200, width: 2000, height: 300, type: "solid" },
      { x: 2500, y: 2000, width: 1500, height: 500, type: "solid" },
      { x: 4500, y: 2200, width: 3500, height: 300, type: "solid" }
    ],
    movingPlatforms: [
      { x: 2000, y: 2200, width: 250, height: 40, moveX: 250, moveY: -200, speed: 4 }
    ],
    checkpoints: [
      { x: 2800, y: 1900 },
      { x: 5000, y: 2100 }
    ],
    monsters: [
      { type: "SHADOW", x: 1500, y: 2150, patrolRange: 400 },
      { type: "WANDERER", x: 3000, y: 1950, patrolRange: 600 },
      { type: "WATCHER", x: 5500, y: 2150, patrolRange: 300 },
      { type: "SHADOW", x: 6500, y: 2150, patrolRange: 500 }
    ],
    collectibles: [
      { type: "memory", x: 3500, y: 1800 },
      { type: "spring", x: 5200, y: 2100 }
    ],
    interactables: [
      { type: "sound_puzzle", x: 6000, y: 2100, width: 120, height: 120, action: "stop_storm" }
    ],
    triggers: [
      { x: 4000, y: 1500, width: 100, height: 1000, event: "echoes_audio_log" }
    ],
    exits: [
      { x: 7800, y: 2000, width: 100, height: 200, targetChapter: "CHAPTER_5" }
    ],
    parallaxLayers: [
      { color: "#110e12", speed: 0.15, elements: [] },
      { color: "#161218", speed: 0.45, elements: [] }
    ]
  },
  CHAPTER_5: {
    name: "The Beast Within",
    subtitle: "Confrontation",
    fogColor: "#241a1a",
    ambientLight: 0.2,
    weatherType: "ash",
    levelWidth: 6000,
    levelHeight: 2000,
    spawnPoint: { x: 100, y: 1500 },
    platforms: [
      { x: 0, y: 1700, width: 1500, height: 300, type: "solid" },
      { x: 2000, y: 1700, width: 4000, height: 300, type: "solid" }
    ],
    movingPlatforms: [
      { x: 1500, y: 1700, width: 500, height: 40, moveX: 0, moveY: 0, speed: 0 } // Bridge that forms
    ],
    checkpoints: [
      { x: 2200, y: 1600 }
    ],
    monsters: [
      { type: "REGRET_BEAST", x: 4000, y: 1600, patrolRange: 1000, boss: true }
    ],
    collectibles: [
      { type: "memory", x: 2500, y: 1600 },
      { type: "spring", x: 2100, y: 1600 }
    ],
    interactables: [
      { type: "physics_puzzle", x: 1000, y: 1600, width: 200, height: 200, action: "form_bridge" }
    ],
    triggers: [
      { x: 3000, y: 1000, width: 100, height: 1000, event: "boss_encounter" }
    ],
    exits: [
      { x: 5800, y: 1500, width: 100, height: 200, targetChapter: "CHAPTER_6" }
    ],
    parallaxLayers: [
      { color: "#150e0e", speed: 0.1, elements: [] },
      { color: "#1a1212", speed: 0.3, elements: [] }
    ]
  },
  CHAPTER_6: {
    name: "Acceptance",
    subtitle: "Sunrise",
    fogColor: "#2c333a",
    ambientLight: 0.8,
    weatherType: "clear",
    levelWidth: 5000,
    levelHeight: 1500,
    spawnPoint: { x: 100, y: 1000 },
    platforms: [
      { x: 0, y: 1200, width: 5000, height: 300, type: "solid" }
    ],
    movingPlatforms: [],
    checkpoints: [],
    monsters: [],
    collectibles: [
      { type: "memory", x: 1000, y: 1100 },
      { type: "memory", x: 2000, y: 1100 },
      { type: "memory", x: 3000, y: 1100 },
      { type: "memory", x: 4000, y: 1100 }
    ],
    interactables: [],
    triggers: [
      { x: 4500, y: 800, width: 100, height: 500, event: "ending_sequence" }
    ],
    exits: [],
    parallaxLayers: [
      { color: "#1f252a", speed: 0.2, elements: [] },
      { color: "#252b31", speed: 0.6, elements: [] }
    ]
  }
};

export default LEVELS;
