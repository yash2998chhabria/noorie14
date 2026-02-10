import type { LevelConfig, Segment } from './types';

const segments: Segment[] = [
  {
    length: 550,
    items: [
      { offset: 150, type: 'collectible', collectibleType: 'heart' },
      { offset: 300, type: 'collectible', collectibleType: 'heart' },
      { offset: 400, type: 'obstacle', obstacleType: 'rock', size: 'small' },
    ],
  },
  {
    length: 500,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'cactus', size: 'medium' },
      { offset: 250, type: 'collectible', collectibleType: 'star' },
      { offset: 380, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
    ],
  },
  {
    length: 600,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart' },
      { offset: 200, type: 'obstacle', obstacleType: 'puddle', size: 'medium' },
      { offset: 350, type: 'collectible', collectibleType: 'memory', memoryId: 'year2-photo1' },
      { offset: 500, type: 'obstacle', obstacleType: 'cactus', size: 'small' },
    ],
  },
  {
    length: 500,
    items: [
      { offset: 80, type: 'collectible', collectibleType: 'heart' },
      { offset: 160, type: 'collectible', collectibleType: 'heart' },
      { offset: 240, type: 'obstacle', obstacleType: 'rock', size: 'large' },
      { offset: 400, type: 'collectible', collectibleType: 'star' },
    ],
  },
  {
    length: 550,
    items: [
      { offset: 120, type: 'obstacle', obstacleType: 'cactus', size: 'medium' },
      { offset: 260, type: 'collectible', collectibleType: 'heart' },
      { offset: 360, type: 'obstacle', obstacleType: 'puddle', size: 'medium' },
      { offset: 480, type: 'obstacle', obstacleType: 'rock', size: 'small' },
    ],
  },
  {
    length: 600,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'star' },
      { offset: 200, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 320, type: 'collectible', collectibleType: 'memory', memoryId: 'year2-photo2' },
      { offset: 450, type: 'obstacle', obstacleType: 'cactus', size: 'large' },
    ],
  },
  {
    length: 500,
    items: [
      { offset: 80, type: 'collectible', collectibleType: 'heart' },
      { offset: 170, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 280, type: 'collectible', collectibleType: 'heart' },
      { offset: 370, type: 'obstacle', obstacleType: 'puddle', size: 'medium' },
      { offset: 450, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  {
    length: 600,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'cactus', size: 'medium' },
      { offset: 220, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 360, type: 'collectible', collectibleType: 'star' },
      { offset: 480, type: 'obstacle', obstacleType: 'rock', size: 'large' },
    ],
  },
  // RAPID
  {
    length: 700,
    items: [
      { offset: 70, type: 'obstacle', obstacleType: 'cactus', size: 'small' },
      { offset: 150, type: 'collectible', collectibleType: 'heart' },
      { offset: 230, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 310, type: 'collectible', collectibleType: 'star' },
      { offset: 390, type: 'obstacle', obstacleType: 'puddle', size: 'medium' },
      { offset: 470, type: 'collectible', collectibleType: 'heart' },
      { offset: 550, type: 'obstacle', obstacleType: 'cactus', size: 'medium' },
      { offset: 630, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  {
    length: 500,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart' },
      { offset: 200, type: 'collectible', collectibleType: 'memory', memoryId: 'year2-photo3' },
      { offset: 350, type: 'collectible', collectibleType: 'star' },
      { offset: 450, type: 'collectible', collectibleType: 'heart' },
    ],
  },
];

export const level2: LevelConfig = {
  id: 2,
  name: 'Adventures Together',
  subtitle: 'Every day is an adventure with you',
  theme: 2,
  baseSpeed: 200,
  speedRamp: 4,
  maxSpeed: 300,
  lives: 3,
  segments,
  rapidSegmentIndices: [8],
  milestonePhotos: ['year2/milestone.jpg'],
  milestoneMessages: [
    'Year Two — We explored the world together. Every sunset was more beautiful because you were beside me.',
  ],
  memoryItems: ['year2-photo1', 'year2-photo2', 'year2-photo3'],
  duration: 100,
};
