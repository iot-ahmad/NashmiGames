# Assets

**Art direction:** Original cinematic jungle-temple runner at sunrise: warm honey sandstone, dark jade foliage, teal mosaic accents, bronze details, and a bright amber relic glow. A high, centered chase camera keeps the three lane choices legible. The visual language is adventurous but clean, with simple silhouettes that read during motion.

## Generated Assets

| Name | Description | Size | Original source | WebDev path | Runtime role |
|---|---|---:|---|---|---|
| `sun-temple-runner-reference` | In-game visual target showing the original explorer, temple causeway, relics, ruins, and HUD composition. | 2560×1440 px | `/home/ubuntu/webdev-static-assets/sun-temple-runner-reference.png` | N/A (planning reference) | Visual QA reference. |
| `sun-temple-guardian-emblem` | Original obsidian feline guardian mask with molten amber eyes and teal rune cracks. | 1920×1920 px; display 40×40 px | `/home/ubuntu/webdev-static-assets/sun-temple-guardian-emblem.png` | `/manus-storage/sun-temple-guardian-emblem_4d21d6a7.png` | Threat HUD icon. |
| `sun-temple-mosaic-accent` | Original turquoise/jade sun-rune mosaic on sandstone. | 1920×1920 px; tile 2.5×2.5 | `/home/ubuntu/webdev-static-assets/sun-temple-mosaic-accent.png` | `/manus-storage/sun-temple-mosaic-accent_c17fe34d.png` | Generated texture on inlay trims. |
| `sun-temple-relic-emblem` | Original amber gemstone, bronze sun rays, and teal enamel emblem on alpha. | 1920×1920 px; display 52×52 px | `/home/ubuntu/webdev-static-assets/sun-temple-relic-emblem.png` | `/manus-storage/sun-temple-relic-emblem_078b79b6.png` | DOM HUD score icon. |

## Procedural Runtime Art

| Name | Description | Size | Role |
|---|---|---:|---|
| `sunRelic` | Amber emissive ring with gemstone core and tiny bronze rays. | 0.72m diameter | Collectible in each lane. |
| `sandstonePath` | Staggered warm stone slabs with teal center inlay strips. | 13.2m wide, recycled every 13m | Continuous causeway. |
| `woodBarricade` | Cross-braced timber obstacle with teal rope accent. | 3m wide × 2.8m high | Lane-blocking hazard. |
| `lowArch` | Mossy sandstone lintel on two columns. | 3.3m wide × 1.3m clearance | Slide-through hazard. |
| `gapWarning` | Broken path edge with glowing drop below. | 3.4m long | Jump-over hazard. |
| `explorer` | Original teal-scarf runner silhouette from capsules, boxes, and cylinders. | 1.9m tall | Player avatar. |
