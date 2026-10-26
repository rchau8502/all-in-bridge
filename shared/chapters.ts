/**
 * ACBL Intro to Bridge Series 1: Chapter Structure.
 * Organizes the 16 interactive lessons into 4 progressive pedagogical units
 * matching the 10 classes in the ACBL Student Manual (Patty Tucker, 2022).
 */

export type Lang = 'en' | 'zh';

export interface Chapter {
  id: string;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  acblClasses: string; // e.g. "Classes 1 - 2"
  lessonIds: string[];
}

export const ACBL_CHAPTERS: Chapter[] = [
  {
    id: 'ch1',
    title: {
      en: 'Part 1: The Basics & Card Play',
      zh: '第一篇：规则破冰与做牌基础',
    },
    subtitle: {
      en: 'Card mechanics, winning tricks, finessing, long suits, and trump power',
      zh: '认识牌面、赢墩法则、飞牌技巧、树立长套与将牌威力',
    },
    acblClasses: 'ACBL Classes 1 - 2',
    lessonIds: ['deck', 'tricks', 'strategy', 'long-suits', 'trump'],
  },
  {
    id: 'ch2',
    title: {
      en: 'Part 2: Planning & Defense',
      zh: '第二篇：做牌计划与防守艺术',
    },
    subtitle: {
      en: 'Counting losers, ruffing in dummy, opening leads, and defensive cooperation',
      zh: '有将数输墩、明手将吃消去、首攻技巧与防守同伴配合',
    },
    acblClasses: 'ACBL Classes 3 - 4',
    lessonIds: ['losers', 'eliminate', 'defense-leads', 'defense-play'],
  },
  {
    id: 'ch3',
    title: {
      en: 'Part 3: Bidding & Contracts',
      zh: '第三篇：叫牌语言与定约实战',
    },
    subtitle: {
      en: 'The contract promise, opening bids, responding to minors, and full-hand execution',
      zh: '定约承诺、开叫阶梯、应叫低花法则与整副牌叫打实战',
    },
    acblClasses: 'ACBL Classes 5 - 7',
    lessonIds: ['contract', 'bidding', 'minor-responses', 'full-hand'],
  },
  {
    id: 'ch4',
    title: {
      en: 'Part 4: Advanced Rebids & Competition',
      zh: '第四篇：进阶再叫与争叫竞争',
    },
    subtitle: {
      en: 'Opener rebids, going for game bonuses, and 10-5-2 competitive overcalls',
      zh: '开叫者再叫体系、冲成局记分、争叫抢庄与10-5-2竞争法则',
    },
    acblClasses: 'ACBL Classes 8 - 10',
    lessonIds: ['conversation', 'scoring', 'overcall'],
  },
];

/** Get chapter info for a specific lesson ID. */
export function getChapterForLesson(lessonId: string): Chapter | undefined {
  return ACBL_CHAPTERS.find(ch => ch.lessonIds.includes(lessonId));
}
