export class Camera {
  x = 0;
  y = 0;
  private targetY = 0;
  private shakeIntensity = 0;
  private shakeDuration = 0;
  private shakeTimer = 0;
  private shakeOffsetX = 0;
  private shakeOffsetY = 0;

  shake(intensity: number, duration: number): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }

  /** Smoothly scroll camera to target Y position */
  scrollTo(y: number): void {
    this.targetY = y;
  }

  update(dt: number): void {
    // Smooth scroll interpolation
    if (Math.abs(this.y - this.targetY) > 0.5) {
      this.y += (this.targetY - this.y) * Math.min(1, 5 * dt);
    } else {
      this.y = this.targetY;
    }

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const progress = this.shakeTimer / this.shakeDuration;
      const currentIntensity = this.shakeIntensity * progress;
      this.shakeOffsetX = (Math.random() * 2 - 1) * currentIntensity;
      this.shakeOffsetY = (Math.random() * 2 - 1) * currentIntensity;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  get offsetX(): number {
    return this.x + this.shakeOffsetX;
  }

  get offsetY(): number {
    return this.y + this.shakeOffsetY;
  }

  get isShaking(): boolean {
    return this.shakeTimer > 0;
  }

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.targetY = 0;
    this.shakeTimer = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }
}
