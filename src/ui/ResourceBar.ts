import { GameState } from '../core/GameState';
import { ResourceType, RESOURCE_COLORS, RESOURCE_LABELS } from '../types';

export class ResourceBar {
  private el: HTMLElement;
  private items: Map<ResourceType, HTMLElement> = new Map();

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
  }

  update(gameState: GameState): void {
    for (const resType of Object.values(ResourceType)) {
      const label = this.items.get(resType);
      if (label) {
        const val = Math.floor(gameState.resources[resType]);
        label.textContent = `${RESOURCE_LABELS[resType]}: ${val}`;
      }
    }
  }
}
