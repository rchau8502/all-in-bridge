import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../App.js';
import { t, bidLabelL, seatLabel, type Lang } from '../i18n.js';
import { CardView, Avatar } from '../components/ui.js';
import { audio } from '../audio.js';
import { TutorialRunner } from '../../../shared/tutorial.js';
import type { Lesson } from '../../../shared/tutorial.js';
import { explainTrick, type TrickReviewData } from '../trickExplain.js';
import { CHARACTERS } from '../../../shared/characters.js';
import { getLessons } from '../../../shared/lessons.js';
import type { Bid } from '../../../shared/bidding.js';
import { cardLabel, sortHand, partnerOf } from '../../../shared/deck.js';
import type { Card, Seat, Suit } from '../../../shared/deck.js';

/** Bidding-box column order, per club convention: NT leftmost, clubs rightmost. */
const DENOM_ORDER = ['NT', 'S', 'H', 'D', 'C'] as const;

/** Track which item signatures have already been shown, so entrance
 *  animations + sounds fire only for newly-appeared cards (per step). */
function useFreshOrder(sigs: string[], stepKey: string): Map<string, number> {
  const keyRef = useRef('');
  const seenRef = useRef<Set<string>>(new Set());
  if (keyRef.current !== stepKey) {
    keyRef.current = stepKey;
    seenRef.current = new Set();
  }
  const order = new Map<string, number>();
  let i = 0;
  for (const s of sigs) {
    if (!seenRef.current.has(s)) order.set(s, i++);
  }
  useEffect(() => {
    for (const s of sigs) seenRef.current.add(s);
  });
  return order;
}

/** Seat position around the sim table, always from South's viewpoint. */
function simPos(seat: Seat): 'top' | 'left' | 'right' | 'bottom' {
  return seat === 'N' ? 'top' : seat === 'W' ? 'left' : seat === 'E' ? 'right' : 'bottom';
}

/** Rotating coach praise for correct actions — like a friend cheering you on. */
const PRAISE: Record<Lang, string[]> = {
  en: ['Nice one! 🎉', 'Exactly right!', "That's it!", 'Perfect! 👏', 'You got it!'],
  zh: ['太棒了！🎉', '完全正确！', '对，就是这样！', '漂亮！👏', '答对啦！'],
};

/** Typewriter dialogue, like an RPG: text reveals code-point by code-point
 *  (emoji-safe), with a soft blip every few chars. CJK chars type slower.
 *  Honors prefers-reduced-motion: shows the full line instantly. */
const REDUCED_MOTION = typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useTypewriter(text: string) {
  const chars = useMemo(() => Array.from(text), [text]);
  const [shown, setShown] = useState(() => (REDUCED_MOTION ? chars.length : 0));
  const done = shown >= chars.length;
  useEffect(() => {
    if (REDUCED_MOTION || shown >= chars.length) return;
    const cjk = /[\u2e80-\u9fff\uf900-\ufaff]/.test(chars[shown] ?? '');
    const timer = window.setTimeout(() => {
      if (shown % 4 === 0) audio.sfx('blip');
      setShown(s => s + 1);
    }, cjk ? 55 : 22);
    return () => window.clearTimeout(timer);
  }, [shown, chars]);
  return { shown: chars.slice(0, shown).join(''), done, skip: () => setShown(chars.length) };
}

/** Coach dialogue card: typewriter text, tap the bubble to skip while typing
 *  or advance when done; the avatar celebrates when the line finishes. */
function CoachCard(props: {
  lang: Lang; characterId: string; text: string; nextLabel: string;
  onAdvance: () => void;
}) {
  const { lang, characterId, text, nextLabel, onAdvance } = props;
  const { shown, done, skip } = useTypewriter(text);
  const [mood, setMood] = useState<'happy' | null>(null);
  const moodTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (done) {
      setMood('happy');
      window.clearTimeout(moodTimer.current);
      moodTimer.current = window.setTimeout(() => setMood(null), 800);
    }
  }, [done ]);
  useEffect(() => () => window.clearTimeout(moodTimer.current), []);

  const tap = () => {
    if (!done) skip();
    else { audio.sfx('click'); onAdvance(); }
  };

  return (
    <div className="tut-coach-card">
      <Avatar id={characterId} className={`coach-avatar${mood ? ` react-${mood}` : ''}`} />
      <div className="coach-bubble" onClick={tap}>
        <p className="tut-text">{shown}{!done && <span className="tw-caret" />}</p>
        {!done && <span className="tw-skip">{t(lang, 'tut.tapToSkip')}</span>}
        <button
          className="btn primary"
          onClick={e => { e.stopPropagation(); tap(); }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

/** Lesson result card: typewriter score line, fanfare/sting on arrival. */
function ResultCard(props: {
  text: string; made: boolean; nextLabel: string; onAdvance: () => void;
}) {
  const { text, made, nextLabel, onAdvance } = props;
  const { shown, done, skip } = useTypewriter(text);
  useEffect(() => { audio.sfx(made ? 'win' : 'lose'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const tap = () => {
    if (!done) skip();
    else { audio.sfx('click'); onAdvance(); }
  };
  return (
    <div className="tut-card" onClick={tap} style={{ cursor: 'pointer' }}>
      <p className="tut-text">{shown}{!done && <span className="tw-caret" />}</p>
      <button
        className="btn primary"
        onClick={e => { e.stopPropagation(); tap(); }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

/** Lesson-complete card: coach celebrates, fanfare, typewriter sign-off. */
function DoneCard(props: {
  lang: Lang; characterId: string; nextTitle: string | null;
  onNextLesson: () => void; onHome: () => void;
}) {
  const { lang, characterId, nextTitle, onNextLesson, onHome } = props;
  const { shown, done, skip } = useTypewriter(`🏁 ${t(lang, 'tut.done')}`);
  useEffect(() => { audio.sfx('win'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="tut-card" onClick={() => { if (!done) skip(); }} style={{ cursor: 'pointer' }}>
      <Avatar id={characterId} className="coach-avatar react-happy" />
      <p className="tut-text">{shown}{!done && <span className="tw-caret" />}</p>
      <button
        className="btn primary"
        onClick={() => {
          if (nextTitle) { audio.sfx('click'); onNextLesson(); }
          else onHome();
        }}
      >
        {nextTitle ? `${t(lang, 'tut.next')}: ${nextTitle}` : `🃏 ${t(lang, 'app.title')}`}
      </button>
    </div>
  );
}

interface SimSeatInfo {
  seat: Seat;
  count: number;
  badge?: string;
  active?: boolean;
}

/** The sim table is designed once at this size and scaled to fit the
 *  learner's screen (see .sim-stage in styles.css). Portrait-ish screens
 *  get the compact stage (narrower side columns, same height). */
const STAGE_W = 1180;
const STAGE_W_COMPACT = 940;
const STAGE_H = 740;

/** A compact simulated card table: seats with card backs around a felt,
 *  the live trick as real cards in the middle, and the interactive hand
 *  at the bottom. Scripted plays appear one-by-one like a real deal. */
function SimTable(props: {
  lang: Lang;
  title: string;
  contractLabel: string | null;
  seats: SimSeatInfo[];
  trick: { seat: Seat; card: Card }[];
  hand: Card[] | null;
  handLabel: string | null;
  /** Trump suit — drives hand ordering (trump leads). Null before the
   *  auction settles, or in a no-trump contract. */
  trump?: Suit | null;
  interactive: boolean;
  onPlay: (c: Card) => void;
  hint: string | null;
  stepKey: string;
  bottomExtra?: React.ReactNode;
  /** Face-up hands for the seats (bootcamp = open book: everyone shows). */
  hands?: Partial<Record<Seat, Card[]>> | null;
  /** The dummy seat gets a small tag under its plate. */
  dummySeat?: Seat | null;
  /** Card label (e.g. 'AH') of the card the learner should play — it pulses with a pointer. */
  highlight?: string | null;
  /** Card labels the coach is TALKING ABOUT right now (parsed out of the
   *  lesson text). These get a soft spotlight in whichever hand holds them,
   *  so the learner can look from the words down to the actual card. */
  focus?: string[] | null;
  /** Seat that won the displayed (review) trick — its card and plate glow gold. */
  winSeat?: Seat | null;
  /** Render trick cards instantly, no entrance animation (review replays). */
  trickStatic?: boolean;
  /** Character id per seat — the four characters ARE the four players now:
   *  the learner's pick sits South, the rest fill partner + opponents. */
  seatChars?: Partial<Record<Seat, string>>;
}) {
  const { lang } = props;
  const sigs = props.trick.map(t => `${t.seat}${t.card.suit}${t.card.rank}`);
  const fresh = useFreshOrder(sigs, props.stepKey);

  // Auto-fit: measure the felt and scale the fixed-size stage to fit it.
  // Narrow screens (<721px) get scale 0 = the flowing mobile layout.
  const feltRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 0, w: STAGE_W, compact: false });
  useEffect(() => {
    const el = feltRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width < 721) {
        setFit({ scale: 0, w: STAGE_W, compact: false });
        return;
      }
      const compact = r.width / r.height < 1.15;
      const w = compact ? STAGE_W_COMPACT : STAGE_W;
      setFit({ scale: Math.min((r.width - 4) / w, (r.height - 4) / STAGE_H, 2.2), w, compact });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const timers: number[] = [];
    fresh.forEach(ord => {
      timers.push(window.setTimeout(() => audio.sfx('card'), 120 + ord * 380));
    });
    return () => timers.forEach(t => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sigs.join('|')]);

  return (
    <div className="sim-felt" ref={feltRef}>
      <div
        className={`sim-stage${fit.scale > 0 ? ' scaled' : ''}${fit.compact ? ' compact' : ''}`}
        style={fit.scale > 0 ? { width: fit.w, height: STAGE_H, transform: `translate(-50%, -50%) scale(${fit.scale})` } : undefined}
      >
      <div className="sim-topbar">
        <span className="sim-trickno">{props.title}</span>
        {props.contractLabel && <span className="contract-pill">{props.contractLabel}</span>}
      </div>

      {props.seats
        .filter(s => s.seat !== 'S')
        .map(s => (
          <div key={s.seat} className={`sim-seat sim-${s.seat.toLowerCase()}${s.active ? ' active-turn' : ''}${props.winSeat === s.seat ? ' seat-win' : ''}`}>
            {props.seatChars?.[s.seat] && (
              <Avatar id={props.seatChars[s.seat]!} className="sim-seat-avatar" />
            )}
            {props.hands?.[s.seat] ? (
              <div className="sim-faceup" aria-label={seatLabel(lang, s.seat)}>
                {sortHand(props.hands[s.seat]!, props.trump ?? null).map((c, i) => (
                  <CardView
                    key={`${c.suit}${c.rank}-${i}`}
                    card={c}
                    small
                    focus={props.focus?.includes(cardLabel(c)) ?? false}
                  />
                ))}
              </div>
            ) : (
              <div className="sim-backs" aria-hidden>
                <div className="card back tiny" />
                <div className="card back tiny" />
                <div className="card back tiny" />
              </div>
            )}
            <div className="sim-plate">
              <span className="sim-seatname">{seatLabel(lang, s.seat)}</span>
              <span className="sim-count">🂠×{s.count}</span>
            </div>
            {props.dummySeat === s.seat && (
              <div className="sim-badge">{lang === 'zh' ? '明手' : 'Dummy'}</div>
            )}
            {s.badge && <div className="sim-badge">{s.badge}</div>}
          </div>
        ))}

      <div className="sim-center">
        <div className="sim-trick">
          {props.trick.map(t => {
            const sig = `${t.seat}${t.card.suit}${t.card.rank}`;
            const ord = props.trickStatic ? undefined : fresh.get(sig);
            return (
              <div
                key={sig}
                className={`sim-tcard pos-${simPos(t.seat)}${ord === undefined ? ' noanim' : ''}${props.winSeat === t.seat ? ' trick-win' : ''}`}
                style={ord === undefined ? undefined : { animationDelay: `${ord * 0.38}s` }}
              >
                <CardView card={t.card} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="sim-me">
        {props.hint && <div className="sim-hint">🫵 {props.hint}</div>}
        {props.hand && (
          <>
            {props.handLabel && (
              <div className="sim-handlabel">
                {props.seatChars?.S && <Avatar id={props.seatChars.S} className="sim-me-avatar" />}
                <span>{props.handLabel}</span>
              </div>
            )}
            <div className="hand">
              {props.hand.map((c, i) => (
                <CardView
                  key={`${c.suit}${c.rank}-${i}`}
                  card={c}
                  playable={props.interactive}
                  target={props.interactive && props.highlight === cardLabel(c)}
                  focus={props.focus?.includes(cardLabel(c)) ?? false}
                  onClick={props.interactive ? () => props.onPlay(c) : undefined}
                />
              ))}
            </div>
          </>
        )}
        {props.bottomExtra}
      </div>
      </div>
    </div>
  );
}

const SUIT_WORD: Record<Lang, Record<string, string>> = {
  en: { S: 'spades', H: 'hearts', D: 'diamonds', C: 'clubs' },
  zh: { S: '黑桃', H: '红桃', D: '方块', C: '梅花' },
};

/** Card labels the current line of coach text is talking about, e.g.
 *  "…(AS)…" or "你的梅花J (JC)" → ['AS', 'JC']. Lets us spotlight those
 *  exact cards in the hand while the coach explains them, so the learner
 *  can look from the words down to the card. Full-width （） are ignored. */
function cardTagsIn(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(/\(([AKQJT2-9])([SHDC])\)/g)) out.add(`${m[1]}${m[2]}`);
  return [...out];
}

/** One-line "what it all added up to" at the foot of an auction recap. */
function contractSummary(lang: Lang, c: Lesson['contract']): string {
  const label = bidLabelL(lang, { type: 'bid', level: c.level, denom: c.denom });
  const dec = seatLabel(lang, c.declarer);
  const dummy = seatLabel(lang, partnerOf(c.declarer));
  const tricks = c.level + 6;
  if (lang === 'zh') {
    const trump = c.denom === 'NT' ? '，没有将牌（无将）' : `，${SUIT_WORD.zh[c.denom]} 是将牌`;
    return `🎯 定约：${label}，庄家是 ${dec}。承诺：赢下 ${tricks} 墩${trump}。${dec} 打两手牌；${dummy} 把牌摊开做明手。`;
  }
  const trump = c.denom === 'NT' ? ', with no trump suit' : `, with ${SUIT_WORD.en[c.denom]} as trump`;
  return `🎯 The contract: ${label} by ${dec}. The promise: win ${tricks} tricks${trump}. ${dec} is the declarer and plays both hands; ${dummy} lays their cards down as the dummy.`;
}

export function Tutorial() {
  const { lang, go, characterId } = useApp();
  const [lessonIdx, setLessonIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [fbMood, setFbMood] = useState<'bad' | 'good' | null>(null);
  const [fbNonce, setFbNonce] = useState(0);
  const fbTimer = useRef<number | undefined>(undefined);
  const runnerRef = useRef<TutorialRunner | null>(null);
  // Post-trick review pause: after every completed trick, the four cards
  // stay on the table while the coach explains who won and why.
  const [review, setReview] = useState<TrickReviewData | null>(null);
  const reviewedRef = useRef(0);

  // Auction recap: when an auction step ends, replay the WHOLE conversation
  // as a translated transcript (every bid + its explainer) plus the contract
  // it added up to. Entries are snapshotted while on the step; a transition
  // effect below opens the card when the step changes away from 'auction'.
  interface RecapLine { seat: Seat; bid: Bid; note?: string }
  const [recap, setRecap] = useState<{ lines: RecapLine[]; contract: Lesson['contract'] } | null>(null);
  const auctionSnapRef = useRef<{ stepKey: string; lessonId: string; lang: Lang; lines: RecapLine[] } | null>(null);
  const recapShownForRef = useRef('');
  const prevKindRef = useRef<string | null>(null);

  const lessons = useMemo(() => getLessons(lang), [lang]);
  const lesson = lessons[lessonIdx]!;
  const runnerKey = `${lang}:${lesson.id}`;
  const runnerKeyRef = useRef('');
  if (!runnerRef.current || runnerKeyRef.current !== runnerKey) {
    runnerRef.current = new TutorialRunner(lesson);
    runnerKeyRef.current = runnerKey;
  }
  const runner = runnerRef.current;
  const step = useMemo(() => runner.currentStep(), [runner, tick]);
  const refresh = () => setTick(x => x + 1);

  // A trick completed since the last review → open the review pause.
  const checkReview = () => {
    if (runner.completedTrickCount() > reviewedRef.current) {
      const data = runner.lastCompletedTrick();
      if (data) setReview(data);
    }
  };
  const dismissReview = () => {
    reviewedRef.current = runner.completedTrickCount();
    setReview(null);
  };
  useEffect(() => {
    // New runner (lesson or language switch): forget old review state.
    reviewedRef.current = 0;
    setReview(null);
  }, [runner]);

  const startLesson = (i: number) => {
    setLessonIdx(i);
    runnerRef.current = new TutorialRunner(lessons[i]!);
    reviewedRef.current = 0;
    setReview(null);
    setRecap(null);
    setFeedback('');
    setFbMood(null);
    refresh();
  };

  const doAdvance = () => {
    if (review) return; // the review pause must be dismissed first
    setFeedback('');
    setFbMood(null);
    runner.advance();
    refresh();
    checkReview();
  };

  const praise = () => {
    const lines = PRAISE[lang];
    const n = fbNonce + 1;
    setFbNonce(n);
    setFeedback(lines[n % lines.length]!);
    setFbMood('good');
    window.clearTimeout(fbTimer.current);
    fbTimer.current = window.setTimeout(() => { setFeedback(''); setFbMood(null); }, 1600);
  };

  const doBid = (label: string) => {
    const r = runner.submitBid(label);
    if (r.ok) {
      audio.sfx('bid');
      praise();
    } else {
      audio.sfx('lose');
      window.clearTimeout(fbTimer.current);
      setFeedback(`${t(lang, 'tut.tryAgain')} ${r.hint ?? ''}`);
      setFbMood('bad');
      setFbNonce(n => n + 1);
    }
    refresh();
  };

  const doPlay = (card: Card) => {
    if (review) return; // review pause is open — cards are frozen
    const r = runner.submitPlay(cardLabel(card));
    if (r.ok) {
      audio.sfx('card');
      praise();
    } else {
      audio.sfx('lose');
      window.clearTimeout(fbTimer.current);
      setFeedback(`${t(lang, 'tut.tryAgain')} ${r.hint ?? ''}`);
      setFbMood('bad');
      setFbNonce(n => n + 1);
    }
    refresh();
    if (r.ok) checkReview();
  };

  const pending = runner.pendingLearnerAction();
  const auctionView = runner.auctionView();
  const playView = runner.playView();
  const trickNo = runner.trickNumber();
  const result = runner.getResult();

  // The engine only exposes the live play state while a 'play' step is on,
  // but the coach keeps talking during 'info' steps — and the learner needs
  // their hand on screen to follow the explanation. Remember the last live
  // view and keep showing it; it shrinks correctly as cards get played.
  // Before the first play step, fall back to the dealt hands.
  const lastPlayRef = useRef<ReturnType<TutorialRunner['playView']>>(null);
  const lastRunnerRef = useRef<TutorialRunner | null>(null);
  if (lastRunnerRef.current !== runner) {
    lastRunnerRef.current = runner;
    lastPlayRef.current = null;
  }
  if (playView) lastPlayRef.current = playView;
  const handView = playView ?? lastPlayRef.current;
  const handHands = handView?.hands ?? lesson.hands;
  const done = !step;
  const stepKey = `${lang}:${lesson.id}:${runner.stepIndex}`;
  // Paused at a scripted bid/play (not the learner's turn): offer a Next tap
  // so every card and bid is revealed one at a time.
  const awaitingTap = !pending && !done && (step?.kind === 'auction' || step?.kind === 'play');
  const tapNext = (
    <button className="btn primary tut-tap-next" onClick={() => { audio.sfx('click'); doAdvance(); }}>
      {t(lang, 'tut.next')} ▸
    </button>
  );

  const lastBidBySeat = useMemo(() => {
    const m = new Map<Seat, Bid>();
    for (const e of auctionView?.entries ?? []) m.set(e.seat, e.bid);
    return m;
  }, [auctionView]);

  // Per-bid explainer caption: what the latest bid SAID and why (the
  // auction counterpart of the post-trick review).
  const lastEntry = auctionView && auctionView.entries.length > 0
    ? auctionView.entries[auctionView.entries.length - 1]
    : undefined;
  const captionNote = step && step.kind === 'auction' && auctionView && auctionView.entries.length > 0
    ? (step.script[auctionView.entries.length - 1]?.note ?? null)
    : null;

  // Snapshot the running auction (entries map 1:1 to script actions).
  if (step?.kind === 'auction' && auctionView) {
    auctionSnapRef.current = {
      stepKey, lessonId: lesson.id, lang,
      lines: auctionView.entries.map((e, i) => ({ seat: e.seat, bid: e.bid, note: step.script[i]?.note })),
    };
  }
  // Leaving an auction step → open the recap (once per auction, and only if
  // the snapshot belongs to THIS lesson + language).
  useEffect(() => {
    const kind = step?.kind ?? 'done';
    if (prevKindRef.current === 'auction' && kind !== 'auction') {
      const snap = auctionSnapRef.current;
      if (snap && snap.lines.length > 0 && snap.lessonId === lesson.id && snap.lang === lang
        && recapShownForRef.current !== snap.stepKey) {
        recapShownForRef.current = snap.stepKey;
        setRecap({ lines: snap.lines, contract: lesson.contract });
      }
    }
    prevKindRef.current = kind;
  }, [step, lesson, lang]);

  // Lessons past the auction introduce the dummy (明手): declarer's partner,
  // whose cards lie face-up on the table for the declarer to play.
  const DUMMY_LESSON_IDS: ReadonlySet<string> = useMemo(
    () => new Set(['strategy', 'losers', 'eliminate', 'bidding', 'minor-responses', 'full-hand', 'conversation', 'scoring', 'overcall']), []
  );
  const dummySeat: Seat | null = DUMMY_LESSON_IDS.has(lesson.id)
    ? (lesson.contract.declarer === 'N' ? 'S' : lesson.contract.declarer === 'S' ? 'N' : lesson.contract.declarer === 'E' ? 'W' : 'E')
    : null;

  // The four characters are the four players: your pick is YOU (South +
  // coach voice); the other three sit as partner and opponents.
  const seatChars = useMemo(() => {
    const others = CHARACTERS.filter(c => c.id !== characterId).map(c => c.id);
    return { S: characterId, N: others[0]!, W: others[1]!, E: others[2]! } as Record<Seat, string>;
  }, [characterId]);

  // Spotlight the cards the coach is naming right now (lesson text on an
  // info step, or the hint line on a play step).
  const focusCards = useMemo(() => {
    const src = step?.kind === 'info' ? step.text
      : step?.kind === 'play' ? (pending?.hint ?? '')
      : '';
    return cardTagsIn(src);
  }, [step, pending]);

  // Trump drives hand ordering: it leads, the rest alternate black/red.
  // Unknown until the auction completes — and a no-trump contract has none.
  const lessonTrump: Suit | null = lesson.contract.denom === 'NT' ? null : lesson.contract.denom;
  const playContract = playView?.contract ?? null;
  const playTrump: Suit | null = playContract && playContract.denom !== 'NT' ? playContract.denom : null;

  // The table (with the hand) is shown for every teaching step — info,
  // auction and play alike. Text steps used to REPLACE the table, which is
  // why the hand vanished exactly when the coach had something to say.
  const showTable = step?.kind === 'info' || step?.kind === 'auction' || step?.kind === 'play';
  const captionOpen = step?.kind === 'auction' && !!lastEntry && !!captionNote;
  const overlayOpen = !!recap || step?.kind === 'info' || captionOpen || (!!review && step?.kind === 'play');

  return (
    <div className="tutorial">
      <div className="tut-header">
        <button className="btn ghost" onClick={() => go('home')}>{t(lang, 'tut.back')}</button>
        <div className="tut-title">🎓 {t(lang, 'tut.title')}</div>
        <div className="tut-progress">
          {t(lang, 'tut.lesson')}{lessonIdx + 1}{t(lang, 'tut.of')}{lessons.length}
        </div>
      </div>

      <div className="tut-lessons">
        {lessons.map((l, i) => (
          <button
            key={l.id}
            className={`chip ${i === lessonIdx ? 'active' : ''}`}
            onClick={() => { audio.sfx('click'); startLesson(i); }}
          >
            {i + 1}. {l.title}
          </button>
        ))}
      </div>

      <div className="tut-body">
        {showTable && (
        <div className="tut-stage-wrap">
        {step?.kind === 'info' && (
          <SimTable
            lang={lang}
            title={lesson.title}
            contractLabel={null}
            seats={(Object.keys(handHands) as Seat[]).map(s => ({
              seat: s,
              count: handHands[s].length,
              active: false,
            }))}
            trick={handView?.trick ?? []}
            hand={sortHand(handHands.S, lessonTrump)}
            hands={handHands}
            handLabel={seatLabel(lang, 'S')}
            trump={lessonTrump}
            seatChars={seatChars}
            interactive={false}
            onPlay={() => {}}
            hint={null}
            stepKey={stepKey}
            dummySeat={dummySeat}
            focus={focusCards}
            trickStatic
          />
        )}
        {step?.kind === 'auction' && auctionView && (
          <SimTable
            lang={lang}
            title={lang === 'zh' ? '叫牌' : 'Auction'}
            contractLabel={null}
            seats={(Object.keys(lesson.hands) as Seat[]).map(s => ({
              seat: s,
              count: 13,
              badge: lastBidBySeat.has(s) ? bidLabelL(lang, lastBidBySeat.get(s)!) : undefined,
              active: auctionView.turn === s,
            }))}
            trick={[]}
            hand={sortHand(lesson.hands.S, null)}
            hands={lesson.hands}
            handLabel={seatLabel(lang, 'S')}
            trump={null}
            seatChars={seatChars}
            interactive={false}
            onPlay={() => {}}
            hint={null}
            stepKey={stepKey}
            bottomExtra={
              <div className="sim-bidbox">
                {pending && pending.kind === 'bid' ? (
                  <>
                    <div className="sim-hint">🫵 {pending.hint}</div>
                    <div className="bid-rows">
                      <div className="bid-row">
                        {(['pass', 'double', 'redouble'] as const).map(k => {
                          const b: Bid = { type: k };
                          const lbl = bidToLabel(b);
                          return (
                            <button key={k} className={`bid-btn special${pending.expected === lbl ? ' hint-target' : ''}`} onClick={() => doBid(lbl)}>
                              {bidLabelL(lang, b)}
                            </button>
                          );
                        })}
                      </div>
                      {[1, 2, 3, 4, 5, 6, 7].map(level => (
                        <div className="bid-row level-row" key={level}>
                          <span className="bid-lvl">{level}</span>
                          {DENOM_ORDER.map(d => {
                            const b: Bid = { type: 'bid', level, denom: d };
                            const lbl = bidToLabel(b);
                            return (
                              <button key={d} className={`bid-btn denom-${d}${pending.expected === lbl ? ' hint-target' : ''}`} onClick={() => doBid(lbl)}>
                                {bidLabelL(lang, b)}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="sim-trail">
                    {auctionView.entries.map((e, i) => (
                      <span key={i} className="trail-bid">
                        {seatLabel(lang, e.seat)} {bidLabelL(lang, e.bid)}
                      </span>
                    ))}
                  </div>
                )}
                {awaitingTap && <div className="tut-tap-row">{tapNext}</div>}
              </div>
            }
          />
        )}

        {step?.kind === 'play' && playView && trickNo !== null && (
          <SimTable
            lang={lang}
            title={lang === 'zh' ? `第 ${trickNo} 墩` : `Trick ${trickNo}`}
            contractLabel={
              lesson.id === 'tricks'
                ? null
                : `${bidLabelL(lang, { type: 'bid', level: lesson.contract.level, denom: lesson.contract.denom })} · ${seatLabel(lang, lesson.contract.declarer)}`
            }
            seats={(Object.keys(playView.hands) as Seat[]).map(s => ({
              seat: s,
              count: playView.hands[s].length,
              active: playView.turn === s,
            }))}
            trick={review ? review.plays : playView.trick}
            hand={sortHand(pending && pending.kind === 'play' ? playView.hands[pending.seat] : playView.hands.S, playTrump)}
            handLabel={
              pending && pending.kind === 'play'
                ? `${seatLabel(lang, pending.seat)}${pending.seat === 'N' ? (lang === 'zh' ? '（明手）' : ' (dummy)') : ''}`
                : seatLabel(lang, 'S')
            }
            trump={playTrump}
            interactive={!!pending && !review}
            onPlay={doPlay}
            hint={pending?.hint ?? null}
            highlight={pending && pending.kind === 'play' ? pending.expected : null}
            focus={focusCards}
            stepKey={stepKey}
            hands={playView.hands}
            dummySeat={dummySeat}
            seatChars={seatChars}
            winSeat={review?.winner ?? null}
            trickStatic={!!review}
          />
        )}

        {overlayOpen && (
          <div className="tut-overlay">
        {recap && (
          <div className="sim-review recap-card">
            <div className="sim-review-label">{t(lang, 'tut.recapTitle')}</div>
            {recap.lines.map((l, i) => (
              <div key={i} className="recap-line">
                <span className="sim-caption-tag">{seatLabel(lang, l.seat)} · {bidLabelL(lang, l.bid)}</span>
                {l.note && <span className="recap-text">{l.note}</span>}
              </div>
            ))}
            <p className="sim-review-line recap-contract">
              {(() => {
                const lastBid = [...recap.lines].reverse().find(l => l.bid.type === 'bid');
                const reached = !!lastBid && lastBid.bid.type === 'bid'
                  && lastBid.bid.level === recap.contract.level
                  && lastBid.bid.denom === recap.contract.denom;
                return reached ? contractSummary(lang, recap.contract) : t(lang, 'tut.recapPractice');
              })()}
            </p>
            <button
              className="btn primary"
              onClick={() => { audio.sfx('click'); setRecap(null); }}
            >
              {t(lang, 'tut.reviewNext')}
            </button>
          </div>
        )}
        {step?.kind === 'info' && (
          <CoachCard
            key={stepKey}
            lang={lang}
            characterId={characterId}
            text={step.text}
            nextLabel={t(lang, 'tut.next')}
            onAdvance={doAdvance}
          />
        )}

        {step?.kind === 'auction' && lastEntry && captionNote && (
          <div className="sim-caption" key={auctionView!.entries.length}>
            <span className="sim-caption-tag">{seatLabel(lang, lastEntry.seat)} · {bidLabelL(lang, lastEntry.bid)}</span>
            <span className="sim-caption-text">{captionNote}</span>
          </div>
        )}

        {review && step?.kind === 'play' && (() => {
          const ex = explainTrick(review, lang);
          return (
            <div className="sim-review">
              <div className="sim-review-label">{t(lang, 'tut.reviewTitle')}</div>
              <div className="sim-review-title">{ex.title}</div>
              {ex.lines.map((l, i) => (
                <p key={i} className="sim-review-line">{l}</p>
              ))}
              <button
                className="btn primary"
                onClick={() => { audio.sfx('click'); dismissReview(); }}
              >
                {t(lang, 'tut.reviewNext')}
              </button>
            </div>
          );
        })()}

        </div>
        )}
        </div>
        )}
        {step?.kind === 'result' && result && (
          <ResultCard
            key={stepKey}
            text={`${result.made ? '🎉' : '💪'} ${result.total} ${t(lang, 'table.resultScore').toLowerCase()}! (${result.tricksTaken}/13 ${t(lang, 'table.resultTricks').toLowerCase()})`}
            made={result.made}
            nextLabel={t(lang, 'tut.next')}
            onAdvance={doAdvance}
          />
        )}

        {done && (
          <DoneCard
            key={`done-${lang}-${lessonIdx}`}
            lang={lang}
            characterId={characterId}
            nextTitle={lessonIdx + 1 < lessons.length ? lessons[lessonIdx + 1]!.title : null}
            onNextLesson={() => startLesson(lessonIdx + 1)}
            onHome={() => go('home')}
          />
        )}
        {step?.kind === 'play' && awaitingTap && !review && (
          <div className="tut-tap-row">{tapNext}</div>
        )}
        {feedback && (
          <div key={fbNonce} className={`tut-feedback${fbMood ? ` ${fbMood}` : ''}`}>
            {fbMood && (
              <Avatar id={characterId} className={`coach-avatar mini${fbMood === 'good' ? ' react-happy' : ''}`} />
            )}
            <span>{feedback}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function bidToLabel(b: Bid): string {
  if (b.type === 'pass') return 'P';
  if (b.type === 'double') return 'X';
  if (b.type === 'redouble') return 'XX';
  return `${b.level}${b.denom === 'NT' ? 'NT' : b.denom}`;
}
