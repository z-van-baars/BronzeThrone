import { ResourceType, DevType, DEV_TYPE_LABELS } from '../types';
import { BUILDING_DEFS } from '../data/buildings';
import { GameState } from './GameState';
import { getCostMultiplier, getEffectMultiplier } from './Substrate';

// Resource output per dev tile type at levels 1, 2, 3.
const DEV_TILE_OUTPUT: Record<DevType, Partial<Record<ResourceType, number>>[]> = {
  [DevType.LaborerHousing]: [
    { [ResourceType.Food]: 1.0 },
    { [ResourceType.Food]: 2.0 },
    { [ResourceType.Food]: 3.5 },
  ],
  [DevType.ArtisanQuarter]: [
    { [ResourceType.Timber]: 0.5, [ResourceType.Stone]: 0.3 },
    { [ResourceType.Timber]: 1.0, [ResourceType.Stone]: 0.6 },
    { [ResourceType.Timber]: 1.8, [ResourceType.Stone]: 1.0 },
  ],
  [DevType.MarketWard]: [
    { [ResourceType.Wealth]: 0.6 },
    { [ResourceType.Wealth]: 1.2 },
    { [ResourceType.Wealth]: 2.0 },
  ],
  [DevType.SacredQuarter]: [
    { [ResourceType.Wealth]: 0.1 },
    { [ResourceType.Wealth]: 0.2 },
    { [ResourceType.Wealth]: 0.4 },
  ],
  [DevType.Garrison]: [
    {},
    {},
    {},
  ],
  [DevType.NobleEstate]: [
    { [ResourceType.Wealth]: 0.4 },
    { [ResourceType.Wealth]: 0.8 },
    { [ResourceType.Wealth]: 1.5 },
  ],
};

export function processResourceTick(state: GameState): void {
  // Building production and upkeep (intensity-scaled)
  for (const building of state.buildings.values()) {
    const def = BUILDING_DEFS[building.defId];
    if (!def) continue;

    const effectMul = getEffectMultiplier(building.intensity);
    const costMul = getCostMultiplier(building.intensity);

    for (const [res, amount] of Object.entries(def.resourceProduction)) {
      const produced = (amount as number) * effectMul;
      state.resources[res as ResourceType] += produced;
      state.ledger.record(def.name, res as ResourceType, produced);
    }

    for (const [res, amount] of Object.entries(def.resourceConsumption)) {
      const consumed = (amount as number) * costMul;
      state.resources[res as ResourceType] -= consumed;
      state.ledger.record(def.name, res as ResourceType, -consumed);
    }
  }

  // Dev tile production — citizens are the actual economy
  for (let y = 0; y < state.grid.height; y++) {
    for (let x = 0; x < state.grid.width; x++) {
      const cell = state.grid.cells[y][x];
      if (cell.devLevel === 0 || !cell.devType) continue;

      const output = DEV_TILE_OUTPUT[cell.devType][cell.devLevel - 1];
      const label = DEV_TYPE_LABELS[cell.devType];

      for (const [res, amount] of Object.entries(output)) {
        state.resources[res as ResourceType] += amount as number;
        state.ledger.record(label, res as ResourceType, amount as number);
      }
    }
  }

  for (const res of Object.values(ResourceType)) {
    if (state.resources[res] < 0) state.resources[res] = 0;
  }
}
