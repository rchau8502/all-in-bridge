/**
 * manager.ts — rooms by share code, clients by connection.
 *
 * One share code = one room instance. The manager routes inbound messages
 * to the right room and tracks which room each connected client belongs to.
 */

import { Room } from './room.js';
import type { SendFn, BoardSource } from './room.js';
import { parseClientMessage } from './protocol.js';
import type { ClientMessage } from './protocol.js';
import { makeEvent } from '../shared/events.js';

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no confusables

export function makeRoomCode(rng: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(rng() * CODE_CHARS.length)];
  }
  return code;
}

export class RoomManager {
  private rooms = new Map<string, Room>();
  private clientRoom = new Map<string, string>(); // clientId -> room code

  constructor(
    private send: SendFn,
    private boardSource?: BoardSource,
    private rng: () => number = Math.random
  ) {}

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  /** Route one inbound message from a connected client. */
  handleMessage(clientId: string, raw: unknown, now: number): void {
    let msg: ClientMessage;
    try {
      msg = parseClientMessage(raw);
    } catch (e) {
      this.send(clientId, makeEvent('error', { code: (e as Error).message }));
      return;
    }

    if (msg.action === 'join') {
      const wantCode = msg.roomCode?.toUpperCase();
      let room = wantCode ? this.rooms.get(wantCode) : undefined;
      if (wantCode && !room) {
        this.send(clientId, makeEvent('error', { code: 'room-not-found' }));
        return;
      }
      if (!room) {
        let code = makeRoomCode(this.rng);
        while (this.rooms.has(code)) code = makeRoomCode(this.rng);
        room = new Room(code, this.send, this.boardSource);
        this.rooms.set(code, room);
      }
      this.clientRoom.set(clientId, room.code);
      try {
        room.join(msg, clientId, now);
      } catch (e) {
        this.send(clientId, makeEvent('error', { code: 'bad-join' }));
      }
      return;
    }

    const code = this.clientRoom.get(clientId);
    const room = code ? this.rooms.get(code) : undefined;
    if (!room) {
      this.send(clientId, makeEvent('error', { code: 'not-in-room' }));
      return;
    }
    room.handle(clientId, msg, now);
  }

  handleDisconnect(clientId: string, now: number): void {
    const code = this.clientRoom.get(clientId);
    if (!code) return;
    this.rooms.get(code)?.leave(clientId, now);
  }

  /** Expire dead seats; drop empty rooms. */
  sweep(now: number): void {
    for (const [code, room] of this.rooms) {
      room.sweep(now);
      if (room.connectedClients().length === 0) {
        this.rooms.delete(code);
      }
    }
  }

  roomCount(): number {
    return this.rooms.size;
  }
}
