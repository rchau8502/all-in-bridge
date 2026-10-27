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

export type PartnerOpeningBid = '1NT' | '1S' | '1H' | '1D' | '1C';

export interface ResponseEvaluation {
  partnerBid: PartnerOpeningBid;
  hcp: number;
  supportPoints: number;
  totalPoints: number;
  supportLength: number;
  hasGoldenFit: boolean;
  recommendedBid: string;
  ruleId: string;
  trafficLight?: 'stop' | 'invite' | 'go' | undefined;
  explanation: {
    en: string;
    zh: string;
  };
  mnemonic?: {
    en: string;
    zh: string;
  } | undefined;
}

/**
 * ACBL Dummy Points when supporting partner's trump suit:
 * Doubleton = 1 pt, Singleton = 2 pts, Void = 3 pts.
 */
export function calculateDummyPoints(suitLengths: Record<Suit, number>, trumpSuit: Suit): number {
  let pts = 0;
  for (const s of ['C', 'D', 'H', 'S'] as const) {
    if (s === trumpSuit) continue;
    const len = suitLengths[s];
    if (len === 0) pts += 3; // Void
    else if (len === 1) pts += 2; // Singleton
    else if (len === 2) pts += 1; // Doubleton
  }
  return pts;
}

/**
 * Evaluate responder's hand based on ACBL Class 6 & Class 7 rules.
 */
export function evaluateResponse(hand: Card[], partnerBid: PartnerOpeningBid): ResponseEvaluation {
  const hcp = calculateHcp(hand);
  const suitLengths = getSuitLengths(hand);

  // -------------------------------------------------------------
  // 1. Partner Opened 1NT (15–17 HCP, Balanced) — ACBL Class 7
  // -------------------------------------------------------------
  if (partnerBid === '1NT') {
    // Traffic Light rule:
    // 0–7 HCP: STOP (Pass)
    if (hcp <= 7) {
      return {
        partnerBid,
        hcp,
        supportPoints: 0,
        totalPoints: hcp,
        supportLength: 0,
        hasGoldenFit: false,
        recommendedBid: 'Pass',
        ruleId: 'resp_1nt_stop',
        trafficLight: 'stop',
        explanation: {
          en: `With 0–7 HCP (${hcp} HCP), partnership total is at most 15+7 = 22 pts (not enough for 25-pt game). Traffic light: RED (STOP) → Pass.`,
          zh: `手握 0–7 大牌点（本手 ${hcp} 点），与同伴合计最多 22 点，无法达到成局线（25点）。红绿灯法则：红灯停（STOP）→ 应当 Pass。`,
        },
        mnemonic: {
          en: '1NT Response Traffic Light: 0-7 Stop (Pass)',
          zh: '1NT 应叫红绿灯口诀：0-7 点红灯停（Pass）',
        },
      };
    }

    // 8–9 HCP: INVITE (2NT)
    if (hcp <= 9) {
      return {
        partnerBid,
        hcp,
        supportPoints: 0,
        totalPoints: hcp,
        supportLength: 0,
        hasGoldenFit: false,
        recommendedBid: '2NT',
        ruleId: 'resp_1nt_invite',
        trafficLight: 'invite',
        explanation: {
          en: `With 8–9 HCP (${hcp} HCP), partnership total is 23–26 pts. If partner has 16 or 17, 3NT is on! Traffic light: YELLOW (INVITE) → 2NT.`,
          zh: `手握 8–9 大牌点（本手 ${hcp} 点），双方合计 23–26 点。若同伴是 16 或 17 点的高限则可成局。红绿灯法则：黄灯邀叫（INVITE）→ 叫 2NT。`,
        },
        mnemonic: {
          en: '1NT Response Traffic Light: 8-9 Invite (2NT)',
          zh: '1NT 应叫红绿灯口诀：8-9 点黄灯邀叫（2NT）',
        },
      };
    }

    // 10–15 HCP: GO (3NT)
    return {
      partnerBid,
      hcp,
      supportPoints: 0,
      totalPoints: hcp,
      supportLength: 0,
      hasGoldenFit: false,
      recommendedBid: '3NT',
      ruleId: 'resp_1nt_go',
      trafficLight: 'go',
      explanation: {
        en: `With 10+ HCP (${hcp} HCP), partnership total is at least 15+10 = 25 pts (game guaranteed!). Traffic light: GREEN (GO) → 3NT.`,
        zh: `手握 10 点及以上（本手 ${hcp} 点），双方合计至少 25 点确保成局！红绿灯法则：绿灯冲局（GO）→ 直叫 3NT。`,
      },
      mnemonic: {
        en: '1NT Response Traffic Light: 10+ Go (3NT)',
        zh: '1NT 应叫红绿灯口诀：10 点以上绿灯行（直叫 3NT）',
      },
    };
  }

  // -------------------------------------------------------------
  // 2. Partner Opened 1 Major (1♠ or 1♥) — ACBL Class 6
  // -------------------------------------------------------------
  if (partnerBid === '1S' || partnerBid === '1H') {
    const trumpSuit: Suit = partnerBid === '1S' ? 'S' : 'H';
    const supportLen = suitLengths[trumpSuit];
    const hasGoldenFit = supportLen >= 3; // Partner has 5+, so 3+ gives 8+ Golden Fit

    if (hasGoldenFit) {
      const dummyPts = calculateDummyPoints(suitLengths, trumpSuit);
      const totalPoints = hcp + dummyPts;

      if (totalPoints < 6) {
        return {
          partnerBid,
          hcp,
          supportPoints: dummyPts,
          totalPoints,
          supportLength: supportLen,
          hasGoldenFit: true,
          recommendedBid: 'Pass',
          ruleId: 'resp_major_sub_6',
          explanation: {
            en: `Even with support (${supportLen} cards), hand has fewer than 6 points (${totalPoints} pts). Pass.`,
            zh: `即使持有 ${supportLen} 张支持，点力不足 6 点（${totalPoints} 点）。应当 Pass。`,
          },
        };
      }

      // 6–9 pts: Simple Raise (2-level)
      if (totalPoints <= 9) {
        const bid = `2${trumpSuit}`;
        return {
          partnerBid,
          hcp,
          supportPoints: dummyPts,
          totalPoints,
          supportLength: supportLen,
          hasGoldenFit: true,
          recommendedBid: bid,
          ruleId: 'resp_major_raise_2',
          explanation: {
            en: `Golden Fit (${supportLen}-card support) with 6–9 points (${hcp} HCP + ${dummyPts} dummy = ${totalPoints} pts). Make a simple raise to ${bid}.`,
            zh: `黄金配合（持 ${supportLen} 张支持）且有 6–9 点（${hcp} HCP + ${dummyPts} 短门 = ${totalPoints} 点）。简单加叫至 ${bid}。`,
          },
          mnemonic: {
            en: 'Golden Fit (8+ cards): 6-9 pts = Raise to 2',
            zh: '8 张黄金配合口诀：6-9 点加叫 2 阶',
          },
        };
      }

      // 10–12 pts: Limit Raise (3-level)
      if (totalPoints <= 12) {
        const bid = `3${trumpSuit}`;
        return {
          partnerBid,
          hcp,
          supportPoints: dummyPts,
          totalPoints,
          supportLength: supportLen,
          hasGoldenFit: true,
          recommendedBid: bid,
          ruleId: 'resp_major_raise_3',
          explanation: {
            en: `Golden Fit (${supportLen}-card support) with 10–12 points (${hcp} HCP + ${dummyPts} dummy = ${totalPoints} pts). Limit raise to ${bid} (invitational).`,
            zh: `黄金配合（持 ${supportLen} 张支持）且有 10–12 邀请点（${hcp} HCP + ${dummyPts} 短门 = ${totalPoints} 点）。进逼性加叫至 ${bid}。`,
          },
          mnemonic: {
            en: 'Golden Fit (8+ cards): 10-12 pts = Limit Raise to 3',
            zh: '8 张黄金配合口诀：10-12 点邀叫加叫 3 阶',
          },
        };
      }

      // 13+ pts: Game Raise (4-level)
      const bid = `4${trumpSuit}`;
      return {
        partnerBid,
        hcp,
        supportPoints: dummyPts,
        totalPoints,
        supportLength: supportLen,
        hasGoldenFit: true,
        recommendedBid: bid,
        ruleId: 'resp_major_raise_4',
        explanation: {
          en: `Golden Fit (${supportLen}-card support) with 13+ points (${hcp} HCP + ${dummyPts} dummy = ${totalPoints} pts). Jump directly to game: ${bid}!`,
          zh: `黄金配合（持 ${supportLen} 张支持）且手握 13 点及以上进局实力（${totalPoints} 点）。直接跳叫成局：${bid}！`,
        },
        mnemonic: {
          en: 'Golden Fit (8+ cards): 13+ pts = Game Raise to 4',
          zh: '8 张黄金配合口诀：13 点以上直接加叫到 4 阶成局',
        },
      };
    }

    // No golden fit in partner's major
    const lengthPts = calculateLengthPoints(suitLengths);
    const totalPoints = hcp + lengthPts;

    if (totalPoints < 6) {
      return {
        partnerBid,
        hcp,
        supportPoints: 0,
        totalPoints,
        supportLength: supportLen,
        hasGoldenFit: false,
        recommendedBid: 'Pass',
        ruleId: 'resp_major_unfit_pass',
        explanation: {
          en: `No support and fewer than 6 points (${totalPoints} pts). Pass.`,
          zh: `无将牌配合且点力不足 6 点（${totalPoints} 点）。应当 Pass。`,
        },
      };
    }

    // Partner opened 1H: with 4+ Spades and 6+ pts, bid 1S!
    if (partnerBid === '1H' && suitLengths.S >= 4) {
      return {
        partnerBid,
        hcp,
        supportPoints: 0,
        totalPoints,
        supportLength: supportLen,
        hasGoldenFit: false,
        recommendedBid: '1S',
        ruleId: 'resp_1h_bid_1s',
        explanation: {
          en: `No Heart fit, but holding a 4+ card Spade suit (${suitLengths.S}♠) with 6+ points. Bid your 4-card major at the 1-level: 1♠.`,
          zh: `红心无配合，但持有 4 张以上黑桃（${suitLengths.S}♠）且点力达到 6 点以上。在 1 阶应叫你的高花新套：1♠。`,
        },
      };
    }

    // Otherwise with 6–9 pts and no major: bid 1NT
    return {
      partnerBid,
      hcp,
      supportPoints: 0,
      totalPoints,
      supportLength: supportLen,
      hasGoldenFit: false,
      recommendedBid: '1NT',
      ruleId: 'resp_major_unfit_1nt',
      explanation: {
        en: `No fit in partner's major and no other 1-level major to bid. With 6–9 points, bid 1NT.`,
        zh: `高花无配合且无其它 1 阶高花可叫。在 6–9 点区间应叫 1NT。`,
      },
    };
  }

  // -------------------------------------------------------------
  // 3. Partner Opened 1 Minor (1♣ or 1♦) — ACBL Class 6
  // -------------------------------------------------------------
  const lengthPts = calculateLengthPoints(suitLengths);
  const totalPoints = hcp + lengthPts;

  if (totalPoints < 6) {
    return {
      partnerBid,
      hcp,
      supportPoints: 0,
      totalPoints,
      supportLength: suitLengths[partnerBid === '1C' ? 'C' : 'D'],
      hasGoldenFit: false,
      recommendedBid: 'Pass',
      ruleId: 'resp_minor_sub_6',
      explanation: {
        en: `Fewer than 6 points (${totalPoints} pts). Pass.`,
        zh: `点力不足 6 点（${totalPoints} 点）。应当 Pass。`,
      },
    };
  }

  const spades = suitLengths.S;
  const hearts = suitLengths.H;

  // Holding both 4-card majors: Four on the Floor rule -> bid 1H first!
  if (spades >= 4 && hearts >= 4) {
    return {
      partnerBid,
      hcp,
      supportPoints: 0,
      totalPoints,
      supportLength: suitLengths[partnerBid === '1C' ? 'C' : 'D'],
      hasGoldenFit: false,
      recommendedBid: '1H',
      ruleId: 'resp_minor_four_on_floor',
      explanation: {
        en: `Holding both 4-card majors (${spades}♠ and ${hearts}♥). Apply the "Four on the Floor" rule: bid the lower-ranking major (1♥) first so partner can bid 1♠ if they hold it!`,
        zh: `同时持有两门 4 张高花（${spades}♠ 与 ${hearts}♥）。遵从 "Four on the Floor" 经典口诀：先叫级别更低的 1♥，方便同伴若持黑桃能顺畅叫出 1♠！`,
      },
      mnemonic: {
        en: 'Four on the Floor: With two 4-card majors, bid 1♥ first',
        zh: 'Four on the Floor 口诀：双 4 张高花，先应叫 1♥',
      },
    };
  }

  // Single 4-card major: bid it up the line
  if (hearts >= 4) {
    return {
      partnerBid,
      hcp,
      supportPoints: 0,
      totalPoints,
      supportLength: suitLengths[partnerBid === '1C' ? 'C' : 'D'],
      hasGoldenFit: false,
      recommendedBid: '1H',
      ruleId: 'resp_minor_1h',
      explanation: {
        en: `Search for a major fit first! With 4+ hearts (${hearts}♥) and 6+ points, bid 1♥.`,
        zh: `优先寻找高花配合！持有 4 张以上红心（${hearts}♥）且点力达到 6 点以上，应叫 1♥。`,
      },
    };
  }

  if (spades >= 4) {
    return {
      partnerBid,
      hcp,
      supportPoints: 0,
      totalPoints,
      supportLength: suitLengths[partnerBid === '1C' ? 'C' : 'D'],
      hasGoldenFit: false,
      recommendedBid: '1S',
      ruleId: 'resp_minor_1s',
      explanation: {
        en: `Search for a major fit first! With 4+ spades (${spades}♠) and 6+ points, bid 1♠.`,
        zh: `优先寻找高花配合！持有 4 张以上黑桃（${spades}♠）且点力达到 6 点以上，应叫 1♠。`,
      },
    };
  }

  // No 4-card major: with 6-9 pts, bid 1NT
  return {
    partnerBid,
    hcp,
    supportPoints: 0,
    totalPoints,
    supportLength: suitLengths[partnerBid === '1C' ? 'C' : 'D'],
    hasGoldenFit: false,
    recommendedBid: '1NT',
    ruleId: 'resp_minor_1nt',
    explanation: {
      en: `No 4-card major to show. With 6–9 points (${hcp} HCP), bid 1NT.`,
      zh: `无 4 张高花可叫。持 6–9 点（${hcp} HCP）应叫 1NT。`,
    },
  };
}

/**
 * Generate a response drill problem.
 */
export function generateResponseDrillHand(
  partnerBid?: PartnerOpeningBid,
  rng: () => number = Math.random
): { hand: Card[]; evaluation: ResponseEvaluation } {
  const options: PartnerOpeningBid[] = ['1NT', '1S', '1H', '1D', '1C'];
  const activePartner = partnerBid ?? options[Math.floor(rng() * options.length)]!;
  const hand = dealRandomHand(rng);
  const evaluation = evaluateResponse(hand, activePartner);
  return { hand, evaluation };
}

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

// -------------------------------------------------------------
// ACBL Class 10: Overcalling & Advancing ("10-5-2" Rule)
// -------------------------------------------------------------

export type OpponentOpeningBid = '1C' | '1D' | '1H' | '1S';

export interface OvercallEvaluation {
  oppBid: OpponentOpeningBid;
  hcp: number;
  recommendedBid: string; // 'Pass' | '1D' | '1H' | '1S' | '1NT' | 'Dbl' | '2C' | '2D' | '2H' | '2S'
  ruleId: string;
  is10_5_2: boolean;
  explanation: { en: string; zh: string };
  mnemonic: { en: string; zh: string };
  breakdown: {
    pointsOk: boolean;
    lengthOk: boolean;
    honorsOk: boolean;
    suit: Suit | null;
  };
}

const SUIT_RANK_ORDER: Record<Suit, number> = {
  C: 1,
  D: 2,
  H: 3,
  S: 4,
};

function hasStopperInSuit(hand: Card[], suit: Suit): boolean {
  const cards = hand.filter(c => c.suit === suit);
  const len = cards.length;
  if (len === 0) return false;
  const ranks = new Set(cards.map(c => c.rank));
  if (ranks.has(14)) return true;
  if (ranks.has(13) && len >= 2) return true;
  if (ranks.has(12) && len >= 3) return true;
  if (ranks.has(11) && len >= 4) return true;
  return false;
}

function countSuitHonors(hand: Card[], suit: Suit): { top3: number; top5: number } {
  const cards = hand.filter(c => c.suit === suit);
  const ranks = new Set(cards.map(c => c.rank));
  let top3 = 0;
  if (ranks.has(14)) top3++;
  if (ranks.has(13)) top3++;
  if (ranks.has(12)) top3++;
  let top5 = top3;
  if (ranks.has(11)) top5++;
  if (ranks.has(10)) top5++;
  return { top3, top5 };
}

/**
 * Evaluate competitive overcall decision based strictly on ACBL Class 10 ("10-5-2" rule).
 */
export function evaluateOvercall(
  hand: Card[],
  oppBid: OpponentOpeningBid
): OvercallEvaluation {
  const hcp = calculateHcp(hand);
  const suitLengths = getSuitLengths(hand);
  const oppSuit = oppBid[1] as Suit;
  const oppSuitRank = SUIT_RANK_ORDER[oppSuit];

  // 1. 1NT Overcall (15–17 HCP, Balanced, with stopper in opponent's suit)
  if (hcp >= 15 && hcp <= 17 && isBalancedHand(suitLengths) && hasStopperInSuit(hand, oppSuit)) {
    return {
      oppBid,
      hcp,
      recommendedBid: '1NT',
      ruleId: 'overcall_1nt',
      is10_5_2: false,
      explanation: {
        en: `Holding 15–17 HCP (${hcp} HCP) with a balanced hand and at least one stopper in opponent's ${oppSuit} suit. Bid 1NT Overcall.`,
        zh: `手握 15–17 大牌点（本手 ${hcp} 点），牌型均型，且在敌方 ${oppSuit} 花色中持有止张。应当进行 1NT 争叫。`,
      },
      mnemonic: {
        en: '1NT Overcall = 15–17 HCP, Balanced with Opponent Stopper',
        zh: '1NT 争叫口诀：15-17点均型，敌花有止张',
      },
      breakdown: {
        pointsOk: true,
        lengthOk: true,
        honorsOk: true,
        suit: null,
      },
    };
  }

  // 2. Takeout Double (12+ HCP, shortness in opponent's suit <= 2, 3+ in all unbid suits)
  const unbidSuits = (['S', 'H', 'D', 'C'] as Suit[]).filter(s => s !== oppSuit);
  const hasSupportForAllUnbid = unbidSuits.every(s => suitLengths[s] >= 3);
  if (hcp >= 12 && suitLengths[oppSuit] <= 2 && hasSupportForAllUnbid) {
    return {
      oppBid,
      hcp,
      recommendedBid: 'Dbl',
      ruleId: 'overcall_takeout_double',
      is10_5_2: false,
      explanation: {
        en: `With 12+ HCP (${hcp} HCP), shortness in opponent's ${oppSuit} (<= 2 cards), and support (3+ cards) for all unbid suits. Call Takeout Double (Dbl)!`,
        zh: `持有 12+ 大牌点（本手 ${hcp} 点），敌方 ${oppSuit} 短门（<=2张），且对所有未叫花色均有支持（3张以上）。应当叫技术性加倍（Dbl）！`,
      },
      mnemonic: {
        en: 'Takeout Double = 12+ pts, Short Opponent Suit, Support for Other 3 Suits',
        zh: '技术性加倍口诀：12点以上，敌花短，三门未叫均有支持',
      },
      breakdown: {
        pointsOk: true,
        lengthOk: true,
        honorsOk: true,
        suit: null,
      },
    };
  }

  // 3. One-Level Suit Overcall — ACBL "10-5-2" Rule
  // Available suits at 1-level must rank higher than oppSuit
  const oneLevelSuits = (['S', 'H', 'D', 'C'] as Suit[]).filter(
    s => s !== oppSuit && SUIT_RANK_ORDER[s] > oppSuitRank
  );

  // Check 10-5-2 on 1-level suits
  // Sort candidate suits by length desc, then rank desc
  oneLevelSuits.sort((a, b) => suitLengths[b] - suitLengths[a] || SUIT_RANK_ORDER[b] - SUIT_RANK_ORDER[a]);

  for (const s of oneLevelSuits) {
    const len = suitLengths[s];
    const honors = countSuitHonors(hand, s);
    const pointsOk = hcp >= 10 && hcp <= 17;
    const lengthOk = len >= 5;
    const honorsOk = honors.top5 >= 2;

    if (pointsOk && lengthOk && honorsOk) {
      return {
        oppBid,
        hcp,
        recommendedBid: `1${s}`,
        ruleId: 'overcall_10_5_2',
        is10_5_2: true,
        explanation: {
          en: `Meets ACBL "10-5-2" rule: 10+ HCP (${hcp} HCP), 5+ cards in ${s} (${len} cards), and 2+ honors in top 5. Overcall 1${s}!`,
          zh: `完全符合 ACBL "10-5-2" 争叫法则：10点以上（本手 ${hcp} 点）、5张以上 ${s}（${len}张）、且包含2张前5大牌。争叫 1${s}！`,
        },
        mnemonic: {
          en: 'ACBL 10-5-2 Rule: 10+ Points, 5+ Suit Length, 2 Honors in Top 5',
          zh: 'ACBL 10-5-2 争叫口诀：10点以上、5张套、2张大牌',
        },
        breakdown: {
          pointsOk: true,
          lengthOk: true,
          honorsOk: true,
          suit: s,
        },
      };
    }
  }

  // 4. Two-Level Weak Jump Overcall (6–10 HCP, 6 cards with 2 top honors)
  if (hcp >= 6 && hcp <= 10) {
    for (const s of (['S', 'H'] as Suit[])) {
      if (s === oppSuit) continue;
      const len = suitLengths[s];
      const honors = countSuitHonors(hand, s);
      if (len === 6 && honors.top3 >= 2) {
        return {
          oppBid,
          hcp,
          recommendedBid: `2${s}`,
          ruleId: 'overcall_weak_two',
          is10_5_2: false,
          explanation: {
            en: `With 6–10 HCP (${hcp} HCP) and a good 6-card ${s} suit (2 of top 3 honors). Jump overcall 2${s} (Weak Two / Preemptive)!`,
            zh: `手握 6–10 大牌点（本手 ${hcp} 点）与优质6张 ${s} 套（含2张前三大牌）。跳争叫 2${s}（弱二阻击争叫）！`,
          },
          mnemonic: {
            en: 'Weak Two Overcall = 6–10 HCP, 6-Card Suit, Preemptive Jump',
            zh: '弱二争叫口诀：6-10点，6张好套，跳叫阻击',
          },
          breakdown: {
            pointsOk: true,
            lengthOk: true,
            honorsOk: true,
            suit: s,
          },
        };
      }
    }
  }

  // 5. Two-Level Suit Overcall (12+ HCP, 5+ good suit that ranks lower than oppSuit)
  if (hcp >= 12) {
    const twoLevelSuits = (['S', 'H', 'D', 'C'] as Suit[]).filter(
      s => s !== oppSuit && SUIT_RANK_ORDER[s] < oppSuitRank
    );
    twoLevelSuits.sort((a, b) => suitLengths[b] - suitLengths[a]);
    for (const s of twoLevelSuits) {
      const len = suitLengths[s];
      const honors = countSuitHonors(hand, s);
      if (len >= 5 && honors.top5 >= 2) {
        return {
          oppBid,
          hcp,
          recommendedBid: `2${s}`,
          ruleId: 'overcall_two_level',
          is10_5_2: false,
          explanation: {
            en: `To overcall at the 2-level without jumping requires 12+ HCP (${hcp} HCP) and a good 5+ card suit (${s}). Overcall 2${s}.`,
            zh: `在2阶非跳叫争叫需要 12+ 大牌点（本手 ${hcp} 点）与优质5张以上套（${s}）。争叫 2${s}。`,
          },
          mnemonic: {
            en: '2-Level Overcall = 12+ HCP, 5+ Quality Suit',
            zh: '2阶争叫口诀：2阶需12点，5张优质套',
          },
          breakdown: {
            pointsOk: true,
            lengthOk: true,
            honorsOk: true,
            suit: s,
          },
        };
      }
    }
  }

  // 6. Pass
  // Diagnose why not 10-5-2
  const bestSuit = (['S', 'H', 'D', 'C'] as Suit[])
    .filter(s => s !== oppSuit)
    .sort((a, b) => suitLengths[b] - suitLengths[a])[0]!;
  const bestLen = suitLengths[bestSuit];
  const bestHonors = countSuitHonors(hand, bestSuit);

  const pointsOk = hcp >= 10;
  const lengthOk = bestLen >= 5;
  const honorsOk = bestHonors.top5 >= 2;

  let reasonEn = `Insufficient values to overcall (${hcp} HCP).`;
  let reasonZh = `点力不足以争叫（本手仅 ${hcp} 点）。`;

  if (hcp >= 10) {
    if (!lengthOk) {
      reasonEn = `Holding ${hcp} HCP but longest suit is only ${bestLen} cards (needs 5+ for 10-5-2).`;
      reasonZh = `手握 ${hcp} 点但最长套仅 ${bestLen} 张（10-5-2 法则要求至少 5 张）。`;
    } else if (!honorsOk) {
      reasonEn = `Holding ${hcp} HCP and 5+ ${bestSuit}, but lacks 2 honors in the top 5 (fails "2" in 10-5-2).`;
      reasonZh = `手握 ${hcp} 点和 5张 ${bestSuit}，但缺乏前5大牌中的2张（不符合 10-5-2 中的"2"张大牌要求）。`;
    }
  }

  return {
    oppBid,
    hcp,
    recommendedBid: 'Pass',
    ruleId: 'overcall_pass',
    is10_5_2: false,
    explanation: {
      en: `${reasonEn} ACBL Class 10 Rule: Do not enter a competitive auction without a clear plan → Pass.`,
      zh: `${reasonZh} ACBL 第10课准则：没有明确战术理由切勿贸然争叫 → 应当 Pass。`,
    },
    mnemonic: {
      en: 'When in Doubt, Pass (Do not overcall without 10-5-2)',
      zh: '争叫口诀：不合 10-5-2 莫争叫，果断 Pass',
    },
    breakdown: {
      pointsOk,
      lengthOk,
      honorsOk,
      suit: bestSuit,
    },
  };
}

/**
 * Generate an overcall drill problem.
 */
export function generateOvercallDrillHand(
  oppBid?: OpponentOpeningBid,
  rng: () => number = Math.random
): { hand: Card[]; evaluation: OvercallEvaluation } {
  const options: OpponentOpeningBid[] = ['1C', '1D', '1H', '1S'];
  const activeOpp = oppBid ?? options[Math.floor(rng() * options.length)]!;

  for (let attempt = 0; attempt < 50; attempt++) {
    const hand = dealRandomHand(rng);
    const evalResult = evaluateOvercall(hand, activeOpp);
    if (attempt < 20 && evalResult.recommendedBid === 'Pass') {
      continue; // Filter excessive passes for engaging drill experience
    }
    return { hand, evaluation: evalResult };
  }

  const hand = dealRandomHand(rng);
  return { hand, evaluation: evaluateOvercall(hand, activeOpp) };
}
