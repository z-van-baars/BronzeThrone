import { SubstrateLayer, DevType, TERRAIN_PASSABLE } from '../types';
import { GameState } from './GameState';

const MAX_DEV_LEVEL = 3;

const MIN_BANDWIDTH = 3;
const MAX_BANDWIDTH = 25;
const POP_HALF_POINT = 100;

const DISTRESS_ACCUMULATE = 0.015;
const DISTRESS_RECOVER = 0.01;
const LATERAL_SHIFT_THRESHOLD = 0.7;
const DOWNGRADE_THRESHOLD = 0.9;
const POST_SHIFT_DISTRESS = 0.3;
const POST_DOWNGRADE_DISTRESS = 0.2;

// TODO: variable distress rates — severely mismatched tiles (e.g. entire
// district burned down) should accumulate distress faster than tiles that
// merely lost a single supporting building. For now, rate is uniform.

interface DevTypeConfig {
  weights: Partial<Record<SubstrateLayer, number>>;
  thresholds: number[];
}

const DEV_TYPE_CONFIGS: Record<DevType, DevTypeConfig> = {
  [DevType.LaborerHousing]: {
    weights: { [SubstrateLayer.Sustenance]: 2.0 },
    thresholds: [0, 1.5, 4.0, 7.0],
  },
  [DevType.ArtisanQuarter]: {
    weights: { [SubstrateLayer.Industry]: 1.5, [SubstrateLayer.Sustenance]: 0.5 },
    thresholds: [0, 2.0, 5.0, 8.0],
  },
  [DevType.MarketWard]: {
    weights: { [SubstrateLayer.Prosperity]: 1.5, [SubstrateLayer.Culture]: 0.5 },
    thresholds: [0, 2.5, 5.5, 9.0],
  },
  [DevType.SacredQuarter]: {
    weights: { [SubstrateLayer.Piety]: 2.0 },
    thresholds: [0, 2.5, 5.5, 9.0],
  },
  [DevType.Garrison]: {
    weights: { [SubstrateLayer.Security]: 2.0 },
    thresholds: [0, 2.0, 5.0, 8.0],
  },
  [DevType.NobleEstate]: {
    weights: { [SubstrateLayer.Culture]: 1.0, [SubstrateLayer.Prosperity]: 1.0 },
    thresholds: [0, 3.0, 6.0, 10.0],
  },
};

function scoreDevType(substrate: Record<SubstrateLayer, number>, devType: DevType): number {
  const config = DEV_TYPE_CONFIGS[devType];
  let score = 0;
  for (const [layer, weight] of Object.entries(config.weights)) {
    score += (substrate[layer as SubstrateLayer] ?? 0) * (weight as number);
  }
  return score;
}

function getBestDevType(
  substrate: Record<SubstrateLayer, number>,
  targetLevel: number,
): { type: DevType; score: number } | null {
  let best: DevType | null = null;
  let bestScore = 0;

  for (const devType of Object.values(DevType)) {
    const config = DEV_TYPE_CONFIGS[devType];
    const score = scoreDevType(substrate, devType);
    if (score >= config.thresholds[targetLevel] && score > bestScore) {
      best = devType;
      bestScore = score;
    }
  }

  if (!best) return null;
  return { type: best, score: bestScore };
}

interface DevCandidate {
  x: number;
  y: number;
  score: number;
  action: 'colonize' | 'upgrade';
  targetType: DevType;
}

export function processDevelopmentTick(state: GameState): void {
  const grid = state.grid;
  const pop = state.population.totalPopulation;

  processDistress(state);

  const bandwidth = Math.floor(
    MIN_BANDWIDTH + (MAX_BANDWIDTH - MIN_BANDWIDTH) * (pop / (pop + POP_HALF_POINT))
  );

  const candidates: DevCandidate[] = [];

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const cell = grid.cells[y][x];
      if (!TERRAIN_PASSABLE[cell.terrain]) continue;
      if (cell.buildingId) continue;

      if (cell.devLevel === 0) {
        if (!hasAdjacentDevelopment(state, x, y) && !isNearBuilding(state, x, y)) continue;

        const best = getBestDevType(cell.substrate, 1);
        if (!best) continue;

        candidates.push({
          x, y,
          score: best.score * getAdjacencyBonus(state, x, y) * getProximityBonus(state, x, y),
          action: 'colonize',
          targetType: best.type,
        });
      } else if (cell.devLevel < MAX_DEV_LEVEL && cell.devType) {
        if (cell.devDistress > 0.1) continue;

        const currentScore = scoreDevType(cell.substrate, cell.devType);
        const nextThreshold = DEV_TYPE_CONFIGS[cell.devType].thresholds[cell.devLevel + 1];

        if (currentScore >= nextThreshold) {
          candidates.push({
            x, y,
            score: currentScore * getNeighborTierBonus(state, x, y, cell.devLevel) * getProximityBonus(state, x, y),
            action: 'upgrade',
            targetType: cell.devType,
          });
        }
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const picks = candidates.slice(0, bandwidth);

  for (const pick of picks) {
    const cell = grid.cells[pick.y][pick.x];
    if (pick.action === 'colonize') {
      cell.devLevel = 1;
      cell.devType = pick.targetType;
      cell.devDistress = 0;
    } else {
      cell.devLevel++;
    }
  }
}

function processDistress(state: GameState): void {
  const grid = state.grid;

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const cell = grid.cells[y][x];
      if (cell.devLevel === 0 || !cell.devType) continue;

      const score = scoreDevType(cell.substrate, cell.devType);
      const threshold = DEV_TYPE_CONFIGS[cell.devType].thresholds[cell.devLevel];

      if (score < threshold) {
        cell.devDistress = Math.min(1, cell.devDistress + DISTRESS_ACCUMULATE);
      } else {
        cell.devDistress = Math.max(0, cell.devDistress - DISTRESS_RECOVER);
      }

      if (cell.devDistress >= LATERAL_SHIFT_THRESHOLD) {
        const alt = findBestAlternative(cell.substrate, cell.devType, cell.devLevel);
        if (alt) {
          cell.devType = alt;
          cell.devDistress = POST_SHIFT_DISTRESS;
          continue;
        }
      }

      if (cell.devDistress >= DOWNGRADE_THRESHOLD) {
        cell.devLevel--;
        cell.devDistress = POST_DOWNGRADE_DISTRESS;
        if (cell.devLevel === 0) {
          cell.devType = null;
          cell.devDistress = 0;
        }
      }
    }
  }
}

function findBestAlternative(
  substrate: Record<SubstrateLayer, number>,
  exclude: DevType,
  level: number,
): DevType | null {
  let best: DevType | null = null;
  let bestScore = 0;

  for (const devType of Object.values(DevType)) {
    if (devType === exclude) continue;
    const config = DEV_TYPE_CONFIGS[devType];
    const score = scoreDevType(substrate, devType);
    if (score >= config.thresholds[level] && score > bestScore) {
      best = devType;
      bestScore = score;
    }
  }

  return best;
}

function hasAdjacentDevelopment(state: GameState, x: number, y: number): boolean {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const cell = state.grid.getCell(x + dx, y + dy);
      if (cell && cell.devLevel > 0) return true;
    }
  }
  return false;
}

function isNearBuilding(state: GameState, x: number, y: number): boolean {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const cell = state.grid.getCell(x + dx, y + dy);
      if (cell && cell.buildingId) return true;
    }
  }
  return false;
}

function getAdjacencyBonus(state: GameState, x: number, y: number): number {
  let devNeighbors = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const cell = state.grid.getCell(x + dx, y + dy);
      if (cell && cell.devLevel > 0) devNeighbors++;
    }
  }
  return 1 + devNeighbors * 0.3;
}

function getProximityBonus(state: GameState, x: number, y: number): number {
  let minDist = Infinity;
  for (const building of state.buildings.values()) {
    const dist = Math.abs(x - building.x) + Math.abs(y - building.y);
    if (dist < minDist) minDist = dist;
  }
  return 1 + Math.max(0, (10 - minDist)) * 0.1;
}

function getNeighborTierBonus(state: GameState, x: number, y: number, currentLevel: number): number {
  let bonus = 1;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const cell = state.grid.getCell(x + dx, y + dy);
      if (cell && cell.devLevel >= currentLevel) bonus += 0.2;
    }
  }
  return bonus;
}
