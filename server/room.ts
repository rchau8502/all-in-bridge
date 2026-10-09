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

import {
  SEATS, buildDeck, shuffle, deal, seatSide,
} from '../shared/deck.js';
import type { Seat, Side, Card, Hands } from '../shared/deck.js';
import { Auction, boardDealerVul } from '../shared/bidding.js';
import type { Bid, Contract, Vulnerability } from '../shared/bidding.js';
import { PlayState } from '../shared/play.js';
import { scoreContract } from '../shared/scoring.js';
import { makeEvent } from '../shared/events.js';
import type {
  GameEvent, EventType, EventPayloadMap, BoardRecord, TableResult,
} from '../shared/events.js';
import { CharacterSelect } from '../shared/voices.js';
import { isValidCharacterId } from '../shared/characters.js';
import type { Lang } from '../shared/voices.js';
import type { ClientMessage, ErrorCode } from './protocol.js';

export type SendFn = (clientId: string, event: GameEvent) => void;

export type Phase = 'lobby' | 'auction' | 'play' | 'board_done';

interface ClientInfo {
  clientId: string;
  name: string;
  characterId: string;
  lang: Lang;
  seat: Seat | 'observer';
  connected: boolean;
  disconnectedAt: number | null;
}

/** How a room gets its boards. Default: fresh shuffle per board. */
export interface BoardSource {
  nextBoard(boardNumber: number): { hands: Hands; dealer: Seat; vulnerability: Vulnerability };
  /** Set for fixed sets (competitions); next_board past this is rejected. */
  totalBoards?: number;
}

/** Lifecycle hooks, e.g. for competitions to hear about completed boards. */
export interface RoomHooks {
  onBoardComplete?: (room: Room) => void;
}

export function randomBoardSource(rng: () => number = Math.random): BoardSource {
  return {
    nextBoard(boardNumber: number) {
      const { dealer, vul } = boardDealerVul(boardNumber);
      const hands = deal(shuffle(buildDeck(), rng));
      return { hands, dealer, vulnerability: vul };
    },
  };
}

/** Seat a disconnected player keeps before being dropped (ms). */
export const RECONNECT_WINDOW_MS = 60_000;

/** True when the contract's trick score reaches game (≥100). */
function isGameContract(c: Contract): boolean {
  if (c.denom === 'NT') return c.level >= 3;
  if (c.denom === 'H' || c.denom === 'S') return c.level >= 4;
  return c.level >= 5; // minors
}

function isBid(b: unknown): b is Bid {
  if (!b || typeof b !== 'object') return false;
  const t = (b as { type?: unknown }).type;
  if (t === 'pass' || t === 'double' || t === 'redouble') return true;
  if (t === 'bid') {
    const bb = b as { level?: unknown; denom?: unknown };
    return (
      typeof bb.level === 'number' && bb.level >= 1 && bb.level <= 7 &&
      ['C', 'D', 'H', 'S', 'NT'].includes(bb.denom as string)
    );
  }
  return false;
}

function isCard(c: unknown): c is Card {
  if (!c || typeof c !== 'object') return false;
  const cc = c as { suit?: unknown; rank?: unknown };
  return (
    ['C', 'D', 'H', 'S'].includes(cc.suit as string) &&
    typeof cc.rank === 'number' && cc.rank >= 2 && cc.rank <= 14
  );
}

let roomSeq = 0;

export class Room {
  readonly code: string;
  /** Stable table id for competition records. */
  readonly tableId: string;
  phase: Phase = 'lobby';
  boardNumber = 0;
  readonly boardRecords: BoardRecord[] = [];
  readonly tableResults: TableResult[] = [];
  hostClientId: string | null = null;

  private clients = new Map<string, ClientInfo>();
  private characters = new CharacterSelect();
  private auction: Auction | null = null;
  private play: PlayState | null = null;
  private contract: Contract | null = null;
  private dealer: Seat | null = null;
  private vulnerability: Vulnerability | null = null;
  private currentHands: Hands | null = null;

  constructor(
    code: string,
    private send: SendFn,
    private boardSource: BoardSource = randomBoardSource(),
    private hooks: RoomHooks = {}
  ) {
    this.code = code;
    this.tableId = `${code}-${++roomSeq}`;
  }

  // ---------------------------------------------------------------- join ---

  private activePlayers(): ClientInfo[] {
    return [...this.clients.values()].filter(
      c => c.seat !== 'observer' && (c.connected || c.disconnectedAt !== null)
    );
  }

  private observers(): ClientInfo[] {
    return [...this.clients.values()].filter(c => c.seat === 'observer' && c.connected);
  }

  /**
   * Join (or rejoin) the room. Returns the assigned seat, or 'observer'
   * when the table is full. Rejoining with a known clientId restores the
   * seat and gets a full state snapshot.
   */
  join(msg: Extract<ClientMessage, { action: 'join' }>, clientId: string, now: number): void {
    // Rejoin?
    if (msg.clientId) {
      const existing = this.clients.get(msg.clientId);
      if (existing) {
        existing.connected = true;
        existing.disconnectedAt = null;
        existing.name = msg.name;
        if (isValidCharacterId(msg.characterId)) {
          existing.characterId = msg.characterId;
          if (existing.seat !== 'observer') this.characters.pick(existing.seat, msg.characterId);
        }
        this.send(existing.clientId, makeEvent('room_snapshot', this.snapshotFor(existing)));
        this.broadcastPlayersUpdate();
        return;
      }
    }

    let seat: Seat | 'observer' = 'observer';
    const taken = new Set(this.activePlayers().map(c => c.seat));
    for (const s of SEATS) {
      if (!taken.has(s)) {
        seat = s;
        break;
      }
    }

    const info: ClientInfo = {
      clientId,
      name: msg.name.slice(0, 24),
      characterId: isValidCharacterId(msg.characterId) ? msg.characterId : 'cowboy',
      lang: msg.lang,
      seat,
      connected: true,
      disconnectedAt: null,
    };
    this.clients.set(clientId, info);
    if (seat !== 'observer') this.characters.pick(seat, info.characterId);
    if (!this.hostClientId) this.hostClientId = clientId;

    this.send(clientId, makeEvent('room_joined', {
      roomCode: this.code,
      seat,
      players: this.activePlayers().map(c => c.seat as Seat),
    }));
    if (seat === 'observer') {
      this.broadcast(makeEvent('observer_joined', { count: this.observers().length }));
    }
    // If a game is running, the joiner gets the current state immediately.
    if (this.phase !== 'lobby') {
      this.send(clientId, makeEvent('room_snapshot', this.snapshotFor(info)));
    }
    this.broadcastPlayersUpdate();
  }

  /** Mark disconnected; the seat is held for RECONNECT_WINDOW_MS. */
  leave(clientId: string, now: number): void {
    const c = this.clients.get(clientId);
    if (!c) return;
    c.connected = false;
    c.disconnectedAt = now;
    if (c.seat !== 'observer') {
      this.broadcast(makeEvent('player_left', { seat: c.seat }));
    }
    if (this.hostClientId === clientId) {
      // Pass host to the longest-seated connected player.
      const next = this.activePlayers().find(p => p.connected);
      this.hostClientId = next ? next.clientId : null;
    }
    this.broadcastPlayersUpdate();
  }

  /** Drop seats whose reconnect window expired. */
  sweep(now: number): void {
    for (const [id, c] of this.clients) {
      if (!c.connected && c.disconnectedAt !== null && now - c.disconnectedAt > RECONNECT_WINDOW_MS) {
        this.clients.delete(id);
        if (c.seat !== 'observer') this.characters.clear(c.seat);
      }
    }
    this.broadcastPlayersUpdate();
  }

  // --------------------------------------------------------------- handle ---

  handle(clientId: string, msg: ClientMessage, now: number): void {
    const c = this.clients.get(clientId);
    if (!c || !c.connected) {
      this.send(clientId, this.error('not-in-room'));
      return;
    }
    switch (msg.action) {
      case 'join':
        this.join(msg, clientId, now);
        return;
      case 'start':
        this.onStart(c);
        return;
      case 'next_board':
        this.onNextBoard(c);
        return;
      case 'bid':
        this.onBid(c, msg.bid);
        return;
      case 'play':
        this.onPlay(c, msg.card);
        return;
      case 'pick_character':
        this.onPickCharacter(c, msg.characterId);
        return;
      case 'emote':
        this.broadcast(makeEvent('emote', { seat: c.seat as Seat, emoteId: msg.emoteId }));
        return;
      case 'voice':
        this.broadcast(makeEvent('voice_line', { seat: c.seat as Seat, lineId: msg.lineId }));
        return;
    }
  }

  // ----------------------------------------------------------------- game ---

  private onStart(c: ClientInfo): void {
    if (c.clientId !== this.hostClientId) return this.send(c.clientId, this.error('not-host'));
    if (this.phase !== 'lobby') return this.send(c.clientId, this.error('wrong-phase'));
    const players = this.activePlayers().filter(p => p.connected);
    if (players.length !== 4) return this.send(c.clientId, this.error('need-4-players'));
    this.startBoard(1);
  }

  private onNextBoard(c: ClientInfo): void {
    if (c.clientId !== this.hostClientId) return this.send(c.clientId, this.error('not-host'));
    if (this.phase !== 'board_done') return this.send(c.clientId, this.error('wrong-phase'));
    const total = this.boardSource.totalBoards;
    if (total !== undefined && this.boardNumber >= total) {
      return this.send(c.clientId, this.error('no-more-boards'));
    }
    this.startBoard(this.boardNumber + 1);
  }

  private startBoard(n: number): void {
    this.boardNumber = n;
    const { hands, dealer, vulnerability } = this.boardSource.nextBoard(n);
    this.currentHands = hands;
    this.dealer = dealer;
    this.vulnerability = vulnerability;
    this.boardRecords.push({ boardNumber: n, dealer, vulnerability, hands });
    this.auction = new Auction(dealer);
    this.play = null;
    this.contract = null;
    this.phase = 'auction';

    this.broadcast(makeEvent('game_start', { boardNumber: n, dealer, vulnerability }));
    for (const p of this.activePlayers()) {
      if (!p.connected) continue;
      this.send(p.clientId, makeEvent('deal', { yourHand: hands[p.seat as Seat].map(c => ({ ...c })) }));
    }
    for (const o of this.observers()) {
      this.send(o.clientId, makeEvent('observer_deal', { hands }));
    }
  }

  private onBid(c: ClientInfo, rawBid: unknown): void {
    if (this.phase !== 'auction' || !this.auction) {
      return this.send(c.clientId, this.error('wrong-phase'));
    }
    if (c.seat === 'observer' || this.auction.turn !== c.seat) {
      return this.send(c.clientId, this.error('not-your-turn'));
    }
    if (!isBid(rawBid)) return this.send(c.clientId, this.error('bad-bid'));
    const bid = rawBid as Bid;
    if (!this.auction.isLegal(bid)) {
      return this.send(c.clientId, this.error('illegal-bid'));
    }
    this.auction.apply(bid);
    this.broadcast(makeEvent('bid_made', { seat: c.seat as Seat, bid }));

    if (this.auction.isComplete()) {
      this.contract = this.auction.contract();
      this.broadcast(makeEvent('auction_end', { contract: this.contract }));
      if (this.contract) {
        // Announce game/slam/double drama for the presentation layer.
        if (this.contract.doubled === 2) this.announce('redouble');
        else if (this.contract.doubled === 1) this.announce('double');
        if (this.contract.level === 7) this.announce('slam');
        else if (this.contract.level === 6) this.announce('slam');
        else if (isGameContract(this.contract)) this.announce('game');
        this.play = new PlayState(this.currentHands!, this.contract);
        this.phase = 'play';
      } else {
        this.finishBoard(null, 0, null);
      }
    }
  }

  private onPlay(c: ClientInfo, rawCard: unknown): void {
    if (this.phase !== 'play' || !this.play) {
      return this.send(c.clientId, this.error('wrong-phase'));
    }
    if (c.seat === 'observer' || this.play.turn !== c.seat) {
      return this.send(c.clientId, this.error('not-your-turn'));
    }
    if (!isCard(rawCard)) return this.send(c.clientId, this.error('bad-play'));
    const card = rawCard as Card;
    const legal = this.play.legalPlays();
    if (!legal.some(l => l.suit === card.suit && l.rank === card.rank)) {
      // Distinguish "not your card" from "must follow suit" for better UX.
      const held = this.play.hands[c.seat as Seat].some(l => l.suit === card.suit && l.rank === card.rank);
      return this.send(c.clientId, this.error(held ? 'illegal-play' : 'not-your-card'));
    }
    this.play.play(card);
    this.broadcast(makeEvent('play_made', { seat: c.seat as Seat, card: { ...card } }));

    if (this.play.currentTrick.length === 0) {
      // A trick just completed; the winner is the turn for the next trick.
      const n = this.play.completedTricks.length;
      this.broadcast(makeEvent('trick_won', { winner: this.play.turn, trickNumber: n }));
    }

    if (this.play.isComplete()) {
      const tricks = this.play.declarerTricks();
      const vul = this.isDeclarerVulnerable();
      const score = scoreContract(this.contract!, tricks, vul).total;
      this.finishBoard(this.contract, tricks, score);
    }
  }

  private onPickCharacter(c: ClientInfo, characterId: string): void {
    if (!isValidCharacterId(characterId)) {
      return this.send(c.clientId, this.error('unknown-character'));
    }
    c.characterId = characterId;
    if (c.seat !== 'observer') this.characters.pick(c.seat, characterId);
    this.broadcastPlayersUpdate();
  }

  private finishBoard(contract: Contract | null, declarerTricks: number, score: number | null): void {
    this.phase = 'board_done';
    this.tableResults.push({
      boardNumber: this.boardNumber,
      tableId: this.tableId,
      auction: this.auction ? this.auction.entries.map(e => ({ seat: e.seat, bid: e.bid })) : [],
      contract,
      declarerTricks,
      score,
    });
    this.broadcast(makeEvent('board_result', {
      boardNumber: this.boardNumber,
      contract,
      declarerTricks,
      score,
    }));
    if (contract && score !== null) {
      this.announce(score >= 0 ? 'victory' : 'defeat', contract.declarer);
    }
    this.hooks.onBoardComplete?.(this);
  }

  private isDeclarerVulnerable(): boolean {
    if (!this.contract || !this.vulnerability) return false;
    const side: Side = seatSide(this.contract.declarer);
    return this.vulnerability === 'all' || this.vulnerability === side;
  }

  private announce(key: 'game' | 'slam' | 'double' | 'redouble' | 'victory' | 'defeat', seat?: Seat): void {
    this.broadcast(makeEvent('announce', seat ? { key, seat } : { key }));
  }

  // ----------------------------------------------------------------- out ---

  private error(code: ErrorCode) {
    return makeEvent('error', { code });
  }

  private broadcast<T extends Parameters<SendFn>[1]>(event: T): void {
    for (const c of this.clients.values()) {
      if (c.connected) this.send(c.clientId, event);
    }
  }

  private seatStates(): Record<Seat, { name: string; characterId: string; connected: boolean } | null> {
    const out = {} as Record<Seat, { name: string; characterId: string; connected: boolean } | null>;
    for (const s of SEATS) {
      const p = [...this.clients.values()].find(c => c.seat === s);
      out[s] = p ? { name: p.name, characterId: p.characterId, connected: p.connected } : null;
    }
    return out;
  }

  private hostSeat(): Seat | null {
    if (!this.hostClientId) return null;
    const h = this.clients.get(this.hostClientId);
    return h && h.seat !== 'observer' ? h.seat : null;
  }

  private broadcastPlayersUpdate(): void {
    this.broadcast(makeEvent('players_update', {
      seats: this.seatStates(),
      observers: this.observers().length,
      hostSeat: this.hostSeat(),
    }));
  }

  /** Full state for a (re)joining client. Hands are scoped: own hand for players, all hands for observers. */
  private snapshotFor(c: ClientInfo): EventPayloadMap['room_snapshot'] {
    const isObserver = c.seat === 'observer';
    return {
      phase: this.phase,
      boardNumber: this.boardNumber,
      dealer: this.dealer,
      vulnerability: this.vulnerability,
      seats: this.seatStates(),
      observers: this.observers().length,
      hostSeat: this.hostSeat(),
      auction: this.auction ? this.auction.entries.map(e => ({ seat: e.seat, bid: e.bid })) : [],
      contract: this.contract,
      yourHand: !isObserver && this.currentHands && c.seat !== 'observer'
        ? this.currentHands[c.seat].map(x => ({ ...x }))
        : null,
      allHands: isObserver && this.currentHands ? this.currentHands : null,
      currentTrick: this.play ? this.play.currentTrick.map(t => ({ seat: t.seat, card: { ...t.card } })) : [],
      tricksWon: this.play ? { ...this.play.tricksWon } : { NS: 0, EW: 0 },
      turn: this.phase === 'auction' && this.auction ? this.auction.turn
        : this.phase === 'play' && this.play ? this.play.turn
        : null,
    };
  }

  /** Test/introspection helper: which client ids are currently connected. */
  connectedClients(): string[] {
    return [...this.clients.values()].filter(c => c.connected).map(c => c.clientId);
  }
}
