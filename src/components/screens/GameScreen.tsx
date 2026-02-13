import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useGame } from '../../state/GameContext';
import { GameManager } from '../../game/GameManager';
import { getLevel } from '../../levels';
import { GameHUD } from '../hud/GameHUD';
import type { GameEvent, ActType } from '../../game/LevelEngine';

const themeBackgrounds: Record<number, string> = {
  1: 'linear-gradient(180deg, #1a3a1a 0%, #0d1f0d 100%)',
  2: 'linear-gradient(180deg, #3d2200 0%, #1a0f00 100%)',
  3: 'linear-gradient(180deg, #2a1a3d 0%, #0f0a1a 100%)',
  4: 'linear-gradient(180deg, #0a0a2e 0%, #050515 100%)',
};

export function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameManager | null>(null);
  const { state, dispatch } = useGame();
  const levelConfig = getLevel(state.currentLevel);
  const [currentAct, setCurrentAct] = useState<ActType>('his');

  const bgGradient = useMemo(
    () => themeBackgrounds[levelConfig.theme] || themeBackgrounds[1],
    [levelConfig.theme],
  );

  const handleEvent = useCallback((event: GameEvent) => {
    switch (event.type) {
      case 'score':
        dispatch({ type: 'ADD_SCORE', points: event.points });
        break;
      case 'heart':
        dispatch({ type: 'ADD_HEARTS', amount: event.amount });
        break;
      case 'combo':
        dispatch({ type: 'SET_COMBO', count: event.count });
        break;
      case 'hit':
        dispatch({ type: 'SET_LIVES', lives: event.livesLeft });
        break;
      case 'progress':
        dispatch({ type: 'SET_PROGRESS', percent: event.percent });
        break;
      case 'memory':
        dispatch({ type: 'UNLOCK_PHOTO', id: event.id });
        dispatch({ type: 'SET_PENDING_MEMORY', id: event.id });
        break;
      case 'gameOver':
        dispatch({ type: 'GAME_OVER' });
        break;
      case 'levelComplete':
        dispatch({ type: 'COMPLETE_LEVEL', level: state.currentLevel });
        break;
      case 'actChange':
        setCurrentAct(event.act);
        break;
    }
  }, [dispatch, state.currentLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setCurrentAct('his');
    const gm = new GameManager(canvas);
    gameRef.current = gm;
    gm.startLevel(levelConfig, handleEvent);
    dispatch({ type: 'SET_GAME_RUNNING', running: true });

    return () => {
      gm.destroy();
      gameRef.current = null;
    };
  }, [levelConfig, handleEvent, dispatch]);

  // Pause/resume on visibility change and memory overlay
  useEffect(() => {
    if (state.pendingMemory) {
      gameRef.current?.pause();
    } else if (!document.hidden) {
      gameRef.current?.resume();
    }

    const onVisibility = () => {
      if (document.hidden) {
        gameRef.current?.pause();
      } else if (!state.pendingMemory) {
        gameRef.current?.resume();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [state.pendingMemory]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: bgGradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      touchAction: 'none',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          borderRadius: 12,
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
        }}
      />
      <GameHUD
        score={state.score}
        lives={state.lives}
        combo={state.combo}
        progress={state.progress}
        levelName={levelConfig.name}
        currentAct={currentAct}
      />
    </div>
  );
}
