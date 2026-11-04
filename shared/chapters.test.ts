import { describe, it, expect } from 'vitest';
import { ACBL_CHAPTERS, getChapterForLesson, savedLessonIndex, PREVIOUS_LESSON_IDS } from './chapters.js';
import { LESSONS } from './lessons.js';

describe('ACBL Chapters Module', () => {
  it('covers every lesson in teaching order with no duplicates', () => {
    const chapterLessonIds = ACBL_CHAPTERS.flatMap(ch => ch.lessonIds);
    expect(chapterLessonIds).toHaveLength(34);
    expect(new Set(chapterLessonIds).size).toBe(chapterLessonIds.length);

    const allLessonIds = LESSONS.map(l => l.id);
    expect(chapterLessonIds).toEqual(allLessonIds);
  });

  it('keeps advanced agreements out of the foundation lessons', () => {
    const basic = LESSONS.filter(l => getChapterForLesson(l.id)?.track === 'basic');
    const advanced = LESSONS.filter(l => getChapterForLesson(l.id)?.track === 'advanced');
    expect(basic).toHaveLength(21);
    expect(advanced).toHaveLength(13);
    const advancedTerms = /Bergen|Smolen|Texas|negative doubles?|cue.bid|keycards?|fast arrival|slow arrival|Stayman|Jacoby|fourth.suit|checkback|splinters?|Walsh|伯根|斯莫伦|德克萨斯|负加倍|扣叫|关键张|速达|缓达|斯台曼|雅各比|第四花色|重询|斯普林特|沃尔什/i;
    for (const lesson of basic) {
      const text = [lesson.title, lesson.focus, ...lesson.steps.flatMap(s => {
        if (s.kind === 'info') return [s.text, ...(s.review?.rows.flat() ?? [])];
        if (s.kind === 'auction' || s.kind === 'play') return s.script.flatMap(a => ['note' in a ? a.note ?? '' : '', 'hint' in a ? a.hint : '']);
        return [];
      })].join('\n');
      expect(text.match(advancedTerms), lesson.id).toBeNull();
    }
    expect(basic[basic.length - 1]!.id).toBe('two-over-one-basics');
  });

  it('migrates index-only bookmarks and preserves saved lesson identities', () => {
    const order = LESSONS.map(l => l.id);
    PREVIOUS_LESSON_IDS.forEach((id, i) => expect(order[savedLessonIndex(null, i)]).toBe(id));
    order.forEach(id => expect(order[savedLessonIndex(id, 0)]).toBe(id));
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
    expect(getChapterForLesson('overcall')?.id).toBe('ch4');
    expect(getChapterForLesson('non-existent')).toBeUndefined();
  });
});
