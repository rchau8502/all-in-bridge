/**
 * deck.ts — cards, shuffling, dealing.
 *
 * Bridge uses a standard 52-card deck. Seats are N/E/S/W; partnerships are
 * N-S vs E-W. A "board" is one deal plus its dealer/vulnerability context.
 */
export type Suit = 'C' | 'D' | 'H' | 'S';
export type Seat = 'N' | 'E' | 'S' | 'W';
export type Side = 'NS' | 'EW';
export interface Card {
    suit: Suit;
    /** 2..14 (11=J, 12=Q, 13=K, 14=A) */
    rank: number;
}
export type Hands = Record<Seat, Card[]>;
export declare const SEATS: Seat[];
export declare const SUITS: Suit[];
export declare function seatSide(seat: Seat): Side;
export declare function partnerOf(seat: Seat): Seat;
export declare function nextSeat(seat: Seat): Seat;
/** A fresh, ordered 52-card deck. */
export declare function buildDeck(): Card[];
/**
 * Fisher–Yates shuffle. Accepts an optional rng (default Math.random) so
 * tests and duplicate-board generation can use a seeded generator.
 */
export declare function shuffle(deck: Card[], rng?: () => number): Card[];
/** Deal 13 cards each, N first, from a 52-card deck. */
export declare function deal(deck: Card[]): Hands;
/** Sort a hand for display: suits C,D,H,S, ranks high→low. */
export declare function sortHand(hand: Card[]): Card[];
/** "AS" / "TD" / "7H" style short label, e.g. for logs and tests. */
export declare function cardLabel(card: Card): string;
export declare function parseCard(label: string): Card;
//# sourceMappingURL=deck.d.ts.map