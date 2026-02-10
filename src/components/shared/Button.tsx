import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '' }: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    border: 'none',
    borderRadius: size === 'lg' ? 16 : 12,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Quicksand', sans-serif",
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s',
    userSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 16px', fontSize: 14 },
    md: { padding: '12px 24px', fontSize: 16 },
    lg: { padding: '16px 32px', fontSize: 18 },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #ff6b9d, #c44569)',
      color: '#fff',
      boxShadow: '0 4px 15px rgba(255,107,157,0.4)',
    },
    secondary: {
      background: 'linear-gradient(135deg, #7c4dff, #536dfe)',
      color: '#fff',
      boxShadow: '0 4px 15px rgba(124,77,255,0.3)',
    },
    ghost: {
      background: 'rgba(255,255,255,0.1)',
      color: '#fff',
      border: '2px solid rgba(255,255,255,0.3)',
    },
  };

  return (
    <motion.button
      style={{ ...baseStyles, ...sizeStyles[size], ...variantStyles[variant] }}
      className={className}
      onClick={disabled ? undefined : onClick}
      whileTap={disabled ? {} : { scale: 0.95 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
    >
      {children}
    </motion.button>
  );
}
