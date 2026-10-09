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
import { SEATS, buildDeck, shuffle, deal, seatSide, } from '../shared/deck.js';
import { Auction, boardDealerVul } from '../shared/bidding.js';
import { PlayState } from '../shared/play.js';
import { scoreContract } from '../shared/scoring.js';
import { makeEvent } from '../shared/events.js';
import { CharacterSelect } from '../shared/voices.js';
import { isValidCharacterId } from '../shared/characters.js';
export function randomBoardSource(rng = Math.random) {
    return {
        nextBoard(boardNumber) {
            const { dealer, vul } = boardDealerVul(boardNumber);
            const hands = deal(shuffle(buildDeck(), rng));
            return { hands, dealer, vulnerability: vul };
        },
    };
}
/** Seat a disconnected player keeps before being dropped (ms). */
export const RECONNECT_WINDOW_MS = 60000;
/** True when the contract's trick score reaches game (≥100). */
function isGameContract(c) {
    if (c.denom === 'NT')
        return c.level >= 3;
    if (c.denom === 'H' || c.denom === 'S')
        return c.level >= 4;
    return c.level >= 5; // minors
}
function isBid(b) {
    if (!b || typeof b !== 'object')
        return false;
    const t = b.type;
    if (t === 'pass' || t === 'double' || t === 'redouble')
        return true;
    if (t === 'bid') {
        const bb = b;
        return (typeof bb.level === 'number' && bb.level >= 1 && bb.level <= 7 &&
            ['C', 'D', 'H', 'S', 'NT'].includes(bb.denom));
    }
    return false;
}
function isCard(c) {
    if (!c || typeof c !== 'object')
        return false;
    const cc = c;
    return (['C', 'D', 'H', 'S'].includes(cc.suit) &&
        typeof cc.rank === 'number' && cc.rank >= 2 && cc.rank <= 14);
}
let roomSeq = 0;
export class Room {
    constructor(code, send, boardSource = randomBoardSource(), hooks = {}) {
        this.send = send;
        this.boardSource = boardSource;
        this.hooks = hooks;
        this.phase = 'lobby';
        this.boardNumber = 0;
        this.boardRecords = [];
        this.tableResults = [];
        this.hostClientId = null;
        this.clients = new Map();
        this.characters = new CharacterSelect();
        this.auction = null;
        this.play = null;
        this.contract = null;
        this.dealer = null;
        this.vulnerability = null;
        this.currentHands = null;
        this.code = code;
        this.tableId = `${code}-${++roomSeq}`;
    }
    // ---------------------------------------------------------------- join ---
    activePlayers() {
        return [...this.clients.values()].filter(c => c.seat !== 'observer' && (c.connected || c.disconnectedAt !== null));
    }
    observers() {
        return [...this.clients.values()].filter(c => c.seat === 'observer' && c.connected);
    }
    /**
     * Join (or rejoin) the room. Returns the assigned seat, or 'observer'
     * when the table is full. Rejoining with a known clientId restores the
     * seat and gets a full state snapshot.
     */
    join(msg, clientId, now) {
        // Rejoin?
        if (msg.clientId) {
            const existing = this.clients.get(msg.clientId);
            if (existing) {
                existing.connected = true;
                existing.disconnectedAt = null;
                existing.name = msg.name;
                if (isValidCharacterId(msg.characterId)) {
                    existing.characterId = msg.characterId;
                    if (existing.seat !== 'observer')
                        this.characters.pick(existing.seat, msg.characterId);
                }
                this.send(existing.clientId, makeEvent('room_snapshot', this.snapshotFor(existing)));
                this.broadcastPlayersUpdate();
                return;
            }
        }
        let seat = 'observer';
        const taken = new Set(this.activePlayers().map(c => c.seat));
        for (const s of SEATS) {
            if (!taken.has(s)) {
                seat = s;
                break;
            }
        }
        const info = {
            clientId,
            name: msg.name.slice(0, 24),
            characterId: isValidCharacterId(msg.characterId) ? msg.characterId : 'cowboy',
            lang: msg.lang,
            seat,
            connected: true,
            disconnectedAt: null,
        };
        this.clients.set(clientId, info);
        if (seat !== 'observer')
            this.characters.pick(seat, info.characterId);
        if (!this.hostClientId)
            this.hostClientId = clientId;
        this.send(clientId, makeEvent('room_joined', {
            roomCode: this.code,
            seat,
            players: this.activePlayers().map(c => c.seat),
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
    leave(clientId, now) {
        const c = this.clients.get(clientId);
        if (!c)
            return;
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
    sweep(now) {
        for (const [id, c] of this.clients) {
            if (!c.connected && c.disconnectedAt !== null && now - c.disconnectedAt > RECONNECT_WINDOW_MS) {
                this.clients.delete(id);
                if (c.seat !== 'observer')
                    this.characters.clear(c.seat);
            }
        }
        this.broadcastPlayersUpdate();
    }
    // --------------------------------------------------------------- handle ---
    handle(clientId, msg, now) {
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
                this.broadcast(makeEvent('emote', { seat: c.seat, emoteId: msg.emoteId }));
                return;
            case 'voice':
                this.broadcast(makeEvent('voice_line', { seat: c.seat, lineId: msg.lineId }));
                return;
            case 'snapshot':
                this.send(clientId, makeEvent('room_snapshot', this.snapshotFor(c)));
                return;
        }
    }
    // ----------------------------------------------------------------- game ---
    onStart(c) {
        if (c.clientId !== this.hostClientId)
            return this.send(c.clientId, this.error('not-host'));
        if (this.phase !== 'lobby')
            return this.send(c.clientId, this.error('wrong-phase'));
        const players = this.activePlayers().filter(p => p.connected);
        if (players.length !== 4)
            return this.send(c.clientId, this.error('need-4-players'));
        this.startBoard(1);
    }
    onNextBoard(c) {
        if (c.clientId !== this.hostClientId)
            return this.send(c.clientId, this.error('not-host'));
        if (this.phase !== 'board_done')
            return this.send(c.clientId, this.error('wrong-phase'));
        const total = this.boardSource.totalBoards;
        if (total !== undefined && this.boardNumber >= total) {
            return this.send(c.clientId, this.error('no-more-boards'));
        }
        this.startBoard(this.boardNumber + 1);
    }
    startBoard(n) {
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
            if (!p.connected)
                continue;
            this.send(p.clientId, makeEvent('deal', { yourHand: hands[p.seat].map(c => ({ ...c })) }));
        }
        for (const o of this.observers()) {
            this.send(o.clientId, makeEvent('observer_deal', { hands }));
        }
    }
    onBid(c, rawBid) {
        if (this.phase !== 'auction' || !this.auction) {
            return this.send(c.clientId, this.error('wrong-phase'));
        }
        if (c.seat === 'observer' || this.auction.turn !== c.seat) {
            return this.send(c.clientId, this.error('not-your-turn'));
        }
        if (!isBid(rawBid))
            return this.send(c.clientId, this.error('bad-bid'));
        const bid = rawBid;
        if (!this.auction.isLegal(bid)) {
            return this.send(c.clientId, this.error('illegal-bid'));
        }
        this.auction.apply(bid);
        this.broadcast(makeEvent('bid_made', { seat: c.seat, bid }));
        if (this.auction.isComplete()) {
            this.contract = this.auction.contract();
            this.broadcast(makeEvent('auction_end', { contract: this.contract }));
            if (this.contract) {
                // Announce game/slam/double drama for the presentation layer.
                if (this.contract.doubled === 2)
                    this.announce('redouble');
                else if (this.contract.doubled === 1)
                    this.announce('double');
                if (this.contract.level === 7)
                    this.announce('slam');
                else if (this.contract.level === 6)
                    this.announce('slam');
                else if (isGameContract(this.contract))
                    this.announce('game');
                this.play = new PlayState(this.currentHands, this.contract);
                this.phase = 'play';
            }
            else {
                this.finishBoard(null, 0, null);
            }
        }
    }
    onPlay(c, rawCard) {
        if (this.phase !== 'play' || !this.play) {
            return this.send(c.clientId, this.error('wrong-phase'));
        }
        if (c.seat === 'observer' || this.play.turn !== c.seat) {
            return this.send(c.clientId, this.error('not-your-turn'));
        }
        if (!isCard(rawCard))
            return this.send(c.clientId, this.error('bad-play'));
        const card = rawCard;
        const legal = this.play.legalPlays();
        if (!legal.some(l => l.suit === card.suit && l.rank === card.rank)) {
            // Distinguish "not your card" from "must follow suit" for better UX.
            const held = this.play.hands[c.seat].some(l => l.suit === card.suit && l.rank === card.rank);
            return this.send(c.clientId, this.error(held ? 'illegal-play' : 'not-your-card'));
        }
        this.play.play(card);
        this.broadcast(makeEvent('play_made', { seat: c.seat, card: { ...card } }));
        if (this.play.currentTrick.length === 0) {
            // A trick just completed; the winner is the turn for the next trick.
            const n = this.play.completedTricks.length;
            this.broadcast(makeEvent('trick_won', { winner: this.play.turn, trickNumber: n }));
        }
        if (this.play.isComplete()) {
            const tricks = this.play.declarerTricks();
            const vul = this.isDeclarerVulnerable();
            const score = scoreContract(this.contract, tricks, vul).total;
            this.finishBoard(this.contract, tricks, score);
        }
    }
    onPickCharacter(c, characterId) {
        if (!isValidCharacterId(characterId)) {
            return this.send(c.clientId, this.error('unknown-character'));
        }
        c.characterId = characterId;
        if (c.seat !== 'observer')
            this.characters.pick(c.seat, characterId);
        this.broadcastPlayersUpdate();
    }
    finishBoard(contract, declarerTricks, score) {
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
    isDeclarerVulnerable() {
        if (!this.contract || !this.vulnerability)
            return false;
        const side = seatSide(this.contract.declarer);
        return this.vulnerability === 'all' || this.vulnerability === side;
    }
    announce(key, seat) {
        this.broadcast(makeEvent('announce', seat ? { key, seat } : { key }));
    }
    // ----------------------------------------------------------------- out ---
    error(code) {
        return makeEvent('error', { code });
    }
    broadcast(event) {
        for (const c of this.clients.values()) {
            if (c.connected)
                this.send(c.clientId, event);
        }
    }
    seatStates() {
        const out = {};
        for (const s of SEATS) {
            const p = [...this.clients.values()].find(c => c.seat === s);
            out[s] = p ? { name: p.name, characterId: p.characterId, connected: p.connected } : null;
        }
        return out;
    }
    hostSeat() {
        if (!this.hostClientId)
            return null;
        const h = this.clients.get(this.hostClientId);
        return h && h.seat !== 'observer' ? h.seat : null;
    }
    broadcastPlayersUpdate() {
        this.broadcast(makeEvent('players_update', {
            seats: this.seatStates(),
            observers: this.observers().length,
            hostSeat: this.hostSeat(),
        }));
    }
    /** Full state for a (re)joining client. Hands are scoped: own hand for players, all hands for observers. */
    snapshotFor(c) {
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
    connectedClients() {
        return [...this.clients.values()].filter(c => c.connected).map(c => c.clientId);
    }
}
//# sourceMappingURL=room.js.map