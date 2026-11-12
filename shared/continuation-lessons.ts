import { PREEMPTIVE_OPENINGS } from './preemptive-openings.js';
import { parseCard } from './deck.js';
import type { Seat } from './deck.js';
import type { Lesson, Step, BidAction } from './tutorial.js';
type Pair = [string, string];
export interface CourseModule {
  id: string; title: Pair; source: string; focus: Pair; notes: Pair[]; rows: Pair[][];
  dealer: string; contract: [number, string, string]; hands: Record<string, string[]>;
  auction: Array<{ seat: string; bid: string; note: Pair; learn: boolean }>;
  facts: Record<string, { hcp: number; shape: number[] }>;
}
// Teaching prose adapted from the supplied course slides and CCBA v2.2 openings.
// Animation-only duplicate PDF pages were collapsed before authoring.
export const COURSE_MODULES = [
  PREEMPTIVE_OPENINGS,
  {
    "id": "strength-and-minors",
    "title": [
      "Semi-Forcing 1NT: I Have More to Say",
      "半逼叫1NT：话还没说完"
    ],
    "source": "C6",
    "focus": [
      "Use 1NT to hold a wide range of non-game-forcing hands while partner helps you finish the description.",
      "用1NT容纳尚未说清楚的各种非逼局牌，让搭档帮助你把话说完。"
    ],
    "notes": [
      [
        "The previous lesson made two-over-one game forcing. That agreement creates the need for this waiting response: many hands below game-forcing strength have a suit or support to describe, but cannot use a two-level new suit yet. Semi-forcing 1NT gives these unfinished stories a place to start; it does not replace an available economical one-level response or suitable direct raise.",
        "上一课先把二盖一约定为逼局，才有这一课半逼叫1NT的需要：许多不够逼局的牌也有花色或支持要说明，却不能直接用二阶新花。半逼叫1NT给这些还没说完的话一个起点；若已有经济的一阶应叫或合适的直接加叫，仍优先使用。"
      ],
      [
        "Bidding is a conversation, not merely a point ladder. Before each call ask: do I have useful new information? Have I finished describing my hand? Does partner’s last call allow me to stop? If partner has forced a reply, “nothing exciting to add” is not permission to pass: give the cheapest truthful description.",
        "叫牌是对话，不只是点力阶梯。每次先问：我还有没有有用的新信息？我的手牌说完了吗？搭档上一声允许我停吗？如果搭档要求回应，“没什么精彩的可说”不等于可以Pass，仍须经济而真实地补充描述。"
      ],
      [
        "After an uncontested 1♥ or 1♠ opening by partner, an unpassed responder uses semi-forcing 1NT with about 5–12 points. It catches the non-game-forcing hands that have not already been described by an economical one-level new suit or a simple raise. It is a waiting message, not a promise of balance or no fit.",
        "搭档无干扰开叫1♥或1♠，应叫者未Pass过时，可用约5–12点的半逼叫1NT过渡。它容纳尚未通过经济一阶新花或简单加叫表达的各种非逼局牌，是等待继续说话的消息，不保证均型，也不保证没有配合。"
      ],
      [
        "Its range is wide: a weak hand, an 11-point hand with three-card support, or a shapely hand with a void and a long suit can all start here. A two-over-one response would promise 13+ and force game, so these hands cannot use that route just to show a suit. With four spades over 1♥, or a minimum hand that can directly support the major, show that information first rather than putting every non-GF hand into 1NT mechanically.",
        "它的范围很宽：弱牌、11点三张支持的牌，或带缺门与长套的牌，都可能从这里开始。二盖一应叫承诺13点以上并逼局，这些牌不能只为报套就走二盖一路线。对1♥有四张黑桃，或低限牌可以直接支持高花时，仍优先表达已有信息，不是机械地把每手非逼局牌都叫1NT。"
      ],
      [
        "Read 1NT as “I am not committing to game, but my story may be unfinished. Keep a little room for me.” Opener normally continues when holding a second suit, a sixth card in the major, or extra strength. The continuation need not be strong: a minimum unbalanced hand still has shape to describe.",
        "把1NT读成：“我暂时不承诺成局，但话可能还没说完，请帮我留一点说话空间。”开叫者有第二套、高花第六张，或额外实力时，通常继续描述。续叫不一定因为强，低限非均型也有牌型信息要说。"
      ],
      [
        "Why only SEMI-forcing? A genuinely flat minimum, normally 12–13 and 5-3-3-2, may have no second suit, no sixth major and no extra strength. It can pass 1NT. Example: ♠AK974 / ♥Q83 / ♦K62 / ♣85 is 12 points and has nothing new to add. This narrow permission is not a general instruction to pass whenever 1NT sounds weak.",
        "为什么只叫半逼叫？真正平弱的低限，通常12–13点、5-3-3-2，可能没有第二套、没有高花第六张，也没有额外实力。这时可以停在1NT。例如♠AK974 / ♥Q83 / ♦K62 / ♣85是12点，确实没有新话。这个很窄的停叫许可，不是听到1NT像弱牌就随便不叫。"
      ],
      [
        "Three-card limit raise: with 10–12 and exactly three-card major support, start 1NT. After opener rebids, jump back to 3M: “My description is complete: I have invitational strength and three trumps; now you decide.” A direct 3M invitation in the basic method requires four or more trumps. This keeps the two messages distinct without using artificial raises.",
        "三张支持的限制性邀局：10–12点、恰好三张高花支持时，先1NT。开叫者再叫后跳回3高花：“我说完了：我有邀请实力、三张将牌，现在你决定。”基础篇的直接3高花邀局需要四张以上支持，不用人工加叫也能把两条消息区分开。"
      ],
      [
        "A long-suit example over 1♠ is ♠— / ♥Q84 / ♦K73 / ♣KJ97642: 9 points, seven clubs and a spade void. 1NT leaves room to describe the clubs after opener continues; it does not announce a balanced hand. Since this is semi-forcing, a truly flat minimum opener may still pass: the agreement does not guarantee another turn in every case.",
        "对1♠的长套例：♠— / ♥Q84 / ♦K73 / ♣KJ97642为9点、七张梅花、黑桃缺门。先1NT，是希望开叫续叫后再说明梅花，不是在宣布均型。因为是半逼叫，真正平弱的低限开叫仍可能Pass；本约定并不保证每次都有下一轮。"
      ],
      [
        "Now watch the table conversation. North has 11 and three spades. South has 15, five spades, four clubs and a singleton heart: South has plenty of shape information and must not treat 1NT as “we are done.” After 2♣ gives North the floor, North can finally show the invitational spade support.",
        "现在看桌上对话。北家11点、三张黑桃。南家15点、五张黑桃、四张梅花、单张红桃，还有重要牌型信息，不能把1NT当作“聊完了”。2♣把说话机会交回北家后，北家才能说明邀请性的黑桃支持。"
      ]
    ],
    "rows": [
      [
        [
          "I have new information",
          "我有新话"
        ],
        [
          "Show extra length, a second suit or strength",
          "说明额外长度、第二套或实力"
        ]
      ],
      [
        [
          "Please keep the conversation open",
          "话没说完，请帮我维持"
        ],
        [
          "1NT: about 5–12, may be unbalanced or have support",
          "1NT约5–12点，可能非均型，也可能有支持"
        ]
      ],
      [
        [
          "Why opener continues",
          "开叫为什么续叫"
        ],
        [
          "A minimum with useful shape still has something to say",
          "低限但牌型有新信息，仍应继续"
        ]
      ],
      [
        [
          "Truly nothing new",
          "真的无话可说"
        ],
        [
          "Flat 12–13, 5-3-3-2 may pass 1NT",
          "12–13点、平弱5-3-3-2可Pass"
        ]
      ],
      [
        [
          "I am done; you decide",
          "我说完了，你决定"
        ],
        [
          "1NT then 3M: 10–12, exactly three-card support, invitation",
          "1NT后跳3高花：10–12点、恰好三张支持，邀请"
        ]
      ],
      [
        [
          "Not a game force",
          "没有逼局"
        ],
        [
          "Responder may be too weak for 2/1, but still have a long story",
          "应叫者可能不够二盖一，但仍有很多信息待说"
        ]
      ]
    ],
    "specs": {
      "S": [
        13,
        [
          2,
          4,
          3,
          4
        ]
      ],
      "N": [
        8,
        [
          3,
          4,
          4,
          2
        ]
      ]
    },
    "auction": [
      {
        "seat": "S",
        "bid": "1S",
        "note": [
          "15 and five spades: open the conversation.",
          "15点、五张黑桃，开启对话。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：本轮没有合适的行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "1NT",
        "note": [
          "Semi-forcing: 11 with three spades, but the invitation is not yet described.",
          "半逼叫：实际11点、三张黑桃，邀请消息还没说完。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：本轮没有合适的行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2C",
        "note": [
          "I have four clubs and an unbalanced hand: continue so partner can finish.",
          "我有四张梅花、非均型，还有话说；续叫让搭档继续。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：本轮没有合适的行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "3S",
        "note": [
          "I have finished: 10–12 and three-card support. This is an invitation; you decide.",
          "我说完了：10–12点、三张支持，邀请，由你决定。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：本轮没有合适的行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "4S",
        "note": [
          "15 with useful shape opposite an invitation: accept game.",
          "15点且牌型有用，面对邀请接受成局。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：本轮没有合适的行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Pass: the agreed game is reached.",
          "不叫：已经到达选定的成局定约。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: three passes end the conversation.",
          "不叫：连续三次不叫，对话结束。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      4,
      "S",
      "S"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "S": [
        "AS",
        "KS",
        "JS",
        "7S",
        "4S",
        "6H",
        "KD",
        "8D",
        "3D",
        "AC",
        "9C",
        "5C",
        "2C"
      ],
      "N": [
        "QS",
        "8S",
        "2S",
        "KH",
        "7H",
        "4H",
        "AD",
        "QD",
        "9D",
        "5D",
        "8C",
        "6C",
        "3C"
      ],
      "E": [
        "4D",
        "TC",
        "6D",
        "TH",
        "TD",
        "TS",
        "7C",
        "8H",
        "AH",
        "7D",
        "QC",
        "2D",
        "9S"
      ],
      "W": [
        "3H",
        "9H",
        "5S",
        "JC",
        "4C",
        "5H",
        "3S",
        "2H",
        "JD",
        "6S",
        "QH",
        "KC",
        "JH"
      ]
    },
    "facts": {
      "S": {
        "hcp": 15,
        "shape": [
          5,
          1,
          3,
          4
        ]
      },
      "N": {
        "hcp": 11,
        "shape": [
          3,
          3,
          4,
          3
        ]
      },
      "E": {
        "hcp": 6,
        "shape": [
          2,
          3,
          5,
          3
        ]
      },
      "W": {
        "hcp": 8,
        "shape": [
          3,
          6,
          1,
          3
        ]
      }
    }
  },
  {
    "id": "notrump-responses",
    "title": [
      "Responding to 1NT: Pass, Invite or Bid Game",
      "1NT应叫：不叫、邀请与直接成局"
    ],
    "source": "Combined handout 6",
    "focus": [
      "Use the limited 15–17 opening range to decide whether to stop, invite with 2NT, or commit to game with 3NT before learning suit inquiries.",
      "利用1NT开叫15–17点的有限范围，先学停叫、2NT邀请与3NT直接成局，再学花色询问。"
    ],
    "notes": [
      [
        "Partner opened 1NT: 15–17 and balanced. That is a precise range, so responder can do the partnership arithmetic. First decide how high; a later lesson will supply Stayman and transfers when a major fit needs investigating. This is different from semi-forcing 1NT after a major opening.",
        "搭档开叫1NT：15–17点、均型。这个范围很清楚，应叫者可以据此计算联手实力。先决定叫多高；需要找高花配合时，再用后续课程的斯台曼与转移。这不同于高花开叫后的半逼叫1NT。"
      ],
      [
        "With 0–7 and no suit reason to move, pass. Even 7 opposite 17 totals only 24; there is usually no reason to force game. A weak hand with a five-card major may prefer a transfer, which comes later. A pass can mean “I have nothing more to say,” not a failure to cooperate.",
        "0–7点、没有花色方面的继续理由时，不叫。即使7点面对17点也只有24点，通常没有理由强行成局。弱牌有五张高花时可能更适合转移，后面再学。不叫可以表示“我没有更多信息了”，不是不配合。"
      ],
      [
        "With 8–9 balanced, no four-card major to investigate and no five-card major to show, respond 2NT. This is INV: an invitation, not a force. With 8, the partnership may have 23 opposite 15 or 25 opposite 17. Responder has finished describing the range; opener decides.",
        "8–9点均型、没有要找的四张高花，也没有要说明的五张高花时，应叫2NT。这是INV（邀请），不是逼叫。有8点时，面对15点只有23点，面对17点则有25点。应叫者已说清范围，让开叫者决定。"
      ],
      [
        "A MIN opener with 15 normally passes 2NT. A MAX opener with 17 normally bids 3NT. With 16, use judgment: a useful long suit, intermediate cards, stoppers and entries can improve the hand. The responder’s 2NT is not asking an automatic jump regardless of opener’s strength.",
        "MIN（低限）开叫者15点通常Pass 2NT；MAX（高限）开叫者17点通常叫3NT。16点时看牌质：有用长套、中间张、挡张与进手都可能加分。应叫者2NT不是要求搭档不看实力就自动跳叫。"
      ],
      [
        "With about 10–15, balanced and no major fit still to locate, bid 3NT directly. Even 10 opposite the minimum 15 makes 25. This is the direct game-going or GF commitment: no invitation to stop below game. Because 3NT is already game, the commitment is fulfilled and opener may pass; GF does not mean an extra reply is required after the chosen game is reached.",
        "约10–15点均型、没有还需寻找的高花配合时，直接应叫3NT。10点面对最低15点，也有25点。这是直接成局的GF（逼局）承诺，不再邀请搭档停在局以下。因为3NT已经成局，承诺已兑现，开叫者可以Pass；GF不表示到达选定成局后还必须再叫。"
      ],
      [
        "Keep level and strain as two decisions. Four-card majors usually use 2♣ Stayman with 8+; five-card hearts use 2♦ to ask 2♥, and five-card spades use 2♥ to ask 2♠. The transfer calls are 2♦ and 2♥, while their target contracts are hearts and spades. First learn today’s point-based decisions, then the next lessons refine the strain.",
        "把高度与定约方向分开。8点以上有四张高花，通常用2♣斯台曼；五张红桃用2♦要求2♥，五张黑桃用2♥要求2♠。发起转移的叫品是2♦和2♥，目标花色才是红桃与黑桃。先学今天按点力作判断，再在后续课程细化定约方向。"
      ],
      [
        "On the table North has 8 and a balanced 3334 hand with no four-card major: ♠Q83 / ♥K74 / ♦Q95 / ♣J863. South has a balanced 17: open 1NT. North’s 2NT invites, South’s maximum accepts with 3NT, and North passes the selected game. With 15 instead, South would normally decline the same invitation.",
        "桌上北家8点、3334均型，没有四张高花：♠Q83 / ♥K74 / ♦Q95 / ♣J863。南家17点均型，开1NT。北家2NT邀请，南家以高限接受，叫3NT，北家在选定的成局上不叫。如果南家只有15点，通常会拒绝同样的邀请。"
      ]
    ],
    "rows": [
      [
        [
          "Pass",
          "不叫"
        ],
        [
          "0–7, no need to investigate a suit",
          "0–7点，无花色方面的继续理由"
        ]
      ],
      [
        [
          "2NT: INV",
          "2NT：INV（邀请）"
        ],
        [
          "8–9 balanced; opener may pass",
          "8–9点均型，开叫者可以Pass"
        ]
      ],
      [
        [
          "MIN / MAX",
          "MIN（低限）／MAX（高限）"
        ],
        [
          "15 normally passes; 17 normally accepts; judge 16",
          "15点通常不叫，17点通常接受，16点看牌质"
        ]
      ],
      [
        [
          "3NT: direct game",
          "3NT：直接成局"
        ],
        [
          "10–15, GF commitment fulfilled at game; opener may pass",
          "10–15点，GF（逼局）承诺已兑现，开叫可Pass"
        ]
      ],
      [
        [
          "2♣: Stayman",
          "2♣：斯台曼"
        ],
        [
          "Normally 8+ and a four-card major; forces a reply",
          "通常8点以上与四张高花，要求回应"
        ]
      ],
      [
        [
          "2♦ / 2♥: transfers",
          "2♦／2♥：转移"
        ],
        [
          "Ask 2♥ / 2♠ with five+ in the target major",
          "五张以上目标高花，要求叫2♥／2♠"
        ]
      ]
    ],
    "hands": {
      "S": [
        "AS",
        "KS",
        "4S",
        "QH",
        "8H",
        "3H",
        "KD",
        "JD",
        "6D",
        "AC",
        "9C",
        "7C",
        "2C"
      ],
      "N": [
        "QS",
        "8S",
        "3S",
        "KH",
        "7H",
        "4H",
        "QD",
        "9D",
        "5D",
        "JC",
        "8C",
        "6C",
        "3C"
      ],
      "E": [
        "JS",
        "TS",
        "7S",
        "6S",
        "AH",
        "JH",
        "6H",
        "AD",
        "8D",
        "4D",
        "QC",
        "5C",
        "4C"
      ],
      "W": [
        "9S",
        "5S",
        "2S",
        "TH",
        "9H",
        "5H",
        "2H",
        "TD",
        "7D",
        "3D",
        "2D",
        "KC",
        "TC"
      ]
    },
    "facts": {
      "S": {
        "hcp": 17,
        "shape": [
          3,
          3,
          3,
          4
        ]
      },
      "N": {
        "hcp": 8,
        "shape": [
          3,
          3,
          3,
          4
        ]
      },
      "E": {
        "hcp": 12,
        "shape": [
          4,
          3,
          3,
          3
        ]
      },
      "W": {
        "hcp": 3,
        "shape": [
          3,
          4,
          4,
          2
        ]
      }
    },
    "dealer": "S",
    "contract": [
      3,
      "NT",
      "S"
    ],
    "auction": [
      {
        "seat": "S",
        "bid": "1NT",
        "note": [
          "17 balanced: the maximum of the 15–17 opening.",
          "17点均型：15–17点开叫范围的高限。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable action.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2NT",
        "note": [
          "8 balanced with no four-card major: invite game, do not force it.",
          "8点均型，没有四张高花：邀请成局，不逼叫。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable action.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "3NT",
        "note": [
          "MAX: 17 opposite 8–9 totals 25–26. Accept the invitation.",
          "MAX（高限）：17点面对8–9点，联手25–26点，接受邀请。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable action.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Pass: the selected game has been reached; no further reply is required.",
          "不叫：已经到达选定成局，不再需要额外回应。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: the third pass completes the auction.",
          "不叫：第三次不叫结束叫牌。"
        ],
        "learn": false
      }
    ]
  },
  {
    "id": "stayman-fit",
    "title": [
      "Stayman: Find the Four–Four Fit",
      "斯台曼：寻找四四配合"
    ],
    "source": "C7",
    "focus": [
      "Ask for a four-card major fit and, when that suit becomes trump, let the 1NT strong hand declare.",
      "询问四张高花配合，若该花色成为将牌，尽量让1NT强手做庄。"
    ],
    "notes": [
      [
        "The 1NT opener holds 15–17 points. We usually want this strong hand to DECLARE rather than become dummy: dummy’s cards are exposed, while declarer’s honors remain hidden. With the strong hand declaring, the opening lead comes from its left, through dummy and the other defender before reaching the strong hand. This often protects honor combinations such as A-Q, but the benefit depends on the lead and honor positions; it does not guarantee an extra trick.",
        "1NT开叫者拿着15–17点。我们通常希望这只强手做庄，而不是成为明手：明手要把牌摊开，庄家的大牌位置则仍隐藏。强手做庄时，首攻从其左手引出，经明手和另一防守者后才到强手，常能保护A-Q等大牌组合。但效果取决于首攻和大牌位置，不保证一定多赢一墩。"
      ],
      [
        "1NT shows 15–17 balanced. Without a major to investigate: 0–7 usually passes, 8–9 invites with 2NT, and 10+ chooses game. With 8+ and a four-card major, begin with artificial 2♣ Stayman. It does not promise clubs.",
        "1NT表示15–17点均型。没有要寻找的高花时：0–7点通常不叫，8–9点以2NT邀局，10点以上选择成局。有8点以上与四张高花时，先用人工2♣斯台曼，不保证梅花。"
      ],
      [
        "Opener answers 2♦ with no four-card major, 2♥ with four hearts (possibly also four spades), and 2♠ with four spades but not four hearts. With both four-card majors, answer hearts first.",
        "开叫者无四张高花答2♦；四张红桃答2♥，仍可能有四张黑桃；2♠表示四张黑桃、无四张红桃。两门都四张时先答红桃。"
      ],
      [
        "Why ask instead of naming your major first? The declarer is the first player on the winning side to have bid the final strain. After 1NT–2♣–2♥–4♥, opener named hearts first, so the 1NT hand declares. The artificial 2♣ asks a question without making responder the first heart bidder. Stayman solves two problems together: finding the four–four fit and often keeping the strong hand hidden as declarer.",
        "为什么先问，而不是自己先报高花？赢得定约的一方中，最先叫出最终花色的人当庄家。1NT—2♣—2♥—4♥里，开叫者先叫红桃，所以1NT强手做庄。人工2♣只提问，不会让应叫者先叫出红桃。斯台曼同时解决两件事：寻找四四配合，并常能把强手留在庄家位置。"
      ],
      [
        "With a fit, responder raises to 3 of the major with 8–9 (invitational), or 4 with 10+ (to play). Without a fit, use 2NT or 3NT at those same strengths. Opener accepts an invitation with a maximum, declines with a minimum, and evaluates texture with 16.",
        "找到配合后，8–9点加到高花3阶邀局，10点以上加到4阶成局。无配合时分别叫2NT或3NT。开叫者高限接受，低限拒绝，16点结合牌质判断。"
      ],
      [
        "If opener has both majors and hears 1NT–2♣–2♥–3NT, responder’s denied heart fit identifies spades. Opener can correct to 4♠ with four spades. Do not conclude that 2♥ denied spades.",
        "若开叫两门高花各四张，听到1NT—2♣—2♥—3NT，应叫者否认红桃配合，其四张高花就是黑桃。开叫有四张黑桃可改4♠，不能误以为2♥已否认黑桃。"
      ]
    ],
    "rows": [
      [
        [
          "2♣",
          "2♣"
        ],
        [
          "Artificial major-suit inquiry, normally 8+",
          "人工问高花，通常8点以上"
        ]
      ],
      [
        [
          "2♦ / 2♥ / 2♠",
          "2♦／2♥／2♠"
        ],
        [
          "None / hearts, maybe spades / spades only",
          "都没有／红桃，可能兼黑桃／只有黑桃"
        ]
      ],
      [
        [
          "8–9 / 10+",
          "8–9／10点以上"
        ],
        [
          "Invite / insist on game",
          "邀请／坚持成局"
        ]
      ],
      [
        [
          "Why Stayman?",
          "为什么先斯台曼？"
        ],
        [
          "Find four–four; opener names the major first and declares",
          "找四四配合，让开叫者先报高花并做庄"
        ]
      ],
      [
        [
          "Strong hand as declarer",
          "强手做庄"
        ],
        [
          "Hide honors and often protect them from the opening lead",
          "隐藏大牌，并常可保护大牌免受首攻穿攻"
        ]
      ]
    ],
    "specs": {
      "S": [
        17,
        [
          3,
          4,
          3,
          3
        ]
      ],
      "N": [
        8,
        [
          3,
          4,
          3,
          3
        ]
      ]
    },
    "auction": [
      {
        "seat": "S",
        "bid": "1NT",
        "note": [
          "17 points balanced: the top of 1NT.",
          "17点均型，1NT的高限。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2C",
        "note": [
          "8 points and four hearts: use Stayman.",
          "8点、四张红桃，用斯台曼。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2H",
        "note": [
          "Show your four hearts.",
          "表示四张红桃。请结合已有叫牌确认含义。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "3H",
        "note": [
          "8 points invites; it does not force game.",
          "8点邀局，不逼局。请结合已有叫牌确认含义。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "4H",
        "note": [
          "You are maximum: accept the invitation.",
          "你是高限，接受邀请。请结合已有叫牌确认含义。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      4,
      "H",
      "S"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "S": [
        "7S",
        "AS",
        "2S",
        "QH",
        "3H",
        "AH",
        "9H",
        "6D",
        "5D",
        "KD",
        "7C",
        "AC",
        "9C"
      ],
      "N": [
        "QS",
        "6S",
        "3S",
        "7H",
        "8H",
        "KH",
        "4H",
        "QD",
        "7D",
        "4D",
        "4C",
        "JC",
        "TC"
      ],
      "E": [
        "5S",
        "6H",
        "TS",
        "8S",
        "QC",
        "6C",
        "8D",
        "5H",
        "3D",
        "4S",
        "2D",
        "JD",
        "JH"
      ],
      "W": [
        "8C",
        "2H",
        "5C",
        "KC",
        "2C",
        "9D",
        "TH",
        "3C",
        "JS",
        "KS",
        "AD",
        "9S",
        "TD"
      ]
    },
    "facts": {
      "S": {
        "hcp": 17,
        "shape": [
          3,
          4,
          3,
          3
        ]
      },
      "N": {
        "hcp": 8,
        "shape": [
          3,
          4,
          3,
          3
        ]
      },
      "E": {
        "hcp": 4,
        "shape": [
          4,
          3,
          4,
          2
        ]
      },
      "W": {
        "hcp": 11,
        "shape": [
          3,
          2,
          3,
          5
        ]
      }
    }
  },
  {
    "id": "stayman-smolen",
    "title": [
      "After Stayman: Smolen and Judgement",
      "斯台曼之后：斯莫伦与判断"
    ],
    "source": "C7",
    "focus": [
      "With five–four majors, distinguish invitation from game force while protecting the strong hand.",
      "高花五四时，区分邀局和逼局，并尽量让强手做庄。"
    ],
    "notes": [
      [
        "With 8+ and one five-card major plus one four-card major, start with Stayman. After 2♦ denies a four-card major, the responder still has a five-card suit to describe.",
        "8点以上、一门高花五张另一门四张时，先斯台曼。2♦否认四张高花后，应叫者仍要说明自己的五张套。"
      ],
      [
        "With 8–9, bid the five-card major at the two level: an invitation that can stop low. With 10+ game strength, Smolen bids the FOUR-card major at the three level, showing five in the other major. Thus 3♠ shows four spades and five hearts.",
        "8–9点时，在二阶叫自己的五张高花，是可以低停的邀请。10点以上成局实力，用斯莫伦在三阶叫四张的那门高花，表示另一门五张。因此3♠表示四张黑桃、五张红桃。"
      ],
      [
        "Opener with three cards in the five-card major chooses 4 of that major; with two, usually 3NT. This lets the 1NT opener declare. “Garbage Stayman” is an exception for a weak hand willing to pass any answer; do not use ordinary Stayman on any weak hand with one four-card major.",
        "开叫者在五张高花有三张时，选择该高花4阶；只有两张通常选3NT，使1NT开叫者做庄。“垃圾斯台曼”是能接受任何回答的弱牌特例，不能拿任意一门四张高花的弱牌都照用。"
      ]
    ],
    "rows": [
      [
        [
          "Five–four, 8–9",
          "高花五四、8–9点"
        ],
        [
          "After 2♦, bid your five-card major at 2",
          "2♦后在二阶叫五张高花"
        ]
      ],
      [
        [
          "Five–four, 10+",
          "高花五四、10点以上"
        ],
        [
          "Smolen: bid the four-card major at 3",
          "斯莫伦：三阶叫四张高花"
        ]
      ],
      [
        [
          "Opener has 3 / 2",
          "开叫者有3／2张"
        ],
        [
          "Major game / usually 3NT",
          "高花成局／通常3NT"
        ]
      ]
    ],
    "specs": {
      "S": [
        16,
        [
          3,
          2,
          4,
          4
        ]
      ],
      "N": [
        11,
        [
          4,
          5,
          2,
          2
        ]
      ]
    },
    "auction": [
      {
        "seat": "S",
        "bid": "1NT",
        "note": [
          "16 balanced: open 1NT.",
          "16点均型，开1NT。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2C",
        "note": [
          "Five hearts and four spades: start with Stayman.",
          "五张红桃、四张黑桃，先斯台曼。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2D",
        "note": [
          "No four-card major.",
          "没有四张高花。请结合已有叫牌确认含义。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "3S",
        "note": [
          "Smolen: four spades, FIVE hearts, game force.",
          "斯莫伦：四张黑桃、五张红桃，逼局。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "3NT",
        "note": [
          "Only two hearts: no eight-card major fit, choose 3NT.",
          "只有两张红桃，无八张高花配合，选择3NT。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      3,
      "NT",
      "S"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "S": [
        "7S",
        "AS",
        "KS",
        "KH",
        "9H",
        "4D",
        "3D",
        "TD",
        "QD",
        "5C",
        "7C",
        "JC",
        "KC"
      ],
      "N": [
        "4S",
        "QS",
        "8S",
        "2S",
        "2H",
        "AH",
        "QH",
        "8H",
        "4H",
        "KD",
        "8D",
        "4C",
        "9C"
      ],
      "E": [
        "5H",
        "3C",
        "9D",
        "6S",
        "QC",
        "2D",
        "AD",
        "3S",
        "6C",
        "3H",
        "7D",
        "2C",
        "9S"
      ],
      "W": [
        "TH",
        "JH",
        "7H",
        "TC",
        "6D",
        "8C",
        "AC",
        "JD",
        "JS",
        "6H",
        "5S",
        "TS",
        "5D"
      ]
    },
    "facts": {
      "S": {
        "hcp": 16,
        "shape": [
          3,
          2,
          4,
          4
        ]
      },
      "N": {
        "hcp": 11,
        "shape": [
          4,
          5,
          2,
          2
        ]
      },
      "E": {
        "hcp": 6,
        "shape": [
          3,
          2,
          4,
          4
        ]
      },
      "W": {
        "hcp": 7,
        "shape": [
          3,
          4,
          3,
          3
        ]
      }
    }
  },
  {
    "id": "jacoby-transfers",
    "title": [
      "Jacoby Transfers: Length Then Strength",
      "雅各比转移：先长度、后实力"
    ],
    "source": "C8-transfer",
    "focus": [
      "Show five-card major length indirectly so the 1NT opener names the suit first and declares; then show your strength.",
      "间接说明五张高花，让1NT开叫者先报该花色并做庄，再说明你的实力。"
    ],
    "notes": [
      [
        "Recall why we prefer the 1NT strong hand to declare: dummy’s honors would be exposed, while declarer’s remain hidden and are often better placed against the opening lead. A transfer controls who first names the major, rather than repeating the four-card inquiry from Stayman.",
        "回顾让1NT强手做庄的原因：摊成明手会暴露大牌，留在庄家手中则能隐藏大牌，并常可保护它们免受首攻穿攻。转移叫可以控制谁先报高花，与上一课询问四张高花的方法不同。"
      ],
      [
        "After 1NT, 2♦ transfers to hearts and 2♥ transfers to spades. Opener normally completes the transfer even with only two cards. It asks for a bid, not whether there is already a fit.",
        "1NT后，2♦转移到红桃，2♥转移到黑桃。开叫通常完成转移，即使只有两张。它要求叫出指定花色，不是在询问是否已有配合。"
      ],
      [
        "The transfer’s direction is deliberate. To show hearts, responder bids 2♦, the suit just below hearts; opener then bids 2♥ and becomes the first heart bidder. To show spades, responder bids 2♥ and opener completes 2♠. If that major is the final contract, the strong opener declares and the usually weaker responder becomes dummy. A transfer is a command to bid the major, not a promise that the partnership already has eight trumps.",
        "转移的方向是有意设计的。想表示红桃，应叫者先叫红桃下面的2♦，开叫者再叫2♥，成为第一个报红桃的人。想表示黑桃，应叫者叫2♥，开叫者完成2♠。最终打该高花时，强开叫手做庄，通常较弱的应叫手做明手。转移是要求搭档叫出高花，不保证双方已经有八张将牌。"
      ],
      [
        "A five-card major can transfer even with 0 points. After completion, 0–7 usually passes; with 8–9 and five cards, rebid 2NT to invite; with 10+ and five, rebid 3NT and let opener choose a major game with three-card support.",
        "五张高花即使0点也能转移。完成后，0–7点通常不叫；8–9点且五张，再叫2NT邀局；10点以上且五张，再叫3NT，由开叫者凭三张支持选择高花成局。"
      ],
      [
        "With six cards, raising the transferred major to 3 is invitational; 4 is to play (with possible slam interest depending on the route). With both majors five–five: invitational hands transfer to hearts then bid 2♠; game-forcing hands transfer to spades then bid 3♥.",
        "六张时，把转移后的高花加到3阶是邀请，4阶是成局，是否带满贯兴趣还要看路线。高花五五时：邀请牌先转移红桃再叫2♠；逼局牌先转移黑桃再叫3♥。"
      ],
      [
        "With four of the major and a maximum, opener may superaccept by jumping. A responder’s invitational NT rebid gives opener two decisions: accept or decline, and major or NT. Suit interference may switch the ordinary transfer system off; do not assume systems remain on.",
        "开叫者高限且四张支持时，可跳叫超级接受。应叫者2NT邀局后，开叫要同时判断接受与否、打高花还是无将。对手花色争叫后，普通转移可能关闭，不能自动假定仍然开启。"
      ]
    ],
    "rows": [
      [
        [
          "2♦ / 2♥",
          "2♦／2♥"
        ],
        [
          "Transfer to hearts / spades",
          "转移红桃／黑桃"
        ]
      ],
      [
        [
          "Five cards: Pass / 2NT / 3NT",
          "五张：Pass／2NT／3NT"
        ],
        [
          "0–7 / 8–9 / 10+",
          "0–7／8–9／10点以上"
        ]
      ],
      [
        [
          "Six cards: 3M / 4M",
          "六张：3高花／4高花"
        ],
        [
          "Invite / game",
          "邀局／成局"
        ]
      ],
      [
        [
          "Five–five majors",
          "高花五五"
        ],
        [
          "Invite via hearts; GF via spades",
          "邀局先红桃；逼局先黑桃"
        ]
      ],
      [
        [
          "Why transfer?",
          "为什么转移？"
        ],
        [
          "Opener names the major first; protect and conceal the strong hand",
          "让开叫者先报高花，保护并隐藏强手"
        ]
      ]
    ],
    "specs": {
      "S": [
        17,
        [
          3,
          2,
          4,
          4
        ]
      ],
      "N": [
        9,
        [
          5,
          3,
          3,
          2
        ]
      ]
    },
    "auction": [
      {
        "seat": "S",
        "bid": "1NT",
        "note": [
          "17 balanced: open 1NT.",
          "17点均型，开1NT。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2H",
        "note": [
          "Transfer: asks for 2♠, showing five or more spades.",
          "转移：要求2♠，表示至少五张黑桃。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2S",
        "note": [
          "Complete the transfer; do not pass the artificial 2♥.",
          "完成转移，不能Pass人工2♥。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2NT",
        "note": [
          "Five spades and 9 points: invite, leaving strain choice open.",
          "五张黑桃、9点：邀请，并保留定约方向选择。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "4S",
        "note": [
          "Maximum and three spades: accept in the eight-card fit.",
          "高限且三张黑桃，在八张配合中接受邀局。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      4,
      "S",
      "S"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "S": [
        "2S",
        "6S",
        "AS",
        "5H",
        "QH",
        "KD",
        "AD",
        "5D",
        "TD",
        "6C",
        "AC",
        "9C",
        "TC"
      ],
      "N": [
        "TS",
        "9S",
        "5S",
        "KS",
        "QS",
        "8H",
        "7H",
        "4H",
        "QD",
        "4D",
        "6D",
        "4C",
        "QC"
      ],
      "E": [
        "9H",
        "7S",
        "KH",
        "4S",
        "6H",
        "8D",
        "JH",
        "TH",
        "2D",
        "JS",
        "8C",
        "7C",
        "3D"
      ],
      "W": [
        "5C",
        "3H",
        "2H",
        "3S",
        "JD",
        "3C",
        "2C",
        "AH",
        "JC",
        "KC",
        "7D",
        "8S",
        "9D"
      ]
    },
    "facts": {
      "S": {
        "hcp": 17,
        "shape": [
          3,
          2,
          4,
          4
        ]
      },
      "N": {
        "hcp": 9,
        "shape": [
          5,
          3,
          3,
          2
        ]
      },
      "E": {
        "hcp": 5,
        "shape": [
          3,
          5,
          3,
          2
        ]
      },
      "W": {
        "hcp": 9,
        "shape": [
          2,
          3,
          3,
          5
        ]
      }
    }
  },
  {
    "id": "texas-transfers",
    "title": [
      "Texas Transfers and Slam Routes",
      "德克萨斯转移与满贯路线"
    ],
    "source": "C8-transfer",
    "focus": [
      "Use six-card length to place game, and distinguish a game sign-off from a slam invitation.",
      "用六张长度确定成局，并区分止叫成局与满贯邀请。"
    ],
    "notes": [
      [
        "With a six-card major and game values after 1NT, 4♦ transfers to 4♥ and 4♥ transfers to 4♠. A balanced opener has at least two, so the fit is known. Opener completes the transfer; responder may pass to play.",
        "1NT后有六张高花与成局实力，4♦转移到4♥，4♥转移到4♠。均型开叫至少两张，配合已知。开叫完成转移，应叫者可Pass定约。"
      ],
      [
        "Use Texas with game-only values (roughly 10–12) or with enough strength to insist on a slam investigation (roughly 16+). With intermediate slam interest, use Jacoby first, then jump to 4 of the major: a different message from Texas then Pass. Evaluate controls and fit, not points alone.",
        "德克萨斯转移适用于只想成局的实力，约10–12点，或足以坚持探索满贯的强牌，约16点以上。介于两者的满贯兴趣，可先雅各比转移再跳到高花4阶，与德克萨斯后Pass传达不同信息。还要评估控制与配合，不能只数点。"
      ],
      [
        "Texas may remain available after some low-level interference, but only while the agreed transfer calls still exist. After high interference, or without six cards, do not blindly use it. After completing Texas, a later 4NT in an agreed major fit asks for keycards.",
        "某些低阶干扰后仍可保留德克萨斯，但必须还有约定叫品的空间。高阶干扰后，或没有六张时，不能机械使用。德克萨斯完成后，高花配合已定，后续4NT询问关键张。"
      ]
    ],
    "rows": [
      [
        [
          "4♦ / 4♥",
          "4♦／4♥"
        ],
        [
          "Transfer to 4♥ / 4♠",
          "转移到4♥／4♠"
        ]
      ],
      [
        [
          "Required length",
          "长度条件"
        ],
        [
          "Six or more in the major",
          "高花至少六张"
        ]
      ],
      [
        [
          "Texas then Pass",
          "德克萨斯后Pass"
        ],
        [
          "Game sign-off",
          "成局止叫"
        ]
      ],
      [
        [
          "Jacoby then 4M",
          "雅各比后4高花"
        ],
        [
          "A different route for intermediate slam interest",
          "中间满贯兴趣的不同路线"
        ]
      ]
    ],
    "specs": {
      "S": [
        16,
        [
          2,
          3,
          4,
          4
        ]
      ],
      "N": [
        10,
        [
          6,
          3,
          2,
          2
        ]
      ]
    },
    "auction": [
      {
        "seat": "S",
        "bid": "1NT",
        "note": [
          "16 balanced: open 1NT.",
          "16点均型，开1NT。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "4H",
        "note": [
          "Texas: six spades and game values, transfer to 4♠.",
          "德克萨斯：六张黑桃、成局实力，转移到4♠。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "4S",
        "note": [
          "Complete Texas; your two spades are enough for an eight-card fit.",
          "完成德克萨斯，你的两张黑桃足够组成八张配合。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Game-only hand: stop here.",
          "只想成局，停在这里。请结合已有叫牌确认含义。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      4,
      "S",
      "S"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "S": [
        "AS",
        "8S",
        "6H",
        "AH",
        "7H",
        "AD",
        "9D",
        "4D",
        "JD",
        "2C",
        "KC",
        "6C",
        "9C"
      ],
      "N": [
        "7S",
        "TS",
        "6S",
        "4S",
        "JS",
        "KS",
        "5H",
        "4H",
        "3H",
        "QD",
        "8D",
        "AC",
        "TC"
      ],
      "E": [
        "2H",
        "2D",
        "JC",
        "TD",
        "9S",
        "TH",
        "JH",
        "6D",
        "3C",
        "8H",
        "KD",
        "9H",
        "QC"
      ],
      "W": [
        "2S",
        "QH",
        "3S",
        "7D",
        "KH",
        "5S",
        "QS",
        "8C",
        "3D",
        "5D",
        "5C",
        "4C",
        "7C"
      ]
    },
    "facts": {
      "S": {
        "hcp": 16,
        "shape": [
          2,
          3,
          4,
          4
        ]
      },
      "N": {
        "hcp": 10,
        "shape": [
          6,
          3,
          2,
          2
        ]
      },
      "E": {
        "hcp": 7,
        "shape": [
          1,
          5,
          4,
          3
        ]
      },
      "W": {
        "hcp": 7,
        "shape": [
          4,
          2,
          3,
          4
        ]
      }
    }
  },
  {
    "id": "bergen-raises",
    "title": [
      "Major Raises: Three Cards or Four?",
      "高花加叫：三张还是四张"
    ],
    "source": "Class8-major",
    "focus": [
      "Use Bergen raises to show trump support and strength.",
      "用伯根加叫说明将牌支持张数和点力。"
    ],
    "notes": [
      [
        "Advanced agreement change: the basic part used natural 3M as an invitation. From this lesson, Bergen uses direct 3M as weak and artificial 3♦ as the four-card limit raise. Do not combine these two meanings in the same auction.",
        "进阶约定切换：基础篇的自然3高花是邀请。从本课开始，伯根把直接3高花改为弱牌，用人工3♦表示四张限制性邀局。两种含义不能在同一套约定里混用。"
      ],
      [
        "After an uncontested major opening by an unpassed responder, a simple raise to 2M shows exactly three-card support and 6–9 points. With four or more, use Bergen: 3♣ = 7–9 constructive; 3♦ = 10–12 limit raise; direct 3M = weak, about 0–6. These artificial minor bids promise support, not that minor.",
        "无干扰、应叫者未Pass过时，简单加到2高花表示恰好三张支持、6–9点。四张以上用伯根：3♣为7–9点建设性支持；3♦为10–12点限制性邀局；直接3高花为弱牌，约0–6点。这些人工低花叫品表示高花支持，不是低花长套。"
      ],
      [
        "After constructive 3♣, opener’s minimum signs off in 3M, while a suitable 16+ hand considers 4M. After limit 3♦, 12–13 usually declines in 3M and a suitable 14+ accepts. These are teaching ranges: shortness, texture and vulnerability still matter. Nine trumps give room to compete, not a guarantee of safety.",
        "3♣建设性支持后，开叫低限以3高花止叫，合适的16点以上考虑4高花。3♦限制性邀局后，12–13点通常以3高花拒绝，合适的14点以上接受。这些是教学范围，仍要看短套、牌质和局况。九张将牌提供竞争空间，不保证绝对安全。"
      ],
      [
        "Bergen is an agreement for a specific auction. If the opponents double or overcall, use the later competitive methods; do not assume a jump minor still has the Bergen meaning.",
        "伯根只适用于约定进程。对手加倍或争叫后，要切换到后面的竞争处理，不能假定跳叫低花仍是伯根。"
      ],
      [
        "The three-card limit-raise conversation was taught in the semi-forcing 1NT lesson: 1NT first, then jump back to 3M. Bergen keeps that route. What changes here is how FOUR-card support is shown: artificial 3♣ or 3♦, while direct 3M becomes weak.",
        "三张支持的限制性邀局，已在半逼叫1NT课学过：先1NT，再跳回3高花。伯根保留这条路线。本课改变的是四张支持的表达：用人工3♣或3♦，而直接3高花改成弱牌。"
      ]
    ],
    "rows": [
      [
        [
          "2M",
          "2高花"
        ],
        [
          "6–9, exactly three-card support",
          "6–9点，恰好三张支持"
        ]
      ],
      [
        [
          "3♣ / 3♦",
          "3♣／3♦"
        ],
        [
          "7–9 constructive / 10–12 invitational, four+ support",
          "7–9建设性／10–12邀局，四张以上支持"
        ]
      ],
      [
        [
          "Direct 3M",
          "直接3高花"
        ],
        [
          "Weak preempt, four+ support",
          "弱牌阻击，四张以上支持"
        ]
      ],
      [
        [
          "Captain",
          "定高度的一方"
        ],
        [
          "After a limited raise, opener evaluates game",
          "有限加叫后，开叫者判断成局"
        ]
      ]
    ],
    "specs": {
      "S": [
        14,
        [
          5,
          3,
          2,
          3
        ]
      ],
      "N": [
        11,
        [
          4,
          2,
          4,
          3
        ]
      ]
    },
    "auction": [
      {
        "seat": "S",
        "bid": "1S",
        "note": [
          "14 points and five spades.",
          "14点、五张黑桃。请结合已有叫牌确认含义。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "3D",
        "note": [
          "Bergen: four spades, 10–12 points.",
          "伯根：四张黑桃、10–12点。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "4S",
        "note": [
          "14 with a nine-card fit: accept this limit raise.",
          "14点、九张配合，接受这次限制性邀请。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      4,
      "S",
      "S"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "S": [
        "7S",
        "JS",
        "5S",
        "AS",
        "QS",
        "TH",
        "8H",
        "AH",
        "8D",
        "JD",
        "9C",
        "3C",
        "QC"
      ],
      "N": [
        "TS",
        "KS",
        "9S",
        "6S",
        "4H",
        "7H",
        "7D",
        "9D",
        "TD",
        "AD",
        "6C",
        "2C",
        "AC"
      ],
      "E": [
        "KC",
        "2D",
        "JC",
        "3S",
        "2S",
        "4D",
        "7C",
        "4S",
        "8S",
        "3D",
        "5D",
        "JH",
        "6H"
      ],
      "W": [
        "3H",
        "QD",
        "4C",
        "5C",
        "2H",
        "KH",
        "TC",
        "9H",
        "QH",
        "KD",
        "6D",
        "5H",
        "8C"
      ]
    },
    "facts": {
      "S": {
        "hcp": 14,
        "shape": [
          5,
          3,
          2,
          3
        ]
      },
      "N": {
        "hcp": 11,
        "shape": [
          4,
          2,
          4,
          3
        ]
      },
      "E": {
        "hcp": 5,
        "shape": [
          4,
          2,
          4,
          3
        ]
      },
      "W": {
        "hcp": 10,
        "shape": [
          0,
          6,
          3,
          4
        ]
      }
    }
  },
  {
    "id": "major-forcing-raises",
    "title": [
      "Jacoby 2NT and Splinters",
      "雅各比2NT与斯普林特"
    ],
    "source": "Class8-major",
    "focus": [
      "Show a game-forcing major fit with Jacoby 2NT, or show support and shortness with a splinter.",
      "用雅各比2NT表示逼局高花配合，用斯普林特同时表示支持与短套。"
    ],
    "notes": [
      [
        "Jacoby 2NT after a major opening is game forcing with 13+ and four-card support. Opener’s three-level new suit shows shortness. Without shortness, bid 4M with 12–13, 3NT with 14–15, or 3M with 16+ and slam interest.",
        "高花开叫后的雅各比2NT：13点以上、四张支持，逼局。开叫三阶新花表示单缺。无短套时，12–13点叫4高花，14–15点叫3NT，16点以上且有满贯兴趣叫3高花。"
      ],
      [
        "A splinter shows game-going support, four+ trumps, about 12–15 points, and a singleton or void in the jumped suit. Revalue working honors outside the short suit. Use an agreed double-jump route such as 1♠–4♣; a natural strong jump shift has a different meaning.",
        "斯普林特表示成局支持、四张以上将牌、约12–15点，以及所跳花色的单缺。重新评估短套之外的有效大牌，使用1♠—4♣等约定双跳路线；自然强跳新花有不同含义。"
      ],
      [
        "These are named agreements, not natural NT or new-suit bids. Jacoby 2NT does not promise a balanced hand; it shows four+ support and 13+ with no upper limit, so it is game forcing. A splinter is also game forcing despite its limited range. Whether a bid is limited and whether it is forcing are separate questions.",
        "这些是约定叫品，不是自然无将或新花。雅各比2NT不保证均型，而是四张以上支持、13点以上且未封顶，所以逼局。斯普林特虽有点力范围，也仍然逼局。“是否封顶”和“是否逼叫”是两个不同的问题。"
      ],
      [
        "Splinter example over 1♠: ♠KQ84 / ♥A72 / ♦KQJ64 / ♣2 has 15 points, four-card support and a singleton club: respond 4♣. Compare opener’s working honors outside clubs with potentially wasted club honors before considering more than game. Do not infer strength just from the jump’s height.",
        "1♠后的斯普林特例：♠KQ84 / ♥A72 / ♦KQJ64 / ♣2为15点、四张支持、单张梅花，应叫4♣。考虑超过成局之前，要比较开叫者梅花之外的有效大牌与梅花里可能浪费的大牌。不能只凭跳叫高度猜实力。"
      ]
    ],
    "rows": [
      [
        [
          "Jacoby 2NT",
          "雅各比2NT"
        ],
        [
          "13+, four+ major support, GF",
          "13点以上、四张以上高花支持，逼局"
        ]
      ],
      [
        [
          "Opener’s three-level new suit",
          "开叫者三阶新花"
        ],
        [
          "Singleton or void",
          "单张或缺门"
        ]
      ],
      [
        [
          "No shortness: 4M / 3NT / 3M",
          "无短套：4高花／3NT／3高花"
        ],
        [
          "12–13 / 14–15 / 16+",
          "12–13／14–15／16点以上"
        ]
      ],
      [
        [
          "Splinter",
          "斯普林特"
        ],
        [
          "About 12–15, four+ support, shortness, GF",
          "约12–15点、四张以上支持、单缺，逼局"
        ]
      ],
      [
        [
          "Forcing status",
          "逼叫状态"
        ],
        [
          "Limited does not always mean non-forcing",
          "有上限不一定就不逼叫"
        ]
      ]
    ],
    "specs": {
      "S": [
        15,
        [
          5,
          1,
          3,
          4
        ]
      ],
      "N": [
        11,
        [
          3,
          3,
          4,
          3
        ]
      ]
    },
    "auction": [
      {
        "seat": "S",
        "bid": "1S",
        "note": [
          "13 points and five spades: open 1♠.",
          "13点、五张黑桃，开1♠。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：这一轮没有合适的叫牌。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2NT",
        "note": [
          "Jacoby: 14 and four-card support, no upper limit shown; GF.",
          "雅各比：14点、四张支持，叫品未封顶，逼局。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：这一轮没有合适的叫牌。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "4S",
        "note": [
          "Minimum 12–13 and no shortness: choose 4♠.",
          "12–13点低限、无短套，选择4♠。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：这一轮没有合适的叫牌。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Pass: the agreed game has been reached.",
          "不叫：双方已经到达选定的成局定约。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: the agreed game has been reached.",
          "不叫：双方已经到达选定的成局定约。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      4,
      "S",
      "S"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "N": [
        "KS",
        "QS",
        "8S",
        "2S",
        "KH",
        "8H",
        "7H",
        "AD",
        "7D",
        "2D",
        "QC",
        "8C",
        "4C"
      ],
      "S": [
        "AS",
        "JS",
        "TS",
        "7S",
        "3S",
        "QH",
        "9H",
        "2H",
        "KD",
        "8D",
        "5D",
        "KC",
        "2C"
      ],
      "E": [
        "TD",
        "7C",
        "3H",
        "6H",
        "6C",
        "TH",
        "AC",
        "5H",
        "QD",
        "9S",
        "5S",
        "4S",
        "TC"
      ],
      "W": [
        "JD",
        "6S",
        "JC",
        "9D",
        "AH",
        "4H",
        "6D",
        "4D",
        "JH",
        "3C",
        "9C",
        "3D",
        "5C"
      ]
    },
    "facts": {
      "N": {
        "hcp": 14,
        "shape": [
          4,
          3,
          3,
          3
        ]
      },
      "S": {
        "hcp": 13,
        "shape": [
          5,
          3,
          3,
          2
        ]
      },
      "E": {
        "hcp": 6,
        "shape": [
          3,
          4,
          2,
          4
        ]
      },
      "W": {
        "hcp": 7,
        "shape": [
          1,
          3,
          5,
          4
        ]
      }
    }
  },
  {
    "id": "reverse-bids",
    "title": [
      "Reverses: Why Space Needs Strength",
      "逆叫：为什么需要额外实力"
    ],
    "source": "Class10",
    "focus": [
      "A reverse raises the safety floor: understand its extra strength and reply obligation.",
      "逆叫抬高了安全底线，理解额外实力要求与回应义务。"
    ],
    "notes": [
      [
        "Compare 1♦–1♠–2♣ with 1♦–1♠–2♥. In the first, responder can return to diamonds at 2; in the reverse, returning requires 3♦. The opener who raises that safety floor needs about 17+, usually five in the first suit and four in the second.",
        "比较1♦—1♠—2♣与1♦—1♠—2♥。前者可在2阶回方块，逆叫后要到3♦才能回第一套。开叫者抬高安全底线，需要约17点以上，通常第一套五张、第二套四张。"
      ],
      [
        "A reverse after a one-over-one response is forcing for a round, not automatically game forcing. A minimum responder must make the required reply; opener then clarifies. Once a two-over-one game force already exists, a higher second suit can describe shape without promising the extra reverse strength.",
        "一盖一后的逆叫逼叫一轮，不自动等于逼局。应叫低限也必须完成回应，再由开叫澄清。二盖一已建立逼局时，更高的第二套可以单纯描述牌型，不必再保证普通逆叫的额外点力。"
      ],
      [
        "The ordinary rebid table was covered in the previous lesson. Here the key distinction is context: before game is forced, 1♦–1♠–2♥ normally needs about 17+ because returning to diamonds costs the three level. Inside an established two-over-one GF, a higher second suit describes shape without that same extra-strength requirement.",
        "普通再叫表已在上一课统一讲过。这里重点是背景：未逼局时，1♦—1♠—2♥通常约需17点以上，因为回方块要到三阶；二盖一已逼局时，报更高第二套可以只说明牌型，不再要求同样的额外实力。"
      ],
      [
        "In this deal responder has 8, not a bare minimum: 17+ opposite 8 is enough to commit to game. A direct raise to 3♦ is game forcing. A genuinely weak responder needs an agreed braking route, such as an artificial 2NT, rather than treating every return to the first suit as non-forcing.",
        "本副应叫者有8点，不是勉强应叫的最低限：17点以上加8点，已够承诺成局。直接加叫3♦逼局。真正弱牌应叫者需要另行约定的刹车路线，例如人工2NT，不能把所有回第一套都当成不逼叫。"
      ]
    ],
    "rows": [
      [
        [
          "Cheap new suit",
          "经济新花"
        ],
        [
          "May return to first suit at 2",
          "可在2阶回第一套"
        ]
      ],
      [
        [
          "Reverse",
          "逆叫"
        ],
        [
          "Returning to first suit requires 3",
          "回第一套要到3阶"
        ]
      ],
      [
        [
          "Before GF",
          "逼局之前"
        ],
        [
          "About 17+, forcing one round",
          "约17点以上，逼叫一轮"
        ]
      ],
      [
        [
          "After 2/1 GF",
          "二盖一逼局之后"
        ],
        [
          "Primarily describes shape",
          "主要描述牌型"
        ]
      ],
      [
        [
          "This 3♦",
          "本副3♦"
        ],
        [
          "8 points, constructive support, game forcing",
          "8点，建设性支持，逼局"
        ]
      ]
    ],
    "specs": {
      "S": [
        18,
        [
          2,
          4,
          5,
          2
        ]
      ],
      "N": [
        8,
        [
          4,
          2,
          3,
          4
        ]
      ]
    },
    "auction": [
      {
        "seat": "S",
        "bid": "1D",
        "note": [
          "18 with five diamonds and four hearts: begin with diamonds.",
          "18点、五张方块四张红桃，先方块。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "1S",
        "note": [
          "Four spades and 8 points.",
          "四张黑桃、8点。请结合已有叫牌确认含义。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2H",
        "note": [
          "Reverse: extra strength, four hearts; partner cannot pass.",
          "逆叫：额外实力、四张红桃，搭档不能Pass。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "3D",
        "note": [
          "With 8 points opposite a 17+ reverse, show three-card diamond support and commit to game. This constructive 3♦ is not a weak sign-off.",
          "8点面对17点以上逆叫，表示三张方块支持并承诺成局。这个建设性3♦不是弱牌止叫。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "3NT",
        "note": [
          "18 plus a response and side-suit stoppers: choose game.",
          "18点加应叫实力，边花有止张，选择成局。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      3,
      "NT",
      "S"
    ],
    "fixed": null,
    "needs": {
      "S": {
        "S": "K",
        "C": "A"
      }
    },
    "hands": {
      "S": [
        "KS",
        "JS",
        "TH",
        "KH",
        "6H",
        "QH",
        "2D",
        "QD",
        "TD",
        "9D",
        "4D",
        "AC",
        "KC"
      ],
      "N": [
        "AS",
        "4S",
        "TS",
        "9S",
        "AH",
        "3H",
        "6D",
        "8D",
        "5D",
        "9C",
        "5C",
        "4C",
        "6C"
      ],
      "E": [
        "5S",
        "JD",
        "6S",
        "7C",
        "AD",
        "JH",
        "4H",
        "7D",
        "3D",
        "2C",
        "7H",
        "TC",
        "8C"
      ],
      "W": [
        "2S",
        "QS",
        "9H",
        "8H",
        "3C",
        "7S",
        "8S",
        "KD",
        "JC",
        "2H",
        "QC",
        "3S",
        "5H"
      ]
    },
    "facts": {
      "S": {
        "hcp": 18,
        "shape": [
          2,
          4,
          5,
          2
        ]
      },
      "N": {
        "hcp": 8,
        "shape": [
          4,
          2,
          3,
          4
        ]
      },
      "E": {
        "hcp": 6,
        "shape": [
          2,
          3,
          4,
          4
        ]
      },
      "W": {
        "hcp": 8,
        "shape": [
          5,
          4,
          1,
          3
        ]
      }
    }
  },
  {
    "id": "overcall-strategy",
    "title": [
      "Competition: Overcalls and Advancing",
      "竞争叫牌：争叫与进叫"
    ],
    "source": "Class11",
    "focus": [
      "Compete, direct a lead and take space, while respecting vulnerability and stopppers.",
      "竞争定约、指示首攻并占空间，同时考虑局况与止张。"
    ],
    "notes": [
      [
        "A one-level overcall shows 8–16 points and a good five-card suit; a non-jump two-level overcall usually needs about 11–16 and an especially sound suit. Stronger suit hands around 17+ may double first then name the suit. A jump overcall is weak and preemptive.",
        "一阶争叫需要8–16点与好五张套；二阶不跳争叫通常约11–16点，套质要求更严。约17点以上的强花色牌可先加倍再报花色，跳争叫是弱牌阻击。"
      ],
      [
        "A direct 1NT overcall is 15–18 balanced with a stopper in the opened suit. Systems are on here: Stayman and transfers. A stopper such as A, Kx or Qxx slows the opponents, but is not a guarantee against every layout.",
        "直接争叫1NT是15–18均型，且开叫花色有止张。这里体系开启，可用斯台曼与转移。A、Kx、Qxx等可减缓对手攻击，但并不保证对每种分布都绝对安全。"
      ],
      [
        "A simple new suit after partner’s overcall is normally natural, constructive and non-forcing. Cue-bidding the enemy suit is the main forcing strength-showing tool. Simple raises show 6–10 with support; jump raises are preemptive with extra trumps. A cue-bid can show good 10+ with a fit or 14+ without one.",
        "搭档争叫后，简单新花通常自然、有建设性但不逼叫；扣叫对方花色是主要的逼叫示强工具。简单加叫6–10点并有支持；跳加叫凭额外将牌阻击。扣叫可表示好10点以上有配合，或14点以上无配合。"
      ],
      [
        "NT advances require stoppers: roughly 9–12 for 1NT, 13–15 for a jump 2NT. Against a two-level overcall, a non-jump 2NT can instead be roughly 9–12. Always read the auction. Vulnerable undertricks cost more: undoubled 50 versus 100 each; doubled down two is 300 nonvulnerable versus 500 vulnerable.",
        "无将进叫必须考虑止张：1NT约9–12点，跳2NT约13–15点；面对二阶争叫，不跳2NT则可约9–12点。一定结合进程。宕墩有局更贵：未加倍每墩50与100；加倍宕二无局300、有局500。"
      ],
      [
        "Scoring review: a partscore bonus is 50 once, not per trick. Game bonus is 300 nonvulnerable or 500 vulnerable; small-slam bonus adds 500 or 750, grand adds 1000 or 1500. For example 3NT exactly is 400 or 600; 6NT exactly is 990 or 1440. Do not add the partscore bonus to game.",
        "计分复习：部分定约奖分50只加一次，不是每墩50。成局奖分无局300、有局500；小满贯额外500或750，大满贯额外1000或1500。例如3NT正好400或600，6NT正好990或1440。成局不能再叠加部分定约奖分。"
      ]
    ],
    "rows": [
      [
        [
          "1-level / 2-level overcall",
          "一阶／二阶争叫"
        ],
        [
          "8–16 / about 11–16, good suit",
          "8–16／约11–16点，好套"
        ]
      ],
      [
        [
          "1NT overcall",
          "1NT争叫"
        ],
        [
          "15–18, balanced, stopper",
          "15–18点、均型、有止张"
        ]
      ],
      [
        [
          "New suit / cue-bid",
          "新花／扣叫"
        ],
        [
          "Constructive NF / forcing strength",
          "建设性非逼叫／逼叫示强"
        ]
      ],
      [
        [
          "Risk",
          "风险"
        ],
        [
          "Check vulnerability and doubled penalties",
          "检查局况与加倍罚分"
        ]
      ]
    ],
    "specs": {
      "E": [
        12,
        [
          3,
          3,
          4,
          3
        ]
      ],
      "S": [
        17,
        [
          4,
          3,
          3,
          3
        ]
      ],
      "N": [
        8,
        [
          4,
          3,
          3,
          3
        ]
      ]
    },
    "auction": [
      {
        "seat": "E",
        "bid": "1D",
        "note": [
          "East opens 1♦ with opening values.",
          "东家有开叫实力，开1♦。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "1NT",
        "note": [
          "17 balanced and a diamond stopper: overcall 1NT.",
          "17点均型，方块有止张，争叫1NT。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2C",
        "note": [
          "Systems on: Stayman with four spades.",
          "体系开启：四张黑桃，用斯台曼。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2S",
        "note": [
          "Four spades, no four hearts: answer 2♠.",
          "四张黑桃、无四张红桃，回答2♠。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "3S",
        "note": [
          "8 points: invite in the fit.",
          "8点，在配合中邀请。请结合已有叫牌确认含义。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "4S",
        "note": [
          "17 is high within 15–18: accept with the fit.",
          "17点在15–18中属高端，有配合，接受。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "E",
    "contract": [
      4,
      "S",
      "S"
    ],
    "fixed": null,
    "needs": {
      "S": {
        "D": "A"
      }
    },
    "hands": {
      "E": [
        "JS",
        "3S",
        "TS",
        "8H",
        "4H",
        "AH",
        "QD",
        "3D",
        "6D",
        "7D",
        "QC",
        "TC",
        "KC"
      ],
      "S": [
        "AS",
        "QS",
        "5S",
        "8S",
        "JH",
        "5H",
        "QH",
        "JD",
        "KD",
        "AD",
        "4C",
        "3C",
        "5C"
      ],
      "N": [
        "4S",
        "6S",
        "7S",
        "KS",
        "6H",
        "3H",
        "TH",
        "5D",
        "4D",
        "TD",
        "7C",
        "JC",
        "AC"
      ],
      "W": [
        "7H",
        "6C",
        "KH",
        "8D",
        "2S",
        "9D",
        "2C",
        "2D",
        "8C",
        "9C",
        "9S",
        "9H",
        "2H"
      ]
    },
    "facts": {
      "E": {
        "hcp": 12,
        "shape": [
          3,
          3,
          4,
          3
        ]
      },
      "S": {
        "hcp": 17,
        "shape": [
          4,
          3,
          3,
          3
        ]
      },
      "N": {
        "hcp": 8,
        "shape": [
          4,
          3,
          3,
          3
        ]
      },
      "W": {
        "hcp": 3,
        "shape": [
          2,
          4,
          3,
          4
        ]
      }
    }
  },
  {
    "id": "takeout-doubles",
    "title": [
      "Takeout Doubles: Ask Partner to Choose",
      "技术性加倍：请搭档选择"
    ],
    "source": "Class12",
    "focus": [
      "A low-level takeout double asks for unbid suits; advancing may be compulsory even with zero.",
      "低阶技术性加倍要求未叫花色，搭档即使零点也可能必须回应。"
    ],
    "notes": [
      [
        "A normal takeout double at the one level shows about 12+, shortness (usually 0–2) in their suit and three+ in every unbid suit, ideally four in unbid majors. At higher levels, roughly three more points per level is a guide, not a substitute for shape and vulnerability. After opponents show two suits, support both remaining suits. With length and strength in their suit, do not make a takeout double merely to seek penalties.",
        "一阶普通技术性加倍约12点以上，对方花色短，通常0–2张，所有未叫花色至少三张，未叫高花最好四张。更高阶时可粗略按每升一阶多约3点理解，仍要结合牌型与局况。对手已报两套时，支持余下两套。对方花色又长又强时，不能只为惩罚而误用技术性加倍。"
      ],
      [
        "When RHO passes after partner’s double, a cheapest suit response shows 0–8; a jump 9–11 invites; 12+ can cue-bid to force game or place game with a clear fit. NT responses need a stopper: 1NT 6–9, 2NT 10–12, 3NT 13+. Passing converts to penalties and requires exceptional trump strength.",
        "搭档加倍后右手对手Pass，最经济花色回应0–8点，跳应叫9–11点邀局，12点以上可扣叫逼局或配合明确时直接成局。无将回应要有止张：1NT为6–9，2NT为10–12，3NT为13点以上。Pass是转罚放，必须有出色的对方将牌实力。"
      ],
      [
        "Powerhouse exceptions need not have ideal takeout shape: double then a new suit shows about 17+ and a strong long suit; double then NT 19–21 balanced with stoppers; double then a simple raise about 16–18 with four-card support. Do not assume a cheapest forced reply promised any points.",
        "超强牌例外不必有标准技术性牌型：先加倍再报新花约17点以上、好长套；先加倍再无将19–21均型且有止张；再简单加搭档约16–18点、四张支持。最经济的被迫回应，可能一点也没有。"
      ],
      [
        "If RHO bids after the double, the automatic obligation is removed; with a weak hand you can pass. Doubles and redoubles change the stakes only while they remain attached to that contract: a later higher bid cancels them. Responsive doubles and penalty conversions require their specific context.",
        "加倍后右手对手叫牌，自动回应义务解除，弱牌可以Pass。加倍、再加倍只在该定约仍有效时增加赌注，后续更高叫牌会取消它们。回应性加倍、转罚放等都要看特定进程。"
      ]
    ],
    "rows": [
      [
        [
          "Ordinary double",
          "普通技术性加倍"
        ],
        [
          "12+, short in their suit, support unbid suits",
          "12点以上、对方花色短、支持未叫花色"
        ]
      ],
      [
        [
          "Forced suit reply",
          "被迫花色回应"
        ],
        [
          "0–8 cheapest / 9–11 jump / 12+ force",
          "0–8最经济／9–11跳叫／12以上逼叫"
        ]
      ],
      [
        [
          "Powerhouse",
          "超强牌"
        ],
        [
          "Double then suit 17+, NT 19–21",
          "先加倍后花色17以上，无将19–21"
        ]
      ],
      [
        [
          "After RHO bids",
          "右手对手叫牌后"
        ],
        [
          "You may pass with no useful values",
          "没有有效实力时可以Pass"
        ]
      ]
    ],
    "specs": {
      "E": [
        12,
        [
          3,
          5,
          3,
          2
        ]
      ],
      "S": [
        17,
        [
          4,
          1,
          4,
          4
        ]
      ],
      "N": [
        9,
        [
          4,
          3,
          3,
          3
        ]
      ]
    },
    "auction": [
      {
        "seat": "E",
        "bid": "1H",
        "note": [
          "East opens 1♥.",
          "东家开1♥。请结合已有叫牌确认含义。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "X",
        "note": [
          "Opening strength, short hearts and four cards in every unbid suit: double.",
          "开叫实力、红桃短，未叫花色各四张，技术性加倍。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2S",
        "note": [
          "A jump response: 9–11 and four spades.",
          "跳应叫：9–11点、四张黑桃。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "4S",
        "note": [
          "17 opposite an invitation and a four–four fit: accept.",
          "17点面对邀请，四四配合，接受成局。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "E",
    "contract": [
      4,
      "S",
      "N"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "E": [
        "KS",
        "8S",
        "7S",
        "KH",
        "AH",
        "8H",
        "TH",
        "3H",
        "3D",
        "9D",
        "5D",
        "7C",
        "QC"
      ],
      "S": [
        "AS",
        "2S",
        "QS",
        "4S",
        "2H",
        "JD",
        "QD",
        "AD",
        "TD",
        "6C",
        "JC",
        "TC",
        "KC"
      ],
      "N": [
        "5S",
        "3S",
        "TS",
        "9S",
        "5H",
        "6H",
        "QH",
        "8D",
        "4D",
        "KD",
        "4C",
        "AC",
        "3C"
      ],
      "W": [
        "6S",
        "9C",
        "9H",
        "2D",
        "7H",
        "8C",
        "JS",
        "JH",
        "6D",
        "2C",
        "5C",
        "7D",
        "4H"
      ]
    },
    "facts": {
      "E": {
        "hcp": 12,
        "shape": [
          3,
          5,
          3,
          2
        ]
      },
      "S": {
        "hcp": 17,
        "shape": [
          4,
          1,
          4,
          4
        ]
      },
      "N": {
        "hcp": 9,
        "shape": [
          4,
          3,
          3,
          3
        ]
      },
      "W": {
        "hcp": 2,
        "shape": [
          2,
          4,
          3,
          4
        ]
      }
    }
  },
  {
    "id": "negative-doubles",
    "title": [
      "After an Overcall: Negative Doubles",
      "争叫之后：负加倍"
    ],
    "source": "Class13",
    "focus": [
      "Show exactly four of the missing major with a negative double; free bids need more strength.",
      "用负加倍表示未叫高花四张，自由应叫需要更多实力。"
    ],
    "notes": [
      [
        "After partner opens a minor and an opponent overcalls 1♥, double shows four spades and about 6+; a direct 1♠ shows five+ and about 8+. After a 1♠ overcall, double commonly shows four hearts; a direct 2♥ needs five+ and about 10+. The levels differ, so do not copy a one-level minimum into the two-level bid.",
        "搭档开低花，对手争叫1♥后，加倍表示四张黑桃、约6点以上，直接1♠表示五张以上、约8点以上。对手争叫1♠后，加倍通常表示四张红桃，直接2♥需要五张以上、约10点以上。阶数不同，不能把一阶最低条件直接搬到二阶。"
      ],
      [
        "A natural new suit that qualifies as a strong free bid forces for one round. A weaker long suit can start with a negative double and later name its suit non-forcing. Other negative-double uses include two unbid suits or a balanced hand without a stopper; the exact major-length message is tied to the auction.",
        "达到强自由叫条件的自然新花逼叫一轮。较弱的长套可先负加倍，之后报花色作为非逼叫。其他负加倍用途包括未叫双套或无止张的均型；高花恰好四张的信息必须结合具体进程。"
      ],
      [
        "With a major fit after interference: simple raise roughly 7–9, jump raise weak with extra support, cue-bid their suit about 10+ with good support. We no longer use the quiet-auction Bergen jumps automatically. An opponent’s overcall means responder is not simply maintaining an uncontested auction; contribute useful information.",
        "有高花配合且受干扰时：简单加叫约7–9点，跳加叫凭额外支持阻击，扣叫对方花色约10点以上并有好支持。不能自动沿用无干扰伯根。对方争叫后，应叫者不是单纯维持无干扰叫牌，而是提供有效信息。"
      ]
    ],
    "rows": [
      [
        [
          "1m–(1♥)–X",
          "1低花—（1♥）—X"
        ],
        [
          "Four spades, about 6+",
          "四张黑桃、约6点以上"
        ]
      ],
      [
        [
          "1m–(1♥)–1♠",
          "1低花—（1♥）—1♠"
        ],
        [
          "Five+ spades, about 8+, F1",
          "五张以上黑桃、约8点以上，逼叫一轮"
        ]
      ],
      [
        [
          "Two-level free bid",
          "二阶自由应叫"
        ],
        [
          "Five+ cards, about 10+, F1",
          "五张以上、约10点以上，逼叫一轮"
        ]
      ],
      [
        [
          "Cue-bid with support",
          "有支持时扣叫"
        ],
        [
          "Strong support, invitation or better",
          "强支持，邀局或更强"
        ]
      ]
    ],
    "specs": {
      "N": [
        13,
        [
          4,
          3,
          2,
          4
        ]
      ],
      "E": [
        10,
        [
          2,
          5,
          3,
          3
        ]
      ],
      "S": [
        9,
        [
          4,
          4,
          2,
          3
        ]
      ]
    },
    "auction": [
      {
        "seat": "N",
        "bid": "1C",
        "note": [
          "North opens 1♣.",
          "北家开1♣。请结合已有叫牌确认含义。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "1H",
        "note": [
          "A good five-card heart overcall.",
          "好五张红桃争叫。请结合已有叫牌确认含义。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "X",
        "note": [
          "Exactly four spades and 9: negative double.",
          "恰好四张黑桃、9点，负加倍。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "1S",
        "note": [
          "Four spades: fit found at the one level.",
          "四张黑桃，在一阶找到配合。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2S",
        "note": [
          "Limited strength: raise the known four–four fit.",
          "有限实力，加叫已知的四四配合。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "N",
    "contract": [
      2,
      "S",
      "N"
    ],
    "fixed": null,
    "needs": {
      "E": {
        "H": "KQ"
      }
    },
    "hands": {
      "N": [
        "KS",
        "4S",
        "8S",
        "AS",
        "6H",
        "TH",
        "5H",
        "JD",
        "2D",
        "KC",
        "QC",
        "2C",
        "8C"
      ],
      "E": [
        "5S",
        "2S",
        "QH",
        "2H",
        "8H",
        "KH",
        "AH",
        "6D",
        "9D",
        "TD",
        "JC",
        "6C",
        "4C"
      ],
      "S": [
        "3S",
        "6S",
        "QS",
        "7S",
        "JH",
        "3H",
        "9H",
        "4H",
        "AD",
        "QD",
        "5C",
        "3C",
        "TC"
      ],
      "W": [
        "9S",
        "9C",
        "5D",
        "7D",
        "4D",
        "AC",
        "7H",
        "3D",
        "KD",
        "TS",
        "8D",
        "7C",
        "JS"
      ]
    },
    "facts": {
      "N": {
        "hcp": 13,
        "shape": [
          4,
          3,
          2,
          4
        ]
      },
      "E": {
        "hcp": 10,
        "shape": [
          2,
          5,
          3,
          3
        ]
      },
      "S": {
        "hcp": 9,
        "shape": [
          4,
          4,
          2,
          3
        ]
      },
      "W": {
        "hcp": 8,
        "shape": [
          3,
          1,
          6,
          3
        ]
      }
    }
  },
  {
    "id": "support-and-redoubles",
    "title": [
      "Support Doubles and Bidding after Double",
      "支持性加倍与加倍后的应叫"
    ],
    "source": "Class13",
    "focus": [
      "Use context: opener’s support double shows three; responses to an opponent’s double use separate agreements.",
      "结合身份与进程：开叫者支持性加倍表示三张，对手加倍后的应叫另有约定。"
    ],
    "notes": [
      [
        "After 1♣–Pass–1♥–(1♠), opener’s double is a SUPPORT DOUBLE showing exactly three hearts, not a penalty or ordinary takeout double. Four-card support raises; with three, double first. A support redouble serves the same length message when the responder’s suit is doubled.",
        "1♣—Pass—1♥—（1♠）后，开叫者加倍是支持性加倍，表示恰好三张红桃，不是惩罚或普通技术性加倍。四张支持直接加叫，三张优先加倍；应叫花色遭加倍时，支持性再加倍传递同样长度信息。"
      ],
      [
        "After 1M–(X), Bergen raises and semi-forcing 1NT are off. 1NT becomes a good raise: about 9–11 with three trumps or 7–10 with four. 2NT shows a limit raise or better with four+ support, about 11+ total points; direct raises can be weaker and preemptive.",
        "1高花—（X）后，停用伯根加叫与半逼叫1NT。1NT改为好支持：三张将牌约9–11点，四张将牌约7–10点。2NT表示四张以上支持、限制性邀局或更强，约11点以上总点；直接加叫则可以更弱、带阻击性。"
      ],
      [
        "After 1m–(X), a one-level new suit is 6+ and forcing one round; 1NT is 8–11 without a good minor fit; 2NT is a limit raise or better with five+ support. Redouble, about 11+, usually denies an immediate fit and prepares to penalize. A jump new suit is weak, not an uncontested GF.",
        "1低花—（X）后，一阶新花6点以上、逼叫一轮；1NT为8–11点且无良好低花配合；2NT为五张以上支持的限制性邀局或更强。再加倍约11点以上，通常否认直接配合并准备惩罚。跳新花是弱牌，不是无干扰逼局。"
      ]
    ],
    "rows": [
      [
        [
          "Support double / redouble",
          "支持性加倍／再加倍"
        ],
        [
          "Opener shows exactly three-card support",
          "开叫者表示恰好三张支持"
        ]
      ],
      [
        [
          "After 1M–(X): 1NT",
          "1高花—（X）后1NT"
        ],
        [
          "Good raise, not semi-forcing NT",
          "好支持，不再是半逼叫无将"
        ]
      ],
      [
        [
          "After 1M–(X): 2NT",
          "1高花—（X）后2NT"
        ],
        [
          "Four+ support, limit raise or better",
          "四张以上支持，限制性邀局或更强"
        ]
      ],
      [
        [
          "XX by responder",
          "应叫者XX"
        ],
        [
          "About 11+, usually no immediate fit",
          "约11点以上，通常无直接配合"
        ]
      ]
    ],
    "specs": {
      "S": [
        13,
        [
          3,
          3,
          3,
          4
        ]
      ],
      "N": [
        8,
        [
          3,
          5,
          2,
          3
        ]
      ],
      "E": [
        10,
        [
          5,
          2,
          3,
          3
        ]
      ]
    },
    "auction": [
      {
        "seat": "S",
        "bid": "1C",
        "note": [
          "13 balanced, below 1NT range, four clubs.",
          "13点均型，不够1NT，四张梅花。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "1H",
        "note": [
          "Five hearts, but the response only promises four.",
          "实际五张红桃，但应叫只保证四张。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "1S",
        "note": [
          "East overcalls on five spades.",
          "东家用五张黑桃争叫。请结合已有叫牌确认含义。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "X",
        "note": [
          "Support double: exactly three hearts.",
          "支持性加倍：恰好三张红桃。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2H",
        "note": [
          "With five hearts, responder now knows the five–three fit.",
          "应叫者有五张，现在知道五三配合。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "P",
        "note": [
          "Minimum opener opposite a minimum response: pass.",
          "低限开叫面对低限应叫，不叫。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      2,
      "H",
      "N"
    ],
    "fixed": null,
    "needs": {
      "E": {
        "S": "KQ"
      }
    },
    "hands": {
      "S": [
        "7S",
        "JS",
        "8S",
        "2H",
        "JH",
        "KH",
        "TD",
        "AD",
        "4D",
        "4C",
        "AC",
        "2C",
        "5C"
      ],
      "N": [
        "3S",
        "9S",
        "AS",
        "9H",
        "4H",
        "8H",
        "QH",
        "3H",
        "9D",
        "7D",
        "8C",
        "7C",
        "QC"
      ],
      "E": [
        "KS",
        "QS",
        "TS",
        "4S",
        "2S",
        "6H",
        "TH",
        "QD",
        "6D",
        "KD",
        "TC",
        "9C",
        "3C"
      ],
      "W": [
        "8D",
        "AH",
        "6C",
        "3D",
        "5D",
        "KC",
        "5S",
        "6S",
        "2D",
        "5H",
        "JC",
        "JD",
        "7H"
      ]
    },
    "facts": {
      "S": {
        "hcp": 13,
        "shape": [
          3,
          3,
          3,
          4
        ]
      },
      "N": {
        "hcp": 8,
        "shape": [
          3,
          5,
          2,
          3
        ]
      },
      "E": {
        "hcp": 10,
        "shape": [
          5,
          2,
          3,
          3
        ]
      },
      "W": {
        "hcp": 9,
        "shape": [
          2,
          3,
          5,
          3
        ]
      }
    }
  },
  {
    "id": "game-forcing-auctions",
    "title": [
      "Fourth-Suit Forcing and Arrival",
      "第四花色逼叫与速缓达"
    ],
    "source": "Class14",
    "focus": [
      "Use an actual fourth-suit game force to ask for three-card support, then choose game in the fit.",
      "用真正的第四花色逼局询问三张支持，再选择有配合的成局定约。"
    ],
    "notes": [
      [
        "Foundations already established what a two-over-one game force means. Here we use that commitment as a starting point: learn an artificial fourth-suit inquiry and how different arrival routes communicate slam interest, rather than relearning the basic opening and response ranges.",
        "基础篇已讲清二盖一逼局。本课从这个承诺出发，学习人工第四花色询问，以及不同到达路线如何表达满贯兴趣，不再重讲开叫和应叫的基本范围。"
      ],
      [
        "After three natural suits, the fourth suit is an artificial forcing inquiry, often looking for three-card support or a NT stopper. Example: 1♥–1♠–2♣–2♦. It need not promise diamonds. Fourth-suit forcing commits to game; the one-level 1♣–1♦–1♥–1♠ case is explicitly artificial here and must be agreed, since other pairs play it naturally.",
        "三门花色自然报过后，第四花色是人工逼叫询问，常为寻找三张支持或无将止张。例如1♥—1♠—2♣—2♦，不必保证方块。第四花色逼局；一阶1♣—1♦—1♥—1♠在这里也明确约定人工，其他搭档可能按自然，不能混用。"
      ],
      [
        "Without a GF, returning to partner’s suit at 2 is usually a preference to play; 2NT or a jump in a known suit invites. Within a GF, the same economical support may keep slam exploration alive. Fast arrival to the agreed game says minimum GF strength and no slam interest; slow support keeps room for more information.",
        "未逼局时，二阶回搭档花色通常是选择止叫；2NT或已叫花色的跳叫可邀局。已逼局时，经济支持则可继续探索满贯。快到已定高花成局表示逼局低限、无满贯兴趣；慢支持保留更多交流空间。"
      ],
      [
        "Now the table demonstrates the fourth suit itself: 1♥–1♠–2♣–2♦. South has five hearts, four clubs and three spades; North has five spades and game-going strength. Artificial 2♦ does not promise diamonds. South’s economical 2♠ shows three-card support inside the game force, and North chooses 4♠.",
        "现在桌上实际演示第四花色本身：1♥—1♠—2♣—2♦。南家五张红桃、四张梅花、三张黑桃，北家五张黑桃与成局实力。人工2♦不保证方块。南家经济地叫2♠，在逼局中说明三张支持，北家选择4♠。"
      ]
    ],
    "rows": [
      [
        [
          "Starting assumption",
          "前提"
        ],
        [
          "Game is already forced; now exchange more precise information",
          "已经逼局，接下来交换更精确的信息"
        ]
      ],
      [
        [
          "Fourth suit",
          "第四花色"
        ],
        [
          "Artificial inquiry, GF by agreement",
          "人工询问，逼局"
        ]
      ],
      [
        [
          "Fast arrival",
          "快到成局"
        ],
        [
          "Minimum GF, no slam interest",
          "逼局低限，无满贯兴趣"
        ]
      ],
      [
        [
          "Slow arrival",
          "慢到成局"
        ],
        [
          "Room for fit, controls and slam interest",
          "保留配合、控制与满贯交流空间"
        ]
      ]
    ],
    "specs": {
      "S": [
        13,
        [
          2,
          5,
          4,
          2
        ]
      ],
      "N": [
        13,
        [
          3,
          3,
          3,
          4
        ]
      ]
    },
    "auction": [
      {
        "seat": "S",
        "bid": "1H",
        "note": [
          "14 points and five hearts: open 1♥.",
          "14点、五张红桃，开叫1♥。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action here.",
          "不叫：这里没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "1S",
        "note": [
          "13 points and five spades; the one-level response promises four and is forcing.",
          "13点、五张黑桃；一阶应叫保证四张，并逼叫。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action here.",
          "不叫：这里没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2C",
        "note": [
          "Four clubs: an economical second suit, not extra strength.",
          "四张梅花：经济地报第二套，不额外保证强牌。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action here.",
          "不叫：这里没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2D",
        "note": [
          "Artificial fourth suit, game forcing: ask for more information, not diamonds.",
          "人工第四花色逼局：请继续说明，不是自然方块套。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action here.",
          "不叫：这里没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2S",
        "note": [
          "Three spades: support within the established game force.",
          "三张黑桃：在已经建立的逼局中表示支持。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action here.",
          "不叫：这里没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "4S",
        "note": [
          "Five plus three: choose the major game with no further slam interest.",
          "五加三：选择高花成局，没有进一步满贯兴趣。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action here.",
          "不叫：这里没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "P",
        "note": [
          "Pass: game has been chosen within the existing force.",
          "不叫：已经按逼局承诺选定成局定约。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: the third pass completes the auction.",
          "不叫：第三次不叫结束叫牌。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      4,
      "S",
      "N"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "S": [
        "AS",
        "7S",
        "3S",
        "KH",
        "QH",
        "JH",
        "6H",
        "4H",
        "8D",
        "AC",
        "9C",
        "7C",
        "2C"
      ],
      "N": [
        "KS",
        "QS",
        "JS",
        "8S",
        "5S",
        "8H",
        "2H",
        "AD",
        "QD",
        "3D",
        "JC",
        "6C",
        "4C"
      ],
      "E": [
        "KC",
        "6S",
        "2D",
        "4D",
        "7H",
        "3C",
        "KD",
        "AH",
        "6D",
        "TS",
        "5C",
        "JD",
        "9S"
      ],
      "W": [
        "9H",
        "7D",
        "TD",
        "9D",
        "5H",
        "3H",
        "5D",
        "TC",
        "4S",
        "8C",
        "2S",
        "QC",
        "TH"
      ]
    },
    "facts": {
      "S": {
        "hcp": 14,
        "shape": [
          3,
          5,
          1,
          4
        ]
      },
      "N": {
        "hcp": 13,
        "shape": [
          5,
          2,
          3,
          3
        ]
      },
      "E": {
        "hcp": 11,
        "shape": [
          3,
          2,
          5,
          3
        ]
      },
      "W": {
        "hcp": 2,
        "shape": [
          2,
          4,
          4,
          3
        ]
      }
    }
  },
  {
    "id": "two-way-checkback",
    "title": [
      "Two-Way Checkback after 1NT Rebid",
      "1NT再叫后的双路重询"
    ],
    "source": "Class14",
    "focus": [
      "Use separate artificial routes for invitations and game forces after opener rebids 1NT.",
      "开叫者再叫1NT后，用不同人工路线区分邀请与逼局。"
    ],
    "notes": [
      [
        "Advanced response style: Walsh prioritizes a four-card major over diamonds after 1♣ when responder is below game strength, even with longer diamonds. With a game force and long diamonds, there is time to show diamonds first and then the major. The beginner part simply emphasized finding the major fit; this style adds the detailed order and exceptions.",
        "进阶应叫风格：沃尔什在1♣后，应叫者不足逼局实力时优先四张高花，即使方块更长；逼局且有长方块时，可先方块再高花。基础篇只强调先找高花配合，这里进一步约定顺序与例外。"
      ],
      [
        "After a minor opening, a major response and a 1NT rebid, 2♣ is a relay: opener must bid 2♦. Responder may then describe an invitational hand, or pass 2♦ with a weak diamond hand. This 2♣ is not natural clubs or Stayman after a 1NT opening.",
        "低花开叫、高花应叫、1NT再叫后，2♣是接力，要求开叫者答2♦。应叫者之后可描述邀请牌，或弱方块牌直接Pass在2♦。这里2♣不是自然梅花，也不是1NT开叫后的斯台曼。"
      ],
      [
        "Direct 2♦ is the game-forcing checkback. Opener can show four in the other major, three in responder’s major, or NT without a major fit. Responder already set the level commitment and now asks for shape.",
        "直接2♦是逼局重询。开叫者可表示另一高花四张、应叫高花三张，或没有高花配合时叫无将。应叫者已承诺成局，接下来询问牌型。"
      ],
      [
        "Other two-level suit bids are normally to play; three-level suit bids are GF in this agreement. Artificial 2NT asks for 3♣, intending to pass with weak clubs. The same 2NT symbol has different meanings after a 1NT opening, a major opening, and this rebid sequence.",
        "本约定中，其他二阶花色通常止叫，三阶花色逼局；人工2NT要求3♣，准备弱梅花止叫。同一个2NT，在1NT开叫后、高花开叫后、以及这里的再叫进程中，含义各不相同。"
      ]
    ],
    "rows": [
      [
        [
          "2♣",
          "2♣"
        ],
        [
          "Relay to 2♦, invitation or weak diamonds",
          "接力到2♦，邀请或弱方块"
        ]
      ],
      [
        [
          "2♦ directly",
          "直接2♦"
        ],
        [
          "Artificial GF checkback",
          "人工逼局重询"
        ]
      ],
      [
        [
          "Other suits at 2 / 3",
          "其他花色2阶／3阶"
        ],
        [
          "Usually to play / GF",
          "通常止叫／逼局"
        ]
      ],
      [
        [
          "2NT",
          "2NT"
        ],
        [
          "Relay to 3♣ for a club sign-off",
          "接力到3♣，准备梅花止叫"
        ]
      ]
    ],
    "specs": {
      "S": [
        13,
        [
          3,
          3,
          3,
          4
        ]
      ],
      "N": [
        13,
        [
          5,
          2,
          3,
          3
        ]
      ]
    },
    "auction": [
      {
        "seat": "S",
        "bid": "1C",
        "note": [
          "13 balanced: begin 1♣.",
          "13点均型，先1♣。请结合已有叫牌确认含义。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "1S",
        "note": [
          "Show five spades, at least four promised.",
          "表示黑桃，实际五张、保证至少四张。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "1NT",
        "note": [
          "12–14 balanced, no four spades.",
          "12–14点均型，无四张黑桃。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2D",
        "note": [
          "Direct 2♦: artificial, game forcing.",
          "直接2♦：人工、逼局。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2S",
        "note": [
          "Show three-card spade support in the GF inquiry.",
          "在逼局询问中表示三张黑桃支持。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "4S",
        "note": [
          "Five plus three: game in the fit.",
          "五加三，在配合中成局。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      4,
      "S",
      "N"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "S": [
        "3S",
        "QS",
        "8S",
        "AH",
        "KH",
        "4H",
        "6D",
        "3D",
        "9D",
        "TC",
        "9C",
        "3C",
        "AC"
      ],
      "N": [
        "TS",
        "JS",
        "9S",
        "2S",
        "AS",
        "3H",
        "9H",
        "TD",
        "JD",
        "AD",
        "JC",
        "2C",
        "QC"
      ],
      "E": [
        "4S",
        "5H",
        "7S",
        "KS",
        "TH",
        "2H",
        "JH",
        "7H",
        "8H",
        "QD",
        "2D",
        "QH",
        "4C"
      ],
      "W": [
        "5D",
        "7C",
        "8C",
        "6H",
        "4D",
        "5S",
        "KC",
        "6C",
        "5C",
        "6S",
        "8D",
        "7D",
        "KD"
      ]
    },
    "facts": {
      "S": {
        "hcp": 13,
        "shape": [
          3,
          3,
          3,
          4
        ]
      },
      "N": {
        "hcp": 13,
        "shape": [
          5,
          2,
          3,
          3
        ]
      },
      "E": {
        "hcp": 8,
        "shape": [
          3,
          7,
          2,
          1
        ]
      },
      "W": {
        "hcp": 6,
        "shape": [
          2,
          1,
          5,
          5
        ]
      }
    }
  },
  {
    "id": "controls-and-keycards",
    "title": [
      "Controls and RKCB 1430",
      "控制扣叫与1430关键张"
    ],
    "source": "Class14",
    "focus": [
      "Before asking keycards, locate side-suit controls; slow arrival can find a distributional slam.",
      "先确认边花控制，再问关键张；慢到可找到牌型满贯。"
    ],
    "notes": [
      [
        "With a fit agreed and game forced, a control bid shows an ace, king, singleton or void in a side suit. Show the cheapest control; skipping an available control suit denies that control. If neither hand controls a side suit, stop in game rather than asking keycards and discovering the problem too late.",
        "配合已定、已逼局时，控制扣叫表示边花A、K、单张或缺门。从最经济的控制叫起，越过可叫花色表示没有该控制。双方都缺某边花控制，应停成局，而不是先问关键张再发现来不及。"
      ],
      [
        "With a trump suit agreed, 4NT asks for five keycards: four aces plus the trump king. The 1430 replies are 5♣ = 1 or 4; 5♦ = 0 or 3; 5♥ = 2 without the trump queen; 5♠ = 2 with it. Use strength and auction context to resolve the alternatives.",
        "将牌花色已定时，4NT询问五张关键张：四个A加将牌K。1430回答：5♣为1或4；5♦为0或3；5♥为2且无将牌Q；5♠为2且有将牌Q。结合实力与进程判定是哪一档。"
      ],
      [
        "After 5♣ or 5♦, the cheapest non-trump suit can ask for the trump queen: returning to trumps denies it; another response shows the queen and may show a side king. After keycards are secure, 5NT asks specific kings, not their count. The exact queen-ask replies and escape to 5NT require agreement and enough bidding space; never use them as universal automatic calls.",
        "5♣或5♦后，最经济的非将牌花色可问将牌Q；回将牌表示没有，其他回答表示有Q并可表示边花K。关键张安全后，5NT问具体的K，不是数K个数。问Q细则、逃到5NT等都需明确约定和足够空间，不能当万能自动叫品。"
      ],
      [
        "Worked comparison: after 1♠–2NT–3NT, a 4♦ control bid skips clubs. If opener also lacks a club control, return to 4♠. High total points do not repair two immediate club losers. After a natural 1NT opening with no trump fit, 4NT is normally quantitative, not automatically RKCB.",
        "对照例：1♠—2NT—3NT后，4♦控制扣叫越过梅花；若开叫者也无梅花控制，回4♠。总点高不能补救梅花立即输两墩。自然1NT开叫且未定将牌时，4NT通常是定量邀满贯，不自动是关键张问叫。"
      ],
      [
        "Now use the course’s distributional slam: South has no spades, six hearts and five diamonds; North has 17 points and three hearts. South’s jump to 3♠ is an agreed splinter showing spade shortness, actually a void here, not a natural spade suit. This shortness jump is distinct from a cheapest control bid; it does not deny a diamond control. After showing controls, North can ask keycards; South’s two keycards and trump queen allow 6♥. Points guide you, while controls, length and entries decide whether the slam is sound.",
        "现在用课件的牌型满贯：南家黑桃缺门、六张红桃五张方块，北家17点、三张红桃。南家跳叫3♠按约定是爆裂叫，表示黑桃短套，本副实际缺门，不是自然黑桃套。这种短套跳叫与最经济控制扣叫不同，不表示否认方块控制。双方报控制后，北家问关键张；南家两张关键张加将牌Q，支持叫到6♥。点数是参考，控制、长度与进手共同决定满贯是否合理。"
      ]
    ],
    "rows": [
      [
        [
          "Control bid",
          "控制扣叫"
        ],
        [
          "A, K, singleton or void; check missing suits",
          "A、K、单缺，检查缺失控制"
        ]
      ],
      [
        [
          "5♣ / 5♦",
          "5♣／5♦"
        ],
        [
          "1 or 4 / 0 or 3 keycards",
          "1或4／0或3张关键张"
        ]
      ],
      [
        [
          "5♥ / 5♠",
          "5♥／5♠"
        ],
        [
          "2 without / with trump queen",
          "2张，无／有将牌Q"
        ]
      ],
      [
        [
          "5NT after keycards",
          "关键张确认后的5NT"
        ],
        [
          "Ask specific kings",
          "询问具体的边花K"
        ]
      ],
      [
        [
          "4NT without agreed trumps",
          "未定将牌的4NT"
        ],
        [
          "May be quantitative, read context",
          "可能是定量，必须看背景"
        ]
      ]
    ],
    "specs": {},
    "auction": [
      {
        "seat": "S",
        "bid": "1H",
        "note": [
          "12 with six hearts and five diamonds: open 1♥.",
          "12点、六张红桃五张方块，开1♥。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2C",
        "note": [
          "17 points, game force.",
          "17点，逼局。请结合已有叫牌确认含义。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2D",
        "note": [
          "Describe the five-card diamond suit.",
          "描述五张方块。请结合已有叫牌确认含义。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2H",
        "note": [
          "Three hearts: slow support in a GF auction.",
          "三张红桃，在逼局中慢支持。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "3S",
        "note": [
          "Agreed splinter: spade shortness, here a void, with slam interest. This jump does not deny the ace of diamonds.",
          "约定的爆裂叫：黑桃短套，本副缺门，有满贯兴趣。这种跳叫不否认方块A。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "4C",
        "note": [
          "King of clubs: second-round control.",
          "梅花K，第二轮控制。请结合已有叫牌确认含义。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "4D",
        "note": [
          "Ace of diamonds: first-round control.",
          "方块A，第一轮控制。请结合已有叫牌确认含义。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "4NT",
        "note": [
          "All side suits controlled: ask keycards in hearts.",
          "边花控制齐备，以红桃为将牌问关键张。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "5S",
        "note": [
          "Two keycards and the queen of hearts.",
          "两张关键张与红桃Q。请结合已有叫牌确认含义。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "6H",
        "note": [
          "Enough for small slam; one keycard missing, no grand.",
          "足够小满贯，少一张关键张，不叫大满贯。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      6,
      "H",
      "S"
    ],
    "fixed": {
      "S": "AQ9742H AQ754D 53C",
      "N": "AKQTS K53H J9D KJT9C"
    },
    "needs": {},
    "hands": {
      "S": [
        "AH",
        "QH",
        "9H",
        "7H",
        "4H",
        "2H",
        "AD",
        "QD",
        "7D",
        "5D",
        "4D",
        "5C",
        "3C"
      ],
      "N": [
        "AS",
        "KS",
        "QS",
        "TS",
        "KH",
        "5H",
        "3H",
        "JD",
        "9D",
        "KC",
        "JC",
        "TC",
        "9C"
      ],
      "E": [
        "6H",
        "JS",
        "KD",
        "TD",
        "7S",
        "8S",
        "AC",
        "4S",
        "6S",
        "2S",
        "TH",
        "9S",
        "7C"
      ],
      "W": [
        "2C",
        "6C",
        "6D",
        "8H",
        "5S",
        "8D",
        "3S",
        "4C",
        "JH",
        "2D",
        "QC",
        "3D",
        "8C"
      ]
    },
    "facts": {
      "S": {
        "hcp": 12,
        "shape": [
          0,
          6,
          5,
          2
        ]
      },
      "N": {
        "hcp": 17,
        "shape": [
          4,
          3,
          2,
          4
        ]
      },
      "E": {
        "hcp": 8,
        "shape": [
          7,
          2,
          2,
          2
        ]
      },
      "W": {
        "hcp": 3,
        "shape": [
          2,
          2,
          4,
          5
        ]
      }
    }
  },
  {
    "id": "two-over-one-basics",
    "title": [
      "Two over One: Commit to Game First",
      "二盖一：先确定成局"
    ],
    "source": "Class14",
    "focus": [
      "With 13+, establish a game force, then describe shape naturally to choose the game.",
      "13点以上先建立逼局，再自然描述牌型，选择成局定约。"
    ],
    "notes": [
      [
        "Read every call in three parts: strength range, length or shape, and forcing status. Uncapped means partner must continue; a one-round force and a game force have different stopping points. A limited invitation may be declined, but an existing GF still cannot be passed below game.",
        "每声叫品读三件事：实力范围、长度或牌型、逼叫状态。未封顶就要搭档继续；逼叫一轮与逼局的停止条件不同。有限邀请可以拒绝，但若已经逼局，仍不能停在局以下。"
      ],
      [
        "Without interference, an unpassed responder’s cheapest two-level new suit over a one-level suit opening shows 13+ and forces to game. Show at least four cards in the new suit; 1♠–2♥ requires five hearts.",
        "无干扰、应叫者未Pass过时，对一阶花色开叫作最经济二阶新花应叫，表示13点以上并逼局。基础例子新花至少四张，1♠—2♥需要五张红桃。"
      ],
      [
        "One-over-one only asks opener to bid once more. Two-over-one says neither partner may stop below game. Start by showing a second suit or supporting partner; the information chooses which game, not whether game is required.",
        "一盖一只要求开叫者再说一轮，二盖一则要求双方不能停在成局以下。接着可报第二套或支持搭档，用这些信息选择打哪一种成局，而不是重新讨论是否必须成局。"
      ],
      [
        "After 1♥–2♣–2♦–2♥, hearts are agreed and game is already forced. The low 2♥ keeps the description economical; it is not a weak stop. With a minimum opener and no further reason to continue, choose 4♥. Complex slam methods belong to the advanced part.",
        "1♥—2♣—2♦—2♥后，红桃配合已定，而且已经逼局。低阶2♥是经济描述，不是弱牌止叫。开叫低限、没有进一步探索理由时，选择4♥。复杂满贯方法留到进阶篇。"
      ],
      [
        "Why does the next lesson need semi-forcing 1NT? We have reserved a two-over-one new-suit response for game-forcing hands. A weaker responder cannot simply bid a long suit at the two level. When no economical one-level new suit or suitable direct raise describes the hand, 1NT provides a waiting route so that responder may describe it later.",
        "下一课为什么需要半逼叫1NT？我们已经把二盖一新花应叫留给逼局牌。不够逼局的应叫者，不能只因有长套就直接在二阶报新花。若经济的一阶新花或合适的直接加叫都不能说明手牌，便需要先用1NT过渡，等待后续再把话说完。"
      ]
    ],
    "rows": [
      [
        [
          "Start the force",
          "建立逼局"
        ],
        [
          "13+, unpassed, no interference",
          "13点以上、未Pass过、无干扰"
        ]
      ],
      [
        [
          "1♠–2♥",
          "1♠—2♥"
        ],
        [
          "Five+ hearts",
          "五张以上红桃"
        ]
      ],
      [
        [
          "After the force",
          "逼局之后"
        ],
        [
          "Describe shape or support; do not stop below game",
          "描述牌型或支持，不能停局以下"
        ]
      ],
      [
        [
          "Low descriptive bid",
          "低阶描述叫品"
        ],
        [
          "Economical information, not a weak sign-off",
          "经济传递信息，不是弱牌止叫"
        ]
      ]
    ],
    "specs": {
      "S": [
        13,
        [
          2,
          5,
          4,
          2
        ]
      ],
      "N": [
        13,
        [
          3,
          3,
          3,
          4
        ]
      ]
    },
    "auction": [
      {
        "seat": "S",
        "bid": "1H",
        "note": [
          "Five hearts and opening values.",
          "五张红桃与开叫实力。请结合已有叫牌确认含义。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2C",
        "note": [
          "13 and clubs: establish the game force.",
          "13点、有梅花，建立逼局。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2D",
        "note": [
          "Describe four diamonds; this does not cancel the force.",
          "描述四张方块，不取消逼局。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2H",
        "note": [
          "Three hearts: support partner within the existing game force.",
          "三张红桃：在已经逼局的进程中支持搭档。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "4H",
        "note": [
          "Minimum opener, fit found: choose 4♥ to fulfill the game commitment.",
          "低限开叫、配合已定，选择4♥兑现成局承诺。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      }
    ],
    "dealer": "S",
    "contract": [
      4,
      "H",
      "S"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "S": [
        "4S",
        "7S",
        "5H",
        "QH",
        "JH",
        "AH",
        "KH",
        "9D",
        "QD",
        "TD",
        "8D",
        "JC",
        "2C"
      ],
      "N": [
        "5S",
        "6S",
        "AS",
        "8H",
        "3H",
        "9H",
        "JD",
        "4D",
        "KD",
        "8C",
        "TC",
        "QC",
        "KC"
      ],
      "E": [
        "3C",
        "6D",
        "9S",
        "7D",
        "3D",
        "8S",
        "KS",
        "AD",
        "3S",
        "6C",
        "5D",
        "QS",
        "2H"
      ],
      "W": [
        "AC",
        "2D",
        "4C",
        "6H",
        "JS",
        "9C",
        "TH",
        "2S",
        "TS",
        "7H",
        "4H",
        "5C",
        "7C"
      ]
    },
    "facts": {
      "S": {
        "hcp": 13,
        "shape": [
          2,
          5,
          4,
          2
        ]
      },
      "N": {
        "hcp": 13,
        "shape": [
          3,
          3,
          3,
          4
        ]
      },
      "E": {
        "hcp": 9,
        "shape": [
          5,
          1,
          5,
          2
        ]
      },
      "W": {
        "hcp": 5,
        "shape": [
          3,
          4,
          1,
          5
        ]
      }
    }
  },
  {
    "id": "inverted-minor-raises",
    "title": [
      "Minor Responses: Inverted Raises and Stoppers",
      "对低花应叫：反加叫与挡张"
    ],
    "source": "User course agreement",
    "focus": [
      "11+ and five+ minor support: force a reply, then show stoppers and look for 3NT.",
      "11点以上、五张以上低花支持：逼搭档回应，再展示挡张，优先寻找3NT。"
    ],
    "notes": [
      [
        "We normally look for a major fit or a suitable 3NT before choosing a minor game, because a minor game needs 11 tricks. But when you really have long minor support, show it. In an uncontested auction by an unpassed responder, 1♣–2♣ and 1♦–2♦ are inverted minor raises: 11+ points and at least five cards in partner’s minor, normally without a four-card major that should be shown first.",
        "我们通常先找高花配合或合适的3NT，而不优先打低花成局，因为低花成局需要11墩。但真的拿到低花长支持，也应该表达。无干扰、应叫者未Pass过时，1♣—2♣和1♦—2♦为低花反加叫：11点以上、搭档低花至少五张，通常没有应该先报的四张高花。"
      ],
      [
        "11+ gives a minimum but no upper limit. Responder may have 11–12, 14, or much more, so opener MUST reply: this raise is forcing for at least one round. It is not automatically a game force, because 11 opposite a minimum opening may still be short. This is an explicitly agreed exception to the natural “higher shows stronger” shortcut.",
        "11点以上只有下限，没有封顶。应叫者可能11–12点，也可能14点甚至更多，开叫者必须回应，因此至少逼叫一轮。但它不自动逼局，因为11点面对低限开叫仍可能不足成局。这是明确约定的反加叫，不能机械套用自然叫牌“越高越强”的规律。"
      ],
      [
        "After the minor fit is established, opener prioritizes side-suit STOPPERS to investigate 3NT. A stopper such as A, Kx or Qxx protects against an immediate run of the suit, though combinations and the lead position matter. In this sequence, a new side-suit continuation shows a stopper rather than promising a four-card major and remains forcing for one round by agreement; choose the cheapest useful description.",
        "低花配合确立后，开叫者优先展示边花挡张，寻找3NT。A、Kx、Qxx等有助于挡住对手连拿该花色，但仍要看组合与首攻位置。这个进程中的新边花继续叫是展示挡张，不是保证四张高花，并按约定仍逼叫一轮；尽量经济地描述有效信息。"
      ],
      [
        "Opener’s stopper bid answers the first force; now check the status of EVERY continuation. A new, uncapped stopper-showing bid keeps the conversation forcing. A responder with 11–12 can later limit the hand with 2NT when the remaining stoppers are covered, or 3 of the minor if 3NT is unsuitable; these natural limited continuations are non-forcing. With enough combined strength and all side suits protected, choose 3NT.",
        "开叫者报挡张，履行了第一轮逼叫；之后每一声仍要重新判断状态。新花展示挡张且实力未封顶，就继续逼叫。应叫者若只有11–12点，可在其余挡张齐备时用2NT限定实力，或3NT不合适时回3低花；这些自然有限续叫不逼叫。实力足且边花挡张齐全时，选择3NT。"
      ],
      [
        "Example contrast: 1♣–2♣–2♦–2NT can limit responder to 11–12, letting a minimum opener pass. In our table deal responder actually holds 14, so the partnership continues showing stoppers and reaches 3NT. Before every pass, ask: has partner capped the hand, and has any earlier force ended?",
        "对照例：1♣—2♣—2♦—2NT可把应叫者限定为11–12点，让低限开叫者Pass。桌上牌例应叫者实际14点，因此继续交换挡张并到3NT。每次准备不叫前，先问：搭档是否已经封顶，之前的逼叫义务是否解除？"
      ]
    ],
    "rows": [
      [
        [
          "Requirements",
          "条件"
        ],
        [
          "11+, five+ cards, unpassed and uncontested",
          "11点以上、五张以上，未Pass过、无干扰"
        ]
      ],
      [
        [
          "1♣–2♣ / 1♦–2♦",
          "1♣—2♣／1♦—2♦"
        ],
        [
          "Uncapped; forcing at least one round, not automatically GF",
          "未封顶；至少逼叫一轮，不自动逼局"
        ]
      ],
      [
        [
          "Opener’s priority",
          "开叫者优先"
        ],
        [
          "Show side-suit stoppers and investigate 3NT",
          "展示边花挡张，寻找3NT"
        ]
      ],
      [
        [
          "Limited later continuation",
          "之后的有限继续叫"
        ],
        [
          "11–12 via natural 2NT or 3m can be non-forcing",
          "自然2NT或3低花限定11–12点后可不逼叫"
        ]
      ],
      [
        [
          "Before passing",
          "不叫之前"
        ],
        [
          "Check both partner’s range and existing force",
          "同时检查搭档范围与既有逼叫义务"
        ]
      ]
    ],
    "dealer": "S",
    "contract": [
      3,
      "NT",
      "N"
    ],
    "auction": [
      {
        "seat": "S",
        "bid": "1C",
        "note": [
          "13 points and four clubs: open 1♣.",
          "13点、四张梅花，开1♣。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：这一轮没有合适的叫牌。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2C",
        "note": [
          "Inverted raise: five clubs, 11+, no upper limit; forcing.",
          "反加叫：五张梅花、11点以上、未封顶，逼叫。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：这一轮没有合适的叫牌。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2D",
        "note": [
          "Do not pass. Show your diamond stopper, the king with length.",
          "不能不叫，优先展示方块挡张：有长度保护的K。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：这一轮没有合适的叫牌。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "2H",
        "note": [
          "Show Kx in hearts; this uncapped continuation is forcing.",
          "展示红桃Kx挡张；这次未封顶继续叫仍逼叫。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：这一轮没有合适的叫牌。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "2S",
        "note": [
          "Show the spade stopper KQx; this does not promise four spades.",
          "展示黑桃KQx挡张，不保证四张黑桃。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：这一轮没有合适的叫牌。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "3NT",
        "note": [
          "14 opposite an opening and all side suits stopped: choose 3NT.",
          "14点面对开叫，边花挡张齐全，选择3NT。"
        ],
        "learn": false
      },
      {
        "seat": "E",
        "bid": "P",
        "note": [
          "Pass: no suitable action at this turn.",
          "不叫：这一轮没有合适的叫牌。"
        ],
        "learn": false
      },
      {
        "seat": "S",
        "bid": "P",
        "note": [
          "Pass: the agreed game has been reached.",
          "不叫：双方已经到达选定的成局定约。"
        ],
        "learn": true
      },
      {
        "seat": "W",
        "bid": "P",
        "note": [
          "Pass: the agreed game has been reached.",
          "不叫：双方已经到达选定的成局定约。"
        ],
        "learn": false
      }
    ],
    "hands": {
      "N": [
        "AS",
        "8S",
        "5S",
        "KH",
        "6H",
        "QD",
        "7D",
        "3D",
        "KC",
        "QC",
        "9C",
        "5C",
        "4C"
      ],
      "S": [
        "KS",
        "QS",
        "3S",
        "AH",
        "7H",
        "2H",
        "KD",
        "8D",
        "4D",
        "JC",
        "8C",
        "6C",
        "3C"
      ],
      "E": [
        "7C",
        "TH",
        "2C",
        "5H",
        "AC",
        "6D",
        "AD",
        "9D",
        "TD",
        "TS",
        "QH",
        "9H",
        "5D"
      ],
      "W": [
        "JS",
        "4H",
        "2S",
        "7S",
        "TC",
        "6S",
        "JH",
        "3H",
        "JD",
        "2D",
        "9S",
        "8H",
        "4S"
      ]
    },
    "facts": {
      "N": {
        "hcp": 14,
        "shape": [
          3,
          2,
          3,
          5
        ]
      },
      "S": {
        "hcp": 13,
        "shape": [
          3,
          3,
          3,
          4
        ]
      },
      "E": {
        "hcp": 10,
        "shape": [
          1,
          4,
          5,
          3
        ]
      },
      "W": {
        "hcp": 3,
        "shape": [
          6,
          4,
          2,
          1
        ]
      }
    }
  }
] as unknown as CourseModule[];

export function getContinuationLessons(lang: 'en' | 'zh'): Lesson[] {
  const k = lang === 'en' ? 0 : 1;
  return COURSE_MODULES.map(m => {
    const scripts: BidAction[] = m.auction.map(a => a.learn
      ? { seat: a.seat as Seat, learner: true, expected: a.bid, hint: a.note[k], note: a.note[k] }
      : { seat: a.seat as Seat, bid: a.bid, note: a.note[k] });
    const steps: Step[] = [
      { kind: 'info', text: (k ? '本课重点：' : 'Lesson focus: ') + m.focus[k] },
      ...m.notes.map(text => ({ kind: 'info' as const, text: text[k] })),
      { kind: 'info', text: k ? '接下来用桌上真实牌例，把每个叫品翻译成信息。先判断长度、实力与逼叫状态，再选择叫牌。' : 'Now use the real deal on the table. Translate each bid into length, strength and forcing status before choosing your call.' },
      { kind: 'auction', script: scripts },
      { kind: 'info', text: k ? '本课回顾' : 'Lesson review', review: {
        columns: k ? ['情境／叫品', '含义与行动'] : ['Situation / call', 'Meaning and action'],
        rows: m.rows.map(row => row.map(cell => cell[k]))
      } }
    ];
    return {
      id: m.id, title: m.title[k], focus: m.focus[k], dealer: m.dealer as Seat,
      hands: Object.fromEntries(Object.entries(m.hands).map(([seat,cards])=>[seat,cards.map(parseCard)])) as Lesson['hands'],
      contract: {level:m.contract[0], denom:m.contract[1] as Lesson['contract']['denom'], declarer:m.contract[2] as Seat, doubled:0},
      vulnerable:false, steps
    };
  });
}
