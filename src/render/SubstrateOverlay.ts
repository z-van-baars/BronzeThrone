import { Container, Graphics } from 'pixi.js';
import { GameState } from '../core/GameState';
import { CELL_SIZE } from '../core/Config';
import { SubstrateLayer, SUBSTRATE_COLORS } from '../types';

export class SubstrateOverlay {
  container: Container;
  private graphics: Graphics;
  activeLayer: SubstrateLayer | null = null;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
  }

  draw(gameState: GameState): void {
    const g = this.graphics;
    g.clear();

    if (!this.activeLayer) return;

    const layer = this.activeLayer;
    const color = SUBSTRATE_COLORS[layer];
    const grid = gameState.grid;

    let maxVal = 0;
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const val = grid.cells[y][x].substrate[layer];
        if (val > maxVal) maxVal = val;
      }
    }

    if (maxVal === 0) return;

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const val = grid.cells[y][x].substrate[layer];
        if (val <= 0) continue;

        const alpha = Math.min(0.7, (val / maxVal) * 0.7);
        g.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        g.fill({ color, alpha });
      }
    }
  }

  toggle(layer: SubstrateLayer): void {
    if (this.activeLayer === layer) {
      this.activeLayer = null;
    } else {
      this.activeLayer = layer;
    }
  }
}
