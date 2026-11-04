export type Lang = 'en' | 'zh';
export type CourseTrack = 'basic' | 'advanced';
export interface Chapter {
  id: string; track: CourseTrack; title: Record<Lang,string>;
  subtitle: Record<Lang,string>; acblClasses: string; lessonIds: string[];
}
export const ACBL_CHAPTERS: Chapter[] = [
  {
    "id": "ch1",
    "track": "basic",
    "title": {
      "en": "Basics 1: Cards and Play",
      "zh": "基础一：牌与做牌"
    },
    "subtitle": {
      "en": "Suits, tricks, planning and trump",
      "zh": "花色、赢墩、计划与将牌"
    },
    "acblClasses": "Foundations",
    "lessonIds": [
      "deck",
      "tricks",
      "strategy",
      "long-suits",
      "trump"
    ]
  },
  {
    "id": "ch2",
    "track": "basic",
    "title": {
      "en": "Basics 2: Planning and Defense",
      "zh": "基础二：计划与防守"
    },
    "subtitle": {
      "en": "Losers, ruffing, opening leads and cooperation",
      "zh": "输墩、将吃、首攻与配合"
    },
    "acblClasses": "Foundations",
    "lessonIds": [
      "losers",
      "eliminate",
      "defense-leads",
      "defense-play",
      "defense-rules"
    ]
  },
  {
    "id": "ch3",
    "track": "basic",
    "title": {
      "en": "Basics 3: Bidding Is Communication",
      "zh": "基础三：叫牌是沟通"
    },
    "subtitle": {
      "en": "Open, respond, find a fit and judge game",
      "zh": "开叫、应叫、寻找配合与判断成局"
    },
    "acblClasses": "Foundations",
    "lessonIds": [
      "contract",
      "bidding",
      "minor-responses",
      "full-hand"
    ]
  },
  {
    "id": "ch4",
    "track": "basic",
    "title": {
      "en": "Basics 4: Rebidding and Game",
      "zh": "基础四：再叫与成局"
    },
    "subtitle": {
      "en": "Natural rebids, strength, game and a simple overcall",
      "zh": "自然再叫、实力、成局与简单争叫"
    },
    "acblClasses": "Foundations",
    "lessonIds": [
      "conversation",
      "scoring",
      "overcall"
    ]
  },
  {
    "id": "ch5",
    "track": "basic",
    "title": {
      "en": "Basics 5: A Simple Two-over-One System",
      "zh": "基础五：简单二盖一体系"
    },
    "subtitle": {
      "en": "Natural strength, Stayman, transfers, inverted minors and major support",
      "zh": "自然实力、斯台曼、转移、低花反加叫与高花支持"
    },
    "acblClasses": "Foundations",
    "lessonIds": [
      "strength-and-minors",
      "stayman-fit",
      "jacoby-transfers",
      "inverted-minor-raises",
      "major-forcing-raises",
      "opener-rebids",
      "reverse-bids",
      "two-over-one-basics"
    ]
  },
  {
    "id": "ch6",
    "track": "advanced",
    "title": {
      "en": "Advanced 1: Notrump Conventions",
      "zh": "进阶一：无将约定"
    },
    "subtitle": {
      "en": "Smolen and Texas transfers",
      "zh": "斯莫伦与德克萨斯转移"
    },
    "acblClasses": "Advanced agreements",
    "lessonIds": [
      "stayman-smolen",
      "texas-transfers"
    ]
  },
  {
    "id": "ch7",
    "track": "advanced",
    "title": {
      "en": "Advanced 2: Bergen Raises",
      "zh": "进阶二：伯根加叫"
    },
    "subtitle": {
      "en": "Four-card raises and three-card limit-raise routes",
      "zh": "四张支持与三张限制性邀局路线"
    },
    "acblClasses": "Advanced agreements",
    "lessonIds": [
      "bergen-raises"
    ]
  },
  {
    "id": "ch8",
    "track": "advanced",
    "title": {
      "en": "Advanced 3: Competitive Agreements",
      "zh": "进阶三：竞争叫牌约定"
    },
    "subtitle": {
      "en": "Advancing, takeout, negative and support doubles",
      "zh": "争叫后续、技术性加倍、负加倍与支持性加倍"
    },
    "acblClasses": "Advanced agreements",
    "lessonIds": [
      "overcall-strategy",
      "takeout-doubles",
      "negative-doubles",
      "support-and-redoubles"
    ]
  },
  {
    "id": "ch9",
    "track": "advanced",
    "title": {
      "en": "Advanced 4: Forcing Tools and Slams",
      "zh": "进阶四：逼叫工具与满贯"
    },
    "subtitle": {
      "en": "Fourth-suit forcing, checkback, fast/slow arrival, controls and keycards",
      "zh": "第四花色、重询、速缓达、扣叫与关键张"
    },
    "acblClasses": "Advanced agreements",
    "lessonIds": [
      "game-forcing-auctions",
      "two-way-checkback",
      "controls-and-keycards"
    ]
  }
];
export function getChapterForLesson(id: string): Chapter | undefined {
  return ACBL_CHAPTERS.find(ch => ch.lessonIds.includes(id));
}
// The former index-only bookmarks are migrated by identity after reordering.
export const PREVIOUS_LESSON_IDS = ["deck", "tricks", "strategy", "long-suits", "trump", "losers", "eliminate", "defense-leads", "defense-play", "defense-rules", "contract", "bidding", "minor-responses", "full-hand", "conversation", "scoring", "overcall", "strength-and-minors", "stayman-fit", "stayman-smolen", "jacoby-transfers", "texas-transfers", "bergen-raises", "major-forcing-raises", "opener-rebids", "reverse-bids", "overcall-strategy", "takeout-doubles", "negative-doubles", "support-and-redoubles", "game-forcing-auctions", "two-way-checkback", "controls-and-keycards"];
export function savedLessonIndex(savedId: string | null, oldIndex: number): number {
  const order = ACBL_CHAPTERS.flatMap(ch => ch.lessonIds);
  const id = savedId ?? PREVIOUS_LESSON_IDS[oldIndex];
  return Math.max(0, order.indexOf(id ?? ''));
}
