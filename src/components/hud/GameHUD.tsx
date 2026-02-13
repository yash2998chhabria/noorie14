
import { motion, AnimatePresence } from 'framer-motion';
import type { ActType } from '../../game/LevelEngine';

interface GameHUDProps {
  score: number;
  lives: number;
  combo: number;
  progress: number;
  levelName: string;
  currentAct?: ActType;
}

const actLabels: Record<ActType, { label: string; color: string }> = {
  his: { label: "Yash's Side", color: '#ff6b9d' },
  her: { label: "Noorie's Side", color: '#b388ff' },
  together: { label: 'Yash & Noorie', color: '#ffd700' },
};

export function GameHUD({ score, lives, combo, progress, levelName, currentAct }: GameHUDProps) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      padding: '10px 16px',
      pointerEvents: 'none',
      zIndex: 10,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 100%)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8,
      }}>
        {/* Score */}
        <div style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 22, fontWeight: 700, color: '#fff',
          textShadow: '0 1px 6px rgba(0,0,0,0.6)',
          minWidth: 60,
        }}>
          {score.toLocaleString()}
        </div>

        {/* Level name + act indicator */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}>
            {levelName}
          </div>
          {currentAct && (
            <div style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 10, fontWeight: 600,
              color: actLabels[currentAct].color,
              textShadow: '0 0 6px currentColor',
              marginTop: 2,
            }}>
              {actLabels[currentAct].label}
            </div>
          )}
        </div>

        {/* Lives */}
        <div style={{ display: 'flex', gap: 4, minWidth: 60, justifyContent: 'flex-end' }}>
          {Array.from({ length: Math.max(lives, 3) }).map((_, i) => (
            <motion.span
              key={i}
              style={{
                fontSize: 18,
                opacity: i < lives ? 1 : 0.15,
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
        width: '100%', height: 6,
        background: 'rgba(255,255,255,0.12)',
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #ff6b9d, #ff4081)',
            borderRadius: 3,
            boxShadow: '0 0 8px rgba(255,100,150,0.4)',
          }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Combo indicator */}
      <AnimatePresence>
        {combo >= 3 && (
          <motion.div
            style={{
              position: 'absolute',
              top: 56,
              right: 16,
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 24,
              fontWeight: 700,
              color: combo >= 15 ? '#ffd700' : combo >= 9 ? '#ff4081' : '#ff9eb5',
              textShadow: '0 0 12px currentColor',
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
