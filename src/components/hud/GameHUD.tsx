
import { motion, AnimatePresence } from 'framer-motion';

interface GameHUDProps {
  score: number;
  lives: number;
  combo: number;
  progress: number;
  levelName: string;
}

export function GameHUD({ score, lives, combo, progress, levelName }: GameHUDProps) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      padding: '8px 16px',
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 6,
      }}>
        {/* Score */}
        <div style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 18, fontWeight: 700, color: '#fff',
          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        }}>
          {score.toLocaleString()}
        </div>

        {/* Level name */}
        <div style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 12, color: 'rgba(255,255,255,0.7)',
          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        }}>
          {levelName}
        </div>

        {/* Lives */}
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.span
              key={i}
              style={{
                fontSize: 16,
                opacity: i < lives ? 1 : 0.2,
                filter: i < lives ? 'none' : 'grayscale(1)',
              }}
              animate={i === lives ? { scale: [1, 0.5, 0] } : {}}
            >
              {'\u2764\uFE0F'}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%', height: 4,
        background: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #ff6b9d, #ff4081)',
            borderRadius: 2,
          }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Combo indicator */}
      <AnimatePresence>
        {combo >= 3 && (
          <motion.div
            style={{
              position: 'absolute',
              top: 48,
              right: 16,
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: combo >= 15 ? '#ffd700' : combo >= 9 ? '#ff4081' : '#ff9eb5',
              textShadow: '0 0 10px currentColor',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            key={combo}
          >
            {combo}x
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
