/**
 * play.ts — trick-taking play.
 *
 * Pure logic, seat-based: each of the 13 tricks is led by someone, players
 * must follow suit when they can, and the trick is won by the highest trump
 * (or highest card of the led suit at no-trump). Dummy handling (who clicks
 * for the dummy seat) lives in the UI/server layer, not here.
 */
import type { Card, Seat, Side, Hands } from './deck.js';
import type { Contract } from './bidding.js';
export interface TrickPlay {
    seat: Seat;
    card: Card;
}
export declare class PlayState {
    /** Remaining cards per seat (mutated as cards are played). */
    readonly hands: Hands;
    readonly contract: Contract;
    /** Tricks won per side so far. */
    readonly tricksWon: Record<Side, number>;
    /** Cards played in the current trick, in play order. */
    currentTrick: TrickPlay[];
    /** Seat to play next. */
    turn: Seat;
    /** Completed tricks, for records/replay. */
    readonly completedTricks: TrickPlay[][];
    constructor(hands: Hands, contract: Contract);
    /** The suit led in the current trick, or null if the trick is empty. */
    ledSuit(): Card['suit'] | null;
    /** Cards the current seat is legally allowed to play. */
    legalPlays(): Card[];
    /** Play a card for the current turn seat. Throws on illegal plays. */
    play(card: Card): void;
    private finishTrick;
    isComplete(): boolean;
    /** Tricks taken by the declaring side (for scoring). */
    declarerTricks(): number;
}
/**
 * Which seat won a completed 4-card trick.
 * trump = null at no-trump.
 */
export declare function trickWinner(trick: TrickPlay[], trump: Card['suit'] | null): Seat;
//# sourceMappingURL=play.d.ts.map