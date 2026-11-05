import { describe, it, expect } from 'vitest';
import { findReferenceRows, normalizeReferenceQuery, explainBiddingLabels, REFERENCE_ROWS, REFERENCE_SECTIONS } from './bidding-reference.js';
import { getLessons } from './lessons.js';

describe('bilingual bidding quick reference', () => {
  it('covers all handout topics with unique bilingual entries and valid source/lesson links', () => {
    expect(REFERENCE_SECTIONS).toHaveLength(15);
    expect(REFERENCE_ROWS).toHaveLength(137);
    expect(new Set(REFERENCE_ROWS.map(row => row.id)).size).toBe(REFERENCE_ROWS.length);
    const lessons = new Set(getLessons('en').map(l => l.id));
    for (const section of REFERENCE_SECTIONS) expect(REFERENCE_ROWS.some(r => r.section === section.id)).toBe(true);
    for (const row of REFERENCE_ROWS) {
      expect(REFERENCE_SECTIONS.some(s => s.id === row.section), row.id).toBe(true);
      expect(lessons.has(row.lessonId), row.id).toBe(true);
      for (const field of [row.title, row.requirements, row.next]) {
        expect(field.en.trim().length, row.id).toBeGreaterThan(5);
        expect(field.zh.trim().length, row.id).toBeGreaterThan(1);
      }
      for (const page of row.pages) expect(page >= 3 && page <= 10, row.id).toBe(true);
      expect(row.note.en === '', row.id).toBe(row.note.zh === '');
    }
  });

  it('searches Chinese/English, ASCII/symbol auctions, 2N spelling and multiple terms', () => {
    expect(normalizeReferenceQuery('1♥ — 2♣')).toBe(normalizeReferenceQuery('1h-2c'));
    expect(normalizeReferenceQuery('2NT')).toBe(normalizeReferenceQuery('2N'));
    expect(findReferenceRows('半逼叫').some(r => r.id === 'major-semi')).toBe(true);
    expect(findReferenceRows('Jacoby 2N').some(r => r.id === 'major-jacoby')).toBe(true);
    expect(findReferenceRows('Texas 4NT').some(r => r.id === 'texas-rkcb')).toBe(true);
    expect(findReferenceRows('Texas 4NT')[0]!.id).toBe('texas-rkcb');
    expect(findReferenceRows('半逼叫')[0]!.id).toBe('major-semi');
    expect(findReferenceRows('1NT')[0]!.id).toBe('open-notrump');
    expect(findReferenceRows('1NT', 'stayman').every(r => r.section === 'stayman')).toBe(true);
    expect(findReferenceRows('not-a-real-convention-987')).toEqual([]);
    expect(findReferenceRows('   ')).toHaveLength(137);
  });

  it('filters section, level and forcing status without mixing alternative raises', () => {
    const basic = findReferenceRows('', 'major-responses', 'basic');
    expect(basic.some(r => r.id === 'major-natural-limit')).toBe(true);
    expect(basic.some(r => r.id === 'bergen-weak')).toBe(false);
    const advanced = findReferenceRows('', 'major-responses', 'advanced');
    expect(advanced.some(r => r.id === 'bergen-weak')).toBe(true);
    expect(advanced.some(r => r.id === 'major-natural-limit')).toBe(false);
    expect(findReferenceRows('', 'all', 'basic', 'GF').every(r => r.status === 'GF' && r.level === 'basic')).toBe(true);
    expect(findReferenceRows('', 'slams', 'basic')).toEqual([]);
  });

  it('keeps the confirmed Texas RKCB correction and distinguishes artificial replies from sign-offs', () => {
    const texas = REFERENCE_ROWS.find(r => r.id === 'texas-rkcb')!;
    expect(texas.title.en).toContain('RKCB');
    expect(texas.status).toBe('F1');
    expect(texas.requirements.zh).not.toContain('8–9');
    expect(REFERENCE_ROWS.find(r => r.id === 'quantitative-4nt')!.status).toBe('INV');
    for (const id of ['rkcb-one-four', 'rkcb-zero-three', 'rkcb-two-noq', 'rkcb-two-q']) {
      expect(REFERENCE_ROWS.find(r => r.id === id)!.status).toBe('REPLY');
    }
  });

  it('explains the two label pairs and confines the alternative-raise warning to its two routes', () => {
    expect(explainBiddingLabels('MIN / MAX · INV / GF', 'zh')).toBe('MIN（低限） / MAX（高限） · INV（邀请） / GF（逼局）');
    expect(REFERENCE_ROWS.filter(r => r.warning).map(r => r.id)).toEqual(['major-natural-limit', 'bergen-weak']);
    expect(findReferenceRows('', 'all', 'all', 'INV').every(r => r.status === 'INV')).toBe(true);
  });

  it('preserves key course agreements rather than copying source inconsistencies', () => {
    expect(REFERENCE_ROWS.find(r => r.id === 'minor-inverted')!.requirements.zh).toContain('11点以上');
    expect(REFERENCE_ROWS.find(r => r.id === 'major-semi')!.note.zh).toContain('缺门');
    expect(REFERENCE_ROWS.find(r => r.id === 'major-semi-pass')!.requirements.en).toContain('12–13');
    expect(REFERENCE_ROWS.find(r => r.id === 'jacoby-medium')!.requirements.en).toContain('14–15');
    expect(REFERENCE_ROWS.some(r => r.id === 'mini-splinter')).toBe(false);
    expect(REFERENCE_ROWS.find(r => r.id === 'nt-response-invite')!.status).toBe('INV');
    expect(REFERENCE_ROWS.find(r => r.id === 'nt-response-game')!.status).toBe('GF');
    expect(REFERENCE_ROWS.find(r => r.id === 'rebid-one-suit')!.status).toBe('NF');
  });
});
