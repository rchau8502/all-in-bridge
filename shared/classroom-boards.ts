/**
 * classroom-boards.ts — Curated textbook demonstration boards for classroom teaching.
 *
 * Designed specifically for Teaching Assistants (协助者) instructing complete beginners
 * across the 4 phases of Patty Tucker's ACBL Intro to Bridge Series 1:
 *  1. Board 1 (Phase 1): Table, Tricks & The Follow Suit Law
 *  2. Board 2 (Phase 2): Trump Power & Ruffing a Loser in Dummy
 *  3. Board 3 (Phase 2): The Finesse (Leading from Weakness to Strength)
 *  4. Board 4 (Phase 3): 25 HCP 3NT Game & Planning at Trick 1
 *  5. Board 5 (Phase 4): MiniBridge 8-Card Major Fit & 25-Point Game
 */

import type { Contract } from './bidding.js';

export interface ClassroomPopQuiz {
  id: string;
  question: { en: string; zh: string };
  options: Array<{
    id: string;
    text: { en: string; zh: string };
    isCorrect: boolean;
  }>;
  explanation: { en: string; zh: string };
}

export interface ClassroomBoard {
  id: string;
  boardNumber: number;
  phase: 1 | 2 | 3 | 4;
  phaseLabel: { en: string; zh: string };
  title: { en: string; zh: string };
  subtitle: { en: string; zh: string };
  acblClassRef: string;
  deal: string; // PBN format: "N:..."
  contract: Contract;
  targetTricks: number;
  taTakeaway: { en: string; zh: string };
  quizzes: ClassroomPopQuiz[];
}

export const CLASSROOM_BOARDS: ClassroomBoard[] = [
  {
    id: 'lecture_follow_suit',
    boardNumber: 1,
    phase: 1,
    phaseLabel: { en: 'Phase 1: Table & Rules (00-10m)', zh: '第一阶段：牌桌与跟牌 (00-10分)' },
    title: { en: 'Law of Follow Suit & High Cards', zh: '牌桌第一军规：必须跟牌与高牌拿墩' },
    subtitle: {
      en: 'Demonstrates the absolute obligation to follow suit and how honors take tricks',
      zh: '演示必须跟出引牌花色的铁律，以及大牌按大小顺序依次拿墩',
    },
    acblClassRef: 'ACBL Class 1: Understanding the Basics (Patty Tucker, 2022)',
    deal: 'N:JT9.K65.Q87.T862 876.JT4.T95.J975 AKQ2.AQ3.AK4.AK3 543.9872.J632.Q4',
    contract: {
      level: 1,
      denom: 'NT',
      declarer: 'S',
      doubled: 0,
    },
    targetTricks: 7,
    taTakeaway: {
      en: 'Golden Rule: When a suit is led, you MUST follow suit if held! You cannot switch suits until you are out of that suit.',
      zh: '核心铁律：领出什么花色，只要手中持有该花色就必须跟出！只有在手中该花色全部打光（断门）时，才能出其他花色。',
    },
    quizzes: [
      {
        id: 'q1',
        question: {
          en: 'West leads the ♠5. South holds ♠A, ♠K, ♠Q and ♥A. Can South play the ♥A to take the trick?',
          zh: '西家首攻出黑桃 5。南家手里同时持有 ♠A、♠K、♠Q 和 ♥A。南家可以直接打出 ♥A 拿墩吗？',
        },
        options: [
          {
            id: 'a',
            text: { en: 'No! South holds Spades and MUST follow suit.', zh: '绝对不行！南家手中持有黑桃，必须跟黑桃。' },
            isCorrect: true,
          },
          {
            id: 'b',
            text: { en: 'Yes, because Ace is the highest rank.', zh: '可以，因为 A 是最大的牌。' },
            isCorrect: false,
          },
          {
            id: 'c',
            text: { en: 'Yes, if South wants to switch suits.', zh: '可以，只要南家想换花色就能出。' },
            isCorrect: false,
          },
        ],
        explanation: {
          en: 'Bridge Law #1: You must follow suit if able! Discarding the ♥A while holding Spades is an illegal play (revoke).',
          zh: '桥牌第一铁律：手里有引出花色必须跟！在持有黑桃的情况下出红心属于严重违规（藏牌/出界）。',
        },
      },
      {
        id: 'q2',
        question: {
          en: 'If South wins this trick with the ♠Q, who plays the first card to the next trick?',
          zh: '如果南家打出 ♠Q 赢下了这一墩，下一墩由谁首先出牌？',
        },
        options: [
          {
            id: 'a',
            text: { en: 'South leads to the next trick (winner leads).', zh: '由南家首先引牌（谁拿墩谁引牌）。' },
            isCorrect: true,
          },
          {
            id: 'b',
            text: { en: 'West, because West dealt.', zh: '西家，因为西家是发牌人。' },
            isCorrect: false,
          },
          {
            id: 'c',
            text: { en: 'Clockwise next player (West).', zh: '顺时针下一位牌手（西家）。' },
            isCorrect: false,
          },
        ],
        explanation: {
          en: 'Winner of each trick gains the right to lead any card to the subsequent trick.',
          zh: '拿墩公理：赢下该墩的牌手，获得下一墩任意出牌的花色引牌权。',
        },
      },
    ],
  },
  {
    id: 'lecture_trump_ruff',
    boardNumber: 2,
    phase: 2,
    phaseLabel: { en: 'Phase 2: Trump & Ruffing (10-20m)', zh: '第二阶段：将牌与将吃 (10-20分)' },
    title: { en: 'The Power of Trump: Ruffing Losers', zh: '将牌威力：明手断门小牌杀大牌' },
    subtitle: {
      en: 'Shows why trumps beat outside cards and how ruffing losers in dummy scores extra tricks',
      zh: '演示为什么将牌能超越边花大牌，以及如何在明手将吃输墩创造额外赢墩',
    },
    acblClassRef: 'ACBL Class 4: Taking Tricks with Trump (Patty Tucker, 2022)',
    deal: 'N:KQJT..QJT9.KQJT9 987.AJT9.876.876 A654.876.AK5.A52 32.KQ5432.432.43',
    contract: {
      level: 4,
      denom: 'S',
      declarer: 'S',
      doubled: 0,
    },
    targetTricks: 10,
    taTakeaway: {
      en: 'When void in a side suit, even the ♠2 (trump) beats an outside Ace! Ruffing losers in the short hand (dummy) adds tricks.',
      zh: '只要手中边花断门，哪怕打出最小的将牌 2，也能吃掉敌方的 A！在短将牌方（明手）将吃输墩，是获得超额赢墩的绝技。',
    },
    quizzes: [
      {
        id: 'q1',
        question: {
          en: 'North is void in Hearts. West leads ♥K. Can North play a Spade trump to win the trick?',
          zh: '明手北家红心已断门（0张）。东家打出 ♥A。明手打出将牌 ♠T，这墩谁赢？',
        },
        options: [
          {
            id: 'a',
            text: { en: 'North wins! Trumps beat all non-trump cards.', zh: '明手北家赢！因为将牌大过所有非将牌。' },
            isCorrect: true,
          },
          {
            id: 'b',
            text: { en: 'East wins, because Ace is higher than 10.', zh: '东家赢，因为 A 比 10 点数大。' },
            isCorrect: false,
          },
        ],
        explanation: {
          en: 'In a trump contract, a trump card ruffs and beats any card of a non-trump suit, even an Ace!',
          zh: '在有将定约中，断门打出的将牌具有特权，能够“将吃”杀掉任何其他花色的大牌，即使对方出的是 A！',
        },
      },
    ],
  },
  {
    id: 'lecture_finesse',
    boardNumber: 3,
    phase: 2,
    phaseLabel: { en: 'Phase 2: Finessing (10-20m)', zh: '第二阶段：飞牌魔法 (10-20分)' },
    title: { en: 'The Classic Finesse: Lead from Weakness', zh: '经典飞牌：由弱向强捕捉大牌' },
    subtitle: {
      en: 'Leading from low cards towards honors traps opponent intermediary cards 50% of the time',
      zh: '从弱手向强手引牌，以 50% 成功率捕捉敌方夹在中间的荣誉大牌',
    },
    acblClassRef: 'ACBL Class 2: Finessing (Patty Tucker, 2022)',
    deal: 'N:AQ4.K65.A76.KQJT T98.JT9.JT9.9876 532.AQ4.KQ5.A543 KJ76.8732.8432.2',
    contract: {
      level: 3,
      denom: 'NT',
      declarer: 'S',
      doubled: 0,
    },
    targetTricks: 9,
    taTakeaway: {
      en: 'Never lead high cards away from your honors! Always lead low from the weak hand towards the tenace (A-Q).',
      zh: '飞牌金箴：绝不从大牌手中强冲大牌！始终从弱手打出小牌，引向强手的 A-Q 叉子套。',
    },
    quizzes: [
      {
        id: 'q1',
        question: {
          en: 'North holds ♠A ♠Q; South holds ♠5 ♠3 ♠2. How should South play Spades to catch West’s ♠K?',
          zh: '北家持 ♠A ♠Q，南家持 ♠5 ♠3 ♠2。南家应如何出牌才能抓到西家的 ♠K？',
        },
        options: [
          {
            id: 'a',
            text: { en: 'Lead ♠2 from South towards North; play ♠Q if West ducks.', zh: '从南家向北家引小黑桃 2；若西家出小牌，北家放 Q 飞牌！' },
            isCorrect: true,
          },
          {
            id: 'b',
            text: { en: 'Lead ♠A from North first to see if King drops.', zh: '先从北家出 ♠A，看看能不能直接砸下 K。' },
            isCorrect: false,
          },
        ],
        explanation: {
          en: 'Finesse Rule: Lead low towards honours. If King is onside (West), the Queen wins without losing the Ace!',
          zh: '飞牌法则：由弱引强。若 K 在西家手中，出小牌飞 Q 即可稳稳多赚 1 墩而不浪费 A！',
        },
      },
    ],
  },
  {
    id: 'lecture_nt_planning',
    boardNumber: 4,
    phase: 3,
    phaseLabel: { en: 'Phase 3: Book Math & 25 HCP (20-30m)', zh: '第三阶段：底墩公理与25点成局 (20-30分)' },
    title: { en: 'Counting 9 Winners in 3NT at Trick 1', zh: '25点 3NT 赢墩规划：在第1墩前胸有成竹' },
    subtitle: {
      en: '26 combined HCP makes 3NT. Declarer pauses at Trick 1 to count sure winners before playing',
      zh: '两手合力 26 点达成 3NT。庄家在出第 1 张牌前停顿思考，数清 9 个确凿赢墩',
    },
    acblClassRef: 'ACBL Class 3: Counting Winners & Line of Play in NT (Patty Tucker, 2022)',
    deal: 'N:AK2.K65.A87.K872 T98.JT9.JT9.J965 Q43.AQ4.KQ5.AQ43 J765.8732.6432.T',
    contract: {
      level: 3,
      denom: 'NT',
      declarer: 'S',
      doubled: 0,
    },
    targetTricks: 9,
    taTakeaway: {
      en: 'The Book = 6 tricks. 3NT requires 6 + 3 = 9 tricks. With 26 HCP, count: ♠3 + ♥3 + ♦3 + ♣3 = 12 sure tricks!',
      zh: '底墩公理：底墩是 6 墩。3NT 目标是 6 + 3 = 9 墩。全手 26 点，数出 ♠3+♥3+♦3+♣3=12 个必赢墩，稳操胜券！',
    },
    quizzes: [
      {
        id: 'q1',
        question: {
          en: 'Why is 3NT called a "Game Contract", and how many tricks are needed?',
          zh: '为什么 3NT 被称为“成局定约 (Game)”，它需要赢下多少墩？',
        },
        options: [
          {
            id: 'a',
            text: { en: 'Needs 9 tricks (6 + 3), scores 100+ trick points for a big game bonus.', zh: '需要赢 9 墩 (6+3)，基本分达 100 分享有丰厚成局奖分。' },
            isCorrect: true,
          },
          {
            id: 'b',
            text: { en: 'Needs 3 tricks total.', zh: '总共只需要赢 3 墩。' },
            isCorrect: false,
          },
        ],
        explanation: {
          en: 'Book = 6 tricks. Bidding 3NT commits to 6 + 3 = 9 tricks. Scoring 40 + 30 + 30 = 100 pts unlocks game bonus.',
          zh: '底墩公理：前 6 墩是义务底。3 阶无将要求 6 + 3 = 9 墩，分值刚好 100 分达成成局奖分。',
        },
      },
    ],
  },
  {
    id: 'lecture_minibridge_fit',
    boardNumber: 5,
    phase: 4,
    phaseLabel: { en: 'Phase 4: MiniBridge Play (30-40m)', zh: '第四阶段：迷你桥牌实战 (30-40分)' },
    title: { en: 'MiniBridge in Action: 8-Card Fit to Game', zh: '迷你桥牌实战：9张黄金配合直通成局' },
    subtitle: {
      en: 'Skip the bidding box! Count 25 combined HCP and find the 9-card spade fit for 4♠ game',
      zh: '免去繁复叫牌！北南合计 25 点且黑桃 9 张配合，直接选定 4♠ 局定约打满 13 墩',
    },
    acblClassRef: 'ACBL Class 1 & 2: MiniBridge Standards (Tucker & ACBL)',
    deal: 'N:QJ95.K83.A72.J64 76.Q97.KT86.QT92 AK842.AJ4.Q5.873 T3.T652.J943.AK5',
    contract: {
      level: 4,
      denom: 'S',
      declarer: 'S',
      doubled: 0,
    },
    targetTricks: 10,
    taTakeaway: {
      en: 'MiniBridge Formula: 1) Count HCP (25+ = Game). 2) Check Majors (8+ cards = Trump). 3) Declarer plays both hands!',
      zh: '迷你桥牌三步法：①算大牌点（25+点冲成局）；②查高花（8+张打有将）；③庄家全权指挥自己与明手拿满 10 墩！',
    },
    quizzes: [
      {
        id: 'q1',
        question: {
          en: 'North has 4 Spades and South has 5 Spades. Should they play Spades or No-Trump?',
          zh: '北家有 4 张黑桃，南家有 5 张黑桃。他们应该打黑桃还是打无将？',
        },
        options: [
          {
            id: 'a',
            text: { en: 'Spades! 4 + 5 = 9 cards, exceeding the 8-card golden fit threshold.', zh: '打黑桃！4 + 5 = 9 张，远超 8 张黄金配合标准。' },
            isCorrect: true,
          },
          {
            id: 'b',
            text: { en: 'No-Trump, because No-Trump is always better.', zh: '打无将，因为无将永远优先。' },
            isCorrect: false,
          },
        ],
        explanation: {
          en: 'An 8+ card major fit is the highest priority in bridge because trumps protect against bad distributions.',
          zh: '高花黄金配合优先原则：只要两手高花达到 8 张或以上，有将定约能有效控制牌局，优先于无将。',
        },
      },
    ],
  },
];
