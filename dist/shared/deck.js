/**
 * deck.ts — cards, shuffling, dealing.
 *
 * Bridge uses a standard 52-card deck. Seats are N/E/S/W; partnerships are
 * N-S vs E-W. A "board" is one deal plus its dealer/vulnerability context.
 */
export const SEATS = ['N', 'E', 'S', 'W'];
export const SUITS = ['C', 'D', 'H', 'S'];
export function seatSide(seat) {
    return seat === 'N' || seat === 'S' ? 'NS' : 'EW';
}
export function partnerOf(seat) {
    switch (seat) {
        case 'N': return 'S';
        case 'S': return 'N';
        case 'E': return 'W';
        case 'W': return 'E';
    }
}
export function nextSeat(seat) {
    switch (seat) {
        case 'N': return 'E';
        case 'E': return 'S';
        case 'S': return 'W';
        case 'W': return 'N';
    }
}
/** A fresh, ordered 52-card deck. */
export function buildDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (let rank = 2; rank <= 14; rank++) {
            deck.push({ suit, rank });
        }
    }
    return deck;
}
/**
 * Fisher–Yates shuffle. Accepts an optional rng (default Math.random) so
 * tests and duplicate-board generation can use a seeded generator.
 */
export function shuffle(deck, rng = Math.random) {
    const d = deck.slice();
    for (let i = d.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = d[i];
        d[i] = d[j];
        d[j] = tmp;
    }
    return d;
}
/** Deal 13 cards each, N first, from a 52-card deck. */
export function deal(deck) {
    if (deck.length !== 52)
        throw new Error(`deal() needs 52 cards, got ${deck.length}`);
    const hands = { N: [], E: [], S: [], W: [] };
    deck.forEach((card, i) => {
        hands[SEATS[i % 4]].push(card);
    });
    return hands;
}
/** Sort a hand for display: suits C,D,H,S, ranks high→low. */
export function sortHand(hand) {
    const suitOrder = { C: 0, D: 1, H: 2, S: 3 };
    return hand.slice().sort((a, b) => suitOrder[a.suit] - suitOrder[b.suit] || b.rank - a.rank);
}
/** "AS" / "TD" / "7H" style short label, e.g. for logs and tests. */
export function cardLabel(card) {
    const r = card.rank === 14 ? 'A' : card.rank === 13 ? 'K' : card.rank === 12 ? 'Q'
        : card.rank === 11 ? 'J' : card.rank === 10 ? 'T' : String(card.rank);
    return r + card.suit;
}
export function parseCard(label) {
    const m = /^([2-9TJQKA])([CDHS])$/.exec(label.toUpperCase());
    if (!m)
        throw new Error(`bad card label: ${label}`);
    const rankMap = { T: 10, J: 11, Q: 12, K: 13, A: 14 };
    const rank = rankMap[m[1]] ?? parseInt(m[1], 10);
    return { suit: m[2], rank };
}
//# sourceMappingURL=deck.js.map