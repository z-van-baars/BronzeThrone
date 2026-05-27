import { BUILDING_DEFS } from '../data/buildings';

export class RazeConfirm {
  private overlay: HTMLElement;
  private card: HTMLElement;
  private _isVisible = false;

  constructor() {
    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position: 'absolute',
      top: '0', left: '0', right: '0', bottom: '0',
      background: 'rgba(40, 10, 0, 0.5)',
      display: 'none',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '95',
    });

    this.card = document.createElement('div');
    Object.assign(this.card.style, {
      background: 'linear-gradient(135deg, #3a2020, #2a1515)',
      border: '1px solid rgba(255, 100, 50, 0.4)',
      borderRadius: '8px',
      padding: '24px',
      maxWidth: '380px',
      width: '85%',
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      color: '#d4c9a8',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(80,0,0,0.4)',
    });

    this.overlay.appendChild(this.card);
    document.getElementById('game-container')!.appendChild(this.overlay);
  }

  show(buildingDefId: string, onConfirm: () => void, onCancel: () => void): void {
    const def = BUILDING_DEFS[buildingDefId];
    if (!def) return;

    this._isVisible = true;
    this.overlay.style.display = 'flex';

    this.card.innerHTML = `
      <div style="font-size:20px;margin-bottom:8px">🔥</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;color:#ffccaa">Raze ${def.name}?</div>
      <div style="font-size:12px;color:#b0a88c;margin-bottom:20px;line-height:1.5">
        This will destroy the building permanently. The land will be cleared for new construction.
      </div>
      <div style="display:flex;gap:12px;justify-content:center">
        <div id="raze-cancel" style="
          padding:8px 20px;cursor:pointer;
          background:rgba(212,201,168,0.1);border:1px solid rgba(212,201,168,0.3);
          border-radius:4px;font-size:13px;color:#d4c9a8;transition:background 0.15s;
        ">Keep</div>
        <div id="raze-confirm" style="
          padding:8px 20px;cursor:pointer;
          background:rgba(200,50,30,0.2);border:1px solid rgba(200,50,30,0.5);
          border-radius:4px;font-size:13px;color:#ff8866;font-weight:600;transition:background 0.15s;
        ">Raze It</div>
      </div>
    `;

    const cancelBtn = this.card.querySelector('#raze-cancel')!;
    const confirmBtn = this.card.querySelector('#raze-confirm')!;

    cancelBtn.addEventListener('mouseenter', () => {
      (cancelBtn as HTMLElement).style.background = 'rgba(212,201,168,0.2)';
    });
    cancelBtn.addEventListener('mouseleave', () => {
      (cancelBtn as HTMLElement).style.background = 'rgba(212,201,168,0.1)';
    });
    confirmBtn.addEventListener('mouseenter', () => {
      (confirmBtn as HTMLElement).style.background = 'rgba(200,50,30,0.35)';
    });
    confirmBtn.addEventListener('mouseleave', () => {
      (confirmBtn as HTMLElement).style.background = 'rgba(200,50,30,0.2)';
    });

    cancelBtn.addEventListener('click', () => {
      this.hide();
      onCancel();
    });
    confirmBtn.addEventListener('click', () => {
      this.hide();
      onConfirm();
    });
  }

  private hide(): void {
    this._isVisible = false;
    this.overlay.style.display = 'none';
  }

  get isVisible(): boolean {
    return this._isVisible;
  }
}
