import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  show: boolean;
  children: React.ReactNode;
}

export function TransitionOverlay({ show, children }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
            }}
          />
          <motion.div
            style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 360, padding: '0 20px' }}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
