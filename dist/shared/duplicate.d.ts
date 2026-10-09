/**
 * duplicate.ts — duplicate-bridge competition scoring.
 *
 * Every board is shuffled once and dealt identically at all tables (the
 * digital board exchange). Each table's result is recorded; pairs are
 * matchpointed per board, N-S against N-S and E-W against E-W:
 * 2 matchpoints per pair beaten, 1 per tie.
 */
import type { BoardRecord, TableResult } from './events.js';
export type Direction = 'NS' | 'EW';
/** Shuffle each board once. The same BoardRecords are dealt at every table. */
export declare function generateBoards(count: number, rng?: () => number): BoardRecord[];
/** Which direction declared (null = passed out). */
export declare function resultDirection(r: TableResult): Direction | null;
/** Score from the N-S perspective (what matchpointing compares). */
export declare function nsScore(r: TableResult): number;
export interface BoardEntryMP {
    boardNumber: number;
    tableId: string;
    direction: Direction;
    /** N-S perspective score (negated for E-W entries). */
    score: number;
    matchpoints: number;
    /** How many tables compared on this board. */
    tablesCompared: number;
}
/**
 * Matchpoint one board across tables. Every table contributes an N-S entry
 * and an E-W entry; each direction is ranked within itself.
 */
export declare function scoreBoard(boardNumber: number, results: TableResult[]): BoardEntryMP[];
export interface StandingEntry {
    /** e.g. "ABC123-NS" — stable within a competition. */
    pairId: string;
    tableId: string;
    direction: Direction;
    boardsPlayed: number;
    totalMatchpoints: number;
    /** Percentage of the maximum possible so far (0..100). */
    pct: number;
}
/** Aggregate per-board matchpoints into live standings, best first. */
export declare function computeStandings(allResults: TableResult[]): StandingEntry[];
/** How many distinct boards have at least one recorded result. */
export declare function boardsCompleted(allResults: TableResult[]): number;
//# sourceMappingURL=duplicate.d.ts.map