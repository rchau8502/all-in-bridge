/**
 * lessons.ts — tutorial lesson content.
 *
 * Fixed deals, fixed scripts. Every scripted bid/play is validated by the
 * engine as it is applied, so authoring mistakes surface as test failures.
 *
 * The shared practice deal (lessons 1 & 4). South (the learner) holds
 * 5 hearts to the AKQJ — the hand the full-hand lesson is built around.
 */

import { parseCard } from './deck.js';
import type { Hands, Seat } from './deck.js';
import type { Lesson } from './tutorial.js';

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

export const LESSONS: Lesson[] = [
  {
    id: 'tricks',
    title: 'Winning tricks',
    dealer: 'N',
    hands: PRACTICE_DEAL,
    contract: FULL_HAND_CONTRACT,
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: 'Welcome to bridge! Everything starts with tricks. Four players sit North, East, South, West — you are South. Each trick, one player leads a card, and everyone else must follow suit (play the same suit) if they can.',
      },
      {
        kind: 'info',
        text: 'The highest card of the led suit wins the trick. Watch the first trick: West leads.',
      },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '4D' },
          { seat: 'N', card: '2D' },
          { seat: 'E', card: '9D' },
          { seat: 'S', learner: true, expected: 'AD', hint: 'Diamonds were led. Play your ace of diamonds (AD) to win the trick.' },
        ],
      },
      { kind: 'info', text: 'You won the trick! Whoever wins a trick leads the next one.' },
      {
        kind: 'play',
        script: [
          { seat: 'S', learner: true, expected: 'AH', hint: 'Lead your ace of hearts (AH).' },
          { seat: 'W', card: '2C' },
          { seat: 'N', card: '6H' },
          { seat: 'E', card: '2H' },
        ],
      },
      {
        kind: 'quiz',
        question: 'West played the 2 of clubs while hearts were led. Why is that allowed?',
        options: ['West had no hearts left', 'Clubs beat hearts', 'West felt like it'],
        answer: 0,
        explain: 'You only have to follow suit when you hold a card of the led suit. West was out of hearts, so any discard was legal.',
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', learner: true, expected: 'KH', hint: 'Lead the king of hearts (KH).' },
          { seat: 'W', card: '8C' },
          { seat: 'N', card: '7H' },
          { seat: 'E', card: '3H' },
        ],
      },
      { kind: 'info', text: 'Three for three! A real hand has 13 tricks. Next: how the auction decides the contract.' },
    ],
  },
  {
    id: 'bidding',
    title: 'Bidding basics',
    dealer: 'N',
    hands: PRACTICE_DEAL,
    contract: { level: 2, denom: 'H', declarer: 'S', doubled: 0 },
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: 'Before any card is played, the auction decides the contract. Players bid in turn. Each bid must top the last one: a higher level, or the same level in a higher suit. Suits rank: clubs < diamonds < hearts < spades < no-trump.',
      },
      {
        kind: 'auction',
        script: [
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: '1D' },
          { seat: 'S', learner: true, expected: '1H', hint: 'East opened 1 diamond. You have 5 hearts — bid 1 heart (1H).' },
        ],
      },
      { kind: 'info', text: '1H outranks 1D because hearts are a higher-ranking suit than diamonds.' },
      {
        kind: 'auction',
        script: [
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: '2D' },
          { seat: 'S', learner: true, expected: '2H', hint: 'East raised to 2 diamonds. Show your hearts again: bid 2H.' },
        ],
      },
      { kind: 'info', text: 'Three consecutive passes end the auction.' },
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
        question: 'The final contract is 2H. Who is the declarer?',
        options: [
          'South — first of their side to bid hearts',
          'East — they bid diamonds first',
          'North — the dealer',
        ],
        answer: 0,
        explain: "The declarer is the first player of the winning side to bid the contract's denomination. South bid hearts first, so South declares.",
      },
    ],
  },
  {
    id: 'scoring',
    title: 'Contracts and scoring',
    dealer: 'N',
    hands: PRACTICE_DEAL,
    contract: FULL_HAND_CONTRACT,
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: 'The contract names a level and a denomination. 2H means: with hearts as trumps, your side must take at least 6 + 2 = 8 of the 13 tricks.',
      },
      {
        kind: 'quiz',
        question: 'Your contract is 3NT. How many tricks must you take?',
        options: ['9', '8', '10'],
        answer: 0,
        explain: '6 + 3 = 9 tricks.',
      },
      {
        kind: 'info',
        text: 'Score has two parts: trick points for the tricks you contracted, plus bonuses. Making 3NT exactly (not vulnerable) is 100 trick points + a 300 game bonus = 400.',
      },
      {
        kind: 'quiz',
        question: '3NT made exactly, not vulnerable, scores…',
        options: ['400', '600', '100'],
        answer: 0,
        explain: '100 trick points + 300 game bonus = 400.',
      },
      {
        kind: 'info',
        text: 'Bid and make a slam (the 6 or 7 level) for huge bonuses — up to 1500. Fall short, and the other side scores penalty points for every missing trick. Now: play a full hand!',
      },
    ],
  },
  {
    id: 'full-hand',
    title: 'Play a full hand',
    dealer: 'N',
    hands: PRACTICE_DEAL,
    contract: FULL_HAND_CONTRACT,
    vulnerable: false,
    steps: [
      {
        kind: 'info',
        text: "Time to play a full hand! You're South and North dealt. Look at your hand: 5 hearts to the ace-king-queen-jack — a powerhouse trump suit.",
      },
      {
        kind: 'auction',
        script: [
          { seat: 'N', bid: 'P' },
          { seat: 'E', bid: 'P' },
          { seat: 'S', learner: true, expected: '1H', hint: 'Open 1 heart (1H) — show your 5-card suit.' },
          { seat: 'W', bid: 'P' },
          { seat: 'N', bid: '2H' },
          { seat: 'E', bid: 'P' },
          { seat: 'S', learner: true, expected: 'P', hint: "Partner raised to 2H. That's enough — pass." },
          { seat: 'W', bid: 'P' },
        ],
      },
      { kind: 'info', text: 'Contract: 2H by South. You need 8 tricks with hearts as trumps. West leads.' },
      {
        kind: 'play',
        script: [
          { seat: 'W', card: '4D' },
          { seat: 'N', card: '2D' },
          { seat: 'E', card: '9D' },
          { seat: 'S', learner: true, expected: 'AD', hint: 'Diamonds led — take it with your ace (AD).' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', learner: true, expected: 'AH', hint: 'Draw the enemy trumps: lead your ace of hearts (AH).' },
          { seat: 'W', card: '2C' },
          { seat: 'N', card: '6H' },
          { seat: 'E', card: '2H' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', learner: true, expected: 'KH', hint: 'Keep drawing trumps: king of hearts (KH).' },
          { seat: 'W', card: '8C' },
          { seat: 'N', card: '7H' },
          { seat: 'E', card: '3H' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', learner: true, expected: 'QH', hint: 'Queen of hearts (QH).' },
          { seat: 'W', card: '9C' },
          { seat: 'N', card: '8H' },
          { seat: 'E', card: '4H' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', learner: true, expected: 'JH', hint: 'Jack of hearts (JH) — the last round of trumps.' },
          { seat: 'W', card: '2S' },
          { seat: 'N', card: '9H' },
          { seat: 'E', card: 'TH' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', learner: true, expected: '5H', hint: 'Your last heart (5H) — trumps are all drawn now.' },
          { seat: 'W', card: 'TC' },
          { seat: 'N', card: '4S' },
          { seat: 'E', card: 'JD' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', learner: true, expected: 'AS', hint: 'Cash your spade winners: ace of spades (AS).' },
          { seat: 'W', card: '3S' },
          { seat: 'N', card: 'JS' },
          { seat: 'E', card: '6S' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', learner: true, expected: 'KS', hint: 'And the king (KS).' },
          { seat: 'W', card: '5S' },
          { seat: 'N', card: 'QS' },
          { seat: 'E', card: '7S' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'S', learner: true, expected: '7C', hint: "Now the clubs: lead low toward dummy's ace (7C)." },
          { seat: 'W', card: '5D' },
          { seat: 'N', learner: true, expected: 'AC', hint: "You're also playing dummy's hand — win with the ace of clubs (AC)." },
          { seat: 'E', card: 'JC' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', learner: true, expected: 'KC', hint: 'Lead dummy\'s king of clubs (KC).' },
          { seat: 'E', card: 'TS' },
          { seat: 'S', learner: true, expected: '4C', hint: 'Follow with the 4 of clubs (4C).' },
          { seat: 'W', card: '6D' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', learner: true, expected: 'QC', hint: 'Queen of clubs (QC).' },
          { seat: 'E', card: '9S' },
          { seat: 'S', learner: true, expected: '5C', hint: 'The 5 of clubs (5C).' },
          { seat: 'W', card: '7D' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', learner: true, expected: 'KD', hint: "Cash dummy's diamond king (KD)." },
          { seat: 'E', card: 'TD' },
          { seat: 'S', learner: true, expected: '6C', hint: 'You have no diamonds — discard the 6 of clubs (6C).' },
          { seat: 'W', card: 'QD' },
        ],
      },
      {
        kind: 'play',
        script: [
          { seat: 'N', learner: true, expected: '3D', hint: 'Last trick: dummy\'s low diamond (3D).' },
          { seat: 'E', card: '8S' },
          { seat: 'S', learner: true, expected: '3C', hint: 'No diamonds left — discard your last club (3C).' },
          { seat: 'W', card: '8D' },
        ],
      },
      { kind: 'result' },
      { kind: 'info', text: '12 out of 13 tricks — West snuck the last one with the 8 of diamonds. Still, 2H made with 4 overtricks scores 230. You\'re ready for the tables.' },
    ],
  },
];
