const games = [
  { title: "Mansaf Quest 2D", path: "./Mansaf-Quest/index.html" },
  { title: "Neon Core Defender", path: "./Neon-Core-Defender/index.html" },
  { title: "An Easy Mario Game", path: "./an-easy-mario-game-with-canvas/an-easy-mario-game-with-canvas/dist/index.html" },
  { title: "Chicken Crossy Road", path: "./Chicken_Crossy_Road/dist/index.html" },
  { title: "Clarity", path: "./Clarity-master/Clarity-master/index.html" },
  { title: "Codepen Challenge Spiders", path: "./codepenchallengespiders-skeletons/codepenchallengespiders-skeletons/dist/index.html" },
  { title: "Drive Mad", path: "./drive-mad-game/drive-mad/dist/index.html" },
  { title: "Ghost Hunting", path: "./Ghost Hunting/index.html" },
  { title: "Go Go (Game)", path: "./Go Go (Game)/index.html" },
  { title: "Halloween Game", path: "./Halloween game/index.html" },
  { title: "Block Blaster", path: "./html5-canvas-gameblockblaster/html5-canvas-gameblockblaster/dist/index.html" },
  { title: "Solitaire", path: "./html5-drag-and-drop-solitaire/html5-drag-and-drop-solitaire/dist/index.html" },
  { title: "Planet Defense", path: "./js-planet-defense-game/js-planet-defense-game/dist/index.html" },
  { title: "Gorillas", path: "./gorillasplain-javascript-game-with-html-canvas/gorillasplain-javascript-game-with-html-canvas/dist/index.html" },
  { title: "Pure Game", path: "./pure-css-auto-resizing-canvas-game/pure-css-auto-resizing-canvas-game/dist/index.html" },
  { title: "Scroll Game Dark Run", path: "./Scroll Game Dark Run/index.html" },
  { title: "Snake Game", path: "./snake-game_tcw/snake-game.html" },
  { title: "Spell Caster", path: "./spell-caster/spell-caster/dist/index.html" },
  { title: "Stack Game", path: "./Stack game with Three.js and Cannon.js/index.html" },
  { title: "Stone Paper and Scissors", path: "./stone-paper-and-scissors/stone-paper-and-scissors/dist/index.html" },
  { title: "Tetris Arcade", path: "./tetris-arcade-gameatari-1988/tetris-arcade-gameatari-1988/dist/index.html" },
  { title: "Ultimate Ride", path: "./ultimate-ride/ultimate-ride/dist/index.html" },
  { title: "VR Sonic", path: "./VR Sonic/index.html" },
  { title: "XO Game", path: "./xo-game/index.html" },
  { title: "لعبة حرف اسم", path: "https://letter-game-1.onrender.com/" }
];

const gamesList = document.getElementById("games-list");
const gameFrame = document.getElementById("game-frame");
const gameTitle = document.getElementById("game-title");
const openNewTabBtn = document.getElementById("open-new-tab");

let currentGamePath = "";

function applyGameSelection(game, button) {
  currentGamePath = game.path;
  gameFrame.src = game.path;
  gameTitle.textContent = `تلعب الآن: ${game.title}`;
  openNewTabBtn.disabled = false;

  document.querySelectorAll(".game-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  button.classList.add("active");
}

function selectGame(game, button) {
  if (document.startViewTransition) {
    document.startViewTransition(() => applyGameSelection(game, button));
  } else {
    applyGameSelection(game, button);
  }
}

// بناء القائمة عند تحميل الصفحة
games.forEach((game) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "game-btn";
  button.textContent = game.title;
  button.addEventListener("click", () => selectGame(game, button));
  gamesList.appendChild(button);
});

// فتح اللعبة في تبويب جديد
openNewTabBtn.addEventListener("click", () => {
  if (!currentGamePath) return;
  window.open(currentGamePath, "_blank");
});
