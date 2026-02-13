import { Renderer, LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../../engine/Renderer';
import { Input } from '../../engine/Input';
import { ParticleSystem } from '../../engine/Particles';
import { audio } from '../../engine/AudioManager';
import { Background } from '../Background';
import { drawCharacter, drawCollectible, drawPowerUp, HIM_STYLE, HER_STYLE } from '../../engine/Sprites';
import type { CharacterStyle } from '../../engine/Sprites';
import type { LevelConfig, PowerUpType } from '../../levels/types';
import type { LevelEngine, LevelEngineState, EventCallback, GameEvent, ActType } from '../LevelEngine';

// ── Types ──────────────────────────────────────────────────────

interface FallingItem {
  x: number;
  y: number;
  vy: number;
  kind: 'heart' | 'star' | 'memory' | 'bad' | 'powerup';
  active: boolean;
  frame: number;
  size: number;
  memoryId?: string;
  powerUpType?: PowerUpType;
}

interface TransitionState {
  phase: 'pose' | 'hearts' | 'text' | 'fadeOut' | 'fadeIn';
  timer: number;
  message: string;
  fadeAlpha: number;
  transitionIndex: 1 | 2;
}

// ── Constants ──────────────────────────────────────────────────

const PLAYER_Y = 530;
const PLAYER_SPEED = 300;
const BASE_FALL_SPEED = 90;
const MAX_FALL_SPEED = 190;
const CATCH_RADIUS = 32;
const SHIELD_DURATION = 7;
const MAGNET_DURATION = 8;
const MAGNET_RANGE = 130;

const TRANS_DUR = { pose: 0.8, hearts: 0.8, text: 1.5, fadeOut: 0.5, fadeIn: 0.5 };

// ── CatchLevel ─────────────────────────────────────────────────

export class CatchLevel implements LevelEngine {
  private renderer: Renderer;
  private input: Input;
  private config: LevelConfig;
  private background: Background;
  private particles: ParticleSystem;

  // Player
  private playerX = LOGICAL_WIDTH / 2;
  private playerWidth = 36;
  private playerHeight = 48;

  // Falling items
  private items: FallingItem[] = [];

  // Game state
  private score = 0;
  private hearts = 0;
  private combo = 0;
  private comboTimer = 0;
  private lives: number;
  private elapsed = 0;
  private paused = false;
  private completed = false;
  private gameOver = false;
  private frame = 0;

  // Duration
  private totalDuration: number;

  // Acts
  private currentAct: ActType = 'his';
  private activeStyle: CharacterStyle = HIM_STYLE;
  private actTransitionTriggered1 = false;
  private actTransitionTriggered2 = false;
  private herStartTime: number;
  private togetherStartTime: number;
  private transition: TransitionState | null = null;
  private togetherFrame = 0;

  // Spawning
  private spawnTimer = 0;
  private memoryIndex = 0;
  private nextMemoryTime = 0;
  private nextPowerUpTime = 0;

  // Power-ups
  private shieldActive = false;
  private shieldTimer = 0;
  private magnetActive = false;
  private magnetTimer = 0;

  // Invincibility
  private invincible = false;
  private invincibleTimer = 0;

  // Timer cleanup
  private pendingTimers: ReturnType<typeof setTimeout>[] = [];

  private eventCallback: EventCallback | null = null;

  constructor(renderer: Renderer, input: Input, config: LevelConfig) {
    this.renderer = renderer;
    this.input = input;
    this.config = config;
    this.background = new Background(config.theme);
    this.particles = new ParticleSystem();
    this.lives = config.lives;

    this.totalDuration = config.catchDuration || 55;

    // Map segment-based act boundaries to time
    const totalSegments = config.segments.length;
    this.herStartTime = (config.herStartSegment / totalSegments) * this.totalDuration;
    this.togetherStartTime = (config.togetherStartSegment / totalSegments) * this.totalDuration;

    // Memory spawn timing — evenly distributed
    if (config.memoryItems.length > 0) {
      this.nextMemoryTime = this.totalDuration / (config.memoryItems.length + 1);
    }
    this.nextPowerUpTime = this.totalDuration * 0.2;
  }

  onEvent(cb: EventCallback): void { this.eventCallback = cb; }
  private emit(event: GameEvent): void { this.eventCallback?.(event); }

  // ── Update ─────────────────────────────────────────────────

  update(dt: number): void {
    if (this.paused || this.completed || this.gameOver) return;

    if (this.transition) {
      this.updateTransition(dt);
      this.particles.update(dt);
      return;
    }

    this.elapsed += dt;
    this.frame++;
    this.togetherFrame++;

    // Consume unused jump state
    this.input.consumeJump();
    this.input.consumeSuperJump();

    this.updatePlayerPosition(dt);
    this.checkActTransitions();
    this.updateSpawning(dt);
    this.updateItems(dt);
    this.updatePowerUps(dt);

    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }

    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    this.background.update(dt, 40);
    this.particles.update(dt);
    this.renderer.camera.update(dt);

    const progress = Math.min(this.elapsed / this.totalDuration, 1);
    this.emit({ type: 'progress', percent: progress * 100 });

    if (this.elapsed >= this.totalDuration && !this.completed) {
      this.completed = true;
      this.emit({ type: 'levelComplete' });
      for (let i = 0; i < 5; i++) {
        this.pendingTimers.push(setTimeout(() => {
          this.particles.emit({
            x: LOGICAL_WIDTH * Math.random(),
            y: LOGICAL_HEIGHT * 0.3,
            count: 20,
            speed: 200,
            color: ['#ff6b9d', '#ffd700', '#7c4dff', '#00e5ff', '#ff4081'],
            shape: Math.random() > 0.5 ? 'heart' : 'star',
            life: 1.5, size: 6,
          });
        }, i * 200));
      }
      audio.playSynth('milestone');
      audio.haptic('heavy');
    }
  }

  private updatePlayerPosition(dt: number): void {
    const taps = this.input.consumeTaps();

    // Tap-to-position: move toward latest tap X
    if (taps.length > 0) {
      const targetX = taps[taps.length - 1].x;
      const dx = targetX - this.playerX;
      this.playerX += dx * Math.min(dt * 12, 1);
    }

    // Continuous hold: move left/right
    let moveDir = 0;
    if (this.input.leftSideActive && !this.input.rightSideActive) moveDir = -1;
    else if (this.input.rightSideActive && !this.input.leftSideActive) moveDir = 1;
    this.playerX += moveDir * PLAYER_SPEED * dt;

    this.playerX = Math.max(this.playerWidth / 2,
      Math.min(LOGICAL_WIDTH - this.playerWidth / 2, this.playerX));
  }

  // ── Act transitions ────────────────────────────────────────

  private checkActTransitions(): void {
    if (!this.actTransitionTriggered1 && this.currentAct === 'his'
        && this.elapsed >= this.herStartTime) {
      this.actTransitionTriggered1 = true;
      this.startTransition(1, this.config.transition1Message);
    }
    if (!this.actTransitionTriggered2 && this.currentAct === 'her'
        && this.elapsed >= this.togetherStartTime) {
      this.actTransitionTriggered2 = true;
      this.startTransition(2, this.config.transition2Message);
    }
  }

  private startTransition(index: 1 | 2, message: string): void {
    this.items.length = 0;
    this.transition = {
      phase: 'pose', timer: 0, message,
      fadeAlpha: 0, transitionIndex: index,
    };
  }

  private updateTransition(dt: number): void {
    if (!this.transition) return;
    const t = this.transition;
    t.timer += dt;

    switch (t.phase) {
      case 'pose':
        if (Math.floor(t.timer * 10) % 5 === 0) {
          this.particles.emit({
            x: LOGICAL_WIDTH / 2 + (Math.random() - 0.5) * 50,
            y: PLAYER_Y - 50,
            count: 1, speed: 40,
            color: ['#ff4d6d', '#ff758f'], shape: 'heart',
            life: 0.8, size: 4, gravity: -40,
          });
        }
        if (t.timer >= TRANS_DUR.pose) { t.phase = 'hearts'; t.timer = 0; }
        break;
      case 'hearts':
        if (Math.floor(t.timer * 10) % 3 === 0) {
          this.particles.emit({
            x: LOGICAL_WIDTH / 2 + (Math.random() - 0.5) * 60,
            y: PLAYER_Y - 40,
            count: 3, speed: 80,
            color: ['#ff4d6d', '#ffd700', '#ff9eb5'], shape: 'heart',
            life: 1.0, size: 5, gravity: -50,
          });
        }
        if (t.timer >= TRANS_DUR.hearts) { t.phase = 'text'; t.timer = 0; }
        break;
      case 'text':
        if (t.timer >= TRANS_DUR.text) { t.phase = 'fadeOut'; t.timer = 0; }
        break;
      case 'fadeOut':
        t.fadeAlpha = Math.min(t.timer / TRANS_DUR.fadeOut, 1);
        if (t.timer >= TRANS_DUR.fadeOut) {
          if (t.transitionIndex === 1) {
            this.currentAct = 'her';
            this.activeStyle = HER_STYLE;
            this.emit({ type: 'actChange', act: 'her' });
          } else {
            this.currentAct = 'together';
            this.activeStyle = HIM_STYLE;
            this.emit({ type: 'actChange', act: 'together' });
          }
          this.playerX = LOGICAL_WIDTH / 2;
          t.phase = 'fadeIn'; t.timer = 0; t.fadeAlpha = 1;
        }
        break;
      case 'fadeIn':
        t.fadeAlpha = 1 - Math.min(t.timer / TRANS_DUR.fadeIn, 1);
        if (t.timer >= TRANS_DUR.fadeIn) this.transition = null;
        break;
    }
  }

  // ── Spawning ───────────────────────────────────────────────

  private updateSpawning(dt: number): void {
    const difficulty = Math.min(this.elapsed / this.totalDuration, 1);
    const interval = 0.8 - difficulty * 0.35;

    this.spawnTimer += dt;
    if (this.spawnTimer >= interval) {
      this.spawnTimer -= interval;
      this.spawnWave(difficulty);
    }

    // Memory items at specific times
    if (this.memoryIndex < this.config.memoryItems.length
        && this.elapsed >= this.nextMemoryTime) {
      this.spawn('memory', undefined, this.config.memoryItems[this.memoryIndex]);
      this.memoryIndex++;
      if (this.memoryIndex < this.config.memoryItems.length) {
        this.nextMemoryTime += this.totalDuration / (this.config.memoryItems.length + 1);
      }
    }

    // Power-ups periodically
    if (this.elapsed >= this.nextPowerUpTime) {
      const types: PowerUpType[] = ['shield', 'magnet'];
      this.spawn('powerup', undefined, undefined, types[Math.floor(Math.random() * types.length)]);
      this.nextPowerUpTime += this.totalDuration * 0.25;
    }
  }

  private spawnWave(difficulty: number): void {
    this.spawn('heart');
    if (Math.random() < (this.currentAct === 'together' ? 0.65 : 0.3))
      this.spawn('heart');
    if (Math.random() < 0.12 + difficulty * 0.3)
      this.spawn('bad');
    if (Math.random() < 0.1)
      this.spawn('star');
  }

  private spawn(
    kind: FallingItem['kind'],
    x?: number,
    memoryId?: string,
    powerUpType?: PowerUpType,
  ): void {
    const difficulty = Math.min(this.elapsed / this.totalDuration, 1);
    const speed = BASE_FALL_SPEED + difficulty * (MAX_FALL_SPEED - BASE_FALL_SPEED);
    this.items.push({
      x: x ?? (30 + Math.random() * (LOGICAL_WIDTH - 60)),
      y: -20,
      vy: speed * (0.8 + Math.random() * 0.4),
      kind, active: true,
      frame: Math.floor(Math.random() * 100),
      size: kind === 'memory' ? 14 : kind === 'powerup' ? 16 : kind === 'bad' ? 12 : 10,
      memoryId, powerUpType,
    });
  }

  // ── Item update & collision ────────────────────────────────

  private updateItems(dt: number): void {
    const pcx = this.playerX;
    const pcy = PLAYER_Y - this.playerHeight / 2;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if (!it.active) { this.items.splice(i, 1); continue; }

      it.y += it.vy * dt;
      it.frame++;

      // Magnet pull
      if (this.magnetActive && it.kind === 'heart') {
        const dx = pcx - it.x;
        const dy = pcy - it.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MAGNET_RANGE && d > 5) {
          const pull = 250 * (1 - d / MAGNET_RANGE);
          it.x += (dx / d) * pull * dt;
          it.y += (dy / d) * pull * dt;
        }
      }

      // Off-screen
      if (it.y > LOGICAL_HEIGHT + 20) {
        this.items.splice(i, 1);
        if (it.kind === 'heart') this.combo = 0;
        continue;
      }

      // Collision
      const dx = pcx - it.x;
      const dy = pcy - it.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CATCH_RADIUS + it.size) {
        it.active = false;
        this.items.splice(i, 1);
        switch (it.kind) {
          case 'heart': this.collectHeart(it.x, it.y); break;
          case 'star': this.collectStar(it.x, it.y); break;
          case 'memory': this.collectMemory(it.x, it.y, it.memoryId!); break;
          case 'powerup': this.collectPowerUp(it.x, it.y, it.powerUpType!); break;
          case 'bad': this.hitBad(it.x, it.y); break;
        }
      }
    }
  }

  // ── Collection / hit handlers ──────────────────────────────

  private collectHeart(x: number, y: number): void {
    this.hearts++;
    this.combo++;
    this.comboTimer = 2.0;
    const mult = Math.min(1 + Math.floor(this.combo / 3) * 0.5, 4);
    const pts = Math.round(10 * mult);
    this.score += pts;
    this.particles.emit({ x, y, count: 8, speed: 80, color: ['#ff4d6d', '#ff758f', '#ff9eb5'], shape: 'heart', life: 0.6, size: 5 });
    audio.playSynth('collect');
    audio.haptic('light');
    this.emit({ type: 'heart', amount: 1 });
    this.emit({ type: 'score', points: pts, x, y });
    if (this.combo > 0 && this.combo % 3 === 0) {
      this.emit({ type: 'combo', count: this.combo, x, y: y - 20 });
      audio.playSynth('combo');
      this.particles.emit({ x, y, count: 15, speed: 120, color: ['#ffd700', '#ff6b9d', '#7c4dff'], shape: 'star', life: 0.8, size: 6 });
    }
  }

  private collectStar(x: number, y: number): void {
    this.score += 50;
    this.particles.emit({ x, y, count: 12, speed: 100, color: ['#ffd700', '#ffeb3b', '#fff176'], shape: 'star', life: 0.7, size: 6 });
    audio.playSynth('collect');
    audio.haptic('light');
    this.emit({ type: 'star' });
    this.emit({ type: 'score', points: 50, x, y });
  }

  private collectMemory(x: number, y: number, memoryId: string): void {
    this.particles.emit({ x, y, count: 20, speed: 130, color: ['#e0aaff', '#9d4edd', '#ffffff', '#ffd700'], shape: 'star', life: 1.0, size: 7 });
    this.renderer.camera.shake(4, 0.4);
    audio.playSynth('milestone');
    audio.haptic('medium');
    this.emit({ type: 'memory', id: memoryId });
  }

  private collectPowerUp(x: number, y: number, powerUp: PowerUpType): void {
    this.particles.emit({ x, y, count: 20, speed: 130, color: ['#ffd700', '#ffffff', '#4fc3f7'], shape: 'star', life: 0.8, size: 6 });
    this.emit({ type: 'powerup', powerUp });
    if (powerUp === 'shield') { this.shieldActive = true; this.shieldTimer = SHIELD_DURATION; audio.playSynth('shield'); }
    else if (powerUp === 'magnet') { this.magnetActive = true; this.magnetTimer = MAGNET_DURATION; audio.playSynth('magnet'); }
    else { audio.playSynth('collect'); }
    audio.haptic('medium');
  }

  private hitBad(x: number, y: number): void {
    if (this.invincible) return;
    if (this.shieldActive) {
      this.shieldActive = false; this.shieldTimer = 0;
      audio.playSynth('block');
      this.particles.emit({ x, y, count: 15, speed: 130, color: ['#4fc3f7', '#81d4fa', '#b3e5fc'], shape: 'star', life: 0.6, size: 5 });
      return;
    }
    this.lives--;
    this.combo = 0;
    this.invincible = true;
    this.invincibleTimer = 1.5;
    this.renderer.camera.shake(6, 0.3);
    this.particles.emit({ x, y, count: 12, speed: 150, color: ['#ff4444', '#ff8888', '#ffaaaa'], shape: 'circle', life: 0.5 });
    audio.playSynth('hit');
    audio.haptic('heavy');
    this.emit({ type: 'hit', livesLeft: this.lives });
    if (this.lives <= 0) { this.gameOver = true; this.emit({ type: 'gameOver' }); }
  }

  private updatePowerUps(dt: number): void {
    if (this.shieldActive) { this.shieldTimer -= dt; if (this.shieldTimer <= 0) this.shieldActive = false; }
    if (this.magnetActive) { this.magnetTimer -= dt; if (this.magnetTimer <= 0) this.magnetActive = false; }
  }

  // ── Render ─────────────────────────────────────────────────

  render(_alpha: number): void {
    const ctx = this.renderer.ctx;
    this.renderer.clear();
    this.background.render(ctx);
    this.renderer.beginCamera();

    if (this.transition) this.renderTransition(ctx);
    else this.renderGameplay(ctx);

    this.renderer.endCamera();
    this.particles.render(ctx);

    if (this.transition && this.transition.fadeAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.transition.fadeAlpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.restore();
    }
  }

  private renderGameplay(ctx: CanvasRenderingContext2D): void {
    // Falling items
    for (const it of this.items) {
      if (!it.active) continue;
      switch (it.kind) {
        case 'heart': drawCollectible(ctx, it.x, it.y, it.size, 'heart', it.frame); break;
        case 'star':  drawCollectible(ctx, it.x, it.y, it.size, 'star', it.frame); break;
        case 'memory': drawCollectible(ctx, it.x, it.y, it.size, 'memory', it.frame); break;
        case 'powerup':
          if (it.powerUpType) drawPowerUp(ctx, it.x, it.y, it.size, it.powerUpType, it.frame);
          break;
        case 'bad': this.drawBad(ctx, it.x, it.y, it.size, it.frame); break;
      }
    }

    // Player character
    const cx = this.playerX - this.playerWidth / 2;
    const cy = PLAYER_Y - this.playerHeight;

    if (this.invincible && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    if (this.currentAct === 'together') {
      drawCharacter(ctx, cx - 15, cy, this.playerWidth, this.playerHeight, 'idle', this.frame, HIM_STYLE);
      drawCharacter(ctx, cx + 15, cy, this.playerWidth, this.playerHeight, 'idle', this.togetherFrame, HER_STYLE);
    } else {
      drawCharacter(ctx, cx, cy, this.playerWidth, this.playerHeight, 'idle', this.frame, this.activeStyle);
    }
    ctx.globalAlpha = 1;

    // Shield aura
    if (this.shieldActive) {
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(this.elapsed * 4) * 0.05;
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath();
      ctx.arc(this.playerX, PLAYER_Y - this.playerHeight / 2, this.playerHeight * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Magnet lines
    if (this.magnetActive) {
      ctx.save();
      ctx.strokeStyle = '#ff5252';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      const pcx = this.playerX;
      const pcy = PLAYER_Y - this.playerHeight / 2;
      for (const it of this.items) {
        if (it.kind === 'heart' && it.active) {
          const d = Math.sqrt((pcx - it.x) ** 2 + (pcy - it.y) ** 2);
          if (d < MAGNET_RANGE) {
            ctx.beginPath();
            ctx.moveTo(it.x, it.y);
            ctx.lineTo(pcx, pcy);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // Catch-zone glow — pulses with combo
    ctx.save();
    const comboGlow = Math.min(this.combo / 15, 1);
    const baseAlpha = 0.08 + comboGlow * 0.15;
    const glowR = CATCH_RADIUS + 15 + Math.sin(this.elapsed * 3) * 5;
    const cg = ctx.createRadialGradient(this.playerX, PLAYER_Y, 5, this.playerX, PLAYER_Y, glowR);
    const glowColor = this.combo >= 9 ? '255,215,0' : '255,107,157';
    cg.addColorStop(0, `rgba(${glowColor},${baseAlpha})`);
    cg.addColorStop(1, `rgba(${glowColor},0)`);
    ctx.fillStyle = cg;
    ctx.fillRect(this.playerX - 60, PLAYER_Y - 60, 120, 120);
    ctx.restore();

    // Together-act ambient petals
    if (this.currentAct === 'together' && this.frame % 20 === 0) {
      this.particles.emit({
        x: Math.random() * LOGICAL_WIDTH,
        y: -10,
        count: 1, speed: 15,
        color: ['#ff9eb5', '#ffb6c1', '#ffd700'],
        shape: 'heart', life: 3.0, size: 3, gravity: 20,
      });
    }
  }

  private drawBad(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frame: number): void {
    ctx.save();
    const bob = Math.sin(frame * 0.06) * 2;
    ctx.translate(x, y + bob);
    ctx.rotate(frame * 0.02);

    // Spiky thorny shape
    ctx.fillStyle = '#4a2040';
    ctx.strokeStyle = '#8b3060';
    ctx.lineWidth = 2;
    const spikes = 6;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? size * 1.2 : size * 0.6;
      const a = (i / (spikes * 2)) * Math.PI * 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Danger glow center
    ctx.shadowColor = '#ff0040';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff0040';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private renderTransition(ctx: CanvasRenderingContext2D): void {
    if (!this.transition) return;
    const t = this.transition;
    const cx = LOGICAL_WIDTH / 2 - this.playerWidth / 2;
    const cy = PLAYER_Y - this.playerHeight;

    if (t.transitionIndex === 1) {
      drawCharacter(ctx, cx, cy, this.playerWidth, this.playerHeight, 'idle', this.frame, HIM_STYLE);
    } else {
      const pose = (t.phase === 'hearts' || t.phase === 'text') ? 'hug' : 'reach';
      drawCharacter(ctx, cx - 20, cy, this.playerWidth, this.playerHeight, pose, this.togetherFrame, HER_STYLE);
      drawCharacter(ctx, cx + 20, cy, this.playerWidth, this.playerHeight, pose, this.frame, HIM_STYLE);
    }

    if (t.phase === 'text') {
      const p = Math.min(t.timer / 0.3, 1);
      ctx.save();
      ctx.globalAlpha = p;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#fff';
      ctx.font = "italic 15px 'Quicksand', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      wrapText(ctx, t.message, LOGICAL_WIDTH / 2, PLAYER_Y - 130, LOGICAL_WIDTH - 60, 20);
      ctx.restore();
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────

  pause(): void { this.paused = true; }
  resume(): void { this.paused = false; }

  retry(): void {
    this.items.length = 0;
    this.particles.clear();
    this.score = 0; this.hearts = 0; this.combo = 0; this.comboTimer = 0;
    this.lives = this.config.lives;
    this.elapsed = 0; this.frame = 0;
    this.paused = false; this.completed = false; this.gameOver = false;
    this.currentAct = 'his'; this.activeStyle = HIM_STYLE;
    this.transition = null;
    this.actTransitionTriggered1 = false; this.actTransitionTriggered2 = false;
    this.togetherFrame = 0;
    this.spawnTimer = 0; this.memoryIndex = 0;
    this.shieldActive = false; this.shieldTimer = 0;
    this.magnetActive = false; this.magnetTimer = 0;
    this.invincible = false; this.invincibleTimer = 0;
    this.playerX = LOGICAL_WIDTH / 2;
    if (this.config.memoryItems.length > 0) {
      this.nextMemoryTime = this.totalDuration / (this.config.memoryItems.length + 1);
    }
    this.nextPowerUpTime = this.totalDuration * 0.2;
    this.background.setStoryEvent(null);
  }

  get state(): LevelEngineState {
    return {
      score: this.score,
      hearts: this.hearts,
      combo: this.combo,
      lives: this.lives,
      progress: Math.min(this.elapsed / this.totalDuration, 1),
      isGameOver: this.gameOver,
      isComplete: this.completed,
      speed: BASE_FALL_SPEED + (this.elapsed / this.totalDuration) * (MAX_FALL_SPEED - BASE_FALL_SPEED),
    };
  }

  destroy(): void {
    this.pendingTimers.forEach(clearTimeout);
    this.pendingTimers.length = 0;
    this.particles.clear();
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
  const words = text.split(' ');
  let line = '';
  let ty = y;
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, ty);
      line = word;
      ty += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, ty);
}
