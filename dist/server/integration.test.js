/**
 * integration.test.ts — real WebSocket server + 5 clients, one full game.
 *
 * Proves the whole stack: connect → join → seats → deal privacy →
 * auction → play → board_result, with an observer watching.
 */
import { describe, it, expect } from 'vitest';
import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from './manager.js';
import { parseBid } from '../shared/bidding.js';
import { nextSeat, SEATS } from '../shared/deck.js';
function startServer() {
    return new Promise(resolve => {
        const sockets = new Map();
        const manager = new RoomManager((clientId, event) => {
            const ws = sockets.get(clientId);
            if (ws && ws.readyState === WebSocket.OPEN)
                ws.send(JSON.stringify(event));
        });
        const wss = new WebSocketServer({ port: 0 }, () => {
            const addr = wss.address();
            resolve({
                url: `ws://127.0.0.1:${addr.port}`,
                close: () => new Promise(r => wss.close(() => r())),
            });
        });
        wss.on('connection', (ws) => {
            const id = Math.random().toString(36).slice(2);
            sockets.set(id, ws);
            ws.on('message', (d) => manager.handleMessage(id, d.toString('utf8'), Date.now()));
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
    constructor(url, name, joinCode) {
        this.url = url;
        this.name = name;
        this.joinCode = joinCode;
        this.seat = null;
        this.roomCode = null;
        this.hand = [];
        this.observerCards = 0;
        this.turn = null;
        this.trick = [];
        this.hasOpened = false;
        /** Bid types in order, to locally detect auction completion. */
        this.auctionBids = [];
        this.result = null;
        this.errors = [];
        this.done = new Promise(r => (this.resolveResult = r));
    }
    async connect() {
        this.ws = new WebSocket(this.url);
        await new Promise((res, rej) => {
            this.ws.once('open', () => res());
            this.ws.once('error', rej);
        });
        this.ws.on('message', (d) => this.onEvent(JSON.parse(d.toString('utf8'))));
        this.send({
            action: 'join',
            name: this.name,
            characterId: 'cowboy',
            lang: 'en',
            ...(this.joinCode ? { roomCode: this.joinCode } : {}),
        });
    }
    send(msg) {
        this.ws.send(JSON.stringify(msg));
    }
    close() {
        this.ws.close();
    }
    onEvent(ev) {
        const p = ev.payload;
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
                this.observerCards = SEATS.reduce((n, s) => n + p.hands[s].length, 0);
                break;
            case 'bid_made':
                this.auctionBids.push(p.bid.type);
                if (!this.auctionComplete()) {
                    this.turn = nextSeat(p.seat);
                    this.maybeBid();
                }
                break;
            case 'auction_end':
                if (p.contract) {
                    this.turn = nextSeat(p.contract.declarer);
                    this.maybePlay();
                }
                break;
            case 'play_made':
                this.trick.push({ seat: p.seat, card: p.card });
                if (this.trick.length < 4) {
                    this.turn = nextSeat(p.seat);
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
    auctionComplete() {
        const b = this.auctionBids;
        if (b.length < 4)
            return false;
        if (b.slice(-4).every(t => t === 'pass'))
            return true; // passed out
        return b.slice(-3).every(t => t === 'pass') && b.some(t => t !== 'pass');
    }
    maybeBid() {
        const seat = this.seat;
        if (seat === null || seat === 'observer' || this.turn !== seat)
            return;
        const label = seat === 'S' && !this.hasOpened ? '1NT' : 'P';
        if (label === '1NT')
            this.hasOpened = true;
        this.send({ action: 'bid', bid: parseBid(label) });
    }
    maybePlay() {
        const seat = this.seat;
        if (seat === null || seat === 'observer' || this.turn !== seat || this.hand.length === 0)
            return;
        const led = this.trick.length ? this.trick[0].card.suit : null;
        const pool = led ? this.hand.filter(c => c.suit === led) : this.hand;
        const card = (pool.length ? pool : this.hand)[0];
        this.hand = this.hand.filter(c => !(c.suit === card.suit && c.rank === card.rank));
        this.send({ action: 'play', card: { suit: card.suit, rank: card.rank } });
    }
}
function waitFor(cond, ms = 5000) {
    return new Promise((resolve, reject) => {
        const t0 = Date.now();
        const timer = setInterval(() => {
            if (cond()) {
                clearInterval(timer);
                resolve();
            }
            else if (Date.now() - t0 > ms) {
                clearInterval(timer);
                reject(new Error('waitFor timed out'));
            }
        }, 10);
    });
}
describe('full game over real websockets', () => {
    it('4 players + observer complete a game with private hands', async () => {
        const { url, close } = await startServer();
        const bots = [];
        try {
            const host = new Bot(url, 'Host');
            await host.connect();
            await waitFor(() => host.seat === 'N');
            bots.push(host);
            for (const name of ['East', 'South', 'West']) {
                const b = new Bot(url, name, host.roomCode);
                await b.connect();
                bots.push(b);
            }
            const obs = new Bot(url, 'Kibitzer', host.roomCode);
            await obs.connect();
            bots.push(obs);
            await waitFor(() => bots.every(b => b.seat !== null));
            expect(bots.map(b => b.seat)).toEqual(['N', 'E', 'S', 'W', 'observer']);
            host.send({ action: 'start' });
            const results = await Promise.all(bots.map(b => Promise.race([
                b.done,
                new Promise((_, rej) => setTimeout(() => rej(new Error(`${b.seat} got no result`)), 10000)),
            ])));
            // Everyone saw the same result: 1NT by South.
            for (const r of results) {
                const c = r['contract'];
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
        }
        finally {
            bots.forEach(b => b.close());
            await close();
        }
    }, 20000);
});
//# sourceMappingURL=integration.test.js.map