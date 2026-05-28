import { Container, Graphics } from 'pixi.js';
import { GameState } from '../core/GameState';
import { BUILDING_DEFS } from '../data/buildings';
import { canPlaceBuilding } from '../core/Building';
import { CELL_SIZE } from '../core/Config';
import { TERRAIN_PASSABLE, SUBSTRATE_COLORS } from '../types';

export class BlueprintPreview {
  container: Container;
  private graphics: Graphics;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
  }

  draw(gameState: GameState, defId: string | null, hoverX: number, hoverY: number): void {
    const g = this.graphics;
    g.clear();

    if (!defId) return;
    const def = BUILDING_DEFS[defId];
    if (!def) return;

    if (!gameState.grid.inBounds(hoverX, hoverY)) return;

    const check = canPlaceBuilding(gameState, defId, hoverX, hoverY);
    const validColor = check.ok ? 0x44cc44 : 0xcc4444;
    const validAlpha = check.ok ? 0.25 : 0.2;

    for (let dy = 0; dy < def.footprint.h; dy++) {
      for (let dx = 0; dx < def.footprint.w; dx++) {
        const cx = hoverX + dx;
        const cy = hoverY + dy;
        const px = cx * CELL_SIZE;
        const py = cy * CELL_SIZE;

        const cell = gameState.grid.getCell(cx, cy);
        let cellColor = validColor;
        if (cell && (!TERRAIN_PASSABLE[cell.terrain] || cell.buildingId)) {
          cellColor = 0xcc4444;
        }

        g.rect(px, py, CELL_SIZE, CELL_SIZE);
        g.fill({ color: cellColor, alpha: validAlpha });
      }
    }

    const fpx = hoverX * CELL_SIZE;
    const fpy = hoverY * CELL_SIZE;
    const fpw = def.footprint.w * CELL_SIZE;
    const fph = def.footprint.h * CELL_SIZE;
    g.setStrokeStyle({ width: 2, color: validColor, alpha: 0.7 });
    g.rect(fpx, fpy, fpw, fph);
    g.stroke();

    const centerX = (hoverX + def.footprint.w / 2) * CELL_SIZE;
    const centerY = (hoverY + def.footprint.h / 2) * CELL_SIZE;

    for (const emission of def.emissions) {
      const radiusPx = emission.radius * CELL_SIZE;
      const color = SUBSTRATE_COLORS[emission.layer];
      g.setStrokeStyle({ width: 1, color, alpha: 0.3 });
      g.circle(centerX, centerY, radiusPx);
      g.stroke();
    }

    for (const suppression of def.suppressions) {
      const radiusPx = suppression.radius * CELL_SIZE;
      g.setStrokeStyle({ width: 1, color: 0xff4444, alpha: 0.15 });
      g.circle(centerX, centerY, radiusPx);
      g.stroke();
    }
  }
}
