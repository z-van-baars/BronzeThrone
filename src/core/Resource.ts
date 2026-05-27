import { ResourceType } from '../types';
import { BUILDING_DEFS } from '../data/buildings';
import { GameState } from './GameState';
import { getCostMultiplier, getEffectMultiplier } from './Substrate';

export function processResourceTick(state: GameState): void {
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

  for (const res of Object.values(ResourceType)) {
    if (state.resources[res] < 0) state.resources[res] = 0;
  }
}
