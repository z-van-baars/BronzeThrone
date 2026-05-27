import { Container, Graphics } from 'pixi.js';
import { GameState } from '../core/GameState';
import { CELL_SIZE } from '../core/Config';
import { SubstrateLayer, SUBSTRATE_COLORS, TERRAIN_PASSABLE } from '../types';

const DEV_THRESHOLD = 1.5;

const LAYER_PRIORITY: SubstrateLayer[] = [
  SubstrateLayer.Sustenance,
  SubstrateLayer.Industry,
  SubstrateLayer.Prosperity,
  SubstrateLayer.Security,
  SubstrateLayer.Piety,
  SubstrateLayer.Culture,
];

export class PopulationRenderer {
  container: Container;
  private graphics: Graphics;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
  }

  draw(gameState: GameState): void {
    const g = this.graphics;
    g.clear();

    const grid = gameState.grid;
    const totalPop = gameState.population.totalPopulation;

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];
        if (!TERRAIN_PASSABLE[cell.terrain] || cell.buildingId) continue;

        let dominant: SubstrateLayer | null = null;
        let dominantVal = 0;

        for (const layer of LAYER_PRIORITY) {
          const val = cell.substrate[layer];
          if (val > DEV_THRESHOLD && val > dominantVal) {
            dominant = layer;
            dominantVal = val;
          }
        }

        if (!dominant) continue;

        const intensity = Math.min(1, (dominantVal - DEV_THRESHOLD) / 6);
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;
        const color = SUBSTRATE_COLORS[dominant];

        // Subtle terrain tint showing substrate influence
        g.rect(px, py, CELL_SIZE, CELL_SIZE);
        g.fill({ color, alpha: 0.08 + intensity * 0.12 });

        // Development indicators by type
        const seed = x * 73 + y * 137;

        if (dominant === SubstrateLayer.Sustenance && totalPop > 0) {
          this.drawHuts(g, px, py, intensity, seed);
        } else if (dominant === SubstrateLayer.Industry) {
          this.drawIndustry(g, px, py, intensity, seed);
        } else if (dominant === SubstrateLayer.Prosperity) {
          this.drawProsperity(g, px, py, intensity, seed);
        } else if (dominant === SubstrateLayer.Security) {
          this.drawSecurity(g, px, py, intensity, seed);
        } else if (dominant === SubstrateLayer.Piety) {
          this.drawPiety(g, px, py, intensity, seed);
        } else if (dominant === SubstrateLayer.Culture) {
          this.drawCulture(g, px, py, intensity, seed);
        }

        // Secondary substrate influence shown as corner pip
        for (const layer of LAYER_PRIORITY) {
          if (layer === dominant) continue;
          const val = cell.substrate[layer];
          if (val > DEV_THRESHOLD * 1.5) {
            const secColor = SUBSTRATE_COLORS[layer];
            const corner = LAYER_PRIORITY.indexOf(layer) % 4;
            const cx = px + (corner % 2 === 0 ? 2 : CELL_SIZE - 4);
            const cy = py + (corner < 2 ? 2 : CELL_SIZE - 4);
            g.circle(cx, cy, 1.2);
            g.fill({ color: secColor, alpha: 0.5 });
          }
        }
      }
    }
  }

  // Small triangular hut shapes
  private drawHuts(g: Graphics, px: number, py: number, intensity: number, seed: number): void {
    const count = Math.ceil(intensity * 3);
    for (let i = 0; i < count; i++) {
      const hash = (seed + i * 47) & 0xffff;
      const hx = px + (hash % (CELL_SIZE - 6)) + 3;
      const hy = py + ((hash >> 4) % (CELL_SIZE - 6)) + 3;
      const size = 2 + intensity;

      g.moveTo(hx, hy);
      g.lineTo(hx - size, hy + size);
      g.lineTo(hx + size, hy + size);
      g.closePath();
      g.fill({ color: 0xc9a86c, alpha: 0.5 + intensity * 0.3 });
    }
  }

  // Small gear/diamond shapes for industry
  private drawIndustry(g: Graphics, px: number, py: number, intensity: number, seed: number): void {
    const count = Math.ceil(intensity * 2);
    for (let i = 0; i < count; i++) {
      const hash = (seed + i * 53) & 0xffff;
      const ix = px + (hash % (CELL_SIZE - 4)) + 2;
      const iy = py + ((hash >> 5) % (CELL_SIZE - 4)) + 2;
      const s = 1.5 + intensity;

      g.moveTo(ix, iy - s);
      g.lineTo(ix + s, iy);
      g.lineTo(ix, iy + s);
      g.lineTo(ix - s, iy);
      g.closePath();
      g.fill({ color: 0xff8c00, alpha: 0.4 + intensity * 0.3 });
    }
  }

  // Small circles for prosperity/coins
  private drawProsperity(g: Graphics, px: number, py: number, intensity: number, seed: number): void {
    const count = Math.ceil(intensity * 2);
    for (let i = 0; i < count; i++) {
      const hash = (seed + i * 61) & 0xffff;
      const cx = px + (hash % (CELL_SIZE - 4)) + 2;
      const cy = py + ((hash >> 3) % (CELL_SIZE - 4)) + 2;

      g.circle(cx, cy, 1.5 + intensity * 0.5);
      g.fill({ color: 0xffd700, alpha: 0.4 + intensity * 0.3 });
    }
  }

  // Small cross/plus for security
  private drawSecurity(g: Graphics, px: number, py: number, intensity: number, seed: number): void {
    const hash = (seed + 41) & 0xffff;
    const sx = px + (hash % (CELL_SIZE - 6)) + 3;
    const sy = py + ((hash >> 4) % (CELL_SIZE - 6)) + 3;
    const s = 1.5 + intensity;
    const alpha = 0.4 + intensity * 0.3;

    g.rect(sx - s, sy - 0.5, s * 2, 1);
    g.fill({ color: 0xff4444, alpha });
    g.rect(sx - 0.5, sy - s, 1, s * 2);
    g.fill({ color: 0xff4444, alpha });
  }

  // Small triangle/obelisk for piety
  private drawPiety(g: Graphics, px: number, py: number, intensity: number, seed: number): void {
    const hash = (seed + 37) & 0xffff;
    const ox = px + (hash % (CELL_SIZE - 4)) + 2;
    const oy = py + ((hash >> 3) % (CELL_SIZE - 6)) + 3;
    const h = 3 + intensity * 2;

    g.moveTo(ox, oy - h);
    g.lineTo(ox - 1.5, oy);
    g.lineTo(ox + 1.5, oy);
    g.closePath();
    g.fill({ color: 0xcc66ff, alpha: 0.4 + intensity * 0.3 });
  }

  // Small square/scroll for culture
  private drawCulture(g: Graphics, px: number, py: number, intensity: number, seed: number): void {
    const hash = (seed + 29) & 0xffff;
    const cx = px + (hash % (CELL_SIZE - 6)) + 3;
    const cy = py + ((hash >> 4) % (CELL_SIZE - 6)) + 3;
    const s = 1.5 + intensity;

    g.rect(cx - s, cy - s * 0.7, s * 2, s * 1.4);
    g.fill({ color: 0x4488ff, alpha: 0.4 + intensity * 0.3 });
  }
}
