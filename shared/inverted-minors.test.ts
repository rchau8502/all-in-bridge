import { describe, it, expect } from 'vitest';
import { getLessons } from './lessons.js';
import { BASIC_FORCING_STATUS } from './forcing-notes.js';
import { getChapterForLesson } from './chapters.js';
import { Auction, parseBid } from './bidding.js';

describe('raise placement and forcing status', () => {
  it('keeps basic notrump conventions in foundations and lets the strong opener declare', () => {
    for (const id of ['stayman-fit', 'jacoby-transfers']) {
      expect(getChapterForLesson(id)?.track).toBe('basic');
      const lesson=getLessons('en').find(l=>l.id===id)!;
      const auction=new Auction(lesson.dealer);
      for(const action of lesson.steps.flatMap(s=>s.kind==='auction'?s.script:[])) {
        auction.apply(parseBid('expected' in action?action.expected:action.bid));
      }
      expect(auction.contract()!.declarer).toBe('S');
      expect(lesson.hands.S.reduce((n,c)=>n+(c.rank>10?c.rank-10:0),0)).toBe(17);
      const prose=lesson.steps.flatMap(s=>s.kind==='info'?[s.text]:[]).join(' ');
      expect(prose).toContain('dummy');
      expect(prose).toContain('hidden');
      expect(prose).toContain('opening lead');
      expect(lesson.steps.some(s=>s.kind==='info'&&s.review?.rows.some(r=>r[0]==='Strong hand as declarer'||r[0]==='Why transfer?'))).toBe(true);
    }
    expect(getChapterForLesson('stayman-smolen')?.track).toBe('advanced');
    expect(getChapterForLesson('texas-transfers')?.track).toBe('advanced');
  });
  it('places inverted minors in advanced and keeps Jacoby 2NT and splinters in foundations', () => {
    expect(getChapterForLesson('inverted-minor-raises')?.track).toBe('advanced');
    expect(getChapterForLesson('major-forcing-raises')?.track).toBe('basic');
    expect(getChapterForLesson('bergen-raises')?.track).toBe('advanced');
  });

  it('has a real five-card minor raise and stopped side suits before 3NT', () => {
    const lesson = getLessons('en').find(l=>l.id==='inverted-minor-raises')!;
    const hcp = (seat: 'N'|'S')=>lesson.hands[seat].reduce((n,c)=>n+(c.rank>10?c.rank-10:0),0);
    expect(hcp('N')).toBe(14);
    expect(hcp('S')).toBe(13);
    expect(lesson.hands.N.filter(c=>c.suit==='C')).toHaveLength(5);
    expect(lesson.hands.S.filter(c=>c.suit==='C')).toHaveLength(4);
    expect(lesson.hands.N.filter(c=>c.suit==='H').map(c=>c.rank)).toContain(13);
    expect(lesson.hands.S.filter(c=>c.suit==='D').map(c=>c.rank)).toContain(13);
    expect(lesson.hands.S.filter(c=>c.suit==='S').map(c=>c.rank)).toEqual(expect.arrayContaining([13,12]));
    const auction = new Auction(lesson.dealer);
    const calls=lesson.steps.flatMap(s=>s.kind==='auction'?s.script:[]);
    for(const action of calls) auction.apply(parseBid('expected' in action?action.expected:action.bid));
    expect(auction.contract()).toEqual(lesson.contract);
    expect(BASIC_FORCING_STATUS['inverted-minor-raises']![1]).toBe('F1');
  });

  it('labels every basic non-pass call in both languages without claiming all limited bids are non-forcing', () => {
    for(const lang of ['en','zh'] as const) for(const lesson of getLessons(lang)) {
      if(getChapterForLesson(lesson.id)?.track!=='basic')continue;
      for(const step of lesson.steps)if(step.kind==='auction')for(const action of step.script) {
        if(('expected' in action?action.expected:action.bid)==='P')continue;
        expect(action.note).toMatch(lang==='zh'?/^【(?:不逼叫|半逼叫|逼叫一轮|逼局)】/:/^\[(?:Non-forcing|Semi-forcing|Forcing one round|Game forcing)\]/);
      }
    }
    const lesson=getLessons('zh').find(l=>l.id==='major-forcing-raises')!;
    expect(lesson.steps.some(s=>s.kind==='info'&&s.text.includes('虽有点力范围，也仍然逼局'))).toBe(true);
  });
});
