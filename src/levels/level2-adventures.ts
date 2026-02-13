import type { LevelConfig, Segment } from './types';

// Level 2: "Adventures Together" — Summer sunset, medium speed
// Act 1 (His): segments 0-3, Act 2 (Her): segments 4-7, Act 3 (Together): segments 8-10
// Features: 1 magnet power-up, golden corridor with rainbow_appear, mild gauntlet

const segments: Segment[] = [
  // === ACT 1: His Chapter ===
  // Segment 0: Warm up
  {
    length: 550,
    items: [
      { offset: 150, type: 'collectible', collectibleType: 'heart' },
      { offset: 280, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 400, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Segment 1: Getting trickier
  {
    length: 600,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 230, type: 'collectible', collectibleType: 'heart' },
      { offset: 340, type: 'collectible', collectibleType: 'star' },
      { offset: 460, type: 'obstacle', obstacleType: 'log', size: 'small' },
    ],
  },
  // Segment 2: Memory unlock
  {
    length: 550,
    items: [
      { offset: 120, type: 'collectible', collectibleType: 'heart' },
      { offset: 250, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 380, type: 'collectible', collectibleType: 'memory', memoryId: 'year2-photo1' },
      { offset: 480, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Segment 3: Rapid hearts
  {
    length: 500,
    items: [
      { offset: 80, type: 'collectible', collectibleType: 'heart' },
      { offset: 160, type: 'collectible', collectibleType: 'heart' },
      { offset: 240, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 360, type: 'collectible', collectibleType: 'heart' },
      { offset: 440, type: 'collectible', collectibleType: 'star' },
    ],
  },

  // === ACT 2: Her Chapter ===
  // Segment 4: Her intro
  {
    length: 550,
    items: [
      { offset: 140, type: 'collectible', collectibleType: 'heart' },
      { offset: 270, type: 'collectible', collectibleType: 'heart', yOffset: -40 },
      { offset: 400, type: 'obstacle', obstacleType: 'rock', size: 'small' },
    ],
  },
  // Segment 5: Flutter challenge
  {
    length: 600,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'log', size: 'medium' },
      { offset: 220, type: 'collectible', collectibleType: 'heart', yOffset: -50 },
      { offset: 350, type: 'collectible', collectibleType: 'star' },
      { offset: 470, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
    ],
  },
  // Segment 6: Magnet power-up + memory
  {
    length: 550,
    items: [
      { offset: 100, type: 'powerup', powerUpType: 'magnet' },
      { offset: 200, type: 'collectible', collectibleType: 'heart' },
      { offset: 280, type: 'collectible', collectibleType: 'heart', yOffset: -30 },
      { offset: 360, type: 'collectible', collectibleType: 'memory', memoryId: 'year2-photo2' },
      { offset: 480, type: 'collectible', collectibleType: 'heart', yOffset: -30 },
    ],
  },
  // Segment 7: Tighter obstacles
  {
    length: 500,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 220, type: 'collectible', collectibleType: 'heart' },
      { offset: 320, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 420, type: 'collectible', collectibleType: 'star' },
    ],
  },

  // === ACT 3: Together ===
  // Segment 8: Golden corridor + rainbow — V-pattern hearts, no obstacles
  {
    length: 600,
    golden: true,
    storyEvent: 'rainbow_appear',
    items: [
      // V-shape: hearts dip in middle
      { offset: 60, type: 'collectible', collectibleType: 'heart', yOffset: -60 },
      { offset: 130, type: 'collectible', collectibleType: 'heart', yOffset: -40 },
      { offset: 200, type: 'collectible', collectibleType: 'heart', yOffset: -20 },
      { offset: 270, type: 'collectible', collectibleType: 'heart', yOffset: -5 },
      { offset: 340, type: 'collectible', collectibleType: 'heart', yOffset: -20 },
      { offset: 410, type: 'collectible', collectibleType: 'heart', yOffset: -40 },
      { offset: 480, type: 'collectible', collectibleType: 'heart', yOffset: -60 },
      { offset: 540, type: 'collectible', collectibleType: 'star' },
    ],
  },
  // Segment 9: Mild gauntlet (3 obstacles)
  {
    length: 550,
    items: [
      { offset: 80, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 170, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 260, type: 'obstacle', obstacleType: 'log', size: 'small' },
      { offset: 370, type: 'collectible', collectibleType: 'heart' },
      { offset: 460, type: 'collectible', collectibleType: 'star' },
    ],
  },
  // Segment 10: Finale
  {
    length: 500,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart' },
      { offset: 200, type: 'collectible', collectibleType: 'star' },
      { offset: 300, type: 'collectible', collectibleType: 'memory', memoryId: 'year2-photo3' },
      { offset: 400, type: 'collectible', collectibleType: 'heart' },
    ],
  },
];

export const level2: LevelConfig = {
  id: 2,
  name: 'Adventures Together',
  subtitle: 'The bass drops, the lights go crazy',
  theme: 2,
  gameType: 'runner',
  baseSpeed: 200,
  speedRamp: 4,
  maxSpeed: 300,
  lives: 3,
  segments,
  rapidSegmentIndices: [9],

  // Act transitions
  herStartSegment: 4,
  togetherStartSegment: 8,
  transition1Message: 'Noorie was already picking out their next show...',
  transition2Message: 'Side by side in the crowd, exactly where they belong',

  milestonePhotos: ['year2/milestone.jpg'],
  milestoneMessages: [
    'Year Two — Portola, raves, concerts, and every beat in between. The music always hit different with you.',
  ],
  memoryItems: ['year2-photo1', 'year2-photo2', 'year2-photo3'],
  duration: 100,
  controlHint: 'Tap to jump! Hold for flutter jump',
};
