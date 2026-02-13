import type { PowerUpType } from '../levels/types';

export type GameType = 'runner';

export type ActType = 'his' | 'her' | 'together';

export type GameEvent =
  | { type: 'score'; points: number; x: number; y: number }
  | { type: 'heart'; amount: number }
  | { type: 'star' }
  | { type: 'memory'; id: string }
  | { type: 'combo'; count: number; x: number; y: number }
  | { type: 'hit'; livesLeft: number }
  | { type: 'gameOver' }
  | { type: 'levelComplete' }
  | { type: 'progress'; percent: number }
  | { type: 'actChange'; act: ActType }
  | { type: 'powerup'; powerUp: PowerUpType };

export type EventCallback = (event: GameEvent) => void;

export interface LevelEngineState {
  score: number;
  hearts: number;
  combo: number;
  lives: number;
  progress: number;
  isGameOver: boolean;
  isComplete: boolean;
  speed: number;
}

export interface LevelEngine {
  update(dt: number): void;
  render(alpha: number): void;
  onEvent(cb: EventCallback): void;
  pause(): void;
  resume(): void;
  retry(): void;
  readonly state: LevelEngineState;
  destroy(): void;
}
