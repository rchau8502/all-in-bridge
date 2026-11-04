import { parseCard } from './deck.js';
import type { Seat } from './deck.js';
import type { Lesson, Step, BidAction } from './tutorial.js';
type Pair = [string, string];
interface CourseModule {
  id: string; title: Pair; source: string; focus: Pair; notes: Pair[]; rows: Pair[][];
  dealer: string; contract: [number, string, string]; hands: Record<string, string[]>;
  auction: Array<{ seat: string; bid: string; note: Pair; learn: boolean }>;
  facts: Record<string, { hcp: number; shape: number[] }>;
}
// Original teaching prose adapted from the supplied course slides.
// Animation-only duplicate PDF pages were collapsed before authoring.
export const COURSE_MODULES = [
  {
    "id": "strength-and-minors",
    "title": [
      "Strength Ranges and Minor Responses",
      "点力范围与低花应叫"
    ],
    "source": "C6",
    "focus": [
      "Show your suit and strength naturally; choose partscore, invitation or game.",
      "自然地描述花色与实力，选择部分定约、邀请或成局。"
    ],
    "notes": [
      [
        "A one-level suit opening covers 12–21 points. A one-level new-suit response shows 6+ and four cards, forcing one round. Once a bid limits strength, partner can add the ranges and choose the next step.",
        "一阶花色开叫覆盖12–21点。一阶新花应叫表示6点以上、四张，逼叫一轮。叫品限定实力后，搭档就能把范围加起来，决定下一步。"
      ],
      [
        "First look for an eight-card major fit. After a minor opening, show your four-card major before settling in a minor. A major response only promises four, so opener normally needs four to raise it.",
        "先找八张高花配合。低花开叫后，先表示四张高花，再考虑停在低花。高花应叫只保证四张，因此开叫者通常需要四张才能加叫。"
      ],
      [
        "Natural NT responses to a minor show increasing strength: 1NT = 6–10, 2NT = 11–12 invitational, 3NT = 13–15 with no four-card major. Higher in the same natural response family means stronger.",
        "对低花的自然无将应叫逐级表示实力：1NT为6–10点，2NT为11–12点邀局，3NT为13–15点且无四张高花。在同类自然无将应叫中，叫得越高，实力越强。"
      ],
      [
        "Our simple major raises are natural: 2M shows 6–9 with three+ support, 3M shows 10–12 and invites, and 4M places game with enough strength. In a two-over-one auction, a new suit at the cheapest two level shows 13+ and commits to game. The advanced part will introduce different agreements separately.",
        "基础篇采用自然高花加叫：2高花为6–9点、三张以上支持，3高花为10–12点邀局，4高花是实力足够时选择成局。二盖一进程中，最经济二阶新花表示13点以上，承诺成局。进阶篇再单独引入不同约定。"
      ]
    ],
    "rows": [
      [
        [
          "One over one",
          "一盖一"
        ],
        [
          "6+, four cards, forcing one round",
          "6点以上、四张，逼叫一轮"
        ]
      ],
      [
        [
          "2M / 3M / 4M",
          "2／3／4高花"
        ],
        [
          "Minimum / invite / game",
          "低限／邀请／成局"
        ]
      ],
      [
        [
          "1m–1NT / 2NT / 3NT",
          "1低花—1NT／2NT／3NT"
        ],
        [
          "6–10 / 11–12 / 13–15",
          "6–10／11–12／13–15点"
        ]
      ],
      [
        [
          "Two over one",
          "二盖一"
        ],
        [
          "13+, game forcing",
          "13点以上，逼局"
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
          "Pass: no suitable constructive action at this turn.",
          "不叫：这一轮没有合适的建设性行动。"
        ],
        "learn": false
      },
      {
        "seat": "N",
        "bid": "1H",
        "note": [
          "Four hearts and 8 points: show the major.",
          "四张红桃、8点，先报高花。"
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
          "Four-card support and a minimum: raise to 2♥.",
          "四张支持、低限开叫，加到2♥。"
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
          "A minimum response opposite a minimum opening: pass.",
          "低限应叫面对低限开叫，选择不叫。"
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
      2,
      "H",
      "N"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "S": [
        "AS",
        "JS",
        "7H",
        "5H",
        "TH",
        "6H",
        "7D",
        "AD",
        "8D",
        "9C",
        "5C",
        "7C",
        "AC"
      ],
      "N": [
        "2S",
        "5S",
        "7S",
        "QH",
        "4H",
        "3H",
        "KH",
        "4D",
        "TD",
        "6D",
        "JD",
        "QC",
        "2C"
      ],
      "E": [
        "3S",
        "6C",
        "9S",
        "3D",
        "QS",
        "JC",
        "TC",
        "2D",
        "TS",
        "KS",
        "9H",
        "8S",
        "KC"
      ],
      "W": [
        "KD",
        "QD",
        "8C",
        "4S",
        "9D",
        "3C",
        "AH",
        "2H",
        "5D",
        "8H",
        "4C",
        "JH",
        "6S"
      ]
    },
    "facts": {
      "S": {
        "hcp": 13,
        "shape": [
          2,
          4,
          3,
          4
        ]
      },
      "N": {
        "hcp": 8,
        "shape": [
          3,
          4,
          4,
          2
        ]
      },
      "E": {
        "hcp": 9,
        "shape": [
          6,
          1,
          2,
          4
        ]
      },
      "W": {
        "hcp": 10,
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
    "id": "stayman-fit",
    "title": [
      "Stayman: Find the Four–Four Fit",
      "斯台曼：寻找四四配合"
    ],
    "source": "C7",
    "focus": [
      "After a limited 1NT opening, ask for a four-card major before choosing game.",
      "面对有限的1NT开叫，先问四张高花，再决定是否成局。"
    ],
    "notes": [
      [
        "1NT shows 15–17 balanced. Without a major to investigate: 0–7 usually passes, 8–9 invites with 2NT, and 10+ chooses game. With 8+ and a four-card major, begin with artificial 2♣ Stayman. It does not promise clubs.",
        "1NT表示15–17点均型。没有要寻找的高花时：0–7点通常不叫，8–9点以2NT邀局，10点以上选择成局。有8点以上与四张高花时，先用人工2♣斯台曼，不保证梅花。"
      ],
      [
        "Opener answers 2♦ with no four-card major, 2♥ with four hearts (possibly also four spades), and 2♠ with four spades but not four hearts. With both four-card majors, answer hearts first.",
        "开叫者无四张高花答2♦；四张红桃答2♥，仍可能有四张黑桃；2♠表示四张黑桃、无四张红桃。两门都四张时先答红桃。"
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
      "Transfer to a five-card major, then describe strength and let opener choose the contract.",
      "先转移说明五张高花，再表达实力，让开叫者选择定约。"
    ],
    "notes": [
      [
        "After 1NT, 2♦ transfers to hearts and 2♥ transfers to spades. Opener normally completes the transfer even with only two cards. It asks for a bid, not whether there is already a fit.",
        "1NT后，2♦转移到红桃，2♥转移到黑桃。开叫通常完成转移，即使只有两张。它要求叫出指定花色，不是在询问是否已有配合。"
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
        "The course uses Texas with game-only values (roughly 10–12) or with enough strength to insist on a slam investigation (roughly 16+). With intermediate slam interest, use Jacoby first, then jump to 4 of the major: a different message from Texas then Pass. Evaluate controls and fit, not points alone.",
        "本课德克萨斯用于只想成局的实力，约10–12点，或足以坚持探索满贯的强牌，约16点以上。介于两者的满贯兴趣，可先雅各比转移再跳到高花4阶，与德克萨斯后Pass传达不同信息。还要评估控制与配合，不能只数点。"
      ],
      [
        "Texas may remain available after some low-level interference, but only while the agreed transfer calls still exist. After high interference, or without six cards, do not blindly use it. After completing Texas, a later 4NT in an agreed major fit is a keycard inquiry in this course.",
        "某些低阶干扰后仍可保留德克萨斯，但必须还有约定叫品的空间。高阶干扰后，或没有六张时，不能机械使用。德克萨斯完成后，高花配合已定，本课后续4NT按关键张问叫处理。"
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
      "Use the course’s Bergen agreement to distinguish support length and strength.",
      "按本课伯根约定，区分支持长度与点力。"
    ],
    "notes": [
      [
        "Advanced agreement change: the basic part used natural 3M as an invitation. From this lesson, Bergen uses direct 3M as weak and artificial 3♦ as the four-card limit raise. Do not combine these two meanings in the same auction.",
        "进阶约定切换：基础篇的自然3高花是邀请。从本课开始，伯根把直接3高花改为弱牌，用人工3♦表示四张限制性邀局。两种含义不能在同一套约定里混用。"
      ],
      [
        "After an uncontested major opening by an unpassed responder, our simple raise to 2M shows exactly three-card support and 6–9 points. With four or more, use Bergen: 3♣ = 7–9 constructive; 3♦ = 10–12 limit raise; direct 3M = weak, about 0–6. These artificial minor bids promise support, not that minor.",
        "无干扰、应叫者未Pass过时，本课简单加到2高花表示恰好三张支持、6–9点。四张以上用伯根：3♣为7–9点建设性支持；3♦为10–12点限制性邀局；直接3高花为弱牌，约0–6点。这些人工低花叫品表示高花支持，不是低花长套。"
      ],
      [
        "After constructive 3♣, opener’s minimum signs off in 3M, while a suitable 16+ hand considers 4M. After limit 3♦, 12–13 usually declines in 3M and a suitable 14+ accepts. These are teaching ranges: shortness, texture and vulnerability still matter. Nine trumps give room to compete, not a guarantee of safety.",
        "3♣建设性支持后，开叫低限以3高花止叫，合适的16点以上考虑4高花。3♦限制性邀局后，12–13点通常以3高花拒绝，合适的14点以上接受。这些是教学范围，仍要看短套、牌质和局况。九张将牌提供竞争空间，不保证绝对安全。"
      ],
      [
        "Bergen is an agreement for a specific auction. If the opponents double or overcall, use the later competitive methods; do not assume a jump minor still has the Bergen meaning.",
        "伯根只适用于约定进程。对手加倍或争叫后，要切换到后面的竞争处理，不能假定跳叫低花仍是伯根。"
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
      "Jacoby, Splinters and Semi-Forcing 1NT",
      "雅各比、斯普林特与半逼叫1NT"
    ],
    "source": "Class8-major",
    "focus": [
      "Choose a support route by strength, length and shortness; keep 1NT semi-forcing.",
      "按实力、支持张数和短套选路线，1NT按半逼叫处理。"
    ],
    "notes": [
      [
        "Jacoby 2NT after a major opening is game forcing with 13+ and four-card support. Opener’s three-level new suit shows shortness. Without shortness, the course uses 4M for 12–13, 3NT for 14–15, and 3M for 16+ with slam interest. These ranges are our agreement, not a universal version.",
        "高花开叫后的雅各比2NT：13点以上、四张支持，逼局。开叫三阶新花表示单缺。无短套时，本课约定4高花为12–13点，3NT为14–15点，3高花为16点以上并有满贯兴趣。这是本课程约定，不是所有体系都一样。"
      ],
      [
        "A splinter shows game-going support, four+ trumps, about 12–15 points, and a singleton or void in the jumped suit. Revalue working honors outside the short suit. A double jump has this artificial meaning; a natural jump shift is different. Mini-splinters require a separate agreement and are not silently assigned the same meaning.",
        "斯普林特表示成局支持、四张以上将牌、约12–15点，以及所跳花色的单缺。重新评估短套之外的有效大牌。双跳新花有这种人工含义，与自然跳新花不同；迷你斯普林特需要另行约定，不能默认为同一叫法。"
      ],
      [
        "Our 1M–1NT is SEMI-forcing, about 5–12. A flat minimum 12–13 with 5-3-3-2 may pass; an unbalanced opener continues. The 14-point boundary needs judgement, not an invented absolute rule. With three-card support and 10–12, start 1NT and, if opener rebids, jump to 3M as an invitation. Direct 3M is weak Bergen, not that limit raise.",
        "本课1高花—1NT是半逼叫，约5–12点。12–13点、5-3-3-2的平弱低限可以Pass；非均型开叫继续。14点边界结合牌质判断，不凭空设绝对规则。三张支持、10–12点时先1NT，开叫再叫后跳3高花邀局。直接3高花是伯根弱牌，不是这种限制性邀局。"
      ]
    ],
    "rows": [
      [
        [
          "Jacoby 2NT",
          "雅各比2NT"
        ],
        [
          "13+, four-card support, GF",
          "13点以上、四张支持，逼局"
        ]
      ],
      [
        [
          "Splinter",
          "斯普林特"
        ],
        [
          "Four+ support, shortness, game strength",
          "四张以上支持、单缺、成局实力"
        ]
      ],
      [
        [
          "1M–1NT",
          "1高花—1NT"
        ],
        [
          "5–12, semi-forcing; flat minimum may pass",
          "5–12点、半逼叫；平弱低限可Pass"
        ]
      ],
      [
        [
          "1NT then 3M",
          "1NT后跳3高花"
        ],
        [
          "10–12, exactly three-card support, invite",
          "10–12点、恰好三张支持，邀请"
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
          "15 points, five spades and an unbalanced hand.",
          "15点、五张黑桃、非均型。"
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
        "bid": "1NT",
        "note": [
          "Semi-forcing 1NT: 11 and three spades, preparing a limit raise.",
          "半逼叫1NT：11点、三张黑桃，准备限制性邀局。"
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
        "bid": "2C",
        "note": [
          "Unbalanced: describe your four clubs.",
          "非均型，说明四张梅花。"
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
          "Jump back: exactly three spades, 10–12, invitational.",
          "跳回：恰好三张黑桃、10–12点，邀请。"
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
          "15 with useful shape: accept.",
          "15点且牌型有用，接受。"
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
        "JS",
        "8S",
        "QS",
        "6S",
        "AS",
        "3H",
        "KD",
        "7D",
        "9D",
        "KC",
        "4C",
        "QC",
        "9C"
      ],
      "N": [
        "7S",
        "KS",
        "5S",
        "QH",
        "8H",
        "TH",
        "6D",
        "3D",
        "JD",
        "2D",
        "AC",
        "5C",
        "JC"
      ],
      "E": [
        "8C",
        "6H",
        "TS",
        "TC",
        "4S",
        "4H",
        "AD",
        "4D",
        "3C",
        "7H",
        "8D",
        "3S",
        "5D"
      ],
      "W": [
        "5H",
        "7C",
        "AH",
        "JH",
        "KH",
        "2H",
        "QD",
        "9H",
        "6C",
        "TD",
        "2C",
        "9S",
        "2S"
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
        "hcp": 4,
        "shape": [
          3,
          3,
          4,
          3
        ]
      },
      "W": {
        "hcp": 10,
        "shape": [
          2,
          6,
          2,
          3
        ]
      }
    }
  },
  {
    "id": "opener-rebids",
    "title": [
      "Describe Your Hand Again",
      "再次描述你的手牌"
    ],
    "source": "Class10",
    "focus": [
      "Opener’s second bid narrows strength and shape; response context matters.",
      "开叫者第二次叫牌缩小实力与牌型范围，含义取决于应叫背景。"
    ],
    "notes": [
      [
        "The course groups suit openings broadly as minimum 12–15, medium 16–18 and maximum 19–21. After a one-over-one response, a minimum can support with four, rebid a long suit or show a cheap second suit. These are non-forcing descriptive rebids, not game commitments.",
        "本课把花色开叫大致分为低限12–15、中限16–18、高限19–21。一盖一应叫后，低限可凭四张支持加叫，再叫长套，或经济地报第二套。这些是非逼叫的描述性再叫，不等于承诺成局。"
      ],
      [
        "Because a balanced 15–17 opens 1NT, a normal balanced 1NT rebid after opening a minor is 12–14. A jump to 2NT usually shows 18–19 balanced. Do not teach 15 as both a routine 1NT opening and a routine minimum 1NT rebid, or call a singleton a balanced hand.",
        "15–17均型已经开1NT，因此低花开叫后正常的均型1NT再叫是12–14点；跳2NT通常18–19均型。不能把15点同时当常规1NT开叫与低限1NT再叫，也不能把单张直接称为均型。"
      ],
      [
        "A jump raise with a fit or jump rebid of a strong long suit shows extra values and invites. A jump SHIFT in a new suit is much stronger and game forcing. With a minimum response, do not pass a forcing new-suit jump just because you prefer the first suit.",
        "有配合的跳加叫、强长套的跳再叫表示额外实力并邀局；跳叫新花则更强并逼局。即使应叫低限，也不能因偏好第一套而Pass逼叫性跳新花。"
      ],
      [
        "Beginner rule: compare natural bids that describe the same suit or hand type. A simple rebid is usually minimum; a jump in your own suit invites; a jump in a new suit forces to game. Higher commitments need greater strength. An artificial bid or an already game-forcing auction must be read in its own context.",
        "入门规律：比较描述同一花色或同类牌型的自然叫品。简单再叫通常低限，跳再叫原花邀局，跳新花逼局。承诺越高，需要实力越强。人工叫品与已逼局进程，要按各自背景解读。"
      ]
    ],
    "rows": [
      [
        [
          "Minimum / medium / maximum",
          "低限／中限／高限"
        ],
        [
          "12–15 / 16–18 / 19–21 broad groups",
          "12–15／16–18／19–21大致分组"
        ]
      ],
      [
        [
          "1NT rebid / 2NT jump",
          "1NT再叫／跳2NT"
        ],
        [
          "12–14 / 18–19 balanced",
          "12–14／18–19均型"
        ]
      ],
      [
        [
          "Jump in own suit",
          "跳再叫原花"
        ],
        [
          "Extra strength, invitational",
          "额外实力，邀请"
        ]
      ],
      [
        [
          "Jump in a new suit",
          "跳新花"
        ],
        [
          "Game forcing",
          "逼局"
        ]
      ]
    ],
    "specs": {
      "S": [
        14,
        [
          2,
          3,
          5,
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
        "seat": "S",
        "bid": "1D",
        "note": [
          "14, five diamonds: open 1♦.",
          "14点、五张方块，开1♦。"
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
          "Four spades, 8 points: one-round force.",
          "四张黑桃、8点，逼叫一轮。"
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
          "No four-card spade fit; 14 balanced, rebid 1NT.",
          "无四张黑桃支持，14点均型，再叫1NT。"
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
          "8 opposite 12–14 is short of game: pass.",
          "8点面对12–14点，不够成局，不叫。"
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
      1,
      "NT",
      "S"
    ],
    "fixed": null,
    "needs": {},
    "hands": {
      "S": [
        "KS",
        "2S",
        "AH",
        "8H",
        "QH",
        "AD",
        "JD",
        "5D",
        "2D",
        "7D",
        "TC",
        "6C",
        "5C"
      ],
      "N": [
        "JS",
        "TS",
        "7S",
        "8S",
        "9H",
        "KH",
        "3H",
        "9D",
        "QD",
        "TD",
        "QC",
        "2C",
        "7C"
      ],
      "E": [
        "4H",
        "TH",
        "4D",
        "2H",
        "6S",
        "5S",
        "8C",
        "KC",
        "6H",
        "9S",
        "7H",
        "AC",
        "AS"
      ],
      "W": [
        "6D",
        "9C",
        "KD",
        "4S",
        "3S",
        "8D",
        "3C",
        "JC",
        "JH",
        "QS",
        "3D",
        "5H",
        "4C"
      ]
    },
    "facts": {
      "S": {
        "hcp": 14,
        "shape": [
          2,
          3,
          5,
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
      "E": {
        "hcp": 11,
        "shape": [
          4,
          5,
          1,
          3
        ]
      },
      "W": {
        "hcp": 7,
        "shape": [
          3,
          2,
          4,
          4
        ]
      }
    }
  },
  {
    "id": "reverse-bids",
    "title": [
      "Simple Rebids and Reverses",
      "顺叫与逆叫"
    ],
    "source": "Class10",
    "focus": [
      "A reverse spends bidding space; outside a game force it needs extra strength.",
      "逆叫消耗叫牌空间，未逼局时需要额外实力。"
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
        "A simple second-suit rebid can be made with minimum strength because partner can return cheaply. A reverse after a one-over-one response requires about 17+ and forces a reply. A jump shift shows still more strength and forces game. Once a two-over-one game force is established, a low descriptive bid is not a weak sign-off.",
        "顺叫第二套时，搭档可以经济地回第一套，因此低限也能叫。一盖一后的逆叫约需17点以上，并逼搭档回应。跳新花表示更强实力并逼局。二盖一已逼局后，低阶描述牌型不是弱牌止叫。"
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
          "Minimum preference for diamonds, a required reply.",
          "低限偏好方块，完成必要回应。"
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
        "The course uses 8–16 and a good five-card suit for a one-level overcall; a non-jump two-level overcall usually needs about 11–16 and an especially sound suit. Stronger suit hands around 17+ may double first then name the suit. A jump overcall is weak and preemptive.",
        "本课一阶争叫用8–16点与好五张套；二阶不跳争叫通常约11–16点，套质要求更严。约17点以上的强花色牌可先加倍再报花色，跳争叫是弱牌阻击。"
      ],
      [
        "A direct 1NT overcall is 15–18 balanced with a stopper in the opened suit. Systems are on here: Stayman and transfers. A stopper such as A, Kx or Qxx slows the opponents, but is not a guarantee against every layout.",
        "直接争叫1NT是15–18均型，且开叫花色有止张。这里体系开启，可用斯台曼与转移。A、Kx、Qxx等可减缓对手攻击，但并不保证对每种分布都绝对安全。"
      ],
      [
        "We use non-forcing constructive advances: a simple new suit is normally natural, constructive and non-forcing; cue-bidding the enemy suit is the main forcing strength-showing tool. Simple raises show 6–10 with support; jump raises are preemptive with extra trumps. A cue-bid can show good 10+ with a fit or 14+ without one.",
        "本课采用非逼叫建设性进叫：简单新花通常自然、有建设性但不逼叫；扣叫对方花色是主要的逼叫示强工具。简单加叫6–10点并有支持；跳加叫凭额外将牌阻击。扣叫可表示好10点以上有配合，或14点以上无配合。"
      ],
      [
        "NT advances require stoppers: roughly 9–12 for 1NT, 13–15 for a jump 2NT. Against a two-level overcall, a non-jump 2NT can instead be roughly 9–12. Always read the auction. Vulnerable undertricks cost more: undoubled 50 versus 100 each; doubled down two is 300 nonvulnerable versus 500 vulnerable.",
        "无将进叫必须考虑止张：1NT约9–12点，跳2NT约13–15点；面对二阶争叫，不跳2NT则可约9–12点。一定结合进程。宕墩有局更贵：未加倍每墩50与100；加倍宕二无局300、有局500。"
      ],
      [
        "Scoring review: a partscore bonus is 50 once, not per trick. Game bonus is 300 nonvulnerable or 500 vulnerable; small-slam bonus adds 500 or 750, grand adds 1000 or 1500. For example 3NT exactly is 400 or 600; 6NT exactly is 990 or 1440. Do not add the partscore bonus to game.",
        "计分复习：部分定约奖分50只加一次，不是每墩50。成局奖分无局300、有局500；小满贯额外500或750，大满贯额外1000或1500。例如3NT正好400或600，6NT正好990或1440。成局不能再叠加部分定约奖分。"
      ],
      [
        "Advanced preempts: a weak two opening normally has 6–10 points and six diamonds, hearts or spades; 3♣ is the first weak club opening because 2♣ is strong, around 22+ or equivalent playing strength. A weak opening and a jump overcall are different auction situations, even when both obstruct the opponents.",
        "进阶阻击：弱二开叫通常6–10点，六张方块、红桃或黑桃；梅花弱开叫从3♣开始，因为2♣是强开叫，约22点以上或等同赢墩实力。弱开叫与跳争叫属于不同进程，即使都有阻碍对方的作用。"
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
        "A normal takeout double shows about 12+, shortness (usually 0–2) in their suit and three+ in every unbid suit, ideally four in unbid majors. After opponents show two suits, support both remaining suits. With length and strength in their suit, do not make a takeout double merely to seek penalties.",
        "普通技术性加倍约12点以上，对方花色短，通常0–2张，所有未叫花色至少三张，未叫高花最好四张。对手已报两套时，支持余下两套。对方花色又长又强时，不能只为惩罚而误用技术性加倍。"
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
        "Our strong free-bid method makes a natural new suit forcing for a round when strong enough. A weaker long suit can start with a negative double and later name its suit non-forcing. Other negative-double uses include two unbid suits or a balanced hand without a stopper; the exact major-length message is tied to the auction.",
        "本课采用强自由应叫：达到条件的自然新花逼叫一轮。较弱的长套可先负加倍，之后报花色作为非逼叫。其他负加倍用途包括未叫双套或无止张的均型；高花恰好四张的信息必须结合具体进程。"
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
        "After 1M–(X), our course switches Bergen and semi-forcing 1NT off. 1NT becomes a good raise: about 9–11 with three trumps or 7–10 with four. 2NT shows a limit raise or better with four+ support, about 11+ total points; direct raises can be weaker and preemptive.",
        "1高花—（X）后，本课关闭伯根与半逼叫1NT。1NT改为好支持：三张将牌约9–11点，四张将牌约7–10点。2NT表示四张以上支持、限制性邀局或更强，约11点以上总点；直接加叫则可以更弱、带阻击性。"
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
      "Two over One and Fourth-Suit Forcing",
      "二盖一与第四花色逼叫"
    ],
    "source": "Class14",
    "focus": [
      "Once game is forced, bid slowly to find the best strain rather than treating every low bid as weak.",
      "逼局建立后，慢叫寻找最佳定约，不能把每个低叫都当弱牌。"
    ],
    "notes": [
      [
        "The latest course agreement uses 13+ for an unpassed, uncontested cheapest two-over-one response: 1♠–2♣/2♦/2♥, 1♥–2♣/2♦, and 1♦–2♣. 1♠–2♥ promises five hearts. Other two-over-one suits can occasionally have three, though normally four or more. Passed hands and competition need their own rules.",
        "按最新课件，未Pass过、无干扰的最经济二盖一应叫用13点以上：1♠—2♣／2♦／2♥，1♥—2♣／2♦，1♦—2♣。1♠—2♥保证五张红桃，其余二盖一花色偶可三张，通常四张以上。已Pass过或有竞争时另按约定。"
      ],
      [
        "After three natural suits, the fourth suit is an artificial forcing inquiry in our course, often looking for three-card support or a NT stopper. Example: 1♥–1♠–2♣–2♦. It need not promise diamonds. Our fourth-suit treatment commits to game; the one-level 1♣–1♦–1♥–1♠ case is explicitly artificial here and must be agreed, since other pairs play it naturally.",
        "三门花色自然报过后，第四花色在本课是人工逼叫询问，常为寻找三张支持或无将止张。例如1♥—1♠—2♣—2♦，不必保证方块。本课第四花色按逼局处理；一阶1♣—1♦—1♥—1♠在这里也明确约定人工，其他搭档可能按自然，不能混用。"
      ],
      [
        "Without a GF, returning to partner’s suit at 2 is usually a preference to play; 2NT or a jump in a known suit invites. Within a GF, the same economical support may keep slam exploration alive. Fast arrival to the agreed game says minimum GF strength and no slam interest; slow support keeps room for more information.",
        "未逼局时，二阶回搭档花色通常是选择止叫；2NT或已叫花色的跳叫可邀局。已逼局时，经济支持则可继续探索满贯。快到已定高花成局表示逼局低限、无满贯兴趣；慢支持保留更多交流空间。"
      ]
    ],
    "rows": [
      [
        [
          "2/1 GF",
          "二盖一逼局"
        ],
        [
          "13+, unpassed, uncontested in our agreement",
          "本课13点以上、未Pass过、无干扰"
        ]
      ],
      [
        [
          "Fourth suit",
          "第四花色"
        ],
        [
          "Artificial inquiry, GF by agreement",
          "人工询问，按本课约定逼局"
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
          "Three-card support, slow arrival in a GF auction.",
          "三张支持，在逼局中慢到。"
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
          "Minimum with no slam interest: fast arrival to game.",
          "低限且无满贯兴趣，快到成局。"
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
        "With a fit agreed and game forced, a control bid shows an ace, king, singleton or void in a side suit. Show the cheapest control; skipping an available control suit denies it under our agreement. If neither hand controls a side suit, stop in game rather than asking keycards and discovering the problem too late.",
        "配合已定、已逼局时，控制扣叫表示边花A、K、单张或缺门。本课从最经济控制叫起，越过可叫花色表示没有该控制。双方都缺某边花控制，应停成局，而不是先问关键张再发现来不及。"
      ],
      [
        "With a trump suit agreed, 4NT asks for five keycards: four aces plus the trump king. Our 1430 replies are 5♣ = 1 or 4; 5♦ = 0 or 3; 5♥ = 2 without the trump queen; 5♠ = 2 with it. Use strength and auction context to resolve the alternatives.",
        "将牌花色已定时，4NT询问五张关键张：四个A加将牌K。本课1430回答：5♣为1或4；5♦为0或3；5♥为2且无将牌Q；5♠为2且有将牌Q。结合实力与进程判定是哪一档。"
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
        "Now use the course’s distributional slam: South has no spades, six hearts and five diamonds; North has 17 points and three hearts. South’s 3♠ is a void control, not a natural spade suit. After showing controls, North can ask keycards; South’s two keycards and trump queen allow 6♥. Points guide you, while controls, length and entries decide whether the slam is sound.",
        "现在用课件的牌型满贯：南家黑桃缺门、六张红桃五张方块，北家17点、三张红桃。南家3♠表示缺门控制，不是自然黑桃套。双方报控制后，北家问关键张；南家两张关键张加将牌Q，支持叫到6♥。点数是参考，控制、长度与进手共同决定满贯是否合理。"
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
          "Spade void: show the control and slam interest.",
          "黑桃缺门，表示控制与满贯兴趣。"
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
        "Without interference, an unpassed responder’s cheapest two-level new suit over a one-level suit opening shows 13+ and forces to game. Our basic examples use at least four cards in the new suit; 1♠–2♥ requires five hearts.",
        "无干扰、应叫者未Pass过时，对一阶花色开叫作最经济二阶新花应叫，表示13点以上并逼局。基础例子新花至少四张，1♠—2♥需要五张红桃。"
      ],
      [
        "One-over-one only asks opener to bid once more. Two-over-one says neither partner may stop below game. Start by showing a second suit or supporting partner; the information chooses which game, not whether game is required.",
        "一盖一只要求开叫者再说一轮，二盖一则要求双方不能停在成局以下。接着可报第二套或支持搭档，用这些信息选择打哪一种成局，而不是重新讨论是否必须成局。"
      ],
      [
        "After 1♥–2♣–2♦–2♥, hearts are agreed and game is already forced. The low 2♥ keeps the description economical; it is not a weak stop. With a minimum opener and no further reason to continue, choose 4♥. Complex slam methods belong to the advanced part.",
        "1♥—2♣—2♦—2♥后，红桃配合已定，而且已经逼局。低阶2♥是经济描述，不是弱牌止叫。开叫低限、没有进一步探索理由时，选择4♥。复杂满贯方法留到进阶篇。"
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
