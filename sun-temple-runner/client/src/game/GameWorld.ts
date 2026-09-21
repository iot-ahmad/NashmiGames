import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import type { Scene } from "@babylonjs/core/scene";
import { assets } from "./assets";
import type { ActionName, EntityKind, GameMode, RunEntity } from "./types";

const LANE_WIDTH = 3.9;
const ROAD_LENGTH = 13;
const ROAD_COUNT = 14;
const BASE_SPEED = 14;
const MAX_SPEED = 34;
const SPEED_RAMP = 300;
const DISTANCE_MULT = 1.92;
const LANE_SNAP = 18;
const c = (hex: string) => Color3.FromHexString(hex);

interface RoadSection {
  root: TransformNode;
}

export class GameWorld {
  private readonly roadSections: RoadSection[] = [];
  private readonly entities: RunEntity[] = [];
  private readonly player: TransformNode;
  private readonly playerBody: TransformNode;
  private readonly leftLeg: TransformNode;
  private readonly rightLeg: TransformNode;
  private readonly leftArm: TransformNode;
  private readonly rightArm: TransformNode;
  private readonly scarf: TransformNode;
  private readonly shadowDisc: TransformNode;
  private readonly horizon: TransformNode;
  private mode: GameMode = "ready";
  private targetLane = 0;
  private playerX = 0;
  private jumpTimer = 0;
  private slideTimer = 0;
  private elapsed = 0;
  private distance = 0;
  private relics = 0;
  private speed = BASE_SPEED;
  private spawnTimer = 0;
  private spawnIndex = 0;
  private demoTimer = 0;
  private readonly demo: boolean;
  private hudRoot: HTMLDivElement | null = null;
  private statusNode: HTMLElement | null = null;
  private distanceNode: HTMLElement | null = null;
  private relicNode: HTMLElement | null = null;
  private guardianBar: HTMLElement | null = null;
  private threatNode: HTMLElement | null = null;
  private chaseNode: HTMLElement | null = null;

  constructor(
    private readonly scene: Scene,
    private readonly camera: FreeCamera,
  ) {
    this.demo = new URLSearchParams(window.location.search).has("demo");
    this.player = new TransformNode("explorer-root", scene);
    this.playerBody = new TransformNode("explorer-body", scene);
    this.leftLeg = new TransformNode("explorer-left-leg", scene);
    this.rightLeg = new TransformNode("explorer-right-leg", scene);
    this.leftArm = new TransformNode("explorer-left-arm", scene);
    this.rightArm = new TransformNode("explorer-right-arm", scene);
    this.scarf = new TransformNode("explorer-scarf", scene);
    this.shadowDisc = new TransformNode("explorer-shadow", scene);
    this.horizon = new TransformNode("distant-temple", scene);

    this.makeMaterials();
    this.createCauseway();
    this.createExplorer();
    this.createSkyline();
    this.createHud();

    if (this.demo) {
      this.start();
    }
  }

  public update(delta: number) {
    const dt = Math.min(delta, 0.05);
    this.elapsed += dt;
    this.animateExplorer(dt);
    this.updateCamera(dt);

    if (this.mode !== "running") {
      return;
    }

    this.speed = Math.min(MAX_SPEED, BASE_SPEED + this.distance / SPEED_RAMP);
    this.distance += this.speed * dt * DISTANCE_MULT;
    this.spawnTimer += dt;
    this.demoTimer += dt;

    this.updateRoad(dt);
    this.updateEntities(dt);
    this.runSpawner();
    if (this.demo) this.runAutopilot();
    this.updateHud();
    this.updateGuardianThreat();
  }

  public action(action: ActionName) {
    if (action === "restart") {
      this.restart();
      return;
    }
    if (this.mode !== "running") {
      this.start();
      return;
    }
    if (action === "left") this.targetLane = Math.max(-1, this.targetLane - 1);
    if (action === "right") this.targetLane = Math.min(1, this.targetLane + 1);
    if (action === "jump" && this.jumpTimer <= 0 && this.slideTimer <= 0) this.jumpTimer = 0.76;
    if (action === "slide" && this.slideTimer <= 0 && this.jumpTimer <= 0) this.slideTimer = 0.7;
  }

  public dispose() {
    this.hudRoot?.remove();
    this.entities.forEach((entity) => entity.root.dispose());
    this.roadSections.forEach((section) => section.root.dispose());
    this.player.dispose();
    this.horizon.dispose();
  }

  private makeMaterials() {
    const shared = {
      sandstone: this.material("sandstone", "#A8743E", "#2B160B"),
      sandLight: this.material("sand-light", "#D9A969", "#4C2A10"),
      mosaic: this.material("teal-mosaic", "#0C8A83", "#003C3B", "#058F8A"),
      moss: this.material("moss", "#2D6244", "#0F281C"),
      wood: this.material("wood", "#6C341B", "#2A1208"),
      woodLight: this.material("wood-light", "#A75A28", "#321307"),
      bronze: this.material("bronze", "#A85C18", "#47230A", "#5B2A09"),
      amber: this.material("amber", "#FF9F16", "#522200", "#FF7D00"),
      scarf: this.material("scarf", "#0B9D98", "#023B3C", "#037C78"),
      jacket: this.material("jacket", "#5A3424", "#211109"),
      pants: this.material("pants", "#2C3B3B", "#101B1C"),
      skin: this.material("skin", "#A46747", "#3A1E15"),
      leaf: this.material("leaf", "#21683E", "#0A2A18"),
      dark: this.material("dark", "#10161A", "#050709"),
      water: this.material("water", "#123B4D", "#07151F", "#0B2A36"),
      tealGlow: this.material("teal-glow", "#0BD4CC", "#023B3C", "#12FFF4"),
      hazard: this.material("hazard", "#FF5A1F", "#4A1200", "#FF7A33"),
      visor: this.material("visor", "#7EE8FF", "#0A2830", "#3BE8FF"),
      armor: this.material("armor", "#1A2830", "#050A0D", "#0E4A52"),
    };
    Object.entries(shared).forEach(([key, value]) => {
      this.scene.metadata ??= {};
      this.scene.metadata[key] = value;
    });
  }

  private material(name: string, diffuse: string, specular: string, emissive?: string) {
    const material = new StandardMaterial(name, this.scene);
    material.diffuseColor = c(diffuse);
    material.specularColor = c(specular);
    if (emissive) material.emissiveColor = c(emissive);
    return material;
  }

  private m(name: string): StandardMaterial {
    return this.scene.metadata?.[name] as StandardMaterial;
  }

  private createCauseway() {
    for (let i = 0; i < ROAD_COUNT; i += 1) {
      const root = new TransformNode(`road-${i}`, this.scene);
      root.position.z = -12 + i * ROAD_LENGTH;
      this.makeRoadSection(root, i);
      this.roadSections.push({ root });
    }
  }

  private makeRoadSection(root: TransformNode, seed: number) {
    const road = MeshBuilder.CreateBox(`sand-road-${seed}`, { width: 13.4, height: 0.42, depth: ROAD_LENGTH + 0.15 }, this.scene);
    road.position.y = -0.25;
    road.parent = root;
    road.material = this.m("sandstone");

    for (let row = 0; row < 4; row += 1) {
      for (let lane = -1; lane <= 1; lane += 1) {
        const tile = MeshBuilder.CreateBox(`slab-${seed}-${row}-${lane}`, { width: 3.92, height: 0.13, depth: 2.85 }, this.scene);
        tile.parent = root;
        tile.position.set(lane * LANE_WIDTH, 0.03, -4.8 + row * 3.2 + ((row + lane) % 2) * 0.1);
        tile.material = (row + lane + seed) % 4 === 0 ? this.m("sandLight") : this.m("sandstone");
      }
    }

    [-2, 2].forEach((x) => {
      const strip = MeshBuilder.CreateBox(`inlay-${seed}-${x}`, { width: 0.22, height: 0.16, depth: ROAD_LENGTH - 0.6 }, this.scene);
      strip.parent = root;
      strip.position.set(x, 0.08, 0);
      strip.material = this.m("mosaic");
    });

    [-6.45, 6.45].forEach((x, side) => {
      const rail = MeshBuilder.CreateBox(`rail-${seed}-${side}`, { width: 0.36, height: 0.76, depth: ROAD_LENGTH }, this.scene);
      rail.parent = root;
      rail.position.set(x, 0.36, 0);
      rail.material = this.m("sandLight");
      for (let z = -4; z <= 4; z += 4) {
        const pillar = MeshBuilder.CreateBox(`pillar-${seed}-${side}-${z}`, { width: 0.68, height: 1.45, depth: 0.68 }, this.scene);
        pillar.parent = root;
        pillar.position.set(x, 0.58, z);
        pillar.material = this.m("sandstone");
      }
    });

    const leftTree = this.createPalm(`palm-left-${seed}`, -10.2, (seed % 3) * 1.1 - 1.5, -1.5);
    const rightTree = this.createPalm(`palm-right-${seed}`, 10.4, ((seed + 1) % 3) * 1.1 - 1.5, 2.2);
    leftTree.parent = root;
    rightTree.parent = root;

    if (seed % 3 === 0) {
      const ruin = this.createRuin(`ruin-${seed}`, seed % 2 ? -9 : 9, 2.5);
      ruin.parent = root;
    }
  }

  private createPalm(name: string, x: number, z: number, lean: number) {
    const root = new TransformNode(name, this.scene);
    root.position.set(x, 0, z);
    root.rotation.z = lean * 0.035;
    const trunk = MeshBuilder.CreateCylinder(`${name}-trunk`, { height: 6.5, diameterTop: 0.42, diameterBottom: 0.72, tessellation: 7 }, this.scene);
    trunk.parent = root;
    trunk.position.y = 3.1;
    trunk.material = this.m("wood");
    for (let i = 0; i < 7; i += 1) {
      const leaf = MeshBuilder.CreateBox(`${name}-leaf-${i}`, { width: 0.45, height: 0.1, depth: 4.6 }, this.scene);
      leaf.parent = root;
      leaf.position.set(Math.sin(i * 0.9) * 0.4, 6.1 + (i % 2) * 0.12, Math.cos(i * 0.9) * 0.4);
      leaf.rotation.set((i % 2 ? 0.18 : -0.14), i * 0.9, 1.1);
      leaf.material = this.m("leaf");
    }
    return root;
  }

  private createRuin(name: string, x: number, z: number) {
    const root = new TransformNode(name, this.scene);
    root.position.set(x, 0, z);
    const base = MeshBuilder.CreateBox(`${name}-base`, { width: 2.4, height: 2.8, depth: 2.4 }, this.scene);
    base.parent = root;
    base.position.y = 1.4;
    base.material = this.m("sandstone");
    const teal = MeshBuilder.CreateBox(`${name}-tile`, { width: 2.5, height: 0.55, depth: 0.09 }, this.scene);
    teal.parent = root;
    teal.position.set(0, 2.1, -1.23);
    teal.material = this.m("mosaic");
    const fire = MeshBuilder.CreateSphere(`${name}-fire`, { diameter: 0.55, segments: 8 }, this.scene);
    fire.parent = root;
    fire.position.y = 3.1;
    fire.material = this.m("amber");
    return root;
  }

  private createExplorer() {
    this.playerBody.parent = this.player;

    const hips = MeshBuilder.CreateBox("explorer-hips", { width: 0.62, height: 0.28, depth: 0.38 }, this.scene);
    hips.parent = this.playerBody;
    hips.position.y = 0.82;
    hips.material = this.m("pants");

    const torso = MeshBuilder.CreateBox("explorer-torso", { width: 0.72, height: 0.88, depth: 0.42 }, this.scene);
    torso.parent = this.playerBody;
    torso.position.y = 1.34;
    torso.material = this.m("armor");

    const chestPlate = MeshBuilder.CreateBox("explorer-chest", { width: 0.58, height: 0.52, depth: 0.12 }, this.scene);
    chestPlate.parent = this.playerBody;
    chestPlate.position.set(0, 1.38, 0.24);
    chestPlate.material = this.m("tealGlow");

    [-0.38, 0.38].forEach((x, i) => {
      const pad = MeshBuilder.CreateBox(`explorer-shoulder-${i}`, { width: 0.28, height: 0.22, depth: 0.28 }, this.scene);
      pad.parent = this.playerBody;
      pad.position.set(x, 1.72, 0.02);
      pad.material = this.m("armor");
    });

    const helmet = MeshBuilder.CreateBox("explorer-helmet", { width: 0.52, height: 0.46, depth: 0.52 }, this.scene);
    helmet.parent = this.playerBody;
    helmet.position.y = 2.02;
    helmet.material = this.m("dark");
    const visor = MeshBuilder.CreateBox("explorer-visor", { width: 0.46, height: 0.18, depth: 0.08 }, this.scene);
    visor.parent = this.playerBody;
    visor.position.set(0, 2.02, 0.28);
    visor.material = this.m("visor");

    const jetpack = MeshBuilder.CreateBox("explorer-jetpack", { width: 0.56, height: 0.72, depth: 0.22 }, this.scene);
    jetpack.parent = this.playerBody;
    jetpack.position.set(0, 1.34, -0.34);
    jetpack.material = this.m("dark");
    const jetGlow = MeshBuilder.CreateBox("explorer-jet-glow", { width: 0.12, height: 0.42, depth: 0.06 }, this.scene);
    jetGlow.parent = this.playerBody;
    jetGlow.position.set(0, 1.34, -0.48);
    jetGlow.material = this.m("tealGlow");

    this.makeArm("left-arm", this.leftArm, -0.46, -1);
    this.makeArm("right-arm", this.rightArm, 0.46, 1);
    this.leftArm.parent = this.playerBody;
    this.rightArm.parent = this.playerBody;

    this.makeLeg("left-leg-mesh", this.leftLeg, -0.2, -1);
    this.makeLeg("right-leg-mesh", this.rightLeg, 0.2, 1);
    this.leftLeg.parent = this.player;
    this.rightLeg.parent = this.player;

    const scarfKnot = MeshBuilder.CreateSphere("scarf-knot", { diameter: 0.24, segments: 8 }, this.scene);
    scarfKnot.parent = this.scarf;
    scarfKnot.position.y = 1.68;
    scarfKnot.material = this.m("scarf");
    const tail = MeshBuilder.CreateBox("scarf-tail", { width: 0.14, height: 0.16, depth: 0.95 }, this.scene);
    tail.parent = this.scarf;
    tail.position.set(0.1, 1.52, -0.62);
    tail.rotation.x = -0.25;
    tail.material = this.m("scarf");
    this.scarf.parent = this.playerBody;

    const shadow = MeshBuilder.CreateDisc("explorer-shadow-disc", { radius: 0.55, tessellation: 24 }, this.scene);
    shadow.parent = this.shadowDisc;
    shadow.rotation.x = Math.PI / 2;
    shadow.position.y = 0.02;
    const shadowMat = this.material("shadow-mat", "#000000", "#000000");
    shadowMat.alpha = 0.35;
    shadow.material = shadowMat;
    this.shadowDisc.parent = this.player;

    this.player.position.y = 0;
  }

  private makeLeg(name: string, root: TransformNode, x: number, phase: number) {
    const leg = MeshBuilder.CreateBox(name, { width: 0.22, height: 0.72, depth: 0.22 }, this.scene);
    leg.parent = root;
    leg.position.set(0, 0.36, 0.05);
    leg.material = this.m("pants");
    const stripe = MeshBuilder.CreateBox(`${name}-stripe`, { width: 0.24, height: 0.14, depth: 0.08 }, this.scene);
    stripe.parent = root;
    stripe.position.set(0, 0.58, 0.14);
    stripe.material = this.m("tealGlow");
    const boot = MeshBuilder.CreateBox(`${name}-boot`, { width: 0.3, height: 0.2, depth: 0.52 }, this.scene);
    boot.parent = root;
    boot.position.set(0, -0.02, 0.16 * phase);
    boot.material = this.m("dark");
  }

  private makeArm(name: string, root: TransformNode, x: number, phase: number) {
    root.position.set(x, 1.48, 0.04);
    const upper = MeshBuilder.CreateBox(`${name}-upper`, { width: 0.16, height: 0.42, depth: 0.16 }, this.scene);
    upper.parent = root;
    upper.position.set(0, -0.12, 0);
    upper.material = this.m("armor");
    const fore = MeshBuilder.CreateBox(`${name}-fore`, { width: 0.14, height: 0.38, depth: 0.14 }, this.scene);
    fore.parent = root;
    fore.position.set(0.06 * phase, -0.48, 0.08);
    fore.material = this.m("jacket");
  }

  private addObstacleMarker(root: TransformNode, color: "hazard" | "tealGlow" | "amber") {
    const pad = MeshBuilder.CreateBox("obstacle-lane-pad", { width: 3.2, height: 0.06, depth: 1.4 }, this.scene);
    pad.parent = root;
    pad.position.set(0, 0.04, 0);
    pad.material = this.m(color);
  }

  private addWarningSign(root: TransformNode, label: "DODGE" | "SLIDE" | "JUMP", y: number) {
    const board = MeshBuilder.CreateBox(`sign-${label}`, { width: 1.35, height: 0.42, depth: 0.08 }, this.scene);
    board.parent = root;
    board.position.set(0, y, 0.55);
    board.material = this.m("hazard");
    const frame = MeshBuilder.CreateBox(`sign-frame-${label}`, { width: 1.45, height: 0.52, depth: 0.06 }, this.scene);
    frame.parent = root;
    frame.position.set(0, y, 0.48);
    frame.material = this.m("dark");
    const pole = MeshBuilder.CreateBox(`sign-pole-${label}`, { width: 0.12, height: 0.9, depth: 0.12 }, this.scene);
    pole.parent = root;
    pole.position.set(0, y - 0.55, 0.35);
    pole.material = this.m("dark");
  }

  private createSkyline() {
    this.horizon.position.z = 120;
    const sun = MeshBuilder.CreateSphere("dawn-sun", { diameter: 10, segments: 16 }, this.scene);
    sun.parent = this.horizon;
    sun.position.set(19, 17, 10);
    sun.material = this.m("amber");

    for (let tier = 0; tier < 5; tier += 1) {
      const step = MeshBuilder.CreateBox(`temple-tier-${tier}`, { width: 20 - tier * 3.2, height: 2.2, depth: 9 - tier * 1.15 }, this.scene);
      step.parent = this.horizon;
      step.position.set(0, tier * 2.0, 0);
      step.material = tier % 2 ? this.m("sandLight") : this.m("sandstone");
    }
    const crown = MeshBuilder.CreateCylinder("temple-crown", { height: 5, diameterTop: 2, diameterBottom: 5, tessellation: 4 }, this.scene);
    crown.parent = this.horizon;
    crown.position.y = 10.2;
    crown.material = this.m("sandstone");
  }

  private createHud() {
    const mount = document.getElementById("game-ui");
    if (!mount) return;
    this.hudRoot = document.createElement("div");
    this.hudRoot.className = "runner-hud";
    this.hudRoot.innerHTML = `
      <div class="hud-top">
        <div class="brand-plaque"><span class="brand-sun">✦</span><span><b>SUN TEMPLE</b><em>RUNNER</em></span></div>
        <div class="score-plaque"><img src="${assets.relicEmblem}" alt=""/><span><small>RELICS</small><strong id="relic-count">0</strong></span></div>
        <div class="distance-plaque"><span class="pin">◈</span><span><small>DISTANCE</small><strong id="distance-count">0 m</strong></span></div>
      </div>
      <div class="hud-vignette"></div>
      <div class="guardian-threat" id="guardian-threat" hidden><img src="${assets.guardianEmblem}" alt=""/><span><b>THE TEMPLE GUARDIAN</b><em>IS CLOSING IN</em><i><u id="guardian-bar"></u></i></span></div>
      <div class="guardian-chase" id="guardian-chase" aria-hidden="true"><img src="${assets.guardianEmblem}" alt=""/></div>
      <section class="start-card" id="start-card">
        <p class="eyebrow">THE FIRST LIGHT AWAKENS</p>
        <h1>Outrun the<br/><i>Lost Sun</i></h1>
        <p class="intro">Cross the living causeway, collect the amber relics, and read each ruin before it reads you.</p>
        <button class="start-button" id="start-run">BEGIN THE RUN <span>→</span></button>
        <div class="controls"><span><kbd>←</kbd><kbd>→</kbd> lanes</span><span><kbd>↑</kbd> or <kbd>SPACE</kbd> leap</span><span><kbd>↓</kbd> slide</span></div>
      </section>
      <div class="action-hint" id="action-hint">SWIPE OR USE ARROWS TO MOVE</div>
      <div class="strike-card" id="strike-card" hidden>
        <p class="eyebrow">THE PATH BITES BACK</p>
        <h2>Run interrupted</h2>
        <p id="run-summary">You carried 0 relics.</p>
        <button class="start-button" id="restart-run">RUN AGAIN <span>↻</span></button>
      </div>
    `;
    mount.appendChild(this.hudRoot);
    this.statusNode = this.hudRoot.querySelector("#run-summary");
    this.distanceNode = this.hudRoot.querySelector("#distance-count");
    this.relicNode = this.hudRoot.querySelector("#relic-count");
    this.guardianBar = this.hudRoot.querySelector("#guardian-bar");
    this.threatNode = this.hudRoot.querySelector("#guardian-threat");
    this.chaseNode = this.hudRoot.querySelector("#guardian-chase");
    this.hudRoot.querySelector("#start-run")?.addEventListener("click", () => this.start());
    this.hudRoot.querySelector("#restart-run")?.addEventListener("click", () => this.restart());
  }

  private start() {
    if (this.mode === "running") return;
    this.mode = "running";
    this.hudRoot?.querySelector("#start-card")?.classList.add("is-hidden");
    this.hudRoot?.querySelector("#strike-card")?.setAttribute("hidden", "true");
    this.hudRoot?.querySelector("#action-hint")?.classList.add("is-live");
  }

  private restart() {
    this.entities.forEach((entity) => entity.root.dispose());
    this.entities.length = 0;
    this.targetLane = 0;
    this.playerX = 0;
    this.jumpTimer = 0;
    this.slideTimer = 0;
    this.distance = 0;
    this.relics = 0;
    this.speed = BASE_SPEED;
    this.spawnTimer = 0;
    this.spawnIndex = 0;
    this.mode = "ready";
    this.updateHud();
    this.start();
  }

  private updateRoad(dt: number) {
    const recycleZ = -24;
    const furthest = Math.max(...this.roadSections.map((section) => section.root.position.z));
    this.roadSections.forEach((section) => {
      section.root.position.z -= this.speed * dt;
      if (section.root.position.z < recycleZ) section.root.position.z = furthest + ROAD_LENGTH;
    });
  }

  private runSpawner() {
    const spawnEvery = Math.max(1.25, 1.9 - this.distance / 1900);
    if (this.spawnTimer < spawnEvery) return;
    this.spawnTimer = 0;
    const pattern = this.spawnIndex % 8;
    const lanePattern = [-1, 0, 1, 0, 1, -1, 0, 1];
    const lane = lanePattern[this.spawnIndex % lanePattern.length];
    let kind: EntityKind = "relic";
    if (pattern === 2 || pattern === 6) kind = "barricade";
    if (pattern === 3) kind = "arch";
    if (pattern === 5) kind = "gap";
    this.spawnEntity(kind, lane, 84 + (this.spawnIndex % 3) * 5);
    if (kind !== "relic" && pattern % 2 === 0) this.spawnEntity("relic", lane === 1 ? -1 : 1, 93);
    this.spawnIndex += 1;
  }

  private spawnEntity(kind: EntityKind, lane: number, z: number) {
    const root = new TransformNode(`${kind}-${this.spawnIndex}-${this.entities.length}`, this.scene);
    root.position.set(lane * LANE_WIDTH, 0, z);
    if (kind === "relic") this.createRelic(root);
    if (kind === "barricade") this.createBarricade(root);
    if (kind === "arch") this.createArch(root);
    if (kind === "gap") this.createGap(root);
    this.entities.push({ kind, lane, z, root, resolved: false });
  }

  private createRelic(root: TransformNode) {
    const glow = MeshBuilder.CreateSphere("relic-glow", { diameter: 0.95, segments: 12 }, this.scene);
    glow.parent = root;
    glow.position.y = 1.7;
    glow.material = this.m("amber");
    const ring = MeshBuilder.CreateTorus("relic-ring", { diameter: 1.25, thickness: 0.13, tessellation: 12 }, this.scene);
    ring.parent = root;
    ring.position.y = 1.7;
    ring.material = this.m("bronze");
    for (let i = 0; i < 4; i += 1) {
      const ray = MeshBuilder.CreateBox(`relic-ray-${i}`, { width: 0.15, height: 0.46, depth: 0.1 }, this.scene);
      ray.parent = root;
      ray.position.y = 1.7;
      ray.rotation.z = (Math.PI / 2) * i;
      ray.position.x = Math.cos((Math.PI / 2) * i) * 0.8;
      ray.position.y += Math.sin((Math.PI / 2) * i) * 0.8;
      ray.material = this.m("bronze");
    }
  }

  private createBarricade(root: TransformNode) {
    this.addObstacleMarker(root, "hazard");
    const base = MeshBuilder.CreateBox("barricade-base", { width: 3.45, height: 0.18, depth: 1.05 }, this.scene);
    base.parent = root;
    base.position.y = 0.12;
    base.material = this.m("dark");
    const crossA = MeshBuilder.CreateBox("barricade-cross-a", { width: 3.35, height: 0.32, depth: 0.32 }, this.scene);
    crossA.parent = root;
    crossA.position.y = 1.35;
    crossA.rotation.z = 0.55;
    crossA.material = this.m("hazard");
    const crossB = MeshBuilder.CreateBox("barricade-cross-b", { width: 3.35, height: 0.32, depth: 0.32 }, this.scene);
    crossB.parent = root;
    crossB.position.y = 1.35;
    crossB.rotation.z = -0.55;
    crossB.material = this.m("woodLight");
    [-1.45, 1.45].forEach((x) => {
      const post = MeshBuilder.CreateBox(`barricade-post-${x}`, { width: 0.28, height: 2.85, depth: 0.34 }, this.scene);
      post.parent = root;
      post.position.set(x, 1.15, 0);
      post.material = this.m("wood");
      const stripe = MeshBuilder.CreateBox(`barricade-stripe-${x}`, { width: 0.32, height: 0.22, depth: 0.36 }, this.scene);
      stripe.parent = root;
      stripe.position.set(x, 0.45, 0);
      stripe.material = this.m("amber");
    });
    const beacon = MeshBuilder.CreateSphere("barricade-beacon", { diameter: 0.55, segments: 10 }, this.scene);
    beacon.parent = root;
    beacon.position.y = 2.85;
    beacon.material = this.m("hazard");
    this.addWarningSign(root, "DODGE", 3.15);
  }

  private createArch(root: TransformNode) {
    this.addObstacleMarker(root, "tealGlow");
    [-1.48, 1.48].forEach((x) => {
      const column = MeshBuilder.CreateBox(`arch-column-${x}`, { width: 0.48, height: 2.05, depth: 0.62 }, this.scene);
      column.parent = root;
      column.position.set(x, 1.02, 0);
      column.material = this.m("sandstone");
      const cap = MeshBuilder.CreateBox(`arch-cap-${x}`, { width: 0.56, height: 0.18, depth: 0.68 }, this.scene);
      cap.parent = root;
      cap.position.set(x, 2.02, 0);
      cap.material = this.m("sandLight");
    });
    const lintel = MeshBuilder.CreateBox("arch-lintel", { width: 3.45, height: 0.62, depth: 0.72 }, this.scene);
    lintel.parent = root;
    lintel.position.y = 1.78;
    lintel.material = this.m("hazard");
    const inset = MeshBuilder.CreateBox("arch-inset", { width: 2.1, height: 0.16, depth: 0.75 }, this.scene);
    inset.parent = root;
    inset.position.set(0, 1.78, -0.02);
    inset.material = this.m("mosaic");
    const clearance = MeshBuilder.CreateBox("arch-clearance", { width: 2.35, height: 0.08, depth: 0.5 }, this.scene);
    clearance.parent = root;
    clearance.position.set(0, 1.05, 0.2);
    clearance.material = this.m("tealGlow");
    this.addWarningSign(root, "SLIDE", 2.55);
  }

  private createGap(root: TransformNode) {
    this.addObstacleMarker(root, "amber");
    const voidFloor = MeshBuilder.CreateBox("gap-void", { width: 3.55, height: 0.55, depth: 3.15 }, this.scene);
    voidFloor.parent = root;
    voidFloor.position.y = -0.48;
    voidFloor.material = this.m("dark");
    const water = MeshBuilder.CreateBox("gap-shadow", { width: 3.35, height: 0.1, depth: 2.75 }, this.scene);
    water.parent = root;
    water.position.y = -0.22;
    water.material = this.m("water");
    [-1.62, 1.62].forEach((x) => {
      const edge = MeshBuilder.CreateBox(`gap-edge-${x}`, { width: 0.42, height: 0.28, depth: 3.35 }, this.scene);
      edge.parent = root;
      edge.position.set(x, -0.02, 0);
      edge.material = this.m("sandLight");
      const rail = MeshBuilder.CreateBox(`gap-rail-${x}`, { width: 0.12, height: 0.55, depth: 0.12 }, this.scene);
      rail.parent = root;
      rail.position.set(x, 0.42, 0.55);
      rail.material = this.m("hazard");
    });
    const warning = MeshBuilder.CreateTorus("gap-warning", { diameter: 1.45, thickness: 0.16, tessellation: 12 }, this.scene);
    warning.parent = root;
    warning.position.y = 0.55;
    warning.rotation.x = Math.PI / 2;
    warning.material = this.m("hazard");
    [0, 1, 2].forEach((i) => {
      const arrow = MeshBuilder.CreateBox(`gap-arrow-${i}`, { width: 0.22, height: 0.42, depth: 0.12 }, this.scene);
      arrow.parent = root;
      arrow.position.set(-0.28 + i * 0.28, 1.05 + i * 0.08, 0.35);
      arrow.rotation.z = i === 1 ? 0 : 0.18 * (i - 1);
      arrow.material = this.m("tealGlow");
    });
    this.addWarningSign(root, "JUMP", 2.35);
  }

  private updateEntities(dt: number) {
    for (let i = this.entities.length - 1; i >= 0; i -= 1) {
      const entity = this.entities[i];
      entity.z -= this.speed * dt;
      entity.root.position.z = entity.z;
      if (entity.kind === "relic") {
        entity.root.rotation.y += dt * 4.5;
        entity.root.position.y = Math.sin(this.elapsed * 4 + i) * 0.12;
      }
      if (entity.kind === "gap" || entity.kind === "barricade" || entity.kind === "arch") {
        const pulse = 0.92 + Math.sin(this.elapsed * 6 + i) * 0.08;
        entity.root.scaling.set(1, pulse, 1);
      }

      if (!entity.resolved && entity.z < 1.1 && entity.z > -1.15) {
        this.resolveEntity(entity);
      }
      if (entity.z < -15) {
        entity.root.dispose();
        this.entities.splice(i, 1);
      }
    }
  }

  private resolveEntity(entity: RunEntity) {
    entity.resolved = true;
    const onLane = Math.abs(entity.lane - this.targetLane) < 0.15;
    if (entity.kind === "relic") {
      if (onLane) {
        this.relics += 1;
        entity.root.setEnabled(false);
      }
      return;
    }
    if (!onLane) return;
    const safe = (entity.kind === "arch" && this.slideTimer > 0.12) || (entity.kind === "gap" && this.jumpTimer > 0.12);
    if (entity.kind === "barricade" || !safe) this.strike();
  }

  private strike() {
    if (this.mode !== "running") return;
    this.mode = "struck";
    this.player.rotation.z = 0.25;
    this.statusNode!.textContent = `${Math.round(this.distance)} m crossed · ${this.relics} ${this.relics === 1 ? "relic" : "relics"} carried.`;
    this.hudRoot?.querySelector("#action-hint")?.classList.remove("is-live");
    this.hudRoot?.querySelector("#strike-card")?.removeAttribute("hidden");
  }

  private runAutopilot() {
    const ahead = this.entities
      .filter((entity) => !entity.resolved && entity.z > 1 && entity.z < 15)
      .sort((a, b) => a.z - b.z)[0];
    if (!ahead) return;
    if (ahead.kind === "relic") this.targetLane = ahead.lane;
    if (ahead.kind === "barricade" && ahead.lane === this.targetLane) this.targetLane = ahead.lane === 1 ? 0 : 1;
    if (ahead.kind === "arch" && ahead.lane === this.targetLane && this.slideTimer <= 0) this.slideTimer = 0.7;
    if (ahead.kind === "gap" && ahead.lane === this.targetLane && this.jumpTimer <= 0) this.jumpTimer = 0.76;
  }

  private animateExplorer(dt: number) {
    this.playerX += (this.targetLane * LANE_WIDTH - this.playerX) * Math.min(1, dt * LANE_SNAP);
    this.player.position.x = this.playerX;
    this.player.rotation.z = (this.targetLane * LANE_WIDTH - this.playerX) * -0.09;

    if (this.jumpTimer > 0) this.jumpTimer = Math.max(0, this.jumpTimer - dt);
    if (this.slideTimer > 0) this.slideTimer = Math.max(0, this.slideTimer - dt);

    const jumpProgress = this.jumpTimer > 0 ? 1 - this.jumpTimer / 0.76 : 0;
    const jumpHeight = Math.sin(jumpProgress * Math.PI) * 1.55;
    const slide = this.slideTimer > 0;
    this.player.position.y = jumpHeight;
    this.playerBody.scaling.y += ((slide ? 0.52 : 1) - this.playerBody.scaling.y) * Math.min(1, dt * 20);
    this.playerBody.position.y = slide ? -0.2 : 0;
    this.scarf.position.y = slide ? -0.1 : 0;

    const runCycle = this.mode === "running" ? Math.sin(this.elapsed * (9 + this.speed * 0.32)) : 0;
    this.leftLeg.rotation.x = runCycle * 0.82;
    this.rightLeg.rotation.x = -runCycle * 0.82;
    this.leftArm.rotation.x = -runCycle * 0.55;
    this.rightArm.rotation.x = runCycle * 0.55;
    this.scarf.rotation.x = -0.3 + runCycle * -0.18;

    const shadowScale = slide ? 1.35 : 1 - jumpHeight * 0.22;
    this.shadowDisc.scaling.set(shadowScale, 1, shadowScale * (1 + jumpHeight * 0.08));
    this.shadowDisc.position.y = 0.02;
  }

  private updateCamera(dt: number) {
    const desiredX = this.playerX * 0.33;
    this.camera.position.x += (desiredX - this.camera.position.x) * Math.min(1, dt * 3.5);
    this.camera.setTarget(new Vector3(this.playerX * 0.27, 1.2, 10));
    this.horizon.rotation.y = Math.sin(this.elapsed * 0.05) * 0.045;
  }

  private updateHud() {
    if (this.distanceNode) this.distanceNode.textContent = `${Math.round(this.distance)} m`;
    if (this.relicNode) this.relicNode.textContent = String(this.relics);
  }

  private updateGuardianThreat() {
    if (!this.guardianBar || !this.threatNode) return;
    const progress = Math.max(0, Math.min(1, (this.distance - 18) / 240));
    if (progress > 0.02 && this.mode === "running") {
      this.threatNode.removeAttribute("hidden");
      this.guardianBar.style.width = `${Math.max(8, progress * 100)}%`;
      this.threatNode.style.setProperty("--guardian-progress", String(progress));
      this.chaseNode?.style.setProperty("--guardian-progress", String(progress));
    }
    if (this.mode !== "running") {
      this.threatNode.setAttribute("hidden", "true");
      this.chaseNode?.style.setProperty("--guardian-progress", "0");
    }
  }
}
