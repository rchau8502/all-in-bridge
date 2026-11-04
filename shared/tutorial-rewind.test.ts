import { describe, it, expect } from 'vitest';
import { TutorialRunner } from './tutorial.js';
import { getLessons } from './lessons.js';
import { COURSE_MODULES } from './continuation-lessons.js';

function snapshot(r: TutorialRunner) {
  return JSON.stringify({ step: r.stepIndex, current: r.currentStep(), pending: r.pendingLearnerAction(),
    auction: r.auction.entries, turn: r.auction.turn, play: r.playView(), result: r.getResult() });
}
function forward(r: TutorialRunner) {
  const s = r.currentStep()!;
  if (s.kind === 'info' || s.kind === 'result') r.advance();
  else if (s.kind === 'quiz') r.answerQuiz(s.answer);
  else {
    const p = r.pendingLearnerAction();
    if (p) expect((p.kind === 'bid' ? r.submitBid(p.expected) : r.submitPlay(p.expected)).ok).toBe(true);
    else r.advance();
  }
}

describe('course extension and reversible tutorial', () => {
  it('restores the exact earlier state through every lesson, including completed play and reviews', () => {
    for (const lesson of getLessons('en')) {
      const r = new TutorialRunner(lesson);
      const states: string[] = [];
      let guard = 0;
      while (!r.finished && guard++ < 1500) { states.push(snapshot(r)); forward(r); }
      expect(r.finished, lesson.id).toBe(true);
      for (let i = states.length - 1; i >= 0; i--) {
        expect(r.goBack(), lesson.id).toBe(true);
        expect(snapshot(r), `${lesson.id} at ${i}`).toBe(states[i]);
      }
      expect(r.canGoBack()).toBe(false);
      expect(r.goBack()).toBe(false);
      // Replay after undo, to catch stale hands, turn or auction completion.
      guard = 0;
      while (!r.finished && guard++ < 1500) forward(r);
      expect(r.finished).toBe(true);
    }
  });

  it('does not record wrong answers as successful history', () => {
    const r = new TutorialRunner(getLessons('en').find(l => l.id === 'bidding')!);
    while (!r.pendingLearnerAction()) r.advance();
    const before = snapshot(r);
    expect(r.submitBid('7NT').ok).toBe(false);
    expect(snapshot(r)).toBe(before);
    forward(r);
    expect(r.goBack()).toBe(true);
    expect(snapshot(r)).toBe(before);
  });

  it('ends every lesson with a populated bilingual review table', () => {
    for (const lang of ['en', 'zh'] as const) for (const lesson of getLessons(lang)) {
      const last = lesson.steps[lesson.steps.length - 1]!;
      expect(last.kind).toBe('info');
      if (last.kind !== 'info') throw new Error('missing review');
      expect(last.review?.columns).toHaveLength(2);
      expect(last.review!.rows.length).toBeGreaterThanOrEqual(3);
      expect(last.review!.rows.every(row => row.length === 2 && row.every(Boolean))).toBe(true);
    }
  });

  it('uses legal complete decks with the declared point counts and shapes', () => {
    for (const m of COURSE_MODULES) {
      const lesson = getLessons('en').find(l => l.id === m.id)!;
      for (const seat of ['N','E','S','W'] as const) {
        const cards = lesson.hands[seat];
        const points = cards.reduce((n,c)=>n + (c.rank>10 ? c.rank-10 : 0),0);
        expect(points, `${m.id} ${seat}`).toBe(m.facts[seat]!.hcp);
        expect(['S','H','D','C'].map(s=>cards.filter(c=>c.suit===s).length)).toEqual(m.facts[seat]!.shape);
      }
    }
  });
});
