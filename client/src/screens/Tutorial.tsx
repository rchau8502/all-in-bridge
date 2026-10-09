import { useMemo, useRef, useState } from 'react';
import { useApp } from '../App.js';
import { t, bidLabelL } from '../i18n.js';
import { CardView } from '../components/ui.js';
import { audio } from '../audio.js';
import { TutorialRunner } from '../../../shared/tutorial.js';
import { getLessons } from '../../../shared/lessons.js';
import type { Bid } from '../../../shared/bidding.js';
import { cardLabel } from '../../../shared/deck.js';
import type { Card } from '../../../shared/deck.js';

const ALL_BIDS: Bid[] = (() => {
  const bids: Bid[] = [{ type: 'pass' }];
  const denoms = ['C', 'D', 'H', 'S', 'NT'] as const;
  for (let level = 1; level <= 7; level++)
    for (const d of denoms) bids.push({ type: 'bid', level, denom: d });
  bids.push({ type: 'double' }, { type: 'redouble' });
  return bids;
})();

export function Tutorial() {
  const { lang, go } = useApp();
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

  const doQuiz = (i: number) => {
    const r = runner.answerQuiz(i);
    if (r.ok) {
      audio.sfx('trick');
      setFeedback(t(lang, 'tut.correct'));
    } else {
      audio.sfx('lose');
      setFeedback(`${t(lang, 'tut.tryAgain')} ${r.hint ?? ''}`);
    }
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
  const result = runner.getResult();
  const done = !step;

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
          <div className="tut-card">
            <p className="tut-text">{step.text}</p>
            <button className="btn primary" onClick={doAdvance}>{t(lang, 'tut.next')}</button>
          </div>
        )}

        {step?.kind === 'quiz' && (
          <div className="tut-card">
            <p className="tut-text">{step.question}</p>
            <div className="quiz-opts">
              {step.options.map((o, i) => (
                <button key={i} className="btn" onClick={() => doQuiz(i)}>{o}</button>
              ))}
            </div>
          </div>
        )}

        {step?.kind === 'auction' && auctionView && (
          <div className="tut-card">
            <div className="auction-trail">
              {auctionView.entries.map((e, i) => (
                <span key={i} className="trail-bid">{e.seat} {bidLabelL(lang, e.bid)}</span>
              ))}
            </div>
            {pending ? (
              <>
                <p className="tut-text">🫵 {pending.hint}</p>
                <div className="bid-grid">
                  {ALL_BIDS.map((b, i) => (
                    <button key={i} className="bid-btn" onClick={() => doBid(bidToLabel(b))}>
                      {bidLabelL(lang, b)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="hint">…</p>
            )}
          </div>
        )}

        {step?.kind === 'play' && playView && (
          <div className="tut-card">
            <div className="tut-trick">
              {playView.trick.map((tr, i) => (
                <span key={i} className="trail-bid">{tr.seat}: {tr.card.rank}{tr.card.suit}</span>
              ))}
            </div>
            {pending && pending.kind === 'play' ? (
              <>
                <p className="tut-text">🫵 {pending.hint}</p>
                <div className="hand">
                  {playView.hands[pending.seat].map((c, i) => (
                    <CardView key={i} card={c} onClick={() => doPlay(c)} />
                  ))}
                </div>
              </>
            ) : (
              <p className="hint">…</p>
            )}
          </div>
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
