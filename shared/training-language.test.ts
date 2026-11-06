import { describe, it, expect } from 'vitest';
import { generateDrillHand, generateResponseDrillHand, generateOvercallDrillHand, generateOpeningLeadDrillHand } from './evaluator.js';
import { generateBeginnerDrill } from './beginner-drills.js';
import { t, bidLabelL, type I18nKey } from '../client/src/i18n.js';

function checkPairs(value: unknown): void {
  if (Array.isArray(value)) return value.forEach(checkPairs);
  if (!value || typeof value !== 'object') return;
  const pair = value as Record<string, unknown>;
  if (typeof pair.en === 'string') expect(pair.en).not.toMatch(/\p{Script=Han}/u);
  if (typeof pair.zh === 'string') expect(pair.zh).not.toMatch(/Follow Suit|High Five|Four on the Floor|\b(?:West|North|East|South|Pass|Double)\b/);
  Object.values(pair).forEach(checkPairs);
}

describe('practice language consistency', () => {
  it('localizes headings, supporting labels and pass/double buttons in both directions', () => {
    const keys: I18nKey[] = ['drill.title', 'drill.subtitle', 'drill.modeBasics', 'drill.modeOpening', 'drill.modeResponding',
      'drill.modeOvercall', 'drill.modeOpeningLead', 'drill.problemCards', 'drill.handCards', 'drill.strengthCheck',
      'drill.shapeCheck', 'drill.qualityCheck', 'drill.categoryPass'];
    for (const key of keys) {
      expect(t('en', key), key).not.toMatch(/\p{Script=Han}/u);
      expect(t('zh', key), key).toMatch(/\p{Script=Han}/u);
    }
    expect(t('en', 'drill.supportCount', { n: 3 })).toBe('3-card support');
    expect(t('zh', 'drill.supportCount', { n: 3 })).toBe('3张支持');
    expect(bidLabelL('zh', { type: 'pass' })).toBe('不叫');
    expect(bidLabelL('en', { type: 'pass' })).toBe('Pass');
    expect(bidLabelL('zh', { type: 'double' })).toBe('加倍');
  });

  it('keeps generated questions, explanations and seat captions in their selected language', () => {
    let seed = 94185;
    const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 60; i++) {
      checkPairs(generateDrillHand('all', 200, rng));
      for (const opening of ['1C', '1D', '1H', '1S', '1NT'] as const) checkPairs(generateResponseDrillHand(opening, rng));
      for (const opening of ['1C', '1D', '1H', '1S'] as const) checkPairs(generateOvercallDrillHand(opening, rng));
      for (const contract of ['NT', 'suit'] as const) checkPairs(generateOpeningLeadDrillHand(contract, rng));
      for (const category of ['follow_suit', 'book_math', 'trick_winner', 'hcp_counting', 'roles'] as const) {
        const problem = generateBeginnerDrill(category, rng);
        checkPairs(problem);
        for (const play of problem.trickPlays ?? []) {
          expect(typeof play.label).toBe('object');
          expect(play.label?.zh).toMatch(/\p{Script=Han}/u);
        }
      }
    }
  });
});
