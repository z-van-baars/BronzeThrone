import { CitizenTier, ResourceType, SubstrateLayer } from '../types';
import { GameState } from './GameState';

export interface PopulationState {
  tiers: Record<CitizenTier, number>;
  totalPopulation: number;
}

const FOOD_PER_CITIZEN = 0.1;

const TIER_CONFIG: Record<CitizenTier, {
  substrate: SubstrateLayer;
  growthRate: number;
  minSubstrate: number;
}> = {
  [CitizenTier.Laborer]: {
    substrate: SubstrateLayer.Sustenance,
    growthRate: 0.3,
    minSubstrate: 1.0,
  },
  [CitizenTier.Craftsman]: {
    substrate: SubstrateLayer.Industry,
    growthRate: 0.15,
    minSubstrate: 2.0,
  },
  [CitizenTier.Merchant]: {
    substrate: SubstrateLayer.Prosperity,
    growthRate: 0.1,
    minSubstrate: 2.5,
  },
  [CitizenTier.Priest]: {
    substrate: SubstrateLayer.Piety,
    growthRate: 0.08,
    minSubstrate: 3.0,
  },
  [CitizenTier.Warrior]: {
    substrate: SubstrateLayer.Security,
    growthRate: 0.1,
    minSubstrate: 2.0,
  },
  [CitizenTier.Elite]: {
    substrate: SubstrateLayer.Culture,
    growthRate: 0.05,
    minSubstrate: 4.0,
  },
};

export function initPopulation(): PopulationState {
  const tiers = {} as Record<CitizenTier, number>;
  for (const tier of Object.values(CitizenTier)) {
    tiers[tier] = 0;
  }
  return { tiers, totalPopulation: 0 };
}

export function processPopulationTick(state: GameState): void {
  const pop = state.population;
  const grid = state.grid;

  const totalFood = state.resources[ResourceType.Food];
  const foodNeeded = pop.totalPopulation * FOOD_PER_CITIZEN;

  const foodSurplus = totalFood - foodNeeded;
  const isStarving = foodSurplus < 0;

  const TIER_LABELS: Record<CitizenTier, string> = {
    [CitizenTier.Laborer]: 'Laborers',
    [CitizenTier.Craftsman]: 'Craftsmen',
    [CitizenTier.Merchant]: 'Merchants',
    [CitizenTier.Priest]: 'Priests',
    [CitizenTier.Warrior]: 'Warriors',
    [CitizenTier.Elite]: 'Elites',
  };

  for (const tier of Object.values(CitizenTier)) {
    const consumption = pop.tiers[tier] * FOOD_PER_CITIZEN;
    if (consumption > 0.001) {
      state.ledger.record(TIER_LABELS[tier], ResourceType.Food, -consumption);
    }
  }

  if (isStarving) {
    state.resources[ResourceType.Food] = 0;
    const starvationRate = Math.min(0.05, Math.abs(foodSurplus) / (pop.totalPopulation + 1));
    for (const tier of Object.values(CitizenTier)) {
      pop.tiers[tier] = Math.max(0, pop.tiers[tier] * (1 - starvationRate));
    }
  } else {
    state.resources[ResourceType.Food] -= foodNeeded;
  }

  if (!isStarving) {
    for (const tier of Object.values(CitizenTier)) {
      const config = TIER_CONFIG[tier];

      let maxSubstrateVal = 0;
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          const val = grid.cells[y][x].substrate[config.substrate];
          if (val > maxSubstrateVal) maxSubstrateVal = val;
        }
      }

      if (maxSubstrateVal < config.minSubstrate) continue;

      const substrateStrength = Math.min(1, (maxSubstrateVal - config.minSubstrate) / 5);
      const foodFactor = Math.min(1, foodSurplus / 10);
      const growth = config.growthRate * substrateStrength * foodFactor;

      pop.tiers[tier] += growth;
    }
  }

  pop.totalPopulation = 0;
  for (const tier of Object.values(CitizenTier)) {
    if (pop.tiers[tier] < 0.01) pop.tiers[tier] = 0;
    pop.totalPopulation += pop.tiers[tier];
  }
}
