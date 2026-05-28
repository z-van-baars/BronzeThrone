import { BUILDING_DEFS } from '../data/buildings';
import { ResourceType, SubstrateLayer, RESOURCE_COLORS, RESOURCE_LABELS } from '../types';
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

const LAYER_SHORT: Record<SubstrateLayer, string> = {
  [SubstrateLayer.Security]: 'Security',
  [SubstrateLayer.Prosperity]: 'Prosperity',
  [SubstrateLayer.Piety]: 'Piety',
  [SubstrateLayer.Industry]: 'Industry',
  [SubstrateLayer.Sustenance]: 'Sustenance',
  [SubstrateLayer.Culture]: 'Culture',
};

export class BuildMenu {
  private el: HTMLElement;
  private tooltip: HTMLElement;
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

    this.tooltip = document.createElement('div');
    Object.assign(this.tooltip.style, {
      position: 'absolute',
      right: '200px',
      top: '0',
      background: 'rgba(15, 15, 30, 0.95)',
      border: '1px solid rgba(212, 201, 168, 0.35)',
      borderRadius: '4px',
      padding: '10px 12px',
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      fontSize: '11px',
      color: '#d4c9a8',
      width: '240px',
      display: 'none',
      pointerEvents: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      zIndex: '60',
    });

    const container = document.getElementById('game-container')!;
    container.appendChild(this.el);
    container.appendChild(this.tooltip);
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

        btn.addEventListener('mouseenter', () => {
          if (available && this.selectedBuilding !== def.id) {
            btn.style.background = 'rgba(212, 201, 168, 0.15)';
          }
          this.showTooltip(def, btn);
        });
        btn.addEventListener('mouseleave', () => {
          if (available && this.selectedBuilding !== def.id) {
            btn.style.background = 'rgba(212, 201, 168, 0.05)';
          }
          this.tooltip.style.display = 'none';
        });

        if (available) {
          btn.addEventListener('click', () => {
            this.selectedBuilding = this.selectedBuilding === def.id ? null : def.id;
            this.onSelect(this.selectedBuilding);
            this.update(gameState);
          });
        }

        this.el.appendChild(btn);
      }
    }

    this.el.scrollTop = scroll;
  }

  private showTooltip(def: typeof BUILDING_DEFS[string], anchor: HTMLElement): void {
    const rect = anchor.getBoundingClientRect();
    const containerRect = document.getElementById('game-container')!.getBoundingClientRect();

    this.tooltip.style.top = `${rect.top - containerRect.top}px`;
    this.tooltip.style.display = 'block';

    let html = `
      <div style="font-weight:700;font-size:13px;margin-bottom:4px">${def.name}</div>
      <div style="color:#b0a88c;font-size:11px;line-height:1.4;margin-bottom:8px">${def.description}</div>
      <div style="font-size:10px;color:#8a7e65;margin-bottom:4px">Size: ${def.footprint.w}×${def.footprint.h}</div>
    `;

    const prodEntries = Object.entries(def.resourceProduction) as [ResourceType, number][];
    if (prodEntries.length > 0) {
      const parts = prodEntries.map(([res, amt]) => `${RES_ICONS[res]}+${amt} ${RESOURCE_LABELS[res]}`);
      html += `<div style="color:#88cc88;margin-bottom:2px">${parts.join(', ')}</div>`;
    }

    const consEntries = Object.entries(def.resourceConsumption) as [ResourceType, number][];
    if (consEntries.length > 0) {
      const parts = consEntries.map(([res, amt]) => `${RES_ICONS[res]}-${amt} ${RESOURCE_LABELS[res]}`);
      html += `<div style="color:#cc5555;margin-bottom:2px">${parts.join(', ')}</div>`;
    }

    if (def.emissions.length > 0) {
      const parts = def.emissions.map(e => `${LAYER_SHORT[e.layer]} +${e.strength} (r${e.radius})`);
      html += `<div style="color:#aaa;font-size:10px;margin-top:4px">Emits: ${parts.join(', ')}</div>`;
    }

    if (def.suppressions.length > 0) {
      const parts = def.suppressions.map(e => `${LAYER_SHORT[e.layer]} -${e.strength} (r${e.radius})`);
      html += `<div style="color:#cc8866;font-size:10px">Suppresses: ${parts.join(', ')}</div>`;
    }

    if (def.prerequisites.length > 0) {
      const names = def.prerequisites.map(p => BUILDING_DEFS[p]?.name ?? p);
      html += `<div style="color:#8a7e65;font-size:10px;margin-top:4px">Requires: ${names.join(', ')}</div>`;
    }

    this.tooltip.innerHTML = html;
  }

  deselect(): void {
    this.selectedBuilding = null;
    this.onSelect(null);
  }
}
