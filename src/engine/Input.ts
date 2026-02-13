import { LOGICAL_WIDTH } from './Renderer';

export interface InputState {
  jumpPressed: boolean;
  superJump: boolean;
}

export interface TapEvent {
  x: number;
  y: number;
  time: number;
}

export class Input {
  private canvas: HTMLCanvasElement;
  private _jumpPressed = false;
  private _superJump = false;
  private touchStartY = 0;

  // Tap position tracking
  private _taps: TapEvent[] = [];
  private _leftSideActive = false;
  private _rightSideActive = false;
  private _activeTouches: Map<number, { x: number; y: number }> = new Map();

  // Mouse hold state for desktop flutter testing
  private _mouseDown = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  /** Convert client coordinates to logical 360x640 coords */
  toLogical(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = 360 / rect.width;
    const scaleY = 640 / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const logical = this.toLogical(touch.clientX, touch.clientY);
      this._activeTouches.set(touch.identifier, logical);
      this._taps.push({ x: logical.x, y: logical.y, time: performance.now() });

      // Side detection
      if (logical.x < LOGICAL_WIDTH / 2) {
        this._leftSideActive = true;
      } else {
        this._rightSideActive = true;
      }
    }
    const touch = e.touches[0];
    this.touchStartY = touch.clientY;
    this._jumpPressed = true;
  };

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const dy = this.touchStartY - touch.clientY;
      if (dy > 50) {
        this._superJump = true;
      }
    }
    // Update active touches
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const logical = this.toLogical(touch.clientX, touch.clientY);
      this._activeTouches.set(touch.identifier, logical);
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      this._activeTouches.delete(e.changedTouches[i].identifier);
    }
    if (this._activeTouches.size === 0) {
      this._jumpPressed = false;
      this._superJump = false;
      this._leftSideActive = false;
      this._rightSideActive = false;
    } else {
      // Recalculate side activity
      this._leftSideActive = false;
      this._rightSideActive = false;
      this._activeTouches.forEach(pos => {
        if (pos.x < LOGICAL_WIDTH / 2) this._leftSideActive = true;
        else this._rightSideActive = true;
      });
    }
  };

  private onMouseDown = (e: MouseEvent): void => {
    this._jumpPressed = true;
    this._mouseDown = true;
    const logical = this.toLogical(e.clientX, e.clientY);
    this._taps.push({ x: logical.x, y: logical.y, time: performance.now() });
    if (logical.x < LOGICAL_WIDTH / 2) {
      this._leftSideActive = true;
    } else {
      this._rightSideActive = true;
    }
  };

  private onMouseUp = (): void => {
    this._jumpPressed = false;
    this._superJump = false;
    this._mouseDown = false;
    this._leftSideActive = false;
    this._rightSideActive = false;
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      this._jumpPressed = true;
      // For keyboard, add a center tap
      this._taps.push({ x: 180, y: 320, time: performance.now() });
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this._superJump = true;
    }
    if (e.code === 'ArrowLeft') {
      this._leftSideActive = true;
      this._taps.push({ x: 90, y: 320, time: performance.now() });
    }
    if (e.code === 'ArrowRight') {
      this._rightSideActive = true;
      this._taps.push({ x: 270, y: 320, time: performance.now() });
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      this._jumpPressed = false;
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this._superJump = false;
    }
    if (e.code === 'ArrowLeft') {
      this._leftSideActive = false;
    }
    if (e.code === 'ArrowRight') {
      this._rightSideActive = false;
    }
  };

  get state(): InputState {
    return {
      jumpPressed: this._jumpPressed,
      superJump: this._superJump,
    };
  }

  /** Whether a touch or mouse is currently held down — used for flutter jump */
  get isTouching(): boolean {
    return this._activeTouches.size > 0 || this._mouseDown;
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

  /** Consume all accumulated taps this frame */
  consumeTaps(): TapEvent[] {
    if (this._taps.length === 0) return [];
    const taps = this._taps.slice();
    this._taps.length = 0;
    return taps;
  }

  get leftSideActive(): boolean {
    return this._leftSideActive;
  }

  get rightSideActive(): boolean {
    return this._rightSideActive;
  }

  get bothSidesActive(): boolean {
    return this._leftSideActive && this._rightSideActive;
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
