import { Renderer, LOGICAL_WIDTH } from '../engine/Renderer';
import { Input } from '../engine/Input';
import { aabbOverlap, GROUND_Y } from '../engine/Physics';
import { ParticleSystem } from '../engine/Particles';
import { audio } from '../engine/AudioManager';
import { ObjectPool } from '../engine/ObjectPool';
import { Player } from './Player';
import { Obstacle } from './Obstacle';
import { Collectible } from './Collectible';
import { Background } from './Background';
import type { LevelConfig } from '../levels/types';

export type GameEvent =
  | { type: 'score'; points: number }
  | { type: 'heart'; amount: number }
  | { type: 'star' }
  | { type: 'memory'; id: string }
  | { type: 'combo'; count: number }
  | { type: 'hit'; livesLeft: number }
  | { type: 'gameOver' }
  | { type: 'levelComplete' }
  | { type: 'progress'; percent: number };

export type EventCallback = (event: GameEvent) => void;

export class LevelRunner {
  private renderer: Renderer;
  private input: Input;
  private player: Player;
  private background: Background;
  private particles: ParticleSystem;
  private config: LevelConfig;

  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private obstaclePool: ObjectPool<Obstacle>;
  private collectiblePool: ObjectPool<Collectible>;

  private speed = 0;
  private distance = 0;
  private totalDistance = 0;
  private currentSegment = 0;
  private segmentOffset = 0;

  private combo = 0;
  private comboTimer = 0;
  private score = 0;
  private hearts = 0;

  private paused = false;
  private completed = false;
  private gameOver = false;
  private elapsed = 0;

  private eventCallback: EventCallback | null = null;
  private dustTimer = 0;

  constructor(renderer: Renderer, input: Input, config: LevelConfig) {
    this.renderer = renderer;
    this.input = input;
    this.config = config;
    this.player = new Player();
    this.player.lives = config.lives;
    this.background = new Background(config.theme);
    this.particles = new ParticleSystem();
    this.speed = config.baseSpeed;

    this.obstaclePool = new ObjectPool(
      () => new Obstacle(),
      (o) => { o.active = false; },
      30,
    );
    this.collectiblePool = new ObjectPool(
      () => new Collectible(),
      (c) => { c.active = false; },
      30,
    );

    // Calculate total distance from all segments
    this.totalDistance = config.segments.reduce((sum, seg) => sum + seg.length, 0);
  }

  onEvent(cb: EventCallback): void {
    this.eventCallback = cb;
  }

  private emit(event: GameEvent): void {
    this.eventCallback?.(event);
  }

  update(dt: number): void {
    if (this.paused || this.completed || this.gameOver) return;

    this.elapsed += dt;

    // Speed ramp
    this.speed = Math.min(
      this.config.baseSpeed + this.elapsed * this.config.speedRamp,
      this.config.maxSpeed,
    );

    // Rapid section speed boost
    if (this.config.rapidSegmentIndices.includes(this.currentSegment)) {
      this.speed *= 1.25;
    }

    // Move world
    const dx = this.speed * dt;
    this.distance += dx;
    this.segmentOffset += dx;

    // Spawn from current segment
    this.processSegmentSpawns();

    // Update background
    this.background.update(dt, this.speed);

    // Camera
    this.renderer.camera.update(dt);

    // Input
    if (this.input.consumeSuperJump()) {
      this.player.jump(true);
    } else if (this.input.consumeJump()) {
      this.player.jump(false);
    }

    // Update player
    this.player.update(dt);

    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= dx;

      // Off screen left
      if (obs.x + obs.width < -20) {
        this.obstaclePool.release(obs);
        this.obstacles.splice(i, 1);
        continue;
      }

      // Collision
      if (obs.active && aabbOverlap(this.player.aabb, obs.aabb)) {
        obs.active = false;
        const dead = this.player.hit();
        this.renderer.camera.shake(6, 0.3);
        this.combo = 0;

        // Hit particles
        this.particles.emit({
          x: this.player.x + this.player.width / 2,
          y: this.player.y - this.player.height / 2,
          count: 12,
          speed: 150,
          color: ['#ff4444', '#ff8888', '#ffaaaa'],
          shape: 'circle',
          life: 0.5,
        });

        this.emit({ type: 'hit', livesLeft: this.player.lives });

        if (dead) {
          this.gameOver = true;
          this.emit({ type: 'gameOver' });
          return;
        }
      }
    }

    // Update collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.x -= dx;
      col.update();

      if (col.x < -30) {
        this.collectiblePool.release(col);
        this.collectibles.splice(i, 1);
        // Reset combo on miss
        if (col.type === 'heart') {
          this.combo = 0;
        }
        continue;
      }

      if (col.active && aabbOverlap(this.player.aabb, col.aabb)) {
        col.active = false;
        this.collectItem(col);
        this.collectiblePool.release(col);
        this.collectibles.splice(i, 1);
      }
    }

    // Combo timer
    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }

    // Dust trail particles
    if (this.player.grounded && this.player.state === 'run') {
      this.dustTimer += dt;
      if (this.dustTimer > 0.15) {
        this.dustTimer = 0;
        this.particles.emit({
          x: this.player.x + 5,
          y: GROUND_Y - 2,
          count: 2,
          speed: 30,
          spread: 0.5,
          color: ['#c8b090', '#d4c4a8'],
          size: 3,
          life: 0.4,
          gravity: -20,
          angle: Math.PI,
        });
      }
    }

    // Particles
    this.particles.update(dt);

    // Progress
    const progress = Math.min(this.distance / this.totalDistance, 1);
    this.emit({ type: 'progress', percent: progress * 100 });

    // Level complete check
    if (this.distance >= this.totalDistance && !this.completed) {
      this.completed = true;
      this.emit({ type: 'levelComplete' });

      // Celebration particles
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.particles.emit({
            x: LOGICAL_WIDTH * Math.random(),
            y: GROUND_Y * 0.3,
            count: 20,
            speed: 200,
            color: ['#ff6b9d', '#ffd700', '#7c4dff', '#00e5ff', '#ff4081'],
            shape: Math.random() > 0.5 ? 'heart' : 'star',
            life: 1.5,
            size: 6,
          });
        }, i * 200);
      }
      audio.playSynth('milestone');
      audio.haptic('heavy');
    }
  }

  private processSegmentSpawns(): void {
    if (this.currentSegment >= this.config.segments.length) return;

    const segment = this.config.segments[this.currentSegment];

    // Check if we need to spawn items from this segment
    for (const item of segment.items) {
      const spawnAt = item.offset;
      if (this.segmentOffset >= spawnAt && this.segmentOffset - this.speed * (1 / 60) < spawnAt) {
        this.spawnItem(item);
      }
    }

    // Move to next segment
    if (this.segmentOffset >= segment.length) {
      this.segmentOffset -= segment.length;
      this.currentSegment++;
    }
  }

  private spawnItem(item: { offset: number; type: string; obstacleType?: string; collectibleType?: string; size?: string; yOffset?: number; memoryId?: string }): void {
    const x = LOGICAL_WIDTH + 20;

    if (item.type === 'obstacle') {
      const obs = this.obstaclePool.acquire();
      obs.init(
        x,
        item.obstacleType as any,
        this.config.theme,
        (item.size as any) || 'medium',
      );
      this.obstacles.push(obs);
    } else if (item.type === 'collectible') {
      const col = this.collectiblePool.acquire();
      const baseY = GROUND_Y - 60 - Math.random() * 50;
      col.init(
        x,
        baseY + (item.yOffset || 0),
        item.collectibleType as any,
        item.memoryId,
      );
      this.collectibles.push(col);
    }
  }

  private collectItem(col: Collectible): void {
    const cx = col.x;
    const cy = col.y;

    switch (col.type) {
      case 'heart': {
        this.hearts++;
        this.combo++;
        this.comboTimer = 2.0;
        const multiplier = Math.min(1 + Math.floor(this.combo / 3) * 0.5, 4);
        const points = Math.round(10 * multiplier);
        this.score += points;

        this.particles.emit({
          x: cx, y: cy, count: 8,
          speed: 80, color: ['#ff4d6d', '#ff758f', '#ff9eb5'],
          shape: 'heart', life: 0.6, size: 5,
        });

        audio.playSynth('collect');
        audio.haptic('light');
        this.emit({ type: 'heart', amount: 1 });
        this.emit({ type: 'score', points });

        if (this.combo > 0 && this.combo % 3 === 0) {
          this.emit({ type: 'combo', count: this.combo });
          audio.playSynth('combo');
          this.particles.emit({
            x: cx, y: cy, count: 15,
            speed: 120, color: ['#ffd700', '#ff6b9d', '#7c4dff'],
            shape: 'star', life: 0.8, size: 6,
          });
        }
        break;
      }
      case 'star': {
        this.score += 50;
        this.particles.emit({
          x: cx, y: cy, count: 12,
          speed: 100, color: ['#ffd700', '#ffeb3b', '#fff176'],
          shape: 'star', life: 0.7, size: 6,
        });
        audio.playSynth('collect');
        audio.haptic('light');
        this.emit({ type: 'star' });
        this.emit({ type: 'score', points: 50 });
        break;
      }
      case 'memory': {
        if (col.memoryId) {
          this.particles.emit({
            x: cx, y: cy, count: 20,
            speed: 130, color: ['#e0aaff', '#9d4edd', '#ffffff', '#ffd700'],
            shape: 'star', life: 1.0, size: 7,
          });
          this.renderer.camera.shake(4, 0.4);
          audio.playSynth('milestone');
          audio.haptic('medium');
          this.emit({ type: 'memory', id: col.memoryId });
        }
        break;
      }
    }
  }

  render(_alpha: number): void {
    const ctx = this.renderer.ctx;
    this.renderer.clear();

    // Background (no camera transform — it has its own parallax)
    this.background.render(ctx);

    // World objects with camera
    this.renderer.beginCamera();

    // Obstacles
    for (const obs of this.obstacles) {
      obs.render(ctx);
    }

    // Collectibles
    for (const col of this.collectibles) {
      col.render(ctx);
    }

    // Player
    this.player.render(ctx);

    this.renderer.endCamera();

    // Particles (screen space)
    this.particles.render(ctx);
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  retry(): void {
    this.player.reset();
    this.player.lives = this.config.lives;
    this.obstacles.forEach(o => this.obstaclePool.release(o));
    this.obstacles.length = 0;
    this.collectibles.forEach(c => this.collectiblePool.release(c));
    this.collectibles.length = 0;
    this.particles.clear();
    this.distance = 0;
    this.segmentOffset = 0;
    this.currentSegment = 0;
    this.speed = this.config.baseSpeed;
    this.combo = 0;
    this.score = 0;
    this.hearts = 0;
    this.elapsed = 0;
    this.gameOver = false;
    this.completed = false;
    this.paused = false;
  }

  get state() {
    return {
      score: this.score,
      hearts: this.hearts,
      combo: this.combo,
      lives: this.player.lives,
      progress: Math.min(this.distance / this.totalDistance, 1),
      isGameOver: this.gameOver,
      isComplete: this.completed,
      speed: this.speed,
    };
  }

  destroy(): void {
    this.particles.clear();
  }
}
