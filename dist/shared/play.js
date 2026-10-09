/**
 * play.ts — trick-taking play.
 *
 * Pure logic, seat-based: each of the 13 tricks is led by someone, players
 * must follow suit when they can, and the trick is won by the highest trump
 * (or highest card of the led suit at no-trump). Dummy handling (who clicks
 * for the dummy seat) lives in the UI/server layer, not here.
 */
import { SEATS, nextSeat, seatSide, cardLabel } from './deck.js';
function sameCard(a, b) {
    return a.suit === b.suit && a.rank === b.rank;
}
export class PlayState {
    constructor(hands, contract) {
        /** Tricks won per side so far. */
        this.tricksWon = { NS: 0, EW: 0 };
        /** Cards played in the current trick, in play order. */
        this.currentTrick = [];
        /** Completed tricks, for records/replay. */
        this.completedTricks = [];
        // Deep-copy so the caller's deal is never mutated.
        this.hands = { N: [], E: [], S: [], W: [] };
        for (const s of SEATS)
            this.hands[s] = hands[s].map(c => ({ ...c }));
        this.contract = contract;
        // Opening lead comes from the seat left of the declarer.
        this.turn = nextSeat(contract.declarer);
    }
    /** The suit led in the current trick, or null if the trick is empty. */
    ledSuit() {
        const first = this.currentTrick[0];
        return first ? first.card.suit : null;
    }
    /** Cards the current seat is legally allowed to play. */
    legalPlays() {
        const hand = this.hands[this.turn];
        const led = this.ledSuit();
        if (!led)
            return hand.slice();
        const follow = hand.filter(c => c.suit === led);
        return follow.length > 0 ? follow : hand.slice();
    }
    /** Play a card for the current turn seat. Throws on illegal plays. */
    play(card) {
        const seat = this.turn;
        const idx = this.hands[seat].findIndex(c => sameCard(c, card));
        if (idx === -1) {
            throw new Error(`${seat} does not hold ${cardLabel(card)}`);
        }
        const led = this.ledSuit();
        if (led && card.suit !== led && this.hands[seat].some(c => c.suit === led)) {
            throw new Error(`${seat} must follow suit (${led})`);
        }
        this.hands[seat].splice(idx, 1);
        this.currentTrick.push({ seat, card: { ...card } });
        if (this.currentTrick.length === 4) {
            this.finishTrick();
        }
        else {
            this.turn = nextSeat(seat);
        }
    }
    finishTrick() {
        const winner = trickWinner(this.currentTrick, this.contract.denom === 'NT' ? null : this.contract.denom);
        this.tricksWon[seatSide(winner)]++;
        this.completedTricks.push(this.currentTrick);
        this.currentTrick = [];
        this.turn = winner; // winner leads the next trick
    }
    isComplete() {
        return this.completedTricks.length === 13;
    }
    /** Tricks taken by the declaring side (for scoring). */
    declarerTricks() {
        return this.tricksWon[seatSide(this.contract.declarer)];
    }
}
/**
 * Which seat won a completed 4-card trick.
 * trump = null at no-trump.
 */
export function trickWinner(trick, trump) {
    if (trick.length !== 4)
        throw new Error('trickWinner needs a complete trick');
    const first = trick[0];
    const led = first.card.suit;
    let best = first;
    for (const play of trick.slice(1)) {
        if (beats(play.card, best.card, led, trump))
            best = play;
    }
    return best.seat;
}
function beats(challenger, current, led, trump) {
    const cTrump = trump !== null && challenger.suit === trump;
    const bTrump = trump !== null && current.suit === trump;
    if (cTrump && !bTrump)
        return true;
    if (!cTrump && bTrump)
        return false;
    if (cTrump && bTrump)
        return challenger.rank > current.rank;
    // No trumps involved: only a higher card of the led suit wins.
    if (challenger.suit !== led)
        return false;
    if (current.suit !== led)
        return true;
    return challenger.rank > current.rank;
}
//# sourceMappingURL=play.js.map