import { Container, Graphics } from 'pixi.js';
import { GameState } from '../core/GameState';
import { BUILDING_DEFS } from '../data/buildings';
import { CELL_SIZE } from '../core/Config';

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

      g.rect(px + 1, py + 1, pw - 2, ph - 2);
      g.fill(def.color);

      g.setStrokeStyle({ width: 1, color: 0x000000, alpha: 0.4 });
      g.rect(px + 1, py + 1, pw - 2, ph - 2);
      g.stroke();
    }
  }
}
