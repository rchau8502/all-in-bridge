import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../App.js';
import { t } from '../i18n.js';
import { audio } from '../audio.js';
import { CardView, Avatar } from '../components/ui.js';
import {
  generateDrillHand,
  generateResponseDrillHand,
  generateOvercallDrillHand,
  type DrillCategory,
  type HandEvaluation,
  type ResponseEvaluation,
  type OvercallEvaluation,
  type PartnerOpeningBid,
  type OpponentOpeningBid,
} from '../../../shared/evaluator.js';
import type { Card, Suit } from '../../../shared/deck.js';
import { sortHand } from '../../../shared/deck.js';

type DrillMode = 'opening' | 'responding' | 'overcall';

const OPENING_BID_OPTIONS = [
  { id: 'Pass', label: 'Pass', denom: 'pass' },
  { id: '1C', label: '1♣', denom: 'C' },
  { id: '1D', label: '1♦', denom: 'D' },
  { id: '1H', label: '1♥', denom: 'H' },
  { id: '1S', label: '1♠', denom: 'S' },
  { id: '1NT', label: '1NT', denom: 'NT' },
  { id: '2C', label: '2♣', denom: 'C' },
  { id: '2NT', label: '2NT', denom: 'NT' },
];

const RESPONDING_BID_OPTIONS = [
  { id: 'Pass', label: 'Pass', denom: 'pass' },
  { id: '1H', label: '1♥', denom: 'H' },
  { id: '1S', label: '1♠', denom: 'S' },
  { id: '1NT', label: '1NT', denom: 'NT' },
  { id: '2C', label: '2♣', denom: 'C' },
  { id: '2D', label: '2♦', denom: 'D' },
  { id: '2H', label: '2♥', denom: 'H' },
  { id: '2S', label: '2♠', denom: 'S' },
  { id: '2NT', label: '2NT', denom: 'NT' },
  { id: '3H', label: '3♥', denom: 'H' },
  { id: '3S', label: '3♠', denom: 'S' },
  { id: '3NT', label: '3NT', denom: 'NT' },
  { id: '4H', label: '4♥', denom: 'H' },
  { id: '4S', label: '4♠', denom: 'S' },
];

const OVERCALL_BID_OPTIONS = [
  { id: 'Pass', label: 'Pass', denom: 'pass' },
  { id: '1D', label: '1♦', denom: 'D' },
  { id: '1H', label: '1♥', denom: 'H' },
  { id: '1S', label: '1♠', denom: 'S' },
  { id: '1NT', label: '1NT', denom: 'NT' },
  { id: 'Dbl', label: 'Dbl', denom: 'double' },
  { id: '2C', label: '2♣', denom: 'C' },
  { id: '2D', label: '2♦', denom: 'D' },
  { id: '2H', label: '2♥', denom: 'H' },
  { id: '2S', label: '2♠', denom: 'S' },
];

const PARTNER_OPENINGS: Array<{ id: PartnerOpeningBid; label: string; desc: { en: string; zh: string } }> = [
  { id: '1NT', label: '1NT', desc: { en: '15–17 HCP, Balanced', zh: '15–17 大牌点，均型' } },
  { id: '1S', label: '1♠', desc: { en: '12–21 pts, 5+ ♠', zh: '12–21 总点，5张以上黑桃' } },
  { id: '1H', label: '1♥', desc: { en: '12–21 pts, 5+ ♥', zh: '12–21 总点，5张以上红心' } },
  { id: '1D', label: '1♦', desc: { en: '12–21 pts, 3+ ♦', zh: '12–21 总点，3张以上方块' } },
  { id: '1C', label: '1♣', desc: { en: '12–21 pts, 3+ ♣', zh: '12–21 总点，3张以上梅花' } },
];

const OPPONENT_OPENINGS: Array<{ id: OpponentOpeningBid; label: string; desc: { en: string; zh: string } }> = [
  { id: '1C', label: '1♣', desc: { en: '12–21 pts, 3+ ♣', zh: '12–21 点，3张以上梅花' } },
  { id: '1D', label: '1♦', desc: { en: '12–21 pts, 3+ ♦', zh: '12–21 点，3张以上方块' } },
  { id: '1H', label: '1♥', desc: { en: '12–21 pts, 5+ ♥', zh: '12–21 点，5张以上红心' } },
  { id: '1S', label: '1♠', desc: { en: '12–21 pts, 5+ ♠', zh: '12–21 点，5张以上黑桃' } },
];

function groupHandBySuit(cards: Card[]): Array<{ suit: Suit; cards: Card[] }> {
  const groups: Record<Suit, Card[]> = { S: [], H: [], D: [], C: [] };
  for (const c of cards) groups[c.suit].push(c);
  return (['S', 'H', 'D', 'C'] as Suit[])
    .map(suit => ({ suit, cards: groups[suit] }))
    .filter(g => g.cards.length > 0);
}

export function Drill() {
  const { lang, go, characterId, unlockAchievement } = useApp();

  const [mode, setMode] = useState<DrillMode>('opening');

  // Opening mode state
  const [category, setCategory] = useState<DrillCategory>('all');
  const [openingDeal, setOpeningDeal] = useState<{ hand: Card[]; evaluation: HandEvaluation }>(() =>
    generateDrillHand('all')
  );

  // Responding mode state
  const [partnerBid, setPartnerBid] = useState<PartnerOpeningBid>('1NT');
  const [respDeal, setRespDeal] = useState<{ hand: Card[]; evaluation: ResponseEvaluation }>(() =>
    generateResponseDrillHand('1NT')
  );

  // Overcall mode state
  const [oppBid, setOppBid] = useState<OpponentOpeningBid>('1D');
  const [overcallDeal, setOvercallDeal] = useState<{ hand: Card[]; evaluation: OvercallEvaluation }>(() =>
    generateOvercallDrillHand('1D')
  );

  const [userBid, setUserBid] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const activeHand = mode === 'opening'
    ? openingDeal.hand
    : mode === 'responding'
    ? respDeal.hand
    : overcallDeal.hand;

  const targetBid = mode === 'opening'
    ? openingDeal.evaluation.recommendedBid
    : mode === 'responding'
    ? respDeal.evaluation.recommendedBid
    : overcallDeal.evaluation.recommendedBid;

  const sortedHand = useMemo(() => sortHand(activeHand, null), [activeHand]);
  const handGroups = useMemo(() => groupHandBySuit(sortedHand), [sortedHand]);

  const handleNextDeal = useCallback(() => {
    audio.sfx('shuffle');
    setUserBid(null);
    setShowBreakdown(false);
    if (mode === 'opening') {
      setOpeningDeal(generateDrillHand(category));
    } else if (mode === 'responding') {
      setRespDeal(generateResponseDrillHand(partnerBid));
    } else {
      setOvercallDeal(generateOvercallDrillHand(oppBid));
    }
  }, [mode, category, partnerBid, oppBid]);

  const handleModeChange = (newMode: DrillMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setUserBid(null);
    setShowBreakdown(false);
    audio.sfx('click');
    if (newMode === 'opening') {
      setOpeningDeal(generateDrillHand(category));
    } else if (newMode === 'responding') {
      setRespDeal(generateResponseDrillHand(partnerBid));
    } else {
      setOvercallDeal(generateOvercallDrillHand(oppBid));
    }
  };

  const handleCategoryChange = (cat: DrillCategory) => {
    setCategory(cat);
    audio.sfx('shuffle');
    setUserBid(null);
    setShowBreakdown(false);
    setOpeningDeal(generateDrillHand(cat));
  };

  const handlePartnerBidChange = (pb: PartnerOpeningBid) => {
    setPartnerBid(pb);
    audio.sfx('shuffle');
    setUserBid(null);
    setShowBreakdown(false);
    setRespDeal(generateResponseDrillHand(pb));
  };

  const handleOppBidChange = (ob: OpponentOpeningBid) => {
    setOppBid(ob);
    audio.sfx('shuffle');
    setUserBid(null);
    setShowBreakdown(false);
    setOvercallDeal(generateOvercallDrillHand(ob));
  };

  const handleSelectBid = (bidId: string) => {
    if (userBid !== null) return;
    setUserBid(bidId);
    setShowBreakdown(true);
    setTotalSolved(prev => prev + 1);

    const isCorrect = bidId === targetBid;
    if (isCorrect) {
      audio.sfx('win');
      setStreak(prev => {
        const next = prev + 1;
        if (next >= 5) {
          if (mode === 'opening') unlockAchievement('opening_pro');
          else unlockAchievement('response_expert');
        }
        return next;
      });
      setTotalCorrect(prev => prev + 1);
    } else {
      audio.sfx('lose');
      setStreak(0);
    }
  };

  const isAnswered = userBid !== null;
  const isCorrect = isAnswered && userBid === targetBid;

  const activeEval = mode === 'opening'
    ? openingDeal.evaluation
    : mode === 'responding'
    ? respDeal.evaluation
    : overcallDeal.evaluation;

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

      {/* Main Mode Tabs: Opening vs Responding vs Overcall */}
      <div className="drill-mode-tabs">
        <button
          type="button"
          className={`drill-mode-tab ${mode === 'opening' ? 'active' : ''}`}
          onClick={() => handleModeChange('opening')}
        >
          ♠ {t(lang, 'drill.modeOpening')}
        </button>
        <button
          type="button"
          className={`drill-mode-tab ${mode === 'responding' ? 'active' : ''}`}
          onClick={() => handleModeChange('responding')}
        >
          🤝 {t(lang, 'drill.modeResponding')}
        </button>
        <button
          type="button"
          className={`drill-mode-tab ${mode === 'overcall' ? 'active' : ''}`}
          onClick={() => handleModeChange('overcall')}
        >
          ⚔️ {t(lang, 'drill.modeOvercall')}
        </button>
      </div>

      {/* Filter / Scenario Pills */}
      {mode === 'opening' ? (
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
      ) : mode === 'responding' ? (
        <div className="drill-partner-scenarios">
          <span className="drill-partner-label">{t(lang, 'drill.partnerOpened')}</span>
          <div className="drill-categories">
            {PARTNER_OPENINGS.map(po => (
              <button
                key={po.id}
                type="button"
                className={`drill-cat-pill ${partnerBid === po.id ? 'active' : ''}`}
                onClick={() => handlePartnerBidChange(po.id)}
              >
                {po.label} ({po.desc[lang]})
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="drill-partner-scenarios">
          <span className="drill-partner-label">{t(lang, 'drill.oppOpened')}</span>
          <div className="drill-categories">
            {OPPONENT_OPENINGS.map(oo => (
              <button
                key={oo.id}
                type="button"
                className={`drill-cat-pill ${oppBid === oo.id ? 'active' : ''}`}
                onClick={() => handleOppBidChange(oo.id)}
              >
                {oo.label} ({oo.desc[lang]})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Arena */}
      <div className="drill-table-container">
        <div className="drill-felt">
          {/* Partner bid indicator in responding mode */}
          {mode === 'responding' && (
            <div className="drill-partner-badge">
              <span className="partner-avatar-icon">🫱</span>
              <span className="partner-bid-lead">{t(lang, 'drill.partnerOpened')}</span>
              <span className="partner-bid-val">{partnerBid}</span>
              <span className="partner-bid-desc">
                ({PARTNER_OPENINGS.find(p => p.id === partnerBid)?.desc[lang]})
              </span>
            </div>
          )}

          {/* Opponent bid indicator in overcall mode */}
          {mode === 'overcall' && (
            <div className="drill-partner-badge opp-badge">
              <span className="partner-avatar-icon">⚔️</span>
              <span className="partner-bid-lead">{t(lang, 'drill.oppOpened')}</span>
              <span className="partner-bid-val">{oppBid}</span>
              <span className="partner-bid-desc">
                ({OPPONENT_OPENINGS.find(p => p.id === oppBid)?.desc[lang]})
              </span>
            </div>
          )}

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

          {/* Quick Metrics Bar (HCP, Length/Dummy, Shape) */}
          <div className="drill-metrics-bar">
            {showBreakdown ? (
              <div className="drill-metrics-revealed">
                <span className="metric-chip">
                  <strong>{t(lang, 'drill.hcpLabel')}:</strong> {activeEval.hcp}
                </span>
                {mode === 'opening' ? (
                  <>
                    <span className="metric-chip">
                      <strong>{t(lang, 'drill.lengthLabel')}:</strong> +{(activeEval as HandEvaluation).lengthPoints}
                    </span>
                    <span className="metric-chip highlight">
                      <strong>{t(lang, 'drill.totalLabel')}:</strong> {(activeEval as HandEvaluation).totalPoints}
                    </span>
                    <span className="metric-chip">
                      <strong>{t(lang, 'drill.shapeLabel')}:</strong> {(activeEval as HandEvaluation).shape} (
                      {(activeEval as HandEvaluation).isBalanced ? t(lang, 'drill.balanced') : t(lang, 'drill.unbalanced')})
                    </span>
                  </>
                ) : mode === 'responding' ? (
                  <>
                    <span className="metric-chip">
                      <strong>{t(lang, 'drill.supportPoints')}:</strong> +{(activeEval as ResponseEvaluation).supportPoints}
                    </span>
                    <span className="metric-chip highlight">
                      <strong>{t(lang, 'drill.totalLabel')}:</strong> {(activeEval as ResponseEvaluation).totalPoints}
                    </span>
                    {(activeEval as ResponseEvaluation).hasGoldenFit && (
                      <span className="metric-chip fit-gold">
                        ✨ {t(lang, 'drill.goldenFit')} ({(activeEval as ResponseEvaluation).supportLength}张)
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className={`metric-chip ${(activeEval as OvercallEvaluation).breakdown.pointsOk ? 'highlight' : ''}`}>
                      {(activeEval as OvercallEvaluation).breakdown.pointsOk ? '✓' : '✗'} 10+ {t(lang, 'drill.hcpLabel')}
                    </span>
                    <span className={`metric-chip ${(activeEval as OvercallEvaluation).breakdown.lengthOk ? 'highlight' : ''}`}>
                      {(activeEval as OvercallEvaluation).breakdown.lengthOk ? '✓' : '✗'} 5+ {lang === 'zh' ? '套长' : 'Length'}
                    </span>
                    <span className={`metric-chip ${(activeEval as OvercallEvaluation).breakdown.honorsOk ? 'highlight' : ''}`}>
                      {(activeEval as OvercallEvaluation).breakdown.honorsOk ? '✓' : '✗'} 2 {lang === 'zh' ? '大牌' : 'Honors'}
                    </span>
                  </>
                )}
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
            <span className="drill-question-text">
              ❓ {mode === 'opening'
                ? t(lang, 'drill.question')
                : mode === 'responding'
                ? t(lang, 'drill.respQuestion')
                : t(lang, 'drill.overcallQuestion')}
            </span>
          </div>

          <div className={`drill-bid-grid ${mode === 'responding' ? 'responding-grid' : mode === 'overcall' ? 'overcall-grid' : ''}`}>
            {(mode === 'opening' ? OPENING_BID_OPTIONS : mode === 'responding' ? RESPONDING_BID_OPTIONS : OVERCALL_BID_OPTIONS).map(opt => {
              let cls = `drill-bid-btn denom-${opt.denom}`;
              if (isAnswered) {
                if (opt.id === targetBid) {
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
                      ? `💪 标准决策应为 ${targetBid}`
                      : `💪 Correct Call is ${targetBid}`}
                  </h3>
                  <p className="feedback-explanation">
                    {activeEval.explanation[lang]}
                  </p>
                </div>
              </div>

              {activeEval.mnemonic && (
                <div className="feedback-mnemonic">
                  💡 <strong>ACBL 口诀：</strong> {activeEval.mnemonic[lang]}
                </div>
              )}

              <div className="feedback-action-row">
                <button
                  type="button"
                  className="btn primary drill-next-btn"
                  onClick={handleNextDeal}
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
