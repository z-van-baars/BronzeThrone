# Econ Rebalance: Citizens as the Economy

**Branch**: `econ-rebalance`  
**Base**: `master` (commit `f4dd70e`)  
**Status**: Experimental — evaluate before merging

---

## What Was Changed

### The Problem
In the pre-rebalance model, every resource-gathering building (farm, quarry, lumber camp, etc.) produced resources directly with no ongoing upkeep. Citizens existed but were economically irrelevant — they didn't generate anything and didn't cost anything beyond food consumption. There was no reason not to spam cheap 1x1 buildings indefinitely.

### The Model Shift
**Before**: buildings are the economy. Citizens are passengers.  
**After**: buildings are infrastructure. Citizens are the economy.

This mirrors the SimCity tension: everything you build costs upkeep, and your income comes from the organic growth you enable, not from the buildings themselves.

### Specific Changes

**`src/data/buildings.ts`**

| Building | Before | After |
|---|---|---|
| Farm | +5 food/tick, no upkeep | no production, -0.3 food/tick upkeep |
| Lumber Camp | +4 timber/tick, no upkeep | no production, -0.5 food/tick upkeep |
| Quarry | +3 stone/tick, no upkeep | no production, -0.5 food/tick upkeep |
| Pasture | +4 food/tick, no upkeep | no production, no upkeep |
| Stone Quarry | +6 stone/tick, no upkeep | no production, -1.0 food/tick upkeep |
| Granary | +2 food/tick, no upkeep | no production, no upkeep |
| Market | +2 wealth/tick, -1 food/tick | no production, -1 food/tick |
| Potter's Workshop | +1 wealth/tick, -1 stone/tick | no production, -0.5 food/tick, -1 stone/tick |
| Weaver's Hut | +1 wealth/tick, no upkeep | no production, -0.5 food/tick upkeep |
| Trade Post | +3 wealth/tick, no upkeep | +1 wealth/tick, -0.5 food/tick upkeep |
| Small Palace | +2 wealth/tick | +1 wealth/tick (costs unchanged) |
| Grand Palace | +5 wealth/tick | +2 wealth/tick (costs unchanged) |
| Bronze Smithy | +3 bronze/tick | **unchanged** (active strategic chain, not passive gathering) |
| Settler's Camp | +2 food/tick, +1 timber/tick | **unchanged** (bootstrap, intentionally generous) |

**`src/core/Resource.ts`**

Added a second pass each tick over all dev-populated grid cells. Output scales with dev level (1/2/3):

| Dev Type | L1 | L2 | L3 |
|---|---|---|---|
| Laborer Hovels | +1.0 food | +2.0 food | +3.5 food |
| Artisan Quarter | +0.5 timber, +0.3 stone | +1.0 timber, +0.6 stone | +1.8 timber, +1.0 stone |
| Market Ward | +0.6 wealth | +1.2 wealth | +2.0 wealth |
| Sacred Quarter | +0.1 wealth | +0.2 wealth | +0.4 wealth |
| Noble Estate | +0.4 wealth | +0.8 wealth | +1.5 wealth |
| Garrison | — | — | — |

Dev tile production shows up in the resource bar tooltip, aggregated by dev type label (e.g. "Laborer Hovels: +18.0 food").

### Intended Loop
```
Place nucleus building
  → emits substrate
    → substrate attracts dev tiles
      → dev tiles produce resources
        → resources fund more nucleus buildings
```

The early bootstrap: Settler's Camp (food 2, timber 1) sustains the first few ticks while the city waits for Laborer Hovels to grow near it. Each Laborer Hovel L1 adds 1 food/tick, making the economy self-sustaining as population grows.

---

## How to Evaluate

### Signs it's working
- Early game feels constrained — you can't spam buildings because upkeep bleeds your food reserve
- Placing a farm/quarry/lumber camp is a deliberate decision ("I need this substrate here") not an obvious always-do
- Watching dev tiles grow feels rewarding — you can see "my city is actually producing now"
- Resource bar tooltip shows dev types as the dominant income sources once city matures
- Wealth becomes the binding late-game resource (gated behind market wards, which require prosperity substrate)

### Signs it needs tuning
- **Too slow**: food stays near zero, dev tiles never grow because population starves before they spawn. Fix: increase Settler's Camp production or lower dev tile thresholds in `Development.ts`.
- **Too easy**: resources still pile up, building upkeep is trivially covered. Fix: increase upkeep costs or reduce dev tile output per level.
- **Timber/stone bottleneck**: can't build anything because artisan quarters are too slow to generate materials. Fix: slightly increase Artisan Quarter output, or add a small direct trickle back to lumber camp / quarry (20-30% of original).
- **Wealth completely inaccessible**: if market wards never spawn because prosperity substrate doesn't accumulate fast enough, wealth income stalls. Fix: lower Market Ward spawn thresholds or give the Market building a small wealth trickle.
- **Upkeep adds up too fast**: if a mid-game city with 10 buildings bleeds food faster than laborer hovels can compensate, the whole system topples too easily. Fix: reduce food upkeep on infrastructure buildings (potter's, weaver's are the softest targets).

### Key numbers to watch
- Food net at 10 ticks in (with only Settler's Camp + 1-2 buildings): should be slightly positive
- First Laborer Hovel appearance: should be within 5-10 ticks of placing first building near camp
- Food net at 30 ticks (early city): should be positive and growing as dev tiles accumulate
- Timber availability for mid-game construction: should feel scarce but not impossible

---

## How to Roll Back

The pre-rebalance model is fully intact on `master`. To revert:

```bash
# Option 1: switch branch (keeps econ-rebalance work available)
git checkout master

# Option 2: hard reset econ-rebalance to master (discards this branch's work)
git reset --hard master
```

To permanently abandon and delete the branch:
```bash
git branch -d econ-rebalance
git push origin --delete econ-rebalance
```

To merge if it's working:
```bash
git checkout master
git merge econ-rebalance
git push
```

---

## Directions to Explore if Friction Remains

### Tweak the numbers first
Before structural changes, adjust `DEV_TILE_OUTPUT` values in `src/core/Resource.ts` and the upkeep costs in `src/data/buildings.ts`. The current values are a first pass — expect to iterate 2-3 times.

### Hybrid approach: production trickle
If artisan/laborer output alone feels too slow, give resource-gathering buildings back a small trickle (20-30% of original) representing the building's own minimal output. The dev tiles would still dominate at scale. Change `resourceProduction` in `buildings.ts` — no architectural change needed.

### Labor assignment system
Instead of free upkeep costs, buildings could require explicit worker slots drawn from the laborer population. No workers assigned → building doesn't operate. This makes population directly relevant to infrastructure, not just to resource output. Significant implementation work but more expressive. Would live in `Building.ts` and `Population.ts`.

### Population-generated upkeep
Flip the cost model: buildings have zero upkeep, but each citizen tier has a per-capita consumption cost (laborers need food, craftsmen need food + some wealth, priests need wealth). The city's cost base scales with population rather than building count. Currently citizens cost food via `FOOD_PER_CITIZEN` in `Population.ts` — extending this to wealth/timber per tier is relatively small work.

### Dynamic dev tile productivity
Dev tiles currently produce a flat amount based on level. A richer model: output scales with the substrate value of the cell, not just the level. A Laborer Hovel in a high-Sustenance cell produces more food than one in a borderline cell. This would make substrate tuning directly visible in the economy. Would live in `Resource.ts`'s dev tile loop — pass `cell.substrate` values through and scale output.

### Decay and maintenance
Buildings could degrade over time (losing intensity automatically) unless the player pays timber/stone for maintenance. Forces periodic active management. Design risk: could feel like a chore rather than a decision.
