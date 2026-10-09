import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../App.js';
import { t, bidLabelL, seatLabel, type Lang } from '../i18n.js';
import { CardView, Avatar } from '../components/ui.js';
import { audio } from '../audio.js';
import { TutorialRunner } from '../../../shared/tutorial.js';
import { getLessons } from '../../../shared/lessons.js';
import type { Bid } from '../../../shared/bidding.js';
import { cardLabel } from '../../../shared/deck.js';
import type { Card, Seat } from '../../../shared/deck.js';

const ALL_BIDS: Bid[] = (() => {
  const bids: Bid[] = [{ type: 'pass' }];
  const denoms = ['C', 'D', 'H', 'S', 'NT'] as const;
  for (let level = 1; level <= 7; level++)
    for (const d of denoms) bids.push({ type: 'bid', level, denom: d });
  bids.push({ type: 'double' }, { type: 'redouble' });
  return bids;
})();

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

interface SimSeatInfo {
  seat: Seat;
  count: number;
  badge?: string;
  active?: boolean;
}

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
  interactive: boolean;
  onPlay: (c: Card) => void;
  hint: string | null;
  stepKey: string;
  bottomExtra?: React.ReactNode;
}) {
  const { lang } = props;
  const sigs = props.trick.map(t => `${t.seat}${t.card.suit}${t.card.rank}`);
  const fresh = useFreshOrder(sigs, props.stepKey);

  useEffect(() => {
    const timers: number[] = [];
    fresh.forEach(ord => {
      timers.push(window.setTimeout(() => audio.sfx('card'), 120 + ord * 380));
    });
    return () => timers.forEach(t => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sigs.join('|')]);

  return (
    <div className="sim-felt">
      <div className="sim-topbar">
        <span className="sim-trickno">{props.title}</span>
        {props.contractLabel && <span className="contract-pill">{props.contractLabel}</span>}
      </div>

      {props.seats
        .filter(s => s.seat !== 'S')
        .map(s => (
          <div key={s.seat} className={`sim-seat sim-${simPos(s.seat)}${s.active ? ' active-turn' : ''}`}>
            <div className="sim-backs" aria-hidden>
              <div className="card back tiny" />
              <div className="card back tiny" />
              <div className="card back tiny" />
            </div>
            <div className="sim-plate">
              <span className="sim-seatname">{seatLabel(lang, s.seat)}</span>
              <span className="sim-count">🂠×{s.count}</span>
            </div>
            {s.badge && <div className="sim-badge">{s.badge}</div>}
          </div>
        ))}

      <div className="sim-center">
        <div className="sim-trick">
          {props.trick.map(t => {
            const sig = `${t.seat}${t.card.suit}${t.card.rank}`;
            const ord = fresh.get(sig);
            return (
              <div
                key={sig}
                className={`sim-tcard pos-${simPos(t.seat)}${ord === undefined ? ' noanim' : ''}`}
                style={ord === undefined ? undefined : { animationDelay: `${ord * 0.38}s` }}
              >
                <CardView card={t.card} small />
              </div>
            );
          })}
        </div>
      </div>

      <div className="sim-me">
        {props.hint && <div className="sim-hint">🫵 {props.hint}</div>}
        {props.hand && (
          <>
            {props.handLabel && <div className="sim-handlabel">{props.handLabel}</div>}
            <div className="hand">
              {props.hand.map((c, i) => (
                <CardView
                  key={`${c.suit}${c.rank}-${i}`}
                  card={c}
                  playable={props.interactive}
                  onClick={props.interactive ? () => props.onPlay(c) : undefined}
                />
              ))}
            </div>
          </>
        )}
        {props.bottomExtra}
      </div>
    </div>
  );
}

export function Tutorial() {
  const { lang, go, characterId } = useApp();
  const [lessonIdx, setLessonIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const [feedback, setFeedback] = useState('');
  const runnerRef = useRef<TutorialRunner | null>(null);

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

  const startLesson = (i: number) => {
    setLessonIdx(i);
    runnerRef.current = new TutorialRunner(lessons[i]!);
    setFeedback('');
    audio.sfx('click');
    refresh();
  };

  const doAdvance = () => {
    setFeedback('');
    runner.advance();
    audio.sfx('click');
    refresh();
  };

  const doBid = (label: string) => {
    const r = runner.submitBid(label);
    if (r.ok) {
      audio.sfx('bid');
      setFeedback('');
    } else {
      audio.sfx('lose');
      setFeedback(`${t(lang, 'tut.tryAgain')} ${r.hint ?? ''}`);
    }
    refresh();
  };

  const doPlay = (card: Card) => {
    const r = runner.submitPlay(cardLabel(card));
    if (r.ok) {
      audio.sfx('card');
      setFeedback('');
    } else {
      audio.sfx('lose');
      setFeedback(`${t(lang, 'tut.tryAgain')} ${r.hint ?? ''}`);
    }
    refresh();
  };

  const pending = runner.pendingLearnerAction();
  const auctionView = runner.auctionView();
  const playView = runner.playView();
  const trickNo = runner.trickNumber();
  const result = runner.getResult();
  const done = !step;
  const stepKey = `${lang}:${lesson.id}:${runner.stepIndex}`;

  const lastBidBySeat = useMemo(() => {
    const m = new Map<Seat, Bid>();
    for (const e of auctionView?.entries ?? []) m.set(e.seat, e.bid);
    return m;
  }, [auctionView]);

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
            onClick={() => startLesson(i)}
          >
            {i + 1}. {l.title}
          </button>
        ))}
      </div>

      <div className="tut-body">
        {step?.kind === 'info' && (
          <div className="tut-coach-card">
            <Avatar id={characterId} className="coach-avatar" />
            <div className="coach-bubble">
              <p className="tut-text">{step.text}</p>
              <button className="btn primary" onClick={doAdvance}>{t(lang, 'tut.next')}</button>
            </div>
          </div>
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
            hand={null}
            handLabel={null}
            interactive={false}
            onPlay={() => {}}
            hint={null}
            stepKey={stepKey}
            bottomExtra={
              <div className="sim-bidbox">
                {pending && pending.kind === 'bid' ? (
                  <>
                    <div className="sim-hint">🫵 {pending.hint}</div>
                    <div className="bid-grid">
                      {ALL_BIDS.map((b, i) => (
                        <button key={i} className="bid-btn" onClick={() => doBid(bidToLabel(b))}>
                          {bidLabelL(lang, b)}
                        </button>
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
            trick={playView.trick}
            hand={pending && pending.kind === 'play' ? playView.hands[pending.seat] : playView.hands.S}
            handLabel={
              pending && pending.kind === 'play'
                ? `${seatLabel(lang, pending.seat)}${pending.seat === 'N' ? (lang === 'zh' ? '（明手）' : ' (dummy)') : ''}`
                : seatLabel(lang, 'S')
            }
            interactive={!!pending}
            onPlay={doPlay}
            hint={pending?.hint ?? null}
            stepKey={stepKey}
          />
        )}

        {step?.kind === 'result' && result && (
          <div className="tut-card">
            <p className="tut-text">
              {result.made ? '🎉' : '💪'} {result.total} {t(lang, 'table.resultScore').toLowerCase()}!
              ({result.tricksTaken}/13 {t(lang, 'table.resultTricks').toLowerCase()})
            </p>
            <button className="btn primary" onClick={doAdvance}>{t(lang, 'tut.next')}</button>
          </div>
        )}

        {done && (
          <div className="tut-card">
            <p className="tut-text">🏁 {t(lang, 'tut.done')}</p>
            {lessonIdx + 1 < lessons.length ? (
              <button className="btn primary" onClick={() => startLesson(lessonIdx + 1)}>
                {t(lang, 'tut.next')}: {lessons[lessonIdx + 1]!.title}
              </button>
            ) : (
              <button className="btn primary" onClick={() => go('home')}>🃏 {t(lang, 'app.title')}</button>
            )}
          </div>
        )}

        {feedback && <div className="tut-feedback">{feedback}</div>}
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
