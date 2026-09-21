import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;

    const engine = new Engine(canvas, true, {
      alpha: true,
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });

    let handle: GameHandle | null = null;
    let disposed = false;

    createGameScene(engine, canvas).then((nextHandle) => {
      if (disposed) {
        nextHandle.dispose();
        return;
      }
      handle = nextHandle;
      engine.runRenderLoop(() => nextHandle.scene.render());
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  return (
    <div className="game-shell">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-label="Sun Temple Runner game canvas"
        style={{ touchAction: "none" }}
      />
      <div id="game-ui" aria-live="polite" />
    </div>
  );
}
