import { describe, it, expect } from 'vitest';
import { getLessons } from './lessons.js';
import { getChapterForLesson } from './chapters.js';
import { BASIC_FORCING_STATUS } from './forcing-notes.js';

describe('semi-forcing 1NT conversation', () => {
  it('is explicitly visible in foundations with an 11-point three-card limit raise', () => {
    const lesson=getLessons('en').find(l=>l.id==='strength-and-minors')!;
    expect(lesson.title).toContain('Semi-Forcing 1NT');
    expect(getChapterForLesson(lesson.id)?.track).toBe('basic');
    const hcp=(seat:'N'|'S')=>lesson.hands[seat].reduce((n,c)=>n+(c.rank>10?c.rank-10:0),0);
    expect(hcp('N')).toBe(11);
    expect(hcp('S')).toBe(15);
    expect(lesson.hands.N.filter(c=>c.suit==='S')).toHaveLength(3);
    expect(lesson.hands.S.filter(c=>c.suit==='C')).toHaveLength(4);
    expect(lesson.hands.S.filter(c=>c.suit==='H')).toHaveLength(1);
    const calls=lesson.steps.flatMap(s=>s.kind==='auction'?s.script:[])
      .map(a=>'expected' in a?a.expected:a.bid).filter(b=>b!=='P');
    expect(calls).toEqual(['1S','1NT','2C','3S','4S']);
    expect(BASIC_FORCING_STATUS[lesson.id]![1]).toBe('SF');
  });
  it('keeps the wide range, void example and narrow pass exception in both languages', () => {
    const zh=getLessons('zh').find(l=>l.id==='strength-and-minors')!;
    const text=zh.steps.flatMap(s=>s.kind==='info'?[s.text]:[]).join(' ');
    for(const phrase of ['5–12','11点','三张支持','缺门','12–13','5-3-3-2','不保证均型','先1NT','我说完了']) expect(text).toContain(phrase);
    expect(zh.steps.some(s=>s.kind==='auction'&&s.script.some(a=>a.note?.startsWith('【半逼叫】')))).toBe(true);
  });
});
