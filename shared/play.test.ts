import { describe, it, expect } from 'vitest';
import { buildDeck, shuffle, deal, parseCard } from './deck.js';
import type { Seat } from './deck.js';
import { Auction, parseBid } from './bidding.js';
import { PlayState, trickWinner } from './play.js';

function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const C = parseCard;

describe('trickWinner', () => {
  it('highest card of the led suit wins at no-trump', () => {
    const trick = [
      { seat: 'W' as Seat, card: C('QD') },
      { seat: 'N' as Seat, card: C('AD') },
      { seat: 'E' as Seat, card: C('2C') }, // off-suit discard
      { seat: 'S' as Seat, card: C('KD') },
    ];
    expect(trickWinner(trick, null)).toBe('N');
  });

  it('a trump beats the led suit', () => {
    const trick = [
      { seat: 'N' as Seat, card: C('AC') },
      { seat: 'E' as Seat, card: C('2S') }, // trump
      { seat: 'S' as Seat, card: C('KC') },
      { seat: 'W' as Seat, card: C('3S') }, // higher trump
    ];
    expect(trickWinner(trick, 'S')).toBe('W');
  });

  it('higher trump beats lower trump', () => {
    const trick = [
      { seat: 'N' as Seat, card: C('5H') },
      { seat: 'E' as Seat, card: C('TH') },
      { seat: 'S' as Seat, card: C('2D') },
      { seat: 'W' as Seat, card: C('AH') },
    ];
    expect(trickWinner(trick, 'H')).toBe('W');
  });

  it('off-suit non-trump never wins', () => {
    const trick = [
      { seat: 'N' as Seat, card: C('7C') },
      { seat: 'E' as Seat, card: C('AS') }, // ace of another suit, not trump
      { seat: 'S' as Seat, card: C('KC') },
      { seat: 'W' as Seat, card: C('2C') },
    ];
    expect(trickWinner(trick, null)).toBe('S');
  });
});

describe('PlayState', () => {
  function setup() {
    const hands = deal(shuffle(buildDeck(), seededRng(99)));
    const auction = new Auction('N');
    for (const b of ['P', '1H', 'P', '2H', 'P', 'P', 'P']) auction.apply(parseBid(b));
    const contract = auction.contract()!;
    return new PlayState(hands, contract);
  }

  it('opening lead is left of the declarer', () => {
    const ps = setup();
    // N passed, E opened 1H, W raised to 2H → declarer is E (first EW heart bidder) → lead from S.
    expect(ps.contract.declarer).toBe('E');
    expect(ps.turn).toBe('S');
  });

  it('enforces following suit', () => {
    // Rigged: E leads hearts, S holds a heart but tries to play a club.
    const hands = deal(shuffle(buildDeck(), seededRng(5)));
    const auction = new Auction('N');
    for (const b of ['1NT', 'P', 'P', 'P']) auction.apply(parseBid(b));
    const ps = new PlayState(hands, auction.contract()!);
    const leader = ps.turn;
    const ledCard = ps.hands[leader][0];
    ps.play(ledCard);
    const next = ps.turn;
    const hand = ps.hands[next];
    const hasLed = hand.some(c => c.suit === ledCard.suit);
    const offSuit = hand.find(c => c.suit !== ledCard.suit);
    if (hasLed && offSuit) {
      expect(() => ps.play(offSuit)).toThrow();
    }
  });

  it('rejects playing a card the seat does not hold', () => {
    const ps = setup();
    const seat = ps.turn;
    const notHeld = buildDeck().find(
      c => !ps.hands[seat].some(h => h.suit === c.suit && h.rank === c.rank)
    )!;
    expect(() => ps.play(notHeld)).toThrow();
  });

  it('a full 13-trick game completes with 13 tricks accounted for', () => {
    const ps = setup();
    let guard = 0;
    while (!ps.isComplete() && guard++ < 60) {
      const plays = ps.legalPlays();
      expect(plays.length).toBeGreaterThan(0);
      ps.play(plays[0]);
    }
    expect(ps.isComplete()).toBe(true);
    expect(ps.tricksWon.NS + ps.tricksWon.EW).toBe(13);
    expect(ps.completedTricks).toHaveLength(13);
  });

  it('trick winner leads the next trick', () => {
    const ps = setup();
    // Play one full trick, then check turn == winner of that trick.
    for (let i = 0; i < 4; i++) ps.play(ps.legalPlays()[0]);
    const lastTrick = ps.completedTricks[0];
    const winner = trickWinner(lastTrick, ps.contract.denom === 'NT' ? null : ps.contract.denom);
    expect(ps.turn).toBe(winner);
  });

  it('does not mutate the input deal', () => {
    const hands = deal(shuffle(buildDeck(), seededRng(3)));
    const before = JSON.stringify(hands);
    const auction = new Auction('N');
    for (const b of ['1NT', 'P', 'P', 'P']) auction.apply(parseBid(b));
    const ps = new PlayState(hands, auction.contract()!);
    ps.play(ps.legalPlays()[0]);
    expect(JSON.stringify(hands)).toBe(before);
  });
});
