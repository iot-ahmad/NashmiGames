import fs from 'fs';
import path from 'path';

// List of games to copy from root to dist
const games = [
  "Cobb-Can-Move",
  "Mansaf-Quest",
  "Neon-Core-Defender",
  "an-easy-mario-game-with-canvas",
  "Chicken_Crossy_Road",
  "Clarity-master",
  "codepenchallengespiders-skeletons",
  "drive-mad-game",
  "Ghost Hunting",
  "Go Go (Game)",
  "Halloween game",
  "html5-canvas-gameblockblaster",
  "html5-drag-and-drop-solitaire",
  "js-planet-defense-game",
  "gorillasplain-javascript-game-with-html-canvas",
  "pure-css-auto-resizing-canvas-game",
  "Scroll Game Dark Run",
  "snake-game_tcw",
  "spell-caster",
  "Stack game with Three.js and Cannon.js",
  "stone-paper-and-scissors",
  "tetris-arcade-gameatari-1988",
  "ultimate-ride",
  "VR Sonic",
  "xo-game",
  "classic-two-player-chess",
  "remix_-irbid-runner",
  "slingshot",
  "sun-temple-runner",
  "zmrt-laab-Grf-Multiplayer (1)"
];

console.log("Copying game assets to dist...");

// Ensure dist exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy game directories
games.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.cpSync(dir, path.join('dist', dir), { 
      recursive: true, 
      filter: (src) => !src.includes('node_modules') 
    });
    console.log(`Copied ${dir}`);
  } else {
    console.warn(`Warning: Could not find directory ${dir}`);
  }
});

// Copy root images
if (fs.existsSync('image.png')) {
  fs.cpSync('image.png', path.join('dist', 'image.png'));
  console.log('Copied image.png');
}

console.log("Done copying static assets!");
