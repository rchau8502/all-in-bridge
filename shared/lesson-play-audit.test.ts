import { describe, it, expect } from 'vitest';
import { getLessons } from './lessons.js';
import { PLAY_AUDITS } from './lesson-play-audit-data.js';
import { cardLabel, type Seat } from './deck.js';
import { PlayState } from './play.js';
import { BASIC_FORCING_STATUS } from './forcing-notes.js';
import { TutorialRunner } from './tutorial.js';

describe('independent exact-solver review of tutorial play', () => {
  it('covers every authored card in every play lesson, with the actual deal and contract', () => {
    const lessons = getLessons('en').filter(l => l.steps.some(s => s.kind === 'play'));
    expect(PLAY_AUDITS.map(a => a.id)).toEqual(lessons.map(l => l.id));
    expect(PLAY_AUDITS.reduce((n, a) => n + a.trace.length, 0)).toBe(500);
    for (const l of lessons) {
      const audit = PLAY_AUDITS.find(a => a.id === l.id)!;
      expect(audit.contract, l.id).toEqual(l.contract);
      for (const seat of ['N', 'E', 'S', 'W'] as Seat[]) {
        expect(audit.hands[seat], `${l.id} ${seat}`).toEqual(l.hands[seat].map(cardLabel).sort());
      }
      const plays = l.steps.flatMap(s => s.kind === 'play' ? s.script : []);
      expect(audit.trace.map(a => a.slice(0, 2)), l.id)
        .toEqual(plays.map(a => [a.seat, 'expected' in a ? a.expected : a.card]));
      audit.trace.forEach(([, , best, chosen], index) => {
        // An opening lead is selected without seeing dummy. These two
        // natural side-suit/sequence leads are documented in the audit.
        if (index === 0 && ['trump', 'scoring'].includes(l.id)) return;
        expect(chosen, `${l.id} card ${index + 1}`).toBe(best);
      });
    }
  });

  it('preserves club unblocking, the heart finesse and the two separate trump tricks', () => {
    const plays = (id: string) => getLessons('en').find(l => l.id === id)!.steps
      .flatMap(s => s.kind === 'play' ? s.script : []).map(a => [a.seat, 'expected' in a ? a.expected : a.card]);
    expect(plays('strategy').slice(28, 32)).toEqual([['N', '4C'], ['E', '3C'], ['S', 'QC'], ['W', '6C']]);
    expect(plays('defense-rules').slice(20, 24)).toEqual([['S', '2H'], ['W', 'TH'], ['N', 'QH'], ['E', '4H']]);
    expect(plays('full-hand').slice(40, 44)).toEqual([['E', 'JS'], ['S', '8S'], ['W', 'AS'], ['N', '9H']]);
    expect(plays('scoring')).toEqual([['W', 'JD'], ['N', 'QD'], ['E', '4D'], ['S', '7D']]);
  });

  it('retains a real short-hand ruff and discards losers on club winners', () => {
    const l = getLessons('en').find(l => l.id === 'eliminate')!;
    const state = new PlayState(l.hands, l.contract);
    const ruffs: string[] = [];
    for (const step of l.steps) if (step.kind === 'play') for (const action of step.script) {
      const text = 'expected' in action ? action.expected : action.card;
      if (action.seat === 'N' && state.ledSuit() === 'D' && text.endsWith('H')) ruffs.push(text);
      state.play({ suit: text[1] as 'S' | 'H' | 'D' | 'C', rank: '23456789TJQKA'.indexOf(text[0]!) + 2 });
    }
    expect(ruffs).toEqual(['9H']);
    expect(state.declarerTricks()).toBe(10);
  });

  it('allows the two remaining established spade tricks to be claimed across both hands', () => {
    const r = new TutorialRunner(getLessons('en').find(l => l.id === 'long-suits')!);
    let guard = 0;
    while (!r.finished && !r.claimableRemaining() && guard++ < 300) {
      const s = r.currentStep()!;
      if (s.kind === 'info' || s.kind === 'result') r.advance();
      else {
        const p = r.pendingLearnerAction();
        if (p?.kind === 'play') r.submitPlay(p.expected);
        else r.advance();
      }
    }
    expect(r.claimableRemaining()).toBe(2);
    r.claimRemaining();
    expect(r.getResult()?.tricksTaken).toBe(9);
    expect(r.goBack()).toBe(true);
    expect(r.claimableRemaining()).toBe(2);
  });
});

describe('bidding examples follow their stated agreements', () => {
  it('uses honest opening values, major length and balanced notrump openings', () => {
    for (const l of getLessons('en')) {
      const actions = l.steps.flatMap(s => s.kind === 'auction' ? s.script : []);
      const first = actions.find(a => ('expected' in a ? a.expected : a.bid) !== 'P');
      if (!first) continue;
      const call = 'expected' in first ? first.expected : first.bid;
      const hand = l.hands[first.seat];
      const hcp = hand.reduce((n, c) => n + Math.max(0, c.rank - 10), 0);
      if (/^2[DHS]$/.test(call)) {
        expect(hcp, l.id).toBeGreaterThanOrEqual(6);
        expect(hcp, l.id).toBeLessThanOrEqual(10);
        expect(hand.filter(c => c.suit === call[1]).length, l.id).toBeGreaterThanOrEqual(6);
      } else {
        expect(hcp, l.id).toBeGreaterThanOrEqual(12);
      }
      if (call === '1S' || call === '1H') expect(hand.filter(c => c.suit === call[1]).length, l.id).toBeGreaterThanOrEqual(5);
      if (call === '1NT') {
        expect(hcp, l.id).toBeGreaterThanOrEqual(15);
        expect(hcp, l.id).toBeLessThanOrEqual(17);
        expect(['S', 'H', 'D', 'C'].map(s => hand.filter(c => c.suit === s).length).sort()[0], l.id).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('actually demonstrates fourth-suit forcing and correctly labels constructive support after a reverse', () => {
    const l = getLessons('en').find(l => l.id === 'game-forcing-auctions')!;
    const calls = l.steps.flatMap(s => s.kind === 'auction' ? s.script : [])
      .map(a => 'expected' in a ? a.expected : a.bid).filter(b => b !== 'P');
    expect(calls).toEqual(['1H', '1S', '2C', '2D', '2S', '4S']);
    expect(l.hands.S.filter(c => c.suit === 'S')).toHaveLength(3);
    expect(l.hands.N.filter(c => c.suit === 'S')).toHaveLength(5);
    expect(BASIC_FORCING_STATUS['reverse-bids']![3]).toBe('GF');
  });
});
