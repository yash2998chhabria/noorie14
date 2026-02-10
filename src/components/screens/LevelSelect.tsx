
import { motion } from 'framer-motion';
import { useGame } from '../../state/GameContext';
import { levels } from '../../levels';
import { Button } from '../shared/Button';

const themeGradients: Record<number, string> = {
  1: 'linear-gradient(135deg, #81C784, #4CAF50)',
  2: 'linear-gradient(135deg, #FFB74D, #FF9800)',
  3: 'linear-gradient(135deg, #FF8A65, #E65100)',
  4: 'linear-gradient(135deg, #7C4DFF, #1A237E)',
};

export function LevelSelect() {
  const { state, dispatch } = useGame();

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 20px', overflow: 'auto',
    }}>
      <motion.h2
        style={{
          fontFamily: "'Quicksand', sans-serif",
          color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 30,
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Choose a Year
      </motion.h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 300 }}>
        {levels.map((level, i) => {
          const isUnlocked = i === 0 || state.levelsCompleted.includes(level.id - 1);
          const isCompleted = state.levelsCompleted.includes(level.id);

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.button
                style={{
                  width: '100%',
                  padding: 20,
                  borderRadius: 16,
                  border: 'none',
                  background: isUnlocked ? themeGradients[level.theme] : 'rgba(255,255,255,0.05)',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: isUnlocked ? 1 : 0.4,
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                whileTap={isUnlocked ? { scale: 0.97 } : {}}
                onClick={() => isUnlocked && dispatch({ type: 'START_LEVEL', level: level.id })}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: 12, fontWeight: 600,
                    color: 'rgba(255,255,255,0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}>
                    Year {level.id}
                  </div>
                  <div style={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: 20, fontWeight: 700, color: '#fff',
                    marginBottom: 4,
                  }}>
                    {level.name}
                  </div>
                  <div style={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontSize: 13, color: 'rgba(255,255,255,0.7)',
                  }}>
                    {level.subtitle}
                  </div>
                  {isCompleted && (
                    <div style={{
                      position: 'absolute', top: 0, right: 0,
                      fontSize: 20,
                    }}>
                      {'\u2705'}
                    </div>
                  )}
                  {!isUnlocked && (
                    <div style={{
                      position: 'absolute', top: '50%', right: 0,
                      transform: 'translateY(-50%)',
                      fontSize: 24,
                    }}>
                      {'\uD83D\uDD12'}
                    </div>
                  )}
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}>
          Back
        </Button>
      </div>
    </div>
  );
}
