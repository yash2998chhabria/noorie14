import type { AABB } from '../engine/Physics';
import { GROUND_Y } from '../engine/Physics';
import type { CollectibleType } from '../engine/Sprites';
import { drawCollectible, drawPowerUp } from '../engine/Sprites';
import type { PowerUpType } from '../levels/types';

export class Collectible {
  x = 0;
  y = 0;
  size = 12;
  type: CollectibleType = 'heart';
  active = false;
  frame = 0;
  memoryId: string | null = null; // for memory items -> photo unlock
  powerUpType: PowerUpType | null = null;

  get aabb(): AABB {
    const s = this.type === 'memory' ? this.size * 1.4
      : this.powerUpType ? this.size * 2.2
      : this.size * 2;
    return {
      x: this.x - s / 2,
      y: this.y - s / 2,
      width: s,
      height: s,
    };
  }

  init(x: number, y: number, type: CollectibleType, memoryId?: string, powerUpType?: PowerUpType): void {
    this.x = x;
    this.y = y;
    this.type = type;
    this.active = true;
    this.frame = Math.random() * 100;
    this.memoryId = memoryId || null;
    this.powerUpType = powerUpType || null;

    if (powerUpType) {
      this.size = 16;
    } else {
      switch (type) {
        case 'heart': this.size = 10; break;
        case 'star': this.size = 12; break;
        case 'memory': this.size = 14; break;
      }
    }

    // Default height if not specified
    if (y === 0) {
      this.y = GROUND_Y - 60 - Math.random() * 60;
    }
  }

  update(): void {
    this.frame++;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;
    if (this.powerUpType) {
      drawPowerUp(ctx, this.x, this.y, this.size, this.powerUpType, this.frame);
    } else {
      drawCollectible(ctx, this.x, this.y, this.size, this.type, this.frame);
    }
  }
}
