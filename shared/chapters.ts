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
    lessonIds: ['losers', 'eliminate', 'defense-leads', 'defense-play', 'defense-rules'],
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
  {
    id: 'ch5',
    title: { en: 'Part 5: Minor and Notrump Responses', zh: '第五篇：低花与无将应叫' },
    subtitle: { en: 'Strength, Stayman, Smolen, Jacoby and Texas transfers', zh: '点力范围、斯台曼、斯莫伦、雅各比与德克萨斯转移' },
    acblClasses: 'Course slides C6–C8',
    lessonIds: ['strength-and-minors', 'stayman-fit', 'stayman-smolen', 'jacoby-transfers', 'texas-transfers'],
  },
  {
    id: 'ch6',
    title: { en: 'Part 6: Major Raises and Opener Rebids', zh: '第六篇：高花支持与开叫者再叫' },
    subtitle: { en: 'Bergen, Jacoby 2NT, splinters, semi-forcing 1NT and reverses', zh: '伯根、雅各比2NT、斯普林特、半逼叫1NT与逆叫' },
    acblClasses: 'Course slides Class 8–10',
    lessonIds: ['bergen-raises', 'major-forcing-raises', 'opener-rebids', 'reverse-bids'],
  },
  {
    id: 'ch7',
    title: { en: 'Part 7: Competition and Doubles', zh: '第七篇：竞争叫牌与加倍' },
    subtitle: { en: 'Advancing, takeout, negative and support doubles, bidding after interference', zh: '进叫、技术性加倍、负加倍、支持性加倍与受干扰后的应叫' },
    acblClasses: 'Course slides Class 11–13',
    lessonIds: ['overcall-strategy', 'takeout-doubles', 'negative-doubles', 'support-and-redoubles'],
  },
  {
    id: 'ch8',
    title: { en: 'Part 8: Game Forces and Slam Exploration', zh: '第八篇：逼局与满贯探索' },
    subtitle: { en: 'Fourth-suit forcing, two-way checkback, controls and RKCB 1430', zh: '第四花色逼叫、双路重询、控制扣叫与1430关键张' },
    acblClasses: 'Course slides Class 14',
    lessonIds: ['game-forcing-auctions', 'two-way-checkback', 'controls-and-keycards'],
  },
];

/** Get chapter info for a specific lesson ID. */
export function getChapterForLesson(lessonId: string): Chapter | undefined {
  return ACBL_CHAPTERS.find(ch => ch.lessonIds.includes(lessonId));
}
