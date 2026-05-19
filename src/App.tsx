import { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { WebGLShader } from '@/components/ui/webgl-shader';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';
import { ExternalLink } from 'lucide-react';
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
  // Newly added games
  { title: "Classic Two Player Chess", path: "./classic-two-player-chess/dist/index.html" },
  { title: "Irbid Runner", path: "./remix_-irbid-runner/dist/index.html" },
  { title: "Voxel Architect", path: "./snake-game_tcw/voxel-toy-box/dist/index.html" },
  { title: "Multiplayer Neon Snake", path: "./spell-caster/multiplayer-neon-snake/dist/index.html" }
];

function App() {
  const [currentGame, setCurrentGame] = useState<{ title: string, path: string } | null>(null);

  console.log("App rendering, current game:", currentGame?.title || "none");

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <WebGLShader />

      <div className="min-h-screen p-8 text-foreground" dir="rtl">
        <header className="mb-12 text-center">
          <div className="flex justify-center mb-2">
            <img src="./image.png" alt="Nashmi Logo" className="w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-[0_0_20px_rgba(134,59,255,0.4)] hover:scale-105 transition-transform duration-300" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 drop-shadow-sm">
            Nashmi Games
          </h1>
          <p className="text-xl text-muted-foreground">اختار اللعبة اللي بدك ياها والعب مباشرة</p>
        </header>

        <main className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-1/3 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl overflow-y-auto max-h-[70vh] custom-scrollbar">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">قائمة الألعاب</h2>
            <div className="flex flex-col gap-4">
              {games.map((game, index) => (
                <div key={index} className="w-full" onClick={() => setCurrentGame(game)}>
                  <LiquidMetalButton
                    label={game.title}
                    viewMode="text"
                  />
                </div>
              ))}
            </div>
          </aside>

          <section className="w-full lg:w-2/3 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {currentGame ? `تلعب الآن: ${currentGame.title}` : "اختَر لعبة من القائمة"}
              </h2>
              {currentGame && (
                <a
                  href={currentGame.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-sm"
                >
                  افتح في تبويب جديد
                  <ExternalLink size={16} />
                </a>
              )}
            </div>

            <div className="flex-1 bg-black/60 rounded-xl overflow-hidden min-h-[500px] border border-white/5 relative">
              {currentGame ? (
                <iframe
                  key={currentGame.path}
                  title="game-player"
                  src={currentGame.path}
                  className="w-full h-full absolute inset-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-4">
                  <div className="text-6xl animate-bounce mt-20">🎮</div>
                  <p>الرجاء اختيار لعبة للبدء</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
