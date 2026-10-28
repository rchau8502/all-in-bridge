import { describe, it, expect } from 'vitest';
import { explainTrick, detectDefenseSignals } from './trick-explain.js';
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
    expect(en.headline).toContain('trumped in');
    expect(en.lines.join(' ')).toContain('trumped in');
    expect(en.lines.join(' ')).toContain('ANY trump beats EVERY card');
    const zh = explainTrick(data, 'zh');
    expect(zh.headline).toContain('将吃');
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

  it('detects defense attitude signal when following to partner lead', () => {
    const playsEncourage = [
      { seat: 'W' as const, card: c('S', 13) }, // West leads King
      { seat: 'N' as const, card: c('S', 2) },
      { seat: 'E' as const, card: c('S', 8) }, // East plays 8 (high spot: encouraging)
      { seat: 'S' as const, card: c('S', 3) },
    ];
    const sigsEnc = detectDefenseSignals(playsEncourage, null);
    expect(sigsEnc.length).toBeGreaterThanOrEqual(2);
    expect(sigsEnc.some(s => s.kind === 'honor_lead')).toBe(true);
    expect(sigsEnc.some(s => s.kind === 'attitude_encourage')).toBe(true);

    const playsDiscourage = [
      { seat: 'W' as const, card: c('S', 13) },
      { seat: 'N' as const, card: c('S', 9) },
      { seat: 'E' as const, card: c('S', 2) }, // East plays 2 (low spot: discouraging)
      { seat: 'S' as const, card: c('S', 14) },
    ];
    const sigsDisc = detectDefenseSignals(playsDiscourage, null);
    expect(sigsDisc.some(s => s.kind === 'attitude_discourage')).toBe(true);
  });

  it('detects discard signaling when defender has no cards of led suit', () => {
    const plays = [
      { seat: 'S' as const, card: c('H', 14) },
      { seat: 'W' as const, card: c('H', 2) },
      { seat: 'N' as const, card: c('H', 3) },
      { seat: 'E' as const, card: c('S', 9) }, // East discards spade 9 (encouraging)
    ];
    const sigs = detectDefenseSignals(plays, null);
    expect(sigs.length).toBe(1);
    expect(sigs[0]!.kind).toBe('discard_encourage');
    expect(sigs[0]!.seat).toBe('E');
  });
});
