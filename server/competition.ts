/**
 * competition.ts — duplicate competition: one code, many tables, one set of boards.
 *
 * Boards are shuffled once at creation and dealt identically at every table
 * (digital board exchange). Each table is a regular Room fed by a fixed
 * BoardSource; results aggregate into live matchpoint standings.
 */

import { generateBoards, computeStandings, boardsCompleted } from '../shared/duplicate.js';
import type { StandingEntry } from '../shared/duplicate.js';
import type { BoardRecord, TableResult, CompetitionSummary } from '../shared/events.js';
import type { Room, BoardSource } from './room.js';

export interface CompetitionJSON {
  code: string;
  name: string;
  boards: BoardRecord[];
  tables: Array<{ code: string; results: TableResult[] }>;
  isPublic: boolean;
  closesAt: number | null;
  createdAt: number;
}

export interface CompetitionOptions {
  isPublic?: boolean;
  /** Hours from creation until the competition closes; 0/undefined = no deadline. */
  durationHours?: number;
  /** Epoch ms override (tests / restore). */
  now?: number;
}

export class Competition {
  readonly tables: Room[] = [];
  isPublic: boolean;
  closesAt: number | null;
  createdAt: number;

  constructor(
    readonly code: string,
    readonly name: string,
    readonly boards: BoardRecord[],
    opts: CompetitionOptions = {}
  ) {
    if (boards.length === 0) throw new Error('competition needs at least one board');
    const now = opts.now ?? Date.now();
    this.createdAt = now;
    this.isPublic = opts.isPublic ?? false;
    const hours = opts.durationHours ?? 0;
    this.closesAt = hours > 0 ? now + hours * 3_600_000 : null;
  }

  /** Open for new tables/joins? Closed competitions keep their results. */
  isOpen(now: number = Date.now()): boolean {
    return this.closesAt === null || now < this.closesAt;
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
      isPublic: this.isPublic,
      closesAt: this.closesAt,
      createdAt: this.createdAt,
    };
  }

  /** Public listing row. */
  summary(now: number = Date.now()): CompetitionSummary {
    return {
      code: this.code,
      name: this.name,
      boards: this.boards.length,
      tables: this.tables.length,
      players: this.tables.reduce((n, t) => n + t.playerCount(), 0),
      closesAt: this.closesAt,
      isPublic: this.isPublic,
    };
  }

  static create(
    code: string,
    name: string,
    boardCount: number,
    opts: CompetitionOptions & { rng?: () => number } = {}
  ): Competition {
    const { rng, ...rest } = opts;
    return new Competition(code, name, generateBoards(boardCount, rng ?? Math.random), rest);
  }

  static fromJSON(j: CompetitionJSON): Competition {
    const comp = new Competition(j.code, j.name, j.boards, {
      isPublic: j.isPublic ?? false,
      now: j.createdAt ?? Date.now(),
    });
    comp.closesAt = j.closesAt ?? null;
    if (j.createdAt !== undefined) comp.createdAt = j.createdAt;
    return comp;
  }
}
