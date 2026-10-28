import { describe, it, expect } from 'vitest';
import {
  generateBeginnerDrill,
  type BeginnerDrillCategory,
  type BeginnerDrillProblem,
} from './beginner-drills.js';

describe('beginner-drills generator', () => {
  const categories: BeginnerDrillCategory[] = [
    'follow_suit',
    'book_math',
    'trick_winner',
    'hcp_counting',
    'roles',
  ];

  for (const cat of categories) {
    it(`generates valid problems for category "${cat}"`, () => {
      for (let i = 0; i < 10; i++) {
        const prob: BeginnerDrillProblem = generateBeginnerDrill(cat);
        expect(prob.category).toBe(cat);
        expect(prob.question.en.length).toBeGreaterThan(10);
        expect(prob.question.zh.length).toBeGreaterThan(5);
        expect(prob.options.length).toBeGreaterThanOrEqual(2);

        // Exactly one option is correct
        const correctCount = prob.options.filter(o => o.isCorrect).length;
        expect(correctCount).toBe(1);

        // All options have EN and ZH text
        for (const opt of prob.options) {
          expect(opt.label.en.length).toBeGreaterThan(0);
          expect(opt.label.zh.length).toBeGreaterThan(0);
        }

        // Explanations are bilingual
        expect(prob.explanation.en.length).toBeGreaterThan(10);
        expect(prob.explanation.zh.length).toBeGreaterThan(5);

        // Mnemonic if present is bilingual
        if (prob.mnemonic) {
          expect(prob.mnemonic.en.length).toBeGreaterThan(5);
          expect(prob.mnemonic.zh.length).toBeGreaterThan(3);
        }
      }
    });
  }

  it('generates random problems when category is "all"', () => {
    const categoriesSeen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const prob = generateBeginnerDrill('all');
      categoriesSeen.add(prob.category);
    }
    // Should have sampled across multiple categories
    expect(categoriesSeen.size).toBeGreaterThanOrEqual(3);
  });

  it('book_math calculation strictly equals 6 + bid level', () => {
    for (let i = 0; i < 20; i++) {
      const prob = generateBeginnerDrill('book_math');
      const correctOpt = prob.options.find(o => o.isCorrect)!;
      const targetTricks = parseInt(correctOpt.id, 10);

      // Extract level from question or explanation
      const match = prob.explanation.en.match(/6 \+ (\d) = (\d+)/);
      if (match) {
        const level = parseInt(match[1]!, 10);
        const expected = 6 + level;
        expect(targetTricks).toBe(expected);
      }
    }
  });

  it('hcp_counting sums to the exact card values', () => {
    for (let i = 0; i < 20; i++) {
      const prob = generateBeginnerDrill('hcp_counting');
      expect(prob.cards).toBeDefined();
      const expectedHcp = prob.cards!.reduce((sum, c) => {
        const val = c.rank === 14 ? 4 : c.rank === 13 ? 3 : c.rank === 12 ? 2 : c.rank === 11 ? 1 : 0;
        return sum + val;
      }, 0);
      const correctOpt = prob.options.find(o => o.isCorrect)!;
      expect(parseInt(correctOpt.id, 10)).toBe(expectedHcp);
    }
  });
});
