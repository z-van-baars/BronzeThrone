import { GameState } from './core/GameState';
import { placeBuilding } from './core/Building';
import { recalculateSubstrate } from './core/Substrate';
import { processResourceTick } from './core/Resource';
import { processPopulationTick } from './core/Population';
import { TICK_INTERVAL_MS } from './core/Config';
import { Renderer } from './render/Renderer';
import { GridRenderer } from './render/GridRenderer';
import { BuildingRenderer } from './render/BuildingRenderer';
import { SubstrateOverlay } from './render/SubstrateOverlay';
import { PopulationRenderer } from './render/PopulationRenderer';
import { InfoPanel } from './ui/InfoPanel';
import { ResourceBar } from './ui/ResourceBar';
import { BuildMenu } from './ui/BuildMenu';
import { SliderPanel } from './ui/SliderPanel';
import { LayerToggle } from './ui/LayerToggle';
import { SubstrateLayer } from './types';

async function main() {
  const container = document.getElementById('game-container')!;
  const gameState = new GameState();

  const renderer = new Renderer();
  await renderer.init(container, gameState);

  const gridRenderer = new GridRenderer();
  const buildingRenderer = new BuildingRenderer();
  const substrateOverlay = new SubstrateOverlay();
  const populationRenderer = new PopulationRenderer();

  renderer.worldContainer.addChild(gridRenderer.container);
  renderer.worldContainer.addChild(substrateOverlay.container);
  renderer.worldContainer.addChild(populationRenderer.container);
  renderer.worldContainer.addChild(buildingRenderer.container);

  gridRenderer.drawTerrain(gameState);
  gridRenderer.drawGridLines(gameState);

  const infoPanel = new InfoPanel();
  const resourceBar = new ResourceBar();

  let activeBuildId: string | null = null;

  const buildMenu = new BuildMenu((defId) => {
    activeBuildId = defId;
  });
  buildMenu.update(gameState);

  const layerToggle = new LayerToggle((layer: SubstrateLayer) => {
    substrateOverlay.toggle(layer);
    substrateOverlay.draw(gameState);
  });

  const sliderPanel = new SliderPanel(() => redrawWorld());

  function redrawWorld(): void {
    buildingRenderer.draw(gameState);
    substrateOverlay.draw(gameState);
    populationRenderer.draw(gameState);
    gridRenderer.updateSelection(gameState);
    infoPanel.update(gameState);
    sliderPanel.update(gameState);
    resourceBar.update(gameState);
    buildMenu.update(gameState);
  }

  renderer.app.canvas.addEventListener('click', (e: MouseEvent) => {
    const { gx, gy } = renderer.screenToGrid(e.clientX, e.clientY);

    if (activeBuildId && gameState.grid.inBounds(gx, gy)) {
      const result = placeBuilding(gameState, activeBuildId, gx, gy);
      if (result) {
        recalculateSubstrate(gameState);
        redrawWorld();
        return;
      }
    }

    if (gameState.grid.inBounds(gx, gy)) {
      gameState.selectedCell = { x: gx, y: gy };
    } else {
      gameState.selectedCell = null;
    }
    gridRenderer.updateSelection(gameState);
    infoPanel.update(gameState);
    sliderPanel.update(gameState);
  });

  setInterval(() => {
    if (gameState.speed === 0) return;
    for (let i = 0; i < gameState.speed; i++) {
      gameState.tick();
      processResourceTick(gameState);
      processPopulationTick(gameState);
    }
    populationRenderer.draw(gameState);
    resourceBar.update(gameState);
    buildMenu.update(gameState);
    infoPanel.update(gameState);
  }, TICK_INTERVAL_MS);

  redrawWorld();
}

main().catch(console.error);
