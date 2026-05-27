import { GameState } from '../core/GameState';
import { ResourceType, CitizenTier, RESOURCE_COLORS, RESOURCE_LABELS } from '../types';

export class ResourceBar {
  private el: HTMLElement;
  private items: Map<ResourceType, { label: HTMLElement; tooltip: HTMLElement; container: HTMLElement }> = new Map();
  private popLabel: HTMLElement;
  private tickLabel: HTMLElement;

  constructor() {
    this.el = document.getElementById('resource-bar')!;

    for (const resType of Object.values(ResourceType)) {
      const container = document.createElement('div');
      container.className = 'resource-item';
      container.style.position = 'relative';

      const icon = document.createElement('div');
      icon.className = 'resource-icon';
      icon.style.background = RESOURCE_COLORS[resType];

      const label = document.createElement('span');
      label.textContent = `${RESOURCE_LABELS[resType]}: 0`;

      const tooltip = document.createElement('div');
      Object.assign(tooltip.style, {
        position: 'absolute',
        top: '32px',
        left: '0',
        minWidth: '200px',
        background: 'rgba(15, 15, 30, 0.95)',
        border: '1px solid rgba(212, 201, 168, 0.35)',
        borderRadius: '4px',
        padding: '8px 10px',
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        fontSize: '11px',
        color: '#d4c9a8',
        zIndex: '50',
        display: 'none',
        pointerEvents: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        whiteSpace: 'nowrap',
      });

      container.appendChild(icon);
      container.appendChild(label);
      container.appendChild(tooltip);

      container.addEventListener('mouseenter', () => {
        tooltip.style.display = 'block';
      });
      container.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });

      this.el.appendChild(container);
      this.items.set(resType, { label, tooltip, container });
    }

    const sep = document.createElement('div');
    sep.style.borderLeft = '1px solid rgba(212,201,168,0.3)';
    sep.style.height = '20px';
    this.el.appendChild(sep);

    const popItem = document.createElement('div');
    popItem.className = 'resource-item';
    const popIcon = document.createElement('div');
    popIcon.className = 'resource-icon';
    popIcon.style.background = '#e8e0cc';
    this.popLabel = document.createElement('span');
    this.popLabel.textContent = 'Pop: 0';
    popItem.appendChild(popIcon);
    popItem.appendChild(this.popLabel);
    this.el.appendChild(popItem);

    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    this.el.appendChild(spacer);

    this.tickLabel = document.createElement('span');
    this.tickLabel.style.color = '#8a7e65';
    this.tickLabel.style.fontSize = '11px';
    this.el.appendChild(this.tickLabel);
  }

  update(gameState: GameState): void {
    const ledger = gameState.ledger;

    for (const resType of Object.values(ResourceType)) {
      const item = this.items.get(resType);
      if (!item) continue;

      const val = Math.floor(gameState.resources[resType]);
      const net = ledger.getNet(resType);
      const netStr = net >= 0 ? `+${net.toFixed(1)}` : net.toFixed(1);
      const netColor = net > 0 ? '#88cc88' : net < 0 ? '#cc5555' : '#8a7e65';

      item.label.innerHTML =
        `${RESOURCE_LABELS[resType]}: ${val} <span style="color:${netColor};font-size:11px">(${netStr})</span>`;

      const breakdown = ledger.getBreakdown(resType);
      if (breakdown.length === 0) {
        item.tooltip.innerHTML = `
          <div style="font-weight:600;margin-bottom:4px;color:#e8e0cc">${RESOURCE_LABELS[resType]}</div>
          <div style="color:#8a7e65">No activity this tick</div>
        `;
      } else {
        let income = 0;
        let expense = 0;
        const lines: string[] = [];

        for (const entry of breakdown) {
          if (entry.amount >= 0) income += entry.amount;
          else expense += entry.amount;

          const sign = entry.amount >= 0 ? '+' : '';
          const color = entry.amount >= 0 ? '#88cc88' : '#cc5555';
          lines.push(
            `<div style="display:flex;justify-content:space-between;gap:16px">` +
            `<span>${entry.source}</span>` +
            `<span style="color:${color}">${sign}${entry.amount.toFixed(1)}</span></div>`
          );
        }

        const summaryColor = (income + expense) >= 0 ? '#88cc88' : '#cc5555';
        const summarySign = (income + expense) >= 0 ? '+' : '';

        item.tooltip.innerHTML = `
          <div style="font-weight:600;margin-bottom:6px;color:#e8e0cc">${RESOURCE_LABELS[resType]}</div>
          <div style="margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid rgba(212,201,168,0.15)">
            <div style="display:flex;justify-content:space-between">
              <span style="color:#8a7e65">Income</span>
              <span style="color:#88cc88">+${income.toFixed(1)}</span>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="color:#8a7e65">Expense</span>
              <span style="color:#cc5555">${expense.toFixed(1)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-weight:600;margin-top:2px">
              <span>Net</span>
              <span style="color:${summaryColor}">${summarySign}${(income + expense).toFixed(1)}</span>
            </div>
          </div>
          ${lines.join('')}
        `;
      }
    }

    const totalPop = Math.floor(gameState.population.totalPopulation);
    this.popLabel.textContent = `Pop: ${totalPop}`;
    this.tickLabel.textContent = `Tick ${gameState.tickCount}`;
  }
}
