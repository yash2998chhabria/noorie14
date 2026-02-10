export class Camera {
  x = 0;
  y = 0;
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

  update(dt: number): void {
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
}
