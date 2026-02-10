import { LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../engine/Renderer';
import { getThemeColors } from '../engine/Sprites';
import type { ThemeColors } from '../engine/Sprites';
import { GROUND_Y } from '../engine/Physics';

export class Background {
  private theme = 1;
  private colors!: ThemeColors;
  private time = 0;
  // Parallax layer offsets
  private farX = 0;
  private midX = 0;
  private nearX = 0;

  constructor(theme: number) {
    this.setTheme(theme);
  }

  setTheme(theme: number): void {
    this.theme = theme;
    this.colors = getThemeColors(theme);
  }

  update(dt: number, speed: number): void {
    this.time += dt;
    this.farX -= speed * 0.1 * dt;
    this.midX -= speed * 0.3 * dt;
    this.nearX -= speed * 0.6 * dt;
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

    // Far layer — distant hills/clouds
    this.drawFarLayer(ctx, groundY);

    // Mid layer — closer hills
    this.drawMidLayer(ctx, groundY);

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
  }

  private drawStars(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffffff';
    // Deterministic stars based on position
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
      // Bushes
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
      // Small grass/ground details
      ctx.beginPath();
      ctx.moveTo(x, groundY + 5);
      ctx.lineTo(x + 3, groundY + 2);
      ctx.lineTo(x + 6, groundY + 5);
      ctx.fill();
    }
  }

  private drawFlowers(ctx: CanvasRenderingContext2D, _offset: number, groundY: number): void {
    const colors = ['#FF6B9D', '#FF9ECD', '#FFB7D5', '#FF4081'];
    for (let i = 0; i < 8; i++) {
      const fx = ((i * 50 + this.time * 10) % LOGICAL_WIDTH);
      const fy = groundY - 15 - Math.sin(i * 2) * 10;
      ctx.fillStyle = colors[i % colors.length];
      // Petals
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(pa) * 4, fy + Math.sin(pa) * 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Center
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(fx, fy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
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
