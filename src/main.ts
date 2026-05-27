import { GameState } from './core/GameState';
import { Renderer } from './render/Renderer';
import { GridRenderer } from './render/GridRenderer';
import { InfoPanel } from './ui/InfoPanel';

async function main() {
  const container = document.getElementById('game-container')!;
  const gameState = new GameState();

  const renderer = new Renderer();
  await renderer.init(container, gameState);

  const gridRenderer = new GridRenderer();
  renderer.worldContainer.addChild(gridRenderer.container);

  gridRenderer.drawTerrain(gameState);
  gridRenderer.drawGridLines(gameState);

  const infoPanel = new InfoPanel();

  renderer.app.canvas.addEventListener('click', (e: MouseEvent) => {
    const { gx, gy } = renderer.screenToGrid(e.clientX, e.clientY);
    if (gameState.grid.inBounds(gx, gy)) {
      gameState.selectedCell = { x: gx, y: gy };
    } else {
      gameState.selectedCell = null;
    }
    gridRenderer.updateSelection(gameState);
    infoPanel.update(gameState);
  });
}

main().catch(console.error);
