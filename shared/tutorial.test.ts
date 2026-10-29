import { describe, it, expect } from 'vitest';
import { TutorialRunner, learnerSeatOf } from './tutorial.js';
import type { Lesson, Step } from './tutorial.js';
import { LESSONS, getLessons } from './lessons.js';

/** Walk a whole lesson: tap through info/result steps and scripted actions, take every correct learner action. */
function walkLesson(lesson: Lesson): TutorialRunner {
  const r = new TutorialRunner(lesson);
  let guard = 0;
  while (!r.finished && guard++ < 1000) {
    const s = r.currentStep()!;
    if (s.kind === 'info' || s.kind === 'result') {
      r.advance();
    } else if (s.kind === 'quiz') {
      throw new Error('lessons no longer use quiz steps — teach visually instead');
    } else {
      const p = r.pendingLearnerAction();
      if (p) {
        const res = p!.kind === 'bid' ? r.submitBid(p!.expected) : r.submitPlay(p!.expected);
        expect(res.ok).toBe(true);
      } else {
        r.advance(); // reveal next scripted bid/play, or move past a completed script
      }
    }
  }
  expect(guard).toBeLessThan(1000);
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

  // The two defense lessons put the learner in a defender's chair, and the
  // deal is written so the defense actually comes out ahead — a lesson that
  // claims "4♠ is down" has to actually beat it, or the coaching text teaches
  // a line that does not work.
  it('the defense lessons really do beat the contract', () => {
    const leads = walkLesson(LESSONS.find(l => l.id === 'defense-leads')!).getResult()!;
    expect(leads.made).toBe(false);
    expect(leads.tricksTaken).toBe(6); // 3NT needs 9 → down three
    const play = walkLesson(LESSONS.find(l => l.id === 'defense-play')!).getResult()!;
    expect(play.made).toBe(false);
    expect(play.tricksTaken).toBe(8); // 4♠ needs 10 → down two
  });
});

describe('bid explanations', () => {
  it('every bid in every auction carries a note, in both languages', () => {
    for (const lang of ['en', 'zh'] as const) {
      for (const lesson of getLessons(lang)) {
        for (const s of lesson.steps) {
          if (s.kind !== 'auction') continue;
          for (const a of s.script) {
            expect(a.note, `${lesson.id} (${lang})`).toBeTruthy();
            expect(a.note!.length).toBeGreaterThan(10);
          }
        }
      }
    }
  });
});

describe('hands match the story the script tells', () => {
  const HCP: Record<string, number> = { '14': 4, '13': 3, '12': 2, '11': 1 };
  const hcpOf = (lessonId: string, seat: 'N' | 'E' | 'S' | 'W') =>
    LESSONS.find(l => l.id === lessonId)!.hands[seat].reduce((n, c) => n + (HCP[c.rank] ?? 0), 0);
  const suitLen = (lessonId: string, seat: 'N' | 'E' | 'S' | 'W', suit: string) =>
    LESSONS.find(l => l.id === lessonId)!.hands[seat].filter(c => c.suit === suit).length;

  it('bidding: North passes on a real pass hand; East opens and rebids diamonds on a real opener', () => {
    expect(hcpOf('bidding', 'N')).toBeLessThan(12);
    expect(hcpOf('bidding', 'E')).toBeGreaterThanOrEqual(12);
    expect(suitLen('bidding', 'E', 'D')).toBeGreaterThanOrEqual(5);
  });

  it('overcall: East opens 1D on a real opener; South overcalls on the A-K-Q-J-5 of hearts', () => {
    expect(hcpOf('overcall', 'E')).toBeGreaterThanOrEqual(12);
    expect(suitLen('overcall', 'E', 'D')).toBeGreaterThanOrEqual(4);
    expect(suitLen('overcall', 'S', 'H')).toBe(5);
    expect(suitLen('overcall', 'N', 'H')).toBe(4);
  });

  it('every lesson deals a legal deck: 52 unique cards, 13 per seat', () => {
    for (const lesson of LESSONS) {
      const all = (['N', 'E', 'S', 'W'] as const).flatMap(seat => {
        expect(lesson.hands[seat]).toHaveLength(13);
        return lesson.hands[seat].map(c => `${c.suit}${c.rank}`);
      });
      expect(new Set(all).size, lesson.id).toBe(52);
    }
  });
});

describe('post-trick review data', () => {  it('lesson 1 trick 1: exposes all four plays in order, South wins with the ace', () => {
    const lesson = LESSONS.find(l => l.id === 'deck')!;
    const r = new TutorialRunner(lesson);
    // Advance to the first play step, then reveal plays until trick 1 completes.
    let guard = 0;
    while (r.completedTrickCount() === 0 && guard++ < 200) {
      const s = r.currentStep()!;
      if (s.kind === 'info' || s.kind === 'result') r.advance();
      else {
        const p = r.pendingLearnerAction();
        if (p) expect(r.submitPlay(p.expected).ok).toBe(true);
        else r.advance();
      }
    }
    expect(r.completedTrickCount()).toBe(1);
    const review = r.lastCompletedTrick();
    expect(review).not.toBeNull();
    expect(review!.plays.map(p => `${p.seat}:${p.card.rank}${p.card.suit}`)).toEqual([
      'W:4H', 'N:5H', 'E:2H', 'S:14H',
    ]);
    expect(review!.winner).toBe('S');
    expect(review!.trump).toBeNull(); // lesson 1 preset contract is 1NT
    expect(review!.tricksWon).toEqual({ NS: 1, EW: 0 });
  });
});

describe('TutorialRunner mistakes', () => {
  /** Tap through scripted bids/plays until it's the learner's turn. */
  function tapToLearner(r: TutorialRunner): void {
    let guard = 0;
    while (!r.pendingLearnerAction() && guard++ < 50) r.advance();
    expect(r.pendingLearnerAction()).not.toBeNull();
  }

  it('rejects a wrong bid with the hint and does not advance', () => {
    const lesson = LESSONS.find(l => l.id === 'bidding')!;
    const r = new TutorialRunner(lesson);
    r.advance(); // info
    tapToLearner(r); // N P, E 1D revealed
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
    tapToLearner(r);
    expect(r.submitBid('banana').ok).toBe(false);
  });

  it('rejects a wrong card with the hint and does not advance', () => {
    const lesson = LESSONS.find(l => l.id === 'tricks')!;
    const r = new TutorialRunner(lesson);
    while (r.currentStep()!.kind === 'info') r.advance(); // infos
    tapToLearner(r); // W/N/E cards revealed
    const before = r.stepIndex;
    const res = r.submitPlay('D2'); // wrong (expected DA; also not held)
    expect(res.ok).toBe(false);
    expect(res.hint).toContain('AD');
    expect(r.stepIndex).toBe(before);
  });

  it('lessons teach visually instead of quizzing', () => {
    for (const lesson of LESSONS) {
      expect(lesson.steps.some(s => s.kind === 'quiz')).toBe(false);
    }
    // The engine still supports quizzes; the content just doesn't use them.
    const r = new TutorialRunner(LESSONS[0]!);
    expect(r.pendingLearnerAction()).toBeNull();
  });

  it('advance() reveals scripted actions one at a time, throws when waiting for learner', () => {
    const lesson = LESSONS.find(l => l.id === 'tricks')!;
    const r = new TutorialRunner(lesson);
    while (r.currentStep()!.kind === 'info') r.advance(); // infos → now at a play step, nothing revealed yet
    expect(r.pendingLearnerAction()).toBeNull();
    expect(r.playView()!.trick.length).toBe(0);
    expect(r.playView()!.tricksWon).toEqual({ NS: 0, EW: 0 });
    r.advance(); // reveal W's lead
    expect(r.playView()!.trick.length).toBe(1);
    r.advance(); // reveal N
    r.advance(); // reveal E
    expect(r.pendingLearnerAction()).not.toBeNull(); // now it's the learner's turn
    expect(() => r.advance()).toThrow(); // can't tap past a learner action
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
          (s.kind === 'auction' || s.kind === 'play') &&
          s.script.some(a => 'learner' in a && a.learner === true)
      );
      expect(interactive).toBe(true);
    }
  });
});

describe('chinese lessons', () => {
  it('every zh lesson completes end-to-end with correct actions', () => {
    const zh = getLessons('zh');
    expect(zh).toHaveLength(LESSONS.length);
    for (const lesson of zh) {
      const r = walkLesson(lesson);
      expect(r.finished).toBe(true);
    }
  });

  it('zh text is translated (not english), same scripts', () => {
    const zh = getLessons('zh');
    expect(zh[0]!.title).toBe('认识牌朋友');
    expect(zh[1]!.title).toBe('赢墩小高手');
    expect(zh[2]!.title).toBe('数一数，做计划');
    expect(zh[3]!.title).toBe('无将树立长套');
    expect(zh[4]!.title).toBe('将牌的威力');
    expect(zh[5]!.title).toBe('有将数输墩');
    expect(zh[6]!.title).toBe('输墩消去');
    expect(zh[7]!.title).toBe('防守一：首攻');
    expect(zh[8]!.title).toBe('防守二：配合出牌');
    expect(zh[9]!.title).toBe('定约：一份承诺');
    expect(zh[10]!.title).toBe('叫牌就是说话');
    expect(zh[11]!.title).toBe('回答搭档');
    expect(zh[12]!.title).toBe('加叫，然后打牌');
    expect(zh[13]!.title).toBe('开叫者再说');
    expect(zh[14]!.title).toBe('冲成局！');
    expect(zh[15]!.title).toBe('争叫，抢进来');
    // Same step structure, same scripts — only text differs.
    for (let i = 0; i < LESSONS.length; i++) {
      const en = LESSONS[i]!;
      const z = zh[i]!;
      expect(z.steps.length).toBe(en.steps.length);
      expect(z.id).toBe(en.id);
    }
    // The full-hand zh lesson scores the same 230.
    const r = walkLesson(zh.find(l => l.id === 'full-hand')!);
    expect(r.getResult()!.total).toBe(230);
  });
});

describe('learner seat', () => {
  // Everything addressed to "you" hangs off this seat: the post-trick review
  // calls one opponent "dummy" and the other "partner", the reaction voice
  // cheers or groans, and the win tally splits into "yours" and "theirs".
  // Declaring lessons drive South's hand AND the dummy's, so the seat to
  // report is South — never North, or the dummy gets congratulated as the
  // learner's partner.
  it('is the defender in the defense lessons and the declarer everywhere else', () => {
    const seats = Object.fromEntries(getLessons('en').map(l => [l.id, learnerSeatOf(l)]));
    const defended = Object.entries(seats)
      .filter(([, seat]) => seat !== 'S')
      .map(([id]) => id)
      .sort();
    expect(defended).toEqual(['defense-leads', 'defense-play']);
    expect(seats['defense-leads']).toBe('W');
    expect(seats['defense-play']).toBe('E');
    expect(seats['strategy']).toBe('S');
  });
});
