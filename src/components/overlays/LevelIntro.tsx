import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../state/GameContext';
import { getLevel } from '../../levels';

const themeGradients: Record<number, string> = {
  1: 'linear-gradient(135deg, #C8E6C9, #4CAF50)',
  2: 'linear-gradient(135deg, #FFE0B2, #FF9800)',
  3: 'linear-gradient(135deg, #FFCC80, #E65100)',
  4: 'linear-gradient(135deg, #7C4DFF, #1A237E)',
};

export function LevelIntro() {
  const { state, dispatch } = useGame();
  const level = getLevel(state.currentLevel);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => {
      dispatch({ type: 'SET_SCREEN', screen: 'game' });
    }, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [dispatch]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: themeGradients[level.theme] || themeGradients[1],
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <motion.div
        style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 14, fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          textTransform: 'uppercase',
          letterSpacing: 3,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 0 ? { opacity: 1, y: 0 } : {}}
      >
        Year {level.id}
      </motion.div>

      <motion.h1
        style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 36, fontWeight: 700,
          color: '#fff',
          margin: '12px 0 8px',
          textShadow: '0 2px 20px rgba(0,0,0,0.3)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1 } : {}}
        transition={{ type: 'spring', damping: 12 }}
      >
        {level.name}
      </motion.h1>

      <motion.p
        style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 16, color: 'rgba(255,255,255,0.9)',
          textAlign: 'center',
          maxWidth: 260,
        }}
        initial={{ opacity: 0 }}
        animate={phase >= 2 ? { opacity: 1 } : {}}
      >
        {level.subtitle}
      </motion.p>

      <motion.div
        style={{
          marginTop: 40,
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 13, color: 'rgba(255,255,255,0.6)',
        }}
        initial={{ opacity: 0 }}
        animate={phase >= 2 ? { opacity: 1 } : {}}
      >
        Tap to jump, Swipe up for super jump
      </motion.div>
    </div>
  );
}
