/**
 * bidding-explain.ts — Educational explanations for ACBL bids.
 *
 * Provides standard ACBL Series 1 & standard American meanings for all bids
 * so beginners can understand what each bid communicates in the auction.
 */

import type { Bid, Denom } from './bidding.js';

export interface BidExplanation {
  name: { en: string; zh: string };
  meaning: { en: string; zh: string };
  points?: string;
  shape?: string;
  badge?: string;
}

const SUIT_NAME_EN: Record<Denom, string> = {
  C: 'Clubs',
  D: 'Diamonds',
  H: 'Hearts',
  S: 'Spades',
  NT: 'No-Trump',
};

const SUIT_NAME_ZH: Record<Denom, string> = {
  C: '梅花',
  D: '方块',
  H: '红桃',
  S: '黑桃',
  NT: '无将',
};

export function explainBid(bid: Bid): BidExplanation {
  if (bid.type === 'pass') {
    return {
      name: { en: 'Pass', zh: '不叫 (Pass)' },
      meaning: {
        en: 'Insufficient strength to open (0-11 HCP), or willingness to let previous contract stand.',
        zh: '未达开叫实力（0-11大牌点），或对当前定约满意选择停叫。',
      },
      points: '0-11 HCP',
      badge: 'PASS',
    };
  }

  if (bid.type === 'double') {
    return {
      name: { en: 'Double (X)', zh: '加倍 (Double)' },
      meaning: {
        en: 'Takeout Double (12+ HCP, asking partner to bid unbid suits) or Penalty Double at high levels.',
        zh: '技术性加倍（12+点，要求同伴叫出未叫花色）或高阶惩罚性加倍。',
      },
      points: '12+ HCP',
      badge: 'DBL',
    };
  }

  if (bid.type === 'redouble') {
    return {
      name: { en: 'Redouble (XX)', zh: '再加倍 (Redouble)' },
      meaning: {
        en: 'Shows 10+ HCP after opponent doubles partner; expresses confidence in making or punishes.',
        zh: '敌方加倍后表示己方持 10+ 大牌点强牌，表达必成信心并大幅惩罚敌方。',
      },
      points: '10+ HCP',
      badge: 'RDBL',
    };
  }

  const { level, denom } = bid;
  const suitEn = SUIT_NAME_EN[denom];
  const suitZh = SUIT_NAME_ZH[denom];

  // 1-level openings
  if (level === 1) {
    if (denom === 'NT') {
      return {
        name: { en: '1 No-Trump (1NT)', zh: '1 无将 (1NT)' },
        meaning: {
          en: '15-17 HCP, balanced distribution (no void, no singleton, at most one doubleton).',
          zh: '15-17 大牌点，均型牌（无缺门、名单张，至多一个双张）。',
        },
        points: '15-17 HCP',
        shape: 'Balanced (4-3-3-3, 4-4-3-2, 5-3-3-2)',
        badge: '15-17 NT',
      };
    }
    if (denom === 'H' || denom === 'S') {
      return {
        name: { en: `1 ${suitEn} (1${denom})`, zh: `1 ${suitZh} (1${denom})` },
        meaning: {
          en: `12-21 total points, 5+ cards in ${suitEn}. Major suit opening aiming for an 8-card fit.`,
          zh: `12-21 牌点，5+ 张${suitZh}。高花开叫，首选探索 8 张黄金配合。`,
        },
        points: '12-21 Total Pts',
        shape: `5+ ${denom}`,
        badge: 'Major 5+',
      };
    }
    // 1C or 1D
    return {
      name: { en: `1 ${suitEn} (1${denom})`, zh: `1 ${suitZh} (1${denom})` },
      meaning: {
        en: `12-21 total points, 3+ cards in ${suitEn}. Standard minor suit opening to start auction.`,
        zh: `12-21 牌点，3+ 张${suitZh}。标准低花开叫，启动全场叫牌探索。`,
      },
      points: '12-21 Total Pts',
      shape: `3+ ${denom}`,
      badge: 'Minor 3+',
    };
  }

  // 2-level
  if (level === 2) {
    if (denom === 'C') {
      return {
        name: { en: '2 Clubs (2♣)', zh: '2 梅花 (2♣ 强逼叫)' },
        meaning: {
          en: '22+ HCP or 9+ playing tricks. Strongest opening bid in bridge; partner cannot pass.',
          zh: '22+ 大牌点或 9+ 赢墩强牌。桥牌中点力最强的开叫，绝对逼叫，同伴不可Pass。',
        },
        points: '22+ HCP',
        badge: 'Strong 22+',
      };
    }
    if (denom === 'NT') {
      return {
        name: { en: '2 No-Trump (2NT)', zh: '2 无将 (2NT)' },
        meaning: {
          en: '20-21 HCP, balanced distribution. Invites game or slam in no-trump.',
          zh: '20-21 大牌点，均型牌。直接瞄准成局或进逼无将满贯。',
        },
        points: '20-21 HCP',
        shape: 'Balanced',
        badge: '20-21 NT',
      };
    }
    // 2D, 2H, 2S (Weak Two)
    return {
      name: { en: `2 ${suitEn} (2${denom})`, zh: `2 ${suitZh} (弱二开叫)` },
      meaning: {
        en: `6-10 HCP, exactly 6 cards in ${suitEn} with good honors. Tactical preemptive opening.`,
        zh: `6-10 大牌点，正好 6 张${suitZh}且有大牌套。阻击性战术开叫。`,
      },
      points: '6-10 HCP',
      shape: `6 ${denom}`,
      badge: 'Weak Two',
    };
  }

  // 3-level
  if (level === 3) {
    if (denom === 'NT') {
      return {
        name: { en: '3 No-Trump (3NT)', zh: '3 无将 (3NT 成局)' },
        meaning: {
          en: 'Game in No-Trump (needs 9 tricks). Often 25-27 combined partnership points.',
          zh: '无将成局定约（需拿 9 墩）。通常由全手 25-27 点或同伴间总点力促成。',
        },
        points: '25-27 Combined',
        badge: 'GAME (9 tricks)',
      };
    }
    return {
      name: { en: `3 ${suitEn} (3${denom})`, zh: `3 ${suitZh} (3阶阻击)` },
      meaning: {
        en: `Preemptive bid showing 6-9 HCP and a good 7-card ${suitEn} suit to steal bidding space.`,
        zh: `阻击叫，持 6-9 大牌点及 7 张${suitZh}长套，抢占叫牌空间施压敌方。`,
      },
      points: '6-9 HCP',
      shape: `7 ${denom}`,
      badge: 'Preempt 7',
    };
  }

  // 4-level
  if (level === 4) {
    if (denom === 'H' || denom === 'S') {
      return {
        name: { en: `4 ${suitEn} (4${denom})`, zh: `4 ${suitZh} (高花成局)` },
        meaning: {
          en: `Major Suit Game Contract (needs 10 tricks). Baseline target in competitive bridge.`,
          zh: `高花成局定约（需拿 10 墩）。桥牌竞赛中的核心得分黄金定约。`,
        },
        points: '25+ Combined',
        badge: 'GAME (10 tricks)',
      };
    }
    return {
      name: { en: `4 ${suitEn} (4${denom})`, zh: `4 ${suitZh}` },
      meaning: {
        en: `4-level contract (needs 10 tricks). Often an advanced preempt or exploratory bid.`,
        zh: `4阶定约（需拿 10 墩）。通常为强阻击或进局试探。`,
      },
      points: 'Competitive',
      badge: '10 tricks',
    };
  }

  // 5-level
  if (level === 5) {
    if (denom === 'C' || denom === 'D') {
      return {
        name: { en: `5 ${suitEn} (5${denom})`, zh: `5 ${suitZh} (低花成局)` },
        meaning: {
          en: `Minor Suit Game Contract (needs 11 tricks). Requires 28-29 combined points.`,
          zh: `低花成局定约（需拿 11 墩）。通常需要 28-29 总点力方能冲成。`,
        },
        points: '28+ Combined',
        badge: 'GAME (11 tricks)',
      };
    }
    return {
      name: { en: `5 ${suitEn} (5${denom})`, zh: `5 ${suitZh}` },
      meaning: {
        en: `High-level competitive contract (needs 11 tricks).`,
        zh: `高阶竞叫定约（需拿 11 墩）。`,
      },
      badge: '11 tricks',
    };
  }

  // 6-level (Small Slam)
  if (level === 6) {
    return {
      name: { en: `6 ${suitEn} (Small Slam)`, zh: `6 ${suitZh} (小满贯)` },
      meaning: {
        en: `Small Slam contract (needs 12 tricks). Huge bonus for taking 12 out of 13 tricks!`,
        zh: `小满贯定约（需拿 12 墩）。拿下 13 墩中的 12 墩，奖励丰厚！`,
      },
      points: '33+ Combined',
      badge: 'SLAM (12 tricks)',
    };
  }

  // 7-level (Grand Slam)
  return {
    name: { en: `7 ${suitEn} (Grand Slam)`, zh: `7 ${suitZh} (大满贯)` },
    meaning: {
      en: `Grand Slam contract (needs ALL 13 tricks). The pinnacle achievement in bridge!`,
      zh: `大满贯定约（必须拿下全部 13 墩）。桥牌运动的至高荣耀与极限挑战！`,
    },
    points: '37+ Combined',
    badge: 'GRAND SLAM (13 tricks)',
  };
}
