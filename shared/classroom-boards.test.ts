import { describe, it, expect } from 'vitest';
import { CLASSROOM_BOARDS } from './classroom-boards.js';
import { importDealFromPbn } from './pbn.js';
import { cardLabel, type Seat } from './deck.js';

describe('CLASSROOM_BOARDS (Curated Demonstration Deals)', () => {
  it('contains exactly 5 curated classroom demonstration boards', () => {
    expect(CLASSROOM_BOARDS).toHaveLength(5);
  });

  it('uses a real 26-point planning deal with nine top winners', () => {
    const board = CLASSROOM_BOARDS.find(b => b.id === 'lecture_nt_planning')!;
    const { hands } = importDealFromPbn(board.deal);
    const hcp = [...hands.N, ...hands.S].reduce((sum, c) => sum + Math.max(0, c.rank - 10), 0);
    expect(hcp).toBe(26);
    expect(hands.S.filter(c => c.suit === 'S').map(c => c.rank).sort((a, b) => b - a)).toEqual([14, 13, 12, 11, 10]);
    expect([...hands.N, ...hands.S].filter(c => c.suit === 'D' && c.rank >= 13)).toHaveLength(2);
    expect(hands.N.filter(c => c.suit === 'C' && c.rank >= 13)).toHaveLength(2);
    expect(board.taTakeaway.en).toContain('5 + 2 + 2 = 9');
    expect(board.taTakeaway.zh).toContain('5 + 2 + 2 = 9');
  });

  CLASSROOM_BOARDS.forEach(board => {
    describe(`Board #${board.boardNumber} (${board.id})`, () => {
      it('has valid PBN deal containing exactly 52 unique cards (13 per hand)', () => {
        const parsed = importDealFromPbn(board.deal);
        expect(parsed).toBeDefined();

        const seenCards = new Set<string>();
        const seats: Seat[] = ['N', 'E', 'S', 'W'];

        for (const seat of seats) {
          const hand = parsed.hands[seat];
          expect(hand).toHaveLength(13);

          for (const card of hand) {
            const label = cardLabel(card);
            expect(seenCards.has(label)).toBe(false);
            seenCards.add(label);
          }
        }

        expect(seenCards.size).toBe(52);
      });

      it('has matching targetTricks = 6 + level', () => {
        expect(board.targetTricks).toBe(6 + board.contract.level);
      });

      it('has complete bilingual metadata and TA takeaways', () => {
        expect(board.title.en.length).toBeGreaterThan(0);
        expect(board.title.zh.length).toBeGreaterThan(0);
        expect(board.subtitle.en.length).toBeGreaterThan(0);
        expect(board.subtitle.zh.length).toBeGreaterThan(0);
        expect(board.taTakeaway.en.length).toBeGreaterThan(0);
        expect(board.taTakeaway.zh.length).toBeGreaterThan(0);
      });

      it('has at least one valid quiz with correct answer', () => {
        expect(board.quizzes.length).toBeGreaterThanOrEqual(1);

        for (const q of board.quizzes) {
          expect(q.question.en.length).toBeGreaterThan(0);
          expect(q.question.zh.length).toBeGreaterThan(0);
          expect(q.options.length).toBeGreaterThanOrEqual(2);

          const correctOptions = q.options.filter(o => o.isCorrect);
          expect(correctOptions).toHaveLength(1);

          expect(q.explanation.en.length).toBeGreaterThan(0);
          expect(q.explanation.zh.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
