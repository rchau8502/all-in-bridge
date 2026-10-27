import { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../App.js';
import { t, bidLabelL, seatLabel } from '../i18n.js';
import { audio } from '../audio.js';
import { SimTable, type SimSeatInfo } from './Tutorial.js';
import { CHARACTERS } from '../../../shared/characters.js';
import { Avatar } from '../components/ui.js';
import { PbnModal } from '../components/PbnModal.js';
import { ChallengesModal } from '../components/ChallengesModal.js';
import { DealBuilderModal } from '../components/DealBuilderModal.js';
import { type Challenge } from '../../../shared/challenges.js';
import { exportFullPbn, importDealFromPbn } from '../../../shared/pbn.js';
import { sortHand, partnerOf, cardLabel, type Card, type Seat, type Suit, type Hands } from '../../../shared/deck.js';
import { PlayState, trickWinner } from '../../../shared/play.js';
import { chooseBotPlay, chooseBotBid } from '../../../shared/bot.js';
import { detectDefenseSignals } from '../../../shared/trick-explain.js';
import { scoreContract, type ScoreBreakdown } from '../../../shared/scoring.js';
import { Auction, DENOM_ORDER, type Bid, type Contract, type Denom } from '../../../shared/bidding.js';
import { explainBid } from '../../../shared/bidding-explain.js';
import { generateArchetypeDeal, DEAL_ARCHETYPES, type DealArchetype } from '../../../shared/deal-generator.js';
import { calculateHcp } from '../../../shared/evaluator.js';
import { analyzeDeal, formatAbilityTag, STRAINS } from '../../../shared/dds.js';

type PlayMode = 'quick' | 'auction' | 'duo';

const CONTRACT_PRESETS: Array<{ level: number; denom: Denom; label: string }> = [
  { level: 3, denom: 'NT', label: '3NT (9 墩)' },
  { level: 4, denom: 'S', label: '4♠ (10 墩)' },
  { level: 4, denom: 'H', label: '4♥ (10 墩)' },
  { level: 1, denom: 'NT', label: '1NT (7 墩)' },
];

export function FreePlay() {
  const { lang, go, characterId, unlockAchievement } = useApp();

  const [mode, setMode] = useState<PlayMode>('quick');
  const [dealArchetype, setDealArchetype] = useState<DealArchetype>('random');
  const [hoveredBid, setHoveredBid] = useState<Bid | null>(null);
  const [tabletopFlipped, setTabletopFlipped] = useState(false);
  const [boardNo, setBoardNo] = useState(1);
  const [dealHands, setDealHands] = useState<Hands>(() => generateArchetypeDeal('random'));
  const [pbnOpen, setPbnOpen] = useState(false);
  const [challengesOpen, setChallengesOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [showChallengeHint, setShowChallengeHint] = useState(false);
  const [solvedChallenges, setSolvedChallenges] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem('aib-solved-challenges');
      return s ? new Set(JSON.parse(s)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Quick mode preset
  const [contractPreset, setContractPreset] = useState<{ level: number; denom: Denom }>(CONTRACT_PRESETS[0]!);

  // Auction state
  const [auction, setAuction] = useState<Auction>(() => new Auction('N'));
  const [auctionContract, setAuctionContract] = useState<Contract | null>(null);
  const [auctionPassedOut, setAuctionPassedOut] = useState(false);

  // Active contract
  const contract = useMemo<Contract>(() => {
    if (activeChallenge) return activeChallenge.contract;
    if ((mode === 'auction' || mode === 'duo') && auctionContract) return auctionContract;
    return {
      level: contractPreset.level,
      denom: contractPreset.denom,
      declarer: 'S',
      doubled: 0,
    };
  }, [activeChallenge, mode, auctionContract, contractPreset]);

  const dummySeat = partnerOf(contract.declarer);

  // Play state
  const [playState, setPlayState] = useState<PlayState>(() => new PlayState(dealHands, contract));
  const [pauseReview, setPauseReview] = useState<{ plays: Array<{ seat: Seat; card: Card }>; winner: Seat } | null>(null);
  const [collectingTo, setCollectingTo] = useState<Seat | null>(null);
  const [tick, setTick] = useState(0);

  // Post-game review & replay state
  const [showAllHands, setShowAllHands] = useState(false);
  const [replayTrickIdx, setReplayTrickIdx] = useState<number | null>(null);

  const seatChars = useMemo(() => {
    const others = CHARACTERS.filter(c => c.id !== characterId).map(c => c.id);
    return { S: characterId, N: others[0]!, W: others[1]!, E: others[2]! } as Record<Seat, string>;
  }, [characterId]);

  const trump: Suit | null = contract.denom === 'NT' ? null : contract.denom;
  const isPlayPhase = mode === 'quick' || ((mode === 'auction' || mode === 'duo') && auctionContract !== null);
  const isComplete = isPlayPhase && playState.isComplete();

  const handleNewDeal = useCallback((archetype: DealArchetype = dealArchetype) => {
    audio.sfx('shuffle');
    setActiveChallenge(null);
    setShowChallengeHint(false);
    const nextHands = generateArchetypeDeal(archetype);
    setDealHands(nextHands);
    setBoardNo(b => b + 1);
    setAuction(new Auction('N'));
    setAuctionContract(null);
    setAuctionPassedOut(false);
    setPauseReview(null);
    setCollectingTo(null);
    setShowAllHands(false);
    setReplayTrickIdx(null);
    setHoveredBid(null);

    const initialContract: Contract = {
      level: contractPreset.level,
      denom: contractPreset.denom,
      declarer: 'S',
      doubled: 0,
    };
    setPlayState(new PlayState(nextHands, initialContract));
  }, [dealArchetype, contractPreset]);

  const handleArchetypeChange = (newArchetype: DealArchetype) => {
    setDealArchetype(newArchetype);
    handleNewDeal(newArchetype);
  };

  const handleSelectChallenge = (c: Challenge) => {
    const imported = importDealFromPbn(c.deal);
    if (!imported) return;
    audio.sfx('shuffle');
    setActiveChallenge(c);
    setShowChallengeHint(false);
    setMode('quick');
    setDealHands(imported.hands);
    setBoardNo(b => b + 1);
    setAuction(new Auction(imported.firstSeat));
    setAuctionContract(null);
    setAuctionPassedOut(false);
    setPauseReview(null);
    setCollectingTo(null);
    setShowAllHands(false);
    setReplayTrickIdx(null);
    setHoveredBid(null);
    setPlayState(new PlayState(imported.hands, c.contract));
  };

  const handleModeChange = (newMode: PlayMode) => {
    setMode(newMode);
    handleNewDeal(dealArchetype);
  };

  const handleContractPresetChange = (preset: { level: number; denom: Denom }) => {
    setContractPreset(preset);
    const newContract: Contract = {
      level: preset.level,
      denom: preset.denom,
      declarer: 'S',
      doubled: 0,
    };
    audio.sfx('click');
    setPlayState(new PlayState(dealHands, newContract));
    setPauseReview(null);
    setCollectingTo(null);
    setReplayTrickIdx(null);
  };

  // -------------------------------------------------------------
  // Auction Phase Bot Execution
  // -------------------------------------------------------------
  useEffect(() => {
    if ((mode !== 'auction' && mode !== 'duo') || auction.isComplete()) return;

    const currentTurn = auction.turn;
    const isBot = mode === 'auction' ? currentTurn !== 'S' : (currentTurn === 'W' || currentTurn === 'E');
    if (isBot) {
      const timer = window.setTimeout(() => {
        try {
          const bid = chooseBotBid(auction, dealHands);
          auction.apply(bid);
          audio.sfx('bid');
          setTick(t => t + 1);

          if (auction.isComplete()) {
            const finalC = auction.contract();
            if (finalC) {
              setAuctionContract(finalC);
              setPlayState(new PlayState(dealHands, finalC));
              audio.sfx('fanfare');
            } else {
              setAuctionPassedOut(true);
            }
          }
        } catch {
          // ignore
        }
      }, 500);
      return () => window.clearTimeout(timer);
    }
  }, [mode, auction, auction.turn, dealHands, tick]);

  const handleUserBid = (bid: Bid) => {
    const isUserTurn = mode === 'auction'
      ? auction.turn === 'S'
      : mode === 'duo'
      ? (auction.turn === 'S' || auction.turn === 'N')
      : false;
    if (!isUserTurn || auction.isComplete()) return;
    if (!auction.isLegal(bid)) return;

    audio.sfx('bid');
    auction.apply(bid);
    setTick(t => t + 1);

    if (auction.isComplete()) {
      const finalC = auction.contract();
      if (finalC) {
        setAuctionContract(finalC);
        setPlayState(new PlayState(dealHands, finalC));
        audio.sfx('fanfare');
      } else {
        setAuctionPassedOut(true);
      }
    }
  };

  // -------------------------------------------------------------
  // Play Phase Bot Execution
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isPlayPhase || isComplete || pauseReview || collectingTo || replayTrickIdx !== null) return;

    const currentTurn = playState.turn;
    if (currentTurn === 'W' || currentTurn === 'E') {
      const timer = window.setTimeout(() => {
        try {
          const botCard = chooseBotPlay(playState);
          audio.sfx('card');

          const trickBefore = [...playState.currentTrick, { seat: currentTurn, card: botCard }];
          if (trickBefore.length === 4) {
            const winner = trickWinner(trickBefore, trump);
            playState.play(botCard);
            setPauseReview({ plays: trickBefore, winner });
          } else {
            playState.play(botCard);
            setTick(t => t + 1);
          }
        } catch {
          // ignore
        }
      }, 450);
      return () => window.clearTimeout(timer);
    }
  }, [isPlayPhase, playState, playState.turn, isComplete, pauseReview, collectingTo, replayTrickIdx, trump, tick]);

  // Trick completion auto-dismiss
  useEffect(() => {
    if (!pauseReview) return;
    const timer = window.setTimeout(() => {
      const winner = pauseReview.winner;
      setCollectingTo(winner);
      audio.sfx('card');

      const flyTimer = window.setTimeout(() => {
        setPauseReview(null);
        setCollectingTo(null);
        setTick(t => t + 1);
      }, 350);
      return () => window.clearTimeout(flyTimer);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [pauseReview]);

  const handlePlayCard = (card: Card) => {
    if (!isPlayPhase || pauseReview || collectingTo || replayTrickIdx !== null) return;
    const currentTurn = playState.turn;

    // South is declarer, North is dummy
    const isLearnerControl = currentTurn === 'S' || currentTurn === 'N';
    if (!isLearnerControl) return;

    try {
      audio.sfx('card');
      const trickBefore = [...playState.currentTrick, { seat: currentTurn, card }];
      if (trickBefore.length === 4) {
        const winner = trickWinner(trickBefore, trump);
        playState.play(card);
        setPauseReview({ plays: trickBefore, winner });
      } else {
        playState.play(card);
        setTick(t => t + 1);
      }
    } catch {
      audio.sfx('lose');
    }
  };

  const declarerTricks = playState.declarerTricks();
  const scoreResult = useMemo<ScoreBreakdown | null>(() => {
    if (!isComplete) return null;
    return scoreContract(contract, declarerTricks, false);
  }, [isComplete, contract, declarerTricks]);

  const targetTricks = contract.level + 6;
  const isMade = declarerTricks >= targetTricks;

  const dealSummaryHcp = useMemo(() => {
    return {
      S: calculateHcp(dealHands.S),
      N: calculateHcp(dealHands.N),
      E: calculateHcp(dealHands.E),
      W: calculateHcp(dealHands.W),
    };
  }, [dealHands]);

  useEffect(() => {
    if (!isComplete) return;
    if (declarerTricks > 0) {
      unlockAchievement('first_trick');
    }
    if (isMade) {
      const isGame = (contract.denom === 'NT' && contract.level >= 3) ||
        ((contract.denom === 'S' || contract.denom === 'H') && contract.level >= 4) ||
        ((contract.denom === 'D' || contract.denom === 'C') && contract.level >= 5);
      if (isGame) {
        unlockAchievement('game_maker');
      }
      if (declarerTricks >= 12) {
        unlockAchievement('slam_grandee');
      }
      if (activeChallenge && declarerTricks >= activeChallenge.targetTricks) {
        unlockAchievement('challenge_master');
        setSolvedChallenges(prev => {
          if (prev.has(activeChallenge.id)) return prev;
          const next = new Set(prev);
          next.add(activeChallenge.id);
          localStorage.setItem('aib-solved-challenges', JSON.stringify([...next]));
          return next;
        });
      }
    }
  }, [isComplete, isMade, declarerTricks, contract, activeChallenge, unlockAchievement]);

  const currentPlaySeat = isPlayPhase && (playState.turn === 'S' || playState.turn === 'N') && !pauseReview && !collectingTo && replayTrickIdx === null
    ? playState.turn
    : null;

  const seatsInfo: SimSeatInfo[] = (['N', 'E', 'S', 'W'] as Seat[]).map(s => ({
    seat: s,
    count: playState.hands[s].length,
    active: (mode === 'auction' || mode === 'duo') && !auction.isComplete() ? auction.turn === s : playState.turn === s,
    badge:
      mode === 'duo'
        ? s === 'S'
          ? (lang === 'zh' ? '玩家 1' : 'P1')
          : s === 'N'
          ? (lang === 'zh' ? '玩家 2' : 'P2')
          : undefined
        : undefined,
  }));

  const contractLabel = `${bidLabelL(lang, { type: 'bid', level: contract.level, denom: contract.denom })} · ${seatLabel(lang, contract.declarer)}`;

  // Table hands: normal (N dummy, S player) vs All-hands revealed
  const displayedHands = showAllHands
    ? dealHands
    : { N: playState.hands.N, S: playState.hands.S };

  // Replay trick data if in replay mode
  const displayedTrick = replayTrickIdx !== null
    ? playState.completedTricks[replayTrickIdx] ?? []
    : pauseReview
    ? pauseReview.plays
    : playState.currentTrick;

  const replayWinner = replayTrickIdx !== null && playState.completedTricks[replayTrickIdx]?.length === 4
    ? trickWinner(playState.completedTricks[replayTrickIdx]!, trump)
    : pauseReview?.winner ?? null;

  const replaySignals = useMemo(() => {
    if (replayTrickIdx === null || !playState.completedTricks[replayTrickIdx]) return [];
    return detectDefenseSignals(playState.completedTricks[replayTrickIdx]!, trump);
  }, [replayTrickIdx, playState.completedTricks, trump]);

  const legalCardLabels = useMemo(() => {
    if (!isPlayPhase || currentPlaySeat === null) return null;
    try {
      const legal = playState.legalPlays();
      return new Set(legal.map(cardLabel));
    } catch {
      return null;
    }
  }, [isPlayPhase, currentPlaySeat, playState, tick]);

  const dealAnalysis = useMemo(() => analyzeDeal(dealHands), [dealHands]);

  return (
    <div className="freeplay-screen">
      {/* Top Header */}
      <div className="freeplay-header">
        <div className="freeplay-nav">
          <button className="btn ghost" onClick={() => go('home')}>
            ← {t(lang, 'tut.back')}
          </button>
          <div className="freeplay-title-wrap">
            <h1 className="freeplay-title">🃏 {t(lang, 'freeplay.title')}</h1>
            <span className="freeplay-subtitle">{t(lang, 'freeplay.subtitle')}</span>
          </div>
        </div>

        {/* Mode Selector and Controls */}
        <div className="freeplay-controls">
          <div className="freeplay-presets">
            <button
              type="button"
              className={`freeplay-preset-btn ${mode === 'quick' ? 'active' : ''}`}
              onClick={() => handleModeChange('quick')}
            >
              ⚡ {t(lang, 'freeplay.modeQuick')}
            </button>
            <button
              type="button"
              className={`freeplay-preset-btn ${mode === 'auction' ? 'active' : ''}`}
              onClick={() => handleModeChange('auction')}
            >
              🗣️ {t(lang, 'freeplay.modeAuction')}
            </button>
            <button
              type="button"
              className={`freeplay-preset-btn ${mode === 'duo' ? 'active' : ''}`}
              onClick={() => handleModeChange('duo')}
              title={t(lang, 'freeplay.modeDuo')}
            >
              {t(lang, 'freeplay.modeDuo')}
            </button>
          </div>

          {mode === 'duo' && (
            <button
              type="button"
              className={`btn small ${tabletopFlipped ? 'primary' : 'ghost'}`}
              onClick={() => {
                audio.sfx('click');
                setTabletopFlipped(f => !f);
              }}
              title={tabletopFlipped ? t(lang, 'freeplay.tabletopNormal') : t(lang, 'freeplay.tabletopFlip')}
            >
              {tabletopFlipped ? t(lang, 'freeplay.tabletopNormal') : t(lang, 'freeplay.tabletopFlip')}
            </button>
          )}

          {mode === 'quick' && (
            <div className="freeplay-presets">
              {CONTRACT_PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  className={`freeplay-preset-btn ${contractPreset.level === p.level && contractPreset.denom === p.denom ? 'active' : ''}`}
                  onClick={() => handleContractPresetChange(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className={`btn ${activeChallenge ? 'primary' : 'ghost'}`}
            onClick={() => {
              audio.sfx('click');
              setChallengesOpen(true);
            }}
            title={t(lang, 'challenges.button')}
          >
            🎯 {t(lang, 'challenges.button')}
          </button>

          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              audio.sfx('click');
              setPbnOpen(true);
            }}
            title="PBN Deal"
          >
            📋 PBN
          </button>

          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              audio.sfx('click');
              setBuilderOpen(true);
            }}
            title={t(lang, 'builder.button')}
          >
            🛠️ {t(lang, 'builder.button')}
          </button>

          {/* Targeted Deal Archetype Generator */}
          <div className="deal-archetype-wrap">
            <select
              className="deal-archetype-select"
              value={dealArchetype}
              onChange={e => handleArchetypeChange(e.target.value as DealArchetype)}
              title={t(lang, 'freeplay.dealType')}
            >
              {DEAL_ARCHETYPES.map(a => (
                <option key={a.id} value={a.id}>
                  {a.label[lang]}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="btn primary freeplay-deal-btn" onClick={() => handleNewDeal()}>
            🔀 {t(lang, 'freeplay.newDeal')}
          </button>
        </div>
      </div>

      {/* Active Challenge Banner */}
      {activeChallenge && (
        <div className="active-challenge-bar">
          <div className="challenge-bar-info">
            <span className="challenge-pill">🎯 {t(lang, 'challenges.active')}</span>
            <strong className="challenge-bar-name">{activeChallenge.title[lang]}</strong>
            <span className="challenge-bar-req">
              {bidLabelL(lang, { type: 'bid', level: activeChallenge.contract.level, denom: activeChallenge.contract.denom })} · {t(lang, 'challenges.target', { count: activeChallenge.targetTricks })}
            </span>
          </div>
          <div className="challenge-bar-actions">
            <button
              type="button"
              className={`btn small ${showChallengeHint ? 'primary' : 'ghost'}`}
              onClick={() => {
                audio.sfx('click');
                setShowChallengeHint(h => !h);
              }}
            >
              💡 {t(lang, 'challenges.hint')}
            </button>
            <button
              type="button"
              className="btn small ghost"
              onClick={() => {
                audio.sfx('click');
                setActiveChallenge(null);
                setShowChallengeHint(false);
                handleNewDeal();
              }}
            >
              ✕ {t(lang, 'challenges.exit')}
            </button>
          </div>
          {showChallengeHint && (
            <div className="challenge-hint-box">
              <p className="challenge-hint-p">{activeChallenge.hint[lang]}</p>
            </div>
          )}
        </div>
      )}

      {/* Main Table Arena */}
      <div className="freeplay-table-wrap">
        <SimTable
          lang={lang}
          boardNo={boardNo}
          dealer="N"
          title={
            replayTrickIdx !== null
              ? t(lang, 'freeplay.trickOf', { cur: replayTrickIdx + 1 })
              : (mode === 'auction' || mode === 'duo') && !auction.isComplete()
              ? lang === 'zh' ? '叫牌进程' : 'Auction'
              : mode === 'duo'
              ? `${lang === 'zh' ? `第 ${playState.completedTricks.length + 1} 墩` : `Trick ${playState.completedTricks.length + 1}`} · ${
                  playState.turn === 'S'
                    ? (lang === 'zh' ? '轮到 玩家 1 (南)' : 'P1 (S) to play')
                    : playState.turn === 'N'
                    ? (lang === 'zh' ? '轮到 玩家 2 (北)' : 'P2 (N) to play')
                    : (lang === 'zh' ? `${seatLabel(lang, playState.turn)} 出牌中...` : `${seatLabel(lang, playState.turn)} playing...`)
                }`
              : lang === 'zh'
              ? `第 ${playState.completedTricks.length + 1} 墩`
              : `Trick ${playState.completedTricks.length + 1}`
          }
          contractLabel={isPlayPhase ? contractLabel : null}
          seats={seatsInfo}
          trick={displayedTrick}
          hand={sortHand(playState.hands.S, trump)}
          handLabel={mode === 'duo' ? `${seatLabel(lang, 'S')} (${t(lang, 'freeplay.duoP1')})` : seatLabel(lang, 'S')}
          trump={trump}
          interactive={currentPlaySeat !== null}
          playSeat={currentPlaySeat}
          legalCardLabels={legalCardLabels}
          onPlay={handlePlayCard}
          hint={null}
          stepKey={`fp-${boardNo}-${playState.completedTricks.length}-${displayedTrick.length}-${replayTrickIdx ?? 'live'}`}
          hands={displayedHands}
          dummySeat={dummySeat}
          tabletopFlipped={tabletopFlipped}
          seatChars={seatChars}
          winSeat={replayWinner}
          trickStatic={replayTrickIdx !== null || !!pauseReview}
          collectingSeat={collectingTo}
          tricksWon={isPlayPhase ? playState.tricksWon : null}
          targetTricks={isPlayPhase ? targetTricks : null}
          centreExtra={
            (mode === 'auction' || mode === 'duo') && !auction.isComplete() ? (
              <div className="freeplay-auction-panel">
                <div className="auction-transcript">
                  <div className="auction-cols-header">
                    <span>{seatLabel(lang, 'N')}{mode === 'duo' ? ' (P2)' : ''}</span>
                    <span>{seatLabel(lang, 'E')}</span>
                    <span>{seatLabel(lang, 'S')}{mode === 'duo' ? ' (P1)' : ''}</span>
                    <span>{seatLabel(lang, 'W')}</span>
                  </div>
                  <div className="auction-entries-grid">
                    {auction.entries.map((e, idx) => (
                      <span
                        key={idx}
                        className={`auction-bid-tag ${
                          e.seat === 'S'
                            ? 'user-bid'
                            : mode === 'duo' && e.seat === 'N'
                            ? 'user-bid duo-p2-bid'
                            : ''
                        }`}
                        title={explainBid(e.bid).meaning[lang]}
                        onClick={() => setHoveredBid(e.bid)}
                      >
                        {bidLabelL(lang, e.bid)}
                      </span>
                    ))}
                  </div>
                </div>

                {((mode === 'auction' && auction.turn === 'S') ||
                  (mode === 'duo' && (auction.turn === 'S' || auction.turn === 'N'))) && (
                  <div className={`freeplay-bidding-box${tabletopFlipped && auction.turn === 'N' ? ' tabletop-flipped' : ''}`}>
                    {mode === 'duo' && (
                      <div className={`bidding-duo-indicator ${auction.turn === 'N' ? 'p2' : 'p1'}`}>
                        👥 {t(lang, 'freeplay.duoTurn', { player: auction.turn === 'S' ? t(lang, 'freeplay.duoP1') : t(lang, 'freeplay.duoP2') })}
                      </div>
                    )}

                    {/* ACBL Bid Live Inspector */}
                    <div className="bid-live-explain-box">
                      {hoveredBid ? (
                        (() => {
                          const exp = explainBid(hoveredBid);
                          return (
                            <div className="bid-explain-content">
                              {exp.badge && <span className="bid-explain-badge">{exp.badge}</span>}
                              <strong className="bid-explain-name">{exp.name[lang]}</strong>
                              {exp.points && <span className="bid-explain-pts">{exp.points}</span>}
                              {exp.shape && <span className="bid-explain-shape">{exp.shape}</span>}
                              <span className="bid-explain-sep">·</span>
                              <span className="bid-explain-meaning">{exp.meaning[lang]}</span>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="bid-explain-idle">
                          <span className="bid-explain-hint-icon">💡</span>
                          <span>{t(lang, 'freeplay.hoverBidHint')}</span>
                        </div>
                      )}
                    </div>

                    <div className="bidding-specials">
                      {(['pass', 'double', 'redouble'] as const).map(k => {
                        const b: Bid = { type: k };
                        return (
                          <button
                            key={k}
                            type="button"
                            className="bid-btn special"
                            onClick={() => handleUserBid(b)}
                            onMouseEnter={() => setHoveredBid(b)}
                            onMouseLeave={() => setHoveredBid(null)}
                            onFocus={() => setHoveredBid(b)}
                            onBlur={() => setHoveredBid(null)}
                            disabled={!auction.isLegal(b)}
                          >
                            {bidLabelL(lang, b)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="bidding-levels">
                      {[1, 2, 3, 4, 5, 6, 7].map(level => (
                        <div key={level} className="bid-row level-row">
                          <span className="bid-lvl">{level}</span>
                          {DENOM_ORDER.map(d => {
                            const b: Bid = { type: 'bid', level, denom: d };
                            const legal = auction.isLegal(b);
                            return (
                              <button
                                key={d}
                                type="button"
                                className={`bid-btn denom-${d}`}
                                onClick={() => handleUserBid(b)}
                                onMouseEnter={() => setHoveredBid(b)}
                                onMouseLeave={() => setHoveredBid(null)}
                                onFocus={() => setHoveredBid(b)}
                                onBlur={() => setHoveredBid(null)}
                                disabled={!legal}
                              >
                                {bidLabelL(lang, b)}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null
          }
        />
      </div>

      {/* Replay Stepper Toolbar */}
      {isComplete && (
        <div className="freeplay-replay-bar">
          <button
            type="button"
            className={`btn ${showAllHands ? 'primary' : 'ghost'}`}
            onClick={() => setShowAllHands(prev => !prev)}
          >
            👀 {t(lang, 'freeplay.showAllHands')}
          </button>

          {replayTrickIdx !== null ? (
            <div className="replay-controls">
              <button
                type="button"
                className="btn ghost"
                disabled={replayTrickIdx <= 0}
                onClick={() => setReplayTrickIdx(idx => Math.max(0, (idx ?? 0) - 1))}
              >
                {t(lang, 'freeplay.prevTrick')}
              </button>
              <span className="replay-indicator">
                {t(lang, 'freeplay.trickOf', { cur: replayTrickIdx + 1 })}
                {replayWinner && ` · ${t(lang, 'freeplay.wonBy', { seat: seatLabel(lang, replayWinner) })}`}
              </span>
              <button
                type="button"
                className="btn ghost"
                disabled={replayTrickIdx >= playState.completedTricks.length - 1}
                onClick={() => setReplayTrickIdx(idx => Math.min(playState.completedTricks.length - 1, (idx ?? 0) + 1))}
              >
                {t(lang, 'freeplay.nextTrick')}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setReplayTrickIdx(null)}
              >
                {t(lang, 'freeplay.exitReplay')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn primary"
              onClick={() => setReplayTrickIdx(0)}
            >
              📖 {t(lang, 'freeplay.replayTricks')}
            </button>
          )}

          {replaySignals.length > 0 && (
            <div className="replay-signals-box">
              {replaySignals.map((sig, i) => (
                <div key={i} className="replay-signal-tag">
                  <span className="signal-badge">🛡️ {seatLabel(lang, sig.seat)}</span>
                  <span className="signal-desc">{sig.meaning[lang]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deal Complete Modal (when not actively stepping through replays) */}
      {isComplete && scoreResult && replayTrickIdx === null && (
        <div className="freeplay-modal-backdrop">
          <div className="freeplay-result-card">
            <Avatar
              id={characterId}
              className={`coach-avatar ${isMade ? 'react-happy' : 'react-shake'}`}
            />
            <h2 className="result-title">
              {activeChallenge && isMade
                ? `${t(lang, 'challenges.success')} ${activeChallenge.title[lang]}`
                : isMade
                ? lang === 'zh'
                  ? `🎉 定约达成！${contractLabel}`
                  : `🎉 Contract Made! ${contractLabel}`
                : lang === 'zh'
                ? `💪 定约宕牌 (Down ${targetTricks - declarerTricks})`
                : `💪 Down ${targetTricks - declarerTricks}`}
            </h2>
            <div className="result-score-tag">
              {isMade ? `+${scoreResult.total} 分` : `${scoreResult.total} 分`}
            </div>
            <p className="result-stats-line">
              {lang === 'zh'
                ? `庄家北南共拿下 ${declarerTricks} 墩 (目标 ${targetTricks} 墩)，防守方东西拿下 ${playState.tricksWon.EW} 墩。`
                : `Declarer NS took ${declarerTricks} tricks (needed ${targetTricks}); EW took ${playState.tricksWon.EW} tricks.`}
            </p>

            {/* 4-Hand HCP Matrix */}
            <div className="result-hcp-grid">
              <div className="hcp-card ns-card">
                <span className="hcp-side-label">{lang === 'zh' ? '北南方 (NS)' : 'North-South (NS)'}</span>
                <span className="hcp-points-total">{dealSummaryHcp.N + dealSummaryHcp.S} HCP</span>
                <span className="hcp-sub">
                  {seatLabel(lang, 'N')}: {dealSummaryHcp.N} · {seatLabel(lang, 'S')}: {dealSummaryHcp.S}
                </span>
              </div>
              <div className="hcp-card ew-card">
                <span className="hcp-side-label">{lang === 'zh' ? '东西方 (EW)' : 'East-West (EW)'}</span>
                <span className="hcp-points-total">{dealSummaryHcp.E + dealSummaryHcp.W} HCP</span>
                <span className="hcp-sub">
                  {seatLabel(lang, 'E')}: {dealSummaryHcp.E} · {seatLabel(lang, 'W')}: {dealSummaryHcp.W}
                </span>
              </div>
            </div>

            {/* Double Dummy Makeable Contracts Matrix */}
            <div className="result-dds-section">
              <div className="dds-header-row">
                <span className="dds-title">
                  📊 {lang === 'zh' ? '双明手可成定约 (Makeable Contracts)' : 'Makeable Contracts (Double Dummy)'}
                </span>
                <span className="dds-par-tag">{dealAnalysis.par.text[lang]}</span>
              </div>
              <table className="dds-matrix-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>NT</th>
                    <th>♠</th>
                    <th>♥</th>
                    <th>♦</th>
                    <th>♣</th>
                  </tr>
                </thead>
                <tbody>
                  {(['N', 'S', 'E', 'W'] as Seat[]).map(st => (
                    <tr key={st}>
                      <td className="dds-seat-cell">{seatLabel(lang, st)}</td>
                      {STRAINS.map(strain => {
                        const tricks = dealAnalysis.makeable[st][strain];
                        const isGame =
                          (strain === 'NT' && tricks >= 9) ||
                          ((strain === 'S' || strain === 'H') && tricks >= 10) ||
                          ((strain === 'D' || strain === 'C') && tricks >= 11);
                        const isSlam = tricks >= 12;
                        return (
                          <td
                            key={strain}
                            className={`dds-val-cell ${isSlam ? 'slam' : isGame ? 'game' : tricks >= 7 ? 'part' : 'low'}`}
                            title={`${seatLabel(lang, st)} ${strain}: ${tricks} ${lang === 'zh' ? '墩' : 'tricks'}`}
                          >
                            {tricks}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="result-actions">
              <button type="button" className="btn primary big" onClick={() => setReplayTrickIdx(0)}>
                📖 {t(lang, 'freeplay.replayTricks')}
              </button>
              <button
                type="button"
                className="btn ghost big"
                onClick={() => {
                  audio.sfx('click');
                  setPbnOpen(true);
                }}
              >
                📋 {lang === 'zh' ? '保存牌谱' : 'Save PBN'}
              </button>
              <button type="button" className="btn ghost big" onClick={() => handleNewDeal()}>
                🔀 {t(lang, 'freeplay.playAgain')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auction Passed Out Modal */}
      {auctionPassedOut && (
        <div className="freeplay-modal-backdrop">
          <div className="freeplay-result-card">
            <Avatar id={characterId} className="coach-avatar react-nod" />
            <h2 className="result-title">
              {lang === 'zh' ? '四家全部 Pass（流局）' : 'Hand Passed Out (4 Passes)'}
            </h2>
            <p className="result-stats-line">
              {lang === 'zh'
                ? '所有人都未达到 12 点开叫线，无人叫牌。点击下方重新发牌。'
                : 'Nobody held enough points to open the auction. Deal a new hand!'}
            </p>
            <div className="result-actions">
              <button type="button" className="btn primary big" onClick={() => handleNewDeal()}>
                🔀 {t(lang, 'freeplay.playAgain')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PBN Import/Export Modal */}
      <PbnModal
        lang={lang}
        isOpen={pbnOpen}
        currentDealPbn={exportFullPbn(dealHands, boardNo, 'N', 'None', formatAbilityTag(dealAnalysis.makeable))}
        onLoadPbn={(pbnStr) => {
          const imported = importDealFromPbn(pbnStr);
          setActiveChallenge(null);
          setShowChallengeHint(false);
          setHoveredBid(null);
          setDealHands(imported.hands);
          setBoardNo(b => b + 1);
          setAuction(new Auction(imported.firstSeat));
          setAuctionContract(null);
          setAuctionPassedOut(false);
          setPauseReview(null);
          setCollectingTo(null);
          setShowAllHands(false);
          setReplayTrickIdx(null);
          const initialContract: Contract = {
            level: contractPreset.level,
            denom: contractPreset.denom,
            declarer: 'S',
            doubled: 0,
          };
          setPlayState(new PlayState(imported.hands, initialContract));
          return true;
        }}
        onClose={() => setPbnOpen(false)}
      />

      {/* ACBL Deal Challenges Modal */}
      <ChallengesModal
        lang={lang}
        isOpen={challengesOpen}
        solvedIds={solvedChallenges}
        onSelectChallenge={handleSelectChallenge}
        onClose={() => setChallengesOpen(false)}
      />

      {/* Custom Deal Studio & Hand Builder Modal */}
      <DealBuilderModal
        lang={lang}
        isOpen={builderOpen}
        initialHands={dealHands}
        initialContract={contract}
        onLoadDeal={(custom) => {
          setActiveChallenge(null);
          setShowChallengeHint(false);
          setDealHands(custom.hands);
          setBoardNo(b => b + 1);
          setAuction(new Auction('N'));
          setAuctionContract(null);
          setAuctionPassedOut(false);
          setPauseReview(null);
          setCollectingTo(null);
          setShowAllHands(false);
          setReplayTrickIdx(null);
          setPlayState(new PlayState(custom.hands, custom.contract));
        }}
        onClose={() => setBuilderOpen(false)}
      />
    </div>
  );
}
