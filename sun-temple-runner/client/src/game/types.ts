import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";

export type GameMode = "ready" | "running" | "struck";
export type ActionName = "left" | "right" | "jump" | "slide" | "restart";
export type EntityKind = "relic" | "barricade" | "arch" | "gap";

export interface RunEntity {
  kind: EntityKind;
  lane: number;
  z: number;
  root: TransformNode;
  resolved: boolean;
}
