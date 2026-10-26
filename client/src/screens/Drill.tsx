import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../App.js';
import { t } from '../i18n.js';
import { audio } from '../audio.js';
import { CardView, Avatar } from '../components/ui.js';
import {
  generateDrillHand,
  type DrillCategory,
  type HandEvaluation,
} from '../../../shared/evaluator.js';
import type { Card, Suit } from '../../../shared/deck.js';
import { sortHand } from '../../../shared/deck.js';

const BID_OPTIONS = [
  { id: 'Pass', label: 'Pass', denom: 'pass' },
  { id: '1C', label: '1♣', denom: 'C' },
  { id: '1D', label: '1♦', denom: 'D' },
  { id: '1H', label: '1♥', denom: 'H' },
  { id: '1S', label: '1♠', denom: 'S' },
  { id: '1NT', label: '1NT', denom: 'NT' },
  { id: '2C', label: '2♣', denom: 'C' },
  { id: '2NT', label: '2NT', denom: 'NT' },
];

function groupHandBySuit(cards: Card[]): Array<{ suit: Suit; cards: Card[] }> {
  const groups: Record<Suit, Card[]> = { S: [], H: [], D: [], C: [] };
  for (const c of cards) groups[c.suit].push(c);
  return (['S', 'H', 'D', 'C'] as Suit[])
    .map(suit => ({ suit, cards: groups[suit] }))
    .filter(g => g.cards.length > 0);
}

export function Drill() {
  const { lang, go, characterId } = useApp();

  const [category, setCategory] = useState<DrillCategory>('all');
  const [deal, setDeal] = useState<{ hand: Card[]; evaluation: HandEvaluation }>(() =>
    generateDrillHand('all')
  );
  const [userBid, setUserBid] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const sortedHand = useMemo(() => sortHand(deal.hand, null), [deal.hand]);
  const handGroups = useMemo(() => groupHandBySuit(sortedHand), [sortedHand]);

  const handleNextDeal = useCallback(
    (cat?: DrillCategory) => {
      audio.sfx('shuffle');
      const activeCat = cat ?? category;
      const next = generateDrillHand(activeCat);
      setDeal(next);
      setUserBid(null);
      setShowBreakdown(false);
    },
    [category]
  );

  const handleCategoryChange = (cat: DrillCategory) => {
    setCategory(cat);
    handleNextDeal(cat);
  };

  const handleSelectBid = (bidId: string) => {
    if (userBid !== null) return; // already answered
    setUserBid(bidId);
    setShowBreakdown(true);
    setTotalSolved(prev => prev + 1);

    const isCorrect = bidId === deal.evaluation.recommendedBid;
    if (isCorrect) {
      audio.sfx('win');
      setStreak(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);
    } else {
      audio.sfx('lose');
      setStreak(0);
    }
  };

  const isAnswered = userBid !== null;
  const isCorrect = isAnswered && userBid === deal.evaluation.recommendedBid;

  return (
    <div className="drill-screen">
      {/* Top control bar */}
      <div className="drill-header">
        <div className="drill-nav">
          <button className="btn ghost" onClick={() => go('home')}>
            ← {t(lang, 'tut.back')}
          </button>
          <div className="drill-title-wrap">
            <h1 className="drill-title">🎯 {t(lang, 'drill.title')}</h1>
            <span className="drill-subtitle">{t(lang, 'drill.subtitle')}</span>
          </div>
        </div>

        {/* Score & Streak Stats */}
        <div className="drill-stats">
          <div className="drill-stat-box">
            <span className="stat-label">{t(lang, 'drill.streak')}</span>
            <span className="stat-val streak">🔥 {streak}</span>
          </div>
          <div className="drill-stat-box">
            <span className="stat-label">{t(lang, 'drill.accuracy')}</span>
            <span className="stat-val">
              {totalSolved === 0
                ? '—'
                : `${Math.round((totalCorrect / totalSolved) * 100)}% (${totalCorrect}/${totalSolved})`}
            </span>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="drill-categories">
        {(
          [
            { id: 'all', label: t(lang, 'drill.categoryAll') },
            { id: 'pass', label: t(lang, 'drill.categoryPass') },
            { id: '1nt', label: t(lang, 'drill.category1nt') },
            { id: 'major', label: t(lang, 'drill.categoryMajor') },
            { id: 'minor', label: t(lang, 'drill.categoryMinor') },
            { id: 'strong', label: t(lang, 'drill.categoryStrong') },
          ] as const
        ).map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`drill-cat-pill ${category === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Table Arena */}
      <div className="drill-table-container">
        <div className="drill-felt">
          {/* Dealt 13 Cards */}
          <div className="drill-hand-display" role="region" aria-label="13-card hand">
            {handGroups.map(group => {
              const count = group.cards.length;
              const mid = (count - 1) / 2;
              return (
                <div key={group.suit} className={`suit-cluster suit-${group.suit.toLowerCase()}`}>
                  {group.cards.map((c, i) => {
                    const rotDeg = count > 1 ? (i - mid) * 1.5 : 0;
                    const yOff = count > 1 ? Math.abs(i - mid) * 1.2 : 0;
                    return (
                      <div
                        key={`${c.suit}${c.rank}-${i}`}
                        className="card-fan-wrapper"
                        style={{
                          ['--fan-rot' as string]: `${rotDeg}deg`,
                          ['--fan-y' as string]: `${yOff}px`,
                        }}
                      >
                        <CardView card={c} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Quick Metrics Bar (HCP, Length, Shape) */}
          <div className="drill-metrics-bar">
            {showBreakdown ? (
              <div className="drill-metrics-revealed">
                <span className="metric-chip">
                  <strong>{t(lang, 'drill.hcpLabel')}:</strong> {deal.evaluation.hcp}
                </span>
                <span className="metric-chip">
                  <strong>{t(lang, 'drill.lengthLabel')}:</strong> +{deal.evaluation.lengthPoints}
                </span>
                <span className="metric-chip highlight">
                  <strong>{t(lang, 'drill.totalLabel')}:</strong> {deal.evaluation.totalPoints}
                </span>
                <span className="metric-chip">
                  <strong>{t(lang, 'drill.shapeLabel')}:</strong> {deal.evaluation.shape} (
                  {deal.evaluation.isBalanced ? t(lang, 'drill.balanced') : t(lang, 'drill.unbalanced')})
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="drill-reveal-hint-btn"
                onClick={() => setShowBreakdown(true)}
              >
                {t(lang, 'drill.showHint')}: {t(lang, 'drill.revealAnswer')} 🔍
              </button>
            )}
          </div>
        </div>

        {/* Action Panel: Question and Bid Options */}
        <div className="drill-action-card">
          <div className="drill-question-row">
            <span className="drill-question-text">❓ {t(lang, 'drill.question')}</span>
          </div>

          <div className="drill-bid-grid">
            {BID_OPTIONS.map(opt => {
              let cls = `drill-bid-btn denom-${opt.denom}`;
              if (isAnswered) {
                if (opt.id === deal.evaluation.recommendedBid) {
                  cls += ' correct-bid';
                } else if (opt.id === userBid) {
                  cls += ' wrong-bid';
                } else {
                  cls += ' muted-bid';
                }
              }
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={cls}
                  onClick={() => handleSelectBid(opt.id)}
                  disabled={isAnswered}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Feedback Card */}
          {isAnswered && (
            <div className={`drill-feedback-card ${isCorrect ? 'correct' : 'wrong'}`}>
              <div className="feedback-header">
                <Avatar
                  id={characterId}
                  className={`coach-avatar mini ${isCorrect ? 'react-happy' : 'react-shake'}`}
                />
                <div className="feedback-title-wrap">
                  <h3 className="feedback-verdict">
                    {isCorrect
                      ? lang === 'zh'
                        ? '🎉 回答完全正确！'
                        : '🎉 Excellent Call!'
                      : lang === 'zh'
                      ? `💪 标准开叫应为 ${deal.evaluation.recommendedBid}`
                      : `💪 Correct Opening is ${deal.evaluation.recommendedBid}`}
                  </h3>
                  <p className="feedback-explanation">
                    {deal.evaluation.explanation[lang]}
                  </p>
                </div>
              </div>

              {deal.evaluation.mnemonic && (
                <div className="feedback-mnemonic">
                  💡 <strong>ACBL 口诀：</strong> {deal.evaluation.mnemonic[lang]}
                </div>
              )}

              <div className="feedback-action-row">
                <button
                  type="button"
                  className="btn primary drill-next-btn"
                  onClick={() => handleNextDeal()}
                >
                  {t(lang, 'drill.nextDeal')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
