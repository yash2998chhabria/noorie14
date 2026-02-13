import { drawHeart, drawStar } from './Particles';

export type PlayerState = 'run' | 'jump' | 'fall' | 'hit' | 'idle' | 'sit' | 'cheer' | 'hug' | 'reach' | 'shield_left' | 'shield_right' | 'shield_up';

export interface CharacterStyle {
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long';
  topColor: string;
  bottomColor: string;
  isDress: boolean;
  shoe: string;
  accessory?: 'bow';
}

export const HIM_STYLE: CharacterStyle = {
  skin: '#ffcc99',
  hair: '#4a3728',
  hairStyle: 'short',
  topColor: '#ff6b9d',
  bottomColor: '#5b7db1',
  isDress: false,
  shoe: '#333',
};

export const HER_STYLE: CharacterStyle = {
  skin: '#ffe0bd',
  hair: '#3d2b1f',
  hairStyle: 'long',
  topColor: '#b388ff',
  bottomColor: '#b388ff',
  isDress: true,
  shoe: '#555',
  accessory: 'bow',
};


export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  state: PlayerState,
  frame: number,
  squashX = 1,
  squashY = 1,
): void {
  drawCharacter(ctx, x, y, width, height, state, frame, HIM_STYLE, squashX, squashY);
}

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  state: PlayerState,
  frame: number,
  style: CharacterStyle,
  squashX = 1,
  squashY = 1,
): void {
  ctx.save();
  ctx.translate(x + width / 2, y + height);
  ctx.scale(squashX, squashY);

  const w = width;
  const h = height;

  // Body
  if (style.isDress) {
    // Dress: single trapezoid
    ctx.fillStyle = style.topColor;
    ctx.beginPath();
    ctx.moveTo(-w * 0.3, -h * 0.6);
    ctx.lineTo(w * 0.3, -h * 0.6);
    ctx.lineTo(w * 0.4, -h * 0.15);
    ctx.lineTo(-w * 0.4, -h * 0.15);
    ctx.closePath();
    ctx.fill();
  } else {
    // Shirt
    ctx.fillStyle = style.topColor;
    ctx.beginPath();
    ctx.roundRect(-w * 0.35, -h * 0.6, w * 0.7, h * 0.35, 4);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = style.skin;
  ctx.beginPath();
  ctx.arc(0, -h * 0.72, w * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = style.hair;
  if (style.hairStyle === 'long') {
    // Long flowing hair
    ctx.beginPath();
    ctx.arc(0, -h * 0.78, w * 0.32, Math.PI, Math.PI * 2);
    ctx.fill();
    // Side hair strands
    ctx.beginPath();
    ctx.moveTo(-w * 0.32, -h * 0.72);
    ctx.quadraticCurveTo(-w * 0.38, -h * 0.45, -w * 0.28, -h * 0.3);
    ctx.lineTo(-w * 0.22, -h * 0.35);
    ctx.quadraticCurveTo(-w * 0.3, -h * 0.5, -w * 0.28, -h * 0.72);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.32, -h * 0.72);
    ctx.quadraticCurveTo(w * 0.38, -h * 0.45, w * 0.28, -h * 0.3);
    ctx.lineTo(w * 0.22, -h * 0.35);
    ctx.quadraticCurveTo(w * 0.3, -h * 0.5, w * 0.28, -h * 0.72);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, -h * 0.78, w * 0.3, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  // Bow accessory
  if (style.accessory === 'bow') {
    ctx.fillStyle = '#ff4081';
    ctx.beginPath();
    ctx.moveTo(w * 0.15, -h * 0.92);
    ctx.quadraticCurveTo(w * 0.25, -h * 1.0, w * 0.2, -h * 0.88);
    ctx.quadraticCurveTo(w * 0.25, -h * 0.82, w * 0.15, -h * 0.86);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.15, -h * 0.89, w * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyes
  ctx.fillStyle = '#333';
  const eyeY = -h * 0.74;
  if (state === 'hit') {
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

  // Smile / cheer mouth
  if (state !== 'hit') {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (state === 'cheer') {
      ctx.arc(0, -h * 0.67, w * 0.1, 0, Math.PI);
    } else {
      ctx.arc(0, -h * 0.68, w * 0.08, 0, Math.PI);
    }
    ctx.stroke();
  }

  // Legs (varies by state)
  if (!style.isDress) {
    ctx.fillStyle = style.bottomColor;
  }

  if (state === 'sit') {
    // Sitting: legs bent forward
    if (!style.isDress) {
      ctx.fillStyle = style.bottomColor;
      ctx.beginPath();
      ctx.roundRect(-w * 0.3, -h * 0.22, w * 0.6, h * 0.14, 3);
      ctx.fill();
    }
    ctx.fillStyle = style.shoe;
    ctx.fillRect(-w * 0.1, -h * 0.1, w * 0.08, h * 0.06);
    ctx.fillRect(w * 0.05, -h * 0.1, w * 0.08, h * 0.06);
  } else if (state === 'idle' || state === 'hug' || state === 'reach' || state === 'shield_left' || state === 'shield_right' || state === 'shield_up') {
    // Standing still
    if (!style.isDress) {
      ctx.fillStyle = style.bottomColor;
      ctx.beginPath();
      ctx.roundRect(-w * 0.25, -h * 0.28, w * 0.2, h * 0.25, 3);
      ctx.roundRect(w * 0.05, -h * 0.28, w * 0.2, h * 0.25, 3);
      ctx.fill();
    }
    ctx.fillStyle = style.shoe;
    ctx.fillRect(-w * 0.27, -h * 0.05, w * 0.24, h * 0.06);
    ctx.fillRect(w * 0.03, -h * 0.05, w * 0.24, h * 0.06);
  } else if (state === 'jump' || state === 'fall' || state === 'cheer') {
    if (!style.isDress) {
      ctx.fillStyle = style.bottomColor;
      const legTop = -h * 0.28;
      ctx.beginPath();
      ctx.roundRect(-w * 0.3, legTop, w * 0.25, h * 0.2, 3);
      ctx.roundRect(w * 0.05, legTop, w * 0.25, h * 0.2, 3);
      ctx.fill();
    }
    ctx.fillStyle = style.shoe;
    const legTop = -h * 0.28;
    ctx.fillRect(-w * 0.3, legTop + h * 0.15, w * 0.25, h * 0.06);
    ctx.fillRect(w * 0.05, legTop + h * 0.15, w * 0.25, h * 0.06);
  } else {
    // Run
    if (!style.isDress) {
      ctx.fillStyle = style.bottomColor;
      const legSwing = Math.sin(frame * 0.3) * 8;
      const legTop = -h * 0.28;
      ctx.beginPath();
      ctx.roundRect(-w * 0.28 + legSwing * 0.3, legTop, w * 0.22, h * 0.28, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(w * 0.06 - legSwing * 0.3, legTop, w * 0.22, h * 0.28, 3);
      ctx.fill();
      ctx.fillStyle = style.shoe;
      ctx.fillRect(-w * 0.3 + legSwing * 0.3, -h * 0.03, w * 0.26, h * 0.06);
      ctx.fillRect(w * 0.04 - legSwing * 0.3, -h * 0.03, w * 0.26, h * 0.06);
    } else {
      ctx.fillStyle = style.shoe;
      const legSwing = Math.sin(frame * 0.3) * 4;
      ctx.fillRect(-w * 0.15 + legSwing * 0.3, -h * 0.03, w * 0.13, h * 0.05);
      ctx.fillRect(w * 0.04 - legSwing * 0.3, -h * 0.03, w * 0.13, h * 0.05);
    }
  }

  // Arms
  ctx.fillStyle = style.skin;
  const armSwing = (state === 'run') ? Math.sin(frame * 0.3) * 12 : 0;

  if (state === 'jump' || state === 'cheer') {
    // Arms up
    ctx.fillRect(-w * 0.45, -h * 0.7, w * 0.12, h * 0.2);
    ctx.fillRect(w * 0.33, -h * 0.7, w * 0.12, h * 0.2);
  } else if (state === 'reach') {
    // Arms reaching forward
    ctx.fillRect(w * 0.3, -h * 0.55, w * 0.25, h * 0.1);
    ctx.save();
    ctx.translate(-w * 0.38, -h * 0.55);
    ctx.rotate(-15 * Math.PI / 180);
    ctx.fillRect(0, 0, w * 0.11, h * 0.22);
    ctx.restore();
  } else if (state === 'hug') {
    // Arms wrapped around (hugging)
    ctx.fillRect(-w * 0.35, -h * 0.55, w * 0.1, h * 0.18);
    ctx.fillRect(w * 0.25, -h * 0.55, w * 0.1, h * 0.18);
  } else if (state === 'shield_left') {
    // Left arm extended holding shield
    ctx.fillRect(-w * 0.55, -h * 0.55, w * 0.2, h * 0.1);
    ctx.save();
    ctx.translate(w * 0.27, -h * 0.55);
    ctx.rotate(15 * Math.PI / 180);
    ctx.fillRect(0, 0, w * 0.11, h * 0.22);
    ctx.restore();
  } else if (state === 'shield_right') {
    // Right arm extended holding shield
    ctx.fillRect(w * 0.35, -h * 0.55, w * 0.2, h * 0.1);
    ctx.save();
    ctx.translate(-w * 0.38, -h * 0.55);
    ctx.rotate(-15 * Math.PI / 180);
    ctx.fillRect(0, 0, w * 0.11, h * 0.22);
    ctx.restore();
  } else if (state === 'shield_up') {
    // Both arms up holding umbrella
    ctx.fillRect(-w * 0.3, -h * 0.75, w * 0.1, h * 0.2);
    ctx.fillRect(w * 0.2, -h * 0.75, w * 0.1, h * 0.2);
  } else if (state === 'sit') {
    // Arms resting on knees
    ctx.save();
    ctx.translate(-w * 0.32, -h * 0.5);
    ctx.rotate(30 * Math.PI / 180);
    ctx.fillRect(0, 0, w * 0.1, h * 0.2);
    ctx.restore();
    ctx.save();
    ctx.translate(w * 0.22, -h * 0.5);
    ctx.rotate(-30 * Math.PI / 180);
    ctx.fillRect(0, 0, w * 0.1, h * 0.2);
    ctx.restore();
  } else {
    // Normal running/idle arms
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

export function drawLantern(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  frame: number,
): void {
  ctx.save();
  const bob = Math.sin(frame * 0.03 + x * 0.01) * 3;
  const ty = y + bob;
  // Glow
  ctx.fillStyle = 'rgba(255,200,50,0.15)';
  ctx.beginPath();
  ctx.arc(x, ty, size * 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Body
  ctx.fillStyle = '#FFA726';
  ctx.beginPath();
  ctx.ellipse(x, ty, size, size * 1.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Inner glow
  ctx.fillStyle = '#FFE082';
  ctx.beginPath();
  ctx.ellipse(x, ty, size * 0.6, size * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawShootingStar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  length: number,
  angle: number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(angle);
  // Trail
  const grad = ctx.createLinearGradient(0, 0, -length, 0);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-length, 0);
  ctx.stroke();
  // Head
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawHillSilhouette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
): void {
  ctx.save();
  ctx.fillStyle = '#0d1117';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  // Rolling hills
  ctx.quadraticCurveTo(width * 0.15, groundY - 60, width * 0.3, groundY - 30);
  ctx.quadraticCurveTo(width * 0.45, groundY - 80, width * 0.6, groundY - 40);
  ctx.quadraticCurveTo(width * 0.75, groundY - 20, width * 0.85, groundY - 50);
  ctx.quadraticCurveTo(width * 0.95, groundY - 15, width, groundY);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawRain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number,
  frame: number,
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(180,210,255,0.4)';
  ctx.lineWidth = 1;
  const count = Math.floor(intensity * 60);
  for (let i = 0; i < count; i++) {
    const rx = (i * 47 + frame * 3) % (width + 20) - 10;
    const ry = (i * 71 + frame * 8) % (height + 30) - 15;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 3, ry + 15);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawRainbow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  radius: number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  const colors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
  for (let i = 0; i < colors.length; i++) {
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, radius - i * 5, Math.PI, 0);
    ctx.stroke();
  }
  ctx.restore();
}

// ===== Power-up drawing =====

import type { PowerUpType } from '../levels/types';

export function drawPowerUp(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  powerUpType: PowerUpType,
  frame: number,
): void {
  ctx.save();
  const bob = Math.sin(frame * 0.04) * 4;
  const ty = y + bob;
  const rot = Math.sin(frame * 0.02) * 0.15;

  ctx.translate(x, ty);
  ctx.rotate(rot);

  switch (powerUpType) {
    case 'shield': {
      // Blue translucent circle with heart inside, pulsing glow
      const pulse = 0.8 + Math.sin(frame * 0.08) * 0.2;
      ctx.shadowColor = '#4fc3f7';
      ctx.shadowBlur = 14 * pulse;
      ctx.fillStyle = 'rgba(79,195,247,0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Outer ring
      ctx.strokeStyle = '#4fc3f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.1, 0, Math.PI * 2);
      ctx.stroke();
      // Heart inside
      ctx.fillStyle = '#ff4d6d';
      drawHeart(ctx, 0, -1, size * 0.6);
      break;
    }
    case 'magnet': {
      // Red horseshoe shape with gold sparks
      const pulse = 0.9 + Math.sin(frame * 0.1) * 0.1;
      ctx.shadowColor = '#ff5252';
      ctx.shadowBlur = 10 * pulse;
      // U-shape magnet
      ctx.strokeStyle = '#ff5252';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 2, size * 0.7, 0, Math.PI);
      ctx.stroke();
      // Poles
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(-size * 0.7, -size * 0.3, 4, size * 0.5);
      ctx.fillRect(size * 0.7 - 4, -size * 0.3, 4, size * 0.5);
      // Pole tips (silver)
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(-size * 0.7, -size * 0.3, 4, 5);
      ctx.fillRect(size * 0.7 - 4, -size * 0.3, 4, 5);
      ctx.shadowBlur = 0;
      // Gold sparks at poles
      ctx.fillStyle = '#ffd700';
      for (let i = 0; i < 2; i++) {
        const sx = (i === 0 ? -1 : 1) * size * 0.7;
        const sparkY = -size * 0.3 + Math.sin(frame * 0.15 + i * 3) * 4;
        ctx.beginPath();
        ctx.arc(sx, sparkY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'slowtime': {
      // Purple clock face with hands
      const pulse = 0.85 + Math.sin(frame * 0.06) * 0.15;
      ctx.shadowColor = '#9c27b0';
      ctx.shadowBlur = 12 * pulse;
      // Clock face
      ctx.fillStyle = 'rgba(156,39,176,0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ce93d8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Hour hand (slow tick)
      const hourAngle = (frame * 0.01) % (Math.PI * 2);
      ctx.strokeStyle = '#e1bee7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.sin(hourAngle) * size * 0.45, -Math.cos(hourAngle) * size * 0.45);
      ctx.stroke();
      // Minute hand
      const minAngle = (frame * 0.04) % (Math.PI * 2);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.sin(minAngle) * size * 0.65, -Math.cos(minAngle) * size * 0.65);
      ctx.stroke();
      // Center dot
      ctx.fillStyle = '#e1bee7';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

// ===== Existing obstacle/collectible drawing =====

export type ObstacleType = 'rock' | 'puddle' | 'log' | 'bush' | 'cactus' | 'cloud_dark' | 'ice' | 'fire';

export function drawObstacle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  type: ObstacleType,
  theme: number,
  frame = 0,
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
      ctx.beginPath();
      ctx.roundRect(x + width * 0.3, y, width * 0.4, height, 5);
      ctx.fill();
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
      for (let i = 0; i < 3; i++) {
        const fx = x + width * (0.2 + i * 0.25);
        const flicker = 0.6 + Math.sin(frame * 0.15 + i * 2.1) * 0.4;
        const fh = height * flicker;
        const grad = ctx.createLinearGradient(fx, y + height, fx, y + height - fh);
        grad.addColorStop(0, '#ff4500');
        grad.addColorStop(0.5, '#ff8c00');
        grad.addColorStop(1, '#ffd700');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(fx - 6, y + height);
        ctx.quadraticCurveTo(fx + Math.sin(frame * 0.1 + i) * 3, y + height - fh, fx + 6, y + height);
        ctx.fill();
      }
      // Ember particles
      ctx.fillStyle = '#ffd700';
      for (let i = 0; i < 2; i++) {
        const ex = x + width * (0.3 + i * 0.3);
        const ey = y + height * 0.3 - Math.sin(frame * 0.08 + i * 1.5) * height * 0.3;
        ctx.globalAlpha = 0.5 + Math.sin(frame * 0.12 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
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
      const pulse = 0.9 + Math.sin(frame * 0.08) * 0.1;
      ctx.shadowColor = '#e0aaff';
      ctx.shadowBlur = 12 * pulse;
      ctx.fillStyle = '#f0e6ff';
      const s = size * 1.4;
      ctx.fillRect(x - s / 2, ty - s / 2, s, s * 1.15);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#d4a5ff';
      ctx.fillRect(x - s * 0.38, ty - s * 0.38, s * 0.76, s * 0.65);
      ctx.fillStyle = '#9d4edd';
      ctx.beginPath();
      ctx.arc(x, ty - s * 0.08, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
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
    case 1:
      return {
        skyTop: '#87CEEB', skyBottom: '#E0F7FA',
        ground: '#4CAF50', groundDark: '#388E3C',
        obstaclePrimary: '#795548', obstacleSecondary: '#5D4037',
        bgFar: '#C8E6C9', bgMid: '#81C784', bgNear: '#66BB6A',
        accent: '#FF6B9D',
      };
    case 2:
      return {
        skyTop: '#FF9800', skyBottom: '#FFF3E0',
        ground: '#FFD54F', groundDark: '#FFC107',
        obstaclePrimary: '#8D6E63', obstacleSecondary: '#6D4C41',
        bgFar: '#FFECB3', bgMid: '#FFD54F', bgNear: '#FFC107',
        accent: '#FF5722',
      };
    case 3:
      return {
        skyTop: '#FF8A65', skyBottom: '#FFF8E1',
        ground: '#A1887F', groundDark: '#795548',
        obstaclePrimary: '#6D4C41', obstacleSecondary: '#4E342E',
        bgFar: '#FFCC80', bgMid: '#FF9800', bgNear: '#E65100',
        accent: '#FF6F00',
      };
    case 4:
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

