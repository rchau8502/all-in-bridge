import { describe, it, expect } from 'vitest';
import { getLessons } from './lessons.js';

/**
 * lesson-lang — the tutorial is authored twice, in English and in Chinese.
 * Each language must read as itself: no bleed across the two, and one
 * glossary used consistently. These are the rules the content has to keep
 * obeying as lessons grow, asserted so a stray mix-in fails the build
 * instead of shipping.
 */

/** CJK ideographs, punctuation and full-width forms. */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/;
/** Two or more real English words in a row = prose that never got translated.
 *  Single letters are excluded on purpose: card notation like "A K Q J" is
 *  the same notation in every language and must stay. */
const ENGLISH_PROSE = /[A-Za-z]{2,}(?:[ ][A-Za-z]{2,})+/;
/** "diamond king" / "spade queen" — reversed from the house style "king of
 *  diamonds". Catches the suit-after-rank slip. */
const REVERSED_CARD_NAME = /\b(spade|heart|diamond|club)s?\s+(ace|king|queen|jack|ten|10)\b/i;
/** Chinese card names are written tight: 黑桃A, not 黑桃 A. Numerals are
 *  exempt — "黑桃 4 张" is a count, not a card name. */
const LOOSE_ZH_CARD_NAME = /(黑桃|红桃|方块|梅花) ([AJKQKT])/;
/** The card faces render as "10", so the prose must say 10 too — not "Ten". */
const WORDY_TEN = /\bTen of (spades|hearts|diamonds|clubs)\b/;

type Lang = 'en' | 'zh';

/** Every player-visible string in a lesson, tagged with where it lives. */
function texts(lang: Lang): Array<{ where: string; text: string }> {
  const out: Array<{ where: string; text: string }> = [];
  for (const lesson of getLessons(lang)) {
    out.push({ where: `${lesson.id} title`, text: lesson.title });
    lesson.steps.forEach((s, i) => {
      if (s.kind === 'info') out.push({ where: `${lesson.id} step${i}`, text: s.text });
      if (s.kind === 'play' || s.kind === 'auction') {
        s.script.forEach((a, j) => {
          if ('hint' in a && a.hint) out.push({ where: `${lesson.id} step${i}.${j} hint`, text: a.hint });
          if ('note' in a && a.note) out.push({ where: `${lesson.id} step${i}.${j} note`, text: a.note });
        });
      }
    });
  }
  return out;
}

describe('lesson language discipline', () => {
  it('the English build contains no Chinese', () => {
    const offenders = texts('en').filter(x => CJK.test(x.text));
    expect(offenders.map(x => `${x.where}: ${x.text.slice(0, 60)}`)).toEqual([]);
  });

  it('the Chinese build contains no untranslated English prose', () => {
    const offenders = texts('zh')
      .filter(x => ENGLISH_PROSE.test(x.text))
      // Bridge notation (A K Q J, 4 x 30) is language-neutral and stays.
      .filter(x => !/\d\s*[×+*]\s*\d/.test(x.text) || !ENGLISH_PROSE.test(x.text.replace(/[A-Za-z]{2,}(?:[ ][A-Za-z]{2,})*\s*[×+*]\s*\d+\s*=\s*\d+/g, '')));
    expect(offenders.map(x => `${x.where}: ${x.text.slice(0, 60)}`)).toEqual([]);
  });

  it('English card names read "rank of suit", never reversed', () => {
    const offenders = texts('en').filter(x => REVERSED_CARD_NAME.test(x.text));
    expect(offenders.map(x => `${x.where}: ${x.text.slice(0, 60)}`)).toEqual([]);
  });

  it('English says "10 of spades" to match the card faces', () => {
    const offenders = texts('en').filter(x => WORDY_TEN.test(x.text));
    expect(offenders.map(x => `${x.where}: ${x.text.slice(0, 60)}`)).toEqual([]);
  });

  it('Chinese card names are written tight (黑桃A, not 黑桃 A)', () => {
    const offenders = texts('zh').filter(x => LOOSE_ZH_CARD_NAME.test(x.text));
    expect(offenders.map(x => `${x.where}: ${x.text.slice(0, 60)}`)).toEqual([]);
  });

  it('an English term always carries its Chinese name in the same line', () => {
    // One direction only. If the English line teaches "finesse", the Chinese
    // line must say 飞牌 — that is what stops the glossary drifting to a
    // synonym. The reverse is not required: Chinese may add a term the
    // English leaves implicit ("有将定约" needs no "trump" in the title).
    const en = texts('en'), zh = texts('zh');
    expect(en.length).toBe(zh.length);
    const glossary: Array<[RegExp, string]> = [
      [/finesse/i, '飞牌'],
      [/tenace/i, '坎张'],
      [/dummy/i, '明手'],
      [/\btrumps?\b/i, '将牌'],
      [/overcall/i, '争叫'],
      [/\bruff(ing|s|ed)?\b/i, '将吃'],
    ];
    const missing: string[] = [];
    for (let i = 0; i < en.length; i++) {
      // "无将" and "有将定约" are the standard Chinese terms and never take
      // 牌; only a bare "trump"/"trumps" needs the full 将牌.
      const enNorm = en[i]!.text
        .replace(/no-trump/gi, 'NT')
        .replace(/trump[- ]contract/gi, 'TC');
      for (const [re, term] of glossary) {
        if (re.test(enNorm) && !zh[i]!.text.includes(term)) {
          missing.push(`${en[i]!.where}: "${en[i]!.text.slice(0, 48)}" → 缺「${term}」`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('both languages quote the same teaching figures in every step', () => {
    // Only the numbers that actually carry a lesson are compared: worked
    // arithmetic, two-digit deck/hand/score figures and card notation.
    // Counting words ("ONE short!" / "少了1个") legitimately differ, and so
    // does the order the two languages choose to mention things in.
    const facts = (s: string): string[] => {
      const out: string[] = [];
      for (const m of s.matchAll(/\d+\s*[×+*]\s*\d+(?:\s*=\s*\d+)?/g)) out.push(`calc:${m[0].replace(/\s+/g, '')}`);
      for (const m of s.matchAll(/\b\d{2,}\b/g)) out.push(`num:${m[0]}`);
      for (const m of s.matchAll(/[♠♥♦♣]\s*[AJKQT2-9](?:[ 　]+[AJKQT2-9])*/g)) out.push(`cards:${m[0].replace(/\s+/g, '')}`);
      return [...new Set(out)].sort();
    };
    const en = texts('en'), zh = texts('zh');
    expect(en.length).toBe(zh.length);
    const mismatched: string[] = [];
    for (let i = 0; i < en.length; i++) {
      const a = facts(en[i]!.text), b = facts(zh[i]!.text);
      if (a.join(' ') !== b.join(' ')) {
        mismatched.push(`${en[i]!.where}: EN[${a.join(' ')}] ZH[${b.join(' ')}]`);
      }
    }
    expect(mismatched).toEqual([]);
  });
});