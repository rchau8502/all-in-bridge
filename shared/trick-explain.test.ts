import { describe, it, expect } from 'vitest';
import { explainTrick } from './trick-explain.js';
import type { TrickReviewData } from './trick-explain.js';

const T = (o: Partial<TrickReviewData>): TrickReviewData => ({
  plays: [],
  winner: 'S',
  trump: null,
  tricksWon: { NS: 1, EW: 0 },
  ...o,
});
const c = (suit: 'C' | 'D' | 'H' | 'S', rank: number) => ({ suit, rank });

describe('explainTrick branches', () => {
  it('ruff win: a small trump beats the ace of the led suit', () => {
    const data = T({
      trump: 'S',
      winner: 'E',
      tricksWon: { NS: 0, EW: 1 },
      plays: [
        { seat: 'W', card: c('H', 14) }, // led the ace of hearts
        { seat: 'N', card: c('H', 13) },
        { seat: 'E', card: c('S', 3) }, // no hearts left — trumps in small
        { seat: 'S', card: c('H', 2) },
      ],
    });
    const en = explainTrick(data, 'en');
    expect(en.title).toContain('East');
    expect(en.lines.join(' ')).toContain('trumped in');
    expect(en.lines.join(' ')).toContain('ANY trump beats EVERY card');
    const zh = explainTrick(data, 'zh');
    expect(zh.lines.join(' ')).toContain('毙掉');
    expect(zh.lines.join(' ')).toContain('将牌大过天');
  });

  it('discard: a big off-suit card can never win', () => {
    const data = T({
      trump: null,
      winner: 'N',
      plays: [
        { seat: 'W', card: c('C', 2) },
        { seat: 'N', card: c('C', 13) }, // biggest club — wins
        { seat: 'E', card: c('D', 14) }, // ace, but a throw-away
        { seat: 'S', card: c('C', 3) },
      ],
    });
    const en = explainTrick(data, 'en');
    expect(en.lines.join(' ')).toContain('can NEVER win a trick');
    expect(en.title).toContain('Partner');
    const zh = explainTrick(data, 'zh');
    expect(zh.lines.join(' ')).toContain('垫掉的牌');
  });

  it('trump led: the biggest trump wins', () => {
    const data = T({
      trump: 'H',
      winner: 'S',
      plays: [
        { seat: 'W', card: c('H', 13) },
        { seat: 'N', card: c('H', 9) },
        { seat: 'E', card: c('H', 4) },
        { seat: 'S', card: c('H', 14) },
      ],
    });
    const en = explainTrick(data, 'en');
    expect(en.lines.join(' ')).toContain('Trumps were led');
    expect(en.title).toContain('You win');
  });
});
