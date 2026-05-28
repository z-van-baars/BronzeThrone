import { GameState } from '../core/GameState';
import { BUILDING_DEFS } from '../data/buildings';
import { ResourceType, SubstrateLayer, RESOURCE_LABELS } from '../types';
import { recalculateSubstrate, getEffectMultiplier, getCostMultiplier } from '../core/Substrate';

const RES_ICONS: Record<ResourceType, string> = {
  [ResourceType.Food]: '🌾',
  [ResourceType.Timber]: '🪵',
  [ResourceType.Stone]: '🪨',
  [ResourceType.Bronze]: '⚔️',
  [ResourceType.Wealth]: '💰',
};

const LAYER_SHORT: Record<SubstrateLayer, string> = {
  [SubstrateLayer.Security]: 'SEC',
  [SubstrateLayer.Prosperity]: 'PRO',
  [SubstrateLayer.Piety]: 'PIE',
  [SubstrateLayer.Industry]: 'IND',
  [SubstrateLayer.Sustenance]: 'SUS',
  [SubstrateLayer.Culture]: 'CUL',
};

export class SliderPanel {
  private el: HTMLElement;
  private onChange: () => void;
  private currentBuildingId: string | null = null;
  private slider: HTMLInputElement | null = null;
  private valueLabel: HTMLElement | null = null;
  private outputSection: HTMLElement | null = null;

  constructor(onChange: () => void) {
    this.onChange = onChange;

    this.el = document.createElement('div');
    this.el.id = 'slider-panel';
    Object.assign(this.el.style, {
      position: 'absolute',
      bottom: '12px',
      left: '190px',
      background: 'rgba(20, 20, 40, 0.9)',
      border: '1px solid rgba(212, 201, 168, 0.3)',
      borderRadius: '4px',
      padding: '8px 12px',
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      fontSize: '12px',
      color: '#d4c9a8',
      minWidth: '220px',
      display: 'none',
    });

    document.getElementById('game-container')!.appendChild(this.el);
  }

  update(gameState: GameState): void {
    const sel = gameState.selectedCell;
    if (!sel) {
      this.hide();
      return;
    }

    const cell = gameState.grid.getCell(sel.x, sel.y);
    if (!cell?.buildingId) {
      this.hide();
      return;
    }

    const building = gameState.buildings.get(cell.buildingId);
    if (!building) {
      this.hide();
      return;
    }

    const def = BUILDING_DEFS[building.defId];
    if (!def) {
      this.hide();
      return;
    }

    if (this.currentBuildingId === building.id && this.slider) {
      this.updateOutputSection(def, building.intensity);
      return;
    }

    this.currentBuildingId = building.id;
    this.el.style.display = 'block';
    this.el.innerHTML = '';

    const title = document.createElement('div');
    title.textContent = def.name;
    title.style.fontWeight = '600';
    title.style.marginBottom = '6px';
    this.el.appendChild(title);

    const label = document.createElement('div');
    Object.assign(label.style, {
      color: '#8a7e65',
      fontSize: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    });
    label.textContent = 'Operational Intensity';
    this.el.appendChild(label);

    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '4px',
    });

    this.slider = document.createElement('input');
    this.slider.type = 'range';
    this.slider.min = '50';
    this.slider.max = '120';
    this.slider.step = '5';
    this.slider.value = String(Math.round(building.intensity * 100));
    this.slider.style.flex = '1';
    this.slider.style.accentColor = '#d4c9a8';

    this.valueLabel = document.createElement('span');
    this.valueLabel.style.minWidth = '36px';
    this.valueLabel.style.textAlign = 'right';
    this.valueLabel.textContent = `${Math.round(building.intensity * 100)}%`;
    this.valueLabel.style.color = building.intensity > 1 ? '#ff8844' : '#d4c9a8';

    this.slider.addEventListener('input', () => {
      const pct = parseInt(this.slider!.value);
      building.intensity = pct / 100;
      this.valueLabel!.textContent = `${pct}%`;
      this.valueLabel!.style.color = pct > 100 ? '#ff8844' : '#d4c9a8';
      this.updateOutputSection(def, building.intensity);
      recalculateSubstrate(gameState);
      this.onChange();
    });

    row.appendChild(this.slider);
    row.appendChild(this.valueLabel);
    this.el.appendChild(row);

    this.outputSection = document.createElement('div');
    this.outputSection.style.marginTop = '6px';
    this.outputSection.style.fontSize = '11px';
    this.el.appendChild(this.outputSection);

    this.updateOutputSection(def, building.intensity);
  }

  private updateOutputSection(def: { resourceProduction: Partial<Record<ResourceType, number>>; resourceConsumption: Partial<Record<ResourceType, number>>; emissions: { layer: SubstrateLayer; strength: number; radius: number }[] }, intensity: number): void {
    if (!this.outputSection) return;

    const effectMul = getEffectMultiplier(intensity);
    const costMul = getCostMultiplier(intensity);
    const lines: string[] = [];

    const prodEntries = Object.entries(def.resourceProduction) as [ResourceType, number][];
    if (prodEntries.length > 0) {
      const parts = prodEntries.map(([res, base]) => {
        const actual = (base * effectMul).toFixed(1);
        return `${RES_ICONS[res]}+${actual}`;
      });
      lines.push(`<div style="color:#88cc88">Produces: ${parts.join(' ')}</div>`);
    }

    const consEntries = Object.entries(def.resourceConsumption) as [ResourceType, number][];
    if (consEntries.length > 0) {
      const parts = consEntries.map(([res, base]) => {
        const actual = (base * costMul).toFixed(1);
        return `${RES_ICONS[res]}-${actual}`;
      });
      lines.push(`<div style="color:#cc5555">Consumes: ${parts.join(' ')}</div>`);
    }

    if (def.emissions.length > 0) {
      const parts = def.emissions.map(e => {
        const actual = (e.strength * effectMul).toFixed(1);
        return `${LAYER_SHORT[e.layer]} ${actual}`;
      });
      lines.push(`<div style="color:#8a7e65;font-size:10px;margin-top:2px">Emits: ${parts.join(', ')}</div>`);
    }

    if (intensity > 1.0) {
      lines.push(`<div style="color:#ff8844;font-size:10px;margin-top:2px">Overclocked: higher cost for diminishing returns</div>`);
    }

    this.outputSection.innerHTML = lines.join('');
  }

  private hide(): void {
    this.el.style.display = 'none';
    this.currentBuildingId = null;
    this.slider = null;
    this.valueLabel = null;
    this.outputSection = null;
  }
}
