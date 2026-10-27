import { describe, it, expect } from 'vitest';
import { ACBL_CHALLENGES, getChallenge } from './challenges.js';
import { importDealFromPbn } from './pbn.js';
import type { Seat } from './deck.js';

describe('ACBL Deal Challenges Module', () => {
  it('contains 5 high-quality ACBL curated challenges', () => {
    expect(ACBL_CHALLENGES.length).toBe(5);
  });

  it('every challenge has complete bilingual title, category, objective, and hint', () => {
    for (const c of ACBL_CHALLENGES) {
      expect(c.title.en.trim().length).toBeGreaterThan(0);
      expect(c.title.zh.trim().length).toBeGreaterThan(0);
      expect(c.category.en.trim().length).toBeGreaterThan(0);
      expect(c.category.zh.trim().length).toBeGreaterThan(0);
      expect(c.objective.en.trim().length).toBeGreaterThan(0);
      expect(c.objective.zh.trim().length).toBeGreaterThan(0);
      expect(c.hint.en.trim().length).toBeGreaterThan(0);
      expect(c.hint.zh.trim().length).toBeGreaterThan(0);
      expect(c.acblClassRef.trim().length).toBeGreaterThan(0);
    }
  });

  it('every challenge deal parses into exactly 52 cards with 13 cards per hand', () => {
    const seats: Seat[] = ['N', 'E', 'S', 'W'];
    for (const c of ACBL_CHALLENGES) {
      const parsed = importDealFromPbn(c.deal);
      expect(parsed, `Failed to parse deal for ${c.id}`).not.toBeNull();
      if (!parsed) continue;

      let totalCards = 0;
      const seen = new Set<string>();

      for (const seat of seats) {
        const hand = parsed.hands[seat];
        expect(hand.length, `${c.id} seat ${seat} does not have 13 cards`).toBe(13);
        totalCards += hand.length;
        for (const card of hand) {
          const key = `${card.suit}:${card.rank}`;
          expect(seen.has(key), `${c.id} has duplicate card ${key}`).toBe(false);
          seen.add(key);
        }
      }

      expect(totalCards).toBe(52);
      expect(seen.size).toBe(52);
    }
  });

  it('every challenge contract matches its target tricks', () => {
    for (const c of ACBL_CHALLENGES) {
      expect(c.targetTricks).toBe(c.contract.level + 6);
      expect(c.contract.declarer).toBe('S');
    }
  });

  it('getChallenge finds challenge by id', () => {
    const c = getChallenge('classic_finesse');
    expect(c).toBeDefined();
    expect(c?.targetTricks).toBe(9);
    expect(getChallenge('nonexistent')).toBeUndefined();
  });
});
