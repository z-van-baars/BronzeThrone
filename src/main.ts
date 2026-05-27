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
import { EventPopup } from './ui/EventPopup';
import { MilitaryPopup } from './ui/MilitaryPopup';
import { RunSummary } from './ui/RunSummary';
import { LayerToggle } from './ui/LayerToggle';
import { SubstrateLayer } from './types';

async function main() {
  let gameState = new GameState();

  const container = document.getElementById('game-container')!;
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
  const eventPopup = new EventPopup(() => redrawWorld());
  const militaryPopup = new MilitaryPopup(() => redrawWorld());

  const runSummary = new RunSummary(() => {
    gameState = new GameState();
    gridRenderer.drawTerrain(gameState);
    gridRenderer.drawGridLines(gameState);
    activeBuildId = null;
    redrawWorld();
  });

  // Concede button
  const concedeBtn = document.createElement('button');
  concedeBtn.textContent = 'CONCEDE';
  Object.assign(concedeBtn.style, {
    position: 'absolute',
    top: '44px',
    left: '12px',
    background: 'rgba(20, 20, 40, 0.85)',
    color: '#8a7e65',
    border: '1px solid rgba(212,201,168,0.2)',
    borderRadius: '3px',
    padding: '4px 10px',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', Tahoma, sans-serif",
    fontSize: '10px',
    letterSpacing: '1px',
    transition: 'all 0.15s',
  });
  concedeBtn.addEventListener('mouseenter', () => {
    concedeBtn.style.borderColor = 'rgba(255,80,80,0.5)';
    concedeBtn.style.color = '#cc5555';
  });
  concedeBtn.addEventListener('mouseleave', () => {
    concedeBtn.style.borderColor = 'rgba(212,201,168,0.2)';
    concedeBtn.style.color = '#8a7e65';
  });
  concedeBtn.addEventListener('click', () => {
    if (!runSummary.isVisible) {
      runSummary.show(gameState, 'concede');
    }
  });
  container.appendChild(concedeBtn);

  // Speed indicator
  const speedIndicator = document.createElement('div');
  Object.assign(speedIndicator.style, {
    position: 'absolute',
    top: '44px',
    left: '90px',
    background: 'rgba(20, 20, 40, 0.85)',
    color: '#8a7e65',
    border: '1px solid rgba(212,201,168,0.2)',
    borderRadius: '3px',
    padding: '4px 10px',
    fontFamily: "'Segoe UI', Tahoma, sans-serif",
    fontSize: '10px',
    letterSpacing: '0.5px',
    pointerEvents: 'none',
  });
  container.appendChild(speedIndicator);

  function updateSpeedIndicator(): void {
    const labels = ['PAUSED', '1x', '2x', '3x'];
    speedIndicator.textContent = labels[gameState.speed];
    speedIndicator.style.color = gameState.speed === 0 ? '#cc5555' : '#8a7e65';
  }

  function anyPopupOpen(): boolean {
    return eventPopup.isVisible || militaryPopup.isVisible || runSummary.isVisible;
  }

  function redrawWorld(): void {
    buildingRenderer.draw(gameState);
    substrateOverlay.draw(gameState);
    populationRenderer.draw(gameState);
    gridRenderer.updateSelection(gameState);
    infoPanel.update(gameState);
    sliderPanel.update(gameState);
    resourceBar.update(gameState);
    buildMenu.update(gameState);
    updateSpeedIndicator();
  }

  renderer.app.canvas.addEventListener('click', (e: MouseEvent) => {
    if (anyPopupOpen()) return;

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

  window.addEventListener('keydown', (e) => {
    if (anyPopupOpen()) return;
    if (e.key === ' ') {
      e.preventDefault();
      gameState.speed = gameState.speed === 0 ? 1 : 0;
      updateSpeedIndicator();
    } else if (e.key === '1') { gameState.speed = 1; updateSpeedIndicator(); }
    else if (e.key === '2') { gameState.speed = 2; updateSpeedIndicator(); }
    else if (e.key === '3') { gameState.speed = 3; updateSpeedIndicator(); }
  });

  setInterval(() => {
    if (gameState.speed === 0) return;
    if (anyPopupOpen()) return;

    for (let i = 0; i < gameState.speed; i++) {
      gameState.tick();
      processResourceTick(gameState);
      processPopulationTick(gameState);
      gameState.eventDeck.tick(gameState);
      gameState.military.tick(gameState);
      gameState.trade.tick(gameState);
    }

    runSummary.trackPeak(gameState);

    // Total collapse
    if (gameState.tickCount > 30 &&
        gameState.population.totalPopulation < 0.5 &&
        gameState.buildings.size <= 1) {
      runSummary.show(gameState, 'collapse');
      return;
    }

    if (gameState.eventDeck.activeEvent) {
      eventPopup.show(gameState.eventDeck.activeEvent, gameState.eventDeck, gameState);
    } else if (gameState.military.activeThreat && gameState.military.activeThreat.ticksRemaining <= 0) {
      militaryPopup.showWarning(gameState.military.activeThreat, gameState.military, gameState);
    }

    populationRenderer.draw(gameState);
    resourceBar.update(gameState);
    buildMenu.update(gameState);
    infoPanel.update(gameState);
  }, TICK_INTERVAL_MS);

  redrawWorld();
}

main().catch(console.error);
