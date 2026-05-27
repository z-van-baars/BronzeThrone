import { SubstrateLayer } from '../types';
import { BUILDING_DEFS } from '../data/buildings';
import { GameState } from './GameState';

export function recalculateSubstrate(state: GameState): void {
  const grid = state.grid;

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const cell = grid.cells[y][x];
      for (const layer of Object.values(SubstrateLayer)) {
        cell.substrate[layer] = 0;
      }
    }
  }

  for (const building of state.buildings.values()) {
    const def = BUILDING_DEFS[building.defId];
    if (!def) continue;

    const intensity = building.intensity;
    const effectMultiplier = getEffectMultiplier(intensity);

    const centerX = building.x + def.footprint.w / 2;
    const centerY = building.y + def.footprint.h / 2;

    for (const emission of def.emissions) {
      applyRadial(grid, centerX, centerY, emission.layer, emission.strength * effectMultiplier, emission.radius);
    }

    for (const suppression of def.suppressions) {
      applyRadial(grid, centerX, centerY, suppression.layer, -suppression.strength * effectMultiplier, suppression.radius);
    }
  }

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const cell = grid.cells[y][x];
      for (const layer of Object.values(SubstrateLayer)) {
        if (cell.substrate[layer] < 0) cell.substrate[layer] = 0;
      }
    }
  }
}

function applyRadial(
  grid: { width: number; height: number; cells: { substrate: Record<SubstrateLayer, number> }[][] },
  cx: number,
  cy: number,
  layer: SubstrateLayer,
  strength: number,
  radius: number,
): void {
  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(grid.width - 1, Math.ceil(cx + radius));
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(grid.height - 1, Math.ceil(cy + radius));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dist = Math.sqrt((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2);
      if (dist > radius) continue;

      const falloff = 1 - dist / radius;
      grid.cells[y][x].substrate[layer] += strength * falloff;
    }
  }
}

export function getEffectMultiplier(intensity: number): number {
  if (intensity <= 1.0) {
    return 0.2 + 0.8 * intensity;
  }
  return 1.0 + 0.5 * (intensity - 1.0);
}

export function getCostMultiplier(intensity: number): number {
  if (intensity <= 1.0) {
    return intensity * 0.8;
  }
  return 1.0 + 2.5 * (intensity - 1.0);
}
