import { useRef, useEffect, useCallback } from 'react';
import { useGame } from '../../state/GameContext';
import { GameManager } from '../../game/GameManager';
import { getLevel } from '../../levels';
import { GameHUD } from '../hud/GameHUD';
import type { GameEvent } from '../../game/LevelRunner';

export function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameManager | null>(null);
  const { state, dispatch } = useGame();
  const levelConfig = getLevel(state.currentLevel);

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
    }
  }, [dispatch, state.currentLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gm = new GameManager(canvas);
    gameRef.current = gm;
    gm.startLevel(levelConfig, handleEvent);
    dispatch({ type: 'SET_GAME_RUNNING', running: true });

    return () => {
      gm.destroy();
      gameRef.current = null;
    };
  }, [levelConfig, handleEvent, dispatch]);

  // Pause/resume on visibility change
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        gameRef.current?.pause();
      } else {
        gameRef.current?.resume();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      touchAction: 'none',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />
      <GameHUD
        score={state.score}
        lives={state.lives}
        combo={state.combo}
        progress={state.progress}
        levelName={levelConfig.name}
      />
    </div>
  );
}
