/**
 * deck.ts — cards, shuffling, dealing.
 *
 * Bridge uses a standard 52-card deck. Seats are N/E/S/W; partnerships are
 * N-S vs E-W. A "board" is one deal plus its dealer/vulnerability context.
 */

export type Suit = 'C' | 'D' | 'H' | 'S'; // clubs, diamonds, hearts, spades
export type Seat = 'N' | 'E' | 'S' | 'W';
export type Side = 'NS' | 'EW';

export interface Card {
  suit: Suit;
  /** 2..14 (11=J, 12=Q, 13=K, 14=A) */
  rank: number;
}

export type Hands = Record<Seat, Card[]>;

export const SEATS: Seat[] = ['N', 'E', 'S', 'W'];
export const SUITS: Suit[] = ['C', 'D', 'H', 'S'];

export function seatSide(seat: Seat): Side {
  return seat === 'N' || seat === 'S' ? 'NS' : 'EW';
}

export function partnerOf(seat: Seat): Seat {
  switch (seat) {
    case 'N': return 'S';
    case 'S': return 'N';
    case 'E': return 'W';
    case 'W': return 'E';
  }
}

export function nextSeat(seat: Seat): Seat {
  switch (seat) {
    case 'N': return 'E';
    case 'E': return 'S';
    case 'S': return 'W';
    case 'W': return 'N';
  }
}

/** A fresh, ordered 52-card deck. */
export function buildDeck(): Card[] {
  const deck: Card[] = [];
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
export function shuffle(deck: Card[], rng: () => number = Math.random): Card[] {
  const d = deck.slice();
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = d[i]!;
    d[i] = d[j]!;
    d[j] = tmp;
  }
  return d;
}

/** Deal 13 cards each, N first, from a 52-card deck. */
export function deal(deck: Card[]): Hands {
  if (deck.length !== 52) throw new Error(`deal() needs 52 cards, got ${deck.length}`);
  const hands: Hands = { N: [], E: [], S: [], W: [] };
  deck.forEach((card, i) => {
    hands[SEATS[i % 4]!].push(card);
  });
  return hands;
}

/** Suits in display order: spades first, then the alternating black/red
 *  sequence S H C D. Within a suit, ranks run high to low. */
const DISPLAY_SUITS: Suit[] = ['S', 'H', 'C', 'D'];
const isRedSuit = (s: Suit) => s === 'H' || s === 'D';

/**
 * Sort a hand for display. Suits alternate black/red starting with spades
 * (S H C D), which keeps the red cards visually interleaved instead of
 * pooling in one block. When the contract has a trump suit, that suit leads
 * and the remaining suits continue the alternation from the opposite colour.
 * Pass null / omit for a deal with no trump (e.g. during the auction).
 */
export type SuitOrderPref = 'standard' | 'reverse';

export function sortHand(
  hand: Card[],
  trump: Suit | null = null,
  pref: SuitOrderPref = 'standard'
): Card[] {
  const baseSuits = pref === 'reverse' ? (['C', 'D', 'H', 'S'] as Suit[]) : DISPLAY_SUITS;
  const order: Suit[] = [];
  let wantRed = false;
  if (trump && baseSuits.includes(trump)) {
    order.push(trump);
    wantRed = !isRedSuit(trump);
  }
  const rest = baseSuits.filter(s => !order.includes(s));
  while (rest.length) {
    const i = rest.findIndex(s => isRedSuit(s) === wantRed);
    const picked = i < 0 ? rest.shift()! : rest.splice(i, 1)[0]!;
    order.push(picked);
    wantRed = !wantRed;
  }
  return hand.slice().sort((a, b) =>
    order.indexOf(a.suit) - order.indexOf(b.suit) || b.rank - a.rank
  );
}

/** "AS" / "TD" / "7H" style short label, e.g. for logs and tests. */
export function cardLabel(card: Card): string {
  const r = card.rank === 14 ? 'A' : card.rank === 13 ? 'K' : card.rank === 12 ? 'Q'
    : card.rank === 11 ? 'J' : card.rank === 10 ? 'T' : String(card.rank);
  return r + card.suit;
}

export function parseCard(label: string): Card {
  const m = /^([2-9TJQKA])([CDHS])$/.exec(label.toUpperCase());
  if (!m) throw new Error(`bad card label: ${label}`);
  const rankMap: Record<string, number> = { T: 10, J: 11, Q: 12, K: 13, A: 14 };
  const rank = rankMap[m[1]!] ?? parseInt(m[1]!, 10);
  return { suit: m[2]! as Suit, rank };
}
