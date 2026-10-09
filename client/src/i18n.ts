/** i18n — English + Simplified Chinese. Server events are language-neutral codes; every client renders in its own language. */

export type Lang = 'en' | 'zh';

const en = {
  'app.title': 'All-In Bridge',
  'app.subtitle': 'Full contract bridge. Zero mercy.',
  'app.footer': 'PVP only · No bots · Built for bridge clubs',

  'home.namePh': 'Your name',
  'home.character': 'Pick your fighter',
  'home.createRoom': 'Create Room',
  'home.joinPh': 'Room code',
  'home.join': 'Join',
  'home.tutorial': 'Learn to Play',
  'home.compTitle': 'Duplicate Competition',
  'home.compNamePh': 'Competition name',
  'home.compBoards': 'Boards',
  'home.createComp': 'Create Competition',
  'home.followPh': 'Competition code',
  'home.follow': 'Follow',
  'home.howto': 'One share code = one table. First 4 in play N/E/S/W — everyone else watches.',
  'home.demo': 'Demo build — the tutorial is fully playable offline. Live multiplayer needs the game server (see README).',
  'home.music': 'Music',
  'home.sound': 'Sound',

  'lobby.roomCode': 'Room code',
  'lobby.copied': 'Copied!',
  'lobby.you': 'You',
  'lobby.host': 'Host',
  'lobby.observers': 'Watching',
  'lobby.start': 'Start Game',
  'lobby.waiting': 'Waiting for the host to start…',
  'lobby.need4': 'Need 4 players to start',
  'lobby.leave': 'Leave',
  'lobby.seatEmpty': 'Empty',

  'table.board': 'Board',
  'table.dealer': 'Dealer',
  'table.vulNone': 'None vul',
  'table.vulNS': 'N-S vul',
  'table.vulEW': 'E-W vul',
  'table.vulAll': 'Both vul',
  'table.contract': 'Contract',
  'table.passedOut': 'Passed out',
  'table.yourBid': 'Your bid',
  'table.yourPlay': 'Your play — slam it down!',
  'table.waitingBid': 'waiting to bid…',
  'table.waitingPlay': 'waiting to play…',
  'table.tricks': 'Tricks',
  'table.nextBoard': 'Next Board',
  'table.observerTag': 'Observer — kibitzer view',
  'table.resultTitleWin': 'Contract Made!',
  'table.resultTitleDown': 'Went Down',
  'table.resultScore': 'Score',
  'table.resultTricks': 'Tricks taken',
  'table.resultBy': 'by',
  'table.voice': 'Voice',
  'table.say': 'Say it!',

  'bid.pass': 'Pass',
  'bid.double': 'Double',
  'bid.redouble': 'Redouble',

  'ann.game': 'GAME BID!',
  'ann.slam': 'SLAM BID!!',
  'ann.double': 'DOUBLED!',
  'ann.redouble': 'REDOUBLED!!',
  'ann.victory': 'VICTORY!',
  'ann.defeat': 'DEFEATED',

  'tut.title': 'Bridge Bootcamp',
  'tut.back': 'Back',
  'tut.next': 'Next',
  'tut.tryAgain': 'Not quite — try again!',
  'tut.correct': 'Nice!',
  'tut.lesson': 'Lesson',
  'tut.of': 'of',
  'tut.done': 'Bootcamp complete! Hit the tables.',

  'comp.standings': 'Live Standings',
  'comp.pair': 'Pair',
  'comp.boards': 'Boards',
  'comp.mps': 'Matchpoints',
  'comp.pct': '%',
  'comp.tableCode': 'Table code',
  'comp.share': 'Share this code — every table plays the same boards!',
  'comp.back': 'Back',

  'err.not-your-turn': 'Not your turn.',
  'err.illegal-bid': 'Illegal bid.',
  'err.illegal-play': 'You must follow suit!',
  'err.not-your-card': "That's not your card.",
  'err.room-not-found': 'Room not found. Check the code.',
  'err.need-4-players': 'Need 4 players to start.',
  'err.not-host': 'Only the host can do that.',
  'err.no-more-boards': 'That was the last board!',
  'err.competition-not-found': 'Competition not found.',
  'err.wrong-phase': 'Not now.',
};

const zh: typeof en = {
  'app.title': '全民桥牌',
  'app.subtitle': '完整桥牌规则，火力全开。',
  'app.footer': '纯PVP · 无机器人 · 为桥牌俱乐部打造',

  'home.namePh': '你的名字',
  'home.character': '选择你的角色',
  'home.createRoom': '创建房间',
  'home.joinPh': '房间号',
  'home.join': '加入',
  'home.tutorial': '新手教程',
  'home.compTitle': '复式比赛',
  'home.compNamePh': '比赛名称',
  'home.compBoards': '牌数',
  'home.createComp': '创建比赛',
  'home.followPh': '比赛编号',
  'home.follow': '观战',
  'home.howto': '一个分享码 = 一桌。前4人按 N/E/S/W 入座，其余为观众。',
  'home.demo': '演示版本 —— 新手教程可离线完整游玩。多人对战需要游戏服务器（见 README）。',
  'home.music': '音乐',
  'home.sound': '音效',

  'lobby.roomCode': '房间号',
  'lobby.copied': '已复制！',
  'lobby.you': '你',
  'lobby.host': '房主',
  'lobby.observers': '观战中',
  'lobby.start': '开始游戏',
  'lobby.waiting': '等待房主开始…',
  'lobby.need4': '需要4名玩家才能开始',
  'lobby.leave': '离开',
  'lobby.seatEmpty': '空位',

  'table.board': '第',
  'table.dealer': '庄家',
  'table.vulNone': '无局',
  'table.vulNS': '南北有局',
  'table.vulEW': '东西有局',
  'table.vulAll': '双方有局',
  'table.contract': '定约',
  'table.passedOut': '流局',
  'table.yourBid': '轮到你叫牌',
  'table.yourPlay': '轮到你出牌 — 狠狠砸下去！',
  'table.waitingBid': '等待叫牌…',
  'table.waitingPlay': '等待出牌…',
  'table.tricks': '墩数',
  'table.nextBoard': '下一副',
  'table.observerTag': '观众视角 — 全手牌可见',
  'table.resultTitleWin': '定约达成！',
  'table.resultTitleDown': '宕了',
  'table.resultScore': '得分',
  'table.resultTricks': '赢墩',
  'table.resultBy': '',
  'table.voice': '语音',
  'table.say': '喊出来！',

  'bid.pass': '不叫',
  'bid.double': '加倍',
  'bid.redouble': '再加倍',

  'ann.game': '成局定约！',
  'ann.slam': '大满贯！！',
  'ann.double': '被加倍！',
  'ann.redouble': '再加倍！！',
  'ann.victory': '胜利！',
  'ann.defeat': '失败',

  'tut.title': '桥牌新兵营',
  'tut.back': '返回',
  'tut.next': '继续',
  'tut.tryAgain': '不对哦 — 再试一次！',
  'tut.correct': '漂亮！',
  'tut.lesson': '第',
  'tut.of': '课 / 共',
  'tut.done': '教程完成！去牌桌大杀四方吧。',

  'comp.standings': '实时排名',
  'comp.pair': '组合',
  'comp.boards': '牌数',
  'comp.mps': 'Matchpoints',
  'comp.pct': '%',
  'comp.tableCode': '桌号',
  'comp.share': '分享此编号 — 所有桌打相同的牌！',
  'comp.back': '返回',

  'err.not-your-turn': '还没轮到你。',
  'err.illegal-bid': '非法叫牌。',
  'err.illegal-play': '有花色必须跟！',
  'err.not-your-card': '这不是你的牌。',
  'err.room-not-found': '房间不存在，检查编号。',
  'err.need-4-players': '需要4名玩家才能开始。',
  'err.not-host': '只有房主可以操作。',
  'err.no-more-boards': '已经是最后一副了！',
  'err.competition-not-found': '比赛不存在。',
  'err.wrong-phase': '现在不行。',
};

export type I18nKey = keyof typeof en;

const dicts: Record<Lang, typeof en> = { en, zh };

export function t(lang: Lang, key: I18nKey): string {
  return dicts[lang][key] ?? dicts.en[key] ?? key;
}

/** '3NT' → '3NT'; Bid → localized label. */
export function bidLabelL(lang: Lang, bid: { type: string; level?: number; denom?: string }): string {
  if (bid.type === 'pass') return t(lang, 'bid.pass');
  if (bid.type === 'double') return t(lang, 'bid.double');
  if (bid.type === 'redouble') return t(lang, 'bid.redouble');
  const sym: Record<string, string> = { C: '♣', D: '♦', H: '♥', S: '♠', NT: 'NT' };
  return `${bid.level}${sym[bid.denom!] ?? bid.denom}`;
}

const SEAT_ZH: Record<string, string> = { N: '北', E: '东', S: '南', W: '西' };
export function seatLabel(lang: Lang, seat: string): string {
  return lang === 'zh' ? SEAT_ZH[seat] ?? seat : seat;
}

export function errMsg(lang: Lang, code: string): string {
  const key = `err.${code}` as I18nKey;
  return key in dicts[lang] ? t(lang, key) : code;
}
