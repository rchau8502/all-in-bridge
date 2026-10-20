/**
 * lessons.ts — tutorial lesson content, fully bilingual (EN/ZH).
 *
 * Curriculum follows the ACBL Intro to Bridge Series 1 class sequence
 * (play first, then bidding), rewritten from scratch in plain,
 * kid-simple language. All text here is original.
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

const DECK_DEAL: Hands = makeHands({
  N: ['3S', '5S', '9S', 'KS', '5H', '9H', 'KH', '4D', '8D', 'QD', '3C', '7C', 'JC'],
  E: ['4S', '6S', 'TS', '2H', '6H', 'TH', '3H', '5D', '9D', 'KD', '4C', '8C', 'QC'],
  S: ['AS', '7S', 'JS', 'AH', '7H', 'JH', '2D', '6D', 'TD', 'AD', '5C', '9C', 'KC'],
  W: ['2S', '8S', 'QS', '4H', '8H', 'QH', '3D', '7D', 'JD', '2C', '6C', 'TC', 'AC'],
});

const TRUMP_DEAL: Hands = makeHands({
  N: ['2D', '3D', '5D', '7D', '2H', '3H', '4H', 'AS', 'KS', 'QS', '8S', 'AD', 'KD'],
  E: ['3S', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', '9D', 'JD', 'QD', '2C', '3C'],
  S: ['2S', '5S', '7S', 'AC', 'KC', 'QC', 'JC', 'TC', '9C', '8C', '7C', '6C', '5C'],
  W: ['4D', '6D', '8D', 'TD', 'AH', 'KH', 'QH', '4C', '9S', 'TS', 'JS', '4S', '6S'],
});

const CONV_DEAL: Hands = makeHands({
  N: ['AS', 'KS', 'QS', 'JS', '4S', '2H', '3H', '8D', '9D', 'TD', '4C', '5C', '6C'],
  E: ['6S', '8S', 'TS', '6H', '8H', '2D', '6D', 'JD', 'KD', '7C', '9C', 'JC', 'KC'],
  S: ['AH', 'KH', 'QH', 'JH', 'TH', '5H', '2S', '3S', '4D', '5D', 'AC', '2C', '3C'],
  W: ['5S', '7S', '9S', '4H', '7H', '9H', '3D', '7D', 'QD', 'AD', '8C', 'TC', 'QC'],
});

const STRAT_DEAL: Hands = makeHands({
  N: ['5S', '6S', '7S', '2D', '3D', 'QH', '8H', '9C', 'TC', 'JC', 'QC', 'KC', 'AC'],
  E: ['8S', '9S', 'TS', 'JS', 'JH', 'TH', '7H', '5H', '7D', '8D', '9D', 'TD', 'JD'],
  S: ['AS', 'KS', 'QS', 'AH', '6H', '2H', '4D', '5D', '6D', '2C', '3C', '4C', '5C'],
  W: ['2S', '3S', '4S', 'KH', '9H', '4H', '3H', 'AD', 'KD', 'QD', '6C', '7C', '8C'],
});

/** Lesson 6 deal: North opens 1♦ (13 pts), South answers 1♥ (5 hearts, 11 pts),
 *  North raises with 3 hearts. Verified: every suit A–2 exactly once. */
const MINOR_DEAL: Hands = makeHands({
  N: ['AS', '7S', '2S', 'QH', '6H', '4H', 'AD', 'KD', '8D', '3D', '9C', '5C', '2C'],
  E: ['QS', 'JS', '9S', '4S', '9H', '3H', 'QD', 'JD', '9D', '5D', 'KC', '7C', '3C'],
  S: ['KS', '8S', '3S', 'KH', 'JH', 'TH', '8H', '2H', '7D', '2D', 'AC', '6C', '4C'],
  W: ['TS', '6S', '5S', 'AH', '7H', '5H', 'TD', '6D', '4D', 'QC', 'JC', '8C', 'TC'],
});

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
    id: 'deck',
    title: T('Say Hi to the Cards', '认识牌朋友'),
    dealer: 'N',
    hands: DECK_DEAL,
    contract: { level: 1, denom: 'NT', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          "Hi! Let's play bridge. Bridge is a card game for 4 people. You play with a partner — your partner sits across from you.",
          '嗨！我们来玩桥牌。桥牌是4个人玩的牌游戏。你有一个搭档 —— 搭档就坐在你对面。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'There are 52 cards and 4 suits: spades ♠, hearts ♥, diamonds ♦, clubs ♣. Each suit has 13 cards. Spades and clubs are black. Hearts and diamonds are red.',
          '一副牌有52张，有4种花色：黑桃 ♠、红桃 ♥、方块 ♦、梅花 ♣。每种花色13张。黑桃和梅花是黑色的，红桃和方块是红色的。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Cards go from small to big: 2 3 4 5 6 7 8 9 10 J Q K A. The ace (A) is the biggest card of all. Watch: hearts are played, and you play last — with the ace of hearts!',
          '牌从小到大是：2 3 4 5 6 7 8 9 10 J Q K A。A是最大的牌。看好：大家出红桃，你最后出 —— 出红桃A！'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '4H' },
          { seat: 'N', card: '5H' },
          { seat: 'E', card: '2H' },
          {
            seat: 'S', learner: true, expected: 'AH',
            hint: T('Play the ace of hearts (AH).', '打出红桃A (AH)。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'You won! When you win a round of cards, you start the next round. Now play your ace of spades (AS) — the biggest card in the whole deck!',
          '你赢了！赢了一轮牌的人，下一轮先出牌。现在打出黑桃A (AS) —— 整副牌里最大的一张！'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AS',
            hint: T('Play the ace of spades (AS).', '打出黑桃A (AS)。'),
          },
          { seat: 'W', card: '2S' },
          { seat: 'N', card: '3S' },
          { seat: 'E', card: '4S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Two aces, two wins! Now you know the cards. Next: how to win rounds. Each round is called a 'trick'.",
          '两个A，赢了两次！现在你认识牌了。下一课：怎么赢下一轮牌 —— 每一轮叫一"墩"。'
        ),
      },
    ],
  },
  {
    id: 'tricks',
    title: T('Win the Tricks', '赢墩小高手'),
    dealer: 'N',
    hands: PRACTICE_DEAL,
    contract: FULL_HAND_CONTRACT,
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Four players sit at the table: North, East, South, West. You are South. North is your partner. East and West are the other team.',
          '桌上有四个玩家：北、东、南、西。你是南家。北家是你的搭档。东家和西家是另一队。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Each round is a trick. One player plays a card first. Then everyone must play the same suit if they have it. That is called following suit.',
          '每一轮叫一墩。一个人先出牌。然后每个人有这个花色就必须跟这个花色。这叫"跟牌"。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'The biggest card of the first suit wins the trick. Watch the first trick: West plays first.',
          '先出的那个花色里，最大的牌赢得这一墩。看第一墩：西家先出。'
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
              'Diamonds were played first. Play your ace of diamonds (AD) — the biggest diamond!',
              '先出的是方块。打出你的方块A (AD) —— 最大的方块！'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'You won the trick! The winner starts the next trick.',
          '你赢了这一墩！赢的人先出下一墩。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AH',
            hint: T('Start with your ace of hearts (AH).', '先出你的红桃A (AH)。'),
          },
          { seat: 'W', card: '2C' },
          { seat: 'N', card: '6H' },
          { seat: 'E', card: '2H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Did you see? West had no hearts left, so West played a club. That is OK! You only follow suit if you have that suit.',
          '看到了吗？西家没有红桃了，所以西家出了梅花。这是可以的！你手里有这个花色时，才必须跟。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KH',
            hint: T('Play the king of hearts (KH).', '打出红桃K (KH)。'),
          },
          { seat: 'W', card: '8C' },
          { seat: 'N', card: '7H' },
          { seat: 'E', card: '3H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Three tricks, three wins! A whole hand has 13 tricks. Next: count your winners and make a plan.',
          '三墩全赢！一整副牌有13墩。下一课：数你的赢墩，做一个计划。'
        ),
      },
    ],
  },
  {
    id: 'strategy',
    title: T('Count and Plan', '数一数，做计划'),
    dealer: 'N',
    hands: STRAT_DEAL,
    contract: { level: 1, denom: 'NT', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Good players make a plan first. Step 1: count your sure winners. A sure winner is a trick you KNOW you will win.',
          '高手先做计划。第一步：数你的稳赢墩。稳赢墩就是你肯定能赢的墩。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'An ace is always a sure winner. A king is a sure winner too, if you also have the ace. Look at your cards: ♠A K Q = 3 winners. ♥A = 1 more. You have 4 sure winners!',
          'A永远是稳赢墩。如果你还有A，K也是稳赢墩。看你的牌：♠A K Q是3个赢墩，♥A再多1个。你一共有4个稳赢墩！'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Your job is to win 7 tricks (that is a 1NT contract). You already have 4 sure ones. West plays first. Win with your ace!',
          '你的任务是赢7墩（这叫1NT定约）。你已经有4个稳的了。西家先出。用你的A赢下来！'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '2S' },
          { seat: 'N', card: '5S' },
          { seat: 'E', card: '8S' },
          {
            seat: 'S', learner: true, expected: 'AS',
            hint: T('Win with the ace of spades (AS).', '用黑桃A (AS) 赢下来。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'One down! Now you play first. Keep taking your winners: play the king of spades.',
          '拿下一墩！现在你先出。继续拿你的赢墩：出黑桃K。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KS',
            hint: T('Play the king of spades (KS).', '打出黑桃K (KS)。'),
          },
          { seat: 'W', card: '3S' },
          { seat: 'N', card: '6S' },
          { seat: 'E', card: '9S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'See? Count first, then take your winners fast — before the other team can stop you.',
          '看到了吧？先数清楚，再快快把赢墩拿走 —— 趁对方还没来得及捣乱。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Now a magic trick: the finesse （飞牌）. Look at hearts. You have A-6-2. Your partner has Q-8. The king is hiding with the other team. Play a small heart TOWARD the queen. If West has the king, the king is stuck — it must play before the queen. Try it!",
          '现在学一个魔法：飞牌。看红桃。你有 A-6-2，搭档有 Q-8。K藏在对方手里。朝着Q打出一张小红桃。如果K在西家，K就被困住了 —— 它必须在Q之前出牌。试试看！'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '2H',
            hint: T(
              'Play a small heart toward the queen — the 2 of hearts (2H)!',
              '朝着Q打出一张小红桃 —— 红桃2 (2H)！'
            ),
          },
          { seat: 'W', card: '3H' },
          {
            seat: 'N', learner: true, expected: 'QH',
            hint: T(
              "Play partner's queen (QH) — West's king is stuck in front of it!",
              '打出搭档的Q (QH) —— 西家的K被困在Q前面了！'
            ),
          },
          { seat: 'E', card: '5H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'The queen won! That is a finesse. It works half the time — 50%. If the king sits behind the queen, the queen loses. It is a smart guess!',
          'Q赢了！这就是飞牌。飞牌一半时间成功 —— 50%。如果K坐在Q的后面，Q就输了。这是一个聪明的猜测！'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Some numbers to remember. A finesse wins about 50 times out of 100. When 5 cards are missing, they split 3 and 2 most of the time — about 68 out of 100. When 4 cards are missing, they split 2 and 2 about 41 times out of 100. Old players say: 'With 8 cards, always finesse. With 9 or more, play the ace and king and hope the queen falls.'",
          "记住几个数字。飞牌100次里约赢50次。外面少5张牌时，最常见的是分成3张和2张 —— 100次里约68次。少4张时，分成2张和2张，100次里约41次。老玩家说：'8张牌就飞，9张以上就打A和K，等Q掉下来。'"
        ),
      },
    ],
  },
  {
    id: 'trump',
    title: T('Trump Power', '将牌的威力'),
    dealer: 'N',
    hands: TRUMP_DEAL,
    contract: { level: 2, denom: 'S', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Some games pick a super suit. The super suit is called trump. Here, spades are trump. ANY trump card beats ANY card of another suit — even an ace! A tiny 2 of spades beats the big ace of hearts.',
          '有些牌局会选一个超级花色。超级花色叫将牌。这里黑桃是将牌。任何一张将牌都能打败其他花色的任何牌 —— 连A都不行！小小的黑桃2能打败大大的红桃A。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'If you have no cards of the suit that was played, you may play a trump instead. That is called ruffing. Diamonds are played, and you have NO diamonds. Ruff it!',
          '如果你没有别人出的那个花色，你可以改出将牌。这叫"将吃"。别人出方块，而你一张方块都没有。将吃它！'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '4D' },
          { seat: 'N', card: '2D' },
          { seat: 'E', card: '9D' },
          {
            seat: 'S', learner: true, expected: '2S',
            hint: T(
              'You have no diamonds — ruff with the 2 of spades (2S)!',
              '你没有方块 —— 用黑桃2 (2S) 将吃！'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Your tiny 2 of spades beat the 9 of diamonds! Trump is super strong.',
          '你小小的黑桃2打败了方块9！将牌超级强。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'You won, so you play first. When trump is played first, it works like a normal suit: the biggest trump wins. Play a spade.',
          '你赢了，所以你先出。如果先出的就是将牌，那就和普通花色一样：最大的将牌赢。出一张黑桃。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '7S',
            hint: T('Play the 7 of spades (7S).', '打出黑桃7 (7S)。'),
          },
          { seat: 'W', card: '9S' },
          { seat: 'N', card: 'AS' },
          { seat: 'E', card: '3S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "North's ace of spades won — the biggest trump wins. Now you know trump power! Next: we start talking — with bids.",
          '北家的黑桃A赢了 —— 最大的将牌赢。你懂将牌的威力了！下一课：我们开始"说话" —— 用叫牌。'
        ),
      },
    ],
  },
  {
    id: 'bidding',
    title: T('Bidding Is Talking', '叫牌就是说话'),
    dealer: 'N',
    hands: PRACTICE_DEAL,
    contract: { level: 2, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Before we play cards, we TALK — with bids. A bid tells your partner about your cards. To talk, first count your points: ace = 4, king = 3, queen = 2, jack = 1.',
          '出牌之前，我们先"说话" —— 用叫牌。叫牌是告诉搭档你的牌。要说话，先数你的点数：A=4点，K=3点，Q=2点，J=1点。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Players take turns to bid. Each bid must be bigger than the last one. A bid is a number + a suit, like 1♥. Suits go from small to big: clubs, diamonds, hearts, spades — and last, no-trump (NT). NT means: no trump suit in this game.',
          '大家轮流叫牌。每一次叫牌都要比上一次大。叫牌是数字＋花色，比如1♥。花色从小到大：梅花、方块、红桃、黑桃 —— 最后是无将（NT）。无将的意思是：这一局没有将牌花色。'
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
              'East said 1 diamond. You have 5 hearts — say 1 heart (1H).',
              '东家说了1方块。你有5张红桃 —— 说1红桃 (1H)。'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          '1♥ is bigger than 1♦, because hearts are bigger than diamonds. Good talking!',
          '1♥比1♦大，因为红桃比方块大。说得好！'
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
              'East said 2 diamonds. Say your hearts again: 2 hearts (2H).',
              '东家说了2方块。再说一次你的红桃：2红桃 (2H)。'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "When three players in a row say 'pass' (no bid), the talking stops. The last bid is the contract — a promise your team must keep.",
          '如果连续三个人都说"不叫"（pass），说话就结束了。最后一个叫牌就是定约 —— 你们队要做到的承诺。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Who plays the hand? The player who FIRST said the contract's suit. You said hearts first, so YOU are the declarer. Your partner is the dummy.",
          '谁来打这副牌？第一个说出定约花色的人。你先说的红桃，所以你是庄家。你的搭档是明手。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "The dummy puts all their cards face-up on the table. Then the dummy does not play — the declarer plays BOTH hands. From now on, you can see North's cards: you are South, and North is your dummy.",
          '明手把自己的牌全部翻开放在桌上。然后明手就不出牌了 —— 庄家一个人打两手牌。从现在开始，你能看到北家的牌：你是南家，北家是你的明手。'
        ),
      },
    ],
  },
  {
    id: 'minor-responses',
    title: T('Answer Partner', '回答搭档'),
    dealer: 'N',
    hands: MINOR_DEAL,
    contract: { level: 2, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          "Partner opens the talk. North opens 1♦. Diamonds and clubs are the 'minor' suits. Hearts and spades are the 'major' suits. An opening bid says: 'I have about 12 or more points.'",
          '搭档先开始说话。北家开叫1♦。方块和梅花是"小花色"，红桃和黑桃是"大花色"。开叫的意思是："我大约有12点以上。"'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Now you answer. Your answer tells partner about YOUR cards. With 6 or more points, do not pass! Bid your longest suit. You have 5 hearts and 11 points — answer with hearts.',
          '现在你来回答。你的回答告诉搭档你的牌。有6点以上就不要不叫！叫出你最长的花色。你有5张红桃和11点 —— 用红桃回答。'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'N', bid: '1D' },
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T('Answer with your hearts: 1 heart (1H).', '用你的红桃回答：1红桃 (1H)。'),
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: '2H' },
          { seat: 'E', bid: 'P' },
          { seat: 'S', bid: 'P' },
          { seat: 'W', bid: 'P' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "North raised your hearts to 2♥! A raise means: 'I have 3 or 4 of your suit — I like it!' North has 3 hearts for you. Together you have 8 hearts. That is a good team suit.",
          '北家把你的红桃加到2♥！加叫的意思是："我有3到4张你的花色 —— 我喜欢！"北家有3张红桃帮你。你们一共有8张红桃。这是一个好的团队花色。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Everyone passed, so 2♥ is the contract. You said hearts first, so you are the declarer, and North is your dummy. Teamwork!',
          '大家都不叫了，所以2♥是定约。你先说的红桃，所以你是庄家，北家是你的明手。团队合作！'
        ),
      },
    ],
  },
  {
    id: 'full-hand',
    title: T('Raise and Play', '加叫，然后打牌'),
    dealer: 'N',
    hands: PRACTICE_DEAL,
    contract: FULL_HAND_CONTRACT,
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Big day: a whole hand! You are South, and North dealt the cards. Look at your hearts: 5 hearts — A K Q J and a small one. Super strong!',
          '大日子：一整副牌！你是南家，北家发的牌。看你的红桃：5张 —— A K Q J加一张小的。超级强！'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Partner can help your suit. If partner has 3 or more of your suit, partner RAISES your bid. A raise says: "Your suit is our suit!" Watch the talk.',
          '搭档能帮你的花色。如果搭档有3张以上你的花色，搭档会加叫你的牌。加叫的意思是："你的花色就是我们的花色！"看这次谈话。'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T('Open 1 heart (1H) — show your 5 hearts.', '开叫1红桃 (1H) —— 亮出你的5张红桃。'),
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: '2H' },
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: 'P',
            hint: T('Partner raised to 2 hearts. That is high enough — pass.', '搭档加到了2红桃。够高了 —— 不叫。'),
          },
          { seat: 'W', bid: 'P' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Partner raised you — North has hearts too! The contract is 2♥, played by you. You need 8 tricks. Hearts are trump. West plays first.',
          '搭档加叫了你 —— 北家也有红桃！定约是2♥，由你来打。你需要8墩。红桃是将牌。西家先出。'
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
            hint: T('Diamonds first — win with your ace (AD).', '先出的是方块 —— 用你的A赢 (AD)。'),
          },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AH',
            hint: T('Take away their trumps: ace of hearts (AH).', '拔掉他们的将牌：红桃A (AH)。'),
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
            hint: T('Again: king of hearts (KH).', '再来：红桃K (KH)。'),
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
            hint: T('Jack of hearts (JH). Almost done with trumps!', '红桃J (JH)。将牌快拔完了！'),
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
            hint: T('Your last heart (5H). All their trumps are gone now.', '你最后一张红桃 (5H)。他们的将牌全拔完了。'),
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
            hint: T('Now your spade winners: ace of spades (AS).', '现在拿黑桃赢墩：黑桃A (AS)。'),
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
            hint: T('King of spades (KS).', '黑桃K (KS)。'),
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
            hint: T("Play a small club toward dummy's ace (7C).", '向明手的A打一张小梅花 (7C)。'),
          },
          { seat: 'W', card: '5D' },
          {
            seat: 'N', learner: true, expected: 'AC',
            hint: T("You play dummy's cards too — win with the ace of clubs (AC).", '明手的牌也归你打 —— 用梅花A赢 (AC)。'),
          },
          { seat: 'E', card: 'JC' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: 'KC',
            hint: T("Play dummy's king of clubs (KC).", '打出明手的梅花K (KC)。'),
          },
          { seat: 'E', card: 'TS' },
          {
            seat: 'S', learner: true, expected: '4C',
            hint: T('Follow with your 4 of clubs (4C).', '跟出你的梅花4 (4C)。'),
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
            hint: T('Your 5 of clubs (5C).', '你的梅花5 (5C)。'),
          },
          { seat: 'W', card: '7D' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: 'KD',
            hint: T("Take dummy's king of diamonds (KD).", '拿明手的方块K (KD)。'),
          },
          { seat: 'E', card: 'TD' },
          {
            seat: 'S', learner: true, expected: '6C',
            hint: T('No diamonds left — throw away the 6 of clubs (6C).', '没有方块了 —— 垫掉梅花6 (6C)。'),
          },
          { seat: 'W', card: 'QD' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: '3D',
            hint: T('Last trick! Dummy plays the small diamond (3D).', '最后一墩！明手出小方块 (3D)。'),
          },
          { seat: 'E', card: '8S' },
          {
            seat: 'S', learner: true, expected: '3C',
            hint: T('No diamonds — throw away your last club (3C).', '没有方块 —— 垫掉你最后一张梅花 (3C)。'),
          },
          { seat: 'W', card: '8D' },
        ],
      },
      { kind: 'result' },
      {
        kind: 'info',
        text: T(
          'You won 12 of 13 tricks! West got the last one. 2♥ with 4 extra tricks scores 230 points. You did it — you can play a whole hand!',
          '你赢了13墩里的12墩！最后一墩被西家拿走了。2♥多赢4墩，得230分。你做到了 —— 你会打一整副牌了！'
        ),
      },
    ],
  },
  {
    id: 'conversation',
    title: T('Opener Tells More', '开叫者再说'),
    dealer: 'S',
    hands: CONV_DEAL,
    contract: { level: 2, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Bidding is a talk with your partner. Every bid is a little message about your cards.',
          '叫牌是你和搭档的谈话。每一次叫牌都是关于你手牌的一个小消息。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'With about 12 or more points, you can open the talk. Open with your longest suit. You have 6 hearts and 14 points — open 1♥.',
          '大约12点以上，你可以先开始说话。用你最长的花色开叫。你有6张红桃和14点 —— 开叫1♥。'
        ),
      },
      {
        kind: 'auction',
        script: [
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T('Open your hearts: 1♥.', '开叫你的红桃：1♥。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'You opened! Now partner answers. North will tell you about their cards.',
          '你开叫了！现在搭档回答你。北家会告诉你他的牌。'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: '1S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'North said 1♠: "I have spades." Now YOU talk again — that is called a rebid. You have 6 hearts, so say hearts again: 2♥. It means: "Hearts are REALLY my suit."',
          '北家说了1♠："我有黑桃。"现在你再说一次 —— 这叫"再叫"。你有6张红桃，所以再说红桃：2♥。意思是："红桃真的是我的花色。"'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: '2H',
            hint: T('Say your hearts again: 2♥.', '再说一次红桃：2♥。'),
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: 'P' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Three passes — the talk is done, and 2♥ is yours. Hear the talk? 1♥ "I have hearts" → 1♠ "I have spades" → 2♥ "Hearts again — I mean it!"',
          '三次不叫 —— 谈话结束，2♥是你们的了。听懂这次谈话了吗？1♥"我有红桃" → 1♠"我有黑桃" → 2♥"还是红桃 —— 我是认真的！"'
        ),
      },
    ],
  },
  {
    id: 'scoring',
    title: T('Go for Game!', '冲成局！'),
    dealer: 'S',
    hands: PRACTICE_DEAL,
    contract: { level: 4, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          "A contract is a promise: 'My team will win this many tricks.' 2♥ means: win 8 tricks with hearts as trump. (6 + 2 = 8. The first 6 tricks are free — they don't count.)",
          '定约是一个承诺："我们队会赢这么多墩。"2♥的意思是：以红桃为将牌，赢8墩。（6＋2＝8。前6墩是免费的 —— 不算数。）'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Some promises are BIG. If a contract scores 100 points or more, it is called game （成局）. Game pays a bonus: +300 points! The game contracts are 3NT, 4♥, 4♠, 5♣ and 5♦.',
          '有些承诺很大。如果一个定约的分数达到100分，就叫成局。成局有奖励：+300分！成局的定约是3NT、4♥、4♠、5♣和5♦。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'How do you know your team can make game? Count BOTH hands. About 25 points together = go for game! （25点进局）. Less than 100 contract points is a partscore — a small promise, a small bonus (50).',
          '怎么知道你们队能成局？把两只手的点数加起来。两人一共大约25点 = 冲成局！（25点进局）。不到100分的定约是部分定约 —— 小承诺，小奖励（50分）。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Try it. You open 1♥. Partner raises to 2♥ — partner likes your hearts. Now count YOUR hand: you have 21 points! Even if partner has only 6 points, together that is 27 — way over 25. Go for game!',
          '试一试。你开叫1♥。搭档加叫到2♥ —— 搭档喜欢你的红桃。现在数你的手牌：你有21点！就算搭档只有6点，加起来也有27点 —— 远远超过25点。冲成局！'
        ),
      },
      {
        kind: 'auction',
        script: [
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T('Open 1♥.', '开叫1♥。'),
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: '2H' },
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: '4H',
            hint: T('You have 21 points — bid game: 4♥!', '你有21点 —— 叫成局：4♥！'),
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: 'P' },
        ],
      },
      {
        kind: 'info',
        text: T(
          '4♥ is game! Now your team must win 10 tricks. West plays first…',
          '4♥是成局！现在你们队必须赢10墩。西家先出……'
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
            hint: T('Win with the ace of diamonds (AD) — trick 1 of 10!', '用方块A (AD) 赢下来 —— 10墩里的第1墩！'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'One down, nine to go! Make game and you score BIG. Fail, and the other team gets the points. Big promise, big prize!',
          '拿下1墩，还差9墩！做成成局，得分很高。失败了，对方得分。大承诺，大奖品！'
        ),
      },
    ],
  },
  {
    id: 'overcall',
    title: T('Jump In!', '争叫，抢进来'),
    dealer: 'E',
    hands: PRACTICE_DEAL,
    contract: { level: 2, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Uh oh — East opened the bidding first: 1♦. Can you still talk? YES! When the other team opens and you bid anyway, that is an overcall （争叫）.',
          '哎呀 —— 东家先开叫了：1♦。你还能说话吗？能！对方开叫后你再叫牌，这叫争叫。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'To overcall, you need a GOOD suit: 5 or more cards, with strong top cards. Look at your hearts: A K Q J and 5 cards in total. Super good! Jump in!',
          '争叫需要一个好花色：5张以上，而且大牌很强。看你的红桃：A K Q J，一共5张。超级好！抢进来！'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'E', bid: '1D' },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T('Jump in with your hearts: 1♥!', '用你的红桃抢进来：1♥！'),
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: '2H' },
          { seat: 'E', bid: 'P' },
          { seat: 'S', bid: 'P' },
          { seat: 'W', bid: 'P' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "North raised to 2♥ — when partner supports your overcall, that is called advancing. North has 4 hearts for you. Your team 'stole' the hand!",
          '北家加叫到2♥ —— 搭档支持你的争叫，这叫进叫。北家有4张红桃帮你。你们队把这副牌"抢"过来了！'
        ),
      },
      {
        kind: 'info',
        text: T(
          'You did it! You learned to play, to count, to plan, to bid, and to fight for hands. You are a bridge player now. See you at the tables!',
          '你做到了！你学会了打牌、数牌、做计划、叫牌，还会抢牌了。你现在是一名桥牌手了。牌桌上见！'
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
