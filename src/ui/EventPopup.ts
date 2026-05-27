import { ActiveEvent, EventDeck } from '../core/EventDeck';
import { GameState } from '../core/GameState';

export class EventPopup {
  private overlay: HTMLElement;
  private card: HTMLElement;
  private onResolve: () => void;

  constructor(onResolve: () => void) {
    this.onResolve = onResolve;

    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position: 'absolute',
      top: '0', left: '0', right: '0', bottom: '0',
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'none',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '100',
    });

    this.card = document.createElement('div');
    Object.assign(this.card.style, {
      background: 'linear-gradient(135deg, #2a2a3e, #1e1e30)',
      border: '1px solid rgba(212, 201, 168, 0.4)',
      borderRadius: '8px',
      padding: '24px',
      maxWidth: '460px',
      width: '90%',
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      color: '#d4c9a8',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    });

    this.overlay.appendChild(this.card);
    document.getElementById('game-container')!.appendChild(this.overlay);
  }

  show(event: ActiveEvent, deck: EventDeck, state: GameState): void {
    this.overlay.style.display = 'flex';

    const tierColors = { early: '#88bb88', mid: '#bbbb44', late: '#cc5555' };
    const tierColor = tierColors[event.def.tier];

    let html = `
      <div style="font-size:10px; color:${tierColor}; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px">
        ${event.def.tier} event
      </div>
      <div style="font-size:18px; font-weight:700; margin-bottom:12px; color:#e8e0cc">
        ${event.def.title}
      </div>
      <div style="font-size:13px; line-height:1.6; margin-bottom:20px; color:#b0a88c">
        ${event.def.description}
      </div>
      <div id="event-choices"></div>
    `;

    this.card.innerHTML = html;
    const choicesContainer = this.card.querySelector('#event-choices')!;

    event.choices.forEach((choice, idx) => {
      const btn = document.createElement('div');
      Object.assign(btn.style, {
        padding: '10px 14px',
        marginBottom: '8px',
        borderRadius: '4px',
        cursor: 'pointer',
        background: 'rgba(212, 201, 168, 0.08)',
        border: '1px solid rgba(212, 201, 168, 0.2)',
        transition: 'all 0.15s',
      });

      btn.innerHTML = `
        <div style="font-weight:600; font-size:13px; color:#e8e0cc">${choice.label}</div>
        <div style="font-size:11px; color:#8a7e65; margin-top:2px">${choice.description}</div>
      `;

      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(212, 201, 168, 0.18)';
        btn.style.borderColor = 'rgba(212, 201, 168, 0.4)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(212, 201, 168, 0.08)';
        btn.style.borderColor = 'rgba(212, 201, 168, 0.2)';
      });

      btn.addEventListener('click', () => {
        const messages = deck.resolveChoice(state, idx);
        this.showResult(choice.label, messages);
      });

      choicesContainer.appendChild(btn);
    });
  }

  private showResult(choiceLabel: string, messages: string[]): void {
    const resultsHtml = messages.length > 0
      ? messages.map(m => `<div style="font-size:12px; color:#b0a88c; margin-bottom:2px">${m}</div>`).join('')
      : '<div style="font-size:12px; color:#8a7e65">No immediate effects.</div>';

    this.card.innerHTML = `
      <div style="font-size:12px; color:#8a7e65; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px">Result</div>
      <div style="font-size:14px; font-weight:600; margin-bottom:12px; color:#e8e0cc">You chose: ${choiceLabel}</div>
      <div style="margin-bottom:16px">${resultsHtml}</div>
      <div id="event-dismiss" style="
        padding:8px 16px;
        text-align:center;
        cursor:pointer;
        background:rgba(212,201,168,0.15);
        border:1px solid rgba(212,201,168,0.3);
        border-radius:4px;
        font-size:12px;
        color:#d4c9a8;
        transition:background 0.15s;
      ">Continue</div>
    `;

    const dismiss = this.card.querySelector('#event-dismiss')!;
    dismiss.addEventListener('mouseenter', () => {
      (dismiss as HTMLElement).style.background = 'rgba(212,201,168,0.25)';
    });
    dismiss.addEventListener('mouseleave', () => {
      (dismiss as HTMLElement).style.background = 'rgba(212,201,168,0.15)';
    });
    dismiss.addEventListener('click', () => {
      this.overlay.style.display = 'none';
      this.onResolve();
    });
  }

  get isVisible(): boolean {
    return this.overlay.style.display !== 'none';
  }
}
