import { describe, it, expect } from 'vitest';
import { Auction, bidLabel, parseBid, boardDealerVul } from './bidding.js';

function runAuction(dealer: 'N' | 'E' | 'S' | 'W', bids: string[]): Auction {
  const a = new Auction(dealer);
  for (const b of bids) a.apply(parseBid(b));
  return a;
}

describe('auction basics', () => {
  it('a simple auction to 1NT completes with 3 passes', () => {
    const a = runAuction('N', ['P', '1C', 'P', '1NT', 'P', 'P', 'P']);
    expect(a.isComplete()).toBe(true);
    const c = a.contract()!;
    expect(c.level).toBe(1);
    expect(c.denom).toBe('NT');
    expect(c.doubled).toBe(0);
  });

  it('four straight passes = passed out, no contract', () => {
    const a = runAuction('E', ['P', 'P', 'P', 'P']);
    expect(a.isComplete()).toBe(true);
    expect(a.contract()).toBeNull();
  });

  it('is not complete mid-auction', () => {
    const a = runAuction('N', ['1H', 'P']);
    expect(a.isComplete()).toBe(false);
  });

  it('declarer is the first of the declaring side to bid the denomination', () => {
    // N opens 1H, E passes, S raises 2H, W passes, N passes, E passes → S declared 2H? No:
    // declaring side is NS (N bid 1H first); first NS bidder of H is N → N declares.
    const a = runAuction('N', ['1H', 'P', '2H', 'P', 'P', 'P']);
    expect(a.contract()!.declarer).toBe('N');
  });

  it('declarer can be the responder when they first name the suit', () => {
    // N 1C, E P, S 1H(!), W P, N 2H, E P, S P, W P → first H bidder on NS is S.
    const a = runAuction('N', ['1C', 'P', '1H', 'P', '2H', 'P', 'P', 'P']);
    expect(a.contract()!.declarer).toBe('S');
  });
});

describe('bid legality', () => {
  it('rejects a bid that does not outrank the last bid', () => {
    const a = runAuction('N', ['1NT']);
    // 1S does NOT outrank 1NT (NT is the highest denomination)
    expect(a.isLegal(parseBid('1S'))).toBe(false);
    expect(a.isLegal(parseBid('2C'))).toBe(true);
  });

  it('same level needs a higher denomination', () => {
    const a = runAuction('N', ['2D']);
    expect(a.isLegal(parseBid('2C'))).toBe(false);
    expect(a.isLegal(parseBid('2H'))).toBe(true);
  });

  it('pass is always legal', () => {
    const a = runAuction('N', ['3NT', 'X']);
    expect(a.isLegal(parseBid('P'))).toBe(true);
  });

  it('double is legal only against an opponent’s undoubled bid', () => {
    // N bids 1S, E doubles — legal.
    const a = runAuction('N', ['1S']);
    expect(a.isLegal(parseBid('X'))).toBe(true);
    a.apply(parseBid('X'));
    // S (partner of N... wait S is partner of N; doubler was E (EW). S is NS → opponent of E → redouble legal.
    expect(a.isLegal(parseBid('XX'))).toBe(true);
  });

  it('cannot double your partner’s bid', () => {
    const a = runAuction('N', ['1S', 'P']);
    expect(a.isLegal(parseBid('X'))).toBe(false); // S doubling N's bid
  });

  it('cannot double twice', () => {
    const a = runAuction('N', ['1S', 'X', 'P']);
    expect(a.isLegal(parseBid('X'))).toBe(false); // W can't double an already-doubled bid
  });

  it('cannot double with no bid on the table', () => {
    const a = runAuction('N', []);
    expect(a.isLegal(parseBid('X'))).toBe(false);
    expect(a.isLegal(parseBid('XX'))).toBe(false);
  });

  it('redouble is legal only against an opponent’s double', () => {
    const a = runAuction('N', ['1H', 'X']);
    expect(a.isLegal(parseBid('XX'))).toBe(true); // S redoubles E's double
    a.apply(parseBid('XX'));
    expect(a.isLegal(parseBid('XX'))).toBe(false); // can't redouble twice
  });

  it('a higher bid after a double cancels it', () => {
    const a = runAuction('N', ['1S', 'X', '2H', 'P', 'P', 'P']);
    const c = a.contract()!;
    expect(c.level).toBe(2);
    expect(c.denom).toBe('H');
    expect(c.doubled).toBe(0);
  });

  it('doubled and redoubled contracts are recorded', () => {
    const a = runAuction('N', ['2S', 'X', 'P', 'P', 'P']);
    expect(a.contract()!.doubled).toBe(1);
    const b = runAuction('N', ['2S', 'X', 'XX', 'P', 'P', 'P']);
    expect(b.contract()!.doubled).toBe(2);
  });

  it('apply() throws on illegal bids', () => {
    const a = runAuction('N', ['1NT']);
    expect(() => a.apply(parseBid('1H'))).toThrow();
  });
});

describe('bidLabel / parseBid', () => {
  it('round-trips', () => {
    for (const l of ['P', 'X', 'XX', '1C', '3NT', '7S']) {
      expect(bidLabel(parseBid(l))).toBe(l);
    }
  });
});

describe('boardDealerVul', () => {
  it('matches the standard rotation for boards 1-4 and 16', () => {
    expect(boardDealerVul(1)).toEqual({ dealer: 'N', vul: 'none' });
    expect(boardDealerVul(2)).toEqual({ dealer: 'E', vul: 'NS' });
    expect(boardDealerVul(3)).toEqual({ dealer: 'S', vul: 'EW' });
    expect(boardDealerVul(4)).toEqual({ dealer: 'W', vul: 'all' });
    expect(boardDealerVul(16)).toEqual({ dealer: 'W', vul: 'EW' });
  });
  it('repeats every 16 boards', () => {
    expect(boardDealerVul(17)).toEqual(boardDealerVul(1));
    expect(boardDealerVul(32)).toEqual(boardDealerVul(16));
  });
});
