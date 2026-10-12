import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../App.js';
import { t, bidLabelL, seatLabel, errMsg, type Lang } from '../i18n.js';
import { CardView, Banner, CoinRain, Bubble, Avatar } from '../components/ui.js';
import { audio } from '../audio.js';
import { SEATS, nextSeat, seatSide, cardLabel } from '../../../shared/deck.js';
import type { Seat, Card, Suit, Hands } from '../../../shared/deck.js';
import { Auction } from '../../../shared/bidding.js';
import type { Bid, Contract, Vulnerability } from '../../../shared/bidding.js';
import { voiceUrl } from '../../../shared/voices.js';
import type { BoardReview } from '../../../shared/events.js';

interface SeatInfo { name: string; characterId: string; connected: boolean; }
interface Result { contract: Contract | null; declarerTricks: number; score: number | null; review: BoardReview; }

const ALL_BIDS: Bid[] = (() => {
  const bids: Bid[] = [{ type: 'pass' }];
  const denoms = ['C', 'D', 'H', 'S', 'NT'] as const;
  for (let level = 1; level <= 7; level++)
    for (const d of denoms) bids.push({ type: 'bid', level, denom: d });
  bids.push({ type: 'double' }, { type: 'redouble' });
  return bids;
})();

const QUICK_LINES = ['hello', 'thanks', 'haha', 'oops', 'wow'];
const QUICK_EMOTES = ['👍', '😮', '🎉', '😅'];

let bannerId = 0;
let bubbleId = 0;

export function Table() {
  const { lang, client, go, mySeat, setMySeat } = useApp();
  const [seats, setSeats] = useState<Record<Seat, SeatInfo | null>>({ N: null, E: null, S: null, W: null });
  const [hostSeat, setHostSeat] = useState<Seat | null>(null);
  const [observers, setObservers] = useState(0);
  const [phase, setPhase] = useState<'lobby' | 'auction' | 'play' | 'board_done'>('lobby');
  const [boardNumber, setBoardNumber] = useState(0);
  const [dealer, setDealer] = useState<Seat>('N');
  const [vul, setVul] = useState<Vulnerability>('none');
  const [hand, setHand] = useState<Card[]>([]);
  const [allHands, setAllHands] = useState<Hands | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [trick, setTrick] = useState<Array<{ seat: Seat; card: Card }>>([]);
  const [tricksWon, setTricksWon] = useState({ NS: 0, EW: 0 });
  const [turn, setTurn] = useState<Seat | null>(null);
  const [lastBids, setLastBids] = useState<Partial<Record<Seat, Bid>>>({});
  const [playedCount, setPlayedCount] = useState<Record<Seat, number>>({ N: 0, E: 0, S: 0, W: 0 });
  const [result, setResult] = useState<Result | null>(null);
  const [banners, setBanners] = useState<Array<{ id: number; key: string; sub?: string }>>([]);
  const [bubbles, setBubbles] = useState<Array<{ id: number; seat: Seat; text: string; emoji?: string }>>([]);
  const [err, setErr] = useState('');
  const [bidTick, setBidTick] = useState(0);
  const [claimOffer, setClaimOffer] = useState<{ by: Seat; tricks: number } | null>(null);
  const [claimDraft, setClaimDraft] = useState<number | null>(null);
  /** My last bid/play is still the latest action → I can take it back. */
  const [canUndo, setCanUndo] = useState(false);

  const auctionRef = useRef<Auction | null>(null);
  const trickRef = useRef<Array<{ seat: Seat; card: Card }>>([]);
  const liveRef = useRef({ seats, mySeat, lang });
  liveRef.current = { seats, mySeat, lang };

  const isObserver = mySeat === 'observer';
  const myTurnBid = phase === 'auction' && turn === mySeat && !isObserver;
  const myTurnPlay = phase === 'play' && turn === mySeat && !isObserver;

  const pushBanner = (key: string, sub?: string) => {
    const id = ++bannerId;
    const banner: { id: number; key: string; sub?: string } =
      sub === undefined ? { id, key } : { id, key, sub };
    setBanners(b => [...b, banner]);
    setTimeout(() => setBanners(b => b.filter(x => x.id !== id)), 2300);
  };
  const pushBubble = (seat: Seat, text: string, emoji?: string) => {
    const id = ++bubbleId;
    setBubbles(b => [...b, { id, seat, text, emoji }]);
    setTimeout(() => setBubbles(b => b.filter(x => x.id !== id)), 2600);
  };
  const showErr = (code: string) => {
    setErr(errMsg(liveRef.current.lang, code));
    setTimeout(() => setErr(''), 2500);
  };

  const playVoice = (seat: Seat, lineId: string) => {
    const charId = liveRef.current.seats[seat]?.characterId;
    if (!charId) return;
    try {
      const a = new Audio(voiceUrl(liveRef.current.lang, charId, lineId));
      a.volume = 0.7;
      void a.play().catch(() => {});
    } catch { /* missing file → silent */ }
  };

  useEffect(() => {
    client.onEvent = ev => {
      const p = ev.payload as Record<string, any>;
      switch (ev.type) {
        case 'room_snapshot': {
          const s = p as unknown as import('../../../shared/events.js').EventPayloadMap['room_snapshot'];
          setPhase(s.phase);
          setBoardNumber(s.boardNumber);
          if (s.dealer) {
            setDealer(s.dealer);
            const auc = new Auction(s.dealer);
            for (const e of s.auction) auc.apply(e.bid);
            auctionRef.current = auc;
            const lb: Partial<Record<Seat, Bid>> = {};
            for (const e of s.auction) lb[e.seat] = e.bid;
            setLastBids(lb);
            setBidTick(x => x + 1);
          }
          if (s.vulnerability) setVul(s.vulnerability);
          setSeats(s.seats);
          setHostSeat(s.hostSeat);
          setObservers(s.observers);
          setContract(s.contract);
          if (s.yourHand) setHand(s.yourHand.slice().sort(cardSort));
          setAllHands(s.allHands);
          trickRef.current = s.currentTrick.map(t => ({ ...t }));
          setTrick(trickRef.current);
          setTricksWon({ ...s.tricksWon });
          setTurn(s.turn);
          setResult(null);
          break;
        }
        case 'room_joined':
          setMySeat((p['seat'] as Seat | 'observer') ?? null);
          break;
        case 'players_update':
          setSeats(p['seats']);
          setHostSeat(p['hostSeat']);
          setObservers(p['observers']);
          break;
        case 'game_start':
          auctionRef.current = new Auction(p['dealer']);
          setPhase('auction');
          setBoardNumber(p['boardNumber']);
          setDealer(p['dealer']);
          setVul(p['vulnerability']);
          setContract(null);
          setTrick([]);
          trickRef.current = [];
          setTricksWon({ NS: 0, EW: 0 });
          setTurn(p['dealer']);
          setLastBids({});
          setPlayedCount({ N: 0, E: 0, S: 0, W: 0 });
          setResult(null);
          setBanners([]);
          setBidTick(x => x + 1);
          audio.sfx('deal');
          setClaimOffer(null);
          setClaimDraft(null);
          break;
        case 'claim_offered': {
          const o = p as unknown as { by: Seat; tricks: number };
          setClaimOffer({ by: o.by, tricks: o.tricks });
          break;
        }
        case 'claim_result': {
          const r = p as unknown as { accepted: boolean; tricks: number };
          setClaimOffer(null);
          setClaimDraft(null);
          pushBanner(r.accepted ? 'claim.accepted' : 'claim.rejected');
          break;
        }
        case 'deal': {
          const cards = (p['yourHand'] as Card[]).slice().sort(cardSort);
          setHand(cards);
          setCanUndo(false);
          break;
        }
        case 'observer_deal':
          setAllHands(p['hands']);
          break;
        case 'bid_made': {
          const bid = p['bid'] as Bid;
          auctionRef.current?.apply(bid);
          setLastBids(b => ({ ...b, [p['seat']]: bid }));
          setTurn(nextSeat(p['seat']));
          setBidTick(x => x + 1);
          setCanUndo(p['seat'] === liveRef.current.mySeat);
          audio.sfx('bid');
          break;
        }
        case 'bid_undone': {
          const seat = p['seat'] as Seat;
          auctionRef.current?.unapply();
          // Recompute each seat's latest visible bid from the remaining entries.
          const nb: Partial<Record<Seat, Bid>> = {};
          for (const e of auctionRef.current?.entries ?? []) nb[e.seat] = e.bid;
          setLastBids(nb);
          setTurn(seat);
          setBidTick(x => x + 1);
          setCanUndo(false);
          pushBanner('undo.bidTaken');
          audio.sfx('click');
          break;
        }
        case 'auction_end':
          setContract(p['contract']);
          setCanUndo(false);
          if (p['contract']) {
            setPhase('play');
            setTurn(nextSeat((p['contract'] as Contract).declarer));
          } else {
            setPhase('board_done');
          }
          break;
        case 'play_made': {
          const { seat, card } = p as { seat: Seat; card: Card };
          trickRef.current = [...trickRef.current, { seat, card }];
          setTrick(trickRef.current);
          setPlayedCount(c => ({ ...c, [seat]: c[seat] + 1 }));
          if (liveRef.current.mySeat === seat) {
            setHand(h => h.filter(c => !(c.suit === card.suit && c.rank === card.rank)));
          }
          if (trickRef.current.length < 4) setTurn(nextSeat(seat));
          // On the 4th card, wait for trick_won — never act on stale turn.
          setCanUndo(seat === liveRef.current.mySeat);
          audio.sfx('card');
          break;
        }
        case 'play_undone': {
          const { seat, card } = p as { seat: Seat; card: Card };
          // The undone card is always the latest one on the table.
          const t = trickRef.current;
          const idx = t.map(e => e.seat).lastIndexOf(seat);
          if (idx >= 0) {
            trickRef.current = [...t.slice(0, idx), ...t.slice(idx + 1)];
            setTrick(trickRef.current);
          }
          setPlayedCount(c => ({ ...c, [seat]: Math.max(0, c[seat] - 1) }));
          if (liveRef.current.mySeat === seat) {
            setHand(h => [...h, card].sort(cardSort));
          }
          setTurn(seat);
          setCanUndo(false);
          pushBanner('undo.cardTaken');
          audio.sfx('click');
          break;
        }
        case 'trick_won': {
          const winner = p['winner'] as Seat;
          trickRef.current = [];
          setTrick([]);
          setTricksWon(w => ({ ...w, [seatSide(winner)]: w[seatSide(winner)] + 1 }));
          setTurn(winner);
          setCanUndo(false);
          audio.sfx('trick');
          break;
        }
        case 'board_result':
          setResult(p as unknown as Result);
          setPhase('board_done');
          setTurn(null);
          setCanUndo(false);
          break;
        case 'announce': {
          const key = p['key'] as string;
          pushBanner(`ann.${key}`, p['seat'] ? seatLabel(liveRef.current.lang, p['seat']) : undefined);
          if (key === 'slam') audio.sfx('slam');
          else if (key === 'victory') { audio.sfx('win'); setTimeout(() => audio.sfx('coin'), 600); }
          else if (key === 'defeat') audio.sfx('lose');
          else audio.sfx('bid');
          break;
        }
        case 'voice_line': {
          const seat = p['seat'] as Seat;
          const lineId = p['lineId'] as string;
          playVoice(seat, lineId);
          pushBubble(seat, prettyLine(liveRef.current.lang, lineId));
          break;
        }
        case 'emote':
          pushBubble(p['seat'] as Seat, '', p['emoteId'] as string);
          audio.sfx('click');
          break;
        case 'player_left':
          break;
        case 'standings_update':
          break; // handled on the Compete screen
        case 'error':
          showErr(p['code']);
          break;
      }
    };
    // Pull full state on mount (covers arriving from the lobby mid-game).
    client.snapshot();
    return () => { client.onEvent = () => {}; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  // Your-turn ping.
  useEffect(() => {
    if ((myTurnBid || myTurnPlay) && !isObserver) audio.sfx('yourturn');
  }, [myTurnBid, myTurnPlay, isObserver]);

  const legalBids = useMemo(
    () => (auctionRef.current ? ALL_BIDS.filter(b => auctionRef.current!.isLegal(b)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bidTick]
  );

  const ledSuit = trick[0]?.card.suit as Suit | undefined;
  const mustFollow = !!ledSuit && hand.some(c => c.suit === ledSuit);
  const canPlay = (c: Card) => myTurnPlay && (!mustFollow || c.suit === ledSuit);

  const doBid = (bid: Bid) => {
    audio.sfx('click');
    client.bid(bid);
  };
  const doPlay = (card: Card) => {
    if (!canPlay(card)) return;
    audio.sfx('card');
    client.play(card);
  };

  // Seat layout: me at bottom.
  const me = mySeat === 'observer' ? 'S' : (mySeat as Seat | null);
  const at = (offset: number): Seat | null =>
    me ? SEATS[(SEATS.indexOf(me) + offset) % 4]! : null;
  const top = at(2), left = at(3), right = at(1);

  const vulKey = { none: 'table.vulNone', NS: 'table.vulNS', EW: 'table.vulEW', all: 'table.vulAll' } as const;

  return (
    <div className="table-screen">
      <div className="table-bar">
        <span>🂡 {t(lang, 'table.board')} {boardNumber}</span>
        <span>{t(lang, 'table.dealer')}: {seatLabel(lang, dealer)}</span>
        <span>{t(lang, vulKey[vul])}</span>
        {contract && (
          <span className="contract-pill">
            {t(lang, 'table.contract')}: {bidLabelL(lang, { type: 'bid', level: contract.level, denom: contract.denom })}
            {contract.doubled === 1 ? ' ✕' : contract.doubled === 2 ? ' ✕✕' : ''} · {seatLabel(lang, contract.declarer)}
          </span>
        )}
        <span>♠ {t(lang, 'table.tricks')}: {tricksWon.NS}–{tricksWon.EW}</span>
        {observers > 0 && <span>👀 {observers}</span>}
        {isObserver && <span className="obs-tag">👀 {t(lang, 'table.observerTag')}</span>}
      </div>

      {err && <div className="error floating">{err}</div>}

      <div className="felt">
        {top && <OppPanel seat={top} seats={seats} lang={lang} lastBid={lastBids[top]} played={playedCount[top]} turn={turn === top} pos="top" />}
        {left && <OppPanel seat={left} seats={seats} lang={lang} lastBid={lastBids[left]} played={playedCount[left]} turn={turn === left} pos="left" />}
        <div className="center">
          {trick.map((t, i) => (
            <div key={i} className={`trick-card pos-${relPos(t.seat, me)}`}>
              <CardView card={t.card} small />
            </div>
          ))}
          {phase === 'auction' && (
            <div className="auction-trail">
              {auctionRef.current?.entries.map((e, i) => (
                <span key={i} className="trail-bid">
                  {seatLabel(lang, e.seat)} {bidLabelL(lang, e.bid)}
                </span>
              ))}
            </div>
          )}
        </div>
        {right && <OppPanel seat={right} seats={seats} lang={lang} lastBid={lastBids[right]} played={playedCount[right]} turn={turn === right} pos="right" />}
        <div className="me-area">
          {isObserver ? (
            <ObserverHands hands={allHands} lang={lang} />
          ) : (
            <>
              <div className="my-info">
                {mySeat && <span className="seat-tag">{seatLabel(lang, mySeat as Seat)}</span>}
                {turn === mySeat && <span className="turn-dot">●</span>}
              </div>
              <div className="hand">
                {hand.map((c, i) => (
                  <CardView key={`${c.suit}${c.rank}-${i}`} card={c} playable={canPlay(c)} dim={!canPlay(c) && (myTurnPlay)} onClick={() => doPlay(c)} />
                ))}
              </div>
            </>
          )}
        </div>
        {bubbles.map(b => (
          <div key={b.id} className={`bubble-pos pos-${relPos(b.seat, me)}`}>
            <Bubble text={b.text} emoji={b.emoji} />
          </div>
        ))}
      </div>

      <div className="action-bar">
        {phase === 'auction' && !isObserver && (
          myTurnBid ? (
            <div className="bid-box">
              <div className="bid-prompt">📢 {t(lang, 'table.yourBid')}</div>
              <div className="bid-grid">
                {legalBids.map((b, i) => (
                  <button key={i} className={`bid-btn ${b.type !== 'bid' ? 'special' : ''}`} onClick={() => doBid(b)}>
                    {bidLabelL(lang, b)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="hint-row">
              <div className="hint">⏳ {turn ? seatLabel(lang, turn) : ''} {t(lang, 'table.waitingBid')}</div>
              {canUndo && (
                <button className="btn ghost small" onClick={() => { audio.sfx('click'); setCanUndo(false); client.undo(); }}>
                  ↩️ {t(lang, 'table.undo')}
                </button>
              )}
            </div>
          )
        )}
        {phase === 'play' && !isObserver && (
          myTurnPlay ? (
            <div className="bid-prompt">🃏 {t(lang, 'table.yourPlay')}</div>
          ) : (
            <div className="hint-row">
              <div className="hint">⏳ {turn ? seatLabel(lang, turn) : ''} {t(lang, 'table.waitingPlay')}</div>
              {canUndo && (
                <button className="btn ghost small" onClick={() => { audio.sfx('click'); setCanUndo(false); client.undo(); }}>
                  ↩️ {t(lang, 'table.undo')}
                </button>
              )}
            </div>
          )
        )}
        {phase === 'play' && !isObserver && contract && contract.declarer === mySeat && (
          <div className="claim-row">
            {claimDraft === null ? (
              <button className="btn small" onClick={() => { audio.sfx('click'); setClaimDraft(13 - tricksWon.NS - tricksWon.EW); }}>
                ✋ {t(lang, 'claim.claimBtn')}
              </button>
            ) : (
              <div className="claim-dialog">
                <div className="claim-title">{t(lang, 'claim.title')} · {t(lang, 'claim.tricksLeft')}: {13 - tricksWon.NS - tricksWon.EW}</div>
                <div className="claim-stepper">
                  <button className="btn small" onClick={() => setClaimDraft(d => Math.max(0, (d ?? 0) - 1))}>−</button>
                  <span className="claim-num">{claimDraft}</span>
                  <button className="btn small" onClick={() => setClaimDraft(d => Math.min(13 - tricksWon.NS - tricksWon.EW, (d ?? 0) + 1))}>+</button>
                </div>
                <div className="claim-actions">
                  <button className="btn primary small" onClick={() => { client.claim(claimDraft); setClaimDraft(null); }}>
                    {t(lang, 'claim.confirm')}
                  </button>
                  <button className="btn ghost small" onClick={() => setClaimDraft(null)}>
                    {t(lang, 'claim.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {claimOffer && !isObserver && mySeat && seatSide(mySeat) !== seatSide(claimOffer.by) && (
          <div className="claim-dialog">
            <div className="claim-title">
              {t(lang, 'claim.offer')
                .replace('{name}', seats[claimOffer.by]?.name ?? seatLabel(lang, claimOffer.by))
                .replace('{n}', String(claimOffer.tricks))}
            </div>
            <div className="claim-actions">
              <button className="btn primary small" onClick={() => client.claimAccept()}>{t(lang, 'claim.accept')}</button>
              <button className="btn ghost small" onClick={() => client.claimReject()}>{t(lang, 'claim.reject')}</button>
            </div>
          </div>
        )}
        {!isObserver && phase !== 'lobby' && (
          <div className="voice-row">
            <span className="voice-label">🎙 {t(lang, 'table.say')}</span>
            {QUICK_LINES.map(l => (
              <button key={l} className="chip" onClick={() => client.voice(l)}>{l}</button>
            ))}
            {QUICK_EMOTES.map(e => (
              <button key={e} className="chip" onClick={() => client.emote(e)}>{e}</button>
            ))}
          </div>
        )}
      </div>

      {banners.map(b => (
        <Banner key={b.id} textKey={b.key} lang={lang} sub={b.sub} />
      ))}

      {result && (
        <ResultsOverlay
          result={result}
          lang={lang}
          mySeat={mySeat}
          isHost={hostSeat === mySeat}
          onNext={() => client.nextBoard()}
          onLeave={() => { client.disconnect(); go('home'); }}
        />
      )}
    </div>
  );
}

function cardSort(a: Card, b: Card): number {
  const order: Record<string, number> = { S: 0, H: 1, D: 2, C: 3 };
  return order[a.suit]! - order[b.suit]! || b.rank - a.rank;
}

/** Position of a seat relative to me: top/left/right/bottom. */
function relPos(seat: Seat, me: Seat | null): string {
  if (!me || seat === me) return 'bottom';
  const d = (SEATS.indexOf(seat) - SEATS.indexOf(me) + 4) % 4;
  return d === 2 ? 'top' : d === 1 ? 'right' : 'left';
}

function OppPanel({ seat, seats, lang, lastBid, played, turn, pos }: {
  seat: Seat; seats: Record<Seat, SeatInfo | null>; lang: Lang;
  lastBid?: Bid; played: number; turn: boolean; pos: string;
}) {
  const info = seats[seat];
  return (
    <div className={`opp ${pos} ${turn ? 'active-turn' : ''}`}>
      <div className="pod-avatar">
        <Avatar id={info?.characterId ?? 'cowboy'} />
      </div>
      <div className="pod-plate">
        <div className="opp-name">{info?.name ?? '…'}</div>
        <div className="opp-seat">{seatLabel(lang, seat)}</div>
      </div>
      {lastBid && <div className="opp-bid">{bidLabelL(lang, lastBid)}</div>}
      <div className="opp-cards">🂠 × {13 - played}</div>
      {turn && <div className="turn-dot">●</div>}
    </div>
  );
}

function ObserverHands({ hands, lang }: { hands: Hands | null; lang: Lang }) {
  if (!hands) return <div className="hint">…</div>;
  return (
    <div className="obs-hands">
      {(Object.keys(hands) as Seat[]).map(s => (
        <div key={s} className="obs-hand">
          <span className="seat-tag">{seatLabel(lang, s)}</span>
          <div className="obs-cards">
            {hands[s].slice().sort(cardSort).map((c, i) => <CardView key={i} card={c} small />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function prettyLine(lang: Lang, lineId: string): string {
  if (lineId.startsWith('bid_')) {
    const m = lineId.match(/^bid_([1-7])(c|d|h|s|nt)$/);
    if (m) return bidLabelL(lang, { type: 'bid', level: parseInt(m[1]!), denom: m[2]!.toUpperCase() });
  }
  if (lineId === 'pass') return bidLabelL(lang, { type: 'pass' });
  if (lineId === 'double') return bidLabelL(lang, { type: 'double' });
  if (lineId === 'redouble') return bidLabelL(lang, { type: 'redouble' });
  return lineId;
}

function ResultsOverlay({ result, lang, mySeat, isHost, onNext, onLeave }: {
  result: Result; lang: Lang; mySeat: Seat | 'observer' | null;
  isHost: boolean; onNext: () => void; onLeave: () => void;
}) {
  const { contract, declarerTricks, score } = result;
  const [showReview, setShowReview] = useState(false);
  const made = (score ?? 0) >= 0;
  const mySide = mySeat && mySeat !== 'observer' ? seatSide(mySeat) : null;
  const declSide = contract ? seatSide(contract.declarer) : null;
  const iWin = mySide === null ? made : (mySide === declSide) === made;
  const needed = contract ? contract.level + 6 : 0;

  return (
    <div className="results-overlay">
      {made && <CoinRain />}
      <div className="results-card">
        <div className={`results-title ${iWin ? 'win' : 'lose'}`}>
          {t(lang, made ? 'table.resultTitleWin' : 'table.resultTitleDown')}
        </div>
        {contract && (
          <div className="results-contract">
            {bidLabelL(lang, { type: 'bid', level: contract.level, denom: contract.denom })}
            {contract.doubled === 1 ? ' ✕' : contract.doubled === 2 ? ' ✕✕' : ''}
            {' '}{t(lang, 'table.resultBy')} {seatLabel(lang, contract.declarer)}
          </div>
        )}
        <div className="results-score">
          {t(lang, 'table.resultScore')}: <b className={made ? 'pos' : 'neg'}>{score ?? 0}</b>
        </div>
        <div className="results-tricks">
          {t(lang, 'table.resultTricks')}: {declarerTricks} / {needed}
        </div>
        <div className="results-actions">
          {isHost && contract && (
            <button className="btn primary" onClick={onNext}>{t(lang, 'table.nextBoard')}</button>
          )}
          {result.review && (
            <button className="btn ghost" onClick={() => { audio.sfx('click'); setShowReview(true); }}>
              📋 {t(lang, 'table.review')}
            </button>
          )}
          <button className="btn ghost" onClick={onLeave}>🏠</button>
        </div>
      </div>
      {showReview && result.review && (
        <BoardReviewModal review={result.review} lang={lang} onClose={() => setShowReview(false)} />
      )}
    </div>
  );
}

/** Post-board hand record: auction, tricks, and all four hands. */
function BoardReviewModal({ review, lang, onClose }: { review: BoardReview; lang: Lang; onClose: () => void }) {
  const [tab, setTab] = useState<'auction' | 'tricks' | 'hands'>('auction');
  // Columns in dealer-first order, like a real auction pad.
  const order: Seat[] = [review.dealer];
  for (let i = 1; i < 4; i++) order.push(nextSeat(order[i - 1]!));
  const rounds: ({ seat: Seat; bid: Bid } | null)[][] = [];
  for (let i = 0; i < review.auction.length; i += 4) {
    const r: ({ seat: Seat; bid: Bid } | null)[] = [];
    for (let j = 0; j < 4; j++) r.push(review.auction[i + j] ?? null);
    rounds.push(r);
  }
  const vulKey = { none: 'table.vulNone', NS: 'table.vulNS', EW: 'table.vulEW', all: 'table.vulAll' } as const;

  return (
    <div className="review-overlay" onClick={onClose}>
      <div className="review-card" onClick={e => e.stopPropagation()}>
        <div className="review-head">
          <div className="review-title">📋 {t(lang, 'table.review')} · #{review.boardNumber}</div>
          <div className="review-meta">
            {t(lang, 'table.dealer')}: {seatLabel(lang, review.dealer)} · {t(lang, vulKey[review.vulnerability])}
            {review.contract && (
              <> · {bidLabelL(lang, { type: 'bid', level: review.contract.level, denom: review.contract.denom })}
              {review.contract.doubled === 1 ? ' ✕' : review.contract.doubled === 2 ? ' ✕✕' : ''}</>
            )}
          </div>
          <div className="review-tabs">
            {(['auction', 'tricks', 'hands'] as const).map(k => (
              <button key={k} className={`chip ${tab === k ? 'big' : ''}`} onClick={() => setTab(k)}>
                {t(lang, `review.${k}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="review-body">
          {tab === 'auction' && (
            <table className="review-auction">
              <thead>
                <tr>{order.map(s => <th key={s}>{seatLabel(lang, s)}</th>)}</tr>
              </thead>
              <tbody>
                {rounds.map((r, i) => (
                  <tr key={i}>
                    {r.map((cell, j) => (
                      <td key={j}>{cell ? bidLabelL(lang, cell.bid) : ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'tricks' && (
            <div className="review-tricks">
              {review.tricks.map((tr, i) => (
                <div key={i} className="review-trick">
                  <span className="review-tricknum">{i + 1}</span>
                  <span className="review-trickcards">
                    {tr.plays.map((p, j) => (
                      <span key={j} className="review-play">
                        <b>{seatLabel(lang, p.seat)}</b> {cardLabel(p.card)}
                      </span>
                    ))}
                  </span>
                  <span className="review-winner">→ {seatLabel(lang, tr.winner)}</span>
                </div>
              ))}
              {review.tricks.length === 0 && (
                <div className="hint">{t(lang, 'review.noTricks')}</div>
              )}
            </div>
          )}
          {tab === 'hands' && (
            <div className="review-hands">
              {(['N', 'E', 'S', 'W'] as Seat[]).map(s => (
                <div key={s} className="review-hand">
                  <span className="review-handseat">{seatLabel(lang, s)}</span>
                  <span className="review-handcards">
                    {review.hands[s].slice().sort(cardSort).map((c, i) => (
                      <CardView key={i} card={c} small />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="btn ghost" onClick={onClose}>{t(lang, 'review.close')}</button>
      </div>
    </div>
  );
}
