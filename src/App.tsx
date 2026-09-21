import { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { SublevelStudioLandingPage } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';
import { ExternalLink, X } from 'lucide-react';
import './index.css';

const games = [
  { title: "Cobb Can Move", path: "./Cobb-Can-Move/index.html" },
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
  { title: "Classic Two Player Chess", path: "./classic-two-player-chess/dist/index.html" },
  { title: "Irbid Runner", path: "./remix_-irbid-runner/dist/index.html" },
  { title: "Voxel Architect", path: "./snake-game_tcw/voxel-toy-box/dist/index.html" },
  { title: "Multiplayer Neon Snake", path: "./spell-caster/multiplayer-neon-snake/dist/index.html" },
  { title: "Slingshot", path: "./slingshot/dist/index.html" },
  { title: "Sun Temple Runner", path: "./sun-temple-runner/dist/public/index.html" },
  { title: "زمرت — لعبة غرف الفواكه", path: "./zmrt-game/index.html" }
];

function selectWithTransition(update: () => void) {
  if (document.startViewTransition) {
    document.startViewTransition(update);
  } else {
    update();
  }
}

function Scene() {
  return (
    <div className="shader-frame">
      <SublevelStudioLandingPage
        backgroundCanvasSelector="#canvas-container"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

function App() {
  const [currentGame, setCurrentGame] = useState<{ title: string; path: string } | null>(null);

  const handleSelectGame = (game: { title: string; path: string }) => {
    selectWithTransition(() => setCurrentGame(game));
  };

  const closePlayer = () => {
    selectWithTransition(() => setCurrentGame(null));
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Scene />

      <div className="site-shell min-h-screen text-foreground" dir="rtl">
        <header className="site-header mb-10 text-center relative flex flex-col items-center justify-center pt-10 pb-6 px-4">
          <div className="relative z-10 flex flex-col items-center gap-6">
            <h1 className="font-pixel text-xl sm:text-2xl md:text-3xl text-white drop-shadow-[0_0_0_2px_#000,0_4px_0_#000,0_4px_24px_rgba(0,0,0,0.85)] uppercase">
              Zenith Games
            </h1>
            <p className="text-base sm:text-lg text-white/90 font-medium bg-black/50 px-5 py-2 rounded-full backdrop-blur-md border border-white/15 max-w-xl">
              اختار اللعبة اللي بدك ياها والعب مباشرة
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {games.map((game) => (
              <button
                key={game.path}
                type="button"
                onClick={() => handleSelectGame(game)}
                className={`game-card font-pixel group text-right rounded-xl border p-4 min-h-[96px] flex flex-col justify-center transition-all duration-200 ${
                  currentGame?.path === game.path
                    ? 'border-white/40 bg-white/15 shadow-lg shadow-black/40'
                    : 'border-white/10 bg-black/45 hover:border-white/25 hover:bg-black/55 backdrop-blur-md'
                }`}
              >
                <span className="text-[8px] sm:text-[9px] text-white group-hover:text-white">
                  {game.title}
                </span>
              </button>
            ))}
          </div>
        </main>

        {currentGame && (
          <div
            className="game-player-overlay fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={currentGame.title}
          >
            <div className="flex justify-between items-center gap-4 mb-4 max-w-6xl w-full mx-auto">
              <h2 className="font-pixel text-xs sm:text-sm text-white truncate max-w-[min(100%,28rem)]">
                {currentGame.title}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={currentGame.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-sm text-white"
                >
                  تبويب جديد
                  <ExternalLink size={16} />
                </a>
                <button
                  type="button"
                  onClick={closePlayer}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="إغلاق"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 max-w-6xl w-full mx-auto min-h-0 rounded-xl overflow-hidden border border-white/10 bg-black game-player-frame">
              <iframe
                key={currentGame.path}
                title="game-player"
                src={currentGame.path}
                className="w-full h-full min-h-[50vh] game-player-frame"
                sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
