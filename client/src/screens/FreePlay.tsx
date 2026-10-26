import { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../App.js';
import { t, bidLabelL, seatLabel } from '../i18n.js';
import { audio } from '../audio.js';
import { SimTable, type SimSeatInfo } from './Tutorial.js';
import { CHARACTERS } from '../../../shared/characters.js';
import { Avatar } from '../components/ui.js';
import { buildDeck, shuffle, deal, sortHand, type Card, type Seat, type Suit, type Hands } from '../../../shared/deck.js';
import { PlayState, trickWinner } from '../../../shared/play.js';
import { chooseBotPlay } from '../../../shared/bot.js';
import { scoreContract, type ScoreBreakdown } from '../../../shared/scoring.js';
import type { Contract, Denom } from '../../../shared/bidding.js';

const CONTRACT_PRESETS: Array<{ level: number; denom: Denom; label: string }> = [
  { level: 3, denom: 'NT', label: '3NT (9 墩)' },
  { level: 4, denom: 'S', label: '4♠ (10 墩)' },
  { level: 4, denom: 'H', label: '4♥ (10 墩)' },
  { level: 1, denom: 'NT', label: '1NT (7 墩)' },
];

export function FreePlay() {
  const { lang, go, characterId } = useApp();

  const [contractPreset, setContractPreset] = useState<{ level: number; denom: Denom }>(CONTRACT_PRESETS[0]!);
  const [boardNo, setBoardNo] = useState(1);
  const [dealHands, setDealHands] = useState<Hands>(() => deal(shuffle(buildDeck())));

  const contract = useMemo<Contract>(() => ({
    level: contractPreset.level,
    denom: contractPreset.denom,
    declarer: 'S',
    doubled: 0,
  }), [contractPreset]);

  const [playState, setPlayState] = useState<PlayState>(() => new PlayState(dealHands, contract));
  const [pauseReview, setPauseReview] = useState<{ plays: Array<{ seat: Seat; card: Card }>; winner: Seat } | null>(null);
  const [collectingTo, setCollectingTo] = useState<Seat | null>(null);
  const [tick, setTick] = useState(0);

  const seatChars = useMemo(() => {
    const others = CHARACTERS.filter(c => c.id !== characterId).map(c => c.id);
    return { S: characterId, N: others[0]!, W: others[1]!, E: others[2]! } as Record<Seat, string>;
  }, [characterId]);

  const trump: Suit | null = contract.denom === 'NT' ? null : contract.denom;
  const isComplete = playState.isComplete();

  const handleNewDeal = useCallback(() => {
    audio.sfx('shuffle');
    const nextHands = deal(shuffle(buildDeck()));
    setDealHands(nextHands);
    setPlayState(new PlayState(nextHands, contract));
    setPauseReview(null);
    setCollectingTo(null);
    setBoardNo(b => b + 1);
  }, [contract]);

  const handleContractChange = (preset: { level: number; denom: Denom }) => {
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
  };

  // Bot play execution
  useEffect(() => {
    if (isComplete || pauseReview || collectingTo) return;

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
  }, [playState, playState.turn, isComplete, pauseReview, collectingTo, trump, tick]);

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
    if (pauseReview || collectingTo) return;
    const currentTurn = playState.turn;
    if (currentTurn !== 'S' && currentTurn !== 'N') return;

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
      // illegal play
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

  const currentPlaySeat = (playState.turn === 'S' || playState.turn === 'N') && !pauseReview && !collectingTo
    ? playState.turn
    : null;

  const seatsInfo: SimSeatInfo[] = (['N', 'E', 'S', 'W'] as Seat[]).map(s => ({
    seat: s,
    count: playState.hands[s].length,
    active: playState.turn === s,
  }));

  const contractLabel = `${bidLabelL(lang, { type: 'bid', level: contract.level, denom: contract.denom })} · ${seatLabel(lang, contract.declarer)}`;

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

        {/* Contract presets & New deal */}
        <div className="freeplay-controls">
          <div className="freeplay-presets">
            {CONTRACT_PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                className={`freeplay-preset-btn ${contractPreset.level === p.level && contractPreset.denom === p.denom ? 'active' : ''}`}
                onClick={() => handleContractChange(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn primary freeplay-deal-btn" onClick={handleNewDeal}>
            🔀 {t(lang, 'freeplay.newDeal')}
          </button>
        </div>
      </div>

      {/* Main Table Arena */}
      <div className="freeplay-table-wrap">
        <SimTable
          lang={lang}
          boardNo={boardNo}
          dealer="S"
          title={lang === 'zh' ? `第 ${playState.completedTricks.length + 1} 墩` : `Trick ${playState.completedTricks.length + 1}`}
          contractLabel={contractLabel}
          seats={seatsInfo}
          trick={pauseReview ? pauseReview.plays : playState.currentTrick}
          hand={sortHand(playState.hands.S, trump)}
          handLabel={seatLabel(lang, 'S')}
          trump={trump}
          interactive={currentPlaySeat !== null}
          playSeat={currentPlaySeat}
          onPlay={handlePlayCard}
          hint={null}
          stepKey={`fp-${boardNo}-${playState.completedTricks.length}-${playState.currentTrick.length}`}
          hands={{ N: playState.hands.N, S: playState.hands.S }}
          dummySeat="N"
          seatChars={seatChars}
          winSeat={pauseReview?.winner ?? null}
          trickStatic={!!pauseReview}
          collectingSeat={collectingTo}
          tricksWon={playState.tricksWon}
          targetTricks={targetTricks}
        />
      </div>

      {/* Deal Complete Modal */}
      {isComplete && scoreResult && (
        <div className="freeplay-modal-backdrop">
          <div className="freeplay-result-card">
            <Avatar
              id={characterId}
              className={`coach-avatar ${isMade ? 'react-happy' : 'react-shake'}`}
            />
            <h2 className="result-title">
              {isMade
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
              <button type="button" className="btn primary big" onClick={handleNewDeal}>
                {t(lang, 'freeplay.playAgain')}
              </button>
              <button type="button" className="btn ghost" onClick={() => go('home')}>
                {t(lang, 'tut.back')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
