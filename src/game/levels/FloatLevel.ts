import { Renderer, LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../../engine/Renderer';
import { Input } from '../../engine/Input';
import { ParticleSystem } from '../../engine/Particles';
import { audio } from '../../engine/AudioManager';
import { drawCharacter, drawCollectible, drawPowerUp, HIM_STYLE, HER_STYLE } from '../../engine/Sprites';
import type { CharacterStyle } from '../../engine/Sprites';
import type { LevelConfig, PowerUpType } from '../../levels/types';
import type { LevelEngine, LevelEngineState, EventCallback, GameEvent, ActType } from '../LevelEngine';

// ── Types ──────────────────────────────────────────────────────

interface FloatItem {
  x: number;
  y: number;
  kind: 'heart' | 'star' | 'memory' | 'cloud' | 'powerup';
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

const DEFAULT_GRAVITY = 200;
const DEFAULT_BOOST = 350;
const PLAYER_X_SPEED = 220;
const SCROLL_SPEED = 90;
const SHIELD_DUR = 6;
const MAGNET_DUR = 7;
const MAGNET_RANGE = 120;

const TD = { pose: 0.8, hearts: 0.8, text: 1.5, fadeOut: 0.5, fadeIn: 0.5 };

// ── FloatLevel ─────────────────────────────────────────────────

export class FloatLevel implements LevelEngine {
  private renderer: Renderer;
  private input: Input;
  private config: LevelConfig;
  private particles: ParticleSystem;

  // Player
  private playerX = LOGICAL_WIDTH / 2;
  private playerY = LOGICAL_HEIGHT * 0.45;
  private playerVY = 0;
  private playerWidth = 36;
  private playerHeight = 48;

  // Items & scroll
  private items: FloatItem[] = [];
  private scrollOffset = 0;

  // Stars background
  private stars: Array<{ x: number; y: number; sz: number; tw: number }> = [];
  // Shooting stars
  private shootingStars: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number }> = [];
  private shootingStarTimer = 0;

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

  // Duration & physics
  private totalDuration: number;
  private gravity: number;
  private boost: number;

  // Acts
  private currentAct: ActType = 'his';
  private activeStyle: CharacterStyle = HIM_STYLE;
  private actTriggered1 = false;
  private actTriggered2 = false;
  private herStartTime: number;
  private togetherStartTime: number;
  private transition: TransitionState | null = null;
  private togetherFrame = 0;

  // Spawning
  private spawnTimer = 0;
  private memIdx = 0;
  private nextMemTime = 0;
  private nextPuTime = 0;

  // Power-ups
  private shieldOn = false;
  private shieldTimer = 0;
  private magnetOn = false;
  private magnetTimer = 0;

  // Invincibility
  private invincible = false;
  private invTimer = 0;

  private eventCallback: EventCallback | null = null;

  constructor(renderer: Renderer, input: Input, config: LevelConfig) {
    this.renderer = renderer;
    this.input = input;
    this.config = config;
    this.particles = new ParticleSystem();
    this.lives = config.lives;

    this.totalDuration = config.floatDuration || 60;
    this.gravity = config.floatGravity || DEFAULT_GRAVITY;
    this.boost = config.floatBoost || DEFAULT_BOOST;

    const n = config.segments.length;
    this.herStartTime = (config.herStartSegment / n) * this.totalDuration;
    this.togetherStartTime = (config.togetherStartSegment / n) * this.totalDuration;

    if (config.memoryItems.length > 0) {
      this.nextMemTime = this.totalDuration / (config.memoryItems.length + 1);
    }
    this.nextPuTime = this.totalDuration * 0.2;

    // Background stars
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * LOGICAL_WIDTH,
        y: Math.random() * LOGICAL_HEIGHT,
        sz: 0.5 + Math.random() * 1.5,
        tw: Math.random() * Math.PI * 2,
      });
    }
  }

  onEvent(cb: EventCallback): void { this.eventCallback = cb; }
  private emit(ev: GameEvent): void { this.eventCallback?.(ev); }

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
    this.scrollOffset += SCROLL_SPEED * dt;

    this.updatePlayer(dt);
    this.checkActs();
    this.updateSpawning(dt);
    this.updateItems(dt);
    this.updatePowerUps(dt);

    if (this.invincible) { this.invTimer -= dt; if (this.invTimer <= 0) this.invincible = false; }
    if (this.combo > 0) { this.comboTimer -= dt; if (this.comboTimer <= 0) this.combo = 0; }

    this.particles.update(dt);
    this.renderer.camera.update(dt);

    // Shooting stars
    this.shootingStarTimer += dt;
    if (this.shootingStarTimer > 2.5 + Math.random() * 3) {
      this.shootingStarTimer = 0;
      this.shootingStars.push({
        x: Math.random() * LOGICAL_WIDTH,
        y: Math.random() * LOGICAL_HEIGHT * 0.4,
        vx: 150 + Math.random() * 100,
        vy: 60 + Math.random() * 40,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 0.8 + Math.random() * 0.5,
      });
    }
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.vx * dt;
      ss.y += ss.vy * dt;
      ss.life -= dt;
      if (ss.life <= 0) this.shootingStars.splice(i, 1);
    }

    // Trail sparkle
    if (this.frame % 3 === 0) {
      const trailCol = this.currentAct === 'together'
        ? ['#ffd700', '#ff6b9d'] : this.currentAct === 'her'
        ? ['#b388ff', '#e0aaff'] : ['#ff6b9d', '#ff9eb5'];
      this.particles.emit({
        x: this.playerX + (Math.random() - 0.5) * 10,
        y: this.playerY + this.playerHeight * 0.4,
        count: 1, speed: 20, color: trailCol,
        shape: Math.random() > 0.7 ? 'heart' : 'star',
        life: 0.5, size: 2, gravity: 30,
      });
    }

    this.emit({ type: 'progress', percent: Math.min(this.elapsed / this.totalDuration, 1) * 100 });

    if (this.elapsed >= this.totalDuration && !this.completed) {
      this.completed = true;
      this.emit({ type: 'levelComplete' });
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.particles.emit({
            x: LOGICAL_WIDTH * Math.random(), y: LOGICAL_HEIGHT * 0.3,
            count: 20, speed: 200,
            color: ['#ff6b9d', '#ffd700', '#7c4dff', '#00e5ff', '#ff4081'],
            shape: Math.random() > 0.5 ? 'heart' : 'star', life: 1.5, size: 6,
          });
        }, i * 200);
      }
      audio.playSynth('milestone');
      audio.haptic('heavy');
    }
  }

  private updatePlayer(dt: number): void {
    // Horizontal
    if (this.input.leftSideActive && !this.input.rightSideActive)
      this.playerX -= PLAYER_X_SPEED * dt;
    else if (this.input.rightSideActive && !this.input.leftSideActive)
      this.playerX += PLAYER_X_SPEED * dt;

    // Tap to boost
    if (this.input.consumeJump()) {
      this.playerVY = -this.boost;
      audio.playSynth('jump');
      audio.haptic('light');
      // Boost particles
      this.particles.emit({
        x: this.playerX, y: this.playerY + this.playerHeight * 0.3,
        count: 5, speed: 60, color: ['#fff', '#ffd700'],
        shape: 'star', life: 0.3, size: 3, gravity: 100,
      });
    }
    this.input.consumeSuperJump();
    this.input.consumeTaps();

    // Float effect while holding
    if (this.input.isTouching && this.playerVY > -50) {
      this.playerVY -= this.gravity * 0.6 * dt;
    }

    // Gravity
    this.playerVY += this.gravity * dt;
    this.playerY += this.playerVY * dt;

    // Clamp velocity
    this.playerVY = Math.max(-this.boost, Math.min(this.boost * 0.8, this.playerVY));

    // Boundaries
    this.playerX = Math.max(this.playerWidth / 2, Math.min(LOGICAL_WIDTH - this.playerWidth / 2, this.playerX));
    if (this.playerY < 40) { this.playerY = 40; this.playerVY = Math.max(0, this.playerVY); }
    if (this.playerY > LOGICAL_HEIGHT - 70) { this.playerY = LOGICAL_HEIGHT - 70; this.playerVY = Math.min(0, this.playerVY); }
  }

  // ── Acts ───────────────────────────────────────────────────

  private checkActs(): void {
    if (!this.actTriggered1 && this.currentAct === 'his' && this.elapsed >= this.herStartTime) {
      this.actTriggered1 = true;
      this.startTransition(1, this.config.transition1Message);
    }
    if (!this.actTriggered2 && this.currentAct === 'her' && this.elapsed >= this.togetherStartTime) {
      this.actTriggered2 = true;
      this.startTransition(2, this.config.transition2Message);
    }
  }

  private startTransition(idx: 1 | 2, msg: string): void {
    this.items.length = 0;
    this.transition = { phase: 'pose', timer: 0, message: msg, fadeAlpha: 0, transitionIndex: idx };
    this.playerVY = 0;
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
            y: LOGICAL_HEIGHT / 2 - 20,
            count: 1, speed: 40, color: ['#ff4d6d', '#ffd700'], shape: 'heart',
            life: 0.8, size: 4, gravity: -40,
          });
        }
        if (t.timer >= TD.pose) { t.phase = 'hearts'; t.timer = 0; }
        break;
      case 'hearts':
        if (Math.floor(t.timer * 8) % 3 === 0) {
          this.particles.emit({
            x: LOGICAL_WIDTH / 2 + (Math.random() - 0.5) * 60,
            y: LOGICAL_HEIGHT / 2,
            count: 3, speed: 70, color: ['#ff4d6d', '#ffd700', '#e0aaff'], shape: 'heart',
            life: 1.0, size: 5, gravity: -50,
          });
        }
        if (t.timer >= TD.hearts) { t.phase = 'text'; t.timer = 0; }
        break;
      case 'text':
        if (t.timer >= TD.text) { t.phase = 'fadeOut'; t.timer = 0; }
        break;
      case 'fadeOut':
        t.fadeAlpha = Math.min(t.timer / TD.fadeOut, 1);
        if (t.timer >= TD.fadeOut) {
          if (t.transitionIndex === 1) {
            this.currentAct = 'her'; this.activeStyle = HER_STYLE;
            this.emit({ type: 'actChange', act: 'her' });
          } else {
            this.currentAct = 'together'; this.activeStyle = HIM_STYLE;
            this.emit({ type: 'actChange', act: 'together' });
          }
          this.playerY = LOGICAL_HEIGHT * 0.45; this.playerVY = 0;
          t.phase = 'fadeIn'; t.timer = 0; t.fadeAlpha = 1;
        }
        break;
      case 'fadeIn':
        t.fadeAlpha = 1 - Math.min(t.timer / TD.fadeIn, 1);
        if (t.timer >= TD.fadeIn) this.transition = null;
        break;
    }
  }

  // ── Spawning ───────────────────────────────────────────────

  private updateSpawning(dt: number): void {
    const diff = Math.min(this.elapsed / this.totalDuration, 1);
    const interval = 0.7 - diff * 0.3;
    this.spawnTimer += dt;
    if (this.spawnTimer >= interval) {
      this.spawnTimer -= interval;
      this.spawnWave(diff);
    }

    if (this.memIdx < this.config.memoryItems.length && this.elapsed >= this.nextMemTime) {
      this.spawnItem('memory', undefined, this.config.memoryItems[this.memIdx]);
      this.memIdx++;
      if (this.memIdx < this.config.memoryItems.length)
        this.nextMemTime += this.totalDuration / (this.config.memoryItems.length + 1);
    }

    if (this.elapsed >= this.nextPuTime) {
      const types: PowerUpType[] = ['shield', 'magnet'];
      this.spawnItem('powerup', undefined, undefined, types[Math.floor(Math.random() * types.length)]);
      this.nextPuTime += this.totalDuration * 0.25;
    }
  }

  private spawnWave(diff: number): void {
    this.spawnItem('heart');
    if (Math.random() < (this.currentAct === 'together' ? 0.5 : 0.2)) this.spawnItem('heart');
    if (Math.random() < 0.15 + diff * 0.3) this.spawnItem('cloud');
    if (Math.random() < 0.08) this.spawnItem('star');
  }

  private spawnItem(kind: FloatItem['kind'], x?: number, memId?: string, puType?: PowerUpType): void {
    this.items.push({
      x: x ?? (30 + Math.random() * (LOGICAL_WIDTH - 60)),
      y: -20,
      kind, active: true,
      frame: Math.floor(Math.random() * 100),
      size: kind === 'memory' ? 14 : kind === 'powerup' ? 16 : kind === 'cloud' ? 20 : 10,
      memoryId: memId, powerUpType: puType,
    });
  }

  // ── Item update ────────────────────────────────────────────

  private updateItems(dt: number): void {
    const fallSpeed = SCROLL_SPEED + 30;
    const pcx = this.playerX;
    const pcy = this.playerY;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if (!it.active) { this.items.splice(i, 1); continue; }

      it.y += fallSpeed * dt;
      it.frame++;
      if (it.kind === 'cloud') it.x += Math.sin(it.frame * 0.02) * 0.5;

      // Magnet
      if (this.magnetOn && it.kind === 'heart') {
        const dx = pcx - it.x;
        const dy = pcy - it.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MAGNET_RANGE && d > 5) {
          const pull = 220 * (1 - d / MAGNET_RANGE);
          it.x += (dx / d) * pull * dt;
          it.y += (dy / d) * pull * dt;
        }
      }

      if (it.y > LOGICAL_HEIGHT + 30) {
        this.items.splice(i, 1);
        if (it.kind === 'heart') this.combo = 0;
        continue;
      }

      // Collision
      const dx = pcx - it.x;
      const dy = pcy - it.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 25 + it.size) {
        it.active = false;
        this.items.splice(i, 1);
        switch (it.kind) {
          case 'heart': this.collectHeart(it.x, it.y); break;
          case 'star': this.collectStar(it.x, it.y); break;
          case 'memory': this.collectMemory(it.x, it.y, it.memoryId!); break;
          case 'powerup': this.collectPU(it.x, it.y, it.powerUpType!); break;
          case 'cloud': this.hitCloud(it.x, it.y); break;
        }
      }
    }
  }

  // ── Collect / hit ──────────────────────────────────────────

  private collectHeart(x: number, y: number): void {
    this.hearts++; this.combo++; this.comboTimer = 2.0;
    const m = Math.min(1 + Math.floor(this.combo / 3) * 0.5, 4);
    const pts = Math.round(10 * m);
    this.score += pts;
    this.particles.emit({ x, y, count: 8, speed: 80, color: ['#ff4d6d', '#ff758f', '#ff9eb5'], shape: 'heart', life: 0.6, size: 5 });
    audio.playSynth('collect'); audio.haptic('light');
    this.emit({ type: 'heart', amount: 1 });
    this.emit({ type: 'score', points: pts, x, y });
    if (this.combo > 0 && this.combo % 3 === 0) {
      this.emit({ type: 'combo', count: this.combo, x, y: y - 20 });
      audio.playSynth('combo');
    }
  }

  private collectStar(x: number, y: number): void {
    this.score += 50;
    this.particles.emit({ x, y, count: 12, speed: 100, color: ['#ffd700', '#ffeb3b'], shape: 'star', life: 0.7, size: 6 });
    audio.playSynth('collect');
    this.emit({ type: 'star' }); this.emit({ type: 'score', points: 50, x, y });
  }

  private collectMemory(x: number, y: number, id: string): void {
    this.particles.emit({ x, y, count: 20, speed: 130, color: ['#e0aaff', '#9d4edd', '#fff', '#ffd700'], shape: 'star', life: 1.0, size: 7 });
    this.renderer.camera.shake(4, 0.4);
    audio.playSynth('milestone'); audio.haptic('medium');
    this.emit({ type: 'memory', id });
  }

  private collectPU(x: number, y: number, pu: PowerUpType): void {
    this.particles.emit({ x, y, count: 20, speed: 130, color: ['#ffd700', '#fff', '#4fc3f7'], shape: 'star', life: 0.8, size: 6 });
    this.emit({ type: 'powerup', powerUp: pu });
    if (pu === 'shield') { this.shieldOn = true; this.shieldTimer = SHIELD_DUR; audio.playSynth('shield'); }
    else if (pu === 'magnet') { this.magnetOn = true; this.magnetTimer = MAGNET_DUR; audio.playSynth('magnet'); }
    audio.haptic('medium');
  }

  private hitCloud(x: number, y: number): void {
    if (this.invincible) return;
    if (this.shieldOn) {
      this.shieldOn = false;
      audio.playSynth('block');
      this.particles.emit({ x, y, count: 15, speed: 130, color: ['#4fc3f7', '#81d4fa'], shape: 'star', life: 0.6, size: 5 });
      return;
    }
    this.lives--; this.combo = 0;
    this.invincible = true; this.invTimer = 1.5;
    this.renderer.camera.shake(6, 0.3);
    this.particles.emit({ x, y, count: 12, speed: 150, color: ['#ff4444', '#ff8888'], shape: 'circle', life: 0.5 });
    audio.playSynth('hit'); audio.haptic('heavy');
    this.emit({ type: 'hit', livesLeft: this.lives });
    if (this.lives <= 0) { this.gameOver = true; this.emit({ type: 'gameOver' }); }
  }

  private updatePowerUps(dt: number): void {
    if (this.shieldOn) { this.shieldTimer -= dt; if (this.shieldTimer <= 0) this.shieldOn = false; }
    if (this.magnetOn) { this.magnetTimer -= dt; if (this.magnetTimer <= 0) this.magnetOn = false; }
  }

  // ── Render ─────────────────────────────────────────────────

  render(_alpha: number): void {
    const ctx = this.renderer.ctx;
    this.renderer.clear();
    this.renderSky(ctx);
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

  private renderSky(ctx: CanvasRenderingContext2D): void {
    // Deep night gradient
    const g = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    g.addColorStop(0, '#0a0a2e');
    g.addColorStop(0.4, '#1a1a4e');
    g.addColorStop(1, '#2a1a3e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Parallax stars
    ctx.fillStyle = '#fff';
    for (const s of this.stars) {
      const y = ((s.y + this.scrollOffset * 0.08) % LOGICAL_HEIGHT + LOGICAL_HEIGHT) % LOGICAL_HEIGHT;
      ctx.globalAlpha = Math.sin(this.elapsed * 2 + s.tw) * 0.4 + 0.6;
      ctx.beginPath();
      ctx.arc(s.x, y, s.sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Shooting stars
    for (const ss of this.shootingStars) {
      const alpha = ss.life / ss.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(ss.x, ss.y);
      const angle = Math.atan2(ss.vy, ss.vx);
      ctx.rotate(angle);
      const len = 30 * alpha;
      const grad = ctx.createLinearGradient(0, 0, -len, 0);
      grad.addColorStop(0, '#fff');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-len, 0);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Nebula
    ctx.save();
    ctx.globalAlpha = 0.07;
    const nx = LOGICAL_WIDTH * 0.3;
    const ny = ((180 + this.scrollOffset * 0.04) % LOGICAL_HEIGHT);
    const ng = ctx.createRadialGradient(nx, ny, 10, nx, ny, 80);
    ng.addColorStop(0, '#e040fb');
    ng.addColorStop(1, 'transparent');
    ctx.fillStyle = ng;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    const nx2 = LOGICAL_WIDTH * 0.7;
    const ny2 = ((320 + this.scrollOffset * 0.06) % LOGICAL_HEIGHT);
    const ng2 = ctx.createRadialGradient(nx2, ny2, 10, nx2, ny2, 60);
    ng2.addColorStop(0, '#00e5ff');
    ng2.addColorStop(1, 'transparent');
    ctx.fillStyle = ng2;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx.restore();
  }

  private renderGameplay(ctx: CanvasRenderingContext2D): void {
    // Items
    for (const it of this.items) {
      if (!it.active) continue;
      switch (it.kind) {
        case 'heart': drawCollectible(ctx, it.x, it.y, it.size, 'heart', it.frame); break;
        case 'star': drawCollectible(ctx, it.x, it.y, it.size, 'star', it.frame); break;
        case 'memory': drawCollectible(ctx, it.x, it.y, it.size, 'memory', it.frame); break;
        case 'powerup':
          if (it.powerUpType) drawPowerUp(ctx, it.x, it.y, it.size, it.powerUpType, it.frame);
          break;
        case 'cloud': this.drawCloud(ctx, it.x, it.y, it.size, it.frame); break;
      }
    }

    // Player
    const cx = this.playerX - this.playerWidth / 2;
    const cy = this.playerY - this.playerHeight / 2;
    if (this.invincible && Math.floor(this.invTimer * 10) % 2 === 0) ctx.globalAlpha = 0.4;

    // Determine pose
    const pose = this.playerVY < -50 ? 'jump' : this.playerVY > 50 ? 'fall' : 'cheer';

    if (this.currentAct === 'together') {
      drawCharacter(ctx, cx - 15, cy, this.playerWidth, this.playerHeight, pose, this.frame, HIM_STYLE);
      drawCharacter(ctx, cx + 15, cy, this.playerWidth, this.playerHeight, pose, this.togetherFrame, HER_STYLE);
    } else {
      drawCharacter(ctx, cx, cy, this.playerWidth, this.playerHeight, pose, this.frame, this.activeStyle);
    }
    ctx.globalAlpha = 1;

    // Shield
    if (this.shieldOn) {
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(this.elapsed * 4) * 0.05;
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath();
      ctx.arc(this.playerX, this.playerY, this.playerHeight * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, frame: number): void {
    ctx.save();
    // Danger glow
    ctx.shadowColor = '#ff4060';
    ctx.shadowBlur = 12;
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#5a3060';
    ctx.beginPath();
    ctx.arc(x, y, sz, 0, Math.PI * 2);
    ctx.arc(x - sz * 0.6, y + 3, sz * 0.7, 0, Math.PI * 2);
    ctx.arc(x + sz * 0.6, y + 3, sz * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Inner highlight
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#9060a0';
    ctx.beginPath();
    ctx.arc(x, y - sz * 0.2, sz * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Lightning flash
    if (Math.sin(frame * 0.15) > 0.95) {
      ctx.fillStyle = '#ffd700';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(x, y + sz * 0.5);
      ctx.lineTo(x - 3, y + sz * 1.2);
      ctx.lineTo(x + 2, y + sz);
      ctx.lineTo(x - 1, y + sz * 1.6);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderTransition(ctx: CanvasRenderingContext2D): void {
    if (!this.transition) return;
    const t = this.transition;
    const cx = LOGICAL_WIDTH / 2 - this.playerWidth / 2;
    const cy = LOGICAL_HEIGHT / 2 - this.playerHeight / 2;

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
      wrapText(ctx, t.message, LOGICAL_WIDTH / 2, cy - 50, LOGICAL_WIDTH - 60, 20);
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
    this.actTriggered1 = false; this.actTriggered2 = false;
    this.togetherFrame = 0;
    this.spawnTimer = 0; this.memIdx = 0;
    this.shieldOn = false; this.shieldTimer = 0;
    this.magnetOn = false; this.magnetTimer = 0;
    this.invincible = false; this.invTimer = 0;
    this.playerX = LOGICAL_WIDTH / 2;
    this.playerY = LOGICAL_HEIGHT * 0.45;
    this.playerVY = 0; this.scrollOffset = 0;
    this.shootingStars.length = 0; this.shootingStarTimer = 0;
    if (this.config.memoryItems.length > 0) {
      this.nextMemTime = this.totalDuration / (this.config.memoryItems.length + 1);
    }
    this.nextPuTime = this.totalDuration * 0.2;
  }

  get state(): LevelEngineState {
    return {
      score: this.score, hearts: this.hearts, combo: this.combo,
      lives: this.lives,
      progress: Math.min(this.elapsed / this.totalDuration, 1),
      isGameOver: this.gameOver, isComplete: this.completed,
      speed: SCROLL_SPEED,
    };
  }

  destroy(): void { this.particles.clear(); }
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
