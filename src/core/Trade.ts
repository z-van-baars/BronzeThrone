import { GameState } from './GameState';
import { ResourceType } from '../types';

export interface TradePartner {
  name: string;
  disposition: 'friendly' | 'neutral' | 'hostile';
  exports: ResourceType[];
  imports: ResourceType[];
}

export interface TradeDeal {
  partnerId: number;
  give: { resource: ResourceType; amount: number };
  receive: { resource: ResourceType; amount: number };
  active: boolean;
}

const MARKET_BUY_MULTIPLIER = 3;
const MARKET_SELL_MULTIPLIER = 0.3;

const PARTNER_NAMES = [
  'Ugarit', 'Byblos', 'Knossos', 'Hattusa',
  'Mycenae', 'Sidon', 'Akkad', 'Elam',
];

export class TradeSystem {
  partners: TradePartner[] = [];
  deals: TradeDeal[] = [];
  hasMarket = false;

  constructor() {
    this.generatePartners();
  }

  private generatePartners(): void {
    const shuffled = [...PARTNER_NAMES].sort(() => Math.random() - 0.5);
    const allResources = Object.values(ResourceType);

    for (let i = 0; i < 4; i++) {
      const dispositions: ('friendly' | 'neutral' | 'hostile')[] = ['friendly', 'neutral', 'neutral', 'hostile'];
      const exports = [allResources[Math.floor(Math.random() * allResources.length)]];
      const imports = [allResources[Math.floor(Math.random() * allResources.length)]];

      this.partners.push({
        name: shuffled[i],
        disposition: dispositions[i],
        exports,
        imports,
      });
    }
  }

  tick(state: GameState): void {
    this.hasMarket = [...state.buildings.values()].some(b => b.defId === 'market');

    for (const deal of this.deals) {
      if (!deal.active) continue;

      const partner = this.partners[deal.partnerId];
      if (!partner || partner.disposition === 'hostile') {
        deal.active = false;
        continue;
      }

      if (state.resources[deal.give.resource] >= deal.give.amount) {
        state.resources[deal.give.resource] -= deal.give.amount;
        state.resources[deal.receive.resource] += deal.receive.amount;
      }
    }
  }

  proposeDeal(partnerId: number, give: { resource: ResourceType; amount: number }, receive: { resource: ResourceType; amount: number }): boolean {
    const partner = this.partners[partnerId];
    if (!partner || partner.disposition === 'hostile') return false;

    const acceptChance = partner.disposition === 'friendly' ? 0.8 : 0.5;
    if (Math.random() > acceptChance) return false;

    this.deals.push({ partnerId, give, receive, active: true });
    return true;
  }

  cancelDeal(index: number): void {
    if (this.deals[index]) {
      this.deals[index].active = false;
    }
  }

  marketBuy(state: GameState, resource: ResourceType, amount: number): boolean {
    if (!this.hasMarket) return false;
    const cost = amount * MARKET_BUY_MULTIPLIER;
    if (state.resources[ResourceType.Wealth] < cost) return false;

    state.resources[ResourceType.Wealth] -= cost;
    state.resources[resource] += amount;
    return true;
  }

  marketSell(state: GameState, resource: ResourceType, amount: number): boolean {
    if (!this.hasMarket) return false;
    if (state.resources[resource] < amount) return false;

    state.resources[resource] -= amount;
    state.resources[ResourceType.Wealth] += Math.floor(amount * MARKET_SELL_MULTIPLIER);
    return true;
  }
}
