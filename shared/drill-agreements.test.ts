import { describe, expect, it } from 'vitest';
import { parseCard } from './deck.js';
import { evaluateResponse, evaluateOvercall, isLegalDrillResponse, isLegalDrillOvercall, generateResponseDrillHand, generateOvercallDrillHand } from './evaluator.js';

const hand = (cards: string) => cards.split(' ').map(parseCard);

describe('training follows the website partnership agreement', () => {
  it('uses Stayman for the screenshot hand instead of bypassing four spades', () => {
    const ev = evaluateResponse(hand('9S 8S 5S 4S AH TH AD 7D KC JC TC 8C 2C'), '1NT');
    expect(ev.hcp).toBe(12);
    expect(ev.recommendedBid).toBe('2C');
    expect(ev.explanation.zh).toContain('先叫2♣');
    expect(ev.explanation.en).toContain('Stayman');
  });

  it('accepts 2C for the 20-HCP screenshot and retains room to explore slam', () => {
    const cards = hand('AS KS QS AH QH 7D 6D 4D 3D AC JC 3C 2C');
    const ev = evaluateResponse(cards, '1D');
    expect(ev.hcp).toBe(20);
    expect(ev.recommendedBid).toBe('2C');
    expect(ev.explanation.zh).toContain('二盖一逼局');
    expect(ev.explanation.zh).toContain('漏贯');
    expect(ev.explanation.zh).not.toContain('6–9');
  });

  it('uses transfers even for weak hands, and distinguishes invitations from strong hands', () => {
    expect(evaluateResponse(hand('QS JS 9S 8S 4S 7H 5H 3H 8D 4D 2D 9C 3C'), '1NT').recommendedBid).toBe('2H');
    expect(evaluateResponse(hand('8S 4S 2S KH QH JH 9H 5H 7D 4D 2D 8C 3C'), '1NT').recommendedBid).toBe('2D');
    const fourSpades = hand('KS QS 8S 4S QH 7H 3H JD 6D 2D 9C 4C 2C');
    expect(evaluateResponse(fourSpades, '1NT').recommendedBid).toBe('2C');
    const inv = evaluateResponse(hand('AS 8S 4S KH 7H 3H AD 6D 2D 9C 7C 4C 2C'), '1D');
    expect(inv.hcp).toBe(11);
    expect(inv.recommendedBid).toBe('2NT');
    expect(inv.explanation.zh).toContain('11–12');
    const strongNT = evaluateResponse(hand('AS KS 4S AH QH 3H KD 6D 2D 9C 7C 4C 2C'), '1NT');
    expect(strongNT.hcp).toBe(16);
    expect(strongNT.recommendedBid).toBe('4NT');
  });

  it('filters calls by auction legality for each opening', () => {
    for (const c of ['1C', '1D', '1H', '1S', '1NT']) expect(isLegalDrillResponse('1NT', c)).toBe(false);
    for (const c of ['Pass', '2C', '2D', '2H', '2S', '2NT', '3NT']) expect(isLegalDrillResponse('1NT', c)).toBe(true);
    expect(isLegalDrillResponse('1S', '1H')).toBe(false);
    expect(isLegalDrillResponse('1H', '1S')).toBe(true);
    expect(isLegalDrillResponse('1D', 'Dbl')).toBe(false);
    expect(isLegalDrillOvercall('1D', 'Dbl')).toBe(true);
    expect(isLegalDrillOvercall('1S', '1H')).toBe(false);
  });

  it('starts natural one-level overcalls at eight and non-jump two-level overcalls at eleven', () => {
    const eight = hand('QS JS TS 9S 8S KH 7H 3H QD 4D 2D 9C 3C');
    expect(evaluateOvercall(eight, '1D').hcp).toBe(8);
    expect(evaluateOvercall(eight, '1D').recommendedBid).toBe('1S');
    expect(evaluateOvercall(hand('QS JS TS 9S 8S KH 7H 3H JD 4D 2D 9C 3C'), '1D').recommendedBid).toBe('Pass');
    const eleven = hand('8S 4S AH QH JH 9H 8H 7D 4D 2D AC 9C 3C');
    expect(evaluateOvercall(eleven, '1S').hcp).toBe(11);
    expect(evaluateOvercall(eleven, '1S').recommendedBid).toBe('2H');
    expect(evaluateOvercall(hand('8S 4S AH QH JH 9H 8H 7D 4D 2D KC 9C 3C'), '1S').recommendedBid).toBe('Pass');
  });

  it('requires twelve and shape for a normal double, and never mistakes a non-jump for a weak jump', () => {
    const twelve = hand('AS KS 8S 4S KH 9H 7H 2H 9D 3D QC 8C 5C');
    expect(evaluateOvercall(twelve, '1D').hcp).toBe(12);
    expect(evaluateOvercall(twelve, '1D').recommendedBid).toBe('Dbl');
    expect(evaluateOvercall(hand('AS KS 8S 4S KH 9H 7H 2H 9D 3D JC 8C 5C'), '1D').recommendedBid).toBe('Pass');
    const weakSixHearts = hand('8S 4S AH KH 9H 8H 7H 6H JD 4D 2D 9C 3C');
    expect(evaluateOvercall(weakSixHearts, '1S').recommendedBid).toBe('Pass');
    expect(evaluateOvercall(weakSixHearts, '1D').recommendedBid).toBe('2H');
    expect(evaluateOvercall(twelve, '1D').mnemonic.zh).toContain('约多需3点');
  });

  it('generates legal answers without falling strong hands into a limited NT response', () => {
    let seed = 8934;
    const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    for (const opening of ['1C', '1D', '1H', '1S', '1NT'] as const) {
      for (let i = 0; i < 150; i++) {
        const { evaluation: ev } = generateResponseDrillHand(opening, rng);
        expect(isLegalDrillResponse(opening, ev.recommendedBid)).toBe(true);
        if (ev.recommendedBid === '1NT') expect(ev.hcp).toBeLessThanOrEqual(opening === '1C' || opening === '1D' ? 10 : 12);
      }
    }
    for (const opening of ['1C', '1D', '1H', '1S'] as const) {
      for (let i = 0; i < 80; i++) {
        const { evaluation: ev } = generateOvercallDrillHand(opening, rng);
        expect(isLegalDrillOvercall(opening, ev.recommendedBid)).toBe(true);
        expect(ev.explanation.en).not.toContain('10-5-2');
      }
    }
  });
});
