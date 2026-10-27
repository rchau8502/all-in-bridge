import { describe, it, expect } from 'vitest';
import { explainBid } from './bidding-explain.js';
import type { Bid } from './bidding.js';

describe('bidding-explain', () => {
  it('explains Pass, Double, and Redouble correctly', () => {
    const pass = explainBid({ type: 'pass' });
    expect(pass.badge).toBe('PASS');
    expect(pass.points).toContain('0-11');
    expect(pass.meaning.en).toContain('Insufficient');
    expect(pass.meaning.zh).toContain('未达开叫实力');

    const dbl = explainBid({ type: 'double' });
    expect(dbl.badge).toBe('DBL');
    expect(dbl.points).toContain('12+');

    const rdbl = explainBid({ type: 'redouble' });
    expect(rdbl.badge).toBe('RDBL');
    expect(rdbl.points).toContain('10+');
  });

  it('explains 1-level openings (1NT, 1 Major, 1 Minor)', () => {
    const nt1 = explainBid({ type: 'bid', level: 1, denom: 'NT' });
    expect(nt1.badge).toBe('15-17 NT');
    expect(nt1.points).toBe('15-17 HCP');
    expect(nt1.shape).toContain('Balanced');
    expect(nt1.meaning.zh).toContain('均型牌');

    const s1 = explainBid({ type: 'bid', level: 1, denom: 'S' });
    expect(s1.badge).toBe('Major 5+');
    expect(s1.meaning.en).toContain('5+ cards in Spades');
    expect(s1.meaning.zh).toContain('5+ 张黑桃');

    const c1 = explainBid({ type: 'bid', level: 1, denom: 'C' });
    expect(c1.badge).toBe('Minor 3+');
    expect(c1.meaning.en).toContain('3+ cards in Clubs');
  });

  it('explains 2-level bids (2C Strong, 2NT, 2H Weak Two)', () => {
    const c2 = explainBid({ type: 'bid', level: 2, denom: 'C' });
    expect(c2.badge).toBe('Strong 22+');
    expect(c2.meaning.zh).toContain('绝对逼叫');

    const nt2 = explainBid({ type: 'bid', level: 2, denom: 'NT' });
    expect(nt2.badge).toBe('20-21 NT');

    const h2 = explainBid({ type: 'bid', level: 2, denom: 'H' });
    expect(h2.badge).toBe('Weak Two');
    expect(h2.points).toBe('6-10 HCP');
    expect(h2.shape).toBe('6 H');
  });

  it('explains game and slam contracts (3NT, 4S, 5D, 6NT, 7NT)', () => {
    const nt3 = explainBid({ type: 'bid', level: 3, denom: 'NT' });
    expect(nt3.badge).toContain('GAME');

    const s4 = explainBid({ type: 'bid', level: 4, denom: 'S' });
    expect(s4.badge).toBe('GAME (10 tricks)');

    const d5 = explainBid({ type: 'bid', level: 5, denom: 'D' });
    expect(d5.badge).toBe('GAME (11 tricks)');

    const nt6 = explainBid({ type: 'bid', level: 6, denom: 'NT' });
    expect(nt6.badge).toBe('SLAM (12 tricks)');

    const nt7 = explainBid({ type: 'bid', level: 7, denom: 'NT' });
    expect(nt7.badge).toBe('GRAND SLAM (13 tricks)');
  });
});
