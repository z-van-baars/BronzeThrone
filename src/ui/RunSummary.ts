import { GameState } from '../core/GameState';
import { CitizenTier } from '../types';

export class RunSummary {
  private overlay: HTMLElement;
  private card: HTMLElement;
  private onRestart: () => void;

  peakPopulation = 0;
  peakTick = 0;

  constructor(onRestart: () => void) {
    this.onRestart = onRestart;

    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position: 'absolute',
      top: '0', left: '0', right: '0', bottom: '0',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'none',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '200',
    });

    this.card = document.createElement('div');
    Object.assign(this.card.style, {
      background: 'linear-gradient(135deg, #2a2a3e, #1a1a28)',
      border: '1px solid rgba(212, 201, 168, 0.4)',
      borderRadius: '10px',
      padding: '32px',
      maxWidth: '500px',
      width: '90%',
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      color: '#d4c9a8',
      boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
      textAlign: 'center',
    });

    this.overlay.appendChild(this.card);
    document.getElementById('game-container')!.appendChild(this.overlay);
  }

  trackPeak(state: GameState): void {
    if (state.population.totalPopulation > this.peakPopulation) {
      this.peakPopulation = state.population.totalPopulation;
      this.peakTick = state.tickCount;
    }
  }

  show(state: GameState, reason: 'concede' | 'collapse'): void {
    this.overlay.style.display = 'flex';

    const collapsed = reason === 'collapse';
    const title = collapsed ? 'Your City Has Fallen' : 'You Have Conceded';
    const subtitle = collapsed
      ? 'The last inhabitants have fled. Only ruins remain.'
      : 'You chose to end this chapter of your city\'s story.';

    const tierNames: Record<CitizenTier, string> = {
      [CitizenTier.Laborer]: 'Laborers',
      [CitizenTier.Craftsman]: 'Craftsmen',
      [CitizenTier.Merchant]: 'Merchants',
      [CitizenTier.Priest]: 'Priests',
      [CitizenTier.Warrior]: 'Warriors',
      [CitizenTier.Elite]: 'Elites',
    };

    let popBreakdown = '';
    for (const tier of Object.values(CitizenTier)) {
      const count = Math.floor(state.population.tiers[tier]);
      if (count > 0) {
        popBreakdown += `<div style="font-size:12px">${tierNames[tier]}: ${count}</div>`;
      }
    }

    const score = Math.round(
      this.peakPopulation * 10 +
      state.tickCount * 2 +
      state.buildings.size * 5
    );

    this.card.innerHTML = `
      <div style="font-size:24px; font-weight:700; color:#e8e0cc; margin-bottom:8px">${title}</div>
      <div style="font-size:13px; color:#8a7e65; margin-bottom:24px">${subtitle}</div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; text-align:left; margin-bottom:24px">
        <div>
          <div style="font-size:10px; color:#8a7e65; text-transform:uppercase; letter-spacing:1px">Survived</div>
          <div style="font-size:20px; font-weight:600">${state.tickCount} ticks</div>
        </div>
        <div>
          <div style="font-size:10px; color:#8a7e65; text-transform:uppercase; letter-spacing:1px">Peak Population</div>
          <div style="font-size:20px; font-weight:600">${Math.floor(this.peakPopulation)}</div>
        </div>
        <div>
          <div style="font-size:10px; color:#8a7e65; text-transform:uppercase; letter-spacing:1px">Buildings</div>
          <div style="font-size:20px; font-weight:600">${state.buildings.size}</div>
        </div>
        <div>
          <div style="font-size:10px; color:#8a7e65; text-transform:uppercase; letter-spacing:1px">Score</div>
          <div style="font-size:20px; font-weight:600; color:#ffd700">${score}</div>
        </div>
      </div>

      ${popBreakdown ? `
        <div style="text-align:left; margin-bottom:24px">
          <div style="font-size:10px; color:#8a7e65; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px">Final Population</div>
          ${popBreakdown}
        </div>
      ` : ''}

      <div id="restart-btn" style="
        padding:12px 24px;
        cursor:pointer;
        background:rgba(212,201,168,0.15);
        border:1px solid rgba(212,201,168,0.4);
        border-radius:6px;
        font-size:14px;
        font-weight:600;
        color:#e8e0cc;
        display:inline-block;
        transition:background 0.15s;
      ">Start New Run</div>
    `;

    const btn = this.card.querySelector('#restart-btn')!;
    btn.addEventListener('mouseenter', () => {
      (btn as HTMLElement).style.background = 'rgba(212,201,168,0.3)';
    });
    btn.addEventListener('mouseleave', () => {
      (btn as HTMLElement).style.background = 'rgba(212,201,168,0.15)';
    });
    btn.addEventListener('click', () => {
      this.overlay.style.display = 'none';
      this.peakPopulation = 0;
      this.peakTick = 0;
      this.onRestart();
    });
  }

  get isVisible(): boolean {
    return this.overlay.style.display !== 'none';
  }
}
