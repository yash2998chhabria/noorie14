import type { LevelConfig, Segment } from './types';

// Level 3: "Through Everything" — Autumn storm, fast
// Act 1 (His): segments 0-3, Act 2 (Her): segments 4-7, Act 3 (Together): segments 8-11
// Features: Rain during His/Her (clears on Together), shield + slowtime power-ups,
//           2 gauntlets, fire obstacles in seg 9-10, golden corridor + rain_clear

const segments: Segment[] = [
  // === ACT 1: His Chapter ===
  // Segment 0: Quick start
  {
    length: 500,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart' },
      { offset: 200, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 330, type: 'collectible', collectibleType: 'heart' },
      { offset: 430, type: 'obstacle', obstacleType: 'bush', size: 'small' },
    ],
  },
  // Segment 1: Mixed obstacles
  {
    length: 550,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'log', size: 'medium' },
      { offset: 220, type: 'collectible', collectibleType: 'star' },
      { offset: 340, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 440, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Segment 2: Shield power-up + memory in danger zone
  {
    length: 600,
    items: [
      { offset: 80, type: 'powerup', powerUpType: 'shield' },
      { offset: 180, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 300, type: 'collectible', collectibleType: 'heart' },
      { offset: 400, type: 'collectible', collectibleType: 'memory', memoryId: 'year3-photo1' },
      { offset: 520, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
    ],
  },
  // Segment 3: Gauntlet (4 obstacles, tight)
  {
    length: 500,
    items: [
      { offset: 80, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 170, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 260, type: 'obstacle', obstacleType: 'log', size: 'small' },
      { offset: 340, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 430, type: 'collectible', collectibleType: 'star' },
    ],
  },

  // === ACT 2: Her Chapter ===
  // Segment 4: Her storm
  {
    length: 550,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 210, type: 'collectible', collectibleType: 'heart', yOffset: -40 },
      { offset: 330, type: 'obstacle', obstacleType: 'bush', size: 'medium' },
      { offset: 440, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Segment 5: High flutter section
  {
    length: 600,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart', yOffset: -50 },
      { offset: 200, type: 'obstacle', obstacleType: 'log', size: 'medium' },
      { offset: 320, type: 'collectible', collectibleType: 'star' },
      { offset: 430, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 540, type: 'collectible', collectibleType: 'heart', yOffset: -30 },
    ],
  },
  // Segment 6: SlowTime power-up + memory
  {
    length: 550,
    items: [
      { offset: 80, type: 'powerup', powerUpType: 'slowtime' },
      { offset: 180, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 280, type: 'collectible', collectibleType: 'heart' },
      { offset: 380, type: 'collectible', collectibleType: 'memory', memoryId: 'year3-photo2' },
      { offset: 480, type: 'obstacle', obstacleType: 'rock', size: 'small' },
    ],
  },
  // Segment 7: Gauntlet 2
  {
    length: 500,
    items: [
      { offset: 90, type: 'obstacle', obstacleType: 'rock', size: 'medium' },
      { offset: 180, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 270, type: 'obstacle', obstacleType: 'log', size: 'small' },
      { offset: 380, type: 'collectible', collectibleType: 'heart' },
      { offset: 450, type: 'collectible', collectibleType: 'star' },
    ],
  },

  // === ACT 3: Together ===
  // Segment 8: Golden corridor + rain_clear — rising-line hearts
  {
    length: 600,
    golden: true,
    storyEvent: 'rain_clear',
    items: [
      // Rising line: hearts climb upward
      { offset: 60, type: 'collectible', collectibleType: 'heart', yOffset: 0 },
      { offset: 130, type: 'collectible', collectibleType: 'heart', yOffset: -12 },
      { offset: 200, type: 'collectible', collectibleType: 'heart', yOffset: -24 },
      { offset: 270, type: 'collectible', collectibleType: 'heart', yOffset: -36 },
      { offset: 340, type: 'collectible', collectibleType: 'heart', yOffset: -48 },
      { offset: 410, type: 'collectible', collectibleType: 'heart', yOffset: -60 },
      { offset: 480, type: 'collectible', collectibleType: 'heart', yOffset: -72 },
      { offset: 540, type: 'collectible', collectibleType: 'star', yOffset: -80 },
    ],
  },
  // Segment 9: Fire obstacles — storm intensifies
  {
    length: 600,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'fire', size: 'medium' },
      { offset: 220, type: 'collectible', collectibleType: 'heart' },
      { offset: 340, type: 'obstacle', obstacleType: 'rock', size: 'small' },
      { offset: 450, type: 'obstacle', obstacleType: 'fire', size: 'small' },
      { offset: 550, type: 'collectible', collectibleType: 'heart' },
    ],
  },
  // Segment 10: More fire
  {
    length: 550,
    items: [
      { offset: 100, type: 'obstacle', obstacleType: 'fire', size: 'medium' },
      { offset: 200, type: 'collectible', collectibleType: 'heart' },
      { offset: 300, type: 'obstacle', obstacleType: 'bush', size: 'small' },
      { offset: 400, type: 'obstacle', obstacleType: 'fire', size: 'small' },
    ],
  },
  // Segment 11: Storm finale
  {
    length: 500,
    items: [
      { offset: 100, type: 'collectible', collectibleType: 'heart' },
      { offset: 200, type: 'collectible', collectibleType: 'star' },
      { offset: 300, type: 'collectible', collectibleType: 'memory', memoryId: 'year3-photo3' },
      { offset: 400, type: 'collectible', collectibleType: 'heart' },
    ],
  },
];

export const level3: LevelConfig = {
  id: 3,
  name: 'Through Everything',
  subtitle: 'Two houses, one love, zero quit',
  theme: 3,
  gameType: 'runner',
  baseSpeed: 220,
  speedRamp: 5,
  maxSpeed: 340,
  lives: 3,
  segments,
  rapidSegmentIndices: [3, 10],

  // Act transitions
  herStartSegment: 4,
  togetherStartSegment: 8,
  transition1Message: 'Noorie was already on her way to his place...',
  transition2Message: 'San Jose could never keep them apart',

  milestonePhotos: ['year3/milestone.jpg'],
  milestoneMessages: [
    'Year Three — Her parents\' place. His apartment. All those drives. We proved that love isn\'t about proximity — it\'s about showing up, every single time.',
  ],
  memoryItems: ['year3-photo1', 'year3-photo2', 'year3-photo3'],
  duration: 100,
  controlHint: 'Tap to jump! Hold for flutter jump',
};
