/**
 * minibridge.ts — ACBL & EBU compliant MiniBridge engine.
 *
 * Designed for complete beginners (Class 1 & 2) and classroom teaching:
 * 1. Skips the complex auction phase completely.
 * 2. Emphasizes High Card Points (HCP) mental math and partner sum.
 * 3. Side with higher total HCP wins the contract.
 * 4. Partner with more points becomes Declarer; other becomes Dummy.
 * 5. Dummy spreads hand face-up immediately.
 * 6. Declarer selects suit or NT based on 8-card major fit and 25-point game threshold.
 * 7. LHO leads, and the 13 tricks are played under standard ACBL trick rules.
 */

import { calculateHcp } from './evaluator.js';
import { partnerOf, nextSeat, type Seat, type Suit, type Hands } from './deck.js';
import type { Contract, Denom } from './bidding.js';

export interface MiniBridgeOption {
  level: number;
  denom: Denom;
  label: { en: string; zh: string };
  isRecommended: boolean;
  tricksNeeded: number;
  isGame: boolean;
}

export interface MiniBridgeEvaluation {
  hcp: Record<Seat, number>;
  totalHcp: { NS: number; EW: number };
  declaringPair: 'NS' | 'EW';
  declarer: Seat;
  dummy: Seat;
  openingLeader: Seat;
  suitLengths: Record<Suit, number>;
  hasMajorFit: boolean;
  recommendedDenom: Denom;
  isGameValue: boolean;
  recommendedLevel: number;
  recommendedContract: Contract;
  explanation: { en: string; zh: string };
  fitSummary: { en: string; zh: string };
  options: MiniBridgeOption[];
}

/**
 * Evaluates a dealt hand for MiniBridge according to standard pedagogical rules.
 */
export function evaluateMiniBridgeDeal(hands: Hands): MiniBridgeEvaluation {
  const hcp: Record<Seat, number> = {
    N: calculateHcp(hands.N),
    E: calculateHcp(hands.E),
    S: calculateHcp(hands.S),
    W: calculateHcp(hands.W),
  };

  const totalNS = hcp.N + hcp.S;
  const totalEW = hcp.E + hcp.W;

  // Determining declaring pair: higher points wins. If tied (20-20), default to NS for learner convenience.
  const declaringPair: 'NS' | 'EW' = totalNS >= totalEW ? 'NS' : 'EW';

  // Declarer is the player with the higher HCP in the winning pair.
  // If tied, prefer S for NS (learner seat) and W for EW.
  let declarer: Seat;
  if (declaringPair === 'NS') {
    declarer = hcp.S >= hcp.N ? 'S' : 'N';
  } else {
    declarer = hcp.W >= hcp.E ? 'W' : 'E';
  }

  const dummy = partnerOf(declarer);
  // Opening leader is always LHO of declarer (clockwise next seat)
  const openingLeader = nextSeat(declarer);

  // Count combined fit in the 4 suits for the declaring partnership
  const suitLengths: Record<Suit, number> = {
    S: countSuit(hands[declarer], 'S') + countSuit(hands[dummy], 'S'),
    H: countSuit(hands[declarer], 'H') + countSuit(hands[dummy], 'H'),
    D: countSuit(hands[declarer], 'D') + countSuit(hands[dummy], 'D'),
    C: countSuit(hands[declarer], 'C') + countSuit(hands[dummy], 'C'),
  };

  const spadeLen = suitLengths.S;
  const heartLen = suitLengths.H;
  const hasSpadeFit = spadeLen >= 8;
  const hasHeartFit = heartLen >= 8;
  const hasMajorFit = hasSpadeFit || hasHeartFit;

  let recommendedDenom: Denom;
  let fitSummary: { en: string; zh: string };

  if (hasSpadeFit && hasHeartFit) {
    if (spadeLen >= heartLen) {
      recommendedDenom = 'S';
      fitSummary = {
        en: `8+ Card Golden Fit in Spades (${spadeLen} cards)!`,
        zh: `黑桃 8+ 张黄金配合（合计 ${spadeLen} 张）！`,
      };
    } else {
      recommendedDenom = 'H';
      fitSummary = {
        en: `8+ Card Golden Fit in Hearts (${heartLen} cards)!`,
        zh: `红心 8+ 张黄金配合（合计 ${heartLen} 张）！`,
      };
    }
  } else if (hasSpadeFit) {
    recommendedDenom = 'S';
    fitSummary = {
      en: `8+ Card Golden Fit in Spades (${spadeLen} cards)!`,
      zh: `黑桃 8+ 张黄金配合（合计 ${spadeLen} 张）！`,
    };
  } else if (hasHeartFit) {
    recommendedDenom = 'H';
    fitSummary = {
      en: `8+ Card Golden Fit in Hearts (${heartLen} cards)!`,
      zh: `红心 8+ 张黄金配合（合计 ${heartLen} 张）！`,
    };
  } else {
    recommendedDenom = 'NT';
    fitSummary = {
      en: `No 8-card major fit (♠:${spadeLen}, ♥:${heartLen}). Play No-Trump!`,
      zh: `两手无 8 张高花配合（♠:${spadeLen}张, ♥:${heartLen}张）。建议打无将 (NT)！`,
    };
  }

  const offensiveHcp = declaringPair === 'NS' ? totalNS : totalEW;
  const isGameValue = offensiveHcp >= 25;

  let recommendedLevel: number;
  if (recommendedDenom === 'NT') {
    recommendedLevel = isGameValue ? 3 : 1;
  } else {
    recommendedLevel = isGameValue ? 4 : 2;
  }

  const recommendedContract: Contract = {
    level: recommendedLevel,
    denom: recommendedDenom,
    declarer,
    doubled: 0,
  };

  const explanation = {
    en: isGameValue
      ? `${declaringPair} holds ${offensiveHcp} combined HCP (>=25 pts), reaching game threshold! ${
          recommendedDenom === 'NT'
            ? 'With balanced distribution and no 8-card major fit, 3NT (9 tricks) is the target game.'
            : `With an 8-card major fit, 4${recommendedDenom} (10 tricks) is the target game.`
        }`
      : `${declaringPair} holds ${offensiveHcp} combined HCP (<25 pts). Stay in a safe part-score: ${
          recommendedDenom === 'NT'
            ? '1NT (7 tricks) to avoid over-committing.'
            : `2${recommendedDenom} (8 tricks) in your trump fit.`
        }`,
    zh: isGameValue
      ? `${declaringPair === 'NS' ? '北南' : '东西'}两手合计持 ${offensiveHcp} 大牌点（>=25点），达到成局黄金线！${
          recommendedDenom === 'NT'
            ? '两手无高花配合，定约首选 3NT（目标 9 墩）赢取丰厚成局奖分。'
            : `高花有 8+ 张黄金配合，定约首选 4${recommendedDenom === 'S' ? '♠' : '♥'}（目标 10 墩）成局！`
        }`
      : `${declaringPair === 'NS' ? '北南' : '东西'}两手合计持 ${offensiveHcp} 大牌点（<25点不足成局）。应当留在安全的部分定约：${
          recommendedDenom === 'NT'
            ? '打 1NT（目标 7 墩），避免贸然冲局被击溃。'
            : `打 2${recommendedDenom === 'S' ? '♠' : '♥'}（目标 8 墩），依托配合稳健拿分。`
        }`,
  };

  // Generate selectable options for learners / teachers:
  // Primary options: Game contracts and Part-scores in Major and NT
  const options: MiniBridgeOption[] = [
    {
      level: 4,
      denom: 'S',
      label: { en: '4♠ Game (10 Tricks)', zh: '4♠ 成局 (需10墩)' },
      isRecommended: recommendedLevel === 4 && recommendedDenom === 'S',
      tricksNeeded: 10,
      isGame: true,
    },
    {
      level: 4,
      denom: 'H',
      label: { en: '4♥ Game (10 Tricks)', zh: '4♥ 成局 (需10墩)' },
      isRecommended: recommendedLevel === 4 && recommendedDenom === 'H',
      tricksNeeded: 10,
      isGame: true,
    },
    {
      level: 3,
      denom: 'NT',
      label: { en: '3NT Game (9 Tricks)', zh: '3NT 成局 (需9墩)' },
      isRecommended: recommendedLevel === 3 && recommendedDenom === 'NT',
      tricksNeeded: 9,
      isGame: true,
    },
    {
      level: 2,
      denom: 'S',
      label: { en: '2♠ Part-Score (8 Tricks)', zh: '2♠ 部分定约 (需8墩)' },
      isRecommended: recommendedLevel === 2 && recommendedDenom === 'S',
      tricksNeeded: 8,
      isGame: false,
    },
    {
      level: 2,
      denom: 'H',
      label: { en: '2♥ Part-Score (8 Tricks)', zh: '2♥ 部分定约 (需8墩)' },
      isRecommended: recommendedLevel === 2 && recommendedDenom === 'H',
      tricksNeeded: 8,
      isGame: false,
    },
    {
      level: 1,
      denom: 'NT',
      label: { en: '1NT Part-Score (7 Tricks)', zh: '1NT 部分定约 (需7墩)' },
      isRecommended: recommendedLevel === 1 && recommendedDenom === 'NT',
      tricksNeeded: 7,
      isGame: false,
    },
  ];

  return {
    hcp,
    totalHcp: { NS: totalNS, EW: totalEW },
    declaringPair,
    declarer,
    dummy,
    openingLeader,
    suitLengths,
    hasMajorFit,
    recommendedDenom,
    isGameValue,
    recommendedLevel,
    recommendedContract,
    explanation,
    fitSummary,
    options,
  };
}

function countSuit(cards: Array<{ suit: Suit }>, suit: Suit): number {
  return cards.filter(c => c.suit === suit).length;
}
