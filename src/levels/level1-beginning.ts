import type { LevelConfig, Segment } from './types';

// Level 1: "The Beginning" — Spring garden, slow, tutorial-like
// Act 1 (His): segments 0-3, Act 2 (Her): segments 4-6, Act 3 (Together): segments 7-9
// Features: 1 shield power-up, golden corridor with flowers_bloom, no gauntlets, no fire

const segments: Segment[] = [
  // === ACT 1: His Chapter ===
  // Segment 0: Gentle intro — hearts only
  {
    length: 600,
    items: [
      { offset: 200, type: 'collectible', collectibleType: 'heart' },
      { offset: 350, type: 'collectible', collectibleType: 'heart' },
      { offset: 500, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Segment 1: First obstacle + shield power-up (teaches mechanic)
  {
    length: 550,
    items: [
      { offset: 120, type: 'powerup', powerUpType: 'shield' },
      { offset: 250, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 400, type: 'collectible', collectibleType: 'heart' },
      { offset: 480, type: 'collectible', collectibleType: 'star' },
    ],
  },
  // Segment 2: Mixed obstacles and memory
  {
    length: 550,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart' },
      { offset: 200, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 340, type: 'collectible', collectibleType: 'heart' },
      { offset: 450, type: 'collectible', collectibleType: 'memory', memoryId: 'year1-photo1' },
    ],
  },
  // Segment 3: Building up
  {
    length: 500,
    items: [
      { offset: 120, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 260, type: 'collectible', collectibleType: 'heart' },
      { offset: 380, type: 'collectible', collectibleType: 'heart' },
      { offset: 450, type: 'collectible', collectibleType: 'star' },
    ],
  },

  // === ACT 2: Her Chapter (flutter jump!) ===
  // Segment 4: Intro hearts for Her
  {
    length: 550,
    items: [
      { offset: 150, type: 'collectible', collectibleType: 'heart' },
      { offset: 280, type: 'collectible', collectibleType: 'heart', yOffset: -40 },
      { offset: 420, type: 'collectible', collectibleType: 'star' },
    ],
  },
  // Segment 5: Flutter-friendly — high collectibles + memory
  {
    length: 600,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 250, type: 'collectible', collectibleType: 'heart', yOffset: -50 },
      { offset: 380, type: 'collectible', collectibleType: 'memory', memoryId: 'year1-photo2' },
      { offset: 500, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Segment 6: More flutter practice
  {
    length: 500,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart', yOffset: -30 },
      { offset: 220, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 350, type: 'collectible', collectibleType: 'heart' },
      { offset: 450, type: 'collectible', collectibleType: 'star' },
    ],
  },

  // === ACT 3: Together ===
  // Segment 7: Golden corridor + flowers_bloom — hearts in sine arc, no obstacles
  {
    length: 600,
    golden: true,
    storyEvent: 'flowers_bloom',
    items: [
      // Sine wave arc pattern: 8 hearts
      { offset: 60, type: 'collectible', collectibleType: 'heart', yOffset: -10 },
      { offset: 130, type: 'collectible', collectibleType: 'heart', yOffset: -40 },
      { offset: 200, type: 'collectible', collectibleType: 'heart', yOffset: -55 },
      { offset: 270, type: 'collectible', collectibleType: 'heart', yOffset: -60 },
      { offset: 340, type: 'collectible', collectibleType: 'heart', yOffset: -55 },
      { offset: 410, type: 'collectible', collectibleType: 'heart', yOffset: -40 },
      { offset: 480, type: 'collectible', collectibleType: 'heart', yOffset: -10 },
      { offset: 540, type: 'collectible', collectibleType: 'star' },
    ],
  },
  // Segment 8: More together gameplay
  {
    length: 600,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 230, type: 'collectible', collectibleType: 'heart' },
      { offset: 350, type: 'collectible', collectibleType: 'star' },
      { offset: 480, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Segment 9: Finale
  {
    length: 500,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart' },
      { offset: 200, type: 'collectible', collectibleType: 'heart' },
      { offset: 300, type: 'collectible', collectibleType: 'memory', memoryId: 'year1-photo3' },
      { offset: 400, type: 'collectible', collectibleType: 'star' },
    ],
  },
];

export const level1: LevelConfig = {
  id: 1,
  name: 'The Beginning',
  subtitle: 'A DM, a match, and a feeling',
  theme: 1,
  gameType: 'runner',
  baseSpeed: 170,
  speedRamp: 2,
  maxSpeed: 240,
  lives: 3,
  segments,
  rapidSegmentIndices: [],

  // Act transitions
  herStartSegment: 4,
  togetherStartSegment: 7,
  transition1Message: 'Meanwhile, Noorie was staring at her phone, wondering who this guy was...',
  transition2Message: 'Two slugs who found each other at Santa Cruz',

  milestonePhotos: ['year1/milestone.jpg'],
  milestoneMessages: [
    'Year One — From an Instagram DM to late-night texts to realizing this was something real. UCSC gave us the start, but we made it ours.',
  ],
  memoryItems: ['year1-photo1', 'year1-photo2', 'year1-photo3'],
  duration: 100,
  controlHint: 'Tap to jump! Hold to flutter (her sections)',
};
