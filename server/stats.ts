/**
 * stats.ts — per-player aggregates and recent-board history.
 *
 * Keyed by the client's stable player id (sent as `clientId` on join).
 * Persisted to JSON; the manager records one entry per seated player
 * on every completed board.
 */

import type { BoardStatEntry, PlayerStatsData, LeaderboardEntry } from '../shared/events.js';

const MAX_RECENT = 20;
const MAX_PLAYERS = 5000;

interface MutableStats {
  playerId: string;
  name: string;
  boards: number;
  wins: number;
  totalScore: number;
  recent: BoardStatEntry[];
}

export class StatsRegistry {
  private players = new Map<string, MutableStats>();

  record(playerId: string, name: string, entry: BoardStatEntry): void {
    let s = this.players.get(playerId);
    if (!s) {
      if (this.players.size >= MAX_PLAYERS) return;
      s = { playerId, name, boards: 0, wins: 0, totalScore: 0, recent: [] };
      this.players.set(playerId, s);
    }
    s.name = name;
    s.boards += 1;
    if (entry.won) s.wins += 1;
    s.totalScore += entry.score;
    s.recent.unshift(entry);
    if (s.recent.length > MAX_RECENT) s.recent.length = MAX_RECENT;
  }

  get(playerId: string): PlayerStatsData | undefined {
    const s = this.players.get(playerId);
    if (!s) return undefined;
    return {
      playerId: s.playerId,
      name: s.name,
      boards: s.boards,
      wins: s.wins,
      totalScore: s.totalScore,
      recent: [...s.recent],
    };
  }

  /** Top players by average score per board (min 5 boards to qualify). */
  leaderboard(limit = 10, minBoards = 5): LeaderboardEntry[] {
    return [...this.players.values()]
      .filter(s => s.boards >= minBoards)
      .map(s => ({
        name: s.name,
        boards: s.boards,
        avgScore: Math.round((s.totalScore / s.boards) * 10) / 10,
        winRate: Math.round((s.wins / s.boards) * 1000) / 10,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, limit);
  }

  size(): number {
    return this.players.size;
  }

  toJSON(): PlayerStatsData[] {
    return [...this.players.values()].map(s => ({
      playerId: s.playerId,
      name: s.name,
      boards: s.boards,
      wins: s.wins,
      totalScore: s.totalScore,
      recent: [...s.recent],
    }));
  }

  static fromJSON(data: PlayerStatsData[]): StatsRegistry {
    const r = new StatsRegistry();
    for (const s of data) {
      if (!s || typeof s.playerId !== 'string') continue;
      r.players.set(s.playerId, {
        playerId: s.playerId,
        name: typeof s.name === 'string' ? s.name : '?',
        boards: s.boards || 0,
        wins: s.wins || 0,
        totalScore: s.totalScore || 0,
        recent: Array.isArray(s.recent) ? s.recent.slice(0, MAX_RECENT) : [],
      });
    }
    return r;
  }
}
