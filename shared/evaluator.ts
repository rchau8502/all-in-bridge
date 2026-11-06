/**
 * evaluator.ts — Hand evaluation and opening bidding logic.
 *
 * Implements the standard ACBL Series 1 Student Manual (Patty Tucker, 2022)
 * rules for high card points (HCP), length points, distribution/shape,
 * and standard opening bids.
 */

import { buildDeck, shuffle, cardLabel, type Card, type Suit } from './deck.js';
import { Auction, parseBid, type Contract } from './bidding.js';

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

  // First/second/third-seat weak twos precede the ordinary opening threshold.
  // Six-card examples are used in the dedicated drill; 2C remains strong.
  const weakSuit = (['S', 'H', 'D'] as Suit[])
    .filter(s => suitLengths[s] >= 6)
    .sort((a, b) => suitLengths[b] - suitLengths[a])[0];
  if (hcp >= 6 && hcp <= 10 && weakSuit) {
    const symbol = { S: '♠', H: '♥', D: '♦', C: '♣' }[weakSuit];
    return {
      hcp, lengthPoints, totalPoints, suitLengths, shape, isBalanced: balanced,
      recommendedBid: `2${weakSuit}`, ruleId: 'open_weak_two',
      explanation: {
        en: `${hcp} HCP and ${suitLengths[weakSuit]} ${symbol}: a weak 2${symbol} opening in first, second or third seat, 6–10 HCP and a six-card or longer suit. Take opponents' bidding space while showing a long suit; a strong partner may still choose game. Count HCP here, not HCP plus length points. 2♣ is strong, not a weak club opening.`,
        zh: `本手${hcp}大牌点、${suitLengths[weakSuit]}张${symbol}：前三家可以弱二开叫2${symbol}，6–10大牌点、六张以上套。既抢占对手说话空间，也告诉搭档长套的赢墩潜力；强搭档仍可选择进局。这里按大牌点判断，不把长度点加进去跨越弱二范围。2♣是强开叫，不是梅花弱二。`,
      },
      mnemonic: {
        en: 'Seats 1–3: 2♦ / 2♥ / 2♠ = 6–10 HCP, 6+ cards. Fourth seat instead uses 9–12 and a good 6+ suit.',
        zh: '前三家2♦／2♥／2♠：6–10大牌点、六张以上；第四家另用9–12点、六张以上好套。',
      },
    };
  }
  // 1. Pass with fewer than 12 points and no weak-two opening.
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
        en: `Fewer than 12 points (${hcp} HCP + ${lengthPoints} length = ${totalPoints} total) and no qualifying weak two in diamonds, hearts or spades. Pass. Weak clubs do not open 2♣: that is strong.`,
        zh: `总点力不足12点（${hcp}大牌点＋${lengthPoints}长度点＝${totalPoints}总点），也不符合方块、红桃或黑桃弱二开叫条件，选择Pass。梅花弱牌不能开2♣，那是强开叫。`,
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
        en: `Massive hand with ${totalPoints} points (${hcp} HCP). Open 2♣: artificial and strong, requiring a reply but not automatically game forcing.`,
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
export type DrillCategory = 'all' | 'pass' | '1nt' | 'major' | 'minor' | 'strong' | 'weak-two';

export type PartnerOpeningBid = '1NT' | '1S' | '1H' | '1D' | '1C';

/** Uncontested first response: partner opens, right-hand opponent passes. */
export function isLegalDrillResponse(partnerBid: PartnerOpeningBid, response: string): boolean {
  const auction = new Auction('N');
  auction.apply(parseBid(partnerBid));
  auction.apply(parseBid('P'));
  return auction.isLegal(parseBid(response));
}

/** Direct action after the opponent opens; doubling is allowed here. */
export function isLegalDrillOvercall(oppBid: OpponentOpeningBid, call: string): boolean {
  const auction = new Auction('N');
  auction.apply(parseBid(oppBid));
  return auction.isLegal(parseBid(call));
}

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
 * Evaluate the first response under the site's natural 2/1 course agreement.
 */
export function evaluateResponse(hand: Card[], partnerBid: PartnerOpeningBid): ResponseEvaluation {
  const hcp = calculateHcp(hand);
  const suitLengths = getSuitLengths(hand);

  // -------------------------------------------------------------
  // 1. Partner Opened 1NT (15–17 HCP, Balanced) — ACBL Class 7
  // -------------------------------------------------------------
  if (partnerBid === '1NT') {
    // Choose the route to a major fit before the natural NT point ladder.
    const fiveFour = (suitLengths.H === 5 && suitLengths.S === 4)
      || (suitLengths.S === 5 && suitLengths.H === 4);
    const hasFourCardMajor = suitLengths.S === 4 || suitLengths.H === 4;
    if (hcp >= 8 && hasFourCardMajor && (fiveFour || Math.max(suitLengths.S, suitLengths.H) === 4)) {
      return {
        partnerBid, hcp, supportPoints: 0, totalPoints: hcp,
        supportLength: 0, hasGoldenFit: false,
        recommendedBid: '2C', ruleId: 'resp_1nt_stayman',
        trafficLight: hcp <= 9 ? 'invite' : 'go',
        explanation: {
          en: `With ${hcp} HCP and a four-card major, start with 2♣ Stayman, forcing one round. Ask for a four-card major before choosing notrump. A club suit does not change the meaning of 2♣; it is an inquiry. Then use strength to invite or choose game.`,
          zh: `本手${hcp}大牌点，有四张高花，先叫2♣斯台曼，逼叫一轮，询问搭档是否有四张高花。先找高花配合，再决定是否打无将；即使自己有梅花长套，这里的2♣仍是问叫。搭档答叫后，再按实力邀请或选择成局。`,
        },
        mnemonic: { en: '8+ HCP and a four-card major: Stayman before natural NT.', zh: '8点以上有四张高花：先斯台曼，再定高度与方向。' },
      };
    }
    if (suitLengths.H >= 5 || suitLengths.S >= 5) {
      const hearts = suitLengths.H > suitLengths.S;
      const target = hearts ? '♥' : '♠';
      return {
        partnerBid, hcp, supportPoints: 0, totalPoints: hcp,
        supportLength: 0, hasGoldenFit: false,
        recommendedBid: hearts ? '2D' : '2H', ruleId: 'resp_1nt_transfer',
        trafficLight: hcp <= 7 ? 'stop' : hcp <= 9 ? 'invite' : 'go',
        explanation: {
          en: `Show your five-card or longer major with ${hearts ? '2♦' : '2♥'}, asking opener to bid 2${target}. The transfer is forcing one round and does not promise game strength. Opener can declare the major; after completion, pass with a weak hand or describe invitational or game-going strength.`,
          zh: `有五张以上${hearts ? '红桃' : '黑桃'}，先叫${hearts ? '2♦' : '2♥'}转移，要求开叫者叫2${target}。转移逼叫一轮，不保证成局实力，让强无将开叫手有机会坐庄。完成转移后，弱牌可Pass；邀请或成局实力则继续描述。`,
        },
      };
    }
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
          en: `With ${hcp} HCP, no five-card major to transfer and insufficient strength for ordinary Stayman, pass. At most 17+7=24 HCP, below the usual 25-point game guideline.`,
          zh: `本手${hcp}大牌点，没有五张高花可转移，也不够普通斯台曼的实力，选择Pass。联手最多17+7=24点，低于通常25点的成局参考线。`,
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
          en: `With ${hcp} HCP and no major to investigate, invite with 2NT. Opener normally declines with 15, accepts with 17, and judges with 16. Invitation is non-forcing.`,
          zh: `本手${hcp}大牌点，没有还需寻找的高花配合，应叫2NT邀请，不逼叫。开叫者通常15点拒绝、17点接受，16点结合牌质判断。`,
        },
        mnemonic: {
          en: '1NT Response Traffic Light: 8-9 Invite (2NT)',
          zh: '1NT 应叫红绿灯口诀：8-9 点黄灯邀叫（2NT）',
        },
      };
    }

    // Do not turn slam-strength balanced responses into a game sign-off.
    if (hcp >= 16) {
      const bid = hcp <= 17 ? '4NT' : hcp <= 19 ? '6NT' : hcp <= 21 ? '5NT' : '7NT';
      return {
        partnerBid, hcp, supportPoints: 0, totalPoints: hcp, supportLength: 0, hasGoldenFit: false,
        recommendedBid: bid, ruleId: 'resp_1nt_slam', trafficLight: 'go',
        explanation: {
          en: `${hcp} HCP with no major to investigate: ${bid}. 16–17 invites slam quantitatively with 4NT; 18–19 chooses 6NT; 20–21 uses 5NT to force small slam and invite grand; 22+ chooses 7NT. With no agreed trump suit, these notrump bids are not RKCB. Do not hide slam strength with a 3NT sign-off.`,
          zh: `本手${hcp}大牌点，没有还需寻找的高花配合，选择${bid}。16–17点用4NT示量邀小满贯；18–19点选择6NT；20–21点用5NT逼小满贯、邀大满贯；22点以上选择7NT。尚无约定将牌，这些无将叫品不是关键张问叫。不要用3NT封局掩盖满贯实力。`,
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
        en: `With ${hcp} HCP and no major to investigate, the partnership has at least 25 HCP: choose 3NT. This is a game-going strength guideline, not a guarantee of nine tricks.`,
        zh: `本手${hcp}大牌点，没有还需寻找的高花配合，联手至少25点，选择3NT。这是成局实力的参考，不是必得九墩的保证。`,
      },
      mnemonic: {
        en: '1NT Response Traffic Light: 10+ Go (3NT)',
        zh: '1NT 应叫红绿灯口诀：10 点以上绿灯行（直叫 3NT）',
      },
    };
  }

  // Natural first responses in the site's foundation 2/1 agreement.
  const makeResponse = (bid: string, ruleId: string, en: string, zh: string,
    supportPoints = 0, supportLength = 0, hasGoldenFit = false): ResponseEvaluation => ({
    partnerBid, hcp, supportPoints, totalPoints: hcp + supportPoints,
    supportLength, hasGoldenFit, recommendedBid: bid, ruleId,
    explanation: { en, zh },
  });
  const twoOverOne = (supportLength = 0): ResponseEvaluation => {
    const suit = partnerBid === '1S' && suitLengths.H >= 5 ? 'H'
      : suitLengths.D > suitLengths.C && suitLengths.D >= 4 ? 'D' : 'C';
    const symbol = { H: '♥', D: '♦', C: '♣' }[suit];
    return makeResponse(`2${suit}`, 'resp_major_two_over_one',
      `${hcp} HCP: respond 2${symbol}, a two-over-one game force. Describe your suit economically; partner must continue below game. Keep room to find the best game and explore slam rather than signing off immediately.`,
      `本手${hcp}大牌点，先应叫2${symbol}，二盖一逼局。经济地描述花色，搭档在局以下不能Pass；保留寻找最佳成局与探索满贯的空间，不要过早封局。`,
      0, supportLength, supportLength >= 3);
  };

  if (partnerBid === '1S' || partnerBid === '1H') {
    const trump: Suit = partnerBid === '1S' ? 'S' : 'H';
    const support = suitLengths[trump];
    const dummy = support >= 3 ? calculateDummyPoints(suitLengths, trump) : 0;
    const points = hcp + dummy;
    if (points < 6) return makeResponse('Pass', 'resp_major_sub_6',
      `${points} points: too weak to respond to this major opening. Pass.`,
      `本手${points}点，实力不足，面对高花开叫选择Pass。`, dummy, support, support >= 3);
    if (support >= 3 && points <= 9) return makeResponse(`2${trump}`, 'resp_major_raise_2',
      `${support}-card support and ${points} support points: a simple raise, 6–9, non-forcing.`,
      `${support}张支持、${points}支持点：简单加叫到二阶，6–9点，不逼叫。`, dummy, support, true);
    if (support >= 4 && points <= 12) return makeResponse(`3${trump}`, 'resp_major_raise_3',
      `${support}-card support and ${points} support points: a natural 10–12 invitation. This is the foundation route.`,
      `${support}张支持、${points}支持点：基础直接加到三阶为自然邀请，10–12点，至少四张支持。`, dummy, support, true);
    if (support >= 4 && points >= 13) return makeResponse('2NT', 'resp_major_jacoby',
      `${support}-card support and ${points} support points: Jacoby 2NT, game forcing with no upper limit. Let opener describe the hand and preserve slam space.`,
      `${support}张支持、${points}支持点：雅各比2NT，四张以上支持、逼局、没有上限。让开叫者继续描述，保留满贯空间。`, dummy, support, true);
    if (partnerBid === '1H' && suitLengths.S >= 4) return makeResponse('1S', 'resp_1h_bid_1s',
      `${hcp} HCP and ${suitLengths.S} spades: 1♠ shows at least four spades and is forcing one round, with no upper limit.`,
      `本手${hcp}大牌点、${suitLengths.S}张黑桃：1♠表示四张以上，没上限，逼叫一轮；强牌也可以先经济地说话。`);
    if (hcp >= 13) return twoOverOne(support);
    return makeResponse('1NT', 'resp_major_semi_1nt',
      `${hcp} HCP: semi-forcing 1NT, about 5–12. This hand has not promised game and may still have a suit or three-card invitational support to describe. It does not promise balance; opener normally helps keep the conversation open.`,
      `本手${hcp}大牌点：半逼叫1NT，约5–12点，暂未承诺成局，可能还有长套或三张邀请支持没说完。不保证均型，开叫者通常应帮助维持对话。`, dummy, support, support >= 3);
  }

  const minor: Suit = partnerBid === '1C' ? 'C' : 'D';
  const support = suitLengths[minor];
  if (hcp + calculateLengthPoints(suitLengths) < 6) return makeResponse('Pass', 'resp_minor_sub_6',
    `${hcp} HCP: insufficient strength for a normal response. Pass.`,
    `本手${hcp}大牌点，实力不足以正常应叫，选择Pass。`);
  if (suitLengths.H >= 4 || suitLengths.S >= 4) {
    const spadesFirst = suitLengths.S > suitLengths.H || (suitLengths.S === suitLengths.H && suitLengths.S >= 5);
    const bid = spadesFirst ? '1S' : '1H';
    const bothFour = suitLengths.H === 4 && suitLengths.S === 4;
    const result = makeResponse(bid, bothFour ? 'resp_minor_four_on_floor' : `resp_minor_${bid.toLowerCase()}`,
      `${hcp} HCP: show the ${spadesFirst ? 'spade' : 'heart'} suit first. This one-level new suit has no upper limit and forces one round. With two four-card majors, bid hearts first; with 5–5, bid spades first.`,
      `本手${hcp}大牌点，先应叫${spadesFirst ? '1♠' : '1♥'}寻找高花配合。一阶新花没有上限，逼叫一轮；双四张高花先红桃，双五张先黑桃。`);
    if (bothFour) result.mnemonic = { en: 'Four on the Floor: With two 4-card majors, bid 1♥ first', zh: '双四张高花，先应叫1♥。' };
    return result;
  }
  if (support >= 5 && hcp >= 11) return makeResponse(`2${minor}`, 'resp_minor_inverted',
    `${hcp} HCP and ${support}-card support: an inverted minor raise, forcing one round, not automatically game forcing. Partner prioritizes stoppers while looking for 3NT.`,
    `本手${hcp}大牌点、${support}张低花支持：低花反加叫，11点以上、五张以上支持，逼叫一轮，不自动逼局。搭档优先展示挡张，仍以寻找3NT为重要方向。`, 0, support);
  if (partnerBid === '1C' && suitLengths.D >= 4) return makeResponse('1D', 'resp_minor_1d',
    `${hcp} HCP and ${suitLengths.D} diamonds: 1♦ is natural, unlimited and forcing one round. A strong hand can start economically and continue later.`,
    `本手${hcp}大牌点、${suitLengths.D}张方块：1♦自然应叫，没上限，逼叫一轮。强牌也先经济地描述，再继续说明。`);
  if (hcp >= 13 && partnerBid === '1D' && suitLengths.C >= 4) return makeResponse('2C', 'resp_minor_two_clubs',
    `${hcp} HCP and ${suitLengths.C} clubs: 1♦–2♣ is a natural two-over-one game force. Partner must continue below game. Neither the limited 1NT response nor a premature 3NT sign-off describes this strong hand; leave room to investigate slam.`,
    `本手${hcp}大牌点、${suitLengths.C}张梅花：对1♦先叫2♣，自然二盖一逼局。搭档在局以下不能Pass；不能套用有限的1NT，强牌也不宜过早用3NT封局，以免漏贯。`);
  // CCBA permits four-card minor support in a genuinely game-forcing raise.
  if (hcp >= 16 && support >= 4) return makeResponse(`2${minor}`, 'resp_minor_strong_support',
    `${hcp} HCP and four-card minor support: a strong inverted raise. In the CCBA game-forcing branch four-card support is sufficient; this is not the ordinary 11+ invitational raise, which needs five. Keep describing stoppers and possible slam strength.`,
    `本手${hcp}大牌点、四张低花支持：强牌先反加叫逼叫。按CCBA，逼局实力的反加叫可仅有四张支持；这与普通11点以上邀请范围需五张支持不同。继续交流挡张与满贯可能，不能错放进有限1NT。`, 0, support);
  if (support >= 5 && hcp <= 10) return makeResponse(`3${minor}`, 'resp_minor_weak_raise',
    `${hcp} HCP and ${support}-card support: a weak preemptive raise to three, not an invitation.`,
    `本手${hcp}大牌点、${support}张支持：弱牌跳加叫三阶，阻击性，不是邀请。`, 0, support);
  if (hcp >= 13) return makeResponse('3NT', 'resp_minor_game_nt',
    `${hcp} HCP, no major to show or stronger forcing route: choose natural 3NT with a balanced hand and side-suit stoppers.`,
    `本手${hcp}大牌点，没有高花可报；在均型、边花有挡张且没有更合适的强牌逼叫路线时，选择自然3NT。`);
  if (hcp >= 11) return makeResponse('2NT', 'resp_minor_invite_nt',
    `${hcp} HCP, no major to show: natural 2NT, an 11–12 invitation, non-forcing.`,
    `本手${hcp}大牌点，没有高花可报：自然2NT，11–12点邀请，不逼叫。`);
  return makeResponse('1NT', 'resp_minor_1nt',
    `${hcp} HCP, no four-card major or economical suit response: natural 1NT, 6–10 HCP, non-forcing.`,
    `本手${hcp}大牌点，没有四张高花或经济的花色应叫：自然1NT，6–10点，不逼叫。`);
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
  if (category === 'weak-two') {
    // Construct six-card candidates so targeted practice never falls back to
    // an unrelated random opening after exhausting a rejection loop.
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const suit = (['D', 'H', 'S'] as const)[Math.floor(rng() * 3)]!;
      const deck = buildDeck();
      const hand = [
        ...shuffle(deck.filter(c => c.suit === suit), rng).slice(0, 6),
        ...shuffle(deck.filter(c => c.suit !== suit), rng).slice(0, 7),
      ];
      const evaluation = evaluateHand(hand);
      if (evaluation.ruleId === 'open_weak_two' && Object.values(evaluation.suitLengths).every(n => n <= 6)) return { hand, evaluation };
    }
    const hand = buildDeck().filter(c => ({
      S: [12, 11, 10, 9, 8, 7], H: [14, 8, 3], D: [11, 7], C: [8, 2],
    })[c.suit].includes(c.rank));
    return { hand, evaluation: evaluateHand(hand) };
  }
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
// Competitive bidding under the course agreement.
// -------------------------------------------------------------

export type OpponentOpeningBid = '1C' | '1D' | '1H' | '1S';

export interface OvercallEvaluation {
  oppBid: OpponentOpeningBid;
  hcp: number;
  recommendedBid: string; // 'Pass' | '1D' | '1H' | '1S' | '1NT' | 'Dbl' | '2C' | '2D' | '2H' | '2S'
  ruleId: string;
  isSuitOvercall: boolean;
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

/** Competitive entry under the course agreement, not a universal honor-count rule. */
export function evaluateOvercall(hand: Card[], oppBid: OpponentOpeningBid): OvercallEvaluation {
  const hcp = calculateHcp(hand);
  const lengths = getSuitLengths(hand);
  const enemy = oppBid[1] as Suit;
  const suits = (['S', 'H', 'D', 'C'] as Suit[]).filter(s => s !== enemy)
    .sort((a, b) => lengths[b] - lengths[a] || SUIT_RANK_ORDER[b] - SUIT_RANK_ORDER[a]);
  const quality = (s: Suit) => {
    const honors = countSuitHonors(hand, s);
    return honors.top3 >= 1 || honors.top5 >= 2;
  };
  const result = (bid: string, ruleId: string, en: string, zh: string,
    suit: Suit | null = null, threshold = 8): OvercallEvaluation => ({
    oppBid, hcp, recommendedBid: bid, ruleId,
    isSuitOvercall: suit !== null && bid !== 'Pass',
    explanation: { en, zh },
    mnemonic: {
      en: 'Natural overcalls: 8+ at one, 11+ at two, with a good 5+ suit. One-level takeout double: 12+ and suitable shape. About 3 more points per extra level is a guide, not a rule for preemptive jumps.',
      zh: '自然不跳争叫：一阶8点起、二阶11点起，要有好五张套；一阶技术性加倍12点起且牌型合适。每抬一阶约多需3点是参考，不套用于弱跳阻击。',
    },
    breakdown: {
      pointsOk: hcp >= threshold,
      lengthOk: suit === null || lengths[suit] >= 5,
      honorsOk: suit === null || quality(suit),
      suit,
    },
  });
  if (hcp >= 15 && hcp <= 18 && isBalancedHand(lengths) && hasStopperInSuit(hand, enemy)) {
    return result('1NT', 'overcall_1nt',
      `${hcp} HCP, balanced, with a stopper in the opened suit: a 15–18 1NT overcall.`,
      `本手${hcp}大牌点，均型，敌方花色有挡张：1NT争叫，15–18点。`, null, 15);
  }
  if (hcp >= 19 && isBalancedHand(lengths)) {
    return result('Dbl', 'overcall_strong_balanced',
      `${hcp} HCP, balanced: start with a strong double rather than understating the hand with 1NT. A later notrump rebid needs a stopper in their suit.`,
      `本手${hcp}大牌点、均型：先用强牌加倍保留后续，不能低报成15–18点的1NT。之后若再叫无将，仍需敌方花色有挡张。`, null, 19);
  }
  if (hcp >= 17 && suits.some(s => lengths[s] >= 5 && quality(s))) {
    return result('Dbl', 'overcall_strong_double',
      `${hcp} HCP with a strong suit: too strong for the normal 8–16 or 11–16 overcall range. Double first, then name the suit to show extra strength; this strong-hand exception does not promise support for every unbid suit.`,
      `本手${hcp}大牌点，有强长套，超出普通一阶8–16、二阶11–16的争叫范围。先加倍，再出套表示额外实力；这种强牌例外不保证所有未叫花色都有支持。`, null, 17);
  }
  // A two-level jump is possible only when this suit could be bid at one.
  const weakJump = suits.find(s => SUIT_RANK_ORDER[s] > SUIT_RANK_ORDER[enemy]
    && lengths[s] >= 6 && countSuitHonors(hand, s).top3 >= 2);
  if (hcp >= 6 && hcp <= 10 && weakJump) {
    return result(`2${weakJump}`, 'overcall_weak_two',
      `${hcp} HCP and a good six-card or longer suit: a weak jump overcall. The 11-point minimum applies to a non-jump two-level overcall, not this preempt.`,
      `本手${hcp}大牌点、六张以上好套：弱跳争叫，阻击性。二阶11点起说的是不跳争叫，不是这种弱跳阻击。`, weakJump, 6);
  }
  const natural = suits.find(s => lengths[s] >= 5 && quality(s)
    && hcp >= (SUIT_RANK_ORDER[s] > SUIT_RANK_ORDER[enemy] ? 8 : 11) && hcp <= 16);
  if (natural) {
    const level = SUIT_RANK_ORDER[natural] > SUIT_RANK_ORDER[enemy] ? 1 : 2;
    const minimum = level === 1 ? 8 : 11;
    return result(`${level}${natural}`, level === 1 ? 'overcall_one_level' : 'overcall_two_level',
      `${hcp} HCP and ${lengths[natural]} cards in a useful suit: a natural non-jump ${level}-level overcall, starting at ${minimum} HCP. Evaluate suit quality and vulnerability; no fixed two-honor count is a universal requirement.`,
      `本手${hcp}大牌点、${lengths[natural]}张有质量的长套：自然不跳${level}阶争叫，${minimum}点起。还要结合套质与局况，不把固定两张大牌作为所有争叫的统一门槛。`, natural, minimum);
  }
  if (hcp >= 12 && lengths[enemy] <= 2 && suits.every(s => lengths[s] >= 3)) {
    return result('Dbl', 'overcall_takeout_double',
      `${hcp} HCP, shortness in the opened suit and support for all unbid suits: a one-level takeout double, 12+. Points alone are not enough; partner needs playable alternatives.`,
      `本手${hcp}大牌点，敌花短，未叫三门均有支持：一阶技术性加倍，12点以上。不能只看点数，还要有适合搭档选择的牌型。`, null, 12);
  }
  const best = suits[0]!;
  const minimum = SUIT_RANK_ORDER[best] > SUIT_RANK_ORDER[enemy] ? 8 : 11;
  return result('Pass', 'overcall_pass',
    `${hcp} HCP: no suitable natural overcall or takeout double. One-level suit entry needs 8+, two-level non-jump entry 11+, each with a good five-card or longer suit. A normal double needs 12+ and support for the unbid suits. Pass.`,
    `本手${hcp}大牌点，没有合适的自然争叫或技术性加倍。一阶争叫8点起、二阶不跳争叫11点起，均需好五张以上套；普通技术性加倍12点起并支持未叫花色。选择Pass。`, best, minimum);
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

// -------------------------------------------------------------
// ACBL Class 8 & 10: Opening Lead Rules (Patty Tucker Series 1)
// -------------------------------------------------------------

export interface OpeningLeadEvaluation {
  contract: Contract;
  partnerSuit?: Suit | null | undefined;
  recommendedCard: Card;
  ruleId: string;
  ruleName: { en: string; zh: string };
  explanation: { en: string; zh: string };
  mnemonic: { en: string; zh: string };
}

/**
 * Evaluates the correct ACBL opening lead card for a defender's hand.
 */
export function evaluateOpeningLead(
  hand: Card[],
  contract: Contract,
  partnerSuit?: Suit | null
): OpeningLeadEvaluation {
  const isNoTrump = contract.denom === 'NT';
  const trump = isNoTrump ? null : (contract.denom as Suit);
  const suits: Suit[] = ['S', 'H', 'D', 'C'];

  // 1. Partner's Bid Suit
  if (partnerSuit && hand.some(c => c.suit === partnerSuit)) {
    const pCards = hand.filter(c => c.suit === partnerSuit).sort((a, b) => b.rank - a.rank);
    if (pCards.length === 2) {
      const leadCard = pCards[0]!;
      return {
        contract,
        partnerSuit,
        recommendedCard: leadCard,
        ruleId: 'lead_partner_doubleton',
        ruleName: { en: 'Top of Doubleton', zh: '同伴双张出大牌' },
        explanation: {
          en: `Holding two cards in partner's suit (${cardLabel(pCards[0]!)}-${cardLabel(pCards[1]!)}), lead HIGH to unblock and show count. Lead ${cardLabel(leadCard)}!`,
          zh: `持有同伴花色的双张牌（${cardLabel(pCards[0]!)}-${cardLabel(pCards[1]!)}），应当出顶张（大牌）解封，帮助同伴辨识张数。首攻 ${cardLabel(leadCard)}！`,
        },
        mnemonic: {
          en: 'Lead Partner’s Suit: High from Doubleton',
          zh: '首攻同伴套口诀：双张出大牌',
        },
      };
    } else if (pCards.length >= 3) {
      const ranks = pCards.map(c => c.rank);
      if (ranks[0]! - ranks[1]! === 1 && ranks[0]! >= 11) {
        const leadCard = pCards[0]!;
        return {
          contract,
          partnerSuit,
          recommendedCard: leadCard,
          ruleId: 'lead_partner_touching_honors',
          ruleName: { en: 'Top of Touching Honors in Partner’s Suit', zh: '同伴花色连张出顶张' },
          explanation: {
            en: `Holding touching honors in partner's suit, lead the top of the sequence (${cardLabel(leadCard)})!`,
            zh: `在同伴叫过的花色中持有连张大牌，首攻连张顶张（${cardLabel(leadCard)}）！`,
          },
          mnemonic: {
            en: 'Top of Touching Honors in Partner’s Suit',
            zh: '首攻同伴套连张出顶张',
          },
        };
      }
      const leadCard = pCards[pCards.length - 1]!;
      return {
        contract,
        partnerSuit,
        recommendedCard: leadCard,
        ruleId: 'lead_partner_low',
        ruleName: { en: 'Low from Length in Partner’s Suit', zh: '同伴长套出小牌' },
        explanation: {
          en: `Holding 3 or more cards in partner's suit without touching honors, lead LOW (Boston Rule: Bottom of Something). Lead ${cardLabel(leadCard)}!`,
          zh: `持有同伴花色3张以上且无连张大牌，出小牌（波士顿首攻原则：有货出小）。首攻 ${cardLabel(leadCard)}！`,
        },
        mnemonic: {
          en: 'Boston Rule: Bottom of Something, Top of Nothing',
          zh: '波士顿首攻口诀：有货出小，无货出大',
        },
      };
    }
  }

  // 2. Against No-Trump Contracts
  if (isNoTrump) {
    const suitGroups = suits.map(s => {
      const cards = hand.filter(c => c.suit === s).sort((a, b) => b.rank - a.rank);
      const hcp = calculateHcp(cards);
      return { suit: s, cards, len: cards.length, hcp };
    }).sort((a, b) => b.len - a.len || b.hcp - a.hcp);

    for (const g of suitGroups) {
      if (g.len >= 4) {
        const ranks = g.cards.map(c => c.rank);
        const isSequence = (ranks[0]! - ranks[1]! === 1 && (ranks[2] !== undefined && ranks[1]! - ranks[2]! === 1) && ranks[0]! >= 10) ||
                           (ranks[0]! - ranks[1]! === 1 && ranks[0]! >= 12);
        if (isSequence && ranks[0]! >= 11) {
          const leadCard = g.cards[0]!;
          return {
            contract,
            partnerSuit,
            recommendedCard: leadCard,
            ruleId: 'lead_nt_top_sequence',
            ruleName: { en: 'Top of Sequence in Long Suit', zh: '长套连张出顶张' },
            explanation: {
              en: `Against No-Trump, holding touching honors in your 4+ card ${g.suit} suit, lead the TOP honor (${cardLabel(leadCard)}) to establish winners!`,
              zh: `针对无将定约，在你的4张以上 ${g.suit} 长套中持有连张大牌，首攻顶张（${cardLabel(leadCard)}）来树立赢墩！`,
            },
            mnemonic: {
              en: 'Top of Touching Honors in 4+ Card Suit',
              zh: '长套连张首攻出顶张',
            },
          };
        }
      }
    }

    const longSuit = suitGroups.find(g => g.len >= 4 && g.hcp >= 1) ?? suitGroups[0]!;
    if (longSuit.len >= 4) {
      const leadCard = longSuit.cards[3]!;
      return {
        contract,
        partnerSuit,
        recommendedCard: leadCard,
        ruleId: 'lead_nt_fourth_best',
        ruleName: { en: 'Fourth-Best from Longest and Strongest', zh: '长四首攻（第四大牌）' },
        explanation: {
          en: `Against No-Trump, lead your fourth-highest card from your longest and strongest suit (${cardLabel(leadCard)}). Partner uses the Rule of Eleven to deduce card placements!`,
          zh: `针对无将定约，从最长最强的花色中打出第四大牌（${cardLabel(leadCard)}）。同伴可通过“十一法则”迅速推演全场大牌分布！`,
        },
        mnemonic: {
          en: 'Fourth-Best from Longest and Strongest (Rule of 11)',
          zh: '无将首攻口诀：最长最强打长四，十一法则助同伴',
        },
      };
    }

    const leadCard = suitGroups[0]!.cards[0]!;
    return {
      contract,
      partnerSuit,
      recommendedCard: leadCard,
      ruleId: 'lead_nt_top_nothing',
      ruleName: { en: 'Top of Nothing', zh: '无大牌垫张首攻' },
      explanation: {
        en: `Without a clear long suit with honors, lead the top card of a short/unhonored suit (${cardLabel(leadCard)}).`,
        zh: `没有带大牌的长套时，从无大牌的短套中首攻顶张（${cardLabel(leadCard)}）。`,
      },
      mnemonic: {
        en: 'Top of Nothing (Safe Lead)',
        zh: '无货出大，安全第一',
      },
    };
  }

  // 3. Against Suit Contracts
  const sideSuits = suits.filter(s => s !== trump);
  const sideGroups = sideSuits.map(s => {
    const cards = hand.filter(c => c.suit === s).sort((a, b) => b.rank - a.rank);
    const hcp = calculateHcp(cards);
    return { suit: s, cards, len: cards.length, hcp };
  }).sort((a, b) => b.len - a.len || b.hcp - a.hcp);

  for (const g of sideGroups) {
    if (g.cards.some(c => c.rank === 14) && g.cards.some(c => c.rank === 13)) {
      const ace = g.cards.find(c => c.rank === 14)!;
      return {
        contract,
        partnerSuit,
        recommendedCard: ace,
        ruleId: 'lead_suit_ak',
        ruleName: { en: 'Ace from Ace-King', zh: 'AK 套首攻出 A' },
        explanation: {
          en: `Holding both the Ace and King in a side suit (${g.suit}), lead the Ace (${cardLabel(ace)})! It guarantees a trick, sees Dummy, and retains the lead.`,
          zh: `在边花（${g.suit}）中同时持有 A 和 K，首攻打出 A（${cardLabel(ace)}）！确保拿墩、观摩明手并保留引牌权。`,
        },
        mnemonic: {
          en: 'Ace from Ace-King: See Dummy and Keep the Lead',
          zh: 'AK 连张出 A：看明手并保留引牌权',
        },
      };
    }
  }

  for (const g of sideGroups) {
    if (g.len >= 2) {
      const ranks = g.cards.map(c => c.rank);
      if (ranks[0]! - ranks[1]! === 1 && ranks[0]! >= 11 && ranks[0]! < 14) {
        const topCard = g.cards[0]!;
        return {
          contract,
          partnerSuit,
          recommendedCard: topCard,
          ruleId: 'lead_suit_touching_honors',
          ruleName: { en: 'Top of Touching Honors in Side Suit', zh: '边花连张首攻出顶张' },
          explanation: {
            en: `Holding touching honors in a side suit (${cardLabel(g.cards[0]!)}-${cardLabel(g.cards[1]!)}), lead the TOP (${cardLabel(topCard)}) to knock out declarer's higher honors!`,
            zh: `在边花中持有连张大牌（${cardLabel(g.cards[0]!)}-${cardLabel(g.cards[1]!)}），首攻打顶张（${cardLabel(topCard)}）击落庄家更大的大牌！`,
          },
          mnemonic: {
            en: 'Top of Touching Honors (K from KQ, Q from QJ)',
            zh: '连张出顶张：KQ 出 K，QJ 出 Q',
          },
        };
      }
    }
  }

  const trumpCards = hand.filter(c => c.suit === trump);
  if (trumpCards.length >= 2) {
    const singletonGroup = sideGroups.find(g => g.len === 1);
    if (singletonGroup) {
      const singleCard = singletonGroup.cards[0]!;
      return {
        contract,
        partnerSuit,
        recommendedCard: singleCard,
        ruleId: 'lead_suit_singleton',
        ruleName: { en: 'Singleton for Ruffing', zh: '边花单张首攻（谋求将吃）' },
        explanation: {
          en: `Holding a singleton in a side suit (${cardLabel(singleCard)}) and 2+ trumps, lead it immediately! Partner can return the suit for you to ruff.`,
          zh: `持有边花单张（${cardLabel(singleCard)}）且手握 2 张以上将牌，果断首攻单张！同伴进手后回出该花色供你将吃。`,
        },
        mnemonic: {
          en: 'Lead a Singleton to Get a Ruff',
          zh: '单张首攻谋将吃，同伴回出建奇功',
        },
      };
    }
  }

  for (const g of sideGroups) {
    if (g.len >= 4 && !g.cards.some(c => c.rank === 14)) {
      const leadCard = g.cards[3]!;
      return {
        contract,
        partnerSuit,
        recommendedCard: leadCard,
        ruleId: 'lead_suit_fourth_best',
        ruleName: { en: 'Fourth-Best from Safe Long Suit', zh: '安全长套出长四' },
        explanation: {
          en: `Leading fourth-best (${cardLabel(leadCard)}) from your 4-card ${g.suit} suit without an unsupported Ace.`,
          zh: `从不含孤立 A 的 4 张 ${g.suit} 安全长套中首攻第四大牌（${cardLabel(leadCard)}）。`,
        },
        mnemonic: {
          en: 'Never Lead Away from an Unsupported Ace in a Suit Contract',
          zh: '有将定约大忌：绝不从孤立 A 套出小牌',
        },
      };
    }
  }

  const safeGroup = sideGroups.find(g => !g.cards.some(c => c.rank === 14)) ?? sideGroups[0]!;
  const leadCard = safeGroup.cards[safeGroup.cards.length - 1]!;
  return {
    contract,
    partnerSuit,
    recommendedCard: leadCard,
    ruleId: 'lead_suit_safe',
    ruleName: { en: 'Safe Passive Lead', zh: '安全被动首攻' },
    explanation: {
      en: `No aggressive honor sequence or singleton available. Lead a safe low card (${cardLabel(leadCard)}) to avoid giving declarer a free trick.`,
      zh: `缺乏激进连张或单张时，首攻一张安全小牌（${cardLabel(leadCard)}），避免送给庄家免费赢墩。`,
    },
    mnemonic: {
      en: 'When in Doubt, Lead Passive and Safe',
      zh: '局势不明出被动，莫送庄家免费墩',
    },
  };
}

/**
 * Generate an opening lead drill problem.
 */
export function generateOpeningLeadDrillHand(
  contractType: 'NT' | 'suit' = 'NT',
  rng: () => number = Math.random
): { hand: Card[]; evaluation: OpeningLeadEvaluation } {
  const contract: Contract = contractType === 'NT'
    ? { level: 3, denom: 'NT', declarer: 'S', doubled: 0 }
    : { level: 4, denom: rng() > 0.5 ? 'S' : 'H', declarer: 'S', doubled: 0 };

  const hand = dealRandomHand(rng);
  const evaluation = evaluateOpeningLead(hand, contract, null);
  return { hand, evaluation };
}
