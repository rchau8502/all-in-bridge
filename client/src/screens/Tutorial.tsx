import { ACBL_CHAPTERS, getChapterForLesson } from '../../../shared/chapters.js';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../App.js';
import { t, bidLabelL, seatLabel, type Lang } from '../i18n.js';
import { CardView, Avatar } from '../components/ui.js';
import { InlineGlossaryText } from '../components/InlineGlossaryText.js';
import { audio } from '../audio.js';
import { TutorialRunner, learnerSeatOf } from '../../../shared/tutorial.js';
import type { Lesson } from '../../../shared/tutorial.js';
import { sideOfSeat } from '../../../shared/trick-explain.js';
import { CHARACTERS } from '../../../shared/characters.js';
import { getLessons } from '../../../shared/lessons.js';
import type { Bid } from '../../../shared/bidding.js';
import { parseBid } from '../../../shared/bidding.js';
import { bidToVoiceLine } from '../../../shared/voices.js';
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
  onBack?: () => void;
  canGoBack?: boolean;
  onOpenFullGlossary?: (query: string) => void;
}) {
  const { lang, characterId, text, nextLabel, onAdvance, onOpenFullGlossary } = props;
  const { shown, done, skip } = useTypewriter(text);
  const [mood, setMood] = useState<'happy' | null>(null);
  const moodTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (done) {
      setMood('happy');
      window.clearTimeout(moodTimer.current);
      moodTimer.current = window.setTimeout(() => setMood(null), 800);
    }
  }, [done]);
  useEffect(() => () => window.clearTimeout(moodTimer.current), []);

  const tap = () => {
    if (!done) skip();
    else { audio.sfx('click'); onAdvance(); }
  };

  return (
    <div className="tut-coach-card">
      <Avatar id={characterId} className={`coach-avatar${mood ? ` react-${mood}` : !done ? ' react-talking' : ''}`} />
      <div className="coach-bubble" onClick={tap}>
        <div className="tut-text">
          {done ? (
            <InlineGlossaryText text={shown} lang={lang} onOpenFullGlossary={onOpenFullGlossary} />
          ) : (
            <>
              {shown}
              <span className="tw-caret" />
            </>
          )}
        </div>
        {!done && <span className="tw-skip">{t(lang, 'tut.tapToSkip')}</span>}
        <div className="tut-coach-actions">
        {props.onBack && <button className="btn ghost" disabled={!props.canGoBack}
          title={t(lang, 'tut.backStepHint')}
          onClick={e => { e.stopPropagation(); props.onBack?.(); }}>← {t(lang, 'tut.backStep')}</button>}
        <button
          className="btn primary"
          onClick={e => { e.stopPropagation(); tap(); }}
        >
          {nextLabel} <span className="kbd-hint">Space</span>
        </button>
        </div>
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
  useEffect(() => { audio.sfx(made ? 'fanfare' : 'lose'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
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

export interface SimSeatInfo {
  seat: Seat;
  count: number;
  badge?: string;
  active?: boolean;
}

/** The sim table is designed once at this size and scaled to fit the
 *  learner's screen (see .sim-stage in styles.css). Portrait-ish screens
 *  get the compact stage (narrower side columns, same height). */
const STAGE_W = 1120;
const STAGE_W_COMPACT = 880;
const STAGE_H = 660;

/** A compact simulated card table: seats with card backs around a felt,
 *  the live trick as real cards in the middle, and the interactive hand
 *  at the bottom. Scripted plays appear one-by-one like a real deal. */
function groupHandBySuit(cards: Card[]): Array<{ suit: Suit; cards: Card[] }> {
  const groups: Array<{ suit: Suit; cards: Card[] }> = [];
  for (const c of cards) {
    const last = groups[groups.length - 1];
    if (last && last.suit === c.suit) {
      last.cards.push(c);
    } else {
      groups.push({ suit: c.suit, cards: [c] });
    }
  }
  return groups;
}

export function SimTable(props: {
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
  bidding?: boolean;
  /** Content floated on the centre felt itself (e.g. the auction bidding
   *  box — a real table keeps the bidding box ON the table, and the centre
   *  grid cell is elastic, so a tall box scrolls inside instead of pushing
   *  the South hand row off the felt). */
  centreExtra?: React.ReactNode;
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
  /** Tutorial overlay (coach text / recap / review) — floated over the centre
   *  felt so it never covers the North (top) / South (bottom) hands. */
  overlaySlot?: React.ReactNode;
  /** Whose turn it is to choose a card: 'S' (declarer — the bottom hand) or
   *  the dummy seat (its face-up hand, played in place at the top of the
   *  table). Null when it is not the learner's turn to pick a card. This lets
   *  us play the dummy from its OWN seat instead of dragging its cards down
   *  into the declarer's hand. */
  playSeat?: Seat | null;
  /** Current tricks won by NS and EW for the live play HUD. */
  tricksWon?: Record<'NS' | 'EW', number> | null;
  /** Target tricks needed to make contract (e.g. 6 + level). */
  targetTricks?: number | null;
  /** Duplicate board sequence number for tournament realism. */
  boardNo?: number;
  /** Dealer seat for duplicate board widget. */
  dealer?: Seat;
  /** Seat that cards should fly towards during trick collection animation. */
  collectingSeat?: Seat | null;
  /** Strategic ACBL maxim/hint for the current trick context. */
  tacticalHint?: string | null;
  /** Flip North seat 180 degrees for pass-and-play tabletop mode */
  tabletopFlipped?: boolean;
  /** When provided, only card labels in this set are playable; others are dimmed and warn with follow-suit rules */
  legalCardLabels?: Set<string> | null;
}) {
  const { lang } = props;
  const { suitOrder } = useApp();
  const sigs = props.trick.map(t => `${t.seat}${t.card.suit}${t.card.rank}`);
  const fresh = useFreshOrder(sigs, props.stepKey);

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showTacticalHint, setShowTacticalHint] = useState(false);
  const [shakingCard, setShakingCard] = useState<string | null>(null);
  const [illegalToast, setIllegalToast] = useState<string | null>(null);
  const [draggingCard, setDraggingCard] = useState<Card | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setSelectedCard(null);
    setDraggingCard(null);
    setDragOffset({ x: 0, y: 0 });
  }, [props.stepKey, props.trick.length]);

  const triggerIllegalAttempt = (c: Card) => {
    const label = cardLabel(c);
    setShakingCard(label);
    audio.sfx('lose');
    audio.haptic([25, 40, 25]);
    setIllegalToast(t(lang, 'err.illegal-play'));
    window.setTimeout(() => setShakingCard(curr => (curr === label ? null : curr)), 450);
    window.setTimeout(() => setIllegalToast(curr => (curr ? null : curr)), 2200);
  };

  const handleCardClick = (c: Card, isTarget: boolean) => {
    const label = cardLabel(c);
    if (props.legalCardLabels && !props.legalCardLabels.has(label)) {
      triggerIllegalAttempt(c);
      return;
    }
    const isCoarseTouch = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!isCoarseTouch || isTarget || selectedCard === label) {
      setSelectedCard(null);
      props.onPlay(c);
    } else {
      setSelectedCard(label);
      audio.sfx('click');
    }
  };

  const handlePointerDown = (e: React.PointerEvent, c: Card, seat: Seat) => {
    if (!props.interactive || props.playSeat !== seat) return;
    if (e.button !== 0) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    setDraggingCard(c);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent, c: Card) => {
    if (!draggingCard || cardLabel(draggingCard) !== cardLabel(c)) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = (e: React.PointerEvent, c: Card, seat: Seat, isTarget: boolean) => {
    if (!draggingCard || cardLabel(draggingCard) !== cardLabel(c)) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const dx = dragOffset.x;
    const dy = dragOffset.y;
    const dist = Math.hypot(dx, dy);

    setDraggingCard(null);
    setDragOffset({ x: 0, y: 0 });

    const isSouthPlay = seat === 'S' && dy < -45;
    const isNorthPlay = seat === 'N' && (props.tabletopFlipped ? dy < -45 : dy > 45);

    if (isSouthPlay || isNorthPlay) {
      const label = cardLabel(c);
      if (props.legalCardLabels && !props.legalCardLabels.has(label)) {
        triggerIllegalAttempt(c);
      } else {
        setSelectedCard(null);
        props.onPlay(c);
      }
    } else if (dist < 8) {
      handleCardClick(c, isTarget);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setDraggingCard(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Auto-fit: measure the felt and scale the fixed-size stage to fit it.
  // Narrow screens (<721px) get scale 0 = the flowing mobile layout.
  const feltRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 0, w: STAGE_W, compact: false });
  useLayoutEffect(() => {
    const el = feltRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      // Only true phones fall back to the flowing (unscaled) layout. A
      // laptop window with a short viewport is NOT a phone — it used to
      // drop to the flowing layout too, where the East/West hands poked out
      // of their columns and the Next bar was pushed off-screen. Scaling a
      // short box down still shows the whole table.
      if (window.matchMedia('(max-width: 720px)').matches) {
        setFit({ scale: 0, w: STAGE_W, compact: false });
        return;
      }
      const compact = r.width / r.height < 1.15;
      const w = compact ? STAGE_W_COMPACT : STAGE_W;
      setFit({ scale: Math.min((r.width - 4) / w, (r.height - 4) / STAGE_H, 3), w, compact });
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
    <div className={`sim-felt${props.bidding ? ' is-bidding' : ''}`} ref={feltRef}>
      <div
        className={`sim-stage${fit.scale > 0 ? ' scaled' : ''}${fit.compact ? ' compact' : ''}`}
        style={fit.scale > 0 ? { width: fit.w, height: STAGE_H, transform: `translate(-50%, -50%) scale(${fit.scale})` } : undefined}
      >
      <div className="sim-topbar">
        {props.boardNo && (
          <div className="board-indicator" title={lang === 'zh' ? '比赛牌套信息' : 'Duplicate Board Info'}>
            <span className="board-no">{lang === 'zh' ? `第 ${props.boardNo} 副` : `Board ${props.boardNo}`}</span>
            {props.dealer && (
              <span className="board-dlr">
                {lang === 'zh' ? `庄: ${seatLabel(lang, props.dealer)}` : `Dlr: ${props.dealer}`}
              </span>
            )}
            <span className="board-vul">{lang === 'zh' ? '无局' : 'None Vul'}</span>
          </div>
        )}
        <span className="sim-trickno">{props.title}</span>
        {props.contractLabel && <span className="contract-pill">{props.contractLabel}</span>}
        {props.tricksWon && (
          <span className="sim-tricks-hud" title={t(lang, 'tut.tricksWon')}>
            <span className="hud-side hud-ns">{lang === 'zh' ? '北南' : 'NS'}: <b>{props.tricksWon.NS}</b></span>
            <span className="hud-sep">·</span>
            <span className="hud-side hud-ew">{lang === 'zh' ? '东西' : 'EW'}: <b>{props.tricksWon.EW}</b></span>
            {typeof props.targetTricks === 'number' && (
              <span className="hud-target">({t(lang, 'tut.need')} {props.targetTricks})</span>
            )}
          </span>
        )}
        {props.tacticalHint && (
          <button
            type="button"
            className={`sim-hint-toggle-btn ${showTacticalHint ? 'active' : ''}`}
            onClick={() => setShowTacticalHint(prev => !prev)}
            title={showTacticalHint ? t(lang, 'tut.hideHint') : t(lang, 'tut.tacticalHint')}
          >
            {t(lang, 'tut.tacticalHint')}
          </button>
        )}
      </div>

      {showTacticalHint && props.tacticalHint && (
        <div className="sim-tactical-banner" onClick={() => setShowTacticalHint(false)}>
          <span className="tactical-icon">💡</span>
          <span className="tactical-text">{props.tacticalHint}</span>
          <button
            type="button"
            className="tactical-close"
            onClick={e => {
              e.stopPropagation();
              setShowTacticalHint(false);
            }}
            aria-label="Close hint"
          >
            ✕
          </button>
        </div>
      )}

      {props.seats
        .filter(s => s.seat !== 'S')
        .map(s => {
          // The dummy or partner's face-up hand is the play surface on its turn:
          // cards are clicked in place at the top/side of the table.
          const isFlipped = props.tabletopFlipped && s.seat === 'N';
          const dPlay = props.interactive && props.playSeat === s.seat;
          return (
          <div key={s.seat} className={`sim-seat sim-${s.seat.toLowerCase()}${s.active ? ' active-turn' : ''}${props.winSeat === s.seat ? ' seat-win' : ''}${isFlipped ? ' tabletop-flipped' : ''}`}>
            {props.seatChars?.[s.seat] && (
              <Avatar id={props.seatChars[s.seat]!} className="sim-seat-avatar" />
            )}
            {props.hands?.[s.seat] ? (
              <div
                className={`sim-faceup${dPlay ? ' playable-seat' : ''}${props.dummySeat === s.seat ? ' dummy-faceup' : ''}`}
                aria-label={seatLabel(lang, s.seat)}
              >
                {groupHandBySuit(sortHand(props.hands[s.seat]!, props.trump ?? null, suitOrder)).map(group => (
                  <div key={group.suit} className="suit-cluster faceup-cluster">
                    {group.cards.map((c, i) => {
                      const cLabel = cardLabel(c);
                      const isLegal = !props.legalCardLabels || !dPlay || props.legalCardLabels.has(cLabel);
                      const isTarget = dPlay && props.highlight === cLabel;
                      const isSelected = selectedCard === cLabel;
                      const isDragging = draggingCard && cardLabel(draggingCard) === cLabel;
                      const isShaking = shakingCard === cLabel;
                      return (
                        <div
                          key={`${c.suit}${c.rank}-${i}`}
                          className={`faceup-card-wrapper ${isDragging ? 'is-dragging' : ''} ${isShaking ? 'shake-card' : ''} ${dPlay ? 'playable-fan' : ''}`}
                          style={
                            isDragging
                              ? {
                                  transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.15)`,
                                  zIndex: 9999,
                                  transition: 'none',
                                }
                              : undefined
                          }
                          onPointerDown={dPlay ? e => handlePointerDown(e, c, s.seat) : undefined}
                          onPointerMove={dPlay ? e => handlePointerMove(e, c) : undefined}
                          onPointerUp={dPlay ? e => handlePointerUp(e, c, s.seat, isTarget) : undefined}
                          onPointerCancel={dPlay ? handlePointerCancel : undefined}
                        >
                          <CardView
                            card={c}
                            small={!dPlay}
                            playable={dPlay && isLegal}
                            dim={dPlay && !isLegal}
                            target={isTarget}
                            selected={isSelected}
                            focus={props.focus?.includes(cLabel) ?? false}
                            onClick={dPlay ? () => handleCardClick(c, isTarget) : undefined}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
                {dPlay && props.hint && (
                  <div className="sim-hint up">🫵 {props.hint}</div>
                )}
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
            {(s.badge || props.bidding) && (
              <div className={`sim-badge duo-badge${s.badge ? '' : ' empty-bid-badge'}`} aria-hidden={!s.badge || undefined}>{s.badge || '–'}</div>
            )}
          </div>
          );
        })}

      <div className="sim-center">
        <div className="sim-compass" aria-hidden="true">
          <svg viewBox="0 0 160 160" className="compass-svg">
            <circle cx="80" cy="80" r="72" className="compass-ring-out" />
            <circle cx="80" cy="80" r="62" className="compass-ring-mid" />
            <circle cx="80" cy="80" r="28" className="compass-ring-inn" />
            <path d="M80 14 L85 70 L136 75 L85 80 L80 136 L75 80 L24 75 L75 70 Z" className="compass-star-pri" />
            <text x="80" y="24" className={`compass-lbl lbl-n ${props.seats.find(s=>s.seat==='N')?.active || props.playSeat==='N' ? 'lit' : ''}`}>
              {lang === 'zh' ? '北' : 'N'}
            </text>
            <text x="140" y="85" className={`compass-lbl lbl-e ${props.seats.find(s=>s.seat==='E')?.active ? 'lit' : ''}`}>
              {lang === 'zh' ? '东' : 'E'}
            </text>
            <text x="80" y="146" className={`compass-lbl lbl-s ${props.playSeat === 'S' || (!props.playSeat && props.seats.find(s=>s.seat==='S')?.active) ? 'lit' : ''}`}>
              {lang === 'zh' ? '南' : 'S'}
            </text>
            <text x="20" y="85" className={`compass-lbl lbl-w ${props.seats.find(s=>s.seat==='W')?.active ? 'lit' : ''}`}>
              {lang === 'zh' ? '西' : 'W'}
            </text>
          </svg>
        </div>
        {props.trick.length > 0 && (
          <div className={`sim-trick${props.collectingSeat ? ` collecting-to-${simPos(props.collectingSeat)}` : ''}`}>
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
                  <span className="sim-tcard-seat">{seatLabel(lang, t.seat)}</span>
                </div>
              );
            })}
          </div>
        )}
        {props.centreExtra}
        {props.overlaySlot}
        {draggingCard && (
          <div className="sim-drag-drop-zone">
            <div className="sim-drop-zone-badge">
              🎯 {t(lang, 'tut.dropToPlay')}
            </div>
          </div>
        )}
        {illegalToast && (
          <div className="sim-illegal-toast" role="alert">
            <span>⚠️ {illegalToast}</span>
          </div>
        )}
      </div>

      <div className="sim-me">
        {props.hint && props.playSeat === 'S' && <div className="sim-hint">🫵 {props.hint}</div>}
        {props.hand && (
          <>
            {props.handLabel && (
              <div className="sim-handlabel">
                {props.seatChars?.S && <Avatar id={props.seatChars.S} className="sim-me-avatar" />}
                <span>{props.handLabel}</span>
              </div>
            )}
            <div className="hand" role="region" aria-label={props.handLabel ?? 'Hand'}>
              {groupHandBySuit(props.hand).map(group => {
                const count = group.cards.length;
                const mid = (count - 1) / 2;
                return (
                  <div key={group.suit} className={`suit-cluster suit-${group.suit.toLowerCase()}`}>
                    {group.cards.map((c, i) => {
                      const isPlayableSeat = props.interactive && props.playSeat === 'S';
                      const cLabel = cardLabel(c);
                      const isLegal = !props.legalCardLabels || !isPlayableSeat || props.legalCardLabels.has(cLabel);
                      const isTarget = isPlayableSeat && props.highlight === cLabel;
                      const isSelected = selectedCard === cLabel;
                      const isDragging = draggingCard && cardLabel(draggingCard) === cLabel;
                      const isShaking = shakingCard === cLabel;
                      const rotDeg = count > 1 ? (i - mid) * 1.5 : 0;
                      const yOff = count > 1 ? Math.abs(i - mid) * 1.2 : 0;
                      return (
                        <div
                          key={`${c.suit}${c.rank}-${i}`}
                          className={`card-fan-wrapper ${isDragging ? 'is-dragging' : ''} ${isShaking ? 'shake-card' : ''} ${isPlayableSeat ? 'playable-fan' : ''}`}
                          style={{
                            ['--fan-rot' as string]: isDragging ? '0deg' : `${rotDeg}deg`,
                            ['--fan-y' as string]: isDragging ? '0px' : `${yOff}px`,
                            transform: isDragging
                              ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.15)`
                              : undefined,
                            zIndex: isDragging ? 9999 : undefined,
                            transition: isDragging ? 'none' : undefined,
                          }}
                          onPointerDown={isPlayableSeat ? e => handlePointerDown(e, c, 'S') : undefined}
                          onPointerMove={isPlayableSeat ? e => handlePointerMove(e, c) : undefined}
                          onPointerUp={isPlayableSeat ? e => handlePointerUp(e, c, 'S', isTarget) : undefined}
                          onPointerCancel={isPlayableSeat ? handlePointerCancel : undefined}
                        >
                          <CardView
                            card={c}
                            playable={isPlayableSeat && isLegal}
                            dim={isPlayableSeat && !isLegal}
                            target={isTarget}
                            selected={isSelected}
                            focus={props.focus?.includes(cLabel) ?? false}
                            onClick={isPlayableSeat ? () => handleCardClick(c, isTarget) : undefined}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
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
  const {
    lang,
    go,
    characterId,
    currentLessonIdx,
    setCurrentLessonIdx,
    completedLessons,
    markLessonCompleted,
    openGlossaryWithQuery,
    unlockAchievement,
    suitOrder,
  } = useApp();

  const lessons = useMemo(() => getLessons(lang), [lang]);
  const [lessonIdx, setLessonIdx] = useState(() => Math.min(Math.max(0, currentLessonIdx), lessons.length - 1));

  // The four characters are the four players: your pick is YOU (South +
  // coach voice); the other three sit as partner and opponents.
  const seatChars = useMemo(() => {
    const others = CHARACTERS.filter(c => c.id !== characterId).map(c => c.id);
    return { S: characterId, N: others[0]!, W: others[1]!, E: others[2]! } as Record<Seat, string>;
  }, [characterId]);

  const [tick, setTick] = useState(0);

  // Real fullscreen for the teaching table — the classroom/projector case.
  // The stage is a fixed 1120x660 design that auto-fits whatever box it is
  // given, so simply blowing the wrapper up to the whole screen is enough
  // for the cards to grow with it (see .tut-body:fullscreen in styles.css).
  const bodyRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === bodyRef.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const toggleFullscreen = () => {
    const el = bodyRef.current;
    if (!el) return;
    audio.sfx('click');
    if (document.fullscreenElement) {
      void document.exitFullscreen?.().catch(() => {});
    } else {
      // Browsers refuse outside a user gesture / in some embeds — stay put.
      void el.requestFullscreen?.().catch(() => {});
    }
  };
  const [feedback, setFeedback] = useState('');
  const [fbMood, setFbMood] = useState<'bad' | 'good' | null>(null);
  const [fbNonce, setFbNonce] = useState(0);
  const fbTimer = useRef<number | undefined>(undefined);
  const runnerRef = useRef<TutorialRunner | null>(null);
  // Exactly one detailed card analysis per deal: immediately after the lead.
  const [leadReview, setLeadReview] = useState(false);
  const leadReviewedRef = useRef(false);
  const reviewedRef = useRef(0);

  interface RecapLine { seat: Seat; bid: Bid; note?: string }
  const [recap, setRecap] = useState<{ lines: RecapLine[]; contract: Lesson['contract'] } | null>(null);

  const lesson = lessons[lessonIdx]!;
  /** The chair the learner sits in: South when declaring, but West/East in
   *  the two defense lessons. Everything that says "you" / "partner" /
   *  "your side" hangs off this — a defender's dummy must never be greeted
   *  as his partner. */
  const learnerSeat = learnerSeatOf(lesson);
  const track = getChapterForLesson(lesson.id)?.track ?? 'basic';
  const trackIndices = lessons.flatMap((l, i) => getChapterForLesson(l.id)?.track === track ? [i] : []);
  const trackFirst = trackIndices[0]!;
  const trackLast = trackIndices[trackIndices.length - 1]!;
  const trackPosition = trackIndices.indexOf(lessonIdx) + 1;
  const runnerKey = `${lang}:${lesson.id}`;
  const runnerKeyRef = useRef('');
  if (!runnerRef.current || runnerKeyRef.current !== runnerKey) {
    runnerRef.current = new TutorialRunner(lesson);
    runnerKeyRef.current = runnerKey;
  }
  const runner = runnerRef.current;
  const step = useMemo(() => runner.currentStep(), [runner, tick]);
  const refresh = () => setTick(x => x + 1);

  const checkReview = () => {
    const view = runner.playView();
    if (!leadReviewedRef.current && runner.completedTrickCount() === 0 && view?.trick.length === 1) {
      leadReviewedRef.current = true;
      if (lesson.openingLeadAnalysis) setLeadReview(true);
    }
    const count = runner.completedTrickCount();
    if (count <= reviewedRef.current) return;
    reviewedRef.current = count;
    const data = runner.lastCompletedTrick();
    if (data && sideOfSeat(data.winner) === sideOfSeat(learnerSeat)) {
      void audio.playVoice(seatChars[data.winner], lang, 'trick_win');
    }
  };
  const dismissReview = () => setLeadReview(false);
  useEffect(() => {
    // New runner (lesson or language switch): forget old review state.
    reviewedRef.current = 0;
    setLeadReview(false);
    leadReviewedRef.current = false;
    setRecap(null);
  }, [runner]);

  const startLesson = (i: number) => {
    if (i < 0 || i >= lessons.length) return;
    setLessonIdx(i);
    setCurrentLessonIdx(i);
    runnerRef.current = new TutorialRunner(lessons[i]!);
    reviewedRef.current = 0;
    setLeadReview(false);
    leadReviewedRef.current = false;
    setRecap(null);
    setFeedback('');
    setFbMood(null);
    refresh();
    audio.sfx('shuffle');
    void audio.playVoice(characterId, lang, 'hello');
  };

  useEffect(() => {
    if (currentLessonIdx !== lessonIdx && currentLessonIdx >= 0 && currentLessonIdx < lessons.length) {
      startLesson(currentLessonIdx);
    }
  }, [currentLessonIdx]);

  const doBack = () => {
    if (!runner.goBack()) return;
    setLeadReview(false);
    leadReviewedRef.current = runner.completedTrickCount() > 0 || (runner.playView()?.trick.length ?? 0) > 0;
    reviewedRef.current = runner.completedTrickCount();
    setRecap(null);
    setFeedback('');
    setFbMood(null);
    lastPlayRef.current = null;
    refresh();
  };

  const doAdvance = () => {
    if (leadReview) return; // the review pause must be dismissed first
    setFeedback('');
    setFbMood(null);

    if (step?.kind === 'auction') {
      const prevLen = runner.auction.entries.length;
      runner.advance();
      const newLen = runner.auction.entries.length;
      if (newLen > prevLen) {
        const last = runner.auction.entries[newLen - 1]!;
        const speakerChar = seatChars[last.seat];
        const line = bidToVoiceLine(last.bid);
        if (line) void audio.playVoice(speakerChar, lang, line);
      } else if (runner.currentStep() !== step && newLen > 0) {
        // Open the recap in the same update as the step change so the next
        // lesson card does not briefly appear underneath it.
        const script = lesson.steps.flatMap(s => s.kind === 'auction' ? s.script : []);
        const lines = runner.auction.entries.map((entry, i) => ({ ...entry, note: script[i]?.note }));
        setRecap({ lines, contract: lesson.contract });
      }
    } else if (step?.kind === 'play' && step.runout === true) {
      // Bookkeeping time: run the rest of the hand in one go.
      runner.runOut();
    } else {
      runner.advance();
    }

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
      try {
        const parsed = parseBid(label);
        const line = bidToVoiceLine(parsed);
        if (line) void audio.playVoice(characterId, lang, line);
      } catch {
        // ignore
      }
      praise();
    } else {
      audio.sfx('lose');
      void audio.playVoice(characterId, lang, 'oops');
      window.clearTimeout(fbTimer.current);
      setFeedback(`${t(lang, 'tut.tryAgain')} ${r.hint ?? ''}`);
      setFbMood('bad');
      setFbNonce(n => n + 1);
    }
    refresh();
  };

  const doPlay = (card: Card) => {
    if (leadReview) return; // review pause is open — cards are frozen
    const r = runner.submitPlay(cardLabel(card));
    if (r.ok) {
      audio.sfx('card');
      praise();
    } else {
      audio.sfx('lose');
      void audio.playVoice(characterId, lang, 'oops');
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
  const feedbackLine = feedback && (
    <div key={fbNonce} className={`tut-feedback${fbMood ? ` ${fbMood}` : ''}`} role="status">
      {fbMood && (
        <Avatar id={characterId} className={`coach-avatar mini${fbMood === 'good' ? ' react-happy' : ''}`} />
      )}
      <span>{feedback}</span>
    </div>
  );
  /** The tail of a decided hand: play it out in one tap instead of a dozen. */
  const stepRunout = step?.kind === 'play' && step.runout === true;
  const tapNext = stepRunout ? (
    <button
      className="btn primary tut-tap-next tut-runout"
      title={t(lang, 'tut.runoutHint')}
      onClick={() => { audio.sfx('click'); doAdvance(); }}
    >
      {t(lang, 'tut.runout')} <span className="kbd-hint">Space</span>
    </button>
  ) : (
    <button className="btn primary tut-tap-next" onClick={() => { audio.sfx('click'); doAdvance(); }}>
      {t(lang, 'tut.next')} ▸ <span className="kbd-hint">Space</span>
    </button>
  );

  useEffect(() => {
    if (done) {
      markLessonCompleted(lesson.id);
      void audio.playVoice(characterId, lang, 'win_game');

      unlockAchievement('first_trick');
      if (lesson.id === 'strategy') {
        unlockAchievement('finesse_master');
      }
      if (lesson.id === 'trump' || lesson.id === 'eliminate') {
        unlockAchievement('trump_ruler');
      }
      if (completedLessons.size + (completedLessons.has(lesson.id) ? 0 : 1) >= 16) {
        unlockAchievement('bootcamp_grad');
      }
    }
  }, [done, lesson.id, markLessonCompleted, characterId, lang, unlockAchievement, completedLessons]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (leadReview) {
          audio.sfx('click');
          dismissReview();
        } else if (recap) {
          audio.sfx('click');
          setRecap(null);
        } else if (step?.kind === 'info' || awaitingTap) {
          audio.sfx('click');
          doAdvance();
        } else if (done) {
          audio.sfx('click');
          if (lessonIdx + 1 < lessons.length) startLesson(lessonIdx + 1);
          else go('home');
        }
      } else if (e.key === 'Escape') {
        // In fullscreen, Esc belongs to the browser (it leaves fullscreen);
        // don't also jump back to the home screen.
        if (document.fullscreenElement) return;
        e.preventDefault();
        go('home');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        audio.sfx('click');
        startLesson(lessonIdx);
      } else if (e.key === 'ArrowLeft' && !e.altKey && !e.metaKey) {
        e.preventDefault();
        doBack();
      } else if (e.key === 'ArrowLeft' && (e.altKey || e.metaKey)) {
        if (lessonIdx > trackFirst) startLesson(lessonIdx - 1);
      } else if (e.key === 'ArrowRight' && (e.altKey || e.metaKey)) {
        if (lessonIdx < trackLast) startLesson(lessonIdx + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [leadReview, recap, step, awaitingTap, done, lessonIdx, lessons.length, trackFirst, trackLast]);

  const auctionEntries = recap?.lines ?? auctionView?.entries;
  const lastBidBySeat = useMemo(() => {
    const m = new Map<Seat, Bid>();
    for (const e of auctionEntries ?? []) m.set(e.seat, e.bid);
    return m;
  }, [auctionEntries]);

  // Per-bid explainer caption: what the latest bid SAID and why (the
  // auction counterpart of the post-trick review).
  const lastEntry = auctionView && auctionView.entries.length > 0
    ? auctionView.entries[auctionView.entries.length - 1]
    : undefined;
  const captionNote = step && step.kind === 'auction' && auctionView && auctionView.entries.length > 0
    ? (lesson.steps.flatMap(s => s.kind === 'auction' ? s.script : [])[auctionView.entries.length - 1]?.note ?? null)
    : null;

  // Lessons past the auction introduce the dummy (明手): declarer's partner,
  // whose cards lie face-up on the table for the declarer to play.
  const DUMMY_LESSON_IDS: ReadonlySet<string> = useMemo(
    () => new Set(['strategy', 'long-suits', 'losers', 'eliminate', 'contract', 'bidding', 'minor-responses', 'full-hand', 'conversation', 'scoring', 'overcall']), []
  );
  const dummySeat: Seat | null = DUMMY_LESSON_IDS.has(lesson.id)
    ? (lesson.contract.declarer === 'N' ? 'S' : lesson.contract.declarer === 'S' ? 'N' : lesson.contract.declarer === 'E' ? 'W' : 'E')
    : null;

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

  const tacticalHint = step?.kind === 'play' ? lesson.focus ?? null : null;

  // The table (with the hand) is shown for every teaching step — info,
  // auction and play alike. Text steps used to REPLACE the table, which is
  // why the hand vanished exactly when the coach had something to say.
  const showTable = !!recap || step?.kind === 'info' || step?.kind === 'auction' || step?.kind === 'play';
  const captionOpen = step?.kind === 'auction' && !!lastEntry && !!captionNote
    // While it is the learner's turn to bid, the bidding box owns the centre
    // felt — the caption for the previous bid has already been read (its
    // "next" tap led here), so don't fight the box for the same space.
    && !(pending && pending.kind === 'bid');
  const runoutReady = stepRunout && awaitingTap && !leadReview && !recap;
  const overlayOpen = !!recap || step?.kind === 'info' || (leadReview && step?.kind === 'play') || runoutReady;

  // The tutorial overlay (coach text / recap / post-trick review) is floated
  // over the centre felt — NEVER over the North/South hands. Auction content
  // (the bidding box and its per-bid caption) lives in the bidding box panel
  // on the felt instead, so during the auction the centre holds exactly one
  // element and nothing floats over it. It is passed into SimTable as
  // overlaySlot and rendered inside .sim-center; on narrow screens it may spill
  // a little onto the East/West seats, which is fine.
  const tutorialOverlay = overlayOpen ? (
    <div className="tut-overlay">
      {runoutReady && tapNext}
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
          <button className="btn ghost" disabled={!runner.canGoBack()} title={t(lang, 'tut.backStepHint')} onClick={doBack}>← {t(lang, 'tut.backStep')}</button>
        </div>
      )}
      {!recap && step?.kind === 'info' && step.review && (
        <section className="tut-summary" aria-label={step.text}>
          <h2>{step.text}</h2>
          <div className="tut-summary-scroll">
            <table>
              <thead><tr>{step.review.columns.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr></thead>
              <tbody>{step.review.rows.map((row, i) => <tr key={i}>{row.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <button className="btn primary" onClick={doAdvance}>{t(lang, 'tut.finishReview')}</button>
          <button className="btn ghost" disabled={!runner.canGoBack()} title={t(lang, 'tut.backStepHint')} onClick={doBack}>← {t(lang, 'tut.backStep')}</button>
        </section>
      )}
      {!recap && step?.kind === 'info' && !step.review && (
        <CoachCard
          key={stepKey}
          lang={lang}
          characterId={characterId}
          text={step.text}
          nextLabel={t(lang, 'tut.next')}
          onAdvance={doAdvance}
          onBack={doBack}
          canGoBack={runner.canGoBack()}
          onOpenFullGlossary={openGlossaryWithQuery}
        />
      )}

      {leadReview && step?.kind === 'play' && (
        <div className="sim-review">
          <div className="sim-review-label">{t(lang, 'tut.leadAnalysis')}</div>
          <p className="sim-review-line">{lesson.openingLeadAnalysis}</p>
          <button className="btn primary" onClick={() => { audio.sfx('click'); dismissReview(); }}>
            {t(lang, 'tut.reviewNext')}
          </button>
          <button className="btn ghost" disabled={!runner.canGoBack()} title={t(lang, 'tut.backStepHint')} onClick={doBack}>← {t(lang, 'tut.backStep')}</button>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="tutorial">
      <div className="tut-header">
        <button className="btn ghost" onClick={() => go('home')}>◀ {t(lang, 'tut.back')}</button>
        <div className="tut-header-center">
          <button
            className="chip tut-nav-arrow"
            disabled={lessonIdx === trackFirst}
            onClick={() => { audio.sfx('click'); startLesson(lessonIdx - 1); }}
            title={t(lang, 'tut.prevLesson')}
          >
            ◀
          </button>
          <div className="tut-progress">
            {lang === 'zh' ? (track === 'basic' ? '基础篇 · ' : '进阶篇 · ') : (track === 'basic' ? 'Foundations · ' : 'Advanced · ')}{t(lang, 'tut.lesson')} {trackPosition} {t(lang, 'tut.of')} {trackIndices.length}
          </div>
          <button
            className="chip tut-nav-arrow"
            disabled={lessonIdx >= trackLast}
            onClick={() => { audio.sfx('click'); startLesson(lessonIdx + 1); }}
            title={t(lang, 'tut.nextLesson')}
          >
            ▶
          </button>
          <button className="chip tut-back-step" onClick={doBack}
            disabled={!runner.canGoBack()} title={t(lang, 'tut.backStepHint')}>
            ← {t(lang, 'tut.backStep')}
          </button>
          <button
            className="chip tut-restart-btn"
            onClick={() => { audio.sfx('click'); startLesson(lessonIdx); }}
            title={`${t(lang, 'tut.restart')} (R)`}
          >
            ↺ {t(lang, 'tut.restart')}
          </button>
          <button
            className={`chip tut-fs-btn ${isFullscreen ? 'active' : ''}`}
            onClick={toggleFullscreen}
            title={`${t(lang, 'tut.fullscreen')} (F)`}
          >
            ⛶ {isFullscreen ? t(lang, 'tut.exitFullscreen') : t(lang, 'tut.fullscreen')}
          </button>

        </div>
        <div className="tut-title">🎓 {lessons[lessonIdx]?.title}</div>
      </div>

      <div className="tut-tracks" role="group" aria-label={lang === 'zh' ? '课程分篇' : 'Course tracks'}>
        {(['basic', 'advanced'] as const).map(value => (
          <button className={`chip ${value === track ? 'active' : ''}`} key={value} onClick={() => {
            const first = ACBL_CHAPTERS.find(ch => ch.track === value)?.lessonIds[0];
            const idx = lessons.findIndex(l => l.id === first);
            if (idx >= 0) startLesson(idx);
          }}>
            {lang === 'zh' ? (value === 'basic' ? '基础篇' : '进阶篇（选学）') : (value === 'basic' ? 'Foundations' : 'Advanced (optional)')}
          </button>
        ))}
      </div>
      <div className="tut-lessons">
        {lessons.map((l, i) => ({ l, i })).filter(({ l }) => getChapterForLesson(l.id)?.track === track).map(({ l, i }) => {
          const isDone = completedLessons.has(l.id);
          return (
            <button
              key={l.id}
              className={`chip ${i === lessonIdx ? 'active' : ''} ${isDone ? 'completed-chip' : ''}`}
              onClick={() => { audio.sfx('click'); startLesson(i); }}
            >
              {isDone ? '✓ ' : ''}{trackIndices.indexOf(i) + 1}. {l.title}
            </button>
          );
        })}
      </div>

      <div className={`tut-body${isFullscreen ? ' fs' : ''}`} ref={bodyRef}>
        {isFullscreen && (
          <button className="tut-fs-exit" onClick={toggleFullscreen} title="Esc">
            ⛶ {t(lang, 'tut.exitFullscreen')}
          </button>
        )}
        {showTable && (
        <div className="tut-stage-wrap">
        {step?.kind === 'info' && !recap ? (
          <SimTable
            lang={lang}
            boardNo={trackPosition}
            dealer={lesson.dealer}
            title={lesson.title}
            contractLabel={null}
            seats={(Object.keys(handHands) as Seat[]).map(s => ({
              seat: s,
              count: handHands[s].length,
              active: false,
            }))}
            trick={handView?.trick ?? []}
            hand={sortHand(handHands.S, lessonTrump, suitOrder)}
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
            overlaySlot={tutorialOverlay}
            trickStatic
          />
        ) : auctionEntries ? (
          <SimTable
            bidding
            lang={lang}
            boardNo={trackPosition}
            dealer={lesson.dealer}
            title={lang === 'zh' ? '叫牌' : 'Auction'}
            contractLabel={null}
            seats={(Object.keys(lesson.hands) as Seat[]).map(s => ({
              seat: s,
              count: 13,
              badge: lastBidBySeat.has(s) ? bidLabelL(lang, lastBidBySeat.get(s)!) : undefined,
              active: auctionView?.turn === s,
            }))}
            trick={[]}
            hand={sortHand(lesson.hands.S, null, suitOrder)}
            hands={lesson.hands}
            handLabel={seatLabel(lang, 'S')}
            trump={null}
            seatChars={seatChars}
            overlaySlot={tutorialOverlay}
            interactive={false}
            onPlay={() => {}}
            hint={null}
            stepKey={stepKey}
            centreExtra={!recap && (
              /* The bidding box is ONE unified panel on the centre felt: the
               * per-bid explanation (caption) and the running auction trail
               * live INSIDE it, so the centre never holds both this panel and
               * a separate floating overlay at the same time. */
              <div className="sim-bidbox on-felt">
                {captionOpen && lastEntry && (
                  <div className="sim-caption">
                    <span className="sim-caption-tag">{seatLabel(lang, lastEntry.seat)} · {bidLabelL(lang, lastEntry.bid)}</span>
                    <span className="sim-caption-text">{captionNote}</span>
                    <button className="btn ghost" disabled={!runner.canGoBack()} title={t(lang, 'tut.backStepHint')} onClick={doBack}>← {t(lang, 'tut.backStep')}</button>
                    {awaitingTap && <div className="tut-tap-row">{tapNext}</div>}
                  </div>
                )}
                {pending && pending.kind === 'bid' ? (
                  <>
                    {fbMood === 'bad' ? feedbackLine : <div className="sim-hint">🫵 {pending.hint}</div>}
                    <button className="btn ghost" disabled={!runner.canGoBack()} title={t(lang, 'tut.backStepHint')} onClick={doBack}>← {t(lang, 'tut.backStep')}</button>
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
                  <>
                    <div className="sim-trail">
                      {auctionEntries.map((e, i) => (
                        <span key={i} className="trail-bid">
                          {seatLabel(lang, e.seat)} {bidLabelL(lang, e.bid)}
                        </span>
                      ))}
                    </div>
                    {awaitingTap && !captionOpen && <div className="tut-tap-row">{tapNext}</div>}
                  </>
                )}
                {!pending && feedbackLine}
              </div>
            )}
          />
        ) : step?.kind === 'play' && playView && trickNo !== null ? (
          <SimTable
            lang={lang}
            boardNo={trackPosition}
            dealer={lesson.dealer}
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
            trick={playView.trick}
            hand={sortHand(playView.hands.S, playTrump, suitOrder)}
            handLabel={seatLabel(lang, 'S')}
            trump={playTrump}
            interactive={!!pending && !leadReview}
            playSeat={pending && pending.kind === 'play' ? pending.seat : null}
            onPlay={doPlay}
            hint={pending?.hint ?? null}
            highlight={pending && pending.kind === 'play' ? pending.expected : null}
            focus={focusCards}
            stepKey={stepKey}
            hands={playView.hands}
            dummySeat={dummySeat}
            seatChars={seatChars}
            winSeat={null}
            trickStatic={leadReview}
            collectingSeat={null}
            tacticalHint={tacticalHint}
            tricksWon={playView.tricksWon}
            targetTricks={lesson.id === 'tricks' ? null : 6 + lesson.contract.level}
            overlaySlot={tutorialOverlay}
          />
        ) : null}

        {/* tutorial overlay now rendered inside SimTable via overlaySlot —
            floated over the centre felt, never over the North/South hands */}
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
            nextTitle={lessonIdx + 1 < lessons.length ? (lessonIdx === trackLast && track === 'basic' ? (lang === 'zh' ? '进阶篇（选学）：' : 'Advanced (optional): ') : '') + lessons[lessonIdx + 1]!.title : null}
            onNextLesson={() => startLesson(lessonIdx + 1)}
            onHome={() => go('home')}
          />
        )}
        {step?.kind === 'play' && <div className="tut-tap-row"><button className="btn ghost" disabled={!runner.canGoBack()} title={t(lang, 'tut.backStepHint')} onClick={doBack}>← {t(lang, 'tut.backStep')}</button></div>}
        {step?.kind === 'play' && !leadReview && runner.claimableRemaining() > 0 && (
          <div className="tut-tap-row">
            <button className="btn primary" onClick={() => {
              runner.claimRemaining(); setFeedback(''); refresh();
            }}>
              {t(lang, 'tut.claimRemaining').replace('{n}', String(runner.claimableRemaining()))}
            </button>
          </div>
        )}
        {step?.kind === 'play' && awaitingTap && !leadReview && !stepRunout && (
          <div className="tut-tap-row">{tapNext}</div>
        )}
        {step?.kind !== 'auction' && feedbackLine}
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
