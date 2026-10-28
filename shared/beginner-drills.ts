/**
 * beginner-drills.ts — Zero-experience classroom checkpoint drills.
 *
 * Designed for complete beginners (Day 1, 0 experience) and classroom
 * teaching assistants based on ACBL Intro to Bridge Series 1 (Patty Tucker):
 * 1. Follow Suit Rule (必须跟牌铁律)
 * 2. Book & Contract Math (底墩与目标墩数 6 + N)
 * 3. Trick Winner & Ruffing (谁赢下了这墩：无将大小、有将将吃、垫牌无力)
 * 4. High Card Points (HCP 心算：A=4, K=3, Q=2, J=1)
 * 5. Roles & Table Structure (搭档对坐、定约人、明手摊牌、25点成局线)
 */

import { cardLabel, type Card, type Suit, type Seat } from './deck.js';
import { HCP_VALUES } from './evaluator.js';

export type BeginnerDrillCategory =
  | 'all'
  | 'follow_suit'
  | 'book_math'
  | 'trick_winner'
  | 'hcp_counting'
  | 'roles';

export interface BeginnerDrillOption {
  id: string;
  label: { en: string; zh: string };
  isCorrect: boolean;
  explanation?: { en: string; zh: string } | undefined;
}

export interface BeginnerDrillProblem {
  id: string;
  category: BeginnerDrillCategory;
  categoryLabel: { en: string; zh: string };
  question: { en: string; zh: string };
  contextBadge?: { en: string; zh: string } | undefined;
  cards?: Card[] | undefined;
  trickPlays?: Array<{ seat: Seat; card: Card; label?: string }> | undefined;
  trump?: Suit | null | undefined;
  options: BeginnerDrillOption[];
  explanation: { en: string; zh: string };
  mnemonic?: { en: string; zh: string } | undefined;
}

const CATEGORY_NAMES: Record<BeginnerDrillCategory, { en: string; zh: string }> = {
  all: { en: 'All Topics', zh: '全部新手基石' },
  follow_suit: { en: 'Follow Suit Rule', zh: '必须跟牌铁律' },
  book_math: { en: 'Book & Contract Math', zh: '底墩与定约计算' },
  trick_winner: { en: 'Winning the Trick', zh: '拿墩与将吃判定' },
  hcp_counting: { en: 'HCP Mental Math', zh: '大牌点速算' },
  roles: { en: 'Partners & Roles', zh: '搭档与桌位角色' },
};

/**
 * Generate a Follow Suit drill problem.
 */
function generateFollowSuitProblem(rng: () => number): BeginnerDrillProblem {
  const suits: Suit[] = ['S', 'H', 'D', 'C'];
  const leadSuit = suits[Math.floor(rng() * suits.length)]!;
  const otherSuits = suits.filter(s => s !== leadSuit);
  const leadRank = 10 + Math.floor(rng() * 4); // 10..13 (T, J, Q, K)
  const leadCard: Card = { suit: leadSuit, rank: leadRank };

  // Two variants: holding the lead suit vs void in lead suit
  const hasLeadSuit = rng() > 0.3;

  if (hasLeadSuit) {
    const followCard: Card = { suit: leadSuit, rank: 2 + Math.floor(rng() * 7) }; // 2..8
    const offCards: Card[] = otherSuits.slice(0, 3).map((s, i) => ({
      suit: s,
      rank: 12 + i, // high honors in other suits to tempt learner
    }));

    const handCards = [followCard, ...offCards].sort(() => rng() - 0.5);

    const suitNamesZH: Record<Suit, string> = { S: '黑桃', H: '红桃', D: '方块', C: '梅花' };
    const suitNamesEN: Record<Suit, string> = { S: 'Spades', H: 'Hearts', D: 'Diamonds', C: 'Clubs' };

    const options: BeginnerDrillOption[] = handCards.map(c => ({
      id: cardLabel(c),
      label: {
        en: cardLabel(c),
        zh: cardLabel(c),
      },
      isCorrect: c.suit === leadSuit,
    }));

    return {
      id: `follow_suit_${Date.now()}_${Math.floor(rng() * 1000)}`,
      category: 'follow_suit',
      categoryLabel: CATEGORY_NAMES.follow_suit,
      question: {
        en: `The leader led ${cardLabel(leadCard)} (${suitNamesEN[leadSuit]}). You hold the cards shown below. Which card MUST you play?`,
        zh: `领出方打出 ${cardLabel(leadCard)}（${suitNamesZH[leadSuit]}）。你手握下方所示手牌，根据牌桌铁律你必须出哪张？`,
      },
      contextBadge: {
        en: `Lead Card: ${cardLabel(leadCard)}`,
        zh: `引牌：${cardLabel(leadCard)}`,
      },
      cards: handCards,
      options,
      explanation: {
        en: `Universal Bridge Law: You MUST follow suit if you hold a card of the suit led (${suitNamesEN[leadSuit]}). You hold ${cardLabel(followCard)}, so you must play it regardless of high cards in other suits!`,
        zh: `桥牌铁律：有同花色必须跟出（Follow Suit）！你手中持有同门的 ${cardLabel(followCard)}（${suitNamesZH[leadSuit]}），因此必须跟出该花色，绝对不能贪大垫其他花色！`,
      },
      mnemonic: {
        en: 'Follow Suit: You must play the led suit if you have it!',
        zh: '有同门必须跟，断门方可垫或将',
      },
    };
  } else {
    // Void in lead suit
    const offCards: Card[] = [
      { suit: otherSuits[0]!, rank: 14 },
      { suit: otherSuits[1]!, rank: 9 },
      { suit: otherSuits[2]!, rank: 3 },
    ];

    return {
      id: `follow_suit_void_${Date.now()}_${Math.floor(rng() * 1000)}`,
      category: 'follow_suit',
      categoryLabel: CATEGORY_NAMES.follow_suit,
      question: {
        en: `The leader led ${cardLabel(leadCard)}. You have NO cards in this suit (you are "void"). What can you legally play?`,
        zh: `领出方打出 ${cardLabel(leadCard)}。你手中完全没有该花色（即“断门”）。你此时出牌规则是什么？`,
      },
      contextBadge: {
        en: `Void in ${leadSuit}`,
        zh: `${leadSuit} 花色断门`,
      },
      cards: offCards,
      options: [
        {
          id: 'any',
          label: {
            en: 'You may legally play ANY card from your hand (discard or ruff)',
            zh: '可以合法出手中任意一张其他花色的牌（垫牌或将吃）',
          },
          isCorrect: true,
        },
        {
          id: 'draw',
          label: {
            en: 'You must draw a new card from the deck',
            zh: '必须从未发的牌堆里摸一张同门牌',
          },
          isCorrect: false,
        },
        {
          id: 'pass_turn',
          label: {
            en: 'You must skip your turn',
            zh: '你本轮必须跳过放弃出牌',
          },
          isCorrect: false,
        },
      ],
      explanation: {
        en: 'When you are void in the suit led, the obligation to follow suit ends. You may legally discard any card from your other suits or play a trump to ruff!',
        zh: '当你手中没有领出的花色（断门）时，跟牌约束解除。你可以自由垫出任意其他花色的牌，或者在有将定约中出将牌将吃！',
      },
      mnemonic: {
        en: 'Void means free choice: Discard or Ruff!',
        zh: '手中无同门，出牌获自由',
      },
    };
  }
}

/**
 * Generate a Book & Contract Math drill problem.
 */
function generateBookMathProblem(rng: () => number): BeginnerDrillProblem {
  const levels = [1, 2, 3, 4, 5, 6, 7];
  const denoms = ['NT', 'S', 'H', 'D', 'C'];
  const level = levels[Math.floor(rng() * levels.length)]!;
  const denom = denoms[Math.floor(rng() * denoms.length)]!;
  const contract = `${level}${denom}`;
  const targetTricks = 6 + level;

  // Options: targetTricks, level, 6, and targetTricks +/- 1
  const wrong1 = level;
  const wrong2 = 6;
  const wrong3 = targetTricks > 7 ? targetTricks - 1 : targetTricks + 2;

  const choices = Array.from(new Set([targetTricks, wrong1, wrong2, wrong3]))
    .sort(() => rng() - 0.5)
    .slice(0, 4);

  const options: BeginnerDrillOption[] = choices.map(num => ({
    id: String(num),
    label: {
      en: `${num} tricks`,
      zh: `${num} 墩`,
    },
    isCorrect: num === targetTricks,
  }));

  return {
    id: `book_math_${Date.now()}_${Math.floor(rng() * 1000)}`,
    category: 'book_math',
    categoryLabel: CATEGORY_NAMES.book_math,
    question: {
      en: `The final contract is ${contract}. How many total tricks (out of 13) must declarer win to make the contract?`,
      zh: `叫牌最终定约是 ${contract}。整副牌共 13 墩，庄家一共需要赢下多少墩才算达标成牌？`,
    },
    contextBadge: {
      en: `Contract: ${contract}`,
      zh: `定约：${contract}`,
    },
    options,
    explanation: {
      en: `In bridge, the "Book" is always 6 tricks. The contract level (${level}) is added to the 6-trick book: 6 + ${level} = ${targetTricks} total tricks required!`,
      zh: `桥牌的『底墩 (Book)』恒定为 6 墩。定约阶数（${level} 阶）代表在底墩之上的承诺增量：目标墩数 = 6 + ${level} = ${targetTricks} 墩！`,
    },
    mnemonic: {
      en: 'The Book is 6: Target Tricks = 6 + Bid Level',
      zh: '底墩恒为六，目标等于六加阶',
    },
  };
}

/**
 * Generate a Trick Winner drill problem.
 */
function generateTrickWinnerProblem(rng: () => number): BeginnerDrillProblem {
  const isTrumpScenario = rng() > 0.4;
  const suits: Suit[] = ['S', 'H', 'D', 'C'];

  if (!isTrumpScenario) {
    // No-Trump scenario: highest card of lead suit wins
    const leadSuit = suits[Math.floor(rng() * suits.length)]!;
    const offSuit = suits.find(s => s !== leadSuit)!;

    const leadCard: Card = { suit: leadSuit, rank: 5 };
    const secondCard: Card = { suit: leadSuit, rank: 11 }; // J
    const thirdCard: Card = { suit: leadSuit, rank: 14 }; // A (winner)
    const fourthCard: Card = { suit: offSuit, rank: 13 }; // K in off suit (discard, cannot win)

    const plays = [
      { seat: 'W' as Seat, card: leadCard, label: 'West (Leader)' },
      { seat: 'N' as Seat, card: secondCard, label: 'North' },
      { seat: 'E' as Seat, card: thirdCard, label: 'East' },
      { seat: 'S' as Seat, card: fourthCard, label: 'South (Discard)' },
    ];

    const options: BeginnerDrillOption[] = [
      { id: 'E', label: { en: `East (${cardLabel(thirdCard)})`, zh: `东家 (${cardLabel(thirdCard)})` }, isCorrect: true },
      { id: 'S', label: { en: `South (${cardLabel(fourthCard)})`, zh: `南家 (${cardLabel(fourthCard)})` }, isCorrect: false },
      { id: 'N', label: { en: `North (${cardLabel(secondCard)})`, zh: `北家 (${cardLabel(secondCard)})` }, isCorrect: false },
      { id: 'W', label: { en: `West (${cardLabel(leadCard)})`, zh: `西家 (${cardLabel(leadCard)})` }, isCorrect: false },
    ];

    return {
      id: `trick_nt_${Date.now()}_${Math.floor(rng() * 1000)}`,
      category: 'trick_winner',
      categoryLabel: CATEGORY_NAMES.trick_winner,
      question: {
        en: 'Contract is in No-Trump (NT). Four cards were played in order: W leads ♠5, N plays ♠J, E plays ♠A, S discards ♥K. Who won this trick?',
        zh: '定约为无将（NT）。四家依次出牌：西引 ♠5，北出 ♠J，东出 ♠A，南垫出 ♥K。谁赢下了这一墩？',
      },
      contextBadge: {
        en: 'Contract: No-Trump (NT)',
        zh: '定约：无将 (NT)',
      },
      trickPlays: plays,
      trump: null,
      options,
      explanation: {
        en: 'In No-Trump, the highest card of the suit led wins the trick. Ace is the highest rank. South discarded a King of a different suit, which has no power to win a trick.',
        zh: '在无将定约中，跟出引牌花色（黑桃）中最大牌张者拿墩。♠A 牌面最大赢得该墩！南家垫出的 ♥K 属于不同花色，没有任何吃牌权利。',
      },
      mnemonic: {
        en: 'In NT: Highest card of the led suit wins!',
        zh: '无将看引牌，同门大牌夺胜利',
      },
    };
  } else {
    // Trump scenario: Trump ruffs an Ace
    const trumpSuit: Suit = 'H';
    const leadSuit: Suit = 'C';

    const leadCard: Card = { suit: leadSuit, rank: 14 }; // ♣A
    const secondCard: Card = { suit: leadSuit, rank: 8 }; // ♣8
    const thirdCard: Card = { suit: trumpSuit, rank: 2 }; // ♥2 (Trump Ruff!)
    const fourthCard: Card = { suit: leadSuit, rank: 13 }; // ♣K

    const plays = [
      { seat: 'W' as Seat, card: leadCard, label: 'West (♣A led)' },
      { seat: 'N' as Seat, card: secondCard, label: 'North (♣8)' },
      { seat: 'E' as Seat, card: thirdCard, label: 'East (♥2 Ruff)' },
      { seat: 'S' as Seat, card: fourthCard, label: 'South (♣K)' },
    ];

    const options: BeginnerDrillOption[] = [
      { id: 'E', label: { en: 'East with ♥2 (Trump Ruff)', zh: '东家打出 ♥2（将牌将吃）' }, isCorrect: true },
      { id: 'W', label: { en: 'West with ♣A', zh: '西家打出 ♣A' }, isCorrect: false },
      { id: 'S', label: { en: 'South with ♣K', zh: '南家打出 ♣K' }, isCorrect: false },
      { id: 'N', label: { en: 'North with ♣8', zh: '北家打出 ♣8' }, isCorrect: false },
    ];

    return {
      id: `trick_trump_${Date.now()}_${Math.floor(rng() * 1000)}`,
      category: 'trick_winner',
      categoryLabel: CATEGORY_NAMES.trick_winner,
      question: {
        en: 'Hearts (♥) are TRUMP. West leads ♣A, North plays ♣8, East has no clubs and ruffs with ♥2, South plays ♣K. Who won this trick?',
        zh: '红心 ♥ 为将牌。西家打出 ♣A，北家跟 ♣8，东家梅花断门用 ♥2 将吃，南家出 ♣K。谁赢下了这一墩？',
      },
      contextBadge: {
        en: 'Trump Suit: ♥ Hearts',
        zh: '将牌花色：♥ 红心',
      },
      trickPlays: plays,
      trump: trumpSuit,
      options,
      explanation: {
        en: 'Trumps have supreme power! When void in the led suit, playing a trump is called "Ruffing". Even the smallest trump (♥2) beats the highest non-trump card (♣A)!',
        zh: '将牌具有最高拿墩特权！当手中没有领出花色时打出将牌称为“将吃”。哪怕是最小的将牌 ♥2，也能击败牌面最大的非将牌 ♣A！',
      },
      mnemonic: {
        en: 'Trump Power: Even the 2 of trumps beats an outside Ace!',
        zh: '将牌特权威力大，小二亦可斩首A',
      },
    };
  }
}

/**
 * Generate an HCP mental math problem.
 */
function generateHcpMentalMathProblem(rng: () => number): BeginnerDrillProblem {
  const ranks = [14, 13, 12, 11, 8, 5, 2];
  const suits: Suit[] = ['S', 'H', 'D', 'C'];

  // Pick 4 cards containing 2-3 honors
  const chosenCards: Card[] = [];
  const honors = [14, 13, 12, 11].sort(() => rng() - 0.5).slice(0, 2 + Math.floor(rng() * 2));
  for (const h of honors) {
    chosenCards.push({ suit: suits[Math.floor(rng() * suits.length)]!, rank: h });
  }
  while (chosenCards.length < 4) {
    const lowRank = ranks[4 + Math.floor(rng() * 3)]!;
    chosenCards.push({ suit: suits[Math.floor(rng() * suits.length)]!, rank: lowRank });
  }

  const exactHcp = chosenCards.reduce((acc, c) => acc + (HCP_VALUES[c.rank] ?? 0), 0);

  const choices = Array.from(new Set([exactHcp, exactHcp - 1, exactHcp + 2, Math.max(0, exactHcp - 3)]))
    .sort(() => rng() - 0.5)
    .slice(0, 4);

  const options: BeginnerDrillOption[] = choices.map(pts => ({
    id: String(pts),
    label: {
      en: `${pts} HCP`,
      zh: `${pts} 大牌点 (HCP)`,
    },
    isCorrect: pts === exactHcp,
  }));

  const cardLabels = chosenCards.map(c => cardLabel(c)).join('  ');

  return {
    id: `hcp_math_${Date.now()}_${Math.floor(rng() * 1000)}`,
    category: 'hcp_counting',
    categoryLabel: CATEGORY_NAMES.hcp_counting,
    question: {
      en: `Calculate the High Card Points (HCP) for these 4 cards: [ ${cardLabels} ] (A=4, K=3, Q=2, J=1).`,
      zh: `快速心算这 4 张扑克的大牌点 (HCP)：[ ${cardLabels} ]（标准点力：A=4点, K=3点, Q=2点, J=1点）。`,
    },
    contextBadge: {
      en: 'A=4 · K=3 · Q=2 · J=1',
      zh: 'A=4 · K=3 · Q=2 · J=1',
    },
    cards: chosenCards,
    options,
    explanation: {
      en: `High Card Points scale: Ace = 4 pts, King = 3 pts, Queen = 2 pts, Jack = 1 pt. Spots (10 down to 2) = 0 pts. Total = ${exactHcp} HCP.`,
      zh: `标准 Campbell 大牌点公式：A=4 点、K=3 点、Q=2 点、J=1 点。10 及以下小牌为 0 点。四张牌合计为 ${exactHcp} 大牌点！`,
    },
    mnemonic: {
      en: 'Honor points: 4 - 3 - 2 - 1 for A - K - Q - J (40 pts total in deck)',
      zh: 'A四K三Q二J一，全副扑克整四十',
    },
  };
}

/**
 * Generate a Roles & Partnership problem.
 */
function generateRolesProblem(rng: () => number): BeginnerDrillProblem {
  const scenarios = [
    {
      q: {
        en: 'Bridge is played by 4 players in two partnerships. Where do partners sit relative to each other?',
        zh: '桥牌由 4 名玩家组成两对搭档共同竞技。搭档两人坐在牌桌的什么相对位置？',
      },
      opts: [
        { id: 'opposite', label: { en: 'Directly opposite each other (North-South vs East-West)', zh: '面对面正对面坐（北南为一队，东西为一队）' }, isCorrect: true },
        { id: 'adjacent', label: { en: 'Next to each other side by side', zh: '肩并肩相邻而坐' }, isCorrect: false },
        { id: 'rotate', label: { en: 'Partners change every round clockwise', zh: '每轮顺时针轮换搭档' }, isCorrect: false },
      ],
      exp: {
        en: 'Partners always sit opposite each other (North-South form one team, East-West form the opposing team). They win and lose together.',
        zh: '桥牌是深度的搭档合作项目。同伴之间始终面对面就坐（北家与南家合力对抗东家与西家），共享胜负与得分。',
      },
      mne: {
        en: 'Partners sit opposite: North with South, East with West',
        zh: '搭档对立坐，北南战东西',
      },
    },
    {
      q: {
        en: 'After the opening lead is played to the first trick, what must the Declarer’s partner (Dummy) do?',
        zh: '当首攻打出第一张牌后，定约人（庄家）的同伴（明手 Dummy）必须做什么？',
      },
      opts: [
        { id: 'spread', label: { en: 'Spread all 13 cards face up on the table for everyone to see', zh: '将手中全部 13 张牌面朝上整齐摊开在牌桌上（明手）' }, isCorrect: true },
        { id: 'hide', label: { en: 'Keep cards hidden in hand and play independently', zh: '继续把牌藏在手中暗中出牌' }, isCorrect: false },
        { id: 'trade', label: { en: 'Swap hands with the opponents', zh: '与对手交换手牌' }, isCorrect: false },
      ],
      exp: {
        en: 'The declarer’s partner is called the "Dummy". Once the opening lead is made, Dummy displays all 13 cards face-up in suits on the table. Declarer calls which card Dummy plays!',
        zh: '庄家的同伴被称为“明手 (Dummy)”。首攻一旦打出，明手必须将 13 张牌按花色整齐摊开在桌面上，由庄家统一指挥明手出哪张牌！',
      },
      mne: {
        en: 'Dummy spreads hand face-up: Declarer commands both hands',
        zh: '首攻一出明手摊，庄家统帅两手牌',
      },
    },
    {
      q: {
        en: 'How many combined High Card Points (HCP) between the partnership typically signals game strength (3NT, 4♠, 4♥)?',
        zh: '双方搭档手中的大牌点（HCP）相加达到多少点时，通常就具备了冲击成局定约（3NT、4♠、4♥）的实力？',
      },
      opts: [
        { id: '25', label: { en: '25–26 combined HCP', zh: '25–26 点' }, isCorrect: true },
        { id: '15', label: { en: '15 combined HCP', zh: '15 点' }, isCorrect: false },
        { id: '20', label: { en: '20 combined HCP (half the deck)', zh: '20 点（全牌的一半）' }, isCorrect: false },
        { id: '35', label: { en: '35 combined HCP', zh: '35 点' }, isCorrect: false },
      ],
      exp: {
        en: 'There are 40 HCP in a deck. A partnership with 25+ combined points owns the majority of power and should bid to a game contract (3NT, 4♠, or 4♥) for massive bonus points!',
        zh: '全副牌共 40 点。当两人大牌点相加达到 25 点以上时，就占据了绝对的牌面优势，应当果断叫到成局定约（3NT / 4♠ / 4♥）赢取丰厚奖分！',
      },
      mne: {
        en: '25 Points for Game: Golden threshold in bridge',
        zh: '二人合持二十五，果断冲局不含糊',
      },
    },
  ];

  const s = scenarios[Math.floor(rng() * scenarios.length)]!;
  return {
    id: `roles_${Date.now()}_${Math.floor(rng() * 1000)}`,
    category: 'roles',
    categoryLabel: CATEGORY_NAMES.roles,
    question: s.q,
    options: s.opts.sort(() => rng() - 0.5),
    explanation: s.exp,
    mnemonic: s.mne,
  };
}

/**
 * Main problem generator for beginner drills.
 */
export function generateBeginnerDrill(
  category: BeginnerDrillCategory = 'all',
  rng: () => number = Math.random
): BeginnerDrillProblem {
  let targetCategory = category;
  if (targetCategory === 'all') {
    const pool: BeginnerDrillCategory[] = [
      'follow_suit',
      'book_math',
      'trick_winner',
      'hcp_counting',
      'roles',
    ];
    targetCategory = pool[Math.floor(rng() * pool.length)]!;
  }

  switch (targetCategory) {
    case 'follow_suit':
      return generateFollowSuitProblem(rng);
    case 'book_math':
      return generateBookMathProblem(rng);
    case 'trick_winner':
      return generateTrickWinnerProblem(rng);
    case 'hcp_counting':
      return generateHcpMentalMathProblem(rng);
    case 'roles':
      return generateRolesProblem(rng);
    default:
      return generateFollowSuitProblem(rng);
  }
}
