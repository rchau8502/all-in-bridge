import { describe, it, expect } from 'vitest';
import { parseCard } from './deck.js';
import { evaluateHand, generateDrillHand } from './evaluator.js';

const hand = (text: string) => text.split(' ').map(parseCard);

describe('weak-two opening training', () => {
  it('recognizes six-card diamonds, hearts and spades as weak twos', () => {
    for (const [cards, bid] of [
      ['QD JD TD 9D 8D 7D AS 8S 3S JH 7H 8C 2C', '2D'],
      ['QH JH TH 9H 8H 7H AS 8S 3S JD 7D 8C 2C', '2H'],
      ['QS JS TS 9S 8S 7S AH 8H 3H JD 7D 8C 2C', '2S'],
    ]) {
      const ev = evaluateHand(hand(cards!));
      expect(ev.hcp).toBe(8);
      expect(ev.recommendedBid).toBe(bid);
      expect(ev.explanation.zh).toContain('前三家');
      expect(ev.explanation.zh).toContain('强搭档仍可选择进局');
      expect(ev.mnemonic?.en).toContain('Fourth seat');
    }
  });

  it('uses HCP boundaries rather than adding length points to disqualify a weak two', () => {
    const six = evaluateHand(hand('QD JD TD 9D 8D 7D 8S 4S 2S KH 7H 9C 3C'));
    expect(six.hcp).toBe(6);
    expect(six.recommendedBid).toBe('2D');
    const ten = evaluateHand(hand('QD JD TD 9D 8D 7D AS 4S 2S KH 7H 9C 3C'));
    expect(ten.hcp).toBe(10);
    expect(ten.totalPoints).toBe(12);
    expect(ten.recommendedBid).toBe('2D');
    expect(evaluateHand(hand('QD JD TD 9D 8D 7D 8S 4S 2S QH 7H 9C 3C')).recommendedBid).toBe('Pass');
    expect(evaluateHand(hand('QD JD TD 9D 8D 7D AS 4S 2S KH 7H JC 3C')).ruleId).not.toBe('open_weak_two');
    expect(evaluateHand(hand('QC JC TC 9C 8C 7C AS 8S 3S JD 7D 8H 2H')).recommendedBid).toBe('Pass');
  });

  it('generates targeted practice in all three suits and guarantees a matching fallback', () => {
    let seed = 921;
    const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    const bids = new Set<string>();
    for (let i = 0; i < 120; i++) {
      const problem = generateDrillHand('weak-two', 200, rng);
      expect(new Set(problem.hand.map(c => `${c.rank}${c.suit}`)).size).toBe(13);
      expect(problem.evaluation.ruleId).toBe('open_weak_two');
      expect(problem.evaluation.hcp).toBeGreaterThanOrEqual(6);
      expect(problem.evaluation.hcp).toBeLessThanOrEqual(10);
      expect(Math.max(...Object.values(problem.evaluation.suitLengths))).toBe(6);
      bids.add(problem.evaluation.recommendedBid);
    }
    expect([...bids].sort()).toEqual(['2D', '2H', '2S']);
    expect(generateDrillHand('weak-two', 0).evaluation.ruleId).toBe('open_weak_two');
  });
});
