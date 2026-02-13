import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../state/GameContext';
import { getPhotoById } from '../../data/photos';
import { Button } from '../shared/Button';

export function PhotoReveal() {
  const { state, dispatch } = useGame();
  const [revealed, setRevealed] = useState(false);

  if (!state.pendingMemory) return null;

  const photo = getPhotoById(state.pendingMemory);
  if (!photo) {
    dispatch({ type: 'SET_PENDING_MEMORY', id: null });
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 60,
          padding: 20,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          style={{ fontSize: 14, color: '#e0aaff', fontFamily: "'Quicksand', sans-serif", marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Memory Unlocked
        </motion.div>

        {/* Polaroid frame */}
        <motion.div
          style={{
            background: '#fff',
            padding: '12px 12px 40px',
            borderRadius: 4,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            transform: 'rotate(-2deg)',
            maxWidth: 280,
          }}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: -2 }}
          transition={{ type: 'spring', damping: 15, delay: 0.2 }}
        >
          <div style={{
            width: 256,
            height: 200,
            background: revealed ? 'transparent' : 'linear-gradient(135deg, #e0aaff, #9d4edd)',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer',
          }}
            onClick={() => setRevealed(true)}
          >
            {revealed ? (
              photo.mediaType === 'video' ? (
                <video
                  src={photo.src}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={photo.src}
                  alt={photo.caption}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )
            ) : (
              <motion.div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, #e0aaff, #9d4edd)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Quicksand', sans-serif",
                  color: '#fff', fontSize: 14, fontWeight: 600,
                }}
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Tap to reveal
              </motion.div>
            )}
          </div>

          {/* Caption */}
          <motion.p
            style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 14,
              color: '#333',
              textAlign: 'center',
              marginTop: 12,
              fontStyle: 'italic',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
          >
            {photo.caption}
          </motion.p>
        </motion.div>

        <motion.div
          style={{ marginTop: 24 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button variant="ghost" onClick={() => dispatch({ type: 'SET_PENDING_MEMORY', id: null })}>
            Continue
          </Button>
        </motion.div>

        {/* Sparkle particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 4, height: 4,
              borderRadius: '50%',
              background: '#e0aaff',
            }}
            initial={{
              x: 0, y: 0, opacity: 0,
            }}
            animate={{
              x: (Math.random() - 0.5) * 300,
              y: (Math.random() - 0.5) * 400,
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2,
              delay: 0.3 + i * 0.1,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
