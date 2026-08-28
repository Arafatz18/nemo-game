export const CHAPTER_INTROS = [
  { title: "Chapter 1: The Fall", subtitle: "Despair Forest", intro: "A leap into the void. But there is no end, only the beginning of a cold, gray world." },
  { title: "Chapter 2: Fragmented", subtitle: "Ruins of Memory", intro: "Shattered pieces of a life left behind. They cut deeper than glass." },
  { title: "Chapter 3: Suffocation", subtitle: "The Deep", intro: "The pressure builds. The air is thin. Breathe in the darkness." },
  { title: "Chapter 4: Echoes", subtitle: "Echoes of Regret", intro: "Footsteps you cannot unhear. Choices you cannot unmake." },
  { title: "Chapter 5: Confrontation", subtitle: "The Beast Within", intro: "It has your eyes. It knows your pain. Now you must face it." },
  { title: "Chapter 6: Sunrise", subtitle: "Acceptance", intro: "The storm breaks. The lantern flickers, but does not die." }
];

export const MEMORY_FRAGMENTS = [
  { chapter: 1, id: 'm1_1', title: "The Letter", text: "I wrote it a hundred times, but the words were never right." },
  { chapter: 1, id: 'm1_2', title: "Empty Room", text: "The silence was louder than any scream." },
  { chapter: 1, id: 'm1_3', title: "Broken Mirror", text: "I didn't recognize the person staring back." },
  { chapter: 1, id: 'm1_4', title: "A Friend's Call", text: "I let it ring. I couldn't bring myself to answer." },
  { chapter: 1, id: 'm1_5', title: "The Edge", text: "Looking down, the drop seemed like an embrace." },
  
  { chapter: 2, id: 'm2_1', title: "Fading Smile", text: "When did I forget how to laugh?" },
  { chapter: 2, id: 'm2_2', title: "Lost Toy", text: "Childhood felt like a dream belonging to someone else." },
  { chapter: 2, id: 'm2_3', title: "Old Photograph", text: "Colors exist in the past. Everything now is gray." },
  { chapter: 2, id: 'm2_4', title: "The Argument", text: "Sharp words thrown like knives. We both bled." },
  { chapter: 2, id: 'm2_5', title: "Slammed Door", text: "The finality of a closing door." },
  
  { chapter: 3, id: 'm3_1', title: "Heavy Chest", text: "Breathing felt like lifting boulders." },
  { chapter: 3, id: 'm3_2', title: "Drowning", text: "Even on dry land, I was underwater." },
  { chapter: 3, id: 'm3_3', title: "Tears in Rain", text: "No one notices your sorrow in a storm." },
  { chapter: 3, id: 'm3_4', title: "Cold Hands", text: "Seeking warmth, finding only ice." },
  { chapter: 3, id: 'm3_5', title: "The Clock", text: "Tick. Tock. Time slipping away, uselessly." },
  
  { chapter: 4, id: 'm4_1', title: "Unspoken Apology", text: "The words 'I am sorry' lodged in my throat." },
  { chapter: 4, id: 'm4_2', title: "Missed Train", text: "Always one step behind my own life." },
  { chapter: 4, id: 'm4_3', title: "Withered Flower", text: "I tried to care for it. It died anyway." },
  { chapter: 4, id: 'm4_4', title: "Empty Seat", text: "The absence is a presence of its own." },
  { chapter: 4, id: 'm4_5', title: "The Shadow", text: "It follows me, shaped exactly like my guilt." },
  
  { chapter: 5, id: 'm5_1', title: "The Beast", text: "It wasn't hiding under the bed. It was inside." },
  { chapter: 5, id: 'm5_2', title: "Clenched Fists", text: "Anger masking a deep, profound terror." },
  { chapter: 5, id: 'm5_3', title: "Shattered Glass", text: "Breaking things to feel something, anything." },
  { chapter: 5, id: 'm5_4', title: "The Scream", text: "A silent howl that tore my soul apart." },
  { chapter: 5, id: 'm5_5', title: "Darkness", text: "I invited it in. Now it won't leave." },
  
  { chapter: 6, id: 'm6_1', title: "A Spark", text: "A tiny light in the overwhelming void." },
  { chapter: 6, id: 'm6_2', title: "Taking Breath", text: "For the first time, the air didn't burn." },
  { chapter: 6, id: 'm6_3', title: "Extended Hand", text: "I wasn't alone. I just couldn't see them." },
  { chapter: 6, id: 'm6_4', title: "First Step", text: "Moving forward hurts, but standing still is death." },
  { chapter: 6, id: 'm6_5', title: "The Lantern", text: "I will carry my own light from now on." }
];

export const DIALOGUE = {
  intro: [
    { speaker: "Nemo", text: "Where am I? It's so cold." },
    { speaker: "Mysterious Voice", text: "You fell, little spark. Into the place between." }
  ],
  boss_encounter: [
    { speaker: "Regret Beast", text: "YOU CANNOT LEAVE. YOU BELONG TO THE DARK." },
    { speaker: "Nemo", text: "I am more than my mistakes." }
  ]
};

export const ENDINGS = {
  acceptance: "You step out of the shadows. The sky is gray, but there are patches of blue. It will take time, but you will heal.",
  lost_forever: "The darkness claims you. You become just another shadow wandering the abyss.",
  secret: "You found all the memories. You remember who you are. The world blooms in color around you."
};

export const ENVIRONMENTAL_TEXTS = {
  mirror: "It reflects a blurred shape. Is that me?",
  statue: "A figure weeping into its hands. It feels familiar.",
  diary: "Pages filled with scribbles. A desperate mind."
};

export const LOADING_TIPS = [
  "Keep your lantern lit. Shadows fear the light.",
  "Water drops restore your spirit.",
  "Sometimes, you have to fall to learn how to climb.",
  "Memories are painful, but they are yours."
];

export default {
  CHAPTER_INTROS, MEMORY_FRAGMENTS, DIALOGUE, ENDINGS, ENVIRONMENTAL_TEXTS, LOADING_TIPS
};
