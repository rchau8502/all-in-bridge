import type { Step } from './tutorial.js';
const REVIEWS = {
  "deck": [
    [
      "Cards",
      "牌",
      "52 cards, four suits; 13 cards in each hand",
      "52张、四门花色，每手13张"
    ],
    [
      "Ranks",
      "大小",
      "A highest, 2 lowest",
      "A最大，2最小"
    ],
    [
      "Partners",
      "搭档",
      "Opposite seats work together",
      "对面两人互为搭档"
    ]
  ],
  "tricks": [
    [
      "Follow suit",
      "跟牌",
      "Follow the led suit whenever possible",
      "有领出花色必须跟"
    ],
    [
      "Winner",
      "赢墩",
      "Highest led-suit card, unless trump wins",
      "领出花色最大牌赢，除非有将牌"
    ],
    [
      "Next lead",
      "下次领出",
      "The trick winner leads next",
      "赢墩者领下一墩"
    ]
  ],
  "strategy": [
    [
      "Count",
      "计数",
      "Count top winners across both hands",
      "合看两手数顶张赢墩"
    ],
    [
      "Finesse",
      "飞牌",
      "Lead toward a tenace; position matters",
      "朝坎张引牌，注意大牌位置"
    ],
    [
      "Develop",
      "树立",
      "Drive out a higher honor to create winners",
      "顶出较大大牌，创造赢墩"
    ],
    [
      "Entry",
      "进手",
      "Save access to the winners",
      "保留兑现赢墩的通道"
    ]
  ],
  "long-suits": [
    [
      "Length",
      "长套",
      "Count the cards outside your hands",
      "数两手之外的张数"
    ],
    [
      "Develop",
      "树立",
      "A lost trick can establish extra winners",
      "让掉一墩可树立额外赢墩"
    ],
    [
      "Entry",
      "进手",
      "Retain a way to reach the established suit",
      "保留进入树立长套的通道"
    ]
  ],
  "trump": [
    [
      "Trump",
      "将牌",
      "Trump beats a non-trump card",
      "将牌大于非将牌"
    ],
    [
      "Follow suit",
      "跟牌",
      "Ruff only when void in the led suit",
      "领出花色缺门时才能将吃"
    ],
    [
      "Winner",
      "赢墩",
      "Compare trumps first when any were played",
      "有将牌时先比较将牌"
    ]
  ],
  "losers": [
    [
      "Starting hand",
      "起点",
      "Count losers from the long-trump hand",
      "从长将牌一方数输墩"
    ],
    [
      "Dummy",
      "明手",
      "Honors can cover your losers",
      "明手大牌可补输墩"
    ],
    [
      "Budget",
      "预算",
      "4M needs 10 tricks: at most 3 losers",
      "4高花要10墩，最多输3墩"
    ]
  ],
  "eliminate": [
    [
      "Ruff",
      "将吃",
      "Ruff losers in the short-trump hand",
      "在短将牌一方将吃输牌"
    ],
    [
      "Discard",
      "垫牌",
      "Discard losers on established winners",
      "在树立的赢墩上垫输牌"
    ],
    [
      "Ruffing finesse",
      "将吃飞牌",
      "Use honors against a hidden ace when void",
      "空门时用大牌针对藏着的A"
    ],
    [
      "Timing",
      "时机",
      "Do not draw the trumps needed for ruffs too early",
      "需要将吃时不要过早清将牌"
    ]
  ],
  "defense-leads": [
    [
      "Length",
      "长套",
      "Fourth best from suitable length",
      "合适长套首攻第四张"
    ],
    [
      "Sequence",
      "连张",
      "Lead the top of an honor sequence",
      "大牌连张出最大"
    ],
    [
      "Information",
      "信息",
      "Use own hand, auction and dummy, not hidden cards",
      "只用自己手牌、叫牌与明手信息"
    ]
  ],
  "defense-play": [
    [
      "Second / third hand",
      "第二家／第三家",
      "Usually low / high, with context",
      "通常出小／出大，结合局面"
    ],
    [
      "Cover",
      "盖牌",
      "Cover when it can promote a card",
      "盖牌要能提升赢墩"
    ],
    [
      "Cooperate",
      "配合",
      "Avoid wasting two partner winners together",
      "避免两家赢张撞在一起"
    ]
  ],
  "defense-rules": [
    [
      "On lead",
      "领出",
      "Top of a sequence",
      "连张出最大"
    ],
    [
      "Second hand",
      "第二家",
      "Usually low; preserve an honor",
      "通常出小，保留大牌"
    ],
    [
      "Following a sequence",
      "跟连张",
      "Use the cheapest sufficient card",
      "使用足够赢墩的最小牌"
    ]
  ],
  "contract": [
    [
      "Promise",
      "承诺",
      "Level + 6 = required tricks",
      "阶数+6为所需墩数"
    ],
    [
      "Game",
      "成局",
      "About 25 combined points, suitable strain",
      "联手约25点，选择合适定约"
    ],
    [
      "Fit",
      "配合",
      "Eight or more cards between partners",
      "搭档联手八张以上"
    ],
    [
      "Slam",
      "满贯",
      "Small: 32, 12 tricks; grand: up to 36, 13 tricks",
      "小满贯32点、12墩；大满贯可能36点、13墩"
    ]
  ],
  "bidding": [
    [
      "Suit opening",
      "花色开叫",
      "About 12+, major five+, minor three+",
      "约12点以上，高花五张以上、低花三张以上"
    ],
    [
      "1NT opening",
      "1NT开叫",
      "15–17 and balanced",
      "15–17点、均型"
    ],
    [
      "Find a fit",
      "找配合",
      "Five-card openings plus four-card responses find 5–3 and 4–4",
      "五张开叫与四张应叫寻找5–3和4–4"
    ],
    [
      "Minimum",
      "低限",
      "MIN opener opposite a minimum raise: pass",
      "低限开叫面对低限加叫：不叫"
    ]
  ],
  "minor-responses": [
    [
      "Reply",
      "应叫",
      "One-over-one: 6+, four cards, forcing one round",
      "一盖一：6点以上、四张，逼叫一轮"
    ],
    [
      "Support",
      "支持",
      "Opener normally needs four to raise a major response",
      "开叫者通常凭四张加叫高花应叫"
    ],
    [
      "Invitation",
      "邀请",
      "Partner accepts with extra strength",
      "搭档凭额外实力接受"
    ],
    [
      "Game force",
      "逼局",
      "Cannot stop below game, still choose strain",
      "不能停局以下，仍可选择定约"
    ],
    [
      "Dating Model",
      "约会模型",
      "1–8, three spaces, target 9; 6+3 succeeds, 5+3 stops",
      "1–8点、3格、目标9；6+3接受，5+3停下"
    ]
  ],
  "full-hand": [
    [
      "Auction",
      "叫牌",
      "Strength sets level; fit sets strain",
      "实力决定高度，配合决定方向"
    ],
    [
      "Play",
      "打牌",
      "Plan, draw trump, use entries, follow suit",
      "计划、清将牌、进手、跟牌"
    ],
    [
      "Finish",
      "完成",
      "Cash proven winners; claim only certain remaining tricks",
      "兑现已知赢墩，确定余墩才能摊牌"
    ]
  ],
  "conversation": [
    [
      "Opening",
      "开叫",
      "At least five in the major",
      "高花至少五张"
    ],
    [
      "Rebid",
      "再叫",
      "Minimum 2♥ rebid normally shows six in this sequence",
      "本进程低限再叫2♥通常表示六张"
    ],
    [
      "Decision",
      "决策",
      "Use the new range and fit, not repetition alone",
      "根据新范围与配合判断，不为重复而叫"
    ]
  ],
  "scoring": [
    [
      "Trick points",
      "墩分",
      "Major 30; minor 20; NT first 40 then 30",
      "高花30，低花20，无将首墩40之后30"
    ],
    [
      "Game",
      "成局",
      "Contract trick points at least 100",
      "定约墩分至少100"
    ],
    [
      "Bonus",
      "奖分",
      "Partscore 50; nonvulnerable game 300",
      "部分定约50，无局成局300"
    ],
    [
      "Choose",
      "判断",
      "Combine strength and fit to choose game",
      "结合实力与配合选择成局"
    ]
  ],
  "overcall": [
    [
      "Identity",
      "身份",
      "After opponents open, this is an overcall",
      "对手开叫后是争叫"
    ],
    [
      "Suit",
      "花色",
      "Quality and length matter, not points alone",
      "看质量与长度，不只看点数"
    ],
    [
      "Support",
      "支持",
      "Limited raises do not guarantee game strength",
      "有限加叫不保证成局实力"
    ],
    [
      "Risk",
      "风险",
      "Consider level, vulnerability and doubled penalties",
      "考虑阶数、局况与加倍罚分"
    ]
  ]
};
export function lessonReview(id: string, lang: 'en' | 'zh'): Step {
  const rows = REVIEWS[id as keyof typeof REVIEWS];
  if (!rows) throw new Error('missing lesson review: '+id);
  return { kind: 'info', text: lang==='zh' ? '本课回顾' : 'Lesson review', review: {columns:lang==='zh'?['知识点','请记住']:['Key idea','Remember'], rows:rows.map(r=>lang==='zh'?[r[1]!,r[3]!]:[r[0]!,r[2]!])} };
}
