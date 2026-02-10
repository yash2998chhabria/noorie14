import { level1 } from './level1-beginning';
import { level2 } from './level2-adventures';
import { level3 } from './level3-everything';
import { level4 } from './level4-forever';
import type { LevelConfig } from './types';

export const levels: LevelConfig[] = [level1, level2, level3, level4];

export function getLevel(id: number): LevelConfig {
  return levels[id - 1] || level1;
}

export type { LevelConfig, Segment, SpawnItem } from './types';
