interface TextItem {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vy: number;
  scale: number;
}

export class FloatingText {
  private items: TextItem[] = [];

  add(x: number, y: number, text: string, color = '#fff', size = 16): void {
    this.items.push({
      x,
      y,
      text,
      color,
      size,
      life: 1.0,
      maxLife: 1.0,
      vy: -60,
      scale: 1.2,
    });
  }

  update(dt: number): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const t = this.items[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.items.splice(i, 1);
        continue;
      }
      t.y += t.vy * dt;
      t.vy *= 0.97; // slow down
      // Scale pops in then settles
      const progress = 1 - t.life / t.maxLife;
      t.scale = progress < 0.1 ? 0.5 + progress * 5 : 1.0;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const t of this.items) {
      const alpha = Math.min(t.life / (t.maxLife * 0.3), 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);
      ctx.font = `bold ${t.size}px 'Quicksand', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Outline
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, 0, 0);
      // Fill
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);
      ctx.restore();
    }
  }

  clear(): void {
    this.items.length = 0;
  }
}
