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
import { nextSeat, seatSide } from './deck.js';
export const DENOM_ORDER = ['C', 'D', 'H', 'S', 'NT'];
/**
 * Standard 16-board duplicate rotation: board number → dealer + vulnerability.
 * Board numbers are 1-based; the cycle repeats every 16.
 */
export function boardDealerVul(boardNumber) {
    const table = [
        ['N', 'none'], ['E', 'NS'], ['S', 'EW'], ['W', 'all'],
        ['N', 'NS'], ['E', 'EW'], ['S', 'all'], ['W', 'none'],
        ['N', 'EW'], ['E', 'all'], ['S', 'none'], ['W', 'NS'],
        ['N', 'all'], ['E', 'none'], ['S', 'NS'], ['W', 'EW'],
    ];
    const entry = table[(boardNumber - 1) % 16];
    const [dealer, vul] = entry;
    return { dealer, vul };
}
function bidRank(bid) {
    return bid.level * 5 + DENOM_ORDER.indexOf(bid.denom);
}
/** Compact label: "P", "1C", "3NT", "X", "XX". */
export function bidLabel(bid) {
    switch (bid.type) {
        case 'pass': return 'P';
        case 'double': return 'X';
        case 'redouble': return 'XX';
        case 'bid': return `${bid.level}${bid.denom}`;
    }
}
export function parseBid(label) {
    const t = label.toUpperCase();
    if (t === 'P' || t === 'PASS')
        return { type: 'pass' };
    if (t === 'X' || t === 'DBL' || t === 'DOUBLE')
        return { type: 'double' };
    if (t === 'XX' || t === 'RDBL' || t === 'REDOUBLE')
        return { type: 'redouble' };
    const m = /^([1-7])(C|D|H|S|NT)$/.exec(t);
    if (!m)
        throw new Error(`bad bid label: ${label}`);
    return { type: 'bid', level: parseInt(m[1], 10), denom: m[2] };
}
export class Auction {
    constructor(dealer) {
        this.entries = [];
        this.turn = dealer;
    }
    /** Last bid that was an actual bid (not pass/double/redouble), if any. */
    lastBidEntry() {
        for (let i = this.entries.length - 1; i >= 0; i--) {
            const e = this.entries[i];
            if (e.bid.type === 'bid')
                return e;
        }
        return null;
    }
    /** Last non-pass entry (bid, double, or redouble), if any. */
    lastActionEntry() {
        for (let i = this.entries.length - 1; i >= 0; i--) {
            const e = this.entries[i];
            if (e.bid.type !== 'pass')
                return e;
        }
        return null;
    }
    isLegal(bid) {
        const seat = this.turn;
        const lastBid = this.lastBidEntry();
        const lastAction = this.lastActionEntry();
        switch (bid.type) {
            case 'pass':
                return true;
            case 'bid': {
                if (bid.level < 1 || bid.level > 7)
                    return false;
                if (!lastBid)
                    return true;
                return bidRank(bid) > bidRank(lastBid.bid);
            }
            case 'double': {
                // Only against an opponent's currently-undoubled bid.
                if (!lastAction || lastAction.bid.type !== 'bid')
                    return false;
                if (seatSide(lastAction.seat) === seatSide(seat))
                    return false;
                return true;
            }
            case 'redouble': {
                // Only against an opponent's double.
                if (!lastAction || lastAction.bid.type !== 'double')
                    return false;
                if (seatSide(lastAction.seat) === seatSide(seat))
                    return false;
                return true;
            }
        }
    }
    /** Apply a bid for the current turn; throws on illegal bids. */
    apply(bid) {
        if (!this.isLegal(bid)) {
            throw new Error(`illegal bid ${bidLabel(bid)} by ${this.turn}`);
        }
        this.entries.push({ seat: this.turn, bid });
        this.turn = nextSeat(this.turn);
    }
    /** True when the auction is over (4 straight passes, or 3 passes after a bid). */
    isComplete() {
        const n = this.entries.length;
        if (n < 4)
            return false;
        const last4 = this.entries.slice(-4);
        if (last4.every(e => e.bid.type === 'pass'))
            return true; // passed out
        if (n >= 4) {
            const last3 = this.entries.slice(-3);
            if (last3.every(e => e.bid.type === 'pass') && this.lastBidEntry())
                return true;
        }
        return false;
    }
    /**
     * The final contract, or null if the hand was passed out.
     * Throws if the auction isn't complete.
     */
    contract() {
        if (!this.isComplete())
            throw new Error('auction not complete');
        const lastBid = this.lastBidEntry();
        if (!lastBid)
            return null; // passed out
        // Doubled status: look at actions after the final bid.
        let doubled = 0;
        const idx = this.entries.indexOf(lastBid);
        for (const e of this.entries.slice(idx + 1)) {
            if (e.bid.type === 'double')
                doubled = 1;
            else if (e.bid.type === 'redouble')
                doubled = 2;
            else if (e.bid.type === 'bid')
                doubled = 0; // higher bid cancels
        }
        // Declarer: first seat of the declaring side to bid the denomination.
        const declaringSide = seatSide(lastBid.seat);
        const declarer = this.entries.find(e => e.bid.type === 'bid'
            && e.bid.denom === lastBid.bid.denom
            && seatSide(e.seat) === declaringSide).seat;
        return { level: lastBid.bid.level, denom: lastBid.bid.denom, declarer, doubled };
    }
}
//# sourceMappingURL=bidding.js.map