import { describe, it, expect } from 'vitest';
import { ACBL_GLOSSARY, getGlossaryTerms, findGlossaryTerm } from './glossary.js';

describe('ACBL Glossary Module', () => {
  it('contains at least 25 core terms from the ACBL Intro to Bridge Manual', () => {
    expect(ACBL_GLOSSARY.length).toBeGreaterThanOrEqual(25);
  });

  it('all terms have both English and Chinese definitions', () => {
    for (const item of ACBL_GLOSSARY) {
      expect(item.id).toBeTruthy();
      expect(item.term.en).toBeTruthy();
      expect(item.term.zh).toBeTruthy();
      expect(item.definition.en).toBeTruthy();
      expect(item.definition.zh).toBeTruthy();
      expect(['basics', 'play', 'bidding', 'scoring']).toContain(item.category);
    }
  });

  it('supports category filtering', () => {
    const biddingTerms = getGlossaryTerms('en', 'bidding');
    expect(biddingTerms.length).toBeGreaterThan(0);
    expect(biddingTerms.every(t => t.category === 'bidding')).toBe(true);
  });

  it('supports search query filtering', () => {
    const finesseEn = getGlossaryTerms('en', 'all', 'finesse');
    expect(finesseEn.some(t => t.id === 'finesse')).toBe(true);

    const finesseZh = getGlossaryTerms('zh', 'all', '飞牌');
    expect(finesseZh.some(t => t.id === 'finesse')).toBe(true);
  });

  it('findGlossaryTerm returns exact term', () => {
    const term = findGlossaryTerm('four-on-the-floor', 'en');
    expect(term).not.toBeNull();
    expect(term?.term).toContain('Four on the Floor');
    expect(term?.mnemonic).toBeDefined();

    const termZh = findGlossaryTerm('four-on-the-floor', 'zh');
    expect(termZh?.definition).toContain('低花');
  });

  it('includes key ACBL mnemonics', () => {
    const hf = findGlossaryTerm('high-five', 'en');
    expect(hf?.mnemonic).toContain('High Five');

    const fotf = findGlossaryTerm('four-on-the-floor', 'en');
    expect(fotf?.mnemonic).toContain('Four on the floor');

    const oc = findGlossaryTerm('overcall', 'en');
    expect(oc?.mnemonic).toContain('10-5-2');
  });
});
