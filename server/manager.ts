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
import { Competition } from './competition.js';
import type { CompetitionJSON } from './competition.js';
import { isValidCharacterId } from '../shared/characters.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no confusables

export function makeRoomCode(rng: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(rng() * CODE_CHARS.length)];
  }
  return code;
}

interface QueuedPlayer {
  clientId: string;
  name: string;
  characterId: string;
  lang: 'en' | 'zh';
}

export class RoomManager {
  private rooms = new Map<string, Room>();
  private clientRoom = new Map<string, string>(); // clientId -> room code
  private competitions = new Map<string, Competition>();
  private followers = new Map<string, Set<string>>(); // competition code -> clientIds
  private competitionTables = new Set<string>(); // room codes owned by competitions
  private queue: QueuedPlayer[] = []; // quick-match waiting list (ephemeral)

  constructor(
    private send: SendFn,
    private boardSource?: BoardSource,
    private rng: () => number = Math.random
  ) {}

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  getCompetition(code: string): Competition | undefined {
    return this.competitions.get(code.toUpperCase());
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

    if (
      msg.action === 'create_competition' || msg.action === 'create_table' ||
      msg.action === 'follow_competition' || msg.action === 'list_competitions' ||
      msg.action === 'join_open_table'
    ) {
      this.handleCompetitionAction(clientId, msg, now);
      return;
    }

    if (msg.action === 'quick_match' || msg.action === 'leave_queue') {
      this.handleQueueAction(clientId, msg, now);
      return;
    }

    if (msg.action === 'join') {
      this.dequeue(clientId);
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
    if (code) this.rooms.get(code)?.leave(clientId, now);
    if (this.dequeue(clientId)) this.broadcastQueue();
  }

  /** Remove a client from the quick-match queue. Returns true if they were queued. */
  private dequeue(clientId: string): boolean {
    const i = this.queue.findIndex(q => q.clientId === clientId);
    if (i === -1) return false;
    this.queue.splice(i, 1);
    return true;
  }

  // ------------------------------------------------------------ quick match ---

  private handleQueueAction(
    clientId: string,
    msg: Extract<ClientMessage, { action: 'quick_match' | 'leave_queue' }>,
    now: number
  ): void {
    if (msg.action === 'leave_queue') {
      if (this.dequeue(clientId)) this.broadcastQueue();
      return;
    }
    if (!isValidCharacterId(msg.characterId)) {
      this.send(clientId, makeEvent('error', { code: 'unknown-character' }));
      return;
    }
    this.dequeue(clientId);
    this.queue.push({
      clientId,
      name: msg.name.slice(0, 16),
      characterId: msg.characterId,
      lang: msg.lang,
    });
    this.broadcastQueue();
    this.tryMatch(now);
  }

  private broadcastQueue(): void {
    this.queue.forEach((q, i) => {
      this.send(q.clientId, makeEvent('queue_update', { position: i + 1, waiting: this.queue.length }));
    });
  }

  /** Form tables of 4 from the waiting queue. */
  private tryMatch(now: number): void {
    while (this.queue.length >= 4) {
      const four = this.queue.splice(0, 4);
      let code = makeRoomCode(this.rng);
      while (this.rooms.has(code)) code = makeRoomCode(this.rng);
      const room = new Room(code, this.send, this.boardSource);
      this.rooms.set(code, room);
      for (const q of four) {
        this.clientRoom.set(q.clientId, code);
        try {
          room.join({ action: 'join', name: q.name, characterId: q.characterId, lang: q.lang }, q.clientId, now);
        } catch {
          this.send(q.clientId, makeEvent('error', { code: 'bad-join' }));
        }
      }
    }
    this.broadcastQueue();
  }

  /** Expire dead seats; drop empty non-competition rooms. */
  sweep(now: number): void {
    for (const [code, room] of this.rooms) {
      room.sweep(now);
      if (room.connectedClients().length === 0 && !this.competitionTables.has(code)) {
        this.rooms.delete(code);
      }
    }
  }

  roomCount(): number {
    return this.rooms.size;
  }

  // ------------------------------------------------------- competitions ---

  private makeCompetitionCode(): string {
    let code = 'T' + makeRoomCode(this.rng).slice(0, 5);
    while (this.competitions.has(code)) code = 'T' + makeRoomCode(this.rng).slice(0, 5);
    return code;
  }

  private handleCompetitionAction(
    clientId: string,
    msg: Extract<ClientMessage, {
      action: 'create_competition' | 'create_table' | 'follow_competition' | 'list_competitions' | 'join_open_table'
    }>,
    now: number
  ): void {
    if (msg.action === 'list_competitions') {
      const open = [...this.competitions.values()]
        .filter(c => c.isPublic && c.isOpen(now))
        .map(c => c.summary(now));
      this.send(clientId, makeEvent('competitions_list', { competitions: open }));
      return;
    }
    if (msg.action === 'create_competition') {
      const code = this.makeCompetitionCode();
      const comp = Competition.create(code, msg.name.slice(0, 40), msg.boards, {
        rng: this.rng,
        isPublic: msg.isPublic ?? false,
        durationHours: msg.durationHours ?? 0,
        now,
      });
      this.competitions.set(code, comp);
      this.followers.set(code, new Set());
      const table = this.createTable(comp);
      this.send(clientId, makeEvent('competition_created', {
        competitionCode: code,
        tableCode: table.code,
        boards: comp.boards.length,
      }));
      return;
    }
    const comp = this.competitions.get(msg.competitionCode.toUpperCase());
    if (!comp) {
      this.send(clientId, makeEvent('error', { code: 'competition-not-found' }));
      return;
    }
    if (msg.action === 'join_open_table') {
      if (!comp.isOpen(now)) {
        this.send(clientId, makeEvent('error', { code: 'competition-closed' }));
        return;
      }
      let table = comp.tables.find(t => t.playerCount() < 4);
      if (!table) table = this.createTable(comp);
      this.send(clientId, makeEvent('open_table_found', { competitionCode: comp.code, tableCode: table.code }));
      return;
    }
    if (msg.action === 'create_table') {
      const table = this.createTable(comp);
      this.send(clientId, makeEvent('table_created', { competitionCode: comp.code, tableCode: table.code }));
      return;
    }
    // follow_competition
    this.followers.get(comp.code)!.add(clientId);
    this.send(clientId, makeEvent('competition_joined', {
      competitionCode: comp.code,
      name: comp.name,
      boards: comp.boards.length,
      tables: comp.tables.map(t => t.code),
    }));
    this.sendStandings(clientId, comp);
  }

  private createTable(comp: Competition): Room {
    let code = makeRoomCode(this.rng);
    while (this.rooms.has(code)) code = makeRoomCode(this.rng);
    return this.attachTable(comp, code);
  }

  private attachTable(comp: Competition, code: string): Room {
    const room = new Room(code, this.send, comp.fixedSource(), {
      onBoardComplete: () => this.publishStandings(comp),
    });
    this.rooms.set(code, room);
    comp.addTable(room);
    this.competitionTables.add(code);
    return room;
  }

  private standingsPayload(comp: Competition) {
    return {
      competitionCode: comp.code,
      standings: comp.standings(),
      boardsCompleted: comp.boardsCompleted(),
      boardsTotal: comp.boards.length,
    };
  }

  private sendStandings(clientId: string, comp: Competition): void {
    this.send(clientId, makeEvent('standings_update', this.standingsPayload(comp)));
  }

  /** Broadcast fresh standings to followers and everyone at the tables. */
  publishStandings(comp: Competition): void {
    const event = makeEvent('standings_update', this.standingsPayload(comp));
    for (const fid of this.followers.get(comp.code) ?? []) {
      this.send(fid, event);
    }
    for (const table of comp.tables) {
      for (const cid of table.connectedClients()) {
        this.send(cid, event);
      }
    }
  }

  // ---------------------------------------------------------- persistence ---

  /** Persist all competitions (boards + results) to a JSON file. */
  saveCompetitions(path: string): void {
    const data = [...this.competitions.values()].map(c => c.toJSON());
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(data));
  }

  /** Restore competitions; tables are recreated (empty seats, results kept). */
  loadCompetitions(path: string): void {
    if (!existsSync(path)) return;
    const data = JSON.parse(readFileSync(path, 'utf8')) as CompetitionJSON[];
    for (const j of data) {
      if (this.competitions.has(j.code)) continue;
      const comp = Competition.fromJSON(j);
      this.competitions.set(j.code, comp);
      this.followers.set(j.code, new Set());
      for (const t of j.tables) {
        const room = this.attachTable(comp, t.code);
        room.tableResults.push(...t.results);
      }
    }
  }
}
