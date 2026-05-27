import { BUILDING_DEFS } from '../data/buildings';
import { ResourceType } from '../types';
import { GameState } from '../core/GameState';

const TIER_NAMES = ['Origin', 'Settlement', 'Village', 'Town', 'City-State'];
const TIER_POP_REQ = [0, 0, 50, 200, 500];

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
      bottom: '80px',
      background: 'rgba(20, 20, 40, 0.9)',
      border: '1px solid rgba(212, 201, 168, 0.3)',
      borderRadius: '4px',
      padding: '8px',
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      fontSize: '12px',
      color: '#d4c9a8',
      width: '170px',
      overflowY: 'auto',
    });

    document.getElementById('game-container')!.appendChild(this.el);
  }

  update(gameState: GameState): void {
    const scroll = this.el.scrollTop;
    this.el.innerHTML = '';

    const byTier = new Map<number, typeof BUILDING_DEFS[string][]>();
    for (const def of Object.values(BUILDING_DEFS)) {
      if (!byTier.has(def.tier)) byTier.set(def.tier, []);
      byTier.get(def.tier)!.push(def);
    }

    const pop = gameState.population.totalPopulation;

    for (const [tier, defs] of [...byTier.entries()].sort((a, b) => a[0] - b[0])) {
      const tierUnlocked = pop >= TIER_POP_REQ[tier];

      const header = document.createElement('div');
      Object.assign(header.style, {
        color: tierUnlocked ? '#8a7e65' : '#554f40',
        fontSize: '10px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginTop: tier > 0 ? '8px' : '0',
        marginBottom: '4px',
        borderBottom: '1px solid rgba(212,201,168,0.15)',
        paddingBottom: '2px',
      });
      header.textContent = `${TIER_NAMES[tier]}` + (TIER_POP_REQ[tier] > 0 ? ` (${TIER_POP_REQ[tier]} pop)` : '');
      this.el.appendChild(header);

      for (const def of defs) {
        const hasPrereqs = def.prerequisites.every(p =>
          [...gameState.buildings.values()].some(b => b.defId === p)
        );

        const canAfford = Object.entries(def.resourceCost).every(
          ([res, cost]) => gameState.resources[res as ResourceType] >= (cost as number)
        );

        const available = tierUnlocked && hasPrereqs;
        const affordable = available && canAfford;

        const btn = document.createElement('div');
        Object.assign(btn.style, {
          padding: '3px 6px',
          marginBottom: '2px',
          borderRadius: '3px',
          cursor: available ? 'pointer' : 'default',
          opacity: available ? (affordable ? '1' : '0.6') : '0.25',
          background: this.selectedBuilding === def.id
            ? 'rgba(212, 201, 168, 0.3)'
            : 'rgba(212, 201, 168, 0.05)',
          border: this.selectedBuilding === def.id
            ? '1px solid rgba(212, 201, 168, 0.5)'
            : '1px solid transparent',
          transition: 'background 0.15s',
        });

        const costStr = Object.entries(def.resourceCost)
          .map(([r, c]) => `${c}${r.slice(0, 3)}`)
          .join(' ');

        btn.innerHTML = `
          <div style="font-weight:600;font-size:11px">${def.name}</div>
          <div style="font-size:10px;color:#8a7e65">${costStr || 'Free'}</div>
        `;

        if (available) {
          btn.addEventListener('click', () => {
            this.selectedBuilding = this.selectedBuilding === def.id ? null : def.id;
            this.onSelect(this.selectedBuilding);
            this.update(gameState);
          });

          btn.addEventListener('mouseenter', () => {
            if (this.selectedBuilding !== def.id) {
              btn.style.background = 'rgba(212, 201, 168, 0.15)';
            }
          });
          btn.addEventListener('mouseleave', () => {
            if (this.selectedBuilding !== def.id) {
              btn.style.background = 'rgba(212, 201, 168, 0.05)';
            }
          });
        }

        this.el.appendChild(btn);
      }
    }

    this.el.scrollTop = scroll;
  }
}
