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
import type { Card, Seat, Hands } from './deck.js';
import type { Bid, Contract } from './bidding.js';
import { Auction } from './bidding.js';
import type { ScoreBreakdown } from './scoring.js';
export type BidAction = {
    seat: Seat;
    bid: string;
} | {
    seat: Seat;
    learner: true;
    expected: string;
    hint: string;
};
export type PlayAction = {
    seat: Seat;
    card: string;
} | {
    seat: Seat;
    learner: true;
    expected: string;
    hint: string;
};
export type Step = {
    kind: 'info';
    text: string;
} | {
    kind: 'quiz';
    question: string;
    options: string[];
    answer: number;
    explain: string;
} | {
    kind: 'auction';
    script: BidAction[];
} | {
    kind: 'play';
    script: PlayAction[];
} | {
    kind: 'result';
};
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
export interface SubmissionResult {
    ok: boolean;
    /** Hint or explanation shown on failure. */
    hint?: string;
}
export declare class TutorialRunner {
    private lesson;
    private stepIdx;
    private actionIdx;
    readonly auction: Auction;
    private playState;
    constructor(lesson: Lesson);
    get finished(): boolean;
    /** 0-based index of the current step (for progress bars). */
    get stepIndex(): number;
    get totalSteps(): number;
    currentStep(): Step | null;
    /** Advance past info/result steps. */
    advance(): void;
    answerQuiz(choice: number): SubmissionResult;
    submitBid(label: string): SubmissionResult;
    submitPlay(label: string): SubmissionResult;
    /** Score of the completed hand, or null if play isn't finished. */
    getResult(): ScoreBreakdown | null;
    /** For UI: auction entries + whose turn for the current auction step. */
    auctionView(): {
        entries: Array<{
            seat: Seat;
            bid: Bid;
        }>;
        turn: Seat;
    } | null;
    /** For UI: live play state for the current play step (hands shrink as cards are played). */
    playView(): {
        hands: Hands;
        trick: Array<{
            seat: Seat;
            card: Card;
        }>;
        contract: Contract | null;
        turn: Seat;
    } | null;
    /**
     * The action the learner must take right now, or null if the current step
     * doesn't need input. The UI uses this to prompt (and to offer the hint).
     */
    pendingLearnerAction(): {
        kind: 'bid' | 'play';
        seat: Seat;
        expected: string;
        hint: string;
    } | null;
    /** Lazily built once the auction is done; verifies the lesson's contract. */
    private ensurePlay;
    /** Apply scripted actions until a learner action, the script end, or lesson end. */
    private settle;
    private pendingLearnerBid;
    private pendingLearnerPlay;
}
//# sourceMappingURL=tutorial.d.ts.map