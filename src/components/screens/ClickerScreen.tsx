import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../state/GameContext';
import { calculateClickerStats, calculateTapLP, getComboMultiplier } from '../../clicker/ClickerEngine';
import { upgrades, getUpgradeCost } from '../../clicker/upgrades';
import { Button } from '../shared/Button';
import { audio } from '../../engine/AudioManager';

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  value: number;
}

let floatId = 0;

export function ClickerScreen() {
  const { state, dispatch } = useGame();
  const [combo, setCombo] = useState(0);
  const [, setComboTimer] = useState(0);
  const [floats, setFloats] = useState<FloatingNumber[]>([]);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const autoAccumulator = useRef(0);

  const stats = calculateClickerStats(state.clickerUpgrades);

  // Update clicker stats in state
  useEffect(() => {
    dispatch({
      type: 'SET_CLICKER_STATS',
      lpPerTap: stats.lpPerTap,
      autoLpPerSec: stats.autoLpPerSec,
      multiplier: stats.multiplier,
    });
  }, [stats.lpPerTap, stats.autoLpPerSec, stats.multiplier, dispatch]);

  // Auto LP generation
  useEffect(() => {
    if (stats.autoLpPerSec <= 0) return;
    const interval = setInterval(() => {
      autoAccumulator.current += stats.autoLpPerSec * stats.multiplier * 0.1;
      if (autoAccumulator.current >= 1) {
        const amount = Math.floor(autoAccumulator.current);
        autoAccumulator.current -= amount;
        dispatch({ type: 'ADD_LP', amount });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [stats.autoLpPerSec, stats.multiplier, dispatch]);

  // Combo decay
  useEffect(() => {
    if (combo <= 0) return;
    const interval = setInterval(() => {
      setComboTimer(prev => {
        if (prev <= 0) {
          setCombo(0);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [combo]);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const newCombo = combo + 1;
    setCombo(newCombo);
    setComboTimer(2.0);

    const multiplier = getComboMultiplier(newCombo);
    const lp = calculateTapLP(stats, multiplier);
    dispatch({ type: 'ADD_LP', amount: lp });

    audio.playSynth('click');
    audio.haptic('light');

    // Floating number
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX || rect.left + rect.width / 2 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY || rect.top : e.clientY;
    const id = ++floatId;
    setFloats(prev => [...prev.slice(-15), { id, x: clientX - rect.left, y: clientY - rect.top - 40, value: lp }]);
    setTimeout(() => {
      setFloats(prev => prev.filter(f => f.id !== id));
    }, 800);
  }, [combo, stats, dispatch]);

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    const level = state.clickerUpgrades[upgradeId] || 0;
    if (level >= upgrade.maxLevel) return;
    const cost = getUpgradeCost(upgrade, level);
    if (state.lovePoints < cost) return;
    dispatch({ type: 'BUY_UPGRADE', upgradeId, cost });
    audio.playSynth('upgrade');
    audio.haptic('medium');
  };

  const comboMultiplier = getComboMultiplier(combo);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #2d1b4e, #1a1a2e)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 20, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12,
      }}>
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })}>
          Back
        </Button>
        <div style={{
          fontFamily: "'Quicksand', sans-serif",
          color: '#fff', fontSize: 14, fontWeight: 600,
        }}>
          Love Clicker
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowUpgrades(!showUpgrades)}>
          {showUpgrades ? 'Close' : 'Shop'}
        </Button>
      </div>

      {/* LP display */}
      <motion.div
        style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: 36, fontWeight: 700, color: '#ff6b9d',
          textShadow: '0 0 20px rgba(255,107,157,0.5)',
          marginBottom: 4,
        }}
        key={state.lovePoints}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.15 }}
      >
        {Math.floor(state.lovePoints).toLocaleString()} LP
      </motion.div>

      {/* Stats */}
      <div style={{
        fontFamily: "'Quicksand', sans-serif",
        color: 'rgba(255,255,255,0.5)', fontSize: 12,
        display: 'flex', gap: 16, marginBottom: 20,
      }}>
        <span>+{stats.lpPerTap}/tap</span>
        {stats.autoLpPerSec > 0 && <span>+{(stats.autoLpPerSec * stats.multiplier).toFixed(1)}/s</span>}
        {stats.multiplier > 1 && <span>x{stats.multiplier.toFixed(1)}</span>}
      </div>

      {/* Combo */}
      <AnimatePresence>
        {combo >= 5 && (
          <motion.div
            style={{
              fontFamily: "'Quicksand', sans-serif",
              fontSize: 18, fontWeight: 700,
              color: comboMultiplier >= 3 ? '#ffd700' : '#ff9eb5',
              textShadow: '0 0 10px currentColor',
              marginBottom: 8,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {combo}x Combo! (x{comboMultiplier})
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big heart button */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <motion.button
          style={{
            width: 160, height: 160,
            borderRadius: '50%',
            border: 'none',
            background: 'radial-gradient(circle at 30% 30%, #ff9eb5, #ff4d6d, #c44569)',
            boxShadow: '0 0 40px rgba(255,77,109,0.4), inset 0 -4px 10px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 60,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            position: 'relative',
          }}
          whileTap={{ scale: 0.9 }}
          onMouseDown={handleTap}
          onTouchStart={handleTap}
        >
          {'\u2764\uFE0F'}
        </motion.button>

        {/* Floating numbers */}
        <AnimatePresence>
          {floats.map(f => (
            <motion.div
              key={f.id}
              style={{
                position: 'absolute',
                left: '50%',
                top: '40%',
                fontFamily: "'Quicksand', sans-serif",
                fontSize: f.value >= 10 ? 22 : 18,
                fontWeight: 700,
                color: f.value >= 10 ? '#ffd700' : '#ff9eb5',
                textShadow: '0 0 8px currentColor',
                pointerEvents: 'none',
              }}
              initial={{ opacity: 1, y: 0, x: (Math.random() - 0.5) * 60 }}
              animate={{ opacity: 0, y: -80 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              +{f.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Upgrade panel */}
      <AnimatePresence>
        {showUpgrades && (
          <motion.div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(26,26,46,0.95)',
              backdropFilter: 'blur(10px)',
              borderTopLeftRadius: 20, borderTopRightRadius: 20,
              padding: '20px 16px',
              maxHeight: '55%',
              overflow: 'auto',
              zIndex: 20,
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <h3 style={{
              fontFamily: "'Quicksand', sans-serif",
              color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 12px',
            }}>
              Upgrades
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upgrades.map(upgrade => {
                const level = state.clickerUpgrades[upgrade.id] || 0;
                const cost = getUpgradeCost(upgrade, level);
                const maxed = level >= upgrade.maxLevel;
                const canAfford = state.lovePoints >= cost;

                return (
                  <motion.div
                    key={upgrade.id}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 12,
                      padding: '12px 16px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      opacity: maxed ? 0.5 : 1,
                    }}
                    whileTap={canAfford && !maxed ? { scale: 0.98 } : {}}
                    onClick={() => !maxed && buyUpgrade(upgrade.id)}
                  >
                    <div style={{ fontSize: 28, flexShrink: 0 }}>{upgrade.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "'Quicksand', sans-serif",
                        color: '#fff', fontSize: 14, fontWeight: 700,
                      }}>
                        {upgrade.name}
                        {level > 0 && <span style={{ color: '#ff9eb5' }}> Lv.{level}</span>}
                      </div>
                      <div style={{
                        fontFamily: "'Quicksand', sans-serif",
                        color: 'rgba(255,255,255,0.5)', fontSize: 12,
                      }}>
                        {upgrade.description}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: "'Quicksand', sans-serif",
                      fontSize: 14, fontWeight: 700,
                      color: maxed ? '#4CAF50' : canAfford ? '#ffd700' : '#ff4444',
                      flexShrink: 0,
                    }}>
                      {maxed ? 'MAX' : `${cost} LP`}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p style={{
        fontFamily: "'Quicksand', sans-serif",
        color: 'rgba(255,255,255,0.3)', fontSize: 11,
        marginTop: 12,
      }}>
        Tap the heart to earn Love Points
      </p>
    </div>
  );
}
