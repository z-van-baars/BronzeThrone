import { Threat, MilitarySystem, CombatResult } from '../core/Military';
import { GameState } from '../core/GameState';
import { recalculateSubstrate } from '../core/Substrate';

type Phase = 'warning' | 'choice' | 'result' | 'none';

export class MilitaryPopup {
  private overlay: HTMLElement;
  private card: HTMLElement;
  private phase: Phase = 'none';
  private onComplete: () => void;

  constructor(onComplete: () => void) {
    this.onComplete = onComplete;

    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position: 'absolute',
      top: '0', left: '0', right: '0', bottom: '0',
      background: 'rgba(40, 0, 0, 0.6)',
      display: 'none',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '101',
    });

    this.card = document.createElement('div');
    Object.assign(this.card.style, {
      background: 'linear-gradient(135deg, #3a1a1a, #2a1010)',
      border: '1px solid rgba(255, 80, 80, 0.4)',
      borderRadius: '8px',
      padding: '24px',
      maxWidth: '460px',
      width: '90%',
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      color: '#d4c9a8',
      boxShadow: '0 8px 32px rgba(100,0,0,0.5)',
    });

    this.overlay.appendChild(this.card);
    document.getElementById('game-container')!.appendChild(this.overlay);
  }

  showWarning(threat: Threat, military: MilitarySystem, state: GameState): void {
    this.phase = 'warning';
    this.overlay.style.display = 'flex';

    this.card.innerHTML = `
      <div style="font-size:10px; color:#ff6644; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px">
        THREAT APPROACHING
      </div>
      <div style="font-size:18px; font-weight:700; margin-bottom:12px; color:#ffccaa">
        ${threat.name}
      </div>
      <div style="font-size:13px; line-height:1.6; margin-bottom:12px; color:#b0a88c">
        ${threat.description}
      </div>
      <div style="font-size:12px; color:#ff8866; margin-bottom:16px">
        Estimated strength: ${threat.strength}
      </div>
      <div id="mil-choices"></div>
    `;

    const choices = this.card.querySelector('#mil-choices')!;

    const fightBtn = this.makeButton('Stand and fight', 'Rally your warriors and man the walls.');
    fightBtn.addEventListener('click', () => {
      const result = military.resolveCombat(state);
      recalculateSubstrate(state);
      this.showResult(result);
    });
    choices.appendChild(fightBtn);

    const bribeBtn = this.makeButton('Offer tribute', 'Pay them to go away.');
    bribeBtn.addEventListener('click', () => {
      const cost = Math.round(threat.strength * 0.4);
      const foodCost = Math.round(threat.strength * 0.2);
      state.resources.wealth = Math.max(0, state.resources.wealth - cost);
      state.resources.food = Math.max(0, state.resources.food - foodCost);
      military.activeThreat = null;
      this.showResult({
        victory: true,
        narrative: `You paid off the ${threat.name} with ${cost} wealth and ${foodCost} food. They left... for now.`,
        casualties: 0,
        buildingsDestroyed: 0,
        resourcesLost: { wealth: cost, food: foodCost },
      });
    });
    choices.appendChild(bribeBtn);
  }

  private showResult(result: CombatResult): void {
    this.phase = 'result';

    const color = result.victory ? '#88cc88' : '#cc5555';
    const header = result.victory ? 'VICTORY' : 'DEFEAT';

    let details = '';
    if (result.casualties > 0) details += `<div>Casualties: ${result.casualties}</div>`;
    if (result.buildingsDestroyed > 0) details += `<div>Buildings destroyed: ${result.buildingsDestroyed}</div>`;
    for (const [res, amt] of Object.entries(result.resourcesLost)) {
      if ((amt as number) > 0) details += `<div>${res} lost: ${amt}</div>`;
    }

    this.card.innerHTML = `
      <div style="font-size:10px; color:${color}; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px">
        ${header}
      </div>
      <div style="font-size:13px; line-height:1.6; margin-bottom:12px; color:#b0a88c">
        ${result.narrative}
      </div>
      ${details ? `<div style="font-size:12px; color:#8a7e65; margin-bottom:16px">${details}</div>` : ''}
      <div id="mil-dismiss" style="
        padding:8px 16px;
        text-align:center;
        cursor:pointer;
        background:rgba(212,201,168,0.15);
        border:1px solid rgba(212,201,168,0.3);
        border-radius:4px;
        font-size:12px;
        color:#d4c9a8;
      ">Continue</div>
    `;

    this.card.querySelector('#mil-dismiss')!.addEventListener('click', () => {
      this.overlay.style.display = 'none';
      this.phase = 'none';
      this.onComplete();
    });
  }

  private makeButton(label: string, desc: string): HTMLElement {
    const btn = document.createElement('div');
    Object.assign(btn.style, {
      padding: '10px 14px',
      marginBottom: '8px',
      borderRadius: '4px',
      cursor: 'pointer',
      background: 'rgba(255, 100, 80, 0.08)',
      border: '1px solid rgba(255, 100, 80, 0.2)',
      transition: 'all 0.15s',
    });

    btn.innerHTML = `
      <div style="font-weight:600; font-size:13px; color:#ffccaa">${label}</div>
      <div style="font-size:11px; color:#8a7e65; margin-top:2px">${desc}</div>
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(255, 100, 80, 0.18)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(255, 100, 80, 0.08)';
    });

    return btn;
  }

  get isVisible(): boolean {
    return this.phase !== 'none';
  }
}
