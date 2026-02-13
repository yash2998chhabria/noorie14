import { LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../engine/Renderer';
import { getThemeColors, drawRain, drawRainbow, drawShootingStar } from '../engine/Sprites';
import type { ThemeColors } from '../engine/Sprites';
import { GROUND_Y } from '../engine/Physics';
import { audio } from '../engine/AudioManager';
import type { StoryEvent } from '../levels/types';

export class Background {
  private theme = 1;
  private colors!: ThemeColors;
  private time = 0;
  private frame = 0;
  // Parallax layer offsets
  private farX = 0;
  private midX = 0;
  private nearX = 0;

  // Story event state
  private storyEvent: StoryEvent | null = null;
  private storyIntensity = 0;
  private storyTimer = 0;
  private fireworkTimer = 0;
  private shootingStarTimer = 0;
  private shootingStars: Array<{ x: number; y: number; alpha: number; angle: number; length: number; life: number }> = [];

  // Rain state (L3 — rain during His/Her, clears on Together)
  private rainActive = false;
  private rainIntensity = 0;
  private lightningTimer = 0;
  private lightningFlash = 0;

  // Flower bloom state
  private flowerCount = 8;
  private flowerScale = 1;

  // Rainbow state
  private rainbowAlpha = 0;

  constructor(theme: number) {
    this.setTheme(theme);
  }

  setTheme(theme: number): void {
    this.theme = theme;
    this.colors = getThemeColors(theme);
    // L3: rain starts active
    if (theme === 3) {
      this.rainActive = true;
      this.rainIntensity = 1;
    }
  }

  getAccentColor(): string {
    return this.colors.accent;
  }

  setStoryEvent(event: StoryEvent | null): void {
    this.storyEvent = event;
    this.storyIntensity = 0;
    this.storyTimer = 0;
    this.fireworkTimer = 0;

    if (event === 'flowers_bloom') {
      // Flowers will scale-in
      this.flowerCount = 25;
      this.flowerScale = 0;
    }
    if (event === 'rain_clear') {
      // Rain will fade to 0
    }
    if (event === 'rainbow_appear') {
      this.rainbowAlpha = 0;
    }
  }

  update(dt: number, speed: number): void {
    this.time += dt;
    this.frame++;
    this.farX -= speed * 0.1 * dt;
    this.midX -= speed * 0.3 * dt;
    this.nearX -= speed * 0.6 * dt;

    // Story event fade-in
    if (this.storyEvent) {
      this.storyTimer += dt;
      this.storyIntensity = Math.min(this.storyTimer / 2, 1);

      if (this.storyEvent === 'flowers_bloom') {
        this.flowerScale = Math.min(this.storyTimer / 1.5, 1);
      }
      if (this.storyEvent === 'rain_clear') {
        this.rainIntensity = Math.max(1 - this.storyTimer / 3, 0);
        if (this.rainIntensity <= 0) {
          this.rainActive = false;
        }
      }
      if (this.storyEvent === 'rainbow_appear') {
        this.rainbowAlpha = Math.min(this.storyTimer / 3, 0.4);
      }
      if (this.storyEvent === 'fireworks') {
        this.fireworkTimer += dt;
        if (this.fireworkTimer >= 0.8) {
          this.fireworkTimer -= 0.8;
          audio.playSynth('firework');
        }
      }
      if (this.storyEvent === 'shooting_stars') {
        this.shootingStarTimer += dt;
        const interval = 2 + Math.sin(this.time) * 1; // 2-4s
        if (this.shootingStarTimer >= interval) {
          this.shootingStarTimer -= interval;
          this.shootingStars.push({
            x: Math.random() * LOGICAL_WIDTH * 0.8 + LOGICAL_WIDTH * 0.1,
            y: Math.random() * GROUND_Y * 0.25,
            alpha: 1,
            angle: Math.PI * 0.2 + Math.random() * 0.3,
            length: 40 + Math.random() * 30,
            life: 1.0,
          });
        }
      }
    }

    // Lightning for theme 3 during rain
    if (this.theme === 3 && this.rainActive && this.rainIntensity > 0.3) {
      this.lightningTimer += dt;
      if (this.lightningTimer > 4 + Math.random() * 6) {
        this.lightningTimer = 0;
        this.lightningFlash = 0.6;
        audio.playSynth('block'); // thunder sound
      }
      if (this.lightningFlash > 0) {
        this.lightningFlash = Math.max(0, this.lightningFlash - dt * 4);
      }
    }

    // Update shooting stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.life -= dt;
      s.alpha = Math.max(s.life, 0);
      s.x += Math.cos(s.angle) * 200 * dt;
      s.y += Math.sin(s.angle) * 200 * dt;
      if (s.life <= 0) {
        this.shootingStars.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const c = this.colors;
    const W = LOGICAL_WIDTH;
    const groundY = GROUND_Y;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, c.skyTop);
    skyGrad.addColorStop(1, c.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, groundY);

    // Stars for level 4
    if (this.theme === 4) {
      this.drawStars(ctx);
    }

    // Shooting stars (story event)
    for (const s of this.shootingStars) {
      drawShootingStar(ctx, s.x, s.y, s.length, s.angle, s.alpha);
    }

    // Far layer — distant hills/clouds
    this.drawFarLayer(ctx, groundY);

    // Rainbow (story event, rendered between far and mid)
    if (this.storyEvent === 'rainbow_appear' && this.rainbowAlpha > 0) {
      drawRainbow(ctx, W / 2, groundY - 20, 120, this.rainbowAlpha);
    }

    // Mid layer — closer hills
    this.drawMidLayer(ctx, groundY);

    // Rain (L3 His/Her acts, or fading during rain_clear)
    if (this.rainActive && this.rainIntensity > 0) {
      drawRain(ctx, W, groundY + 40, this.rainIntensity, this.frame);
    }

    // Lightning flash overlay (theme 3)
    if (this.lightningFlash > 0) {
      ctx.save();
      ctx.globalAlpha = this.lightningFlash * 0.35;
      ctx.fillStyle = '#e0e0ff';
      ctx.fillRect(0, 0, W, groundY);
      ctx.restore();
    }

    // Sunbeam after rain clears
    if (this.storyEvent === 'rain_clear' && this.rainIntensity <= 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(this.storyIntensity * 0.2, 0.15);
      const sunGrad = ctx.createLinearGradient(W * 0.3, 0, W * 0.7, groundY * 0.6);
      sunGrad.addColorStop(0, '#ffd700');
      sunGrad.addColorStop(1, 'rgba(255,215,0,0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(W * 0.3, 0, W * 0.4, groundY * 0.6);
      ctx.restore();
    }

    // Fireworks (story event)
    if (this.storyEvent === 'fireworks' && this.storyIntensity > 0) {
      this.drawFireworks(ctx, groundY);
    }

    // Near layer — bushes/trees
    this.drawNearLayer(ctx, groundY);

    // Ground
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, LOGICAL_HEIGHT);
    groundGrad.addColorStop(0, c.ground);
    groundGrad.addColorStop(1, c.groundDark);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, W, LOGICAL_HEIGHT - groundY);

    // Ground line
    ctx.strokeStyle = c.groundDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Ground details
    this.drawGroundDetails(ctx, groundY);

    // Petal particles for flowers_bloom
    if (this.storyEvent === 'flowers_bloom' && this.storyIntensity > 0) {
      this.drawPetalParticles(ctx, groundY);
    }
  }

  private drawStars(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const sx = ((i * 73 + 17) % LOGICAL_WIDTH);
      const sy = ((i * 41 + 7) % (GROUND_Y * 0.6));
      const twinkle = Math.sin(this.time * 2 + i * 0.7) * 0.5 + 0.5;
      ctx.globalAlpha = 0.3 + twinkle * 0.7;
      const size = (i % 3 === 0) ? 2 : 1;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawFarLayer(ctx: CanvasRenderingContext2D, groundY: number): void {
    const c = this.colors;
    ctx.fillStyle = c.bgFar;
    const offset = ((this.farX % 400) + 400) % 400;

    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = -offset; x < LOGICAL_WIDTH + 100; x += 80) {
      const h = 40 + Math.sin(x * 0.01 + 1) * 25;
      ctx.quadraticCurveTo(x + 20, groundY - h - 15, x + 40, groundY - h);
      ctx.quadraticCurveTo(x + 60, groundY - h + 10, x + 80, groundY);
    }
    ctx.lineTo(LOGICAL_WIDTH, groundY);
    ctx.closePath();
    ctx.fill();

    // Clouds (except level 4)
    if (this.theme !== 4) {
      this.drawClouds(ctx, offset);
    }
  }

  private drawClouds(ctx: CanvasRenderingContext2D, offset: number): void {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 5; i++) {
      const cx = ((i * 90 + offset * 0.3) % (LOGICAL_WIDTH + 80)) - 40;
      const cy = 40 + i * 25;
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.arc(cx + 18, cy - 5, 15, 0, Math.PI * 2);
      ctx.arc(cx + 30, cy, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawMidLayer(ctx: CanvasRenderingContext2D, groundY: number): void {
    const c = this.colors;
    ctx.fillStyle = c.bgMid;
    const offset = ((this.midX % 300) + 300) % 300;

    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = -offset; x < LOGICAL_WIDTH + 80; x += 60) {
      const h = 25 + Math.sin(x * 0.02 + 3) * 15;
      ctx.quadraticCurveTo(x + 15, groundY - h - 10, x + 30, groundY - h);
      ctx.quadraticCurveTo(x + 45, groundY - h + 8, x + 60, groundY);
    }
    ctx.lineTo(LOGICAL_WIDTH, groundY);
    ctx.closePath();
    ctx.fill();

    // Theme-specific details
    if (this.theme === 1) {
      this.drawFlowers(ctx, offset, groundY);
    } else if (this.theme === 2) {
      this.drawConcertStage(ctx, groundY);
    } else if (this.theme === 3) {
      this.drawFallingLeaves(ctx);
    } else if (this.theme === 4) {
      this.drawLanterns(ctx, offset);
    }
  }

  private drawNearLayer(ctx: CanvasRenderingContext2D, groundY: number): void {
    const c = this.colors;
    ctx.fillStyle = c.bgNear + '80';
    const offset = ((this.nearX % 200) + 200) % 200;

    for (let x = -offset; x < LOGICAL_WIDTH + 60; x += 50) {
      ctx.beginPath();
      ctx.arc(x + 15, groundY - 5, 12, 0, Math.PI * 2);
      ctx.arc(x + 30, groundY - 8, 14, 0, Math.PI * 2);
      ctx.arc(x + 42, groundY - 4, 11, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawGroundDetails(ctx: CanvasRenderingContext2D, groundY: number): void {
    const offset = ((this.nearX % 100) + 100) % 100;
    ctx.fillStyle = this.colors.groundDark + '40';

    for (let x = -offset; x < LOGICAL_WIDTH + 30; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 5);
      ctx.lineTo(x + 3, groundY + 2);
      ctx.lineTo(x + 6, groundY + 5);
      ctx.fill();
    }
  }

  private drawFlowers(ctx: CanvasRenderingContext2D, _offset: number, groundY: number): void {
    const colors = ['#FF6B9D', '#FF9ECD', '#FFB7D5', '#FF4081'];
    const count = this.storyEvent === 'flowers_bloom' ? this.flowerCount : 8;
    const scale = this.storyEvent === 'flowers_bloom' ? this.flowerScale : 1;

    for (let i = 0; i < count; i++) {
      const fx = ((i * 50 + this.time * 10) % LOGICAL_WIDTH);
      const fy = groundY - 15 - Math.sin(i * 2) * 10;
      ctx.fillStyle = colors[i % colors.length];
      ctx.save();
      ctx.translate(fx, fy);

      // Scale-in animation for bloom event
      const s = i >= 8 ? scale : 1; // existing flowers stay, new ones scale in
      ctx.scale(s, s);

      // Petals
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(pa) * 4, Math.sin(pa) * 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Center
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawPetalParticles(ctx: CanvasRenderingContext2D, groundY: number): void {
    // Pink petals floating up from ground
    ctx.fillStyle = '#FF9ECD';
    const count = Math.floor(this.storyIntensity * 8);
    for (let i = 0; i < count; i++) {
      const px = ((i * 43 + this.time * 25) % (LOGICAL_WIDTH + 20)) - 10;
      const py = groundY - 20 - ((i * 67 + this.time * 50) % 80);
      const size = 2 + Math.sin(this.time + i * 1.3) * 1;
      ctx.globalAlpha = 0.4 + Math.sin(this.time * 2 + i) * 0.2;
      ctx.beginPath();
      ctx.ellipse(px, py, size, size * 0.6, this.time + i, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawFireworks(ctx: CanvasRenderingContext2D, groundY: number): void {
    const colors = ['#ffd700', '#ff4081', '#9c27b0', '#00e5ff', '#ff6b9d'];
    // Draw 2-3 concurrent firework bursts
    for (let f = 0; f < 3; f++) {
      const cycle = (this.time * 1.25 + f * 0.27) % 1;
      if (cycle > 0.5) continue; // only show first half

      const fx = (f * 137 + Math.floor(this.time * 1.25)) * 73 % LOGICAL_WIDTH;
      const fy = groundY * 0.1 + (f * 41) % (groundY * 0.25);
      const burstPhase = cycle * 2; // 0-1

      ctx.save();
      ctx.globalAlpha = (1 - burstPhase) * this.storyIntensity;
      const color = colors[(f + Math.floor(this.time)) % colors.length];
      ctx.fillStyle = color;
      const rays = 8;
      for (let r = 0; r < rays; r++) {
        const angle = (r / rays) * Math.PI * 2;
        const dist = burstPhase * 40;
        const px = fx + Math.cos(angle) * dist;
        const py = fy + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(px, py, 3 - burstPhase * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawConcertStage(ctx: CanvasRenderingContext2D, groundY: number): void {
    // Speaker stacks on edges
    for (const sx of [15, LOGICAL_WIDTH - 30]) {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(sx, groundY - 35, 18, 35);
      ctx.fillStyle = '#333';
      ctx.fillRect(sx + 2, groundY - 33, 14, 14);
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.arc(sx + 9, groundY - 26, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.fillRect(sx + 2, groundY - 16, 14, 10);
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.arc(sx + 9, groundY - 11, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pulsing floor neon strip
    const pulse = Math.sin(this.time * Math.PI * 4) * 0.3 + 0.5;
    ctx.save();
    ctx.globalAlpha = pulse * 0.4;
    const stripGrad = ctx.createLinearGradient(40, groundY - 2, LOGICAL_WIDTH - 40, groundY - 2);
    stripGrad.addColorStop(0, '#ff00ff');
    stripGrad.addColorStop(0.5, '#00ffff');
    stripGrad.addColorStop(1, '#ff00ff');
    ctx.fillStyle = stripGrad;
    ctx.fillRect(40, groundY - 3, LOGICAL_WIDTH - 80, 3);
    ctx.restore();
  }

  private drawFallingLeaves(ctx: CanvasRenderingContext2D): void {
    const leafColors = ['#FF8C00', '#FF6347', '#FFD700', '#CD853F'];
    for (let i = 0; i < 12; i++) {
      const lx = ((i * 37 + this.time * 20) % (LOGICAL_WIDTH + 40)) - 20;
      const ly = ((i * 53 + this.time * 40) % (GROUND_Y + 20));
      const rot = this.time * 2 + i * 1.5;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(rot);
      ctx.fillStyle = leafColors[i % leafColors.length];
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawLanterns(ctx: CanvasRenderingContext2D, offset: number): void {
    for (let i = 0; i < 6; i++) {
      const lx = ((i * 70 + offset * 0.5) % (LOGICAL_WIDTH + 40)) - 20;
      const ly = 80 + Math.sin(this.time + i * 0.8) * 10;
      // Glow
      ctx.fillStyle = 'rgba(255,200,50,0.15)';
      ctx.beginPath();
      ctx.arc(lx, ly, 20, 0, Math.PI * 2);
      ctx.fill();
      // Lantern body
      ctx.fillStyle = '#FFA726';
      ctx.beginPath();
      ctx.ellipse(lx, ly, 8, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // Inner glow
      ctx.fillStyle = '#FFE082';
      ctx.beginPath();
      ctx.ellipse(lx, ly, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
