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

import { parseCard, seatSide } from './deck.js';
import type { Card, Seat, Hands } from './deck.js';
import type { Bid, Contract } from './bidding.js';
import { Auction, parseBid, bidLabel } from './bidding.js';
import { PlayState, trickWinner } from './play.js';
import { scoreContract } from './scoring.js';
import type { ScoreBreakdown } from './scoring.js';

export type BidAction =
  | { seat: Seat; bid: string; note?: string }
  | { seat: Seat; learner: true; expected: string; hint: string; note?: string };

export type PlayAction =
  | { seat: Seat; card: string }
  | { seat: Seat; learner: true; expected: string; hint: string };

export type Step =
  | { kind: 'info'; text: string; review?: { columns: string[]; rows: string[][] } }
  | { kind: 'quiz'; question: string; options: string[]; answer: number; explain: string }
  | { kind: 'auction'; script: BidAction[] }
  /** `runout` marks the tail of a hand that is already settled — the
   *  defense has beaten the contract (or declarer has made it) and the
   *  remaining tricks are bookkeeping. The UI turns the whole step into a
   *  single "play it out" tap instead of asking for 12 more cards. Only
   *  opt in where the tricks really teach nothing: in most lessons the
   *  last tricks ARE the lesson (counting, cashing winners, the wrap-up),
   *  so the flag is deliberately per-step and off by default. */
  | { kind: 'play'; script: PlayAction[]; runout?: boolean }
  | { kind: 'result' };

export interface Lesson {
  id: string;
  title: string;
  /** Only the opening card receives detailed automatic commentary. */
  openingLeadAnalysis?: string;
  focus?: string;
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

/** The chair the learner actually sits in.
 *
 *  Almost every lesson is written from the DECLARER's chair (South), so the
 *  seat is never stated — but the two defense lessons hand the learner a
 *  defender's chair: West in the opening-lead lesson, East in the
 *  play-with-partner one. The chair is encoded in the script itself, in the
 *  actions marked `learner: true`: defending, every learner action sits in
 *  one defender's seat; declaring, the learner plays BOTH his own hand and
 *  the dummy's, so the chair to report is the declarer's (South), never the
 *  dummy's.
 *
 *  Anything that says "you", "partner" or "your side" (the trick review,
 *  the win/lose reaction) has to agree with this, or a defender's dummy
 *  gets congratulated as his partner. */
export function learnerSeatOf(lesson: Lesson): Seat {
  const seats = new Set<Seat>();
  for (const step of lesson.steps) {
    if (step.kind === 'play') {
      for (const a of step.script) if (isLearnerPlay(a)) seats.add(a.seat);
    } else if (step.kind === 'auction') {
      for (const a of step.script) if (isLearnerBid(a)) seats.add(a.seat);
    }
  }
  // Defending: the learner owns one of the East-West chairs.
  for (const s of ['W', 'E'] as Seat[]) if (seats.has(s)) return s;
  // Declaring: South is the declarer's chair (North is the dummy).
  return 'S';
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
  private history: Array<{ step: number; action: number }> = [];

  canGoBack(): boolean { return this.history.length > 0; }

  /** Rebuild the exact earlier position, including bids, hands and scores. */
  goBack(): boolean {
    const target = this.history.pop();
    if (!target) return false;
    const replay = new TutorialRunner(this.lesson);
    let guard = 0;
    while ((replay.stepIdx !== target.step || replay.actionIdx !== target.action) && guard++ < 3000) {
      const step = replay.currentStep();
      if (!step) throw new Error('invalid rewind position');
      if (step.kind === 'quiz') replay.answerQuiz(step.answer);
      else {
        const pending = replay.pendingLearnerAction();
        if (pending) {
          if (pending.kind === 'bid') replay.submitBid(pending.expected);
          else replay.submitPlay(pending.expected);
        } else replay.advance();
      }
    }
    if (guard >= 3000) throw new Error('rewind replay limit');
    this.stepIdx = replay.stepIdx;
    this.actionIdx = replay.actionIdx;
    this.auction.entries.splice(0, this.auction.entries.length, ...replay.auction.entries);
    this.auction.turn = replay.auction.turn;
    this.playState = replay.playState;
    return true;
  }

  private remember(): void { this.history.push({ step: this.stepIdx, action: this.actionIdx }); }

  constructor(lesson: Lesson) {
    this.lesson = lesson;
    this.auction = new Auction(lesson.dealer);
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

  /**
   * Advance one beat. Past info/result steps, or reveal the next scripted
   * bid/play (one tap per card/bid so the learner sees every detail step).
   * Throws when the runner is waiting for a learner action.
   */
  advance(): void {
    const s = this.currentStep();
    if (!s) throw new Error('lesson finished');
    if (s.kind === 'info' || s.kind === 'result') {
      this.remember();
      this.stepIdx++;
      this.actionIdx = 0;
      return;
    }
    if (s.kind === 'quiz') throw new Error('advance() is not for quiz steps');
    // play/auction step
    if (this.actionIdx >= s.script.length) {
      this.remember();
      // script complete → next step
      this.stepIdx++;
      this.actionIdx = 0;
      return;
    }
    const a = s.script[this.actionIdx]!;
    if (isLearnerBid(a as BidAction) || isLearnerPlay(a as PlayAction)) {
      throw new Error('waiting for learner action');
    }
    if (s.kind === 'auction') {
      const action = a as Extract<BidAction, { seat: Seat; bid: string }>;
      if (this.auction.turn !== action.seat) {
        throw new Error(`script error: expected ${action.seat} to bid, turn is ${this.auction.turn}`);
      }
      this.auction.apply(parseBid(action.bid));
      this.remember();
    } else {
      const action = a as Extract<PlayAction, { seat: Seat; card: string }>;
      const play = this.ensurePlay();
      if (play.turn !== action.seat) {
        throw new Error(`script error: expected ${action.seat} to play, turn is ${play.turn}`);
      }
      play.play(parseCard(action.card));
      this.remember();
    }
    this.actionIdx++;
    // Pause here — one tap reveals one action. No auto-continue.
  }

  /**
   * Play the hand out. Runs every remaining scripted card — including the
   * learner's scripted ones, which are forced anyway — until the next
   * non-play step, so the lesson still stops at its commentary and result
   * cards. Only used from a step authored with `runout`.
   */
  runOut(): void {
    let steps = 0;
    while (!this.finished && steps++ < 64) {
      const s = this.currentStep();
      if (!s || s.kind !== 'play') return;
      let cards = 0;
      while (cards++ < 64) {
        const cur = this.currentStep();
        if (cur !== s) break; // step exhausted, next step is current
        const idx = this.actionIdx;
        if (idx >= s.script.length) {
          this.advance();
          break;
        }
        const a = s.script[idx]!;
        if (isLearnerPlay(a)) {
          const r = this.submitPlay(a.expected);
          if (!r.ok) throw new Error(`runOut: scripted play ${a.expected} rejected`);
        } else {
          this.advance();
        }
      }
    }
  }

  answerQuiz(choice: number): SubmissionResult {
    const s = this.currentStep();
    if (!s || s.kind !== 'quiz') throw new Error('not a quiz step');
    if (choice === s.answer) {
      this.remember();
      this.stepIdx++;
      this.actionIdx = 0;
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
    this.remember();
    this.actionIdx++;
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
    this.remember();
    this.actionIdx++;
    return { ok: true };
  }

  /** How many tricks have been completed in the current play state. */
  completedTrickCount(): number {
    return this.playState ? this.playState.completedTricks.length : 0;
  }

  /** Conservative cash-out proof: one hand owns every remaining winner,
   * no partner honor can block it, and no defender can ruff a side suit.
   * Also replay the authored tail so claiming preserves the lesson score. */
  claimableRemaining(): number {
    const ps = this.playState;
    if (this.currentStep()?.kind !== 'play' || !ps || ps.currentTrick.length || ps.completedTricks.length === 0) return 0;
    if (seatSide(ps.turn) !== seatSide(learnerSeatOf(this.lesson))) return 0;
    const n = ps.hands[ps.turn].length;
    if (n < 2) return 0;
    const trump = ps.contract.denom === 'NT' ? null : ps.contract.denom;
    const others = (['N', 'E', 'S', 'W'] as Seat[]).filter(s => s !== ps.turn);
    const opponents = others.filter(s => seatSide(s) !== seatSide(ps.turn));
    const oneHandWinners = ps.hands[ps.turn].every(c =>
      !others.some(s => ps.hands[s].some(d => d.suit === c.suit && d.rank > c.rank)) &&
      (c.suit === trump || !opponents.some(s => ps.hands[s].some(d => d.suit === trump)))
    );
    // Both hands holding only the same established suit cannot block each
    // other: whichever partner wins must be able to lead that suit again.
    const partner = others.find(s => seatSide(s) === seatSide(ps.turn))!;
    const suit = ps.hands[ps.turn][0]!.suit;
    const sharedCards = [...ps.hands[ps.turn], ...ps.hands[partner]];
    const opposingHigh = Math.max(0, ...opponents.flatMap(s => ps.hands[s].filter(c => c.suit === suit).map(c => c.rank)));
    const sharedSuitWinners = sharedCards.every(c => c.suit === suit)
      && sharedCards.filter(c => c.rank > opposingHigh).length >= n
      && (suit === trump || !opponents.some(s => ps.hands[s].some(c => c.suit === trump)));
    if (!oneHandWinners && !sharedSuitWinners) return 0;
    const tail = this.simulateTail();
    if (!tail || tail.completedTricks.slice(ps.completedTricks.length)
      .some(trick => seatSide(trickWinner(trick, trump)) !== seatSide(ps.turn))) return 0;
    return n;
  }

  claimRemaining(): void {
    if (!this.claimableRemaining()) throw new Error('remaining tricks are not proven winners');
    this.remember();
    this.playState = this.simulateTail()!;
    let lastPlay = this.stepIdx;
    for (let i = this.stepIdx; i < this.lesson.steps.length; i++) {
      if (this.lesson.steps[i]!.kind === 'play') lastPlay = i;
    }
    this.stepIdx = lastPlay + 1;
    this.actionIdx = 0;
  }

  private simulateTail(): PlayState | null {
    const ps = this.playState!;
    const copy = new PlayState(ps.hands, ps.contract);
    copy.turn = ps.turn;
    copy.tricksWon.NS = ps.tricksWon.NS;
    copy.tricksWon.EW = ps.tricksWon.EW;
    copy.completedTricks.push(...ps.completedTricks);
    try {
      for (let i = this.stepIdx; i < this.lesson.steps.length; i++) {
        const step = this.lesson.steps[i]!;
        if (step.kind !== 'play') continue;
        for (const a of step.script.slice(i === this.stepIdx ? this.actionIdx : 0)) {
          if (copy.turn !== a.seat) return null;
          copy.play(parseCard('expected' in a ? a.expected : a.card));
        }
      }
    } catch { return null; }
    return copy.isComplete() ? copy : null;
  }

  /**
   * The most recently completed trick, for the post-trick review pause:
   * all four plays in order, who won, the trump suit (null at no-trump)
   * and the running trick score per side.
   */
  lastCompletedTrick(): {
    plays: Array<{ seat: Seat; card: Card }>;
    winner: Seat;
    trump: Card['suit'] | null;
    tricksWon: Record<'NS' | 'EW', number>;
  } | null {
    if (!this.playState || this.playState.completedTricks.length === 0) return null;
    const plays = this.playState.completedTricks[this.playState.completedTricks.length - 1]!;
    const trump = this.playState.contract.denom === 'NT' ? null : (this.playState.contract.denom as Card['suit']);
    return {
      plays: plays.map(p => ({ seat: p.seat, card: { ...p.card } })),
      winner: trickWinner(plays, trump),
      trump,
      tricksWon: { ...this.playState.tricksWon },
    };
  }

  /** Score of the completed hand, or null if play isn't finished. */
  getResult(): ScoreBreakdown | null {
    if (!this.playState || !this.playState.isComplete()) return null;
    const c = this.lesson.contract;
    return scoreContract(c, this.playState.declarerTricks(), this.lesson.vulnerable);
  }

  /** For UI: auction entries + whose turn for the current auction step. */
  auctionView(): { entries: Array<{ seat: Seat; bid: Bid }>; turn: Seat } | null {
    const s = this.currentStep();
    if (!s || s.kind !== 'auction') return null;
    return { entries: this.auction.entries.map(e => ({ seat: e.seat, bid: e.bid })), turn: this.auction.turn };
  }

  /** 1-based number of the trick currently being played, for UI progress. */
  trickNumber(): number | null {
    const s = this.currentStep();
    if (!s || s.kind !== 'play') return null;
    return this.ensurePlay().completedTricks.length + 1;
  }

  /** For UI: live play state for the current play step (hands shrink as cards are played). */
  playView(): {
    hands: Hands;
    trick: Array<{ seat: Seat; card: Card }>;
    contract: Contract | null;
    turn: Seat;
    tricksWon: Record<'NS' | 'EW', number>;
  } | null {
    const s = this.currentStep();
    if (!s || s.kind !== 'play') return null;
    const ps = this.ensurePlay();
    return {
      hands: ps.hands,
      trick: ps.currentTrick.map(t => ({ seat: t.seat, card: { ...t.card } })),
      contract: this.lesson.contract,
      turn: ps.turn,
      tricksWon: { ...ps.tricksWon },
    };
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
