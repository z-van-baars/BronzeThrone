import { Container, Graphics } from 'pixi.js';
import { GameState } from '../core/GameState';
import { CELL_SIZE } from '../core/Config';
import { TERRAIN_COLORS } from '../types';

export class GridRenderer {
  container: Container;
  private terrainGraphics: Graphics;
  private gridLines: Graphics;
  private selectionGraphics: Graphics;

  constructor() {
    this.container = new Container();
    this.terrainGraphics = new Graphics();
    this.gridLines = new Graphics();
    this.selectionGraphics = new Graphics();

    this.container.addChild(this.terrainGraphics);
    this.container.addChild(this.gridLines);
    this.container.addChild(this.selectionGraphics);
  }

  drawTerrain(gameState: GameState): void {
    const g = this.terrainGraphics;
    g.clear();

    const grid = gameState.grid;
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];
        const color = TERRAIN_COLORS[cell.terrain];
        g.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        g.fill(color);
      }
    }
  }

  drawGridLines(gameState: GameState): void {
    const g = this.gridLines;
    g.clear();

    const grid = gameState.grid;
    const totalW = grid.width * CELL_SIZE;
    const totalH = grid.height * CELL_SIZE;

    g.setStrokeStyle({ width: 0.5, color: 0x000000, alpha: 0.15 });

    for (let x = 0; x <= grid.width; x++) {
      g.moveTo(x * CELL_SIZE, 0);
      g.lineTo(x * CELL_SIZE, totalH);
      g.stroke();
    }
    for (let y = 0; y <= grid.height; y++) {
      g.moveTo(0, y * CELL_SIZE);
      g.lineTo(totalW, y * CELL_SIZE);
      g.stroke();
    }
  }

  updateSelection(gameState: GameState): void {
    const g = this.selectionGraphics;
    g.clear();

    if (!gameState.selectedCell) return;

    const { x, y } = gameState.selectedCell;
    g.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 0.8 });
    g.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    g.stroke();
  }
}
