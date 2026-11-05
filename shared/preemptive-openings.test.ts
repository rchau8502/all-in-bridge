import { describe, it, expect } from 'vitest';
import { getLessons } from './lessons.js';
import { Auction, parseBid } from './bidding.js';
import { REFERENCE_ROWS, findReferenceRows } from './bidding-reference.js';

describe('CCBA preemptive and strong openings', () => {
  it('places the foundation after one-level openings and shows a weak opener reaching game with a strong partner', () => {
    const lessons = getLessons('zh');
    const lesson = lessons.find(l => l.id === 'preemptive-openings')!;
    expect(lessons.indexOf(lesson)).toBe(lessons.findIndex(l => l.id === 'bidding') + 1);
    const auction = new Auction(lesson.dealer);
    const calls = lesson.steps.flatMap(s => s.kind === 'auction' ? s.script : [])
      .map(a => 'expected' in a ? a.expected : a.bid);
    calls.forEach(c => auction.apply(parseBid(c)));
    expect(calls.filter(c => c !== 'P')).toEqual(['2S', '4S']);
    expect(auction.contract()).toEqual(lesson.contract);
    const prose = lesson.steps.flatMap(s => s.kind === 'info' ? [s.text] : []).join(' ');
    for (const phrase of ['第一层意思', '第二层意思', '6–10', '9–12', '5–10', '二三法则', '不是邀请', '并不自动逼局']) expect(prose).toContain(phrase);
    const last = lesson.steps[lesson.steps.length - 1]!;
    expect(last.kind === 'info' && last.review?.rows.length).toBe(6);
  });

  it('keeps weak twos, three-level preempts and artificial strong clubs in the opening table', () => {
    const rows = REFERENCE_ROWS.filter(r => r.lessonId === 'preemptive-openings');
    expect(rows).toHaveLength(5);
    expect(rows.every(r => r.section === 'openings' && r.level === 'basic')).toBe(true);
    const weak = rows.filter(r => r.id.startsWith('open-weak-two-'));
    expect(weak.map(r => r.sequence)).toEqual(['2♦', '2♥', '2♠']);
    for (const r of weak) {
      expect(r.status).toBe('NF');
      expect(r.requirements.zh).toContain('6–10');
      expect(r.requirements.zh).toContain('9–12');
    }
    const strong = rows.find(r => r.id === 'open-strong-two-clubs')!;
    for (const value of ['22+', '9+', '10+', '18+', '20+']) expect(strong.requirements.en).toContain(value);
    expect(strong.status).toBe('F1');
    expect(strong.next.zh).toContain('不自动逼局');
    expect(findReferenceRows('2C', 'openings')[0]!.id).toBe(strong.id);
  });
});
