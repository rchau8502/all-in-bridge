/**
 * stats.ts — per-player aggregates and recent-board history.
 *
 * Keyed by the client's stable player id (sent as `clientId` on join).
 * Persisted to JSON; the manager records one entry per seated player
 * on every completed board.
 */
import type { BoardStatEntry, PlayerStatsData, LeaderboardEntry } from '../shared/events.js';
export declare class StatsRegistry {
    private players;
    record(playerId: string, name: string, entry: BoardStatEntry): void;
    get(playerId: string): PlayerStatsData | undefined;
    /** Top players by average score per board (min 5 boards to qualify). */
    leaderboard(limit?: number, minBoards?: number): LeaderboardEntry[];
    size(): number;
    toJSON(): PlayerStatsData[];
    static fromJSON(data: PlayerStatsData[]): StatsRegistry;
}
//# sourceMappingURL=stats.d.ts.map