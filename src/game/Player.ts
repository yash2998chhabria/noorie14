import type { AABB } from '../engine/Physics';
import { GRAVITY, GROUND_Y, JUMP_VELOCITY, SUPER_JUMP_VELOCITY } from '../engine/Physics';
import type { PlayerState } from '../engine/Sprites';
import { drawPlayer } from '../engine/Sprites';
import { audio } from '../engine/AudioManager';

export class Player {
  x = 60;
  y = GROUND_Y;
  width = 36;
  height = 48;
  vy = 0;
  state: PlayerState = 'run';
  frame = 0;
  grounded = true;
  lives = 3;
  invincible = false;
  invincibleTimer = 0;
  squashX = 1;
  squashY = 1;
  private squashTimer = 0;

  get aabb(): AABB {
    return {
      x: this.x + 4,
      y: this.y - this.height + 4,
      width: this.width - 8,
      height: this.height - 4,
    };
  }

  jump(superJump: boolean): void {
    if (!this.grounded) return;
    this.vy = superJump ? SUPER_JUMP_VELOCITY : JUMP_VELOCITY;
    this.grounded = false;
    this.state = 'jump';
    audio.playSynth('jump');
    audio.haptic('light');
    // Squash before jump
    this.squashX = 1.3;
    this.squashY = 0.7;
    this.squashTimer = 0.1;
  }

  hit(): boolean {
    if (this.invincible) return false;
    this.lives--;
    this.state = 'hit';
    this.invincible = true;
    this.invincibleTimer = 1.5;
    audio.playSynth('hit');
    audio.haptic('heavy');
    // Squash on hit
    this.squashX = 1.4;
    this.squashY = 0.6;
    this.squashTimer = 0.15;
    return this.lives <= 0;
  }

  update(dt: number): void {
    this.frame++;

    // Gravity
    if (!this.grounded) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;

      if (this.vy > 0) {
        this.state = this.state === 'hit' ? 'hit' : 'fall';
      }

      // Ground check
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
        this.grounded = true;
        if (this.state !== 'hit') {
          this.state = 'run';
        }
        // Landing squash
        this.squashX = 1.2;
        this.squashY = 0.8;
        this.squashTimer = 0.08;
      }
    }

    // Invincibility
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
        if (this.grounded) this.state = 'run';
      }
    }

    // Squash/stretch recovery
    if (this.squashTimer > 0) {
      this.squashTimer -= dt;
    } else {
      this.squashX += (1 - this.squashX) * 0.2;
      this.squashY += (1 - this.squashY) * 0.2;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Blink when invincible
    if (this.invincible && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    drawPlayer(
      ctx,
      this.x,
      this.y - this.height,
      this.width,
      this.height,
      this.state,
      this.frame,
      this.squashX,
      this.squashY,
    );

    ctx.globalAlpha = 1;
  }

  reset(): void {
    this.y = GROUND_Y;
    this.vy = 0;
    this.state = 'run';
    this.grounded = true;
    this.lives = 3;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.squashX = 1;
    this.squashY = 1;
    this.frame = 0;
  }
}
