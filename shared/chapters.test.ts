import { describe, it, expect } from 'vitest';
import { ACBL_CHAPTERS, getChapterForLesson, savedLessonIndex, PREVIOUS_LESSON_IDS, canonicalLessonId } from './chapters.js';
import { LESSONS } from './lessons.js';

describe('ACBL Chapters Module', () => {
  it('covers every lesson in teaching order with no duplicates', () => {
    const chapterLessonIds = ACBL_CHAPTERS.flatMap(ch => ch.lessonIds);
    expect(chapterLessonIds).toHaveLength(36);
    expect(new Set(chapterLessonIds).size).toBe(chapterLessonIds.length);

    const allLessonIds = LESSONS.map(l => l.id);
    expect(chapterLessonIds).toEqual(allLessonIds);
  });

  it('keeps advanced agreements out of the foundation lessons', () => {
    const basic = LESSONS.filter(l => getChapterForLesson(l.id)?.track === 'basic');
    const advanced = LESSONS.filter(l => getChapterForLesson(l.id)?.track === 'advanced');
    expect(basic).toHaveLength(26);
    expect(advanced).toHaveLength(10);
    const advancedTerms = /Bergen|Smolen|Texas|negative doubles?|cue.bid|keycards?|fast arrival|slow arrival|fourth.suit|checkback|Walsh|伯根|斯莫伦|德克萨斯|负加倍|扣叫|关键张|速达|缓达|第四花色|重询|沃尔什/i;
    for (const lesson of basic) {
      const text = [lesson.title, lesson.focus, ...lesson.steps.flatMap(s => {
        if (s.kind === 'info') return [s.text, ...(s.review?.rows.flat() ?? [])];
        if (s.kind === 'auction' || s.kind === 'play') return s.script.flatMap(a => ['note' in a ? a.note ?? '' : '', 'hint' in a ? a.hint : '']);
        return [];
      })].join('\n');
      expect(text.match(advancedTerms), lesson.id).toBeNull();
    }
    expect(basic.map(l => l.id).slice(basic.findIndex(l => l.id === 'conversation'), basic.findIndex(l => l.id === 'conversation') + 5)).toEqual(['conversation', 'reverse-bids', 'two-over-one-basics', 'strength-and-minors', 'scoring']);
    expect(LESSONS.some(l => l.id === 'opener-rebids')).toBe(false);
    expect(LESSONS.some(l => l.id === 'mini-splinters')).toBe(false);
    expect(basic.findIndex(l => l.id === 'notrump-responses')).toBe(basic.findIndex(l => l.id === 'stayman-fit') - 1);
    expect(getChapterForLesson('inverted-minor-raises')?.id).toBe('ch3');
    expect(basic.findIndex(l => l.id === 'inverted-minor-raises')).toBe(basic.findIndex(l => l.id === 'minor-responses') + 1);
  });

  it('migrates index-only bookmarks and preserves saved lesson identities', () => {
    const order = LESSONS.map(l => l.id);
    PREVIOUS_LESSON_IDS.forEach((id, i) => expect(order[savedLessonIndex(null, i)]).toBe(canonicalLessonId(id)));
    order.forEach(id => expect(order[savedLessonIndex(id, 0)]).toBe(id));
    expect(order[savedLessonIndex('mini-splinters', 0)]).toBe('notrump-responses');
    expect(savedLessonIndex('missing', 1000)).toBe(0);
  });

  it('provides bilingual title and subtitle for every chapter', () => {
    for (const ch of ACBL_CHAPTERS) {
      expect(ch.title.en).toBeTruthy();
      expect(ch.title.zh).toBeTruthy();
      expect(ch.subtitle.en).toBeTruthy();
      expect(ch.subtitle.zh).toBeTruthy();
      expect(ch.acblClasses).toBeTruthy();
    }
  });

  it('getChapterForLesson finds correct chapter', () => {
    expect(getChapterForLesson('deck')?.id).toBe('ch1');
    expect(getChapterForLesson('losers')?.id).toBe('ch2');
    expect(getChapterForLesson('contract')?.id).toBe('ch3');
    expect(getChapterForLesson('overcall')?.id).toBe('ch5');
    expect(getChapterForLesson('non-existent')).toBeUndefined();
  });
});
