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
});
