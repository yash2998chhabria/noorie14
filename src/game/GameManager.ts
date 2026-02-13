import { GameLoop } from '../engine/GameLoop';
import { Renderer, LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../engine/Renderer';
import { Input } from '../engine/Input';
import { FloatingText } from '../engine/FloatingText';
import { RunnerLevel } from './levels/RunnerLevel';
import { CatchLevel } from './levels/CatchLevel';
import { FloatLevel } from './levels/FloatLevel';
import type { LevelEngine, EventCallback, GameEvent } from './LevelEngine';
import type { LevelConfig } from '../levels/types';

export class GameManager {
  private loop: GameLoop;
  private renderer: Renderer;
  private input: Input;
  private engine: LevelEngine | null = null;
  private floatingText = new FloatingText();

  // Screen flash effect
  private flashAlpha = 0;
  private flashColor = '#fff';

  // Danger vignette (last life)
  private dangerPulse = 0;

  // Track lives for danger vignette
  private currentLives = 3;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.input = new Input(canvas);

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      (alpha) => this.render(alpha),
    );
  }

  startLevel(config: LevelConfig, onEvent: EventCallback): void {
    this.engine?.destroy();
    this.floatingText.clear();
    this.flashAlpha = 0;
    this.dangerPulse = 0;
    this.currentLives = config.lives;

    switch (config.gameType) {
      case 'catch':
        this.engine = new CatchLevel(this.renderer, this.input, config);
        break;
      case 'float':
        this.engine = new FloatLevel(this.renderer, this.input, config);
        break;
      case 'runner':
      case 'dualLane':
      default:
        this.engine = new RunnerLevel(this.renderer, this.input, config);
        break;
    }

    // Intercept events for visual effects, then forward to caller
    this.engine.onEvent((event: GameEvent) => {
      this.handleVisualEvent(event);
      onEvent(event);
    });

    this.loop.start();
  }

  private handleVisualEvent(event: GameEvent): void {
    switch (event.type) {
      case 'score': {
        const x = event.x ?? (LOGICAL_WIDTH / 2 + (Math.random() - 0.5) * 80);
        const y = event.y ?? (100 + Math.random() * 40);
        this.floatingText.add(x, y, `+${event.points}`, '#ffd700', 18);
        break;
      }
      case 'combo': {
        const x = event.x ?? LOGICAL_WIDTH / 2;
        const y = event.y ?? 80;
        const color = event.count >= 15 ? '#ffd700' : event.count >= 9 ? '#ff4081' : '#ff9eb5';
        this.floatingText.add(x, y, `${event.count}x COMBO!`, color, 22);
        this.flash('#ffd700', 0.15);
        break;
      }
      case 'hit': {
        this.currentLives = event.livesLeft;
        this.flash('#ff4444', 0.25);
        break;
      }
      case 'heart': {
        this.flash('#ff6b9d', 0.08);
        break;
      }
      case 'memory': {
        this.floatingText.add(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT * 0.3, 'MEMORY UNLOCKED', '#e0aaff', 18);
        this.flash('#e0aaff', 0.3);
        break;
      }
      case 'actChange': {
        const labels: Record<string, string> = {
          his: "Yash's Side",
          her: "Noorie's Side",
          together: 'Yash & Noorie',
        };
        this.floatingText.add(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT * 0.25, labels[event.act], '#fff', 20);
        break;
      }
      case 'powerup': {
        const labels: Record<string, string> = {
          shield: 'SHIELD!',
          magnet: 'MAGNET!',
          slowtime: 'SLOW TIME!',
        };
        this.floatingText.add(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT * 0.3, labels[event.powerUp], '#ffd700', 22);
        this.flash('#ffd700', 0.2);
        break;
      }
    }
  }

  private flash(color: string, alpha: number): void {
    this.flashColor = color;
    this.flashAlpha = alpha;
  }

  private update(dt: number): void {
    this.engine?.update(dt);
    this.floatingText.update(dt);

    // Decay flash
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - dt * 3);
    }

    // Danger pulse on last life
    if (this.currentLives === 1) {
      this.dangerPulse += dt * 3;
    } else {
      this.dangerPulse = 0;
    }
  }

  private render(alpha: number): void {
    this.engine?.render(alpha);

    const ctx = this.renderer.ctx;

    // Floating text (screen space, on top of everything)
    this.floatingText.render(ctx);

    // Screen flash overlay
    if (this.flashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.flashAlpha;
      ctx.fillStyle = this.flashColor;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.restore();
    }

    // Danger vignette on last life — red pulsing edge glow
    if (this.currentLives === 1) {
      const pulse = Math.sin(this.dangerPulse) * 0.15 + 0.2;
      ctx.save();
      const vignette = ctx.createRadialGradient(
        LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2, LOGICAL_HEIGHT * 0.3,
        LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2, LOGICAL_HEIGHT * 0.7,
      );
      vignette.addColorStop(0, 'rgba(255,0,0,0)');
      vignette.addColorStop(1, `rgba(255,0,0,${pulse})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.restore();
    }
  }

  pause(): void {
    this.engine?.pause();
  }

  resume(): void {
    this.engine?.resume();
  }

  retry(): void {
    this.engine?.retry();
  }

  stop(): void {
    this.loop.stop();
  }

  get state() {
    return this.engine?.state || null;
  }

  destroy(): void {
    this.loop.stop();
    this.engine?.destroy();
    this.input.destroy();
    this.renderer.destroy();
  }
}
