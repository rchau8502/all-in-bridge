import { describe, it, expect } from 'vitest';
import { parseCard } from './deck.js';
import { evaluateHand, generateDrillHand, OPENING_DRILL_BIDS } from './evaluator.js';

const hand = (cards: string) => cards.split(' ').map(parseCard);
const seeded = () => {
  let seed = 28174;
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
};

describe('opening practice uses HCP and balanced coverage', () => {
  it('does not promote eleven HCP to an opening by adding suit length', () => {
    const eleven = evaluateHand(hand('KS QS JS 9S 7S AH 8H 3H JD 6D 2D 8C 3C'));
    expect(eleven.hcp).toBe(11);
    expect(eleven.totalPoints).toBe(11);
    expect(eleven.recommendedBid).toBe('Pass');
    expect('lengthPoints' in eleven).toBe(false);
    const twelve = evaluateHand(hand('KS QS JS 9S 7S AH 8H 3H QD 6D 2D 8C 3C'));
    expect(twelve.hcp).toBe(12);
    expect(twelve.recommendedBid).toBe('1S');
  });

  it('does not manufacture strong-opening strength from length, while retaining explicit playing-strength exceptions', () => {
    const twenty = evaluateHand(hand('AS KS QS JS TS 9S KH QH 3H KD 6D 2D QC'));
    expect(twenty.hcp).toBe(20);
    expect(twenty.totalPoints).toBe(20);
    expect(twenty.recommendedBid).toBe('1S');
    const longStrong = evaluateHand(hand('AS KS QS JS TS 9S 8S 7S 6S AH QD QC'));
    expect(longStrong.hcp).toBe(18);
    expect(longStrong.recommendedBid).toBe('2C');
    const twoSuiter = evaluateHand(hand('AS KS QS 9S 7S AH KH JH 8H 6H KD 2D 3C'));
    expect(twoSuiter.hcp).toBe(20);
    expect(twoSuiter.recommendedBid).toBe('2C');
  });

  it('covers all eleven answers in mixed practice instead of reproducing random-deal pass rates', () => {
    const rng = seeded();
    const counts: Record<string, number> = {};
    for (let i = 0; i < 1100; i++) {
      const { hand, evaluation: ev } = generateDrillHand('all', 200, rng);
      expect(hand).toHaveLength(13);
      expect(new Set(hand.map(c => `${c.rank}${c.suit}`)).size).toBe(13);
      expect(ev.totalPoints).toBe(ev.hcp);
      counts[ev.recommendedBid] = (counts[ev.recommendedBid] ?? 0) + 1;
    }
    expect(Object.keys(counts).sort()).toEqual([...OPENING_DRILL_BIDS].sort());
    for (const bid of OPENING_DRILL_BIDS) {
      expect(counts[bid], bid).toBeGreaterThan(60);
      expect(counts[bid], bid).toBeLessThan(145);
    }
  });

  it('guarantees the requested answer even when generation attempts are exhausted', () => {
    OPENING_DRILL_BIDS.forEach((bid, index) => {
      const problem = generateDrillHand('all', 0, () => (index + 0.25) / OPENING_DRILL_BIDS.length);
      expect(problem.evaluation.recommendedBid).toBe(bid);
      expect(problem.hand).toHaveLength(13);
    });
    for (const category of ['pass', '1nt', 'major', 'minor', 'strong', 'weak-two'] as const) {
      const allowed = {
        pass: ['Pass'], '1nt': ['1NT'], major: ['1H', '1S'], minor: ['1C', '1D'],
        strong: ['2C', '2NT'], 'weak-two': ['2D', '2H', '2S'],
      }[category];
      expect(allowed).toContain(generateDrillHand(category, 0).evaluation.recommendedBid);
    }
  });
});
