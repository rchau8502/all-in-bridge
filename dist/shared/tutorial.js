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
import { Auction, parseBid, bidLabel } from './bidding.js';
import { PlayState } from './play.js';
import { scoreContract } from './scoring.js';
function isLearnerBid(a) {
    return 'learner' in a && a.learner === true;
}
function isLearnerPlay(a) {
    return 'learner' in a && a.learner === true;
}
export class TutorialRunner {
    constructor(lesson) {
        this.stepIdx = 0;
        this.actionIdx = 0;
        this.playState = null;
        this.lesson = lesson;
        this.auction = new Auction(lesson.dealer);
        this.settle();
    }
    get finished() {
        return this.stepIdx >= this.lesson.steps.length;
    }
    /** 0-based index of the current step (for progress bars). */
    get stepIndex() {
        return Math.min(this.stepIdx, this.lesson.steps.length);
    }
    get totalSteps() {
        return this.lesson.steps.length;
    }
    currentStep() {
        if (this.finished)
            return null;
        return this.lesson.steps[this.stepIdx];
    }
    /** Advance past info/result steps. */
    advance() {
        const s = this.currentStep();
        if (!s || (s.kind !== 'info' && s.kind !== 'result')) {
            throw new Error('advance() is only for info/result steps');
        }
        this.stepIdx++;
        this.actionIdx = 0;
        this.settle();
    }
    answerQuiz(choice) {
        const s = this.currentStep();
        if (!s || s.kind !== 'quiz')
            throw new Error('not a quiz step');
        if (choice === s.answer) {
            this.stepIdx++;
            this.actionIdx = 0;
            this.settle();
            return { ok: true, hint: s.explain };
        }
        return { ok: false, hint: 'Not quite — try again.' };
    }
    submitBid(label) {
        const action = this.pendingLearnerBid();
        if (!action)
            throw new Error('no bid expected right now');
        let bid;
        try {
            bid = parseBid(label);
        }
        catch {
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
    submitPlay(label) {
        const action = this.pendingLearnerPlay();
        if (!action)
            throw new Error('no play expected right now');
        const play = this.ensurePlay();
        let card;
        try {
            card = parseCard(label);
        }
        catch {
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
    getResult() {
        if (!this.playState || !this.playState.isComplete())
            return null;
        const c = this.lesson.contract;
        return scoreContract(c, this.playState.declarerTricks(), this.lesson.vulnerable);
    }
    /** For UI: auction entries + whose turn for the current auction step. */
    auctionView() {
        const s = this.currentStep();
        if (!s || s.kind !== 'auction')
            return null;
        return { entries: this.auction.entries.map(e => ({ seat: e.seat, bid: e.bid })), turn: this.auction.turn };
    }
    /** For UI: live play state for the current play step (hands shrink as cards are played). */
    playView() {
        const s = this.currentStep();
        if (!s || s.kind !== 'play')
            return null;
        const ps = this.ensurePlay();
        return {
            hands: ps.hands,
            trick: ps.currentTrick.map(t => ({ seat: t.seat, card: { ...t.card } })),
            contract: this.lesson.contract,
            turn: ps.turn,
        };
    }
    /**
     * The action the learner must take right now, or null if the current step
     * doesn't need input. The UI uses this to prompt (and to offer the hint).
     */
    pendingLearnerAction() {
        const s = this.currentStep();
        if (!s)
            return null;
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
    ensurePlay() {
        if (!this.playState) {
            let c;
            if (this.auction.entries.length === 0) {
                // Lesson presets the contract without an auction (e.g. tricks lesson).
                c = this.lesson.contract;
            }
            else {
                if (!this.auction.isComplete())
                    throw new Error('auction not complete before play');
                c = this.auction.contract();
                const want = this.lesson.contract;
                const match = c !== null &&
                    c.level === want.level &&
                    c.denom === want.denom &&
                    c.declarer === want.declarer &&
                    c.doubled === want.doubled;
                if (!match) {
                    throw new Error(`lesson script error: auction produced ${c ? bidLabel({ type: 'bid', level: c.level, denom: c.denom }) + ' by ' + c.declarer : 'pass-out'}, lesson expects ${want.level}${want.denom} by ${want.declarer}`);
                }
            }
            this.playState = new PlayState(this.lesson.hands, c);
        }
        return this.playState;
    }
    /** Apply scripted actions until a learner action, the script end, or lesson end. */
    settle() {
        for (;;) {
            const s = this.currentStep();
            if (!s)
                return;
            if (s.kind !== 'auction' && s.kind !== 'play')
                return; // info/quiz/result wait
            if (this.actionIdx >= s.script.length) {
                this.stepIdx++;
                this.actionIdx = 0;
                continue;
            }
            if (s.kind === 'auction') {
                const a = s.script[this.actionIdx];
                if (isLearnerBid(a))
                    return; // wait for the learner
                if (this.auction.turn !== a.seat) {
                    throw new Error(`script error: expected ${a.seat} to bid, turn is ${this.auction.turn}`);
                }
                this.auction.apply(parseBid(a.bid));
            }
            else {
                const a = s.script[this.actionIdx];
                if (isLearnerPlay(a))
                    return; // wait for the learner
                const play = this.ensurePlay();
                if (play.turn !== a.seat) {
                    throw new Error(`script error: expected ${a.seat} to play, turn is ${play.turn}`);
                }
                play.play(parseCard(a.card));
            }
            this.actionIdx++;
        }
    }
    pendingLearnerBid() {
        const s = this.currentStep();
        if (!s || s.kind !== 'auction')
            return null;
        const a = s.script[this.actionIdx];
        return a && isLearnerBid(a) ? a : null;
    }
    pendingLearnerPlay() {
        const s = this.currentStep();
        if (!s || s.kind !== 'play')
            return null;
        this.ensurePlay(); // idempotent; needed when the step opens with a learner action
        const a = s.script[this.actionIdx];
        return a && isLearnerPlay(a) ? a : null;
    }
}
//# sourceMappingURL=tutorial.js.map