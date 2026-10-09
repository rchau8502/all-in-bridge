/**
 * events.ts — language-neutral event codes.
 *
 * The server (and game core) NEVER emits pre-rendered display strings.
 * Every event is a code + structured payload; each client localizes it
 * into its own selected language (EN/中文). This is what makes
 * mixed-language tables work: a Chinese player and an English player
 * share one game and each sees/hears their own language.
 */
import type { Seat, Card, Hands } from './deck.js';
import type { Bid, Contract, Vulnerability } from './bidding.js';
import type { StandingEntry } from './duplicate.js';
export type EventType = 'room_joined' | 'players_update' | 'room_snapshot' | 'game_start' | 'deal' | 'observer_deal' | 'bid_made' | 'auction_end' | 'play_made' | 'trick_won' | 'board_result' | 'announce' | 'voice_line' | 'emote' | 'observer_joined' | 'player_left' | 'competition_created' | 'competition_joined' | 'table_created' | 'standings_update' | 'error';
export interface GameEvent<T extends EventType = EventType> {
    type: T;
    payload: EventPayloadMap[T];
    /** Server timestamp (ms). */
    at: number;
}
export interface EventPayloadMap {
    room_joined: {
        roomCode: string;
        seat: Seat | 'observer';
        players: Seat[];
    };
    players_update: {
        seats: Record<Seat, {
            name: string;
            characterId: string;
            connected: boolean;
        } | null>;
        observers: number;
        hostSeat: Seat | null;
    };
    room_snapshot: {
        phase: 'lobby' | 'auction' | 'play' | 'board_done';
        boardNumber: number;
        dealer: Seat | null;
        vulnerability: Vulnerability | null;
        seats: Record<Seat, {
            name: string;
            characterId: string;
            connected: boolean;
        } | null>;
        observers: number;
        hostSeat: Seat | null;
        auction: Array<{
            seat: Seat;
            bid: Bid;
        }>;
        contract: Contract | null;
        /** Set for players; null for observers. */
        yourHand: Card[] | null;
        /** Set for observers; null for players. */
        allHands: Hands | null;
        currentTrick: Array<{
            seat: Seat;
            card: Card;
        }>;
        tricksWon: {
            NS: number;
            EW: number;
        };
        turn: Seat | null;
    };
    game_start: {
        boardNumber: number;
        dealer: Seat;
        vulnerability: Vulnerability;
    };
    deal: {
        yourHand: Card[];
    };
    observer_deal: {
        hands: Hands;
    };
    bid_made: {
        seat: Seat;
        bid: Bid;
    };
    auction_end: {
        contract: Contract | null;
    };
    play_made: {
        seat: Seat;
        card: Card;
    };
    trick_won: {
        winner: Seat;
        trickNumber: number;
    };
    board_result: {
        boardNumber: number;
        contract: Contract | null;
        declarerTricks: number;
        /** Declarer's perspective; null when passed out. */
        score: number | null;
    };
    announce: {
        key: 'game' | 'slam' | 'double' | 'redouble' | 'victory' | 'defeat';
        seat?: Seat;
    };
    voice_line: {
        seat: Seat;
        lineId: string;
    };
    emote: {
        seat: Seat;
        emoteId: string;
    };
    observer_joined: {
        count: number;
    };
    player_left: {
        seat: Seat;
    };
    competition_created: {
        competitionCode: string;
        tableCode: string;
        boards: number;
    };
    competition_joined: {
        competitionCode: string;
        name: string;
        boards: number;
        tables: string[];
    };
    table_created: {
        competitionCode: string;
        tableCode: string;
    };
    standings_update: {
        competitionCode: string;
        standings: StandingEntry[];
        boardsCompleted: number;
        boardsTotal: number;
    };
    error: {
        code: string;
    };
}
/** All 52 cards of a board, for the server's board record (duplicate audit). */
export interface BoardRecord {
    boardNumber: number;
    dealer: Seat;
    vulnerability: Vulnerability;
    hands: Hands;
}
/** Per-table result on one board, for competition scoring. */
export interface TableResult {
    boardNumber: number;
    tableId: string;
    auction: Array<{
        seat: Seat;
        bid: Bid;
    }>;
    contract: Contract | null;
    declarerTricks: number;
    /** Declarer's perspective; null when passed out. */
    score: number | null;
}
export declare function makeEvent<T extends EventType>(type: T, payload: EventPayloadMap[T]): GameEvent<T>;
//# sourceMappingURL=events.d.ts.map