# Game Plan: Sun Temple Runner

**Creative boundary:** An original endless runner inspired only by the broad genre of three-lane running games. It uses original title, character design, art, geometry, rules, and UI; it does not use the Temple Run name, characters, assets, levels, or audio.

## Risk Tasks

### 1. Endless forward-world recycling
- **Why isolated:** Continuous motion needs reusable road segments, spawned hazards, pickups, and side scenery to avoid a visible end or escalating memory use.
- **Approach:** Keep a bounded array of road sections and world entities. Move them toward the player at the active speed, recycle road/side scenery beyond the camera, and deterministically spawn upcoming interactions on a fixed interval. `?demo` selects a seeded, safe path and automatically steers to visible relics.
- **Verify:** In a 30-second demo run, the path stays visually continuous with no sudden pop-in around the player, score rises, and entity count stays bounded.

### 2. Pursuing temple guardian
- **Why isolated:** The follower must read as an active threat while staying behind the camera target, closing distance over time without clipping through the runner.
- **Approach:** Use a dedicated guardian hierarchy with a bounded gap value, eased lane-following, emissive eyes/runes, pulse animation, and a DOM threat meter. The guardian appears as the gap closes and triggers a run interruption if it reaches the runner.
- **Verify:** In `?demo`, the guardian becomes visible, tracks lane changes, the threat meter fills, and a close-in event ends the run cleanly.

### 3. Three-lane movement and posture-dependent obstacle checks
- **Why isolated:** Inputs must map smoothly to a lane target, and collisions must distinguish a full-height barricade, a low arch that requires sliding, and a gap that requires jumping.
- **Approach:** Model the runner with explicit `lane`, `targetLane`, `jumpTime`, and `slideTime` state. Animate the runner's mesh offset and scale from those states; evaluate an obstacle only once when it crosses the runner zone, checking lane and required posture.
- **Verify:** Left/right keys and swipe gestures make the runner settle into the correct lane; up/space clears a gap; down clears a low arch; a mismatch triggers a clear recovery state rather than a console error.

## Main Build

Build a warm, third-person 3D jungle-temple escape game with a three-lane sandstone causeway, teal inlaid path markers, original explorer silhouette, glowing sun relics, wooden barricades, low stone arches, gaps, distant stepped-temple skyline, torches, palms, HUD, start state, restart state, and touch plus keyboard controls. The run accelerates gradually, distance and relic score update live, and a beginner-friendly demo path is available at `?demo`.

- **Assets:**
  - Generated `sun-temple-relic-emblem` PNG, shown as a 52px HUD icon and as the source art direction for the 3D relic collectible.
  - Procedural sandstone, teal, wood, foliage, torch, ruin, and guardian meshes with original geometry.
  - Generated guardian emblem and mosaic accent texture uploaded to WebDev storage.
- **Verify:**
  - Arrow/A-D keys, Space/Up, Down/S, and swipe gestures produce the matching runner response.
  - Relics raise score and distance advances continuously.
  - Each hazard telegraphs its required action with a readable silhouette.
  - HUD is readable and no UI overlaps on a 1280×720 desktop or 390×844 mobile viewport.
  - The scene has no missing textures, obvious fallback materials, or console errors.
  - Reference consistency: warm sandstone, jade foliage, turquoise accents, amber relic glow, elevated chase camera, and active road density.
  - **Presentation proof:** A `?demo` run shows continuous real gameplay without manual input.
