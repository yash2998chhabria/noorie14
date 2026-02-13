
import { motion } from 'framer-motion';
import { useGame } from '../../state/GameContext';
import { Button } from '../shared/Button';
import { FloatingHearts } from '../shared/FloatingHearts';

export function TitleScreen() {
  const { dispatch, state } = useGame();

  const hasSave = state.levelsCompleted.length > 0;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, overflow: 'hidden',
    }}>
      <FloatingHearts count={8} />

      <motion.div
        style={{ textAlign: 'center', zIndex: 1 }}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          style={{ fontSize: 48, marginBottom: 8 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {'\u2764\uFE0F'}
        </motion.div>

        <h1 style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 36,
          fontWeight: 700,
          color: '#fff',
          margin: 0,
          textShadow: '0 2px 20px rgba(255,107,157,0.5)',
        }}>
          Yash & Noorie
        </h1>

        <motion.p
          style={{
            fontFamily: "'Quicksand', sans-serif",
            color: '#ff9eb5',
            fontSize: 16,
            marginTop: 8,
            opacity: 0.9,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ delay: 0.4 }}
        >
          4 Years of Us
        </motion.p>
      </motion.div>

      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 48, zIndex: 1, width: '100%', maxWidth: 260 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button size="lg" onClick={() => {
          if (hasSave) {
            dispatch({ type: 'SET_SCREEN', screen: 'levelSelect' });
          } else {
            dispatch({ type: 'START_LEVEL', level: 1 });
          }
        }}>
          {hasSave ? 'Continue Our Story' : 'Begin Our Story'}
        </Button>

        {hasSave && (
          <Button variant="ghost" onClick={() => dispatch({ type: 'START_LEVEL', level: 1 })}>
            Start Over
          </Button>
        )}

        <Button variant="secondary" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'clicker' })}>
          Love Clicker
        </Button>

        {state.unlockedPhotos.length > 0 && (
          <Button variant="ghost" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'gallery' })}>
            Gallery ({state.unlockedPhotos.length})
          </Button>
        )}
      </motion.div>

      <motion.p
        style={{
          position: 'absolute', bottom: 20,
          fontFamily: "'Quicksand', sans-serif",
          color: 'rgba(255,255,255,0.3)',
          fontSize: 12,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Made with love, for my Noorie
      </motion.p>
    </div>
  );
}
