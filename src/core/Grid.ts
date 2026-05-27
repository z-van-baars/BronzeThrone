import { GridCell, SubstrateLayer, TerrainType } from '../types';
import { GRID_WIDTH, GRID_HEIGHT } from './Config';

export class Grid {
  readonly width = GRID_WIDTH;
  readonly height = GRID_HEIGHT;
  readonly cells: GridCell[][] = [];

  constructor() {
    for (let y = 0; y < this.height; y++) {
      this.cells[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.cells[y][x] = {
          x, y,
          terrain: TerrainType.Grass,
          buildingId: null,
          substrate: {
            [SubstrateLayer.Security]: 0,
            [SubstrateLayer.Prosperity]: 0,
            [SubstrateLayer.Piety]: 0,
            [SubstrateLayer.Industry]: 0,
            [SubstrateLayer.Sustenance]: 0,
            [SubstrateLayer.Culture]: 0,
          },
        };
      }
    }
  }

  getCell(x: number, y: number): GridCell | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    return this.cells[y][x];
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  setTerrain(x: number, y: number, terrain: TerrainType): void {
    if (this.inBounds(x, y)) {
      this.cells[y][x].terrain = terrain;
    }
  }
}
