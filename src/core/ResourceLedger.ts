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

  getBreakdown(resource: ResourceType): { source: string; amount: number }[] {
    const bySource = new Map<string, number>();
    for (const e of this.entries) {
      if (e.resource !== resource) continue;
      bySource.set(e.source, (bySource.get(e.source) ?? 0) + e.amount);
    }

    return [...bySource.entries()]
      .map(([source, amount]) => ({ source, amount }))
      .filter(e => Math.abs(e.amount) >= 0.01)
      .sort((a, b) => b.amount - a.amount);
  }
}
