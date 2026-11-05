import { describe, it, expect } from 'vitest';
import { getLessons } from './lessons.js';
import { getChapterForLesson } from './chapters.js';
import { BASIC_FORCING_STATUS } from './forcing-notes.js';
import { Auction, parseBid } from './bidding.js';
import { REFERENCE_ROWS } from './bidding-reference.js';

describe('the adopted Mini-Splinter agreement', () => {
  it('uses an honest limited hand with four hearts and actual diamond shortness', () => {
    const lesson = getLessons('en').find(l => l.id === 'mini-splinters')!;
    const hcp = (seat: 'N' | 'S') => lesson.hands[seat].reduce((n, c) => n + Math.max(0, c.rank - 10), 0);
    expect(hcp('N')).toBe(9);
    expect(hcp('S')).toBe(16);
    expect(lesson.hands.N.filter(c => c.suit === 'H')).toHaveLength(4);
    expect(lesson.hands.N.filter(c => c.suit === 'D')).toHaveLength(1);
    expect(lesson.hands.S.filter(c => c.suit === 'H')).toHaveLength(5);
    expect(lesson.hands.S.filter(c => c.suit === 'C')).toHaveLength(4);
    expect(getChapterForLesson(lesson.id)?.track).toBe('basic');
  });

  it('asks for the short suit and legally reaches the agreed heart game', () => {
    const lesson = getLessons('en').find(l => l.id === 'mini-splinters')!;
    const auction = new Auction(lesson.dealer);
    const calls = lesson.steps.flatMap(s => s.kind === 'auction' ? s.script : []).map(a => 'expected' in a ? a.expected : a.bid);
    calls.forEach(call => auction.apply(parseBid(call)));
    expect(calls.filter(c => c !== 'P')).toEqual(['1H', '3S', '3NT', '4D', '4H']);
    expect(auction.contract()).toEqual(lesson.contract);
    expect(BASIC_FORCING_STATUS[lesson.id]).toEqual(['NF', 'GF', 'GF', 'GF', 'NF']);
    expect(REFERENCE_ROWS.find(r => r.id === 'mini-splinter')!.status).toBe('GF');
    const zh = getLessons('zh').find(l => l.id === lesson.id)!;
    const text = zh.steps.flatMap(s => s.kind === 'info' ? [s.text] : []).join(' ');
    for (const term of ['MIN（低限）', 'MAX（高限）', 'INV（邀请）', 'GF（逼局）', '越过3♥']) expect(text).toContain(term);
    expect(zh.steps[zh.steps.length - 1]?.kind).toBe('info');
  });
});
