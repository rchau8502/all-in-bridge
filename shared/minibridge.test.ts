import { describe, it, expect } from 'vitest';
import { evaluateMiniBridgeDeal } from './minibridge.js';
import type { Hands, Card } from './deck.js';

function card(suit: 'S' | 'H' | 'D' | 'C', rank: number): Card {
  return { suit, rank };
}

describe('evaluateMiniBridgeDeal (MiniBridge Engine)', () => {
  it('recommends 4S game when NS has 25 HCP and 9-card Spade fit', () => {
    const hands: Hands = {
      S: [
        // 14 HCP, 5 Spades
        card('S', 14), card('S', 13), card('S', 10), card('S', 8), card('S', 2), // A, K = 7
        card('H', 14), card('H', 11), card('H', 4), // A, J = 5
        card('D', 12), card('D', 5), // Q = 2
        card('C', 8), card('C', 7), card('C', 3), // 0
      ],
      N: [
        // 11 HCP, 4 Spades -> 9 Spades total
        card('S', 12), card('S', 11), card('S', 9), card('S', 5), // Q, J = 3
        card('H', 13), card('H', 8), card('H', 3), // K = 3
        card('D', 14), card('D', 7), card('D', 2), // A = 4
        card('C', 11), card('C', 6), card('C', 4), // J = 1
      ],
      E: [
        // 7 HCP
        card('S', 7), card('S', 6),
        card('H', 12), card('H', 9), card('H', 7), // Q = 2
        card('D', 13), card('D', 10), card('D', 8), // K = 3
        card('C', 12), card('C', 9), card('C', 5), card('C', 2), // Q = 2
      ],
      W: [
        // 8 HCP
        card('S', 4), card('S', 3),
        card('H', 10), card('H', 6), card('H', 5), card('H', 2),
        card('D', 11), card('D', 9), card('D', 6), card('D', 4), card('D', 3), // J = 1
        card('C', 14), card('C', 13), // A, K = 7
      ],
    };

    const res = evaluateMiniBridgeDeal(hands);
    expect(res.hcp.S).toBe(14);
    expect(res.hcp.N).toBe(11);
    expect(res.totalHcp.NS).toBe(25);
    expect(res.declaringPair).toBe('NS');
    expect(res.declarer).toBe('S');
    expect(res.dummy).toBe('N');
    expect(res.openingLeader).toBe('W');
    expect(res.suitLengths.S).toBe(9);
    expect(res.hasMajorFit).toBe(true);
    expect(res.recommendedDenom).toBe('S');
    expect(res.isGameValue).toBe(true);
    expect(res.recommendedLevel).toBe(4);
    expect(res.recommendedContract).toEqual({
      level: 4,
      denom: 'S',
      declarer: 'S',
      doubled: 0,
    });
    expect(res.fitSummary.zh).toContain('黑桃 8+ 张黄金配合');
  });

  it('recommends 3NT game when NS has 26 HCP but no 8-card major fit', () => {
    const hands: Hands = {
      S: [
        // 16 HCP, 4-3-3-3 shape
        card('S', 14), card('S', 13), card('S', 7), card('S', 2), // 7
        card('H', 14), card('H', 9), card('H', 3), // 4
        card('D', 13), card('D', 8), card('D', 4), // 3
        card('C', 12), card('C', 8), card('C', 5), // 2
      ],
      N: [
        // 10 HCP, 3-4-3-3 shape -> 7 Spades, 7 Hearts
        card('S', 11), card('S', 8), card('S', 3), // 1
        card('H', 13), card('H', 11), card('H', 6), card('H', 2), // 4
        card('D', 14), card('D', 6), card('D', 2), // 4
        card('C', 11), card('C', 7), card('C', 2), // 1
      ],
      E: [
        card('S', 10), card('S', 9), card('S', 6),
        card('H', 12), card('H', 8), card('H', 5), // 2
        card('D', 11), card('D', 9), card('D', 5), // 1
        card('C', 14), card('C', 10), card('C', 9), card('C', 3), // 4
      ],
      W: [
        card('S', 12), card('S', 5), card('S', 4), // 2
        card('H', 10), card('H', 7), card('H', 4),
        card('D', 12), card('D', 10), card('D', 7), card('D', 3), // 2
        card('C', 13), card('C', 6), card('C', 4), // 3
      ],
    };

    const res = evaluateMiniBridgeDeal(hands);
    expect(res.totalHcp.NS).toBe(26);
    expect(res.declaringPair).toBe('NS');
    expect(res.hasMajorFit).toBe(false);
    expect(res.recommendedDenom).toBe('NT');
    expect(res.isGameValue).toBe(true);
    expect(res.recommendedLevel).toBe(3);
    expect(res.recommendedContract.denom).toBe('NT');
    expect(res.recommendedContract.level).toBe(3);
  });

  it('recommends 2H part-score when NS has 21 HCP and 9 Hearts', () => {
    const hands: Hands = {
      S: [
        // 12 HCP, 5 Hearts
        card('S', 11), card('S', 8), card('S', 2), // 1
        card('H', 14), card('H', 13), card('H', 8), card('H', 6), card('H', 2), // 7
        card('D', 13), card('D', 9), card('D', 4), // 3
        card('C', 11), card('C', 7), // 1
      ],
      N: [
        // 9 HCP, 4 Hearts -> 21 HCP total (<25)
        card('S', 14), card('S', 7), card('S', 3), // 4
        card('H', 12), card('H', 10), card('H', 7), card('H', 3), // 2
        card('D', 12), card('D', 8), card('D', 3), // 2
        card('C', 11), card('C', 6), card('C', 4), // 1
      ],
      E: [
        card('S', 13), card('S', 10), card('S', 6), // 3
        card('H', 9), card('H', 5),
        card('D', 14), card('D', 10), card('D', 7), // 4
        card('C', 13), card('C', 9), card('C', 5), card('C', 2), // 3
      ],
      W: [
        card('S', 12), card('S', 9), card('S', 5), card('S', 4), // 2
        card('H', 11), card('H', 4), // 1
        card('D', 11), card('D', 6), card('D', 5), card('D', 2), // 1
        card('C', 14), card('C', 12), card('C', 8), // 6
      ],
    };

    const res = evaluateMiniBridgeDeal(hands);
    expect(res.totalHcp.NS).toBe(21);
    expect(res.isGameValue).toBe(false);
    expect(res.hasMajorFit).toBe(true);
    expect(res.recommendedDenom).toBe('H');
    expect(res.recommendedLevel).toBe(2);
    expect(res.recommendedContract).toEqual({
      level: 2,
      denom: 'H',
      declarer: 'S',
      doubled: 0,
    });
  });

  it('correctly handles East-West declaring when EW has higher HCP', () => {
    const hands: Hands = {
      S: [
        card('S', 7), card('S', 2),
        card('H', 7), card('H', 2),
        card('D', 7), card('D', 2),
        card('C', 11), card('C', 7), card('C', 6), card('C', 5), card('C', 4), card('C', 3), card('C', 2), // 1
      ],
      N: [
        card('S', 8), card('S', 3),
        card('H', 8), card('H', 3),
        card('D', 8), card('D', 3),
        card('C', 14), card('C', 10), card('C', 9), card('C', 8), // 4
        card('D', 4), card('H', 4), card('S', 4),
      ],
      E: [
        // 14 HCP
        card('S', 14), card('S', 13), card('S', 10), card('S', 9), // 7
        card('H', 14), card('H', 11), card('H', 9), // 5
        card('D', 12), card('D', 10), // 2
        card('C', 13), card('C', 12), // 5 -> wait, 7+5+2+5 = 19
        card('D', 5), card('H', 5),
      ],
      W: [
        // 16 HCP
        card('S', 12), card('S', 11), card('S', 6), card('S', 5), // 3
        card('H', 13), card('H', 12), card('H', 10), card('H', 6), // 5
        card('D', 14), card('D', 13), card('D', 9), // 7
        card('C', 11), card('D', 6), // 1
      ],
    };

    const res = evaluateMiniBridgeDeal(hands);
    expect(res.declaringPair).toBe('EW');
    expect(res.declarer).toBe('E');
    expect(res.dummy).toBe('W');
    expect(res.openingLeader).toBe('S');
    expect(res.isGameValue).toBe(true);
  });
});
