/**
 * competition.ts — duplicate competition: one code, many tables, one set of boards.
 *
 * Boards are shuffled once at creation and dealt identically at every table
 * (digital board exchange). Each table is a regular Room fed by a fixed
 * BoardSource; results aggregate into live matchpoint standings.
 */

import { generateBoards, computeStandings, boardsCompleted } from '../shared/duplicate.js';
import type { StandingEntry } from '../shared/duplicate.js';
import type { BoardRecord, TableResult } from '../shared/events.js';
import type { Room, BoardSource } from './room.js';

export interface CompetitionJSON {
  code: string;
  name: string;
  boards: BoardRecord[];
  tables: Array<{ code: string; results: TableResult[] }>;
}

export class Competition {
  readonly tables: Room[] = [];

  constructor(
    readonly code: string,
    readonly name: string,
    readonly boards: BoardRecord[]
  ) {
    if (boards.length === 0) throw new Error('competition needs at least one board');
  }

  /** BoardSource serving this competition's fixed boards, in order. */
  fixedSource(): BoardSource {
    const boards = this.boards;
    return {
      totalBoards: boards.length,
      nextBoard(boardNumber: number) {
        const b = boards[boardNumber - 1];
        if (!b) throw new Error(`board ${boardNumber} not in competition`);
        return { hands: b.hands, dealer: b.dealer, vulnerability: b.vulnerability };
      },
    };
  }

  addTable(room: Room): void {
    this.tables.push(room);
  }

  allResults(): TableResult[] {
    return this.tables.flatMap(t => t.tableResults);
  }

  standings(): StandingEntry[] {
    return computeStandings(this.allResults());
  }

  boardsCompleted(): number {
    return boardsCompleted(this.allResults());
  }

  toJSON(): CompetitionJSON {
    return {
      code: this.code,
      name: this.name,
      boards: this.boards,
      tables: this.tables.map(t => ({ code: t.code, results: [...t.tableResults] })),
    };
  }

  static create(code: string, name: string, boardCount: number, rng: () => number = Math.random): Competition {
    return new Competition(code, name, generateBoards(boardCount, rng));
  }
}
