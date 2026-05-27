import { SubstrateLayer, SUBSTRATE_COLORS } from '../types';

function hexToCSS(hex: number): string {
  return '#' + hex.toString(16).padStart(6, '0');
}

export class LayerToggle {
  private el: HTMLElement;
  private activeLayer: SubstrateLayer | null = null;
  private onToggle: (layer: SubstrateLayer) => void;

  constructor(onToggle: (layer: SubstrateLayer) => void) {
    this.onToggle = onToggle;

    this.el = document.createElement('div');
    Object.assign(this.el.style, {
      position: 'absolute',
      bottom: '12px',
      right: '12px',
      display: 'flex',
      gap: '4px',
      flexDirection: 'column',
    });

    const LAYER_LABELS: Record<SubstrateLayer, string> = {
      [SubstrateLayer.Security]: 'SEC',
      [SubstrateLayer.Prosperity]: 'PRO',
      [SubstrateLayer.Piety]: 'PIE',
      [SubstrateLayer.Industry]: 'IND',
      [SubstrateLayer.Sustenance]: 'SUS',
      [SubstrateLayer.Culture]: 'CUL',
    };

    for (const layer of Object.values(SubstrateLayer)) {
      const btn = document.createElement('button');
      btn.textContent = LAYER_LABELS[layer];
      btn.dataset.layer = layer;
      Object.assign(btn.style, {
        background: 'rgba(20, 20, 40, 0.85)',
        color: hexToCSS(SUBSTRATE_COLORS[layer]),
        border: `1px solid ${hexToCSS(SUBSTRATE_COLORS[layer])}44`,
        borderRadius: '3px',
        padding: '4px 8px',
        cursor: 'pointer',
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        transition: 'background 0.15s',
      });

      btn.addEventListener('click', () => {
        this.activeLayer = this.activeLayer === layer ? null : layer;
        this.onToggle(layer);
        this.updateStyles();
      });

      this.el.appendChild(btn);
    }

    document.getElementById('game-container')!.appendChild(this.el);
  }

  private updateStyles(): void {
    const buttons = this.el.querySelectorAll('button');
    buttons.forEach(btn => {
      const layer = btn.dataset.layer as SubstrateLayer;
      const isActive = this.activeLayer === layer;
      const color = hexToCSS(SUBSTRATE_COLORS[layer]);
      btn.style.background = isActive
        ? `${color}33`
        : 'rgba(20, 20, 40, 0.85)';
      btn.style.borderColor = isActive
        ? color
        : `${color}44`;
    });
  }
}
