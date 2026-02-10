import { upgrades } from './upgrades';

export interface ClickerState {
  lpPerTap: number;
  autoLpPerSec: number;
  multiplier: number;
}

export function calculateClickerStats(ownedUpgrades: Record<string, number>): ClickerState {
  let lpPerTap = 1;
  let autoLpPerSec = 0;
  let multiplier = 1;

  for (const upgrade of upgrades) {
    const level = ownedUpgrades[upgrade.id] || 0;
    if (level === 0) continue;

    switch (upgrade.effect) {
      case 'lpPerTap':
        lpPerTap += upgrade.effectValue * level;
        break;
      case 'autoLpPerSec':
        autoLpPerSec += upgrade.effectValue * level;
        break;
      case 'multiplier':
        multiplier += upgrade.effectValue * level;
        break;
    }
  }

  return { lpPerTap, autoLpPerSec, multiplier };
}

export function calculateTapLP(stats: ClickerState, comboMultiplier: number): number {
  return Math.round(stats.lpPerTap * stats.multiplier * comboMultiplier);
}

export function calculateAutoLP(stats: ClickerState, dt: number): number {
  return stats.autoLpPerSec * stats.multiplier * dt;
}

export function getComboMultiplier(comboCount: number): number {
  if (comboCount < 5) return 1;
  if (comboCount < 15) return 1.5;
  if (comboCount < 30) return 2;
  if (comboCount < 50) return 3;
  return 5;
}
