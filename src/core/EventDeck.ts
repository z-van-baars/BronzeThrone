import { EVENT_DEFS, EventDef, EventChoice, EventEffect } from '../data/events';
import { GameState } from './GameState';
import { ResourceType, SubstrateLayer, CitizenTier } from '../types';

interface DeckCard {
  def: EventDef;
  timesDrawn: number;
}

export interface ActiveEvent {
  def: EventDef;
  choices: EventChoice[];
}

export class EventDeck {
  private cards: DeckCard[] = [];
  private ticksSinceLastEvent = 0;
  private baseDrawInterval = 30;
  private drawIntervalDecay = 0.98;
  activeEvent: ActiveEvent | null = null;

  constructor() {
    this.shuffle();
  }

  private shuffle(): void {
    this.cards = EVENT_DEFS.map(def => ({ def, timesDrawn: 0 }));
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  tick(state: GameState): void {
    if (this.activeEvent) return;

    this.ticksSinceLastEvent++;

    const currentInterval = this.baseDrawInterval *
      Math.pow(this.drawIntervalDecay, state.tickCount / 10);
    const drawInterval = Math.max(10, currentInterval);

    if (this.ticksSinceLastEvent < drawInterval) return;

    this.tryDraw(state);
  }

  private tryDraw(state: GameState): void {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];

      if (card.timesDrawn >= card.def.maxRecurrences) continue;
      if (state.tickCount < card.def.minTick) continue;
      if (card.def.prerequisite && !card.def.prerequisite(state)) continue;

      this.cards.splice(i, 1);
      card.timesDrawn++;

      if (card.timesDrawn < card.def.maxRecurrences) {
        const reinsert = Math.floor(Math.random() * this.cards.length);
        this.cards.splice(reinsert, 0, card);
      }

      this.activeEvent = {
        def: card.def,
        choices: card.def.choices,
      };
      this.ticksSinceLastEvent = 0;
      return;
    }
  }

  resolveChoice(state: GameState, choiceIndex: number): string[] {
    if (!this.activeEvent) return [];

    const choice = this.activeEvent.choices[choiceIndex];
    if (!choice) return [];

    const messages: string[] = [];

    for (const effect of choice.effects) {
      messages.push(...applyEffect(state, effect));
    }

    this.activeEvent = null;
    return messages;
  }
}

function applyEffect(state: GameState, effect: EventEffect): string[] {
  const messages: string[] = [];

  switch (effect.type) {
    case 'resource': {
      state.resources[effect.resource] += effect.amount;
      if (state.resources[effect.resource] < 0) {
        state.resources[effect.resource] = 0;
      }
      const sign = effect.amount >= 0 ? '+' : '';
      messages.push(`${sign}${effect.amount} ${effect.resource}`);
      break;
    }
    case 'population': {
      const pop = state.population;
      if (effect.amount > 0) {
        pop.tiers[CitizenTier.Laborer] += effect.amount;
      } else {
        const loss = Math.abs(effect.amount);
        let remaining = loss;
        for (const tier of Object.values(CitizenTier)) {
          if (remaining <= 0) break;
          const remove = Math.min(pop.tiers[tier], remaining);
          pop.tiers[tier] -= remove;
          remaining -= remove;
        }
      }
      pop.totalPopulation = Object.values(pop.tiers).reduce((s, v) => s + v, 0);
      const sign = effect.amount >= 0 ? '+' : '';
      messages.push(`${sign}${effect.amount} population`);
      break;
    }
    case 'substrate_global': {
      const grid = state.grid;
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          grid.cells[y][x].substrate[effect.layer] += effect.amount;
          if (grid.cells[y][x].substrate[effect.layer] < 0) {
            grid.cells[y][x].substrate[effect.layer] = 0;
          }
        }
      }
      messages.push(`${effect.layer} substrate shifted by ${effect.amount}`);
      break;
    }
    case 'message': {
      messages.push(effect.text);
      break;
    }
  }

  return messages;
}
