/**
 * bidding.ts — the auction.
 *
 * Standard contract-bridge auction rules:
 * - Seats bid in rotation N→E→S→W. A bid is pass, a level+denomination
 *   (1C … 7NT), double, or redouble.
 * - A new bid must outrank the last non-pass bid: higher level, or same
 *   level with a higher denomination (C < D < H < S < NT).
 * - Double is legal only against an opponent's undoubled bid.
 * - Redouble is legal only against an opponent's double.
 * - The auction ends after 4 consecutive passes (hand is passed out) or
 *   3 consecutive passes following any bid.
 * - Declarer = the first player of the declaring side to bid the
 *   contract denomination.
 */
import type { Seat } from './deck.js';
export type Denom = 'C' | 'D' | 'H' | 'S' | 'NT';
export type Bid = {
    type: 'pass';
} | {
    type: 'bid';
    level: number;
    denom: Denom;
} | {
    type: 'double';
} | {
    type: 'redouble';
};
export interface AuctionEntry {
    seat: Seat;
    bid: Bid;
}
export interface Contract {
    level: number;
    denom: Denom;
    declarer: Seat;
    /** 0 = undoubled, 1 = doubled, 2 = redoubled */
    doubled: 0 | 1 | 2;
}
export declare const DENOM_ORDER: Denom[];
export type Vulnerability = 'none' | 'NS' | 'EW' | 'all';
/**
 * Standard 16-board duplicate rotation: board number → dealer + vulnerability.
 * Board numbers are 1-based; the cycle repeats every 16.
 */
export declare function boardDealerVul(boardNumber: number): {
    dealer: Seat;
    vul: Vulnerability;
};
/** Compact label: "P", "1C", "3NT", "X", "XX". */
export declare function bidLabel(bid: Bid): string;
export declare function parseBid(label: string): Bid;
export declare class Auction {
    readonly entries: AuctionEntry[];
    /** Seat whose turn it is to bid. */
    turn: Seat;
    constructor(dealer: Seat);
    /** Last bid that was an actual bid (not pass/double/redouble), if any. */
    private lastBidEntry;
    /** Last non-pass entry (bid, double, or redouble), if any. */
    private lastActionEntry;
    isLegal(bid: Bid): boolean;
    /** Apply a bid for the current turn; throws on illegal bids. */
    apply(bid: Bid): void;
    /** True when the auction is over (4 straight passes, or 3 passes after a bid). */
    isComplete(): boolean;
    /**
     * The final contract, or null if the hand was passed out.
     * Throws if the auction isn't complete.
     */
    contract(): Contract | null;
}
//# sourceMappingURL=bidding.d.ts.map