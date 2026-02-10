export interface InputState {
  jumpPressed: boolean;
  superJump: boolean;
}

export class Input {
  private canvas: HTMLCanvasElement;
  private _jumpPressed = false;
  private _superJump = false;
  private touchStartY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.bindEvents();
  }

  private bindEvents(): void {
    // Touch events
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });

    // Mouse fallback for desktop
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mouseup', this.onMouseUp);

    // Keyboard
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    this.touchStartY = touch.clientY;
    this._jumpPressed = true;
  };

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const dy = this.touchStartY - touch.clientY;
      // Swipe up detection (>50px upward)
      if (dy > 50) {
        this._superJump = true;
      }
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    this._jumpPressed = false;
    this._superJump = false;
  };

  private onMouseDown = (): void => {
    this._jumpPressed = true;
  };

  private onMouseUp = (): void => {
    this._jumpPressed = false;
    this._superJump = false;
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      this._jumpPressed = true;
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this._superJump = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      this._jumpPressed = false;
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this._superJump = false;
    }
  };

  get state(): InputState {
    return {
      jumpPressed: this._jumpPressed,
      superJump: this._superJump,
    };
  }

  consumeJump(): boolean {
    if (this._jumpPressed) {
      this._jumpPressed = false;
      return true;
    }
    return false;
  }

  consumeSuperJump(): boolean {
    if (this._superJump) {
      this._superJump = false;
      return true;
    }
    return false;
  }

  destroy(): void {
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
