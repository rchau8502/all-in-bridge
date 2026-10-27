import { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../App.js';
import { t, bidLabelL, seatLabel } from '../i18n.js';
import { audio } from '../audio.js';
import { SimTable, type SimSeatInfo } from './Tutorial.js';
import { CHARACTERS } from '../../../shared/characters.js';
import { Avatar } from '../components/ui.js';
import { PbnModal } from '../components/PbnModal.js';
import { ChallengesModal } from '../components/ChallengesModal.js';
import { type Challenge } from '../../../shared/challenges.js';
import { exportDealToPbn, importDealFromPbn } from '../../../shared/pbn.js';
import { buildDeck, shuffle, deal, sortHand, type Card, type Seat, type Suit, type Hands } from '../../../shared/deck.js';
import { PlayState, trickWinner } from '../../../shared/play.js';
import { chooseBotPlay, chooseBotBid } from '../../../shared/bot.js';
import { detectDefenseSignals } from '../../../shared/trick-explain.js';
import { scoreContract, type ScoreBreakdown } from '../../../shared/scoring.js';
import { Auction, DENOM_ORDER, type Bid, type Contract, type Denom } from '../../../shared/bidding.js';

type PlayMode = 'quick' | 'auction';

const CONTRACT_PRESETS: Array<{ level: number; denom: Denom; label: string }> = [
  { level: 3, denom: 'NT', label: '3NT (9 墩)' },
  { level: 4, denom: 'S', label: '4♠ (10 墩)' },
  { level: 4, denom: 'H', label: '4♥ (10 墩)' },
  { level: 1, denom: 'NT', label: '1NT (7 墩)' },
];

export function FreePlay() {
  const { lang, go, characterId, unlockAchievement } = useApp();

  const [mode, setMode] = useState<PlayMode>('quick');
  const [boardNo, setBoardNo] = useState(1);
  const [dealHands, setDealHands] = useState<Hands>(() => deal(shuffle(buildDeck())));
  const [pbnOpen, setPbnOpen] = useState(false);
  const [challengesOpen, setChallengesOpen] = useState(false);
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
    if (mode === 'auction' && auctionContract) return auctionContract;
    return {
      level: contractPreset.level,
      denom: contractPreset.denom,
      declarer: 'S',
      doubled: 0,
    };
  }, [activeChallenge, mode, auctionContract, contractPreset]);

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
  const isPlayPhase = mode === 'quick' || (mode === 'auction' && auctionContract !== null);
  const isComplete = isPlayPhase && playState.isComplete();

  const handleNewDeal = useCallback(() => {
    audio.sfx('shuffle');
    setActiveChallenge(null);
    setShowChallengeHint(false);
    const nextHands = deal(shuffle(buildDeck()));
    setDealHands(nextHands);
    setBoardNo(b => b + 1);
    setAuction(new Auction('N'));
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
    setPlayState(new PlayState(nextHands, initialContract));
  }, [contractPreset]);

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
    setPlayState(new PlayState(imported.hands, c.contract));
  };

  const handleModeChange = (newMode: PlayMode) => {
    setMode(newMode);
    handleNewDeal();
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
    if (mode !== 'auction' || auction.isComplete()) return;

    const currentTurn = auction.turn;
    if (currentTurn !== 'S') {
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
    if (mode !== 'auction' || auction.isComplete() || auction.turn !== 'S') return;
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
    active: mode === 'auction' && !auction.isComplete() ? auction.turn === s : playState.turn === s,
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
          </div>

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

          <button type="button" className="btn primary freeplay-deal-btn" onClick={handleNewDeal}>
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
              : mode === 'auction' && !auction.isComplete()
              ? lang === 'zh' ? '叫牌进程' : 'Auction'
              : lang === 'zh'
              ? `第 ${playState.completedTricks.length + 1} 墩`
              : `Trick ${playState.completedTricks.length + 1}`
          }
          contractLabel={isPlayPhase ? contractLabel : null}
          seats={seatsInfo}
          trick={displayedTrick}
          hand={sortHand(playState.hands.S, trump)}
          handLabel={seatLabel(lang, 'S')}
          trump={trump}
          interactive={currentPlaySeat !== null}
          playSeat={currentPlaySeat}
          onPlay={handlePlayCard}
          hint={null}
          stepKey={`fp-${boardNo}-${playState.completedTricks.length}-${displayedTrick.length}-${replayTrickIdx ?? 'live'}`}
          hands={displayedHands}
          dummySeat="N"
          seatChars={seatChars}
          winSeat={replayWinner}
          trickStatic={replayTrickIdx !== null || !!pauseReview}
          collectingSeat={collectingTo}
          tricksWon={isPlayPhase ? playState.tricksWon : null}
          targetTricks={isPlayPhase ? targetTricks : null}
          centreExtra={
            mode === 'auction' && !auction.isComplete() ? (
              <div className="freeplay-auction-panel">
                <div className="auction-transcript">
                  <div className="auction-cols-header">
                    <span>{seatLabel(lang, 'N')}</span>
                    <span>{seatLabel(lang, 'E')}</span>
                    <span>{seatLabel(lang, 'S')}</span>
                    <span>{seatLabel(lang, 'W')}</span>
                  </div>
                  <div className="auction-entries-grid">
                    {auction.entries.map((e, idx) => (
                      <span key={idx} className={`auction-bid-tag ${e.seat === 'S' ? 'user-bid' : ''}`}>
                        {bidLabelL(lang, e.bid)}
                      </span>
                    ))}
                  </div>
                </div>

                {auction.turn === 'S' && (
                  <div className="freeplay-bidding-box">
                    <div className="bidding-specials">
                      {(['pass', 'double', 'redouble'] as const).map(k => {
                        const b: Bid = { type: k };
                        return (
                          <button
                            key={k}
                            type="button"
                            className="bid-btn special"
                            onClick={() => handleUserBid(b)}
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
            <div className="result-actions">
              <button type="button" className="btn primary big" onClick={() => setReplayTrickIdx(0)}>
                📖 {t(lang, 'freeplay.replayTricks')}
              </button>
              <button type="button" className="btn ghost big" onClick={handleNewDeal}>
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
              <button type="button" className="btn primary big" onClick={handleNewDeal}>
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
        currentDealPbn={exportDealToPbn(dealHands, 'N')}
        onLoadPbn={(pbnStr) => {
          const imported = importDealFromPbn(pbnStr);
          if (!imported) return false;
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
    </div>
  );
}
