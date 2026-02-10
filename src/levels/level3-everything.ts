import type { LevelConfig, Segment } from './types';

const segments: Segment[] = [
  {
    length: 500,
    items: [
      { offset: 150, type: 'collectible', collectibleType: 'heart' },
      { offset: 280, type: 'obstacle', obstacleType: 'log', size: 'medium' },
      { offset: 420, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  {
    length: 550,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 220, type: 'obstacle', obstacleType: 'log', size: 'small' },
      { offset: 350, type: 'collectible', collectibleType: 'star' },
      { offset: 470, type: 'obstacle', obstacleType: 'bush', size: 'large' },
    ],
  },
  {
    length: 600,
    items: [
      { offset: 80, type: 'collectible', collectibleType: 'heart' },
      { offset: 180, type: 'obstacle', obstacleType: 'rock', size: 'large' },
      { offset: 320, type: 'collectible', collectibleType: 'memory', memoryId: 'year3-photo1' },
      { offset: 450, type: 'obstacle', obstacleType: 'log', size: 'medium' },
      { offset: 550, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  {
    length: 500,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 200, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 320, type: 'collectible', collectibleType: 'star' },
      { offset: 430, type: 'obstacle', obstacleType: 'log', size: 'large' },
    ],
  },
  {
    length: 550,
    items: [
      { offset: 80, type: 'collectible', collectibleType: 'heart' },
      { offset: 150, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 260, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 370, type: 'collectible', collectibleType: 'heart' },
      { offset: 460, type: 'obstacle', obstacleType: 'log', size: 'medium' },
    ],
  },
  {
    length: 600,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'memory', memoryId: 'year3-photo2' },
      { offset: 220, type: 'obstacle', obstacleType: 'rock', size: 'large' },
      { offset: 370, type: 'collectible', collectibleType: 'star' },
      { offset: 480, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
    ],
  },
  {
    length: 500,
    items: [
      { offset: 70, type: 'obstacle', obstacleType: 'log', size: 'small' },
      { offset: 170, type: 'collectible', collectibleType: 'heart' },
      { offset: 280, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 380, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 460, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // RAPID
  {
    length: 750,
    items: [
      { offset: 60, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 140, type: 'collectible', collectibleType: 'heart' },
      { offset: 210, type: 'obstacle', obstacleType: 'log', size: 'small' },
      { offset: 290, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 380, type: 'collectible', collectibleType: 'star' },
      { offset: 450, type: 'obstacle', obstacleType: 'rock', size: 'large' },
      { offset: 540, type: 'collectible', collectibleType: 'heart' },
      { offset: 620, type: 'obstacle', obstacleType: 'log', size: 'medium' },
      { offset: 700, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  {
    length: 500,
    items: [
      { offset: 120, type: 'collectible', collectibleType: 'heart' },
      { offset: 250, type: 'collectible', collectibleType: 'memory', memoryId: 'year3-photo3' },
      { offset: 380, type: 'collectible', collectibleType: 'star' },
    ],
  },
];

export const level3: LevelConfig = {
  id: 3,
  name: 'Through Everything',
  subtitle: 'Together through every storm and sunshine',
  theme: 3,
  baseSpeed: 220,
  speedRamp: 5,
  maxSpeed: 340,
  lives: 3,
  segments,
  rapidSegmentIndices: [7],
  milestonePhotos: ['year3/milestone.jpg'],
  milestoneMessages: [
    'Year Three — We proved that love isn\'t about perfect days, but about choosing each other through everything.',
  ],
  memoryItems: ['year3-photo1', 'year3-photo2', 'year3-photo3'],
  duration: 105,
};
