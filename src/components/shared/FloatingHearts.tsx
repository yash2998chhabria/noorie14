
import { motion } from 'framer-motion';

export function FloatingHearts({ count = 6 }: { count?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${10 + (i * 80 / count)}%`,
            bottom: -30,
            fontSize: 16 + Math.random() * 12,
            opacity: 0.3,
          }}
          animate={{
            y: [0, -700],
            x: [0, Math.sin(i) * 40],
            rotate: [0, Math.random() * 360],
            opacity: [0.3, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeOut',
          }}
        >
          {i % 3 === 0 ? '\u2764' : i % 3 === 1 ? '\u2665' : '\u2661'}
        </motion.div>
      ))}
    </div>
  );
}
