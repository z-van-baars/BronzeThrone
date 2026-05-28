# Bronze Throne — Agent Orientation

Bronze Age roguelike city-builder PoC. TypeScript + Pixi.js. Runs in the browser via Vite (`npm run dev`, default port 5173/5174).

Full design intent lives in `bronze-throne-design-doc.md`. This document covers the *implementation*.

---

## Core Concepts

**Nucleus buildings** are placed by the player on a grid. They emit/suppress substrate values in a radius. The city fabric (housing, workshops, markets) grows *organically* in cells around them based on those substrate values — the player never places individual houses.

**Substrate** is six heat-map layers per cell: Security, Prosperity, Piety, Industry, Sustenance, Culture. Every cell stores a value for each. These values drive what kind of organic development spawns there.

**Development** is the organic growth system. Cells near buildings get assigned a `DevType` (LaborerHousing, ArtisanQuarter, MarketWard, SacredQuarter, Garrison, NobleEstate) based on weighted substrate scoring. Dev cells can level up (1→3) or enter distress and downgrade if the substrate supporting them is removed.

**Resources**: Food, Timber, Stone, Bronze, Wealth. Each building has `resourceProduction` and `resourceConsumption` that apply every tick, scaled by its intensity slider (0.5–1.2).

**Population** is tracked by six citizen tiers: Laborer, Craftsman, Merchant, Priest, Warrior, Elite. Population grows/shrinks from resource availability; the tiers influence events and unlock thresholds.

**The game loop**: Every tick — resource flows, population update, development tick, event deck draw check, military threat tick, trade tick. Tick rate is controlled by a speed index (0=paused, up to 3x).

---

## File Map

### Entry & Config
| File | Purpose |
|------|---------|
| `src/main.ts` | Entry point. Wires up all systems, owns the game loop (`setInterval`), handles all input (click, keyboard). The "glue" file. |
| `src/core/Config.ts` | Constants: `GRID_WIDTH/HEIGHT` (80×80), `CELL_SIZE` (24px), camera zoom/pan limits. |
| `src/types.ts` | All shared enums and interfaces: `TerrainType`, `SubstrateLayer`, `ResourceType`, `CitizenTier`, `DevType`, `GridCell`, `BuildingDef`, `BuildingInstance`, display constants (colors, labels). Read this first when working on any system. |

### Core Simulation
| File | Purpose |
|------|---------|
| `src/core/GameState.ts` | Central state object. Holds `grid`, `buildings` (Map), `resources`, `population`, `eventDeck`, `military`, `trade`, `ledger`, `tickCount`, `speedIndex`. Import this everywhere. |
| `src/core/Grid.ts` | `Grid` class — 2D array of `GridCell`. Methods: `getCell(x,y)`, `inBounds(x,y)`, `getCellsInRadius(x,y,r)`. |
| `src/core/MapGen.ts` | Procedural terrain generation. Called once in `GameState` constructor. Seeded or random. |
| `src/core/Substrate.ts` | `recalculateSubstrate(state)` — rebuilds all substrate values from scratch by iterating all buildings and applying their emissions/suppressions with radial falloff. Call this after any building is placed or razed. |
| `src/core/Resource.ts` | `processResourceTick(state)` — applies production/consumption for every building, scaled by intensity. Writes delta to the `ResourceLedger`. |
| `src/core/Population.ts` | `processPopulationTick(state)` — grows/shrinks population tiers based on resources and substrate. `initPopulation()` creates the starting state. |
| `src/core/Development.ts` | `processDevelopmentTick(state)` — organic growth engine. Each tick, scores every empty passable cell against dev type thresholds, colonizes/upgrades the top N candidates (bandwidth scales with population). Also runs distress: cells whose substrate no longer supports them accumulate distress → lateral type shift → downgrade → removal. |
| `src/core/Building.ts` | `placeBuilding()`, `canPlaceBuilding()`, `razeBuilding()` — placement validation (terrain, footprint overlap, prerequisites, resources) and mutation. |
| `src/core/EventDeck.ts` | `EventDeck` class. Holds the shuffled deck, draws events on a timer, exposes `activeEvent`. Call `eventDeck.tick(state)` each game tick. |
| `src/core/Military.ts` | `MilitarySystem` class. Spawns threats on a schedule, tracks `activeThreat`, exposes `tick()` and `resolveCombat()`. |
| `src/core/Trade.ts` | `TradeSystem` class. Manages recurring trade deals, applies resource flows each tick. |
| `src/core/ResourceLedger.ts` | Per-tick resource flow tracker. `ledger.clear()` at tick start, then `ledger.record(resource, delta, source)` throughout. Used by the UI to show +/- flows on hover. |

### Data
| File | Purpose |
|------|---------|
| `src/data/buildings.ts` | `BUILDING_DEFS` — all 27 building definitions keyed by id string. Organized by tier (0–4). To add a building: add an entry here, that's it. |
| `src/data/events.ts` | All event card definitions. Each has a description, choices with costs/effects, and optional prerequisites (substrate thresholds, building existence). |

### Rendering
| File | Purpose |
|------|---------|
| `src/render/Renderer.ts` | Main Pixi.js app. Owns `worldContainer` (panned/zoomed), handles camera pan/zoom input, exposes `screenToGrid(x,y)`. |
| `src/render/GridRenderer.ts` | Draws terrain tiles and grid lines. `drawTerrain()` on init, `updateSelection()` when selected cell changes. |
| `src/render/BuildingRenderer.ts` | `draw(state)` — renders colored rectangles for all placed buildings. |
| `src/render/SubstrateOverlay.ts` | `toggle(layer)` / `draw(state)` — heat map overlays. Each layer is a separate alpha-composited layer. |
| `src/render/PopulationRenderer.ts` | `draw(state)` — renders organic dev cells as colored squares with tier-level shading. |
| `src/render/BlueprintPreview.ts` | Ghost preview during build mode. Shows green/red footprint and emission/suppression radius circles while hovering. |

### UI
| File | Purpose |
|------|---------|
| `src/ui/ResourceBar.ts` | Top bar showing all 5 resources with current value and per-tick delta (from ledger). Hover tooltips show flow breakdown. |
| `src/ui/BuildMenu.ts` | Right-side building picker. Groups by tier, shows lock state (prerequisites). Hover shows a detailed tooltip (description, size, costs, emissions). |
| `src/ui/InfoPanel.ts` | Bottom-left panel for selected cell — shows terrain, building info, substrate values, dev type. |
| `src/ui/SliderPanel.ts` | Appears when a building cell is selected. Shows intensity slider (50–120%) with live production/consumption/emission preview. |
| `src/ui/LayerToggle.ts` | Bottom-right buttons to toggle substrate overlay layers on/off. |
| `src/ui/EventPopup.ts` | CK-style choice popup for event deck events. |
| `src/ui/MilitaryPopup.ts` | Popup for incoming military threats with response options. |
| `src/ui/RunSummary.ts` | End-of-run screen (concede or collapse). Shows peak stats and run narrative. |
| `src/ui/Toast.ts` | Ephemeral corner notifications (success/error/info). |
| `src/ui/RazeConfirm.ts` | Confirmation dialog before razing a building. |

---

## Tick Loop (in `main.ts`)

```
setInterval every 500ms:
  accumulate fractional ticks based on speed
  for each whole tick:
    ledger.clear()
    gameState.tick()           // increment tickCount
    processResourceTick()      // resource production/consumption
    processPopulationTick()    // population growth/shrink
    processDevelopmentTick()   // organic dev growth/distress
    eventDeck.tick()           // maybe draw an event
    military.tick()            // advance threat countdown
    trade.tick()               // apply trade deal flows
  check for collapse condition
  check for pending popups (event, military)
  re-render resource bar, build menu, info panel
```

Full world re-render (`redrawWorld()`) runs on building placement, raze, cell selection, slider change, and new game.

---

## Key Patterns

**Adding a building**: Add to `BUILDING_DEFS` in `src/data/buildings.ts`. Assign a `tier`, `prerequisites` (array of building def ids), `footprint`, `emissions`, `suppressions`, `resourceCost`, `resourceProduction`, `resourceConsumption`, and `color`. That's all — it auto-appears in the build menu at the right tier.

**Adding an event**: Add to `src/data/events.ts`. Events have prerequisite checks (can gate on substrate values, building existence, resource levels) and choices with explicit resource costs and callback effects on `GameState`.

**Substrate recalc**: After any building change, call `recalculateSubstrate(gameState)`. It's a full recompute, not incremental — acceptable at current scale.

**Intensity scaling**: In `processResourceTick` and `recalculateSubstrate`, building values are multiplied by `building.intensity` (0.5–1.2). The slider in `SliderPanel` writes directly to `building.intensity` on the `BuildingInstance`.

---

## Current State (as of last commit)

PoC is feature-complete per the design doc scope. All major systems are implemented:
- Substrate heat maps ✓
- Organic dev growth with distress ✓
- 5-resource economy ✓
- 27 buildings across 4 tiers ✓
- Intensity sliders ✓
- Event deck (13 events) ✓
- Military threats with auto-resolve ✓
- Trade system ✓
- Run summary / collapse detection ✓
- Blueprint ghost preview ✓
- Resource flow ledger with UI tooltips ✓

Remaining design-doc items that are explicitly deferred: diplomatic envoy system, trade caravans, tower defense combat mode, save/load, full building roster (30+), full event deck (50+).
