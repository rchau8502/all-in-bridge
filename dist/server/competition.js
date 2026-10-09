/**
 * competition.ts — duplicate competition: one code, many tables, one set of boards.
 *
 * Boards are shuffled once at creation and dealt identically at every table
 * (digital board exchange). Each table is a regular Room fed by a fixed
 * BoardSource; results aggregate into live matchpoint standings.
 */
import { generateBoards, computeStandings, boardsCompleted } from '../shared/duplicate.js';
export class Competition {
    constructor(code, name, boards) {
        this.code = code;
        this.name = name;
        this.boards = boards;
        this.tables = [];
        if (boards.length === 0)
            throw new Error('competition needs at least one board');
    }
    /** BoardSource serving this competition's fixed boards, in order. */
    fixedSource() {
        const boards = this.boards;
        return {
            totalBoards: boards.length,
            nextBoard(boardNumber) {
                const b = boards[boardNumber - 1];
                if (!b)
                    throw new Error(`board ${boardNumber} not in competition`);
                return { hands: b.hands, dealer: b.dealer, vulnerability: b.vulnerability };
            },
        };
    }
    addTable(room) {
        this.tables.push(room);
    }
    allResults() {
        return this.tables.flatMap(t => t.tableResults);
    }
    standings() {
        return computeStandings(this.allResults());
    }
    boardsCompleted() {
        return boardsCompleted(this.allResults());
    }
    toJSON() {
        return {
            code: this.code,
            name: this.name,
            boards: this.boards,
            tables: this.tables.map(t => ({ code: t.code, results: [...t.tableResults] })),
        };
    }
    static create(code, name, boardCount, rng = Math.random) {
        return new Competition(code, name, generateBoards(boardCount, rng));
    }
}
//# sourceMappingURL=competition.js.map