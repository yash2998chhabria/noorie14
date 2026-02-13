
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useGame } from '../../state/GameContext';

import { Button } from '../shared/Button';

const encouragements = [
  "Yash wouldn't give up on Noorie, and you shouldn't give up either",
  'Even the drive from San Jose couldn\'t stop them — try again!',
  "Noorie's waiting at the finish line, let's go",
  'You survived living apart in San Jose, you can survive this year',
  "The DM didn't get left on read, so don't leave this story unfinished",
  'Every great love story has a plot twist — this is yours',
  'Four years of love, and you can\'t survive one level? Come on!',
  'She said yes to the DM, now say yes to trying again',
];

const font = "'Quicksand', sans-serif";

function StatBox({ value, label, color, delay }: { value: string; label: string; color: string; delay: number }) {
  return (
    <motion.div
      style={{ textAlign: 'center', flex: 1 }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', damping: 14 }}
    >
      <motion.div
        style={{ fontFamily: font, fontSize: 24, fontWeight: 700, color }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.15, type: 'spring', damping: 10 }}
      >
        {value}
      </motion.div>
      <div style={{
        fontFamily: font, fontSize: 10, color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2,
      }}>
        {label}
      </div>
    </motion.div>
  );
}

export function GameOverOverlay() {
  const { state, dispatch } = useGame();
  const encouragement = useMemo(
    () => encouragements[Math.floor(Math.random() * encouragements.length)],
    [],
  );

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 50,
    }}>
      <motion.div
        style={{ textAlign: 'center', maxWidth: 300, padding: '0 20px' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <motion.div
          style={{ fontSize: 56, marginBottom: 12 }}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: [0, -12, 10, -5, 0] }}
          transition={{ delay: 0.2, type: 'spring', damping: 8 }}
        >
          {'\uD83D\uDC94'}
        </motion.div>

        <motion.h2
          style={{ fontFamily: font, color: '#fff', fontSize: 30, fontWeight: 700, margin: '0 0 8px' }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Oh no!
        </motion.h2>

        <motion.p
          style={{
            fontFamily: font, color: 'rgba(255,255,255,0.55)', fontSize: 14,
            marginBottom: 24, lineHeight: 1.6, fontStyle: 'italic',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {encouragement}
        </motion.p>

        {/* Stats */}
        <motion.div
          style={{
            display: 'flex', justifyContent: 'center', gap: 16,
            marginBottom: 28, padding: '14px 0',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <StatBox value={state.score.toLocaleString()} label="Score" color="#ff9eb5" delay={0.5} />
          <StatBox value={String(state.runHearts)} label="Hearts" color="#ff6b9d" delay={0.65} />
          <StatBox value={`${Math.round(state.progress)}%`} label="Progress" color="#b388ff" delay={0.8} />
        </motion.div>

        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Button onClick={() => dispatch({ type: 'START_LEVEL', level: state.currentLevel })}>
            Try Again
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'levelSelect' })}>
            Level Select
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
