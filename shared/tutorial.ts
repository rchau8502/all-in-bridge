/**
 * tutorial.ts — scripted interactive lessons.
 *
 * The tutorial is the single-player experience. There are NO AI opponents:
 * every lesson is a fixed script — fixed hands, fixed scripted bids/plays —
 * and the learner must take the correct actions at the marked teaching
 * moments. The runner validates each action and gives hints on mistakes.
 *
 * Lesson text is plain English for now; milestone 7 (i18n) moves it into
 * the locale files.
 */

import { parseCard } from './deck.js';
import type { Card, Seat, Hands } from './deck.js';
import type { Bid, Contract } from './bidding.js';
import { Auction, parseBid, bidLabel } from './bidding.js';
import { PlayState } from './play.js';
import { scoreContract } from './scoring.js';
import type { ScoreBreakdown } from './scoring.js';

export type BidAction =
  | { seat: Seat; bid: string }
  | { seat: Seat; learner: true; expected: string; hint: string };

export type PlayAction =
  | { seat: Seat; card: string }
  | { seat: Seat; learner: true; expected: string; hint: string };

export type Step =
  | { kind: 'info'; text: string }
  | { kind: 'quiz'; question: string; options: string[]; answer: number; explain: string }
  | { kind: 'auction'; script: BidAction[] }
  | { kind: 'play'; script: PlayAction[] }
  | { kind: 'result' };

export interface Lesson {
  id: string;
  title: string;
  dealer: Seat;
  /** Fixed deal for the lesson. */
  hands: Hands;
  /** The contract the lesson's auction must produce (authoring check). */
  contract: Contract;
  vulnerable: boolean;
  steps: Step[];
}

function isLearnerBid(a: BidAction): a is Extract<BidAction, { learner: true }> {
  return 'learner' in a && a.learner === true;
}

function isLearnerPlay(a: PlayAction): a is Extract<PlayAction, { learner: true }> {
  return 'learner' in a && a.learner === true;
}

export interface SubmissionResult {
  ok: boolean;
  /** Hint or explanation shown on failure. */
  hint?: string;
}

export class TutorialRunner {
  private lesson: Lesson;
  private stepIdx = 0;
  private actionIdx = 0;
  readonly auction: Auction;
  private playState: PlayState | null = null;

  constructor(lesson: Lesson) {
    this.lesson = lesson;
    this.auction = new Auction(lesson.dealer);
    this.settle();
  }

  get finished(): boolean {
    return this.stepIdx >= this.lesson.steps.length;
  }

  /** 0-based index of the current step (for progress bars). */
  get stepIndex(): number {
    return Math.min(this.stepIdx, this.lesson.steps.length);
  }

  get totalSteps(): number {
    return this.lesson.steps.length;
  }

  currentStep(): Step | null {
    if (this.finished) return null;
    return this.lesson.steps[this.stepIdx]!;
  }

  /** Advance past info/result steps. */
  advance(): void {
    const s = this.currentStep();
    if (!s || (s.kind !== 'info' && s.kind !== 'result')) {
      throw new Error('advance() is only for info/result steps');
    }
    this.stepIdx++;
    this.actionIdx = 0;
    this.settle();
  }

  answerQuiz(choice: number): SubmissionResult {
    const s = this.currentStep();
    if (!s || s.kind !== 'quiz') throw new Error('not a quiz step');
    if (choice === s.answer) {
      this.stepIdx++;
      this.actionIdx = 0;
      this.settle();
      return { ok: true, hint: s.explain };
    }
    return { ok: false, hint: 'Not quite — try again.' };
  }

  submitBid(label: string): SubmissionResult {
    const action = this.pendingLearnerBid();
    if (!action) throw new Error('no bid expected right now');
    let bid: Bid;
    try {
      bid = parseBid(label);
    } catch {
      return { ok: false, hint: action.hint };
    }
    if (bidLabel(bid) !== bidLabel(parseBid(action.expected))) {
      return { ok: false, hint: action.hint };
    }
    if (this.auction.turn !== action.seat) {
      throw new Error(`script error: expected ${action.seat} to bid, turn is ${this.auction.turn}`);
    }
    this.auction.apply(bid);
    this.actionIdx++;
    this.settle();
    return { ok: true };
  }

  submitPlay(label: string): SubmissionResult {
    const action = this.pendingLearnerPlay();
    if (!action) throw new Error('no play expected right now');
    const play = this.ensurePlay();
    let card: Card;
    try {
      card = parseCard(label);
    } catch {
      return { ok: false, hint: action.hint };
    }
    const expected = parseCard(action.expected);
    const same = card.suit === expected.suit && card.rank === expected.rank;
    if (!same) {
      return { ok: false, hint: action.hint };
    }
    if (play.turn !== action.seat) {
      throw new Error(`script error: expected ${action.seat} to play, turn is ${play.turn}`);
    }
    play.play(card);
    this.actionIdx++;
    this.settle();
    return { ok: true };
  }

  /** Score of the completed hand, or null if play isn't finished. */
  getResult(): ScoreBreakdown | null {
    if (!this.playState || !this.playState.isComplete()) return null;
    const c = this.lesson.contract;
    return scoreContract(c, this.playState.declarerTricks(), this.lesson.vulnerable);
  }

  /**
   * The action the learner must take right now, or null if the current step
   * doesn't need input. The UI uses this to prompt (and to offer the hint).
   */
  pendingLearnerAction(): { kind: 'bid' | 'play'; seat: Seat; expected: string; hint: string } | null {
    const s = this.currentStep();
    if (!s) return null;
    if (s.kind === 'auction') {
      const a = this.pendingLearnerBid();
      return a ? { kind: 'bid', seat: a.seat, expected: a.expected, hint: a.hint } : null;
    }
    if (s.kind === 'play') {
      const a = this.pendingLearnerPlay();
      return a ? { kind: 'play', seat: a.seat, expected: a.expected, hint: a.hint } : null;
    }
    return null;
  }

  /** Lazily built once the auction is done; verifies the lesson's contract. */
  private ensurePlay(): PlayState {
    if (!this.playState) {
      let c: Contract | null;
      if (this.auction.entries.length === 0) {
        // Lesson presets the contract without an auction (e.g. tricks lesson).
        c = this.lesson.contract;
      } else {
        if (!this.auction.isComplete()) throw new Error('auction not complete before play');
        c = this.auction.contract();
        const want = this.lesson.contract;
        const match =
          c !== null &&
          c.level === want.level &&
          c.denom === want.denom &&
          c.declarer === want.declarer &&
          c.doubled === want.doubled;
        if (!match) {
          throw new Error(
            `lesson script error: auction produced ${c ? bidLabel({ type: 'bid', level: c.level, denom: c.denom }) + ' by ' + c.declarer : 'pass-out'}, lesson expects ${want.level}${want.denom} by ${want.declarer}`
          );
        }
      }
      this.playState = new PlayState(this.lesson.hands, c!);
    }
    return this.playState;
  }

  /** Apply scripted actions until a learner action, the script end, or lesson end. */
  private settle(): void {
    for (;;) {
      const s = this.currentStep();
      if (!s) return;
      if (s.kind !== 'auction' && s.kind !== 'play') return; // info/quiz/result wait
      if (this.actionIdx >= s.script.length) {
        this.stepIdx++;
        this.actionIdx = 0;
        continue;
      }
      if (s.kind === 'auction') {
        const a = s.script[this.actionIdx] as BidAction;
        if (isLearnerBid(a)) return; // wait for the learner
        if (this.auction.turn !== a.seat) {
          throw new Error(`script error: expected ${a.seat} to bid, turn is ${this.auction.turn}`);
        }
        this.auction.apply(parseBid(a.bid));
      } else {
        const a = s.script[this.actionIdx] as PlayAction;
        if (isLearnerPlay(a)) return; // wait for the learner
        const play = this.ensurePlay();
        if (play.turn !== a.seat) {
          throw new Error(`script error: expected ${a.seat} to play, turn is ${play.turn}`);
        }
        play.play(parseCard(a.card));
      }
      this.actionIdx++;
    }
  }

  private pendingLearnerBid(): Extract<BidAction, { learner: true }> | null {
    const s = this.currentStep();
    if (!s || s.kind !== 'auction') return null;
    const a = s.script[this.actionIdx];
    return a && isLearnerBid(a) ? a : null;
  }

  private pendingLearnerPlay(): Extract<PlayAction, { learner: true }> | null {
    const s = this.currentStep();
    if (!s || s.kind !== 'play') return null;
    this.ensurePlay(); // idempotent; needed when the step opens with a learner action
    const a = s.script[this.actionIdx];
    return a && isLearnerPlay(a) ? a : null;
  }
}
