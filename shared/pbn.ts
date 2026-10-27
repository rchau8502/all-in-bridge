/**
 * pbn.ts — Portable Bridge Notation (PBN) import & export.
 *
 * Implements standard duplicate bridge PBN deal formatting and parsing.
 * Format: "N:AKQ.JT9.876.5432 ... ... ..."
 * Order of suits per hand: Spades . Hearts . Diamonds . Clubs
 * Order of hands: Clockwise starting from the specified first seat.
 */

import type { Card, Hands, Seat, Suit } from './deck.js';
import { SEATS, nextSeat } from './deck.js';

const RANK_CHARS: Record<number, string> = {
  14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: 'T',
  9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2',
};

const CHAR_RANKS: Record<string, number> = {
  A: 14, K: 13, Q: 12, J: 11, T: 10, '10': 10,
  '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2,
};

const SUITS_ORDER: Suit[] = ['S', 'H', 'D', 'C'];

/**
 * Format a seat's hand into PBN suit representation: "AK5.T98.765.4322"
 */
export function formatHandPbn(cards: Card[]): string {
  const bySuit: Record<Suit, number[]> = { S: [], H: [], D: [], C: [] };
  for (const c of cards) {
    bySuit[c.suit].push(c.rank);
  }
  return SUITS_ORDER.map(s => {
    return bySuit[s]
      .sort((a, b) => b - a)
      .map(r => RANK_CHARS[r] ?? '')
      .join('');
  }).join('.');
}

/**
 * Export full 4 hands into standard PBN Deal string.
 * Example: "N:AK5.T98.765.4322 QJT.K76.432.AKQ5 ..."
 */
export function exportDealToPbn(hands: Hands, firstSeat: Seat = 'N'): string {
  const parts: string[] = [];
  let cur = firstSeat;
  for (let i = 0; i < 4; i++) {
    parts.push(formatHandPbn(hands[cur]));
    cur = nextSeat(cur);
  }
  return `${firstSeat}:${parts.join(' ')}`;
}

/**
 * Parse a single seat's PBN hand string (e.g. "AK5.T98.765.4322") into Card[]
 */
export function parseHandPbn(str: string): Card[] {
  const suits = str.split('.');
  if (suits.length !== 4) {
    throw new Error(`Invalid PBN hand (expected 4 suits separated by dots): ${str}`);
  }
  const cards: Card[] = [];
  SUITS_ORDER.forEach((suit, idx) => {
    const chars = suits[idx]!;
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i]!.toUpperCase();
      const rank = CHAR_RANKS[ch];
      if (rank !== undefined) {
        cards.push({ suit, rank });
      }
    }
  });
  return cards;
}

/**
 * Parse PBN Deal string into Hands.
 * Accepts either:
 * - Raw deal string: "N:AK5.T98.765.4322 QJT.K76.432.AKQ5 ..."
 * - PBN tag: '[Deal "N:AK5.T98.765.4322 QJT.K76.432.AKQ5 ..."]'
 */
export function importDealFromPbn(pbnInput: string): { hands: Hands; firstSeat: Seat } {
  let cleaned = pbnInput.trim();
  // Strip tag wrappers if present
  const match = /\[Deal\s+"([^"]+)"\]/i.exec(cleaned);
  if (match) {
    cleaned = match[1]!;
  }

  const colonIdx = cleaned.indexOf(':');
  if (colonIdx === -1) {
    throw new Error('PBN deal must start with seat prefix (e.g. "N:...")');
  }

  const seatChar = cleaned.slice(0, colonIdx).trim().toUpperCase();
  if (!SEATS.includes(seatChar as Seat)) {
    throw new Error(`Invalid seat in PBN deal: ${seatChar}`);
  }
  const firstSeat = seatChar as Seat;
  const handsStr = cleaned.slice(colonIdx + 1).trim();
  const handTokens = handsStr.split(/\s+/);

  if (handTokens.length !== 4) {
    throw new Error(`PBN deal must contain exactly 4 hands, found ${handTokens.length}`);
  }

  const hands: Hands = { N: [], E: [], S: [], W: [] };
  let cur = firstSeat;
  for (let i = 0; i < 4; i++) {
    hands[cur] = parseHandPbn(handTokens[i]!);
    cur = nextSeat(cur);
  }

  return { hands, firstSeat };
}
