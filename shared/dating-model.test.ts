import { describe, it, expect } from 'vitest';
import { datingWalk, DATING_DISTANCE, DATING_TARGET } from './dating-model.js';

describe('dating invitation protocol', () => {
  it('makes the correct decision for all 64 ordered combinations', () => {
    for (let a = 1; a <= 8; a++) for (let b = 1; b <= 8; b++) {
      const r = datingWalk(a, b);
      expect(r.success, `${a}+${b}`).toBe(a + b >= DATING_TARGET);
      expect(r.moves.reduce((s, n) => s + n, 0) === DATING_DISTANCE).toBe(r.success);
    }
  });
  it('distinguishes the two replies to a counter-invitation', () => {
    expect(datingWalk(6, 3)).toEqual({ moves: [1, 1, 1], success: true, counter: true });
    expect(datingWalk(5, 3)).toEqual({ moves: [1, 1], success: false, counter: true });
    expect(datingWalk(1, 8).success).toBe(true);
    expect(datingWalk(4, 4).success).toBe(false);
  });
});
