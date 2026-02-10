import type { LevelConfig, Segment } from './types';

const segments: Segment[] = [
  {
    length: 550,
    items: [
      { offset: 150, type: 'collectible', collectibleType: 'heart' },
      { offset: 300, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 440, type: 'collectible', collectibleType: 'star' },
    ],
  },
  {
    length: 600,
    items: [
      { offset: 80, type: 'obstacle', obstacleType: 'fire', size: 'medium' },
      { offset: 200, type: 'collectible', collectibleType: 'heart' },
      { offset: 320, type: 'obstacle', obstacleType: 'rock', size: 'large' },
      { offset: 460, type: 'collectible', collectibleType: 'heart' },
      { offset: 550, type: 'obstacle', obstacleType: 'fire', size: 'small' },
    ],
  },
  {
    length: 550,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'star' },
      { offset: 220, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 350, type: 'collectible', collectibleType: 'memory', memoryId: 'year4-photo1' },
      { offset: 480, type: 'obstacle', obstacleType: 'fire', size: 'medium' },
    ],
  },
  {
    length: 600,
    items: [
      { offset: 70, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 160, type: 'obstacle', obstacleType: 'fire', size: 'medium' },
      { offset: 280, type: 'collectible', collectibleType: 'heart' },
      { offset: 380, type: 'obstacle', obstacleType: 'rock', size: 'large' },
      { offset: 520, type: 'collectible', collectibleType: 'star' },
    ],
  },
  {
    length: 500,
    items: [
      { offset: 80, type: 'collectible', collectibleType: 'heart' },
      { offset: 160, type: 'collectible', collectibleType: 'heart' },
      { offset: 240, type: 'collectible', collectibleType: 'heart' },
      { offset: 320, type: 'collectible', collectibleType: 'star' },
      { offset: 400, type: 'obstacle', obstacleType: 'fire', size: 'large' },
    ],
  },
  {
    length: 600,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 230, type: 'collectible', collectibleType: 'memory', memoryId: 'year4-photo2' },
      { offset: 360, type: 'obstacle', obstacleType: 'fire', size: 'medium' },
      { offset: 480, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 560, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  {
    length: 550,
    items: [
      { offset: 80, type: 'obstacle', obstacleType: 'fire', size: 'small' },
      { offset: 180, type: 'obstacle', obstacleType: 'rock', size: 'large' },
      { offset: 310, type: 'collectible', collectibleType: 'star' },
      { offset: 420, type: 'obstacle', obstacleType: 'fire', size: 'medium' },
      { offset: 510, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // RAPID SECTION 1
  {
    length: 700,
    items: [
      { offset: 60, type: 'obstacle', obstacleType: 'fire', size: 'small' },
      { offset: 130, type: 'collectible', collectibleType: 'heart' },
      { offset: 200, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 280, type: 'obstacle', obstacleType: 'fire', size: 'medium' },
      { offset: 360, type: 'collectible', collectibleType: 'star' },
      { offset: 440, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 520, type: 'collectible', collectibleType: 'heart' },
      { offset: 600, type: 'obstacle', obstacleType: 'fire', size: 'large' },
    ],
  },
  // RAPID SECTION 2
  {
    length: 700,
    items: [
      { offset: 70, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 150, type: 'collectible', collectibleType: 'heart' },
      { offset: 230, type: 'obstacle', obstacleType: 'fire', size: 'medium' },
      { offset: 320, type: 'collectible', collectibleType: 'star' },
      { offset: 400, type: 'obstacle', obstacleType: 'rock', size: 'large' },
      { offset: 490, type: 'collectible', collectibleType: 'heart' },
      { offset: 570, type: 'obstacle', obstacleType: 'fire', size: 'small' },
      { offset: 650, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Memory items + grand finale
  {
    length: 600,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart' },
      { offset: 200, type: 'collectible', collectibleType: 'star' },
      { offset: 300, type: 'collectible', collectibleType: 'memory', memoryId: 'year4-photo3' },
      { offset: 400, type: 'collectible', collectibleType: 'heart' },
      { offset: 500, type: 'collectible', collectibleType: 'star' },
    ],
  },
  {
    length: 400,
    items: [
      { offset: 80, type: 'collectible', collectibleType: 'heart' },
      { offset: 160, type: 'collectible', collectibleType: 'heart' },
      { offset: 240, type: 'collectible', collectibleType: 'heart' },
      { offset: 320, type: 'collectible', collectibleType: 'memory', memoryId: 'year4-photo4' },
    ],
  },
];

export const level4: LevelConfig = {
  id: 4,
  name: 'Our Forever',
  subtitle: 'Written in the stars',
  theme: 4,
  baseSpeed: 240,
  speedRamp: 5,
  maxSpeed: 380,
  lives: 2,
  segments,
  rapidSegmentIndices: [7, 8],
  milestonePhotos: ['year4/milestone.jpg'],
  milestoneMessages: [
    'Year Four — Four years of love, laughter, and a lifetime of memories. Here\'s to forever and always. I love you more than words could ever say. 💕',
  ],
  memoryItems: ['year4-photo1', 'year4-photo2', 'year4-photo3', 'year4-photo4'],
  duration: 110,
};
