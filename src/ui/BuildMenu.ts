import { BUILDING_DEFS } from '../data/buildings';
import { BuildingDef, ResourceType } from '../types';
import { canPlaceBuilding } from '../core/Building';
import { GameState } from '../core/GameState';

export class BuildMenu {
  private el: HTMLElement;
  selectedBuilding: string | null = null;
  private onSelect: (defId: string | null) => void;

  constructor(onSelect: (defId: string | null) => void) {
    this.onSelect = onSelect;

    this.el = document.createElement('div');
    this.el.id = 'build-menu';
    Object.assign(this.el.style, {
      position: 'absolute',
      right: '12px',
      top: '48px',
      background: 'rgba(20, 20, 40, 0.9)',
      border: '1px solid rgba(212, 201, 168, 0.3)',
      borderRadius: '4px',
      padding: '8px',
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      fontSize: '12px',
      color: '#d4c9a8',
      width: '160px',
    });

    const title = document.createElement('div');
    title.textContent = 'BUILD';
    Object.assign(title.style, {
      color: '#8a7e65',
      fontSize: '10px',
      letterSpacing: '1px',
      marginBottom: '6px',
      textTransform: 'uppercase',
    });
    this.el.appendChild(title);

    document.getElementById('game-container')!.appendChild(this.el);
  }

  update(gameState: GameState): void {
    const buttons = this.el.querySelectorAll('.build-btn');
    buttons.forEach(b => b.remove());

    for (const def of Object.values(BUILDING_DEFS)) {
      const btn = document.createElement('div');
      btn.className = 'build-btn';

      const hasPrereqs = def.prerequisites.every(p =>
        [...gameState.buildings.values()].some(b => b.defId === p)
      );

      const canAfford = Object.entries(def.resourceCost).every(
        ([res, cost]) => gameState.resources[res as ResourceType] >= (cost as number)
      );

      const available = hasPrereqs;
      const affordable = available && canAfford;

      Object.assign(btn.style, {
        padding: '4px 6px',
        marginBottom: '3px',
        borderRadius: '3px',
        cursor: available ? 'pointer' : 'default',
        opacity: available ? (affordable ? '1' : '0.6') : '0.3',
        background: this.selectedBuilding === def.id
          ? 'rgba(212, 201, 168, 0.3)'
          : 'rgba(212, 201, 168, 0.08)',
        border: this.selectedBuilding === def.id
          ? '1px solid rgba(212, 201, 168, 0.5)'
          : '1px solid transparent',
        transition: 'background 0.15s',
      });

      const costStr = Object.entries(def.resourceCost)
        .map(([r, c]) => `${c} ${r}`)
        .join(', ');

      btn.innerHTML = `
        <div style="font-weight:600">${def.name}</div>
        ${costStr ? `<div style="font-size:10px;color:#8a7e65">${costStr}</div>` : '<div style="font-size:10px;color:#8a7e65">Free</div>'}
      `;

      if (available) {
        btn.addEventListener('click', () => {
          if (this.selectedBuilding === def.id) {
            this.selectedBuilding = null;
          } else {
            this.selectedBuilding = def.id;
          }
          this.onSelect(this.selectedBuilding);
          this.update(gameState);
        });
      }

      this.el.appendChild(btn);
    }
  }
}
