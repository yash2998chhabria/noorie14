import { Camera } from './Camera';

export const LOGICAL_WIDTH = 360;
export const LOGICAL_HEIGHT = 640;

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  private scale = 1;
  camera: Camera;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.camera = new Camera();
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  private resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parent = this.canvas.parentElement || document.body;
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    // Scale to fit while maintaining aspect ratio
    this.scale = Math.min(w / LOGICAL_WIDTH, h / LOGICAL_HEIGHT);

    this.canvas.width = LOGICAL_WIDTH * dpr * this.scale;
    this.canvas.height = LOGICAL_HEIGHT * dpr * this.scale;
    this.canvas.style.width = `${LOGICAL_WIDTH * this.scale}px`;
    this.canvas.style.height = `${LOGICAL_HEIGHT * this.scale}px`;

    this.ctx.setTransform(dpr * this.scale, 0, 0, dpr * this.scale, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  };

  clear(): void {
    this.ctx.clearRect(-10, -10, LOGICAL_WIDTH + 20, LOGICAL_HEIGHT + 20);
  }

  beginCamera(): void {
    this.ctx.save();
    this.ctx.translate(-this.camera.offsetX, -this.camera.offsetY);
  }

  endCamera(): void {
    this.ctx.restore();
  }

  destroy(): void {
    window.removeEventListener('resize', this.resize);
  }
}
