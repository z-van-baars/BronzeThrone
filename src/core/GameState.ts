import { Grid } from './Grid';
import { generateMap } from './MapGen';
import { initPopulation, PopulationState } from './Population';
import { EventDeck } from './EventDeck';
import { MilitarySystem } from './Military';
import { BuildingInstance, ResourceType } from '../types';

export type GameSpeed = 0 | 1 | 2 | 3;

export class GameState {
  readonly grid: Grid;
  readonly buildings: Map<string, BuildingInstance> = new Map();
  readonly resources: Record<ResourceType, number> = {
    [ResourceType.Food]: 0,
    [ResourceType.Timber]: 0,
    [ResourceType.Stone]: 0,
    [ResourceType.Bronze]: 0,
    [ResourceType.Wealth]: 0,
  };
  readonly population: PopulationState = initPopulation();
  readonly eventDeck: EventDeck = new EventDeck();
  readonly military: MilitarySystem = new MilitarySystem();

  tickCount = 0;
  speed: GameSpeed = 1;
  selectedCell: { x: number; y: number } | null = null;

  private nextBuildingId = 1;

  constructor(seed?: number) {
    this.grid = new Grid();
    generateMap(this.grid, seed);
  }

  generateBuildingId(): string {
    return `b${this.nextBuildingId++}`;
  }

  tick(): void {
    this.tickCount++;
  }
}
