
import { motion } from 'framer-motion';
import { useGame } from '../../state/GameContext';
import { Button } from '../shared/Button';

export function GameOverOverlay() {
  const { state, dispatch } = useGame();

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 50,
    }}>
      <motion.div
        style={{ textAlign: 'center' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <motion.div
          style={{ fontSize: 48, marginBottom: 12 }}
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {'\uD83D\uDC94'}
        </motion.div>

        <h2 style={{
          fontFamily: "'Quicksand', sans-serif",
          color: '#fff', fontSize: 28, fontWeight: 700, margin: '0 0 8px',
        }}>
          Oh no!
        </h2>

        <p style={{
          fontFamily: "'Quicksand', sans-serif",
          color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 8,
        }}>
          But every love story has its challenges
        </p>

        <p style={{
          fontFamily: "'Quicksand', sans-serif",
          color: '#ff9eb5', fontSize: 20, fontWeight: 700, marginBottom: 30,
        }}>
          Score: {state.score.toLocaleString()}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button onClick={() => dispatch({ type: 'START_LEVEL', level: state.currentLevel })}>
            Try Again
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'levelSelect' })}>
            Level Select
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
