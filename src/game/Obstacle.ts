import type { AABB } from '../engine/Physics';
import { GROUND_Y } from '../engine/Physics';
import type { ObstacleType } from '../engine/Sprites';
import { drawObstacle } from '../engine/Sprites';

export class Obstacle {
  x = 0;
  y = 0;
  width = 40;
  height = 40;
  type: ObstacleType = 'rock';
  active = false;
  theme = 1;

  get aabb(): AABB {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  init(x: number, type: ObstacleType, theme: number, size: 'small' | 'medium' | 'large' = 'medium'): void {
    this.x = x;
    this.type = type;
    this.theme = theme;
    this.active = true;

    switch (size) {
      case 'small':
        this.width = 28;
        this.height = 24;
        break;
      case 'medium':
        this.width = 40;
        this.height = 38;
        break;
      case 'large':
        this.width = 52;
        this.height = 48;
        break;
    }

    // Position on ground
    this.y = GROUND_Y - this.height;

    // Puddles are flat
    if (type === 'puddle') {
      this.height = 12;
      this.width = 50;
      this.y = GROUND_Y - this.height;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;
    drawObstacle(ctx, this.x, this.y, this.width, this.height, this.type, this.theme);
  }
}
