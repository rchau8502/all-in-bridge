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
          'Pro secret: before playing a single card, good players COUNT. They count their sure winners — tricks they will win, 100%.',
          '高手的秘密：出第一张牌之前，先数一数。数你的稳赢墩 —— 百分之百能赢的墩。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'An ace is always a sure winner. A king counts too, if you hold the ace with it. Count yours: ♠A K Q — that is 3. Plus ♥A — 4 sure winners!',
          'A永远是稳赢墩。有A在手，K也算。数数你的：♠A K Q —— 3个。再加上♥A —— 一共4个稳赢墩！'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Your contract is 1NT — you need 7 tricks. You've already got 4 in the bag. West leads. Take it with your ace!",
          '你的定约是1NT —— 需要7墩。你已经有4个在口袋里了。西家首攻。用你的A拿下！'
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
            hint: T('Ace of spades (AS). Take it!', '黑桃A (AS)，拿下！'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'One in the bag! Keep cashing your winners before the other team wakes up. King of spades — go!',
          '一墩到手！趁对方还没醒过神，继续把赢墩兑现。黑桃K，上！'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KS',
            hint: T('King of spades (KS).', '黑桃K (KS)。'),
          },
          { seat: 'W', card: '3S' },
          { seat: 'N', card: '6S' },
          { seat: 'E', card: '9S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "See the plan? Count first, then cash. Easy! But what if you're MISSING a winner? Time for a magic trick…",
          '看到计划的威力了吧？先数，再兑现。简单！但如果你少一个赢墩怎么办？是时候学个魔法了……'
        ),
      },
      {
        kind: 'info',
        text: T(
          "The magic is called a finesse （飞牌）. Look at hearts: you hold A-6-2, partner holds Q-8, and the enemy king… well, with our x-ray eyes you can SEE it: the king sits in West's hand, together with the 9, 4 and 3. In a real game it would be hidden — that's the whole game. Here's the trick: lead a SMALL heart toward partner's queen…",
          '这个魔法叫飞牌。看红桃：你有A-6-2，搭档有Q-8，敌人的K……嗯，用我们的透视眼你能看见：K就在西家手里，和9、4、3在一起。真正的牌局里它是藏着的 —— 这正是游戏的关键。诀窍是：朝着搭档的Q，领出一张小红桃……'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Why does this trap work? Play goes clockwise, so West must play BEFORE North's queen shows. If West plays the king now, your ace eats it next and the queen still wins a trick later. If West plays small (watch — West will duck with the 3), the queen wins THIS trick and the king is still stuck behind your ace. Heads you win, tails you win — as long as the king sits on THIS side. Try it: lead your little 2 of hearts.",
          '这个陷阱为什么有效？出牌是顺时针的，西家必须在北家的Q亮出来之前出牌。如果西家现在出K，你的A回头就吃掉它，Q之后还能赢一墩。如果西家出小牌（看着 —— 西家会用3躲开），Q就赢下这一墩，而K还卡在你的A后面。正面反面你都赢 —— 只要K在这一边。试试看：领出你的小红桃2。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: '2H',
            hint: T('The little 2 of hearts (2H) — bait!', '小红桃2 (2H) —— 诱饵！'),
          },
          { seat: 'W', card: '3H' },
          {
            seat: 'N', learner: true, expected: 'QH',
            hint: T("Now partner's queen (QH) — snap the trap shut!", '现在打出搭档的Q (QH) —— 合上陷阱！'),
          },
          { seat: 'E', card: '5H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "SNAP! The queen won! West's king never got a chance. That's a finesse — a clever little trap.",
          '咔嚓！Q赢了！西家的K根本没机会。这就是飞牌 —— 一个聪明的小陷阱。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Honest truth: here you could SEE the king sitting pretty. In a real game it's hidden, and the trap works half the time — 50%. If the king hides BEHIND the queen instead (in East's hand), East plays it after the queen and catches you. A smart guess, not a sure thing — and now you understand exactly what you're guessing about.",
          '说句实话：这次你能看见K好好地坐在那里。真正的牌局里它藏着，这个陷阱一半时间成功 —— 50%。如果K藏在Q的后面（在东家手里），东家会在Q之后打出它，把你抓住。这是聪明的猜测，不是稳赢 —— 而现在你完全明白自己在猜什么了。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Numbers worth remembering: with 5 cards missing out there, they usually split 3 and 2 (about 68 times in 100). With 4 missing, a 2-2 split happens about 41 times in 100. And the old proverb: '8 cards? Finesse! 9 or more? Play ace-king and let the queen drop.'",
          "几个数字值得记住：外面少5张牌时，通常分成3张和2张（100次里约68次）。少4张时，分成2张和2张大约41次。还有句老话：'8张牌就飞，9张以上打A和K，等Q自己掉下来。'"
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
          "Ha! Your baby 2 of spades just beat a 9! That's trump power. Size doesn't matter — suit does.",
          '哈！你小小的黑桃2刚刚打败了9！这就是将牌的威力。不看大小，看花色。'
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
          "North's ace grabbed it — biggest trump wins, as promised. You've got trump power now. Next: we learn to TALK — with bids.",
          '北家的A抓住了它 —— 说到做到，最大的将牌赢。将牌你已经会了。下一课：我们学"说话" —— 用叫牌。'
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
          "Before the cards fly, the players TALK. Not with words — with bids. Every bid is a little message to your partner: 'Hey, my hearts are great!'",
          '在打牌之前，玩家先"说话"。不是用嘴 —— 是用叫牌。每一个叫牌都是给搭档的小消息："嘿，我的红桃很棒！"'
        ),
      },
      {
        kind: 'info',
        text: T(
          'To talk well, count your strength — points! Ace = 4, king = 3, queen = 2, jack = 1. Add them up: that is how strong your hand is.',
          '想说得好，先数你的"力气" —— 点数！A=4点，K=3点，Q=2点，J=1点。加起来，就是你这手牌有多强。'
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
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: '1D' },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T(
              "East said 1♦. You've got 5 hearts — answer: 1 heart (1H)!",
              '东家说了1♦。你有5张红桃 —— 回答：1红桃 (1H)！'
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
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: '2D' },
          {
            seat: 'S', learner: true, expected: '2H',
            hint: T(
              'East pushed to 2♦. Say hearts again, louder: 2 hearts (2H)!',
              '东家加到2♦。把红桃再说一遍，大声点：2红桃 (2H)！'
            ),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          'Now everyone passes — three passes in a row stop the talk. The last bid becomes the contract: your team\'s promise. You promised 2♥.',
          '现在大家都pass了 —— 连续三次不叫，谈话结束。最后一个叫牌变成定约：你们队的承诺。你们承诺的是2♥。'
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
          "Dummy's job is the easiest in bridge: lay ALL your cards face-up on the table… and relax. The declarer plays both hands. From now on you'll see North's cards face-up — that's your dummy.",
          '明手的活儿是桥牌里最轻松的：把全部牌翻开摊在桌上……然后休息。庄家一个人打两手牌。从现在开始你会看到北家的牌翻开着 —— 那就是你的明手。'
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
          { seat: 'N', bid: '1D' },
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T(
              'Answer with your longest suit: 1 heart (1H).',
              '用你最长的花色回答：1红桃 (1H)。'
            ),
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
          { seat: 'N', bid: '1C' },
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T(
              'North opened 1♣. Answer with your longest suit: 1 heart (1H).',
              '北家开叫1♣。用你最长的花色回答：1红桃 (1H)。'
            ),
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: '2H' },
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: 'P',
            hint: T(
              'North raised to 2♥ — fit found (9 hearts together)! Your job is done: pass.',
              '北家加叫到2♥ —— 找到配合了（两家9张红桃）！你的任务完成了：不叫。'
            ),
          },
          { seat: 'W', bid: 'P' },
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
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: '1S' },
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
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: '2H',
            hint: T('Rebid your six hearts: 2♥.', '再叫你的6张红桃：2♥。'),
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: 'P' },
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
          'The contract is a promise: "We will win THIS many tricks." But how is the promise priced? Slowly, once: the first 6 tricks of every hand are FREE — a contract only counts the tricks ABOVE 6. 2♥ means 6 + 2 = 8 tricks. 4♥ means 6 + 4 = 10 tricks. Now the numbers will make sense.',
          '定约是一个承诺："我们会赢这么多墩。"但这个承诺怎么计价？慢慢说一次：每一副牌的前6墩是免费的 —— 定约只数6以上的墩。2♥就是6+2=8墩。4♥就是6+4=10墩。现在数字就说得通了。'
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
          'Now the magic line: if your contract itself scores 100 points or more, it is called GAME （成局） — and the game pays a fat bonus: +300 points on top! Do the math with me: 4♥ = 4 × 30 = 120. Over 100 — GAME. 3NT = 40 + 30 + 30 = 100. Exactly 100 — GAME. The game contracts are: 3NT, 4♥, 4♠, 5♣, 5♦. (Minors need 5 because 4 × 20 = 80 — not enough!)',
          '现在看神奇的线：如果你的定约本身达到100分或以上，就叫成局 —— 成局还有一份厚厚的奖励：额外+300分！跟我算：4♥ = 4 × 30 = 120。超过100 —— 成局。3NT = 40 + 30 + 30 = 100。正好100 —— 成局。成局的定约有：3NT、4♥、4♠、5♣、5♦。（小花色需要到5，因为4 × 20 = 80 —— 不够！）'
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
          'How do you know? Add BOTH hands\' points together. Years of bridge wisdom say: about 25 combined points makes game （25点进局）. Why 25? Game needs 9–10 tricks, and 25 of the 40 total points — almost two-thirds of all the strength at the table — usually builds those tricks. Under 25? Take the partscore and be happy.',
          '怎么知道？把两只手的点数加起来。多年的桥牌智慧说：两家合计约25点就能成局（25点进局）。为什么是25？成局需要9到10墩，而25点 —— 占全桌40点的将近三分之二 —— 通常足够搭起这些墩。不到25？拿下部分定约，开开心心就好。'
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
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: '2H' },
          { seat: 'E', bid: 'P' },
          {
            seat: 'S', learner: true, expected: '4H',
            hint: T(
              'Partner raised — hearts are shared! You hold 21 points. Jump straight to game: 4♥!',
              '搭档加叫了 —— 红桃是共享的！你有21点。直接跳到成局：4♥！'
            ),
          },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: 'P' },
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
          'Bidding after the enemy opens is an OVERCALL （争叫）. Why do it? Three reasons: your team might own this hand too; even if not, your bid steals their talking space; and it tells partner where your strength lives, in case THEY win the contract and must defend.',
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
          { seat: 'E', bid: '1D' },
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T('Overcall: 1♥ — your suit earns it!', '争叫：1♥ —— 你的花色配得上！'),
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
          'And North backed you up — 2♥! When partner supports an overcall, it is called ADVANCING. Why could North raise so happily? Look with the same checklist: North holds FOUR hearts for you — 9 together — and real points on top. Support plus points = advance.',
          '北家还挺了你 —— 2♥！搭档支持争叫，这叫进叫。北家为什么能挺得这么开心？用同一张清单看：北家有4张红桃帮你 —— 合起来9张 —— 上面还有真点数。支持加点数 = 进叫。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'The other team opened the hand — and your team walks away with the contract. That steal felt good, right? You have now learned the whole circle: play tricks, count winners, make a plan, use trump, talk with bids, answer, raise, rebid, hunt for game, and even jump into enemy auctions.',
          '对方开的局 —— 定约却被你们队拿走了。这种"偷"感觉很好吧？你现在已经学完了整个循环：打墩、数赢墩、做计划、用将牌、用叫牌对话、回答、加叫、再叫、猎逐成局，甚至抢进对方的叫牌。'
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
