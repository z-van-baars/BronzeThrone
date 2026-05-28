import { ResourceType } from '../types';

export interface LedgerEntry {
  source: string;
  resource: ResourceType;
  amount: number;
}

export class ResourceLedger {
  private entries: LedgerEntry[] = [];

  record(source: string, resource: ResourceType, amount: number): void {
    if (Math.abs(amount) < 0.001) return;
    this.entries.push({ source, resource, amount });
  }

  clear(): void {
    this.entries.length = 0;
  }

  getNet(resource: ResourceType): number {
    let net = 0;
    for (const e of this.entries) {
      if (e.resource === resource) net += e.amount;
    }
    return net;
  }

  getBreakdown(resource: ResourceType): { source: string; amount: number; count: number }[] {
    const bySource = new Map<string, { amount: number; count: number }>();
    for (const e of this.entries) {
      if (e.resource !== resource) continue;
      const existing = bySource.get(e.source);
      if (existing) {
        existing.amount += e.amount;
        existing.count++;
      } else {
        bySource.set(e.source, { amount: e.amount, count: 1 });
      }
    }

    return [...bySource.entries()]
      .map(([source, data]) => ({ source, amount: data.amount, count: data.count }))
      .filter(e => Math.abs(e.amount) >= 0.01)
      .sort((a, b) => b.amount - a.amount);
  }
}
