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
    const originalHands = deal(buildDeck());
    const pbnTag = `[Deal "${exportDealToPbn(originalHands, 'W')}"]`;
    const { hands, firstSeat } = importDealFromPbn(pbnTag);
    expect(firstSeat).toBe('W');
    for (const seat of ['N', 'E', 'S', 'W'] as const) {
      expect(formatHandPbn(hands[seat])).toBe(formatHandPbn(originalHands[seat]));
    }
  });
});


describe('PBN input validation', () => {
  it.each(['AX..QJ.T', 'A10..QJ.T', 'A-..QJ.T', 'A?..QJ.T'])(
    'rejects invalid rank characters in %s', hand => {
      expect(() => parseHandPbn(hand)).toThrow('Invalid rank');
    },
  );

  it('rejects duplicate cards within a hand', () => {
    expect(() => parseHandPbn('AA..QJ.T')).toThrow('Duplicate card');
  });

  it('accepts lowercase ranks and void suits', () => {
    expect(parseHandPbn('ak..qj.t')).toEqual(parseHandPbn('AK..QJ.T'));
  });

  it('rejects incomplete deals', () => {
    expect(() => importDealFromPbn('N:A... K... Q... J...')).toThrow('13 cards');
  });

  it('rejects duplicate cards across otherwise full hands', () => {
    const hand = 'AKQJ.T98.765.432';
    expect(() => importDealFromPbn(`N:${hand} ${hand} ${hand} ${hand}`)).toThrow('Duplicate card');
  });

  it.each(['N:... ... ...', 'X:... ... ... ...', '... ... ... ...'])(
    'rejects invalid deal structure: %s', pbn => {
      expect(() => importDealFromPbn(pbn)).toThrow();
    },
  );

  it.each(['N', 'E', 'S', 'W'] as const)('round-trips a full deal starting at %s', seat => {
    const original = deal(buildDeck());
    const pbn = exportDealToPbn(original, seat);
    const imported = importDealFromPbn(pbn.toLowerCase());
    expect(imported.firstSeat).toBe(seat);
    expect(exportDealToPbn(imported.hands, seat)).toBe(pbn);
  });
});
