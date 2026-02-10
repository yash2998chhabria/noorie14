import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../state/GameContext';
import { finalMessage } from '../../data/messages';
import { AnimatedText } from '../shared/AnimatedText';
import { Button } from '../shared/Button';
import { FloatingHearts } from '../shared/FloatingHearts';

export function FinalScreen() {
  const { dispatch, state } = useGame();
  const [phase, setPhase] = useState(0);
  const [showLetter, setShowLetter] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setShowLetter(true), 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 30%, #1a237e 60%, #0d47a1 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 24,
      overflow: 'auto',
    }}>
      <FloatingHearts count={12} />

      {/* Stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            borderRadius: '50%',
            background: '#fff',
            left: `${(i * 73 + 17) % 100}%`,
            top: `${(i * 41 + 7) % 60}%`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2 + Math.random() * 2,
            delay: i * 0.2,
          }}
        />
      ))}

      <div style={{ textAlign: 'center', zIndex: 1, maxWidth: 340, marginTop: 20 }}>
        {/* Fireworks */}
        {phase >= 1 && Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`fw-${i}`}
            style={{
              position: 'fixed',
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: ['#ff6b9d', '#ffd700', '#7c4dff', '#00e5ff', '#ff4081'][i % 5],
            }}
            initial={{ x: '50vw', y: '50vh', opacity: 1, scale: 0 }}
            animate={{
              x: `${15 + Math.random() * 70}vw`,
              y: `${10 + Math.random() * 50}vh`,
              opacity: [1, 1, 0],
              scale: [0, 2, 0],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.15,
              ease: 'easeOut',
            }}
          />
        ))}

        <motion.div
          style={{ fontSize: 64, marginBottom: 16 }}
          initial={{ scale: 0 }}
          animate={phase >= 0 ? { scale: 1 } : {}}
          transition={{ type: 'spring', damping: 8 }}
        >
          {'\uD83D\uDC95'}
        </motion.div>

        <motion.h1
          style={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: 32, fontWeight: 700, color: '#fff',
            margin: '0 0 4px',
            textShadow: '0 2px 20px rgba(255,107,157,0.5)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
        >
          {finalMessage.title}
        </motion.h1>

        <motion.p
          style={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: 16, color: '#ff9eb5', marginBottom: 24,
          }}
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : {}}
        >
          {finalMessage.subtitle}
        </motion.p>

        {/* Stats */}
        <motion.div
          style={{
            display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24,
            flexWrap: 'wrap',
          }}
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : {}}
        >
          <StatBadge label="Levels" value={state.levelsCompleted.length.toString()} />
          <StatBadge label="Photos" value={state.unlockedPhotos.length.toString()} />
          <StatBadge label="Hearts" value={state.totalHearts.toString()} />
          <StatBadge label="LP" value={Math.floor(state.lovePoints).toString()} />
        </motion.div>

        {/* Love letter */}
        {showLetter && (
          <motion.div
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 16,
              padding: 24,
              textAlign: 'left',
              marginBottom: 24,
              border: '1px solid rgba(255,107,157,0.2)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AnimatedText
              text={finalMessage.letter}
              speed={30}
              style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, whiteSpace: 'pre-line' }}
            />
          </motion.div>
        )}

        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
        >
          <Button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}>
            Back to Home
          </Button>
          {state.unlockedPhotos.length > 0 && (
            <Button variant="ghost" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'gallery' })}>
              View Gallery
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '8px 16px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: "'Quicksand', sans-serif",
        fontSize: 20, fontWeight: 700, color: '#ffd700',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'Quicksand', sans-serif",
        fontSize: 11, color: 'rgba(255,255,255,0.5)',
      }}>
        {label}
      </div>
    </div>
  );
}
