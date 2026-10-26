import { describe, it, expect } from 'vitest';
import { chooseBotPlay, chooseBotBid, currentWinningPlay } from './bot.js';
import { PlayState } from './play.js';
import { buildDeck, shuffle, deal, type Hands, type Card } from './deck.js';
import { Auction, type Contract } from './bidding.js';

describe('Bridge Bot AI — ACBL Heuristics', () => {
  const dummyContract: Contract = {
    level: 3,
    denom: 'NT',
    declarer: 'S',
    doubled: 0,
  };

  it('determines current winning play in partial trick', () => {
    const trick = [
      { seat: 'W' as const, card: { suit: 'H' as const, rank: 6 } },
      { seat: 'N' as const, card: { suit: 'H' as const, rank: 12 } }, // Q of hearts
      { seat: 'E' as const, card: { suit: 'H' as const, rank: 14 } }, // A of hearts
    ];
    const win = currentWinningPlay(trick, null);
    expect(win?.seat).toBe('E');
    expect(win?.card.rank).toBe(14);
  });

  it('leader plays top of touching honors (e.g. Q from Q-J-3)', () => {
    const hands: Hands = {
      W: [
        { suit: 'S', rank: 12 }, { suit: 'S', rank: 11 }, { suit: 'S', rank: 3 }, // Q, J, 3
        { suit: 'H', rank: 5 }, { suit: 'H', rank: 2 },
        { suit: 'D', rank: 4 }, { suit: 'D', rank: 2 },
        { suit: 'C', rank: 6 }, { suit: 'C', rank: 3 },
      ],
      N: [], E: [], S: [],
    };
    const state = new PlayState(hands, dummyContract);
    // W leads
    const played = chooseBotPlay(state);
    expect(played.suit).toBe('S');
    expect(played.rank).toBe(12); // Queen (top of Q-J)
  });

  it('second hand plays low when small card is led', () => {
    const hands: Hands = {
      W: [{ suit: 'H', rank: 3 }],
      N: [{ suit: 'H', rank: 13 }, { suit: 'H', rank: 4 }], // K, 4
      E: [], S: [],
    };
    const state = new PlayState(hands, dummyContract);
    state.play({ suit: 'H', rank: 3 }); // W leads 3
    // N is 2nd hand
    const played = chooseBotPlay(state);
    expect(played.rank).toBe(4); // Second hand low (plays 4, not K)
  });

  it('second hand covers an honor with a higher honor', () => {
    const hands: Hands = {
      W: [{ suit: 'H', rank: 12 }], // W leads Queen
      N: [{ suit: 'H', rank: 13 }, { suit: 'H', rank: 4 }], // N holds K, 4
      E: [], S: [],
    };
    const state = new PlayState(hands, dummyContract);
    state.play({ suit: 'H', rank: 12 }); // W leads Q
    // N covers Queen with King!
    const played = chooseBotPlay(state);
    expect(played.rank).toBe(13); // Cover honor with honor
  });

  it('third hand plays high to win or force out honors', () => {
    const hands: Hands = {
      W: [{ suit: 'H', rank: 3 }], // W leads small
      N: [{ suit: 'H', rank: 4 }], // N plays small
      E: [{ suit: 'H', rank: 14 }, { suit: 'H', rank: 7 }], // E holds A, 7
      S: [],
    };
    const state = new PlayState(hands, dummyContract);
    state.play({ suit: 'H', rank: 3 });
    state.play({ suit: 'H', rank: 4 });
    // E is 3rd hand
    const played = chooseBotPlay(state);
    expect(played.rank).toBe(14); // Third hand high (plays Ace)
  });

  it('fourth hand wins as cheaply as possible when partner is not winning', () => {
    const hands: Hands = {
      W: [{ suit: 'H', rank: 3 }],
      N: [{ suit: 'H', rank: 6 }], // Partner N played 6
      E: [{ suit: 'H', rank: 10 }], // Opponent E currently winning with 10
      S: [{ suit: 'H', rank: 14 }, { suit: 'H', rank: 12 }, { suit: 'H', rank: 2 }], // S holds A, Q, 2
    };
    const state = new PlayState(hands, dummyContract);
    state.play({ suit: 'H', rank: 3 });
    state.play({ suit: 'H', rank: 6 });
    state.play({ suit: 'H', rank: 10 });
    // S is 4th hand. Opponent E is winning with 10. S can win with Q (12) or A (14).
    // S picks Q (cheapest win)!
    const played = chooseBotPlay(state);
    expect(played.rank).toBe(12); // Queen wins cheaply
  });

  it('fourth hand sluffs/plays low when partner is already winning', () => {
    const hands: Hands = {
      W: [{ suit: 'H', rank: 3 }],
      N: [{ suit: 'H', rank: 14 }], // Partner N played Ace (winning!)
      E: [{ suit: 'H', rank: 7 }],
      S: [{ suit: 'H', rank: 13 }, { suit: 'H', rank: 2 }], // S holds K, 2
    };
    const state = new PlayState(hands, dummyContract);
    state.play({ suit: 'H', rank: 3 });
    state.play({ suit: 'H', rank: 14 });
    state.play({ suit: 'H', rank: 7 });
    // S is partner of N. N already wins with Ace. S plays lowest card!
    const played = chooseBotPlay(state);
    expect(played.rank).toBe(2); // Duck to let partner take it
  });

  it('simulates full 13-trick deal with 4 bots with zero illegal plays', () => {
    const hands = deal(shuffle(buildDeck()));
    const contract: Contract = {
      level: 4,
      denom: 'S',
      declarer: 'S',
      doubled: 0,
    };
    const state = new PlayState(hands, contract);

    for (let trick = 0; trick < 13; trick++) {
      for (let seat = 0; seat < 4; seat++) {
        expect(state.isComplete()).toBe(false);
        const card = chooseBotPlay(state);
        state.play(card);
      }
    }

    expect(state.isComplete()).toBe(true);
    expect(state.completedTricks.length).toBe(13);
    expect(state.tricksWon.NS + state.tricksWon.EW).toBe(13);
  });

  describe('Bot Bidding Logic', () => {
    it('bot passes when holding fewer than 12 points as dealer', () => {
      const hands: Hands = {
        N: [
          { suit: 'S', rank: 12 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 3 }, // 2
          { suit: 'H', rank: 11 }, { suit: 'H', rank: 5 }, { suit: 'H', rank: 2 }, // 1
          { suit: 'D', rank: 11 }, { suit: 'D', rank: 4 }, { suit: 'D', rank: 2 }, // 1
          { suit: 'C', rank: 8 }, { suit: 'C', rank: 7 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 }, // 0
        ], // 4 HCP
        E: [], S: [], W: [],
      };
      const auction = new Auction('N');
      const bid = chooseBotBid(auction, hands);
      expect(bid.type).toBe('pass');
    });

    it('bot opens 1S with 13 pts and 5 spades', () => {
      const hands: Hands = {
        N: [
          { suit: 'S', rank: 14 }, { suit: 'S', rank: 13 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 5 }, { suit: 'S', rank: 2 }, // 7
          { suit: 'H', rank: 13 }, { suit: 'H', rank: 5 }, { suit: 'H', rank: 2 }, // 3
          { suit: 'D', rank: 13 }, { suit: 'D', rank: 4 }, { suit: 'D', rank: 2 }, // 3
          { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 }, // 0
        ],
        E: [], S: [], W: [],
      };
      const auction = new Auction('N');
      const bid = chooseBotBid(auction, hands);
      expect(bid).toEqual({ type: 'bid', level: 1, denom: 'S' });
    });

    it('bot responds 2S when partner opens 1S with 3+ support and 6-9 pts', () => {
      const hands: Hands = {
        N: [],
        E: [],
        S: [
          { suit: 'S', rank: 13 }, { suit: 'S', rank: 8 }, { suit: 'S', rank: 4 }, // 3
          { suit: 'H', rank: 12 }, { suit: 'H', rank: 8 }, { suit: 'H', rank: 3 }, // 2
          { suit: 'D', rank: 12 }, { suit: 'D', rank: 4 }, { suit: 'D', rank: 2 }, // 2
          { suit: 'C', rank: 8 }, { suit: 'C', rank: 7 }, { suit: 'C', rank: 5 }, { suit: 'C', rank: 2 }, // 0
        ], // 7 HCP
        W: [],
      };
      const auction = new Auction('N');
      auction.apply({ type: 'bid', level: 1, denom: 'S' }); // N opens 1S
      auction.apply({ type: 'pass' }); // E passes
      // Now S's turn
      const bid = chooseBotBid(auction, hands);
      expect(bid).toEqual({ type: 'bid', level: 2, denom: 'S' });
    });

    it('simulates full 4-bot auction until completion', () => {
      const hands = deal(shuffle(buildDeck()));
      const auction = new Auction('N');
      let safetyLimit = 30;
      while (!auction.isComplete() && safetyLimit-- > 0) {
        const bid = chooseBotBid(auction, hands);
        auction.apply(bid);
      }
      expect(auction.isComplete()).toBe(true);
    });
  });
});
