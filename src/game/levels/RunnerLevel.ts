import { Renderer, LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../../engine/Renderer';
import { Input } from '../../engine/Input';
import { aabbOverlap, GROUND_Y, GRAVITY } from '../../engine/Physics';
import { ParticleSystem } from '../../engine/Particles';
import { audio } from '../../engine/AudioManager';
import { ObjectPool } from '../../engine/ObjectPool';
import { Player } from '../Player';
import { Obstacle } from '../Obstacle';
import { Collectible } from '../Collectible';
import { Background } from '../Background';
import { drawCharacter, HIM_STYLE, HER_STYLE } from '../../engine/Sprites';
import type { CharacterStyle } from '../../engine/Sprites';
import type { LevelConfig } from '../../levels/types';
import type { PowerUpType } from '../../levels/types';
import type { LevelEngine, LevelEngineState, EventCallback, GameEvent, ActType } from '../LevelEngine';

interface TransitionState {
  phase: 'walk' | 'pose' | 'hearts' | 'text' | 'fadeOut' | 'fadeIn';
  timer: number;
  message: string;
  fadeAlpha: number;
  transitionIndex: 1 | 2;
  walkX: number;
  walkTargetX: number;
  secondCharWalkX: number;
  heartBurstCount: number; // track timed heart bursts
}

const PHASE_DURATIONS = {
  walk: 1.0,
  pose: 0.6,
  hearts: 0.8,
  text: 1.5,
  fadeOut: 0.5,
  fadeIn: 0.5,
};

const DEFAULT_FLUTTER_GRAVITY = 600;

// Power-up constants
const SHIELD_DURATION = 5;
const MAGNET_DURATION = 6;
const SLOW_DURATION = 4;
const MAGNET_RANGE = 120;

export class RunnerLevel implements LevelEngine {
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

  // Three-act system
  private currentAct: ActType = 'his';
  private activeStyle: CharacterStyle = HIM_STYLE;
  private transition: TransitionState | null = null;
  private actTransitionTriggered1 = false;
  private actTransitionTriggered2 = false;

  // Together mode
  private togetherFrame = 0;

  // Flutter sparkle timer
  private flutterSparkleTimer = 0;

  // Power-up state
  private shieldActive = false;
  private shieldTimer = 0;
  private magnetActive = false;
  private magnetTimer = 0;
  private slowTimeActive = false;
  private slowTimeTimer = 0;

  // Golden corridor state
  private inGoldenCorridor = false;
  private goldenTimer = 0;

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

    // Handle transition animation
    if (this.transition) {
      this.updateTransition(dt);
      this.particles.update(dt);
      return;
    }

    this.elapsed += dt;
    this.togetherFrame++;

    this.speed = Math.min(
      this.config.baseSpeed + this.elapsed * this.config.speedRamp,
      this.config.maxSpeed,
    );

    const rapidIndices = this.config.rapidSegmentIndices || [];
    if (rapidIndices.includes(this.currentSegment)) {
      this.speed *= 1.25;
    }

    // SlowTime: halve effective speed
    const effectiveSpeedMult = this.slowTimeActive ? 0.5 : 1;
    const dx = this.speed * effectiveSpeedMult * dt;
    this.distance += dx;
    this.segmentOffset += dx;

    this.processSegmentSpawns();
    this.background.update(dt, this.speed * effectiveSpeedMult);
    this.renderer.camera.update(dt);

    // Jump input
    if (this.input.consumeSuperJump()) {
      this.player.jump(true);
    } else if (this.input.consumeJump()) {
      this.player.jump(false);
    }

    // Flutter jump: if Her act or Together act, airborne, and holding touch → reduced gravity
    const canFlutter = this.currentAct === 'her' || this.currentAct === 'together';
    if (canFlutter && !this.player.grounded && this.input.isTouching) {
      const flutterGravity = this.config.flutterGravity ?? DEFAULT_FLUTTER_GRAVITY;
      const gravityDiff = GRAVITY - flutterGravity;
      this.player.vy -= gravityDiff * dt;

      // Flutter sparkle particles
      this.flutterSparkleTimer += dt;
      if (this.flutterSparkleTimer > 0.08) {
        this.flutterSparkleTimer = 0;
        const px = this.currentAct === 'together'
          ? this.player.x + this.player.width / 2 + 15
          : this.player.x + this.player.width / 2;
        this.particles.emit({
          x: px + (Math.random() - 0.5) * 20,
          y: this.player.y - this.player.height * 0.3,
          count: 2,
          speed: 30,
          color: ['#b388ff', '#e0aaff', '#ffffff'],
          shape: 'star',
          life: 0.5,
          size: 3,
          gravity: -20,
        });
      }
    } else {
      this.flutterSparkleTimer = 0;
    }

    this.player.update(dt);

    // Update power-up timers
    this.updatePowerUps(dt);

    // Check for act transitions
    this.checkActTransitions();

    // Update golden corridor timer
    if (this.inGoldenCorridor) {
      this.goldenTimer += dt;
    }

    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= dx;
      obs.update(dt);

      if (obs.x + obs.width < -20) {
        this.obstaclePool.release(obs);
        this.obstacles.splice(i, 1);
        continue;
      }

      if (obs.active) {
        let hit = false;
        if (this.currentAct === 'together') {
          hit = this.checkTogetherObstacleCollision(obs);
        } else {
          hit = aabbOverlap(this.player.aabb, obs.aabb);
        }

        if (hit) {
          // Shield absorbs hit
          if (this.shieldActive) {
            obs.active = false;
            this.shieldActive = false;
            this.shieldTimer = 0;
            audio.playSynth('block');
            this.particles.emit({
              x: this.player.x + this.player.width / 2,
              y: this.player.y - this.player.height / 2,
              count: 15,
              speed: 130,
              color: ['#4fc3f7', '#81d4fa', '#b3e5fc', '#ffffff'],
              shape: 'star',
              life: 0.6,
              size: 5,
            });
            continue;
          }

          obs.active = false;
          const dead = this.player.hit();
          this.renderer.camera.shake(6, 0.3);
          this.combo = 0;

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
    }

    // Update collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.x -= dx;
      col.update();

      // Magnet: pull hearts toward player
      if (this.magnetActive && col.active && col.type === 'heart' && !col.powerUpType) {
        const playerCX = this.player.x + this.player.width / 2;
        const playerCY = this.player.y - this.player.height / 2;
        const ddx = playerCX - col.x;
        const ddy = playerCY - col.y;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < MAGNET_RANGE && dist > 5) {
          const pullStrength = 200 * (1 - dist / MAGNET_RANGE);
          col.x += (ddx / dist) * pullStrength * dt;
          col.y += (ddy / dist) * pullStrength * dt;
        }
      }

      if (col.x < -30) {
        this.collectiblePool.release(col);
        this.collectibles.splice(i, 1);
        if (col.type === 'heart' && !col.powerUpType) {
          this.combo = 0;
        }
        continue;
      }

      if (col.active) {
        let collected = false;
        if (this.currentAct === 'together') {
          collected = this.checkTogetherCollectibleCollision(col);
        } else {
          collected = aabbOverlap(this.player.aabb, col.aabb);
        }

        if (collected) {
          col.active = false;
          this.collectItem(col);
          this.collectiblePool.release(col);
          this.collectibles.splice(i, 1);
        }
      }
    }

    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }

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

    this.particles.update(dt);

    const progress = Math.min(this.distance / this.totalDistance, 1);
    this.emit({ type: 'progress', percent: progress * 100 });

    if (this.distance >= this.totalDistance && !this.completed) {
      this.completed = true;
      this.emit({ type: 'levelComplete' });

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

  private updatePowerUps(dt: number): void {
    if (this.shieldActive) {
      this.shieldTimer -= dt;
      if (this.shieldTimer <= 0) {
        this.shieldActive = false;
        this.shieldTimer = 0;
      }
    }
    if (this.magnetActive) {
      this.magnetTimer -= dt;
      if (this.magnetTimer <= 0) {
        this.magnetActive = false;
        this.magnetTimer = 0;
      }
    }
    if (this.slowTimeActive) {
      this.slowTimeTimer -= dt;
      if (this.slowTimeTimer <= 0) {
        this.slowTimeActive = false;
        this.slowTimeTimer = 0;
      }
    }
  }

  private checkActTransitions(): void {
    // Transition 1: His → Her at herStartSegment
    if (!this.actTransitionTriggered1 && this.currentAct === 'his' &&
        this.currentSegment >= this.config.herStartSegment) {
      this.actTransitionTriggered1 = true;
      this.startTransition(1, this.config.transition1Message);
    }

    // Transition 2: Her → Together at togetherStartSegment
    if (!this.actTransitionTriggered2 && this.currentAct === 'her' &&
        this.currentSegment >= this.config.togetherStartSegment) {
      this.actTransitionTriggered2 = true;
      this.startTransition(2, this.config.transition2Message);
    }
  }

  private startTransition(index: 1 | 2, message: string): void {
    // Clear obstacles and collectibles to prevent unfair hits during transition
    this.obstacles.forEach(o => this.obstaclePool.release(o));
    this.obstacles.length = 0;
    this.collectibles.forEach(c => this.collectiblePool.release(c));
    this.collectibles.length = 0;

    this.transition = {
      phase: 'walk',
      timer: 0,
      message,
      fadeAlpha: 0,
      transitionIndex: index,
      walkX: this.player.x,
      walkTargetX: LOGICAL_WIDTH / 2 - this.player.width / 2,
      secondCharWalkX: -40,
      heartBurstCount: 0,
    };

    // Reset player to ground
    this.player.y = GROUND_Y;
    this.player.vy = 0;
    this.player.grounded = true;
    this.player.state = 'run';
  }

  private updateTransition(dt: number): void {
    if (!this.transition) return;

    this.transition.timer += dt;
    const t = this.transition;

    switch (t.phase) {
      case 'walk': {
        const progress = Math.min(t.timer / PHASE_DURATIONS.walk, 1);
        t.walkX = this.player.x + (t.walkTargetX - this.player.x) * progress;

        if (t.transitionIndex === 2) {
          t.secondCharWalkX = -40 + (LOGICAL_WIDTH / 2 - 50 - (-40)) * progress;
        }

        if (t.timer >= PHASE_DURATIONS.walk) {
          t.phase = 'pose';
          t.timer = 0;
        }
        break;
      }
      case 'pose': {
        // Gentle heart particles float up
        if (Math.floor(t.timer * 10) % 3 === 0 && t.timer > 0.05) {
          const centerX = LOGICAL_WIDTH / 2;
          this.particles.emit({
            x: centerX + (Math.random() - 0.5) * 40,
            y: GROUND_Y - 60,
            count: 1,
            speed: 30,
            color: ['#ff4d6d', '#ff758f'],
            shape: 'heart',
            life: 1.0,
            size: 4,
            gravity: -50,
          });
        }

        if (t.timer >= PHASE_DURATIONS.pose) {
          t.phase = 'hearts';
          t.timer = 0;
          t.heartBurstCount = 0;
        }
        break;
      }
      case 'hearts': {
        // 3 timed particle bursts at 0s, 0.3s, 0.6s
        const burstTimes = [0, 0.3, 0.6];
        for (let b = 0; b < burstTimes.length; b++) {
          if (t.heartBurstCount <= b && t.timer >= burstTimes[b]) {
            t.heartBurstCount = b + 1;
            const centerX = LOGICAL_WIDTH / 2;
            const centerY = GROUND_Y - 60;
            const shapes: Array<'heart' | 'star' | 'circle'> = ['heart', 'star', 'circle'];
            this.particles.emit({
              x: centerX,
              y: centerY,
              count: 15,
              speed: 100 + b * 30,
              color: ['#ff4d6d', '#ff758f', '#ffd700', '#ff9eb5'],
              shape: shapes[b % shapes.length],
              life: 1.2,
              size: 5 + b,
              gravity: -40,
            });
            if (b === 0) audio.playSynth('combo');
          }
        }

        if (t.timer >= PHASE_DURATIONS.hearts) {
          t.phase = 'text';
          t.timer = 0;
        }
        break;
      }
      case 'text': {
        if (t.timer >= PHASE_DURATIONS.text) {
          t.phase = 'fadeOut';
          t.timer = 0;
        }
        break;
      }
      case 'fadeOut': {
        t.fadeAlpha = Math.min(t.timer / PHASE_DURATIONS.fadeOut, 1);
        if (t.timer >= PHASE_DURATIONS.fadeOut) {
          // Switch act
          if (t.transitionIndex === 1) {
            this.currentAct = 'her';
            this.activeStyle = HER_STYLE;
            this.emit({ type: 'actChange', act: 'her' });
          } else {
            this.currentAct = 'together';
            this.activeStyle = HIM_STYLE;
            this.emit({ type: 'actChange', act: 'together' });
          }

          // Reset player position
          this.player.x = 60;
          this.player.y = GROUND_Y;
          this.player.vy = 0;
          this.player.grounded = true;
          this.player.state = 'run';

          t.phase = 'fadeIn';
          t.timer = 0;
          t.fadeAlpha = 1;
        }
        break;
      }
      case 'fadeIn': {
        t.fadeAlpha = 1 - Math.min(t.timer / PHASE_DURATIONS.fadeIn, 1);
        if (t.timer >= PHASE_DURATIONS.fadeIn) {
          this.transition = null;
        }
        break;
      }
    }
  }

  private checkTogetherObstacleCollision(obs: Obstacle): boolean {
    const himAABB = {
      x: this.player.x - 15 + 4,
      y: this.player.y - this.player.height + 4,
      width: this.player.width - 8,
      height: this.player.height - 4,
    };
    const herAABB = {
      x: this.player.x + 15 + 4,
      y: this.player.y - this.player.height + 4,
      width: this.player.width - 8,
      height: this.player.height - 4,
    };
    return aabbOverlap(himAABB, obs.aabb) || aabbOverlap(herAABB, obs.aabb);
  }

  private checkTogetherCollectibleCollision(col: Collectible): boolean {
    const himAABB = {
      x: this.player.x - 15 + 4,
      y: this.player.y - this.player.height + 4,
      width: this.player.width - 8,
      height: this.player.height - 4,
    };
    const herAABB = {
      x: this.player.x + 15 + 4,
      y: this.player.y - this.player.height + 4,
      width: this.player.width - 8,
      height: this.player.height - 4,
    };
    return aabbOverlap(himAABB, col.aabb) || aabbOverlap(herAABB, col.aabb);
  }

  private processSegmentSpawns(): void {
    if (this.currentSegment >= this.config.segments.length) return;

    const segment = this.config.segments[this.currentSegment];

    for (const item of segment.items) {
      const spawnAt = item.offset;
      if (this.segmentOffset >= spawnAt && this.segmentOffset - this.speed * (1 / 60) < spawnAt) {
        this.spawnItem(item);
      }
    }

    if (this.segmentOffset >= segment.length) {
      this.segmentOffset -= segment.length;

      // Check if entering a new segment
      const nextSeg = this.currentSegment + 1;
      if (nextSeg < this.config.segments.length) {
        const next = this.config.segments[nextSeg];

        // Golden corridor
        if (next.golden) {
          this.inGoldenCorridor = true;
          this.goldenTimer = 0;
          audio.playSynth('perfect');
          this.particles.emit({
            x: LOGICAL_WIDTH / 2,
            y: GROUND_Y - 40,
            count: 20,
            speed: 100,
            color: ['#ffd700', '#ffeb3b', '#fff176'],
            shape: 'star',
            life: 1.0,
            size: 5,
          });
        } else {
          this.inGoldenCorridor = false;
        }

        // Story event
        if (next.storyEvent) {
          this.background.setStoryEvent(next.storyEvent);
        }
      }

      this.currentSegment++;
    }
  }

  private spawnItem(item: any): void {
    const x = LOGICAL_WIDTH + 20;

    if (item.type === 'obstacle') {
      const obs = this.obstaclePool.acquire();
      obs.init(x, item.obstacleType, this.config.theme, item.size || 'medium');
      this.obstacles.push(obs);
    } else if (item.type === 'collectible') {
      const col = this.collectiblePool.acquire();
      const baseY = GROUND_Y - 60 - Math.random() * 50;
      col.init(x, baseY + (item.yOffset || 0), item.collectibleType, item.memoryId);
      this.collectibles.push(col);
    } else if (item.type === 'powerup') {
      const col = this.collectiblePool.acquire();
      const baseY = GROUND_Y - 80;
      col.init(x, baseY + (item.yOffset || 0), 'heart', undefined, item.powerUpType);
      this.collectibles.push(col);
    }
  }

  private collectItem(col: Collectible): void {
    const cx = col.x;
    const cy = col.y;

    // Power-up collection
    if (col.powerUpType) {
      this.activatePowerUp(col.powerUpType);
      this.particles.emit({
        x: cx, y: cy, count: 20,
        speed: 130, color: ['#ffd700', '#ffffff', '#4fc3f7'],
        shape: 'star', life: 0.8, size: 6,
      });
      this.emit({ type: 'powerup', powerUp: col.powerUpType });
      return;
    }

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
        this.emit({ type: 'score', points, x: cx, y: cy });

        if (this.combo > 0 && this.combo % 3 === 0) {
          this.emit({ type: 'combo', count: this.combo, x: cx, y: cy - 20 });
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
        this.emit({ type: 'score', points: 50, x: cx, y: cy });
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

  private activatePowerUp(powerUp: PowerUpType): void {
    switch (powerUp) {
      case 'shield':
        this.shieldActive = true;
        this.shieldTimer = SHIELD_DURATION;
        audio.playSynth('shield');
        break;
      case 'magnet':
        this.magnetActive = true;
        this.magnetTimer = MAGNET_DURATION;
        audio.playSynth('magnet');
        break;
      case 'slowtime':
        this.slowTimeActive = true;
        this.slowTimeTimer = SLOW_DURATION;
        audio.playSynth('slowtime');
        break;
    }
    audio.haptic('medium');
  }

  render(_alpha: number): void {
    const ctx = this.renderer.ctx;
    this.renderer.clear();

    this.background.render(ctx);
    this.renderer.beginCamera();

    // Render transition or normal gameplay
    if (this.transition) {
      this.renderTransition(ctx);
    } else {
      this.renderGameplay(ctx);
    }

    this.renderer.endCamera();
    this.particles.render(ctx);

    // SlowTime overlay
    if (this.slowTimeActive) {
      ctx.save();
      ctx.fillStyle = 'rgba(128,0,255,0.06)';
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.restore();
    }

    // Golden corridor overlay
    if (this.inGoldenCorridor) {
      ctx.save();
      const goldGrad = ctx.createLinearGradient(0, GROUND_Y, 0, GROUND_Y - 60);
      goldGrad.addColorStop(0, 'rgba(255,215,0,0.12)');
      goldGrad.addColorStop(1, 'rgba(255,215,0,0)');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, GROUND_Y - 60, LOGICAL_WIDTH, 60);
      ctx.restore();

      // Gold sparkle particles along ground
      if (Math.floor(this.goldenTimer * 15) % 2 === 0) {
        this.particles.emit({
          x: Math.random() * LOGICAL_WIDTH,
          y: GROUND_Y - 5,
          count: 1,
          speed: 20,
          color: ['#ffd700', '#ffeb3b'],
          shape: 'star',
          life: 0.6,
          size: 3,
          gravity: -30,
        });
      }
    }

    // Transition fade overlay (drawn in screen space, after camera)
    if (this.transition && this.transition.fadeAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.transition.fadeAlpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.restore();
    }
  }

  private renderGameplay(ctx: CanvasRenderingContext2D): void {
    if (this.currentAct === 'together') {
      // Draw both characters side by side
      const himX = this.player.x - 15;
      const herX = this.player.x + 15;
      const charY = this.player.y - this.player.height;

      // Him (left)
      if (this.player.invincible && Math.floor(this.player.invincibleTimer * 10) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }
      drawCharacter(ctx, himX, charY, this.player.width, this.player.height,
        this.player.state, this.player.frame, HIM_STYLE,
        this.player.squashX, this.player.squashY);
      ctx.globalAlpha = 1;

      // Her (right)
      if (this.player.invincible && Math.floor(this.player.invincibleTimer * 10) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }
      drawCharacter(ctx, herX, charY, this.player.width, this.player.height,
        this.player.state, this.togetherFrame, HER_STYLE,
        this.player.squashX, this.player.squashY);
      ctx.globalAlpha = 1;
    } else {
      // Single character with active style
      if (this.player.invincible && Math.floor(this.player.invincibleTimer * 10) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }
      drawCharacter(ctx, this.player.x, this.player.y - this.player.height,
        this.player.width, this.player.height,
        this.player.state, this.player.frame, this.activeStyle,
        this.player.squashX, this.player.squashY);
      ctx.globalAlpha = 1;
    }

    // Shield aura
    if (this.shieldActive) {
      ctx.save();
      const pulse = 0.15 + Math.sin(this.elapsed * 4) * 0.05;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#4fc3f7';
      const cx = this.player.x + this.player.width / 2;
      const cy = this.player.y - this.player.height / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, this.player.height * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#81d4fa';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy, this.player.height * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Magnet: arc lines from nearby hearts
    if (this.magnetActive) {
      ctx.save();
      ctx.strokeStyle = '#ff5252';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      const pcx = this.player.x + this.player.width / 2;
      const pcy = this.player.y - this.player.height / 2;
      for (const col of this.collectibles) {
        if (col.active && col.type === 'heart' && !col.powerUpType) {
          const ddx = pcx - col.x;
          const ddy = pcy - col.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < MAGNET_RANGE) {
            ctx.beginPath();
            ctx.moveTo(col.x, col.y);
            ctx.lineTo(pcx, pcy);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    for (const obs of this.obstacles) {
      obs.render(ctx);
    }

    for (const col of this.collectibles) {
      col.render(ctx);
    }
  }

  private renderTransition(ctx: CanvasRenderingContext2D): void {
    if (!this.transition) return;
    const t = this.transition;

    if (t.phase === 'walk' || t.phase === 'pose' || t.phase === 'hearts' || t.phase === 'text') {
      if (t.transitionIndex === 1) {
        // Him walking to center / posing
        const state = t.phase === 'walk' ? 'run' : 'idle';
        drawCharacter(ctx, t.walkX, GROUND_Y - 48, 36, 48,
          state, this.player.frame, HIM_STYLE);
      } else {
        // Transition 2: Her at center, Him walking in
        const herState = t.phase === 'walk' ? 'idle'
          : t.phase === 'pose' ? 'reach'
          : 'hug';
        const himState = t.phase === 'walk' ? 'run'
          : t.phase === 'pose' ? 'reach'
          : 'hug';
        drawCharacter(ctx, t.walkTargetX, GROUND_Y - 48, 36, 48,
          herState, this.togetherFrame, HER_STYLE);
        drawCharacter(ctx, t.secondCharWalkX, GROUND_Y - 48, 36, 48,
          himState, this.player.frame, HIM_STYLE);
      }

      // Transition text with glow and scale-in
      if (t.phase === 'text') {
        const textProgress = Math.min(t.timer / 0.3, 1);
        const scale = 0.8 + textProgress * 0.2;
        ctx.save();
        ctx.translate(LOGICAL_WIDTH / 2, GROUND_Y - 120);
        ctx.scale(scale, scale);
        ctx.globalAlpha = textProgress;

        // Glow behind text
        const accent = this.background.getAccentColor() || '#ff6b9d';
        ctx.shadowColor = accent;
        ctx.shadowBlur = 20;
        ctx.fillStyle = accent;
        ctx.font = "italic 18px 'Quicksand', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = textProgress * 0.4;
        ctx.fillText(t.message, 0, 0);

        // Main text
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.globalAlpha = textProgress;
        ctx.fillStyle = '#fff';
        ctx.fillText(t.message, 0, 0);
        ctx.restore();
      }
    }
  }

  pause(): void { this.paused = true; }
  resume(): void { this.paused = false; }

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
    this.currentAct = 'his';
    this.activeStyle = HIM_STYLE;
    this.transition = null;
    this.actTransitionTriggered1 = false;
    this.actTransitionTriggered2 = false;
    this.togetherFrame = 0;
    this.flutterSparkleTimer = 0;
    // Reset power-ups
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.magnetActive = false;
    this.magnetTimer = 0;
    this.slowTimeActive = false;
    this.slowTimeTimer = 0;
    // Reset golden corridor
    this.inGoldenCorridor = false;
    this.goldenTimer = 0;
    // Reset story events
    this.background.setStoryEvent(null);
  }

  get state(): LevelEngineState {
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
