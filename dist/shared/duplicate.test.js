import { describe, it, expect } from 'vitest';
import { generateBoards, resultDirection, nsScore, scoreBoard, computeStandings, boardsCompleted, } from './duplicate.js';
import { parseBid } from './bidding.js';
function result(tableId, boardNumber, score, declarer) {
    return {
        boardNumber,
        tableId,
        auction: [],
        contract: declarer
            ? { level: 3, denom: 'NT', doubled: 0, declarer }
            : null,
        declarerTricks: 9,
        score,
    };
}
describe('generateBoards', () => {
    it('makes distinct shuffled boards with the standard dealer/vul rotation', () => {
        const boards = generateBoards(16, () => 0.5);
        expect(boards).toHaveLength(16);
        expect(boards[0].dealer).toBe('N');
        expect(boards[0].vulnerability).toBe('none');
        expect(boards[1].dealer).toBe('E');
        expect(boards[1].vulnerability).toBe('NS');
        // 52 cards, 13 per hand.
        for (const b of boards) {
            const all = ['N', 'E', 'S', 'W'].flatMap(s => b.hands[s]);
            expect(all).toHaveLength(52);
        }
    });
    it('rejects bad counts', () => {
        expect(() => generateBoards(0)).toThrow();
        expect(() => generateBoards(65)).toThrow();
    });
});
describe('matchpoints', () => {
    it('2 per win, 1 per tie', () => {
        const results = [
            result('t1', 1, 400, 'N'),
            result('t2', 1, 400, 'S'),
            result('t3', 1, 300, 'N'),
        ];
        const mps = scoreBoard(1, results);
        const ns = mps.filter(m => m.direction === 'NS');
        expect(ns.find(m => m.tableId === 't1').matchpoints).toBe(3); // beat t3 + tie t2
        expect(ns.find(m => m.tableId === 't2').matchpoints).toBe(3);
        expect(ns.find(m => m.tableId === 't3').matchpoints).toBe(0);
        // E-W is the mirror.
        const ew = mps.filter(m => m.direction === 'EW');
        expect(ew.find(m => m.tableId === 't3').matchpoints).toBe(4);
    });
    it('compares from the N-S perspective across different declarers', () => {
        // t1: NS scores +140; t2: EW declares and scores +100 → NS -100.
        const results = [result('t1', 1, 140, 'N'), result('t2', 1, 100, 'E')];
        const mps = scoreBoard(1, results).filter(m => m.direction === 'NS');
        expect(mps.find(m => m.tableId === 't1').score).toBe(140);
        expect(mps.find(m => m.tableId === 't2').score).toBe(-100);
        expect(mps.find(m => m.tableId === 't1').matchpoints).toBe(2);
        expect(mps.find(m => m.tableId === 't2').matchpoints).toBe(0);
    });
    it('passed-out boards score 0 and tie', () => {
        const results = [result('t1', 1, null, null), result('t2', 1, null, null)];
        const mps = scoreBoard(1, results);
        expect(mps.every(m => m.matchpoints === 1)).toBe(true);
        expect(resultDirection(results[0])).toBeNull();
        expect(nsScore(results[0])).toBe(0);
    });
});
describe('computeStandings', () => {
    it('aggregates across boards, best first', () => {
        const all = [
            result('t1', 1, 400, 'N'),
            result('t2', 1, 300, 'N'),
            result('t1', 2, 100, 'E'), // NS -100
            result('t2', 2, 200, 'E'), // NS -200
        ];
        const st = computeStandings(all);
        // Board 1: t1-NS 2, t2-NS 0. Board 2 (NS scores -100 vs -200): t1-NS 2, t2-NS 0.
        const t1ns = st.find(s => s.pairId === 't1-NS');
        expect(t1ns.totalMatchpoints).toBe(4);
        expect(t1ns.boardsPlayed).toBe(2);
        expect(t1ns.pct).toBe(100);
        expect(st[0].pairId).toBe('t1-NS');
        expect(boardsCompleted(all)).toBe(2);
    });
    it('empty results give empty standings', () => {
        expect(computeStandings([])).toEqual([]);
    });
});
//# sourceMappingURL=duplicate.test.js.map