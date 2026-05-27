import { Container, Graphics } from 'pixi.js';
import { GameState } from '../core/GameState';
import { CELL_SIZE } from '../core/Config';
import { SubstrateLayer, TERRAIN_PASSABLE } from '../types';

export class PopulationRenderer {
  container: Container;
  private graphics: Graphics;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
  }

  draw(gameState: GameState): void {
    const g = this.graphics;
    g.clear();

    const totalPop = gameState.population.totalPopulation;
    if (totalPop < 1) return;

    const grid = gameState.grid;

    let totalSustenance = 0;
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];
        if (TERRAIN_PASSABLE[cell.terrain] && !cell.buildingId) {
          totalSustenance += cell.substrate[SubstrateLayer.Sustenance];
        }
      }
    }

    if (totalSustenance < 0.01) return;

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];
        if (!TERRAIN_PASSABLE[cell.terrain] || cell.buildingId) continue;

        const sus = cell.substrate[SubstrateLayer.Sustenance];
        if (sus < 0.5) continue;

        const localPop = (sus / totalSustenance) * totalPop;
        if (localPop < 0.3) continue;

        const density = Math.min(1, localPop / 5);
        const dotCount = Math.ceil(density * 4);

        const seed = x * 73 + y * 137;
        for (let i = 0; i < dotCount; i++) {
          const hash = (seed + i * 31) & 0xffff;
          const dx = (hash % CELL_SIZE) * 0.7 + CELL_SIZE * 0.15;
          const dy = ((hash >> 4) % CELL_SIZE) * 0.7 + CELL_SIZE * 0.15;

          g.circle(x * CELL_SIZE + dx, y * CELL_SIZE + dy, 1.5);
          g.fill({ color: 0xe8d8b8, alpha: 0.6 + density * 0.3 });
        }
      }
    }
  }
}
