/**
 * competition.ts — duplicate competition: one code, many tables, one set of boards.
 *
 * Boards are shuffled once at creation and dealt identically at every table
 * (digital board exchange). Each table is a regular Room fed by a fixed
 * BoardSource; results aggregate into live matchpoint standings.
 */
import type { StandingEntry } from '../shared/duplicate.js';
import type { BoardRecord, TableResult } from '../shared/events.js';
import type { Room, BoardSource } from './room.js';
export interface CompetitionJSON {
    code: string;
    name: string;
    boards: BoardRecord[];
    tables: Array<{
        code: string;
        results: TableResult[];
    }>;
}
export declare class Competition {
    readonly code: string;
    readonly name: string;
    readonly boards: BoardRecord[];
    readonly tables: Room[];
    constructor(code: string, name: string, boards: BoardRecord[]);
    /** BoardSource serving this competition's fixed boards, in order. */
    fixedSource(): BoardSource;
    addTable(room: Room): void;
    allResults(): TableResult[];
    standings(): StandingEntry[];
    boardsCompleted(): number;
    toJSON(): CompetitionJSON;
    static create(code: string, name: string, boardCount: number, rng?: () => number): Competition;
}
//# sourceMappingURL=competition.d.ts.map