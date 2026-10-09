/**
 * room.ts — one game room (one share code = one shared instance).
 *
 * The server is authoritative: it shuffles, deals, validates every bid and
 * play, and never sends a player anyone else's hand. All broadcasts are
 * language-neutral event codes (see shared/events.ts); each client
 * localizes into its own language.
 *
 * Transport is injected (`send`), so unit tests run rooms without sockets.
 */
import type { Seat, Hands } from '../shared/deck.js';
import type { Vulnerability } from '../shared/bidding.js';
import type { GameEvent, BoardRecord, TableResult } from '../shared/events.js';
import type { ClientMessage } from './protocol.js';
export type SendFn = (clientId: string, event: GameEvent) => void;
export type Phase = 'lobby' | 'auction' | 'play' | 'board_done';
/** How a room gets its boards. Default: fresh shuffle per board. */
export interface BoardSource {
    nextBoard(boardNumber: number): {
        hands: Hands;
        dealer: Seat;
        vulnerability: Vulnerability;
    };
    /** Set for fixed sets (competitions); next_board past this is rejected. */
    totalBoards?: number;
}
/** Lifecycle hooks, e.g. for competitions to hear about completed boards. */
export interface RoomHooks {
    onBoardComplete?: (room: Room) => void;
}
export declare function randomBoardSource(rng?: () => number): BoardSource;
/** Seat a disconnected player keeps before being dropped (ms). */
export declare const RECONNECT_WINDOW_MS = 60000;
export declare class Room {
    private send;
    private boardSource;
    private hooks;
    readonly code: string;
    /** Stable table id for competition records. */
    readonly tableId: string;
    phase: Phase;
    boardNumber: number;
    readonly boardRecords: BoardRecord[];
    readonly tableResults: TableResult[];
    hostClientId: string | null;
    private clients;
    private characters;
    private auction;
    private play;
    private contract;
    private dealer;
    private vulnerability;
    private currentHands;
    constructor(code: string, send: SendFn, boardSource?: BoardSource, hooks?: RoomHooks);
    private activePlayers;
    private observers;
    /**
     * Join (or rejoin) the room. Returns the assigned seat, or 'observer'
     * when the table is full. Rejoining with a known clientId restores the
     * seat and gets a full state snapshot.
     */
    join(msg: Extract<ClientMessage, {
        action: 'join';
    }>, clientId: string, now: number): void;
    /** Mark disconnected; the seat is held for RECONNECT_WINDOW_MS. */
    leave(clientId: string, now: number): void;
    /** Drop seats whose reconnect window expired. */
    sweep(now: number): void;
    handle(clientId: string, msg: ClientMessage, now: number): void;
    private onStart;
    private onNextBoard;
    private startBoard;
    private onBid;
    private onPlay;
    private onPickCharacter;
    private finishBoard;
    private isDeclarerVulnerable;
    private announce;
    private error;
    private broadcast;
    private seatStates;
    private hostSeat;
    private broadcastPlayersUpdate;
    /** Full state for a (re)joining client. Hands are scoped: own hand for players, all hands for observers. */
    private snapshotFor;
    /** Test/introspection helper: which client ids are currently connected. */
    connectedClients(): string[];
}
//# sourceMappingURL=room.d.ts.map