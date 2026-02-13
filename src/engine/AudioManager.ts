import { Howl, Howler } from 'howler';

// We'll use Web Audio API generated sounds as fallback
// Real audio files can be added to public/audio/

export class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private currentBgm: string | null = null;
  private muted = false;
  private bgmVolume = 0.4;
  private sfxVolume = 0.7;

  constructor() {
    Howler.autoUnlock = true;
    Howler.autoSuspend = false;
  }

  // Generate simple sounds using Web Audio API as fallback
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  playSynth(type: 'jump' | 'collect' | 'hit' | 'combo' | 'milestone' | 'click' | 'upgrade' | 'drop' | 'perfect' | 'shield' | 'block' | 'starTap' | 'lineComplete' | 'firework' | 'magnet' | 'slowtime'): void {
    if (this.muted) return;

    try {
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.value = this.sfxVolume * 0.3;

      switch (type) {
        case 'jump':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.linearRampToValueAtTime(800, now + 0.1);
          gain.gain.linearRampToValueAtTime(0, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        case 'collect':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.linearRampToValueAtTime(1200, now + 0.08);
          gain.gain.linearRampToValueAtTime(0, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          // Second tone
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.type = 'sine';
          osc2.frequency.value = 900;
          gain2.gain.value = this.sfxVolume * 0.2;
          gain2.gain.linearRampToValueAtTime(0, now + 0.2);
          osc2.start(now + 0.08);
          osc2.stop(now + 0.2);
          break;
        case 'hit':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.linearRampToValueAtTime(50, now + 0.3);
          gain.gain.linearRampToValueAtTime(0, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        case 'combo':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.linearRampToValueAtTime(1400, now + 0.15);
          gain.gain.linearRampToValueAtTime(0, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case 'milestone':
          osc.type = 'sine';
          const notes = [523, 659, 784, 1047];
          osc.frequency.setValueAtTime(notes[0], now);
          notes.forEach((n, i) => {
            osc.frequency.setValueAtTime(n, now + i * 0.15);
          });
          gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.7);
          osc.start(now);
          osc.stop(now + 0.7);
          break;
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(500, now);
          osc.frequency.linearRampToValueAtTime(700, now + 0.05);
          gain.gain.linearRampToValueAtTime(0, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        case 'upgrade':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.linearRampToValueAtTime(800, now + 0.1);
          osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
          gain.gain.linearRampToValueAtTime(0, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        case 'drop': {
          // Thud sound for block dropping
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(60, now + 0.15);
          gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }
        case 'perfect': {
          // Sparkly perfect-alignment chime
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.setValueAtTime(1108, now + 0.08);
          osc.frequency.setValueAtTime(1320, now + 0.16);
          gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }
        case 'shield': {
          // Quick metallic shield activation
          osc.type = 'square';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.linearRampToValueAtTime(500, now + 0.05);
          gain.gain.setValueAtTime(this.sfxVolume * 0.15, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }
        case 'block': {
          // Shield successfully blocking an obstacle
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.linearRampToValueAtTime(600, now + 0.06);
          gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }
        case 'starTap': {
          // Gentle star chime
          osc.type = 'sine';
          osc.frequency.setValueAtTime(700, now);
          osc.frequency.linearRampToValueAtTime(1100, now + 0.12);
          gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }
        case 'lineComplete': {
          // Constellation completion - ascending arpeggio
          osc.type = 'sine';
          const cNotes = [660, 880, 1100, 1320, 1760];
          cNotes.forEach((n, i) => {
            osc.frequency.setValueAtTime(n, now + i * 0.1);
          });
          gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;
        }
        case 'firework': {
          // Firework burst - noise-like with rising pitch
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.linearRampToValueAtTime(1500, now + 0.15);
          osc.frequency.linearRampToValueAtTime(100, now + 0.4);
          gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
          gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.35, now + 0.15);
          gain.gain.linearRampToValueAtTime(0, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        }
        case 'magnet': {
          // Ascending chime 500->900Hz
          osc.type = 'sine';
          osc.frequency.setValueAtTime(500, now);
          osc.frequency.linearRampToValueAtTime(900, now + 0.12);
          gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }
        case 'slowtime': {
          // Descending tone 800->400Hz triangle
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.linearRampToValueAtTime(400, now + 0.2);
          gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }
      }
    } catch {
      // Audio not available, silently fail
    }
  }

  playBgm(key: string): void {
    if (this.currentBgm === key) return;
    this.stopBgm();
    this.currentBgm = key;
    // BGM would use Howler with real audio files
    // For now we skip BGM since we don't have audio files
  }

  stopBgm(): void {
    if (this.currentBgm) {
      const sound = this.sounds.get(this.currentBgm);
      if (sound) sound.fade(this.bgmVolume, 0, 500);
      this.currentBgm = null;
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    Howler.mute(this.muted);
    return this.muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  haptic(pattern: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (!navigator.vibrate) return;
    switch (pattern) {
      case 'light': navigator.vibrate(10); break;
      case 'medium': navigator.vibrate(25); break;
      case 'heavy': navigator.vibrate([30, 10, 30]); break;
    }
  }

  destroy(): void {
    this.stopBgm();
    this.sounds.forEach(s => s.unload());
    this.sounds.clear();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

// Singleton
export const audio = new AudioManager();
