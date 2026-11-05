import { describe, it, expect } from 'vitest';
import { getLessons } from './lessons.js';
import { BASIC_FORCING_STATUS } from './forcing-notes.js';
import { Auction, parseBid } from './bidding.js';
import { REFERENCE_ROWS, REFERENCE_SECTIONS, explainBiddingLabels } from './bidding-reference.js';

describe('simple responses to a limited 1NT opening', () => {
  it('teaches the level decision before Stayman using an honest maximum and invitation', () => {
    const lessons = getLessons('en');
    const lesson = lessons.find(l => l.id === 'notrump-responses')!;
    expect(lessons.indexOf(lesson)).toBe(lessons.findIndex(l => l.id === 'stayman-fit') - 1);
    const hcp = (seat: 'N' | 'S') => lesson.hands[seat].reduce((n, c) => n + Math.max(0, c.rank - 10), 0);
    expect(hcp('S')).toBe(17);
    expect(hcp('N')).toBe(8);
    for (const suit of ['S', 'H']) expect(lesson.hands.N.filter(c => c.suit === suit)).toHaveLength(3);
    const auction = new Auction(lesson.dealer);
    const calls = lesson.steps.flatMap(s => s.kind === 'auction' ? s.script : []).map(a => 'expected' in a ? a.expected : a.bid);
    calls.forEach(c => auction.apply(parseBid(c)));
    expect(calls.filter(c => c !== 'P')).toEqual(['1NT', '2NT', '3NT']);
    expect(auction.contract()).toEqual(lesson.contract);
    expect(BASIC_FORCING_STATUS[lesson.id]).toEqual(['NF', 'NF', 'NF']);
    const zh = getLessons('zh').find(l => l.id === lesson.id)!;
    const prose = zh.steps.flatMap(s => s.kind === 'info' ? [s.text] : []).join(' ');
    for (const term of ['8–9', '10–15', 'MIN（低限）', 'MAX（高限）', '开叫者可以Pass']) expect(prose).toContain(term);
  });

  it('adds an initial response table while retaining the subsequent convention tables', () => {
    expect(REFERENCE_SECTIONS.findIndex(s => s.id === 'nt-responses')).toBe(REFERENCE_SECTIONS.findIndex(s => s.id === 'stayman') - 1);
    const rows = REFERENCE_ROWS.filter(r => r.section === 'nt-responses');
    expect(rows.map(r => r.id)).toEqual(['nt-response-pass', 'nt-response-invite', 'nt-response-game', 'nt-response-stayman', 'nt-response-transfer-hearts', 'nt-response-transfer-spades']);
    expect(rows[1]!.requirements.zh).toContain('8–9');
    expect(rows[2]!.requirements.zh).toContain('10–15');
    expect(rows[2]!.next.zh).toContain('开叫者通常Pass');
    expect(rows[4]!.sequence).toContain('2♦ → 2♥');
    expect(rows[5]!.sequence).toContain('2♥ → 2♠');
    const rebid = REFERENCE_ROWS.find(r => r.id === 'rebid-own')!;
    expect(explainBiddingLabels(rebid.sequence, 'zh')).toBe('1M – 应叫 – 2M');
    expect(rebid.requirements.zh).toContain('也可以是1NT');
  });
});
