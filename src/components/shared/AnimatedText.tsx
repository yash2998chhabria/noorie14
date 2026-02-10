import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  speed?: number; // ms per character
  style?: React.CSSProperties;
  onComplete?: () => void;
}

export function AnimatedText({ text, speed = 40, style, onComplete }: AnimatedTextProps) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <motion.p
      style={{
        fontFamily: "'Quicksand', sans-serif",
        lineHeight: 1.6,
        ...style,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
        style={{ marginLeft: 2 }}
      >
        |
      </motion.span>
    </motion.p>
  );
}
