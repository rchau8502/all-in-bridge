/**
 * Official ACBL Intro to Bridge Series 1 Glossary & Bridge Rules.
 * Source: ACBL Intro to Bridge Series 1 Student Manual (Patty Tucker, 2022).
 * Fully bilingual (EN + ZH) with categories, mnemonics, and rules.
 */

export type Lang = 'en' | 'zh';
export type TermCategory = 'basics' | 'play' | 'bidding' | 'scoring';

export interface RawGlossaryTerm {
  id: string;
  term: { en: string; zh: string };
  category: TermCategory;
  definition: { en: string; zh: string };
  mnemonic?: { en: string; zh: string } | undefined;
  ruleFormula?: { en: string; zh: string } | undefined;
  acblClass?: number | undefined;
}

export const ACBL_GLOSSARY: RawGlossaryTerm[] = [
  {
    id: 'advancer',
    term: { en: 'Advancer', zh: '争叫应叫人' },
    category: 'bidding',
    definition: {
      en: 'The partner of the Overcaller.',
      zh: '争叫者的搭档。当同伴争叫后，应叫人根据有无配合及大牌点决定加叫、新套或叫无将。',
    },
    acblClass: 10,
  },
  {
    id: 'auction',
    term: { en: 'Auction', zh: '叫牌阶段' },
    category: 'bidding',
    definition: {
      en: 'When players bid, starting with the Dealer and continuing until there is a bid and 3 consecutive Pass calls (or 4 consecutive Passes at the start).',
      zh: '从发牌人开始顺时针轮流叫牌，直到产生出价后连续3人Pass（或开局4人全部Pass）为止。',
    },
    acblClass: 5,
  },
  {
    id: 'balanced',
    term: { en: 'Balanced Hand', zh: '均型牌' },
    category: 'bidding',
    definition: {
      en: 'A hand of 13 cards holding no voids, no singletons, and no more than one doubleton (typical distributions: 4-3-3-3, 4-4-3-2, or 5-3-3-2).',
      zh: '无缺门、无单张、至多仅有1个双张的13张手牌（常见牌型为 4-3-3-3、4-4-3-2 或 5-3-3-2）。适合打无将定约。',
    },
    acblClass: 5,
  },
  {
    id: 'bidding',
    term: { en: 'Bidding', zh: '叫牌交流' },
    category: 'bidding',
    definition: {
      en: 'A coded language used between partners in the auction to communicate the length of their suits and the strength of their hands.',
      zh: '搭档之间在叫牌阶段使用的一套约定语言，用以沟通各自花色长度分布与大牌点实力，共同决定定约花色与阶数。',
    },
    acblClass: 5,
  },
  {
    id: 'book',
    term: { en: 'Book', zh: '基本墩（底数）' },
    category: 'basics',
    definition: {
      en: 'The first 6 tricks won by Declarer in a hand of bridge. Bidding at level N commits to winning (6 + N) tricks.',
      zh: '桥牌中庄家首先拿到的前6墩，称为底数。任何 N 阶定约实际承诺拿下的总墩数均为 (6 + N) 墩。',
    },
    ruleFormula: { en: 'Tricks needed = 6 + Contract Level', zh: '所需总墩数 = 6 + 定约阶数' },
    acblClass: 1,
  },
  {
    id: 'bonus-points',
    term: { en: 'Bonus Points', zh: '定约奖分' },
    category: 'scoring',
    definition: {
      en: 'Points earned for successfully making the number of tricks promised in the contract (Part-Score: 50 pts; Game: 300 pts non-vul; Small Slam: 500 pts; Grand Slam: 1000 pts).',
      zh: '庄家成功完成定约时获得的额外奖励分（部分定约 50分；无局成局 300分；小满贯 500分；大满贯 1000分）。',
    },
    acblClass: 5,
  },
  {
    id: 'contract',
    term: { en: 'Contract', zh: '定约' },
    category: 'basics',
    definition: {
      en: 'The final bid of an auction which designates the trump suit (or Notrump) and the number of tricks over book that Declarer promises to win.',
      zh: '叫牌阶段的最终出价，确定了将牌花色（或无将）以及定约方承诺在6墩底数之上拿下的额外墩数。',
    },
    acblClass: 1,
  },
  {
    id: 'cross-trumping',
    term: { en: 'Cross-Trumping', zh: '交叉将吃' },
    category: 'play',
    definition: {
      en: 'Attempting to win tricks by trumping back and forth in both Declarer and Dummy hands, typically without pulling trumps from opponents.',
      zh: '定约人和明手互相用将牌将吃对方手中的输墩，通常在不提前清拔防守方将牌的情况下进行，以最大化赢墩总数。',
    },
    acblClass: 4,
  },
  {
    id: 'declarer',
    term: { en: 'Declarer', zh: '定约人（庄家）' },
    category: 'basics',
    definition: {
      en: 'The player who first bid the suit or Notrump that became the contract. Declarer plays both their own hand and Dummy.',
      zh: '双方搭档中首先叫出最终定约花色（或无将）的那位牌手。负责统筹出牌并打出明手的牌。',
    },
    acblClass: 1,
  },
  {
    id: 'defenders',
    term: { en: 'Defenders', zh: '防守方' },
    category: 'basics',
    definition: {
      en: 'The opposing partnership to Declarers who try to prevent Declarer from winning the number of tricks promised (to set the contract).',
      zh: '对抗定约人的另一对搭档，目标是尽量拿足防守赢墩，使定约人无法完成定约（即击宕定约）。',
    },
    acblClass: 1,
  },
  {
    id: 'distribution',
    term: { en: 'Distribution', zh: '牌型分布' },
    category: 'bidding',
    definition: {
      en: 'The number of cards held in each of the four suits in a 13-card hand (e.g., 5-4-3-1, 4-3-3-3).',
      zh: '13张手牌在四种花色中的长短张数分布情况（如 5-4-3-1、4-3-3-3 等）。',
    },
    acblClass: 5,
  },
  {
    id: 'dummy',
    term: { en: 'Dummy', zh: '明手' },
    category: 'basics',
    definition: {
      en: 'The partner of Declarer whose hand is laid face up on the table after the opening lead and played entirely by Declarer.',
      zh: '定约人的搭档。在首攻发出后，将其手中的13张牌分门别类明铺在牌桌中央，全权由定约人指令打出。',
    },
    acblClass: 1,
  },
  {
    id: 'finesse',
    term: { en: 'Finesse', zh: '飞牌' },
    category: 'play',
    definition: {
      en: 'An attempt to win a trick with a lower card when opponents hold an intervening higher card in that suit, exploiting positional advantage.',
      zh: '当防守方持有某花色的大牌时，通过由弱牌方引牌出向强牌方，利用位置优势使低位大牌（如AQ中的Q）成功拿墩的出牌技巧。',
    },
    mnemonic: {
      en: 'Lead towards your high cards; if the critical card is onside (before your honor), the finesse succeeds (50% chance).',
      zh: '由弱向强引牌，若关键大牌处于飞牌路线上（处于有利于你的有利位置），飞牌成功率通常为50%。',
    },
    acblClass: 2,
  },
  {
    id: 'fit',
    term: { en: 'Fit (Golden Fit)', zh: '配合（8张配合）' },
    category: 'bidding',
    definition: {
      en: 'When a partnership holds 8 or more cards combined in the same suit. The primary goal of bidding is to find an 8-card Major fit.',
      zh: '双方搭档在同一门花色中合计持有8张或更多卡牌。叫牌的首要目标就是寻找高花（黑桃或红心）的8张配合。',
    },
    acblClass: 1,
  },
  {
    id: 'forcing-bid',
    term: { en: 'Forcing Bid', zh: '逼叫' },
    category: 'bidding',
    definition: {
      en: 'An unlimited bid made by Opener or Responder that promises strength and forces partner to bid again; partner is not permitted to Pass.',
      zh: '开叫人或应叫人做出的一种上限不封顶（Unlimited）的出价，传递未尽信息并强行要求同伴必须继续叫牌，同伴绝不能Pass。',
    },
    acblClass: 6,
  },
  {
    id: 'four-on-the-floor',
    term: { en: 'Four on the Floor', zh: '4张套先叫低阶 (Four on the Floor)' },
    category: 'bidding',
    definition: {
      en: 'ACBL Mnemonic: When partner opens a minor and Responder holds exactly 4 hearts and 4 spades, bid hearts (the suit lowest in rank) at the 1-level first.',
      zh: 'ACBL经典口诀：当同伴开叫低花、而应叫人同时持有4张红心与4张黑桃时，在1阶优先叫出阶数更低的红心（1♥），留出叫黑桃的探索空间。',
    },
    mnemonic: {
      en: 'With two 4-card majors, bid "Four on the floor" (the lower ranking suit, Hearts, first).',
      zh: '手握双高4张套，先叫低阶红心1♥（Four on the floor）。',
    },
    acblClass: 6,
  },
  {
    id: 'game',
    term: { en: 'Game Contract', zh: '成局定约' },
    category: 'scoring',
    definition: {
      en: 'A contract worth 100+ trick points: 3NT (9 tricks), 4♥/4♠ (10 tricks), or 5♣/5♦ (11 tricks). Successful games earn a 300-point bonus.',
      zh: '墩分达到100分及以上的定约：3NT（9墩）、4♥/4♠（10墩）、5♣/5♦（11墩）。成功打成可斩获300分丰厚成局奖分。',
    },
    ruleFormula: { en: 'Combined 25-26 HCP needed for 3NT or 4-Major; 28-29 HCP for 5-Minor.', zh: '双方合计需25-26大牌点（打3NT或4阶高花）；低花5阶成局需28-29点。' },
    acblClass: 5,
  },
  {
    id: 'high-card-points',
    term: { en: 'High Card Points (HCP)', zh: '大牌点 (HCP)' },
    category: 'scoring',
    definition: {
      en: 'Points assigned to honors based on trick-winning ability (Campbell, 1915): Ace = 4 pts, King = 3 pts, Queen = 2 pts, Jack = 1 pt. Total in deck = 40 pts.',
      zh: '由坎贝尔于1915年提出的大牌价值量化估值法：A=4点、K=3点、Q=2点、J=1点。整副扑克牌合计40大牌点，平均每家10点。',
    },
    ruleFormula: { en: 'A=4, K=3, Q=2, J=1 (Deck total = 40 HCP)', zh: 'A=4点, K=3点, Q=2点, J=1点（全副总计40点）' },
    acblClass: 5,
  },
  {
    id: 'high-five',
    term: { en: 'High Five', zh: '5张套先叫高阶 (High Five)' },
    category: 'bidding',
    definition: {
      en: 'ACBL Mnemonic: If a player holds two 5-card suits, bid the higher-ranking suit first (e.g. 5♠ and 5♥ -> bid 1♠ first; 5♦ and 5♣ -> bid 1♦ first).',
      zh: 'ACBL经典口诀：当手握两套5张以上的花色时，优先叫出级别更高的花色（如黑桃与红心皆为5张先叫1♠；方块与梅花皆为5张先叫1♦）。',
    },
    mnemonic: {
      en: 'With two 5-card suits, give your partner a "High Five" (bid the higher ranking suit first).',
      zh: '手握两套5张套，击掌叫高花（High Five 先叫高级别套）。',
    },
    acblClass: 5,
  },
  {
    id: 'jump-shift',
    term: { en: 'Jump Shift', zh: '跳移叫' },
    category: 'bidding',
    definition: {
      en: 'Bidding an unbid suit while skipping a bidding level (e.g. 1♦ - 1♥ - 2♠). Shows 18+ HCP and is 100% forcing to Game.',
      zh: '开叫人跳过一个阶数叫出全新的未叫花色（如 1♦ - 1♥ - 2♠）。展现18+大牌点的强牌实力，逼叫进局。',
    },
    acblClass: 8,
  },
  {
    id: 'limited-bid',
    term: { en: 'Limited Bid', zh: '有限叫' },
    category: 'bidding',
    definition: {
      en: 'A bid that defines a narrow, specific range of HCP in the player’s hand (usually within 3-5 pts). Partner can "do the math" to decide whether to Pass, Invite, or Bid Game.',
      zh: '将手牌实力精确限制在较窄点力区间（通常跨度为3-5点）的出价。搭档可以直接进行加减法心算，决定停叫、邀请或直冲成局。',
    },
    acblClass: 6,
  },
  {
    id: 'line-of-play',
    term: { en: 'Line of Play', zh: '做牌路线' },
    category: 'play',
    definition: {
      en: 'After the opening lead and Dummy is displayed, Declarer plans the order and method of taking tricks, balancing Timing, Transportation, and creating extra tricks.',
      zh: '在首攻发出明手亮牌后，定约人统揽全局所制定的完整打牌规划，包括出牌时序、进手桥路与发展额外赢墩的方法。',
    },
    acblClass: 3,
  },
  {
    id: 'losers',
    term: { en: 'Losers', zh: '输墩' },
    category: 'play',
    definition: {
      en: 'Tricks in a suit contract that opponents will likely win unless eliminated through ruffing, discarding on winners, or successful finessing.',
      zh: '在有将定约中，若不采取将吃、垫牌或飞牌等手段消除，防守方必然能够拿到的大牌失分墩。',
    },
    ruleFormula: {
      en: 'Trumping Losers Formula: 13 - (Winners + Losers) = Extra tricks possible by ruffing',
      zh: '将吃公式：13 - (赢墩数 + 输墩数) = 可通过将吃额外创造的赢墩数',
    },
    acblClass: 4,
  },
  {
    id: 'majors',
    term: { en: 'Major Suits', zh: '高阶花色（高花）' },
    category: 'basics',
    definition: {
      en: 'Spades (♠) and Hearts (♥). Major suit tricks award 30 points each and need only 10 tricks (4-level) to make Game.',
      zh: '黑桃（♠）与红心（♥）。每赢一墩记30分，只需打到4阶（10墩）即可成局，是桥牌叫牌中最优先寻找的定约。',
    },
    acblClass: 1,
  },
  {
    id: 'minors',
    term: { en: 'Minor Suits', zh: '低阶花色（低花）' },
    category: 'basics',
    definition: {
      en: 'Diamonds (♦) and Clubs (♣). Minor suit tricks award 20 points each and require 11 tricks (5-level) to make Game.',
      zh: '方块（♦）与梅花（♣）。每赢一墩记20分，成局需要叫到5阶（11墩），因此优先度排在高花与无将之后。',
    },
    acblClass: 1,
  },
  {
    id: 'notrump',
    term: { en: 'Notrump (NT)', zh: '无将 (NT)' },
    category: 'basics',
    definition: {
      en: 'Play without any trump suit. The highest card in the suit led always wins the trick. 3NT is the most efficient game contract (9 tricks, 25-26 HCP).',
      zh: '不设任何将牌的花色形态，领出花色中最大的牌必然拿墩。3NT仅需9墩即可成局，是均型牌最高效的抢分定约。',
    },
    acblClass: 1,
  },
  {
    id: 'opening-lead',
    term: { en: 'Opening Lead', zh: '首攻' },
    category: 'play',
    definition: {
      en: 'The very first card played to trick 1, played face down or placed by Declarer’s left-hand opponent (West if South is Declarer).',
      zh: '整副牌第一墩的第一张出牌，由定约人的左手防家打出。首攻打出后，明手的牌才正式翻开。',
    },
    acblClass: 1,
  },
  {
    id: 'overcall',
    term: { en: 'Overcall', zh: '争叫' },
    category: 'bidding',
    definition: {
      en: 'A bid made by one of the Opener’s opponents after the auction has already opened. Follows the ACBL 10-5-2 rule.',
      zh: '在敌方开叫之后，由防家做出的首次竞争性出价。用于抢夺定约、指引防守首攻或干扰敌方叫牌通道。',
    },
    mnemonic: {
      en: '10-5-2 Rule: At least 10+ HCP, a 5+ card suit, and at least 2 honors in that suit.',
      zh: '10-5-2争叫法则：整手牌至少10+大牌点、该花色至少5张长、且该花色至少含有2张大牌。',
    },
    acblClass: 10,
  },
  {
    id: 'percentages',
    term: { en: 'Suit Split Percentages', zh: '花色分布概率法则' },
    category: 'play',
    definition: {
      en: 'Mathematical probabilities of how opponents’ cards split. Odd numbers of outstanding cards split evenly most often (5 cards: 3-2 at 68%); even numbers split unevenly (4 cards: 3-1 at 50% vs 2-2 at 41%).',
      zh: '防守方剩余牌张在两人之间的分布概率。基本定律：奇数张大多倾向于均分（5张最常是3-2，占68%）；偶数张大多倾向于不均分（4张最常是3-1，占50%）。',
    },
    acblClass: 2,
  },
  {
    id: 'priority-of-contracts',
    term: { en: 'Priority of Contracts', zh: '定约优先顺序' },
    category: 'bidding',
    definition: {
      en: 'The golden rule for exploring where to play: 1. Major suit fit (4♥/4♠) -> 2. Notrump (3NT) -> 3. Minor suit fit (5♣/5♦ as last resort).',
      zh: '桥牌选择打牌方向的核心黄金法则：第一优先找高花配合（4♥/4♠），第二选择打无将（3NT），低花配合（5♣/5♦）永远排在最后。',
    },
    ruleFormula: { en: 'Majors -> Notrump -> Minors', zh: '高花 (Majors) -> 无将 (NT) -> 低花 (Minors)' },
    acblClass: 5,
  },
  {
    id: 'purity',
    term: { en: 'Purity', zh: '纯净度 (Purity)' },
    category: 'bidding',
    definition: {
      en: 'Hand quality where High Card Points are concentrated in your long suits rather than scattered as wasted honors in short suits.',
      zh: '手牌点力质量指标：大牌点集中分布在己方的长套花色中，而非零散浪费在无保护的短套里。纯净度高手牌做牌价值显著更强。',
    },
    acblClass: 5,
  },
  {
    id: 'ruff',
    term: { en: 'Ruff (Trump)', zh: '将吃 (Ruff)' },
    category: 'play',
    definition: {
      en: 'Playing a trump card when you have no cards left in the suit led, winning the trick over any high non-trump cards.',
      zh: '当某一花色已缺门而手中持有时，在别人领出该花色时垫入将牌，凭将牌优势强行夺得赢墩。',
    },
    acblClass: 1,
  },
  {
    id: 'stopper',
    term: { en: 'Stopper', zh: '止张 (Stopper)' },
    category: 'bidding',
    definition: {
      en: 'A high card (such as an Ace, or King-x, Queen-x-x) in an opponent’s suit that prevents them from winning all their tricks in that suit when playing Notrump.',
      zh: '在防守方叫过的花色中持有的大牌（如单张A、带护张的Kx、Qxx），能在无将定约中阻止防守方一口气打通长套。',
    },
    acblClass: 10,
  },
  {
    id: 'texture',
    term: { en: 'Texture', zh: '牌张质地（中间张）' },
    category: 'bidding',
    definition: {
      en: 'The presence of intermediate cards (10s, 9s, and 8s) in a hand. Dense texture greatly increases trick-taking potential beyond raw HCP.',
      zh: '手牌中充盈的中间张（10、9、8）。密集的中间张能极大提高花色的抗张力与飞牌连续性，实战拿墩威力远超单纯的HCP点数。',
    },
    acblClass: 5,
  },
  {
    id: 'timing-transportation',
    term: { en: 'Timing & Transportation', zh: '时序与桥路' },
    category: 'play',
    definition: {
      en: 'Timing: Which suits to establish first before losing control. Transportation: Moving back and forth between Declarer and Dummy via entries.',
      zh: '出牌时序指何时树立赢墩、何时拔将牌的先后次序；桥路指利用定约人与明手各自的进手点来回穿梭沟通的能力。',
    },
    acblClass: 3,
  },
  {
    id: 'trick',
    term: { en: 'Trick', zh: '一墩牌' },
    category: 'basics',
    definition: {
      en: 'A round of four cards, one played from each player in clockwise rotation. A standard bridge hand consists of 13 tricks.',
      zh: '四位牌手按顺时针次序各出一张牌所组成的一组牌（共4张）。整副牌由13墩组成。',
    },
    acblClass: 1,
  },
  {
    id: 'unlimited-bid',
    term: { en: 'Unlimited Bid', zh: '无限叫' },
    category: 'bidding',
    definition: {
      en: 'A bid with no upper limit on HCP promised (e.g., bidding a new suit as Responder promises 6+ HCP with no ceiling). It is forcing to partner.',
      zh: '上限不设封顶的出价（例如应叫人在1阶叫出新花色，仅承诺6+点而上不封顶）。具有逼叫效力，同伴必须再叫。',
    },
    acblClass: 6,
  },
];

/** Filter and search terms with localized text output. */
export function getGlossaryTerms(
  lang: Lang,
  category?: TermCategory | 'all',
  searchQuery?: string
): Array<{
  id: string;
  term: string;
  category: TermCategory;
  definition: string;
  mnemonic?: string | undefined;
  ruleFormula?: string | undefined;
  acblClass?: number | undefined;
}> {
  const query = (searchQuery ?? '').trim().toLowerCase();
  return ACBL_GLOSSARY.filter(item => {
    if (category && category !== 'all' && item.category !== category) return false;
    if (!query) return true;
    const termStr = `${item.term.en} ${item.term.zh}`.toLowerCase();
    const defStr = `${item.definition.en} ${item.definition.zh}`.toLowerCase();
    return termStr.includes(query) || defStr.includes(query);
  }).map(item => ({
    id: item.id,
    term: item.term[lang],
    category: item.category,
    definition: item.definition[lang],
    mnemonic: item.mnemonic ? item.mnemonic[lang] : undefined,
    ruleFormula: item.ruleFormula ? item.ruleFormula[lang] : undefined,
    acblClass: item.acblClass,
  }));
}

export function findGlossaryTerm(id: string, lang: Lang) {
  const item = ACBL_GLOSSARY.find(t => t.id === id);
  if (!item) return null;
  return {
    id: item.id,
    term: item.term[lang],
    category: item.category,
    definition: item.definition[lang],
    mnemonic: item.mnemonic ? item.mnemonic[lang] : undefined,
    ruleFormula: item.ruleFormula ? item.ruleFormula[lang] : undefined,
    acblClass: item.acblClass,
  };
}
