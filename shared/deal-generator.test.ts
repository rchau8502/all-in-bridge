import { describe, it, expect } from 'vitest';
import { generateArchetypeDeal, DEAL_ARCHETYPES, type DealArchetype } from './deal-generator.js';
import { calculateHcp, getSuitLengths, isBalancedHand } from './evaluator.js';

describe('deal-generator', () => {
  it('has valid metadata for all defined archetypes', () => {
    expect(DEAL_ARCHETYPES.length).toBe(7);
    for (const a of DEAL_ARCHETYPES) {
      expect(a.id).toBeDefined();
      expect(a.label.en).toBeTruthy();
      expect(a.label.zh).toBeTruthy();
      expect(a.desc.en).toBeTruthy();
      expect(a.desc.zh).toBeTruthy();
    }
  });

  it('generates valid 52-card deals with 13 cards per seat', () => {
    const hands = generateArchetypeDeal('random');
    expect(hands.S.length).toBe(13);
    expect(hands.N.length).toBe(13);
    expect(hands.E.length).toBe(13);
    expect(hands.W.length).toBe(13);

    // Verify all 52 cards are unique
    const all = [...hands.S, ...hands.N, ...hands.E, ...hands.W];
    const unique = new Set(all.map(c => `${c.suit}${c.rank}`));
    expect(unique.size).toBe(52);
  });

  it('generates 1NT opening deals (15-17 HCP, balanced)', () => {
    for (let i = 0; i < 3; i++) {
      const hands = generateArchetypeDeal('1nt_opening');
      const hcp = calculateHcp(hands.S);
      const lens = getSuitLengths(hands.S);
      expect(hcp).toBeGreaterThanOrEqual(15);
      expect(hcp).toBeLessThanOrEqual(17);
      expect(isBalancedHand(lens)).toBe(true);
    }
  });

  it('generates Major opening deals (12-21 HCP, 5+ Major)', () => {
    for (let i = 0; i < 3; i++) {
      const hands = generateArchetypeDeal('major_opening');
      const hcp = calculateHcp(hands.S);
      const lens = getSuitLengths(hands.S);
      expect(hcp).toBeGreaterThanOrEqual(12);
      expect(hcp).toBeLessThanOrEqual(21);
      expect(lens.S >= 5 || lens.H >= 5).toBe(true);
    }
  });

  it('generates Minor opening deals (12-21 HCP, 4+ Minor)', () => {
    for (let i = 0; i < 3; i++) {
      const hands = generateArchetypeDeal('minor_opening');
      const hcp = calculateHcp(hands.S);
      const lens = getSuitLengths(hands.S);
      expect(hcp).toBeGreaterThanOrEqual(12);
      expect(hcp).toBeLessThanOrEqual(21);
      expect(lens.C >= 4 || lens.D >= 4).toBe(true);
    }
  });

  it('generates Weak Two deals (6-10 HCP, 6-card suit)', () => {
    const hands = generateArchetypeDeal('weak_two');
    const hcp = calculateHcp(hands.S);
    const lens = getSuitLengths(hands.S);
    expect(hcp).toBeGreaterThanOrEqual(6);
    expect(hcp).toBeLessThanOrEqual(10);
    const has6 = lens.D === 6 || lens.H === 6 || lens.S === 6;
    expect(has6).toBe(true);
  });

  it('generates Strong 2C deals (22+ HCP)', () => {
    const hands = generateArchetypeDeal('strong_2c');
    const hcp = calculateHcp(hands.S);
    expect(hcp).toBeGreaterThanOrEqual(22);
  });

  it('generates Slam Try deals (31+ combined HCP for NS)', () => {
    const hands = generateArchetypeDeal('slam_try');
    const sHcp = calculateHcp(hands.S);
    const nHcp = calculateHcp(hands.N);
    expect(sHcp + nHcp).toBeGreaterThanOrEqual(31);
  });
});
