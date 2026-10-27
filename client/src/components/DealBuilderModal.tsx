import { useState, useMemo, useEffect } from 'react';
import { t, type Lang, seatLabel, bidLabelL } from '../i18n.js';
import { audio } from '../audio.js';
import { buildDeck, shuffle, sortHand, type Card, type Seat, type Suit, type Hands } from '../../../shared/deck.js';
import { DENOM_ORDER, type Contract, type Denom } from '../../../shared/bidding.js';
import { calculateHcp, getSuitLengths } from '../../../shared/evaluator.js';

export interface DealBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  initialHands?: Hands | undefined;
  initialContract?: Contract | undefined;
  onLoadDeal: (deal: { hands: Hands; contract: Contract }) => void;
}

const ALL_CARDS: Card[] = buildDeck();
const SUIT_ORDER: Suit[] = ['S', 'H', 'D', 'C'];
const RANKS = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

function rankStr(rank: number): string {
  switch (rank) {
    case 14: return 'A';
    case 13: return 'K';
    case 12: return 'Q';
    case 11: return 'J';
    case 10: return '10';
    default: return String(rank);
  }
}

function cardKey(c: Card): string {
  return `${c.suit}${c.rank}`;
}

export function DealBuilderModal(props: DealBuilderModalProps) {
  const { lang, isOpen, onClose, onLoadDeal } = props;

  const [activeSeat, setActiveSeat] = useState<Seat>('S');
  const [assigned, setAssigned] = useState<Record<string, Seat>>(() => {
    const init: Record<string, Seat> = {};
    if (props.initialHands) {
      (['N', 'E', 'S', 'W'] as Seat[]).forEach(s => {
        props.initialHands![s].forEach(c => {
          init[cardKey(c)] = s;
        });
      });
    }
    return init;
  });

  const [level, setLevel] = useState<number>(() => props.initialContract?.level ?? 3);
  const [denom, setDenom] = useState<Denom>(() => props.initialContract?.denom ?? 'NT');
  const [declarer, setDeclarer] = useState<Seat>(() => props.initialContract?.declarer ?? 'S');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Derive 4 hands from assignment mapping
  const hands = useMemo<Hands>(() => {
    const h: Hands = { N: [], E: [], S: [], W: [] };
    for (const card of ALL_CARDS) {
      const s = assigned[cardKey(card)];
      if (s) h[s].push(card);
    }
    return h;
  }, [assigned]);

  if (!isOpen) return null;

  const handleCardClick = (c: Card) => {
    setErrorMsg(null);
    const key = cardKey(c);
    const currentOwner = assigned[key];

    if (currentOwner === activeSeat) {
      // Remove from active seat
      const next = { ...assigned };
      delete next[key];
      setAssigned(next);
      audio.sfx('click');
    } else {
      // Assign or reassign to active seat if not already at 13
      if (hands[activeSeat].length >= 13) {
        audio.sfx('lose');
        return;
      }
      setAssigned(prev => ({ ...prev, [key]: activeSeat }));
      audio.sfx('card');
    }
  };

  const handleAutoFill = () => {
    setErrorMsg(null);
    const unassigned = ALL_CARDS.filter(c => !assigned[cardKey(c)]);
    const shuffled = shuffle(unassigned);

    const nextAssigned = { ...assigned };
    let shuffleIdx = 0;

    for (const s of ['S', 'N', 'E', 'W'] as Seat[]) {
      while (hands[s].length + Object.values(nextAssigned).filter(val => val === s).length - hands[s].length < 13 && shuffleIdx < shuffled.length) {
        const c = shuffled[shuffleIdx++]!;
        nextAssigned[cardKey(c)] = s;
      }
    }

    setAssigned(nextAssigned);
    audio.sfx('deal');
  };

  const handleClearAll = () => {
    setErrorMsg(null);
    setAssigned({});
    audio.sfx('shuffle');
  };

  const handleLoadTemplate = (type: '3nt_finesse' | '4s_ruff' | '1nt_open') => {
    setErrorMsg(null);
    handleClearAll();
    const next: Record<string, Seat> = {};

    if (type === '3nt_finesse') {
      // South 16 HCP, North 10 HCP
      ['SA', 'SK', 'HQ', 'HJ', 'DA', 'DK', 'DQ', 'C9', 'C8', 'C7', 'C6', 'C5', 'C4'].forEach(k => { next[k] = 'S'; });
      ['S5', 'S4', 'S3', 'HA', 'HK', 'D5', 'D4', 'D3', 'D2', 'CA', 'CK', 'CQ', 'CJ'].forEach(k => { next[k] = 'N'; });
      setLevel(3);
      setDenom('NT');
      setDeclarer('S');
    } else if (type === '4s_ruff') {
      // 4 Spades cross-ruff setup
      ['SA', 'SK', 'SQ', 'SJ', 'ST', 'HA', 'HK', 'H9', 'H8', 'DA', 'D2', 'CA', 'C2'].forEach(k => { next[k] = 'S'; });
      ['S9', 'S8', 'S7', 'HQ', 'HJ', 'HT', 'DK', 'DQ', 'DJ', 'CK', 'CQ', 'CJ', 'CT'].forEach(k => { next[k] = 'N'; });
      setLevel(4);
      setDenom('S');
      setDeclarer('S');
    } else {
      // 1NT standard balanced
      ['SA', 'SK', 'HQ', 'HJ', 'H9', 'DA', 'DK', 'D8', 'D7', 'CA', 'CK', 'C8', 'C7'].forEach(k => { next[k] = 'S'; });
      ['SQ', 'SJ', 'ST', 'HA', 'HK', 'DQ', 'DJ', 'DT', 'CQ', 'CJ', 'CT', 'C9', 'C6'].forEach(k => { next[k] = 'N'; });
      setLevel(1);
      setDenom('NT');
      setDeclarer('S');
    }

    // Auto-fill remaining into EW
    const unassigned = ALL_CARDS.filter(c => !next[cardKey(c)]);
    const shuffled = shuffle(unassigned);
    let idx = 0;
    while (Object.values(next).filter(v => v === 'E').length < 13 && idx < shuffled.length) {
      next[cardKey(shuffled[idx++]!)] = 'E';
    }
    while (Object.values(next).filter(v => v === 'W').length < 13 && idx < shuffled.length) {
      next[cardKey(shuffled[idx++]!)] = 'W';
    }

    setAssigned(next);
    audio.sfx('deal');
  };

  const handleConfirm = () => {
    const counts = {
      N: hands.N.length,
      E: hands.E.length,
      S: hands.S.length,
      W: hands.W.length,
    };
    if (counts.N !== 13 || counts.E !== 13 || counts.S !== 13 || counts.W !== 13) {
      setErrorMsg(t(lang, 'builder.need13', { n: counts.N, e: counts.E, s: counts.S, w: counts.W }));
      audio.sfx('lose');
      return;
    }

    audio.sfx('fanfare');
    onLoadDeal({
      hands: {
        N: sortHand(hands.N, denom === 'NT' ? null : denom),
        E: sortHand(hands.E, denom === 'NT' ? null : denom),
        S: sortHand(hands.S, denom === 'NT' ? null : denom),
        W: sortHand(hands.W, denom === 'NT' ? null : denom),
      },
      contract: {
        level,
        denom,
        declarer,
        doubled: 0,
      },
    });
    onClose();
  };

  return (
    <div className="glossary-backdrop" onClick={onClose}>
      <div className="deal-builder-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="glossary-header">
          <div className="glossary-title-wrap">
            <h2 className="glossary-title">🛠️ {t(lang, 'builder.title')}</h2>
            <span className="glossary-subtitle">{t(lang, 'builder.subtitle')}</span>
          </div>
          <button type="button" className="glossary-close-btn" onClick={onClose} aria-label="Close builder">
            ✕
          </button>
        </div>

        {/* Seat Picker Bar */}
        <div className="builder-seat-selector">
          {(['S', 'N', 'E', 'W'] as Seat[]).map(s => {
            const count = hands[s].length;
            const hcp = calculateHcp(hands[s]);
            const lens = getSuitLengths(hands[s]);
            const shapeStr = `${lens.S}-${lens.H}-${lens.D}-${lens.C}`;
            return (
              <button
                key={s}
                type="button"
                className={`builder-seat-btn ${activeSeat === s ? 'active' : ''} seat-${s.toLowerCase()}`}
                onClick={() => {
                  setActiveSeat(s);
                  audio.sfx('click');
                }}
              >
                <div className="seat-btn-top">
                  <span className="seat-btn-name">{seatLabel(lang, s)}</span>
                  <span className={`seat-count-tag ${count === 13 ? 'full' : ''}`}>
                    {count} / 13
                  </span>
                </div>
                <div className="seat-btn-bottom">
                  <span className="seat-hcp-tag">{hcp} HCP</span>
                  {count > 0 && <span className="seat-shape-tag">({shapeStr})</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="builder-hint-banner">
          <span>👇 {t(lang, 'builder.selectSeatHint')} · <b>{seatLabel(lang, activeSeat)}</b></span>
        </div>

        {/* 52-Card Palette */}
        <div className="builder-palette">
          {SUIT_ORDER.map(suit => (
            <div key={suit} className="palette-suit-row">
              <span className={`palette-suit-symbol suit-${suit.toLowerCase()}`}>
                {suit === 'S' ? '♠' : suit === 'H' ? '♥' : suit === 'D' ? '♦' : '♣'}
              </span>
              <div className="palette-cards-row">
                {RANKS.map(rank => {
                  const c: Card = { suit, rank };
                  const key = cardKey(c);
                  const owner = assigned[key];
                  const isCurrent = owner === activeSeat;

                  return (
                    <button
                      key={key}
                      type="button"
                      className={`palette-card-btn suit-${suit.toLowerCase()} ${owner ? `assigned assigned-${owner.toLowerCase()}` : 'unassigned'} ${isCurrent ? 'selected-seat' : ''}`}
                      onClick={() => handleCardClick(c)}
                      title={`${suit}${rankStr(rank)}${owner ? ` (${seatLabel(lang, owner)})` : ''}`}
                    >
                      <span className="pcard-rank">{rankStr(rank)}</span>
                      {owner && <span className="pcard-owner">{owner}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contract & Declarer Settings */}
        <div className="builder-contract-strip">
          <div className="contract-select-group">
            <span className="strip-label">{lang === 'zh' ? '预设局定约:' : 'Contract:'}</span>
            <select
              className="builder-select"
              value={level}
              onChange={e => setLevel(parseInt(e.target.value, 10))}
            >
              {[1, 2, 3, 4, 5, 6, 7].map(l => (
                <option key={l} value={l}>{l} 阶</option>
              ))}
            </select>
            <select
              className="builder-select"
              value={denom}
              onChange={e => setDenom(e.target.value as Denom)}
            >
              {DENOM_ORDER.map(d => (
                <option key={d} value={d}>
                  {bidLabelL(lang, { type: 'bid', level: 1, denom: d }).replace('1', '')}
                </option>
              ))}
            </select>
            <span className="strip-label">{lang === 'zh' ? '庄家:' : 'Declarer:'}</span>
            <select
              className="builder-select"
              value={declarer}
              onChange={e => setDeclarer(e.target.value as Seat)}
            >
              {(['S', 'N', 'E', 'W'] as Seat[]).map(s => (
                <option key={s} value={s}>{seatLabel(lang, s)}</option>
              ))}
            </select>
          </div>

          {/* Quick Templates */}
          <div className="builder-templates">
            <span className="strip-label">📋 {t(lang, 'builder.templates')}:</span>
            <button type="button" className="template-chip" onClick={() => handleLoadTemplate('3nt_finesse')}>
              3NT 飞牌
            </button>
            <button type="button" className="template-chip" onClick={() => handleLoadTemplate('4s_ruff')}>
              4♠ 交叉将吃
            </button>
            <button type="button" className="template-chip" onClick={() => handleLoadTemplate('1nt_open')}>
              1NT 均型
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="builder-error-banner">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="builder-footer">
          <div className="footer-left-actions">
            <button type="button" className="btn ghost" onClick={handleAutoFill}>
              {t(lang, 'builder.autoFill')}
            </button>
            <button type="button" className="btn ghost danger-text" onClick={handleClearAll}>
              {t(lang, 'builder.clear')}
            </button>
          </div>
          <div className="footer-right-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              {lang === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button type="button" className="btn primary big" onClick={handleConfirm}>
              {t(lang, 'builder.loadDeal')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
