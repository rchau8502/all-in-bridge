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
  N: ['5S', '6S', '7S', '2D', '3D', '8H', '9H', '9C', 'TC', 'JC', 'QC', 'KC', 'AC'],
  E: ['8S', '9S', 'TS', 'JS', '4H', '5H', '6H', '7H', '7D', '8D', '9D', 'TD', 'JD'],
  S: ['AS', 'KS', 'QS', 'AH', '2H', '3H', '4D', '5D', '6D', '2C', '3C', '4C', '5C'],
  W: ['2S', '3S', '4S', 'KH', 'QH', 'JH', 'TH', 'AD', 'KD', 'QD', '6C', '7C', '8C'],
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
    title: T('The Deck', '认识纸牌'),
    dealer: 'E',
    hands: DECK_DEAL,
    contract: { level: 1, denom: 'S', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Welcome to bridge! It starts with 52 cards: 4 suits, 13 cards each. The suits are spades ♠, hearts ♥, diamonds ♦, and clubs ♣. Spades and clubs are black; hearts and diamonds are red.',
          '欢迎来到桥牌！先从52张牌开始：4种花色，每种13张。花色是黑桃 ♠、红桃 ♥、方块 ♦、梅花 ♣。黑桃和梅花是黑色的；红桃和方块是红色的。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Each suit ranks 2 3 4 5 6 7 8 9 10 J Q K A — the ace is the highest card. Hearts are led: play your ace of hearts (AH), a red ace!',
          '每种花色从小到大是 2 3 4 5 6 7 8 9 10 J Q K A —— A最大。首攻是红桃：打出你的红桃A (AH)，一张红色的A！'
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
          'The red ace wins! Now spades are led — play your ace of spades (AS), the highest card in the deck.',
          '红色的A赢了！现在首攻是黑桃 —— 打出你的黑桃A (AS)，整副牌中最大的一张。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'AS',
            hint: T('You won the last trick, so you lead — play the ace of spades (AS).', '上一墩是你赢的，由你领出 —— 打出黑桃A (AS)。'),
          },
          { seat: 'W', card: '2S' },
          { seat: 'N', card: '3S' },
          { seat: 'E', card: '4S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Two aces, two tricks! One more ranking for bidding: suits rank clubs < diamonds < hearts < spades < no-trump. East opened 1♥ — top it with 1♠.',
          '两个A，两墩！再记住叫牌时的花色排序：梅花 < 方块 < 红桃 < 黑桃 < 无将。东家开了 1♥ —— 用 1♠ 超过它。'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'E', bid: '1H' },
          {
            seat: 'S', learner: true, expected: '1S',
            hint: T('Spades outrank hearts — bid 1♠.', '黑桃比红桃大 —— 叫 1♠。'),
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: 'P' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'You know the deck: suits, colors, ranks, and even your first bid. Next: how tricks are won and lost.',
          '你已经认识了纸牌：花色、颜色、大小，还学会了第一次叫牌。接下来：如何赢墩。'
        ),
      },
      { kind: 'result' },
    ],
  },
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
        kind: 'info',
        text: T(
          'Did you catch that? West had no hearts left, so the 2♣ was a perfectly legal discard — you only have to follow suit when you actually hold the led suit.',
          '注意到了吗？西家已经没有红桃，所以垫梅花2完全合法 —— 只有手中有首攻花色时才必须跟出。'
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
    id: 'trump',
    title: T('Trump', '将牌'),
    dealer: 'N',
    hands: TRUMP_DEAL,
    contract: { level: 2, denom: 'S', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Some contracts name a trump suit. Here spades are trump — and any trump beats ANY card of another suit, even an ace. A tiny 2♠ beats the mighty A♥.',
          '有些定约会指定将牌花色。这里黑桃是将牌 —— 任何将牌都能打败其他花色的任何牌，哪怕是A。小小的2♠能打败强大的A♥。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'If you cannot follow suit, you may play a trump instead. That is called ruffing. Diamonds are led and you have none — ruff!',
          '如果你没有首攻花色，可以改出将牌。这叫"将吃"。首攻是方块而你没有方块 —— 将吃它！'
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
              'You are void in diamonds — ruff with the 2♠!',
              '你没有方块了 —— 用 2♠ 将吃！'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'The little 2♠ beat the 9♦! Remember: any trump beats any non-trump.',
          '小小的 2♠ 打败了 9♦！记住：将牌永远打败非将牌。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'You won the trick, so you lead. When trump itself is led, it works like a normal suit — highest trump wins. Lead a spade.',
          '你赢得了这一墩，所以由你领出。当领出的就是将牌时，和普通花色一样 —— 最大的将牌赢。领出一张黑桃。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '7S',
            hint: T('Lead the 7♠.', '领出 7♠。'),
          },
          { seat: 'W', card: '9S' },
          { seat: 'N', card: 'AS' },
          { seat: 'E', card: '3S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'North\'s ace of spades takes it — highest trump wins. You now understand trump, the heart of bridge strategy.',
          '北家的黑桃A拿下 —— 最大的将牌赢。你已经懂了将牌，这是桥牌策略的核心。'
        ),
      },
      { kind: 'result' },
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
        kind: 'info',
        text: T(
          "South is the declarer — the declarer is the first player of the winning side to bid the contract's suit. South bid hearts first, so South plays the hand, with North's cards as dummy.",
          '南家是庄家 —— 庄家是赢得定约一方中第一个叫出定约花色的人。南家先叫的红桃，所以南家主打，北家的牌作为明手。'
        ),
      },
    ],
  },
  {
    id: 'conversation',
    title: T('Bidding Conversation', '叫牌交流'),
    dealer: 'S',
    hands: CONV_DEAL,
    contract: { level: 2, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Bids are a conversation with your partner — every bid describes your hand. The measuring tool is high-card points: ace 4, king 3, queen 2, jack 1. (Ace + king = 7 points.)',
          '叫牌是和搭档的对话 —— 每一次叫牌都在描述你的手牌。衡量工具是"大牌点"：A=4点，K=3点，Q=2点，J=1点。（A+K=7点。）'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Opening: with about 12 or more points, open the bidding in your longest suit. You hold 6 hearts and 14 points — open 1♥.',
          '开叫：大约12点以上，用你最长的花色开叫。你有6张红桃和14点 —— 开叫 1♥。'
        ),
      },
      {
        kind: 'auction',
        script: [
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T('Open your heart suit: bid 1♥.', '开叫你的红桃套：叫 1♥。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'You opened! Now partner responds — North will describe their own hand.',
          '你开叫了！现在轮到搭档"应叫" —— 北家会描述他自己的牌。'
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
          'North\'s 1♠ is a response: "I have spades, partner." Now you rebid — bid again to clarify. With 6 hearts, rebid 2♥ to say hearts are really your suit.',
          '北家的 1♠ 是应叫："搭档，我有黑桃。" 现在你"再叫" —— 再次叫牌来澄清牌情。有6张红桃，再叫 2♥ 表示红桃真是你的花色。'
        ),
      },
      {
        kind: 'auction',
        script: [
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: '2H',
            hint: T('Rebid your hearts: 2♥.', '再叫你的红桃：2♥。'),
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: 'P' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Three passes — the auction is yours. Hear the conversation: 1♥ "I have hearts" → 1♠ "I have spades" → 2♥ "hearts again — I really mean it."',
          '三次不叫 —— 定约是你们的了。听听这段对话：1♥"我有红桃" → 1♠"我有黑桃" → 2♥"红桃再叫一次 —— 我是认真的。"'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Overcalls: when the opponents open, you can still compete. If East opened 1♦ and you hold a good heart suit, bidding 1♥ is an overcall — "we want to play this hand too." And with 3-card support for partner\'s suit, raise it: over partner\'s 1♠, bid 2♠ to say "I like spades too."',
          '争叫：当对手开叫后，你依然可以竞争。如果东家开了 1♦ 而你有不错的红桃，叫 1♥ 就是争叫 —— "这副牌我们也要打。"而当你有3张支持搭档的花色时就加叫：搭档开 1♠，你叫 2♠ 表示"我也喜欢黑桃"。'
        ),
      },
      { kind: 'result' },
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
        kind: 'info',
        text: T(
          "A 3NT contract needs 6 + 3 = 9 tricks out of 13. The first 6 are the \"book\" — they don't count.",
          '3NT 定约需要拿下 6 + 3 = 9 墩（共13墩）。前6墩是"本墩"，不算数。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Score has two parts: trick points for the tricks you contracted, plus bonuses. Making 3NT exactly (not vulnerable) is 100 trick points + a 300 game bonus = 400.',
          '得分由两部分组成：定约墩的墩分，加上奖励分。3NT 刚好做成（无局）是 100 墩分 + 300 成局奖励 = 400 分。'
        ),
      },
      {
        kind: 'info',
        text: T(
          '3NT made exactly, not vulnerable: 100 trick points + 300 game bonus = 400. Every overtrick adds 30 more — each extra trick is cash.',
          '3NT 刚好做成、无局：100 墩分 + 300 成局奖励 = 400 分。每超一墩再加 30 分 —— 每一墩都是钱。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Enough theory — feel it. Contract 2H, you need 8 tricks. West leads…',
          '理论够了 —— 来感受一下。定约2H，你需要8墩。西家首攻……'
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
              'Win it with the ace of diamonds (AD) — one trick banked toward your 8.',
              '用方块A (AD) 赢下这一墩 —— 向8墩目标拿下第一墩。'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "One down, seven to go — that's the grind, and overtricks are bonus cash.",
          '拿下一墩，还差七墩 —— 就是这样一墩一墩地磨，超墩还是奖金。'
        ),
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
    id: 'strategy',
    title: T('Plan Your Play', '打牌计划'),
    dealer: 'N',
    hands: STRAT_DEAL,
    contract: { level: 1, denom: 'NT', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          'Strong players plan before they play. First step: count your sure winners. An ace always wins a trick. A king wins if you also hold the ace. Look at your hand: ♠A K Q are 3 winners, ♥A is 1 more — 4 sure tricks.',
          '高手出牌前先做计划。第一步：数清你的"稳赢墩"。A永远能赢一墩；如果你同时有A，K也能赢一墩。看看你的手牌：♠A K Q 是3个赢墩，♥A 再加1个 —— 4个稳赢墩。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'You are in 1NT with 4 sure winners. West makes the opening lead. Win it with your ace — then the plan is to cash your winners before anything can go wrong.',
          '你是1NT定约，有4个稳赢墩。西家首攻。用你的A赢下这一墩 —— 然后计划是趁一切顺利先把赢墩兑现。'
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
            hint: T('Win the opening lead with the ace of spades (AS).', '用黑桃A (AS) 赢下首攻。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'You took the first trick. Now you lead — keep cashing winners with the king of spades.',
          '你拿下了第一墩。现在由你领出 —— 继续用黑桃K兑现赢墩。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KS',
            hint: T('Cash the king of spades (KS).', '兑现黑桃K (KS)。'),
          },
          { seat: 'W', card: '3S' },
          { seat: 'N', card: '6S' },
          { seat: 'E', card: '9S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          'That is planning in action: count your winners, then take them before the defense can interfere. Next: a full hand where you plan it all yourself.',
          '这就是计划的威力：先数赢墩，再趁防守方捣乱之前兑现。接下来：一整副牌，由你自己做计划。'
        ),
      },
      { kind: 'result' },
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
