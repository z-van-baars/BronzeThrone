import { GameState } from './GameState';
import { SubstrateLayer, CitizenTier, ResourceType } from '../types';
import { BUILDING_DEFS } from '../data/buildings';

export interface Threat {
  name: string;
  strength: number;
  description: string;
  warningTicks: number;
  ticksRemaining: number;
  resolved: boolean;
}

export interface CombatResult {
  victory: boolean;
  narrative: string;
  casualties: number;
  buildingsDestroyed: number;
  resourcesLost: Partial<Record<ResourceType, number>>;
}

const THREAT_TEMPLATES = [
  { name: 'Raiding Party', baseStrength: 30, description: 'A band of raiders has been spotted approaching from the wilderness.' },
  { name: 'Nomadic Warband', baseStrength: 50, description: 'A large warband of mounted nomads rides toward your city.' },
  { name: 'Rival City-State', baseStrength: 80, description: 'A neighboring city-state has declared war. Their army marches.' },
  { name: 'Northern Barbarians', baseStrength: 120, description: 'Countless warriors pour from the northern passes.' },
  { name: 'Bronze Legion', baseStrength: 180, description: 'A professional army with bronze weapons and siege equipment advances.' },
];

export class MilitarySystem {
  activeThreat: Threat | null = null;
  private ticksSinceLastThreat = 0;
  private baseInterval = 60;
  private threatCount = 0;

  tick(state: GameState): void {
    if (this.activeThreat) {
      if (this.activeThreat.ticksRemaining > 0) {
        this.activeThreat.ticksRemaining--;
      }
      return;
    }

    this.ticksSinceLastThreat++;

    const interval = Math.max(25, this.baseInterval - this.threatCount * 5);
    if (this.ticksSinceLastThreat < interval) return;
    if (state.tickCount < 40) return;
    if (state.population.totalPopulation < 20) return;

    this.generateThreat(state);
  }

  private generateThreat(state: GameState): void {
    const scaledIndex = Math.min(
      THREAT_TEMPLATES.length - 1,
      Math.floor(this.threatCount * 0.7)
    );
    const template = THREAT_TEMPLATES[scaledIndex];

    const strengthScale = 1 + this.threatCount * 0.3 + state.tickCount * 0.002;
    const strength = Math.round(template.baseStrength * strengthScale);

    this.activeThreat = {
      name: template.name,
      strength,
      description: template.description,
      warningTicks: 5,
      ticksRemaining: 5,
      resolved: false,
    };

    this.ticksSinceLastThreat = 0;
    this.threatCount++;
  }

  resolveCombat(state: GameState): CombatResult {
    if (!this.activeThreat) {
      return { victory: true, narrative: '', casualties: 0, buildingsDestroyed: 0, resourcesLost: {} };
    }

    const threat = this.activeThreat;
    const grid = state.grid;

    let totalSecurity = 0;
    let cellCount = 0;
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        totalSecurity += grid.cells[y][x].substrate[SubstrateLayer.Security];
        cellCount++;
      }
    }
    const avgSecurity = totalSecurity / Math.max(1, cellCount);

    const warriors = state.population.tiers[CitizenTier.Warrior];

    let fortBonus = 0;
    for (const b of state.buildings.values()) {
      const def = BUILDING_DEFS[b.defId];
      if (!def) continue;
      for (const em of def.emissions) {
        if (em.layer === SubstrateLayer.Security) {
          fortBonus += em.strength * 2;
        }
      }
    }

    const bronzeEquipment = Math.min(1, state.resources[ResourceType.Bronze] / 20);

    const defenseStrength =
      avgSecurity * 10 +
      warriors * 3 * (1 + bronzeEquipment) +
      fortBonus;

    const ratio = defenseStrength / Math.max(1, threat.strength);
    const victory = ratio >= 0.7;

    let casualties: number;
    let buildingsDestroyed: number;
    let narrative: string;
    const resourcesLost: Partial<Record<ResourceType, number>> = {};

    if (victory) {
      casualties = Math.round(warriors * 0.15 * (1 / Math.max(0.5, ratio)));
      buildingsDestroyed = 0;
      narrative = ratio > 1.5
        ? `Your defenses held firm against the ${threat.name}. The attackers broke upon your walls like waves on stone. Minimal losses.`
        : `After fierce fighting, the ${threat.name} has been repelled. The battle was costly, but your city stands.`;
    } else {
      const severity = Math.min(1, 1 - ratio);
      casualties = Math.round((warriors + state.population.tiers[CitizenTier.Laborer] * 0.1) * severity * 0.4);
      buildingsDestroyed = Math.round(severity * 3);

      resourcesLost[ResourceType.Food] = Math.round(state.resources[ResourceType.Food] * severity * 0.3);
      resourcesLost[ResourceType.Timber] = Math.round(state.resources[ResourceType.Timber] * severity * 0.2);
      resourcesLost[ResourceType.Wealth] = Math.round(state.resources[ResourceType.Wealth] * severity * 0.25);

      narrative = severity > 0.6
        ? `The ${threat.name} overwhelmed your defenses. Districts burn. The dead litter the streets. Recovery will be long and painful.`
        : `The ${threat.name} breached your walls and pillaged the outer districts before withdrawing. Significant damage sustained.`;
    }

    state.population.tiers[CitizenTier.Warrior] = Math.max(0, warriors - casualties);
    const laborerLoss = Math.round(casualties * 0.5);
    state.population.tiers[CitizenTier.Laborer] = Math.max(0,
      state.population.tiers[CitizenTier.Laborer] - laborerLoss);

    state.population.totalPopulation = Object.values(state.population.tiers)
      .reduce((s, v) => s + v, 0);

    for (const [res, amount] of Object.entries(resourcesLost)) {
      state.resources[res as ResourceType] = Math.max(0,
        state.resources[res as ResourceType] - (amount as number));
    }

    if (buildingsDestroyed > 0 && state.buildings.size > 1) {
      const buildingList = [...state.buildings.entries()];
      const toDestroy = buildingList
        .filter(([, b]) => b.defId !== 'settlers_camp')
        .slice(-buildingsDestroyed);

      for (const [id, building] of toDestroy) {
        const def = BUILDING_DEFS[building.defId];
        if (def) {
          for (let dy = 0; dy < def.footprint.h; dy++) {
            for (let dx = 0; dx < def.footprint.w; dx++) {
              const cell = state.grid.getCell(building.x + dx, building.y + dy);
              if (cell) cell.buildingId = null;
            }
          }
        }
        state.buildings.delete(id);
      }
    }

    this.activeThreat.resolved = true;
    this.activeThreat = null;

    return { victory, narrative, casualties: casualties + laborerLoss, buildingsDestroyed, resourcesLost };
  }
}
