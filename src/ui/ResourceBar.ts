import { GameState } from '../core/GameState';
import { ResourceType, CitizenTier, RESOURCE_COLORS, RESOURCE_LABELS } from '../types';

export class ResourceBar {
  private el: HTMLElement;
  private items: Map<ResourceType, HTMLElement> = new Map();
  private popLabel: HTMLElement;
  private tickLabel: HTMLElement;

  constructor() {
    this.el = document.getElementById('resource-bar')!;

    for (const resType of Object.values(ResourceType)) {
      const item = document.createElement('div');
      item.className = 'resource-item';

      const icon = document.createElement('div');
      icon.className = 'resource-icon';
      icon.style.background = RESOURCE_COLORS[resType];

      const label = document.createElement('span');
      label.textContent = `${RESOURCE_LABELS[resType]}: 0`;

      item.appendChild(icon);
      item.appendChild(label);
      this.el.appendChild(item);
      this.items.set(resType, label);
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
    for (const resType of Object.values(ResourceType)) {
      const label = this.items.get(resType);
      if (label) {
        const val = Math.floor(gameState.resources[resType]);
        label.textContent = `${RESOURCE_LABELS[resType]}: ${val}`;
      }
    }

    const totalPop = Math.floor(gameState.population.totalPopulation);
    this.popLabel.textContent = `Pop: ${totalPop}`;
    this.tickLabel.textContent = `Tick ${gameState.tickCount}`;
  }
}
