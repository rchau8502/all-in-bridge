import { describe, it, expect } from 'vitest';
import { buildDeck, shuffle, deal, sortHand, cardLabel, parseCard, seatSide, partnerOf, nextSeat, SEATS, } from './deck.js';
/** Deterministic RNG (mulberry32) for repeatable tests. */
function seededRng(seed) {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
describe('buildDeck', () => {
    it('has 52 unique cards', () => {
        const deck = buildDeck();
        expect(deck).toHaveLength(52);
        const labels = new Set(deck.map(cardLabel));
        expect(labels.size).toBe(52);
    });
});
describe('shuffle', () => {
    it('preserves all cards', () => {
        const shuffled = shuffle(buildDeck(), seededRng(42));
        const labels = new Set(shuffled.map(cardLabel));
        expect(labels.size).toBe(52);
    });
    it('is deterministic with the same seed', () => {
        const a = shuffle(buildDeck(), seededRng(7)).map(cardLabel).join(',');
        const b = shuffle(buildDeck(), seededRng(7)).map(cardLabel).join(',');
        expect(a).toBe(b);
    });
    it('actually reorders the deck', () => {
        const ordered = buildDeck().map(cardLabel).join(',');
        const shuffled = shuffle(buildDeck(), seededRng(7)).map(cardLabel).join(',');
        expect(shuffled).not.toBe(ordered);
    });
});
describe('deal', () => {
    it('deals 13 cards to each seat, 52 total, no duplicates', () => {
        const hands = deal(shuffle(buildDeck(), seededRng(1)));
        const all = [];
        for (const s of SEATS) {
            expect(hands[s]).toHaveLength(13);
            all.push(...hands[s]);
        }
        expect(new Set(all.map(cardLabel)).size).toBe(52);
    });
    it('rejects a non-52-card deck', () => {
        expect(() => deal(buildDeck().slice(0, 51))).toThrow();
    });
});
describe('sortHand', () => {
    it('orders C,D,H,S with ranks high to low', () => {
        const hand = [parseCard('2S'), parseCard('AH'), parseCard('KC'), parseCard('TC')]
            .map(c => ({ ...c }));
        expect(sortHand(hand).map(cardLabel)).toEqual(['KC', 'TC', 'AH', '2S']);
    });
});
describe('cardLabel / parseCard', () => {
    it('round-trips', () => {
        for (const label of ['AS', 'TD', '7H', 'QC', '2C', 'KH']) {
            expect(cardLabel(parseCard(label))).toBe(label);
        }
    });
    it('rejects bad labels', () => {
        expect(() => parseCard('1X')).toThrow();
        expect(() => parseCard('ZZ')).toThrow();
    });
});
describe('seat helpers', () => {
    it('seatSide', () => {
        expect(seatSide('N')).toBe('NS');
        expect(seatSide('S')).toBe('NS');
        expect(seatSide('E')).toBe('EW');
        expect(seatSide('W')).toBe('EW');
    });
    it('partnerOf', () => {
        expect(partnerOf('N')).toBe('S');
        expect(partnerOf('E')).toBe('W');
    });
    it('nextSeat rotates N→E→S→W→N', () => {
        expect([nextSeat('N'), nextSeat('E'), nextSeat('S'), nextSeat('W')])
            .toEqual(['E', 'S', 'W', 'N']);
    });
});
//# sourceMappingURL=deck.test.js.map