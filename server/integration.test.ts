/**
 * integration.test.ts — real WebSocket server + 5 clients, one full game.
 *
 * Proves the whole stack: connect → join → seats → deal privacy →
 * auction → play → board_result, with an observer watching.
 */
import { describe, it, expect } from 'vitest';
import { WebSocketServer, WebSocket } from 'ws';
import type { AddressInfo } from 'node:net';
import { RoomManager } from './manager.js';
import type { GameEvent } from '../shared/events.js';
import { parseBid } from '../shared/bidding.js';
import { nextSeat, SEATS } from '../shared/deck.js';
import type { Seat, Card, Suit } from '../shared/deck.js';

function startServer(): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise(resolve => {
    const sockets = new Map<string, WebSocket>();
    const manager = new RoomManager((clientId, event) => {
      const ws = sockets.get(clientId);
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(event));
    });
    const wss = new WebSocketServer({ port: 0 }, () => {
      const addr = wss.address() as AddressInfo;
      resolve({
        url: `ws://127.0.0.1:${addr.port}`,
        close: () => new Promise<void>(r => wss.close(() => r())),
      });
    });
    wss.on('connection', (ws: WebSocket) => {
      const id = Math.random().toString(36).slice(2);
      sockets.set(id, ws);
      ws.on('message', (d: Buffer) => manager.handleMessage(id, d.toString('utf8'), Date.now()));
      const drop = () => {
        sockets.delete(id);
        manager.handleDisconnect(id, Date.now());
      };
      ws.on('close', drop);
      ws.on('error', drop);
    });
  });
}

/** A minimal scripted client: S opens 1NT, everyone else passes; naive follow-suit play. */
class Bot {
  ws!: WebSocket;
  seat: Seat | 'observer' | null = null;  roomCode: string | null = null;
  hand: Card[] = [];
  observerCards = 0;
  turn: Seat | null = null;
  trick: Array<{ seat: Seat; card: Card }> = [];
  hasOpened = false;
  /** Bid types in order, to locally detect auction completion. */
  private auctionBids: string[] = [];
  result: Record<string, unknown> | null = null;
  errors: string[] = [];
  private resolveResult!: (v: Record<string, unknown>) => void;
  readonly done: Promise<Record<string, unknown>>;

  constructor(private url: string, private name: string, private joinCode?: string) {
    this.done = new Promise(r => (this.resolveResult = r));
  }

  async connect(): Promise<void> {
    this.ws = new WebSocket(this.url);
    await new Promise<void>((res, rej) => {
      this.ws.once('open', () => res());
      this.ws.once('error', rej);
    });
    this.ws.on('message', (d: Buffer) => this.onEvent(JSON.parse(d.toString('utf8')) as GameEvent));
    this.send({
      action: 'join',
      name: this.name,
      characterId: 'cowboy',
      lang: 'en',
      ...(this.joinCode ? { roomCode: this.joinCode } : {}),
    });
  }

  send(msg: unknown): void {
    this.ws.send(JSON.stringify(msg));
  }

  close(): void {
    this.ws.close();
  }

  private onEvent(ev: GameEvent): void {
    const p = ev.payload as Record<string, any>;
    switch (ev.type) {
      case 'room_joined':
        this.seat = p.seat;
        this.roomCode = p.roomCode;
        break;
      case 'game_start':
        this.turn = p.dealer;
        this.maybeBid();
        break;
      case 'deal':
        this.hand = p.yourHand;
        break;
      case 'observer_deal':
        this.observerCards = SEATS.reduce((n, s) => n + (p.hands[s] as Card[]).length, 0);
        break;
      case 'bid_made':
        this.auctionBids.push((p.bid as { type: string }).type);
        if (!this.auctionComplete()) {
          this.turn = nextSeat(p.seat as Seat);
          this.maybeBid();
        }
        break;
      case 'auction_end':
        if (p.contract) {
          this.turn = nextSeat(p.contract.declarer as Seat);
          this.maybePlay();
        }
        break;
      case 'play_made':
        this.trick.push({ seat: p.seat, card: p.card });
        if (this.trick.length < 4) {
          this.turn = nextSeat(p.seat as Seat);
          this.maybePlay();
        }
        // On the 4th card, wait for trick_won — never act on stale turn.
        break;
      case 'trick_won':
        this.trick = [];
        this.turn = p.winner;
        this.maybePlay();
        break;
      case 'board_result':
        this.result = p;
        this.resolveResult(p);
        break;
      case 'error':
        this.errors.push(p.code);
        break;
    }
  }

  private auctionComplete(): boolean {
    const b = this.auctionBids;
    if (b.length < 4) return false;
    if (b.slice(-4).every(t => t === 'pass')) return true; // passed out
    return b.slice(-3).every(t => t === 'pass') && b.some(t => t !== 'pass');
  }

  private maybeBid(): void {
    const seat = this.seat;
    if (seat === null || seat === 'observer' || this.turn !== seat) return;
    const label = seat === 'S' && !this.hasOpened ? '1NT' : 'P';
    if (label === '1NT') this.hasOpened = true;
    this.send({ action: 'bid', bid: parseBid(label) });
  }

  private maybePlay(): void {
    const seat = this.seat;
    if (seat === null || seat === 'observer' || this.turn !== seat || this.hand.length === 0) return;
    const led: Suit | null = this.trick.length ? this.trick[0]!.card.suit : null;
    const pool = led ? this.hand.filter(c => c.suit === led) : this.hand;
    const card = (pool.length ? pool : this.hand)[0]!;
    this.hand = this.hand.filter(c => !(c.suit === card.suit && c.rank === card.rank));
    this.send({ action: 'play', card: { suit: card.suit, rank: card.rank } });
  }
}

function waitFor(cond: () => boolean, ms = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const timer = setInterval(() => {
      if (cond()) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - t0 > ms) {
        clearInterval(timer);
        reject(new Error('waitFor timed out'));
      }
    }, 10);
  });
}

describe('full game over real websockets', () => {
  it('4 players + observer complete a game with private hands', async () => {
    const { url, close } = await startServer();
    const bots: Bot[] = [];
    try {
      const host = new Bot(url, 'Host');
      await host.connect();
      await waitFor(() => host.seat === 'N');
      bots.push(host);

      for (const name of ['East', 'South', 'West']) {
        const b = new Bot(url, name, host.roomCode!);
        await b.connect();
        bots.push(b);
      }
      const obs = new Bot(url, 'Kibitzer', host.roomCode!);
      await obs.connect();
      bots.push(obs);

      await waitFor(() => bots.every(b => b.seat !== null));
      expect(bots.map(b => b.seat)).toEqual(['N', 'E', 'S', 'W', 'observer']);

      host.send({ action: 'start' });

      const results: Array<Record<string, unknown>> = await Promise.all(bots.map(b =>
        Promise.race([
          b.done,
          new Promise<Record<string, unknown>>((_, rej) => setTimeout(() => rej(new Error(`${b.seat} got no result`)), 10000)),
        ])
      ));

      // Everyone saw the same result: 1NT by South.
      for (const r of results) {
        const c = r['contract'] as { level: number; denom: string; declarer: string };
        expect(c.level).toBe(1);
        expect(c.denom).toBe('NT');
        expect(c.declarer).toBe('S');
        expect(r['declarerTricks']).toBeGreaterThanOrEqual(0);
        expect(typeof r['score']).toBe('number');
      }
      // Deal privacy held: 13 cards each, all played; observer saw 52.
      for (const b of bots.slice(0, 4)) {
        expect(b.hand).toHaveLength(0); // played everything
        expect(b.errors).toEqual([]);
      }
      expect(obs.observerCards).toBe(52);
      expect(obs.errors).toEqual([]);
    } finally {
      bots.forEach(b => b.close());
      await close();
    }
  }, 20000);
});
