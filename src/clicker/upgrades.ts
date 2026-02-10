export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  costScale: number; // multiply cost per level
  effect: 'lpPerTap' | 'autoLpPerSec' | 'multiplier';
  effectValue: number;
  maxLevel: number;
}

export const upgrades: UpgradeDef[] = [
  {
    id: 'warm-hug',
    name: 'Warm Hug',
    description: '+1 LP per tap',
    icon: '🤗',
    baseCost: 10,
    costScale: 1.5,
    effect: 'lpPerTap',
    effectValue: 1,
    maxLevel: 20,
  },
  {
    id: 'love-letter',
    name: 'Love Letter',
    description: '+0.5 auto LP/sec',
    icon: '💌',
    baseCost: 50,
    costScale: 1.8,
    effect: 'autoLpPerSec',
    effectValue: 0.5,
    maxLevel: 15,
  },
  {
    id: 'anniversary-ring',
    name: 'Anniversary Ring',
    description: '×1.2 LP multiplier',
    icon: '💍',
    baseCost: 200,
    costScale: 2.2,
    effect: 'multiplier',
    effectValue: 0.2,
    maxLevel: 10,
  },
  {
    id: 'candlelight-dinner',
    name: 'Candlelight Dinner',
    description: '+2 LP per tap',
    icon: '🕯️',
    baseCost: 100,
    costScale: 1.6,
    effect: 'lpPerTap',
    effectValue: 2,
    maxLevel: 15,
  },
  {
    id: 'photo-album',
    name: 'Photo Album',
    description: '+1 auto LP/sec',
    icon: '📸',
    baseCost: 300,
    costScale: 2.0,
    effect: 'autoLpPerSec',
    effectValue: 1,
    maxLevel: 10,
  },
  {
    id: 'stargazing',
    name: 'Stargazing',
    description: '×1.5 LP multiplier',
    icon: '✨',
    baseCost: 1000,
    costScale: 2.5,
    effect: 'multiplier',
    effectValue: 0.5,
    maxLevel: 5,
  },
];

export function getUpgradeCost(upgrade: UpgradeDef, currentLevel: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale, currentLevel));
}
