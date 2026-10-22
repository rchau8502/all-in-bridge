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

/** Lesson 3 deal: South declares 1NT. Combined top winners (count BOTH
 *  hands together; per suit winners = min(longer hand's length, top honors
 *  in an unbroken row from the ace)): ♠1 ♥0 ♦1 ♣2 = 4 — three short of 7.
 *  Three rescue plans: the ♦A-Q tenace sits in South's hand with the K in
 *  East (dummy leads small toward it — finesse example 1, +1); the ♠A-Q
 *  are split, ace in South and queen in dummy, with the K in West (lead
 *  small toward the queen — finesse example 2, +1); and the hearts are
 *  SECONDARY honors: K-Q in South plus the J in dummy, missing only the
 *  ace (West) — knock the ace out once and Q and J are winners
 *  (developing, +2). Script: West leads ♣5, dummy's K wins and South's J
 *  falls under it (the club cap, live), both finesses succeed, then the
 *  hearts are developed: K loses to the ace, Q and J come home.
 *  Simulator-verified for legality and the count. */
const STRAT_DEAL: Hands = makeHands({
  N: ['QS', '5S', '3S', 'JH', '8H', '7H', '9D', '8D', '5D', '2D', 'AC', 'KC', '4C'],
  E: ['JS', 'TS', 'TH', '6H', '5H', 'KD', 'TD', '7D', '6D', '9C', '7C', '3C', '2C'],
  S: ['AS', '8S', '6S', '4S', '2S', 'KH', 'QH', '2H', 'AD', 'QD', '3D', 'QC', 'JC'],
  W: ['KS', '9S', '7S', 'AH', '9H', '4H', '3H', 'JD', '4D', 'TC', '8C', '6C', '5C'],
});

/** Lesson 4 deal: South declares 3NT. Top winners (both hands together):
 *  ♠3 ♥0 ♦2 ♣1 = 6 — three short of 9. The diamonds are the gold mine:
 *  9 combined cards, the defenders hold only 4 (Q J T 2). Cash A and K
 *  (three of theirs fall), then deliberately duck the 6 to West's queen —
 *  their last diamond — re-enter with the ♣A entry and harvest 9-8-7:
 *  5 diamond tricks and exactly 9 in total. West's ♥A K Q are the
 *  defenders' other tricks. Simulator-verified: NS take exactly 9. */
const LONGSUIT_DEAL: Hands = makeHands({
  N: ['KS', 'QS', '3S', '2S', '8H', '5H', '4H', '5D', '4D', '3D', '7C', '6C', '5C'],
  E: ['TS', '7S', '6S', 'JH', 'TH', '9H', '3H', '2H', 'TD', 'TC', '4C', '3C', '2C'],
  S: ['AS', '5S', '4S', '7H', '6H', 'AD', 'KD', '9D', '8D', '7D', '6D', 'AC', '8C'],
  W: ['JS', '9S', '8S', 'AH', 'KH', 'QH', 'QD', 'JD', '2D', 'KC', 'QC', 'JC', '9C'],
});

/** Lesson 8 deal: South declares 4♠ — a GAME contract. The two clues
 *  from the lesson are both on display: combined points 26 (South 16,
 *  North 10 — past the 25-point game line) and an 8-card spade fit
 *  (South 5 + North 3). Losers from South's long-trump hand: ♠0 ♥0
 *  (dummy's K-Q cover) ♦1 ♣2 = 3 — exactly the game budget. Script pays
 *  the three losers (two clubs to West's A-K, one diamond to the Q),
 *  draws trumps and lands exactly 10 tricks: 420 points non-vulnerable,
 *  vs 170 for the same 10 tricks at 2♠. Simulator-verified. */
const CONTRACT_DEAL: Hands = makeHands({
  N: ['JS', '7S', '5S', 'KH', 'QH', '6H', 'AD', '8D', '6D', '4D', '9C', '5C', '4C'],
  E: ['3S', '2S', '8H', '5H', '3H', '2H', 'TD', '7D', '2D', 'QC', 'JC', 'TC', '2C'],
  S: ['AS', 'KS', 'QS', '8S', '6S', 'AH', '7H', '4H', 'KD', '9D', '5D', '8C', '6C'],
  W: ['TS', '9S', '4S', 'JH', 'TH', '9H', 'QD', 'JD', '3D', 'AC', 'KC', '7C', '3C'],
});

/** Defense lesson 1 deal: South declares 3NT; the learner DEFENDS as
 *  West and makes the opening lead. West's hearts K-T-8-4 (longest and
 *  strongest unbid suit, an honor but no sequence) call for the modern
 *  agreements taught in the lesson: FOURTH BEST — the 4. Partner's ace
 *  wins, the return lets West's king score, then West leads a small
 *  spade toward partner's Q-J-T sequence (partner cashes Q and J), and
 *  West's club ace catches declarer's king. Defensive tricks: ♥A ♥K
 *  ♠Q ♠J ♣A = 5 — 3NT down one. Simulator-verified. */
const DEFENSE_LEAD_DEAL: Hands = makeHands({
  N: ['AS', '8S', '6S', '2S', 'QH', '9H', '6H', '2H', 'KD', 'JC', '9C', '7C', '3C'],
  E: ['QS', 'JS', 'TS', 'AH', '7H', '8D', '7D', '6D', '5D', '4D', '6C', '5C', '2C'],
  S: ['KS', '9S', '4S', 'JH', '5H', '3H', 'AD', 'QD', 'JD', '9D', '2D', 'KC', 'QC'],
  W: ['7S', '5S', '3S', 'KH', 'TH', '8H', '4H', 'TD', '3D', 'AC', 'TC', '8C', '4C'],
});

/** Defense lesson 2 deal: South declares 4♠; the learner defends as
 *  East, partner West leads. The four seat rules all fire: partner leads
 *  ♥6 and East's king (third hand high) drags out the ace — partner's
 *  queen scores later; declarer leads a small club to dummy's king and
 *  East, last to play, spends only the ten and saves the ace (it catches
 *  a trick at the end); dummy leads the ♦J and East COVERS with the
 *  queen, forcing the king and promoting East's ten — the ten then
 *  wins a trick, and partner's ♦9 wins another once the suit is cleared.
 *  Defensive tricks: ♥Q ♦T ♦A ♣A ♦9 = 5 — 4♠ down two. Simulator-verified. */
const DEFENSE_PLAY_DEAL: Hands = makeHands({
  N: ['JS', '7S', '5S', 'JH', '8H', '5H', '2H', 'JD', '6D', '2D', 'KC', '8C', '7C'],
  E: ['TS', '9S', '4S', 'KH', '9H', '4H', '3H', 'QD', 'TD', '5D', '3D', 'AC', 'TC'],
  S: ['AS', 'KS', 'QS', '8S', '6S', 'AH', 'TH', 'KD', '8D', 'QC', '9C', '3C', '2C'],
  W: ['3S', '2S', 'QH', '7H', '6H', 'AD', '9D', '7D', '4D', 'JC', '6C', '5C', '4C'],
});

/** Lesson 6 deal: South declares 4♠ with an 8-card trump fit topped by
 *  A-K-Q (South A K Q 7 4, dummy J 9 5) — solid trumps, so once they are
 *  drawn no side-suit winner can ever be ruffed. Losers from South (the
 *  long-trump hand): ♠0 (top three are A K Q) ♥2, dummy's K cancels one
 *  → 1; ♦3, dummy's A and K cancel two → 1; ♣1 (the singleton 6, no dummy
 *  honor) → 1. Total exactly 3 — the 4♠ budget. Script pays exactly
 *  those three (♦Q, ♣A, ♥J) and lands 10 tricks. Simulator-verified. */
const LOSERS_DEAL: Hands = makeHands({
  N: ['JS', '9S', '5S', 'KH', '4H', 'AD', 'KD', '7D', '4D', '9C', '8C', '7C', '5C'],
  E: ['6S', '2S', 'TH', '7H', '6H', '3H', 'TD', '8D', '2D', 'QC', 'JC', 'TC', '3C'],
  S: ['AS', 'KS', 'QS', '7S', '4S', 'AH', '8H', '5H', '2H', '9D', '6D', '3D', '6C'],
  W: ['TS', '8S', '3S', 'QH', 'JH', '9H', 'QD', 'JD', '5D', 'AC', 'KC', '4C', '2C'],
});

/** Lesson 6 deal: South declares 4♥. Losers from South (long trumps):
 *  ♠2 ♥0 ♦3 ♣0 (void) = 5 — two too many. Plan: ruffing finesse with dummy's
 *  ♣K-Q-J staircase against East's hidden ace (ducks twice, ruffed on the K)
 *  sheds both small spades; dummy ruffs the third diamond. Only THEN draw
 *  trumps. Simulator-verified: NS take exactly 10 tricks. */
const ELIM_DEAL: Hands = makeHands({
  N: ['AS', '8S', '6S', '3S', '8H', '5H', '4H', '9D', '2D', 'KC', 'QC', 'JC', '6C'],
  E: ['JS', 'TS', '4S', 'TH', '7H', 'AD', 'JD', '5D', '3D', 'AC', '8C', '5C', '3C'],
  S: ['AH', 'KH', 'QH', '9H', '6H', '3H', '2H', '7S', '5S', '2S', '8D', '6D', '4D'],
  W: ['KS', 'QS', '9S', 'JH', 'KD', 'QD', 'TD', '7D', 'TC', '9C', '7C', '4C', '2C'],
});

/** Lesson 8 deal: North opens 1♦ (13 pts), South answers 1♥ (5 hearts, 11 pts),
 *  North raises with 3 hearts. Verified: every suit A–2 exactly once. */
const MINOR_DEAL: Hands = makeHands({
  N: ['AS', '7S', '2S', 'QH', '6H', '4H', 'AD', 'KD', '8D', '3D', '9C', '5C', '2C'],
  E: ['QS', 'JS', '9S', '4S', '9H', '3H', 'QD', 'JD', '9D', '5D', 'KC', '7C', '3C'],
  S: ['KS', '8S', '3S', 'KH', 'JH', 'TH', '8H', '2H', '7D', '2D', 'AC', '6C', '4C'],
  W: ['TS', '6S', '5S', 'AH', '7H', '5H', 'TD', '6D', '4D', 'QC', 'JC', '8C', 'TC'],
});

type RawBidAction =
  | { seat: Seat; bid: string; note?: LText }
  | { seat: Seat; learner: true; expected: string; hint: LText; note?: LText };
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
          "Hey, welcome! I'm your coach. Let's learn bridge together — it's easier than it looks, promise.",
          '嘿，欢迎你！我是你的教练。我们一起学桥牌吧 —— 放心，比看起来简单多了。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Bridge is a game for 4 players. You and your partner sit across from each other. Two teams, working together.',
          '桥牌是4个人玩的游戏。你和搭档面对面坐。两队人，互相配合。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "One special thing about our bootcamp: EVERYONE's cards are face-up here, like an open book — so you can always see WHY things work. In a real game you only see your own cards (and later, the dummy's). Learning with x-ray eyes first is much faster.",
          '这个训练营有个特别之处：所有人的牌都是翻开的，像一本打开的书 —— 你随时能看清事情为什么这样运作。真正的牌局里，你只能看到自己的牌（之后还有明手的）。先用"透视眼"学，快得多。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'First, meet the cards. A deck has 52 cards. They live in 4 families — the suits: spades ♠, hearts ♥, diamonds ♦, clubs ♣.',
          '先认识一下牌。一副牌52张，住在4个"家族"里 —— 也就是花色：黑桃 ♠、红桃 ♥、方块 ♦、梅花 ♣。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Each family has 13 cards, from 2 (the smallest) up to A (the boss!). Spades and clubs wear black; hearts and diamonds wear red.',
          '每个家族13张牌，从2（最小）一直到A（老大！）。黑桃和梅花穿黑衣服，红桃和方块穿红衣服。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Let's try! Everyone plays a heart. You play last — slam down your ace of hearts, the biggest heart of all!",
          '来试一下！大家都出红桃，你最后出 —— 把你的红桃A拍下去，它是红桃里的老大！'
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
            hint: T('Your ace of hearts (AH). Slam it down!', '你的红桃A (AH)，拍下去！'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'BOOM — you won that round! The winner leads the next round. Now show them the biggest card in the whole deck: your ace of spades!',
          '砰 —— 你赢了这一轮！赢的人领出下一轮。现在亮出整副牌最大的牌：你的黑桃A！'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AS',
            hint: T('Ace of spades (AS) — the boss card!', '黑桃A (AS) —— 老大牌！'),
          },
          { seat: 'W', card: '2S' },
          { seat: 'N', card: '3S' },
          { seat: 'E', card: '4S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Two rounds, two wins — not bad for your first minute! Each round has a fancy name: a 'trick'. Next lesson, we win lots of tricks.",
          '两轮全赢 —— 第一分钟就这么厉害！每一轮有个正式名字，叫一"墩"。下一课，我们赢好多墩。'
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
          "Quick map of the table: North, East, South, West. You're South. North is your partner — your teammate. East and West are the other team.",
          '先认一下桌子：北、东、南、西。你是南家。北家是你的搭档 —— 你的队友。东家和西家是另一队。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'How does a trick work? One player plays a card first. Then everyone MUST play the same suit if they have it. Like follow-the-leader.',
          '一墩是怎么打的？一个人先出牌，然后每个人有这个花色就必须跟这个花色。就像玩跟随游戏，领队出什么，你跟什么。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'The biggest card of that first suit wins the trick. Simple! Watch — West goes first.',
          '最先出的那个花色里，最大的牌赢这一墩。就这么简单！看 —— 西家先出。'
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
              'Diamonds! Take it down with your ace of diamonds (AD).',
              '方块！用你的方块A (AD) 把它拿下。'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Got it! You won the trick, so YOU lead the next one. Winning feels good, right?',
          '拿下了！你赢了这一墩，所以下一墩你先出。赢的感觉不错吧？'
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
        kind: 'info',
        text: T(
          'Wait — did you spot that? West played a CLUB on a heart trick. West was out of hearts, so that is allowed. No hearts in hand? Then you may play anything.',
          '等等 —— 你注意到了吗？西家在红桃墩里出了一张梅花。因为西家没有红桃了，这样是可以的。手里没有这个花色，就可以出别的。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KH',
            hint: T('Now the king of hearts (KH).', '现在出红桃K (KH)。'),
          },
          { seat: 'W', card: '8C' },
          { seat: 'N', card: '7H' },
          { seat: 'E', card: '3H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Three tricks, all yours! A full hand has 13 tricks. Next up: the pros always count first — let me show you how.',
          '三墩全是你的！一整副牌有13墩。下一课：高手都会先数一数 —— 我教你。'
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
          "Before we count, meet the four jobs at the table. In every lesson from now on, YOU are the DECLARER — the player who plays the contract; today's is 1NT, and you sit in the South chair. Your partner North is the DUMMY: North lays every card face-up on the table, then just watches — YOU play North's cards as well as your own. West and East are the DEFENDERS: their job is to stop you from winning your tricks.",
          '数牌之前，先认识一下牌桌上的四个角色。从这一课起，每一课里你都是庄家 —— 负责打定约的人；今天的定约是1NT，你坐南家的位置。你的搭档北家是明手：他把每一张牌面朝上摊在桌上，然后就只用看着了 —— 北家的牌也由你来打。西家和东家是防守方：他们的任务是阻止你赢到需要的墩数。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "One rule of order: the first card of the hand — the OPENING LEAD — is played by the defender on declarer's LEFT. That is West, and West must choose it BEFORE dummy's cards are shown. Leading blind is the hardest job in defense! Only after the lead does North spread the dummy face-up. (This screen opens all four hands so you can learn — your x-ray eyes. At a real table you'd see only your own hand and, after the lead, the dummy.) Now — the counting.",
          '还有一个顺序规则：这副牌的第一张牌 —— 首攻 —— 由庄家左手边的防守方打出。也就是西家，而且西家必须在明手的牌摊开之前选定它。盲打首攻，是防守里最难的活！首攻打出之后，北家才把明手的牌摊开。（这个屏幕把四手的牌都摊开给你看，方便学习 —— 就是你的透视眼。真实牌桌上，你只能看到自己的牌，和首攻之后摊开的明手。）好 —— 开始数牌。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Pro secret: before playing a single card, good players COUNT. They count their sure winners — tricks that are already theirs, 100%.',
          '高手的秘密：出第一张牌之前，先数一数。数稳赢墩 —— 已经100%属于你的墩。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "And here's the key: you never count alone. Your winners live in BOTH hands — yours and dummy's, together. For each suit, ask two questions. One: how many cards does the LONGER hand hold? That is the most tricks this suit can ever give you. Two: how many top cards do you hold between you, in an unbroken row from the ace — A, then K, then Q…? If the enemy holds the ace, the answer is zero. Your winners in the suit are the SMALLER of the two numbers.",
          '关键在这里：你从来不是一个人在数。赢墩在两只手里 —— 你和明手的，要合在一起数。每一门花色，问两个问题。一：较长的那只手有几张牌？这就是这门花色最多能给你的墩数。二：你们联手从A开始、连续有几张顶张 —— A，然后K，然后Q……？如果A在敌人手里，答案是零。这门花色的赢墩，是这两个数字里较小的那个。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Let's count. Spades: you hold 5 cards, dummy 3 — the longer hand has 5. Your top cards: just the A — the K is missing (West is hiding it) — so 1 winner. Dummy's queen does NOT count… yet. Keep an eye on her. Hearts: ZERO top winners — the ace itself is missing (West again!). But don't throw the hearts away: you hold the K and Q, dummy holds the J. Three big cards in a row, just one step below the top. Those are called SECONDARY honors — winners-in-waiting. Remember them.",
          '来数一数。黑桃：你有5张，明手3张 —— 较长的手有5张。你们的顶张：只有A —— K不见了（藏在西家手里）—— 只有1个赢墩。明手的Q暂时还不算……记住她。红桃：顶张赢墩是零 —— 连A都不见了（也在西家手里！）。但先别放弃红桃：你手里有K和Q，明手有J。三张大牌连成一排，只比顶张低一级。它们叫次级大牌 —— 正在等候上岗的赢墩。记住它们。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Diamonds: dummy is the longer hand, with 4. Top cards: again just the ace — 1 winner — plus another hopeful queen, this time in YOUR hand, right next to the ace. Clubs are the funny one: your top cards are A, K, Q, J — four of them! But you hold only 2 clubs and dummy holds only 2 — after two rounds, one of you runs out, and the extra honors just fall under each other. Capped: 2 winners.",
          '方块：明手是较长的手，有4张。顶张：又只有A —— 1个赢墩 —— 还有一个有希望的Q，这次在你手里，就挨着A。梅花最好笑：你们的顶张有A、K、Q、J —— 足足四张！但你只有2张梅花，明手也只有2张 —— 打两轮之后就有一方没牌了，多出来的大牌只能互相压掉。封顶：2个赢墩。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Add them up: 1 + 0 + 1 + 2 = 4 sure winners. Your contract is 1NT — you need 7 tricks. THREE short! Don't panic — you have three rescue plans. Plan one: the queen of diamonds becomes a winner IF the enemy king sits in the right chair — hunting her is our first magic trick: the finesse. Plan two: dummy's queen of spades — same trick, different shape. Plan three: the hearts. Three secondary honors, missing only the ace: knock that ace out, and the rest grow up into winners. That is called DEVELOPING. Finesse first. West leads a small club. Take it with dummy's king — and watch what happens to your jack…",
          '加起来：1 + 0 + 1 + 2 = 4个稳赢墩。你的定约是1NT —— 需要7墩。少了3个！别慌 —— 你有三个救援计划。计划一：方块Q，只要敌人的K坐在正确的位置上，她就能变成赢墩 —— 猎她回来是我们的第一个魔法：飞牌。计划二：明手的黑桃Q —— 同一招，换个形状。计划三：红桃。三张次级大牌，只缺一个A：把A敲出来，剩下的就都长成赢墩。这叫发展次级大牌。先飞牌。西家领出一张小梅花。用明手的K拿下 —— 注意看你的J会怎么样……'

        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '5C' },
          {
            seat: 'N', learner: true, expected: 'KC',
            hint: T("Dummy's king of clubs (KC). Take the trick!", '明手的梅花K (KC)，拿下这一墩！'),
          },
          { seat: 'E', card: '2C' },
          {
            seat: 'S', learner: true, expected: 'JC',
            hint: T('Your jack of clubs (JC) — it has to fall under the king!', '你的梅花J (JC) —— 只能压在K下面了！'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Did you see that? Four top clubs, but your jack just fell under dummy's king — one trick, two honors spent. THAT is why clubs counted 2, not 4. That accident has a name: BLOCKING — when the hand that runs out first has to throw big cards under its partner's big cards. Now, the hunt. Look at your diamonds: you hold A–Q. That pair is called a tenace — two big cards with a gap exactly where the king would sit, and the king is missing. If partner leads a SMALL diamond toward it, East — who must play before your A–Q — is trapped…",

          '看见了吗？四张顶张梅花，但你的J只能压在明手的K下面 —— 一墩用掉两张大牌。这就是梅花只能算2、不能算4的原因。现在，去打猎。看你手里的方块：你拿着A–Q。这一对叫坎张 —— 两张大牌中间空着一个正好放K的位置，而K不见了。如果搭档朝它领出一张小方块，坐在中间、必须在你的A–Q之前出牌的东家，就被困住了……'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Here's the trap: if East plays the king, your ace swallows it — and the queen is a winner forever after. If East ducks and plays small, you play the queen and she wins right now. East cannot escape… as long as the king sits with East. Peek with your x-ray eyes: it does! Partner — lead that little diamond.",
          '陷阱是这样的：如果东家出K，你的A一口吞掉它 —— Q从此就是赢墩。如果东家躲开、出小牌，你就打出Q，她当场赢下这一墩。东家无处可逃……只要K在他手里。用透视眼偷看一下：真的在！搭档 —— 出那张小方块吧。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: '2D',
            hint: T("Dummy's little 2 of diamonds (2D) — the bait.", '明手的小方块2 (2D) —— 诱饵。'),
          },
          { seat: 'E', card: '6D' },
          {
            seat: 'S', learner: true, expected: 'QD',
            hint: T('The queen (QD)! Spring the trap!', 'Q (QD)！合上陷阱！'),
          },
          { seat: 'W', card: '4D' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "SNAP! East ducked, and the queen won. That is winner number 5 — two more to go. This move has a name: the FINESSE — lead toward a card you hope is a winner, and trap the enemy honor in the middle. Now the second finesse — same trick, new shape. Spades: this time the ace is in YOUR hand and the queen is in dummy's — the pair is split up. West holds the king, sitting right in front of dummy's queen. Lead a SMALL spade toward the queen: if West plays the king, your ace eats it later and the queen still scores. If West ducks… the queen wins on the spot. Try it — your little 2 of spades.",
          '咔嚓！东家躲开了，Q赢了！这是第5个赢墩 —— 还差2个。这一招有名字：飞牌—— 朝着你希望能赢的牌领过去，把敌人的大牌困在中间。现在来第二个飞牌 —— 同一招，新形状。黑桃：这次A在你手里，Q在明手 —— 这一对是分开的。K在西家手里，正好坐在明手Q的前面。朝着Q领出一张小黑桃：如果西家出K，你的A回头就吃掉它，Q照样能赢。如果西家躲开……Q当场获胜。试试 —— 你的小黑桃2。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '2S',
            hint: T('The little 2 of spades (2S) — bait, toward the queen!', '小黑桃2 (2S) —— 诱饵，朝着Q打！'),
          },
          { seat: 'W', card: '7S' },
          {
            seat: 'N', learner: true, expected: 'QS',
            hint: T("Dummy's queen (QS) — snap the trap shut!", '明手的Q (QS) —— 合上陷阱！'),
          },
          { seat: 'E', card: 'TS' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: '3S',
            hint: T("Dummy's little 3 of spades (3S) — come back to your ace.", '明手的小黑桃3 (3S) —— 回到你的A这边来。'),
          },
          { seat: 'E', card: 'JS' },
          {
            seat: 'S', learner: true, expected: 'AS',
            hint: T('Ace of spades (AS) — the counted winner. Cash it!', '黑桃A (AS) —— 数过的赢墩，兑现！'),
          },
          { seat: 'W', card: '9S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "SNAP again! West ducked, and dummy's queen won — winner number 6, and your ace just cashed itself for the counted one. Two finesses, two queens home. One more winner needed. Time for rescue plan three — the one that is not a guess at all.",
          '又咔嚓一声！西家躲开了，明手的Q赢了 —— 第6个赢墩，你的A也顺手把数过的那个兑现了。两次飞牌，两个Q都到手。还差最后一个赢墩。该执行救援计划三了 —— 这一招，根本不用猜。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Now the hearts — the development project. Count them the new way: secondary honors K, Q, J = 3 cards in a row. Missing top honors: only the ace = 1. What you can develop: 3 − 1 = 2 winners. The recipe: play a big one and KNOCK THE ACE OUT. You will lose that trick on purpose — losing the lead once is the price, and it has a name: a duck. One warning before you pay: while the enemy holds the lead, THEY attack your weak suits. So first count your STOPPERS — cards that can win a round in the suits they love. Today you are rich: every other suit has an ace or king of yours standing guard. Duck exactly once, safely. Play your king of hearts and knock the ace out!",
          '现在轮到红桃 —— 发展工程。用新方法数一遍：次级大牌K、Q、J = 连着的3张。缺的顶张：只有A = 1个。能发展出：3 − 1 = 2个赢墩。做法：打出一张大牌，把A敲出来。这一墩你要有意输掉 —— 主动交出一次出牌权就是代价，它有个名字叫脱手。但交之前先警告一句：敌人拿到出牌权，就会进攻你弱的花色。所以先数你的挡张 —— 在敌人喜欢的花色里能顶住一轮的大牌。今天你很富有：其他每门花色都有你的A或K站岗。安安心心脱手一次。打出你的红桃K，把A敲出来！'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KH',
            hint: T('King of hearts (KH) — knock the ace out!', '红桃K (KH) —— 把A敲出来！'),
          },
          { seat: 'W', card: 'AH' },
          { seat: 'N', card: '7H' },
          { seat: 'E', card: '5H' },
          { seat: 'W', card: '3H' },
          { seat: 'N', card: '8H' },
          { seat: 'E', card: '6H' },
          {
            seat: 'S', learner: true, expected: 'QH',
            hint: T('The queen (QH) — she grew up! The ace is gone, so she wins now.', 'Q (QH) —— 她长大了！A已经没了，她现在能赢。'),
          },
          {
            seat: 'S', learner: true, expected: '2H',
            hint: T('Your little 2 of hearts (2H) — lead small toward dummy.', '你的小红桃2 (2H) —— 朝明手出小牌。'),
          },
          { seat: 'W', card: '4H' },
          {
            seat: 'N', learner: true, expected: 'JH',
            hint: T("Dummy's jack (JH) — the second developed winner!", '明手的J (JH) —— 第二个发展出的赢墩！'),
          },
          { seat: 'E', card: 'TH' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Both hearts came home! Final count: 4 counted winners + 2 finessed queens + 2 developed hearts = 8, for a contract that needed 7. And notice the difference between your rescue plans: the finesses were GUESSES — in a real game the kings hide, and each queen wins only about half the time, 50%. Developing was a PROMISE: the ace was the only card above your row, so once it was knocked out, the queen and jack could not fail. This one has a name too: DEVELOPING SECONDARY HONORS. When you count a suit, always ask both questions: is there a queen to finesse — and is there a row of secondary honors to develop?",
          '两张红桃都到手了！最后清点：4个数出来的赢墩 + 2个飞回来的Q + 2个发展出来的红桃 = 8个，定约只需要7个。注意救援计划之间的区别：飞牌是猜测 —— 真正的牌局里K是藏着的，每个Q大约只有一半的机会赢，50%。而发展是承诺：你的连张上面只有A一张牌，A一被敲掉，Q和J就不可能失败。这一招也有名字：发展次级大牌。以后数每一门花色，两个问题都要问：有没有Q可以飞 —— 有没有一排次级大牌可以发展？'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Numbers worth remembering: with 5 cards missing out there, they usually split 3 and 2 (about 68 times in 100). With 4 missing, a 2-2 split happens about 41 times in 100. And the old proverb: '8 cards? Finesse! 9 or more? Play ace-king and let the queen drop.'",
          "几个数字值得记住：外面少5张牌时，通常分成3张和2张（100次里约68次）。少4张时，分成2张和2张大约41次。还有句老话：'8张牌就用飞牌，9张以上打A和K，等Q自己掉下来。'"
        ),
      },
      {
        kind: 'info',
        text: T(
          "So here is the pro's routine: (1) Count top winners TOGETHER with dummy, suit by suit — the longer hand's length caps the suit, and top cards in a row from the ace are what you can bank. (2) If you are short, go hunting two ways: finesse a hopeful queen, or DEVELOP a row of secondary honors — count the row, subtract the missing top cards, and pay exactly that many ducks. Next lesson: the long-suit gold mine — how your smallest cards can grow into winners.",
          '所以高手的流程是：(1) 和明手一起，一门一门数顶张赢墩 —— 较长手的张数是这门花色的上限，从A开始连续的顶张才是能存进银行的赢墩。(2) 如果不够，两个方向打猎：对有希望的Q用飞牌，或者发展一排次级大牌 —— 数清连张、减去缺的顶张，照单脱手就是了。下一课：长套金矿 —— 最小的牌也能长成赢墩。'
        ),
      },
    ],
  },
  {
    id: 'long-suits',
    title: T('Establish the Long Suit', '无将树立长套'),
    dealer: 'N',
    hands: LONGSUIT_DEAL,
    contract: { level: 3, denom: 'NT', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Back to notrump! Last time you counted top winners, hunted a queen with a finesse, and developed secondary honors by knocking out an ace. Today, another way to find winners: GROW them. Your contract is 3NT — 9 tricks, please.',
          '回到无将！上次你数了顶张赢墩、用飞牌猎了Q。今天教你第三种找赢墩的方法：把它们"种"出来。你的定约是3NT —— 需要9墩。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Look at the diamonds — this is a gold mine. Between your hand and dummy's you hold NINE of them: A K 9 8 7 6 with you, 5 4 3 with dummy. The defenders hold only 4 (13 − 9 = 4). Now the secret: once those 4 enemy cards have been played, every diamond left in your hands is a winner — even the tiny 7. Small cards, big dreams.",
          '看方块 —— 这是一座金矿。你和明手联手拿着九张：你有A K 9 8 7 6，明手有5 4 3。防守方只有4张（13 − 9 = 4）。秘密在于：等这4张敌牌全部打完，你手里剩下的每一张方块都是赢墩 —— 连最小的7都是。小牌，大梦想。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Count first, like a pro. Top winners: spades 3 (the A-K-Q, shared between your two hands), hearts 0 (the ace is theirs), clubs 1 (your ace), diamonds only 2 — the A and K, because the enemy queen is not a top card. Total: 6. Three SHORT of 9! So the diamonds must grow: cash the A and K, lose ONE trick to their queen on purpose, and the 9, 8, 7 become winners — 5 diamond tricks instead of 2. 6 + 3 = 9. That is the plan. West leads the ace of hearts — their suit, not ours. Let it go.',
          '像高手一样先数。顶张赢墩：黑桃3（A、K、Q，在你们两手之间）、红桃0（A是对方的）、梅花1（你的A）、方块只有2 —— A和K，因为对方的Q不算顶张。总共6个。离9还差3个！所以方块必须长大：兑现A和K，再故意输一墩给对方的Q，9、8、7就都成了赢墩 —— 方块从2墩变成5墩。6 + 3 = 9。这就是计划。西家领出红桃A —— 那是他们的花色，不是我们的。让给他。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: 'AH' },
          { seat: 'N', card: '4H' },
          { seat: 'E', card: '2H' },
          { seat: 'S', card: '6H' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: 'KH' },
          { seat: 'N', card: '5H' },
          { seat: 'E', card: '3H' },
          { seat: 'S', card: '7H' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: 'QH' },
          { seat: 'N', card: '8H' },
          { seat: 'E', card: '9H' },
          { seat: 'S', card: '8C' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Three hearts for the defenders — that was their suit, fair enough. Now West tries a diamond… right into our gold mine! Take it with your ace — and count their diamonds as they fall: West's 2 and East's 10 just died. Two of their four, gone already.",
          '三墩红桃归了防守方 —— 那本来就是他们的花色，没关系。现在西家试着领出一张方块……正好走进我们的金矿！用你的A拿下 —— 同时数着他们的方块往下掉：西家的2和东家的10刚刚阵亡。他们四张里已经没了两张。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '2D' },
          { seat: 'N', card: '3D' },
          { seat: 'E', card: 'TD' },
          {
            seat: 'S', learner: true, expected: 'AD',
            hint: T('Your ace of diamonds (AD). Take it — and watch their cards fall!', '你的方块A (AD)。拿下 —— 看着他们的牌往下掉！'),
          },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KD',
            hint: T('King of diamonds (KD) — cash the second top winner.', '方块K (KD) —— 兑现第二个顶张赢墩。'),
          },
          { seat: 'W', card: 'JD' },
          { seat: 'N', card: '4D' },
          { seat: 'E', card: '2C' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Count again: West's jack just fell — THREE of their four diamonds are gone. One is left: the queen, still sitting with West. Your A and K are spent, so right now the queen is the boss of this suit. You cannot avoid losing to her… so don't try! Feed her a trick ON PURPOSE: lead your little 6. She wins — and she was their LAST diamond. This is called ducking: losing a trick you would lose anyway, early and cheap, to set up the whole suit. Go on — the little 6.",
          '再数一遍：西家的J刚刚掉下来 —— 他们四张方块已经没了三张。只剩一张：Q，还在西家手里。你的A和K都已经打完，所以现在这门花色里Q最大。你躲不开要输她这一墩的……那就不要躲！故意喂她一墩：领出你的小6。她赢了 —— 而她是他们最后一张方块。这就叫让一墩：反正要输的一墩，早早便宜地输掉，换来整门花色树立起来。来吧 —— 小6。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '6D',
            hint: T('The little 6 of diamonds (6D) — feed the queen her trick.', '小方块6 (6D) —— 把这一墩喂给Q。'),
          },
          { seat: 'W', card: 'QD' },
          { seat: 'N', card: '5D' },
          { seat: 'E', card: '4C' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "The queen is gone — the defenders have NO diamonds left. Your 9, 8 and 7 are all winners now! But they sit in YOUR hand, and West is leading a club. To reach your gold, you must win this trick in your own hand — your ace of clubs is the bridge back (that's called an entry). Take it!",
          'Q没了 —— 防守方一张方块都不剩了。你的9、8、7现在全是赢墩！但它们在你手里，而西家领出了一张梅花。要够到你的金子，你必须在自己手里赢下这一墩 —— 你的梅花A就是回金矿的桥（这叫进手）。拿下！'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '9C' },
          { seat: 'N', card: '5C' },
          { seat: 'E', card: '3C' },
          {
            seat: 'S', learner: true, expected: 'AC',
            hint: T('Ace of clubs (AC) — the bridge back to your diamonds!', '梅花A (AC) —— 回到方块金矿的桥！'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Home! Now the harvest. Lead the 9 of diamonds and watch the defenders squirm — nobody can follow suit any more; they can only throw cards away while your little diamonds march home.',
          '到家了！现在收获。领出方块9，看防守方干瞪眼 —— 没人有方块可跟了，他们只能眼睁睁垫牌，你的小方块排着队回家。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '9D',
            hint: T('The 9 of diamonds (9D) — a grown winner!', '方块9 (9D) —— 种出来的赢墩！'),
          },
          { seat: 'W', card: '8S' },
          { seat: 'N', card: '6C' },
          { seat: 'E', card: '6S' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: '8D' },
          { seat: 'W', card: 'JS' },
          { seat: 'N', card: '2S' },
          { seat: 'E', card: '7S' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: '7D' },
          { seat: 'W', card: 'JC' },
          { seat: 'N', card: '7C' },
          { seat: 'E', card: 'TS' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Harvest complete: FIVE tricks from one suit — A, K, 9, 8, 7 — where the top count only promised 2. Two spade winners are still in the bank from our count. Cash your ace, then let dummy's queen and king bring the last tricks home.",
          '收获完成：一门花色拿下五墩 —— A、K、9、8、7 —— 而顶张计数当初只承诺了2墩。数过的黑桃赢墩还剩两个在银行里。兑现你的A，然后让明手的Q和K把最后两墩带回家。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AS',
            hint: T('Ace of spades (AS) — a counted winner, cash it.', '黑桃A (AS) —— 数过的赢墩，兑现。'),
          },
          { seat: 'W', card: '9S' },
          { seat: 'N', card: '3S' },
          { seat: 'E', card: 'TC' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: '5S' },
          { seat: 'W', card: 'KC' },
          {
            seat: 'N', learner: true, expected: 'QS',
            hint: T("Dummy's queen of spades (QS) — it wins this one!", '明手的黑桃Q (QS) —— 这一墩归她！'),
          },
          { seat: 'E', card: 'TH' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', card: 'KS' },
          { seat: 'E', card: 'JH' },
          { seat: 'S', card: '4S' },
          { seat: 'W', card: 'QC' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "3NT — exactly 9 tricks! Final harvest: spades 3, clubs 1, diamonds 5. The whole technique has a name: ESTABLISHING A LONG SUIT. Remember its rules: (1) Hunt suits where you and dummy hold 7 or more cards together — the more, the richer. (2) Count the defenders' cards in the suit (13 minus yours) and watch them fall. (3) When theirs are gone, your small cards are winners. (4) If one enemy honor still guards the suit, duck — lose that trick on purpose, early and cheap. Next lesson: a whole new superpower — trumps!",
          '3NT —— 正好9墩！清点收获：黑桃3、梅花1、方块5。这一整套打法有个名字：树立长套。记住它的规则：(1) 找你和明手联手7张以上的花色 —— 越多越肥。(2) 数防守方这门有几张（13减你们的），盯着它们一张张掉。(3) 他们的掉光了，你的小牌就是赢墩。(4) 如果还有一张敌方大牌守着，就让一墩 —— 反正要输的墩，早输、便宜地输。下一课：一个全新的超能力 —— 将牌！'
        ),
      },
      { kind: 'result' },
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
          "New superpower: trump. In some hands, one suit is the super suit. Here it's spades. ANY trump — even the tiny 2 — beats ANY card of another suit. Even an ace!",
          '新超能力：将牌。有些牌局里，一个花色是超级花色。这里是黑桃。任何一张将牌 —— 哪怕最小的2 —— 都能打败其他花色的任何牌。连A都不行！'
        ),
      },
      {
        kind: 'info',
        text: T(
          'How do you use it? If you have NONE of the suit led, you may throw a trump instead. That is called ruffing. Diamonds are led… and look — you have zero diamonds. Your moment!',
          '用法是这样的：如果你没有别人领出的花色，你可以改出将牌。这叫"将吃"。现在领出的是方块……而你一张方块都没有。你的机会来了！'
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
            hint: T('No diamonds? Ruff it — the 2 of spades (2S)!', '没有方块？将吃 —— 黑桃2 (2S)！'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Ha! Your baby 2 of spades just beat a 9! That's trump power. Size doesn't matter — suit does. And the move itself has a name: RUFFING — winning a trick with a trump when you have none of the suit led.",
          '哈！你小小的黑桃2刚刚打败了9！这就是将牌的威力。不看大小，看花色。而这一招本身有名字：将吃—— 当你没有领出的花色时，用将牌赢下这一墩。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "You won, so you lead. When you lead trump itself, it's normal rules again: biggest trump wins. Lead a spade and watch.",
          '你赢了，所以你领出。如果领出的就是将牌，那就回到普通规则：最大的将牌赢。领出一张黑桃看看。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '7S',
            hint: T('Lead the 7 of spades (7S).', '领出黑桃7 (7S)。'),
          },
          { seat: 'W', card: '9S' },
          { seat: 'N', card: 'AS' },
          { seat: 'E', card: '3S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "North's ace grabbed it — biggest trump wins, as promised. You've got trump power now. Next: how to PLAN a trump contract — by counting losers.",
          '北家的A抓住了它 —— 说到做到，最大的将牌赢。将牌你已经会了。下一课：怎么给有将定约做计划 —— 数输墩。'
        ),
      },
    ],
  },
  {
    id: 'losers',
    title: T('Count Your Losers', '有将数输墩'),
    dealer: 'N',
    hands: LOSERS_DEAL,
    contract: { level: 4, denom: 'S', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'New rule for trump contracts! In no-trump you counted WINNERS. With a trump suit, flip the scorebook: count your LOSERS — the tricks you expect to lose.',
          '有将定约，新规矩！无将时我们数赢墩。有了将牌，把记分本翻过来：数输墩 —— 你预计会输掉的墩。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "And look at today's trumps — as good as it gets: an 8-card fit (5 in your hand, 3 in dummy's) with the ace, king and queen on top. Solid trumps are the foundation everything else stands on. Count from the hand with the LONG trumps — that's you. Go suit by suit. Rule: look at your top 3 cards in the suit; every one that is NOT the ace, king or queen is a loser. Then peek at dummy: each ace, king or queen there knocks out one of your losers.",
          '先看看今天的将牌 —— 顶配：8张配合（你5张、明手3张），顶上还有A、K、Q坐镇。坚固的将牌是别的计划的地基。从将牌长的那只手数起 —— 就是你。逐门数。规则：看你这门最大的三张牌，不是A、K、Q的，每一张都是输墩。再偷看一眼明手：明手里的A、K、Q，每一张能抵掉你的一个输墩。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Spades, your trumps: your top three are the A, K and Q — all honors. ♠ = 0 losers. Zero! That is what top honors are worth.',
          '黑桃，你的将牌：你最大的三张是A、K、Q —— 全是大牌。♠ = 0个输墩。零！这就是顶张大牌的价值。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Hearts: your A-8-5. The 8 and 5 are losers… but dummy's king knocks one out. ♥ = 1 loser. Diamonds: your 9-6-3 are all losers; dummy's ace AND king knock out two. ♦ = 1 loser. Clubs: you hold just ONE — the little 6 — and dummy has no club honor to save it. ♣ = 1 loser.",
          '红桃：你的A、8、5。8和5是输墩……但明手的K抵掉一个。♥ = 1个。方块：你的9、6、3全是输墩，明手的A和K抵掉两个。♦ = 1个。梅花：你只有一张 —— 小6 —— 明手也没有梅花大牌能救它。♣ = 1个。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Total: 0 + 1 + 1 + 1 = 3 losers. Your contract is 4♠ — you need 10 tricks, so you can afford to lose exactly 3. Right on budget — no vanishing tricks needed today. The plan writes itself: draw their trumps FIRST (all five of theirs are little ones), and after that no winner of yours can ever be ruffed. Then cash your honors and pay only the three losers on the list. West leads the queen of hearts — take it with your ace.',
          '总账：0 + 1 + 1 + 1 = 3个输墩。你的定约是4♠ —— 需要赢10墩，正好能输3墩。刚刚好在预算内 —— 今天不需要消失魔术。计划自己就写好了：先清掉对方的将牌（他们的5张全是小将），清完之后，你的任何赢墩都不可能被将吃。然后兑现大牌，只付清单上的三个输墩。西家首攻红桃Q —— 用你的A拿下。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: 'QH' },
          { seat: 'N', card: '4H' },
          { seat: 'E', card: '3H' },
          {
            seat: 'S', learner: true, expected: 'AH',
            hint: T('Your ace of hearts (AH) — take the queen!', '你的红桃A (AH) —— 拿下Q！'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Now draw their trumps: ace, king, queen — watch all five little enemy trumps fall out.',
          '现在清将：A、K、Q —— 看对方五张小将牌全部掉出来。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AS',
            hint: T('Ace of spades (AS) — draw their trumps!', '黑桃A (AS) —— 清他们的将牌！'),
          },
          { seat: 'W', card: '3S' },
          { seat: 'N', card: '5S' },
          { seat: 'E', card: '2S' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KS',
            hint: T('King of spades (KS) — keep drawing!', '黑桃K (KS) —— 继续清！'),
          },
          { seat: 'W', card: '8S' },
          { seat: 'N', card: '9S' },
          { seat: 'E', card: '6S' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'QS',
            hint: T('Queen of spades (QS) — the last round of trumps.', '黑桃Q (QS) —— 最后一轮将牌。'),
          },
          { seat: 'W', card: 'TS' },
          { seat: 'N', card: 'JS' },
          { seat: 'E', card: 'TH' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "All their trumps are gone — and notice: NOT ONE trick lost while drawing. That whole routine has a name: DRAWING TRUMPS. That is the power of top honors. Now the hearts: lead a little one toward dummy's king — the honor that cancelled one of your heart losers. It cashes as a winner.",
          '他们的将牌全清完了 —— 注意：清将全程一墩没输。这一整套动作有名字：清将。这就是顶张大牌的威力。现在打红桃：领出一张小的，朝明手的K打 —— 就是那张抵掉你一个红桃输墩的大牌。它现在兑现成赢墩。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: '2H' },
          { seat: 'W', card: '9H' },
          {
            seat: 'N', learner: true, expected: 'KH',
            hint: T("Dummy's king of hearts (KH) — the cover honor cashes!", '明手的红桃K (KH) —— 抵账的大牌兑现了！'),
          },
          { seat: 'E', card: '6H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Diamonds next: dummy's ace and king cancelled TWO of your three diamond losers. Cash them both — then the third round pays the one diamond loser left on the list.",
          '接下来打方块：明手的A和K抵掉了你三个方块输墩中的两个。两个都兑现 —— 然后第三轮，付掉清单上剩下的那个方块输墩。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: 'AD',
            hint: T("Dummy's ace of diamonds (AD).", '明手的方块A (AD)。'),
          },
          { seat: 'E', card: '2D' },
          { seat: 'S', card: '3D' },
          { seat: 'W', card: '5D' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', card: 'KD' },
          { seat: 'E', card: '8D' },
          { seat: 'S', card: '6D' },
          { seat: 'W', card: 'JD' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', card: '7D' },
          { seat: 'E', card: 'TD' },
          { seat: 'S', card: '9D' },
          { seat: 'W', card: 'QD' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "West's queen takes the diamond — loser #1, exactly the one we counted. West cashes the ace of clubs next: your singleton 6 falls under it. Loser #2 — also on the list.",
          '西家的Q拿下方块 —— 输墩1号，分毫不差，就是我们数到的那个。西家再兑现梅花A：你的单张6压在它下面。输墩2号 —— 也在清单上。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: 'AC' },
          { seat: 'N', card: '5C' },
          { seat: 'E', card: '3C' },
          { seat: 'S', card: '6C' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: 'KC' },
          { seat: 'N', card: '7C' },
          { seat: 'E', card: 'TC' },
          {
            seat: 'S', learner: true, expected: '4S',
            hint: T('Ruff with the little 4 of spades (4S) — you are out of clubs!', '用小将牌4 (4S) 将吃 —— 你的梅花已经没了！'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "West tried a second club, but you are void — your little trump takes it and you are back in charge. One counted loser remains: the heart. Lead one and let it go — it is the LAST trick the defense will ever get.",
          '西家想再打一轮梅花，但你已经空门 —— 小将牌一把拿下，你重新掌控局面。清单上还剩最后一个输墩：红桃。领出一张红桃，放它走 —— 这是防守方能拿到的最后一墩了。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '5H',
            hint: T('Lead the heart 5 (5H) — pay the last counted loser.', '领出红桃5 (5H) —— 付掉最后一个数到的输墩。'),
          },
          { seat: 'W', card: 'JH' },
          { seat: 'N', card: '8C' },
          { seat: 'E', card: '7H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "West's jack wins it — loser #3, and the budget is complete. Everything left in your hand is a winner now: ruff their club lead, then your last heart is the biggest one remaining.",
          '西家的J赢了 —— 输墩3号，预算正好付完。你手里剩下的全是赢墩了：将吃他们领出的梅花，然后你最后一张红桃是全场最大的。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '2C' },
          { seat: 'N', card: '9C' },
          { seat: 'E', card: 'QC' },
          {
            seat: 'S', learner: true, expected: '7S',
            hint: T('Ruff with the 7 of spades (7S).', '用黑桃7 (7S) 将吃。'),
          },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '8H',
            hint: T('Your 8 of hearts (8H) — nobody has a bigger heart left.', '你的红桃8 (8H) —— 没人剩下更大的红桃了。'),
          },
          { seat: 'W', card: '4C' },
          { seat: 'N', card: '4D' },
          { seat: 'E', card: 'JC' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Final count: exactly 3 losers — one heart, one diamond, one club — every one of them counted before a single card was played. 4♠ made, right on budget! The trump routine: COUNT your losers, check the budget, draw trumps, pay only what is on the list. But what if the count comes out OVER budget — one loser too many, or two? Paying them all would sink the contract… Next lesson: make the extras VANISH.',
          '最终清点：正好3个输墩 —— 红桃1、方块1、梅花1 —— 每一个都在出第一张牌之前就数到了。4♠达成，分毫不差！有将牌流程：数输墩、对预算、先清将、只付清单上的。但如果数出来超了预算呢 —— 多一个输墩、甚至两个？全付掉定约就沉了……下一课：让多余的输墩消失。'
        ),
      },
      { kind: 'result' },
    ],
  },
  {
    id: 'eliminate',
    title: T('Make Losers Vanish', '输墩消去'),
    dealer: 'N',
    hands: ELIM_DEAL,
    contract: { level: 4, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
                    'Last lesson your count came out exactly on budget — every loser paid, none to spare. Today it does NOT: this 4♥ counts five losers with room for three. Time for a full disappearing act — count first, like always.',
                    '上一课你的输墩数正好在预算内 —— 该付的全付了，一个不多。今天可不是这样：这副 4♥ 数出来 5 个输墩，却只能输 3 个。来一整套消失魔术吧 —— 老规矩，先数输墩。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Count from your hand — your 7 hearts are the long trumps. Spades: your 7-5-2 are 3 losers; dummy's ace covers one → 2. Diamonds: your 8-6-4 are 3 losers; dummy has no diamond honor → still 3. Clubs: you have NONE — a void suit can't lose a trick → 0. Hearts: A-K-Q on top → 0. Total: 5 losers. But 4♥ can only afford 3!",
          '从你的手数起 —— 你的 7 张红桃是长将牌。黑桃：你的 7、5、2 是 3 个输墩，明手的 A 抵掉 1 个 → 2 个。方块：你的 8、6、4 是 3 个输墩，明手没有方块大牌 → 还是 3 个。梅花：你一张都没有 —— 空门输不了墩 → 0 个。红桃：A、K、Q 打头 → 0 个。总共 5 个输墩，可 4♥ 只能输 3 个！'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Two losers must vanish. Vanishing trick #1 hides in the clubs: dummy holds K-Q-J — three honors in a row, like a staircase — and you are VOID in clubs. The only card that can beat the staircase is the ace, and East is hiding it. Remember the finesse from Lesson 3? Meet its big cousin — the RUFFING FINESSE. First, West leads the queen of spades — dummy's ace, please!",
          '两个输墩必须消失。第一招藏在梅花里：明手有 K、Q、J —— 三张连张大牌，像一段楼梯，而你在梅花是空门。唯一能压住这段楼梯的只有 A，而 A 躲在东家手里。还记得第 3 课的飞牌吗？认识一下它的表哥 —— 将吃飞牌。先看首攻：西家领出黑桃Q —— 请明手出 A！'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: 'QS' },
          {
            seat: 'N', learner: true, expected: 'AS',
            hint: T('Ace of spades (AS) — take it!', '黑桃A (AS) —— 拿下！'),
          },
          { seat: 'E', card: '4S' },
          { seat: 'S', card: '2S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Now lead dummy's queen of clubs — the first step of the staircase. If East plays the ace, you RUFF it on the spot, and dummy's K and J become winners. If East ducks… you throw a loser away, the queen wins, and you climb the next step and ask again. The ace can hide, but it can't hide forever!",
          '现在领出明手的梅花Q —— 楼梯的第一级。如果东家打出 A，你当场将吃，明手的 K 和 J 就都变成赢墩。如果东家躲开……你就垫掉一张输墩，Q 照样赢，然后爬上第二级再问一次。A 能躲一时，躲不了一世！'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: 'QC',
            hint: T('Queen of clubs (QC) — first step of the staircase!', '梅花Q (QC) —— 楼梯的第一级！'),
          },
          { seat: 'E', card: '5C' },
          {
            seat: 'S', learner: true, expected: '7S',
            hint: T('East ducked! Throw a spade loser (7S)!', '东家躲了！垫掉一张黑桃输墩 (7S)！'),
          },
          { seat: 'W', card: '2C' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'East ducked — the queen won AND a spade loser rode away on it. That ride has a name: DISCARDING A LOSER — parking a loser on a spare winner. Climb to the second step: the JACK. Same question: if the ace appears, ruff it; if East hides again, throw your other spade.',
          '东家躲开了 —— Q 赢了，一个黑桃输墩还顺路被带走了。这一手有名字：垫掉输墩—— 把输墩停在多余的赢墩上。爬上第二级：J。同样的问题：A 出现就将吃；东家再躲，就把另一张黑桃垫掉。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: 'JC',
            hint: T('Jack of clubs (JC) — ask again!', '梅花J (JC) —— 再问一次！'),
          },
          { seat: 'E', card: '8C' },
          {
            seat: 'S', learner: true, expected: '5S',
            hint: T('Ducked again! Throw the 5 of spades (5S)!', '又躲了！垫掉黑桃5 (5S)！'),
          },
          { seat: 'W', card: '4C' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Twice hidden! One step remains — the KING. The ace is running out of places to hide. If it finally shows its face this time… you know exactly what to do.",
          '躲了两次！只剩最后一级 —— K。A 快没地方躲了。如果它这次终于露面……你非常清楚该怎么做。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: 'KC',
            hint: T('King of clubs (KC) — the last step!', '梅花K (KC) —— 最后一级！'),
          },
          { seat: 'E', card: 'AC' },
          {
            seat: 'S', learner: true, expected: '2H',
            hint: T("THERE'S the ace — RUFF IT with the 2 of hearts (2H)!", 'A 出现了 —— 用红桃2将吃它 (2H)！'),
          },
          { seat: 'W', card: 'TC' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'You ATE the ace! That is the ruffing finesse in full: while East hid, two losers rode away; when the ace finally showed, your little trump ate it. Both small spades are gone — spades can only cost you one trick now. Vanishing trick #2: the RUFF. Dummy holds only TWO diamonds. Play the suit twice and dummy is empty — then dummy can ruff the third diamond round. But careful: dummy needs a little heart for that ruff, so do NOT draw trumps yet! The ruff just gave YOU the lead — start feeding diamonds.',
          '你把 A 吃掉了！这就是完整的将吃飞牌：东家躲藏的时候，两个输墩顺路溜走；A 终于露面时，被你的小将牌一口吃掉。两张小黑桃都没了 —— 黑桃现在最多让你输 1 墩。第二招：将吃。明手只有两张方块。这门打两轮，明手就空了 —— 然后明手就能将吃第三轮方块。但注意：明手需要一张小红桃来将吃，所以现在还不能清将！刚才的将吃让你拿到了出牌权 —— 开始喂方块。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '4D',
            hint: T('Lead your little 4 of diamonds (4D) — feed the suit.', '领出你的小方块4 (4D) —— 喂这门牌。'),
          },
          { seat: 'W', card: 'QD' },
          { seat: 'N', card: '9D' },
          { seat: 'E', card: '3D' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: 'TD' },
          { seat: 'N', card: '2D' },
          { seat: 'E', card: 'AD' },
          {
            seat: 'S', learner: true, expected: '6D',
            hint: T('Your 6 of diamonds (6D) — dummy is now EMPTY of diamonds.', '你的方块6 (6D) —— 明手现在没有方块了。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Two diamond losers paid. East switches to spades and West's king takes the trick — that is the one spade loser left in the budget. And now West leads his last diamond, while dummy has NONE…",
          '两个方块输墩付掉了。东家转攻黑桃，西家的 K 赢下这一墩 —— 这是预算里剩下的那一个黑桃输墩。现在西家领出他最后一张方块，而明手一张方块都没有……'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'E', card: 'JS' },
          { seat: 'S', card: '8D' },
          { seat: 'W', card: 'KS' },
          { seat: 'N', card: '8S' },
          { seat: 'W', card: '7D' },
          {
            seat: 'N', learner: true, expected: '4H',
            hint: T("RUFF with dummy's 4 of hearts (4H)!", '用明手的红桃4将吃 (4H)！'),
          },
          { seat: 'E', card: '5D' },
          { seat: 'S', card: '3H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "RUFFED! The third diamond loser — gone, eaten by dummy's baby trump. That move has a name too: a RUFF IN THE SHORT HAND — dummy's trumps are few, so each one is precious and should only eat losers. Both vanishing tricks are complete. NOW you may draw trumps — dummy's work is done. First, ruff your way back to your own hand.",
          '将吃成功！第三个方块输墩没了 —— 被明手的小将牌吃掉。这一招也有名字：短手将吃—— 明手的将牌少，每一张都金贵，只用来吃输墩。两招都完成了。现在可以清将了 —— 明手的活儿干完了。先将吃一张，回到自己手里。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', card: '6S' },
          { seat: 'E', card: 'TS' },
          {
            seat: 'S', learner: true, expected: '6H',
            hint: T('Ruff the spade (6H) and take the lead — time to draw trumps.', '将吃这张黑桃 (6H)，拿到出牌权 —— 该清将牌了。'),
          },
          { seat: 'W', card: '9S' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AH',
            hint: T('Ace of hearts (AH) — draw their trumps!', '红桃A (AH) —— 清掉他们的将牌！'),
          },
          { seat: 'W', card: 'JH' },
          { seat: 'N', card: '8H' },
          { seat: 'E', card: '7H' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KH',
            hint: T('King of hearts (KH) — one more round.', '红桃K (KH) —— 再清一轮。'),
          },
          { seat: 'W', card: '9C' },
          { seat: 'N', card: '5H' },
          { seat: 'E', card: 'TH' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: 'QH' },
          { seat: 'W', card: '7C' },
          { seat: 'N', card: '6C' },
          { seat: 'E', card: '3C' },
          {
            seat: 'S', learner: true, expected: '9H',
            hint: T('Your last trump (9H) — bring it home.', '你的最后一张将牌 (9H) —— 带它回家。'),
          },
          { seat: 'W', card: 'KD' },
          { seat: 'N', card: '3S' },
          { seat: 'E', card: 'JD' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Final count: you lost exactly 3 tricks — two diamonds, one spade. 5 losers counted, 2 vanished, 4♥ made! Your vanishing toolkit: RUFF in the short hand, THROW losers on spare winners, and the RUFFING FINESSE — march the K-Q-J staircase at the hidden ace when you're void. Count first — then pick your trick!",
          '最终清点：你正好输了 3 墩 —— 方块 2、黑桃 1。数到 5 个输墩，消掉 2 个，4♥ 达成！你的消去工具箱：在短将牌一侧将吃、在多余赢墩上垫输墩、还有将吃飞牌 —— 空门时，用 K、Q、J 楼梯一步步逼出藏着的 A。先数 —— 再选招！'
        ),
      },
      { kind: 'result' },
    ],
  },
  {
    id: 'defense-leads',
    title: T('Defense I: The Opening Lead', '防守一：首攻'),
    dealer: 'N',
    hands: DEFENSE_LEAD_DEAL,
    contract: { level: 3, denom: 'NT', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          "Time to switch chairs! Today you are NOT the declarer. South plays 3NT, and you sit WEST — a defender. Your partner is East, across the table. You win by LOSING the count declarers love: South needs 9 tricks out of 13. If your side takes 5 first, the contract FAILS. Defense is teamwork: you and East can see each other's cards here (x-ray eyes again), but at a real table your only messages are the cards you play. Every card talks.",
          '换个位置坐！今天你不是庄家。南家打 3NT，你坐西家 —— 是防守方。你的搭档是桌子对面的东家。你的赢法，是破坏庄家最爱的那本数：南家需要 13 墩里的 9 墩。你们先拿到 5 墩，定约就被击宕了。防守是团队作战：这里你能看见东家的牌（又是透视眼），但真正的牌桌上，你们唯一的通讯工具就是打出的牌。每张牌都在说话。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "And the loudest card of all is the first one: the OPENING LEAD — yours to choose, before dummy appears. One honest warning: which card to lead from a holding is not a law of nature, it is an AGREEMENT between partners. Different pairs agree different systems! What follows is one popular MODERN set — agree it with your partner, and the two of you will understand each other perfectly. First, pick the SUIT: attack your longest and strongest suit — the one the enemy has not claimed. Leading declarer's diamonds would feed his longest suit; leading dummy's spades would run into the ace. Your hearts, K-T-8-4, are longest, strongest, and unclaimed. Hearts it is.",
          '而全场声音最大的一张牌，就是第一张：首攻 —— 由你来选，在明手摊牌之前。先说句实话：从一手牌里该领出哪一张，不是自然规律，而是搭档之间的约定。不同的搭档，约定可以完全不同！下面要教的，是现在流行的一套现代约定 —— 和你的搭档约好同一套，你们就能心领神会。第一步，选花色：进攻你最长、最强的花色 —— 敌人没有宣布占领的那门。领庄家的方块，等于喂他的长套；领明手的黑桃，会撞上 A。你的红桃K-T-8-4，最长、最强、没人认领。就打红桃。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Now WHICH heart? The modern agreement for a suit with an honor but no touching pair: lead FOURTH BEST — count down from the top: K is 1st, T is 2nd, 8 is 3rd, the 4 is 4th. Lead the 4. Why this strange card? It is a coded message. Partner counts: 11 − 4 = 7 cards higher than the 4 are still out there; he can see his own and soon dummy's, and work out declarer's hearts. And the 4 promises an honor at the top — partner knows your suit is real. Lead your 4 of hearts!",
          '那么领哪一张红桃？现代约定里，一门有大牌、但大牌不相连的花色：领长四 —— 从大到小往下数：K 是第 1 张，T 第 2，8 第 3，4 是第 4 张。领 4。为什么偏偏是这张奇怪的小牌？因为它是密码。搭档会算：11 − 4 = 7，还有 7 张比 4 大的红桃在外面；他看看自己的牌、再看看马上摊开的明手，就能推算庄家有几张红桃。而且这张 4 承诺上面有大牌 —— 搭档知道你的花色是真材实料。领出你的红桃 4！'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'W', learner: true, expected: '4H',
            hint: T('The 4 of hearts (4H) — fourth best!', '红桃 4 (4H) —— 长四首攻！'),
          },
          { seat: 'N', card: '6H' },
          { seat: 'E', card: 'AH' },
          { seat: 'S', card: '3H' },
          { seat: 'E', card: '7H' },
          { seat: 'S', card: 'JH' },
          {
            seat: 'W', learner: true, expected: 'KH',
            hint: T('Your king (KH) — partner returned your suit, and the king takes it!', '你的 K (KH) —— 搭档回了你的花色，K 拿下！'),
          },
          { seat: 'N', card: '2H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Two tricks in the bank! Partner's ace won the first — with only A-x he had no message to send, so he simply won and RETURNED your suit. That move has a name: RETURNING PARTNER'S SUIT — the defender's golden rule: when in doubt, give partner's suit back. Your king cashed. Now look at partner's spades: Q-J-T, three touching big cards — a SEQUENCE. Declarer's king is hiding somewhere in front of them. Lead a small spade TOWARD the sequence and let partner's cards do the fighting. Your own rule for later: when YOU lead from a sequence, lead its TOP card — for Q-J-T, the queen. It promises the jack below and denies the king above: partner can read your hand from one card.",
          '两墩入账！第一墩搭档的 A 赢了 —— 他只有 A 加一张小牌，没有信息可发，就干脆赢下，然后回攻你的花色。这一招有名字：回攻搭档花色—— 这是防守的黄金法则：拿不准时，把搭档的花色打回去。你的 K 兑现了。现在看搭档的黑桃：Q-J-T，三张相连的大牌 —— 连张。庄家的 K 藏在它们前面某处。领一张小黑桃，朝着连张打过去，让搭档的牌去拼。顺便记住你自己的规则：轮到你从连张首攻时，领最大的一张 —— Q-J-T 就领 Q。它承诺下面有 J、上面没有 K：一张牌，搭档就能读懂你的手。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'W', learner: true, expected: '5S',
            hint: T('A small spade (5S) — toward partner\'s sequence!', '小黑桃 (5S) —— 朝着搭档的连张打！'),
          },
          { seat: 'N', card: '2S' },
          { seat: 'E', card: 'QS' },
          { seat: 'S', card: '4S' },
          { seat: 'E', card: 'JS' },
          { seat: 'S', card: '9S' },
          {
            seat: 'W', learner: true, expected: '3S',
            hint: T('Small (3S) — your spades were only messengers.', '小牌 (3S) —— 你的黑桃只是信使。'),
          },
          { seat: 'N', card: '6S' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'E', card: '4D' },
          { seat: 'S', card: '9D' },
          {
            seat: 'W', learner: true, expected: '3D',
            hint: T('Follow small (3D) — partner is just stepping aside safely.', '跟小牌 (3D) —— 搭档只是在安全脱手。'),
          },
          { seat: 'N', card: 'KD' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Partner bows out with a small diamond — dummy's king takes it, and dummy's queen of hearts takes their one heart trick. Fair trade. You have FOUR defensive tricks banked; one more beats the contract. Declarer now attacks clubs, hoping to sneak the king past your ace. Not today — take it!",
          '搭档用小方块脱手 —— 明手的 K 拿下，明手的红桃Q 也赢下了他们唯一的一墩红桃。公平交易。你已经存了四墩防守赢墩；再有一墩就击宕了。庄家现在进攻梅花，想把 K 从你的 A 眼皮底下偷过去。今天不行 —— 拿下它！'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', card: 'QH' },
          { seat: 'E', card: '2C' },
          { seat: 'S', card: '5H' },
          { seat: 'W', card: 'TH' },
          { seat: 'N', card: '3C' },
          { seat: 'E', card: '5C' },
          { seat: 'S', card: 'KC' },
          {
            seat: 'W', learner: true, expected: 'AC',
            hint: T('The ace of clubs (AC) — gotcha! That is trick number FIVE.', '梅花A (AC) —— 抓到你了！这是第五墩。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "THAT'S FIVE! ♥A, ♥K, ♠Q, ♠J, ♣A — 3NT is beaten, and there are still cards to play. Look back at where it all came from: one fourth-best 4 of hearts told partner your suit was real, built two heart tricks, and put your side in charge of the hand. The rest was partner reading your messages and sending his own. Exit with a small club and let declarer tidy up his diamonds — the hand is already yours.",
          '五墩到手！♥A、♥K、♠Q、♠J、♣A —— 3NT 被击宕了，而且牌还没打完。回头看看这一切是从哪来的：一张长四的红桃 4，告诉搭档你的花色是真的，建起了两墩红桃，让你们掌控了整副牌。剩下的，就是搭档读懂你的信息、再发回他的信息。用小梅花脱手，让庄家去收拾他的方块吧 —— 这副牌已经是你们的了。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'W', learner: true, expected: '8C',
            hint: T('Exit small (8C) — the job is done.', '小牌脱手 (8C) —— 活已经干完了。'),
          },
          { seat: 'N', card: '9C' },
          { seat: 'E', card: '6C' },
          { seat: 'S', card: 'QC' },
          { seat: 'S', card: 'AD' },
          { seat: 'W', card: 'TD' },
          { seat: 'N', card: '9H' },
          { seat: 'E', card: '5D' },
          { seat: 'S', card: 'QD' },
          { seat: 'W', card: 'TC' },
          { seat: 'N', card: '8S' },
          { seat: 'E', card: '6D' },
          { seat: 'S', card: 'JD' },
          { seat: 'W', card: '7S' },
          { seat: 'N', card: 'JC' },
          { seat: 'E', card: '7D' },
          { seat: 'S', card: 'KS' },
          { seat: 'W', card: '8H' },
          { seat: 'N', card: 'AS' },
          { seat: 'E', card: 'TS' },
          { seat: 'N', card: '7C' },
          { seat: 'E', card: '8D' },
          { seat: 'S', card: '2D' },
          { seat: 'W', card: '4C' },
        ],
      },
      { kind: 'result' },
    ],
  },
  {
    id: 'defense-play',
    title: T('Defense II: Play With Partner', '防守二：配合出牌'),
    dealer: 'N',
    hands: DEFENSE_PLAY_DEAL,
    contract: { level: 4, denom: 'S', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          "Still defending — but today you sit EAST, and partner West makes the opening lead. South plays 4♠: your side needs FOUR tricks to beat it. Defending is mostly about WHERE you sit in each trick. You are THIRD hand when partner leads (two cards are down before you), SECOND hand when the player on your right leads, and FOURTH — last — when the lead comes around to you. Each chair has one golden rule. Partner leads a small heart, the 6. Dummy plays the 2. You are third hand, holding K-9-4. The rule for third hand: play HIGH — your biggest card. Go: the king!",
          '继续防守 —— 但今天你坐东家，首攻由搭档西家来打。南家打 4♠：你们需要四墩才能击宕。防守的关键，是每一墩里你坐哪个位置。搭档领牌时你是第三家（你出牌前已有两张牌落地），右手方领牌时你是第二家，牌转到你这里时你是第四家 —— 最后出牌。每把椅子都有一条黄金法则。搭档领出小红桃 6，明手跟了 2。你是第三家，手里是 K-9-4。第三家的法则：出大牌 —— 你最大的那张。来吧：K！'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '6H' },
          { seat: 'N', card: '2H' },
          {
            seat: 'E', learner: true, expected: 'KH',
            hint: T('The king (KH) — third hand high!', 'K (KH) —— 第三家出大！'),
          },
          { seat: 'S', card: 'AH' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "The ace swallowed your king — and that is a GOOD trade, not a loss! Think: if you had played small, declarer would have won the trick cheaply with the ten and kept the ace as a second winner. Your king FORCED the ace out. Now partner's queen is the biggest heart still alive… remember that. Declarer draws trumps — follow small and cheap, your spades are all little.",
          'A 吞掉了你的 K —— 这是笔好买卖，不是损失！想一想：如果你出小牌，庄家只要用 T 就能便宜地赢下这墩，A 还留作第二个赢墩。你的 K 把 A 逼了出来。现在搭档的 Q 是还活着的最大红桃……记住这一点。庄家开始一张张拔掉将牌 —— 跟小牌、便宜地跟，你的黑桃全是小个子。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: 'AS' },
          { seat: 'W', card: '2S' },
          { seat: 'N', card: '5S' },
          {
            seat: 'E', learner: true, expected: '4S',
            hint: T('Small (4S) — save nothing, spend nothing.', '小牌 (4S) —— 什么都不用留，也不用花。'),
          },
          { seat: 'S', card: 'KS' },
          { seat: 'W', card: '3S' },
          { seat: 'N', card: '7S' },
          {
            seat: 'E', learner: true, expected: '9S',
            hint: T('The 9 (9S) — still just following.', '9 (9S) —— 还是跟着走。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Now declarer leads a small club toward dummy's king — and you are LAST to play, fourth hand. The rule for fourth hand: if you cannot win, play CHEAP. Dummy's king is already winning this trick; throwing your ace under it buys your side nothing. But don't play randomly small either: play the TEN. It costs little, and your ace stays loaded, waiting for declarer's queen, which is still out there. Cheap and loaded — the ten!",
          '现在庄家领出小梅花，朝着明手的 K 打 —— 你是最后一个出牌的，第四家。第四家的法则：赢不了，就出便宜的。明手的 K 已经赢了这一墩；把你的 A 垫在它下面，对你们毫无好处。但也不是随便出张最小的：出 T。它代价小，而你的 A 还装着子弹，等着庄家还没露面的 Q。便宜又有后手 —— 出 T！'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: '3C' },
          { seat: 'W', card: '4C' },
          { seat: 'N', card: 'KC' },
          {
            seat: 'E', learner: true, expected: 'TC',
            hint: T('The ten (TC) — cheap! Keep the ace loaded.', 'T (TC) —— 便宜出！A 留着装弹。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Dummy cashes the king of clubs and now leads the JACK of diamonds. An honor is led AT you — different rule! When you can cover an honor with a bigger honor, COVER IT. Your queen over his jack forces declarer to spend the king — and look what it grows: your TEN of diamonds becomes a sentry, taller than every diamond dummy has left. Cover with the queen!",
          '明手兑现了梅花K，现在领出方块J。一张大牌朝你打来了 —— 规则不同了！当你能用更大的大牌盖住一张大牌时，就盖打。你的 Q 压住他的 J，逼庄家动用 K —— 再看它养出了什么：你的方块T 成了哨兵，比明手剩下的任何方块都高。用 Q 盖打！'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', card: 'JD' },
          {
            seat: 'E', learner: true, expected: 'QD',
            hint: T('Cover! The queen (QD) over the jack.', '盖打！Q (QD) 压住 J。'),
          },
          { seat: 'S', card: 'KD' },
          { seat: 'W', card: '4D' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: 'QS' },
          { seat: 'W', card: '6C' },
          { seat: 'N', card: 'JS' },
          {
            seat: 'E', learner: true, expected: 'TS',
            hint: T('Your ten of trumps (TS) — it falls under the queen this round.', '你的将牌 T (TS) —— 这轮它只能垫在 Q 下面。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Declarer leads the ten of hearts. Watch partner: the QUEEN takes it — the queen your king promoted on the very first trick! Third hand high was not about winning trick one; it was about buying THIS trick. Follow small and enjoy it.",
          '庄家领出红桃T。看搭档：Q 拿下了它 —— 正是你的 K 在第一墩亲手扶起来的那张 Q！第三家出大，图的不是赢下第一墩，而是买下这一墩。跟张小牌，欣赏一下吧。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: 'TH' },
          { seat: 'W', card: 'QH' },
          { seat: 'N', card: 'JH' },
          {
            seat: 'E', learner: true, expected: '3H',
            hint: T('Small (3H) — partner\'s queen is doing the work.', '小牌 (3H) —— 搭档的 Q 在干活呢。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Partner now leads a diamond back toward you. Dummy plays the 6. Are there any diamonds higher than your ten still alive? The ace is partner's, the king and queen and jack are all gone — your ten is the tallest card left in the suit. The sentry collects! Take it with the ten.",
          '搭档现在把方块打回来。明手跟了 6。还有比你的 T 更大的方块活着吗？A 在搭档手里，K、Q、J 全都打过了 —— 你的 T 是这门花色剩下的最高牌。哨兵收费了！用 T 拿下。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '7D' },
          { seat: 'N', card: '6D' },
          {
            seat: 'E', learner: true, expected: 'TD',
            hint: T('The ten (TD) — the sentry collects its trick!', 'T (TD) —— 哨兵来收费了！'),
          },
          { seat: 'S', card: '8D' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'E', learner: true, expected: '5D',
            hint: T('Lead the 5 (5D) — partner\'s ace is waiting at the end of this suit.', '领出 5 (5D) —— 这门花色的尽头有搭档的 A 在等着。'),
          },
          { seat: 'S', card: '2C' },
          { seat: 'W', card: 'AD' },
          { seat: 'N', card: '2D' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Three defensive tricks home, one more needed. Partner leads the jack of clubs — and here comes the payoff for your patience at trick 4: your ACE, saved instead of wasted under dummy's king, takes this trick now. Win it!",
          '三墩防守赢墩到手，还差一墩。搭档领出梅花J —— 你在第 4 墩的耐心现在有回报了：你的 A，当时没有浪费在明手的 K 下面，现在拿下这一墩。赢了它！'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: 'JC' },
          { seat: 'N', card: '7C' },
          {
            seat: 'E', learner: true, expected: 'AC',
            hint: T('The ace (AC) — the card you saved at trick 4!', 'A (AC) —— 你在第 4 墩省下来的那张牌！'),
          },
          { seat: 'S', card: '9C' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "FOUR — the contract is beaten! And the hand still has a gift left: lead your last diamond, and watch partner's humble 9 take a trick, because your cover and your leads cleared every bigger diamond out of its way. Final tally for the defense: ♥Q, ♦T, ♦A, ♣A, ♦9 — five tricks; declarer got eight of the ten he needed. 4♠ down two!",
          '四墩 —— 定约被击宕了！而这副牌还留了个礼物：领出你最后一张方块，看搭档不起眼的 9 赢下一墩 —— 因为你的盖打和领牌，把比它大的方块全清干净了。防守方最终清点：♥Q、♦T、♦A、♣A、♦9 —— 五墩；庄家需要十墩，只拿到八墩。4♠ 宕二！'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'E', learner: true, expected: '3D',
            hint: T('Your last diamond (3D) — small card, big setup.', '你最后一张方块 (3D) —— 小牌，大局已定。'),
          },
          { seat: 'S', card: 'QC' },
          { seat: 'W', card: '9D' },
          { seat: 'N', card: '8H' },
          { seat: 'W', card: '5C' },
          { seat: 'N', card: '8C' },
          {
            seat: 'E', learner: true, expected: '4H',
            hint: T('Small (4H) — nothing left to protect.', '小牌 (4H) —— 没什么要保护的了。'),
          },
          { seat: 'S', card: '8S' },
          { seat: 'S', card: '6S' },
          { seat: 'W', card: '7H' },
          { seat: 'N', card: '5H' },
          {
            seat: 'E', learner: true, expected: '9H',
            hint: T('The 9 (9H) — last card of a winning defense.', '9 (9H) —— 一次获胜防守的最后一张牌。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Pin the four chair rules to your wall — each with its name. THIRD HAND HIGH: partner leads — play your biggest, to force out declarer's honors and promote your side's next cards. COVER AN HONOR: an honor is led at you — cover it with a bigger honor and grow your ten. FOURTH HAND LOW: you are last and cannot win — play cheap, and keep your ace loaded for a card that matters. And SECOND HAND LOW: when the player on your right leads small, usually play low too, and let the trick come to your partner — the same patience, one chair earlier. Defense is two half-hands thinking as one. You have now played both sides of the table — so who decided South should play 4♠ at all? Next lesson: the contract itself.",
          '把四把椅子的法则钉在墙上 —— 每条都有名字。第三家出大：搭档领牌 —— 出你最大的，逼出庄家的大牌，扶起你们次一级的牌。大牌盖大牌：一张大牌朝你打来 —— 用更大的大牌盖打，养大你的 T。第四家放小：你是最后一家又赢不了 —— 便宜地出，把 A 留给真正要紧的牌。第二家放小：右手方领出小牌时，通常也放小，让这一墩流向你的搭档 —— 同样的耐心，只早了一个座位。防守，是两个半手想成一颗心。你现在牌桌两边都打过了 —— 那么，到底是谁决定南家打 4♠ 的？下一课：定约本身。'
        ),
      },
      { kind: 'result' },
    ],
  },
  {
    id: 'contract',
    title: T('The Contract: A Promise', '定约：一份承诺'),
    dealer: 'N',
    hands: CONTRACT_DEAL,
    contract: { level: 4, denom: 'S', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          "All this time you have been PLAYING contracts — 1NT, 3NT, 4♠… but what IS a contract, exactly? Today we open the hood.",
          '打了这么久，你一直在打"定约"—— 1NT、3NT、4♠……但定约到底是什么？今天我们打开引擎盖看看。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "A contract has two parts. The TRUMP: which suit is the super suit — or notrump, no super suit at all. And the LEVEL: a number from 1 to 7. Here is the key formula: level + 6 = the tricks your side PROMISES to win. 1♠ promises 7 tricks. 4♥ promises 10. 3NT promises 9, with no trump.",
          '定约有两部分。定将：哪个花色是将牌 —— 或者是无将，根本没有超级花色。定阶：1到7的一个数字。关键公式来了：阶数 + 6 = 你们一方承诺要赢的墩数。1♠承诺7墩，4♥承诺10墩，3NT承诺9墩、没有将牌。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "And a promise is a promise. Make it — win at least that many tricks — and your team scores points, plus a bonus. Break it, even by ONE trick, and the DEFENDERS score instead. Promise 11 tricks, win 10, and you still failed: close does NOT count. So the golden question of every hand: how much can we honestly promise?",
          '而承诺就是承诺。做到 —— 至少赢到承诺的墩数 —— 你们队得分，还有奖分。哪怕只差一墩没做到，分数就归防守方。承诺11墩、赢了10墩，照样算失败：接近不算数。所以每一副牌的黄金问题是：我们到底能诚实地承诺多少？'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Two clues tell you. Clue one: POINTS. Count high-card points like this: ace = 4, king = 3, queen = 2, jack = 1 — the whole deck holds 40. Your hand: ♠A K Q (9), ♥A (4), ♦K (3) = 16 points. Partner's: ♥K Q (5), ♦A (4), ♠J (1) = 10. Together: 26 points — a big share of all the strength at the table is yours.",
          '有两条线索告诉你。线索一：点力。这样数大牌点：A=4、K=3、Q=2、J=1 —— 整副牌共40点。你的牌：♠A K Q（9）、♥A（4）、♦K（3）= 16点。搭档的：♥K Q（5）、♦A（4）、♠J（1）= 10点。联手：26点 —— 全桌的实力有一大半在你们手里。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Clue two: the FIT. Count spades: you hold 5, partner holds 3 — EIGHT together. When partners share 8 or more cards in a suit, that suit is a fit — it begs to be your trump: eight soldiers marching together, and even the little ones can ruff something later. A spade fit: found!",
          '线索二：配合。数一数黑桃：你有5张，搭档有3张 —— 联手八张。当搭档之间在一门花色联手有8张或更多，这门花色就是配合 —— 它天生就该当将牌：八个士兵一起前进，连最小的那些日后都能将吃。黑桃配合：找到了！'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Now the magic number: 25. With about 25 or more combined points, your side is strong enough to go for a GAME contract — the contracts with the giant bonus: 3NT (promise 9 tricks), 4♥ and 4♠ (promise 10), 5♣ and 5♦ (promise 11). You have 26 points AND a spade fit… so today's contract is 4♠: promise TEN tricks.",
          '现在说那个魔法数字：25。联手大约25点或更多，你们就有实力冲击成局定约 —— 奖分巨大的那些定约：3NT（承诺9墩）、4♥和4♠（承诺10墩）、5♣和5♦（承诺11墩）。你们有26点，还有黑桃配合……所以今天的定约是4♠：承诺十墩。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Why stretch so high? Watch the money. Win exactly 10 tricks at 2♠: you score 170. Win the same 10 tricks at 4♠: you score 420 — the game bonus alone is worth hundreds. But stretch WITHOUT the points and the fit, and the promise breaks — the defenders collect the points instead. Promise only what your points and fit can pay for. Plan first, like the losers lesson taught: count losers from your long-trump hand — spades 0, hearts 0 (dummy's K and Q cover your two small ones), diamonds 1, clubs 2. Total: 3 losers — and a game contract can afford exactly 3. Green light! West leads the ace of clubs — straight at our losers.",
          '为什么要冲这么高？看分数。打2♠赢正好10墩：得170分。打4♠赢同样的10墩：得420分 —— 成局奖分本身就值几百分。但如果没有点力和配合硬冲，承诺就会破产 —— 分数反而归防守方。承诺要落在点力和配合付得起的范围内。先做计划，就像数输墩那课教的：从长将牌一方数输墩 —— 黑桃0、红桃0（明手的K和Q正好盖住你的两张小牌）、方块1、梅花2。总共3个输墩 —— 成局定约正好输得起3个。绿灯！西家领出梅花A —— 直冲我们的输墩而来。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: 'AC' },
          { seat: 'N', card: '4C' },
          { seat: 'E', card: '2C' },
          { seat: 'S', card: '6C' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: 'KC' },
          { seat: 'N', card: '5C' },
          { seat: 'E', card: 'TC' },
          { seat: 'S', card: '8C' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Both club losers, paid — exactly as planned. West switches to a diamond: take it with dummy's ace. And then, BEFORE touching any other side suit: draw their trumps! Why the hurry? If a side suit breaks badly, a defender still holding a trump could ruff one of your winners — a NEW loser that was never on your list. Pull every enemy trump out first, and your winners are safe forever.",
          '两个梅花输墩都付清了 —— 和计划一模一样。西家改打方块：用明手的A拿下。然后，在碰任何其他边花之前：先清将！为什么这么急？如果某门边花分布恶劣，还握着将牌的防守方可能将吃你的赢墩 —— 一个清单上没有的新输墩。先把对方将牌全部拔掉，你的赢墩就永远安全了。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '3D' },
          {
            seat: 'N', learner: true, expected: 'AD',
            hint: T("Dummy's ace of diamonds (AD). Take the trick!", '明手的方块A (AD)，拿下这一墩！'),
          },
          { seat: 'E', card: '2D' },
          { seat: 'S', card: '5D' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Now dummy leads a little trump toward your big ones — drawing trumps works from either hand. Ace first!',
          '现在明手领出一张小将牌，朝你的大将牌打 —— 清将从哪只手开始都行。先出A！'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', card: '5S' },
          { seat: 'E', card: '2S' },
          {
            seat: 'S', learner: true, expected: 'AS',
            hint: T('Ace of spades (AS) — start drawing their trumps!', '黑桃A (AS) —— 开始清将牌！'),
          },
          { seat: 'W', card: '4S' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: 'KS' },
          { seat: 'W', card: '9S' },
          { seat: 'N', card: '7S' },
          { seat: 'E', card: '3S' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'QS',
            hint: T('Queen of spades (QS) — the last of their trumps fall.', '黑桃Q (QS) —— 他们最后的将牌掉了。'),
          },
          { seat: 'W', card: 'TS' },
          { seat: 'N', card: 'JS' },
          { seat: 'E', card: '8H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "All five enemy trumps are GONE — now, and only now, the side suits are safe: nothing can be ruffed. Cash your king of diamonds, then the next diamond round pays the one diamond loser on the list.",
          '对方五张将牌全部清完 —— 现在，也只有现在，边花才真正安全：什么都不会被将吃了。兑现你的方块K，然后下一轮方块付掉清单上的那个方块输墩。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KD',
            hint: T('Your king of diamonds (KD).', '你的方块K (KD)。'),
          },
          { seat: 'W', card: 'JD' },
          { seat: 'N', card: '4D' },
          { seat: 'E', card: '7D' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: '9D' },
          { seat: 'W', card: 'QD' },
          { seat: 'N', card: '6D' },
          { seat: 'E', card: 'TD' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "There's the diamond loser — the defenders have their 3 tricks, and the budget is spent. Hearts last, and they are safe now because no enemy trump exists: cash dummy's queen and king first (honors from the short hand first — remember blocking?), then your ace makes West's jack fall.",
          '方块输墩出现 —— 防守方拿到3墩，预算花完。最后打红桃，而且现在很安全，因为对方一张将牌都不剩了：先兑现明手的Q和K（短套的大牌先打 —— 还记得阻塞吗？），然后你的A让西家的J掉下来。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '9H' },
          {
            seat: 'N', learner: true, expected: 'QH',
            hint: T("Dummy's queen of hearts (QH) — cash the short hand's honors first.", '明手的红桃Q (QH) —— 先兑现短套的大牌。'),
          },
          { seat: 'E', card: '2H' },
          { seat: 'S', card: '4H' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', card: 'KH' },
          { seat: 'E', card: '3H' },
          { seat: 'S', card: '7H' },
          { seat: 'W', card: 'TH' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', card: '6H' },
          { seat: 'E', card: '5H' },
          {
            seat: 'S', learner: true, expected: 'AH',
            hint: T('Your ace of hearts (AH) — down comes their jack.', '你的红桃A (AH) —— 他们的J掉下来了。'),
          },
          { seat: 'W', card: 'JH' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Only your two little trumps remain — with every enemy trump gone, they are simply winners. Bring them home.',
          '只剩下你的两张小将牌 —— 对方将牌全清完了，它们就是普通的赢墩。带它们回家。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: '8S' },
          { seat: 'W', card: '3C' },
          { seat: 'N', card: '9C' },
          { seat: 'E', card: 'QC' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: '6S' },
          { seat: 'W', card: '7C' },
          { seat: 'N', card: '8D' },
          { seat: 'E', card: 'JC' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "TEN tricks — promise KEPT, and kept exactly! Score it: 4♠ = 120 trick points + 300 game bonus = 420. The same ten tricks stopped at 2♠? Only 170. That 250-point gap is the whole reason for the 25-point rule: when the points and the fit are there, DARE to promise game.",
          '十墩 —— 承诺兑现，分毫不差！算一算分：4♠ = 120墩分 + 300成局奖分 = 420分。同样的十墩如果停在2♠呢？只有170分。这250分的差距，就是25点规则的全部意义：点力和配合都在的时候，要敢承诺成局。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "But one question remains: at a real table, nobody HANDS you the contract. You and partner must find it yourselves — without seeing each other's cards. You find it by TALKING, in bids. Next lesson: bidding, the language of partners. And the points and fits from today? They are the words of that language.",
          '但还有一个问题：真实牌桌上，没人把定约递到你手里。你和搭档必须自己找到它 —— 还看不见对方的牌。靠什么找？靠"说话"，用叫牌。下一课：叫牌，搭档之间的语言。而今天学的点力和配合，就是这种语言的词汇。'
        ),
      },
      { kind: 'result' },
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
          "Before the cards fly, the players TALK. Not with words — with bids. Every bid is a little message to your partner: 'Hey, my hearts are great!'",
          '在打牌之前，玩家先"说话"。不是用嘴 —— 是用叫牌。每一个叫牌都是给搭档的小消息："嘿，我的红桃很棒！"'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Quick review from the contract lesson — to talk well, count your strength in points: Ace = 4, king = 3, queen = 2, jack = 1. Add them up: that is how strong your hand is.',
          '先复习一下定约课的内容 —— 想说得好，先数你的"力气"：点数！A=4点，K=3点，Q=2点，J=1点。加起来，就是你这手牌有多强。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Bidding goes around the table. Each bid must be BIGGER than the last: a higher number, or the same number in a higher suit. Suits rank: clubs < diamonds < hearts < spades < NT. (NT means no-trump — no super suit this hand.)',
          '叫牌轮流来。每一个叫牌必须比上一个大：数字更大，或者同数字但花色更大。花色大小：梅花 < 方块 < 红桃 < 黑桃 < 无将。（无将就是这一局没有超级花色。）'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'N', bid: 'P', note: T(
            'North passes. A pass is a message too: "Nothing worth announcing — a weak hand, or no suit I want to show."',
            '北家不叫。不叫也是一条消息："没什么值得宣布的 —— 牌弱，或者没有想展示的花色。"'
          ) },
          { seat: 'E', bid: '1D', note: T(
            'East opens the talk with 1♦: "I have a real hand — about 12 points or more — and diamonds are one of my suits." First message sent!',
            '东家用1♦开启对话："我有真材实料 —— 大约12点以上 —— 方块是我的花色之一。"第一条消息发出！'
          ) },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T(
              "East said 1♦. You've got 5 hearts — answer: 1 heart (1H)!",
              '东家说了1♦。你有5张红桃 —— 回答：1红桃 (1H)！'
            ),
            note: T(
              'Your 1♥ — and it counts as a BIGGER bid, because hearts outrank diamonds. Your message: "I have hearts — five of them!"',
              '你的1♥ —— 而且它是更大的叫牌，因为红桃比方块高级。你的消息是："我有红桃 —— 有5张！"'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Nice — 1♥ beats 1♦ because hearts outrank diamonds. You're talking already!",
          '漂亮 —— 1♥比1♦大，因为红桃比方块高级。你已经在说话了！'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'W', bid: 'P', note: T(
            'West passes — nothing to add to the talk.',
            '西家不叫 —— 没什么要补充的。'
          ) },
          { seat: 'N', bid: 'P', note: T(
            'North passes again — still no news worth sharing.',
            '北家又不叫 —— 还是没有值得分享的新闻。'
          ) },
          { seat: 'E', bid: '2D', note: T(
            'East says diamonds AGAIN, at the 2-level: "My diamonds are real — long enough to mention twice." It also raises the price: beating this now costs a 2-level bid.',
            '东家把方块再说一次，还升到2阶："我的方块是真的 —— 长到值得说两次。"这还抬高了价格：想压过它，现在得叫到2阶。'
          ) },
          {
            seat: 'S', learner: true, expected: '2H',
            hint: T(
              'East pushed to 2♦. Say hearts again, louder: 2 hearts (2H)!',
              '东家加到2♦。把红桃再说一遍，大声点：2红桃 (2H)！'
            ),
            note: T(
              'Your 2♥: "Still hearts — and I am not backing down." You win the level-2 fight because hearts outrank diamonds.',
              '你的2♥："还是红桃 —— 我可不退让。"你在2阶的较量里赢了，因为红桃比方块高级。'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Now everyone passes — three passes in a row stop the talk. The last bid becomes the contract — the promise from the contract lesson, remember? You promised 2♥.',
          '现在大家都pass了 —— 连续三次不叫，谈话结束。最后一个叫牌变成定约 —— 就是定约课里说的那份承诺，还记得吗？你们承诺的是2♥。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'So who plays the promise? The one who mentioned the suit FIRST. You said hearts first — you are the declarer! Your partner becomes the dummy.',
          '那么谁来打这个承诺？第一个说出这个花色的人。你先说的红桃 —— 你是庄家！你的搭档变成明手。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Dummy's job is the easiest in bridge — you met it back in the planning lesson: lay ALL your cards face-up on the table… and relax. The declarer plays both hands. From now on you'll see North's cards face-up — that's your dummy.",
          '明手的活儿是桥牌里最轻松的 —— 你在做计划那课已经见过：把全部牌翻开摊在桌上……然后休息。庄家一个人打两手牌。从现在开始你会看到北家的牌翻开着 —— 那就是你的明手。'
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
          'This time, partner starts the talk. North opens 1♦. What does that MEAN? "Partner, I have a real hand — about 12 points or more — and diamonds are one of my suits." Every opening bid carries that message.',
          '这次搭档先说话。北家开叫1♦。这是什么意思？"搭档，我有真材实料 —— 大约12点以上 —— 而且方块是我的一個花色。"每一个开叫都带着这个意思。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Quick vocabulary: diamonds ♦ and clubs ♣ are the "minor" suits. Hearts ♥ and spades ♠ are the "major" suits — the popular ones, because they score more (you will see why in the scoring lesson).',
          '先学生词：方块♦和梅花♣叫"小花色"。红桃♥和黑桃♠叫"大花色" —— 更受欢迎的两个，因为它们分更高（记分那一课你就懂了）。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Now YOUR job: answer! Why answer at all? Because partner is asking a question — "What have YOU got?" If you stay silent with a good hand, partner will never know, and your team might stop way too low.',
          '现在轮到你：回答！为什么要回答？因为搭档在问你一个问题 —— "你有什么牌？"你拿着好牌却不说话，搭档永远不知道，你们队可能会停得太低。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'The rule for answering: with 6 points or more, speak. How? Bid your LONGEST suit. Why the longest? More cards together = more tricks together. Count your hand: 5 hearts, 11 points. Your answer is easy!',
          '回答的规矩：有6点或以上，就开口。怎么开？叫你最长的花色。为什么是最长的？两家合起来张数越多，能赢的墩越多。数数你的牌：5张红桃，11点。你的回答很容易！'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'N', bid: '1D', note: T(
            'North opens 1♦: "Partner, I have a real hand — about 12 points or more — and diamonds are one of my suits." The talk has started.',
            '北家开叫1♦："搭档，我有真材实料 —— 大约12点以上 —— 方块是我的花色之一。"对话开始了。'
          ) },
          { seat: 'E', bid: 'P', note: T(
            'East passes. Silence is information too: probably a weak hand, or no suit worth showing.',
            '东家不叫。沉默也是信息：多半是牌弱，或者没有值得展示的花色。'
          ) },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T(
              'Answer with your longest suit: 1 heart (1H).',
              '用你最长的花色回答：1红桃 (1H)。'
            ),
            note: T(
              'Your answer — 1♥: "I hear you, partner! I have hearts — five of them — and 11 points." Answering with your longest suit tells partner your shape.',
              '你的回答 —— 1♥："我听到了，搭档！我有红桃 —— 5张 —— 还有11点。"用最长的花色回答，就是在告诉搭档你的牌型。'
            ),
          },
          { seat: 'W', bid: 'P', note: T(
            'West passes too — the other team stays quiet for now.',
            '西家也不叫 —— 对方暂时保持安静。'
          ) },
          { seat: 'N', bid: '2H', note: T(
            'North RAISES to 2♥: "Hearts? I like them — I hold three myself!" Your 5 plus North\'s 3 makes an 8-card fit.',
            '北家把红桃加叫到2♥："红桃？我喜欢 —— 我自己就有三张！"你的5张加北家的3张，正好8张配合。'
          ) },
          { seat: 'E', bid: 'P', note: T(
            'East passes again — still nothing to add.',
            '东家再不叫 —— 还是没什么可补充的。'
          ) },
          { seat: 'S', bid: 'P', note: T(
            'You pass — correctly! North\'s raise told the whole story, and your hand has nothing NEW to say. Knowing when to stop talking is a real skill.',
            '你不叫 —— 完全正确！北家的加叫已经把故事讲完了，你的牌没有新东西可说。知道什么时候停口，是一项真本事。'
          ) },
          { seat: 'W', bid: 'P', note: T(
            'West\'s pass makes three in a row — three passes end the talk. 2♥ is the contract.',
            '西家的不叫凑满连续三个 —— 谈话结束。2♥就是定约。'
          ) },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Did you catch that? North answered your answer — 2♥! That is a RAISE. Why would North do that? Look at the open cards: North holds 3 hearts. Your 5 plus North\'s 3 = 8 hearts together.',
          '你注意到了吗？北家回答了你的回答 —— 2♥！这叫加叫。北家为什么这么叫？看翻开的牌：北家有3张红桃。你的5张加北家的3张 = 一共8张红桃。'
        ),
      },
      {
        kind: 'info',
        text: T(
          '8 cards in one suit between you is called a FIT — and a fit is gold. Why? One of you can ruff with the short side\'s trumps while the long side\'s cards win tricks. When you find a fit, the hand plays itself.',
          '两家在一个花色里合起来有8张，这叫"配合" —— 配合就是金子。为什么？短的一边可以用将牌将吃，长的一边的牌负责赢墩。找到配合，这副牌就好打了。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Everyone passed, so 2♥ is the contract. Now think: who named hearts first — you or North? You did (1♥). So YOU are the declarer, and North is your dummy. Naming the suit first is what makes the declarer — remember that rule, it decides who plays every hand.',
          '大家都不叫了，2♥就是定约。想一想：红桃是谁先说出来的 —— 你还是北家？你（1♥）。所以你是庄家，北家是明手。记住这条规矩：先说出花色的人当庄家，每一副牌都靠它决定谁来打。'
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
          'Graduation day — a FULL hand, start to finish! You are South. North deals and opens the talk. Peek at your hearts first: A K Q J and a baby — 5 of them, and 21 points in your hand. What a suit!',
          '毕业日 —— 一整副牌，从头打到尾！你是南家。北家发牌，先开话题。先偷看你的红桃：A K Q J加一张小的，一共5张，你有21点。这花色，绝了！'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Watch how the talk goes this time. North opens a minor, you answer with your longest suit, and if North likes it — you already know the word — North raises.',
          '看这次的对话怎么走。北家开叫一个小花色，你用最长的花色回答，如果北家喜欢 —— 那个词你已经会了 —— 北家就加叫。'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'N', bid: '1C', note: T(
            'North opens 1♣: "A real hand — 12 points or more — and clubs are one of my suits." A minor opening carries the same starting message as 1♦.',
            '北家开叫1♣："有真材实料 —— 12点以上 —— 梅花是我的花色之一。"小花色开叫，和1♦的开场白是一个意思。'
          ) },
          { seat: 'E', bid: 'P', note: T(
            'East passes — no suit worth showing, and not enough to jump into the talk.',
            '东家不叫 —— 没有值得展示的花色，也不够格抢进对话。'
          ) },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T(
              'North opened 1♣. Answer with your longest suit: 1 heart (1H).',
              '北家开叫1♣。用你最长的花色回答：1红桃 (1H)。'
            ),
            note: T(
              'You answer 1♥ with your longest suit: "Hearts — five of them — and a strong hand to back them." Partner is listening.',
              '你用最长的花色回答1♥："红桃 —— 5张 —— 背后还有一手强牌。"搭档在听着呢。'
            ),
          },
          { seat: 'W', bid: 'P', note: T(
            'West passes — the opponents stay out of this conversation.',
            '西家不叫 —— 对方不掺和这场对话。'
          ) },
          { seat: 'N', bid: '2H', note: T(
            'North raises your hearts — 2♥! Look at North\'s open hand: FOUR hearts waiting for you. With your five, that is 9 together — a giant fit.',
            '北家加叫你的红桃 —— 2♥！看北家翻开的牌：整整四张红桃在等你。加上你的五张，一共9张 —— 巨大的配合。'
          ) },
          { seat: 'E', bid: 'P', note: T(
            'East passes again — the story is all on your side of the table.',
            '东家再不叫 —— 故事完全在你们这边。'
          ) },
          {
            seat: 'S', learner: true, expected: 'P',
            hint: T(
              'North raised to 2♥ — fit found (9 hearts together)! Your job is done: pass.',
              '北家加叫到2♥ —— 找到配合了（两家9张红桃）！你的任务完成了：不叫。'
            ),
            note: T(
              'You pass. The fit is found, the story is told, your job in the talk is done. Now your 21 points go to work at the table.',
              '你不叫。配合找到了，故事讲完了，你在对话里的任务结束了。接下来，你的21点到牌桌上干活。'
            ),
          },
          { seat: 'W', bid: 'P', note: T(
            'West\'s pass is the third in a row — talk over. The contract: 2♥, and YOU are the declarer.',
            '西家的不叫是连续第三个 —— 谈话结束。定约：2♥，庄家是你。'
          ) },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Contract: 2♥ by you. The promise: 8 tricks, hearts are trump. North's cards are face-up in front of you — your dummy. And in this bootcamp everyone else's cards are open too, so you can watch WHY every move works. West leads. Let's play!",
          '定约：2♥，你来打。承诺：8墩，红桃是将牌。北家的牌翻开在你面前 —— 你的明手。而且在这个训练营里，其他人的牌也是翻开的，你可以看清每一步为什么有效。西家首攻。开打！'
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
            hint: T('Diamonds led. Take it with your ace (AD).', '方块领出。用你的A (AD) 拿下。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "First job as declarer: pull out the enemies' trumps. Why FIRST? Look at East's open cards: East holds FOUR hearts. If you cash your side-suit winners while East still has trumps, East will RUFF them — steal your winner with a small trump. (West has no hearts at all — lucky — but one ruffing enemy is enough.) Draw their trumps while you are strong, then your winners are safe.",
          '庄家的第一件工作：拔掉对方的将牌。为什么要先拔？看东家翻开的牌：东家有四张红桃。如果你先兑现边花色的赢墩，而东家手里还有将牌，他会将吃 —— 用一张小小的将牌偷走你的赢墩。（西家一张红桃都没有 —— 运气不错 —— 但一个能将吃的敌人就够了。）趁你强的时候拔光他们的将牌，你的赢墩就安全了。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AH',
            hint: T('Draw trump: ace of hearts (AH).', '拔将牌：红桃A (AH)。'),
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
            hint: T('Keep pulling: king of hearts (KH).', '继续拔：红桃K (KH)。'),
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
        kind: 'info',
        text: T(
          "Count the enemy trumps with me. Hearts total 13; your side holds 9, so the enemies hold 4 — all in East's hand. East has now followed with the 2, 3 and 4: three gone, exactly ONE left out there (the 10, sitting in East's hand — with open cards you can even see it). West never had any — those club discards told the story. One more round pulls the last trump.",
          '跟我一起数对方的将牌。红桃一共13张，你们有9张，所以对方有4张 —— 全在东家手里。东家已经跟出了2、3、4：三张没了，外面正好只剩一张（10，就在东家手里 —— 牌翻开着你甚至能看见）。西家从来就没有 —— 那些垫掉的梅花说明了一切。再打一轮，拔掉最后一张将牌。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'JH',
            hint: T('Jack of hearts (JH) — pull the last enemy trump!', '红桃J (JH) —— 拔掉对方最后一张将牌！'),
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
            hint: T('Your last heart (5H) — nobody can beat it now.', '你最后一张红桃 (5H) —— 现在没人能打败它。'),
          },
          { seat: 'W', card: 'TC' },
          { seat: 'N', card: '4S' },
          { seat: 'E', card: 'JD' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Did you see trick 6? Your baby 5 of hearts won because every other heart was gone — the others could only discard. Trumps are finished now, so your winners can never be stolen. Cash the spades: ace first, then king. (When you hold both A and K, either order works — just bank them.)',
          '看到第6墩了吗？你的小红桃5赢了，因为其他红桃全没了 —— 别人只能垫牌。现在将牌打完了，你的赢墩再也不会被偷走。兑现黑桃：先A，后K。（A和K都在你手里时，顺序无所谓 —— 存进银行就行。）'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AS',
            hint: T('Cash the ace of spades (AS).', '兑现黑桃A (AS)。'),
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
        kind: 'info',
        text: T(
          "Your hand is down to small clubs — but dummy still holds club winners: A, K, Q. How do you get there? Lead a club FROM your hand TOWARD dummy; dummy's ace wins the trick, and then dummy leads. That bridge between the two hands is called an entry, and pros plan their entries before trick one.",
          '你的手里只剩小梅花了 —— 但明手还有梅花的赢墩：A、K、Q。怎么过去？从你手里领出一张梅花，朝向明手；明手的A赢下这一墩，然后由明手领出。这座两手之间的桥叫"进手"，高手在第一墩之前就计划好了。现在打出你的小梅花。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '7C',
            hint: T('Small club toward dummy (7C).', '向明手打一张小梅花 (7C)。'),
          },
          { seat: 'W', card: '5D' },
          {
            seat: 'N', learner: true, expected: 'AC',
            hint: T("You drive dummy's hand too — play dummy's ace of clubs (AC)!", '明手的牌也归你打 —— 打出明手的梅花A (AC)！'),
          },
          { seat: 'E', card: 'JC' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: 'KC',
            hint: T("Dummy leads now — king of clubs (KC).", '现在由明手领出 —— 梅花K (KC)。'),
          },
          { seat: 'E', card: 'TS' },
          {
            seat: 'S', learner: true, expected: '4C',
            hint: T('Follow small from your hand: 4 of clubs (4C).', '从你手里跟一张小的：梅花4 (4C)。'),
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
        kind: 'info',
        text: T(
          "Two tricks left, both in diamonds. Dummy's king is a winner — cash it. And check your own hand first: you are OUT of diamonds (your only one was the ace), so when dummy leads a diamond you will DISCARD a club. Throwing a card you don't need, when you can't follow suit, is called a discard.",
          '还剩两墩，都是方块。明手的K是赢墩 —— 兑现它。先看你自己的手牌：你已经没有方块了（你只有一张A），所以明手领出方块时你垫一张梅花。跟不了花色时扔掉不需要的牌，这叫垫牌。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: 'KD',
            hint: T("Cash dummy's king of diamonds (KD).", '兑现明手的方块K (KD)。'),
          },
          { seat: 'E', card: 'TD' },
          {
            seat: 'S', learner: true, expected: '6C',
            hint: T('No diamonds left — discard the 6 of clubs (6C).', '没方块了 —— 垫掉梅花6 (6C)。'),
          },
          { seat: 'W', card: 'QD' },
        ],
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'N', learner: true, expected: '3D',
            hint: T("Last trick — dummy's baby diamond (3D) leads.", '最后一墩 —— 明手的小方块 (3D) 领出。'),
          },
          { seat: 'E', card: '8S' },
          {
            seat: 'S', learner: true, expected: '3C',
            hint: T('Still no diamonds — toss your last club (3C).', '还是没方块 —— 扔掉最后一张梅花 (3C)。'),
          },
          { seat: 'W', card: '8D' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "West takes the last trick with the 8 of diamonds! Why does a little 8 win? Diamonds were led, all the trumps were long gone, and East's spade and your club were mere discards — a discard can never beat a card of the suit led. Final count: 12 of 13 for you. You promised only 8. Crushed it!",
          '西家用方块8拿走了最后一墩！为什么小小的8能赢？领出的是方块，将牌早就没了，东家的黑桃和你的梅花都只是垫牌 —— 垫牌永远打不过领出花色的牌。最终计数：13墩你赢了12墩。你只承诺了8墩。大获全胜！'
        ),
      },
      { kind: 'result' },
      {
        kind: 'info',
        text: T(
          '2♥ plus 4 extra tricks = 230 points. You just talked, planned, drew trump, crossed between hands, and played a whole hand of bridge — for real. Next: longer conversations.',
          '2♥加4个超墩 = 230分。你刚刚对话、做计划、拔将牌、在两手之间过桥，真真正正打完了一整副桥牌。下一课：更长的对话。'
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
          "You know bids are messages. Now let's have a real CONVERSATION. The golden rule of talking: every message must tell partner something NEW. Repeating yourself for free wastes a turn of talk.",
          '你已经知道叫牌是消息了。现在来一场真正的对话。对话的黄金规矩：每条消息都要告诉搭档新东西。白白重复自己，等于浪费一轮说话机会。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'This time YOU get to open the talk. The rule for opening: about 12 points or more. How do you open? With your LONGEST suit — it is the suit you most want to tell partner about. Count your hand: 6 hearts, 14 points. Textbook — you open.',
          '这次由你开启对话。开叫的规矩：大约12点或以上。怎么开？用你最长的花色 —— 那是你最想告诉搭档的花色。数数你的牌：6张红桃，14点。太标准了 —— 你开叫。'
        ),
      },
      {
        kind: 'auction',
        script: [
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T('Open the talk with your longest suit: 1♥.', '用你最长的花色开启对话：1♥。'),
            note: T(
              'Your opening bid — 1♥: "About 12 points or more, and hearts, at least five." First message of the conversation.',
              '你的开叫 —— 1♥："大约12点以上，红桃至少5张。"对话的第一条消息。'
            ),
          },
          { seat: 'W', bid: 'P', note: T(
            'West passes — nothing to say. One less voice in the talk.',
            '西家不叫 —— 没什么可说的。对话里少了一个声音。'
          ) },
          { seat: 'N', bid: '1S', note: T(
            'North answers 1♠: "My news: spades — at least four — and at least 6 points." One little bid, a whole postcard of information.',
            '北家回答1♠："我的新闻是：黑桃至少4张，至少6点。"一个小小的叫牌，一整张明信片的信息。'
          ) },
        ],
      },
      {
        kind: 'info',
        text: T(
          'North answered 1♠. Translate it: "My news: I have spades — at least 4 — and at least 6 points." See how much one little bid says? Every bid is a compressed postcard.',
          '北家回答1♠。翻译一下："我的新闻是：我有黑桃 —— 至少4张 —— 而且至少6点。"看到没，一个小小的叫牌能说多少话？每一个叫牌都是一张压缩的明信片。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Now you speak AGAIN. Your second message has a special name: a REBID. What new thing can you say? Your hearts are SIX long — that is news! One heart bid could have been 5. Saying hearts again promises the 6th one. That is why rebidding your suit is never "repeating yourself" — the second mention carries new information.',
          '现在你再说一次。你的第二条消息有个专门的名字：再叫。你能说什么新东西？你的红桃有6张 —— 这就是新闻！叫一次红桃可能只有5张。再叫一次红桃，等于保证有第6张。所以再叫自己的花色从来不是"重复自己" —— 第二次提及带着新信息。'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'E', bid: 'P', note: T(
            'East passes — the fourth chair stays silent too.',
            '东家不叫 —— 第四位也保持沉默。'
          ) },
          {
            seat: 'S', learner: true, expected: '2H',
            hint: T('Rebid your six hearts: 2♥.', '再叫你的6张红桃：2♥。'),
            note: T(
              'Your rebid — 2♥. THIS is the new news: your hearts are SIX long. One heart bid could have been five; saying them again guarantees the sixth.',
              '你的再叫 —— 2♥。这就是新消息：你的红桃有6张。叫一次红桃可能只有5张；再说一次，等于保证有第6张。'
            ),
          },
          { seat: 'W', bid: 'P', note: T(
            'West passes — heard enough.',
            '西家不叫 —— 听够了。'
          ) },
          { seat: 'N', bid: 'P', note: T(
            'North passes. North has the full picture now — six hearts in your hand, no better home than 2♥. Passing is North saying "deal."',
            '北家不叫。北家现在全清楚了 —— 你有6张红桃，没有比2♥更好的归宿。不叫，就是北家在说"成交"。'
          ) },
          { seat: 'E', bid: 'P', note: T(
            'East\'s pass is the third in a row — conversation over. Contract: 2♥.',
            '东家的不叫是连续第三个 —— 对话结束。定约：2♥。'
          ) },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Three passes — conversation over, 2♥ is yours. Replay it like a chat log: 1♥ "I have hearts and 12+ points" → 1♠ "I have spades and 6+" → 2♥ "My hearts are SIX — they are my real suit." Three messages, zero words spoken aloud, and both of you know exactly where you stand. That is bridge bidding.',
          '三次不叫 —— 对话结束，2♥归你们。像聊天记录一样回放：1♥"我有红桃，12点以上" → 1♠"我有黑桃，6点以上" → 2♥"我的红桃有6张 —— 这才是我真正的花色。"三条消息，一句话没说出口，你们俩却都清清楚楚。这就是桥牌的叫牌。'
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
          'You already know a contract is a promise: "We will win THIS many tricks." But how is the promise priced? Slowly, once: the first 6 tricks of every hand are FREE — a contract only counts the tricks ABOVE 6. 2♥ means 6 + 2 = 8 tricks. 4♥ means 6 + 4 = 10 tricks. Now the numbers will make sense.',
          '你已经知道定约是一个承诺："我们会赢这么多墩。"但这个承诺怎么计价？慢慢说一次：每一副牌的前6墩是免费的 —— 定约只数6以上的墩。2♥就是6+2=8墩。4♥就是6+4=10墩。现在数字就说得通了。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Each trick above 6 pays points, and the pay depends on the suit: a major suit (♥ ♠) pays 30 per trick. Minors (♦ ♣) pay 20. No-trump pays 40 for the first trick, then 30. That is exactly why majors are "popular" — same tricks, more money.',
          '6以上的每一墩都给分，分多少看花色：大花色（♥ ♠）每墩30分。小花色（♦ ♣）每墩20分。无将第一墩40分，之后每墩30分。这正是大花色"受欢迎"的原因 —— 一样的墩数，更多的钱。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Remember game from the contract lesson? Here is its exact line: if your contract itself scores 100 points or more, it is called GAME — and the game pays a fat bonus: +300 points on top! Do the math with me: 4♥ = 4 × 30 = 120. Over 100 — GAME. 3NT = 40 + 30 + 30 = 100. Exactly 100 — GAME. The game contracts are: 3NT, 4♥, 4♠, 5♣, 5♦. (Minors need 5 because 4 × 20 = 80 — not enough!)',
          '还记得定约课里的成局吗？这里是它的精确分数线：如果你的定约本身达到100分或以上，就叫成局 —— 成局还有一份厚厚的奖励：额外+300分！跟我算：4♥ = 4 × 30 = 120。超过100 —— 成局。3NT = 40 + 30 + 30 = 100。正好100 —— 成局。成局的定约有：3NT、4♥、4♠、5♣、5♦。（小花色需要到5，因为4 × 20 = 80 —— 不够！）'
        ),
      },
      {
        kind: 'info',
        text: T(
          'A contract under 100 is a partscore — it still pays, plus a small bonus of 50. Nothing wrong with it. But the +300 game bonus is so big that players HUNT for game whenever it is close. So the big question of every auction: "Do we have game?"',
          '不到100分的定约叫部分定约 —— 它照样给分，外加50分小奖励，没什么不好。但成局的+300太大了，所以只要接近，玩家都会猎逐成局。于是每次叫牌的大问题就是："我们有成局吗？"'
        ),
      },
      {
        kind: 'info',
        text: T(
          'How do you know? The contract lesson\'s rule, one more time: add BOTH hands\' points together — about 25 combined points makes game. Why 25? Game needs 9–10 tricks, and 25 of the 40 total points — almost two-thirds of all the strength at the table — usually builds those tricks. Under 25? Take the partscore and be happy.',
          '怎么知道？把定约课的规则再复习一遍：把两只手的点数加起来 —— 两家合计约25点就能成局（25点进局）。为什么是25？成局需要9到10墩，而25点 —— 占全桌40点的将近三分之二 —— 通常足够搭起这些墩。不到25？拿下部分定约，开开心心就好。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Your turn to be brave. You deal and open. Count your hand slowly: ♠A K (7) ♥A K Q J (10) ♦A (4) — 21 points!! Just your hand alone. Even if partner holds the bare minimum 6, that is 27 together — past 25. This is a game hand, and YOU get to make the call.',
          '轮到你勇敢一次了。你发牌，你开叫。慢慢数你的手牌：♠A K（7点）♥A K Q J（10点）♦A（4点）—— 21点！！光你一只手。就算搭档只有最低的6点，合起来也有27点 —— 超过25了。这是成局的牌，而且由你来拍板。'
        ),
      },
      {
        kind: 'auction',
        script: [
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T('Open 1♥ — longest and strongest first.', '开叫1♥ —— 先说最长最强的。'),
            note: T(
              'You open 1♥ — 21 points and five hearts. That is the strongest opening hand you have held in the whole bootcamp.',
              '你开叫1♥ —— 21点、五张红桃。这是你在整个训练营里拿过的最强开叫牌。'
            ),
          },
          { seat: 'W', bid: 'P', note: T(
            'West passes — no answer to that opening yet.',
            '西家不叫 —— 对这样的开叫暂时没什么回应。'
          ) },
          { seat: 'N', bid: '2H', note: T(
            'North raises to 2♥: "I have hearts too — four of them — and real points of my own." Support, loud and clear.',
            '北家加叫2♥："我也有红桃 —— 四张 —— 还有我自己的真点数。"支持，清清楚楚。'
          ) },
          { seat: 'E', bid: 'P', note: T(
            'East passes — watching your team\'s conversation.',
            '东家不叫 —— 看着你们队的对话。'
          ) },
          {
            seat: 'S', learner: true, expected: '4H',
            hint: T(
              'Partner raised — hearts are shared! You hold 21 points. Jump straight to game: 4♥!',
              '搭档加叫了 —— 红桃是共享的！你有21点。直接跳到成局：4♥！'
            ),
            note: T(
              'Your jump — 4♥! Why so high? The math sings: your 21 plus partner\'s promised points sail past 25 combined, and hearts are shared. When the numbers say game, you SAY game.',
              '你的跳叫 —— 4♥！为什么这么高？算术在唱歌：你的21点加上搭档承诺的点数，合计轻松越过25，红桃又是共享的。数字说能成局，你就说成局。'
            ),
          },
          { seat: 'W', bid: 'P', note: T(
            'West passes — no challenge to the game bid.',
            '西家不叫 —— 对成局叫牌没有挑战。'
          ) },
          { seat: 'N', bid: 'P', note: T(
            'North passes — happy to let your jump stand. "Deal."',
            '北家不叫 —— 乐意让你的跳叫成立。"成交。"'
          ) },
          { seat: 'E', bid: 'P', note: T(
            'East\'s pass makes three in a row — the talk is done. Contract: 4♥. GAME!',
            '东家的不叫凑满连续三个 —— 谈话结束。定约：4♥。成局！'
          ) },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Why jump straight to 4♥ instead of creeping up 3♥, then 4♥? Because your message is already complete: "Partner, I have the points AND the hearts — game is on." Slow auctions give the other team free turns to talk and find THEIR contract. When you know, SAY it.',
          '为什么直接跳到4♥，而不慢慢爬3♥、再4♥？因为你的消息已经完整了："搭档，我有点数，又有红桃 —— 成局没问题。"慢慢叫只会给对方免费的说话轮次，让他们找到自己的定约。你确定的时候，就说出来。'
        ),
      },
      {
        kind: 'info',
        text: T(
          '4♥ — GAME! The promise is 10 tricks. West leads a diamond. Trick one of ten — take it!',
          '4♥ —— 成局！承诺是10墩。西家领出方块。十墩里的第一墩 —— 拿下它！'
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
            hint: T('Ace of diamonds (AD) — trick 1 of 10!', '方块A (AD) —— 10墩里的第1墩！'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'One down, nine to go. Make game: the 120 contract points PLUS the 300 bonus — a giant score. Fail the promise: the other team collects penalty points instead. Big promise, big prize, real risk — that delicious tension is the heart of bridge.',
          '拿下1墩，还差9墩。打成成局：120的定约分加上300的奖励 —— 巨分。承诺失败：对方改拿罚分。大承诺、大奖品、真风险 —— 这种让人上瘾的紧张感，就是桥牌的心脏。'
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
          'Plot twist: this time EAST opened first — 1♦! The other team grabbed the microphone. Are you locked out of the talk? Not at all. But the rules of politeness change: they started it, so anything you say now interrupts them. Bridge has a word for that…',
          '剧情反转：这次东家先开叫 —— 1♦！对方抢走了话筒。你被关在对话外面了吗？完全没有。但礼貌规矩变了：是他们先开的口，你现在说什么都是插话。桥牌里这有个专门的词……'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Bidding after the enemy opens is an OVERCALL. Why do it? Three reasons: your team might own this hand too; even if not, your bid steals their talking space; and it tells partner where your strength lives, in case THEY win the contract and must defend.',
          '对方开叫之后你的叫牌，叫争叫。为什么要争？三个理由：这副牌可能也是你们队的；就算不是，你的叫牌也能抢走他们的说话空间；而且它告诉搭档你的力量在哪 —— 万一他们拿到定约要防守，这个信息至关重要。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'But an overcall is a promise made in the dark: partner has not spoken, so you know NOTHING about their hand. That is why the entry fee is strict — a GOOD suit: 5 cards or more, with strong top cards (think A, K, Q up top). If your suit is weak and partner is broke, a bad overcall gets doubled and crushed. A strong suit never embarrasses you.',
          '但争叫是在黑暗里许下的承诺：搭档还没说话，你对他的牌一无所知。所以入场费很严格 —— 一个好花色：5张或以上，顶端要有大牌（A、K、Q坐镇）。如果你的花色很弱，搭档又很穷，烂争叫会被加倍打得很惨。强花色永远不会让你丢脸。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Now peek at YOUR hearts with the checklist: five cards? ✔ (A K Q J and a baby). Strong top cards? ✔✔ — four honors in a row! This suit passes the entry test with honors. Jump in!',
          '现在拿着清单检查你的红桃：五张？✔（A K Q J加一张小的）。顶端大牌强？✔✔ —— 四张大牌连排！这个花色以优异成绩通过入场考试。抢进来！'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'E', bid: '1D', note: T(
            'East opens 1♦ — the OTHER team grabs the microphone first: "A real hand, and diamonds to show."',
            '东家开叫1♦ —— 对方先抢走了话筒："有真材实料，还有方块要展示。"'
          ) },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T('Overcall: 1♥ — your suit earns it!', '争叫：1♥ —— 你的花色配得上！'),
            note: T(
              'Your overcall — 1♥. Same label, different job: after an enemy opening it announces "MY suit is genuinely strong — five hearts, A K Q J on top." Entry fee paid in full.',
              '你的争叫 —— 1♥。同样的标签，不同的工作：对方开叫之后，它宣布的是"我的花色是真的强 —— 五张红桃，A K Q J坐镇。"入场费，全额付清。'
            ),
          },
          { seat: 'W', bid: 'P', note: T(
            'West passes — no support to show for East yet.',
            '西家不叫 —— 暂时没有给东家的支持可展示。'
          ) },
          { seat: 'N', bid: '2H', note: T(
            'North ADVANCES — 2♥: "I back your hearts! I hold FOUR of them, and points on top." Your 5 plus North\'s 4: nine hearts together.',
            '北家进叫 —— 2♥："我挺你的红桃！我有四张，上面还有点数。"你的5张加北家的4张：一共九张红桃。'
          ) },
          { seat: 'E', bid: 'P', note: T(
            'East passes — their opening story did not scare your team off.',
            '东家不叫 —— 他们的开叫故事没吓住你们队。'
          ) },
          { seat: 'S', bid: 'P', note: T(
            'You pass. North\'s advance told you the fit is real, and 2♥ is already a happy steal — no need to push higher.',
            '你不叫。北家的进叫告诉你配合是真的，2♥已经是漂亮的一"偷" —— 不需要再往高推。'
          ) },
          { seat: 'W', bid: 'P', note: T(
            'West\'s pass ends it — three in a row. Your team walks away with the contract: 2♥!',
            '西家的不叫结束了这一切 —— 连续三个。你们队带走了定约：2♥！'
          ) },
        ],
      },
      {
        kind: 'info',
        text: T(
          'And North backed you up — 2♥! When partner supports an overcall, it is called ADVANCING. Why could North raise so happily? Look with the same checklist: North holds FOUR hearts for you — 9 together — and real points on top. Support plus points = advance.',
          '北家还挺了你 —— 2♥！搭档支持争叫，这叫进叫。北家为什么能挺得这么开心？用同一张清单看：北家有4张红桃帮你 —— 合起来9张 —— 上面还有真点数。支持加点数 = 进叫。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'The other team opened the hand — and your team walks away with the contract. That steal felt good, right? You have now learned the whole circle: play tricks, count winners, make a plan, use trump, count losers, make them vanish, promise a contract, talk with bids, answer, raise, rebid, hunt for game, and even jump into enemy auctions.',
          '对方开的局 —— 定约却被你们队拿走了。这种"偷"感觉很好吧？你现在已经学完了整个循环：打墩、数赢墩、做计划、用将牌、数输墩、消去输墩、承诺定约、用叫牌对话、回答、加叫、再叫、猎逐成局，甚至抢进对方的叫牌。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "That's everything a beginner needs for a first real game. You're a bridge player now. See you at the tables, partner! 🃏",
          '这就是新手打第一场真牌需要的全部。你现在是桥牌手了。牌桌上见，搭档！🃏'
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
        script: s.script.map(a => {
          const note = a.note ? { note: a.note[lang] } : {};
          return 'learner' in a
            ? { seat: a.seat, learner: true as const, expected: a.expected, hint: a.hint[lang], ...note }
            : { seat: a.seat, bid: a.bid, ...note };
        }),
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
