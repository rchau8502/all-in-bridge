import { describe, it, expect, beforeEach } from 'vitest';
import { Room, RECONNECT_WINDOW_MS } from './room.js';
import type { SendFn, BoardSource } from './room.js';
import { parseBid } from '../shared/bidding.js';
import { parseCard, cardLabel, nextSeat, SEATS } from '../shared/deck.js';
import type { Seat, Card, Hands, Suit } from '../shared/deck.js';
import { trickWinner } from '../shared/play.js';
import { PRACTICE_DEAL } from '../shared/lessons.js';
import type { GameEvent, EventType } from '../shared/events.js';
import type { ClientMessage } from './protocol.js';

const SEAT_IDS: Record<Seat, string> = { N: 'cN', E: 'cE', S: 'cS', W: 'cW' };

function fixedSource(): BoardSource {
  return {
    nextBoard: () => ({ hands: PRACTICE_DEAL, dealer: 'N' as Seat, vulnerability: 'none' as const }),
  };
}

interface Harness {
  room: Room;
  sent: Map<string, GameEvent[]>;
  now: number;
}

function setup(): Harness {
  const sent = new Map<string, GameEvent[]>();
  const send: SendFn = (clientId, event) => {
    const arr = sent.get(clientId) ?? [];
    arr.push(event);
    sent.set(clientId, arr);
  };
  const room = new Room('ABC123', send, fixedSource());
  return { room, sent, now: 1_000_000 };
}

function joinPlayer(h: Harness, seat: Seat, name = seat): void {
  h.room.join(
    { action: 'join', name, characterId: 'cowboy', lang: 'en' },
    SEAT_IDS[seat],
    h.now
  );
}

function joinAll(h: Harness): void {
  for (const s of SEATS) joinPlayer(h, s);
}

function events(h: Harness, clientId: string, type: EventType): GameEvent[] {
  return (h.sent.get(clientId) ?? []).filter(e => e.type === type);
}

function lastEvent(h: Harness, clientId: string, type: EventType): GameEvent | undefined {
  const arr = events(h, clientId, type);
  return arr[arr.length - 1];
}

function errorCodes(h: Harness, clientId: string): string[] {
  return events(h, clientId, 'error').map(e => (e.payload as { code: string }).code);
}

function bid(h: Harness, seat: Seat, label: string): void {
  h.room.handle(SEAT_IDS[seat], { action: 'bid', bid: parseBid(label) } as ClientMessage, h.now);
}

/** Play a full 1NT-by-S game with simple follow-suit logic; returns the board_result. */
function playFullGame(h: Harness): GameEvent {
  // Auction: N P, E P, S 1NT, W P, N P, E P
  bid(h, 'N', 'P');
  bid(h, 'E', 'P');
  bid(h, 'S', '1NT');
  bid(h, 'W', 'P');
  bid(h, 'N', 'P');
  bid(h, 'E', 'P');

  const remaining: Record<Seat, Card[]> = {
    N: PRACTICE_DEAL.N.map(c => ({ ...c })),
    E: PRACTICE_DEAL.E.map(c => ({ ...c })),
    S: PRACTICE_DEAL.S.map(c => ({ ...c })),
    W: PRACTICE_DEAL.W.map(c => ({ ...c })),
  };
  let turn: Seat = nextSeat('S'); // opening lead left of declarer
  let trick: Array<{ seat: Seat; card: Card }> = [];

  const playCard = (seat: Seat, card: Card) => {
    h.room.handle(
      SEAT_IDS[seat],
      { action: 'play', card: { suit: card.suit, rank: card.rank } } as ClientMessage,
      h.now
    );
    const idx = remaining[seat].findIndex(c => c.suit === card.suit && c.rank === card.rank);
    remaining[seat].splice(idx, 1);
  };

  let guard = 0;
  while (h.room.phase !== 'board_done' && guard++ < 60) {
    const hand = remaining[turn];
    const led: Suit | null = trick.length ? trick[0]!.card.suit : null;
    const pool = led ? hand.filter(c => c.suit === led) : hand;
    const card = (pool.length ? pool : hand)[0]!;
    playCard(turn, card);
    trick.push({ seat: turn, card });
    if (trick.length === 4) {
      turn = trickWinner(trick, null); // 1NT: no trump
      trick = [];
    } else {
      turn = nextSeat(turn);
    }
  }
  expect(h.room.phase).toBe('board_done');
  return lastEvent(h, 'cN', 'board_result')!;
}

describe('join flow', () => {
  it('first 4 joiners become N/E/S/W, 5th is an observer, first is host', () => {
    const h = setup();
    joinAll(h);
    h.room.join({ action: 'join', name: 'Zed', characterId: 'robot', lang: 'zh' }, 'cObs', h.now);

    const seats = (['cN', 'cE', 'cS', 'cW'] as const).map(id =>
      (lastEvent(h, id, 'room_joined')!.payload as { seat: string }).seat
    );
    expect(seats).toEqual(['N', 'E', 'S', 'W']);
    expect((lastEvent(h, 'cObs', 'room_joined')!.payload as { seat: string }).seat).toBe('observer');

    const update = lastEvent(h, 'cN', 'players_update')!.payload as {
      observers: number; hostSeat: string;
    };
    expect(update.observers).toBe(1);
    expect(update.hostSeat).toBe('N');
  });

  it('non-host cannot start; start needs exactly 4 players', () => {
    const h = setup();
    joinPlayer(h, 'N');
    joinPlayer(h, 'E');
    h.room.handle('cE', { action: 'start' } as ClientMessage, h.now);
    expect(errorCodes(h, 'cE')).toContain('not-host');
    h.room.handle('cN', { action: 'start' } as ClientMessage, h.now);
    expect(errorCodes(h, 'cN')).toContain('need-4-players');
  });
});

describe('game start and deal privacy', () => {
  it('host start deals privately; observers see everything', () => {
    const h = setup();
    joinAll(h);
    h.room.join({ action: 'join', name: 'Zed', characterId: 'robot', lang: 'zh' }, 'cObs', h.now);
    h.room.handle('cN', { action: 'start' } as ClientMessage, h.now);

    const gs = lastEvent(h, 'cN', 'game_start')!.payload as { boardNumber: number; dealer: string };
    expect(gs.boardNumber).toBe(1);
    expect(gs.dealer).toBe('N');

    // Each player gets exactly their own 13 cards.
    for (const s of SEATS) {
      const dealEv = lastEvent(h, SEAT_IDS[s], 'deal')!.payload as { yourHand: Card[] };
      expect(dealEv.yourHand).toHaveLength(13);
      const got = new Set(dealEv.yourHand.map(cardLabel));
      const want = new Set(PRACTICE_DEAL[s].map(cardLabel));
      expect(got).toEqual(want);
    }
    // Observer sees all 52.
    const obs = lastEvent(h, 'cObs', 'observer_deal')!.payload as { hands: Hands };
    const all = SEATS.flatMap(s => obs.hands[s]);
    expect(all).toHaveLength(52);
    // Observer never got a private deal.
    expect(events(h, 'cObs', 'deal')).toHaveLength(0);
  });
});

describe('auction and play', () => {
  it('a full game completes with a recorded board result', () => {
    const h = setup();
    joinAll(h);
    h.room.handle('cN', { action: 'start' } as ClientMessage, h.now);
    const result = playFullGame(h);
    const p = result.payload as { contract: { level: number; declarer: string }; declarerTricks: number; score: number };
    expect(p.contract.level).toBe(1);
    expect(p.contract.declarer).toBe('S');
    expect(p.declarerTricks).toBeGreaterThanOrEqual(0);
    expect(typeof p.score).toBe('number');

    expect(h.room.tableResults).toHaveLength(1);
    expect(h.room.tableResults[0]!.auction.length).toBeGreaterThan(0);
    expect(h.room.boardRecords).toHaveLength(1);
    expect(h.room.boardRecords[0]!.hands).toBeDefined();
  });

  it('no error events in a clean game', () => {
    const h = setup();
    joinAll(h);
    h.room.handle('cN', { action: 'start' } as ClientMessage, h.now);
    playFullGame(h);
    for (const id of Object.values(SEAT_IDS)) {
      expect(errorCodes(h, id)).toEqual([]);
    }
  });

  it('rejects out-of-turn and illegal bids', () => {
    const h = setup();
    joinAll(h);
    h.room.handle('cN', { action: 'start' } as ClientMessage, h.now);
    // E tries to bid when N is to bid.
    bid(h, 'E', '1C');
    expect(errorCodes(h, 'cE')).toContain('not-your-turn');
    // N bids 1D, E tries 1C (too low).
    bid(h, 'N', '1D');
    bid(h, 'E', '1C');
    expect(errorCodes(h, 'cE')).toContain('illegal-bid');
  });

  it('rejects a revoke (not following suit)', () => {
    const h = setup();
    joinAll(h);
    h.room.handle('cN', { action: 'start' } as ClientMessage, h.now);
    bid(h, 'N', 'P'); bid(h, 'E', 'P'); bid(h, 'S', '1NT');
    bid(h, 'W', 'P'); bid(h, 'N', 'P'); bid(h, 'E', 'P');
    // W leads 4D; N holds diamonds (KD 3D 2D) but tries QS instead.
    h.room.handle('cW', { action: 'play', card: { suit: 'D', rank: 4 } } as ClientMessage, h.now);
    h.room.handle('cN', { action: 'play', card: { suit: 'S', rank: 12 } } as ClientMessage, h.now);
    expect(errorCodes(h, 'cN')).toContain('illegal-play');
  });

  it('rejects playing a card the seat does not hold', () => {
    const h = setup();
    joinAll(h);
    h.room.handle('cN', { action: 'start' } as ClientMessage, h.now);
    bid(h, 'N', 'P'); bid(h, 'E', 'P'); bid(h, 'S', '1NT');
    bid(h, 'W', 'P'); bid(h, 'N', 'P'); bid(h, 'E', 'P');
    // W leads a card from N's hand — not theirs.
    h.room.handle('cW', { action: 'play', card: { suit: 'H', rank: 9 } } as ClientMessage, h.now);
    expect(errorCodes(h, 'cW')).toContain('not-your-card');
  });

  it('observers cannot bid or play', () => {
    const h = setup();
    joinAll(h);
    h.room.join({ action: 'join', name: 'Zed', characterId: 'robot', lang: 'zh' }, 'cObs', h.now);
    h.room.handle('cN', { action: 'start' } as ClientMessage, h.now);
    h.room.handle('cObs', { action: 'bid', bid: parseBid('1C') } as ClientMessage, h.now);
    expect(errorCodes(h, 'cObs')).toContain('not-your-turn');
  });

  it('host can start the next board after board_done', () => {
    const h = setup();
    joinAll(h);
    h.room.handle('cN', { action: 'start' } as ClientMessage, h.now);
    playFullGame(h);
    h.room.handle('cN', { action: 'next_board' } as ClientMessage, h.now);
    const gs = lastEvent(h, 'cN', 'game_start')!.payload as { boardNumber: number };
    expect(gs.boardNumber).toBe(2);
    expect(h.room.phase).toBe('auction');
  });
});

describe('disconnect and rejoin', () => {
  it('a disconnected seat is held, then restored on rejoin with a snapshot', () => {
    const h = setup();
    joinAll(h);
    h.room.leave('cS', h.now);
    // Seat still held: a new joiner becomes observer, not S.
    h.room.join({ action: 'join', name: 'New', characterId: 'gamer', lang: 'en' }, 'cNew', h.now);
    expect((lastEvent(h, 'cNew', 'room_joined')!.payload as { seat: string }).seat).toBe('observer');

    // Rejoin with the same clientId restores the seat + snapshot.
    h.room.join(
      { action: 'join', name: 'S', characterId: 'cowboy', lang: 'en', clientId: 'cS' },
      'cS',
      h.now
    );
    const snap = lastEvent(h, 'cS', 'room_snapshot');
    expect(snap).toBeDefined();
    expect((snap!.payload as { phase: string }).phase).toBe('lobby');
  });

  it('sweep expires seats past the reconnect window', () => {
    const h = setup();
    joinAll(h);
    h.room.leave('cS', h.now);
    h.room.sweep(h.now + RECONNECT_WINDOW_MS + 1);
    h.room.join({ action: 'join', name: 'New', characterId: 'gamer', lang: 'en' }, 'cNew', h.now);
    expect((lastEvent(h, 'cNew', 'room_joined')!.payload as { seat: string }).seat).toBe('S');
  });
});

describe('character picks', () => {
  it('pick_character updates the roster for everyone', () => {
    const h = setup();
    joinAll(h);
    h.room.handle('cN', { action: 'pick_character', characterId: 'robot' } as ClientMessage, h.now);
    const update = lastEvent(h, 'cE', 'players_update')!.payload as {
      seats: Record<string, { characterId: string } | null>;
    };
    expect(update.seats['N']!.characterId).toBe('robot');
    h.room.handle('cN', { action: 'pick_character', characterId: 'nope' } as ClientMessage, h.now);
    expect(errorCodes(h, 'cN')).toContain('unknown-character');
  });
});

describe('claiming tricks', () => {
  function joinWithPid(h: Harness, seat: Seat, pid: string): void {
    h.room.join(
      { action: 'join', name: seat, characterId: 'cowboy', lang: 'en', clientId: pid },
      SEAT_IDS[seat],
      h.now
    );
  }

  /** Four players in, 1NT by S auctioned, play phase reached. */
  function toPlayPhase(): Harness {
    const h = setup();
    (['N', 'E', 'S', 'W'] as Seat[]).forEach(s => joinWithPid(h, s, `pid-${s}`));
    h.room.handle('cN', { action: 'start' } as ClientMessage, h.now);
    bid(h, 'N', 'P'); bid(h, 'E', 'P'); bid(h, 'S', '1NT');
    bid(h, 'W', 'P'); bid(h, 'N', 'P'); bid(h, 'E', 'P');
    expect(h.room.phase).toBe('play');
    return h;
  }

  it('declarer claims; both defenders accept → board ends with claimed tricks', () => {
    const h = toPlayPhase();
    h.room.handle('cS', { action: 'claim', tricks: 10 } as unknown as ClientMessage, h.now);
    const offered = lastEvent(h, 'cN', 'claim_offered');
    expect(offered).toBeDefined();
    expect((offered!.payload as { by: string; tricks: number }).by).toBe('S');

    h.room.handle('cE', { action: 'claim_accept' } as ClientMessage, h.now);
    expect(h.room.phase).toBe('play'); // still waiting on W
    h.room.handle('cW', { action: 'claim_accept' } as ClientMessage, h.now);
    expect(h.room.phase).toBe('board_done');
    const result = lastEvent(h, 'cN', 'board_result')!;
    expect((result.payload as { declarerTricks: number }).declarerTricks).toBe(10);
    const cres = lastEvent(h, 'cN', 'claim_result')!;
    expect((cres.payload as { accepted: boolean }).accepted).toBe(true);
  });

  it('a defender rejection cancels the claim and play continues', () => {
    const h = toPlayPhase();
    h.room.handle('cS', { action: 'claim', tricks: 12 } as unknown as ClientMessage, h.now);
    h.room.handle('cE', { action: 'claim_accept' } as ClientMessage, h.now);
    h.room.handle('cW', { action: 'claim_reject' } as ClientMessage, h.now);
    expect(h.room.phase).toBe('play');
    const cres = lastEvent(h, 'cN', 'claim_result')!;
    expect((cres.payload as { accepted: boolean }).accepted).toBe(false);
    // A fresh claim can be made afterwards.
    h.room.handle('cS', { action: 'claim', tricks: 8 } as unknown as ClientMessage, h.now);
    expect(lastEvent(h, 'cN', 'claim_offered')).toBeDefined();
  });

  it('rejects claims from non-declarers, bad counts, and wrong phases', () => {
    const h = toPlayPhase();
    h.room.handle('cE', { action: 'claim', tricks: 5 } as unknown as ClientMessage, h.now);
    expect(errorCodes(h, 'cE')).toContain('not-declarer');
    h.room.handle('cS', { action: 'claim', tricks: 14 } as unknown as ClientMessage, h.now);
    expect(errorCodes(h, 'cS')).toContain('bad-claim');
    // Declarer's partner cannot vote.
    h.room.handle('cS', { action: 'claim', tricks: 5 } as unknown as ClientMessage, h.now);
    h.room.handle('cN', { action: 'claim_accept' } as ClientMessage, h.now);
    expect(errorCodes(h, 'cN')).toContain('not-defender');

    const h2 = setup();
    (['N', 'E', 'S', 'W'] as Seat[]).forEach(s => joinWithPid(h2, s, `pid-${s}`));
    h2.room.handle('cN', { action: 'start' } as ClientMessage, h2.now);
    h2.room.handle('cS', { action: 'claim', tricks: 5 } as unknown as ClientMessage, h2.now);
    expect(errorCodes(h2, 'cS')).toContain('wrong-phase');
  });

  it('a dropout cancels the pending claim', () => {
    const h = toPlayPhase();
    h.room.handle('cS', { action: 'claim', tricks: 9 } as unknown as ClientMessage, h.now);
    h.room.handle('cE', { action: 'claim_accept' } as ClientMessage, h.now);
    h.room.leave('cW', h.now); // defender drops before voting
    const cres = lastEvent(h, 'cN', 'claim_result')!;
    expect((cres.payload as { accepted: boolean }).accepted).toBe(false);
    expect(h.room.phase).toBe('play');
  });

  it('claim during a partially-played trick counts the partial trick as remaining', () => {
    const h = toPlayPhase();
    // Trick 1: W leads, N follows — leave the trick partial.
    const wLead = PRACTICE_DEAL.W[0]!;
    h.room.handle('cW', { action: 'play', card: { suit: wLead.suit, rank: wLead.rank } } as ClientMessage, h.now);
    const nFollow = PRACTICE_DEAL.N.find(c => c.suit === wLead.suit) ?? PRACTICE_DEAL.N[0]!;
    h.room.handle('cN', { action: 'play', card: { suit: nFollow.suit, rank: nFollow.rank } } as ClientMessage, h.now);
    expect(h.room.phase).toBe('play');

    // All 13 tricks remain (the partial trick counts). Declarer claims 10.
    h.room.handle('cS', { action: 'claim', tricks: 10 } as unknown as ClientMessage, h.now);
    expect(lastEvent(h, 'cN', 'claim_offered')).toBeDefined();
    h.room.handle('cE', { action: 'claim_accept' } as ClientMessage, h.now);
    h.room.handle('cW', { action: 'claim_accept' } as ClientMessage, h.now);

    expect(h.room.phase).toBe('board_done');
    const result = lastEvent(h, 'cN', 'board_result')!;
    // 0 completed tricks won by declarer + 10 claimed = 10.
    expect((result.payload as { declarerTricks: number }).declarerTricks).toBe(10);
  });

  it('rejecting a mid-trick claim leaves the partial trick untouched', () => {
    const h = toPlayPhase();
    const wLead = PRACTICE_DEAL.W[0]!;
    h.room.handle('cW', { action: 'play', card: { suit: wLead.suit, rank: wLead.rank } } as ClientMessage, h.now);
    h.room.handle('cS', { action: 'claim', tricks: 13 } as unknown as ClientMessage, h.now);
    h.room.handle('cE', { action: 'claim_reject' } as ClientMessage, h.now);
    expect(h.room.phase).toBe('play');
    const cres = lastEvent(h, 'cN', 'claim_result')!;
    expect((cres.payload as { accepted: boolean }).accepted).toBe(false);
    // N can still follow to the partial trick — play continues normally.
    const nFollow = PRACTICE_DEAL.N.find(c => c.suit === wLead.suit) ?? PRACTICE_DEAL.N[0]!;
    h.room.handle('cN', { action: 'play', card: { suit: nFollow.suit, rank: nFollow.rank } } as ClientMessage, h.now);
    expect(h.room.phase).toBe('play');
  });
});

describe('rejoin by stable player id', () => {
  function joinWithPid(h: Harness, seat: Seat, pid: string, conn: string): void {
    h.room.join(
      { action: 'join', name: seat, characterId: 'cowboy', lang: 'en', clientId: pid },
      conn,
      h.now
    );
  }

  it('a disconnected seat is reclaimed on a new connection', () => {
    const h = setup();
    (['N', 'E', 'S', 'W'] as Seat[]).forEach(s => joinWithPid(h, s, `pid-${s}`, SEAT_IDS[s]));
    h.room.leave('cN', h.now);
    joinWithPid(h, 'N', 'pid-N', 'new-conn');
    const snap = lastEvent(h, 'new-conn', 'room_snapshot');
    expect(snap).toBeDefined();
    expect(h.room.connectedClients()).toContain('new-conn');
    expect(h.room.connectedClients()).not.toContain('cN');
    // Seat still held: a stranger gets observer.
    h.room.join({ action: 'join', name: 'X', characterId: 'cowboy', lang: 'en' }, 'conn5', h.now);
    const joined = lastEvent(h, 'conn5', 'room_joined')!;
    expect((joined.payload as { seat: string }).seat).toBe('observer');
  });

  it('does not steal the seat of a still-connected player', () => {
    const h = setup();
    (['N', 'E', 'S', 'W'] as Seat[]).forEach(s => joinWithPid(h, s, `pid-${s}`, SEAT_IDS[s]));
    // Same player id, new connection, but the old one never dropped.
    joinWithPid(h, 'N', 'pid-N', 'second-tab');
    const joined = lastEvent(h, 'second-tab', 'room_joined')!;
    expect((joined.payload as { seat: string }).seat).toBe('observer');
    expect(h.room.connectedClients()).toContain('cN');
  });
});
