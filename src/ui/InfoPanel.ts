import { GameState } from '../core/GameState';
import { BUILDING_DEFS } from '../data/buildings';
import { TerrainType, SubstrateLayer } from '../types';

const TERRAIN_NAMES: Record<TerrainType, string> = {
  [TerrainType.Grass]: 'Grassland',
  [TerrainType.Water]: 'Water',
  [TerrainType.Forest]: 'Forest',
  [TerrainType.Stone]: 'Stone Outcrop',
  [TerrainType.Sand]: 'Sandy Shore',
  [TerrainType.Hill]: 'Hills',
};

const LAYER_LABELS: Record<SubstrateLayer, string> = {
  [SubstrateLayer.Security]: 'Security',
  [SubstrateLayer.Prosperity]: 'Prosperity',
  [SubstrateLayer.Piety]: 'Piety',
  [SubstrateLayer.Industry]: 'Industry',
  [SubstrateLayer.Sustenance]: 'Sustenance',
  [SubstrateLayer.Culture]: 'Culture',
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

    let html = `
      <div class="label">Cell</div>
      <div class="value">(${cell.x}, ${cell.y})</div>
      <div class="label">Terrain</div>
      <div class="value">${TERRAIN_NAMES[cell.terrain]}</div>
    `;

    if (cell.buildingId) {
      const building = gameState.buildings.get(cell.buildingId);
      if (building) {
        const def = BUILDING_DEFS[building.defId];
        if (def) {
          html += `
            <div class="label">Building</div>
            <div class="value">${def.name}</div>
            <div class="label">Intensity</div>
            <div class="value">${Math.round(building.intensity * 100)}%</div>
          `;
        }
      }
    }

    const hasSubstrate = Object.values(SubstrateLayer).some(l => cell.substrate[l] > 0.01);
    if (hasSubstrate) {
      html += `<div class="label" style="margin-top:4px">Substrate</div>`;
      for (const layer of Object.values(SubstrateLayer)) {
        const val = cell.substrate[layer];
        if (val > 0.01) {
          html += `<div class="value" style="font-size:11px">${LAYER_LABELS[layer]}: ${val.toFixed(1)}</div>`;
        }
      }
    }

    this.el.innerHTML = html;
  }
}
