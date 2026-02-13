import type { LevelConfig, Segment } from './types';

// Level 4: "Forever & Always" — Starry night, fastest
// Act 1 (His): segments 0-3, Act 2 (Her): segments 4-7, Act 3 (Together): segments 8-11
// Features: shooting_stars + fireworks story events, 2 fire gauntlets,
//           shield + magnet power-ups, golden corridor with sine arc hearts

const segments: Segment[] = [
  // === ACT 1: His Chapter ===
  // Segment 0: Night run
  {
    length: 550,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart' },
      { offset: 200, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 320, type: 'collectible', collectibleType: 'star' },
      { offset: 430, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
    ],
  },
  // Segment 1: Challenging start
  {
    length: 600,
    items: [
      { offset: 80, type: 'obstacle', obstacleType: 'log', size: 'medium' },
      { offset: 180, type: 'collectible', collectibleType: 'heart' },
      { offset: 280, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 380, type: 'collectible', collectibleType: 'heart' },
      { offset: 480, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 560, type: 'collectible', collectibleType: 'star' },
    ],
  },
  // Segment 2: Shield power-up + memory in the stars
  {
    length: 550,
    items: [
      { offset: 80, type: 'powerup', powerUpType: 'shield' },
      { offset: 180, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 300, type: 'collectible', collectibleType: 'heart' },
      { offset: 400, type: 'collectible', collectibleType: 'memory', memoryId: 'year4-photo1' },
      { offset: 490, type: 'obstacle', obstacleType: 'log', size: 'small' },
    ],
  },
  // Segment 3: Fire gauntlet — "trials before togetherness"
  {
    length: 500,
    items: [
      { offset: 80, type: 'obstacle', obstacleType: 'fire', size: 'medium' },
      { offset: 170, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 260, type: 'obstacle', obstacleType: 'fire', size: 'small' },
      { offset: 350, type: 'collectible', collectibleType: 'heart' },
      { offset: 440, type: 'collectible', collectibleType: 'star' },
    ],
  },

  // === ACT 2: Her Chapter ===
  // Segment 4: Shooting stars story event + starlit flutter
  {
    length: 550,
    storyEvent: 'shooting_stars',
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 200, type: 'collectible', collectibleType: 'heart', yOffset: -50 },
      { offset: 310, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 410, type: 'collectible', collectibleType: 'star' },
    ],
  },
  // Segment 5: Sky dance
  {
    length: 600,
    items: [
      { offset: 90, type: 'collectible', collectibleType: 'heart', yOffset: -40 },
      { offset: 190, type: 'obstacle', obstacleType: 'log', size: 'medium' },
      { offset: 310, type: 'collectible', collectibleType: 'heart', yOffset: -50 },
      { offset: 420, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 540, type: 'collectible', collectibleType: 'star' },
    ],
  },
  // Segment 6: Magnet power-up + memory
  {
    length: 550,
    items: [
      { offset: 80, type: 'powerup', powerUpType: 'magnet' },
      { offset: 170, type: 'collectible', collectibleType: 'heart' },
      { offset: 260, type: 'collectible', collectibleType: 'heart', yOffset: -30 },
      { offset: 350, type: 'collectible', collectibleType: 'memory', memoryId: 'year4-photo2' },
      { offset: 460, type: 'obstacle', obstacleType: 'rock', size: 'small' },
    ],
  },
  // Segment 7: Fire gauntlet — "her trial"
  {
    length: 500,
    items: [
      { offset: 80, type: 'obstacle', obstacleType: 'fire', size: 'small' },
      { offset: 170, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 260, type: 'obstacle', obstacleType: 'fire', size: 'medium' },
      { offset: 370, type: 'collectible', collectibleType: 'heart' },
      { offset: 450, type: 'obstacle', obstacleType: 'rock', size: 'small' },
    ],
  },

  // === ACT 3: Together ===
  // Segment 8: Together under stars
  {
    length: 600,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 210, type: 'collectible', collectibleType: 'heart' },
      { offset: 310, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 420, type: 'collectible', collectibleType: 'memory', memoryId: 'year4-photo5' },
      { offset: 530, type: 'collectible', collectibleType: 'star' },
    ],
  },
  // Segment 9: Intense together
  {
    length: 550,
    items: [
      { offset: 80, type: 'obstacle', obstacleType: 'log', size: 'medium' },
      { offset: 180, type: 'collectible', collectibleType: 'heart' },
      { offset: 260, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 350, type: 'collectible', collectibleType: 'heart' },
      { offset: 440, type: 'obstacle', obstacleType: 'bush', size: 'small' },
    ],
  },
  // Segment 10: Golden corridor — sine arc hearts
  {
    length: 600,
    golden: true,
    items: [
      // Sine wave arc pattern
      { offset: 60, type: 'collectible', collectibleType: 'heart', yOffset: -10 },
      { offset: 130, type: 'collectible', collectibleType: 'heart', yOffset: -40 },
      { offset: 200, type: 'collectible', collectibleType: 'heart', yOffset: -55 },
      { offset: 270, type: 'collectible', collectibleType: 'heart', yOffset: -60 },
      { offset: 340, type: 'collectible', collectibleType: 'heart', yOffset: -55 },
      { offset: 410, type: 'collectible', collectibleType: 'heart', yOffset: -40 },
      { offset: 480, type: 'collectible', collectibleType: 'memory', memoryId: 'year4-photo3' },
      { offset: 540, type: 'collectible', collectibleType: 'star' },
    ],
  },
  // Segment 11: Grand finale + fireworks
  {
    length: 500,
    storyEvent: 'fireworks',
    items: [
      { offset: 80, type: 'collectible', collectibleType: 'heart' },
      { offset: 150, type: 'collectible', collectibleType: 'heart' },
      { offset: 220, type: 'collectible', collectibleType: 'star' },
      { offset: 300, type: 'collectible', collectibleType: 'memory', memoryId: 'year4-photo4' },
      { offset: 380, type: 'collectible', collectibleType: 'heart' },
      { offset: 440, type: 'collectible', collectibleType: 'star' },
    ],
  },
];

export const level4: LevelConfig = {
  id: 4,
  name: 'Forever & Always',
  subtitle: 'Twin Peaks, that view, and the rest of forever',
  theme: 4,
  gameType: 'float',
  baseSpeed: 240,
  speedRamp: 5,
  maxSpeed: 370,
  lives: 3,
  segments,
  rapidSegmentIndices: [3, 9],
  floatDuration: 60,
  floatBoost: 320,
  floatGravity: 180,

  // Act transitions
  herStartSegment: 4,
  togetherStartSegment: 8,
  transition1Message: 'Noorie was already unpacking boxes at their new place...',
  transition2Message: 'Home. Together. Finally.',

  milestonePhotos: ['year4/milestone.jpg'],
  milestoneMessages: [
    'Year Four — Twin Peaks, September 2025. We found our place, with a view that takes your breath away. Four years of love, and we\'re just getting started.',
  ],
  memoryItems: ['year4-photo1', 'year4-photo2', 'year4-photo3', 'year4-photo4', 'year4-photo5'],
  duration: 110,
  controlHint: 'Tap to boost up! Hold to float, dodge the clouds',
};
