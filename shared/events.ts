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

export type EventType =
  | 'room_joined'      // { roomCode, seat: Seat | 'observer', players: Seat[] }
  | 'players_update'   // { seats, observers, hostSeat } — lobby roster changes
  | 'room_snapshot'    // full state for rejoining clients
  | 'game_start'       // { boardNumber, dealer, vulnerability }
  | 'deal'             // { yourHand: Card[] } — sent privately per player
  | 'observer_deal'    // { hands: Hands } — observers see everything, kibitzer-style
  | 'bid_made'         // { seat, bid }
  | 'auction_end'      // { contract: Contract | null } (null = passed out)
  | 'play_made'        // { seat, card }
  | 'trick_won'        // { winner, trickNumber }
  | 'board_result'     // { boardNumber, contract, declarerTricks, score, scoreBreakdown }
  | 'announce'         // { key: 'game'|'slam'|'double'|'redouble'|'victory'|'defeat', seat? }
  | 'voice_line'       // { seat, lineId } — client resolves the mp3 for its language
  | 'emote'            // { seat, emoteId }
  | 'observer_joined'  // { count }
  | 'player_left'      // { seat }
  | 'error';           // { code: string } — client maps code → localized message

export interface GameEvent<T extends EventType = EventType> {
  type: T;
  payload: EventPayloadMap[T];
  /** Server timestamp (ms). */
  at: number;
}

export interface EventPayloadMap {
  room_joined: { roomCode: string; seat: Seat | 'observer'; players: Seat[] };
  players_update: {
    seats: Record<Seat, { name: string; characterId: string; connected: boolean } | null>;
    observers: number;
    hostSeat: Seat | null;
  };
  room_snapshot: {
    phase: 'lobby' | 'auction' | 'play' | 'board_done';
    boardNumber: number;
    dealer: Seat | null;
    vulnerability: Vulnerability | null;
    seats: Record<Seat, { name: string; characterId: string; connected: boolean } | null>;
    observers: number;
    hostSeat: Seat | null;
    auction: Array<{ seat: Seat; bid: Bid }>;
    contract: Contract | null;
    /** Set for players; null for observers. */
    yourHand: Card[] | null;
    /** Set for observers; null for players. */
    allHands: Hands | null;
    currentTrick: Array<{ seat: Seat; card: Card }>;
    tricksWon: { NS: number; EW: number };
    turn: Seat | null;
  };
  game_start: { boardNumber: number; dealer: Seat; vulnerability: Vulnerability };
  deal: { yourHand: Card[] };
  observer_deal: { hands: Hands };
  bid_made: { seat: Seat; bid: Bid };
  auction_end: { contract: Contract | null };
  play_made: { seat: Seat; card: Card };
  trick_won: { winner: Seat; trickNumber: number };
  board_result: {
    boardNumber: number;
    contract: Contract | null;
    declarerTricks: number;
    /** Declarer's perspective; null when passed out. */
    score: number | null;
  };
  announce: { key: 'game' | 'slam' | 'double' | 'redouble' | 'victory' | 'defeat'; seat?: Seat };
  voice_line: { seat: Seat; lineId: string };
  emote: { seat: Seat; emoteId: string };
  observer_joined: { count: number };
  player_left: { seat: Seat };
  error: { code: string };
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
  auction: Array<{ seat: Seat; bid: Bid }>;
  contract: Contract | null;
  declarerTricks: number;
  /** Declarer's perspective; null when passed out. */
  score: number | null;
}

export function makeEvent<T extends EventType>(type: T, payload: EventPayloadMap[T]): GameEvent<T> {
  return { type, payload, at: Date.now() };
}
