import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../App.js';
import { t, type I18nKey } from '../i18n.js';
import { audio } from '../audio.js';
import { CardView, Avatar } from '../components/ui.js';
import {
  generateDrillHand,
  generateResponseDrillHand,
  generateOvercallDrillHand,
  generateOpeningLeadDrillHand,
  calculateHcp,
  type DrillCategory,
  type HandEvaluation,
  type ResponseEvaluation,
  type OvercallEvaluation,
  type OpeningLeadEvaluation,
  type PartnerOpeningBid,
  type OpponentOpeningBid,
} from '../../../shared/evaluator.js';
import {
  generateBeginnerDrill,
  type BeginnerDrillCategory,
  type BeginnerDrillProblem,
} from '../../../shared/beginner-drills.js';
import type { Card, Suit } from '../../../shared/deck.js';
import { sortHand, cardLabel } from '../../../shared/deck.js';

type DrillMode = 'basics' | 'opening' | 'responding' | 'overcall' | 'lead';

const BASICS_CATEGORIES: Array<{ id: BeginnerDrillCategory; labelKey: I18nKey }> = [
  { id: 'all', labelKey: 'drill.categoryBasicsAll' },
  { id: 'follow_suit', labelKey: 'drill.categoryFollowSuit' },
  { id: 'book_math', labelKey: 'drill.categoryBookMath' },
  { id: 'trick_winner', labelKey: 'drill.categoryTrickWinner' },
  { id: 'hcp_counting', labelKey: 'drill.categoryHcpMath' },
  { id: 'roles', labelKey: 'drill.categoryRoles' },
];

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
  const { lang, go, characterId, unlockAchievement, suitOrder } = useApp();

  const [mode, setMode] = useState<DrillMode>('basics');

  // Basics (Zero-Experience) mode state
  const [basicsCategory, setBasicsCategory] = useState<BeginnerDrillCategory>('all');
  const [basicsProblem, setBasicsProblem] = useState<BeginnerDrillProblem>(() =>
    generateBeginnerDrill('all')
  );
  const [userBasicsOption, setUserBasicsOption] = useState<string | null>(null);

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

  // Opening Lead mode state
  const [leadContractType, setLeadContractType] = useState<'NT' | 'suit'>('NT');
  const [leadDeal, setLeadDeal] = useState<{ hand: Card[]; evaluation: OpeningLeadEvaluation }>(() =>
    generateOpeningLeadDrillHand('NT')
  );
  const [userLeadCard, setUserLeadCard] = useState<Card | null>(null);

  const [userBid, setUserBid] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const activeHand = mode === 'opening'
    ? openingDeal.hand
    : mode === 'responding'
    ? respDeal.hand
    : mode === 'overcall'
    ? overcallDeal.hand
    : mode === 'lead'
    ? leadDeal.hand
    : basicsProblem.cards ?? [];

  const targetBid = mode === 'opening'
    ? openingDeal.evaluation.recommendedBid
    : mode === 'responding'
    ? respDeal.evaluation.recommendedBid
    : mode === 'overcall'
    ? overcallDeal.evaluation.recommendedBid
    : cardLabel(leadDeal.evaluation.recommendedCard);

  const targetLeadCard = leadDeal.evaluation.recommendedCard;

  const sortedHand = useMemo(() => sortHand(activeHand, null, suitOrder), [activeHand, suitOrder]);
  const handGroups = useMemo(() => groupHandBySuit(sortedHand), [sortedHand]);

  const handleNextDeal = useCallback(() => {
    audio.sfx('shuffle');
    setUserBid(null);
    setUserLeadCard(null);
    setUserBasicsOption(null);
    setShowBreakdown(false);
    if (mode === 'basics') {
      setBasicsProblem(generateBeginnerDrill(basicsCategory));
    } else if (mode === 'opening') {
      setOpeningDeal(generateDrillHand(category));
    } else if (mode === 'responding') {
      setRespDeal(generateResponseDrillHand(partnerBid));
    } else if (mode === 'overcall') {
      setOvercallDeal(generateOvercallDrillHand(oppBid));
    } else {
      setLeadDeal(generateOpeningLeadDrillHand(leadContractType));
    }
  }, [mode, basicsCategory, category, partnerBid, oppBid, leadContractType]);

  const handleModeChange = (newMode: DrillMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setUserBid(null);
    setUserLeadCard(null);
    setUserBasicsOption(null);
    setShowBreakdown(false);
    audio.sfx('click');
    if (newMode === 'basics') {
      setBasicsProblem(generateBeginnerDrill(basicsCategory));
    } else if (newMode === 'opening') {
      setOpeningDeal(generateDrillHand(category));
    } else if (newMode === 'responding') {
      setRespDeal(generateResponseDrillHand(partnerBid));
    } else if (newMode === 'overcall') {
      setOvercallDeal(generateOvercallDrillHand(oppBid));
    } else {
      setLeadDeal(generateOpeningLeadDrillHand(leadContractType));
    }
  };

  const handleBasicsCategoryChange = (cat: BeginnerDrillCategory) => {
    setBasicsCategory(cat);
    audio.sfx('shuffle');
    setUserBasicsOption(null);
    setShowBreakdown(false);
    setBasicsProblem(generateBeginnerDrill(cat));
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

  const handleLeadContractChange = (type: 'NT' | 'suit') => {
    setLeadContractType(type);
    audio.sfx('shuffle');
    setUserLeadCard(null);
    setShowBreakdown(false);
    setLeadDeal(generateOpeningLeadDrillHand(type));
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

  const handleSelectLeadCard = (card: Card) => {
    if (userLeadCard !== null) return;
    setUserLeadCard(card);
    setShowBreakdown(true);
    setTotalSolved(prev => prev + 1);

    const isCorrect = card.suit === targetLeadCard.suit && card.rank === targetLeadCard.rank;
    if (isCorrect) {
      audio.sfx('win');
      setStreak(prev => {
        const next = prev + 1;
        if (next >= 5) {
          unlockAchievement('opening_pro');
        }
        return next;
      });
      setTotalCorrect(prev => prev + 1);
    } else {
      audio.sfx('lose');
      setStreak(0);
    }
  };

  const handleSelectBasicsOption = (optId: string) => {
    if (userBasicsOption !== null) return;
    setUserBasicsOption(optId);
    setShowBreakdown(true);
    setTotalSolved(prev => prev + 1);

    const selectedOpt = basicsProblem.options.find(o => o.id === optId);
    const isCorrect = selectedOpt?.isCorrect ?? false;
    if (isCorrect) {
      audio.sfx('win');
      setStreak(prev => {
        const next = prev + 1;
        if (next >= 5) {
          unlockAchievement('first_trick');
        }
        return next;
      });
      setTotalCorrect(prev => prev + 1);
    } else {
      audio.sfx('lose');
      setStreak(0);
    }
  };

  const isBasicsAnswered = mode === 'basics' && userBasicsOption !== null;
  const isBasicsCorrect = isBasicsAnswered && (basicsProblem.options.find(o => o.id === userBasicsOption)?.isCorrect ?? false);

  const isLeadAnswered = mode === 'lead' && userLeadCard !== null;
  const isLeadCorrect = isLeadAnswered && userLeadCard?.suit === targetLeadCard.suit && userLeadCard?.rank === targetLeadCard.rank;

  const isAnswered = mode === 'basics' ? isBasicsAnswered : mode === 'lead' ? isLeadAnswered : userBid !== null;
  const isCorrect = mode === 'basics' ? isBasicsCorrect : mode === 'lead' ? isLeadCorrect : isAnswered && userBid === targetBid;

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

      {/* Main Mode Tabs: Beginner Basics vs Opening vs Responding vs Overcall vs Opening Lead */}
      <div className="drill-mode-tabs">
        <button
          type="button"
          className={`drill-mode-tab ${mode === 'basics' ? 'active' : ''}`}
          onClick={() => handleModeChange('basics')}
        >
          🌱 {t(lang, 'drill.modeBasics')}
        </button>
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
        <button
          type="button"
          className={`drill-mode-tab ${mode === 'lead' ? 'active' : ''}`}
          onClick={() => handleModeChange('lead')}
        >
          🛡️ {t(lang, 'drill.modeOpeningLead')}
        </button>
      </div>

      {/* Filter / Scenario Pills */}
      {mode === 'basics' ? (
        <div className="drill-categories">
          {BASICS_CATEGORIES.map(bc => (
            <button
              key={bc.id}
              type="button"
              className={`drill-cat-pill ${basicsCategory === bc.id ? 'active' : ''}`}
              onClick={() => handleBasicsCategoryChange(bc.id)}
            >
              {t(lang, bc.labelKey)}
            </button>
          ))}
        </div>
      ) : mode === 'opening' ? (
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
      ) : mode === 'overcall' ? (
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
      ) : (
        <div className="drill-partner-scenarios">
          <span className="drill-partner-label">{lang === 'zh' ? '防守目标定约：' : 'Target Contract Defense:'}</span>
          <div className="drill-categories">
            <button
              type="button"
              className={`drill-cat-pill ${leadContractType === 'NT' ? 'active' : ''}`}
              onClick={() => handleLeadContractChange('NT')}
            >
              3NT ({t(lang, 'drill.leadNtDef')})
            </button>
            <button
              type="button"
              className={`drill-cat-pill ${leadContractType === 'suit' ? 'active' : ''}`}
              onClick={() => handleLeadContractChange('suit')}
            >
              4♠ / 4♥ ({t(lang, 'drill.leadSuitDef')})
            </button>
          </div>
        </div>
      )}

      {/* Main Table Arena */}
      <div className="drill-table-container">
        <div className="drill-felt">
          {mode === 'basics' && (
            <div className="drill-partner-badge basics-badge">
              <span className="partner-avatar-icon">🌱</span>
              <span className="partner-bid-lead">{basicsProblem.categoryLabel[lang]}:</span>
              {basicsProblem.contextBadge && (
                <span className="partner-bid-val">{basicsProblem.contextBadge[lang]}</span>
              )}
            </div>
          )}

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

          {/* Contract indicator in lead mode */}
          {mode === 'lead' && (
            <div className="drill-partner-badge lead-badge">
              <span className="partner-avatar-icon">🛡️</span>
              <span className="partner-bid-lead">{lang === 'zh' ? '庄家定约' : 'Opponent Contract'}:</span>
              <span className="partner-bid-val">{leadDeal.evaluation.contract.level}{leadDeal.evaluation.contract.denom}</span>
              <span className="partner-bid-desc">
                ({lang === 'zh' ? '南家坐庄 · 轮到你首攻 (西家)' : 'by South · You are West on opening lead'})
              </span>
            </div>
          )}

          {/* Dealt Cards or Trick Display */}
          {mode === 'basics' ? (
            basicsProblem.trickPlays ? (
              <div className="basics-trick-container">
                <div className="basics-trick-felt">
                  {basicsProblem.trickPlays.map(tp => (
                    <div key={tp.seat} className="basics-trick-player-card">
                      <span className="basics-seat-pill">{tp.label ?? tp.seat}</span>
                      <CardView card={tp.card} />
                    </div>
                  ))}
                </div>
              </div>
            ) : basicsProblem.cards && basicsProblem.cards.length > 0 ? (
              <div className="drill-hand-display" role="region" aria-label="Problem cards">
                {basicsProblem.cards.map((c, i) => (
                  <div key={`${c.suit}${c.rank}-${i}`} className="card-fan-wrapper">
                    <CardView card={c} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="basics-hero-card">
                <div className="basics-hero-icon">
                  {basicsProblem.category === 'book_math' ? '📐' : '👥'}
                </div>
                <div className="basics-hero-title">
                  {basicsProblem.categoryLabel[lang]}
                </div>
              </div>
            )
          ) : (
            <div className="drill-hand-display" role="region" aria-label="13-card hand">
              {handGroups.map(group => {
                const count = group.cards.length;
                const mid = (count - 1) / 2;
                return (
                  <div key={group.suit} className={`suit-cluster suit-${group.suit.toLowerCase()}`}>
                    {group.cards.map((c, i) => {
                      const rotDeg = count > 1 ? (i - mid) * 1.5 : 0;
                      const yOff = count > 1 ? Math.abs(i - mid) * 1.2 : 0;
                      const isTargetLead = mode === 'lead' && isLeadAnswered && c.suit === targetLeadCard.suit && c.rank === targetLeadCard.rank;
                      const isSelectedLead = mode === 'lead' && userLeadCard !== null && c.suit === userLeadCard.suit && c.rank === userLeadCard.rank;
                      const isDimLead = mode === 'lead' && isLeadAnswered && !isTargetLead && !isSelectedLead;

                      return (
                        <div
                          key={`${c.suit}${c.rank}-${i}`}
                          className="card-fan-wrapper"
                          style={{
                            ['--fan-rot' as string]: `${rotDeg}deg`,
                            ['--fan-y' as string]: `${yOff}px`,
                          }}
                        >
                          <CardView
                            card={c}
                            playable={mode === 'lead' && !isLeadAnswered}
                            selected={isSelectedLead}
                            target={isTargetLead}
                            dim={isDimLead}
                            onClick={mode === 'lead' && !isLeadAnswered ? () => handleSelectLeadCard(c) : undefined}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Metrics Bar (HCP, Length/Dummy, Shape) */}
          <div className="drill-metrics-bar">
            {showBreakdown ? (
              <div className="drill-metrics-revealed">
                {mode === 'basics' ? (
                  <>
                    <span className="metric-chip highlight">
                      🌱 <strong>{basicsProblem.categoryLabel[lang]}</strong>
                    </span>
                    {basicsProblem.contextBadge && (
                      <span className="metric-chip">
                        {basicsProblem.contextBadge[lang]}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="metric-chip">
                      <strong>{t(lang, 'drill.hcpLabel')}:</strong> {mode === 'lead' ? calculateHcp(leadDeal.hand) : activeEval.hcp}
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
                    ) : mode === 'overcall' ? (
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
                    ) : (
                      <>
                        <span className="metric-chip highlight">
                          <strong>{t(lang, 'drill.leadRuleTitle')}:</strong> {leadDeal.evaluation.ruleName[lang]}
                        </span>
                        <span className="metric-chip">
                          <strong>{lang === 'zh' ? '标准首攻' : 'Optimal Lead'}:</strong> {cardLabel(targetLeadCard)}
                        </span>
                      </>
                    )}
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

        {/* Action Panel: Question and Options */}
        <div className="drill-action-card">
          <div className="drill-question-row">
            <span className="drill-question-text">
              ❓ {mode === 'basics'
                ? basicsProblem.question[lang]
                : mode === 'opening'
                ? t(lang, 'drill.question')
                : mode === 'responding'
                ? t(lang, 'drill.respQuestion')
                : mode === 'overcall'
                ? t(lang, 'drill.overcallQuestion')
                : t(lang, 'drill.leadQuestion')}
            </span>
          </div>

          {mode === 'basics' ? (
            <div className="basics-options-grid">
              {basicsProblem.options.map(opt => {
                let cls = 'basics-opt-btn';
                if (isAnswered) {
                  if (opt.isCorrect) {
                    cls += ' correct-opt';
                  } else if (opt.id === userBasicsOption) {
                    cls += ' wrong-opt';
                  } else {
                    cls += ' muted-opt';
                  }
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={cls}
                    onClick={() => handleSelectBasicsOption(opt.id)}
                    disabled={isAnswered}
                  >
                    {opt.label[lang]}
                  </button>
                );
              })}
            </div>
          ) : mode === 'lead' ? (
            !isAnswered && (
              <div className="drill-lead-card-prompt">
                <p className="lead-prompt-hint">👆 {t(lang, 'drill.leadSelectCardHint')}</p>
                <div className="lead-quick-pick">
                  {sortedHand.map(c => (
                    <button
                      key={`${c.suit}${c.rank}`}
                      type="button"
                      className={`lead-pick-btn suit-${c.suit.toLowerCase()}`}
                      onClick={() => handleSelectLeadCard(c)}
                    >
                      {cardLabel(c)}
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : (
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
          )}

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
                    {mode === 'basics'
                      ? isCorrect
                        ? lang === 'zh'
                          ? '🎉 回答完全正确！'
                          : '🎉 Excellent Answer!'
                        : lang === 'zh'
                        ? '💪 仔细看解析，巩固这个核心规则：'
                        : '💪 Review the explanation to master this law:'
                      : mode === 'lead'
                      ? isCorrect
                        ? lang === 'zh'
                          ? `🎉 回答完全正确！首攻打出 ${cardLabel(targetLeadCard)}`
                          : `🎉 Excellent Lead! You played ${cardLabel(targetLeadCard)}`
                        : lang === 'zh'
                        ? `💪 标准首攻应为 ${cardLabel(targetLeadCard)}（你打出了 ${userLeadCard ? cardLabel(userLeadCard) : ''}）`
                        : `💪 Optimal Lead is ${cardLabel(targetLeadCard)} (you led ${userLeadCard ? cardLabel(userLeadCard) : ''})`
                      : isCorrect
                      ? lang === 'zh'
                        ? '🎉 回答完全正确！'
                        : '🎉 Excellent Call!'
                      : lang === 'zh'
                      ? `💪 标准决策应为 ${targetBid}`
                      : `💪 Correct Call is ${targetBid}`}
                  </h3>
                  {mode === 'lead' && (
                    <div className="feedback-rule-badge">
                      🛡️ <strong>{leadDeal.evaluation.ruleName[lang]}</strong>
                    </div>
                  )}
                  <p className="feedback-explanation">
                    {mode === 'basics'
                      ? basicsProblem.explanation[lang]
                      : mode === 'lead'
                      ? leadDeal.evaluation.explanation[lang]
                      : activeEval.explanation[lang]}
                  </p>
                </div>
              </div>

              {(mode === 'basics' ? basicsProblem.mnemonic : mode === 'lead' ? leadDeal.evaluation.mnemonic : activeEval.mnemonic) && (
                <div className="feedback-mnemonic">
                  💡 <strong>ACBL 口诀：</strong> {(mode === 'basics' ? basicsProblem.mnemonic : mode === 'lead' ? leadDeal.evaluation.mnemonic : activeEval.mnemonic)![lang]}
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
