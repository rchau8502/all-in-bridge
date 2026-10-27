import { describe, it, expect } from 'vitest';
import {
  calculateMakeableContracts,
  formatAbilityTag,
  parseAbilityTag,
  calculateParScore,
  analyzeDeal,
  type MakeableTable,
} from './dds.js';
import { generateArchetypeDeal } from './deal-generator.js';
import { parseHandPbn } from './pbn.js';
import type { Hands } from './deck.js';

describe('dds - Double Dummy Analysis & Makeable Contracts', () => {
  it('calculates makeable contracts for a 3NT deal', () => {
    // North 16 HCP, South 10 HCP (26 combined HCP)
    const hands: Hands = {
      N: parseHandPbn('AQ5.KJ4.A87.T965'), // 16 HCP
      S: parseHandPbn('KT6.Q82.KT5.J842'), // 10 HCP
      E: parseHandPbn('984.AT5.Q64.A732'), // 9 HCP
      W: parseHandPbn('J732.9763.J932.K'), // 5 HCP
    };

    const table = calculateMakeableContracts(hands);
    expect(table.N.NT).toBeGreaterThanOrEqual(8);
    expect(table.S.NT).toBeGreaterThanOrEqual(8);
    expect(table.E.NT).toBeLessThanOrEqual(6);
    expect(table.W.NT).toBeLessThanOrEqual(6);
  });

  it('calculates makeable contracts for a 4S Major Fit deal', () => {
    // 5-4 Spades fit with 26 combined HCP
    const hands: Hands = {
      S: parseHandPbn('AKJT5.K4.A76.952'), // 16 HCP, 5 spades
      N: parseHandPbn('Q982.AJ5.854.K74'), // 11 HCP, 4 spades
      E: parseHandPbn('76.T982.KJT2.AQ3'), // 9 HCP
      W: parseHandPbn('43.Q763.Q93.JT86'), // 4 HCP
    };

    const table = calculateMakeableContracts(hands);
    expect(table.S.S).toBeGreaterThanOrEqual(10);
    expect(table.N.S).toBeGreaterThanOrEqual(10);
  });

  it('formats and parses PBN [Ability] tags correctly', () => {
    const original: MakeableTable = {
      N: { NT: 9, S: 10, H: 10, D: 8, C: 7 },
      S: { NT: 9, S: 10, H: 10, D: 8, C: 7 },
      E: { NT: 4, S: 3, H: 3, D: 5, C: 6 },
      W: { NT: 4, S: 3, H: 3, D: 5, C: 6 },
    };

    const tagStr = formatAbilityTag(original);
    expect(tagStr).toContain('N:9.10.10.8.7');
    expect(tagStr).toContain('S:9.10.10.8.7');
    expect(tagStr).toContain('E:4.3.3.5.6');
    expect(tagStr).toContain('W:4.3.3.5.6');

    const parsed = parseAbilityTag(tagStr);
    expect(parsed.N.NT).toBe(9);
    expect(parsed.N.S).toBe(10);
    expect(parsed.E.NT).toBe(4);
    expect(parsed.W.H).toBe(3);
  });

  it('calculates par score correctly for a making game', () => {
    const table: MakeableTable = {
      N: { NT: 9, S: 10, H: 10, D: 8, C: 7 },
      S: { NT: 9, S: 10, H: 10, D: 8, C: 7 },
      E: { NT: 4, S: 3, H: 3, D: 5, C: 6 },
      W: { NT: 4, S: 3, H: 3, D: 5, C: 6 },
    };

    const par = calculateParScore(table, 'None');
    expect(par.score).toBeGreaterThanOrEqual(400); // 4S makes (+420)
    expect(par.contract).toContain('4');
    expect(par.text.en).toContain('Par:');
    expect(par.text.zh).toContain('标准定约:');
  });

  it('analyzes deal completely with HCP breakdown and par score', () => {
    const hands = generateArchetypeDeal('major_opening');
    const analysis = analyzeDeal(hands);

    expect(analysis.totalHcp.NS + analysis.totalHcp.EW).toBe(40);
    expect(analysis.hcp.S).toBeGreaterThanOrEqual(0);
    expect(analysis.makeable.S.S).toBeGreaterThanOrEqual(0);
    expect(analysis.makeable.S.S).toBeLessThanOrEqual(13);
    expect(typeof analysis.par.score).toBe('number');
  });
});
