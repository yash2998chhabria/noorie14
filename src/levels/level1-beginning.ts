import type { LevelConfig, Segment } from './types';

const segments: Segment[] = [
  // Opening — gentle intro with hearts
  {
    length: 600,
    items: [
      { offset: 200, type: 'collectible', collectibleType: 'heart' },
      { offset: 350, type: 'collectible', collectibleType: 'heart' },
      { offset: 500, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // First obstacle
  {
    length: 500,
    items: [
      { offset: 150, type: 'collectible', collectibleType: 'heart' },
      { offset: 300, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 450, type: 'collectible', collectibleType: 'star' },
    ],
  },
  // Double obstacle
  {
    length: 600,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart' },
      { offset: 200, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 380, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 500, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // First memory item!
  {
    length: 550,
    items: [
      { offset: 150, type: 'obstacle', obstacleType: 'log', size: 'medium' },
      { offset: 300, type: 'collectible', collectibleType: 'memory', memoryId: 'year1-photo1' },
      { offset: 450, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Heart chain
  {
    length: 500,
    items: [
      { offset: 80, type: 'collectible', collectibleType: 'heart' },
      { offset: 160, type: 'collectible', collectibleType: 'heart' },
      { offset: 240, type: 'collectible', collectibleType: 'heart' },
      { offset: 320, type: 'collectible', collectibleType: 'star' },
      { offset: 400, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
    ],
  },
  // Gap challenge
  {
    length: 600,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 250, type: 'collectible', collectibleType: 'heart', yOffset: -30 },
      { offset: 350, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 500, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Star path
  {
    length: 500,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'star' },
      { offset: 200, type: 'collectible', collectibleType: 'star' },
      { offset: 300, type: 'collectible', collectibleType: 'star' },
      { offset: 400, type: 'obstacle', obstacleType: 'log', size: 'small' },
    ],
  },
  // Second memory
  {
    length: 600,
    items: [
      { offset: 120, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 250, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 400, type: 'collectible', collectibleType: 'memory', memoryId: 'year1-photo2' },
      { offset: 520, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Dense obstacles
  {
    length: 550,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 220, type: 'collectible', collectibleType: 'heart' },
      { offset: 300, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 420, type: 'obstacle', obstacleType: 'log', size: 'medium' },
    ],
  },
  // RAPID SECTION — the rush before the end
  {
    length: 700,
    items: [
      { offset: 80, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 160, type: 'collectible', collectibleType: 'heart' },
      { offset: 230, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 320, type: 'collectible', collectibleType: 'star' },
      { offset: 400, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 480, type: 'collectible', collectibleType: 'heart' },
      { offset: 560, type: 'obstacle', obstacleType: 'log', size: 'small' },
      { offset: 640, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Third memory + finale
  {
    length: 500,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart' },
      { offset: 200, type: 'collectible', collectibleType: 'star' },
      { offset: 300, type: 'collectible', collectibleType: 'memory', memoryId: 'year1-photo3' },
      { offset: 400, type: 'collectible', collectibleType: 'heart' },
    ],
  },
];

export const level1: LevelConfig = {
  id: 1,
  name: 'The Beginning',
  subtitle: 'Where it all started...',
  theme: 1,
  baseSpeed: 180,
  speedRamp: 3,
  maxSpeed: 260,
  lives: 3,
  segments,
  rapidSegmentIndices: [9],
  milestonePhotos: ['year1/milestone.jpg'],
  milestoneMessages: [
    'Year One — The spark that started it all. Every adventure begins with a single hello, and ours was the most beautiful one.',
  ],
  memoryItems: ['year1-photo1', 'year1-photo2', 'year1-photo3'],
  duration: 100,
};
