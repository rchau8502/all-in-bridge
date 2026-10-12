import { describe, it, expect } from 'vitest';
import { RoomManager, makeRoomCode } from './manager.js';
import type { SendFn } from './room.js';
import type { GameEvent } from '../shared/events.js';

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
});
