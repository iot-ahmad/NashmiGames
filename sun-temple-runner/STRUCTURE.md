# Architecture: Sun Temple Runner

## Ownership

`GameCanvas.tsx` owns only the Babylon engine lifecycle. `game/scene.ts` creates the Babylon scene and returns its `GameHandle`. `GameWorld` owns gameplay state, procedural road sections, visual props, entity spawning, the player silhouette, pursuing guardian, collision checks, camera smoothing, and DOM HUD updates. It is the only object advanced from the scene's pre-render observer.

## Modules

| Module | Responsibility |
|---|---|
| `client/src/components/GameCanvas.tsx` | Lifecycle-safe React canvas host and engine render loop. |
| `client/src/game/scene.ts` | Creates lights, scene, camera, and the `GameWorld`; wires DOM/touch input and returns cleanup. |
| `client/src/game/GameWorld.ts` | Framework-independent running simulation, scene meshes, lane/player state, spawning, collision rules, scoring, visual recycling, and demo autopilot. |
| `client/src/game/assets.ts` | Immutable asset URLs, including the uploaded generated relic emblem. |
| `client/src/game/types.ts` | Shared action and entity types. |

## Runtime State

`GameWorld` represents game mode as `ready | running | struck`. The player owns semantic action flags `left`, `right`, `jump`, `slide`, and `restart`. Lane movement uses `targetLane`; jumping and sliding use duration timers. `RunEntity` records type, lane, world depth, mesh, and whether it has been resolved.

## Asset Hints

The generated amber-and-turquoise relic emblem is used in the HUD. The generated guardian emblem drives the threat HUD and the generated mosaic accent is tiled onto the inlay material. The active world uses clean procedural geometry instead of imported models: a tapered explorer made from capsules and boxes; warm sandstone road tiles and arches; wood barricades; glowing amber relic rings; palm silhouettes and fire bowls. This keeps the draw cost stable while carrying the generated art direction into the game.

## Disposal

Scene disposal owns game meshes, materials, and observers. `GameWorld.dispose()` removes the DOM HUD and unhooks the one global input listener passed to it. `scene.ts` explicitly removes `window` keyboard and pointer listeners during handle disposal.
