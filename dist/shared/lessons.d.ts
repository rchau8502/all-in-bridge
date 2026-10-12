/**
 * lessons.ts — tutorial lesson content, fully bilingual (EN/ZH).
 *
 * Fixed deals, fixed scripts. Every scripted bid/play is validated by the
 * engine as it is applied, so authoring mistakes surface as test failures.
 *
 * Text is authored once per language via T(en, zh); getLessons(lang)
 * resolves a plain Lesson for the engine. LESSONS is the English build
 * (used by tests).
 */
import type { Hands } from './deck.js';
import type { Lesson } from './tutorial.js';
export interface LText {
    en: string;
    zh: string;
}
export type LessonLang = 'en' | 'zh';
export declare const PRACTICE_DEAL: Hands;
/** Lessons with all text in the requested language. */
export declare function getLessons(lang: LessonLang): Lesson[];
/** English build (used by tests). */
export declare const LESSONS: Lesson[];
//# sourceMappingURL=lessons.d.ts.map