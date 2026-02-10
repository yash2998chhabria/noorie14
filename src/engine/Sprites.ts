import { drawHeart, drawStar } from './Particles';

export type PlayerState = 'run' | 'jump' | 'fall' | 'hit';

const SKIN = '#ffcc99';
const HAIR = '#4a3728';
const SHIRT = '#ff6b9d';
const PANTS = '#5b7db1';
const SHOE = '#333';

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  state: PlayerState,
  frame: number,
  squashX = 1,
  squashY = 1,
): void {
  ctx.save();
  ctx.translate(x + width / 2, y + height);
  ctx.scale(squashX, squashY);

  const w = width;
  const h = height;

  // Body
  ctx.fillStyle = SHIRT;
  ctx.beginPath();
  ctx.roundRect(-w * 0.35, -h * 0.6, w * 0.7, h * 0.35, 4);
  ctx.fill();

  // Head
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.arc(0, -h * 0.72, w * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = HAIR;
  ctx.beginPath();
  ctx.arc(0, -h * 0.78, w * 0.3, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#333';
  const eyeY = -h * 0.74;
  if (state === 'hit') {
    // X eyes
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333';
    for (const side of [-1, 1]) {
      const ex = side * w * 0.1;
      ctx.beginPath();
      ctx.moveTo(ex - 2, eyeY - 2);
      ctx.lineTo(ex + 2, eyeY + 2);
      ctx.moveTo(ex + 2, eyeY - 2);
      ctx.lineTo(ex - 2, eyeY + 2);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.arc(-w * 0.1, eyeY, 2, 0, Math.PI * 2);
    ctx.arc(w * 0.1, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smile
  if (state !== 'hit') {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -h * 0.68, w * 0.08, 0, Math.PI);
    ctx.stroke();
  }

  // Legs
  ctx.fillStyle = PANTS;
  const legSwing = state === 'run' ? Math.sin(frame * 0.3) * 8 : 0;
  const legTop = -h * 0.28;

  if (state === 'jump' || state === 'fall') {
    // Tucked legs
    ctx.beginPath();
    ctx.roundRect(-w * 0.3, legTop, w * 0.25, h * 0.2, 3);
    ctx.roundRect(w * 0.05, legTop, w * 0.25, h * 0.2, 3);
    ctx.fill();
    // Shoes
    ctx.fillStyle = SHOE;
    ctx.fillRect(-w * 0.3, legTop + h * 0.15, w * 0.25, h * 0.06);
    ctx.fillRect(w * 0.05, legTop + h * 0.15, w * 0.25, h * 0.06);
  } else {
    // Running legs
    ctx.beginPath();
    ctx.roundRect(-w * 0.28 + legSwing * 0.3, legTop, w * 0.22, h * 0.28, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(w * 0.06 - legSwing * 0.3, legTop, w * 0.22, h * 0.28, 3);
    ctx.fill();
    // Shoes
    ctx.fillStyle = SHOE;
    ctx.fillRect(-w * 0.3 + legSwing * 0.3, -h * 0.03, w * 0.26, h * 0.06);
    ctx.fillRect(w * 0.04 - legSwing * 0.3, -h * 0.03, w * 0.26, h * 0.06);
  }

  // Arms
  ctx.fillStyle = SKIN;
  const armSwing = state === 'run' ? Math.sin(frame * 0.3) * 12 : 0;
  if (state === 'jump') {
    // Arms up
    ctx.fillRect(-w * 0.45, -h * 0.7, w * 0.12, h * 0.2);
    ctx.fillRect(w * 0.33, -h * 0.7, w * 0.12, h * 0.2);
  } else {
    ctx.save();
    ctx.translate(-w * 0.38, -h * 0.55);
    ctx.rotate((-15 + armSwing) * Math.PI / 180);
    ctx.fillRect(0, 0, w * 0.11, h * 0.22);
    ctx.restore();
    ctx.save();
    ctx.translate(w * 0.27, -h * 0.55);
    ctx.rotate((15 - armSwing) * Math.PI / 180);
    ctx.fillRect(0, 0, w * 0.11, h * 0.22);
    ctx.restore();
  }

  // Hit flash
  if (state === 'hit') {
    ctx.globalAlpha = 0.3 + Math.sin(frame * 0.8) * 0.2;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.roundRect(-w * 0.4, -h, w * 0.8, h, 8);
    ctx.fill();
  }

  ctx.restore();
}

export type ObstacleType = 'rock' | 'puddle' | 'log' | 'bush' | 'cactus' | 'cloud_dark' | 'ice' | 'fire';

export function drawObstacle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  type: ObstacleType,
  theme: number,
): void {
  ctx.save();
  const colors = getThemeColors(theme);

  switch (type) {
    case 'rock': {
      const grad = ctx.createLinearGradient(x, y, x, y + height);
      grad.addColorStop(0, colors.obstaclePrimary);
      grad.addColorStop(1, colors.obstacleSecondary);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x + width * 0.1, y + height);
      ctx.lineTo(x, y + height * 0.4);
      ctx.quadraticCurveTo(x + width * 0.3, y - height * 0.1, x + width * 0.5, y);
      ctx.quadraticCurveTo(x + width * 0.7, y - height * 0.05, x + width, y + height * 0.3);
      ctx.lineTo(x + width * 0.9, y + height);
      ctx.closePath();
      ctx.fill();
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height, width * 0.55, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'puddle': {
      ctx.fillStyle = colors.obstaclePrimary + '80';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height - 3, width / 2, height / 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.obstaclePrimary + '40';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height - 5, width * 0.35, height * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'log': {
      const grad = ctx.createLinearGradient(x, y, x, y + height);
      grad.addColorStop(0, '#8B6914');
      grad.addColorStop(0.5, '#6B4E12');
      grad.addColorStop(1, '#5A3E0E');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y + height * 0.3, width, height * 0.5, 6);
      ctx.fill();
      // Rings on end
      ctx.fillStyle = '#C89E54';
      ctx.beginPath();
      ctx.ellipse(x + width, y + height * 0.55, 3, height * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'bush': {
      ctx.fillStyle = colors.obstaclePrimary;
      ctx.beginPath();
      ctx.arc(x + width * 0.3, y + height * 0.5, width * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + width * 0.65, y + height * 0.45, width * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.obstacleSecondary;
      ctx.beginPath();
      ctx.arc(x + width * 0.5, y + height * 0.35, width * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'cactus': {
      ctx.fillStyle = '#2d5a27';
      // Main body
      ctx.beginPath();
      ctx.roundRect(x + width * 0.3, y, width * 0.4, height, 5);
      ctx.fill();
      // Arms
      ctx.beginPath();
      ctx.roundRect(x, y + height * 0.2, width * 0.3, height * 0.15, 4);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x, y + height * 0.2, width * 0.15, height * 0.4, 4);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + width * 0.7, y + height * 0.35, width * 0.3, height * 0.12, 4);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + width * 0.85, y + height * 0.15, width * 0.15, height * 0.35, 4);
      ctx.fill();
      break;
    }
    case 'fire': {
      // Fire obstacle
      for (let i = 0; i < 3; i++) {
        const fx = x + width * (0.2 + i * 0.25);
        const fh = height * (0.6 + Math.random() * 0.4);
        const grad = ctx.createLinearGradient(fx, y + height, fx, y + height - fh);
        grad.addColorStop(0, '#ff4500');
        grad.addColorStop(0.5, '#ff8c00');
        grad.addColorStop(1, '#ffd700');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(fx - 6, y + height);
        ctx.quadraticCurveTo(fx, y + height - fh, fx + 6, y + height);
        ctx.fill();
      }
      break;
    }
    default: {
      ctx.fillStyle = colors.obstaclePrimary;
      ctx.fillRect(x, y, width, height);
    }
  }
  ctx.restore();
}

export type CollectibleType = 'heart' | 'star' | 'memory';

export function drawCollectible(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  type: CollectibleType,
  frame: number,
): void {
  ctx.save();
  const bob = Math.sin(frame * 0.05) * 3;
  const ty = y + bob;

  switch (type) {
    case 'heart': {
      ctx.fillStyle = '#ff4d6d';
      ctx.shadowColor = '#ff4d6d';
      ctx.shadowBlur = 8;
      drawHeart(ctx, x, ty, size);
      ctx.shadowBlur = 0;
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(x - size * 0.3, ty - size * 0.1, size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'star': {
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 10;
      drawStar(ctx, x, ty, size);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(x - size * 0.2, ty - size * 0.3, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'memory': {
      // Polaroid-like frame with glow
      const pulse = 0.9 + Math.sin(frame * 0.08) * 0.1;
      ctx.shadowColor = '#e0aaff';
      ctx.shadowBlur = 12 * pulse;
      ctx.fillStyle = '#f0e6ff';
      const s = size * 1.4;
      ctx.fillRect(x - s / 2, ty - s / 2, s, s * 1.15);
      ctx.shadowBlur = 0;
      // Inner "photo" area
      ctx.fillStyle = '#d4a5ff';
      ctx.fillRect(x - s * 0.38, ty - s * 0.38, s * 0.76, s * 0.65);
      // Camera icon
      ctx.fillStyle = '#9d4edd';
      ctx.beginPath();
      ctx.arc(x, ty - s * 0.08, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
      // Sparkles around it
      ctx.fillStyle = '#e0aaff';
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + frame * 0.03;
        const dist = s * 0.7 + Math.sin(frame * 0.05 + i) * 3;
        const sx = x + Math.cos(angle) * dist;
        const sy = ty + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }
  ctx.restore();
}

export interface ThemeColors {
  skyTop: string;
  skyBottom: string;
  ground: string;
  groundDark: string;
  obstaclePrimary: string;
  obstacleSecondary: string;
  bgFar: string;
  bgMid: string;
  bgNear: string;
  accent: string;
}

export function getThemeColors(level: number): ThemeColors {
  switch (level) {
    case 1: // Spring/bloom
      return {
        skyTop: '#87CEEB', skyBottom: '#E0F7FA',
        ground: '#4CAF50', groundDark: '#388E3C',
        obstaclePrimary: '#795548', obstacleSecondary: '#5D4037',
        bgFar: '#C8E6C9', bgMid: '#81C784', bgNear: '#66BB6A',
        accent: '#FF6B9D',
      };
    case 2: // Summer/travel
      return {
        skyTop: '#FF9800', skyBottom: '#FFF3E0',
        ground: '#FFD54F', groundDark: '#FFC107',
        obstaclePrimary: '#8D6E63', obstacleSecondary: '#6D4C41',
        bgFar: '#FFECB3', bgMid: '#FFD54F', bgNear: '#FFC107',
        accent: '#FF5722',
      };
    case 3: // Autumn/cozy
      return {
        skyTop: '#FF8A65', skyBottom: '#FFF8E1',
        ground: '#A1887F', groundDark: '#795548',
        obstaclePrimary: '#6D4C41', obstacleSecondary: '#4E342E',
        bgFar: '#FFCC80', bgMid: '#FF9800', bgNear: '#E65100',
        accent: '#FF6F00',
      };
    case 4: // Starry night/magic
      return {
        skyTop: '#1A237E', skyBottom: '#283593',
        ground: '#303F9F', groundDark: '#1A237E',
        obstaclePrimary: '#5C6BC0', obstacleSecondary: '#3949AB',
        bgFar: '#1A237E', bgMid: '#283593', bgNear: '#3949AB',
        accent: '#E040FB',
      };
    default:
      return getThemeColors(1);
  }
}
