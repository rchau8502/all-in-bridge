import { describe, it, expect } from 'vitest';
import { StatsRegistry } from './stats.js';
function entry(score, overrides = {}) {
    return {
        at: 1000,
        tableCode: 'ABC123',
        competition: null,
        boardNumber: 1,
        contract: '3NT',
        declarer: 'N',
        declarerTricks: 9,
        score,
        won: score > 0,
        ...overrides,
    };
}
describe('StatsRegistry', () => {
    it('aggregates boards, wins, and total score', () => {
        const r = new StatsRegistry();
        r.record('p1', 'Ann', entry(400));
        r.record('p1', 'Ann', entry(-50));
        r.record('p1', 'Ann', entry(0));
        const s = r.get('p1');
        expect(s.boards).toBe(3);
        expect(s.wins).toBe(1);
        expect(s.totalScore).toBe(350);
        expect(s.recent).toHaveLength(3);
        // Most recent first.
        expect(s.recent[0].score).toBe(0);
    });
    it('caps recent history at 20 entries', () => {
        const r = new StatsRegistry();
        for (let i = 0; i < 25; i++)
            r.record('p1', 'Ann', entry(10, { boardNumber: i + 1 }));
        const s = r.get('p1');
        expect(s.boards).toBe(25);
        expect(s.recent).toHaveLength(20);
        expect(s.recent[0].boardNumber).toBe(25);
    });
    it('updates the display name on later records', () => {
        const r = new StatsRegistry();
        r.record('p1', 'Ann', entry(10));
        r.record('p1', 'Annie', entry(10));
        expect(r.get('p1').name).toBe('Annie');
    });
    it('returns undefined for unknown players', () => {
        expect(new StatsRegistry().get('nobody')).toBeUndefined();
    });
    it('leaderboard ranks by avg score and requires 5 boards', () => {
        const r = new StatsRegistry();
        for (let i = 0; i < 6; i++)
            r.record('p1', 'Ann', entry(100)); // avg 100
        for (let i = 0; i < 6; i++)
            r.record('p2', 'Bob', entry(300)); // avg 300
        for (let i = 0; i < 3; i++)
            r.record('p3', 'Cat', entry(1000)); // too few boards
        const lb = r.leaderboard();
        expect(lb.map(e => e.name)).toEqual(['Bob', 'Ann']);
        expect(lb[0].avgScore).toBe(300);
        expect(lb[0].winRate).toBe(100);
    });
    it('round-trips through JSON and skips bad entries', () => {
        const r = new StatsRegistry();
        r.record('p1', 'Ann', entry(400, { competition: 'Friday' }));
        const json = r.toJSON();
        const r2 = StatsRegistry.fromJSON([...json, null, { playerId: 42 }]);
        expect(r2.size()).toBe(1);
        const s = r2.get('p1');
        expect(s.totalScore).toBe(400);
        expect(s.recent[0].competition).toBe('Friday');
    });
});
//# sourceMappingURL=stats.test.js.map