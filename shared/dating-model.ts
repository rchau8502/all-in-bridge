/** Toy communication protocol, not bridge point values or bid levels. */
export const DATING_TARGET = 9;
export const DATING_DISTANCE = 3;

export function datingWalk(a: number, b: number): { moves: number[]; success: boolean; counter: boolean } {
  if (![a, b].every(n => Number.isInteger(n) && n >= 1 && n <= 8)) throw new Error('values must be 1–8');
  // An opening pass leaves the other person a chance to initiate.
  if (a <= 4 && b > 4) return datingWalk(b, a);
  if (a <= 4) return { moves: [], success: false, counter: false };
  if (a === 8) return { moves: [3], success: true, counter: false };
  if (a === 7) return { moves: b >= 2 ? [2, 1] : [2], success: b >= 2, counter: false };
  if (b >= 4) return { moves: [1, 2], success: true, counter: false };
  if (b === 3) return { moves: a === 6 ? [1, 1, 1] : [1, 1], success: a === 6, counter: true };
  return { moves: [1], success: false, counter: false };
}
