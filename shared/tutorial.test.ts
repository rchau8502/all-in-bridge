import { describe, it, expect } from 'vitest';
import { TutorialRunner } from './tutorial.js';
import type { Lesson, Step } from './tutorial.js';
import { LESSONS } from './lessons.js';

/** Walk a whole lesson taking every correct action. */
function walkLesson(lesson: Lesson): TutorialRunner {
  const r = new TutorialRunner(lesson);
  let guard = 0;
  while (!r.finished && guard++ < 500) {
    const s = r.currentStep()!;
    if (s.kind === 'info' || s.kind === 'result') {
      r.advance();
    } else if (s.kind === 'quiz') {
      const res = r.answerQuiz(s.answer);
      expect(res.ok).toBe(true);
    } else {
      const p = r.pendingLearnerAction();
      expect(p).not.toBeNull();
      const res = p!.kind === 'bid' ? r.submitBid(p!.expected) : r.submitPlay(p!.expected);
      expect(res.ok).toBe(true);
    }
  }
  expect(guard).toBeLessThan(500);
  expect(r.finished).toBe(true);
  return r;
}

describe('all lessons', () => {
  it('every lesson completes end-to-end with correct actions', () => {
    for (const lesson of LESSONS) {
      const r = walkLesson(lesson);
      expect(r.finished).toBe(true);
    }
  });

  it('the full-hand lesson ends 12-1 and scores 230', () => {
    const lesson = LESSONS.find(l => l.id === 'full-hand')!;
    const r = walkLesson(lesson);
    const result = r.getResult();
    expect(result).not.toBeNull();
    expect(result!.tricksTaken).toBe(12);
    expect(result!.made).toBe(true);
    // 2H undoubled: 2×30 trick + 50 part-score + 4×30 overtricks = 230
    expect(result!.total).toBe(230);
  });

  it('lesson ids are unique', () => {
    const ids = LESSONS.map(l => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('TutorialRunner mistakes', () => {
  it('rejects a wrong bid with the hint and does not advance', () => {
    const lesson = LESSONS.find(l => l.id === 'bidding')!;
    const r = new TutorialRunner(lesson);
    r.advance(); // info
    const before = r.stepIndex;
    const res = r.submitBid('1S'); // legal but wrong (expected 1H)
    expect(res.ok).toBe(false);
    expect(res.hint).toContain('1H');
    expect(r.stepIndex).toBe(before);
    // Now the right bid advances.
    expect(r.submitBid('1H').ok).toBe(true);
  });

  it('rejects a garbage bid with the hint', () => {
    const lesson = LESSONS.find(l => l.id === 'bidding')!;
    const r = new TutorialRunner(lesson);
    r.advance();
    expect(r.submitBid('banana').ok).toBe(false);
  });

  it('rejects a wrong card with the hint and does not advance', () => {
    const lesson = LESSONS.find(l => l.id === 'tricks')!;
    const r = new TutorialRunner(lesson);
    r.advance(); r.advance(); // infos
    const before = r.stepIndex;
    const res = r.submitPlay('D2'); // wrong (expected DA; also not held)
    expect(res.ok).toBe(false);
    expect(res.hint).toContain('AD');
    expect(r.stepIndex).toBe(before);
  });

  it('a wrong quiz answer does not advance', () => {
    const lesson = LESSONS.find(l => l.id === 'scoring')!;
    const r = new TutorialRunner(lesson);
    r.advance(); // info
    const s = r.currentStep()!;
    if (s.kind !== 'quiz') throw new Error('expected quiz');
    const wrong = (s.answer + 1) % s.options.length;
    const before = r.stepIndex;
    expect(r.answerQuiz(wrong).ok).toBe(false);
    expect(r.stepIndex).toBe(before);
    expect(r.answerQuiz(s.answer).ok).toBe(true);
  });

  it('advance() throws on non-info steps', () => {
    const lesson = LESSONS.find(l => l.id === 'scoring')!;
    const r = new TutorialRunner(lesson);
    r.advance(); // now at quiz
    expect(() => r.advance()).toThrow();
  });

  it('pendingLearnerAction is null on info steps', () => {
    const lesson = LESSONS.find(l => l.id === 'tricks')!;
    const r = new TutorialRunner(lesson);
    expect(r.pendingLearnerAction()).toBeNull();
  });
});

describe('lesson script self-consistency', () => {
  it('every scripted bid in every lesson is legal when applied', () => {
    // The walk above already applies every scripted bid/play through the
    // engine, which throws on illegal actions — this just makes the
    // guarantee explicit per lesson.
    for (const lesson of LESSONS) {
      expect(() => walkLesson(lesson)).not.toThrow();
    }
  });

  it('each lesson has at least one interactive step', () => {
    for (const lesson of LESSONS) {
      const interactive = lesson.steps.some(
        (s: Step) =>
          s.kind === 'quiz' ||
          ((s.kind === 'auction' || s.kind === 'play') &&
            s.script.some(a => 'learner' in a && a.learner === true))
      );
      expect(interactive).toBe(true);
    }
  });
});
