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

import { parseCard } from './deck.js';
import type { Hands, Seat } from './deck.js';
import type { Lesson } from './tutorial.js';

export interface LText {
  en: string;
  zh: string;
}
export type LessonLang = 'en' | 'zh';
const T = (en: string, zh: string): LText => ({ en, zh });

function makeHands(def: Record<Seat, string[]>): Hands {
  return {
    N: def.N.map(parseCard),
    E: def.E.map(parseCard),
    S: def.S.map(parseCard),
    W: def.W.map(parseCard),
  };
}

export const PRACTICE_DEAL: Hands = makeHands({
  S: ['AH', 'KH', 'QH', 'JH', '5H', 'AS', 'KS', 'AD', '7C', '6C', '5C', '4C', '3C'],
  N: ['9H', '8H', '7H', '6H', 'QS', 'JS', '4S', 'KD', '3D', '2D', 'AC', 'KC', 'QC'],
  E: ['TH', '4H', '3H', '2H', 'TS', '9S', '8S', '7S', '6S', 'JD', 'TD', '9D', 'JC'],
  W: ['5S', '3S', '2S', 'QD', '8D', '7D', '6D', '5D', '4D', 'TC', '9C', '8C', '2C'],
});

const FULL_HAND_CONTRACT = { level: 2, denom: 'H' as const, declarer: 'S' as Seat, doubled: 0 as const };

type RawBidAction =
  | { seat: Seat; bid: string }
  | { seat: Seat; learner: true; expected: string; hint: LText };
type RawPlayAction =
  | { seat: Seat; card: string }
  | { seat: Seat; learner: true; expected: string; hint: LText };
type RawStep =
  | { kind: 'info'; text: LText }
  | { kind: 'quiz'; question: LText; options: LText[]; answer: number; explain: LText }
  | { kind: 'auction'; script: RawBidAction[] }
  | { kind: 'play'; script: RawPlayAction[] }
  | { kind: 'result' };

interface RawLesson {
  id: string;
  title: LText;
  dealer: Seat;
  hands: Hands;
  contract: { level: number; denom: 'C' | 'D' | 'H' | 'S' | 'NT'; declarer: Seat; doubled: 0 | 1 | 2 };
  vulnerable: boolean;
  steps: RawStep[];
}

const RAW_LESSONS: RawLesson[] = [
  {
    id: 'tricks',
    title: T('Winning tricks', '赢墩'),
    dealer: 'N',
    hands: PRACTICE_DEAL,
    contract: FULL_HAND_CONTRACT,
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Welcome to bridge! Everything starts with tricks. Four players sit North, East, South, West — you are South. Each trick, one player leads a card, and everyone else must follow suit (play the same suit) if they can.',
          '欢迎来到桥牌！一切从赢墩开始。四位玩家分别坐在北、东、南、西 —— 你是南家。每墩由一位玩家先出牌，其他人有该花色必须跟出（出同一花色的牌）。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'The highest card of the led suit wins the trick. Watch the first trick: West leads.',
          '首攻花色中最大的一张赢得这一墩。看第一墩：西家先出。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '4D' },
          { seat: 'N', card: '2D' },
          { seat: 'E', card: '9D' },
          {
            seat: 'S', learner: true, expected: 'AD',
            hint: T(
              'Diamonds were led. Play your ace of diamonds (AD) to win the trick.',
              '首攻是方块。打出你的方块A (AD) 赢下这一墩。'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'You won the trick! Whoever wins a trick leads the next one.',
          '你赢得了这一墩！谁赢得一墩，谁领出下一墩。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AH',
            hint: T('Lead your ace of hearts (AH).', '领出你的红桃A (AH)。'),
          },
          { seat: 'W', card: '2C' },
          { seat: 'N', card: '6H' },
          { seat: 'E', card: '2H' },
        ],
      },
      {
        kind: 'quiz',
        question: T(
          'West played the 2 of clubs while hearts were led. Why is that allowed?',
          '首攻是红桃，西家却出了梅花2，为什么可以？'
        ),
        options: [
          T('West had no hearts left', '西家已经没有红桃了'),
          T('Clubs beat hearts', '梅花比红桃大'),
          T('West felt like it', '西家想出就出'),
        ],
        answer: 0,
        explain: T(
          'You only have to follow suit when you hold a card of the led suit. West was out of hearts, so any discard was legal.',
          '只有手中有首攻花色时才必须跟出。西家没有红桃了，所以垫任何牌都合法。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KH',
            hint: T('Lead the king of hearts (KH).', '领出红桃K (KH)。'),
          },
          { seat: 'W', card: '8C' },
          { seat: 'N', card: '7H' },
          { seat: 'E', card: '3H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Three for three! A real hand has 13 tricks. Next: how the auction decides the contract.',
          '三墩全拿！一副牌共有13墩。接下来：叫牌如何决定定约。'
        ),
      },
    ],
  },
  {
    id: 'bidding',
    title: T('Bidding basics', '叫牌基础'),
    dealer: 'N',
    hands: PRACTICE_DEAL,
    contract: { level: 2, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Before any card is played, the auction decides the contract. Players bid in turn. Each bid must top the last one: a higher level, or the same level in a higher suit. Suits rank: clubs < diamonds < hearts < spades < no-trump.',
          '出牌之前，先进行叫牌来决定定约。玩家轮流叫牌。每一次叫牌必须超过上一个：更高的阶数，或同阶数更高的花色。花色大小：梅花 < 方块 < 红桃 < 黑桃 < 无将。'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: '1D' },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T(
              'East opened 1 diamond. You have 5 hearts — bid 1 heart (1H).',
              '东家开了1方块。你有5张红桃 —— 叫1红桃 (1H)。'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          '1H outranks 1D because hearts are a higher-ranking suit than diamonds.',
          '1H 比 1D 大，因为红桃比方块高级。'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: '2D' },
          {
            seat: 'S', learner: true, expected: '2H',
            hint: T(
              'East raised to 2 diamonds. Show your hearts again: bid 2H.',
              '东家加叫到2方块。再叫一次红桃：叫2H。'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T('Three consecutive passes end the auction.', '连续三次不叫，叫牌结束。'),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: 'P' },
        ],
      },
      {
        kind: 'quiz',
        question: T('The final contract is 2H. Who is the declarer?', '最终定约是2H，谁是庄家？'),
        options: [
          T('South — first of their side to bid hearts', '南家 —— 本方第一个叫出红桃的人'),
          T('East — they bid diamonds first', '东家 —— 他先叫的方块'),
          T('North — the dealer', '北家 —— 他是发牌人'),
        ],
        answer: 0,
        explain: T(
          "The declarer is the first player of the winning side to bid the contract's denomination. South bid hearts first, so South declares.",
          '庄家是赢得定约一方中，第一个叫出定约花色的人。南家先叫的红桃，所以南家做庄。'
        ),
      },
    ],
  },
  {
    id: 'scoring',
    title: T('Contracts and scoring', '定约与计分'),
    dealer: 'N',
    hands: PRACTICE_DEAL,
    contract: FULL_HAND_CONTRACT,
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'The contract names a level and a denomination. 2H means: with hearts as trumps, your side must take at least 6 + 2 = 8 of the 13 tricks.',
          '定约由阶数和花色组成。2H 表示：以红桃为将牌，你方至少要拿到 6 + 2 = 8 墩（共13墩）。'
        ),
      },
      {
        kind: 'quiz',
        question: T('Your contract is 3NT. How many tricks must you take?', '你的定约是3NT，需要拿几墩？'),
        options: [T('9', '9'), T('8', '8'), T('10', '10')],
        answer: 0,
        explain: T('6 + 3 = 9 tricks.', '6 + 3 = 9 墩。'),
      },
      {
        kind: 'info',
        text: T(
          'Score has two parts: trick points for the tricks you contracted, plus bonuses. Making 3NT exactly (not vulnerable) is 100 trick points + a 300 game bonus = 400.',
          '得分由两部分组成：定约墩的墩分，加上奖励分。3NT 刚好做成（无局）是 100 墩分 + 300 成局奖励 = 400 分。'
        ),
      },
      {
        kind: 'quiz',
        question: T('3NT made exactly, not vulnerable, scores…', '3NT 刚好做成，无局，得分是…'),
        options: [T('400', '400'), T('600', '600'), T('100', '100')],
        answer: 0,
        explain: T('100 trick points + 300 game bonus = 400.', '100 墩分 + 300 成局奖励 = 400。'),
      },
      {
        kind: 'info',
        text: T(
          'Bid and make a slam (the 6 or 7 level) for huge bonuses — up to 1500. Fall short, and the other side scores penalty points for every missing trick. Now: play a full hand!',
          '叫到并做成满贯（6阶或7阶）有巨额奖励 —— 最高1500分。宕了的话，对方按缺少的墩数得分。现在：打一整副牌！'
        ),
      },
    ],
  },
  {
    id: 'full-hand',
    title: T('Play a full hand', '打一整副牌'),
    dealer: 'N',
    hands: PRACTICE_DEAL,
    contract: FULL_HAND_CONTRACT,
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          "Time to play a full hand! You're South and North dealt. Look at your hand: 5 hearts to the ace-king-queen-jack — a powerhouse trump suit.",
          '来打一整副牌吧！你是南家，北家发牌。看看你的手牌：5张红桃带A K Q J —— 超强的将牌套！'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T('Open 1 heart (1H) — show your 5-card suit.', '开叫1红桃 (1H) —— 亮出你的5张套。'),
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: '2H' },
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: 'P',
            hint: T("Partner raised to 2H. That's enough — pass.", '同伴加到2H，够了 —— 不叫。'),
          },
          { seat: 'W', bid: 'P' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Contract: 2H by South. You need 8 tricks with hearts as trumps. West leads.',
          '定约：南家2H。以红桃为将牌需要8墩。西家首攻。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '4D' },
          { seat: 'N', card: '2D' },
          { seat: 'E', card: '9D' },
          {
            seat: 'S', learner: true, expected: 'AD',
            hint: T('Diamonds led — take it with your ace (AD).', '首攻方块 —— 用你的A拿下 (AD)。'),
          },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AH',
            hint: T('Draw the enemy trumps: lead your ace of hearts (AH).', '拔对方的将牌：领出红桃A (AH)。'),
          },
          { seat: 'W', card: '2C' },
          { seat: 'N', card: '6H' },
          { seat: 'E', card: '2H' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KH',
            hint: T('Keep drawing trumps: king of hearts (KH).', '继续拔将牌：红桃K (KH)。'),
          },
          { seat: 'W', card: '8C' },
          { seat: 'N', card: '7H' },
          { seat: 'E', card: '3H' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'QH',
            hint: T('Queen of hearts (QH).', '红桃Q (QH)。'),
          },
          { seat: 'W', card: '9C' },
          { seat: 'N', card: '8H' },
          { seat: 'E', card: '4H' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'JH',
            hint: T('Jack of hearts (JH) — the last round of trumps.', '红桃J (JH) —— 最后一轮将牌。'),
          },
          { seat: 'W', card: '2S' },
          { seat: 'N', card: '9H' },
          { seat: 'E', card: 'TH' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '5H',
            hint: T('Your last heart (5H) — trumps are all drawn now.', '你最后一张红桃 (5H) —— 将牌拔完了。'),
          },
          { seat: 'W', card: 'TC' },
          { seat: 'N', card: '4S' },
          { seat: 'E', card: 'JD' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AS',
            hint: T('Cash your spade winners: ace of spades (AS).', '兑现黑桃赢墩：黑桃A (AS)。'),
          },
          { seat: 'W', card: '3S' },
          { seat: 'N', card: 'JS' },
          { seat: 'E', card: '6S' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KS',
            hint: T('And the king (KS).', '再兑现K (KS)。'),
          },
          { seat: 'W', card: '5S' },
          { seat: 'N', card: 'QS' },
          { seat: 'E', card: '7S' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '7C',
            hint: T("Now the clubs: lead low toward dummy's ace (7C).", '现在打梅花：向明手的A送一张小牌 (7C)。'),
          },
          { seat: 'W', card: '5D' },
          {
            seat: 'N', learner: true, expected: 'AC',
            hint: T("You're also playing dummy's hand — win with the ace of clubs (AC).", '明手的牌也由你打 —— 用梅花A赢下 (AC)。'),
          },
          { seat: 'E', card: 'JC' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: 'KC',
            hint: T("Lead dummy's king of clubs (KC).", '领出明手的梅花K (KC)。'),
          },
          { seat: 'E', card: 'TS' },
          {
            seat: 'S', learner: true, expected: '4C',
            hint: T('Follow with the 4 of clubs (4C).', '跟出梅花4 (4C)。'),
          },
          { seat: 'W', card: '6D' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: 'QC',
            hint: T('Queen of clubs (QC).', '梅花Q (QC)。'),
          },
          { seat: 'E', card: '9S' },
          {
            seat: 'S', learner: true, expected: '5C',
            hint: T('The 5 of clubs (5C).', '梅花5 (5C)。'),
          },
          { seat: 'W', card: '7D' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: 'KD',
            hint: T("Cash dummy's diamond king (KD).", '兑现明手的方块K (KD)。'),
          },
          { seat: 'E', card: 'TD' },
          {
            seat: 'S', learner: true, expected: '6C',
            hint: T('You have no diamonds — discard the 6 of clubs (6C).', '你没有方块了 —— 垫掉梅花6 (6C)。'),
          },
          { seat: 'W', card: 'QD' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: '3D',
            hint: T("Last trick: dummy's low diamond (3D).", '最后一墩：明手的小方块 (3D)。'),
          },
          { seat: 'E', card: '8S' },
          {
            seat: 'S', learner: true, expected: '3C',
            hint: T('No diamonds left — discard your last club (3C).', '没有方块了 —— 垫掉最后一张梅花 (3C)。'),
          },
          { seat: 'W', card: '8D' },
        ],
      },
      { kind: 'result' },
      {
        kind: 'info',
        text: T(
          "12 out of 13 tricks — West snuck the last one with the 8 of diamonds. Still, 2H made with 4 overtricks scores 230. You're ready for the tables.",
          '13墩拿下12墩 —— 西家用方块8偷走了最后一墩。不过2H超4墩做成，得230分。你已经可以上桌了！'
        ),
      },
    ],
  },
];

function resolveStep(s: RawStep, lang: LessonLang) {
  switch (s.kind) {
    case 'info':
      return { kind: 'info' as const, text: s.text[lang] };
    case 'quiz':
      return {
        kind: 'quiz' as const,
        question: s.question[lang],
        options: s.options.map(o => o[lang]),
        answer: s.answer,
        explain: s.explain[lang],
      };
    case 'auction':
      return {
        kind: 'auction' as const,
        script: s.script.map(a =>
          'learner' in a ? { ...a, hint: a.hint[lang] } : a
        ),
      };
    case 'play':
      return {
        kind: 'play' as const,
        script: s.script.map(a =>
          'learner' in a ? { ...a, hint: a.hint[lang] } : a
        ),
      };
    case 'result':
      return { kind: 'result' as const };
  }
}

function resolveLesson(raw: RawLesson, lang: LessonLang): Lesson {
  return {
    id: raw.id,
    title: raw.title[lang],
    dealer: raw.dealer,
    hands: raw.hands,
    contract: raw.contract,
    vulnerable: raw.vulnerable,
    steps: raw.steps.map(s => resolveStep(s, lang)),
  };
}

/** Lessons with all text in the requested language. */
export function getLessons(lang: LessonLang): Lesson[] {
  return RAW_LESSONS.map(r => resolveLesson(r, lang));
}

/** English build (used by tests). */
export const LESSONS: Lesson[] = getLessons('en');
