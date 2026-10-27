/**
 * challenges.ts — Curated ACBL Deal Challenges & Master Puzzles.
 *
 * Provides hand-crafted 52-card deals targeting key techniques from
 * the official ACBL Intro to Bridge Series 1 manual (Patty Tucker):
 *  1. The Classic Finesse (Leading towards high honors)
 *  2. Cross-Ruff Mastery (Scoring dummy's trumps without drawing)
 *  3. Unblock & Transportation (Running long suits smoothly)
 *  4. Ruffing Losers in Dummy (Preserving long trumps in hand)
 *  5. The Safe Play & Danger Hand (Avoiding dangerous opponents)
 */

import type { Contract } from './bidding.js';

export interface Challenge {
  id: string;
  title: { en: string; zh: string };
  category: { en: string; zh: string };
  objective: { en: string; zh: string };
  hint: { en: string; zh: string };
  deal: string; // PBN format: N:... ... ... ...
  contract: Contract;
  targetTricks: number;
  acblClassRef: string;
}

export const ACBL_CHALLENGES: Challenge[] = [
  {
    id: 'classic_finesse',
    title: {
      en: 'The Classic Finesse',
      zh: '飞牌秘要：由弱引强',
    },
    category: {
      en: 'Finessing',
      zh: '飞牌技巧',
    },
    objective: {
      en: 'Make 3NT (9 tricks). Finesse towards North’s honours from the weak hand.',
      zh: '达成 3NT 定约（至少 9 墩）。由弱手引向北面大牌，成功完成双向飞牌。',
    },
    hint: {
      en: 'Lead from South towards North’s ♠AQ. When East ducks, insert the Queen; if East plays the King, win with the Ace!',
      zh: '从南手引牌朝向北手 ♠AQ。东家出小牌时放出 Q 飞牌；若东家打出 K，立即用 A 吃下！',
    },
    deal: 'N:AQ2.KJ4.A54.K872 KJ5.873.Q98.J953 43.AQ5.KJ32.AQ64 T9876.T962.T76.T',
    contract: {
      level: 3,
      denom: 'NT',
      declarer: 'S',
      doubled: 0,
    },
    targetTricks: 9,
    acblClassRef: 'ACBL Class 2: Finessing (Patty Tucker, 2022)',
  },
  {
    id: 'cross_ruff',
    title: {
      en: 'Cross-Ruff Mastery',
      zh: '交叉将吃：短门威力',
    },
    category: {
      en: 'Trump Play',
      zh: '有将做牌',
    },
    objective: {
      en: 'Make 4♠ (10 tricks) using cross-ruffing in dummy and declarer hand.',
      zh: '达成 4♠ 定约（至少 10 墩）。利用明手与暗手短门进行交叉将吃。',
    },
    hint: {
      en: 'Do not draw trumps early! Ruff hearts in dummy and clubs in your hand before pulling defenders’ trumps.',
      zh: '切勿过早清拔将牌！利用明手将吃红心、手中将吃梅花，将双方的将牌全部变现为赢墩。',
    },
    deal: 'N:AK84.A5.A632.982 765.KJT98.K85.K4 QJT9.432.QJT4.A3 32.Q76.97.QJT765',
    contract: {
      level: 4,
      denom: 'S',
      declarer: 'S',
      doubled: 0,
    },
    targetTricks: 10,
    acblClassRef: 'ACBL Class 4: Taking Tricks with Trump',
  },
  {
    id: 'unblock_suit',
    title: {
      en: 'Unblock & Transportation',
      zh: '大牌解封：畅通长套',
    },
    category: {
      en: 'Line of Play',
      zh: '做牌路线',
    },
    objective: {
      en: 'Make 3NT (9 tricks). Play the high honors from the short hand first to unblock diamonds.',
      zh: '达成 3NT 定约（至少 9 墩）。先从短套明手出大牌解封，让长套奔跑无阻。',
    },
    hint: {
      en: 'Play North’s ♦K and ♦Q first before using South’s ♦A. Otherwise, North’s high cards will strand South’s long diamonds!',
      zh: '切记先兑现北手短套的 ♦K 与 ♦Q！若先在南手打 A，北手的大牌将会堵塞桥路，无法兑现长套。',
    },
    deal: 'N:K62.A84.KQ.A8752 QJ5.KT9.654.KJ94 A43.Q52.AJT987.6 T987.J763.32.QT3',
    contract: {
      level: 3,
      denom: 'NT',
      declarer: 'S',
      doubled: 0,
    },
    targetTricks: 9,
    acblClassRef: 'ACBL Class 3: Counting Winners & Line of Play in NT',
  },
  {
    id: 'dummy_reversal',
    title: {
      en: 'Ruffing Losers in Dummy',
      zh: '明手消输：保护长将',
    },
    category: {
      en: 'Loser Management',
      zh: '输墩管理',
    },
    objective: {
      en: 'Make 4♥ (10 tricks). Eliminate South’s diamond losers by ruffing in dummy.',
      zh: '达成 4♥ 定约（至少 10 墩）。在明手（短将牌方）将吃消除南家的方块输墩。',
    },
    hint: {
      en: 'Do not draw all trumps immediately! Ruff South’s losing diamond in dummy with North’s ♥8 before pulling the last defender trump.',
      zh: '不要一开始拔光将牌！先从南手送出方块并在明手用 ♥8 将吃消去输墩，之后再清光防守方剩余将牌。',
    },
    deal: 'N:874.K86.765.AK62 KT3.95.KQ4.J9873 A65.AQJT42.A8.54 QJ92.73.JT932.QT',
    contract: {
      level: 4,
      denom: 'H',
      declarer: 'S',
      doubled: 0,
    },
    targetTricks: 10,
    acblClassRef: 'ACBL Class 4: Taking Tricks with Trump',
  },
  {
    id: 'danger_hand',
    title: {
      en: 'The Safe Play & Danger Hand',
      zh: '安全做牌：规避危险手',
    },
    category: {
      en: 'Safety Play',
      zh: '安全做牌',
    },
    objective: {
      en: 'Make 3NT (9 tricks). Keep East off lead at all costs to protect your spade holding.',
      zh: '达成 3NT 定约（至少 9 墩）。任何时候切勿让危险手东家进手，保护南手黑桃。',
    },
    hint: {
      en: 'East is the danger hand who could lead a spade through your King. Always finesse into West, never allowing East to win a trick!',
      zh: '东家是危险手，一旦进手就能穿打黑桃重创南家 ♠K。飞牌时务必向西家飞，绝不能让东家进手！',
    },
    deal: 'N:A62.A83.AK74.K85 QT8.K752.T65.763 K53.QJ4.QJ92.AJ4 J974.T96.83.QT92',
    contract: {
      level: 3,
      denom: 'NT',
      declarer: 'S',
      doubled: 0,
    },
    targetTricks: 9,
    acblClassRef: 'ACBL Class 3: Safety Plays in Notrump',
  },
];

export function getChallenge(id: string): Challenge | undefined {
  return ACBL_CHALLENGES.find(c => c.id === id);
}
