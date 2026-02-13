import type { ObstacleType, CollectibleType } from '../engine/Sprites';

export type PowerUpType = 'shield' | 'magnet' | 'slowtime';

export type StoryEvent = 'flowers_bloom' | 'rainbow_appear' | 'rain_clear' | 'fireworks' | 'shooting_stars';

export interface SpawnItem {
  type: 'obstacle' | 'collectible' | 'powerup';
  obstacleType?: ObstacleType;
  collectibleType?: CollectibleType;
  powerUpType?: PowerUpType;
  size?: 'small' | 'medium' | 'large';
  yOffset?: number;
  memoryId?: string;
}

export interface Segment {
  items: Array<{ offset: number } & SpawnItem>;
  length: number;
  golden?: boolean;
  storyEvent?: StoryEvent;
}

export type GameType = 'runner' | 'catch' | 'dualLane' | 'float';

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  theme: number;
  gameType: GameType;
  lives: number;
  milestonePhotos: string[];
  milestoneMessages: string[];
  memoryItems: string[];
  duration: number;
  controlHint?: string;

  // Runner / DualLane config
  baseSpeed: number;
  speedRamp: number;
  maxSpeed: number;
  segments: Segment[];
  rapidSegmentIndices?: number[];

  // Act transition config
  herStartSegment: number;
  togetherStartSegment: number;
  transition1Message: string;
  transition2Message: string;
  flutterGravity?: number; // default 600

  // Catch game config
  catchDuration?: number; // total seconds for catch game (default 55)

  // Float game config
  floatDuration?: number; // total seconds for float game (default 60)
  floatBoost?: number;    // boost velocity on tap (default 350)
  floatGravity?: number;  // downward pull (default 200)
}
