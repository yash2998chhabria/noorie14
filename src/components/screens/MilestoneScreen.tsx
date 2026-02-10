import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../state/GameContext';
import { getMilestoneMessage } from '../../data/messages';
import { AnimatedText } from '../shared/AnimatedText';
import { Button } from '../shared/Button';
import { FloatingHearts } from '../shared/FloatingHearts';

export function MilestoneScreen() {
  const { state, dispatch } = useGame();
  const milestone = getMilestoneMessage(state.currentLevel);
  const [showMessage, setShowMessage] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowMessage(true), 1500);
    const t2 = setTimeout(() => setShowButton(true), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleNext = () => {
    if (state.currentLevel >= 4) {
      dispatch({ type: 'SET_SCREEN', screen: 'final' });
    } else {
      dispatch({ type: 'SET_SCREEN', screen: 'levelSelect' });
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, overflow: 'hidden',
    }}>
      <FloatingHearts count={10} />

      {/* Confetti burst */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 6 + Math.random() * 6,
            height: 6 + Math.random() * 6,
            borderRadius: i % 2 === 0 ? '50%' : 2,
            background: ['#ff6b9d', '#ffd700', '#7c4dff', '#00e5ff', '#ff4081', '#ffeb3b'][i % 6],
          }}
          initial={{ x: '50%', y: '30%', opacity: 1, scale: 0 }}
          animate={{
            x: `${10 + Math.random() * 80}%`,
            y: `${60 + Math.random() * 40}%`,
            opacity: 0,
            scale: [0, 1.5, 1],
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: 1.5 + Math.random(),
            delay: i * 0.05,
            ease: 'easeOut',
          }}
        />
      ))}

      <motion.div
        style={{ textAlign: 'center', zIndex: 1, maxWidth: 320 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          style={{ fontSize: 56, marginBottom: 16 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10, delay: 0.3 }}
        >
          {'\uD83C\uDF89'}
        </motion.div>

        <motion.h2
          style={{
            fontFamily: "'Quicksand', sans-serif",
            color: '#ffd700', fontSize: 14,
            textTransform: 'uppercase', letterSpacing: 3,
            marginBottom: 8,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Level Complete
        </motion.h2>

        <motion.h1
          style={{
            fontFamily: "'Quicksand', sans-serif",
            color: '#fff', fontSize: 28, fontWeight: 700,
            margin: '0 0 4px',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {milestone?.title}
        </motion.h1>

        <motion.div
          style={{
            fontFamily: "'Quicksand', sans-serif",
            color: '#ff9eb5', fontSize: 20, fontWeight: 700,
            marginBottom: 24,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Score: {state.score.toLocaleString()}
        </motion.div>

        {showMessage && milestone && (
          <AnimatedText
            text={milestone.message}
            speed={35}
            style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, textAlign: 'center' }}
          />
        )}

        {showButton && (
          <motion.div
            style={{ marginTop: 30 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button onClick={handleNext}>
              {state.currentLevel >= 4 ? 'The Grand Finale' : 'Continue'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
