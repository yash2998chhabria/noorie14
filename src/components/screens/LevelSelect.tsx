
import { motion } from 'framer-motion';
import { useGame } from '../../state/GameContext';
import { levels } from '../../levels';
import { Button } from '../shared/Button';
import { FloatingHearts } from '../shared/FloatingHearts';

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
      <FloatingHearts count={5} />

      <motion.div
        style={{ textAlign: 'center', marginBottom: 30, zIndex: 1 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 13, color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6,
        }}>
          Our Journey
        </div>
        <h2 style={{
          fontFamily: "'Quicksand', sans-serif",
          color: '#fff', fontSize: 26, fontWeight: 700, margin: 0,
        }}>
          Choose a Year
        </h2>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 300, zIndex: 1 }}>
        {levels.map((level, i) => {
          const isUnlocked = i === 0 || state.levelsCompleted.includes(level.id - 1);
          const isCompleted = state.levelsCompleted.includes(level.id);

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
            >
              <motion.button
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  borderRadius: 18,
                  border: isCompleted ? '2px solid rgba(255,255,255,0.15)' : '2px solid transparent',
                  background: isUnlocked ? themeGradients[level.theme] : 'rgba(255,255,255,0.05)',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: isUnlocked ? 1 : 0.4,
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isUnlocked ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
                }}
                whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
                whileTap={isUnlocked ? { scale: 0.97 } : {}}
                onClick={() => isUnlocked && dispatch({ type: 'START_LEVEL', level: level.id })}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 6,
                  }}>
                    <div style={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: 11, fontWeight: 600,
                      color: 'rgba(255,255,255,0.8)',
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                    }}>
                      Year {level.id}
                    </div>
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
                    fontSize: 13, color: 'rgba(255,255,255,0.75)',
                    lineHeight: 1.4,
                  }}>
                    {level.subtitle}
                  </div>
                  {isCompleted && (
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      fontSize: 16,
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

      <motion.div
        style={{ marginTop: 24, zIndex: 1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}>
          Back
        </Button>
      </motion.div>
    </div>
  );
}
