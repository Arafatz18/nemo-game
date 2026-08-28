/**
 * main.js – NEMO Game Bootstrap
 * 
 * Entry point that handles the loading flow:
 * Content Warning → Loading Screen → Click to Start → Game
 */

import Game from './engine/Game.js';

// =========================================================================
// DOM ELEMENTS
// =========================================================================

const contentWarning = document.getElementById('content-warning');
const warningContinue = document.getElementById('warning-continue');
const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.getElementById('loading-bar');
const loadingText = document.getElementById('loading-text');
const startOverlay = document.getElementById('start-overlay');
const gameContainer = document.getElementById('game-container');

// Loading tips (rotate during load)
const LOADING_TIPS = [
    'Entering The Hollow...',
    'Gathering shadows...',
    'Lighting the lantern...',
    'Listening to whispers...',
    'The darkness awaits...',
    'Memories are stirring...',
    'Water is life...',
    'Find the light within...'
];

let game = null;

// =========================================================================
// CONTENT WARNING FLOW
// =========================================================================

warningContinue.addEventListener('click', () => {
    contentWarning.classList.add('hidden');
    loadingScreen.classList.remove('hidden');
    startLoading();
});

// =========================================================================
// LOADING
// =========================================================================

async function startLoading() {
    // Rotate loading tips
    let tipIndex = 0;
    const tipInterval = setInterval(() => {
        tipIndex = (tipIndex + 1) % LOADING_TIPS.length;
        if (loadingText) loadingText.textContent = LOADING_TIPS[tipIndex];
    }, 2000);

    try {
        // Simulate staged loading with progress
        updateLoadingBar(5);
        await sleep(200);

        // Create game instance
        game = new Game(gameContainer);
        updateLoadingBar(20);
        await sleep(100);

        // Initialize game (loads assets)
        updateLoadingBar(40);
        loadingText.textContent = 'Loading sprites...';
        await game.init();
        updateLoadingBar(70);
        await sleep(200);

        // Warm up systems
        loadingText.textContent = 'Preparing the world...';
        updateLoadingBar(85);
        await sleep(300);

        // Done
        updateLoadingBar(100);
        loadingText.textContent = 'Ready';
        await sleep(500);

        clearInterval(tipInterval);

        // Show start overlay (needs user click for Web Audio API)
        loadingScreen.classList.add('hidden');
        startOverlay.classList.remove('hidden');

    } catch (error) {
        console.error('Failed to load game:', error);
        clearInterval(tipInterval);
        loadingText.textContent = 'Error loading game. Please refresh.';
        loadingText.style.color = 'rgba(200, 120, 120, 0.8)';
    }
}

function updateLoadingBar(percent) {
    if (loadingBar) {
        loadingBar.style.width = `${percent}%`;
    }
}

// =========================================================================
// START GAME (user interaction required for audio)
// =========================================================================

startOverlay.addEventListener('click', () => {
    startOverlay.classList.add('hidden');

    if (game) {
        game.start();
    }
});

// Also allow Enter/Space to start
document.addEventListener('keydown', (e) => {
    if (!startOverlay.classList.contains('hidden')) {
        if (e.code === 'Space' || e.code === 'Enter') {
            startOverlay.classList.add('hidden');
            if (game) {
                game.start();
            }
        }
    }
});

// =========================================================================
// WINDOW EVENTS
// =========================================================================

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (game) {
        if (document.hidden) {
            // Game handles pausing internally
        }
    }
});

// Prevent context menu on right click
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Handle touch controls
const touchBtns = document.querySelectorAll('.touch-btn');
touchBtns.forEach(btn => {
    const key = btn.getAttribute('data-key');
    if (!key) return;

    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        window.dispatchEvent(new KeyboardEvent('keydown', { code: key }));
    });

    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        window.dispatchEvent(new KeyboardEvent('keyup', { code: key }));
    });
});

// =========================================================================
// UTILITIES
// =========================================================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =========================================================================
// CONSOLE BRANDING
// =========================================================================

console.log(
    '%c NEMO – The Last Drop %c\n' +
    '%c A journey through shadows and memories %c',
    'background: #0a0c14; color: #8caad2; font-size: 18px; font-weight: bold; padding: 8px 16px; border-radius: 4px;',
    '',
    'color: #667; font-style: italic; padding: 4px 0;',
    ''
);
