import { Container, Graphics } from 'pixi.js';
import { GameState } from '../core/GameState';
import { BUILDING_DEFS } from '../data/buildings';
import { CELL_SIZE } from '../core/Config';

function adjustBrightness(color: number, factor: number): number {
  const r = Math.min(255, Math.round(((color >> 16) & 0xff) * factor));
  const g = Math.min(255, Math.round(((color >> 8) & 0xff) * factor));
  const b = Math.min(255, Math.round((color & 0xff) * factor));
  return (r << 16) | (g << 8) | b;
}

export class BuildingRenderer {
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

    for (const building of gameState.buildings.values()) {
      const def = BUILDING_DEFS[building.defId];
      if (!def) continue;

      const px = building.x * CELL_SIZE;
      const py = building.y * CELL_SIZE;
      const pw = def.footprint.w * CELL_SIZE;
      const ph = def.footprint.h * CELL_SIZE;

      const brightness = 0.6 + building.intensity * 0.5;
      const color = adjustBrightness(def.color, brightness);

      g.rect(px + 1, py + 1, pw - 2, ph - 2);
      g.fill(color);

      g.setStrokeStyle({ width: 1, color: 0x000000, alpha: 0.4 });
      g.rect(px + 1, py + 1, pw - 2, ph - 2);
      g.stroke();

      if (building.intensity > 1.0) {
        g.setStrokeStyle({ width: 1, color: 0xff8844, alpha: 0.6 });
        g.rect(px + 2, py + 2, pw - 4, ph - 4);
        g.stroke();
      }
    }
  }
}
