import { GameState, SPEED_VALUES, SPEED_LABELS } from './core/GameState';
import { placeBuilding, canPlaceBuilding, razeBuilding } from './core/Building';
import { recalculateSubstrate } from './core/Substrate';
import { processResourceTick } from './core/Resource';
import { processPopulationTick } from './core/Population';
import { processDevelopmentTick } from './core/Development';
import { CELL_SIZE } from './core/Config';
import { Renderer } from './render/Renderer';
import { GridRenderer } from './render/GridRenderer';
import { BuildingRenderer } from './render/BuildingRenderer';
import { SubstrateOverlay } from './render/SubstrateOverlay';
import { PopulationRenderer } from './render/PopulationRenderer';
import { BlueprintPreview } from './render/BlueprintPreview';
import { InfoPanel } from './ui/InfoPanel';
import { ResourceBar } from './ui/ResourceBar';
import { BuildMenu } from './ui/BuildMenu';
import { SliderPanel } from './ui/SliderPanel';
import { EventPopup } from './ui/EventPopup';
import { MilitaryPopup } from './ui/MilitaryPopup';
import { RazeConfirm } from './ui/RazeConfirm';
import { Toast } from './ui/Toast';
import { RunSummary } from './ui/RunSummary';
import { LayerToggle } from './ui/LayerToggle';
import { SubstrateLayer } from './types';

type ToolMode = 'build' | 'raze' | 'select';

const TICK_TIMER_MS = 500;

async function main() {
  let gameState = new GameState();

  const container = document.getElementById('game-container')!;
  const renderer = new Renderer();
  await renderer.init(container, gameState);

  const gridRenderer = new GridRenderer();
  const buildingRenderer = new BuildingRenderer();
  const substrateOverlay = new SubstrateOverlay();
  const populationRenderer = new PopulationRenderer();
  const blueprintPreview = new BlueprintPreview();

  renderer.worldContainer.addChild(gridRenderer.container);
  renderer.worldContainer.addChild(substrateOverlay.container);
  renderer.worldContainer.addChild(populationRenderer.container);
  renderer.worldContainer.addChild(buildingRenderer.container);
  renderer.worldContainer.addChild(blueprintPreview.container);

  gridRenderer.drawTerrain(gameState);
  gridRenderer.drawGridLines(gameState);

  const infoPanel = new InfoPanel();
  const resourceBar = new ResourceBar();
  const toast = new Toast();

  let activeBuildId: string | null = null;
  let toolMode: ToolMode = 'select';
  let hoverGx = -1;
  let hoverGy = -1;
  let tickAccumulator = 0;

  const buildMenu = new BuildMenu((defId) => {
    activeBuildId = defId;
    toolMode = defId ? 'build' : 'select';
    updateRazeBtn();
    updateBlueprint();
  });
  buildMenu.update(gameState);

  const layerToggle = new LayerToggle((layer: SubstrateLayer) => {
    substrateOverlay.toggle(layer);
    substrateOverlay.draw(gameState);
  });

  const sliderPanel = new SliderPanel(() => redrawWorld());
  const eventPopup = new EventPopup(() => redrawWorld());
  const militaryPopup = new MilitaryPopup(() => redrawWorld());
  const razeConfirm = new RazeConfirm();

  const runSummary = new RunSummary(() => {
    gameState = new GameState();
    gridRenderer.drawTerrain(gameState);
    gridRenderer.drawGridLines(gameState);
    activeBuildId = null;
    toolMode = 'select';
    tickAccumulator = 0;
    redrawWorld();
  });

  // Top-left toolbar row
  const toolbarRow = document.createElement('div');
  Object.assign(toolbarRow.style, {
    position: 'absolute',
    top: '44px',
    left: '12px',
    display: 'flex',
    gap: '4px',
  });
  container.appendChild(toolbarRow);

  function makeToolbarBtn(text: string, title: string): HTMLElement {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.title = title;
    Object.assign(btn.style, {
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
    return btn;
  }

  // Concede button
  const concedeBtn = makeToolbarBtn('CONCEDE', 'End this run');
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
  toolbarRow.appendChild(concedeBtn);

  // Raze button
  const razeBtn = makeToolbarBtn('🔥 RAZE', 'Demolish buildings (R)');
  function updateRazeBtn(): void {
    if (toolMode === 'raze') {
      razeBtn.style.background = 'rgba(200,50,30,0.25)';
      razeBtn.style.borderColor = 'rgba(200,50,30,0.5)';
      razeBtn.style.color = '#ff8866';
    } else {
      razeBtn.style.background = 'rgba(20, 20, 40, 0.85)';
      razeBtn.style.borderColor = 'rgba(212,201,168,0.2)';
      razeBtn.style.color = '#8a7e65';
    }
  }
  razeBtn.addEventListener('click', () => {
    if (toolMode === 'raze') {
      toolMode = 'select';
    } else {
      toolMode = 'raze';
      activeBuildId = null;
      buildMenu.deselect();
    }
    updateRazeBtn();
    updateBlueprint();
    buildMenu.update(gameState);
  });
  toolbarRow.appendChild(razeBtn);

  // Speed indicator
  const speedIndicator = document.createElement('div');
  Object.assign(speedIndicator.style, {
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
  toolbarRow.appendChild(speedIndicator);

  function updateSpeedIndicator(): void {
    speedIndicator.textContent = SPEED_LABELS[gameState.speedIndex];
    speedIndicator.style.color = gameState.speedIndex === 0 ? '#cc5555' : '#8a7e65';
  }

  function anyPopupOpen(): boolean {
    return eventPopup.isVisible || militaryPopup.isVisible || runSummary.isVisible || razeConfirm.isVisible;
  }

  function updateBlueprint(): void {
    if (toolMode === 'build' && activeBuildId) {
      blueprintPreview.draw(gameState, activeBuildId, hoverGx, hoverGy);
    } else {
      blueprintPreview.draw(gameState, null, -1, -1);
    }
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
    updateBlueprint();
  }

  renderer.app.canvas.addEventListener('mousemove', (e: MouseEvent) => {
    const { gx, gy } = renderer.screenToGrid(e.clientX, e.clientY);
    if (gx !== hoverGx || gy !== hoverGy) {
      hoverGx = gx;
      hoverGy = gy;
      updateBlueprint();
    }
  });

  renderer.app.canvas.addEventListener('click', (e: MouseEvent) => {
    if (anyPopupOpen()) return;

    const { gx, gy } = renderer.screenToGrid(e.clientX, e.clientY);
    if (!gameState.grid.inBounds(gx, gy)) {
      gameState.selectedCell = null;
      gridRenderer.updateSelection(gameState);
      return;
    }

    // Build mode
    if (toolMode === 'build' && activeBuildId) {
      const check = canPlaceBuilding(gameState, activeBuildId, gx, gy);
      if (check.ok) {
        placeBuilding(gameState, activeBuildId, gx, gy);
        recalculateSubstrate(gameState);
        toast.show(`${activeBuildId.replace(/_/g, ' ')} placed`, 'success');
        activeBuildId = null;
        toolMode = 'select';
        buildMenu.deselect();
        redrawWorld();
        return;
      } else {
        toast.show(check.reason ?? 'Cannot place here', 'error');
        return;
      }
    }

    // Raze mode
    if (toolMode === 'raze') {
      const cell = gameState.grid.getCell(gx, gy);
      if (cell?.buildingId) {
        const building = gameState.buildings.get(cell.buildingId);
        if (building) {
          razeConfirm.show(building.defId, () => {
            razeBuilding(gameState, building.id);
            recalculateSubstrate(gameState);
            toast.show('Building razed', 'info');
            redrawWorld();
          }, () => {});
        }
      } else {
        toast.show('Nothing to raze here', 'error');
      }
      return;
    }

    // Select mode
    gameState.selectedCell = { x: gx, y: gy };
    gridRenderer.updateSelection(gameState);
    infoPanel.update(gameState);
    sliderPanel.update(gameState);
  });

  window.addEventListener('keydown', (e) => {
    if (anyPopupOpen()) return;

    if (e.key === ' ') {
      e.preventDefault();
      gameState.speedIndex = gameState.speedIndex === 0 ? 3 : 0;
      updateSpeedIndicator();
    } else if (e.key === '+' || e.key === '=') {
      if (gameState.speedIndex < SPEED_VALUES.length - 1) {
        gameState.speedIndex++;
        updateSpeedIndicator();
      }
    } else if (e.key === '-' || e.key === '_') {
      if (gameState.speedIndex > 0) {
        gameState.speedIndex--;
        updateSpeedIndicator();
      }
    } else if (e.key === '1') { gameState.speedIndex = 3; updateSpeedIndicator(); }
    else if (e.key === '2') { gameState.speedIndex = 4; updateSpeedIndicator(); }
    else if (e.key === '3') { gameState.speedIndex = 5; updateSpeedIndicator(); }
    else if (e.key === 'r' || e.key === 'R') {
      if (toolMode === 'raze') {
        toolMode = 'select';
      } else {
        toolMode = 'raze';
        activeBuildId = null;
        buildMenu.deselect();
      }
      updateRazeBtn();
      updateBlueprint();
      buildMenu.update(gameState);
    } else if (e.key === 'Escape') {
      toolMode = 'select';
      activeBuildId = null;
      buildMenu.deselect();
      updateRazeBtn();
      updateBlueprint();
      buildMenu.update(gameState);
    }
  });

  setInterval(() => {
    const tps = SPEED_VALUES[gameState.speedIndex];
    if (tps === 0) return;
    if (anyPopupOpen()) return;

    tickAccumulator += tps * (TICK_TIMER_MS / 1000);

    let ticked = false;
    while (tickAccumulator >= 1) {
      tickAccumulator -= 1;
      ticked = true;

      gameState.ledger.clear();
      gameState.tick();
      processResourceTick(gameState);
      processPopulationTick(gameState);
      processDevelopmentTick(gameState);
      gameState.eventDeck.tick(gameState);
      gameState.military.tick(gameState);
      gameState.trade.tick(gameState);
    }

    if (!ticked) return;

    runSummary.trackPeak(gameState);

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
  }, TICK_TIMER_MS);

  redrawWorld();
}

main().catch(console.error);
