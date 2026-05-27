import { Application, Container } from 'pixi.js';
import { CELL_SIZE, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX, CAMERA_ZOOM_STEP, CAMERA_PAN_SPEED } from '../core/Config';
import { GameState } from '../core/GameState';

export class Renderer {
  app!: Application;
  worldContainer!: Container;

  private cameraX = 0;
  private cameraY = 0;
  private zoom = 1;

  private keysDown = new Set<string>();
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragCamStartX = 0;
  private dragCamStartY = 0;

  async init(container: HTMLElement, _gameState: GameState): Promise<void> {
    this.app = new Application();
    await this.app.init({
      resizeTo: container,
      background: 0x1a1a2e,
      antialias: false,
    });
    container.appendChild(this.app.canvas);

    this.worldContainer = new Container();
    this.app.stage.addChild(this.worldContainer);

    const gridPixelW = _gameState.grid.width * CELL_SIZE;
    const gridPixelH = _gameState.grid.height * CELL_SIZE;
    this.cameraX = gridPixelW / 2;
    this.cameraY = gridPixelH / 2;

    this.setupInput();
    this.app.ticker.add(() => this.updateCamera());
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => this.keysDown.add(e.key.toLowerCase()));
    window.addEventListener('keyup', (e) => this.keysDown.delete(e.key.toLowerCase()));

    const canvas = this.app.canvas;

    canvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -CAMERA_ZOOM_STEP : CAMERA_ZOOM_STEP;
      this.zoom = Math.max(CAMERA_ZOOM_MIN, Math.min(CAMERA_ZOOM_MAX, this.zoom + delta));
    }, { passive: false });

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 1 || e.button === 2) {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragCamStartX = this.cameraX;
        this.dragCamStartY = this.cameraY;
      }
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      this.cameraX = this.dragCamStartX - dx / this.zoom;
      this.cameraY = this.dragCamStartY - dy / this.zoom;
    });

    window.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.button === 1 || e.button === 2) {
        this.isDragging = false;
      }
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private updateCamera(): void {
    const speed = CAMERA_PAN_SPEED / this.zoom;
    if (this.keysDown.has('w') || this.keysDown.has('arrowup')) this.cameraY -= speed;
    if (this.keysDown.has('s') || this.keysDown.has('arrowdown')) this.cameraY += speed;
    if (this.keysDown.has('a') || this.keysDown.has('arrowleft')) this.cameraX -= speed;
    if (this.keysDown.has('d') || this.keysDown.has('arrowright')) this.cameraX += speed;

    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;

    this.worldContainer.scale.set(this.zoom);
    this.worldContainer.x = screenW / 2 - this.cameraX * this.zoom;
    this.worldContainer.y = screenH / 2 - this.cameraY * this.zoom;
  }

  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const worldX = (screenX - this.worldContainer.x) / this.zoom;
    const worldY = (screenY - this.worldContainer.y) / this.zoom;
    return { x: worldX, y: worldY };
  }

  screenToGrid(screenX: number, screenY: number): { gx: number; gy: number } {
    const { x, y } = this.screenToWorld(screenX, screenY);
    return {
      gx: Math.floor(x / CELL_SIZE),
      gy: Math.floor(y / CELL_SIZE),
    };
  }
}
