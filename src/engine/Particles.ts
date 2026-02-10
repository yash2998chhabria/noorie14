import { ObjectPool } from './ObjectPool';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape: 'circle' | 'heart' | 'star' | 'square';
  gravity: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
}

function createParticle(): Particle {
  return {
    x: 0, y: 0, vx: 0, vy: 0,
    life: 0, maxLife: 1, size: 4,
    color: '#ff6b9d', shape: 'circle',
    gravity: 0, alpha: 1, rotation: 0,
    rotationSpeed: 0,
  };
}

function resetParticle(p: Particle): void {
  p.x = 0; p.y = 0; p.vx = 0; p.vy = 0;
  p.life = 0; p.maxLife = 1; p.size = 4;
  p.color = '#ff6b9d'; p.shape = 'circle';
  p.gravity = 0; p.alpha = 1; p.rotation = 0;
  p.rotationSpeed = 0;
}

export interface EmitConfig {
  x: number;
  y: number;
  count: number;
  speed?: number;
  spread?: number;
  life?: number;
  size?: number;
  sizeVariance?: number;
  color?: string | string[];
  shape?: Particle['shape'];
  gravity?: number;
  angle?: number;
}

export class ParticleSystem {
  private pool: ObjectPool<Particle>;
  private active: Particle[] = [];

  constructor() {
    this.pool = new ObjectPool(createParticle, resetParticle, 200);
  }

  emit(config: EmitConfig): void {
    const {
      x, y, count,
      speed = 100,
      spread = Math.PI * 2,
      life = 0.8,
      size = 4,
      sizeVariance = 2,
      color = '#ff6b9d',
      shape = 'circle',
      gravity = 200,
      angle = -Math.PI / 2,
    } = config;

    const colors = Array.isArray(color) ? color : [color];

    for (let i = 0; i < count; i++) {
      const p = this.pool.acquire();
      const a = angle + (Math.random() - 0.5) * spread;
      const s = speed * (0.5 + Math.random() * 0.5);
      p.x = x + (Math.random() - 0.5) * 10;
      p.y = y + (Math.random() - 0.5) * 10;
      p.vx = Math.cos(a) * s;
      p.vy = Math.sin(a) * s;
      p.life = life * (0.7 + Math.random() * 0.3);
      p.maxLife = p.life;
      p.size = size + (Math.random() - 0.5) * sizeVariance;
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.shape = shape;
      p.gravity = gravity;
      p.alpha = 1;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 6;
      this.active.push(p);
    }
  }

  update(dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.pool.release(p);
        this.active[i] = this.active[this.active.length - 1];
        this.active.pop();
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      p.rotation += p.rotationSpeed * dt;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.active) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      switch (p.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
          break;
        case 'heart':
          drawHeart(ctx, 0, 0, p.size);
          break;
        case 'star':
          drawStar(ctx, 0, 0, p.size);
          break;
      }
      ctx.restore();
    }
  }

  get count(): number {
    return this.active.length;
  }

  clear(): void {
    this.pool.releaseAll(this.active);
    this.active.length = 0;
  }
}

export function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  const s = size;
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y - s * 0.3, x - s, y - s * 0.3, x - s, y + s * 0.1);
  ctx.bezierCurveTo(x - s, y + s * 0.6, x, y + s * 0.9, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.9, x + s, y + s * 0.6, x + s, y + s * 0.1);
  ctx.bezierCurveTo(x + s, y - s * 0.3, x, y - s * 0.3, x, y + s * 0.3);
  ctx.fill();
}

export function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size * 0.4;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}
