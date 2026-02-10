export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function aabbOverlap(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export const GRAVITY = 1800; // pixels/s²
export const JUMP_VELOCITY = -620;
export const SUPER_JUMP_VELOCITY = -820;
export const GROUND_Y = 500; // ground level in world coords (from top)
