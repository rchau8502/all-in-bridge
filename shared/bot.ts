/**
 * bot.ts — Rule-based ACBL Bridge Bot player.
 *
 * Implements fundamental ACBL Series 1 card-play heuristics:
 * - 1st hand (Leader): Lead top of touching honors, 4th highest from length,
 *   or top trump to draw opponents' trumps.
 * - 2nd hand: Second hand low, unless covering an honor led by opponent.
 * - 3rd hand: Third hand high to win the trick or force declarer's honor.
 * - 4th hand: Win as cheaply as possible if partner is not already winning;
 *   otherwise play the lowest card.
 */

import type { Card, Seat, Suit } from './deck.js';
import { partnerOf } from './deck.js';
import { type PlayState, beats } from './play.js';

export interface BotDecision {
  card: Card;
  ruleReason: string;
}

/**
 * Determine which play in a partially completed trick is currently winning.
 */
export function currentWinningPlay(
  trick: Array<{ seat: Seat; card: Card }>,
  trump: Suit | null
): { seat: Seat; card: Card } | null {
  if (trick.length === 0) return null;
  const ledSuit = trick[0]!.card.suit;
  let winning = trick[0]!;
  for (let i = 1; i < trick.length; i++) {
    const play = trick[i]!;
    if (beats(play.card, winning.card, ledSuit, trump)) {
      winning = play;
    }
  }
  return winning;
}

/**
 * Select the optimal legal card for the current seat using ACBL rules.
 */
export function chooseBotPlay(playState: PlayState): Card {
  const legal = playState.legalPlays();
  if (legal.length === 0) {
    throw new Error(`Seat ${playState.turn} has no legal plays`);
  }
  if (legal.length === 1) {
    return legal[0]!;
  }

  const trump: Suit | null = playState.contract.denom === 'NT' ? null : playState.contract.denom;
  const trick = playState.currentTrick;
  const mySeat = playState.turn;
  const partnerSeat = partnerOf(mySeat);
  const position = trick.length; // 0=1st, 1=2nd, 2=3rd, 3=4th

  // -------------------------------------------------------------
  // Position 0: Trick Leader
  // -------------------------------------------------------------
  if (position === 0) {
    // 1. Pull trumps if holding top trumps (A, K)
    if (trump) {
      const myTrumps = legal.filter(c => c.suit === trump);
      const topTrump = myTrumps.find(c => c.rank === 14 || c.rank === 13);
      if (topTrump) return topTrump;
    }

    // 2. Lead top of touching honors (e.g. Q from Q-J-10 or K from K-Q-J)
    for (const s of ['S', 'H', 'D', 'C'] as const) {
      const suitCards = legal.filter(c => c.suit === s).sort((a, b) => b.rank - a.rank);
      if (suitCards.length >= 2) {
        for (let i = 0; i < suitCards.length - 1; i++) {
          const high = suitCards[i]!;
          const next = suitCards[i + 1]!;
          if (high.rank >= 10 && high.rank === next.rank + 1) {
            return high;
          }
        }
      }
    }

    // 3. Lead 4th highest from longest suit
    const suitCounts: Record<Suit, Card[]> = { S: [], H: [], D: [], C: [] };
    for (const c of legal) suitCounts[c.suit].push(c);
    const longestSuitCards = Object.values(suitCounts)
      .filter(arr => arr.length > 0)
      .sort((a, b) => b.length - a.length)[0]!;

    longestSuitCards.sort((a, b) => b.rank - a.rank);
    if (longestSuitCards.length >= 4) {
      return longestSuitCards[3]!; // 4th highest
    }
    // Otherwise lead lowest card of longest suit
    return longestSuitCards[longestSuitCards.length - 1]!;
  }

  const ledSuit = trick[0]!.card.suit;
  const winning = currentWinningPlay(trick, trump)!;
  const partnerIsWinning = winning.seat === partnerSeat;

  // -------------------------------------------------------------
  // Position 1: Second Hand
  // -------------------------------------------------------------
  if (position === 1) {
    const ledCard = trick[0]!.card;
    const sameSuit = legal.filter(c => c.suit === ledSuit).sort((a, b) => a.rank - b.rank);

    // Cover an honor with an honor: if opponent leads an honor (>=10)
    // and we have a higher honor, cover with the lowest covering honor
    if (ledCard.rank >= 10 && sameSuit.length > 0) {
      const covering = sameSuit.find(c => c.rank > ledCard.rank && c.rank >= 11);
      if (covering) return covering;
    }

    // Otherwise: "Second hand low"
    if (sameSuit.length > 0) {
      return sameSuit[0]!; // lowest card of led suit
    }
    // Can't follow suit: discard lowest non-trump card
    const nonTrumps = legal.filter(c => c.suit !== trump).sort((a, b) => a.rank - b.rank);
    if (nonTrumps.length > 0) return nonTrumps[0]!;
    return legal.sort((a, b) => a.rank - b.rank)[0]!;
  }

  // -------------------------------------------------------------
  // Position 2: Third Hand
  // -------------------------------------------------------------
  if (position === 2) {
    const sameSuit = legal.filter(c => c.suit === ledSuit).sort((a, b) => b.rank - a.rank);
    // If partner already played an Ace, no need to play high
    if (partnerIsWinning && winning.card.rank === 14 && sameSuit.length > 0) {
      return sameSuit[sameSuit.length - 1]!; // play lowest card to let partner win
    }
    // "Third hand high": play highest card to win or force declarer's honor
    if (sameSuit.length > 0) {
      return sameSuit[0]!;
    }
    // Can't follow suit: trump if possible and partner isn't already winning
    if (trump && !partnerIsWinning) {
      const myTrumps = legal.filter(c => c.suit === trump).sort((a, b) => a.rank - b.rank);
      if (myTrumps.length > 0) {
        // Find lowest trump that beats current winning card
        const winningTrump = myTrumps.find(t => beats(t, winning.card, ledSuit, trump));
        if (winningTrump) return winningTrump;
      }
    }
    // Discard lowest card
    return legal.sort((a, b) => a.rank - b.rank)[0]!;
  }

  // -------------------------------------------------------------
  // Position 3: Fourth Hand (Last to play)
  // -------------------------------------------------------------
  // Partner is winning: conserve cards and play lowest legal card!
  if (partnerIsWinning) {
    const sameSuit = legal.filter(c => c.suit === ledSuit).sort((a, b) => a.rank - b.rank);
    if (sameSuit.length > 0) return sameSuit[0]!;
    // Sluff lowest non-trump
    const nonTrumps = legal.filter(c => c.suit !== trump).sort((a, b) => a.rank - b.rank);
    if (nonTrumps.length > 0) return nonTrumps[0]!;
    return legal.sort((a, b) => a.rank - b.rank)[0]!;
  }

  // Partner is NOT winning: try to win as cheaply as possible
  const winningPlays = legal
    .filter(c => beats(c, winning.card, ledSuit, trump))
    .sort((a, b) => a.rank - b.rank);

  if (winningPlays.length > 0) {
    // Pick lowest winning card of the same suit if possible
    const sameSuitWinning = winningPlays.filter(c => c.suit === ledSuit);
    if (sameSuitWinning.length > 0) return sameSuitWinning[0]!;
    // Otherwise lowest winning trump
    return winningPlays[0]!;
  }

  // Cannot win: play lowest card (duck / discard)
  const sameSuit = legal.filter(c => c.suit === ledSuit).sort((a, b) => a.rank - b.rank);
  if (sameSuit.length > 0) return sameSuit[0]!;
  const nonTrumps = legal.filter(c => c.suit !== trump).sort((a, b) => a.rank - b.rank);
  if (nonTrumps.length > 0) return nonTrumps[0]!;
  return legal.sort((a, b) => a.rank - b.rank)[0]!;
}
