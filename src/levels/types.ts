import type { ObstacleType, CollectibleType } from '../engine/Sprites';

export interface SpawnItem {
  type: 'obstacle' | 'collectible';
  obstacleType?: ObstacleType;
  collectibleType?: CollectibleType;
  size?: 'small' | 'medium' | 'large';
  yOffset?: number; // for collectibles, offset from default height
  memoryId?: string; // for memory items
}

export interface Segment {
  /** items positioned by relative offset within the segment */
  items: Array<{ offset: number } & SpawnItem>;
  /** length of this segment in pixels */
  length: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  theme: number;
  baseSpeed: number;
  speedRamp: number; // speed increase per second
  maxSpeed: number;
  lives: number;
  segments: Segment[];
  /** indices of segments that are "rapid sections" (increased density/speed) */
  rapidSegmentIndices: number[];
  milestonePhotos: string[];
  milestoneMessages: string[];
  /** memory item IDs found in this level */
  memoryItems: string[];
  duration: number; // approximate level duration in seconds
}
