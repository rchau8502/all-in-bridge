/** Bilingual quick reference adapted from Yuqi Hu’s combined handout.
 * Explicit website agreements take precedence where the source differs. */
export interface RefText { en: string; zh: string }
export type RefStatus = 'NF' | 'F1' | 'GF' | 'SF' | 'RULE' | 'AGREEMENT' | 'REPLY' | 'INV';
export type RefLevel = 'basic' | 'advanced';
export interface ReferenceSection { id: string; title: RefText; context: RefText; pages: number[]; lessonId: string }
export interface ReferenceRow { id: string; section: string; level: RefLevel; sequence: string; title: RefText; requirements: RefText; status: RefStatus; next: RefText; note: RefText; pages: number[]; lessonId: string; warning?: RefText }
export const REFERENCE_SECTIONS: ReferenceSection[] = [
  {
    "id": "principles",
    "title": {
      "zh": "目标与点力",
      "en": "Goals & strength"
    },
    "context": {
      "zh": "先判断是否成局，再寻找合适定约。M＝高花，m＝低花；括号内是对手叫品。",
      "en": "Judge game potential and find the right strain. M = major, m = minor; parentheses show opponents’ calls."
    },
    "pages": [
      3,
      4
    ],
    "lessonId": "contract"
  },
  {
    "id": "openings",
    "title": {
      "zh": "五种一阶开叫",
      "en": "One-level openings"
    },
    "context": {
      "zh": "未有人开叫。以下为网站的五张高花、强无将开叫。",
      "en": "No previous opening. Five-card majors and a strong notrump."
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "bidding"
  },
  {
    "id": "minor-responses",
    "title": {
      "zh": "对低花开叫应叫",
      "en": "Responding to a minor"
    },
    "context": {
      "zh": "无干扰、应叫者未Pass；先找高花，再考虑3NT与低花。",
      "en": "Uncontested, unpassed responder; look for a major, then 3NT or a minor."
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "minor-responses"
  },
  {
    "id": "major-responses",
    "title": {
      "zh": "对高花开叫应叫",
      "en": "Responding to a major"
    },
    "context": {
      "zh": "无干扰、应叫者未Pass；按支持张数、实力与短套选择应叫。",
      "en": "Uncontested, unpassed responder; choose from support length, strength and shortness."
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "strength-and-minors"
  },
  {
    "id": "rebids",
    "title": {
      "zh": "开叫者再叫",
      "en": "Opener’s rebids"
    },
    "context": {
      "zh": "以下先以一盖一应叫后为背景；已建立逼局时，低阶描述不会取消逼局。",
      "en": "Start after a one-over-one response; economical descriptions do not cancel an existing GF."
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "conversation"
  },
  {
    "id": "stayman",
    "title": {
      "zh": "1NT 后：Stayman",
      "en": "After 1NT: Stayman"
    },
    "context": {
      "zh": "1NT开叫15–17均型。斯台曼先找4–4高花配合。",
      "en": "1NT opening is 15–17 balanced. Stayman first seeks a 4–4 major fit."
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-fit"
  },
  {
    "id": "transfers",
    "title": {
      "zh": "1NT 后：Transfer",
      "en": "After 1NT: transfers"
    },
    "context": {
      "zh": "先说明五张高花，再在下一轮说明实力；强无将一方通常做庄。",
      "en": "Show five-card major length first, then strength; the strong notrump hand usually declares."
    },
    "pages": [
      7
    ],
    "lessonId": "jacoby-transfers"
  },
  {
    "id": "nt-advanced",
    "title": {
      "zh": "1NT 后：进阶路线",
      "en": "After 1NT: advanced routes"
    },
    "context": {
      "zh": "Smolen、Texas、5–5/6–4高花及满贯路线，需要搭档约定。",
      "en": "Smolen, Texas, 5–5/6–4 majors and slam routes require agreement."
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "texas-transfers"
  },
  {
    "id": "overcalls",
    "title": {
      "zh": "对方开叫：争叫",
      "en": "Opponents open: overcalls"
    },
    "context": {
      "zh": "你是争叫者；不是搭档开叫后的应叫。阶数、牌质与局况同样重要。",
      "en": "You are the overcaller, not responder to partner. Level, suit quality and vulnerability matter."
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "advancing",
    "title": {
      "zh": "搭档争叫：进叫",
      "en": "Advancing partner’s overcall"
    },
    "context": {
      "zh": "本课NFC：简单新花建设性但不逼叫，强牌用扣叫保留空间。",
      "en": "Course NFC agreement: simple new suits are constructive, not forcing; cue-bid with forcing strength."
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "takeout",
    "title": {
      "zh": "技术性加倍与应叫",
      "en": "Takeout doubles & advances"
    },
    "context": {
      "zh": "对方开叫、搭档技术性加倍；没有对手插叫时，弱牌也通常要回应。",
      "en": "Opponent opens and partner doubles for takeout; without intervening action, even a weak hand normally replies."
    },
    "pages": [
      8
    ],
    "lessonId": "takeout-doubles"
  },
  {
    "id": "after-overcall",
    "title": {
      "zh": "我方开叫遭争叫",
      "en": "After an overcall of our opening"
    },
    "context": {
      "zh": "你是应叫者。对手争叫后，二盖一不自动逼局；采用本课强自由叫体系。",
      "en": "You are responder. After an overcall, 2/1 is not automatically GF; use the course’s strong free-bid agreement."
    },
    "pages": [
      9,
      10
    ],
    "lessonId": "negative-doubles"
  },
  {
    "id": "after-double",
    "title": {
      "zh": "我方开叫遭加倍",
      "en": "After a double of our opening"
    },
    "context": {
      "zh": "对手技术性加倍后，半逼叫1NT与伯根关闭；人工支持改用本节约定。",
      "en": "After an opposing takeout double, semi-forcing 1NT and Bergen are off; use these raise agreements."
    },
    "pages": [
      10
    ],
    "lessonId": "support-and-redoubles"
  },
  {
    "id": "slams",
    "title": {
      "zh": "满贯、控制与4NT",
      "en": "Slams, controls & 4NT"
    },
    "context": {
      "zh": "先定将牌、检查边花控制，再问关键张；同一个4NT需结合上下文。",
      "en": "Agree trumps and check controls before asking keycards; 4NT depends on context."
    },
    "pages": [
      9
    ],
    "lessonId": "controls-and-keycards"
  }
];
export const REFERENCE_ROWS: ReferenceRow[] = [
  {
    "id": "game-line",
    "section": "principles",
    "level": "basic",
    "sequence": "3NT / 4♥ / 4♠",
    "title": {
      "zh": "成局目标",
      "en": "Game targets"
    },
    "requirements": {
      "zh": "联手约25点；高花配合通常至少8张",
      "en": "About 25 combined points; normally an 8+ card major fit"
    },
    "status": "RULE",
    "next": {
      "zh": "优先考虑高花成局，其次3NT；低花成局需11墩。",
      "en": "Usually consider a major game, then 3NT; minor games require 11 tricks."
    },
    "note": {
      "zh": "点力是参考，不保证成局；牌型、挡张、赢墩与局况也重要。",
      "en": "Points guide the decision; shape, stoppers, tricks and vulnerability also matter."
    },
    "pages": [
      3,
      4
    ],
    "lessonId": "contract"
  },
  {
    "id": "hcp",
    "section": "principles",
    "level": "basic",
    "sequence": "A / K / Q / J",
    "title": {
      "zh": "大牌点",
      "en": "High-card points"
    },
    "requirements": {
      "zh": "A=4，K=3，Q=2，J=1；全副40点",
      "en": "A=4, K=3, Q=2, J=1; 40 in the deck"
    },
    "status": "RULE",
    "next": {
      "zh": "先数大牌点，再结合配合、短套与长套评估。",
      "en": "Count HCP, then evaluate fit, shortness and length."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      4
    ],
    "lessonId": "contract"
  },
  {
    "id": "forcing",
    "section": "principles",
    "level": "basic",
    "sequence": "F1 / GF / SF / NF",
    "title": {
      "zh": "能不能Pass？",
      "en": "May I pass?"
    },
    "requirements": {
      "zh": "没有上限的应叫通常逼叫；有限牌也可能按约定逼局",
      "en": "Uncapped responses normally force; a limited bid can also force game by agreement"
    },
    "status": "RULE",
    "next": {
      "zh": "F1须回应一轮；GF不可停局以下；SF仅有约定例外；NF可停。",
      "en": "F1 requires a reply; GF cannot stop below game; SF has a narrow exception; NF may stop."
    },
    "note": {
      "zh": "开叫本身与人工询问须按各自约定判断，不能只凭阶数。",
      "en": "Read opening bids and artificial inquiries in context, not just by their height."
    },
    "pages": [
      3,
      4
    ],
    "lessonId": "contract"
  },
  {
    "id": "talk",
    "section": "principles",
    "level": "basic",
    "sequence": "MIN / MAX · INV / GF",
    "title": {
      "zh": "叫牌就是说话",
      "en": "Bidding is a conversation"
    },
    "requirements": {
      "zh": "有新信息／话没说完／我说完了",
      "en": "New information / an unfinished story / a completed description"
    },
    "status": "RULE",
    "next": {
      "zh": "描述牌型与实力；邀请让搭档决定，逼局则继续选成局方向。",
      "en": "Describe shape and strength; invitations let partner decide, while a GF continues the strain search."
    },
    "note": {
      "zh": "MIN/MED/MAX是粗分组；具体叫品的精确范围优先，不能混用重叠边界。",
      "en": "MIN/MED/MAX are broad groups; the exact range of the specific call takes priority."
    },
    "pages": [
      3,
      4
    ],
    "lessonId": "contract"
  },
  {
    "id": "open-clubs",
    "section": "openings",
    "level": "basic",
    "sequence": "1♣",
    "title": {
      "zh": "梅花开叫",
      "en": "Club opening"
    },
    "requirements": {
      "zh": "12–21点，至少3张梅花，无应优先开叫的五张高花",
      "en": "12–21, 3+ clubs, no five-card major to open first"
    },
    "status": "NF",
    "next": {
      "zh": "无五张高花、又不适合1NT时，通常先报较长低花。",
      "en": "Without a five-card major or a suitable 1NT opening, normally open the longer minor."
    },
    "note": {
      "zh": "低花3–3通常开1♣；4–4通常开1♦；不能将1♣当成必然长套。",
      "en": "With 3–3 minors normally open 1♣, with 4–4 open 1♦; 1♣ need not be long."
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "bidding"
  },
  {
    "id": "open-diamonds",
    "section": "openings",
    "level": "basic",
    "sequence": "1♦",
    "title": {
      "zh": "方块开叫",
      "en": "Diamond opening"
    },
    "requirements": {
      "zh": "12–21点，至少3张方块",
      "en": "12–21, 3+ diamonds"
    },
    "status": "NF",
    "next": {
      "zh": "优先五张高花；其余按低花长度与均型无将范围选择。",
      "en": "Prefer a five-card major; otherwise consider minor length and the notrump range."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "bidding"
  },
  {
    "id": "open-hearts",
    "section": "openings",
    "level": "basic",
    "sequence": "1♥",
    "title": {
      "zh": "红桃开叫",
      "en": "Heart opening"
    },
    "requirements": {
      "zh": "12–21点，至少5张红桃",
      "en": "12–21, 5+ hearts"
    },
    "status": "NF",
    "next": {
      "zh": "搭档三张支持即可确认5+3=8；四张高花可从低花开叫后再找配合。",
      "en": "Three-card support establishes 5+3=8; four-card majors can be found after a minor opening."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "bidding"
  },
  {
    "id": "open-spades",
    "section": "openings",
    "level": "basic",
    "sequence": "1♠",
    "title": {
      "zh": "黑桃开叫",
      "en": "Spade opening"
    },
    "requirements": {
      "zh": "12–21点，至少5张黑桃",
      "en": "12–21, 5+ spades"
    },
    "status": "NF",
    "next": {
      "zh": "五张对五张高花时通常先开1♠；长度不同时通常先开较长套。",
      "en": "With 5–5 majors normally open 1♠; with unequal lengths normally open the longer suit."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "bidding"
  },
  {
    "id": "open-notrump",
    "section": "openings",
    "level": "basic",
    "sequence": "1NT",
    "title": {
      "zh": "强无将开叫",
      "en": "Strong notrump opening"
    },
    "requirements": {
      "zh": "15–17点，均型，通常4333、4432或5332，无单缺",
      "en": "15–17, balanced, normally 4333, 4432 or 5332; no singleton or void"
    },
    "status": "NF",
    "next": {
      "zh": "应叫者按15–17范围决定停叫、邀请或成局。",
      "en": "Responder uses the 15–17 range to stop, invite or bid game."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "bidding"
  },
  {
    "id": "minor-pass",
    "section": "minor-responses",
    "level": "basic",
    "sequence": "1m – P",
    "title": {
      "zh": "弱牌不叫",
      "en": "Weak pass"
    },
    "requirements": {
      "zh": "通常0–5点，无其他约定行动",
      "en": "Normally 0–5, without another agreed action"
    },
    "status": "NF",
    "next": {
      "zh": "不叫也是回答；有约6点以上通常继续说明。",
      "en": "Passing is a response too; with about 6+ normally continue."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "minor-responses"
  },
  {
    "id": "minor-one-over-one",
    "section": "minor-responses",
    "level": "basic",
    "sequence": "1m – 1♥ / 1♠",
    "title": {
      "zh": "一盖一新花",
      "en": "One-over-one new suit"
    },
    "requirements": {
      "zh": "6点以上，所叫高花至少4张，无上限",
      "en": "6+, 4+ cards in the major, no upper limit"
    },
    "status": "F1",
    "next": {
      "zh": "开叫者必须再说明一轮；不能把6+当成只有6点。",
      "en": "Opener must describe the hand once more; 6+ is not just 6."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "minor-responses"
  },
  {
    "id": "minor-1nt",
    "section": "minor-responses",
    "level": "basic",
    "sequence": "1m – 1NT",
    "title": {
      "zh": "自然无将应叫",
      "en": "Natural 1NT response"
    },
    "requirements": {
      "zh": "6–10点，无应在一阶说明的四张高花",
      "en": "6–10, no four-card major to show at one level"
    },
    "status": "NF",
    "next": {
      "zh": "开叫低限均型可Pass，有新牌型或额外实力再叫。",
      "en": "A minimum balanced opener may pass; continue with new shape or strength."
    },
    "note": {
      "zh": "与对高花开叫的半逼叫1NT不同。",
      "en": "Different from semi-forcing 1NT after a major opening."
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "minor-responses"
  },
  {
    "id": "minor-2nt",
    "section": "minor-responses",
    "level": "basic",
    "sequence": "1m – 2NT",
    "title": {
      "zh": "自然邀请",
      "en": "Natural invitation"
    },
    "requirements": {
      "zh": "11–12点，均型，无高花可先报",
      "en": "11–12, balanced, no major to show first"
    },
    "status": "INV",
    "next": {
      "zh": "开叫者按高低限与挡张选择Pass或3NT。",
      "en": "Opener chooses pass or 3NT from strength and stoppers."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "minor-responses"
  },
  {
    "id": "minor-3nt",
    "section": "minor-responses",
    "level": "basic",
    "sequence": "1m – 3NT",
    "title": {
      "zh": "自然成局",
      "en": "Natural game response"
    },
    "requirements": {
      "zh": "13–15点，均型，适合无将",
      "en": "13–15, balanced and suitable for notrump"
    },
    "status": "NF",
    "next": {
      "zh": "一般选定3NT；明显有其他方向时再评估。",
      "en": "Normally places 3NT; reassess if another strain is clearly preferable."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "minor-responses"
  },
  {
    "id": "minor-two-over-one",
    "section": "minor-responses",
    "level": "basic",
    "sequence": "1♦ – 2♣",
    "title": {
      "zh": "二盖一逼局",
      "en": "Two-over-one game force"
    },
    "requirements": {
      "zh": "13点以上，梅花套；无干扰、未Pass",
      "en": "13+, clubs; uncontested and unpassed"
    },
    "status": "GF",
    "next": {
      "zh": "先承诺成局，再交换牌型，寻找高花或3NT。",
      "en": "Commit to game, then exchange shape to find a major or 3NT."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      5
    ],
    "lessonId": "minor-responses"
  },
  {
    "id": "minor-inverted",
    "section": "minor-responses",
    "level": "basic",
    "sequence": "1♣ – 2♣ / 1♦ – 2♦",
    "title": {
      "zh": "低花反加叫",
      "en": "Inverted minor raise"
    },
    "requirements": {
      "zh": "11点以上，至少5张低花支持，通常无应先报的四张高花",
      "en": "11+, 5+ minor support; normally no four-card major to show first"
    },
    "status": "F1",
    "next": {
      "zh": "开叫者优先展示边花挡张，先考察3NT。",
      "en": "Opener prioritizes side-suit stoppers to investigate 3NT."
    },
    "note": {
      "zh": "网站基础篇补充。不是自动逼局；后续新花挡张按约定逼叫，有限2NT或3m才可停。",
      "en": "Foundation supplement on the website. Not automatically GF; new stopper bids force, while limited 2NT or 3m can be passed."
    },
    "pages": [],
    "lessonId": "inverted-minor-raises"
  },
  {
    "id": "minor-stoppers",
    "section": "minor-responses",
    "level": "basic",
    "sequence": "1♣ – 2♣ – 2♦ – 2♥",
    "title": {
      "zh": "反加叫后的挡张",
      "en": "Stoppers after an inverted raise"
    },
    "requirements": {
      "zh": "新花表示挡张，不保证四张高花；尚未封顶",
      "en": "New suits show stoppers, not four-card majors; still uncapped"
    },
    "status": "F1",
    "next": {
      "zh": "按经济次序补挡张；联手足够且各门受保护时选3NT。",
      "en": "Show useful stoppers economically; choose 3NT when strong enough and protected."
    },
    "note": {
      "zh": "A、Kx、Qxx是常见挡张；仍需看组合和首攻方向。",
      "en": "A, Kx and Qxx are typical stoppers; combinations and lead position matter."
    },
    "pages": [],
    "lessonId": "inverted-minor-raises"
  },
  {
    "id": "major-simple",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1M – 2M",
    "title": {
      "zh": "简单支持",
      "en": "Simple raise"
    },
    "requirements": {
      "zh": "基础约定6–9点，至少3张支持",
      "en": "Foundation: 6–9, 3+ support"
    },
    "status": "NF",
    "next": {
      "zh": "开叫低限通常Pass；有额外实力可邀请或进局。",
      "en": "A minimum opener normally passes; extras can invite or bid game."
    },
    "note": {
      "zh": "启用伯根后，简单2M专用于三张支持；四张按伯根范围处理。",
      "en": "With Bergen enabled, reserve simple 2M for three-card support; use Bergen with four."
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "strength-and-minors"
  },
  {
    "id": "major-natural-limit",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1M – 3M",
    "title": {
      "zh": "基础：直接邀请",
      "en": "Foundation: direct limit raise"
    },
    "requirements": {
      "zh": "10–12点，至少4张支持；未启用伯根",
      "en": "10–12, 4+ support; Bergen off"
    },
    "status": "INV",
    "next": {
      "zh": "开叫者按高低限决定Pass或4M。",
      "en": "Opener accepts or declines with the range."
    },
    "note": {
      "zh": "此处3M是自然邀请；不能同时把它当成伯根弱阻击。",
      "en": "Here 3M is a natural invitation, not the Bergen weak preempt."
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "strength-and-minors",
    "warning": {
      "zh": "基础直接3M为自然邀请；伯根进阶3M为弱阻击。两种处理不可在同一进程混用。",
      "en": "Foundation direct 3M is a natural invitation; advanced Bergen 3M is weak and preemptive. Do not mix these treatments in the same auction."
    }
  },
  {
    "id": "major-three-limit",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1M – 1NT – … – 3M",
    "title": {
      "zh": "三张支持的两步邀请",
      "en": "Two-step three-card limit raise"
    },
    "requirements": {
      "zh": "10–12点，恰好3张支持；开叫续叫后跳回3M",
      "en": "10–12, exactly 3-card support; jump back after opener continues"
    },
    "status": "INV",
    "next": {
      "zh": "先1NT保留说话空间，再用3M限定实力，让搭档决定。",
      "en": "Start with 1NT, then limit the hand with 3M and let partner decide."
    },
    "note": {
      "zh": "如11点三张支持，也走这条路；半逼叫存在平弱开叫Pass的例外。",
      "en": "An 11-point three-card raise takes this route; a flat minimum opener can still pass semi-forcing 1NT."
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "strength-and-minors"
  },
  {
    "id": "major-one-over-one",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1♥ – 1♠",
    "title": {
      "zh": "先报四张黑桃",
      "en": "Show four spades"
    },
    "requirements": {
      "zh": "6点以上，至少4张黑桃，无上限",
      "en": "6+, 4+ spades, no upper limit"
    },
    "status": "F1",
    "next": {
      "zh": "有经济的一阶新花可说明时，优先使用，不机械塞入1NT。",
      "en": "Use an available economical one-level response instead of automatically bidding 1NT."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "strength-and-minors"
  },
  {
    "id": "major-two-over-one",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1M – 2♣ / 2♦ / 2♥",
    "title": {
      "zh": "二盖一逼局",
      "en": "Two-over-one GF"
    },
    "requirements": {
      "zh": "13点以上，合适新花；1♠—2♥需5张红桃",
      "en": "13+, a suitable new suit; 1♠–2♥ requires 5 hearts"
    },
    "status": "GF",
    "next": {
      "zh": "先建立逼局，再描述第二套、支持或无将方向。",
      "en": "Establish GF, then describe a second suit, support or notrump."
    },
    "note": {
      "zh": "无干扰、应叫者未Pass；干扰后的二阶新花另有范围，不自动逼局。",
      "en": "Uncontested and unpassed; a two-level free bid after interference is a separate agreement."
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "two-over-one-basics"
  },
  {
    "id": "major-semi",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1M – 1NT",
    "title": {
      "zh": "半逼叫1NT",
      "en": "Semi-forcing 1NT"
    },
    "requirements": {
      "zh": "约5–12点；可含11点三张支持或缺门长套。不保证均型，也不否认配合。",
      "en": "About 5–12; may include 11 with three-card support or a void and a long suit. Not necessarily balanced or without a fit."
    },
    "status": "SF",
    "next": {
      "zh": "“话可能还没说完，请搭档维持一下”；开叫有新牌型或实力应续叫。",
      "en": "“My story may be unfinished; keep room for me.” Opener continues with new shape or strength."
    },
    "note": {
      "zh": "可有11点三张支持，也可带缺门和长套；不保证均型、不否认配合。",
      "en": "Can include 11 with three-card support, or a void and a long suit; not a promise of balance or no fit."
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "strength-and-minors"
  },
  {
    "id": "major-semi-pass",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1M – 1NT – P",
    "title": {
      "zh": "半逼叫的停叫例外",
      "en": "The narrow semi-forcing exception"
    },
    "requirements": {
      "zh": "网站约定：真正平弱12–13点、5332，无第二套、无第六张",
      "en": "Website: genuinely flat 12–13, 5332, no second suit or sixth major"
    },
    "status": "NF",
    "next": {
      "zh": "只有确实无新话时可Pass；非均型低限也通常要再说。",
      "en": "Pass only when genuinely nothing new remains; a minimum unbalanced hand normally continues."
    },
    "note": {
      "zh": "PDF写12–14；本页沿用现有课程12–13的较窄例外。",
      "en": "The PDF says 12–14; this page retains the course’s narrower 12–13 exception."
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "strength-and-minors"
  },
  {
    "id": "major-jacoby",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1M – 2NT",
    "title": {
      "zh": "Jacoby 2NT 高花逼局支持",
      "en": "Jacoby 2NT GF raise"
    },
    "requirements": {
      "zh": "13点以上，至少4张支持，无上限",
      "en": "13+, 4+ support, no upper limit"
    },
    "status": "GF",
    "next": {
      "zh": "开叫有单缺，三阶新花报短套；否则按约定说明实力。",
      "en": "Opener shows shortness with a new suit at three, otherwise describes strength."
    },
    "note": {
      "zh": "这是人工支持，不是自然均型2NT。也可搜索Jacoby 2N。",
      "en": "An artificial raise, not natural balanced 2NT. Also called Jacoby 2N."
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "major-forcing-raises"
  },
  {
    "id": "jacoby-short",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1M – 2NT – 3新花",
    "title": {
      "zh": "Jacoby 后报单缺",
      "en": "Shortness after Jacoby"
    },
    "requirements": {
      "zh": "开叫者在所叫边花有单张或缺门",
      "en": "Opener has a singleton or void in the side suit"
    },
    "status": "GF",
    "next": {
      "zh": "应叫者重估短套以外的大牌，继续确定成局或满贯。",
      "en": "Responder revalues working honors outside the short suit."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "major-forcing-raises"
  },
  {
    "id": "jacoby-min",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1M – 2NT – 4M",
    "title": {
      "zh": "Jacoby 后直接成局",
      "en": "Jacoby: minimum game"
    },
    "requirements": {
      "zh": "网站约定12–13点，无单缺",
      "en": "Website agreement: 12–13, no shortness"
    },
    "status": "NF",
    "next": {
      "zh": "应叫普通逼局牌可Pass，特别强仍可探索。",
      "en": "Responder can pass with ordinary GF values; exceptional extras can continue."
    },
    "note": {
      "zh": "PDF的12–14、15–17分组与网站不同；本页不混用。",
      "en": "The PDF’s 12–14 and 15–17 groups differ from the website and are not mixed here."
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "major-forcing-raises"
  },
  {
    "id": "jacoby-medium",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1M – 2NT – 3NT",
    "title": {
      "zh": "Jacoby 中等实力",
      "en": "Jacoby: intermediate range"
    },
    "requirements": {
      "zh": "网站约定14–15点，无单缺",
      "en": "Website agreement: 14–15, no shortness"
    },
    "status": "GF",
    "next": {
      "zh": "继续判断4M或满贯；不可Pass在未达到已约定成局目标的人工描述上。",
      "en": "Continue toward the agreed major game or slam; do not treat this description as a sign-off."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "major-forcing-raises"
  },
  {
    "id": "jacoby-max",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1M – 2NT – 3M",
    "title": {
      "zh": "Jacoby 强牌慢叫",
      "en": "Jacoby: extras and room"
    },
    "requirements": {
      "zh": "网站约定16点以上，无单缺，有满贯兴趣",
      "en": "Website agreement: 16+, no shortness, slam interest"
    },
    "status": "GF",
    "next": {
      "zh": "保留空间交换控制；不能因叫得低就当弱牌。",
      "en": "Keep room for controls; a low call inside a GF is not weak."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "major-forcing-raises"
  },
  {
    "id": "major-splinter",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1M – 4新花",
    "title": {
      "zh": "Splinter 爆裂叫",
      "en": "Splinter raise"
    },
    "requirements": {
      "zh": "约12–15点，至少4张支持，跳叫花色单缺",
      "en": "About 12–15, 4+ support, shortness in the double-jumped suit"
    },
    "status": "GF",
    "next": {
      "zh": "评估工作大牌，成局为最低目标。",
      "en": "Evaluate working honors; game is the minimum target."
    },
    "note": {
      "zh": "须是约定的爆裂进程，例如1♠—4♣；不能把任意跳新花都当短套。",
      "en": "Must be an agreed splinter sequence, not any jump in a new suit."
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "major-forcing-raises"
  },
  {
    "id": "bergen-clubs",
    "section": "major-responses",
    "level": "advanced",
    "sequence": "1M – 3♣",
    "title": {
      "zh": "伯根：建设性支持",
      "en": "Bergen constructive raise"
    },
    "requirements": {
      "zh": "7–9点，至少4张支持；启用伯根",
      "en": "7–9, 4+ support; Bergen enabled"
    },
    "status": "NF",
    "next": {
      "zh": "开叫低限退回3M；合适的强牌考虑4M。",
      "en": "A minimum signs off in 3M; a suitable strong opener considers game."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "bergen-raises"
  },
  {
    "id": "bergen-diamonds",
    "section": "major-responses",
    "level": "advanced",
    "sequence": "1M – 3♦",
    "title": {
      "zh": "伯根：限制性邀请",
      "en": "Bergen limit raise"
    },
    "requirements": {
      "zh": "10–12点，至少4张支持",
      "en": "10–12, 4+ support"
    },
    "status": "INV",
    "next": {
      "zh": "约12–13点通常拒绝；合适的14点以上可接受。",
      "en": "About 12–13 normally declines; a suitable 14+ may accept."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "bergen-raises"
  },
  {
    "id": "bergen-weak",
    "section": "major-responses",
    "level": "advanced",
    "sequence": "1M – 3M",
    "title": {
      "zh": "伯根：弱阻击支持",
      "en": "Bergen weak raise"
    },
    "requirements": {
      "zh": "约0–6点，至少4张支持；与基础自然3M互斥",
      "en": "About 0–6, 4+ support; replaces the foundation natural 3M"
    },
    "status": "NF",
    "next": {
      "zh": "开叫按赢墩与局况判断；九张将牌不保证三阶安全。",
      "en": "Opener judges tricks and vulnerability; nine trumps do not guarantee safety."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "bergen-raises",
    "warning": {
      "zh": "基础直接3M为自然邀请；伯根进阶3M为弱阻击。两种处理不可在同一进程混用。",
      "en": "Foundation direct 3M is a natural invitation; advanced Bergen 3M is weak and preemptive. Do not mix these treatments in the same auction."
    }
  },
  {
    "id": "mini-splinter",
    "section": "major-responses",
    "level": "basic",
    "sequence": "1♥ – 3♠",
    "title": {
      "zh": "Mini-Splinter 迷你爆裂叫",
      "en": "Mini-Splinter raise"
    },
    "requirements": {
      "zh": "本课约定9–11点，至少4张红桃支持，一门未指明的单张或缺门",
      "en": "Course agreement: 9–11, 4+ heart support, an unspecified singleton or void"
    },
    "status": "GF",
    "next": {
      "zh": "开叫者可直接4♥；3NT询问短套。回答4♣=梅花短、4♦=方块短、4♥=黑桃短。",
      "en": "Opener may bid 4♥ directly or ask with 3NT. Replies: 4♣ clubs short, 4♦ diamonds short, 4♥ spades short."
    },
    "note": {
      "zh": "这一路已越过3♥，本课约定逼到4♥；有点力上限，仍然可以逼局。",
      "en": "This route has passed 3♥ and forces to 4♥ by agreement. A limited range can still be game forcing."
    },
    "pages": [
      3,
      4,
      5
    ],
    "lessonId": "mini-splinters"
  },
  {
    "id": "rebid-1nt",
    "section": "rebids",
    "level": "basic",
    "sequence": "1m – 1M – 1NT",
    "title": {
      "zh": "均型低限",
      "en": "Minimum balanced rebid"
    },
    "requirements": {
      "zh": "12–14点，无四张应叫高花支持",
      "en": "12–14, no four-card support for responder’s major"
    },
    "status": "NF",
    "next": {
      "zh": "限定实力，搭档可停、邀请，或用后续工具找配合。",
      "en": "Limits strength; responder may stop, invite or use a follow-up inquiry."
    },
    "note": {
      "zh": "不要和15–17点的1NT开叫混淆；可能仍有三张支持。",
      "en": "Not the 15–17 1NT opening; three-card support remains possible."
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "conversation"
  },
  {
    "id": "rebid-simple-raise",
    "section": "rebids",
    "level": "basic",
    "sequence": "1m – 1M – 2M",
    "title": {
      "zh": "四张支持的低限加叫",
      "en": "Minimum raise with four"
    },
    "requirements": {
      "zh": "约12–15点，4张应叫高花支持",
      "en": "About 12–15, four-card support"
    },
    "status": "NF",
    "next": {
      "zh": "有限描述后，把是否继续的决定交给搭档。",
      "en": "A limited description lets partner decide whether to continue."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "conversation"
  },
  {
    "id": "rebid-own",
    "section": "rebids",
    "level": "basic",
    "sequence": "1M – 1新花 – 2M",
    "title": {
      "zh": "原高花低限再叫",
      "en": "Minimum major rebid"
    },
    "requirements": {
      "zh": "约12–15点，通常6张原高花",
      "en": "About 12–15, normally a six-card major"
    },
    "status": "NF",
    "next": {
      "zh": "表示额外长度，不是因为牌强才继续；搭档先前逼叫必须回应。",
      "en": "Shows extra length; the forcing first response required a reply even with a minimum."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "conversation"
  },
  {
    "id": "rebid-one-suit",
    "section": "rebids",
    "level": "basic",
    "sequence": "1♣ – 1♦ – 1♥",
    "title": {
      "zh": "一阶顺叫新花",
      "en": "Economical one-level new suit"
    },
    "requirements": {
      "zh": "约12–18点，第二套至少4张，无窄上限",
      "en": "About 12–18, 4+ in the second suit; still a broad range"
    },
    "status": "NF",
    "next": {
      "zh": "开叫者经济顺叫可被Pass；它不同于应叫者无上限的一盖一。",
      "en": "Opener’s economical rebid may be passed; distinguish it from responder’s uncapped one-over-one."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "conversation"
  },
  {
    "id": "rebid-cheap-suit",
    "section": "rebids",
    "level": "basic",
    "sequence": "1♦ – 1♠ – 2♣",
    "title": {
      "zh": "二阶非逆叫",
      "en": "Non-reverse second suit"
    },
    "requirements": {
      "zh": "约12–18点，通常第一套5张、第二套4张",
      "en": "About 12–18, normally five in the first suit and four in the second"
    },
    "status": "NF",
    "next": {
      "zh": "有第二套要说；应叫者可以经济回第一套。",
      "en": "Shows a second suit while retaining an economical preference."
    },
    "note": {
      "zh": "不是只准12–15点；有些中等牌仍不够跳叫或逆叫。",
      "en": "Not restricted to 12–15; some intermediate hands lack the values for a jump or reverse."
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "conversation"
  },
  {
    "id": "rebid-jump-raise",
    "section": "rebids",
    "level": "basic",
    "sequence": "1m – 1M – 3M",
    "title": {
      "zh": "跳加叫邀请",
      "en": "Jump-raise invitation"
    },
    "requirements": {
      "zh": "约16–18点，4张高花支持",
      "en": "About 16–18, four-card major support"
    },
    "status": "INV",
    "next": {
      "zh": "邀请应叫者以高低限决定是否4M。",
      "en": "Invites responder to choose whether to bid 4M."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "conversation"
  },
  {
    "id": "rebid-jump-own",
    "section": "rebids",
    "level": "basic",
    "sequence": "1M – 1新花 – 3M",
    "title": {
      "zh": "强长套跳再叫",
      "en": "Jump rebid of a strong suit"
    },
    "requirements": {
      "zh": "约16–18点，好的6张以上长套",
      "en": "About 16–18, a good six-card or longer suit"
    },
    "status": "INV",
    "next": {
      "zh": "邀请，不是自动逼局；应叫者可Pass。",
      "en": "Invitational, not automatically GF; responder may pass."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "conversation"
  },
  {
    "id": "rebid-2nt",
    "section": "rebids",
    "level": "basic",
    "sequence": "1m – 1M – 2NT",
    "title": {
      "zh": "强均型跳无将",
      "en": "Jump notrump rebid"
    },
    "requirements": {
      "zh": "18–19点，均型",
      "en": "18–19, balanced"
    },
    "status": "NF",
    "next": {
      "zh": "应叫者通常向3NT或高花成局评估，不是15–17。",
      "en": "Responder assesses 3NT or a major game; not the 15–17 range."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "conversation"
  },
  {
    "id": "rebid-reverse",
    "section": "rebids",
    "level": "basic",
    "sequence": "1♦ – 1♠ – 2♥",
    "title": {
      "zh": "逆叫",
      "en": "Reverse"
    },
    "requirements": {
      "zh": "约17点以上，第一套通常5张、第二套4张",
      "en": "About 17+, normally 5–4 shape"
    },
    "status": "F1",
    "next": {
      "zh": "回第一套被抬到三阶，所以要额外实力；不自动逼局。",
      "en": "Returning to the first suit now costs three levels; extras are required, but GF is not automatic."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "reverse-bids"
  },
  {
    "id": "rebid-reverse-support",
    "section": "rebids",
    "level": "basic",
    "sequence": "1♦ – 1♠ – 2♥ – 3♦",
    "title": {
      "zh": "逆叫后的建设性支持",
      "en": "Constructive support after a reverse"
    },
    "requirements": {
      "zh": "本课8点左右或以上，三张方块支持",
      "en": "Course example: about 8+ with three diamonds"
    },
    "status": "GF",
    "next": {
      "zh": "17点以上配8点已可承诺成局；弱牌刹车另有约定。",
      "en": "17+ opposite 8 can commit to game; weak braking routes need a separate agreement."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "reverse-bids"
  },
  {
    "id": "rebid-jump-shift",
    "section": "rebids",
    "level": "basic",
    "sequence": "1♦ – 1♠ – 3♣",
    "title": {
      "zh": "强牌跳新花",
      "en": "Strong jump shift"
    },
    "requirements": {
      "zh": "约19点以上或相应赢墩实力，真实第二套",
      "en": "About 19+ or equivalent playing strength, a real second suit"
    },
    "status": "GF",
    "next": {
      "zh": "继续描述配合与控制；不可当弱跳争叫。",
      "en": "Continue describing fit and controls; not a weak jump overcall."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "conversation"
  },
  {
    "id": "rebid-after-gf",
    "section": "rebids",
    "level": "basic",
    "sequence": "1♥ – 2♣ – 2♦ – 2♥",
    "title": {
      "zh": "逼局后的经济描述",
      "en": "Economical description inside GF"
    },
    "requirements": {
      "zh": "二盖一已承诺成局；2♥支持可只有3张",
      "en": "A 2/1 GF already exists; 2♥ support may be three cards"
    },
    "status": "GF",
    "next": {
      "zh": "叫低保留空间；仍不能停在成局以下。",
      "en": "Low bidding keeps room; the partnership still cannot stop below game."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      5,
      6
    ],
    "lessonId": "two-over-one-basics"
  },
  {
    "id": "stayman-ask",
    "section": "stayman",
    "level": "basic",
    "sequence": "1NT – 2♣",
    "title": {
      "zh": "斯台曼问高花",
      "en": "Stayman inquiry"
    },
    "requirements": {
      "zh": "通常8点以上，至少一门恰好4张高花",
      "en": "Normally 8+, at least one exactly four-card major"
    },
    "status": "F1",
    "next": {
      "zh": "人工问高花，不是要打梅花；开叫必须回答。",
      "en": "Artificial major inquiry, not clubs to play; opener must answer."
    },
    "note": {
      "zh": "让强的1NT开叫者通常做庄，避免其大牌暴露在明手，并改善首攻方向。",
      "en": "Usually keeps the strong 1NT opener declaring, with honors concealed and a helpful lead orientation."
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-fit"
  },
  {
    "id": "stayman-deny",
    "section": "stayman",
    "level": "basic",
    "sequence": "1NT – 2♣ – 2♦",
    "title": {
      "zh": "否认四张高花",
      "en": "No four-card major"
    },
    "requirements": {
      "zh": "开叫者两门高花都不足4张",
      "en": "Opener has no four-card major"
    },
    "status": "NF",
    "next": {
      "zh": "应叫按实力与5–4牌型选择2NT、3NT或后续约定。",
      "en": "Responder chooses 2NT, 3NT or an agreed 5–4 route."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-fit"
  },
  {
    "id": "stayman-heart",
    "section": "stayman",
    "level": "basic",
    "sequence": "1NT – 2♣ – 2♥",
    "title": {
      "zh": "表示四张红桃",
      "en": "Show four hearts"
    },
    "requirements": {
      "zh": "至少4张红桃，也可能有4张黑桃",
      "en": "4+ hearts; may also have four spades"
    },
    "status": "NF",
    "next": {
      "zh": "应叫有红桃配合则邀请或成局；只有黑桃可继续找。",
      "en": "With a heart fit, invite or bid game; spades may still be available."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-fit"
  },
  {
    "id": "stayman-spade",
    "section": "stayman",
    "level": "basic",
    "sequence": "1NT – 2♣ – 2♠",
    "title": {
      "zh": "表示四张黑桃",
      "en": "Show four spades"
    },
    "requirements": {
      "zh": "至少4张黑桃，否认4张红桃",
      "en": "4+ spades, denies four hearts"
    },
    "status": "NF",
    "next": {
      "zh": "按是否找到配合及实力决定下一步。",
      "en": "Continue from fit and strength."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-fit"
  },
  {
    "id": "stayman-2nt",
    "section": "stayman",
    "level": "basic",
    "sequence": "1NT – 2♣ – 2♦ – 2NT",
    "title": {
      "zh": "无配合邀请",
      "en": "Invitation without a fit"
    },
    "requirements": {
      "zh": "8–9点，没有已知八张高花配合",
      "en": "8–9, no known eight-card major fit"
    },
    "status": "INV",
    "next": {
      "zh": "开叫15点通常Pass，17点通常3NT，16点看牌质。",
      "en": "With 15 normally pass, with 17 normally bid 3NT; judge a 16-point hand."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-fit"
  },
  {
    "id": "stayman-3nt",
    "section": "stayman",
    "level": "basic",
    "sequence": "1NT – 2♣ – 2♦ – 3NT",
    "title": {
      "zh": "无高花配合进局",
      "en": "Notrump game"
    },
    "requirements": {
      "zh": "通常10点以上，够成局而无需再找五张高花",
      "en": "Normally 10+, enough for game with no five-card major still to locate"
    },
    "status": "NF",
    "next": {
      "zh": "3NT成局；更强的满贯手牌不能只按最低成局强度处理。",
      "en": "Places 3NT; exceptional slam hands need a separate investigation."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-fit"
  },
  {
    "id": "stayman-invite-fit",
    "section": "stayman",
    "level": "basic",
    "sequence": "1NT – 2♣ – 2M – 3M",
    "title": {
      "zh": "找到4–4配合后邀请",
      "en": "Invite with the 4–4 fit"
    },
    "requirements": {
      "zh": "8–9点，4张支持",
      "en": "8–9, four-card support"
    },
    "status": "INV",
    "next": {
      "zh": "开叫低限Pass，高限4M。",
      "en": "Minimum passes; maximum bids 4M."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-fit"
  },
  {
    "id": "stayman-game-fit",
    "section": "stayman",
    "level": "basic",
    "sequence": "1NT – 2♣ – 2M – 4M",
    "title": {
      "zh": "找到配合后成局",
      "en": "Game in the fit"
    },
    "requirements": {
      "zh": "通常10点以上，4张支持，普通成局牌",
      "en": "Normally 10+, four-card support, ordinary game values"
    },
    "status": "NF",
    "next": {
      "zh": "把定约选在高花成局。",
      "en": "Places the major game."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-fit"
  },
  {
    "id": "stayman-choice",
    "section": "stayman",
    "level": "basic",
    "sequence": "1NT – 2♣ – 2♥ – 3NT",
    "title": {
      "zh": "另一门高花的成局选择",
      "en": "Choice of games"
    },
    "requirements": {
      "zh": "成局实力，通常4张黑桃而无4张红桃",
      "en": "Game values, normally four spades without four hearts"
    },
    "status": "NF",
    "next": {
      "zh": "开叫另有4张黑桃可改4♠；否则通常Pass 3NT。",
      "en": "Opener may correct to 4♠ with four spades, otherwise usually passes 3NT."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-fit"
  },
  {
    "id": "transfer-hearts",
    "section": "transfers",
    "level": "basic",
    "sequence": "1NT – 2♦",
    "title": {
      "zh": "雅各比转移到红桃",
      "en": "Jacoby transfer to hearts"
    },
    "requirements": {
      "zh": "至少5张红桃；转移本身不限定点力",
      "en": "5+ hearts; the transfer does not itself limit strength"
    },
    "status": "F1",
    "next": {
      "zh": "2♦要求开叫者叫2♥；不能因为没红桃就Pass人工2♦。",
      "en": "2♦ asks opener to bid 2♥; do not pass the artificial call."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7
    ],
    "lessonId": "jacoby-transfers"
  },
  {
    "id": "transfer-spades",
    "section": "transfers",
    "level": "basic",
    "sequence": "1NT – 2♥",
    "title": {
      "zh": "雅各比转移到黑桃",
      "en": "Jacoby transfer to spades"
    },
    "requirements": {
      "zh": "至少5张黑桃；不是表示红桃",
      "en": "5+ spades, not hearts"
    },
    "status": "F1",
    "next": {
      "zh": "完成转移，应叫者随后限定实力或继续逼局。",
      "en": "Complete the transfer; responder then limits the hand or continues forcing."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7
    ],
    "lessonId": "jacoby-transfers"
  },
  {
    "id": "transfer-pass",
    "section": "transfers",
    "level": "basic",
    "sequence": "1NT – 转移 – 2M – P",
    "title": {
      "zh": "转移后弱牌止叫",
      "en": "Weak transfer sign-off"
    },
    "requirements": {
      "zh": "通常0–7点，至少5张高花",
      "en": "Normally 0–7, 5+ major"
    },
    "status": "NF",
    "next": {
      "zh": "选定2M；通常让强牌一方做庄。",
      "en": "Stops in 2M with the strong hand normally declaring."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7
    ],
    "lessonId": "jacoby-transfers"
  },
  {
    "id": "transfer-2nt",
    "section": "transfers",
    "level": "basic",
    "sequence": "1NT – 转移 – 2M – 2NT",
    "title": {
      "zh": "五张高花邀请",
      "en": "Invite with five"
    },
    "requirements": {
      "zh": "8–9点，恰好5张所转高花",
      "en": "8–9, exactly five in the transferred major"
    },
    "status": "INV",
    "next": {
      "zh": "开叫在Pass、3M、3NT、4M间按实力与支持选择。",
      "en": "Opener chooses among pass, 3M, 3NT and 4M from strength and support."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7
    ],
    "lessonId": "jacoby-transfers"
  },
  {
    "id": "transfer-3nt",
    "section": "transfers",
    "level": "basic",
    "sequence": "1NT – 转移 – 2M – 3NT",
    "title": {
      "zh": "五张高花成局选择",
      "en": "Game choice with five"
    },
    "requirements": {
      "zh": "通常10–15点，恰好5张高花",
      "en": "Normally 10–15, exactly five in the major"
    },
    "status": "NF",
    "next": {
      "zh": "开叫通常三张支持改4M，只有两张通常打3NT。",
      "en": "With three-card support normally choose 4M; with two normally play 3NT."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7
    ],
    "lessonId": "jacoby-transfers"
  },
  {
    "id": "transfer-invite-six",
    "section": "transfers",
    "level": "basic",
    "sequence": "1NT – 转移 – 2M – 3M",
    "title": {
      "zh": "六张高花邀请",
      "en": "Invite with six"
    },
    "requirements": {
      "zh": "8–9点，至少6张所转高花",
      "en": "8–9, 6+ in the transferred major"
    },
    "status": "INV",
    "next": {
      "zh": "八张以上配合已知，开叫按高低限决定是否4M。",
      "en": "An eight-card fit is known; opener accepts or declines game."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7
    ],
    "lessonId": "jacoby-transfers"
  },
  {
    "id": "transfer-new-minor",
    "section": "transfers",
    "level": "basic",
    "sequence": "1NT – 转移 – 2M – 3m",
    "title": {
      "zh": "转移后第二套",
      "en": "Second suit after a transfer"
    },
    "requirements": {
      "zh": "10点以上，至少5张高花及真实低花套",
      "en": "10+, five-card major and a real minor suit"
    },
    "status": "GF",
    "next": {
      "zh": "继续找高花配合、3NT或低花方向。",
      "en": "Continue toward a major fit, 3NT or a minor contract."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7
    ],
    "lessonId": "jacoby-transfers"
  },
  {
    "id": "stayman-invite-54",
    "section": "nt-advanced",
    "level": "advanced",
    "sequence": "1NT – 2♣ – 2♦ – 2♥ / 2♠",
    "title": {
      "zh": "斯台曼后5–4邀请",
      "en": "Invitational 5–4 majors"
    },
    "requirements": {
      "zh": "8–9点，所叫高花5张，另一门4张",
      "en": "8–9, five in the bid major and four in the other"
    },
    "status": "INV",
    "next": {
      "zh": "开叫按实力与三张支持选择合适定约。",
      "en": "Opener chooses from strength and three-card support."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-smolen"
  },
  {
    "id": "smolen-spade",
    "section": "nt-advanced",
    "level": "advanced",
    "sequence": "1NT – 2♣ – 2♦ – 3♠",
    "title": {
      "zh": "Smolen：五红桃四黑桃",
      "en": "Smolen: five hearts, four spades"
    },
    "requirements": {
      "zh": "10点以上，5张红桃、4张黑桃",
      "en": "10+, five hearts and four spades"
    },
    "status": "GF",
    "next": {
      "zh": "跳叫四张套来显示另一门五张套；开叫三张红桃可4♥，两张通常3NT。",
      "en": "Jump in the four-card suit to show five in the other; opener chooses 4♥ with three hearts, otherwise normally 3NT."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-smolen"
  },
  {
    "id": "smolen-heart",
    "section": "nt-advanced",
    "level": "advanced",
    "sequence": "1NT – 2♣ – 2♦ – 3♥",
    "title": {
      "zh": "Smolen：五黑桃四红桃",
      "en": "Smolen: five spades, four hearts"
    },
    "requirements": {
      "zh": "10点以上，5张黑桃、4张红桃",
      "en": "10+, five spades and four hearts"
    },
    "status": "GF",
    "next": {
      "zh": "开叫三张黑桃可4♠，只有两张通常3NT。",
      "en": "Opener can bid 4♠ with three spades; with two normally choose 3NT."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-smolen"
  },
  {
    "id": "garbage-stayman",
    "section": "nt-advanced",
    "level": "advanced",
    "sequence": "1NT – 2♣ – 任意回答 – P",
    "title": {
      "zh": "垃圾斯台曼",
      "en": "Garbage Stayman"
    },
    "requirements": {
      "zh": "0–7点，能承受2♦、2♥、2♠每种回答的三套牌",
      "en": "0–7, a three-suiter able to tolerate 2♦, 2♥ or 2♠"
    },
    "status": "NF",
    "next": {
      "zh": "先用2♣要求回答，再可Pass开叫的回答；不能任意弱牌都问。",
      "en": "2♣ first requires an answer, then responder may pass; not for arbitrary weak hands."
    },
    "note": {
      "zh": "常见4441或5440且梅花短；整条进程标为可停，2♣本身仍逼叫一轮。",
      "en": "Often 4441 or 5440 with short clubs; the final response may be passed, while 2♣ itself still forces once."
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "stayman-smolen"
  },
  {
    "id": "transfer-55-invite",
    "section": "nt-advanced",
    "level": "advanced",
    "sequence": "1NT – 2♦ – 2♥ – 2♠",
    "title": {
      "zh": "五五高花邀请",
      "en": "Invitational 5–5 majors"
    },
    "requirements": {
      "zh": "约8–9点，5张红桃、5张黑桃",
      "en": "About 8–9, five hearts and five spades"
    },
    "status": "INV",
    "next": {
      "zh": "按本课特定约定，邀请并让开叫者选择高花。",
      "en": "An agreed invitational route asking opener to choose the major."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "texas-transfers"
  },
  {
    "id": "transfer-55-gf",
    "section": "nt-advanced",
    "level": "advanced",
    "sequence": "1NT – 2♥ – 2♠ – 3♥",
    "title": {
      "zh": "五五高花逼局",
      "en": "Game-forcing 5–5 majors"
    },
    "requirements": {
      "zh": "10点以上，5张黑桃、5张红桃",
      "en": "10+, five spades and five hearts"
    },
    "status": "GF",
    "next": {
      "zh": "开叫选择高花成局；不能把低阶红桃当弱逃跑。",
      "en": "Opener chooses the major game; this heart bid is not a weak escape."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "texas-transfers"
  },
  {
    "id": "texas-heart",
    "section": "nt-advanced",
    "level": "advanced",
    "sequence": "1NT – 4♦",
    "title": {
      "zh": "Texas 转移到红桃",
      "en": "Texas transfer to hearts"
    },
    "requirements": {
      "zh": "成局实力，至少6张红桃",
      "en": "Game values, 6+ hearts"
    },
    "status": "GF",
    "next": {
      "zh": "开叫完成4♥；普通成局牌随后Pass。",
      "en": "Opener completes 4♥; an ordinary game hand then passes."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "texas-transfers"
  },
  {
    "id": "texas-spade",
    "section": "nt-advanced",
    "level": "advanced",
    "sequence": "1NT – 4♥",
    "title": {
      "zh": "Texas 转移到黑桃",
      "en": "Texas transfer to spades"
    },
    "requirements": {
      "zh": "成局实力，至少6张黑桃",
      "en": "Game values, 6+ spades"
    },
    "status": "GF",
    "next": {
      "zh": "开叫完成4♠；先确保六张，而不是拿五张套照用。",
      "en": "Opener completes 4♠; six-card length is required."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "texas-transfers"
  },
  {
    "id": "texas-rkcb",
    "section": "nt-advanced",
    "level": "advanced",
    "sequence": "1NT – 4♦ – 4♥ – 4NT / 1NT – 4♥ – 4♠ – 4NT",
    "title": {
      "zh": "Texas 后4NT＝RKCB",
      "en": "4NT after Texas = RKCB"
    },
    "requirements": {
      "zh": "将牌已定，强到要探索满贯；询问5张关键张",
      "en": "Trumps agreed, enough strength to investigate slam; asks five keycards"
    },
    "status": "F1",
    "next": {
      "zh": "按1430回答：5♣=1/4，5♦=0/3，5♥=2无将Q，5♠=2有将Q。",
      "en": "Use 1430: 5♣=1/4, 5♦=0/3, 5♥=2 without the trump queen, 5♠=2 with it."
    },
    "note": {
      "zh": "原表“8–9点、恰好5张、邀请”为错误；此处不是定量4NT。",
      "en": "The source’s “8–9, exactly five, invitational” is incorrect here; this is not quantitative 4NT."
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "texas-transfers"
  },
  {
    "id": "jacoby-slam-invite",
    "section": "nt-advanced",
    "level": "advanced",
    "sequence": "1NT – 转移 – 2M – 4M",
    "title": {
      "zh": "雅各比后跳成局邀满贯",
      "en": "Jacoby then game: slam invitation"
    },
    "requirements": {
      "zh": "6张以上高花，中间档满贯兴趣；本课约定",
      "en": "6+ major, intermediate slam interest; course agreement"
    },
    "status": "NF",
    "next": {
      "zh": "与Texas后Pass区分；开叫可Pass或继续探索满贯。",
      "en": "Distinguish from Texas then pass; opener can stop or investigate slam."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "texas-transfers"
  },
  {
    "id": "stayman-64-texas",
    "section": "nt-advanced",
    "level": "advanced",
    "sequence": "1NT – 2♣ – 2♦ – 4♦ / 4♥",
    "title": {
      "zh": "六四高花转Texas",
      "en": "6–4 majors through Texas"
    },
    "requirements": {
      "zh": "成局实力，一门6张、一门4张；2♦否认四张高花后",
      "en": "Game values, 6–4 majors after 2♦ denies a four-card major"
    },
    "status": "GF",
    "next": {
      "zh": "转移到六张高花，开叫人做庄；若先找到4–4配合可直接选该高花。",
      "en": "Transfer to the six-card major with opener declaring; use the 4–4 fit if already found."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      6,
      7
    ],
    "lessonId": "texas-transfers"
  },
  {
    "id": "overcall-one",
    "section": "overcalls",
    "level": "advanced",
    "sequence": "(1m) – 1♥ / 1♠",
    "title": {
      "zh": "一阶花色争叫",
      "en": "One-level suit overcall"
    },
    "requirements": {
      "zh": "约8–16点，至少5张好套",
      "en": "About 8–16, 5+ in a good suit"
    },
    "status": "NF",
    "next": {
      "zh": "体现首攻方向与竞争能力，不是有点数就能随便报套。",
      "en": "Shows a lead and competitive values; suit quality is essential."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "overcall-two",
    "section": "overcalls",
    "level": "advanced",
    "sequence": "(1M) – 2♣ / 2♦",
    "title": {
      "zh": "二阶花色争叫",
      "en": "Two-level suit overcall"
    },
    "requirements": {
      "zh": "约11–16点，好的5张或6张长套",
      "en": "About 11–16, a good five-card or six-card suit"
    },
    "status": "NF",
    "next": {
      "zh": "阶数更高，要更重视牌质、局况与被加倍风险。",
      "en": "Higher levels demand better suit quality and vulnerability judgment."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "overcall-nt",
    "section": "overcalls",
    "level": "advanced",
    "sequence": "(1花色) – 1NT",
    "title": {
      "zh": "直接无将争叫",
      "en": "Direct 1NT overcall"
    },
    "requirements": {
      "zh": "15–18点，均型，对方花色有挡张",
      "en": "15–18, balanced, stopper in the opened suit"
    },
    "status": "NF",
    "next": {
      "zh": "本课无将工具开启：搭档可用Stayman与转移。",
      "en": "Systems on in this course: partner may use Stayman and transfers."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "overcall-balancing-nt",
    "section": "overcalls",
    "level": "advanced",
    "sequence": "(1花色) – P – (P) – 1NT",
    "title": {
      "zh": "平衡位置无将",
      "en": "Balancing 1NT"
    },
    "requirements": {
      "zh": "约11–14点，均型，平衡位置",
      "en": "About 11–14, balanced, in balancing seat"
    },
    "status": "NF",
    "next": {
      "zh": "不是直接位置15–18点；结合搭档已Pass的信息。",
      "en": "Not the direct 15–18 range; partner’s pass changes the context."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "overcall-power-suit",
    "section": "overcalls",
    "level": "advanced",
    "sequence": "(1花色) – X – … – 新花",
    "title": {
      "zh": "先加倍后报强套",
      "en": "Double then bid a strong suit"
    },
    "requirements": {
      "zh": "自然不跳再叫通常约17–20点或等同赢墩实力，好5张以上套",
      "en": "A natural non-jump rebid normally shows about 17–20 or equivalent playing strength, a good 5+ suit"
    },
    "status": "NF",
    "next": {
      "zh": "澄清强牌单套；不要拿普通争叫牌机械地先加倍。",
      "en": "Clarify the strong suit; do not double first with every ordinary overcall hand."
    },
    "note": {
      "zh": "强但不自动逼叫；真正要逼局的强牌需另用约定的强制进程。",
      "en": "Strong but not automatically forcing; a game-forcing powerhouse needs an agreed forcing route."
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "overcall-power-nt",
    "section": "overcalls",
    "level": "advanced",
    "sequence": "(1花色) – X – … – NT",
    "title": {
      "zh": "先加倍后无将",
      "en": "Double then notrump"
    },
    "requirements": {
      "zh": "约19–21点，均型，有对方花色挡张",
      "en": "About 19–21, balanced, stopper"
    },
    "status": "NF",
    "next": {
      "zh": "跳叫与非跳无将的精确后续仍需结合进程约定。",
      "en": "Read the exact level and whether the notrump bid is a jump."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "advance-new",
    "section": "advancing",
    "level": "advanced",
    "sequence": "(1♦) – 1♥ – (P) – 1♠",
    "title": {
      "zh": "进叫新花",
      "en": "Constructive new suit"
    },
    "requirements": {
      "zh": "约10–13点，通常5张以上好套",
      "en": "About 10–13, normally a good 5+ suit"
    },
    "status": "NF",
    "next": {
      "zh": "这是争叫后的NFC进叫，不是无干扰的一盖一逼叫。",
      "en": "NFC after an overcall, unlike a forcing uncontested one-over-one response."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "advance-raise",
    "section": "advancing",
    "level": "advanced",
    "sequence": "(1♦) – 1♥ – (P) – 2♥",
    "title": {
      "zh": "简单支持争叫",
      "en": "Simple advance raise"
    },
    "requirements": {
      "zh": "约6–10支持点，至少3张支持",
      "en": "About 6–10 support points, 3+ support"
    },
    "status": "NF",
    "next": {
      "zh": "有限支持；争叫者按实力决定是否继续。",
      "en": "A limited raise; overcaller decides whether to continue."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "advance-cue",
    "section": "advancing",
    "level": "advanced",
    "sequence": "(1♦) – 1♥ – (P) – 2♦",
    "title": {
      "zh": "扣叫示强",
      "en": "Forcing cue-bid advance"
    },
    "requirements": {
      "zh": "好的10点以上及3张支持，或约14点以上无支持强牌",
      "en": "Good 10+ with 3-card support, or about 14+ without support"
    },
    "status": "F1",
    "next": {
      "zh": "本NFC框架主要逼叫工具，先请搭档补充实力与牌型。",
      "en": "The main forcing tool in this NFC framework, asking partner to clarify strength and shape."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "advance-jump-new",
    "section": "advancing",
    "level": "advanced",
    "sequence": "(1♦) – 1♥ – (P) – 2♠",
    "title": {
      "zh": "跳新花邀请",
      "en": "Invitational jump new suit"
    },
    "requirements": {
      "zh": "约13–15点，好6张以上套",
      "en": "About 13–15, a good 6+ suit"
    },
    "status": "INV",
    "next": {
      "zh": "自然邀请；与开叫后遇干扰的弱跳新花区分。",
      "en": "Natural invitation, unlike a weak jump response after interference over partner’s opening."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "advance-jump-cue",
    "section": "advancing",
    "level": "advanced",
    "sequence": "(1♦) – 1♥ – (P) – 3♦",
    "title": {
      "zh": "跳扣叫限制性支持",
      "en": "Jump cue-bid raise"
    },
    "requirements": {
      "zh": "约10点以上总点，至少4张支持，邀请",
      "en": "About 10+ total points, 4+ support, invitational"
    },
    "status": "INV",
    "next": {
      "zh": "用配合与重估实力邀请；不是自然方块套。",
      "en": "Invite with support and revaluation, not natural diamonds."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "advance-double-jump-cue",
    "section": "advancing",
    "level": "advanced",
    "sequence": "(1♦) – 1♥ – (P) – 4♦",
    "title": {
      "zh": "双跳扣叫爆裂",
      "en": "Double-jump cue-bid splinter"
    },
    "requirements": {
      "zh": "成局实力，4张以上支持，所叫花色短套",
      "en": "Game values, 4+ support, shortness in the bid suit"
    },
    "status": "GF",
    "next": {
      "zh": "先确定配合和短套，再评估是否有满贯。",
      "en": "Show fit and shortness, then judge slam."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "advance-1nt",
    "section": "advancing",
    "level": "advanced",
    "sequence": "(1♦) – 1♥ – (P) – 1NT",
    "title": {
      "zh": "进叫自然1NT",
      "en": "Natural 1NT advance"
    },
    "requirements": {
      "zh": "约9–12点，均型，有对方花色挡张，通常无3张高花支持",
      "en": "About 9–12, balanced, enemy-suit stopper, normally no 3-card major fit"
    },
    "status": "NF",
    "next": {
      "zh": "自然有限描述，不是对高花开叫的半逼叫。",
      "en": "Natural and limited, not semi-forcing after a major opening."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "advance-2nt",
    "section": "advancing",
    "level": "advanced",
    "sequence": "(1♦) – 1♥ – (P) – 2NT",
    "title": {
      "zh": "跳无将邀请",
      "en": "Jump notrump invitation"
    },
    "requirements": {
      "zh": "约13–15点，均型，好挡张",
      "en": "About 13–15, balanced, good stoppers"
    },
    "status": "INV",
    "next": {
      "zh": "邀请3NT；二阶争叫后的非跳2NT范围不同。",
      "en": "Invites 3NT; a non-jump 2NT after a two-level overcall has a different range."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "advance-over-two",
    "section": "advancing",
    "level": "advanced",
    "sequence": "(1♠) – 2♥ – (P) – 2NT",
    "title": {
      "zh": "二阶争叫后的2NT",
      "en": "2NT after a two-level overcall"
    },
    "requirements": {
      "zh": "好的9点至较弱12点，有对方花色挡张",
      "en": "Good 9 to weak 12, stopper in the opponents’ suit"
    },
    "status": "INV",
    "next": {
      "zh": "结合争叫者的二阶实力，邀请合适的3NT。",
      "en": "Invites a suitable 3NT opposite the two-level overcall."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      7,
      8
    ],
    "lessonId": "overcall-strategy"
  },
  {
    "id": "takeout-shape",
    "section": "takeout",
    "level": "advanced",
    "sequence": "(1花色) – X",
    "title": {
      "zh": "技术性加倍",
      "en": "Takeout double"
    },
    "requirements": {
      "zh": "12点以上，对方套通常0–2张，其余花色能支持",
      "en": "12+, normally 0–2 in opener’s suit, support for unbid suits"
    },
    "status": "F1",
    "next": {
      "zh": "请求搭档选套；未叫高花理想4张，其余通常3张以上。",
      "en": "Asks partner to choose; ideally four in unbid majors, normally 3+ in the other unbid suits."
    },
    "note": {
      "zh": "此处F1表示对手Pass后须回应的义务；强牌先加倍后另作澄清是特例。",
      "en": "F1 here means the reply obligation after an opposing pass; powerhouse hands may double then clarify."
    },
    "pages": [
      8
    ],
    "lessonId": "takeout-doubles"
  },
  {
    "id": "takeout-cheap",
    "section": "takeout",
    "level": "advanced",
    "sequence": "(1♥) – X – (P) – 1♠",
    "title": {
      "zh": "最低阶应叫",
      "en": "Cheapest suit advance"
    },
    "requirements": {
      "zh": "约0–8点，通常4张，迫不得已也可能只有3张",
      "en": "About 0–8, normally four cards, occasionally only three when forced"
    },
    "status": "NF",
    "next": {
      "zh": "经济选最长合适未叫套；不是承诺有点力。",
      "en": "Choose a suitable longest unbid suit cheaply; no strength is promised."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      8
    ],
    "lessonId": "takeout-doubles"
  },
  {
    "id": "takeout-jump",
    "section": "takeout",
    "level": "advanced",
    "sequence": "(1♥) – X – (P) – 2♠",
    "title": {
      "zh": "跳叫邀请",
      "en": "Jump suit advance"
    },
    "requirements": {
      "zh": "9–11点，通常至少4张所叫套",
      "en": "9–11, normally 4+ cards in the suit"
    },
    "status": "INV",
    "next": {
      "zh": "邀请，不是弱阻击；加倍者据高低限决定。",
      "en": "Invitational, not weak; doubler accepts or declines."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      8
    ],
    "lessonId": "takeout-doubles"
  },
  {
    "id": "takeout-cue",
    "section": "takeout",
    "level": "advanced",
    "sequence": "(1♥) – X – (P) – 2♥",
    "title": {
      "zh": "强牌扣叫",
      "en": "Strong cue-bid advance"
    },
    "requirements": {
      "zh": "通常12点以上，需要更多信息再选成局",
      "en": "Normally 12+, asks for information to choose game"
    },
    "status": "F1",
    "next": {
      "zh": "扣叫要求继续；直接成局也可用于已知方向的强牌。",
      "en": "Cue-bidding requires continuation; bid game directly when the strain is already known."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      8
    ],
    "lessonId": "takeout-doubles"
  },
  {
    "id": "takeout-1nt",
    "section": "takeout",
    "level": "advanced",
    "sequence": "(1♥) – X – (P) – 1NT",
    "title": {
      "zh": "加倍后1NT应叫",
      "en": "1NT advance to a double"
    },
    "requirements": {
      "zh": "6–9点，均型，对方花色有挡张",
      "en": "6–9, balanced, enemy-suit stopper"
    },
    "status": "NF",
    "next": {
      "zh": "有限自然无将；不是半逼叫。",
      "en": "Limited natural notrump, not semi-forcing."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      8
    ],
    "lessonId": "takeout-doubles"
  },
  {
    "id": "takeout-2nt",
    "section": "takeout",
    "level": "advanced",
    "sequence": "(1♥) – X – (P) – 2NT",
    "title": {
      "zh": "加倍后2NT邀请",
      "en": "2NT advance to a double"
    },
    "requirements": {
      "zh": "10–12点，均型，有挡张",
      "en": "10–12, balanced, stopper"
    },
    "status": "INV",
    "next": {
      "zh": "邀请3NT。",
      "en": "Invites 3NT."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      8
    ],
    "lessonId": "takeout-doubles"
  },
  {
    "id": "takeout-3nt",
    "section": "takeout",
    "level": "advanced",
    "sequence": "(1♥) – X – (P) – 3NT",
    "title": {
      "zh": "加倍后无将成局",
      "en": "Notrump game after a double"
    },
    "requirements": {
      "zh": "13点以上，均型，有可靠挡张，成局方向已知",
      "en": "13+, balanced, reliable stoppers, game direction known"
    },
    "status": "NF",
    "next": {
      "zh": "选定3NT；额外满贯实力另作评估。",
      "en": "Places 3NT; exceptional slam values need further judgment."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      8
    ],
    "lessonId": "takeout-doubles"
  },
  {
    "id": "takeout-raise",
    "section": "takeout",
    "level": "advanced",
    "sequence": "(1♥) – X – (P) – 1♠ – … – 2♠",
    "title": {
      "zh": "加倍后加叫搭档",
      "en": "Doubler raises partner"
    },
    "requirements": {
      "zh": "约16–18点，至少4张支持；具体跳幅须结合应叫范围",
      "en": "About 16–18, 4+ support; exact level depends on advancer’s range"
    },
    "status": "NF",
    "next": {
      "zh": "区别于只持开叫低限的技术性加倍。",
      "en": "Distinguishes extra values from a minimum takeout double."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      8
    ],
    "lessonId": "takeout-doubles"
  },
  {
    "id": "takeout-intervened",
    "section": "takeout",
    "level": "advanced",
    "sequence": "(1♦) – X – (1♥) – …",
    "title": {
      "zh": "对手插叫后",
      "en": "After intervening action"
    },
    "requirements": {
      "zh": "回应义务解除；弱牌可Pass，有实力再行动",
      "en": "The forced reply is removed; weak hands may pass"
    },
    "status": "RULE",
    "next": {
      "zh": "一阶新花可约6点以上；应答性加倍要求搭档选未叫花色。",
      "en": "A one-level new suit may show about 6+; a responsive double asks partner to choose an unbid suit."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      8
    ],
    "lessonId": "takeout-doubles"
  },
  {
    "id": "contested-raise",
    "section": "after-overcall",
    "level": "advanced",
    "sequence": "1M – (争叫) – 2M",
    "title": {
      "zh": "竞争中的简单支持",
      "en": "Contested simple raise"
    },
    "requirements": {
      "zh": "约7–9点，足够高花支持",
      "en": "About 7–9 with adequate major support"
    },
    "status": "NF",
    "next": {
      "zh": "表达支持；强牌支持通常用扣叫。",
      "en": "Shows limited support; stronger raises normally cue-bid."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9,
      10
    ],
    "lessonId": "negative-doubles"
  },
  {
    "id": "contested-jump-raise",
    "section": "after-overcall",
    "level": "advanced",
    "sequence": "1M – (争叫) – 3M / 4M",
    "title": {
      "zh": "竞争中的跳加叫",
      "en": "Contested jump raise"
    },
    "requirements": {
      "zh": "弱牌长支持，3M通常4张以上，4M通常更长或更有赢墩",
      "en": "Weak with long support; normally 4+ for 3M, more length or playing strength for 4M"
    },
    "status": "NF",
    "next": {
      "zh": "阻击并选择定约，不按无干扰自然跳加叫的邀请含义理解。",
      "en": "Preemptive and to play, not the uncontested natural invitational jump raise."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9,
      10
    ],
    "lessonId": "negative-doubles"
  },
  {
    "id": "contested-cue",
    "section": "after-overcall",
    "level": "advanced",
    "sequence": "1M – (新花) – 扣叫对方花色",
    "title": {
      "zh": "竞争扣叫支持",
      "en": "Contested cue-bid raise"
    },
    "requirements": {
      "zh": "好的10点以上，通常高花3张以上；低花需更长支持",
      "en": "Good 10+, normally 3+ major support; longer support for a minor"
    },
    "status": "F1",
    "next": {
      "zh": "请开叫者继续说明；不是自然对方花色。",
      "en": "Asks opener to continue, not natural length in the enemy suit."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9,
      10
    ],
    "lessonId": "negative-doubles"
  },
  {
    "id": "free-one",
    "section": "after-overcall",
    "level": "advanced",
    "sequence": "1♣ – (1♦) – 1♥ / 1♠",
    "title": {
      "zh": "一阶强自由叫",
      "en": "One-level strong free bid"
    },
    "requirements": {
      "zh": "约8点以上、4张以上；1♣—(1♥)—1♠表示5张以上黑桃",
      "en": "About 8+, 4+ cards; 1♣–(1♥)–1♠ shows 5+ spades"
    },
    "status": "F1",
    "next": {
      "zh": "有4张黑桃而不足5张时，可用负加倍。",
      "en": "Use a negative double with four spades rather than five."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9,
      10
    ],
    "lessonId": "negative-doubles"
  },
  {
    "id": "free-two",
    "section": "after-overcall",
    "level": "advanced",
    "sequence": "1♣ – (1♠) – 2♥",
    "title": {
      "zh": "二阶强自由叫",
      "en": "Two-level strong free bid"
    },
    "requirements": {
      "zh": "约10点以上，至少5张套",
      "en": "About 10+, 5+ suit"
    },
    "status": "F1",
    "next": {
      "zh": "逼叫一轮，不等于无干扰二盖一的13点以上逼局。",
      "en": "Forces one round, unlike the uncontested 13+ 2/1 game force."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9,
      10
    ],
    "lessonId": "negative-doubles"
  },
  {
    "id": "free-weak-jump",
    "section": "after-overcall",
    "level": "advanced",
    "sequence": "1m – (争叫) – 跳新花",
    "title": {
      "zh": "遭干扰后弱跳新花",
      "en": "Weak jump response after interference"
    },
    "requirements": {
      "zh": "弱牌，长套，按搭档约定的阻击范围",
      "en": "Weak, long suit, agreed preemptive range"
    },
    "status": "NF",
    "next": {
      "zh": "与开叫者强跳新花、争叫后的邀请跳新花区分。",
      "en": "Different from opener’s strong jump shift or an invitational jump advance."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9,
      10
    ],
    "lessonId": "negative-doubles"
  },
  {
    "id": "negative-core",
    "section": "after-overcall",
    "level": "advanced",
    "sequence": "1♣ – (1♥) – X",
    "title": {
      "zh": "负加倍：恰好四张黑桃",
      "en": "Negative double: exactly four spades"
    },
    "requirements": {
      "zh": "一阶核心例：6点以上、恰好4张黑桃",
      "en": "Core one-level case: 6+, exactly four spades"
    },
    "status": "F1",
    "next": {
      "zh": "请开叫者有4张黑桃时表示支持；直接1♠通常承诺5张。",
      "en": "Opener shows four spades if held; direct 1♠ normally promises five."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9,
      10
    ],
    "lessonId": "negative-doubles"
  },
  {
    "id": "negative-both",
    "section": "after-overcall",
    "level": "advanced",
    "sequence": "1♣ – (1♦) – X",
    "title": {
      "zh": "负加倍：两门高花",
      "en": "Negative double: both majors"
    },
    "requirements": {
      "zh": "通常6点以上，常为两门4张高花",
      "en": "Normally 6+, typically four in both majors"
    },
    "status": "F1",
    "next": {
      "zh": "先寻找未叫高花配合；高阶负加倍需要相应更强的实力。",
      "en": "Look for an unbid major fit; higher-level negative doubles require more strength."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9,
      10
    ],
    "lessonId": "negative-doubles"
  },
  {
    "id": "negative-long-weak",
    "section": "after-overcall",
    "level": "advanced",
    "sequence": "1m – (争叫) – X – … – 新花",
    "title": {
      "zh": "先负加倍后报长套",
      "en": "Double then show the weak long suit"
    },
    "requirements": {
      "zh": "约6–10点、5张以上套；不够直接自由叫",
      "en": "About 6–10, 5+ suit, insufficient for a direct free bid"
    },
    "status": "NF",
    "next": {
      "zh": "后续自然报套是弱牌澄清，不是再次示强逼叫。",
      "en": "The later natural suit bid clarifies weakness, not another strong force."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9,
      10
    ],
    "lessonId": "negative-doubles"
  },
  {
    "id": "negative-other",
    "section": "after-overcall",
    "level": "advanced",
    "sequence": "1m – (争叫) – X – …",
    "title": {
      "zh": "负加倍的其他用途",
      "en": "Other negative-double hands"
    },
    "requirements": {
      "zh": "可包括弱两套、缺挡张邀请或先找高花的强低花支持",
      "en": "Can include weak two-suiters, invitations without stoppers, or strong minor support seeking a major"
    },
    "status": "F1",
    "next": {
      "zh": "开叫先按未叫高花与合理实力回应，再听应叫者补充。",
      "en": "Opener first describes unbid majors and values, then listens to responder’s clarification."
    },
    "note": {
      "zh": "本课并非每次负加倍都严格同一牌型；阶数和后续约定是关键。",
      "en": "Not every negative double has the same shape; level and follow-up agreements matter."
    },
    "pages": [
      9,
      10
    ],
    "lessonId": "negative-doubles"
  },
  {
    "id": "double-new",
    "section": "after-double",
    "level": "advanced",
    "sequence": "1m / 1♥ – (X) – 1新花",
    "title": {
      "zh": "加倍后一阶新花",
      "en": "One-level suit after a double"
    },
    "requirements": {
      "zh": "6点以上，真实4张以上套",
      "en": "6+, a real 4+ suit"
    },
    "status": "F1",
    "next": {
      "zh": "仍需开叫者继续描述；不要与争叫后的强自由叫范围混淆。",
      "en": "Opener still continues; distinguish from strong free bids after an overcall."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      10
    ],
    "lessonId": "support-and-redoubles"
  },
  {
    "id": "double-weak-jump",
    "section": "after-double",
    "level": "advanced",
    "sequence": "1花色 – (X) – 跳新花",
    "title": {
      "zh": "加倍后弱跳新花",
      "en": "Weak jump after a double"
    },
    "requirements": {
      "zh": "弱牌、长套",
      "en": "Weak with a long suit"
    },
    "status": "NF",
    "next": {
      "zh": "弱阻击，不是无干扰强跳新花。",
      "en": "Weak and preemptive, not an uncontested strong jump shift."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      10
    ],
    "lessonId": "support-and-redoubles"
  },
  {
    "id": "double-minor-1nt",
    "section": "after-double",
    "level": "advanced",
    "sequence": "1m – (X) – 1NT",
    "title": {
      "zh": "低花遭加倍后1NT",
      "en": "1NT after a minor is doubled"
    },
    "requirements": {
      "zh": "8–11点，均型，无良好5张低花支持",
      "en": "8–11, balanced, without a good five-card minor fit"
    },
    "status": "NF",
    "next": {
      "zh": "自然无将方向。",
      "en": "Natural notrump direction."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      10
    ],
    "lessonId": "support-and-redoubles"
  },
  {
    "id": "double-minor-2nt",
    "section": "after-double",
    "level": "advanced",
    "sequence": "1m – (X) – 2NT",
    "title": {
      "zh": "低花遭加倍后2NT",
      "en": "2NT minor raise after a double"
    },
    "requirements": {
      "zh": "11点以上总点，至少5张支持",
      "en": "11+ total points, 5+ support"
    },
    "status": "F1",
    "next": {
      "zh": "限制性邀局或更强的人工支持；开叫需继续。",
      "en": "Artificial limit raise or better; opener must continue."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      10
    ],
    "lessonId": "support-and-redoubles"
  },
  {
    "id": "double-major-1nt",
    "section": "after-double",
    "level": "advanced",
    "sequence": "1M – (X) – 1NT",
    "title": {
      "zh": "高花遭加倍后好支持",
      "en": "Good major raise after a double"
    },
    "requirements": {
      "zh": "三张支持9–11点，或四张支持7–10点",
      "en": "Three-card support with 9–11, or four-card support with 7–10"
    },
    "status": "NF",
    "next": {
      "zh": "这里不是均型自然1NT，也不是半逼叫1NT。",
      "en": "Neither natural balanced 1NT nor semi-forcing 1NT here."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      10
    ],
    "lessonId": "support-and-redoubles"
  },
  {
    "id": "double-major-raise",
    "section": "after-double",
    "level": "advanced",
    "sequence": "1M – (X) – 2M",
    "title": {
      "zh": "高花遭加倍后简单支持",
      "en": "Weaker simple raise after a double"
    },
    "requirements": {
      "zh": "约5–8支持点，足够支持",
      "en": "About 5–8 support points, adequate support"
    },
    "status": "NF",
    "next": {
      "zh": "更弱的支持可直接加叫，把好支持留给人工1NT。",
      "en": "Direct raise is weaker; artificial 1NT carries the good raise."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      10
    ],
    "lessonId": "support-and-redoubles"
  },
  {
    "id": "double-major-2nt",
    "section": "after-double",
    "level": "advanced",
    "sequence": "1M – (X) – 2NT",
    "title": {
      "zh": "高花遭加倍后2NT",
      "en": "Major limit raise or better after a double"
    },
    "requirements": {
      "zh": "11点以上总点，至少4张支持",
      "en": "11+ total points, 4+ support"
    },
    "status": "F1",
    "next": {
      "zh": "不是无干扰Jacoby 2NT；此处可只有邀请实力，开叫仍须回答。",
      "en": "Not uncontested Jacoby 2NT: may be only invitational, but opener must reply."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      10
    ],
    "lessonId": "support-and-redoubles"
  },
  {
    "id": "double-redouble",
    "section": "after-double",
    "level": "advanced",
    "sequence": "1花色 – (X) – XX",
    "title": {
      "zh": "应叫者再加倍",
      "en": "Responder’s redouble"
    },
    "requirements": {
      "zh": "约11点以上，通常均型，否认立即支持",
      "en": "About 11+, usually balanced, denies an immediate fit"
    },
    "status": "F1",
    "next": {
      "zh": "准备惩罚对方或寻找无将；不等于开叫者的支持性再加倍。",
      "en": "Prepares to penalize or find notrump; not opener’s support redouble."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      10
    ],
    "lessonId": "support-and-redoubles"
  },
  {
    "id": "support-double",
    "section": "after-double",
    "level": "advanced",
    "sequence": "1♣ – (P) – 1♥ – (1♠) – X",
    "title": {
      "zh": "开叫者支持性加倍",
      "en": "Opener’s support double"
    },
    "requirements": {
      "zh": "恰好3张应叫高花支持",
      "en": "Exactly three-card support for responder’s major"
    },
    "status": "F1",
    "next": {
      "zh": "四张支持可直接加叫；帮助应叫者确认5–3配合。",
      "en": "With four raise directly; helps responder find the 5–3 fit."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      10
    ],
    "lessonId": "support-and-redoubles"
  },
  {
    "id": "support-redouble",
    "section": "after-double",
    "level": "advanced",
    "sequence": "1♣ – (P) – 1♥ – (X) – XX",
    "title": {
      "zh": "开叫者支持性再加倍",
      "en": "Opener’s support redouble"
    },
    "requirements": {
      "zh": "恰好3张应叫花色支持，本课约定",
      "en": "Exactly three-card support, course agreement"
    },
    "status": "F1",
    "next": {
      "zh": "与应叫者11点以上的XX身份不同，先看是谁再加倍。",
      "en": "Different role from responder’s 11+ XX; first identify who redoubled."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      10
    ],
    "lessonId": "support-and-redoubles"
  },
  {
    "id": "slam-targets",
    "section": "slams",
    "level": "advanced",
    "sequence": "6花色 / 6NT / 7花色 / 7NT",
    "title": {
      "zh": "满贯目标与点力参考",
      "en": "Slam targets and point guides"
    },
    "requirements": {
      "zh": "小满贯12墩，入门参考约32点；大满贯13墩，约36点",
      "en": "Small slam: 12 tricks, introductory guide about 32; grand: 13, about 36"
    },
    "status": "RULE",
    "next": {
      "zh": "实际判断还看关键张、将Q、控制、长度与进手。",
      "en": "Also assess keycards, trump queen, controls, length and entries."
    },
    "note": {
      "zh": "不是凑够点数就保证满贯；短套与长套可使点力参考上下浮动。",
      "en": "The point guide is not a guarantee; shape and playing strength change the requirement."
    },
    "pages": [
      9
    ],
    "lessonId": "controls-and-keycards"
  },
  {
    "id": "slam-controls",
    "section": "slams",
    "level": "advanced",
    "sequence": "已定将牌后的边花扣叫",
    "title": {
      "zh": "控制扣叫",
      "en": "Control bid"
    },
    "requirements": {
      "zh": "通常表示A、K、单张或缺门，按最经济次序交换",
      "en": "Normally an ace, king, singleton or void, shown economically"
    },
    "status": "GF",
    "next": {
      "zh": "检查是否某边花双方都无控制；否则不要贸然问关键张。",
      "en": "Check for an uncontrolled side suit before asking keycards."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9
    ],
    "lessonId": "controls-and-keycards"
  },
  {
    "id": "rkcb-ask",
    "section": "slams",
    "level": "advanced",
    "sequence": "已定将牌 – 4NT",
    "title": {
      "zh": "RKCB 1430 问关键张",
      "en": "RKCB 1430"
    },
    "requirements": {
      "zh": "四个A加将牌K，共5张关键张",
      "en": "Four aces plus the trump king: five keycards"
    },
    "status": "F1",
    "next": {
      "zh": "应答者按1430回答；问叫者结合自己关键张与进程消歧。",
      "en": "Reply in 1430 steps; asker uses their own keycards and the auction to resolve alternatives."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9
    ],
    "lessonId": "controls-and-keycards"
  },
  {
    "id": "rkcb-one-four",
    "section": "slams",
    "level": "advanced",
    "sequence": "4NT – 5♣",
    "title": {
      "zh": "1430：一或四",
      "en": "1430: one or four"
    },
    "requirements": {
      "zh": "1张或4张关键张",
      "en": "1 or 4 keycards"
    },
    "status": "REPLY",
    "next": {
      "zh": "问叫者继续选安全将牌定约、问将Q或探索满贯；不能把5♣当自然梅花止叫。",
      "en": "Asker selects a safe trump contract, asks the queen or explores slam; 5♣ is not a natural club sign-off."
    },
    "note": {
      "zh": "这是人工关键张答叫，不是所叫花色的自然止叫。除非回答恰好是已定将牌且决定停叫，否则问叫者还要选定后续定约。",
      "en": "An artificial keycard reply, not a natural sign-off in the bid suit. Asker must continue unless the reply is the agreed trump suit and is the chosen stopping point."
    },
    "pages": [
      9
    ],
    "lessonId": "controls-and-keycards"
  },
  {
    "id": "rkcb-zero-three",
    "section": "slams",
    "level": "advanced",
    "sequence": "4NT – 5♦",
    "title": {
      "zh": "1430：零或三",
      "en": "1430: zero or three"
    },
    "requirements": {
      "zh": "0张或3张关键张",
      "en": "0 or 3 keycards"
    },
    "status": "REPLY",
    "next": {
      "zh": "问叫者判断止叫、问将Q或进满贯。",
      "en": "Asker chooses a sign-off, queen ask or slam."
    },
    "note": {
      "zh": "这是人工关键张答叫，不是所叫花色的自然止叫。除非回答恰好是已定将牌且决定停叫，否则问叫者还要选定后续定约。",
      "en": "An artificial keycard reply, not a natural sign-off in the bid suit. Asker must continue unless the reply is the agreed trump suit and is the chosen stopping point."
    },
    "pages": [
      9
    ],
    "lessonId": "controls-and-keycards"
  },
  {
    "id": "rkcb-two-noq",
    "section": "slams",
    "level": "advanced",
    "sequence": "4NT – 5♥",
    "title": {
      "zh": "1430：两张、无将Q",
      "en": "1430: two without the queen"
    },
    "requirements": {
      "zh": "通常2张关键张，无将牌Q；理论5张需结合已知牌消歧",
      "en": "Normally 2 keycards without the trump queen; a theoretical 5 is resolved by context"
    },
    "status": "REPLY",
    "next": {
      "zh": "问叫者检查是否缺两张关键张，不能只凭总点进满贯。",
      "en": "Asker checks missing keycards rather than relying only on total points."
    },
    "note": {
      "zh": "这是人工关键张答叫，不是所叫花色的自然止叫。除非回答恰好是已定将牌且决定停叫，否则问叫者还要选定后续定约。",
      "en": "An artificial keycard reply, not a natural sign-off in the bid suit. Asker must continue unless the reply is the agreed trump suit and is the chosen stopping point."
    },
    "pages": [
      9
    ],
    "lessonId": "controls-and-keycards"
  },
  {
    "id": "rkcb-two-q",
    "section": "slams",
    "level": "advanced",
    "sequence": "4NT – 5♠",
    "title": {
      "zh": "1430：两张、有将Q",
      "en": "1430: two with the queen"
    },
    "requirements": {
      "zh": "通常2张关键张，有将牌Q；理论5张需结合已知牌消歧",
      "en": "Normally 2 keycards with the trump queen; a theoretical 5 is resolved by context"
    },
    "status": "REPLY",
    "next": {
      "zh": "结合边花控制与赢墩选择6阶或7阶。",
      "en": "Choose six or seven from controls and trick sources."
    },
    "note": {
      "zh": "这是人工关键张答叫，不是所叫花色的自然止叫。除非回答恰好是已定将牌且决定停叫，否则问叫者还要选定后续定约。",
      "en": "An artificial keycard reply, not a natural sign-off in the bid suit. Asker must continue unless the reply is the agreed trump suit and is the chosen stopping point."
    },
    "pages": [
      9
    ],
    "lessonId": "controls-and-keycards"
  },
  {
    "id": "rkcb-queen",
    "section": "slams",
    "level": "advanced",
    "sequence": "4NT – 5♣ / 5♦ – 最低非将牌花色",
    "title": {
      "zh": "问将牌Q",
      "en": "Trump-queen inquiry"
    },
    "requirements": {
      "zh": "已有关键张回答；具体问答须明确约定",
      "en": "After a keycard response; exact steps require agreement"
    },
    "status": "F1",
    "next": {
      "zh": "回将牌通常否认Q；其他回答表示有Q，并可能说明边花K。",
      "en": "Returning to trumps normally denies the queen; other replies show it and may show a side king."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9
    ],
    "lessonId": "controls-and-keycards"
  },
  {
    "id": "rkcb-kings",
    "section": "slams",
    "level": "advanced",
    "sequence": "关键张齐全后 – 5NT",
    "title": {
      "zh": "问具体边花K",
      "en": "Specific-king inquiry"
    },
    "requirements": {
      "zh": "关键张与将Q已获确认，探索大满贯",
      "en": "Keycards and trump queen established, investigating a grand slam"
    },
    "status": "F1",
    "next": {
      "zh": "本课问具体K，不是简单数K个数；先确保不会失控越过安全定约。",
      "en": "Ask for specific kings in this course, not a king count; preserve a safe stopping level."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9
    ],
    "lessonId": "controls-and-keycards"
  },
  {
    "id": "quantitative-4nt",
    "section": "slams",
    "level": "advanced",
    "sequence": "1NT – 4NT",
    "title": {
      "zh": "未定将牌的定量4NT",
      "en": "Quantitative 4NT without agreed trumps"
    },
    "requirements": {
      "zh": "通常约16–17点均型，邀请6NT；未定将牌",
      "en": "Normally about 16–17 balanced, inviting 6NT without agreed trumps"
    },
    "status": "INV",
    "next": {
      "zh": "开叫低限可Pass，高限评估6NT；与Texas后的RKCB完全分开。",
      "en": "A minimum may pass; a maximum assesses 6NT. Distinct from RKCB after Texas."
    },
    "note": {
      "zh": "",
      "en": ""
    },
    "pages": [
      9
    ],
    "lessonId": "controls-and-keycards"
  }
];

/** Accept ASCII and suit-symbol auctions, including the common 2N spelling. */
export function normalizeReferenceQuery(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/[♠]/g, 's').replace(/[♥♡]/g, 'h')
    .replace(/[♦♢]/g, 'd').replace(/[♣]/g, 'c').replace(/nt/g, 'n').replace(/[×]/g, 'x')
    .replace(/[^a-z0-9\u3400-\u9fff]/g, '');
}
export function findReferenceRows(query = '', section = 'all', level: RefLevel | 'all' = 'all', status: RefStatus | 'all' = 'all'): ReferenceRow[] {
  const terms = query.trim().split(/\s+/).map(normalizeReferenceQuery).filter(Boolean);
  const matches = REFERENCE_ROWS.filter(row => {
    if (section !== 'all' && row.section !== section) return false;
    if (level !== 'all' && row.level !== level) return false;
    if (status !== 'all' && row.status !== status && !(status === 'NF' && row.status === 'INV')) return false;
    const group = REFERENCE_SECTIONS.find(s => s.id === row.section)!;
    const haystack = normalizeReferenceQuery([row.sequence, row.title.en, row.title.zh,
      row.requirements.en, row.requirements.zh, row.next.en, row.next.zh, row.warning?.en ?? '', row.warning?.zh ?? '',
      group.title.en, group.title.zh, row.status].join(' '));
    return terms.every(term => haystack.includes(term));
  });
  if (!terms.length) return matches;
  const score = (row: ReferenceRow) => {
    const title = normalizeReferenceQuery(row.title.en + row.title.zh);
    const sequence = normalizeReferenceQuery(row.sequence);
    return (sequence === terms.join('') ? 200 : 0)
      + (terms.every(term => title.includes(term)) ? 100 : 0)
      + terms.filter(term => title.includes(term)).length * 20
      + terms.filter(term => sequence.includes(term)).length * 30;
  };
  return matches.sort((a, b) => score(b) - score(a));
}

/** Keep the four teaching labels paired with their Chinese meanings. */
export function explainBiddingLabels(text: string, lang: 'en' | 'zh'): string {
  if (lang !== 'zh') return text;
  const names: Record<string, string> = { MIN: '低限', MED: '中限', MAX: '高限', INV: '邀请', GF: '逼局' };
  return text.replace(/\b(MIN|MED|MAX|INV|GF)\b(?![（(])/g, term => `${term}（${names[term]}）`);
}
