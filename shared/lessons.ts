import { ACBL_CHAPTERS } from './chapters.js';
import { withForcingNotes } from './forcing-notes.js';
import { getContinuationLessons } from './continuation-lessons.js';
import { lessonReview } from './lesson-reviews.js';
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

const CONV_DEAL: Hands = makeHands({
  N: ['AS', 'QS', 'JS', '4S', '6S', '2H', '3H', '8D', '9D', 'TD', '4C', '5C', '6C'],
  E: ['KS', '8S', 'TS', '6H', '8H', '2D', '6D', 'JD', 'KD', '7C', '9C', 'JC', 'KC'],
  S: ['AH', 'KH', 'QH', 'JH', 'TH', '5H', '2S', '3S', '4D', '5D', 'AC', '2C', '3C'],
  W: ['5S', '7S', '9S', '4H', '7H', '9H', '3D', '7D', 'QD', 'AD', '8C', 'TC', 'QC'],
});

/** Lesson 8 deal: South declares 4♠ — a GAME contract. The two clues
 *  from the lesson are both on display: combined points 26 (South 17,
 *  North 9 — past the 25-point game line) and an 8-card spade fit
 *  (South 5 + North 3). Losers from South's long-trump hand: ♠0 ♥0
 *  (dummy's K-Q cover) ♦1 ♣2 = 3 — exactly the game budget. The enemy
 *  trumps split 4-1 (West T-9-4-3, East the 2), which is the whole
 *  point of the deal: five trumps are out, so drawing must not stop at
 *  three rounds — the queen, and then the JACK over West's 10, take a
 *  FOURTH round before the suit is safe. South's ♠A-K-Q-J-8 vs dummy's
 *  7-6-5 is exactly the holding that survives 4-1. Script pays the three
 *  losers (two clubs to West's A-K, one diamond to the Q) and lands
 *  exactly 10 tricks: 420 points non-vulnerable, vs 170 for the same 10
 *  tricks at 2♠. Simulator-verified (all 13 tricks replayed). */
const CONTRACT_DEAL: Hands = makeHands({
  N: ['7S', '6S', '5S', 'KH', 'QH', '6H', 'AD', '8D', '6D', '4D', '9C', '5C', '4C'],
  E: ['2S', '8H', '5H', '3H', '2H', 'TD', '7D', '2D', 'QC', 'JC', 'TC', '3C', '2C'],
  S: ['AS', 'KS', 'QS', 'JS', '8S', 'AH', '7H', '4H', 'KD', '9D', '5D', '8C', '6C'],
  W: ['TS', '9S', '4S', '3S', 'JH', 'TH', '9H', 'QD', 'JD', '3D', 'AC', 'KC', '7C'],
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
  | { kind: 'play'; script: RawPlayAction[]; runout?: boolean }
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

const RESPONSE_DEAL: Hands = makeHands({"N": ["5S", "2S", "QH", "9H", "8H", "6H", "AD", "9D", "3D", "AC", "KC", "TC", "5C"], "E": ["9S", "7H", "JS", "4D", "3H", "5D", "QC", "4C", "TD", "JC", "KS", "TS", "JD"], "S": ["8S", "7S", "3S", "AH", "KH", "JH", "5H", "4H", "7D", "2D", "8C", "7C", "6C"], "W": ["8D", "3C", "QS", "6S", "AS", "6D", "4S", "QD", "2C", "TH", "9C", "2H", "KD"]});

const OPENING_DEAL: Hands = makeHands({
  S: ["AS", "8S", "7S", "5S", "3S", "KH", "QH", "4H", "AD", "7D", "2D", "8C", "6C"],
  N: ["KS", "9S", "2S", "AH", "8H", "6H", "5D", "4D", "3D", "JC", "7C", "5C", "3C"],
  E: ["3H", "JD", "QC", "9D", "6S", "2H", "9C", "TH", "9H", "8D", "AC", "6D", "JS"],
  W: ["7H", "TC", "4C", "4S", "TS", "KC", "TD", "2C", "JH", "QS", "QD", "KD", "5H"],
});

const OVERCALL_DEAL: Hands = makeHands({
  S: ["AH", "KH", "QH", "JH", "5H", "AD", "7C", "6C", "5C", "4C", "3C", "5S", "3S"],
  N: ["9H", "8H", "7H", "6H", "QS", "JS", "4S", "4D", "3D", "2D", "8C", "KC", "QC"],
  E: ["AS", "KS", "9S", "7S", "TH", "4H", "KD", "QD", "JD", "TD", "9D", "JC", "2C"],
  W: ["TS", "8S", "6S", "2S", "3H", "2H", "8D", "7D", "6D", "5D", "TC", "9C", "AC"],
});


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
  { id: "strategy", title: T("Count and Plan", "数一数，做计划"), dealer: "N", hands: makeHands({"N": ["QS", "5S", "3S", "JH", "8H", "7H", "9D", "8D", "5D", "2D", "AC", "KC", "4C"], "E": ["JS", "TS", "TH", "6H", "5H", "KD", "TD", "7D", "6D", "9C", "7C", "3C", "2C"], "S": ["AS", "8S", "6S", "4S", "2S", "KH", "QH", "2H", "AD", "QD", "3D", "QC", "JC"], "W": ["KS", "9S", "7S", "AH", "9H", "4H", "3H", "JD", "4D", "TC", "8C", "6C", "5C"]}), contract: {"level": 1, "denom": "NT", "declarer": "S", "doubled": 0}, vulnerable: false, steps: [
{ kind: 'info', text: T("You are South, the declarer in 1NT; North is dummy, and you play both hands. West and East defend. The opening lead comes from declarer’s left before dummy is exposed. All hands are visible here for teaching; at the table the defenders’ cards are hidden.", "你是南家，做庄1NT；北家是明手，两手牌都由你打。东西防守。首攻由庄家左手方在明手摊牌前选择。这里四手明牌只为教学，真实牌桌上看不到防守方的暗牌。") },
{ kind: 'info', text: T("Count both hands together before playing. Spades give one top winner, hearts none yet, diamonds one, and clubs THREE with careful unblocking: ♣AK4 opposite ♣QJ. After the first club honor, lead the small club toward the other hand’s remaining honor before cashing the final top club. Four honors cannot make four tricks in a three-card suit, but they are not limited to two tricks either.", "出牌前合看两手。黑桃一个顶张赢墩，红桃暂时没有，方块一个，梅花通过解封可以拿三墩：♣AK4对♣QJ。第一轮大牌后，从一手出小梅花到另一手剩下的大牌，再兑现最后的顶张。四张大牌在最长三张的花色里不能拿四墩，但也不是只能拿两墩。") },
{ kind: 'info', text: T("So the top-winner count is 1 + 0 + 1 + 3 = 5. A 1NT contract needs seven. Look for extra tricks: lead from dummy toward ♦AQ to finesse the king, and lead a small spade from hand toward dummy’s queen. A finesse depends on the unseen honor’s position; it is a chance, not a guarantee.", "因此顶张赢墩是1 + 0 + 1 + 3 = 5，1NT需要七墩。寻找额外赢墩：从明手朝♦AQ这个坎张引牌，飞方块K；再从手中领小黑桃，朝明手Q飞牌。飞牌取决于暗牌大牌的位置，有机会，不是保证。") },
{ kind: 'info', text: T("The heart K, Q and J are secondary honors. Establish them by forcing out the ace, while keeping entries and side-suit stoppers. Driving out an ace is establishing a suit; ducking means deliberately playing low rather than winning. Do not confuse the two actions.", "红桃K、Q、J是次级大牌。保留进手和边花挡张，顶出A来树立它们。顶出A叫树立花色；忍让是有意跟小、暂时不拿。两种动作不要混称。") },
{ kind: 'info', text: T("Plan the order as well as the count: take the available finesses, establish hearts, and unblock clubs before their last entry disappears. When discarding, protect established winners and the cards needed to reach them.", "数墩以后还要安排次序：选择合适的飞牌，树立红桃，并在最后的进手消失前解封梅花。垫牌时保护已树立的赢墩，以及通往它们的进手。") },
{ kind: 'info', text: T("Useful guidelines: five missing cards divide 3–2 about 68% of the time; four missing divide 2–2 about 41%. “Eight ever, nine never” is only a starting guide when choosing whether to finesse a missing queen or play for a drop with the ace and king. Entries, safety and the auction can change the choice.", "参考概率：缺五张时，3–2分布约68%；缺四张时，2–2分布约41%。“八张飞、九张不飞”只是在有A、K而缺Q时，选择飞牌或击落的起步参考。进手、安全打法和叫牌信息都可能改变选择。") },
{ kind: 'play', script: [{ seat: "W", card: "5C" },
{ seat: "N", learner: true, expected: "KC", hint: T("Play KC.", "打出KC。") },
{ seat: "E", card: "2C" },
{ seat: "S", learner: true, expected: "JC", hint: T("Play JC.", "打出JC。") }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "2D", hint: T("Play 2D.", "打出2D。") },
{ seat: "E", card: "6D" },
{ seat: "S", learner: true, expected: "QD", hint: T("Play QD.", "打出QD。") },
{ seat: "W", card: "4D" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "2S", hint: T("Play 2S.", "打出2S。") },
{ seat: "W", card: "7S" },
{ seat: "N", learner: true, expected: "QS", hint: T("Play QS.", "打出QS。") },
{ seat: "E", card: "TS" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "3S", hint: T("Play 3S.", "打出3S。") },
{ seat: "E", card: "JS" },
{ seat: "S", learner: true, expected: "AS", hint: T("Play AS.", "打出AS。") },
{ seat: "W", card: "9S" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "KH", hint: T("Play KH.", "打出KH。") },
{ seat: "W", card: "3H" },
{ seat: "N", learner: true, expected: "7H", hint: T("Play 7H.", "打出7H。") },
{ seat: "E", card: "5H" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "QH", hint: T("Play QH.", "打出QH。") },
{ seat: "W", card: "AH" },
{ seat: "N", learner: true, expected: "8H", hint: T("Play 8H.", "打出8H。") },
{ seat: "E", card: "6H" }] },
{ kind: 'play', script: [{ seat: "W", card: "4H" },
{ seat: "N", learner: true, expected: "JH", hint: T("Play JH.", "打出JH。") },
{ seat: "E", card: "TH" },
{ seat: "S", learner: true, expected: "2H", hint: T("Play 2H.", "打出2H。") }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "4C", hint: T("Play 4C.", "打出4C。") },
{ seat: "E", card: "3C" },
{ seat: "S", learner: true, expected: "QC", hint: T("Play QC.", "打出QC。") },
{ seat: "W", card: "6C" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "4S", hint: T("Play 4S.", "打出4S。") },
{ seat: "W", card: "KS" },
{ seat: "N", learner: true, expected: "5S", hint: T("Play 5S.", "打出5S。") },
{ seat: "E", card: "7D" }] },
{ kind: 'play', script: [{ seat: "W", card: "9H" },
{ seat: "N", learner: true, expected: "5D", hint: T("Play 5D.", "打出5D。") },
{ seat: "E", card: "7C" },
{ seat: "S", learner: true, expected: "3D", hint: T("Play 3D.", "打出3D。") }] },
{ kind: 'play', script: [{ seat: "W", card: "8C" },
{ seat: "N", learner: true, expected: "AC", hint: T("Play AC.", "打出AC。") },
{ seat: "E", card: "9C" },
{ seat: "S", learner: true, expected: "6S", hint: T("Play 6S.", "打出6S。") }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "8D", hint: T("Play 8D.", "打出8D。") },
{ seat: "E", card: "TD" },
{ seat: "S", learner: true, expected: "AD", hint: T("Play AD.", "打出AD。") },
{ seat: "W", card: "JD" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "8S", hint: T("Play 8S.", "打出8S。") },
{ seat: "W", card: "TC" },
{ seat: "N", learner: true, expected: "9D", hint: T("Play 9D.", "打出9D。") },
{ seat: "E", card: "KD" }] },
{ kind: 'info', text: T("The full line takes ten tricks: three spades, two hearts, two diamonds and three clubs. The lesson is to count honestly, take appropriate finesses, establish secondary honors and preserve entries. A winner stranded in the other hand is not yet a cashable trick.", "完整路线拿到十墩：黑桃三、红桃二、方块二、梅花三。重点是正确数墩、选择合适的飞牌、树立次级大牌并保留进手。被堵在另一手的大牌，还不等于能够兑现的赢墩。") },
{ kind: 'result' }
] },
  { id: "long-suits", title: T("Establish the Long Suit", "无将树立长套"), dealer: "N", hands: makeHands({"N": ["KS", "QS", "3S", "2S", "8H", "5H", "4H", "5D", "4D", "3D", "7C", "6C", "5C"], "E": ["TS", "7S", "6S", "JH", "TH", "9H", "3H", "2H", "TD", "TC", "4C", "3C", "2C"], "S": ["AS", "5S", "4S", "7H", "6H", "AD", "KD", "9D", "8D", "7D", "6D", "AC", "KC"], "W": ["JS", "9S", "8S", "AH", "KH", "QH", "QD", "JD", "2D", "QC", "JC", "9C", "8C"]}), contract: {"level": 3, "denom": "NT", "declarer": "S", "doubled": 0}, vulnerable: false, steps: [
{ kind: 'info', text: T("South declares 3NT and needs nine tricks. Your six diamonds face three in dummy, so only four are missing. Establishing a long suit means removing those opposing cards, then cashing the small cards that remain.", "南家打3NT，需要九墩。手中六张方块，明手三张，外面只缺四张。树立长套，就是先清除对方这些牌，再兑现留下的小牌。") },
{ kind: 'info', text: T("West cashes three hearts. Follow while you can, then discard a small spade. Keep all six diamonds and both club stoppers. West can now attack clubs normally; your ♣AK gives two stops, so the plan does not depend on a helpful defensive switch.", "西家先兑现三轮红桃。有红桃就跟，缺门后垫一张小黑桃。保留六张方块和梅花两个挡张。西家随后可以正常进攻梅花；手中的♣AK能挡两轮，计划不依赖防守方帮忙转攻。") },
{ kind: 'info', text: T("Win the club switch, cash the ace of diamonds and king, and count the cards that fall. The remaining queen must win once: lead a small diamond to drive it out. Keep the second club stopper as the entry back to your established diamonds.", "拿住梅花转攻，兑现方块A、K，数清落下的牌。剩下的Q必须让它赢一次：领一张小方块把它顶出。保留第二个梅花挡张，作为回手兑现已树立方块的进手。") },
{ kind: 'play', script: [{ seat: "W", card: "AH" },
{ seat: "N", learner: true, expected: "4H", hint: T("Play 4H.", "打出4H。") },
{ seat: "E", card: "2H" },
{ seat: "S", learner: true, expected: "6H", hint: T("Play 6H.", "打出6H。") }] },
{ kind: 'play', script: [{ seat: "W", card: "KH" },
{ seat: "N", learner: true, expected: "5H", hint: T("Play 5H.", "打出5H。") },
{ seat: "E", card: "3H" },
{ seat: "S", learner: true, expected: "7H", hint: T("Play 7H.", "打出7H。") }] },
{ kind: 'play', script: [{ seat: "W", card: "QH" },
{ seat: "N", learner: true, expected: "8H", hint: T("Play 8H.", "打出8H。") },
{ seat: "E", card: "9H" },
{ seat: "S", learner: true, expected: "4S", hint: T("Play 4S.", "打出4S。") }] },
{ kind: 'play', script: [{ seat: "W", card: "QC" },
{ seat: "N", learner: true, expected: "5C", hint: T("Play 5C.", "打出5C。") },
{ seat: "E", card: "2C" },
{ seat: "S", learner: true, expected: "AC", hint: T("Play AC.", "打出AC。") }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "AD", hint: T("Play AD.", "打出AD。") },
{ seat: "W", card: "2D" },
{ seat: "N", learner: true, expected: "3D", hint: T("Play 3D.", "打出3D。") },
{ seat: "E", card: "TD" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "KD", hint: T("Play KD.", "打出KD。") },
{ seat: "W", card: "JD" },
{ seat: "N", learner: true, expected: "4D", hint: T("Play 4D.", "打出4D。") },
{ seat: "E", card: "4C" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "6D", hint: T("Play 6D.", "打出6D。") },
{ seat: "W", card: "QD" },
{ seat: "N", learner: true, expected: "5D", hint: T("Play 5D.", "打出5D。") },
{ seat: "E", card: "3C" }] },
{ kind: 'play', script: [{ seat: "W", card: "9C" },
{ seat: "N", learner: true, expected: "6C", hint: T("Play 6C.", "打出6C。") },
{ seat: "E", card: "TC" },
{ seat: "S", learner: true, expected: "KC", hint: T("Play KC.", "打出KC。") }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "9D", hint: T("Play 9D.", "打出9D。") },
{ seat: "W", card: "8S" },
{ seat: "N", learner: true, expected: "2S", hint: T("Play 2S.", "打出2S。") },
{ seat: "E", card: "6S" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "8D", hint: T("Play 8D.", "打出8D。") },
{ seat: "W", card: "JS" },
{ seat: "N", learner: true, expected: "7C", hint: T("Play 7C.", "打出7C。") },
{ seat: "E", card: "7S" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "7D", hint: T("Play 7D.", "打出7D。") },
{ seat: "W", card: "JC" },
{ seat: "N", learner: true, expected: "3S", hint: T("Play 3S.", "打出3S。") },
{ seat: "E", card: "TS" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "AS", hint: T("Play AS.", "打出AS。") },
{ seat: "W", card: "9S" },
{ seat: "N", learner: true, expected: "QS", hint: T("Play QS.", "打出QS。") },
{ seat: "E", card: "TH" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "5S", hint: T("Play 5S.", "打出5S。") },
{ seat: "W", card: "8C" },
{ seat: "N", learner: true, expected: "KS", hint: T("Play KS.", "打出KS。") },
{ seat: "E", card: "JH" }] },
{ kind: 'info', text: T("Nine tricks: five diamonds, two clubs and two spades. The small spade discarded on the third heart was expendable; throwing away a diamond or the second club stopper would damage the plan. Count length, protect entries, then cash the established suit.", "九墩来自五墩方块、两墩梅花、两墩黑桃。第三轮红桃垫掉的小黑桃可以舍弃；若垫方块或第二个梅花挡张，就会破坏计划。数长套、护进手，再兑现树立好的花色。") },
{ kind: 'result' }
] },
  { id: "trump", title: T("Trump Power", "将牌的威力"), dealer: "N", hands: makeHands({"N": ["2D", "3D", "5D", "7D", "2H", "3H", "4H", "AS", "KS", "QS", "8S", "AD", "KD"], "E": ["3S", "5H", "6H", "7H", "8H", "9H", "TH", "JH", "9D", "JD", "QD", "2C", "3C"], "S": ["2S", "5S", "7S", "AC", "KC", "QC", "JC", "TC", "9C", "8C", "7C", "6C", "5C"], "W": ["4D", "6D", "8D", "TD", "AH", "KH", "QH", "4C", "9S", "TS", "JS", "4S", "6S"]}), contract: {"level": 2, "denom": "S", "declarer": "S", "doubled": 0}, vulnerable: false, steps: [
{ kind: 'info', text: T("Spades are trumps. You must follow the led suit when you have it; only when void may you ruff. Your small trump can beat a side-suit ace. A discard is legal too, so choose according to the plan rather than ruffing automatically.", "黑桃是将牌。有领出花色必须跟；缺门时才可以将吃。小将牌也能压过边花A。缺门时也可以垫牌，所以要按计划选择，不能机械地逢缺就将吃。") },
{ kind: 'info', text: T("West leads a diamond and South is void: ruff with a small spade. Next cash a winning club. Dummy is void in clubs, but partner’s ace already wins: discard a heart loser instead of ruffing your own winner or spending a trump without a purpose.", "西家领方块，南家缺门：用小黑桃将吃。接着兑现梅花赢张。明手虽然没有梅花，但搭档的A已经能赢，应垫掉红桃输牌，不要将吃己方赢张，也不要无目的地消耗将牌。") },
{ kind: 'play', script: [{ seat: "W", card: "4D" },
{ seat: "N", learner: true, expected: "2D", hint: T("Play 2D.", "打出2D。") },
{ seat: "E", card: "9D" },
{ seat: "S", learner: true, expected: "2S", hint: T("Play 2S.", "打出2S。") }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "AC", hint: T("Play AC.", "打出AC。") },
{ seat: "W", card: "4C" },
{ seat: "N", learner: true, expected: "2H", hint: T("Play 2H.", "打出2H。") },
{ seat: "E", card: "2C" }] },
{ kind: 'info', text: T("Trump is a tool: ruff an opposing winner when useful, discard a loser on partner’s winner, and retain trumps for the jobs that remain.", "将牌是工具：需要时将吃对方赢张，在搭档赢张上垫输牌，把将牌留给后续真正需要的工作。") }
] },
  { id: "losers", title: T("Count Your Losers", "有将数输墩"), dealer: "N", hands: makeHands({"N": ["JS", "9S", "5S", "KH", "4H", "AD", "KD", "7D", "4D", "9C", "8C", "7C", "5C"], "E": ["6S", "2S", "TH", "7H", "6H", "3H", "TD", "8D", "2D", "QC", "JC", "TC", "3C"], "S": ["AS", "KS", "QS", "7S", "4S", "AH", "8H", "5H", "2H", "9D", "6D", "3D", "6C"], "W": ["TS", "8S", "3S", "QH", "JH", "9H", "QD", "JD", "5D", "AC", "KC", "4C", "2C"]}), contract: {"level": 4, "denom": "S", "declarer": "S", "doubled": 0}, vulnerable: false, steps: [
{ kind: 'info', text: T("South declares 4♠, needing ten tricks; at most three tricks may be lost. Count from the long-trump hand: the top spades have no immediate loser, dummy’s king of hearts covers one small heart, the ace of diamonds and king cover two small diamonds, and the singleton club is a loser. This starting budget is a plan, not an instruction to donate three tricks.", "南家打4♠，需要十墩，最多能输三墩。从长将牌一手数：顶张黑桃没有立即的输墩，明手红桃K可补一个小红桃，方块A、K可补两个小方块，单张梅花是输牌。这份起始预算是计划，不是要求主动送出三墩。") },
{ kind: 'info', text: T("Draw one round, use dummy’s king of hearts as an entry, and work on diamonds before that entry is lost. A small diamond may become a winner when the opposing honors fall. Do not mechanically draw every trump before checking what the side suits and entries can provide.", "先清一轮将牌，利用明手红桃K进手，在进手消失前处理方块。对方大牌落下后，小方块也可能成为赢张。不要机械地清光所有将牌，先检查边花与进手还能提供什么。") },
{ kind: 'info', text: T("When dummy’s fourth diamond is established, discard your club loser on it. If dummy’s trump already wins a trick, follow with a small trump from hand rather than covering it with a high one. Keep the remaining trumps to ruff club attacks.", "明手第四张方块树立后，在它上面垫掉梅花输牌。若明手的将牌已经能赢，手中就跟小将牌，不要再压一张大将牌。保留剩下的将牌，将吃对方的梅花进攻。") },
{ kind: 'play', script: [{ seat: "W", card: "QH" },
{ seat: "N", learner: true, expected: "4H", hint: T("Play 4H.", "打出4H。") },
{ seat: "E", card: "3H" },
{ seat: "S", learner: true, expected: "AH", hint: T("Play AH.", "打出AH。") }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "AS", hint: T("Play AS.", "打出AS。") },
{ seat: "W", card: "3S" },
{ seat: "N", learner: true, expected: "5S", hint: T("Play 5S.", "打出5S。") },
{ seat: "E", card: "2S" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "2H", hint: T("Play 2H.", "打出2H。") },
{ seat: "W", card: "9H" },
{ seat: "N", learner: true, expected: "KH", hint: T("Play KH.", "打出KH。") },
{ seat: "E", card: "TH" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "AD", hint: T("Play AD.", "打出AD。") },
{ seat: "E", card: "2D" },
{ seat: "S", learner: true, expected: "3D", hint: T("Play 3D.", "打出3D。") },
{ seat: "W", card: "5D" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "KD", hint: T("Play KD.", "打出KD。") },
{ seat: "E", card: "8D" },
{ seat: "S", learner: true, expected: "6D", hint: T("Play 6D.", "打出6D。") },
{ seat: "W", card: "JD" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "7D", hint: T("Play 7D.", "打出7D。") },
{ seat: "E", card: "TD" },
{ seat: "S", learner: true, expected: "9D", hint: T("Play 9D.", "打出9D。") },
{ seat: "W", card: "QD" }] },
{ kind: 'play', script: [{ seat: "W", card: "8S" },
{ seat: "N", learner: true, expected: "9S", hint: T("Play 9S.", "打出9S。") },
{ seat: "E", card: "6S" },
{ seat: "S", learner: true, expected: "4S", hint: T("Play 4S.", "打出4S。") }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "JS", hint: T("Play JS.", "打出JS。") },
{ seat: "E", card: "6H" },
{ seat: "S", learner: true, expected: "7S", hint: T("Play 7S.", "打出7S。") },
{ seat: "W", card: "TS" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "4D", hint: T("Play 4D.", "打出4D。") },
{ seat: "E", card: "3C" },
{ seat: "S", learner: true, expected: "6C", hint: T("Play 6C.", "打出6C。") },
{ seat: "W", card: "AC" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "5C", hint: T("Play 5C.", "打出5C。") },
{ seat: "E", card: "TC" },
{ seat: "S", learner: true, expected: "KS", hint: T("Play KS.", "打出KS。") },
{ seat: "W", card: "KC" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "5H", hint: T("Play 5H.", "打出5H。") },
{ seat: "W", card: "JH" },
{ seat: "N", learner: true, expected: "7C", hint: T("Play 7C.", "打出7C。") },
{ seat: "E", card: "7H" }] },
{ kind: 'play', script: [{ seat: "W", card: "2C" },
{ seat: "N", learner: true, expected: "8C", hint: T("Play 8C.", "打出8C。") },
{ seat: "E", card: "QC" },
{ seat: "S", learner: true, expected: "QS", hint: T("Play QS.", "打出QS。") }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "8H", hint: T("Play 8H.", "打出8H。") },
{ seat: "W", card: "4C" },
{ seat: "N", learner: true, expected: "9C", hint: T("Play 9C.", "打出9C。") },
{ seat: "E", card: "JC" }] },
{ kind: 'info', text: T("The line takes eleven tricks, losing only one diamond and one heart. Three losers were the permitted maximum, not a quota. Count, plan and improve the result when an established winner lets you discard a loser.", "这条路线拿到十一墩，只输一墩方块和一墩红桃。三墩是允许输掉的上限，不是必须完成的指标。先数墩做计划，有树立好的赢张可垫输牌时，就争取更好的结果。") },
{ kind: 'result' }
] },
  { id: "eliminate", title: T("Make Losers Vanish", "输墩消去"), dealer: "N", hands: makeHands({"N": ["AS", "9S", "8S", "6S", "9H", "8H", "5H", "4H", "9D", "TD", "5D", "AC", "KC"], "E": ["JS", "TS", "4S", "3S", "2H", "KD", "JD", "TC", "8C", "7C", "6C", "5C", "3C"], "S": ["7S", "5S", "2S", "AH", "KH", "QH", "JH", "6H", "3H", "8D", "6D", "4D", "2D"], "W": ["KS", "QS", "TH", "7H", "AD", "QD", "7D", "3D", "QC", "JC", "9C", "4C", "2C"]}), contract: {"level": 4, "denom": "H", "declarer": "S", "doubled": 0}, vulnerable: false, steps: [
{ kind: 'info', text: T("South declares 4♥. Count the jobs from South’s six-card heart suit: two small spades need cover or discards, and four small diamonds need handling. Dummy’s ace of clubs and king can discard both spade losers. A later diamond ruff in dummy can remove another loser: discarding and short-hand ruffing work together.", "南家打4♥。从南家六张红桃一手安排任务：两张小黑桃需要垫掉，四张小方块也要处理。明手梅花A、K可垫掉两张黑桃输牌；之后用明手将牌将吃一张方块，还能消去一个输墩。垫输牌与短将牌一手将吃要配合使用。") },
{ kind: 'info', text: T("Dummy has four hearts, so drawing the opponents’ two rounds need not remove every dummy trump. Keep one for the fourth diamond. Use the remaining hearts as entries when needed, cash the two club winners for spade discards, and do not ruff a club that is already winning for your partnership.", "明手有四张红桃，清对方两轮将牌，不等于把明手将牌全部用光。为第四轮方块保留一张。必要时用其余将牌进手，兑现两张梅花赢张垫黑桃；己方梅花已经赢时，不要再将吃它。") },
{ kind: 'info', text: T("A related technique is a ruffing finesse: for example, K-Q-J in dummy opposite a void. Lead an honor through the defender before the void; if the ace appears, ruff, otherwise consider discarding a loser. Unlike today’s ace of clubs and king, these honors are not guaranteed winners until the ace’s position has been tested.", "相关技巧是将吃飞牌：另举一个组合，明手K-Q-J，对面缺门。从明手领大牌，穿过缺门方前面的防守者；A出现可将吃，否则可考虑垫输牌。这种大牌与本副梅花A、K不同，在确认A的位置前，不能当成保证赢墩。") },
{ kind: 'play', script: [{ seat: "W", card: "KS" },
{ seat: "N", learner: true, expected: "AS", hint: T("Play AS.", "打出AS。") },
{ seat: "E", card: "4S" },
{ seat: "S", learner: true, expected: "2S", hint: T("Play 2S.", "打出2S。") }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "KC", hint: T("Play KC.", "打出KC。") },
{ seat: "E", card: "5C" },
{ seat: "S", learner: true, expected: "7S", hint: T("Play 7S.", "打出7S。") },
{ seat: "W", card: "2C" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "4H", hint: T("Play 4H.", "打出4H。") },
{ seat: "E", card: "2H" },
{ seat: "S", learner: true, expected: "JH", hint: T("Play JH.", "打出JH。") },
{ seat: "W", card: "7H" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "AH", hint: T("Play AH.", "打出AH。") },
{ seat: "W", card: "TH" },
{ seat: "N", learner: true, expected: "5H", hint: T("Play 5H.", "打出5H。") },
{ seat: "E", card: "8C" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "3H", hint: T("Play 3H.", "打出3H。") },
{ seat: "W", card: "4C" },
{ seat: "N", learner: true, expected: "8H", hint: T("Play 8H.", "打出8H。") },
{ seat: "E", card: "JS" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "AC", hint: T("Play AC.", "打出AC。") },
{ seat: "E", card: "3C" },
{ seat: "S", learner: true, expected: "5S", hint: T("Play 5S.", "打出5S。") },
{ seat: "W", card: "9C" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "9D", hint: T("Play 9D.", "打出9D。") },
{ seat: "E", card: "KD" },
{ seat: "S", learner: true, expected: "4D", hint: T("Play 4D.", "打出4D。") },
{ seat: "W", card: "3D" }] },
{ kind: 'play', script: [{ seat: "E", card: "JD" },
{ seat: "S", learner: true, expected: "6D", hint: T("Play 6D.", "打出6D。") },
{ seat: "W", card: "7D" },
{ seat: "N", learner: true, expected: "5D", hint: T("Play 5D.", "打出5D。") }] },
{ kind: 'play', script: [{ seat: "E", card: "3S" },
{ seat: "S", learner: true, expected: "6H", hint: T("Play 6H.", "打出6H。") },
{ seat: "W", card: "QS" },
{ seat: "N", learner: true, expected: "6S", hint: T("Play 6S.", "打出6S。") }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "8D", hint: T("Play 8D.", "打出8D。") },
{ seat: "W", card: "QD" },
{ seat: "N", learner: true, expected: "TD", hint: T("Play TD.", "打出TD。") },
{ seat: "E", card: "TS" }] },
{ kind: 'play', script: [{ seat: "W", card: "JC" },
{ seat: "N", learner: true, expected: "8S", hint: T("Play 8S.", "打出8S。") },
{ seat: "E", card: "6C" },
{ seat: "S", learner: true, expected: "KH", hint: T("Play KH.", "打出KH。") }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "2D", hint: T("Play 2D.", "打出2D。") },
{ seat: "W", card: "AD" },
{ seat: "N", learner: true, expected: "9H", hint: T("Play 9H.", "打出9H。") },
{ seat: "E", card: "7C" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "9S", hint: T("Play 9S.", "打出9S。") },
{ seat: "E", card: "TC" },
{ seat: "S", learner: true, expected: "QH", hint: T("Play QH.", "打出QH。") },
{ seat: "W", card: "QC" }] },
{ kind: 'info', text: T("4♥ makes exactly ten tricks. Two club winners removed two spade losers; dummy’s last heart ruffed the fourth diamond. Three earlier diamond tricks were lost. Preserve the particular trumps needed for ruffs rather than following an automatic draw-all-trumps rule.", "4♥正好拿十墩。两张梅花赢张消去了两个黑桃输墩，明手最后一张红桃将吃了第四轮方块；前三轮方块输掉三墩。要保留承担将吃任务的将牌，不能机械地全部清光。") },
{ kind: 'result' }
] },
  { id: "defense-leads", title: T("Defense I: The Opening Lead", "防守一：首攻"), dealer: "N", hands: makeHands({"N": ["TS", "8S", "6S", "QH", "9H", "6H", "2H", "KD", "JC", "9C", "7C", "3C", "4C"], "E": ["KS", "QS", "JS", "AH", "7H", "8D", "7D", "6D", "5D", "4D", "6C", "5C", "2C"], "S": ["9S", "7S", "4S", "JH", "5H", "3H", "AD", "QD", "JD", "9D", "2D", "KC", "QC"], "W": ["AS", "5S", "3S", "2S", "KH", "TH", "8H", "4H", "TD", "3D", "AC", "TC", "8C"]}), contract: {"level": 3, "denom": "NT", "declarer": "S", "doubled": 0}, vulnerable: false, steps: [
{ kind: 'info', text: T("You are West defending 3NT. Choose the opening lead from your own hand and the auction, before seeing dummy: ♥K-T-8-4 is your longest suit, so the fourth-best four is a natural lead. A sequence normally calls for its top card instead.", "你是西家，防守3NT。首攻时只能根据自己的牌与叫牌，明手还未摊开。♥K-T-8-4是最长套，从第四张4首攻是自然选择；有连张时通常领最大的一张。") },
{ kind: 'info', text: T("After partner wins the ace and returns a heart, take the king. Look at dummy before switching. A low spade toward partner can establish the suit; partner follows with the cheapest of touching honors that will win. Keep your ace as a later entry and avoid cashing it on partner’s winning honor.", "搭档A拿住再回红桃后，用K拿下。转攻前看明手。领小黑桃给搭档，可以树立花色；搭档跟足够赢墩的最小连张。保留A作后续进手，不要把它压在搭档已经能赢的大牌上。") },
{ kind: 'play', script: [{ seat: "W", learner: true, expected: "4H", hint: T("Play 4H.", "打出4H。") },
{ seat: "N", card: "6H" },
{ seat: "E", card: "AH" },
{ seat: "S", card: "3H" }] },
{ kind: 'play', script: [{ seat: "E", card: "7H" },
{ seat: "S", card: "JH" },
{ seat: "W", learner: true, expected: "KH", hint: T("Play KH.", "打出KH。") },
{ seat: "N", card: "2H" }] },
{ kind: 'play', script: [{ seat: "W", learner: true, expected: "2S", hint: T("Play 2S.", "打出2S。") },
{ seat: "N", card: "6S" },
{ seat: "E", card: "JS" },
{ seat: "S", card: "4S" }] },
{ kind: 'play', script: [{ seat: "E", card: "KS" },
{ seat: "S", card: "7S" },
{ seat: "W", learner: true, expected: "3S", hint: T("Play 3S.", "打出3S。") },
{ seat: "N", card: "8S" }] },
{ kind: 'play', script: [{ seat: "E", card: "QS" },
{ seat: "S", card: "9S" },
{ seat: "W", learner: true, expected: "5S", hint: T("Play 5S.", "打出5S。") },
{ seat: "N", card: "TS" }] },
{ kind: 'play', script: [{ seat: "E", card: "4D" },
{ seat: "S", card: "9D" },
{ seat: "W", learner: true, expected: "3D", hint: T("Play 3D.", "打出3D。") },
{ seat: "N", card: "KD" }] },
{ kind: 'play', script: [{ seat: "N", card: "3C" },
{ seat: "E", card: "2C" },
{ seat: "S", card: "QC" },
{ seat: "W", learner: true, expected: "AC", hint: T("Play AC.", "打出AC。") }] },
{ kind: 'play', script: [{ seat: "W", learner: true, expected: "AS", hint: T("Play AS.", "打出AS。") },
{ seat: "N", card: "4C" },
{ seat: "E", card: "5C" },
{ seat: "S", card: "2D" }] },
{ kind: 'play', script: [{ seat: "W", learner: true, expected: "TH", hint: T("Play TH.", "打出TH。") },
{ seat: "N", card: "QH" },
{ seat: "E", card: "6C" },
{ seat: "S", card: "5H" }] },
{ kind: 'play', script: [{ seat: "N", card: "7C" },
{ seat: "E", card: "5D" },
{ seat: "S", card: "KC" },
{ seat: "W", learner: true, expected: "8C", hint: T("Play 8C.", "打出8C。") }] },
{ kind: 'play', script: [{ seat: "S", card: "AD" },
{ seat: "W", learner: true, expected: "TD", hint: T("Play TD.", "打出TD。") },
{ seat: "N", card: "9H" },
{ seat: "E", card: "6D" }] },
{ kind: 'play', runout: true, script: [{ seat: "S", card: "QD" },
{ seat: "W", learner: true, expected: "TC", hint: T("Play TC.", "打出TC。") },
{ seat: "N", card: "JC" },
{ seat: "E", card: "7D" }] },
{ kind: 'play', runout: true, script: [{ seat: "S", card: "JD" },
{ seat: "W", learner: true, expected: "8H", hint: T("Play 8H.", "打出8H。") },
{ seat: "N", card: "9C" },
{ seat: "E", card: "8D" }] },
{ kind: 'info', text: T("The defense takes seven tricks and defeats 3NT by three. Select a sensible opening lead, communicate through returns and switches, and preserve the entries needed to cash the partnership’s winners.", "防守方拿七墩，3NT宕三。选择合理首攻，通过回牌与转攻沟通，保留兑现联手赢墩所需的进手。") },
{ kind: 'result' }
] },
  { id: "defense-play", title: T("Defense II: Play With Partner", "防守二：配合出牌"), dealer: "N", hands: makeHands({"N": ["7S", "5S", "8H", "5H", "2H", "JD", "6D", "2D", "KC", "8C", "7C", "9H", "TS"], "E": ["9S", "4S", "KH", "4H", "3H", "QD", "TD", "5D", "QC", "TC", "3C", "JH", "JS"], "S": ["AS", "KS", "QS", "8S", "6S", "AH", "TH", "AD", "8D", "3D", "JC", "9C", "2C"], "W": ["3S", "2S", "QH", "7H", "6H", "KD", "9D", "7D", "4D", "AC", "6C", "5C", "4C"]}), contract: {"level": 4, "denom": "S", "declarer": "S", "doubled": 0}, vulnerable: false, steps: [
{ kind: 'info', text: T("You are East defending 4♠. Partner leads a small heart; dummy plays low. Third hand high: play the king to force declarer’s ace and help promote partner’s queen. Once declarer wins, follow the play from your own hand, dummy and the cards already seen.", "你是东家，防守4♠。搭档领小红桃，明手跟小。第三家出大：用K逼出庄家A，帮助提升搭档Q。庄家拿住后，要根据自己手牌、明手和已出现的牌继续判断。") },
{ kind: 'info', text: T("When dummy’s king of clubs already wins and your queen cannot beat it, fourth hand low: follow with the three and keep the queen. Later dummy leads the jack of diamonds. Cover with your queen because it forces the ace and promotes your 10 above the remaining visible small diamonds.", "明手梅花K已经能赢，你的Q又压不过它时，第四家出小：跟3，保留Q。之后明手领方块J，要用Q盖，因为这会逼出A，让你的10高于可见的其余小方块。") },
{ kind: 'info', text: T("Covering an honor is a promotion decision, not an automatic command. Ask what lower card the cover can establish. Do not cover merely to spend a larger card, and do not play a second winner on partner’s winner without a useful reason.", "盖大牌是提升赢墩的判断，不是自动命令。先问：盖牌能树立哪张更小的牌？不能只因自己有大牌就压上去，也不要无目的地在搭档赢张上再花一张赢张。") },
{ kind: 'play', script: [{ seat: "W", card: "6H" },
{ seat: "N", card: "2H" },
{ seat: "E", learner: true, expected: "KH", hint: T("Play KH.", "打出KH。") },
{ seat: "S", card: "AH" }] },
{ kind: 'play', script: [{ seat: "S", card: "AS" },
{ seat: "W", card: "2S" },
{ seat: "N", card: "5S" },
{ seat: "E", learner: true, expected: "4S", hint: T("Play 4S.", "打出4S。") }] },
{ kind: 'play', script: [{ seat: "S", card: "KS" },
{ seat: "W", card: "3S" },
{ seat: "N", card: "7S" },
{ seat: "E", learner: true, expected: "9S", hint: T("Play 9S.", "打出9S。") }] },
{ kind: 'play', script: [{ seat: "S", card: "2C" },
{ seat: "W", card: "4C" },
{ seat: "N", card: "KC" },
{ seat: "E", learner: true, expected: "3C", hint: T("Play 3C.", "打出3C。") }] },
{ kind: 'play', script: [{ seat: "N", card: "JD" },
{ seat: "E", learner: true, expected: "QD", hint: T("Play QD.", "打出QD。") },
{ seat: "S", card: "AD" },
{ seat: "W", card: "4D" }] },
{ kind: 'play', script: [{ seat: "S", card: "QS" },
{ seat: "W", card: "6C" },
{ seat: "N", card: "TS" },
{ seat: "E", learner: true, expected: "JS", hint: T("Play JS.", "打出JS。") }] },
{ kind: 'play', script: [{ seat: "S", card: "TH" },
{ seat: "W", card: "QH" },
{ seat: "N", card: "5H" },
{ seat: "E", learner: true, expected: "3H", hint: T("Play 3H.", "打出3H。") }] },
{ kind: 'play', script: [{ seat: "W", card: "7D" },
{ seat: "N", card: "6D" },
{ seat: "E", learner: true, expected: "TD", hint: T("Play TD.", "打出TD。") },
{ seat: "S", card: "8D" }] },
{ kind: 'play', script: [{ seat: "E", learner: true, expected: "5D", hint: T("Play 5D.", "打出5D。") },
{ seat: "S", card: "3D" },
{ seat: "W", card: "9D" },
{ seat: "N", card: "2D" }] },
{ kind: 'play', script: [{ seat: "W", card: "KD" },
{ seat: "N", card: "7C" },
{ seat: "E", learner: true, expected: "TC", hint: T("Play TC.", "打出TC。") },
{ seat: "S", card: "9C" }] },
{ kind: 'play', script: [{ seat: "W", card: "AC" },
{ seat: "N", card: "8C" },
{ seat: "E", learner: true, expected: "QC", hint: T("Play QC.", "打出QC。") },
{ seat: "S", card: "JC" }] },
{ kind: 'play', runout: true, script: [{ seat: "W", card: "5C" },
{ seat: "N", card: "8H" },
{ seat: "E", learner: true, expected: "4H", hint: T("Play 4H.", "打出4H。") },
{ seat: "S", card: "6S" }] },
{ kind: 'play', runout: true, script: [{ seat: "S", card: "8S" },
{ seat: "W", card: "7H" },
{ seat: "N", card: "9H" },
{ seat: "E", learner: true, expected: "JH", hint: T("Play JH.", "打出JH。") }] },
{ kind: 'info', text: T("The defense wins five tricks: the queen of hearts, three diamonds and the ace of clubs. Declarer makes eight, so 4♠ is down two. The queen of diamonds’s cover created a trick for the 10; cooperation, not mechanical slogans, produced the defeat.", "防守方赢五墩：红桃Q、三墩方块和梅花A。庄家拿八墩，4♠宕二。方块Q盖牌帮助10成为赢张；打宕靠的是合作，而不是机械背口诀。") },
{ kind: 'result' }
] },
  { id: "defense-rules", title: T("Defense III: Three Rules, One Deal", "防守三：三条法则，一副牌"), dealer: "W", hands: makeHands({"N": ["9S", "8S", "6S", "5S", "AH", "QH", "6H", "8D", "4D", "2D", "AC", "6C", "3C"], "E": ["TS", "3S", "2S", "8H", "7H", "4H", "7D", "5D", "3D", "TC", "4C", "9D", "QC"], "S": ["AS", "4S", "5H", "3H", "2H", "AD", "KD", "QD", "JD", "7C", "2C", "9C", "JC"], "W": ["KS", "QS", "JS", "7S", "KH", "JH", "TH", "9H", "TD", "6D", "KC", "8C", "5C"]}), contract: {"level": 3, "denom": "NT", "declarer": "S", "doubled": 0}, vulnerable: false, steps: [
{ kind: 'info', text: T("You are West defending 3NT. Practise three decisions: lead the top of a sequence, usually play low in second hand, and follow with the cheapest sufficient card from touching honors. Your ♠K-Q-J-7 and ♥K-J-T-9 offer different choices: begin with the king of spades.", "你是西家，防守3NT。练三件事：连张领最大、第二家通常出小、跟连张时用足够赢墩的最小牌。你的♠K-Q-J-7与♥K-J-T-9提供不同选择，先领黑桃K。") },
{ kind: 'info', text: T("Declarer can cash four diamonds. Choose discards that preserve your spade winners and club entry. When declarer leads a small heart toward dummy’s ace-queen, second hand low is still appropriate. Dummy should finesse the queen; the defense must cope with sensible declarer play.", "庄家可兑现四轮方块。垫牌要保护黑桃赢墩和梅花进手。庄家朝明手A、Q领小红桃时，第二家出小仍是合理选择。明手应该用Q飞牌；防守路线必须能应对正常做牌。") },
{ kind: 'info', text: T("If partner’s 10 already wins a spade trick, follow low rather than overtaking it with the jack. When a later spade comes to you and your jack is sufficient, spend the jack and retain the queen. A high card is useful because of what it can win later, not because it is large.", "搭档黑桃10已经能赢时，就跟小，不必用J超吃。之后另一轮黑桃转到你面前，J足够赢就出J，把Q留着。大牌的价值在于后续能赢什么，不在于看起来大。") },
{ kind: 'play', script: [{ seat: "W", learner: true, expected: "KS", hint: T("Play KS.", "打出KS。") },
{ seat: "N", card: "5S" },
{ seat: "E", card: "2S" },
{ seat: "S", card: "AS" }] },
{ kind: 'play', script: [{ seat: "S", card: "AD" },
{ seat: "W", learner: true, expected: "6D", hint: T("Play 6D.", "打出6D。") },
{ seat: "N", card: "2D" },
{ seat: "E", card: "3D" }] },
{ kind: 'play', script: [{ seat: "S", card: "KD" },
{ seat: "W", learner: true, expected: "TD", hint: T("Play TD.", "打出TD。") },
{ seat: "N", card: "4D" },
{ seat: "E", card: "5D" }] },
{ kind: 'play', script: [{ seat: "S", card: "QD" },
{ seat: "W", learner: true, expected: "5C", hint: T("Play 5C.", "打出5C。") },
{ seat: "N", card: "8D" },
{ seat: "E", card: "7D" }] },
{ kind: 'play', script: [{ seat: "S", card: "JD" },
{ seat: "W", learner: true, expected: "9H", hint: T("Play 9H.", "打出9H。") },
{ seat: "N", card: "3C" },
{ seat: "E", card: "9D" }] },
{ kind: 'play', script: [{ seat: "S", card: "2H" },
{ seat: "W", learner: true, expected: "TH", hint: T("Play TH.", "打出TH。") },
{ seat: "N", card: "QH" },
{ seat: "E", card: "4H" }] },
{ kind: 'play', script: [{ seat: "N", card: "6C" },
{ seat: "E", card: "4C" },
{ seat: "S", card: "2C" },
{ seat: "W", learner: true, expected: "8C", hint: T("Play 8C.", "打出8C。") }] },
{ kind: 'play', script: [{ seat: "W", learner: true, expected: "7S", hint: T("Play 7S.", "打出7S。") },
{ seat: "N", card: "9S" },
{ seat: "E", card: "TS" },
{ seat: "S", card: "4S" }] },
{ kind: 'play', script: [{ seat: "E", card: "3S" },
{ seat: "S", card: "7C" },
{ seat: "W", learner: true, expected: "JS", hint: T("Play JS.", "打出JS。") },
{ seat: "N", card: "8S" }] },
{ kind: 'play', script: [{ seat: "W", learner: true, expected: "QS", hint: T("Play QS.", "打出QS。") },
{ seat: "N", card: "6S" },
{ seat: "E", card: "TC" },
{ seat: "S", card: "3H" }] },
{ kind: 'play', script: [{ seat: "W", learner: true, expected: "KC", hint: T("Play KC.", "打出KC。") },
{ seat: "N", card: "AC" },
{ seat: "E", card: "QC" },
{ seat: "S", card: "9C" }] },
{ kind: 'play', script: [{ seat: "N", card: "AH" },
{ seat: "E", card: "8H" },
{ seat: "S", card: "5H" },
{ seat: "W", learner: true, expected: "KH", hint: T("Play KH.", "打出KH。") }] },
{ kind: 'play', script: [{ seat: "N", card: "6H" },
{ seat: "E", card: "7H" },
{ seat: "S", card: "JC" },
{ seat: "W", learner: true, expected: "JH", hint: T("Play JH.", "打出JH。") }] },
{ kind: 'info', text: T("The defense wins five tricks: one small club, two spades, the king of clubs and the jack of hearts. Declarer wins eight, so 3NT is down one despite taking the heart finesse. The defeat no longer relies on dummy wasting the ace over a winning queen.", "防守方赢五墩：一墩小梅花、两墩黑桃、梅花K和红桃J。庄家拿八墩，即使红桃飞牌成功，3NT仍宕一。这条防守不再依赖明手放弃能赢的Q而直接用A。") },
{ kind: 'result' }
] },
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
          "Two clues tell you. Clue one: POINTS. Count high-card points like this: ace = 4, king = 3, queen = 2, jack = 1 — the whole deck holds 40. Your hand: ♠A K Q J (10), ♥A (4), ♦K (3) = 17 points. Partner's: ♥K Q (5), ♦A (4) = 9. Together: 26 points — a big share of all the strength at the table is yours.",
          '有两条线索告诉你。线索一：点力。这样数大牌点：A=4、K=3、Q=2、J=1 —— 整副牌共40点。你的牌：♠A K Q J（10）、♥A（4）、♦K（3）= 17点。搭档的：♥K Q（5）、♦A（4）= 9点。联手：26点 —— 全桌的实力有一大半在你们手里。'
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
          "Want to aim even higher than game? Bid a small slam — a level-6 contract promising 12 tricks — or a grand slam — a level-7 contract promising all 13 tricks. Make that promise, and you earn an extra slam bonus on top of the game bonus! But a bigger reward calls for greater strength: a small slam needs 32 combined points between you and partner, while a grand slam may need as many as 36.",
          '还想挑战比成局更高的目标吗？你可以叫小满贯——6阶定约，承诺赢12墩；或者叫大满贯——7阶定约，承诺赢全部13墩。兑现这个承诺，就能在成局奖分之外，再获得额外的满贯奖分！不过，更高的奖励也需要更强的实力：小满贯需要你和搭档联手32点，而大满贯则可能需要36点之多。'
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
          "Trump time — and trumps are COUNTED, never guessed. You hold five spades, dummy holds three: eight together, so the defenders hold FIVE. Five missing cards usually split 3-2 — three rounds of drawing. But they can also split 4-1, and that takes FOUR rounds. So the rule: keep leading trumps until the LAST enemy one falls. And it matters which hand does the work: your honors all sit in YOUR hand, so the big trumps come out of your hand — dummy's little spades only lead low toward them. Dummy leads the 5; you take with the ace.",
          '清将时间 —— 将牌要靠数，不能靠猜。你手里五张黑桃，明手三张，联手八张 —— 对方手里就是五张。外面少五张，通常是3-2分布，三轮清完；但也可能是4-1，那就要四轮。所以规则是：一轮一轮领出去，直到对方最后一张将牌落地为止。而且由哪只手出力很关键：你的大牌全在自己手里，大将牌就该从你手里打出去 —— 明手的小黑桃只朝它们领小的。明手出5，你用A拿下。'
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
          { seat: 'W', card: '3S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Ace wins. Keep drawing from your own hand — the king.",
          'A拿下了。继续从你自己手里清 —— 出K。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'KS',
            hint: T('King of spades (KS) — keep drawing.', '黑桃K (KS) —— 继续清。'),
          },
          { seat: 'W', card: '4S' },
          { seat: 'N', card: '7S' },
          { seat: 'E', card: '8H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "STOP — look what East just did: no spade, a heart thrown away. The enemy trumps split 4-1, and West holds FOUR of them. Count with me: he has played the 3 and the 4, so two more are still in his hand. This is the bad break — and this is exactly why we count. A player who stops after three rounds 'because it usually splits' hands West a trump for free. Keep drawing: your queen.",
          '停一下 —— 看东家刚才做了什么：没有黑桃，垫了一张红桃。对方的将牌是4-1分布，西家一个人握着四张。跟我数：他已经打出了3和4，手里还剩两张。这就是那个坏分布 —— 也正是我们要数牌的原因。那些"通常都是3-2"就打三轮的人，等于白送西家一张将牌。继续清：出你的Q。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'QS',
            hint: T('Queen of spades (QS) — third round.', '黑桃Q (QS) —— 第三轮。'),
          },
          { seat: 'W', card: '9S' },
          { seat: 'N', card: '6S' },
          { seat: 'E', card: '3C' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Queen wins — but West still holds ONE trump: the 10. A defender with a trump in his fist can RUFF one of your winners later — a loser that was never on your list. So there is a FOURTH round, and your jack is exactly the card for it: bigger than his 10. Play it, and the trump suit belongs to you alone.",
          'Q赢了 —— 但西家手里还剩一张将牌：10。攥着将牌的防守方，待会儿就能将吃你的一个赢墩 —— 一个清单上从来没有的新输墩。所以还有第四轮，而你的J正是干这活儿的牌：比他的10大。打出它，将牌这门就全归你了。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'S', learner: true, expected: 'JS',
            hint: T('The jack of spades (JS) — it beats West\'s 10 and ends the suit.', '黑桃J (JS) —— 压过西家的10，收掉这门。'),
          },
          { seat: 'W', card: 'TS' },
          { seat: 'N', card: '4D' },
          { seat: 'E', card: 'QC' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "FOUR rounds, and the last enemy trump — West's 10 — just died under your jack. All five are gone, and NOW, and only now, the side suits are safe: nothing can be ruffed. Cash your king of diamonds, then the next diamond round pays the one diamond loser on the list.",
          '四轮，对方最后一张将牌 —— 西家的10 —— 刚刚倒在你的J下面。五张全部清完，现在，也只有现在，边花才真正安全：什么都不会被将吃了。兑现你的方块K，然后下一轮方块付掉清单上的那个方块输墩。'
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
          { seat: 'N', card: '6D' },
          { seat: 'E', card: '7D' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: '9D' },
          { seat: 'W', card: 'QD' },
          { seat: 'N', card: '8D' },
          { seat: 'E', card: 'TD' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "There's the diamond loser — the defenders have their 3 tricks, and the budget is spent. Hearts last, and they are safe now because no enemy trump exists: cash dummy's queen and king first, so your two little hearts ride home under them, and your ace takes round three (the hand that leads out plays its honors first — remember blocking?), then your ace makes West's jack fall.",
          '方块输墩出现 —— 防守方拿到3墩，预算花完。最后打红桃，而且现在很安全，因为对方一张将牌都不剩了：先兑现明手的Q和K，让你的两张小红桃正好垫在它们下面（先打负责领出那只手的大牌 —— 还记得阻塞吗？），第三轮你的A让西家的J掉下来。'
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
          'Only one trump is left in your hand — with every enemy trump gone, it is simply a winner. Bring it home.',
          '你手里只剩最后一张将牌 —— 对方将牌全清完了，它就是普通的赢墩。带它回家。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: '8S' },
          { seat: 'W', card: '7C' },
          { seat: 'N', card: '9C' },
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
    title: T("Bidding Is Talking", "叫牌就是说话"),
    dealer: 'S',
    hands: OPENING_DEAL,
    contract: { level: 2, denom: 'S', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
{ kind: 'info', text: T("Bidding is a conversation about where and how high to play. A call can say “I have useful new information,” “my story is unfinished; please help me continue,” or “my range and shape are clear; you decide.” Before passing, ask both whether you have finished and whether partner allows the conversation to stop.", "叫牌是在讨论打什么、打多高。一声可以是“我有新话要说”，可以是“话没说完，请搭档帮我维持一下”，也可以是“范围和牌型说清楚了，你决定吧”。准备不叫之前，要同时判断自己是否说完，以及搭档是否允许对话结束。") },
{ kind: 'info', text: T("We use a two-over-one game-forcing system. For these beginner hands, consider a one-level suit opening with 12 or more high-card points. Game takes about 25 combined points, so 12 is roughly half the partnership target. This is a useful starting guide, not a guarantee of game; shape and playing strength matter too.", "我们采用二盖一逼局体系。入门时，拿到12点或以上大牌点，才考虑一阶花色开叫。成局通常需要联手约25点，12点大致是两人目标的一半。这是起步参考，不是成局保证；牌型和实际赢墩能力也很重要。") },
{ kind: 'info', text: T("There are five one-level openings: 1♣, 1♦, 1♥, 1♠ and 1NT. A suit opening normally shows about 12–21 points; stronger hands may need a strong opening instead. Pass with a weak hand: you have sent useful information and may bid later.", "一阶有五种开叫：1♣、1♦、1♥、1♠和1NT。花色开叫通常约12–21点；更强的牌可能需要强开叫。弱牌先不叫，也是有用的信息，以后仍可能参与。") },
{ kind: 'info', text: T("1NT is precise: 15–17 high-card points and a balanced hand, usually 4-3-3-3, 4-4-3-2 or 5-3-3-2. Balanced does NOT mean automatically open 1NT: 12–14 is too weak for it. In this tutorial, a balanced 1NT opening may include a five-card major.", "1NT的条件很精确：15–17大牌点，均型，通常是4-3-3-3、4-4-3-2或5-3-3-2。均型不等于自动开1NT：12–14点不够。本教程约定均型1NT也可以包含五张高花。") },
{ kind: 'info', text: T("Outside the notrump range, open 1♥ or 1♠ with at least five cards in that major. With unequal long suits, usually start with the longer; with two five-card suits, start with the higher-ranking one. Do not open a four-card major just because its honors look nice.", "不符合无将开叫条件时，开1♥或1♠保证该高花至少五张。长套不等长时通常先叫较长套；两套都是五张时先叫较高级的花色。不要仅因大牌漂亮，就用四张高花开叫。") },
{ kind: 'info', text: T("Why promise five? Partner with three knows 5+3=8 immediately. If you have only four in a major, start with a minor; partner can respond with a four-card major, and you can raise with four: 4+4=8. Five-card major OPENINGS and four-card major RESPONSES work together to find both fits.", "为什么保证五张？搭档有三张，马上知道5+3=8。若你只有四张高花，先开低花，搭档可以应叫四张高花，你有四张再加叫：4+4=8。五张高花开叫与四张高花应叫相互配合，才能找到这两类配合。") },
{ kind: 'info', text: T("No five-card major and no suitable 1NT? Open the longer minor. With 3 clubs and 3 diamonds, choose 1♣; with 4 and 4, choose 1♦. 1♣ promises at least 3 clubs. 1♦ usually has 4, but can have 3 with exactly 4 spades, 4 hearts, 3 diamonds and 2 clubs. A minor opening does not promise five!", "没有五张高花，也不适合1NT？开较长的低花。梅花、方块各3张时开1♣，各4张时开1♦。1♣至少3张；1♦通常4张，但黑桃4、红桃4、方块3、梅花2时也开1♦。低花开叫不保证五张！") },
{ kind: 'info', text: T("Read each example as spades / hearts / diamonds / clubs. ♠AK7 / ♥Q84 / ♦762 / ♣KJ53: 13 points, balanced but below the 1NT range; no five-card major, clubs longer than diamonds. Open 1♣.", "以下牌例依次写黑桃／红桃／方块／梅花。♠AK7 / ♥Q84 / ♦762 / ♣KJ53：13点，均型但不够1NT；没有五张高花，梅花比方块长。开1♣。") },
{ kind: 'info', text: T("♠KQ74 / ♥AJ83 / ♦Q65 / ♣72: 12 points. Neither four-card major can be opened. With three diamonds and two clubs, open 1♦; partner can show a major and you can raise with four.", "♠KQ74 / ♥AJ83 / ♦Q65 / ♣72：12点。两门高花都只有四张，不能开叫高花。三张方块、两张梅花，开1♦；搭档应叫高花后，你可以凭四张支持加叫。") },
{ kind: 'info', text: T("♠Q83 / ♥AKJ75 / ♦K62 / ♣84: 13 points and five hearts. Open 1♥. Partner with three hearts already knows you have at least eight together.", "♠Q83 / ♥AKJ75 / ♦K62 / ♣84：13点、五张红桃。开1♥，搭档有三张红桃，就已经知道联手至少八张。") },
{ kind: 'info', text: T("♠AK853 / ♥KQ74 / ♦A72 / ♣8: 16 points, five spades and a singleton club. This hand is not balanced: open 1♠, not 1NT. A three-card spade raise immediately finds the 5–3 fit.", "♠AK853 / ♥KQ74 / ♦A72 / ♣8：16点、五张黑桃，单张梅花，不是均型。开1♠，不适合1NT。搭档凭三张黑桃加叫，就能立即找到5–3配合。") },
{ kind: 'info', text: T("♠AQ7 / ♥K84 / ♦AJ62 / ♣Q53: 16 points, 3-3-4-3 and no singleton or void. Open 1NT. This tells partner both a narrow strength range and a balanced shape; partner uses your narrow range to judge the combined strength.", "♠AQ7 / ♥K84 / ♦AJ62 / ♣Q53：16点、3-3-4-3，没有单缺。开1NT，同时告诉搭档较窄的点力范围与均型；搭档根据这个较窄的范围判断联手实力。") },
{ kind: 'info', text: T("Now use the open deal: you hold 13 points and five spades. North has 8 points and three spades. You can see all cards for learning, but each bid must be justified only by that player’s hand and the auction.", "现在看桌上的牌：你有13点、五张黑桃。北家有8点、三张黑桃。学习时牌全翻开，但每个叫牌只能根据叫牌者自己的手牌和已有叫牌来决定。") },
{ kind: 'auction', script: [{ seat: 'S', learner: true, expected: "1S", hint: T("Choose 1S.", "请选择1S。"), note: T("1♠: 13 points and five spades. An opening, not an overcall.", "1♠：13点、五张黑桃。这是开叫，不是争叫。") },
{ seat: 'W', bid: "P", note: T("West has no suitable overcall and passes.", "西家没有合适的争叫，选择不叫。") },
{ seat: 'N', bid: "2S", note: T("2♠: 8 points and three-card support. Your opening promised five, so the fit is known.", "2♠：8点、三张支持。你的开叫保证五张，所以配合已经确定。") },
{ seat: 'E', bid: "P", note: T("East passes; the partnership can continue its decision.", "东家不叫，让这对搭档继续判断。") },
{ seat: 'S', learner: true, expected: "P", hint: T("Because this is a minimum hand (MIN), pass. A minimum opener facing a minimum simple raise lacks the strength to invite game.", "因为是低限牌（MIN），所以不叫。低限开叫面对搭档的低限简单加叫，联手实力不足以邀局。"), note: T("Pass: 13 plus a simple raise of about 6–9 is not enough to insist on game. Minimum opening, fit found, stop safely.", "不叫：13点加简单加叫约6–9点，不足以坚持成局。低限开叫，配合找到，安全停下。") },
{ seat: 'W', bid: "P", note: T("Three consecutive passes end the auction: 2♠.", "连续三次不叫，叫牌结束：2♠。") }] },
{ kind: 'info', text: T("The final bid sets the contract; three actual passes ended this auction. Within the winning partnership, the first player to name the final strain is declarer: South named spades first. After West leads, North lays down the dummy and South plays both hands.", "最后的实质叫牌决定定约；这次实际叫出了连续三次不叫。赢得定约的一方中，最先叫出最终花色的人当庄家：南家先叫黑桃。西家首攻后，北家摊下明手，由南家打两手牌。") },
    ],
  },
  {
    id: 'minor-responses',
    title: T("Responding to a Minor Opening", "对低花开叫的应叫"),
    dealer: 'N',
    hands: RESPONSE_DEAL,
    contract: { level: 2, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
{ kind: 'info', text: T("Keep the two notrump conversations separate. Over a minor opening, without a major to show or long minor support, natural 1NT shows 6–10, 2NT shows 11–12 invitational, and 3NT shows 13–15. The later semi-forcing 1NT lesson concerns responses to a MAJOR opening, not these natural minor-opening responses.", "把两种无将对话分清：对低花开叫，没有要报的高花或低花长支持时，自然1NT为6–10点，2NT为11–12点邀请，3NT为13–15点。后面的半逼叫1NT课针对高花开叫，不是这里的低花开叫自然应叫。") },
{ kind: 'info', text: T("Before choosing any call, ask: MAY I PASS? In the uncontested partnership auctions taught here, a hand-showing bid with no stated upper limit is forcing. “6+” gives a floor, not a ceiling: partner may be very strong, so you cannot assume the minimum and pass. Then ask how long the obligation lasts: one round, or all the way to game?", "选择叫牌之前，先问：我能不能不叫？本课无干扰搭档叫牌中，没上限的牌一定逼叫。6点以上只有下限、没有封顶：搭档可能很强，不能擅自按最低点力就Pass。接着再问：这次义务只是一轮，还是必须一直到成局？") },
{ kind: 'info', text: T("Partner opens 1♣. Your job is to help answer both questions: how high, and in which strain? Respond with about 6 points or more to a one-level suit opening; with 0–5 you usually pass. A pass IS a reply. A forcing bid is different: you must keep the auction alive even if unsure.", "搭档开叫1♣。你要帮助回答两个问题：叫多高、打什么？对一阶花色开叫，约6点以上通常应叫；0–5点通常不叫。不叫也是回答。但逼叫不同：即使没把握，也要继续叫，不能随意停下。") },
{ kind: 'info', text: T("Over 1♣ or 1♦, look for a major fit before raising a minor. A one-level new-suit response needs at least four cards and about 6 points; bid four-card suits up the line, hearts before spades when both have four. A five-card suit may be shown first. When an unpassed responder faces a 1♥ or 1♠ opening without interference, a non-jump new suit at the two level is a two-over-one GAME FORCE: it shows game-going strength, 13+ points under the latest course agreement, not merely 10. Over 1♠, a 2♥ response also promises five hearts.", "对1♣或1♦，先寻找高花配合，再考虑加叫低花。一阶新花应叫至少四张、约6点；四张套尽量由低到高，红桃黑桃各四张时先红桃。五张长套可以先报。未Pass过的应叫者，在对方没有干扰时，对1♥或1♠作二阶不跳新花应叫，属于二盖一逼局：需要经评估达到成局实力，按最新课件采用13点以上，不能仅凭10点就这样叫。对1♠应叫2♥还保证五张红桃。") },
{ kind: 'info', text: T("Support needs context. After a five-card major OPENING, three-card support makes an eight-card fit; a simple raise shows about 6–9 support points. After a four-card major RESPONSE, opener normally needs FOUR to raise. Three cards do not prove a fit. Raising a minor needs more length: normally four diamonds or five clubs.", "支持要看前提。五张高花开叫后，三张支持就有八张配合；简单加叫约表示6–9支持点。但四张高花应叫后，开叫者通常需要四张才能加叫，三张不能确认配合。低花加叫需要更多张数：通常方块四张、梅花五张。") },
{ kind: 'info', text: T("Without a fit or a four-card suit you can show at the one level, use the semi-forcing 1NT waiting response with about 5–12 points; it can include three-card invitational support or a void and long suit. A flat minimum opener may pass, while an unbalanced opener continues describing the hand. This waiting message is developed in the dedicated semi-forcing 1NT lesson. It is different from a 15–17 balanced 1NT opening. Basic Stayman and transfers follow later in foundations; further notrump conventions belong to the advanced part.", "没有配合，也没有能在一阶说明的四张花色时，可用约5–12点的半逼叫1NT过渡，可能包括三张邀请支持或带缺门的长套牌。平弱低限开叫可Pass，非均型继续描述。半逼叫1NT专课会解释这种等待消息，与15–17均型的1NT开叫不同。基础篇稍后学习斯台曼与转移，其他无将约定留到进阶篇。") },
{ kind: 'info', text: T("This deal: North has 13 points, four clubs and four hearts; no five-card major, and too little for 1NT. North opens 1♣. You have 8 points and five hearts: respond 1♥. Your bid only promises four, so North uses FOUR hearts to raise. You can count 5+4=9, but North’s decision does not rely on seeing your fifth heart.", "这副牌：北家13点、四张梅花和四张红桃，没有五张高花，点力又不够1NT，所以开1♣。你有8点、五张红桃，应叫1♥。你的应叫只保证四张，因此北家凭自己的四张红桃加叫。你能数出5+4=9，但北家的决定不能依赖偷看你的第五张红桃。") },
{ kind: 'info', text: T("Strength controls natural raises: with three or more cards supporting a major opening, 2 of the major shows 6–9 (minimum), 3 shows 10–12 with four+ support (invitational), and 4 chooses game when the combined strength is sufficient. In a natural raise, higher commitments show more strength. An explicitly named agreement, such as an inverted minor raise or Jacoby 2NT, must instead be read by its agreed meaning.", "实力决定自然加叫高度：对高花开叫有三张以上支持，2高花表示6–9点低限，3高花表示10–12点、四张以上支持的邀请，4高花在联手实力足够时选择成局。自然加叫越高，表示实力越强；明确约定的低花反加叫、雅各比2NT等则按约定含义判断。") },
{ kind: 'info', text: T("A forcing bid may require only one further round: an unpassed 1♥–1♠ response asks opener to speak again. By contrast, an uncontested 1♥–2♣ response with 13+ establishes a two-over-one game force. Even a minimum opener must continue until game; the next bids choose the best strain.", "逼叫可以只要求再说一轮：未Pass过的一盖一1♥—1♠要求开叫者再叫。相对地，无干扰时以13点以上应叫1♥—2♣，建立二盖一逼局。开叫即使低限也要继续到成局；后面的叫牌选择最佳定约方向。") },
{ kind: 'auction', script: [{ seat: 'N', bid: "1C", note: T("1♣: 13 points, four clubs, no five-card major.", "1♣：13点、四张梅花，没有五张高花。") },
{ seat: 'E', bid: "P", note: T("East has no suitable overcall and passes.", "东家没有合适的争叫，选择不叫。") },
{ seat: 'S', learner: true, expected: "1H", hint: T("Choose 1H.", "请选择1H。"), note: T("1♥: at least four hearts and 6+ points; this hand has five and 8.", "1♥：至少四张红桃、6点以上；这手实际五张、8点。") },
{ seat: 'W', bid: "P", note: T("West passes; this is an uncontested partnership auction.", "西家不叫，这是没有争叫的搭档对话。") },
{ seat: 'N', bid: "2H", note: T("2♥: minimum opening strength and FOUR-card heart support.", "2♥：低限开叫实力，并有四张红桃支持。") },
{ seat: 'E', bid: "P", note: T("East passes again; no competitive bid is justified.", "东家再次不叫，没有理由勉强争叫。") },
{ seat: 'S', learner: true, expected: "P", hint: T("Choose P.", "请选择P。"), note: T("Pass: 8 points opposite a minimum opening, well short of game. Finding a fit does not create extra high-card points.", "不叫：8点面对低限开叫，离成局还远。找到配合，不会凭空增加大牌点。") },
{ seat: 'W', bid: "P", note: T("The third pass ends the auction at 2♥ by South.", "第三次不叫结束叫牌，南家打2♥。") }] },
{ kind: 'info', text: T("If both players had only four hearts, the same sequence would find a 4–4 fit. If you had enough strength for game, you would keep going instead of passing just because the fit was found. Choose the level from strength and the strain from fit: preferably a major game with eight trumps, or 3NT when suitable without a major fit; a minor game needs 11 tricks.", "如果两人都只有四张红桃，同样的进程就能找到4–4配合。如果你有足够的成局实力，就应继续，而不能仅因配合找到就不叫。点力决定高度，配合决定方向：有八张高花将牌配合时优先考虑高花成局；没有高花配合且条件合适时考虑3NT，低花成局则需要11墩。") },
    ],
  },
  { id: "full-hand", title: T("Raise and Play", "加叫，然后打牌"), dealer: "N", hands: RESPONSE_DEAL, contract: {"level": 2, "denom": "H", "declarer": "S", "doubled": 0}, vulnerable: false, steps: [
{ kind: 'info', text: T("Return to the natural minor-response auction and play a complete hand; here the new objective is card play. North has 13 points, you have 8: the same 1♣–1♥–2♥ conversation stops in a partscore. A fit tells us WHERE; the combined strength tells us HOW HIGH. Both partners use the strength ranges they have actually shown.", "回到对低花开叫的自然应叫，接着打完一整副牌；这一课的新重点是做牌。北家13点，你8点；同样的1♣—1♥—2♥对话停在部分定约。配合告诉我们打什么，联手实力告诉我们叫多高，两人都根据已经承诺的实力范围作决定。") },
{ kind: 'auction', script: [{ seat: 'N', bid: "1C", note: T("1♣: 13 points, four clubs, no five-card major.", "1♣：13点、四张梅花，没有五张高花。") },
{ seat: 'E', bid: "P", note: T("East has no suitable overcall and passes.", "东家没有合适的争叫，选择不叫。") },
{ seat: 'S', learner: true, expected: "1H", hint: T("Choose 1H.", "请选择1H。"), note: T("1♥: at least four hearts and 6+ points; this hand has five and 8.", "1♥：至少四张红桃、6点以上；这手实际五张、8点。") },
{ seat: 'W', bid: "P", note: T("West passes; this is an uncontested partnership auction.", "西家不叫，这是没有争叫的搭档对话。") },
{ seat: 'N', bid: "2H", note: T("2♥: minimum opening strength and FOUR-card heart support.", "2♥：低限开叫实力，并有四张红桃支持。") },
{ seat: 'E', bid: "P", note: T("East passes again; no competitive bid is justified.", "东家再次不叫，没有理由勉强争叫。") },
{ seat: 'S', learner: true, expected: "P", hint: T("Choose P.", "请选择P。"), note: T("Pass: 8 points opposite a minimum opening, well short of game. Finding a fit does not create extra high-card points.", "不叫：8点面对低限开叫，离成局还远。找到配合，不会凭空增加大牌点。") },
{ seat: 'W', bid: "P", note: T("The third pass ends the auction at 2♥ by South.", "第三次不叫结束叫牌，南家打2♥。") }] },
{ kind: 'info', text: T("2♥ by South promises 8 tricks. North is dummy. West leads the king of diamonds; win with dummy’s ace, then draw the opponents’ trumps. Count: your five hearts plus dummy’s four leave 4 outside.", "南家打2♥，承诺8墩，北家是明手。西家首攻方块K，用明手的A拿下，再清对方的将牌。数一数：你的五张加明手四张，外面还有4张。") },
{ kind: 'play', script: [{ seat: "W", card: "KD" },
{ seat: "N", learner: true, expected: "AD", hint: T("Play AD.", "打出AD。") },
{ seat: "E", card: "4D" },
{ seat: "S", learner: true, expected: "2D", hint: T("Play 2D.", "打出2D。") }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "6H", hint: T("Play 6H.", "打出6H。") },
{ seat: "E", card: "7H" },
{ seat: "S", learner: true, expected: "AH", hint: T("Play AH.", "打出AH。") },
{ seat: "W", card: "2H" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "KH", hint: T("Play KH.", "打出KH。") },
{ seat: "W", card: "TH" },
{ seat: "N", learner: true, expected: "8H", hint: T("Play 8H.", "打出8H。") },
{ seat: "E", card: "3H" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "6C", hint: T("Play 6C.", "打出6C。") },
{ seat: "W", card: "9C" },
{ seat: "N", learner: true, expected: "AC", hint: T("Play AC.", "打出AC。") },
{ seat: "E", card: "4C" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "KC", hint: T("Play KC.", "打出KC。") },
{ seat: "E", card: "JC" },
{ seat: "S", learner: true, expected: "7C", hint: T("Play 7C.", "打出7C。") },
{ seat: "W", card: "2C" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "QH", hint: T("Play QH.", "打出QH。") },
{ seat: "E", card: "5D" },
{ seat: "S", learner: true, expected: "4H", hint: T("Play 4H.", "打出4H。") },
{ seat: "W", card: "3C" }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "TC", hint: T("Play TC.", "打出TC。") },
{ seat: "E", card: "QC" },
{ seat: "S", learner: true, expected: "8C", hint: T("Play 8C.", "打出8C。") },
{ seat: "W", card: "4S" }] },
{ kind: 'play', script: [{ seat: "E", card: "9S" },
{ seat: "S", learner: true, expected: "3S", hint: T("Play 3S.", "打出3S。") },
{ seat: "W", card: "6S" },
{ seat: "N", learner: true, expected: "2S", hint: T("Play 2S.", "打出2S。") }] },
{ kind: 'play', script: [{ seat: "E", card: "KS" },
{ seat: "S", learner: true, expected: "7S", hint: T("Play 7S.", "打出7S。") },
{ seat: "W", card: "QS" },
{ seat: "N", learner: true, expected: "5S", hint: T("Play 5S.", "打出5S。") }] },
{ kind: 'play', script: [{ seat: "E", card: "TD" },
{ seat: "S", learner: true, expected: "7D", hint: T("Play 7D.", "打出7D。") },
{ seat: "W", card: "6D" },
{ seat: "N", learner: true, expected: "3D", hint: T("Play 3D.", "打出3D。") }] },
{ kind: 'play', script: [{ seat: "E", card: "JS" },
{ seat: "S", learner: true, expected: "8S", hint: T("Play 8S.", "打出8S。") },
{ seat: "W", card: "AS" },
{ seat: "N", learner: true, expected: "9H", hint: T("Play 9H.", "打出9H。") }] },
{ kind: 'play', script: [{ seat: "N", learner: true, expected: "9D", hint: T("Play 9D.", "打出9D。") },
{ seat: "E", card: "JD" },
{ seat: "S", learner: true, expected: "5H", hint: T("Play 5H.", "打出5H。") },
{ seat: "W", card: "QD" }] },
{ kind: 'play', script: [{ seat: "S", learner: true, expected: "JH", hint: T("Play JH.", "打出JH。") },
{ seat: "W", card: "8D" },
{ seat: "N", learner: true, expected: "5C", hint: T("Play 5C.", "打出5C。") },
{ seat: "E", card: "TS" }] },
{ kind: 'info', text: T("The full hand wins nine tricks: 2♥ plus one, scoring 140. Stop drawing trumps after the opponents have none; preserve dummy’s last trump to ruff the third spade and keep a trump in hand for the diamond return. The auction was based on the promised ranges, not on a guaranteed number of tricks.", "完整牌局赢九墩：2♥超一，得140分。对方已无将牌就停止清将，保留明手最后一张将牌将吃第三轮黑桃，手里也留将牌处理方块回牌。叫牌根据承诺的范围判断，并不保证恰好多少墩。") },
{ kind: 'result' }
] },
  {
    id: 'conversation',
    title: T('Opener Rebids: Shape and Strength', '开叫者再叫：牌型与实力'),
    dealer: 'S',
    hands: CONV_DEAL,
    contract: { level: 2, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
{ kind: 'info', text: T("This is the single opener-rebid lesson. The opening 12–21 range is broad; your next message narrows BOTH strength and shape. If responder’s one-over-one is forcing, a minimum opener must still answer. Then ask what is genuinely new: a sixth card, four-card support, a second suit, or a strength range.", "这是统一的开叫者再叫课。开叫12–21点的范围很宽，下一句话要同时缩小实力与牌型。如果应叫者的一盖一逼叫，低限开叫也必须回应。再问有什么新信息：第六张、四张支持、第二套，还是点力范围。") },
{ kind: 'info', text: T("Minimum descriptive choices: rebid a major with six cards, raise responder’s major with four, show a second suit economically, or rebid 1NT with a balanced 12–14. These calls can finish opener’s minimum message: “I have described my hand; you decide.” Do not pass the forcing first response instead of describing your minimum.", "低限的描述方法：六张高花可再叫原花，四张支持可加叫应叫高花，经济地报第二套是顺叫，12–14点均型可再叫1NT。这些叫品可以把低限开叫者的话说完：“我的牌交代清楚了，你决定。”不能用Pass替代对应叫者逼叫的必要回应。") },
{ kind: 'info', text: T("Keep the precise NT ranges separate from broad suit-strength groups. Balanced 15–17 normally opens 1NT, so a balanced 1NT REBID is 12–14; a jump to 2NT shows 18–19. A jump raise or a jump rebid in your own strong long suit, around 16–18, invites. A strong jump in a new suit forces game. In the same natural bid family, a bigger commitment requires greater strength.", "把精确无将范围与大致花色实力分组分开。15–17均型通常已开1NT，所以均型1NT再叫是12–14点，跳2NT为18–19点。跳加叫、或强长套的跳再叫约16–18点，表示邀请；强牌跳新花则逼局。同类自然叫品中，承诺越高，要求实力越强。") },
{ kind: 'info', text: T("Compare messages, not just numbers: an economical second suit says “I have more shape to show”; a limited rebid says “my range is now clear”; an invitation says “my story is finished, choose with your strength.” The next lesson isolates the special cost of a reverse, instead of repeating this entire rebid table.", "比较消息，而不只盯着阶数：经济第二套表示“我还有牌型要说”；有限再叫表示“我的实力范围已清楚”；邀请表示“我说完了，请用你的实力决定”。下一课只研究逆叫额外消耗的空间，不再重复整张再叫表。") },
{ kind: 'info', text: T("Use the deal: South has 14 points and six hearts; North has 7 points and five spades. South starts 1♥. North’s 1♠ only promises four spades and 6+, so South cannot pass it. The minimum 2♥ rebid adds the sixth heart and limits strength. North’s two hearts then make an eight-card fit, but 14+7=21 is short of game.", "看桌上牌例：南家14点、六张红桃，北家7点、五张黑桃。南家先1♥；北家1♠只保证四张黑桃、6点以上，所以南家不能Pass。低限再叫2♥，补充第六张并限定实力。北家的两张红桃组成八张配合，但14+7=21离成局仍远。") },
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
              'Your rebid — 2♥. THIS is the new news: your hearts are SIX long. One heart bid could have been five; this minimum rebid normally shows six.',
              '你的再叫 —— 2♥。这就是新消息：你的红桃有6张。叫一次红桃可能只有5张；这里的低限再叫通常表示六张。'
            ),
          },
          { seat: 'W', bid: 'P', note: T(
            'West passes — heard enough.',
            '西家不叫 —— 听够了。'
          ) },
          { seat: 'N', bid: 'P', note: T(
            'North passes with 7 points and two hearts. Your minimum rebid normally shows six hearts: 6+2=8. There is a fit, but not enough strength to invite game.',
            '北家有7点、两张红桃，选择不叫。你的低限再叫通常表示六张：6+2=8。配合有了，但实力不足以邀局。'
          ) },
          { seat: 'E', bid: 'P', note: T(
            'East\'s pass is the third in a row — conversation over. Contract: 2♥.',
            '东家的不叫是连续第三个 —— 对话结束。定约：2♥。'
          ) },
        ],
      },
{ kind: 'info', text: T("The conversation is complete: 1♥ showed an opening and five+ hearts, 1♠ kept the discussion open, and 2♥ completed the minimum six-card description. North can now choose to pass. Next, use this framework to understand reverses, then establish two-over-one game forcing before learning why semi-forcing 1NT is needed.", "对话完成：1♥表示开叫与五张以上红桃，1♠让对话继续，2♥把低限六张的描述说清。北家现在可以决定不叫。接下来用这一框架理解逆叫，再先学二盖一逼局，随后理解为什么需要半逼叫1NT。") },
    ],
  },
  { id: "scoring", title: T("Go for Game!", "冲成局！"), dealer: "S", hands: makeHands({"N": ["KS", "4S", "2S", "9H", "8H", "7H", "QD", "3D", "2D", "KC", "9C", "8C", "3C"], "E": ["6S", "TC", "JS", "4D", "5S", "5D", "TS", "9D", "QC", "7S", "3H", "QS", "8D"], "S": ["AS", "8S", "AH", "KH", "QH", "JH", "5H", "AD", "7D", "JC", "7C", "6C", "5C"], "W": ["4H", "JD", "AC", "KD", "3S", "TH", "9S", "6H", "4C", "2C", "2H", "6D", "TD"]}), contract: {"level": 4, "denom": "H", "declarer": "S", "doubled": 0}, vulnerable: false, steps: [
{ kind: 'info', text: T("You already know a contract is a promise: \"We will win THIS many tricks.\" But how is the promise priced? Slowly, once: the first 6 tricks of every hand are FREE — a contract only counts the tricks ABOVE 6. 2♥ means 6 + 2 = 8 tricks. 4♥ means 6 + 4 = 10 tricks. Now the numbers will make sense.", "你已经知道定约是一个承诺：\"我们会赢这么多墩。\"但这个承诺怎么计价？慢慢说一次：每一副牌的前6墩是免费的 —— 定约只数6以上的墩。2♥就是6+2=8墩。4♥就是6+4=10墩。现在数字就说得通了。") },
{ kind: 'info', text: T("Each trick above 6 pays points, and the pay depends on the suit: a major suit (♥ ♠) pays 30 per trick. Minors (♦ ♣) pay 20. No-trump pays 40 for the first trick, then 30. That is exactly why majors are \"popular\" — same tricks, more money.", "6以上的每一墩都给分，分多少看花色：高花（♥ ♠）每墩30分。低花（♦ ♣）每墩20分。无将第一墩40分，之后每墩30分。这正是高花\"受欢迎\"的原因 —— 一样的墩数，更多的钱。") },
{ kind: 'info', text: T("Remember game from the contract lesson? Here is its exact line: if your contract itself scores 100 points or more, it is called GAME — and the game pays a fat bonus: +300 points on top! Do the math with me: 4♥ = 4 × 30 = 120. Over 100 — GAME. 3NT = 40 + 30 + 30 = 100. Exactly 100 — GAME. The game contracts are: 3NT, 4♥, 4♠, 5♣, 5♦. (Minors need 5 because 4 × 20 = 80 — not enough!)", "还记得定约课里的成局吗？这里是它的精确分数线：如果你的定约本身达到100分或以上，就叫成局 —— 成局还有一份厚厚的奖励：额外+300分！跟我算：4♥ = 4 × 30 = 120。超过100 —— 成局。3NT = 40 + 30 + 30 = 100。正好100 —— 成局。成局的定约有：3NT、4♥、4♠、5♣、5♦。（低花需要到5，因为4 × 20 = 80 —— 不够！）") },
{ kind: 'info', text: T("A contract under 100 is a partscore — it still pays, plus a small bonus of 50. Nothing wrong with it. But the +300 game bonus is so big that players HUNT for game whenever it is close. So the big question of every auction: \"Do we have game?\"", "不到100分的定约叫部分定约 —— 它照样给分，外加50分小奖励，没什么不好。但成局的+300太大了，所以只要接近，玩家都会猎逐成局。于是每次叫牌的大问题就是：\"我们有成局吗？\"") },
{ kind: 'info', text: T("How do you know? The contract lesson's rule, one more time: add BOTH hands' points together — about 25 combined points makes game. Why 25? Game needs 9–10 tricks, and 25 of the 40 total points — almost two-thirds of all the strength at the table — usually builds those tricks. Under 25? Take the partscore and be happy.", "怎么知道？把定约课的规则再复习一遍：把两只手的点数加起来 —— 两家合计约25点就能成局（25点进局）。为什么是25？成局需要9到10墩，而25点 —— 占全桌40点的将近三分之二 —— 通常足够搭起这些墩。不到25？拿下部分定约，开开心心就好。") },
{ kind: 'info', text: T("You hold 19 points: ♠A (4), ♥A K Q J (10), ♦A (4), ♣J (1). Five hearts and an unbalanced hand: open 1♥. When partner raises, use the promised range, not the face-up cards, to decide about game.", "你有19点：♠A（4）、♥A K Q J（10）、♦A（4）、♣J（1）。五张红桃，非均型，开1♥。搭档加叫后，要根据承诺的范围判断成局，而不是偷看翻开的牌。") },
{
        kind: 'auction',
        script: [
          {
            seat: 'S', learner: true, expected: '1H',
            hint: T('Open 1♥ — longest and strongest first.', '开叫1♥ —— 先说最长最强的。'),
            note: T("You open 1♥: 19 points, five hearts, and an unbalanced hand.", "你开叫1♥：19点、五张红桃，非均型。"),
          },
          { seat: 'W', bid: 'P', note: T(
            'West passes — no answer to that opening yet.',
            '西家不叫 —— 对这样的开叫暂时没什么回应。'
          ) },
          { seat: 'N', bid: '2H', note: T("North raises to 2♥: 6–9 support points and at least three hearts. North actually has 8 high-card points and three hearts, but your decision uses the range.", "北家加叫2♥：6–9支持点，至少三张红桃。北家实际8大牌点、三张红桃，但你要根据承诺范围作决定。") },
          { seat: 'E', bid: 'P', note: T(
            'East passes — watching your team\'s conversation.',
            '东家不叫 —— 看着你们队的对话。'
          ) },
          {
            seat: 'S', learner: true, expected: '4H',
            hint: T("You hold 19 points and a known heart fit. Bid game: 4♥.", "你有19点，红桃配合已知。叫到成局：4♥。"),
            note: T("4♥: your 19 plus partner’s 6–9 support points gives about 25–28 with a known fit. This strong opener bids game; the actual hands total 27 high-card points, not slam strength.", "4♥：你的19点加搭档6–9支持点，约25–28点，配合已知。强开叫方选择成局；实际联手27大牌点，并非满贯实力。"),
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
{ kind: 'info', text: T("Why 4♥ rather than an invitation of 3♥? You have enough strength to choose game opposite this raise. With a weaker opening hand you might invite or pass instead. Bidding higher is a decision about partnership strength, not a way to silence the opponents.", "为什么叫4♥而不是3♥邀局？你的实力足以在这次加叫后选择成局。如果开叫较弱，就可能邀局或不叫。叫高是联手实力的判断，不是为了堵住对手说话。") },
{ kind: 'info', text: T("4♥ — GAME! The promise is 10 tricks. West leads a diamond. Trick one of ten — take it!", "4♥ —— 成局！承诺是10墩。西家领出方块。十墩里的第一墩 —— 拿下它！") },
{ kind: 'play', script: [{ seat: "W", card: "JD" },
{ seat: "N", learner: true, expected: "QD", hint: T("Play QD.", "打出QD。") },
{ seat: "E", card: "4D" },
{ seat: "S", learner: true, expected: "7D", hint: T("Play 7D.", "打出7D。") }] },
{ kind: 'info', text: T("The first trick is won without spending the ace of diamonds: dummy’s queen covers the jack, East follows low, and South follows with the seven. The game contract still requires ten tricks; game bonuses reward a completed promise, and a failed contract pays penalties instead.", "第一墩不必花掉方块A：明手Q盖J，东家跟小，南家跟7。成局定约仍需拿到十墩；兑现承诺才有成局奖分，失败则付罚分。") }
] },
  {
    id: 'overcall',
    title: T('Jump In!', '争叫，抢进来'),
    dealer: 'E',
    hands: OVERCALL_DEAL,
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
          'But an overcall is a promise made in the dark: partner has not spoken, so you know NOTHING about their hand. That is why the entry fee is strict — a GOOD suit: 5 cards or more, with strong top cards (think A, K, Q up top). If your suit is weak and partner is broke, a bad overcall gets doubled and crushed. Suit quality, point strength, vulnerability and the level all matter; a good suit alone is not permission to bid indefinitely.',
          '但争叫是在黑暗里许下的承诺：搭档还没说话，你对他的牌一无所知。所以入场费很严格 —— 一个好花色：5张或以上，顶端要有大牌（A、K、Q坐镇）。如果你的花色很弱，搭档又很穷，烂争叫会被加倍打得很惨。还要看点力、局况和阶数；好花色不等于可以无限往上叫。'
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
            'North advances with 2♥: 8 points and four hearts support your five. A simple raise shows limited strength, not a game force.',
            '北家进叫2♥：8点、四张红桃，支持你的五张。简单加叫表示有限实力，不是逼叫成局。'
          ) },
          { seat: 'E', bid: 'P', note: T(
            'East passes — their opening story did not scare your team off.',
            '东家不叫 —— 他们的开叫故事没吓住你们队。'
          ) },
          { seat: 'S', bid: 'P', note: T(
            'You pass with 14 points after a limited raise. The fit is real, but partner has not promised game strength. Do not treat a raise as unlimited support.',
            '你有14点，面对有限加叫选择不叫。配合是真的，但搭档没有承诺成局实力。不能把加叫当成无限支持。'
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
        ...(s.runout ? { runout: true as const } : {}),
      };
    case 'result':
      return { kind: 'result' as const };
  }
}


const LESSON_NOTES: Record<string, { focus: LText; lead: LText }> = {
"deck": { focus: T("Recognize the deck, suits and ranks. Follow the highlighted cards.", "认识牌、花色与大小，按高亮提示操作。"), lead: T("West leads the 4 of hearts. Hearts are the suit led: follow hearts if you have any. Your ace is the highest heart.", "西家首攻红桃4，红桃就是领出花色：有红桃必须跟红桃，你的A是最大的红桃。") },
"tricks": { focus: T("Follow suit; compare cards of the suit led. The winner leads the next trick.", "有花色必须跟，比较领出花色的大小，赢墩者领下一墩。"), lead: T("West leads the 4 of diamonds. Follow diamonds if possible; a card of another suit cannot win at no-trump. Watch your ace take the trick.", "西家领出方块4。有方块必须跟；无将时，其他花色不能赢。看你的A如何拿下这一墩。") },
"strategy": { focus: T("Count top winners across BOTH hands, then make a plan: finesse toward a tenace or develop honors by driving out the ace.", "合看两手数顶张赢墩，再计划：朝坎张飞牌，或顶出A来树立大牌。"), lead: T("West leads the 5 of clubs. Dummy can win with the king, but two high cards from your side in one trick still count as only one winner. Count the two hands together.", "西家首攻梅花5。明手可用K拿下，但同一墩里打出两张己方大牌，也只算一个赢墩。数赢墩要合看两手。") },
"long-suits": { focus: T("Establish the long suit: count the missing cards, give up a trick when needed, and save an entry to cash the length.", "树立长套：数对方张数，必要时让掉一墩，保留进手兑现长套。"), lead: T("West leads the ace of hearts. You cannot beat it: follow small and preserve your other winners. Your plan is to establish diamonds and retain the club entry.", "西家首攻红桃A。你压不过它，跟小牌，保留其他赢墩。计划是树立方块，并保留梅花进手。") },
"trump": { focus: T("Trump can win when you are void in the led suit; following suit remains compulsory.", "缺门时可以用将牌将吃，有领出花色时仍必须跟。"), lead: T("West leads the 4 of diamonds. With no diamonds, you may ruff with a spade, the trump suit. Trump beats even a higher card of the suit led.", "西家首攻方块4。没有方块时可以用黑桃将牌将吃，将牌能压过领出花色的大牌。") },
"losers": { focus: T("Count losers from the long-trump hand, use dummy’s honors to cover them, and compare with the contract’s losing budget.", "从长将牌一方数输墩，用明手大牌补足，再和定约允许的输墩数比较。"), lead: T("West leads the queen of hearts. Follow low from dummy and win the ace in hand; retain dummy’s king as an entry for the side-suit plan. Keep the loser count separate from the winner count.", "西家首攻红桃Q。明手跟小、手中A拿住，保留明手K作处理边花的进手。数输墩与数赢墩不要混淆。") },
"eliminate": { focus: T("Eliminate losers with discards on established winners and ruffs in dummy. Delay drawing trump when those ruffs are needed.", "用树立后的赢墩垫输牌、用明手将吃消去输墩；需要将吃时先不急着清将牌。"), lead: T("West leads the king of spades. Dummy’s ace wins; plan to cash the ace of clubs and king for spade discards and save dummy’s last trump for the fourth diamond.", "西家首攻黑桃K，用明手A拿下。计划是兑现梅花A、K垫黑桃，保留明手最后一张将牌将吃第四轮方块。") },
"defense-leads": { focus: T("Choose the opening suit and lead: fourth best from length, top of a sequence. Use only your hand, dummy and the auction.", "选择首攻花色与张数：长套第四张，连张出最大。只根据自己的牌、明手与叫牌判断。"), lead: T("You lead the 4 of hearts from K-10-8-4 against 3NT: fourth best from your longest suit. This gives partner a chance to help establish it; it does not tell you partner’s hidden cards.", "你对3NT从红桃K-10-8-4首攻4：长套第四张。给搭档机会帮助树立花色，但不能事先假定搭档的暗牌。") },
"defense-play": { focus: T("Work with partner: third hand high, second hand low, cover an honor when it promotes a card, and avoid wasting two winners together.", "配合搭档：第三家出大，第二家出小；盖大牌要能提升赢墩，避免两张赢张撞在同一墩。"), lead: T("Partner leads the 6 of hearts. As third hand, play the king to force declarer’s ace and help promote partner’s queen. Do not duck merely to save your king.", "搭档首攻红桃6。你是第三家，用K逼出庄家A，帮助提升搭档Q，不要只为保留K而机械跟小。") },
"defense-rules": { focus: T("Practise top of a sequence on lead, second hand low, and the cheapest sufficient winner when following.", "实践连张首攻出最大、第二家出小，以及跟牌时用足够赢墩的最小牌。"), lead: T("You lead the king of spades from K-Q-J. The king is the top of a sequence; forcing out the ace can establish the queen and jack.", "你从黑桃K-Q-J首攻K：连张出最大，逼出A后可以树立Q和J。") },
"contract": { focus: T("A contract is level + 6 tricks. Combine point strength and an eight-card fit to decide whether to promise game; count enemy trumps until all are gone.", "定约承诺阶数+6墩。结合联手点力与八张配合判断成局，清将时数到对方最后一张将牌。"), lead: T("West leads the ace of clubs against 4♠. This is one of your planned club losers: follow suit, then manage the remaining two losers and draw all enemy trumps.", "西家对4♠首攻梅花A。这是计划内的梅花输墩，必须跟牌；之后控制其余两个输墩，并清完对方将牌。") },
"bidding": { focus: T("Bidding exchanges strength ranges and suit lengths to choose the level and strain. Learn the five one-level openings and how 5–3 and 4–4 major fits are found.", "用叫牌交换实力范围和花色长度，决定高度与定约方向。掌握五种一阶开叫，以及5–3、4–4高花配合的寻找方法。"), lead: T("", "") },
"minor-responses": { focus: T("First decide whether you may pass: an uncapped hand-showing bid is forcing. Then describe strength and fit, distinguishing one-round forces from game forces.", "先判断能否不叫：没上限的描述性叫品一定逼叫。再说明实力与配合，区分逼叫一轮和逼局。"), lead: T("", "") },
"full-hand": { focus: T("Raise with the promised support and strength, then play one complete hand: plan, draw trump, use entries and follow suit.", "按支持张数和实力加叫，再完整打牌：计划、清将牌、进手与跟牌。"), lead: T("West leads the king of diamonds. Dummy’s ace can win immediately. Plan to draw the four outside hearts, then use a small club to reach dummy’s club winners.", "西家首攻方块K，明手A可以立即拿下。计划先清外面的四张红桃，再从手里领小梅花到明手兑现赢墩。") },
"conversation": { focus: T("An opener’s rebid narrows both length and strength. Use the new information to stop, invite or commit to game; each message must help the partnership decision.", "开叫者再叫进一步说明长度和实力。根据新信息选择停叫、邀请或逼局，每条消息都帮助两人作决定。"), lead: T("", "") },
"scoring": { focus: T("Distinguish trick points from bonuses. Bid game when the partnership has enough strength and a suitable fit; a partscore is right when game is not justified.", "区分墩分与奖分。联手实力足、配合合适时叫成局，不够时停部分定约。"), lead: T("West leads the jack of diamonds against 4♥. Cover with dummy’s queen; when East follows low, play the seven from hand and preserve the ace. The play must now deliver 10 tricks.", "西家对4♥首攻方块J。明手用Q盖，东家跟小后，手里跟7，保留A。现在打牌要兑现10墩。") },
"overcall": { focus: T("After an opponent opens, your bid is an overcall, not a response. Judge suit quality, strength and level; partner’s limited support does not promise game.", "对方开叫后是争叫，不是应叫。结合花色质量、实力与阶数判断；搭档有限支持不保证成局。"), lead: T("", "") },
};

function resolveLesson(raw: RawLesson, lang: LessonLang): Lesson {
  return {
    id: raw.id,
    title: raw.title[lang],
    focus: LESSON_NOTES[raw.id]?.focus[lang] ?? '',
    openingLeadAnalysis: LESSON_NOTES[raw.id]?.lead[lang] ?? '',
    dealer: raw.dealer,
    hands: raw.hands,
    contract: raw.contract,
    vulnerable: raw.vulnerable,
    steps: (() => {
      const firstPlay = raw.steps.findIndex(s => s.kind === 'play');
      const lastPlay = raw.steps.reduce((last, s, i) => s.kind === 'play' ? i : last, -1);
      const paced = raw.steps.filter((s, i) =>
        s.kind !== 'info' || firstPlay < 0 || i <= firstPlay || i > lastPlay
      );
      const focus = LESSON_NOTES[raw.id]?.focus;
      return [...(focus ? [{ kind: 'info' as const, text: (lang === 'zh' ? '本课重点：' : 'Lesson focus: ') + focus[lang] }] : []),
        ...paced.map(s => resolveStep(s, lang))];
    })(),
  };
}

/** Lessons with all text in the requested language. */
export function getLessons(lang: LessonLang): Lesson[] {
  const all = [...RAW_LESSONS.map(r => { const lesson = resolveLesson(r, lang); return { ...lesson, steps: [...lesson.steps, lessonReview(lesson.id, lang)] }; }), ...getContinuationLessons(lang)];
  const byId = new Map(all.map(l => [l.id, l]));
  return ACBL_CHAPTERS.flatMap(ch => ch.lessonIds).map(id => {
    const lesson = byId.get(id);
    if (!lesson) throw new Error('missing lesson: '+id);
    return withForcingNotes(lesson, lang);
  });
}

/** English build (used by tests). */
export const LESSONS: Lesson[] = getLessons('en');
