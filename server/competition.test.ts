import { describe, it, expect } from 'vitest';
import { RoomManager } from './manager.js';
import type { SendFn } from './room.js';
import type { GameEvent } from '../shared/events.js';
import type { TableResult } from '../shared/events.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

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

function lastPayload(sent: Map<string, GameEvent[]>, clientId: string, type: string): any {
  const arr = (sent.get(clientId) ?? []).filter(e => e.type === type);
  return arr[arr.length - 1]?.payload;
}

const SEATS = ['N', 'E', 'S', 'W'] as const;

function fillTable(mgr: RoomManager, tableCode: string, tag: string): void {
  SEATS.forEach((s, i) => {
    mgr.handleMessage(
      `${tag}-${s}`,
      JSON.stringify({ action: 'join', name: `${tag}${s}`, characterId: 'cowboy', lang: 'en', roomCode: tableCode }),
      1000 + i
    );
  });
  mgr.handleMessage(`${tag}-N`, JSON.stringify({ action: 'start' }), 2000);
}

function fakeResult(tableId: string, score: number): TableResult {
  return {
    boardNumber: 1,
    tableId,
    auction: [],
    contract: { level: 3, denom: 'NT', doubled: 0, declarer: 'N' },
    declarerTricks: 9,
    score,
  };
}

describe('duplicate competitions', () => {
  it('creates a competition, deals identical boards at two tables, and matchpoints them', () => {
    const { mgr, sent } = setup();

    mgr.handleMessage('org', JSON.stringify({ action: 'create_competition', name: 'Friday Game', boards: 2 }), 1);
    const created = lastPayload(sent, 'org', 'competition_created');
    expect(created.competitionCode).toMatch(/^T[A-Z0-9]{5}$/);
    expect(created.boards).toBe(2);
    const table1 = created.tableCode as string;

    mgr.handleMessage('org', JSON.stringify({ action: 'create_table', competitionCode: created.competitionCode }), 2);
    const table2 = lastPayload(sent, 'org', 'table_created').tableCode as string;
    expect(table2).not.toBe(table1);

    // A spectator follows the competition.
    mgr.handleMessage('fan', JSON.stringify({ action: 'follow_competition', competitionCode: created.competitionCode }), 3);
    const joined = lastPayload(sent, 'fan', 'competition_joined');
    expect(joined.tables).toEqual([table1, table2]);

    // Fill and start both tables.
    fillTable(mgr, table1, 't1');
    fillTable(mgr, table2, 't2');

    const room1 = mgr.getRoom(table1)!;
    const room2 = mgr.getRoom(table2)!;
    expect(room1.phase).toBe('auction');
    expect(room2.phase).toBe('auction');
    // Digital board exchange: identical hands at both tables.
    expect(room1.boardRecords[0]!.hands).toEqual(room2.boardRecords[0]!.hands);
    expect(room1.boardRecords).toHaveLength(1);

    // Record results: t1 scores 400, t2 scores 300 on board 1.
    room1.tableResults.push(fakeResult(room1.tableId, 400));
    room2.tableResults.push(fakeResult(room2.tableId, 300));

    const comp = mgr.getCompetition(created.competitionCode)!;
    mgr.publishStandings(comp);

    const update = lastPayload(sent, 'fan', 'standings_update');
    expect(update.boardsCompleted).toBe(1);
    expect(update.boardsTotal).toBe(2);
    const st = update.standings as Array<{ pairId: string; totalMatchpoints: number }>;
    expect(st[0]!.pairId).toBe(`${room1.tableId}-NS`);
    expect(st[0]!.totalMatchpoints).toBe(2);
    expect(st.find(s => s.pairId === `${room2.tableId}-NS`)!.totalMatchpoints).toBe(0);
    // E-W mirror.
    expect(st.find(s => s.pairId === `${room2.tableId}-EW`)!.totalMatchpoints).toBe(2);
  });

  it('rejects next_board past the final board', () => {
    const { mgr, sent } = setup();
    mgr.handleMessage('org', JSON.stringify({ action: 'create_competition', name: 'One', boards: 1 }), 1);
    const table = lastPayload(sent, 'org', 'competition_created').tableCode as string;
    fillTable(mgr, table, 't1');
    const room = mgr.getRoom(table)!;
    room.phase = 'board_done';
    room.boardNumber = 1;
    mgr.handleMessage('t1-N', JSON.stringify({ action: 'next_board' }), 5000);
    const err = lastPayload(sent, 't1-N', 'error');
    expect(err.code).toBe('no-more-boards');
  });

  it('rejects unknown competition codes', () => {
    const { mgr, sent } = setup();
    mgr.handleMessage('x', JSON.stringify({ action: 'follow_competition', competitionCode: 'TZZZZZ' }), 1);
    expect(lastPayload(sent, 'x', 'error').code).toBe('competition-not-found');
  });

  it('persists and restores competitions with results', () => {
    const { mgr, sent } = setup();
    mgr.handleMessage('org', JSON.stringify({ action: 'create_competition', name: 'Saved', boards: 2 }), 1);
    const created = lastPayload(sent, 'org', 'competition_created');
    const table = created.tableCode as string;
    fillTable(mgr, table, 't1');
    const room = mgr.getRoom(table)!;
    room.tableResults.push(fakeResult(room.tableId, 400));

    const dir = mkdtempSync(join(tmpdir(), 'aib-'));
    try {
      const path = join(dir, 'comps.json');
      mgr.saveCompetitions(path);

      const s2 = setup();
      s2.mgr.loadCompetitions(path);
      const comp = s2.mgr.getCompetition(created.competitionCode)!;
      expect(comp.name).toBe('Saved');
      expect(comp.boards).toHaveLength(2);
      expect(comp.tables).toHaveLength(1);
      expect(comp.allResults()).toHaveLength(1);
      expect(comp.standings()[0]!.totalMatchpoints).toBe(0); // single table → ties → 0? (1 table: beaten 0, tied 0)
      // The table room is joinable again by its code.
      expect(s2.mgr.getRoom(table)!.code).toBe(table);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });
});
