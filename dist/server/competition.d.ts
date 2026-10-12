/**
 * competition.ts — duplicate competition: one code, many tables, one set of boards.
 *
 * Boards are shuffled once at creation and dealt identically at every table
 * (digital board exchange). Each table is a regular Room fed by a fixed
 * BoardSource; results aggregate into live matchpoint standings.
 */
import type { StandingEntry } from '../shared/duplicate.js';
import type { BoardRecord, TableResult, CompetitionSummary } from '../shared/events.js';
import type { Room, BoardSource } from './room.js';
export interface CompetitionJSON {
    code: string;
    name: string;
    boards: BoardRecord[];
    tables: Array<{
        code: string;
        results: TableResult[];
    }>;
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
export declare class Competition {
    readonly code: string;
    readonly name: string;
    readonly boards: BoardRecord[];
    readonly tables: Room[];
    isPublic: boolean;
    closesAt: number | null;
    createdAt: number;
    constructor(code: string, name: string, boards: BoardRecord[], opts?: CompetitionOptions);
    /** Open for new tables/joins? Closed competitions keep their results. */
    isOpen(now?: number): boolean;
    /** BoardSource serving this competition's fixed boards, in order. */
    fixedSource(): BoardSource;
    addTable(room: Room): void;
    allResults(): TableResult[];
    standings(): StandingEntry[];
    boardsCompleted(): number;
    toJSON(): CompetitionJSON;
    /** Public listing row. */
    summary(now?: number): CompetitionSummary;
    static create(code: string, name: string, boardCount: number, opts?: CompetitionOptions & {
        rng?: () => number;
    }): Competition;
    static fromJSON(j: CompetitionJSON): Competition;
}
//# sourceMappingURL=competition.d.ts.map