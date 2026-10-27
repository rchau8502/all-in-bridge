import { describe, it, expect } from 'vitest';
import {
  calculateHcp,
  getSuitLengths,
  calculateLengthPoints,
  isBalancedHand,
  evaluateHand,
  dealRandomHand,
  generateDrillHand,
  calculateDummyPoints,
  evaluateResponse,
  evaluateOvercall,
  generateOvercallDrillHand,
} from './evaluator.js';
import { buildDeck, type Card } from './deck.js';

describe('Hand Evaluator — ACBL Standards', () => {
  it('entire 52-card deck totals 40 HCP', () => {
    const deck = buildDeck();
    expect(calculateHcp(deck)).toBe(40);
  });

  it('calculates HCP correctly for a sample hand', () => {
    // ♠ AKQ (4+3+2=9), ♥ J (1), ♦ 10 (0), ♣ (0)
    const hand: Card[] = [
      { suit: 'S', rank: 14 },
      { suit: 'S', rank: 13 },
      { suit: 'S', rank: 12 },
      { suit: 'H', rank: 11 },
      { suit: 'D', rank: 10 },
    ];
    expect(calculateHcp(hand)).toBe(10);
  });

  it('calculates length points correctly for 5+ card suits', () => {
    const lengths = { S: 5, H: 6, D: 2, C: 0 };
    // S: 5-4 = 1 pt; H: 6-4 = 2 pts; total = 3 pts
    expect(calculateLengthPoints(lengths)).toBe(3);
  });

  it('identifies balanced distributions (4-3-3-3, 4-4-3-2, 5-3-3-2)', () => {
    expect(isBalancedHand({ S: 4, H: 3, D: 3, C: 3 })).toBe(true);
    expect(isBalancedHand({ S: 4, H: 4, D: 3, C: 2 })).toBe(true);
    expect(isBalancedHand({ S: 5, H: 3, D: 3, C: 2 })).toBe(true);

    // Unbalanced: singleton
    expect(isBalancedHand({ S: 5, H: 4, D: 3, C: 1 })).toBe(false);
    // Unbalanced: void
    expect(isBalancedHand({ S: 5, H: 5, D: 3, C: 0 })).toBe(false);
    // Unbalanced: two doubletons (5-4-2-2)
    expect(isBalancedHand({ S: 5, H: 4, D: 2, C: 2 })).toBe(false);
  });

  it('recommends Pass for hands under 12 total points', () => {
    // 8 HCP, 4-3-3-3 balanced
    const hand: Card[] = [
      { suit: 'S', rank: 13 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 7 }, { suit: 'S', rank: 2 },
      { suit: 'H', rank: 12 }, { suit: 'H', rank: 6 }, { suit: 'H', rank: 5 },
      { suit: 'D', rank: 11 }, { suit: 'D', rank: 4 }, { suit: 'D', rank: 3 },
      { suit: 'C', rank: 12 }, { suit: 'C', rank: 9 }, { suit: 'C', rank: 2 },
    ];
    const ev = evaluateHand(hand);
    expect(ev.hcp).toBe(3 + 2 + 1 + 2); // 8 HCP
    expect(ev.totalPoints).toBe(8);
    expect(ev.recommendedBid).toBe('Pass');
    expect(ev.ruleId).toBe('pass_sub_12');
  });

  it('recommends 1NT for 15-17 HCP balanced hands', () => {
    // ♠ A K 4 2 (7), ♥ K Q 3 (5), ♦ Q 10 2 (2), ♣ K 5 2 (3) = 17 HCP, 4-3-3-3
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 13 }, { suit: 'S', rank: 4 }, { suit: 'S', rank: 2 },
      { suit: 'H', rank: 13 }, { suit: 'H', rank: 12 }, { suit: 'H', rank: 3 },
      { suit: 'D', rank: 12 }, { suit: 'D', rank: 10 }, { suit: 'D', rank: 2 },
      { suit: 'C', rank: 13 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 },
    ];
    const ev = evaluateHand(hand);
    expect(ev.hcp).toBe(17);
    expect(ev.isBalanced).toBe(true);
    expect(ev.recommendedBid).toBe('1NT');
    expect(ev.ruleId).toBe('open_1nt_15_17');
    expect(ev.mnemonic?.en).toContain('15-17');
  });

  it('recommends 2NT for 20-21 HCP balanced hands', () => {
    // 20 HCP, 4-4-3-2
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 13 }, { suit: 'S', rank: 4 }, { suit: 'S', rank: 2 }, // 7
      { suit: 'H', rank: 14 }, { suit: 'H', rank: 13 }, { suit: 'H', rank: 5 }, { suit: 'H', rank: 3 }, // 7
      { suit: 'D', rank: 14 }, { suit: 'D', rank: 12 }, { suit: 'D', rank: 2 }, // 6
      { suit: 'C', rank: 6 }, { suit: 'C', rank: 2 }, // 0
    ];
    const ev = evaluateHand(hand);
    expect(ev.hcp).toBe(20);
    expect(ev.isBalanced).toBe(true);
    expect(ev.recommendedBid).toBe('2NT');
    expect(ev.ruleId).toBe('open_2nt_20_21');
  });

  it('recommends 2C strong artificial for 22+ points', () => {
    // 23 HCP
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 13 }, { suit: 'S', rank: 12 }, { suit: 'S', rank: 11 }, // 10
      { suit: 'H', rank: 14 }, { suit: 'H', rank: 13 }, { suit: 'H', rank: 12 }, // 9
      { suit: 'D', rank: 14 }, { suit: 'D', rank: 3 }, // 4
      { suit: 'C', rank: 5 }, { suit: 'C', rank: 4 }, { suit: 'C', rank: 3 }, { suit: 'C', rank: 2 }, // 0
    ];
    const ev = evaluateHand(hand);
    expect(ev.totalPoints).toBeGreaterThanOrEqual(22);
    expect(ev.recommendedBid).toBe('2C');
    expect(ev.ruleId).toBe('open_2c_strong');
  });

  it('applies "High Five" rule with 5-5 in Spades and Hearts', () => {
    // 13 HCP, 5 Spades, 5 Hearts, 2 Diamonds, 1 Club
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 13 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 4 }, { suit: 'S', rank: 2 }, // 7
      { suit: 'H', rank: 13 }, { suit: 'H', rank: 12 }, { suit: 'H', rank: 11 }, { suit: 'H', rank: 5 }, { suit: 'H', rank: 3 }, // 6
      { suit: 'D', rank: 7 }, { suit: 'D', rank: 3 },
      { suit: 'C', rank: 2 },
    ];
    const ev = evaluateHand(hand);
    expect(ev.suitLengths.S).toBe(5);
    expect(ev.suitLengths.H).toBe(5);
    expect(ev.recommendedBid).toBe('1S');
    expect(ev.ruleId).toBe('open_major_high_five');
    expect(ev.mnemonic?.en).toContain('High Five');
  });

  it('opens 1S with 5 spades (and fewer hearts)', () => {
    // 13 HCP, 5S, 3H, 3D, 2C
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 13 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 4 }, { suit: 'S', rank: 2 }, // 7
      { suit: 'H', rank: 13 }, { suit: 'H', rank: 5 }, { suit: 'H', rank: 3 }, // 3
      { suit: 'D', rank: 13 }, { suit: 'D', rank: 5 }, { suit: 'D', rank: 2 }, // 3
      { suit: 'C', rank: 6 }, { suit: 'C', rank: 2 }, // 0
    ];
    const ev = evaluateHand(hand);
    expect(ev.recommendedBid).toBe('1S');
    expect(ev.ruleId).toBe('open_1s_major');
  });

  it('opens 1H with 5 hearts', () => {
    // 13 HCP, 3S, 5H, 3D, 2C
    const hand: Card[] = [
      { suit: 'S', rank: 13 }, { suit: 'S', rank: 5 }, { suit: 'S', rank: 2 }, // 3
      { suit: 'H', rank: 14 }, { suit: 'H', rank: 13 }, { suit: 'H', rank: 8 }, { suit: 'H', rank: 4 }, { suit: 'H', rank: 2 }, // 7
      { suit: 'D', rank: 13 }, { suit: 'D', rank: 5 }, { suit: 'D', rank: 2 }, // 3
      { suit: 'C', rank: 6 }, { suit: 'C', rank: 2 }, // 0
    ];
    const ev = evaluateHand(hand);
    expect(ev.recommendedBid).toBe('1H');
    expect(ev.ruleId).toBe('open_1h_major');
  });

  it('opens 1D with 4-4 in minors and no 5-card major', () => {
    // 2S, 3H, 4D, 4C, 13 HCP
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 2 }, // 4
      { suit: 'H', rank: 13 }, { suit: 'H', rank: 5 }, { suit: 'H', rank: 2 }, // 3
      { suit: 'D', rank: 13 }, { suit: 'D', rank: 8 }, { suit: 'D', rank: 5 }, { suit: 'D', rank: 2 }, // 3
      { suit: 'C', rank: 13 }, { suit: 'C', rank: 8 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 }, // 3
    ];
    const ev = evaluateHand(hand);
    expect(ev.suitLengths.D).toBe(4);
    expect(ev.suitLengths.C).toBe(4);
    expect(ev.recommendedBid).toBe('1D');
    expect(ev.ruleId).toBe('open_1d_equal_44');
  });

  it('opens 1C with 3-3 in minors and no 5-card major', () => {
    // 4S, 3H, 3D, 3C (Wait: 4-3-3-3 = 13 cards), 13 HCP (not 15-17)
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 13 }, { suit: 'S', rank: 5 }, { suit: 'S', rank: 2 }, // 7
      { suit: 'H', rank: 12 }, { suit: 'H', rank: 5 }, { suit: 'H', rank: 2 }, // 2
      { suit: 'D', rank: 12 }, { suit: 'D', rank: 5 }, { suit: 'D', rank: 2 }, // 2
      { suit: 'C', rank: 12 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 }, // 2
    ];
    const ev = evaluateHand(hand);
    expect(ev.hcp).toBe(13); // not 15-17
    expect(ev.suitLengths.D).toBe(3);
    expect(ev.suitLengths.C).toBe(3);
    expect(ev.recommendedBid).toBe('1C');
    expect(ev.ruleId).toBe('open_1c_equal_33');
  });

  it('deals random 13-card hand with no duplicate cards', () => {
    const hand = dealRandomHand();
    expect(hand.length).toBe(13);
    const seen = new Set<string>();
    for (const c of hand) {
      const sig = `${c.suit}${c.rank}`;
      expect(seen.has(sig)).toBe(false);
      seen.add(sig);
    }
  });

  it('generates drill hands matching requested category', () => {
    const passHand = generateDrillHand('pass');
    expect(passHand.evaluation.recommendedBid).toBe('Pass');

    const ntHand = generateDrillHand('1nt');
    expect(ntHand.evaluation.recommendedBid).toBe('1NT');

    const majorHand = generateDrillHand('major');
    expect(['1H', '1S']).toContain(majorHand.evaluation.recommendedBid);
  });
});

describe('Responder Evaluation — ACBL Class 6 & 7 Standards', () => {
  it('calculates dummy points correctly (Void=3, Singleton=2, Doubleton=1)', () => {
    // Trump is S; H: 0 (Void=3), D: 1 (Singleton=2), C: 2 (Doubleton=1) -> total 6
    const lengths = { S: 10, H: 0, D: 1, C: 2 };
    expect(calculateDummyPoints(lengths, 'S')).toBe(6);
  });

  it('1NT response: 0-7 HCP passes (traffic light RED)', () => {
    // 6 HCP
    const hand: Card[] = [
      { suit: 'S', rank: 13 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 4 }, // 3
      { suit: 'H', rank: 12 }, { suit: 'H', rank: 5 }, { suit: 'H', rank: 3 }, // 2
      { suit: 'D', rank: 11 }, { suit: 'D', rank: 4 }, { suit: 'D', rank: 2 }, // 1
      { suit: 'C', rank: 8 }, { suit: 'C', rank: 7 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 }, // 0
    ];
    const ev = evaluateResponse(hand, '1NT');
    expect(ev.hcp).toBe(6);
    expect(ev.recommendedBid).toBe('Pass');
    expect(ev.trafficLight).toBe('stop');
  });

  it('1NT response: 8-9 HCP invites with 2NT (traffic light YELLOW)', () => {
    // 9 HCP
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 4 }, // 4
      { suit: 'H', rank: 13 }, { suit: 'H', rank: 5 }, { suit: 'H', rank: 3 }, // 3
      { suit: 'D', rank: 12 }, { suit: 'D', rank: 4 }, { suit: 'D', rank: 2 }, // 2
      { suit: 'C', rank: 8 }, { suit: 'C', rank: 7 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 }, // 0
    ];
    const ev = evaluateResponse(hand, '1NT');
    expect(ev.hcp).toBe(9);
    expect(ev.recommendedBid).toBe('2NT');
    expect(ev.trafficLight).toBe('invite');
  });

  it('1NT response: 10+ HCP bids game 3NT (traffic light GREEN)', () => {
    // 11 HCP
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 4 }, // 4
      { suit: 'H', rank: 14 }, { suit: 'H', rank: 5 }, { suit: 'H', rank: 3 }, // 4
      { suit: 'D', rank: 13 }, { suit: 'D', rank: 4 }, { suit: 'D', rank: 2 }, // 3
      { suit: 'C', rank: 8 }, { suit: 'C', rank: 7 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 }, // 0
    ];
    const ev = evaluateResponse(hand, '1NT');
    expect(ev.hcp).toBe(11);
    expect(ev.recommendedBid).toBe('3NT');
    expect(ev.trafficLight).toBe('go');
  });

  it('1S response: 3+ support & 6-9 pts makes simple raise to 2S', () => {
    // 3 Spades, 7 HCP, no short suits
    const hand: Card[] = [
      { suit: 'S', rank: 13 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 4 }, // 3
      { suit: 'H', rank: 12 }, { suit: 'H', rank: 8 }, { suit: 'H', rank: 3 }, // 2
      { suit: 'D', rank: 12 }, { suit: 'D', rank: 4 }, { suit: 'D', rank: 2 }, // 2
      { suit: 'C', rank: 8 }, { suit: 'C', rank: 7 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 }, // 0
    ];
    const ev = evaluateResponse(hand, '1S');
    expect(ev.hasGoldenFit).toBe(true);
    expect(ev.recommendedBid).toBe('2S');
  });

  it('1S response: 3+ support & 10-12 pts makes limit raise to 3S', () => {
    // 3 Spades, 11 HCP
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 4 }, // 4
      { suit: 'H', rank: 13 }, { suit: 'H', rank: 8 }, { suit: 'H', rank: 3 }, // 3
      { suit: 'D', rank: 14 }, { suit: 'D', rank: 4 }, { suit: 'D', rank: 2 }, // 4
      { suit: 'C', rank: 8 }, { suit: 'C', rank: 7 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 }, // 0
    ];
    const ev = evaluateResponse(hand, '1S');
    expect(ev.hasGoldenFit).toBe(true);
    expect(ev.recommendedBid).toBe('3S');
  });

  it('1S response: 3+ support & 13+ pts raises to game 4S', () => {
    // 3 Spades, 14 HCP
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 13 }, { suit: 'S', rank: 4 }, // 7
      { suit: 'H', rank: 13 }, { suit: 'H', rank: 8 }, { suit: 'H', rank: 3 }, // 3
      { suit: 'D', rank: 14 }, { suit: 'D', rank: 4 }, { suit: 'D', rank: 2 }, // 4
      { suit: 'C', rank: 8 }, { suit: 'C', rank: 7 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 }, // 0
    ];
    const ev = evaluateResponse(hand, '1S');
    expect(ev.hasGoldenFit).toBe(true);
    expect(ev.recommendedBid).toBe('4S');
  });

  it('1C response: holding both 4-card majors follows "Four on the Floor" and bids 1H', () => {
    // 4 Spades, 4 Hearts, 8 HCP
    const hand: Card[] = [
      { suit: 'S', rank: 13 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 5 }, { suit: 'S', rank: 2 }, // 3
      { suit: 'H', rank: 13 }, { suit: 'H', rank: 8 }, { suit: 'H', rank: 5 }, { suit: 'H', rank: 2 }, // 3
      { suit: 'D', rank: 12 }, { suit: 'D', rank: 4 }, { suit: 'D', rank: 2 }, // 2
      { suit: 'C', rank: 8 }, { suit: 'C', rank: 2 }, // 0
    ];
    const ev = evaluateResponse(hand, '1C');
    expect(ev.recommendedBid).toBe('1H');
    expect(ev.ruleId).toBe('resp_minor_four_on_floor');
    expect(ev.mnemonic?.en).toContain('Four on the Floor');
  });

  describe('Overcalling — ACBL Class 10 (10-5-2 Rule)', () => {
    it('overcalls 1S over 1D with 10+ HCP, 5+ suit, and 2 honors (10-5-2)', () => {
      // 5 Spades (AQ984 -> A, Q = 2 of top 3), 11 HCP
      const hand: Card[] = [
        { suit: 'S', rank: 14 }, { suit: 'S', rank: 12 }, { suit: 'S', rank: 9 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 4 }, // 6
        { suit: 'H', rank: 13 }, { suit: 'H', rank: 5 }, // 3
        { suit: 'D', rank: 8 }, { suit: 'D', rank: 3 }, // 0
        { suit: 'C', rank: 13 }, { suit: 'C', rank: 7 }, { suit: 'C', rank: 4 }, { suit: 'C', rank: 2 }, // 3 (Wait: 6+3+3 = 12 HCP)
      ];
      const ev = evaluateOvercall(hand, '1D');
      expect(ev.is10_5_2).toBe(true);
      expect(ev.recommendedBid).toBe('1S');
      expect(ev.ruleId).toBe('overcall_10_5_2');
      expect(ev.mnemonic.en).toContain('10-5-2');
    });

    it('bids 1NT overcall with 15-17 HCP, balanced, and stopper in opponent suit', () => {
      // Balanced 16 HCP, K-x in D
      const hand: Card[] = [
        { suit: 'S', rank: 14 }, { suit: 'S', rank: 10 }, { suit: 'S', rank: 5 }, { suit: 'S', rank: 2 }, // 4
        { suit: 'H', rank: 14 }, { suit: 'H', rank: 12 }, { suit: 'H', rank: 4 }, // 6
        { suit: 'D', rank: 13 }, { suit: 'D', rank: 6 }, // 3 (Kx = stopper!)
        { suit: 'C', rank: 13 }, { suit: 'C', rank: 8 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 }, // 3 -> Total 16 HCP
      ];
      const ev = evaluateOvercall(hand, '1D');
      expect(ev.recommendedBid).toBe('1NT');
      expect(ev.ruleId).toBe('overcall_1nt');
    });

    it('bids Takeout Double (Dbl) with 13 HCP, shortness in opp suit, and support for all unbid suits', () => {
      // Opp opens 1D. We have 4 Spades, 4 Hearts, 3 Clubs, 2 Diamonds (13 HCP)
      const hand: Card[] = [
        { suit: 'S', rank: 13 }, { suit: 'S', rank: 11 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 4 }, // 4
        { suit: 'H', rank: 14 }, { suit: 'H', rank: 12 }, { suit: 'H', rank: 7 }, { suit: 'H', rank: 2 }, // 6
        { suit: 'D', rank: 9 }, { suit: 'D', rank: 3 }, // 0 (shortness)
        { suit: 'C', rank: 13 }, { suit: 'C', rank: 8 }, { suit: 'C', rank: 5 }, // 3 -> Total 13 HCP
      ];
      const ev = evaluateOvercall(hand, '1D');
      expect(ev.recommendedBid).toBe('Dbl');
      expect(ev.ruleId).toBe('overcall_takeout_double');
    });

    it('passes when hand has only 8 HCP and cannot overcall', () => {
      const hand: Card[] = [
        { suit: 'S', rank: 12 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 4 }, // 2
        { suit: 'H', rank: 13 }, { suit: 'H', rank: 7 }, { suit: 'H', rank: 3 }, // 3
        { suit: 'D', rank: 13 }, { suit: 'D', rank: 5 }, // 3 -> Total 8 HCP
        { suit: 'C', rank: 9 }, { suit: 'C', rank: 8 }, { suit: 'C', rank: 7 }, { suit: 'C', rank: 4 }, { suit: 'C', rank: 2 }, // 0
      ];
      const ev = evaluateOvercall(hand, '1D');
      expect(ev.recommendedBid).toBe('Pass');
      expect(ev.ruleId).toBe('overcall_pass');
    });

    it('generates an overcall drill hand successfully', () => {
      const problem = generateOvercallDrillHand('1D');
      expect(problem.hand).toHaveLength(13);
      expect(problem.evaluation.oppBid).toBe('1D');
      expect(problem.evaluation.recommendedBid).toBeDefined();
    });
  });
});
