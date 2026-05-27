import { BUILDING_DEFS } from '../data/buildings';
import { ResourceType, RESOURCE_COLORS } from '../types';
import { GameState } from '../core/GameState';

const TIER_NAMES = ['Origin', 'Settlement', 'Village', 'Town', 'City-State'];
const TIER_POP_REQ = [0, 0, 50, 200, 500];

const RES_ICONS: Record<ResourceType, string> = {
  [ResourceType.Food]: '🌾',
  [ResourceType.Timber]: '🪵',
  [ResourceType.Stone]: '🪨',
  [ResourceType.Bronze]: '⚔️',
  [ResourceType.Wealth]: '💰',
};

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
      width: '180px',
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

        const tierAvailable = tierUnlocked && hasPrereqs;

        // Check max count (settler's camp = 1)
        let maxCountMet = false;
        if (def.id === 'settlers_camp') {
          const count = [...gameState.buildings.values()].filter(b => b.defId === 'settlers_camp').length;
          if (count >= 1) maxCountMet = true;
        }

        const available = tierAvailable && !maxCountMet;

        const btn = document.createElement('div');
        Object.assign(btn.style, {
          padding: '4px 6px',
          marginBottom: '2px',
          borderRadius: '3px',
          cursor: available ? 'pointer' : 'default',
          opacity: tierAvailable ? (maxCountMet ? '0.4' : '1') : '0.25',
          background: this.selectedBuilding === def.id
            ? 'rgba(212, 201, 168, 0.3)'
            : 'rgba(212, 201, 168, 0.05)',
          border: this.selectedBuilding === def.id
            ? '1px solid rgba(212, 201, 168, 0.5)'
            : '1px solid transparent',
          transition: 'background 0.15s',
        });

        // Cost chips with per-resource affordability coloring
        const costEntries = Object.entries(def.resourceCost) as [ResourceType, number][];
        let costHtml = '';
        if (costEntries.length === 0) {
          costHtml = '<span style="color:#8a7e65">Free</span>';
        } else {
          costHtml = costEntries.map(([res, cost]) => {
            const canAfford = gameState.resources[res] >= cost;
            const color = !available ? '#554f40' : canAfford ? '#b0a88c' : '#cc4444';
            return `<span style="color:${color}" title="${cost} ${res}">${RES_ICONS[res]}${cost}</span>`;
          }).join(' ');
        }

        btn.innerHTML = `
          <div style="font-weight:600;font-size:11px">${def.name}</div>
          <div style="font-size:11px;margin-top:1px">${costHtml}</div>
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

  deselect(): void {
    this.selectedBuilding = null;
    this.onSelect(null);
  }
}
