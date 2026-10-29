import { describe, it, expect } from 'vitest';
import { ACBL_CHAPTERS, getChapterForLesson } from './chapters.js';
import { LESSONS } from './lessons.js';

describe('ACBL Chapters Module', () => {
  it('covers all 17 lessons across the 4 chapters with no duplicates', () => {
    const chapterLessonIds = ACBL_CHAPTERS.flatMap(ch => ch.lessonIds);
    expect(chapterLessonIds).toHaveLength(17);

    const allLessonIds = LESSONS.map(l => l.id);
    expect(chapterLessonIds).toEqual(allLessonIds);
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
