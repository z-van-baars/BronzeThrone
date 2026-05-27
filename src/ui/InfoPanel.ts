import { GameState } from '../core/GameState';
import { TerrainType } from '../types';

const TERRAIN_NAMES: Record<TerrainType, string> = {
  [TerrainType.Grass]: 'Grassland',
  [TerrainType.Water]: 'Water',
  [TerrainType.Forest]: 'Forest',
  [TerrainType.Stone]: 'Stone Outcrop',
  [TerrainType.Sand]: 'Sandy Shore',
  [TerrainType.Hill]: 'Hills',
};

export class InfoPanel {
  private el: HTMLElement;

  constructor() {
    this.el = document.getElementById('info-panel')!;
  }

  update(gameState: GameState): void {
    const sel = gameState.selectedCell;
    if (!sel) {
      this.el.style.display = 'none';
      return;
    }

    const cell = gameState.grid.getCell(sel.x, sel.y);
    if (!cell) {
      this.el.style.display = 'none';
      return;
    }

    this.el.style.display = 'block';
    this.el.innerHTML = `
      <div class="label">Cell</div>
      <div class="value">(${cell.x}, ${cell.y})</div>
      <div class="label">Terrain</div>
      <div class="value">${TERRAIN_NAMES[cell.terrain]}</div>
    `;
  }
}
