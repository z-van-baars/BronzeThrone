import { BuildingDef, BuildingInstance, TERRAIN_PASSABLE } from '../types';
import { BUILDING_DEFS } from '../data/buildings';
import { GameState } from './GameState';

const TIER_POP_THRESHOLDS: Record<number, number> = {
  0: 0,
  1: 0,
  2: 50,
  3: 200,
  4: 500,
};

export function getBuildingDef(defId: string): BuildingDef | undefined {
  return BUILDING_DEFS[defId];
}

export function canPlaceBuilding(
  state: GameState,
  defId: string,
  x: number,
  y: number,
): { ok: boolean; reason?: string } {
  const def = getBuildingDef(defId);
  if (!def) return { ok: false, reason: 'Unknown building' };

  const popReq = TIER_POP_THRESHOLDS[def.tier] ?? 0;
  if (state.population.totalPopulation < popReq) {
    return { ok: false, reason: `Need ${popReq} population` };
  }

  for (const [resType, cost] of Object.entries(def.resourceCost)) {
    const available = state.resources[resType as keyof typeof state.resources];
    if (available < (cost as number)) {
      return { ok: false, reason: `Not enough ${resType}` };
    }
  }

  for (const prereq of def.prerequisites) {
    const hasPrereq = [...state.buildings.values()].some(b => b.defId === prereq);
    if (!hasPrereq) {
      return { ok: false, reason: `Requires ${BUILDING_DEFS[prereq]?.name ?? prereq}` };
    }
  }

  for (let dy = 0; dy < def.footprint.h; dy++) {
    for (let dx = 0; dx < def.footprint.w; dx++) {
      const cx = x + dx;
      const cy = y + dy;
      const cell = state.grid.getCell(cx, cy);
      if (!cell) return { ok: false, reason: 'Out of bounds' };
      if (!TERRAIN_PASSABLE[cell.terrain]) return { ok: false, reason: 'Impassable terrain' };
      if (cell.buildingId) return { ok: false, reason: 'Cell occupied' };
    }
  }

  return { ok: true };
}

export function placeBuilding(
  state: GameState,
  defId: string,
  x: number,
  y: number,
): BuildingInstance | null {
  const check = canPlaceBuilding(state, defId, x, y);
  if (!check.ok) return null;

  const def = getBuildingDef(defId)!;

  for (const [resType, cost] of Object.entries(def.resourceCost)) {
    state.resources[resType as keyof typeof state.resources] -= cost as number;
  }

  const instance: BuildingInstance = {
    id: state.generateBuildingId(),
    defId,
    x,
    y,
    intensity: 1.0,
  };

  state.buildings.set(instance.id, instance);

  for (let dy = 0; dy < def.footprint.h; dy++) {
    for (let dx = 0; dx < def.footprint.w; dx++) {
      const cell = state.grid.getCell(x + dx, y + dy);
      if (cell) cell.buildingId = instance.id;
    }
  }

  return instance;
}
