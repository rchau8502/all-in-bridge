/**
 * duplicate.ts — duplicate-bridge competition scoring.
 *
 * Every board is shuffled once and dealt identically at all tables (the
 * digital board exchange). Each table's result is recorded; pairs are
 * matchpointed per board, N-S against N-S and E-W against E-W:
 * 2 matchpoints per pair beaten, 1 per tie.
 */
import { buildDeck, shuffle, deal, seatSide } from './deck.js';
import { boardDealerVul } from './bidding.js';
/** Shuffle each board once. The same BoardRecords are dealt at every table. */
export function generateBoards(count, rng = Math.random) {
    if (!Number.isInteger(count) || count < 1 || count > 64) {
        throw new Error('board count must be 1..64');
    }
    const boards = [];
    for (let n = 1; n <= count; n++) {
        const { dealer, vul } = boardDealerVul(n);
        const hands = deal(shuffle(buildDeck(), rng));
        boards.push({ boardNumber: n, dealer, vulnerability: vul, hands });
    }
    return boards;
}
/** Which direction declared (null = passed out). */
export function resultDirection(r) {
    if (!r.contract)
        return null;
    return seatSide(r.contract.declarer);
}
/** Score from the N-S perspective (what matchpointing compares). */
export function nsScore(r) {
    if (r.score === null || r.score === undefined)
        return 0;
    const dir = resultDirection(r);
    return dir === 'EW' ? -r.score : r.score;
}
/**
 * Matchpoint one board across tables. Every table contributes an N-S entry
 * and an E-W entry; each direction is ranked within itself.
 */
export function scoreBoard(boardNumber, results) {
    const entries = [];
    for (const r of results) {
        const s = nsScore(r);
        entries.push({ tableId: r.tableId, direction: 'NS', score: s });
        entries.push({ tableId: r.tableId, direction: 'EW', score: -s });
    }
    const out = [];
    for (const direction of ['NS', 'EW']) {
        const group = entries.filter(e => e.direction === direction);
        for (const e of group) {
            const beaten = group.filter(o => o.score < e.score).length;
            const tied = group.filter(o => o.score === e.score).length - 1; // exclude self
            out.push({
                boardNumber,
                tableId: e.tableId,
                direction,
                score: e.score,
                matchpoints: 2 * beaten + tied,
                tablesCompared: group.length,
            });
        }
    }
    return out;
}
/** Aggregate per-board matchpoints into live standings, best first. */
export function computeStandings(allResults) {
    const byBoard = new Map();
    for (const r of allResults) {
        const arr = byBoard.get(r.boardNumber) ?? [];
        arr.push(r);
        byBoard.set(r.boardNumber, arr);
    }
    const agg = new Map();
    for (const [boardNumber, results] of byBoard) {
        for (const e of scoreBoard(boardNumber, results)) {
            const pairId = `${e.tableId}-${e.direction}`;
            const a = agg.get(pairId) ?? {
                tableId: e.tableId,
                direction: e.direction,
                boardsPlayed: 0,
                totalMatchpoints: 0,
                maxPossible: 0,
            };
            a.boardsPlayed++;
            a.totalMatchpoints += e.matchpoints;
            a.maxPossible += 2 * (e.tablesCompared - 1);
            agg.set(pairId, a);
        }
    }
    const standings = [...agg.entries()].map(([pairId, a]) => ({
        pairId,
        tableId: a.tableId,
        direction: a.direction,
        boardsPlayed: a.boardsPlayed,
        totalMatchpoints: a.totalMatchpoints,
        pct: a.maxPossible > 0 ? Math.round((1000 * a.totalMatchpoints) / a.maxPossible) / 10 : 0,
    }));
    standings.sort((x, y) => y.totalMatchpoints - x.totalMatchpoints || y.pct - x.pct);
    return standings;
}
/** How many distinct boards have at least one recorded result. */
export function boardsCompleted(allResults) {
    return new Set(allResults.map(r => r.boardNumber)).size;
}
//# sourceMappingURL=duplicate.js.map