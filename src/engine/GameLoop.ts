export type UpdateFn = (dt: number) => void;
export type RenderFn = (alpha: number) => void;

export class GameLoop {
  private updateFn: UpdateFn;
  private renderFn: RenderFn;
  private rafId = 0;
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedDt = 1 / 60; // 60Hz physics
  private readonly maxAccumulator = 0.25; // prevent spiral of death

  constructor(update: UpdateFn, render: RenderFn) {
    this.updateFn = update;
    this.renderFn = render;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now() / 1000;
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  get isRunning(): boolean {
    return this.running;
  }

  private tick = (timestamp: number): void => {
    if (!this.running) return;

    const now = timestamp / 1000;
    let frameTime = now - this.lastTime;
    this.lastTime = now;

    // Clamp to prevent spiral of death
    if (frameTime > this.maxAccumulator) {
      frameTime = this.maxAccumulator;
    }

    this.accumulator += frameTime;

    // Fixed timestep updates
    while (this.accumulator >= this.fixedDt) {
      this.updateFn(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    // Render with interpolation alpha
    const alpha = this.accumulator / this.fixedDt;
    this.renderFn(alpha);

    this.rafId = requestAnimationFrame(this.tick);
  };
}
