import { GameState } from '../core/GameState';
import { BUILDING_DEFS } from '../data/buildings';
import { BuildingInstance } from '../types';
import { recalculateSubstrate } from '../core/Substrate';

export class SliderPanel {
  private el: HTMLElement;
  private onChange: () => void;

  constructor(onChange: () => void) {
    this.onChange = onChange;

    this.el = document.createElement('div');
    this.el.id = 'slider-panel';
    Object.assign(this.el.style, {
      position: 'absolute',
      bottom: '12px',
      left: '12px',
      background: 'rgba(20, 20, 40, 0.9)',
      border: '1px solid rgba(212, 201, 168, 0.3)',
      borderRadius: '4px',
      padding: '8px 12px',
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      fontSize: '12px',
      color: '#d4c9a8',
      minWidth: '200px',
      display: 'none',
    });

    document.getElementById('game-container')!.appendChild(this.el);
  }

  update(gameState: GameState): void {
    const sel = gameState.selectedCell;
    if (!sel) {
      this.el.style.display = 'none';
      return;
    }

    const cell = gameState.grid.getCell(sel.x, sel.y);
    if (!cell?.buildingId) {
      this.el.style.display = 'none';
      return;
    }

    const building = gameState.buildings.get(cell.buildingId);
    if (!building) {
      this.el.style.display = 'none';
      return;
    }

    const def = BUILDING_DEFS[building.defId];
    if (!def) {
      this.el.style.display = 'none';
      return;
    }

    this.el.style.display = 'block';
    this.el.innerHTML = '';

    const title = document.createElement('div');
    title.textContent = def.name;
    title.style.fontWeight = '600';
    title.style.marginBottom = '6px';
    this.el.appendChild(title);

    const label = document.createElement('div');
    label.style.color = '#8a7e65';
    label.style.fontSize = '10px';
    label.style.textTransform = 'uppercase';
    label.style.letterSpacing = '0.5px';
    label.textContent = 'Operational Intensity';
    this.el.appendChild(label);

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '8px';
    row.style.marginTop = '4px';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '50';
    slider.max = '120';
    slider.step = '5';
    slider.value = String(Math.round(building.intensity * 100));
    slider.style.flex = '1';
    slider.style.accentColor = '#d4c9a8';

    const valueLabel = document.createElement('span');
    valueLabel.style.minWidth = '36px';
    valueLabel.style.textAlign = 'right';
    valueLabel.textContent = `${Math.round(building.intensity * 100)}%`;

    const overclockColor = (pct: number) => {
      if (pct <= 100) return '#d4c9a8';
      return '#ff8844';
    };
    valueLabel.style.color = overclockColor(building.intensity * 100);

    slider.addEventListener('input', () => {
      const pct = parseInt(slider.value);
      building.intensity = pct / 100;
      valueLabel.textContent = `${pct}%`;
      valueLabel.style.color = overclockColor(pct);
      recalculateSubstrate(gameState);
      this.onChange();
    });

    row.appendChild(slider);
    row.appendChild(valueLabel);
    this.el.appendChild(row);

    if (building.intensity > 1.0) {
      const warn = document.createElement('div');
      warn.style.fontSize = '10px';
      warn.style.color = '#ff8844';
      warn.style.marginTop = '4px';
      warn.textContent = 'Overclocked: +50% cost for +10% output';
      this.el.appendChild(warn);
    }
  }
}
