import { describe, it, expect } from 'vitest';
import { formatHandPbn, parseHandPbn, exportDealToPbn, importDealFromPbn } from './pbn.js';
import { buildDeck, shuffle, deal, type Card } from './deck.js';

describe('Portable Bridge Notation (PBN) Parser & Formatter', () => {
  it('formats hand into standard Spades.Hearts.Diamonds.Clubs string', () => {
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 13 }, { suit: 'S', rank: 2 }, // AK2
      { suit: 'H', rank: 12 }, { suit: 'H', rank: 11 }, { suit: 'H', rank: 10 }, // QJT
      { suit: 'D', rank: 9 }, { suit: 'D', rank: 8 }, { suit: 'D', rank: 7 }, // 987
      { suit: 'C', rank: 6 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 4 }, { suit: 'C', rank: 3 }, // 6543
    ];
    const pbn = formatHandPbn(hand);
    expect(pbn).toBe('AK2.QJT.987.6543');
  });

  it('handles void suits as empty strings between dots', () => {
    const hand: Card[] = [
      { suit: 'S', rank: 14 }, { suit: 'S', rank: 13 },
      // Heart void!
      { suit: 'D', rank: 12 }, { suit: 'D', rank: 11 },
      { suit: 'C', rank: 10 },
    ];
    const pbn = formatHandPbn(hand);
    expect(pbn).toBe('AK..QJ.T');
  });

  it('parses single hand string back into Card[]', () => {
    const cards = parseHandPbn('AK2.QJT.987.6543');
    expect(cards.length).toBe(13);
    expect(cards.filter(c => c.suit === 'S').map(c => c.rank)).toEqual([14, 13, 2]);
    expect(cards.filter(c => c.suit === 'H').map(c => c.rank)).toEqual([12, 11, 10]);
    expect(cards.filter(c => c.suit === 'D').map(c => c.rank)).toEqual([9, 8, 7]);
    expect(cards.filter(c => c.suit === 'C').map(c => c.rank)).toEqual([6, 5, 4, 3]);
  });

  it('round-trips full 52-card deal through export and import', () => {
    const originalHands = deal(shuffle(buildDeck()));
    const pbn = exportDealToPbn(originalHands, 'N');
    expect(pbn.startsWith('N:')).toBe(true);

    const { hands: imported, firstSeat } = importDealFromPbn(pbn);
    expect(firstSeat).toBe('N');
    for (const seat of ['N', 'E', 'S', 'W'] as const) {
      expect(imported[seat].length).toBe(13);
      expect(formatHandPbn(imported[seat])).toBe(formatHandPbn(originalHands[seat]));
    }
  });

  it('imports deal with standard PBN tag format', () => {
    const pbnTag = '[Deal "W:AK5.T98.765.4322 QJT.K76.432.AKQ5 987.543.AKQ.JT98 6432.AQJ.JT98.76"]';
    const { hands, firstSeat } = importDealFromPbn(pbnTag);
    expect(firstSeat).toBe('W');
    expect(hands.W.length).toBe(13);
    expect(formatHandPbn(hands.W)).toBe('AK5.T98.765.4322');
  });
});
