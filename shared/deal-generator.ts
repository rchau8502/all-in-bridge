/**
 * deal-generator.ts — Targeted deal generator for ACBL training.
 *
 * Generates deals matching specific learning archetypes (1NT Opening, Major Suit Opening,
 * Minor Suit Opening, Strong 2C, Weak Two, Slam Try, or Random).
 */

import { buildDeck, shuffle, deal, type Hands, type Card } from './deck.js';
import { calculateHcp, getSuitLengths, isBalancedHand } from './evaluator.js';

export type DealArchetype =
  | 'random'
  | '1nt_opening'
  | 'major_opening'
  | 'minor_opening'
  | 'strong_2c'
  | 'weak_two'
  | 'slam_try';

export interface DealArchetypeOption {
  id: DealArchetype;
  label: { en: string; zh: string };
  desc: { en: string; zh: string };
  badge: string;
}

export const DEAL_ARCHETYPES: DealArchetypeOption[] = [
  {
    id: 'random',
    label: { en: '🎲 Random Deal', zh: '🎲 随机发牌' },
    desc: { en: 'Standard duplicate shuffle with no constraints.', zh: '标准全随机洗牌，无任何牌型限制。' },
    badge: 'Standard',
  },
  {
    id: '1nt_opening',
    label: { en: '🎯 1NT Strong Opening', zh: '🎯 1NT 强无将开叫' },
    desc: { en: 'South holds 15-17 HCP and a balanced hand.', zh: '南家起手持有 15-17 大牌点及均型牌。' },
    badge: '15-17 NT',
  },
  {
    id: 'major_opening',
    label: { en: '♠️ Major Opening (1♠/1♥)', zh: '♠️ 高花开叫 (1♠/1♥)' },
    desc: { en: 'South holds 12-21 HCP and a 5+ card major (♠ or ♥).', zh: '南家起手 12-21 点且持有 5+ 张高花（黑桃或红桃）。' },
    badge: 'Major 5+',
  },
  {
    id: 'minor_opening',
    label: { en: '♣️ Minor Opening (1♣/1♦)', zh: '♣️ 低花开叫 (1♣/1♦)' },
    desc: { en: 'South holds 12-21 HCP and a 4+ card minor suit.', zh: '南家起手 12-21 点且持有 4+ 张低花（梅花或方块）。' },
    badge: 'Minor 4+',
  },
  {
    id: 'weak_two',
    label: { en: '🛡️ Weak Two Preempt', zh: '🛡️ 弱二阻击开叫' },
    desc: { en: 'South holds 6-10 HCP and exactly a 6-card suit (♦, ♥, or ♠).', zh: '南家持有 6-10 大牌点及单门 6 张阻击套。' },
    badge: 'Weak Two',
  },
  {
    id: 'strong_2c',
    label: { en: '👑 Strong 2♣ Monster', zh: '👑 2♣ 强逼叫巨灵手' },
    desc: { en: 'South holds 22+ HCP monster hand.', zh: '南家持有 22+ 大牌点强力起手，探索满贯与成局。' },
    badge: 'Strong 22+',
  },
  {
    id: 'slam_try',
    label: { en: '✨ Slam Zone (31+ Pts)', zh: '✨ 满贯冲刺局 (合31+点)' },
    desc: { en: 'North and South hold 31+ combined HCP.', zh: '北南双方合持 31+ 大牌点，练习小满贯/大满贯进程。' },
    badge: 'Slam 31+',
  },
];

/**
 * Checks if a dealt set of hands satisfies the given archetype for South.
 */
function satisfiesArchetype(hands: Hands, archetype: DealArchetype): boolean {
  if (archetype === 'random') return true;

  const sHcp = calculateHcp(hands.S);
  const sLens = getSuitLengths(hands.S);

  if (archetype === '1nt_opening') {
    return sHcp >= 15 && sHcp <= 17 && isBalancedHand(sLens);
  }

  if (archetype === 'major_opening') {
    return sHcp >= 12 && sHcp <= 21 && (sLens.S >= 5 || sLens.H >= 5);
  }

  if (archetype === 'minor_opening') {
    return (
      sHcp >= 12 &&
      sHcp <= 21 &&
      (sLens.C >= 4 || sLens.D >= 4) &&
      sLens.S < 5 &&
      sLens.H < 5
    );
  }

  if (archetype === 'weak_two') {
    const has6 = sLens.D === 6 || sLens.H === 6 || sLens.S === 6;
    const has4CardOtherMajor = (sLens.H === 6 && sLens.S >= 4) || (sLens.S === 6 && sLens.H >= 4);
    return sHcp >= 6 && sHcp <= 10 && has6 && !has4CardOtherMajor;
  }

  if (archetype === 'strong_2c') {
    return sHcp >= 22;
  }

  if (archetype === 'slam_try') {
    const nHcp = calculateHcp(hands.N);
    return sHcp + nHcp >= 31;
  }

  return true;
}

/**
 * Synthetic builder for strong 2C in case random shuffling exceeds budget.
 */
function synthesizeStrong2C(): Hands {
  const deck = buildDeck();
  // Take high honors (Aces, Kings, Queens) into South
  const honors = deck.filter(c => c.rank >= 12);
  const lowCards = deck.filter(c => c.rank < 12);

  // South gets 7 high honors (minimum 4*2 + 3*2 + 2*3 = 20 HCP) plus 1 more Ace/King
  const sHonors = honors.slice(0, 8);
  const sLow = lowCards.slice(0, 13 - sHonors.length);
  const sHand: Card[] = [...sHonors, ...sLow];

  const remaining = [...honors.slice(8), ...lowCards.slice(13 - sHonors.length)];
  const shuffledRemaining = shuffle(remaining);

  return {
    S: sHand,
    W: shuffledRemaining.slice(0, 13),
    N: shuffledRemaining.slice(13, 26),
    E: shuffledRemaining.slice(26, 39),
  };
}

/**
 * Generate a complete 4-seat deal matching the chosen archetype for South.
 */
export function generateArchetypeDeal(archetype: DealArchetype = 'random'): Hands {
  if (archetype === 'random') {
    return deal(shuffle(buildDeck()));
  }

  // Fast rejection sampling (typically succeeds in < 15ms)
  const maxAttempts = archetype === 'strong_2c' ? 450 : 250;
  for (let i = 0; i < maxAttempts; i++) {
    const hands = deal(shuffle(buildDeck()));
    if (satisfiesArchetype(hands, archetype)) {
      return hands;
    }
  }

  // Fallback for strong 2C if random draw was unlucky
  if (archetype === 'strong_2c') {
    const synth = synthesizeStrong2C();
    if (calculateHcp(synth.S) >= 22) return synth;
  }

  // Graceful fallback
  return deal(shuffle(buildDeck()));
}
