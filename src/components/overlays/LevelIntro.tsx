import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setReady(true), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const startCountdown = useCallback(() => {
    if (!ready || countdown !== null) return;
    setCountdown(3);
  }, [ready, countdown]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      dispatch({ type: 'SET_SCREEN', screen: 'game' });
      return;
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 600);
    return () => clearTimeout(t);
  }, [countdown, dispatch]);

  const controlHint = level.controlHint || 'Tap to jump! Hold for flutter jump';

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: themeGradients[level.theme] || themeGradients[1],
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: ready && countdown === null ? 'pointer' : 'default',
      }}
      onClick={startCountdown}
      onTouchStart={startCountdown}
    >
      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            key={countdown}
            style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                fontFamily: "'Quicksand', sans-serif",
                fontSize: 96, fontWeight: 700, color: '#fff',
                textShadow: '0 0 40px rgba(255,255,255,0.5)',
              }}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3, type: 'spring', damping: 12 }}
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <motion.div
        style={{ fontSize: 40, margin: '8px 0' }}
        initial={{ opacity: 0, scale: 0 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1 } : {}}
        transition={{ type: 'spring', damping: 10 }}
      >
        {'\uD83C\uDFC3'}
      </motion.div>

      <motion.h1
        style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 36, fontWeight: 700,
          color: '#fff',
          margin: '4px 0 8px',
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
          marginTop: 30,
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 14, color: 'rgba(255,255,255,0.7)',
          textAlign: 'center',
          maxWidth: 280,
          padding: '8px 16px',
          background: 'rgba(0,0,0,0.15)',
          borderRadius: 12,
        }}
        initial={{ opacity: 0 }}
        animate={phase >= 2 ? { opacity: 1 } : {}}
      >
        {controlHint}
      </motion.div>

      {/* Tap to start prompt */}
      {countdown === null && (
        <motion.div
          style={{
            marginTop: 40,
            fontFamily: "'Quicksand', sans-serif",
            fontSize: 16, fontWeight: 600,
            color: '#fff',
            textAlign: 'center',
          }}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: [0.4, 1, 0.4] } : { opacity: 0 }}
          transition={ready ? { repeat: Infinity, duration: 1.5 } : {}}
        >
          Tap anywhere to start
        </motion.div>
      )}
    </div>
  );
}
