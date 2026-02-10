import { GameLoop } from '../engine/GameLoop';
import { Renderer } from '../engine/Renderer';
import { Input } from '../engine/Input';
import { LevelRunner } from './LevelRunner';
import type { EventCallback } from './LevelRunner';
import type { LevelConfig } from '../levels/types';

export class GameManager {
  private loop: GameLoop;
  private renderer: Renderer;
  private input: Input;
  private levelRunner: LevelRunner | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.input = new Input(canvas);

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      (alpha) => this.render(alpha),
    );
  }

  startLevel(config: LevelConfig, onEvent: EventCallback): void {
    this.levelRunner?.destroy();
    this.levelRunner = new LevelRunner(this.renderer, this.input, config);
    this.levelRunner.onEvent(onEvent);
    this.loop.start();
  }

  private update(dt: number): void {
    this.levelRunner?.update(dt);
  }

  private render(alpha: number): void {
    this.levelRunner?.render(alpha);
  }

  pause(): void {
    this.levelRunner?.pause();
  }

  resume(): void {
    this.levelRunner?.resume();
  }

  retry(): void {
    this.levelRunner?.retry();
  }

  stop(): void {
    this.loop.stop();
  }

  get state() {
    return this.levelRunner?.state || null;
  }

  destroy(): void {
    this.loop.stop();
    this.levelRunner?.destroy();
    this.input.destroy();
    this.renderer.destroy();
  }
}
