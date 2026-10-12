/**
 * competition.ts — duplicate competition: one code, many tables, one set of boards.
 *
 * Boards are shuffled once at creation and dealt identically at every table
 * (digital board exchange). Each table is a regular Room fed by a fixed
 * BoardSource; results aggregate into live matchpoint standings.
 */
import { generateBoards, computeStandings, boardsCompleted } from '../shared/duplicate.js';
export class Competition {
    constructor(code, name, boards, opts = {}) {
        this.code = code;
        this.name = name;
        this.boards = boards;
        this.tables = [];
        if (boards.length === 0)
            throw new Error('competition needs at least one board');
        const now = opts.now ?? Date.now();
        this.createdAt = now;
        this.isPublic = opts.isPublic ?? false;
        const hours = opts.durationHours ?? 0;
        this.closesAt = hours > 0 ? now + hours * 3600000 : null;
    }
    /** Open for new tables/joins? Closed competitions keep their results. */
    isOpen(now = Date.now()) {
        return this.closesAt === null || now < this.closesAt;
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
            isPublic: this.isPublic,
            closesAt: this.closesAt,
            createdAt: this.createdAt,
        };
    }
    /** Public listing row. */
    summary(now = Date.now()) {
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
    static create(code, name, boardCount, opts = {}) {
        const { rng, ...rest } = opts;
        return new Competition(code, name, generateBoards(boardCount, rng ?? Math.random), rest);
    }
    static fromJSON(j) {
        const comp = new Competition(j.code, j.name, j.boards, {
            isPublic: j.isPublic ?? false,
            now: j.createdAt ?? Date.now(),
        });
        comp.closesAt = j.closesAt ?? null;
        if (j.createdAt !== undefined)
            comp.createdAt = j.createdAt;
        return comp;
    }
}
//# sourceMappingURL=competition.js.map