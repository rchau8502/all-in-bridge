/**
 * evaluator.ts — Hand evaluation and opening bidding logic.
 *
 * Implements the standard ACBL Series 1 Student Manual (Patty Tucker, 2022)
 * rules for high card points (HCP), length points, distribution/shape,
 * and standard opening bids.
 */

import { buildDeck, shuffle, type Card, type Suit } from './deck.js';

export interface HandEvaluation {
  hcp: number;
  lengthPoints: number;
  totalPoints: number;
  suitLengths: Record<Suit, number>;
  shape: string; // e.g. "5-3-3-2"
  isBalanced: boolean;
  recommendedBid: string; // 'Pass' | '1C' | '1D' | '1H' | '1S' | '1NT' | '2C' | '2NT'
  ruleId: string;
  explanation: {
    en: string;
    zh: string;
  };
  mnemonic?: {
    en: string;
    zh: string;
  } | undefined;
}

export const HCP_VALUES: Record<number, number> = {
  14: 4, // Ace
  13: 3, // King
  12: 2, // Queen
  11: 1, // Jack
};

/** Compute High Card Points (HCP) for a hand (A=4, K=3, Q=2, J=1). */
export function calculateHcp(hand: Card[]): number {
  return hand.reduce((sum, c) => sum + (HCP_VALUES[c.rank] ?? 0), 0);
}

/** Compute suit length distribution: count of C, D, H, S. */
export function getSuitLengths(hand: Card[]): Record<Suit, number> {
  const counts: Record<Suit, number> = { C: 0, D: 0, H: 0, S: 0 };
  for (const c of hand) {
    counts[c.suit]++;
  }
  return counts;
}

/**
 * ACBL Series 1 Length Points:
 * 1 point for each card in a suit beyond 4 (i.e. 5th card = +1, 6th = +2, etc.)
 */
export function calculateLengthPoints(suitLengths: Record<Suit, number>): number {
  let pts = 0;
  for (const suit of ['C', 'D', 'H', 'S'] as const) {
    if (suitLengths[suit] > 4) {
      pts += suitLengths[suit] - 4;
    }
  }
  return pts;
}

/**
 * ACBL Balanced Hand:
 * No voids (0 cards), no singletons (1 card), at most one doubleton (2 cards).
 * The standard patterns are 4-3-3-3, 4-4-3-2, and 5-3-3-2.
 */
export function isBalancedHand(suitLengths: Record<Suit, number>): boolean {
  const counts = Object.values(suitLengths);
  if (counts.some(c => c < 2)) return false; // no void or singleton
  const doubletons = counts.filter(c => c === 2).length;
  return doubletons <= 1;
}

/**
 * Formats suit distribution sorted descending, e.g. "5-3-3-2".
 */
export function getDistributionString(suitLengths: Record<Suit, number>): string {
  return Object.values(suitLengths)
    .sort((a, b) => b - a)
    .join('-');
}

/**
 * Evaluate a 13-card hand and determine the standard ACBL opening bid.
 */
export function evaluateHand(hand: Card[]): HandEvaluation {
  const hcp = calculateHcp(hand);
  const suitLengths = getSuitLengths(hand);
  const lengthPoints = calculateLengthPoints(suitLengths);
  const totalPoints = hcp + lengthPoints;
  const balanced = isBalancedHand(suitLengths);
  const shape = getDistributionString(suitLengths);

  // 1. Pass with fewer than 12 points
  if (totalPoints < 12) {
    return {
      hcp,
      lengthPoints,
      totalPoints,
      suitLengths,
      shape,
      isBalanced: balanced,
      recommendedBid: 'Pass',
      ruleId: 'pass_sub_12',
      explanation: {
        en: `Fewer than 12 points (${hcp} HCP + ${lengthPoints} length = ${totalPoints} total). Pass and wait to hear from partner.`,
        zh: `总点力不足 12 点（${hcp} 大牌点 + ${lengthPoints} 长度点 = ${totalPoints} 总点）。应当 Pass，等待同伴或敌方叫牌。`,
      },
    };
  }

  // 2. Strong opening with 22+ points
  if (totalPoints >= 22) {
    return {
      hcp,
      lengthPoints,
      totalPoints,
      suitLengths,
      shape,
      isBalanced: balanced,
      recommendedBid: '2C',
      ruleId: 'open_2c_strong',
      explanation: {
        en: `Massive hand with ${totalPoints} points (${hcp} HCP). Open 2♣ (artificial strong and game-forcing).`,
        zh: `手握 ${totalPoints} 点强牌（${hcp} 大牌点）。开叫 2♣（逼叫性强开叫，同伴不可 Pass）。`,
      },
    };
  }

  // 3. Balanced NT openings
  if (balanced) {
    if (hcp >= 15 && hcp <= 17) {
      return {
        hcp,
        lengthPoints,
        totalPoints,
        suitLengths,
        shape,
        isBalanced: true,
        recommendedBid: '1NT',
        ruleId: 'open_1nt_15_17',
        explanation: {
          en: `Balanced shape (${shape}) with 15–17 HCP. Ideal 1NT opening!`,
          zh: `均型牌（${shape}）且具备 15–17 大牌点。最标准的 1NT 开叫！`,
        },
        mnemonic: {
          en: '15-17 HCP & Balanced = 1NT',
          zh: '均型 15-17 点开 1NT',
        },
      };
    }
    if (hcp >= 20 && hcp <= 21) {
      return {
        hcp,
        lengthPoints,
        totalPoints,
        suitLengths,
        shape,
        isBalanced: true,
        recommendedBid: '2NT',
        ruleId: 'open_2nt_20_21',
        explanation: {
          en: `Balanced shape (${shape}) with 20–21 HCP. Open 2NT.`,
          zh: `均型牌（${shape}）且具备 20–21 大牌点。开叫 2NT。`,
        },
      };
    }
  }

  // 4. 12-21 Points: Check 5-card Majors (Spades & Hearts)
  const spades = suitLengths.S;
  const hearts = suitLengths.H;

  // Both 5-card majors: High Five rule
  if (spades >= 5 && hearts >= 5) {
    if (spades === hearts) {
      return {
        hcp,
        lengthPoints,
        totalPoints,
        suitLengths,
        shape,
        isBalanced: balanced,
        recommendedBid: '1S',
        ruleId: 'open_major_high_five',
        explanation: {
          en: `Both majors are 5+ cards (${spades}♠, ${hearts}♥). Apply the "High Five" rule: open the higher-ranking major (1♠) first.`,
          zh: `同时持有两门 5 张及以上高花（${spades}♠ 与 ${hearts}♥）。遵从 "High Five" 经典口诀：先开叫级别更高的高花（1♠）。`,
        },
        mnemonic: {
          en: 'High Five: With two 5-card suits, open the higher ranking first',
          zh: 'High Five 口诀：手握两门 5 张套，先叫级别高者',
        },
      };
    }
    const betterMajor = spades > hearts ? '1S' : '1H';
    return {
      hcp,
      lengthPoints,
      totalPoints,
      suitLengths,
      shape,
      isBalanced: balanced,
      recommendedBid: betterMajor,
      ruleId: 'open_major_longer',
      explanation: {
        en: `Two 5-card suits, open your longer major (${betterMajor}).`,
        zh: `开叫更长的高花（${betterMajor}）。`,
      },
    };
  }

  if (spades >= 5) {
    return {
      hcp,
      lengthPoints,
      totalPoints,
      suitLengths,
      shape,
      isBalanced: balanced,
      recommendedBid: '1S',
      ruleId: 'open_1s_major',
      explanation: {
        en: `12–21 points with a 5+ card Spade suit (${spades}♠). Open your 5-card major 1♠.`,
        zh: `12–21 总点且持有 5 张以上黑桃（${spades}♠）。开叫 5 张高花 1♠。`,
      },
    };
  }

  if (hearts >= 5) {
    return {
      hcp,
      lengthPoints,
      totalPoints,
      suitLengths,
      shape,
      isBalanced: balanced,
      recommendedBid: '1H',
      ruleId: 'open_1h_major',
      explanation: {
        en: `12–21 points with a 5+ card Heart suit (${hearts}♥). Open your 5-card major 1♥.`,
        zh: `12–21 总点且持有 5 张以上红心（${hearts}♥）。开叫 5 张高花 1♥。`,
      },
    };
  }

  // 5. No 5-card major: Open longer minor ("Better Minor")
  const clubs = suitLengths.C;
  const diamonds = suitLengths.D;

  if (diamonds > clubs) {
    return {
      hcp,
      lengthPoints,
      totalPoints,
      suitLengths,
      shape,
      isBalanced: balanced,
      recommendedBid: '1D',
      ruleId: 'open_1d_longer_minor',
      explanation: {
        en: `No 5-card major. Open your longer minor: 1♦ (${diamonds}♦ vs ${clubs}♣).`,
        zh: `无 5 张高花。开叫较长的低花：1♦（持 ${diamonds} 张 ♦ 对比 ${clubs} 张 ♣）。`,
      },
    };
  }

  if (clubs > diamonds) {
    return {
      hcp,
      lengthPoints,
      totalPoints,
      suitLengths,
      shape,
      isBalanced: balanced,
      recommendedBid: '1C',
      ruleId: 'open_1c_longer_minor',
      explanation: {
        en: `No 5-card major. Open your longer minor: 1♣ (${clubs}♣ vs ${diamonds}♦).`,
        zh: `无 5 张高花。开叫较长的低花：1♣（持 ${clubs} 张 ♣ 对比 ${diamonds} 张 ♦）。`,
      },
    };
  }

  // Equal minor lengths:
  // If 4-4: Open 1D
  if (diamonds === 4 && clubs === 4) {
    return {
      hcp,
      lengthPoints,
      totalPoints,
      suitLengths,
      shape,
      isBalanced: balanced,
      recommendedBid: '1D',
      ruleId: 'open_1d_equal_44',
      explanation: {
        en: `No 5-card major, 4-4 in minors. ACBL standard: with equal 4-card minors, open 1♦.`,
        zh: `无 5 张高花，低花各 4 张（4-4）。ACBL 官方标准：双 4 张低花开叫 1♦。`,
      },
    };
  }

  // If 3-3: Open 1C
  return {
    hcp,
    lengthPoints,
    totalPoints,
    suitLengths,
    shape,
    isBalanced: balanced,
    recommendedBid: '1C',
    ruleId: 'open_1c_equal_33',
    explanation: {
      en: `No 5-card major, 3-3 in minors (4-4-3-3 or 4-3-3-3). ACBL standard: with 3-3 in minors, open 1♣.`,
      zh: `无 5 张高花，低花各 3 张。ACBL 官方标准：双 3 张低花开叫 1♣。`,
    },
  };
}

/**
 * Deals a random 13-card hand from a full shuffled 52-card deck.
 */
export function dealRandomHand(rng: () => number = Math.random): Card[] {
  const deck = buildDeck();
  const shuffled = shuffle(deck, rng);
  return shuffled.slice(0, 13);
}

/**
 * Pre-configured drill category filters.
 */
export type DrillCategory = 'all' | 'pass' | '1nt' | 'major' | 'minor' | 'strong';

/**
 * Generate a drill problem, optionally targeting a specific lesson category.
 */
export function generateDrillHand(
  category: DrillCategory = 'all',
  maxAttempts = 200,
  rng: () => number = Math.random
): { hand: Card[]; evaluation: HandEvaluation } {
  for (let i = 0; i < maxAttempts; i++) {
    const hand = dealRandomHand(rng);
    const evaluation = evaluateHand(hand);

    if (category === 'all') {
      return { hand, evaluation };
    }
    if (category === 'pass' && evaluation.recommendedBid === 'Pass') {
      return { hand, evaluation };
    }
    if (category === '1nt' && evaluation.recommendedBid === '1NT') {
      return { hand, evaluation };
    }
    if (category === 'major' && (evaluation.recommendedBid === '1H' || evaluation.recommendedBid === '1S')) {
      return { hand, evaluation };
    }
    if (category === 'minor' && (evaluation.recommendedBid === '1C' || evaluation.recommendedBid === '1D')) {
      return { hand, evaluation };
    }
    if (category === 'strong' && (evaluation.recommendedBid === '2C' || evaluation.recommendedBid === '2NT')) {
      return { hand, evaluation };
    }
  }

  // Fallback to any random hand if attempt limit reached
  const hand = dealRandomHand(rng);
  return { hand, evaluation: evaluateHand(hand) };
}
