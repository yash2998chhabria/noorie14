import React, { createContext, useContext, useReducer, useEffect } from 'react';

export type Screen =
  | 'title'
  | 'levelSelect'
  | 'levelIntro'
  | 'game'
  | 'milestone'
  | 'gameOver'
  | 'clicker'
  | 'gallery'
  | 'final';

export interface GameState {
  screen: Screen;
  currentLevel: number;
  levelsCompleted: number[];
  score: number;
  totalHearts: number;
  lovePoints: number;
  unlockedPhotos: string[];
  unlockedAchievements: string[];
  combo: number;
  lives: number;
  progress: number;
  // Clicker state
  clickerLpPerTap: number;
  clickerAutoLpPerSec: number;
  clickerMultiplier: number;
  clickerUpgrades: Record<string, number>;
  // Audio
  muted: boolean;
  // Game running state
  gameRunning: boolean;
  // Per-run hearts counter
  runHearts: number;
  // Pending photo reveal
  pendingMemory: string | null;
}

const initialState: GameState = {
  screen: 'title',
  currentLevel: 1,
  levelsCompleted: [],
  score: 0,
  totalHearts: 0,
  lovePoints: 0,
  unlockedPhotos: [],
  unlockedAchievements: [],
  combo: 0,
  lives: 3,
  progress: 0,
  clickerLpPerTap: 1,
  clickerAutoLpPerSec: 0,
  clickerMultiplier: 1,
  clickerUpgrades: {},
  muted: false,
  gameRunning: false,
  runHearts: 0,
  pendingMemory: null,
};

export type GameAction =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'START_LEVEL'; level: number }
  | { type: 'COMPLETE_LEVEL'; level: number }
  | { type: 'ADD_SCORE'; points: number }
  | { type: 'ADD_HEARTS'; amount: number }
  | { type: 'SET_COMBO'; count: number }
  | { type: 'SET_LIVES'; lives: number }
  | { type: 'SET_PROGRESS'; percent: number }
  | { type: 'UNLOCK_PHOTO'; id: string }
  | { type: 'ADD_LP'; amount: number }
  | { type: 'SPEND_LP'; amount: number }
  | { type: 'BUY_UPGRADE'; upgradeId: string; cost: number }
  | { type: 'SET_CLICKER_STATS'; lpPerTap: number; autoLpPerSec: number; multiplier: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'GAME_OVER' }
  | { type: 'SET_PENDING_MEMORY'; id: string | null }
  | { type: 'SET_GAME_RUNNING'; running: boolean }
  | { type: 'LOAD_STATE'; state: Partial<GameState> };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'START_LEVEL':
      return { ...state, currentLevel: action.level, screen: 'levelIntro', score: 0, combo: 0, progress: 0, lives: 3, runHearts: 0 };
    case 'COMPLETE_LEVEL': {
      const completed = state.levelsCompleted.includes(action.level)
        ? state.levelsCompleted
        : [...state.levelsCompleted, action.level];
      // Convert hearts to LP
      const lpBonus = state.totalHearts * 2;
      return { ...state, levelsCompleted: completed, lovePoints: state.lovePoints + lpBonus, screen: 'milestone', gameRunning: false };
    }
    case 'ADD_SCORE':
      return { ...state, score: state.score + action.points };
    case 'ADD_HEARTS':
      return { ...state, totalHearts: state.totalHearts + action.amount, runHearts: state.runHearts + action.amount };
    case 'SET_COMBO':
      return { ...state, combo: action.count };
    case 'SET_LIVES':
      return { ...state, lives: action.lives };
    case 'SET_PROGRESS':
      return { ...state, progress: action.percent };
    case 'UNLOCK_PHOTO':
      if (state.unlockedPhotos.includes(action.id)) return state;
      return { ...state, unlockedPhotos: [...state.unlockedPhotos, action.id] };
    case 'ADD_LP':
      return { ...state, lovePoints: state.lovePoints + action.amount };
    case 'SPEND_LP':
      return { ...state, lovePoints: Math.max(0, state.lovePoints - action.amount) };
    case 'BUY_UPGRADE': {
      const level = (state.clickerUpgrades[action.upgradeId] || 0) + 1;
      return {
        ...state,
        lovePoints: state.lovePoints - action.cost,
        clickerUpgrades: { ...state.clickerUpgrades, [action.upgradeId]: level },
      };
    }
    case 'SET_CLICKER_STATS':
      return {
        ...state,
        clickerLpPerTap: action.lpPerTap,
        clickerAutoLpPerSec: action.autoLpPerSec,
        clickerMultiplier: action.multiplier,
      };
    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted };
    case 'GAME_OVER':
      return { ...state, screen: 'gameOver', gameRunning: false };
    case 'SET_PENDING_MEMORY':
      return { ...state, pendingMemory: action.id };
    case 'SET_GAME_RUNNING':
      return { ...state, gameRunning: action.running };
    case 'LOAD_STATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

const SAVE_KEY = 'our-journey-save';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (init) => {
    // Load from localStorage
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...init, ...parsed, screen: 'title', gameRunning: false, pendingMemory: null };
      }
    } catch {}
    return init;
  });

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const { screen, gameRunning, pendingMemory, ...saveable } = state;
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveable));
    }, 10000);
    return () => clearInterval(interval);
  }, [state]);

  // Save on unload — reset transient game state so it doesn't persist
  useEffect(() => {
    const onUnload = () => {
      const { screen, gameRunning, pendingMemory, ...saveable } = state;
      // Reset transient per-level state so a reload doesn't carry stale values
      saveable.lives = 3;
      saveable.score = 0;
      saveable.combo = 0;
      saveable.progress = 0;
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveable));
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [state]);

  // Debug: expose dispatch to window for testing
  useEffect(() => {
    (window as any).__gameDispatch = dispatch;
    (window as any).__gameState = state;
  }, [state, dispatch]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
