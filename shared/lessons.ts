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

import { datingWalk } from './dating-model.js';
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
  N: ['AS', 'QS', 'JS', '4S', '6S', '2H', '3H', '8D', '9D', 'TD', '4C', '5C', '6C'],
  E: ['KS', '8S', 'TS', '6H', '8H', '2D', '6D', 'JD', 'KD', '7C', '9C', 'JC', 'KC'],
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

/** Defense lesson 1 deal: South declares 3NT; the learner DEFENDS as
 *  West and makes the opening lead. Hearts K-T-8-4 (king plus two
 *  intermediates) beat spades A-5-3-2 (ace and three nothings) as a
 *  suit to start, so the modern agreement taught in the lesson applies:
 *  FOURTH BEST — the 4. Partner's ace wins, the return lets West's king
 *  score. Then West owns ♠A-5-3-2 and dummy's spades are T-8-6 — dead.
 *  Every call in this lesson must stand on West's own hand plus dummy;
 *  partner's cards are the ANSWER, never the question, so West leads a
 *  small spade blind: the ace stays home as a sure trick, so the lead
 *  cannot cost. The answer turns out to be ♠K-Q-J — three touching
 *  honors, and declarer's two hands hold nothing above the jack (dummy
 *  T-8-6, declarer 9-7-4), so all three march: J over the 2 (cheapest
 *  winner of the sequence), then the king, then the queen. West's ace is
 *  cashed later, once partner is void. That is four spade tricks on top
 *  of ♥A ♥K and ♣A: 7 defensive tricks, 3NT down three.
 *  Simulator-verified (all 13 tricks replayed). */
const DEFENSE_LEAD_DEAL: Hands = makeHands({
  N: ['TS', '8S', '6S', 'QH', '9H', '6H', '2H', 'KD', 'JC', '9C', '7C', '3C', '4C'],
  E: ['KS', 'QS', 'JS', 'AH', '7H', '8D', '7D', '6D', '5D', '4D', '6C', '5C', '2C'],
  S: ['9S', '7S', '4S', 'JH', '5H', '3H', 'AD', 'QD', 'JD', '9D', '2D', 'KC', 'QC'],
  W: ['AS', '5S', '3S', '2S', 'KH', 'TH', '8H', '4H', 'TD', '3D', 'AC', 'TC', '8C'],
});

/** Defense lesson 2 deal: South declares 4♠; the learner defends as
 *  East, partner West leads. The chair rules all fire: partner leads ♥6
 *  and East's king (third hand high) drags out the ace — partner's queen
 *  scores later; declarer leads a small club to dummy's king, and East
 *  holds NOTHING above that king (queen, ten, three — all smaller), so
 *  fourth hand low is honest here and the queen survives; dummy leads the
 *  ♦J and East COVERS with the queen, forcing declarer's ACE — nothing
 *  West holds can beat it, so the cover costs nothing — and promoting
 *  East's ten, which then wins a trick; partner's ♦K wins another; the
 *  saved ♣Q wins the fourth (declarer's best club left is the jack), and
 *  partner's ♣A — kept back at trick four instead of crashed under the
 *  king — takes the fifth. Defensive tricks: ♥Q ♦T ♦K ♣Q ♣A = 5 —
 *  4♠ down two. Simulator-verified (all 13 tricks replayed). */
const DEFENSE_PLAY_DEAL: Hands = makeHands({
  N: ['JS', '7S', '5S', 'JH', '8H', '5H', '2H', 'JD', '6D', '2D', 'KC', '8C', '7C'],
  E: ['TS', '9S', '4S', 'KH', '9H', '4H', '3H', 'QD', 'TD', '5D', 'QC', 'TC', '3C'],
  S: ['AS', 'KS', 'QS', '8S', '6S', 'AH', 'TH', 'AD', '8D', '3D', 'JC', '9C', '2C'],
  W: ['3S', '2S', 'QH', '7H', '6H', 'KD', '9D', '7D', '4D', 'AC', '6C', '5C', '4C'],
});

/** Defense lesson 3 deal: South declares 3NT; the learner defends as West
 *  and personally plays the three rules the first two lessons only named.
 *  West holds three holdings that make them live: ♠K-Q-J (a sequence),
 *  ♥K-J-T (a sequence) and ♣K.
 *    T1  lead ♠K — TOP OF A SEQUENCE. Declarer's ace takes it, which is
 *        the point: Q-J are now the two highest spades in the deal.
 *    T2-6 declarer cashes five diamonds (A-K-Q-J-9); West has only two,
 *        so three discards are spent on ♣5 ♠7 ♥9 — all idle cards, the
 *        sequences stay intact.
 *    T7  declarer leads ♥2, West is SECOND HAND with ♥K-J-T behind him
 *        and dummy holding ♥A-Q-6: cover with the king and the ace
 *        swallows it; play the TEN (the bottom of the sequence) and the
 *        king lives to win trick 12.
 *    T9  dummy leads a spade, West follows with ♠Q-J: FOLLOW LOW from a
 *        sequence — the jack does the job and the queen takes the next
 *        trick. Declarer made 8; defensive tricks ♠J ♠Q ♣K ♥K ♥J = 5 —
 *        3NT down one. Simulator-verified (all 13 tricks replayed). */
const DEFENSE_RULES_DEAL: Hands = makeHands({
  N: ['9S', '8S', '6S', '5S', 'AH', 'QH', '6H', '8D', '4D', '2D', 'AC', '6C', '3C'],
  E: ['TS', '3S', '2S', '8H', '7H', '4H', '7D', '5D', '3D', 'JC', 'TC', '9C', '4C'],
  S: ['AS', '4S', '5H', '3H', '2H', 'AD', 'KD', 'QD', 'JD', '9D', 'QC', '7C', '2C'],
  W: ['KS', 'QS', 'JS', '7S', 'KH', 'JH', 'TH', '9H', 'TD', '6D', 'KC', '8C', '5C'],
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
 *  sheds both small spades; dummy ruffs the third diamond. West's diamonds
 *  are Q-T-7 only, so the 7 he leads at that point really is his LAST
 *  diamond (E's A-K-J die as discards — declarer never leads the suit
 *  again). Only THEN draw trumps. Simulator-verified: NS take exactly 10
 *  tricks. */
const ELIM_DEAL: Hands = makeHands({
  N: ['AS', '8S', '6S', '3S', '8H', '5H', '4H', '9D', '2D', 'KC', 'QC', 'JC', '6C'],
  E: ['JS', 'TS', '4S', 'TH', '7H', 'AD', 'KD', 'JD', '5D', '3D', 'AC', '8C', '5C'],
  S: ['AH', 'KH', 'QH', '9H', '6H', '3H', '2H', '7S', '5S', '2S', '8D', '6D', '4D'],
  W: ['KS', 'QS', '9S', 'JH', 'QD', 'TD', '7D', '3C', 'TC', '9C', '7C', '4C', '2C'],
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

const RESPONSE_DEAL: Hands = makeHands({
  N: ["5S", "2S", "QH", "9H", "8H", "6H", "AD", "9D", "3D", "AC", "KC", "TC", "5C"],
  S: ["8S", "7S", "3S", "AH", "KH", "JH", "5H", "4H", "7D", "2D", "8C", "7C", "6C"],
  E: ["9S", "7H", "JS", "4D", "3H", "5D", "QC", "4C", "QD", "JC", "KS", "TS", "JD"],
  W: ["8D", "3C", "QS", "6S", "AS", "6D", "4S", "TD", "2C", "TH", "9C", "2H", "KD"],
});

const OPENING_DEAL: Hands = makeHands({
  S: ["AS", "8S", "7S", "5S", "3S", "KH", "QH", "4H", "AD", "7D", "2D", "8C", "6C"],
  N: ["KS", "9S", "2S", "AH", "8H", "6H", "5D", "4D", "3D", "JC", "7C", "5C", "3C"],
  E: ["3H", "JD", "QC", "9D", "6S", "2H", "9C", "TH", "9H", "8D", "AC", "6D", "JS"],
  W: ["7H", "TC", "4C", "4S", "TS", "KC", "TD", "2C", "JH", "QS", "QD", "KD", "5H"],
});

const GAME_DEAL: Hands = makeHands({
  S: ["AS", "8S", "AH", "KH", "QH", "JH", "5H", "AD", "7D", "JC", "7C", "6C", "5C"],
  N: ["KS", "4S", "2S", "9H", "8H", "7H", "QD", "3D", "2D", "KC", "9C", "8C", "3C"],
  E: ["6S", "TC", "JS", "4D", "5S", "5D", "TS", "9D", "QC", "7S", "3H", "QS", "TD"],
  W: ["4H", "JD", "AC", "KD", "3S", "TH", "9S", "6H", "4C", "8D", "2C", "2H", "6D"],
});

const OVERCALL_DEAL: Hands = makeHands({
  S: ["AH", "KH", "QH", "JH", "5H", "AD", "7C", "6C", "5C", "4C", "3C", "5S", "3S"],
  N: ["9H", "8H", "7H", "6H", "QS", "JS", "4S", "4D", "3D", "2D", "8C", "KC", "QC"],
  E: ["AS", "KS", "9S", "7S", "TH", "4H", "KD", "QD", "JD", "TD", "9D", "JC", "2C"],
  W: ["TS", "8S", "6S", "2S", "3H", "2H", "8D", "7D", "6D", "5D", "TC", "9C", "AC"],
});


function datingExample(a: number, b: number): LText {
  const r = datingWalk(a, b);
  const path = r.moves.join(' → ');
  return T(
    `Dating example ${a}+${b}=${a+b}: moves ${path}. ${r.success ? 'Hug: target reached.' : 'Pass before the last space: below target.'}${r.counter ? ' The 3-point reply is a counter-invitation; only the inviter holding 6 accepts.' : ''}`,
    `约会例子${a}+${b}=${a+b}：步数${path}。${r.success ? '拥抱：达到目标。' : '最后一格之前Pass：没有达到目标。'}${r.counter ? '3点的回应是反邀请，只有持6点的邀请者接受。' : ''}`
  );
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
          "Diamonds: dummy is the longer hand, with 4. Top cards: again just the ace — 1 winner — plus another hopeful queen, this time in YOUR hand, right next to the ace. Clubs are the funny one: your top cards are A, K, Q, J — four of them! But look where they sit: A and K in dummy, Q and J in your hand — and you hold only 2 clubs, so your honors must fall UNDER dummy's in the very same rounds. Dummy's third club is just a baby 4 — it can never beat the clubs the defenders still hold. Capped: 2 winners.",
          '方块：明手是较长的手，有4张。顶张：又只有A —— 1个赢墩 —— 还有一个有希望的Q，这次在你手里，就挨着A。梅花最好笑：你们的顶张有A、K、Q、J —— 足足四张！但看看它们坐在哪：A和K在明手，Q和J在你手里 —— 而你只有2张梅花，你的大牌只能在同样的两轮里压在明手的大牌下面。明手的第三张梅花只是个小4 —— 永远大不过防守方手里剩下的梅花。封顶：2个赢墩。'
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
          "SNAP! East ducked, and the queen won. That is winner number 5 — two more to go. This move has a name: the FINESSE — lead toward a card you hope is a winner, and trap the enemy honor in the middle. Now the second finesse — same trick, new shape. Spades: this time the ace is in YOUR hand and the queen is in dummy's — the pair is split up. West holds the king, sitting right in front of dummy's queen. Lead a SMALL spade toward the queen: if West spends the king, he wins that round — but the king is gone for good, and your queen then rules the suit. If West ducks… the queen wins on the spot. Either way the ace and the queen add up to two tricks. Try it — your little 2 of spades.",
          '咔嚓！东家躲开了，Q赢了！这是第5个赢墩 —— 还差2个。这一招有名字：飞牌—— 朝着你希望能赢的牌领过去，把敌人的大牌困在中间。现在来第二个飞牌 —— 同一招，新形状。黑桃：这次A在你手里，Q在明手 —— 这一对是分开的。K在西家手里，正好坐在明手Q的前面。朝着Q领出一张小黑桃：如果西家用掉K，这一墩归他 —— 但K就此消失，之后Q就是这门花色里最大的牌。如果西家躲开……Q当场获胜。不管他怎么选，A和Q都是你的两个赢墩。试试 —— 你的小黑桃2。'
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
        text: T("Numbers worth remembering: with 5 cards missing out there, they usually split 3 and 2 (about 68 times in 100). With 4 missing, a 2-2 split happens about 41 times in 100. And the old proverb: '8 cards? Finesse! 9 or more? Play ace-king and let the queen drop.'", "几个数字值得记住：外面少5张牌时，通常分成3张和2张（100次里约68次）。少4张时，分成2张和2张大约41次。还有句老话：'8张牌就用飞牌，9张以上打A和K，等Q自己掉下来。'"),
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
          "Harvest complete: FIVE tricks from one suit — A, K, 9, 8, 7 — where the top count only promised 2. Three spade winners are still in the bank from our count. Cash your ace, then let dummy's queen and king bring the last tricks home.",
          '收获完成：一门花色拿下五墩 —— A、K、9、8、7 —— 而顶张计数当初只承诺了2墩。数过的黑桃赢墩还剩三个在银行里。兑现你的A，然后让明手的Q和K把最后的墩带回家。'
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
          'Total: 0 + 1 + 1 + 1 = 3 losers. Your contract is 4♠ — you need 10 tricks, so you can afford to lose exactly 3. Right on budget — no vanishing tricks needed today. The plan writes itself: draw their trumps FIRST — five of them are out, so count them as they fall and do not stop until the last one is gone — and after that no winner of yours can ever be ruffed. Then cash your honors and pay only the three losers on the list. West leads the queen of hearts — take it with your ace.',
          '总账：0 + 1 + 1 + 1 = 3个输墩。你的定约是4♠ —— 需要赢10墩，正好能输3墩。刚刚好在预算内 —— 今天不需要消失魔术。计划自己就写好了：先清掉对方的将牌 —— 外面有五张，一边清一边数，不到最后一张落地不停手 —— 清完之后，你的任何赢墩都不可能被将吃。然后兑现大牌，只付清单上的三个输墩。西家首攻红桃Q —— 用你的A拿下。'
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
          'Now draw their trumps: ace, king, queen — count the enemy spades as they fall.',
          '现在清将牌：A、K、Q —— 数着对方的黑桃一张张掉下来。'
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
          { seat: 'E', card: 'KD' },
          {
            seat: 'S', learner: true, expected: '9H',
            hint: T('Your last trump (9H) — bring it home.', '你的最后一张将牌 (9H) —— 带它回家。'),
          },
          { seat: 'W', card: '3C' },
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
          "Time to switch chairs! Today you are NOT the declarer. South plays 3NT, and you sit WEST — a defender. Your partner is East, across the table. You win by LOSING the count declarers love: South needs 9 tricks out of 13. If your side takes 5 first, the contract FAILS. Defense is teamwork, and at a real table you and East will never see each other's cards — your only messages are the cards you play. (This screen shows you East's hand so you can watch the machinery turn, but none of the choices below depend on peeking.) Every card talks.",
          '换个位置坐！今天你不是庄家。南家打 3NT，你坐西家 —— 是防守方。你的搭档是桌子对面的东家。你的赢法，是破坏庄家最爱的那本数：南家需要 13 墩里的 9 墩。你们先拿到 5 墩，定约就被击宕了。防守是团队作战，而真正的牌桌上，你和东家永远看不见对方的牌 —— 唯一的通讯工具就是打出的牌。（屏幕上给你看了东家的手牌，是为了让你看清机器怎么转；但下面每一个选择，都不需要偷看。）每张牌都在说话。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "And the loudest card of all is the first one: the OPENING LEAD — yours to choose, before dummy appears. One honest warning: which card to lead from a holding is not a law of nature, it is an AGREEMENT between partners. Different pairs agree different systems! What follows is one popular MODERN set — agree it with your partner, and the two of you will understand each other perfectly.",
          '而全场声音最大的一张牌，就是第一张：首攻 —— 由你来选，在明手摊牌之前。先说句实话：从一手牌里该领出哪一张，不是自然规律，而是搭档之间的约定。不同的搭档，约定可以完全不同！下面要教的，是现在流行的一套现代约定 —— 和你的搭档约好同一套，你们就能心领神会。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "First, pick the SUIT: attack your longest and strongest suit. Your two longest are four cards each: hearts K-T-8-4, and spades A-5-3-2. Look closer. The hearts carry the king plus two useful intermediates, the 10 and the 8 — a suit that can grow. The spades are headed by the ace but followed by three nothings: on your own holding that suit is worth one trick, and the ace is not going anywhere. Start the suit with a future. Hearts it is.",
          '第一步，选花色：进攻你最长、最强的花色。你最长的两门各四张：红桃K-T-8-4，黑桃A-5-3-2。再仔细看一眼。红桃有 K，还带着 10 和 8 两张有用的中间牌 —— 这是一门能长大的花色。黑桃顶着 A，后面却是三张小牌：单看你自己这手牌，这门只值一墩，而那墩 A 跑不掉。先去建那门有前途的。就打红桃。'
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
          "Two tricks in the bank! Partner's ace won the first — with only A-x he had no message to send, so he simply won and RETURNED your suit. That move has a name: RETURNING PARTNER'S SUIT — the defender's golden rule: when in doubt, give partner's suit back. Your king cashed. Hearts are finished for you now: the king is spent and the ten-eight are too small to lead.",
          '两墩入账！第一墩搭档的 A 赢了 —— 他只有 A 加一张小牌，没有信息可发，就干脆赢下，然后回攻你的花色。这一招有名字：回攻搭档花色—— 这是防守的黄金法则：拿不准时，把搭档的花色打回去。你的 K 兑现了。红桃这条路对你也走到头了：K 已经用掉，剩下的 T-8 太小，领出去只是送人。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "So look at what is left in your hand: spades A-5-3-2, diamonds T-3. Dummy's spades are T-8-6 — three nothings; no card in there can ever beat you. And your ace of spades is a trick nobody can take away: it wins the moment you call for it. So lead a SMALL spade. It cannot cost — the ace stays home as a sure trick — and it asks partner one question: have you got anything in this suit? When a lead cannot lose, use it to start a conversation.",
          '那就看看你手里还剩什么：黑桃A-5-3-2，方块T-3。明手的黑桃是 T-8-6 —— 三张废牌，那一头没有任何一张能压过你。而你手里的黑桃A 是一墩谁也抢不走的牌：你什么时候叫它，它什么时候赢。所以领一张小黑桃。它不会有代价 —— A 留在家里，稳拿一墩 —— 同时它只向搭档问一个问题：这一门，你有货吗？当一次领出不可能亏的时候，就用它来开口说话。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'W', learner: true, expected: '2S',
            hint: T('A small spade (2S) — it costs nothing, so ask the question.', '小黑桃 (2S) —— 不会亏，那就开口问一句。'),
          },
          { seat: 'N', card: '6S' },
          { seat: 'E', card: 'JS' },
          { seat: 'S', card: '4S' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "The answer was better than you had any right to expect. Partner held ♠K-Q-J — three honors, each exactly one step below the next. That is a SEQUENCE, and a sequence is a promise: the honors cover each other, so they march. Partner put the J on your 2, the cheapest card of his sequence that still wins, because dummy's best spade is the ten and declarer's is the nine. The king and the queen are still with him, and nothing in the enemy's hands can stop them.",
          '答案比你能指望的还要好。搭档手里是 ♠K-Q-J —— 三张大牌，一张紧挨着一张，这才是连张。连张是一种承诺：大牌彼此掩护，可以一张张往下推。你出 2，搭档放的是 J —— 他连张里最小的那张，却已经够赢：明手最大的黑桃是 T，庄家最大的是 9。K 和 Q 还留在他手里，敌人手上没有任何一张拦得住。'
        ),
      },
      {
        kind: 'info',
        text: T(
          "Two habits come out of that trick, and you will use them for the rest of your bridge life. When you LEAD a sequence, lead its TOP card — from Q-J-T, lead the queen, never the ten. When you FOLLOW to one, spend its LOWEST card. Partner reads the strength of your suit from which one you spent.",
          '这一墩能取出两个习惯，往后一辈子都用得上。领这一门时，出连张里最大的那张 —— 手里是Q-J-T，就领Q，别领T。跟这一门时反过来，出连张里最小的那张。搭档看你挑了哪一张，就读得出你这一门有多少实力。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'E', card: 'KS' },
          { seat: 'S', card: '7S' },
          { seat: 'W', card: '3S' },
          { seat: 'N', card: '8S' },
          { seat: 'E', card: 'QS' },
          { seat: 'S', card: '9S' },
          { seat: 'W', card: '5S' },
          { seat: 'N', card: 'TS' },
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
          "Partner bows out with a small diamond — dummy's king takes it. But count before you chase anything: ♥A, ♥K, and all three of partner's spades — ♠J, ♠Q, ♠K. That is FIVE tricks, and 3NT needs nine of thirteen, so the contract is ALREADY beaten. Every one of those tricks grew from one fourth-best 4 of hearts — a coded card that told partner your suit was real. Declarer now tries the clubs, hoping to sneak the king past your ace. You do not have to hunt him: take what is yours.",
          '搭档用小方块脱手 —— 明手的 K 拿下。不过动手之前先数：♥A、♥K，再加上搭档的三张黑桃 ♠J、♠Q、♠K —— 已经是五墩，而 3NT 需要十三墩里的九墩，定约已经被击宕了。这些赢墩全都长在那张长四的红桃 4 上 —— 一张带密码的牌，告诉搭档你的花色是真的。庄家现在试梅花，想把 K 从你的 A 眼皮底下偷过去。你不需要去追他：该拿的拿下来就行。'
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
            hint: T('The ace of clubs (AC) — take it, and count six.', '梅花A (AC) —— 拿下它，数到第六墩。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "SIX. And your own ace of spades is still a winner: partner's honors are all played, so nothing of his can get in the way — cash it while the lead is yours, before declarer's diamonds bury it. Then throw him in with a small club and let him run his long suit: the hand is decided.",
          '六墩。而且你自己的黑桃A 还是个赢墩 —— 搭档的大牌都打完了，他的牌挡不住你：趁出牌权还在你手上，把它兑现掉，别让庄家的方块把它埋了。然后用一张小梅花把庄家请上台，让他去跑他的长套：这副牌已经定了。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'W', learner: true, expected: 'AS',
            hint: T('Cash the ace of spades (AS) — nothing can block it now.', '兑现黑桃A (AS) —— 现在没什么能挡住它了。'),
          },
          { seat: 'N', card: '4C' },
          { seat: 'E', card: '6C' },
          { seat: 'S', card: '2D' },
        ],
      },
      {
        // Settled: six tricks banked, 3NT already down. From here declarer
        // just runs the diamonds and the defense follows suit — eighteen
        // taps that teach nothing, so the whole tail plays out in one go.
        kind: 'play',
        runout: true,
        script: [
          { seat: 'W', card: '8C' },
          { seat: 'N', card: '7C' },
          { seat: 'E', card: '5D' },
          { seat: 'S', card: 'QC' },
          // Declarer runs the diamonds; the defenders simply follow and let
          // the last tricks fall where they may.
          { seat: 'S', card: 'AD' },
          { seat: 'W', card: 'TD' },
          { seat: 'N', card: '9H' },
          { seat: 'E', card: '6D' },
          { seat: 'S', card: 'QD' },
          { seat: 'W', card: 'TC' },
          { seat: 'N', card: 'JC' },
          { seat: 'E', card: '7D' },
          { seat: 'S', card: 'JD' },
          { seat: 'W', card: '8H' },
          { seat: 'N', card: '9C' },
          { seat: 'E', card: '8D' },
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
          "Still defending — but today you sit EAST, and partner West makes the opening lead. South plays 4♠: your side needs FOUR tricks to beat it. Defending is mostly about WHERE you sit in each trick. You are THIRD hand when partner leads (two cards are down before you), SECOND hand when the player on your right leads, and FOURTH — last — when the lead comes around to you. Each chair has one golden rule. Partner leads a small heart, the 6. Dummy plays the 2. You are third hand, holding K-9-4-3. The rule for third hand: play HIGH — your biggest card. Go: the king!",
          '继续防守 —— 但今天你坐东家，首攻由搭档西家来打。南家打 4♠：你们需要四墩才能击宕。防守的关键，是每一墩里你坐哪个位置。搭档领牌时你是第三家（你出牌前已有两张牌落地），右手方领牌时你是第二家，牌转到你这里时你是第四家 —— 最后出牌。每把椅子都有一条黄金法则。搭档领出小红桃 6，明手跟了 2。你是第三家，手里是 K-9-4-3。第三家的法则：出大牌 —— 你最大的那张。来吧：K！'
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
          "Now declarer leads a small club toward dummy's king, and partner ducks behind it — partner holds the ace and is happy to let dummy win cheap. You are LAST to play: fourth hand. Dummy's king already wins this trick, and your best club — the queen — dies under it exactly like the three would. Fourth hand low is not timidity, it is arithmetic: when you cannot win, spend the card that costs you nothing. Play the THREE, and keep the queen and the ten in your hand. That king will not live forever. And the same arithmetic works one chair earlier — SECOND HAND LOW: when the player on your right leads, you are second; if nothing you hold can change the outcome, go cheap there too and let partner, sitting fourth, take the decision.",
          '现在庄家领出小梅花，朝着明手的 K 打，而搭档在后面放小 —— 搭档手里有 A，乐意让明手便宜地赢下这一墩。你是最后一个出牌的：第四家。明手的 K 已经赢了这一墩，你最大的梅花Q 和那张 3 一样，都死在这张 K 下面。第四家放小不是胆小，是算账：赢不了的时候，就出那张不花你任何代价的牌。出梅花3，把 Q 和 T 留在手里。那张 K 活不了太久。同样的算术，早一个座位也成立 —— 第二家放小：右手方领牌时你是第二家，手里没有能改变结局的牌，就一样便宜地出，把这一墩的决定权交给坐在第四家的搭档。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: '2C' },
          { seat: 'W', card: '4C' },
          { seat: 'N', card: 'KC' },
          {
            seat: 'E', learner: true, expected: '3C',
            hint: T('The three (3C) — you cannot beat that king, so it costs nothing.', '梅花3 (3C) —— 你赢不了那张 K，出它一点也不心疼。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Dummy cashes the king of clubs and now leads the JACK of diamonds. An honor is led AT you — different rule! When you can cover an honor with a bigger honor, COVER IT. Your queen over his jack forces declarer to spend the ace — and look what it grows: your TEN of diamonds becomes a sentry, taller than every diamond dummy has left. Cover with the queen!",
          '明手兑现了梅花K，现在领出方块J。一张大牌朝你打来了 —— 规则不同了！当你能用更大的大牌盖住一张大牌时，就盖打。你的 Q 压住他的 J，逼庄家动用 A —— 再看它养出了什么：你的方块T 成了哨兵，比明手剩下的任何方块都高。用 Q 盖打！'
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
          { seat: 'S', card: 'AD' },
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
          // Dummy keeps the jack: partner's queen is winning this trick
          // whatever dummy does, so declarer spends the five and saves
          // the honor. Playing the J here would be the beginner's waste.
          { seat: 'N', card: '5H' },
          {
            seat: 'E', learner: true, expected: '3H',
            hint: T('Small (3H) — partner\'s queen is doing the work.', '小牌 (3H) —— 搭档的 Q 在干活呢。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Partner now leads a diamond back toward you. Dummy plays the 6. Are there any diamonds higher than your ten still alive? The king is partner's, and the ace, queen and jack are all gone — your ten is the tallest card left in the suit. The sentry collects! Take it with the ten.",
          '搭档现在把方块打回来。明手跟了 6。还有比你的 T 更大的方块活着吗？K 在搭档手里，A、Q、J 全都打过了 —— 你的 T 是这门花色剩下的最高牌。哨兵收费了！用 T 拿下。'
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
            hint: T('Lead the 5 (5D) — partner\'s king is waiting at the end of this suit.', '领出 5 (5D) —— 这门花色的尽头有搭档的 K 在等着。'),
          },
          { seat: 'S', card: '3D' },
          { seat: 'W', card: 'KD' },
          { seat: 'N', card: '2D' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Three tricks home, one more to go. Partner has been sitting on the ace of clubs since trick four — the ace he refused to throw under dummy's king. Time to cash it. Partner leads the ace, and 4♠ is already beaten on this trick: that is the fourth. You are third hand, but this trick belongs to partner — dummy plays a small club, so do not waste a card that can still win. Keep the queen and follow with the ten.",
          '三墩到手，还差一墩。搭档从第 4 墩起就一直攥着梅花A —— 正是他不肯扔到明手K 下面的那张 A。现在该兑现了。搭档领出 A，这一墩落地，4♠ 就已经被打宕：这就是第四墩。你还是第三家，可这一墩属于搭档 —— 明手跟一张小梅花，你就别把还能赢的牌浪费掉。留着 Q，出 T。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: 'AC' },
          { seat: 'N', card: '7C' },
          {
            seat: 'E', learner: true, expected: 'TC',
            hint: T('The ten (TC) — partner\'s ace wins whatever you do; keep the queen.', '梅花T (TC) —— 搭档的 A 反正要赢，留着 Q。'),
          },
          { seat: 'S', card: '9C' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "FOUR — the contract is beaten. One more coin for the jar: partner leads his last club, dummy plays small again, and now your queen is the tallest club left — declarer's jack is the only honor still out, and it is smaller. Take it.",
          '四墩 —— 定约已经击宕。再往罐子里投一枚：搭档领出他最后一张梅花，明手又跟小，现在你的 Q 是剩下最大的梅花 —— 庄家手里的 J 是外面唯一的大牌，而且比你小。拿下它。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '5C' },
          { seat: 'N', card: '8C' },
          {
            seat: 'E', learner: true, expected: 'QC',
            hint: T('The queen (QC) — the card you kept under partner\'s ace.', '梅花Q (QC) —— 你藏在那张 A 下面的牌。'),
          },
          { seat: 'S', card: 'JC' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "FIVE. Tally for the defense: the queen of hearts partner promoted, the ten of diamonds your cover grew, partner's king of diamonds, the ace of clubs he kept back at trick four, and the queen you saved under that ace. Declarer needed ten and made eight: 4♠ down two!",
          '五墩。防守方清点：搭档扶起来的红桃Q、你盖打养大的方块T、搭档的方块K、他在第 4 墩省下来的梅花A，还有你藏在那张 A 下面的 Q。庄家需要十墩，只拿到八墩：4♠ 宕二！'
        ),
      },
      {
        // Down two and the four chair rules already named: the last two
        // tricks are shuffling cards, not learning.
        kind: 'play',
        runout: true,
        script: [
          { seat: 'E', card: '9H' },
          { seat: 'S', card: '6S' },
          { seat: 'W', card: '7H' },
          { seat: 'N', card: '8H' },
          { seat: 'S', card: '8S' },
          { seat: 'W', card: '9D' },
          { seat: 'N', card: 'JH' },
          { seat: 'E', card: '4H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Pin the FIVE rules to your wall — each with its name. THIRD HAND HIGH: partner leads, you are third — play your biggest, to force out declarer's honors and promote your side's next cards. COVER AN HONOR: an honor is led at you — cover it with a bigger honor and grow the card just underneath. FOURTH HAND LOW: you are last and cannot win — play the cheapest card, and keep the honor that will win a later trick. SECOND HAND LOW: the player on your right leads a small card and you are second — usually go low as well and let the trick run round to partner, who sits fourth; the same patience, one chair earlier. SEQUENCES: LEAD HIGH, FOLLOW LOW — lead the queen from Q-J-T so partner knows the jack and ten are beneath it; and when you merely follow with that same holding, spend the ten and keep the queen, so nothing is wasted. Defense is two half-hands thinking as one. You have now played both sides of the table. Next lesson: one more deal, with the three rules you have only read about — this time you play them yourself.",
          '把五条法则钉在墙上 —— 每条都有名字。第三家出大：搭档领牌，你是第三家 —— 出你最大的，逼出庄家的大牌，扶起你们次一级的牌。大牌盖大牌：一张大牌朝你打来 —— 用更大的大牌盖打，养大它下面的那张。第四家放小：你是最后一家又赢不了 —— 出最便宜的那张，把日后还能赢的牌留在手里。第二家放小：右手方领出一张小牌，你是第二家 —— 通常也放小，让这一墩流向坐在第四家的搭档，同样的耐心，只早了一个座位。连张：领牌出大，跟牌出小 —— 手里是Q-J-T，领就领Q，让搭档知道你下面还有J和T；只是跟牌时反而出T、留着Q，一张都不浪费。防守，是两个半手想成一颗心。你现在牌桌两边都打过了。下一课：再来一副牌 —— 那三条你只在纸上读过的法则，这回由你亲手打出来。'
        ),
      },
      { kind: 'result' },
    ],
  },
  {
    id: 'defense-rules',
    title: T('Defense III: Three Rules, One Deal', '防守三：三条法则，一副牌'),
    dealer: 'W',
    hands: DEFENSE_RULES_DEAL,
    contract: { level: 3, denom: 'NT', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: T(
          "Two lessons of defense, and three rules are yours: third hand high, cover an honor, fourth hand low. Three more are waiting — and this time you play all three with your own cards. You are WEST, South declares 3NT, your side needs five tricks. Look at your hand before you lead: ♠K-Q-J, ♥K-J-T-9, and the ♣K. Two sequences and an honor — this deal was built for them.",
          '两课防守下来，你已经有了三条法则：第三家出大、大牌盖大牌、第四家放小。还有三条在等着 —— 而且这一回，三条都由你亲手打出来。你还是西家，南家打3NT，你们需要五墩。领牌之前先看你自己的牌：♠K-Q-J、♥K-J-T-9，还有♣K。两个连张加一张大牌 —— 这副牌就是为它们量身做的。'
        ),
      },
      {
        kind: 'play',
        script: [
          {
            seat: 'W', learner: true, expected: 'KS',
            hint: T('The king of spades (KS) — the top of your sequence.', '黑桃K (KS) —— 连张的顶张。'),
          },
          { seat: 'N', card: '5S' },
          { seat: 'E', card: '2S' },
          { seat: 'S', card: 'AS' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "South took it with the ace — good, that is the point. You led the KING out of K-Q-J, not a small spade, and now the queen and jack are the two highest spades left in the whole deal. LEAD THE TOP OF A SEQUENCE: the top card says \"the two below me are mine as well\", so partner reads your whole suit from one card. Declarer now starts running diamonds and you have only two of them — follow, and throw away cards that cost you nothing.",
          '南家用A收下 —— 很好，这正是目的。你从K-Q-J里领出的是K，不是一张小黑桃，现在Q和J就是全场最大的两张黑桃。连张领顶张：顶张等于在说“下面两张也是我的”，搭档看你一张牌就能数清你整门。庄家开始跑方块了，你只有两张 —— 跟着跟，把用不上的牌垫掉。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: 'AD' },
          { seat: 'W', card: '6D' },
          { seat: 'N', card: '2D' },
          { seat: 'E', card: '3D' },
          { seat: 'S', card: 'KD' },
          { seat: 'W', card: 'TD' },
          { seat: 'N', card: '4D' },
          { seat: 'E', card: '5D' },
          { seat: 'S', card: 'QD' },
          { seat: 'W', card: '5C' },
          { seat: 'N', card: '8D' },
          { seat: 'E', card: '7D' },
          { seat: 'S', card: 'JD' },
          { seat: 'W', card: '7S' },
          { seat: 'N', card: '3C' },
          { seat: 'E', card: '4C' },
          { seat: 'S', card: '9D' },
          { seat: 'W', card: '9H' },
          { seat: 'N', card: '6C' },
          { seat: 'E', card: '9C' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Five diamonds and the ace of spades — declarer has eight of the nine he needs. One more trick and 3NT makes. Every card left on the table belongs to you or to partner, if you read the chairs. Declarer leads a small heart.",
          '五墩方块加黑桃A —— 庄家已经拿到他要的九墩里的八墩。再给他一墩，3NT就做成了。桌上剩下的每一张牌，不是你手里就是搭档手里 —— 前提是你看得懂座位。庄家领出一张小红桃。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', card: '2H' },
          {
            seat: 'W', learner: true, expected: 'TH',
            hint: T('The ten of hearts (TH) — you are second hand, and the ace is sitting in dummy.', '红桃T (TH) —— 你是第二家，A 明摆在明手。'),
          },
          { seat: 'N', card: 'AH' },
          { seat: 'E', card: '4H' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Dummy's ace won it — exactly what you wanted. Look at what you did NOT spend: you sit SECOND hand, right behind declarer, holding K-J-T. You played the TEN, the cheapest card of the sequence, and kept the king. Cover with the king and dummy's ace swallows it, leaving you with nothing but small cards. SECOND HAND LOW: the player on your right leads, you are second, and a bigger honor is waiting behind you — go cheap and save yours for the trick it can actually win. That king wins trick twelve.",
          '明手的A赢下 —— 这正是你要的。看看你没花掉什么：你是第二家，坐在庄家后面，手里是K-J-T。你出的是T，连张里最便宜的那张，K留住了。要是拿K去盖，明手的A一口吃掉它，你就只剩一堆小牌。第二家放小：右手方领牌、你是第二家，后面还坐着一张更大的牌，就便宜地出，把自己的大牌留到真正能赢的那一墩。那张K，最后赢了第十二墩。'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', card: 'AC' },
          { seat: 'E', card: 'JC' },
          { seat: 'S', card: '2C' },
          { seat: 'W', card: '8C' },
        ],
      },
      {
        kind: 'info',
        text: T(
          "Dummy cashes the ace of clubs and leads a spade. You are last to play, holding Q-J — two touching honors, and nothing above them left in the deal. Which one do you spend?",
          '明手兑现梅花A，然后领出黑桃。你是最后一家，手里是Q-J —— 两张挨着的大牌，全场已经没有比它们更大的了。你出哪一张？'
        ),
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', card: '9S' },
          { seat: 'E', card: 'TS' },
          { seat: 'S', card: '4S' },
          {
            seat: 'W', learner: true, expected: 'JS',
            hint: T('The jack (JS) — follow low from a sequence; the queen is still yours.', 'J (JS) —— 连张跟小牌；Q 还留在你手里。'),
          },
        ],
      },
      {
        kind: 'info',
        text: T(
          "The JACK, not the queen — and the queen took the very next trick. That is the other half of the rule: LEAD HIGH, FOLLOW LOW. Leading from touching honors, take the top one so partner can read you; merely following with them, spend the lowest, because it does the same job and saves the big one for later. Three rules, all played by you: the top of a sequence at trick one, second hand low at trick seven, the bottom of a sequence at trick nine. Defensive tricks ♠J ♠Q ♣K ♥K ♥J — five of them, and 3NT is down one. The hand is decided; take your tricks.",
          '出的是J，不是Q —— 而Q下一墩就赢了。这就是同一条法则的另一半：领牌出大，跟牌出小。你领出挨着的大牌时，取最大的那张，搭档才读得懂你；你只是跟牌时，出最小的那张，因为它干的是一样的活，还把大的留到后面。三条法则，你都亲手打了一遍：第一墩连张顶张，第七墩第二家放小，第九墩连张底牌。防守方五墩 —— ♠J、♠Q、♣K、♥K、♥J，3NT 宕一。这手牌已经定了，把该你的赢墩收下。'
        ),
      },
      {
        kind: 'play',
        runout: true,
        script: [
          { seat: 'W', card: 'QS' },
          { seat: 'N', card: '8S' },
          { seat: 'E', card: '3S' },
          { seat: 'S', card: 'QC' },
          { seat: 'W', card: 'KC' },
          { seat: 'N', card: '6S' },
          { seat: 'E', card: 'TC' },
          { seat: 'S', card: '7C' },
          { seat: 'W', card: 'KH' },
          { seat: 'N', card: 'QH' },
          { seat: 'E', card: '8H' },
          { seat: 'S', card: '3H' },
          { seat: 'W', card: 'JH' },
          { seat: 'N', card: '6H' },
          { seat: 'E', card: '7H' },
          { seat: 'S', card: '5H' },
        ],
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
{ kind: 'info', text: T("Last lesson asked what we can promise. Bidding finds the answer together: do we have enough strength for game, and should we play 3NT, 4♥ or 4♠? Exchange point ranges and suit lengths; do not bid just to outshout someone.", "上一课问我们能承诺多少墩。叫牌就是两人一起找答案：实力够不够成局，适合打3NT、4♥还是4♠？交换点力范围与花色长度，不是比谁喊得高。") },
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
    title: T("Answer Partner", "回答搭档"),
    dealer: 'N',
    hands: RESPONSE_DEAL,
    contract: { level: 2, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
{ kind: 'info', text: T("Before choosing any call, ask: MAY I PASS? In the uncontested partnership auctions taught here, a hand-showing bid with no stated upper limit is forcing. “6+” gives a floor, not a ceiling: partner may be very strong, so you cannot assume the minimum and pass. Then ask how long the obligation lasts: one round, or all the way to game?", "选择叫牌之前，先问：我能不能不叫？本课无干扰搭档叫牌中，没上限的牌一定逼叫。6点以上只有下限、没有封顶：搭档可能很强，不能擅自按最低点力就Pass。接着再问：这次义务只是一轮，还是必须一直到成局？") },
{ kind: 'info', text: T("Partner opens 1♣. Your job is to help answer both questions: how high, and in which strain? Respond with about 6 points or more to a one-level suit opening; with 0–5 you usually pass. A pass IS a reply. A forcing bid is different: you must keep the auction alive even if unsure.", "搭档开叫1♣。你要帮助回答两个问题：叫多高、打什么？对一阶花色开叫，约6点以上通常应叫；0–5点通常不叫。不叫也是回答。但逼叫不同：即使没把握，也要继续叫，不能随意停下。") },
{ kind: 'info', text: T("Over 1♣ or 1♦, look for a major fit before raising a minor. A one-level new-suit response needs at least four cards and about 6 points; bid four-card suits up the line, hearts before spades when both have four. A five-card suit may be shown first. When an unpassed responder faces a 1♥ or 1♠ opening without interference, a non-jump new suit at the two level is a two-over-one GAME FORCE: it shows game-going strength, 13+ points under the latest course agreement, not merely 10. Over 1♠, a 2♥ response also promises five hearts.", "对1♣或1♦，先寻找高花配合，再考虑加叫低花。一阶新花应叫至少四张、约6点；四张套尽量由低到高，红桃黑桃各四张时先红桃。五张长套可以先报。未Pass过的应叫者，在对方没有干扰时，对1♥或1♠作二阶不跳新花应叫，属于二盖一逼局：需要经评估达到成局实力，按最新课件采用13点以上，不能仅凭10点就这样叫。对1♠应叫2♥还保证五张红桃。") },
{ kind: 'info', text: T("Support needs context. After a five-card major OPENING, three-card support makes an eight-card fit; a simple raise shows about 6–9 support points. After a four-card major RESPONSE, opener normally needs FOUR to raise. Three cards do not prove a fit. Raising a minor needs more length: normally four diamonds or five clubs.", "支持要看前提。五张高花开叫后，三张支持就有八张配合；简单加叫约表示6–9支持点。但四张高花应叫后，开叫者通常需要四张才能加叫，三张不能确认配合。低花加叫需要更多张数：通常方块四张、梅花五张。") },
{ kind: 'info', text: T("Without a fit or a four-card suit you can show at the one level, use 1NT as a waiting response with about 5–12 points. A flat minimum opener may pass, while an unbalanced opener continues describing the hand. This is different from a 15–17 balanced 1NT opening. Detailed notrump conventions are taught in the advanced part.", "没有配合，也没有能在一阶说明的四张花色时，可用约5–12点的1NT过渡。平弱低限开叫可Pass，非均型继续描述。这不同于15–17均型的1NT开叫。详细无将约定留在进阶篇。") },
{ kind: 'info', text: T("This deal: North has 13 points, four clubs and four hearts; no five-card major, and too little for 1NT. North opens 1♣. You have 8 points and five hearts: respond 1♥. Your bid only promises four, so North uses FOUR hearts to raise. You can count 5+4=9, but North’s decision does not rely on seeing your fifth heart.", "这副牌：北家13点、四张梅花和四张红桃，没有五张高花，点力又不够1NT，所以开1♣。你有8点、五张红桃，应叫1♥。你的应叫只保证四张，因此北家凭自己的四张红桃加叫。你能数出5+4=9，但北家的决定不能依赖偷看你的第五张红桃。") },
{ kind: 'info', text: T("Strength controls natural raises: with three or more cards supporting a major opening, 2 of the major shows 6–9 (minimum), 3 shows 10–12 (invitational), and 4 chooses game when the combined strength is sufficient. In a natural raise, higher commitments show more strength. An explicitly named agreement, such as an inverted minor raise or Jacoby 2NT, must instead be read by its agreed meaning.", "实力决定自然加叫高度：对高花开叫有三张以上支持，2高花表示6–9点低限，3高花表示10–12点邀请，4高花在联手实力足够时选择成局。自然加叫越高，表示实力越强；明确约定的低花反加叫、雅各比2NT等则按约定含义判断。") },
{ kind: 'info', text: T("A forcing bid may require only one further round: an unpassed 1♥–1♠ response asks opener to speak again. By contrast, an uncontested 1♥–2♣ response with 13+ establishes a two-over-one game force. Even a minimum opener must continue until game; the next bids choose the best strain.", "逼叫可以只要求再说一轮：未Pass过的一盖一1♥—1♠要求开叫者再叫。相对地，无干扰时以13点以上应叫1♥—2♣，建立二盖一逼局。开叫即使低限也要继续到成局；后面的叫牌选择最佳定约方向。") },
{ kind: 'info', text: T("Dating Model: two people each privately hold an affection value from 1–8. They start 3 spaces apart and may hug only when their total is at least 9. Moving a combined 3 spaces completes the hug. This is a toy model of exchanging ranges, not bridge point counts or bid levels.", "约会模型：两个人各自秘密持有1–8点爱意，相距3格；合计至少9点才可以拥抱，两人累计走满3格就拥抱。这是交换范围的信息模型，不是桥牌点数，也不是叫牌阶数。") },
{ kind: 'info', text: T("Opening agreement: with 8, you can walk all 3 spaces, since even 8+1=9. With 7, walk 2 spaces as a strong invitation. With 5–6, walk 1 as an ordinary invitation. With 1–4, pass initially. That first pass leaves the other person a turn to invite; only two opening passes end the game.", "开局约定：8点可直接走3格，因为即使8+1=9也足够。7点走2格作强邀请；5–6点走1格作普通邀请；1–4点开局先Pass。第一次开局Pass后，另一人仍可邀请；两人开局都Pass才结束。") },
{ kind: 'info', text: T("Invitation means “we may have enough; decide using your own value.” After the 7-point person walks 2, the other accepts by walking the last 1 with 2–8 points, but passes with 1. After a 5–6-point invitation of 1 space, a responder with 4–8 walks the remaining 2; with 1–2, pass.", "邀请的意思是：“我们可能够了，请用你自己的实力决定。”7点者走2格后，对方有2–8点就走最后1格接受，只有1点则Pass。5–6点走1格普通邀请后，对方4–8点就走余下2格接受，1–2点则Pass。") },
{ kind: 'info', text: T("Counter-invitation: after a 5–6-point invitation, a responder with 3 walks just 1 space. The message is “my 3 is enough only if you are the top of your range.” The inviter with 6 walks the final 1; the inviter with 5 passes. You learned more without anyone revealing an exact value at the start.", "反邀请：面对5–6点的邀请，持3点者只走1格，表示：“我的3点，只有配上你范围里的高限才够。”原邀请者有6点就走最后1格，有5点则Pass。双方一开始没有公开精确点数，却通过行动补足了信息。") },
{ kind: 'info', text: datingExample(8, 1) },
{ kind: 'info', text: datingExample(7, 2) },
{ kind: 'info', text: datingExample(6, 3) },
{ kind: 'info', text: datingExample(5, 3) },
{ kind: 'info', text: T("Game force is a commitment, not the same as jumping directly to game. An 8-point person knows the minimum total is already 9, so can declare a game-force commitment and walk only 1 first. Neither may stop below the hug; they can still exchange information about the route. Directly walking 3 instead finishes the conversation immediately.", "逼局是一项承诺，不等于直接跳到成局。8点者知道最低合计已经是9，可以先宣布逼局承诺，只走1格；双方都不能在拥抱之前停下，但仍能交换信息选择路线。若直接走3格，则是立即完成目标、结束交流。") },
{ kind: 'info', text: T("Bridge connection: an invitation lets partner accept with extra strength or decline with a minimum. A game force says “we must reach game,” while leaving room to choose a major or no-trump and perhaps explore slam. Being unsure is not permission to pass a forcing bid. A counter-invitation is an analogy for a further conditional message, not a universal two-over-one bid with a fixed meaning.", "对应桥牌：邀请让搭档高限接受、低限拒绝；逼局表示“必须至少成局”，同时仍可选择高花或无将，甚至探索满贯。不确定，不能成为对逼叫随意Pass的理由。反邀请类比的是进一步有条件地交换信息，不是一种在所有二盖一进程中都具有固定含义的叫品。") },
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
  {
    id: 'full-hand',
    title: T("Raise and Play", "加叫，然后打牌"),
    dealer: 'N',
    hands: RESPONSE_DEAL,
    contract: { level: 2, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
{ kind: 'info', text: T("Now play a complete hand after a sensible auction. North has 13 points, you have 8: the same 1♣–1♥–2♥ conversation stops in a partscore. A fit tells us WHERE; the combined strength tells us HOW HIGH. Both partners use the strength ranges they have actually shown.", "现在用合理的叫牌，打完一整副牌。北家13点，你8点；同样的1♣—1♥—2♥对话停在部分定约。配合告诉我们打什么，联手实力告诉我们叫多高，两人都根据已经承诺的实力范围作决定。") },
{ kind: 'auction', script: [{ seat: 'N', bid: "1C", note: T("1♣: 13 points, four clubs, no five-card major.", "1♣：13点、四张梅花，没有五张高花。") },
{ seat: 'E', bid: "P", note: T("East has no suitable overcall and passes.", "东家没有合适的争叫，选择不叫。") },
{ seat: 'S', learner: true, expected: "1H", hint: T("Choose 1H.", "请选择1H。"), note: T("1♥: at least four hearts and 6+ points; this hand has five and 8.", "1♥：至少四张红桃、6点以上；这手实际五张、8点。") },
{ seat: 'W', bid: "P", note: T("West passes; this is an uncontested partnership auction.", "西家不叫，这是没有争叫的搭档对话。") },
{ seat: 'N', bid: "2H", note: T("2♥: minimum opening strength and FOUR-card heart support.", "2♥：低限开叫实力，并有四张红桃支持。") },
{ seat: 'E', bid: "P", note: T("East passes again; no competitive bid is justified.", "东家再次不叫，没有理由勉强争叫。") },
{ seat: 'S', learner: true, expected: "P", hint: T("Choose P.", "请选择P。"), note: T("Pass: 8 points opposite a minimum opening, well short of game. Finding a fit does not create extra high-card points.", "不叫：8点面对低限开叫，离成局还远。找到配合，不会凭空增加大牌点。") },
{ seat: 'W', bid: "P", note: T("The third pass ends the auction at 2♥ by South.", "第三次不叫结束叫牌，南家打2♥。") }] },
{ kind: 'info', text: T("2♥ by South promises 8 tricks. North is dummy. West leads the king of diamonds; win with dummy’s ace, then draw the opponents’ trumps. Count: your five hearts plus dummy’s four leave 4 outside.", "南家打2♥，承诺8墩，北家是明手。西家首攻方块K，用明手的A拿下，再清对方的将牌。数一数：你的五张加明手四张，外面还有4张。") },
{ kind: 'play', script: [{ seat: 'W', card: "KD" },{ seat: 'N', learner: true, expected: "AD", hint: T("From dummy: AD.", "从明手打出AD。") },{ seat: 'E', card: "4D" },{ seat: 'S', learner: true, expected: "2D", hint: T("From your hand: 2D.", "从你手里打出2D。") }] },
{ kind: 'info', text: T("Lead a small heart from dummy toward your ace. Then cash your king. The defenders each hold two hearts: two rounds draw all 4 enemy trumps. Keep counting rather than drawing automatically.", "从明手领小红桃到你的A，再兑现K。防守方各有两张红桃，两轮清掉对方全部4张将牌。要靠数牌，不能机械地一直清。") },
{ kind: 'play', script: [{ seat: 'N', learner: true, expected: "6H", hint: T("From dummy: 6H.", "从明手打出6H。") },{ seat: 'E', card: "7H" },{ seat: 'S', learner: true, expected: "AH", hint: T("From your hand: AH.", "从你手里打出AH。") },{ seat: 'W', card: "2H" }] },
{ kind: 'play', script: [{ seat: 'S', learner: true, expected: "KH", hint: T("From your hand: KH.", "从你手里打出KH。") },{ seat: 'W', card: "TH" },{ seat: 'N', learner: true, expected: "8H", hint: T("From dummy: 8H.", "从明手打出8H。") },{ seat: 'E', card: "3H" }] },
{ kind: 'info', text: T("The enemy trumps are gone. Cross to dummy by leading a small club toward the ace, then cash the king. This is an entry: a way to reach the other hand’s winners. Follow suit when you can; only discard when you have none of the suit led.", "对方将牌已清完。从手里领小梅花到明手的A，再兑现K。这就是进手：到另一手兑现赢墩的通道。有领出花色就必须跟，缺门时才能垫牌。") },
{ kind: 'play', script: [{ seat: 'S', learner: true, expected: "6C", hint: T("From your hand: 6C.", "从你手里打出6C。") },{ seat: 'W', card: "9C" },{ seat: 'N', learner: true, expected: "AC", hint: T("From dummy: AC.", "从明手打出AC。") },{ seat: 'E', card: "4C" }] },
{ kind: 'play', script: [{ seat: 'N', learner: true, expected: "KC", hint: T("From dummy: KC.", "从明手打出KC。") },{ seat: 'E', card: "JC" },{ seat: 'S', learner: true, expected: "7C", hint: T("From your hand: 7C.", "从你手里打出7C。") },{ seat: 'W', card: "2C" }] },
{ kind: 'play', script: [{ seat: 'N', learner: true, expected: "QH", hint: T("From dummy: QH.", "从明手打出QH。") },{ seat: 'E', card: "5D" },{ seat: 'S', learner: true, expected: "4H", hint: T("From your hand: 4H.", "从你手里打出4H。") },{ seat: 'W', card: "3C" }] },
{ kind: 'play', script: [{ seat: 'N', learner: true, expected: "9H", hint: T("From dummy: 9H.", "从明手打出9H。") },{ seat: 'E', card: "9S" },{ seat: 'S', learner: true, expected: "5H", hint: T("From your hand: 5H.", "从你手里打出5H。") },{ seat: 'W', card: "4S" }] },
{ kind: 'play', script: [{ seat: 'N', learner: true, expected: "TC", hint: T("From dummy: TC.", "从明手打出TC。") },{ seat: 'E', card: "QC" },{ seat: 'S', learner: true, expected: "8C", hint: T("From your hand: 8C.", "从你手里打出8C。") },{ seat: 'W', card: "6S" }] },
{ kind: 'play', script: [{ seat: 'E', card: "KS" },{ seat: 'S', learner: true, expected: "3S", hint: T("From your hand: 3S.", "从你手里打出3S。") },{ seat: 'W', card: "QS" },{ seat: 'N', learner: true, expected: "2S", hint: T("From dummy: 2S.", "从明手打出2S。") }] },
{ kind: 'play', script: [{ seat: 'E', card: "QD" },{ seat: 'S', learner: true, expected: "7D", hint: T("From your hand: 7D.", "从你手里打出7D。") },{ seat: 'W', card: "6D" },{ seat: 'N', learner: true, expected: "3D", hint: T("From dummy: 3D.", "从明手打出3D。") }] },
{ kind: 'play', script: [{ seat: 'E', card: "JS" },{ seat: 'S', learner: true, expected: "7S", hint: T("From your hand: 7S.", "从你手里打出7S。") },{ seat: 'W', card: "AS" },{ seat: 'N', learner: true, expected: "5S", hint: T("From dummy: 5S.", "从明手打出5S。") }] },
{ kind: 'play', script: [{ seat: 'W', card: "TD" },{ seat: 'N', learner: true, expected: "9D", hint: T("From dummy: 9D.", "从明手打出9D。") },{ seat: 'E', card: "JD" },{ seat: 'S', learner: true, expected: "JH", hint: T("From your hand: JH.", "从你手里打出JH。") }] },
{ kind: 'play', script: [{ seat: 'S', learner: true, expected: "8S", hint: T("From your hand: 8S.", "从你手里打出8S。") },{ seat: 'W', card: "8D" },{ seat: 'N', learner: true, expected: "5C", hint: T("From dummy: 5C.", "从明手打出5C。") },{ seat: 'E', card: "TS" }] },
{ kind: 'info', text: T("All 13 tricks are played. You took 8, against a promise of 8. The score is 110. An overtrick does not prove the bidding was wrong: we bid from the information available, not from seeing all four hands. You have raised, planned, drawn trump, used an entry and completed a whole hand.", "13墩全部打完，你赢了8墩，承诺是8墩，得分110。有超墩不等于叫牌错误：叫牌根据当时的信息判断，不是看见四手牌后倒推。你已经练习了加叫、计划、清将牌、进手，并打完一整副牌。") },
{ kind: 'result' },
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
          'Now you speak AGAIN. Your second message has a special name: a REBID. What new thing can you say? Your hearts are SIX long — that is news! One heart bid could have been 5. In this uncontested 1♥–1♠–2♥ sequence, the minimum rebid normally shows six hearts. That is why rebidding your suit is never "repeating yourself" — the second mention carries new information.',
          '现在你再说一次。你的第二条消息有个专门的名字：再叫。你能说什么新东西？你的红桃有6张 —— 这就是新闻！叫一次红桃可能只有5张。在这里无争叫的1♥—1♠—2♥进程中，低限再叫通常表示六张红桃。所以再叫自己的花色从来不是"重复自己" —— 第二次提及带着新信息。'
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
    hands: GAME_DEAL,
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
          '6以上的每一墩都给分，分多少看花色：高花（♥ ♠）每墩30分。低花（♦ ♣）每墩20分。无将第一墩40分，之后每墩30分。这正是高花"受欢迎"的原因 —— 一样的墩数，更多的钱。'
        ),
      },
      {
        kind: 'info',
        text: T(
          'Remember game from the contract lesson? Here is its exact line: if your contract itself scores 100 points or more, it is called GAME — and the game pays a fat bonus: +300 points on top! Do the math with me: 4♥ = 4 × 30 = 120. Over 100 — GAME. 3NT = 40 + 30 + 30 = 100. Exactly 100 — GAME. The game contracts are: 3NT, 4♥, 4♠, 5♣, 5♦. (Minors need 5 because 4 × 20 = 80 — not enough!)',
          '还记得定约课里的成局吗？这里是它的精确分数线：如果你的定约本身达到100分或以上，就叫成局 —— 成局还有一份厚厚的奖励：额外+300分！跟我算：4♥ = 4 × 30 = 120。超过100 —— 成局。3NT = 40 + 30 + 30 = 100。正好100 —— 成局。成局的定约有：3NT、4♥、4♠、5♣、5♦。（低花需要到5，因为4 × 20 = 80 —— 不够！）'
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
        text: T("You hold 19 points: ♠A (4), ♥A K Q J (10), ♦A (4), ♣J (1). Five hearts and an unbalanced hand: open 1♥. When partner raises, use the promised range, not the face-up cards, to decide about game.", "你有19点：♠A（4）、♥A K Q J（10）、♦A（4）、♣J（1）。五张红桃，非均型，开1♥。搭档加叫后，要根据承诺的范围判断成局，而不是偷看翻开的牌。"),
      },
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
      {
        kind: 'info',
        text: T("Why 4♥ rather than an invitation of 3♥? You have enough strength to choose game opposite this raise. With a weaker opening hand you might invite or pass instead. Bidding higher is a decision about partnership strength, not a way to silence the opponents.", "为什么叫4♥而不是3♥邀局？你的实力足以在这次加叫后选择成局。如果开叫较弱，就可能邀局或不叫。叫高是联手实力的判断，不是为了堵住对手说话。"),
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
          { seat: 'W', card: "JD" },
          { seat: 'N', card: '2D' },
          { seat: 'E', card: "4D" },
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
"losers": { focus: T("Count losers from the long-trump hand, use dummy’s honors to cover them, and compare with the contract’s losing budget.", "从长将牌一方数输墩，用明手大牌补足，再和定约允许的输墩数比较。"), lead: T("West leads the queen of hearts. Dummy’s king covers a heart loser; preserve the ace in your hand. Keep the loser count separate from the winner count.", "西家首攻红桃Q。明手的K能补上一个红桃输墩，保留手中的A。数输墩与数赢墩不要混淆。") },
"eliminate": { focus: T("Eliminate losers with discards on established winners and ruffs in dummy. Delay drawing trump when those ruffs are needed.", "用树立后的赢墩垫输牌、用明手将吃消去输墩；需要将吃时先不急着清将牌。"), lead: T("West leads the queen of spades. Dummy’s ace wins; now plan to establish clubs for discards and use dummy’s trumps for a diamond ruff.", "西家首攻黑桃Q，用明手A拿下。计划是树立梅花垫输牌，并保留明手将牌将吃方块。") },
"defense-leads": { focus: T("Choose the opening suit and lead: fourth best from length, top of a sequence. Use only your hand, dummy and the auction.", "选择首攻花色与张数：长套第四张，连张出最大。只根据自己的牌、明手与叫牌判断。"), lead: T("You lead the 4 of hearts from K-10-8-4 against 3NT: fourth best from your longest suit. This gives partner a chance to help establish it; it does not tell you partner’s hidden cards.", "你对3NT从红桃K-10-8-4首攻4：长套第四张。给搭档机会帮助树立花色，但不能事先假定搭档的暗牌。") },
"defense-play": { focus: T("Work with partner: third hand high, second hand low, cover an honor when it promotes a card, and avoid wasting two winners together.", "配合搭档：第三家出大，第二家出小；盖大牌要能提升赢墩，避免两张赢张撞在同一墩。"), lead: T("Partner leads the 6 of hearts. As third hand, play the king to force declarer’s ace and help promote partner’s queen. Do not duck merely to save your king.", "搭档首攻红桃6。你是第三家，用K逼出庄家A，帮助提升搭档Q，不要只为保留K而机械跟小。") },
"defense-rules": { focus: T("Practise top of a sequence on lead, second hand low, and the cheapest sufficient winner when following.", "实践连张首攻出最大、第二家出小，以及跟牌时用足够赢墩的最小牌。"), lead: T("You lead the king of spades from K-Q-J. The king is the top of a sequence; forcing out the ace can establish the queen and jack.", "你从黑桃K-Q-J首攻K：连张出最大，逼出A后可以树立Q和J。") },
"contract": { focus: T("A contract is level + 6 tricks. Combine point strength and an eight-card fit to decide whether to promise game; count enemy trumps until all are gone.", "定约承诺阶数+6墩。结合联手点力与八张配合判断成局，清将时数到对方最后一张将牌。"), lead: T("West leads the ace of clubs against 4♠. This is one of your planned club losers: follow suit, then manage the remaining two losers and draw all enemy trumps.", "西家对4♠首攻梅花A。这是计划内的梅花输墩，必须跟牌；之后控制其余两个输墩，并清完对方将牌。") },
"bidding": { focus: T("Bidding exchanges strength ranges and suit lengths to choose the level and strain. Learn the five one-level openings and how 5–3 and 4–4 major fits are found.", "用叫牌交换实力范围和花色长度，决定高度与定约方向。掌握五种一阶开叫，以及5–3、4–4高花配合的寻找方法。"), lead: T("", "") },
"minor-responses": { focus: T("First decide whether you may pass: an uncapped hand-showing bid is forcing. Then describe strength and fit, distinguishing one-round forces from game forces.", "先判断能否不叫：没上限的描述性叫品一定逼叫。再说明实力与配合，区分逼叫一轮和逼局。"), lead: T("", "") },
"full-hand": { focus: T("Raise with the promised support and strength, then play one complete hand: plan, draw trump, use entries and follow suit.", "按支持张数和实力加叫，再完整打牌：计划、清将牌、进手与跟牌。"), lead: T("West leads the king of diamonds. Dummy’s ace can win immediately. Plan to draw the four outside hearts, then use a small club to reach dummy’s club winners.", "西家首攻方块K，明手A可以立即拿下。计划先清外面的四张红桃，再从手里领小梅花到明手兑现赢墩。") },
"conversation": { focus: T("An opener’s rebid narrows both length and strength. Use the new information to stop, invite or commit to game; each message must help the partnership decision.", "开叫者再叫进一步说明长度和实力。根据新信息选择停叫、邀请或逼局，每条消息都帮助两人作决定。"), lead: T("", "") },
"scoring": { focus: T("Distinguish trick points from bonuses. Bid game when the partnership has enough strength and a suitable fit; a partscore is right when game is not justified.", "区分墩分与奖分。联手实力足、配合合适时叫成局，不够时停部分定约。"), lead: T("West leads the jack of diamonds against 4♥. Follow diamonds and win with your ace. The bidding chose game from strength and fit; the play must now deliver 10 tricks.", "西家对4♥首攻方块J。有方块必须跟，用A拿下。叫牌根据实力与配合选择了成局，现在打牌要兑现10墩。") },
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
