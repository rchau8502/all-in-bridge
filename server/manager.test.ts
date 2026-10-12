import { describe, it, expect } from 'vitest';
import { RoomManager, makeRoomCode } from './manager.js';
import type { SendFn } from './room.js';
import type { GameEvent } from '../shared/events.js';
import { parseBid } from '../shared/bidding.js';
import { nextSeat } from '../shared/deck.js';
import type { Card } from '../shared/deck.js';
import { trickWinner } from '../shared/play.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

function lastPayload(sent: Map<string, GameEvent[]>, clientId: string, type: string): unknown {
  const arr = (sent.get(clientId) ?? []).filter(e => e.type === type);
  return arr[arr.length - 1]?.payload;
}

function setup() {
  const sent = new Map<string, GameEvent[]>();
  const send: SendFn = (clientId, event) => {
    const arr = sent.get(clientId) ?? [];
    arr.push(event);
    sent.set(clientId, arr);
  };
  const mgr = new RoomManager(send);
  return { mgr, sent };
}

const joinMsg = (name: string, roomCode?: string) =>
  JSON.stringify({ action: 'join', name, characterId: 'cowboy', lang: 'en', ...(roomCode ? { roomCode } : {}) });

function lastType(sent: Map<string, GameEvent[]>, clientId: string, type: string): GameEvent | undefined {
  const arr = (sent.get(clientId) ?? []).filter(e => e.type === type);
  return arr[arr.length - 1];
}

describe('RoomManager', () => {
  it('creates a room on join without a code; others join with the code', () => {
    const { mgr, sent } = setup();
    mgr.handleMessage('a', joinMsg('Ann'), 1);
    const joined = lastType(sent, 'a', 'room_joined')!;
    const code = (joined.payload as { roomCode: string; seat: string }).roomCode;
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
    expect((joined.payload as { seat: string }).seat).toBe('N');

    mgr.handleMessage('b', joinMsg('Bob', code), 2);
    expect((lastType(sent, 'b', 'room_joined')!.payload as { seat: string }).seat).toBe('E');
    expect(mgr.roomCount()).toBe(1);
  });

  it('rejects unknown room codes', () => {
    const { mgr, sent } = setup();
    mgr.handleMessage('a', joinMsg('Ann', 'ZZZZZZ'), 1);
    const err = lastType(sent, 'a', 'error')!;
    expect((err.payload as { code: string }).code).toBe('room-not-found');
  });

  it('routes messages to the right room and drops empty rooms on sweep', () => {
    const { mgr, sent } = setup();
    mgr.handleMessage('a', joinMsg('Ann'), 1);
    const code = (lastType(sent, 'a', 'room_joined')!.payload as { roomCode: string }).roomCode;
    mgr.handleMessage('a', JSON.stringify({ action: 'pick_character', characterId: 'robot' }), 2);
    const update = lastType(sent, 'a', 'players_update')!;
    expect((update.payload as { seats: Record<string, { characterId: string } | null> }).seats['N']!.characterId).toBe('robot');

    // Unknown client messaging gets not-in-room.
    mgr.handleMessage('ghost', JSON.stringify({ action: 'start' }), 3);
    expect(((lastType(sent, 'ghost', 'error')!).payload as { code: string }).code).toBe('not-in-room');

    // Disconnect + sweep removes the empty room.
    mgr.handleDisconnect('a', 4);
    mgr.sweep(4 + 61_000);
    expect(mgr.roomCount()).toBe(0);
  });

  it('makeRoomCode produces 6-char codes without confusables', () => {
    for (let i = 0; i < 50; i++) {
      const code = makeRoomCode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
      expect(code).not.toMatch(/[01ILO]/);
    }
  });

  it('quick match forms a table of 4 and seats them N/E/S/W', () => {
    const { mgr, sent } = setup();
    const qm = (id: string, name: string) =>
      mgr.handleMessage(id, JSON.stringify({ action: 'quick_match', name, characterId: 'gamer', lang: 'en' }), 1);
    qm('a', 'Ann'); qm('b', 'Bob'); qm('c', 'Cat');
    // 3 waiting: each got a queue_update with position.
    expect(((lastType(sent, 'c', 'queue_update')!).payload as { position: number }).position).toBe(3);
    expect(lastType(sent, 'a', 'room_joined')).toBeUndefined();
    qm('d', 'Dan');
    // All four got room_joined to the same room with distinct seats.
    const rooms = ['a', 'b', 'c', 'd'].map(id =>
      (lastType(sent, id, 'room_joined')!.payload as { roomCode: string; seat: string }));
    const codes = new Set(rooms.map(r => r.roomCode));
    expect(codes.size).toBe(1);
    expect(new Set(rooms.map(r => r.seat))).toEqual(new Set(['N', 'E', 'S', 'W']));
  });

  it('leave_queue and disconnect remove players from the queue', () => {
    const { mgr, sent } = setup();
    const qm = (id: string) =>
      mgr.handleMessage(id, JSON.stringify({ action: 'quick_match', name: id, characterId: 'gamer', lang: 'en' }), 1);
    qm('a'); qm('b'); qm('c');
    mgr.handleMessage('b', JSON.stringify({ action: 'leave_queue' }), 2);
    expect(((lastType(sent, 'c', 'queue_update')!).payload as { position: number }).position).toBe(2);
    mgr.handleDisconnect('a', 3);
    expect(((lastType(sent, 'c', 'queue_update')!).payload as { position: number }).position).toBe(1);
    // A normal join also dequeues.
    mgr.handleMessage('c', joinMsg('Cat'), 4);
    expect(lastType(sent, 'c', 'room_joined')).toBeDefined();
  });

  it('rejects quick_match with an unknown character', () => {
    const { mgr, sent } = setup();
    mgr.handleMessage('a', JSON.stringify({ action: 'quick_match', name: 'Ann', characterId: 'nope', lang: 'en' }), 1);
    expect(((lastType(sent, 'a', 'error')!).payload as { code: string }).code).toBe('unknown-character');
  });

  it('lists only public, open competitions', () => {
    const { mgr, sent } = setup();
    const mk = (name: string, isPublic: boolean, durationHours: number, now: number) =>
      mgr.handleMessage('host', JSON.stringify({
        action: 'create_competition', name, boards: 4, isPublic, durationHours,
      }), now);
    mk('Public Week', true, 24, 1_000);
    mk('Private Game', false, 0, 1_000);
    mk('Expired Open', true, 1, 1_000); // closes at 1_000 + 3.6M
    mgr.handleMessage('viewer', JSON.stringify({ action: 'list_competitions' }), 2_000);
    const list = (lastType(sent, 'viewer', 'competitions_list')!.payload as {
      competitions: Array<{ code: string; name: string; closesAt: number | null }>;
    }).competitions;
    // Private Game never listed; the other two are still open at t=2_000.
    expect(list.map(c => c.name).sort()).toEqual(['Expired Open', 'Public Week']);
    // After the 1-hour competition expires it disappears, but results survive.
    mgr.handleMessage('viewer', JSON.stringify({ action: 'list_competitions' }), 1_000 + 3_600_000 + 1);
    const later = (lastType(sent, 'viewer', 'competitions_list')!.payload as {
      competitions: Array<{ name: string }>;
    }).competitions;
    expect(later.map(c => c.name)).toEqual(['Public Week']);
  });

  it('join_open_table fills an existing table, then opens a new one', () => {
    const { mgr, sent } = setup();
    mgr.handleMessage('host', JSON.stringify({
      action: 'create_competition', name: 'Open Night', boards: 4, isPublic: true, durationHours: 24,
    }), 1_000);
    const created = lastType(sent, 'host', 'competition_created')!;
    const compCode = (created.payload as { competitionCode: string }).competitionCode;

    const joinTable = (id: string) => {
      mgr.handleMessage(id, JSON.stringify({ action: 'join_open_table', competitionCode: compCode }), 2_000);
      const found = lastType(sent, id, 'open_table_found')!;
      const tableCode = (found.payload as { tableCode: string }).tableCode;
      mgr.handleMessage(id, JSON.stringify({ action: 'join', name: id, characterId: 'cowboy', lang: 'en', roomCode: tableCode }), 2_001);
      return tableCode;
    };
    const t1 = joinTable('p1');
    expect(joinTable('p2')).toBe(t1);
    expect(joinTable('p3')).toBe(t1);
    expect(joinTable('p4')).toBe(t1);
    // Table full → a fresh table is opened.
    expect(joinTable('p5')).not.toBe(t1);
  });

  it('join_open_table rejects unknown and closed competitions', () => {
    const { mgr, sent } = setup();
    mgr.handleMessage('a', JSON.stringify({ action: 'join_open_table', competitionCode: 'TXXXXX' }), 1);
    expect(((lastType(sent, 'a', 'error')!).payload as { code: string }).code).toBe('competition-not-found');

    mgr.handleMessage('host', JSON.stringify({
      action: 'create_competition', name: 'Short', boards: 2, isPublic: true, durationHours: 1,
    }), 1_000);
    const compCode = (lastType(sent, 'host', 'competition_created')!.payload as { competitionCode: string }).competitionCode;
    mgr.handleMessage('b', JSON.stringify({ action: 'join_open_table', competitionCode: compCode }), 1_000 + 3_600_000 + 5);
    expect(((lastType(sent, 'b', 'error')!).payload as { code: string }).code).toBe('competition-closed');
  });

  it('records per-player stats when a board completes', () => {
    const { mgr, sent } = setup();
    const now = 1_000_000;
    const clients = ['a', 'b', 'c', 'd'];
    const pids = ['p1', 'p2', 'p3', 'p4'];
    const seats = ['N', 'E', 'S', 'W'] as const;
    const clientFor = (seat: string) => clients[seats.indexOf(seat as (typeof seats)[number])]!;

    // Quick-match a full table; stable player ids ride along in the join.
    clients.forEach((c, i) => {
      mgr.handleMessage(c, JSON.stringify({
        action: 'quick_match', name: `P${i}`, characterId: 'cowboy', lang: 'en', clientId: pids[i],
      }), now);
    });
    const code = (lastType(sent, 'a', 'room_joined')!.payload as { roomCode: string }).roomCode;
    const room = mgr.getRoom(code)!;

    // 'a' (N) is host: start the game.
    mgr.handleMessage('a', JSON.stringify({ action: 'start' }), now);
    expect(room.phase).toBe('auction');
    const dealer = (lastType(sent, 'a', 'game_start')!.payload as { dealer: (typeof seats)[number] }).dealer;

    // Auction: S bids 1NT on their first turn, everyone else passes.
    let s = dealer;
    let sBid = false;
    for (let i = 0; i < 7 && room.phase === 'auction'; i++) {
      const want = s === 'S' && !sBid;
      if (want) sBid = true;
      mgr.handleMessage(clientFor(s), JSON.stringify({ action: 'bid', bid: parseBid(want ? '1NT' : 'P') }), now);
      s = nextSeat(s);
    }
    expect(room.phase).toBe('play');

    // Play all 13 tricks, following suit mechanically.
    const hands = new Map<string, Card[]>();
    for (const c of clients) {
      const deal = lastType(sent, c, 'deal')!;
      hands.set(c, [...(deal.payload as { yourHand: Card[] }).yourHand]);
    }
    let turn: (typeof seats)[number] = nextSeat('S'); // opening lead: left of declarer
    let trick: Array<{ seat: (typeof seats)[number]; card: Card }> = [];
    let guard = 0;
    while (room.phase !== 'board_done' && guard++ < 60) {
      const cid = clientFor(turn);
      const hand = hands.get(cid)!;
      const led = trick.length ? trick[0]!.card.suit : null;
      const pool = led ? hand.filter(x => x.suit === led) : hand;
      const card = (pool.length ? pool : hand)[0]!;
      mgr.handleMessage(cid, JSON.stringify({ action: 'play', card: { suit: card.suit, rank: card.rank } }), now);
      hand.splice(hand.findIndex(x => x.suit === card.suit && x.rank === card.rank), 1);
      trick.push({ seat: turn, card });
      if (trick.length === 4) {
        turn = trickWinner(trick, null) as (typeof seats)[number];
        trick = [];
      } else {
        turn = nextSeat(turn);
      }
    }
    expect(room.phase).toBe('board_done');

    // Every seated player has exactly one board recorded, N/S and E/W mirrored.
    const statsOf = (cid: string) => {
      mgr.handleMessage(cid, JSON.stringify({ action: 'get_stats' }), now);
      return lastType(sent, cid, 'player_stats')!.payload as {
        found: boolean; stats?: { boards: number; wins: number; recent: Array<{ contract: string | null; declarer: string | null; score: number }> };
      };
    };
    const n = statsOf('a');
    expect(n.found).toBe(true);
    expect(n.stats!.boards).toBe(1);
    expect(n.stats!.recent[0]!.contract).toBe('1NT');
    expect(n.stats!.recent[0]!.declarer).toBe('S');
    const nScore = n.stats!.recent[0]!.score;
    expect(statsOf('c').stats!.recent[0]!.score).toBe(nScore); // partner mirrors
    expect(statsOf('b').stats!.recent[0]!.score).toBe(-nScore); // opponents negate
    expect(statsOf('d').stats!.recent[0]!.score).toBe(-nScore);

    // A stranger with no games gets found=false; nobody qualifies for the leaderboard yet.
    mgr.handleMessage('z', JSON.stringify({ action: 'get_stats' }), now);
    expect((lastType(sent, 'z', 'player_stats')!.payload as { found: boolean }).found).toBe(false);
    mgr.handleMessage('a', JSON.stringify({ action: 'get_leaderboard' }), now);
    expect((lastType(sent, 'a', 'leaderboard')!.payload as { entries: unknown[] }).entries).toEqual([]);
  });

  it('persists player stats across save/load', () => {
    const { mgr, sent } = setup();
    mgr.handleMessage('a', JSON.stringify({
      action: 'join', name: 'Ann', characterId: 'cowboy', lang: 'en', clientId: 'p1',
    }), 1);
    // No boards played: nothing recorded yet.
    const dir = mkdtempSync(join(tmpdir(), 'aib-'));
    try {
      const path = join(dir, 'stats.json');
      mgr.saveStats(path);
      const s2 = setup();
      s2.mgr.loadStats(path);
      s2.mgr.handleMessage('b', JSON.stringify({
        action: 'join', name: 'Ann', characterId: 'cowboy', lang: 'en', clientId: 'p1',
      }), 2);
      s2.mgr.handleMessage('b', JSON.stringify({ action: 'get_stats' }), 3);
      expect((lastPayload(s2.sent, 'b', 'player_stats') as { found: boolean }).found).toBe(false);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });
});
