import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { GameWorld } from "./GameWorld";
import type { ActionName } from "./types";

export interface GameHandle {
  scene: Scene;
  dispose: () => void;
}

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 0);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.0085;
  scene.fogColor = new Color3(0.54, 0.72, 0.69);

  const camera = new FreeCamera("runner-camera", new Vector3(0, 5.3, -11.2), scene);
  camera.fov = 0.83;
  camera.minZ = 0.1;
  camera.setTarget(new Vector3(0, 1.25, 10));
  scene.activeCamera = camera;

  const skyLight = new HemisphericLight("jungle-sky", new Vector3(0, 1, 0.35), scene);
  skyLight.intensity = 1.18;
  skyLight.diffuse = new Color3(1, 0.86, 0.64);
  skyLight.groundColor = new Color3(0.06, 0.17, 0.13);

  const sunLight = new DirectionalLight("sunrise", new Vector3(-0.35, -0.65, 0.45), scene);
  sunLight.position = new Vector3(25, 35, -10);
  sunLight.intensity = 1.65;
  sunLight.diffuse = new Color3(1, 0.68, 0.35);

  const amberLight = new PointLight("temple-amber", new Vector3(0, 3, 26), scene);
  amberLight.diffuse = new Color3(1, 0.43, 0.08);
  amberLight.intensity = 3.5;
  amberLight.range = 35;

  const glow = new GlowLayer("sun-glow", scene, { blurKernelSize: 48 });
  glow.intensity = 0.62;

  const world = new GameWorld(scene, camera);
  const updateObserver = scene.onBeforeRenderObservable.add(() => {
    world.update(scene.getEngine().getDeltaTime() / 1000);
  });

  const keyboardHandler = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const actions: Record<string, ActionName> = {
      arrowleft: "left",
      a: "left",
      arrowright: "right",
      d: "right",
      arrowup: "jump",
      w: "jump",
      " ": "jump",
      arrowdown: "slide",
      s: "slide",
      r: "restart",
    };
    const action = actions[key];
    if (!action) return;
    event.preventDefault();
    world.action(action);
  };

  let touchStart: { x: number; y: number } | null = null;
  const pointerDown = (event: PointerEvent) => {
    touchStart = { x: event.clientX, y: event.clientY };
  };
  const pointerUp = (event: PointerEvent) => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) {
      world.action("jump");
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) world.action(dx > 0 ? "right" : "left");
    else world.action(dy < 0 ? "jump" : "slide");
  };

  window.addEventListener("keydown", keyboardHandler, { passive: false });
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointerup", pointerUp);

  return {
    scene,
    dispose: () => {
      window.removeEventListener("keydown", keyboardHandler);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointerup", pointerUp);
      scene.onBeforeRenderObservable.remove(updateObserver);
      world.dispose();
      glow.dispose();
      scene.dispose();
    },
  };
}
